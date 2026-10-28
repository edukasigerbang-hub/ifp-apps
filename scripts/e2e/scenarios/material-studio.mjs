import { mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { generateContentKeys, packBundle } from "../../material-pack.mjs";

const MATERIAL_ID = "e2e-studio-uji";
const VERSION = "1.0.0";
const DRAFT_KEY = `${MATERIAL_ID}@${VERSION}`;
const TITLE = "Uji Studio Materi";
const KEY_ID = "e2e-content-1";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

export async function setup({ artifactDir }) {
  const exportDir = path.join(artifactDir, "export");
  await mkdir(exportDir, { recursive: true });
  const keysDir = path.join(artifactDir, "keys");
  const { privatePem, keys } = generateContentKeys(keysDir, KEY_ID);
  return {
    exportDir,
    privatePem,
    env: { IFP_CONTENT_KEYS: JSON.stringify(keys) }
  };
}

async function invoke(page, command, args = {}) {
  return page.evaluate(`
    window.__TAURI_INTERNALS__
      .invoke(${JSON.stringify(command)}, ${JSON.stringify(args)})
      .then((value) => ({ ok: true, value }))
      .catch((error) => ({ ok: false, error }))
  `);
}

async function clickButton(page, label) {
  const result = await page.evaluate(`
    (() => {
      const buttons = [...document.querySelectorAll("button")]
        .filter((button) => button.textContent.trim() === ${JSON.stringify(label)});
      const target = buttons.find((button) => button.offsetParent !== null) ?? buttons[0];
      if (!target) return "missing";
      if (target.disabled) return "disabled";
      target.click();
      return "clicked";
    })()
  `);
  assert(result === "clicked", `Tombol "${label}" tidak dapat diklik (${result}).`);
}

async function clickHook(page, selector) {
  const result = await page.evaluate(`
    (() => {
      const target = document.querySelector(${JSON.stringify(selector)});
      if (!target) return "missing";
      if (target.disabled) return "disabled";
      target.click();
      return "clicked";
    })()
  `);
  assert(result === "clicked", `Tombol ${selector} tidak dapat diklik (${result}).`);
}

// React membaca nilai input dari setter properti, jadi isi ditulis lewat
// setter aslinya lalu event `input` — bukan assign langsung yang diabaikan React.
async function expectDisabled(page, selector) {
  const state = await page.evaluate(`
    (() => {
      const target = document.querySelector(${JSON.stringify(selector)});
      if (!target) return "missing";
      return target.disabled ? "disabled" : "enabled";
    })()
  `);
  assert(state === "disabled", `Tombol ${selector} seharusnya terkunci (${state}).`);
}

async function typeInto(page, selector, value) {
  const result = await page.evaluate(`
    (() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      if (!element) return "missing";
      const prototype =
        element.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(prototype, "value").set.call(element, ${JSON.stringify(value)});
      element.dispatchEvent(new Event("input", { bubbles: true }));
      return "typed";
    })()
  `);
  assert(result === "typed", `Input ${selector} tidak ditemukan (${result}).`);
}

async function readEditorValue(page) {
  return page.evaluate(`document.querySelector("[data-studio-editor]")?.value ?? null`);
}

async function alertText(page) {
  return page.evaluate(`document.querySelector("[role='alert']")?.textContent ?? ""`);
}

export async function run({ page, artifactDir, setup: context, log }) {
  await page.waitFor(`typeof window.__TAURI_INTERNALS__?.invoke === "function"`, {
    label: "bridge Tauri"
  });
  await clickButton(page, "Studio Materi");
  await page.waitFor(`document.querySelector("main h1")?.textContent.includes("Studio Materi")`, {
    label: "layar Studio Materi"
  });
  await page.waitFor(`document.querySelector("[data-studio-create]") !== null`, {
    label: "form draft baru"
  });
  log("Navigasi admin memuat layar Studio Materi.");

  // Daftar kerangka dimuat lewat invoke asynchronously; form muncul lebih dulu,
  // jadi opsi <select> harus ditunggu sebelum dihitung.
  await page.waitFor(`document.querySelectorAll("[data-studio-template] option").length >= 2`, {
    label: "kerangka terdaftar dari Rust",
    timeoutMs: 20_000
  });
  const templateCount = await page.evaluate(
    `document.querySelectorAll("[data-studio-template] option").length`
  );
  assert(templateCount >= 2, `Kerangka draft hanya ${templateCount}, harus ≥ 2.`);
  log(`Kerangka terdaftar dari Rust: ${templateCount} pilihan.`);

  const emptyDrafts = await invoke(page, "material_draft_list");
  assert(emptyDrafts.ok && emptyDrafts.value.length === 0, "Data uji harus mulai tanpa draft.");

  await typeInto(page, "[data-studio-new-id]", MATERIAL_ID);
  await typeInto(page, "[data-studio-new-title]", TITLE);
  await page.waitFor(`document.querySelector("[data-studio-create]").disabled === false`, {
    label: "tombol buat draft aktif"
  });
  await clickHook(page, "[data-studio-create]");
  await page.waitFor(`document.querySelector("[data-studio-editor-card]") !== null`, {
    label: "kartu editor draft"
  });
  await page.waitFor(`document.querySelector('[data-studio-open="${MATERIAL_ID}"]') !== null`, {
    label: "draft tampil di daftar"
  });
  log("Draft dibuat dari kerangka dan muncul di daftar Studio.");

  const created = await invoke(page, "material_draft_read", {
    input: { materialId: MATERIAL_ID, version: VERSION }
  });
  assert(created.ok, `Draft tidak dapat dibaca: ${JSON.stringify(created.error)}`);
  const paths = created.value.files.map((file) => file.path);
  for (const expected of [
    "index.html",
    "assets/app.js",
    "assets/style.css",
    "assets/cover.png",
    "transcript.txt",
    "material.json"
  ]) {
    assert(paths.includes(expected), `Kerangka tidak menyertakan ${expected}.`);
  }
  assert(created.value.manifest.cover === "assets/cover.png", "Cover kerangka tidak sesuai.");
  assert(created.value.manifest.reviewStatus === "draft", "Draft baru harus berstatus draft.");
  assert(created.value.draft.cover, "Thumbnail cover draft kosong.");
  log(`Kerangka menulis ${paths.length} berkas termasuk cover dan transkrip.`);

  const notInstalled = await invoke(page, "material_list_installed");
  assert(
    notInstalled.ok && notInstalled.value.length === 0,
    "Draft tidak boleh muncul sebagai materi terpasang."
  );
  log("Draft terpisah dari daftar materi terpasang.");

  await clickHook(page, "[data-studio-tab='code']");
  await page.waitFor(`document.querySelector("[data-studio-editor]") !== null`, {
    label: "editor kode"
  });
  const original = await readEditorValue(page);
  const selectedFile = await page.evaluate(
    `document.querySelector("[data-studio-file-select]")?.value ?? null`
  );
  assert(selectedFile === "index.html", `Berkas awal terpilih ${selectedFile}, harus index.html.`);
  assert(original.includes("<!doctype html>"), "Editor tidak memuat index.html kerangka.");

  await typeInto(page, "[data-studio-editor]", `${original}\n<script src="https://luar.example/m.js"></script>\n`);
  await page.waitFor(`document.querySelector("[data-studio-save-file]").disabled === false`, {
    label: "tombol simpan berkas aktif"
  });
  await clickHook(page, "[data-studio-save-file]");
  await page.waitFor(`document.querySelector("[role='alert']") !== null`, { label: "galat simpan" });
  const rejection = await alertText(page);
  assert(
    rejection.includes("rujukan eksternal"),
    `Penolakan rujukan luar tidak sesuai: ${rejection}`
  );
  const untouched = await invoke(page, "material_draft_read", {
    input: { materialId: MATERIAL_ID, version: VERSION }
  });
  assert(
    untouched.ok && !untouched.value.files.some((file) => file.content?.includes("luar.example")),
    "Berkas yang ditolak tidak boleh tertulis ke disk."
  );
  log(`Rujukan https:// ditolak saat menyimpan: ${rejection.slice(0, 60)}…`);

  await clickHook(page, "[data-studio-reload-file]");
  await page.waitFor(`document.body.textContent.includes("dimuat ulang dari disk")`, {
    label: "berkas dimuat ulang"
  });
  await typeInto(page, "[data-studio-editor]", `${original}\n<!-- penanda studio e2e -->\n`);
  await clickHook(page, "[data-studio-save-file]");
  await page.waitFor(`document.body.textContent.includes("tersimpan; hash diperbarui")`, {
    label: "berkas tersimpan"
  });
  const saved = await invoke(page, "material_draft_read", {
    input: { materialId: MATERIAL_ID, version: VERSION }
  });
  const entry = saved.value.files.find((file) => file.path === "index.html");
  assert(entry.content.includes("penanda studio e2e"), "Perubahan index.html tidak tersimpan.");
  log("Perubahan kode tersimpan dan berkas terdaftar ulang.");

  await clickHook(page, "[data-studio-tab='metadata']");
  await page.waitFor(`document.querySelector("[data-studio-minutes]") !== null`, {
    label: "form metadata"
  });
  await typeInto(page, "[data-studio-minutes]", "7");
  await clickHook(page, "[data-studio-save-meta]");
  await page.waitFor(`document.body.textContent.includes("Metadata tersimpan")`, {
    label: "metadata tersimpan"
  });
  const withMinutes = await invoke(page, "material_draft_read", {
    input: { materialId: MATERIAL_ID, version: VERSION }
  });
  assert(
    withMinutes.value.manifest.estimatedMinutes === 7,
    `Estimasi menit tersimpan ${withMinutes.value.manifest.estimatedMinutes}, harus 7.`
  );
  assert(
    withMinutes.value.manifest.materialId === MATERIAL_ID,
    "materialId tidak boleh dapat diubah lewat manifest."
  );
  log("Tab metadata menyimpan estimasi menit tanpa mengubah materialId.");

  await clickHook(page, "[data-studio-tab='assets']");
  await page.waitFor(`document.querySelector("[data-studio-cover]") !== null`, {
    label: "pratinjau cover"
  });
  await clickHook(page, "[data-studio-cover-catalog]");
  await page.waitFor(`document.querySelector("[data-studio-cover-picker]") !== null`, {
    label: "pilih cover katalog"
  });
  await page.waitFor(`document.querySelectorAll("[data-studio-cover-use]").length > 0`, {
    label: "daftar cover katalog",
    timeoutMs: 30_000
  });
  await clickHook(page, "[data-studio-cover-use]");
  await page.waitFor(`document.body.textContent.includes("dipasang sebagai assets/cover")`, {
    label: "cover katalog terpasang",
    timeoutMs: 30_000
  });
  const withCatalogCover = await invoke(page, "material_draft_read", {
    input: { materialId: MATERIAL_ID, version: VERSION }
  });
  const coverPath = withCatalogCover.value.manifest.cover;
  assert(
    coverPath === "assets/cover.webp",
    `Cover katalog tersimpan di ${coverPath}, harus assets/cover.webp.`
  );
  assert(
    !withCatalogCover.value.files.some((file) => file.path === "assets/cover.png"),
    "Cover kerangka lama tidak dibersihkan saat cover diganti."
  );
  log(`Cover dari katalog konten terpasang sebagai ${coverPath} dan cover lama dihapus.`);

  await clickHook(page, "[data-studio-tab='check']");
  await clickHook(page, "[data-studio-check]");
  await page.waitFor(`document.body.textContent.includes("Lolos pemeriksaan")`, {
    label: "draft lolos pemeriksaan"
  });
  await page.waitFor(`document.body.textContent.includes("Status review masih")`, {
    label: "peringatan status review"
  });
  log("Pemeriksaan mandiri lolos dan tetap menagih review manusia.");

  await clickHook(page, "[data-studio-preview]");
  await page.waitFor(`document.querySelector("[data-material-viewer]") !== null`, {
    label: "penampil pratinjau terbuka"
  });
  await page.waitFor(`document.querySelector("[data-material-status='siap']") !== null`, {
    label: "pratinjau siap",
    timeoutMs: 25_000
  });
  const viewerText = await page.evaluate(
    `document.querySelector("[data-material-viewer]")?.textContent ?? ""`
  );
  assert(viewerText.includes(TITLE), "Pratinjau tidak memuat judul draft.");
  await page.waitFor(
    `Number(document.querySelector("[data-material-progress]")?.getAttribute("data-material-progress")) >= 30`,
    { label: "progres dari draft", timeoutMs: 20_000 }
  );
  await page.screenshot(path.join(artifactDir, "studio-preview.png"));
  log("Pratinjau menjalankan draft lewat penampil materi dan menerima progres.");

  await page.evaluate(`document.querySelector("[data-material-close]")?.click()`);
  await page.waitFor(`document.querySelector("[data-material-viewer]") === null`, {
    label: "penampil tertutup"
  });

  const blocked = await invoke(page, "material_draft_export", {
    input: { materialId: MATERIAL_ID, version: VERSION },
    targetDir: path.join(artifactDir, "tidak-ada")
  });
  assert(!blocked.ok, "Ekspor ke folder yang belum ada harus ditolak.");
  log(`Ekspor ke folder yang belum ada ditolak: ${blocked.error?.message?.slice(0, 60)}…`);

  const exported = await invoke(page, "material_draft_export", {
    input: { materialId: MATERIAL_ID, version: VERSION },
    targetDir: context.exportDir
  });
  assert(exported.ok, `Ekspor draft gagal: ${JSON.stringify(exported.error)}`);
  const sourceDir = exported.value.sourceDirectory;
  const bundleZip = exported.value.bundleZip;
  assert(
    sourceDir.endsWith(path.join("materials-source", `${MATERIAL_ID}-${VERSION}`)),
    `Folder ekspor tidak sesuai: ${sourceDir}`
  );
  const exportedIndex = await readFile(path.join(sourceDir, "index.html"), "utf8");
  assert(exportedIndex.includes("penanda studio e2e"), "Perubahan kode tidak ikut terekspor.");
  const exportedManifest = JSON.parse(
    await readFile(path.join(sourceDir, "material.json"), "utf8")
  );
  assert(exportedManifest.cover === "assets/cover.webp", "Cover hasil ekspor tidak sesuai.");
  assert(
    !exportedManifest.files.some((file) => file.path === "assets/cover.png"),
    "Cover kerangka yang sudah diganti masih terdaftar di ekspor."
  );
  const zipInfo = await stat(bundleZip);
  assert(zipInfo.size > 0, "ZIP ekspor kosong.");
  const signatureFile = `${bundleZip}.sig`;
  let hasSignature = true;
  try {
    await stat(signatureFile);
  } catch {
    hasSignature = false;
  }
  assert(!hasSignature, "Ekspor tidak boleh menulis berkas tanda tangan.");
  log(`Ekspor menulis folder sumber dan ZIP tanpa .sig (${Math.round(exported.value.totalBytes / 1024)} KB).`);

  const duplicate = await invoke(page, "material_draft_export", {
    input: { materialId: MATERIAL_ID, version: VERSION },
    targetDir: context.exportDir
  });
  assert(!duplicate.ok, "Ekspor kedua dengan nama sama harus ditolak.");
  log("Ekspor tidak menimpa hasil sebelumnya.");

  const signed = packBundle({
    sourceDir,
    outPath: path.join(artifactDir, "bundles", `${MATERIAL_ID}-signed.zip`),
    privateKeyPem: context.privatePem,
    keyId: KEY_ID
  });
  log("Hasil ekspor dapat ditandatangani di luar aplikasi lewat scripts/material-pack.mjs.");

  const whileDraft = await invoke(page, "material_install_bundle", {
    input: { bundlePath: signed.bundle }
  });
  assert(
    !whileDraft.ok && whileDraft.error?.code === "MATERIAL_INVALID",
    `Instalasi menimpa draft harus ditolak: ${JSON.stringify(whileDraft.error)}`
  );
  assert(
    whileDraft.error.message.includes("Studio Materi"),
    `Pesan penolakan draft tidak jelas: ${whileDraft.error.message}`
  );
  log("Impor bundel yang menabrak draft ditolak (proteksi Studio).");

  await clickHook(page, "[data-studio-tab='export']");
  await page.waitFor(`document.querySelector("[data-studio-export]") !== null`, {
    label: "tab ekspor"
  });
  await expectDisabled(page, "[data-studio-delete]");
  log("Penghapusan draft terkunci sampai konfirmasi diketik.");

  await typeInto(page, "[data-studio-delete-confirm]", "salah-ketik");
  await expectDisabled(page, "[data-studio-delete]");
  log("Konfirmasi yang salah tidak membuka tombol hapus.");
  await typeInto(page, "[data-studio-delete-confirm]", DRAFT_KEY);
  await page.waitFor(`document.querySelector("[data-studio-delete]").disabled === false`, {
    label: "konfirmasi benar membuka hapus"
  });
  await clickHook(page, "[data-studio-delete]");
  await page.waitFor(`document.querySelector("[data-studio-editor-card]") === null`, {
    label: "editor ditutup setelah hapus"
  });
  const afterDelete = await invoke(page, "material_draft_list");
  assert(
    afterDelete.ok && afterDelete.value.length === 0,
    "Draft masih terdaftar setelah dihapus dari UI."
  );
  log(`Draft ${DRAFT_KEY} dihapus lewat konfirmasi ketik.`);

  const installed = await invoke(page, "material_install_bundle", {
    input: { bundlePath: signed.bundle }
  });
  assert(installed.ok, `Bundel hasil Studio tidak dapat dipasang: ${JSON.stringify(installed.error)}`);
  assert(installed.value.materialId === MATERIAL_ID, "materialId hasil instalasi berbeda.");
  assert(installed.value.version === VERSION, "versi hasil instalasi berbeda.");
  // Kerangka menulis 6 berkas termasuk material.json; cover png placeholder digantikan
  // cover katalog (webp) di tengah skenario, jadi bundel berakhir dengan 5 berkas konten.
  assert(installed.value.files === 5, `Berkas terpasang ${installed.value.files}, harus 5.`);
  const installedList = await invoke(page, "material_list_installed");
  assert(
    installedList.ok && installedList.value.some((item) => item.materialId === MATERIAL_ID),
    "Hasil Studio tidak muncul di daftar materi terpasang."
  );
  log("Bundel keluaran Studio terpasang dan tampil sebagai materi terpasang.");

  await clickButton(page, "Konten & Pembaruan");
  await page.waitFor(
    `document.querySelector('[data-material-installed-open="${MATERIAL_ID}"]') !== null`,
    { label: "hasil Studio tampil di layar Konten" }
  );
  const coverReady = `(() => {
    const button = document.querySelector('[data-material-installed-open="${MATERIAL_ID}"]');
    const image = button?.closest("li")?.querySelector("img[data-material-cover]");
    return !!image && image.src.startsWith("data:image/") && image.naturalWidth > 0;
  })()`;
  await page.waitFor(coverReady, {
    label: "cover materi hasil Studio tampil",
    timeoutMs: 30_000
  });
  log("Layar Konten mendaftar materi hasil Studio lengkap dengan cover-nya.");

  await clickHook(page, `[data-material-installed-open="${MATERIAL_ID}"]`);
  await page.waitFor(`document.querySelector("[data-material-status='siap']") !== null`, {
    label: "materi hasil Studio siap di penampil",
    timeoutMs: 25_000
  });
  log("Materi hasil Studio terbuka di penampil dan mengirim pesan siap.");

  await page.evaluate(`document.querySelector("[data-material-close]")?.click()`);
  await page.waitFor(`document.querySelector("[data-material-viewer]") === null`, {
    label: "penampil materi hasil Studio tertutup"
  });

  await clickButton(page, "Studio Materi");
  await page.waitFor(`document.querySelector("[data-studio-create]") !== null`, {
    label: "Studio terbuka kembali"
  });
  await page.screenshot(path.join(artifactDir, "studio-final.png"));
  log("Screenshot akhir Studio tersimpan.");
}
