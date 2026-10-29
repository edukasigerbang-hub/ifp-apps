import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
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

  // Fixture unggahan: WAV 8-bit mono 8 kHz (800 sampel) dan PNG placeholder bawaan.
  const wavPath = path.join(artifactDir, "nada.wav");
  const samples = 800;
  const wav = Buffer.alloc(44 + samples, 128);
  wav.write("RIFF", 0);
  wav.writeUInt32LE(36 + samples, 4);
  wav.write("WAVE", 8);
  wav.write("fmt ", 12);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(8000, 24);
  wav.writeUInt32LE(8000, 28);
  wav.writeUInt16LE(1, 32);
  wav.writeUInt16LE(8, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(samples, 40);
  await writeFile(wavPath, wav);
  const pngPath = path.join(artifactDir, "ilustrasi.png");
  await copyFile(path.resolve(import.meta.dirname, "../../../src-tauri/material-templates/cover-placeholder.png"), pngPath);

  return {
    exportDir,
    privatePem,
    keys,
    wavPath,
    pngPath,
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

async function selectOption(page, selector, value) {  const result = await page.evaluate(`
    (() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      if (!element) return "missing";
      Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value")
        .set.call(element, ${JSON.stringify(value)});
      element.dispatchEvent(new Event("change", { bubbles: true }));
      return "selected";
    })()
  `);
  assert(result === "selected", `Select ${selector} tidak ditemukan (${result}).`);
}

// Mengisi <input type="file"> lewat CDP; dialog pemilih berkas sistem tidak bisa diklik.
async function setFileInput(page, selector, filePath) {
  const { root } = await page.send("DOM.getDocument", { depth: -1 });
  const { nodeId } = await page.send("DOM.querySelector", {
    nodeId: root.nodeId,
    selector
  });
  assert(Boolean(nodeId), `Input berkas ${selector} tidak ditemukan.`);
  await page.send("DOM.setFileInputFiles", { nodeId, files: [filePath] });
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
  await page.waitFor(`document.querySelector("[data-studio-create-open]") !== null`, {
    label: "tombol buat materi"
  });
  const inlineFormHidden = await page.evaluate(
    `document.querySelector("[data-studio-create]") === null && document.querySelector("[data-studio-create-dialog]") === null`
  );
  assert(
    inlineFormHidden,
    "Form buat materi tidak boleh tampil sebelum tombol Buat materi diklik."
  );
  log("Navigasi admin memuat layar Studio Materi tanpa form pembuatan.");
  await page.screenshot(path.join(artifactDir, "studio-daftar-tombol.png"));

  const emptyDrafts = await invoke(page, "material_draft_list");
  assert(emptyDrafts.ok && emptyDrafts.value.length === 0, "Data uji harus mulai tanpa draft.");

  await clickHook(page, "[data-studio-create-open]");
  await page.waitFor(`document.querySelector("[data-studio-create-dialog]") !== null`, {
    label: "dialog buat materi"
  });
  await clickHook(page, "[data-studio-create-cancel]");
  await page.waitFor(`document.querySelector("[data-studio-create-dialog]") === null`, {
    label: "dialog tertutup setelah Batal"
  });
  const stillHidden = await page.evaluate(
    `document.querySelector("[data-studio-create]") === null`
  );
  assert(stillHidden, "Membatalkan dialog tidak boleh memunculkan form di halaman.");
  log("Tombol Buat materi membuka dialog form dan Batal menutupnya tanpa membuat draft.");

  await clickHook(page, "[data-studio-create-open]");
  await page.waitFor(`document.querySelector("[data-studio-create-dialog]") !== null`, {
    label: "dialog buat materi dibuka lagi"
  });
  // Daftar kerangka dimuat lewat invoke asynchronously; opsi <select> di dalam
  // dialog harus ditunggu sebelum dihitung.
  await page.waitFor(`document.querySelectorAll("[data-studio-template] option").length >= 2`, {
    label: "kerangka terdaftar dari Rust",
    timeoutMs: 20_000
  });
  const templateCount = await page.evaluate(
    `document.querySelectorAll("[data-studio-template] option").length`
  );
  assert(templateCount >= 2, `Kerangka draft hanya ${templateCount}, harus ≥ 2.`);
  log(`Kerangka terdaftar dari Rust: ${templateCount} pilihan.`);
  await page.screenshot(path.join(artifactDir, "studio-buat-materi.png"));

  await typeInto(page, "[data-studio-new-id]", MATERIAL_ID);
  await typeInto(page, "[data-studio-new-title]", TITLE);
  await page.waitFor(`document.querySelector("[data-studio-create]").disabled === false`, {
    label: "tombol buat draft aktif"
  });
  await clickHook(page, "[data-studio-create]");
  await page.waitFor(`document.querySelector("[data-studio-editor-card]") !== null`, {
    label: "halaman editor draft"
  });
  const formHidden = await page.evaluate(
    `document.querySelector("[data-studio-create]") === null && document.querySelector("[data-studio-create-dialog]") === null && document.querySelector("[data-studio-open]") === null`
  );
  assert(formHidden, "Halaman editor tidak boleh menampilkan form dan daftar draft.");
  await page.screenshot(path.join(artifactDir, "studio-halaman-editor.png"));

  // Tombol kembali harus membuka daftar draft lagi, dan draft dibuka dari daftar.
  await clickHook(page, "[data-studio-back]");
  await page.waitFor(`document.querySelector('[data-studio-open="${MATERIAL_ID}"]') !== null`, {
    label: "draft tampil di daftar setelah kembali"
  });
  await page.screenshot(path.join(artifactDir, "studio-daftar-draft.png"));
  await clickHook(page, `[data-studio-open="${MATERIAL_ID}"]`);
  await page.waitFor(`document.querySelector("[data-studio-editor-card]") !== null`, {
    label: "editor dibuka dari daftar draft"
  });
  log("Draft dibuat dari kerangka, editor terbuka di halamannya sendiri, dan dapat dibuka lagi dari daftar.");

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

  // Tab Susun: editor blok (teks, gambar, efek, efek suara) menulis ulang
  // index.html + assets/style.css + assets/app.js dari naskah.
  await clickHook(page, "[data-studio-tab='scene']");
  await page.waitFor(`document.querySelector("[data-scene-start]") !== null`, {
    label: "tab Susun pada kerangka tanpa naskah"
  });
  await clickHook(page, "[data-scene-start]");
  await page.waitFor(`document.querySelector("[data-scene-text]") !== null`, {
    label: "blok teks pertama"
  });
  await typeInto(page, "[data-scene-text]", "Matahari memanaskan air laut.");
  await clickHook(page, "[data-scene-add-step]");
  await page.waitFor(`document.querySelector("[data-scene-step='1']") !== null`, {
    label: "langkah kedua"
  });
  await typeInto(page, "[data-scene-text]", "Uap naik, dingin, lalu turun sebagai hujan.");
  await selectOption(page, "[data-scene-effect]", "konfeti");
  await selectOption(page, "[data-scene-sound]", "bel");
  await clickHook(page, "[data-scene-add-block='gambar']");
  await page.waitFor(`document.querySelector("[data-scene-image]") !== null`, {
    label: "blok gambar"
  });
  await page.waitFor(
    `[...document.querySelectorAll("[data-scene-thumb] img")].some((img) => img.src.startsWith("data:image/"))`,
    { label: "galeri aset memuat gambar asli", timeoutMs: 20_000 }
  );
  await setFileInput(page, "[data-scene-image-file]", context.pngPath);
  await page.waitFor(
    `document.body.textContent.includes("Gambar assets/ilustrasi.png ditambahkan")`,
    { label: "gambar terunggah", timeoutMs: 20_000 }
  );
  await selectOption(page, "[data-scene-layout]", "kiri");
  await typeInto(page, "[data-scene-alt]", "Langit dengan awan dan hujan");

  await clickHook(page, "[data-scene-add-block='suara']");
  await page.waitFor(`document.querySelector("[data-scene-audio]") !== null`, {
    label: "blok suara"
  });
  await typeInto(page, "[data-scene-audio-label]", "Narasi siklus air");
  await setFileInput(page, "[data-scene-audio-file]", context.wavPath);
  await page.waitFor(`document.body.textContent.includes("Audio assets/nada.wav ditambahkan")`, {
    label: "audio terunggah",
    timeoutMs: 20_000
  });
  await page.waitFor(`document.querySelector("[data-scene-audio]").value === "assets/nada.wav"`, {
    label: "berkas audio terpilih"
  });

  // Tata letak Susun: toolbar aksi di atas, langkah di kiri, penyunting blok +
  // pratinjau di tengah, dan properti langkah/halaman di kanan.
  await page.waitFor(`document.querySelector("[data-scene-preview-card] iframe") !== null`, {
    label: "pratinjau naskah muncul otomatis",
    timeoutMs: 20_000
  });
  const regions = await page.evaluate(`
    (() => {
      const selectors = [
        "[data-scene-toolbar]",
        "[data-scene-steps]",
        "[data-scene-step-body]",
        "[data-scene-props]"
      ];
      return selectors.filter((selector) => document.querySelector(selector) !== null).length;
    })()
  `);
  assert(regions === 4, `Susun hanya memuat ${regions}/4 panel penyunting.`);
  if ((await page.evaluate("window.innerWidth")) >= 1280) {
    const layout = await page.evaluate(`
      (() => {
        const box = (selector) => document.querySelector(selector).getBoundingClientRect();
        const toolbar = box("[data-scene-toolbar]");
        const steps = box("[data-scene-steps]");
        const body = box("[data-scene-step-body]");
        const props = box("[data-scene-props]");
        if (toolbar.bottom > steps.top + 1) return "toolbar tidak di atas";
        if (steps.right > body.left + 1) return "langkah tidak di kiri penyunting";
        if (body.right > props.left + 1) return "properti tidak di kanan penyunting";
        return "ok";
      })()
    `);
    assert(layout === "ok", `Tata letak Susun tidak sesuai: ${layout}`);
  }
  log("Susun menaruh toolbar di atas, langkah di kiri, penyunting + pratinjau di tengah, properti di kanan.");

  // Sidebar langkah: memilih langkah menukar panel tengah, dan ringkasan blok
  // tiap langkah dapat dibuka/tutup sendiri.
  const outlineClosed = await page.evaluate(
    `document.querySelector("[data-scene-step-toggle='1']")?.getAttribute("data-scene-step-outline") ?? null`
  );
  assert(outlineClosed === "false", `Ringkasan langkah 2 harus mulai tertutup (${outlineClosed}).`);
  await clickHook(page, "[data-scene-step-toggle='1']");
  await page.waitFor(`document.querySelector("[data-scene-step-outline-list='1']") !== null`, {
    label: "ringkasan langkah 2 terbuka"
  });
  const outlineRows = await page.evaluate(
    `document.querySelectorAll("[data-scene-step-outline-list='1'] li").length`
  );
  assert(outlineRows === 3, `Ringkasan langkah 2 memuat ${outlineRows} baris, harus 3.`);
  await page.evaluate(
    `document.querySelector("[data-scene-steps]")?.scrollIntoView({ block: "center" })`
  );
  await page.screenshot(path.join(artifactDir, "studio-langkah-sidebar.png"));
  await clickHook(page, "[data-scene-step-toggle='1']");
  await page.waitFor(`document.querySelector("[data-scene-step-outline-list='1']") === null`, {
    label: "ringkasan langkah 2 tertutup"
  });

  await clickHook(page, "[data-scene-step='0']");
  await page.waitFor(
    `document.querySelector("[data-scene-step-body]")?.getAttribute("data-step") === "0"`,
    { label: "penyunting pindah ke langkah 1" }
  );
  const firstStepText = await page.evaluate(`document.querySelector("[data-scene-text]").value`);
  assert(
    firstStepText === "Matahari memanaskan air laut.",
    `Panel kanan menampilkan teks langkah lain: ${firstStepText}`
  );
  const activeStepMark = await page.evaluate(
    `document.querySelector("[data-scene-step='0']")?.getAttribute("data-scene-step-active")`
  );
  assert(activeStepMark === "true", "Langkah 1 tidak ditandai aktif di sidebar.");
  await clickHook(page, "[data-scene-block-toggle]");
  await page.waitFor(`document.querySelector("[data-scene-block-body]") === null`, {
    label: "blok teks terlipat"
  });
  await clickHook(page, "[data-scene-block-toggle]");
  await page.waitFor(`document.querySelector("[data-scene-block-body]") !== null`, {
    label: "blok teks terbuka kembali"
  });
  await clickHook(page, "[data-scene-step='1']");
  await page.waitFor(
    `document.querySelector("[data-scene-step-body]")?.getAttribute("data-step") === "1"`,
    { label: "penyunting kembali ke langkah 2" }
  );
  log("Sidebar memilih langkah, penyunting tengah berganti isi, ringkasan dan blok bisa dilipat.");

  // Pratinjau tengah menampilkan langkah yang sedang disunting, bukan selalu
  // langkah pertama. Isi yang sudah usang dimuat ulang lewat tombol.
  await clickHook(page, "[data-scene-step='0']");
  await page.waitFor(
    `document.querySelector("[data-scene-step-body]")?.getAttribute("data-step") === "0"`,
    { label: "penyunting pindah ke langkah 1 untuk pratinjau" }
  );
  await clickHook(page, "[data-scene-preview-refresh]");
  await page.waitFor(
    `document.querySelector("[data-scene-preview-card] iframe")?.srcdoc.includes('data-stage="0"') === true`,
    { label: "pratinjau memuat langkah 1", timeoutMs: 20_000 }
  );
  await clickHook(page, "[data-scene-step='1']");
  await page.waitFor(
    `document.querySelector("[data-scene-preview-card] iframe")?.srcdoc.includes('data-stage="1"') === true`,
    { label: "pratinjau ikut pindah ke langkah 2", timeoutMs: 20_000 }
  );
  log("Pratinjau tengah mengikuti langkah yang dipilih.");

  // Urungkan mengembalikan perubahan struktural terakhir (langkah ketiga).
  const stepsBefore = await page.evaluate(
    `document.querySelectorAll("[data-scene-step]").length`
  );
  await clickHook(page, "[data-scene-add-step]");
  await page.waitFor(
    `document.querySelectorAll("[data-scene-step]").length === ${stepsBefore + 1}`,
    { label: "langkah ketiga" }
  );
  await clickHook(page, "[data-scene-undo]");
  await page.waitFor(
    `document.querySelectorAll("[data-scene-step]").length === ${stepsBefore}`,
    { label: "urungkan langkah" }
  );
  await clickHook(page, "[data-scene-step='1']");
  log("Urungkan mengembalikan jumlah langkah setelah perubahan struktural.");

  await clickHook(page, "[data-scene-ack]");
  await page.waitFor(`document.querySelector("[data-scene-apply]").disabled === false`, {
    label: "tombol terapkan aktif setelah naskah lengkap"
  });
  await clickHook(page, "[data-scene-apply]");
  await page.waitFor(`document.body.textContent.includes("Susunan diterapkan")`, {
    label: "susunan diterapkan",
    timeoutMs: 20_000
  });
  const stepAfterApply = await page.evaluate(
    `document.querySelector("[data-scene-step-body]")?.getAttribute("data-step") ?? null`
  );
  assert(
    stepAfterApply === "1",
    `Setelah Terapkan penyunting pindah ke langkah ${stepAfterApply}, seharusnya tetap di langkah 2.`
  );
  const sceneState = await invoke(page, "material_draft_read", {
    input: { materialId: MATERIAL_ID, version: VERSION }
  });
  const sceneEntry = sceneState.value.files.find((file) => file.path === "index.html");
  assert(sceneEntry.content.includes('id="ifp-scene"'), "index.html tidak memuat naskah.");
  assert(
    (sceneEntry.content.match(/<article class="step"/g) ?? []).length === 2,
    "index.html hasil susunan tidak memuat dua langkah."
  );
  assert(
    sceneEntry.content.includes('data-effect="konfeti"') &&
      sceneEntry.content.includes('data-sound="bel"'),
    "Efek atau efek suara tidak masuk ke index.html."
  );
  assert(
    sceneEntry.content.includes('src="assets/ilustrasi.png"') &&
      sceneEntry.content.includes('alt="Langit dengan awan dan hujan"') &&
      sceneEntry.content.includes("figure-kiri"),
    "Blok gambar atau tata letaknya tidak masuk ke index.html."
  );
  assert(
    sceneEntry.content.includes("<audio controls") &&
      sceneEntry.content.includes('src="assets/nada.wav"'),
    "Blok suara tidak masuk ke index.html."
  );
  assert(
    !sceneEntry.content.includes("https://") && !sceneEntry.content.includes("http://"),
    "Hasil susunan tidak boleh memuat rujukan eksternal."
  );
  const sceneManifest = sceneState.value.manifest;
  assert(
    sceneManifest.accessibility.hasAudio === true,
    "hasAudio tidak dinyalakan padahal naskah memuat blok suara."
  );
  assert(
    sceneManifest.captionsPath === "assets/captions.vtt",
    `captionsPath ${sceneManifest.captionsPath} tidak sesuai kontrak §4.`
  );
  const captionsFile = sceneState.value.files.find((file) => file.path === "assets/captions.vtt");
  assert(
    captionsFile?.content?.startsWith("WEBVTT") &&
      captionsFile.content.includes("Narasi siklus air"),
    "captions.vtt tidak dibuat dari blok suara."
  );
  log(
    "Tab Susun menulis dua langkah, gambar unggahan, audio + captions.vtt, efek konfeti, dan efek suara bel."
  );
  await page.evaluate(
    `document.querySelector("[data-studio-editor-card]")?.scrollIntoView({ block: "start" })`
  );
  await new Promise((resolve) => setTimeout(resolve, 400));
  await page.screenshot(path.join(artifactDir, "studio-susun.png"));

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
  assert(
    original.includes('id="ifp-scene"'),
    "Editor kode masih memuat isi lama setelah tab Susun menulis ulang index.html."
  );

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
    label: "kembali ke daftar draft setelah hapus"
  });
  await page.waitFor(`document.querySelector("[data-studio-create-open]") !== null`, {
    label: "tombol Buat materi tampil lagi setelah hapus"
  });
  assert(
    (await page.evaluate(`document.querySelector("[data-studio-create-dialog]") === null`)) === true,
    "Dialog pembuatan materi masih terbuka setelah draft dihapus."
  );
  const afterDelete = await invoke(page, "material_draft_list");
  assert(
    afterDelete.ok && afterDelete.value.length === 0,
    "Draft masih terdaftar setelah dihapus dari UI."
  );
  log(`Draft ${DRAFT_KEY} dihapus lewat konfirmasi ketik dan halaman kembali ke daftar.`);

  const installed = await invoke(page, "material_install_bundle", {
    input: { bundlePath: signed.bundle }
  });
  assert(installed.ok, `Bundel hasil Studio tidak dapat dipasang: ${JSON.stringify(installed.error)}`);
  assert(installed.value.materialId === MATERIAL_ID, "materialId hasil instalasi berbeda.");
  assert(installed.value.version === VERSION, "versi hasil instalasi berbeda.");
  // Konten akhir: index.html, assets/app.js, assets/style.css, cover katalog (webp),
  // transcript.txt, ilustrasi.png, nada.wav, dan captions.vtt — cover.png kerangka
  // dihapus saat cover diganti, material.json tidak dihitung.
  assert(installed.value.files === 8, `Berkas terpasang ${installed.value.files}, harus 8.`);
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
  await page.waitFor(`document.querySelector("[data-studio-create-open]") !== null`, {
    label: "Studio terbuka kembali"
  });
  await page.screenshot(path.join(artifactDir, "studio-final.png"));
  log("Screenshot akhir Studio tersimpan.");
}
