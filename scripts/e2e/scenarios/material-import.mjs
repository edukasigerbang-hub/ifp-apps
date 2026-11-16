import { copyFile, cp, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateContentKeys, packBundle } from "../../material-pack.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const SAMPLE_SOURCE = path.join(REPO_ROOT, "src-tauri", "sample-material");
const MATERIAL_ID = "siklus-air-uji";
const KEY_ID = "e2e-content-1";

const MANIFEST = {
  schemaVersion: "1.0.0",
  materialId: MATERIAL_ID,
  version: "1.0.0",
  title: "Siklus Air dalam Animasi",
  summary:
    "Materi contoh prototipe: mengikuti perjalanan setetes air dari laut ke awan lalu kembali ke sungai.",
  locale: "id-ID",
  gradeLevels: [3],
  subjects: ["ipas"],
  topics: ["Siklus air"],
  estimatedMinutes: 5,
  entry: "index.html",
  cover: "assets/cover.png",
  transcriptPath: "transcript.txt",
  accessibility: {
    hasAudio: false,
    keyboardNavigable: true,
    supportsReducedMotion: true,
    contrastChecked: true
  },
  completion: { mode: "signal", minDwellSeconds: 2 },
  minAppVersion: "0.1.0",
  publisher: { name: "Gerbang Edukasi" },
  reviewStatus: "draft",
  files: []
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

export async function setup({ artifactDir }) {
  const sourceDir = path.join(artifactDir, "material-src");
  await cp(SAMPLE_SOURCE, sourceDir, { recursive: true });
  await writeFile(path.join(sourceDir, "material.json"), `${JSON.stringify(MANIFEST, null, 2)}\n`, "utf8");

  const keysDir = path.join(artifactDir, "keys");
  const { privatePem, keys } = generateContentKeys(keysDir, KEY_ID);

  const bundlesDir = path.join(artifactDir, "bundles");
  const good = packBundle({
    sourceDir,
    outPath: path.join(bundlesDir, "baik", "siklus-air-uji.zip"),
    privateKeyPem: privatePem,
    keyId: KEY_ID
  });

  const badHash = packBundle({
    sourceDir,
    outPath: path.join(bundlesDir, "hash", "siklus-air-uji.zip"),
    privateKeyPem: privatePem,
    keyId: KEY_ID,
    transformManifest: (manifest) => {
      manifest.files[0].sha256 = "0".repeat(64);
    }
  });

  // Tanda tangan sah diacak: nilai base64url tetap valid namun tidak cocok.
  const badSignaturePath = path.join(bundlesDir, "sig", "siklus-air-uji.zip");
  await mkdir(path.dirname(badSignaturePath), { recursive: true });
  await copyFile(good.bundle, badSignaturePath);
  const signature = JSON.parse(await readFile(good.signature, "utf8"));
  const raw = Buffer.from(signature.value, "base64url");
  raw[raw.length - 1] ^= 0x01;
  signature.value = raw.toString("base64url");
  await writeFile(
    badSignaturePath.replace(/\.zip$/i, ".sig"),
    `${JSON.stringify(signature, null, 2)}\n`,
    "utf8"
  );

  return {
    goodBundle: good.bundle,
    badHashBundle: badHash.bundle,
    badSignatureBundle: badSignaturePath,
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

async function pressEscape(page) {
  await page.evaluate(`document.querySelector("[data-material-viewer]")?.focus()`);
  const key = {
    key: "Escape",
    code: "Escape",
    windowsVirtualKeyCode: 27,
    nativeVirtualKeyCode: 27
  };
  await page.send("Input.dispatchKeyEvent", { type: "keyDown", ...key });
  await page.send("Input.dispatchKeyEvent", { type: "keyUp", ...key });
}

export async function run({ page, artifactDir, setup, log }) {
  await page.waitFor(`typeof window.__TAURI_INTERNALS__?.invoke === "function"`, {
    label: "bridge Tauri"
  });

  await clickButton(page, "Konten & Pembaruan");
  await page.waitFor(`document.body.textContent.includes("Materi HTML5 (prototipe)")`, {
    label: "bagian materi HTML5"
  });
  await page.waitFor(`document.querySelector("[data-material-import]") !== null`, {
    label: "tombol impor bundel"
  });
  log("Layar Konten menampilkan tombol impor bundel materi.");

  const badHash = await invoke(page, "material_install_bundle", {
    input: { bundlePath: setup.badHashBundle }
  });
  assert(!badHash.ok, "Bundel dengan hash berkas salah seharusnya ditolak.");
  assert(
    badHash.error?.code === "MATERIAL_HASH_MISMATCH",
    `Kode galat hash tidak sesuai: ${JSON.stringify(badHash.error)}`
  );
  log("Hash berkas yang tidak cocok ditolak (MATERIAL_HASH_MISMATCH).");

  const badSignature = await invoke(page, "material_install_bundle", {
    input: { bundlePath: setup.badSignatureBundle }
  });
  assert(!badSignature.ok, "Bundel dengan tanda tangan salah seharusnya ditolak.");
  assert(
    badSignature.error?.code === "MATERIAL_SIGNATURE_INVALID",
    `Kode galat tanda tangan tidak sesuai: ${JSON.stringify(badSignature.error)}`
  );
  log("Tanda tangan manifest yang tidak valid ditolak (MATERIAL_SIGNATURE_INVALID).");

  const empty = await invoke(page, "material_list_installed");
  assert(empty.ok && empty.value.length === 0, "Tidak boleh ada materi terpasang setelah penolakan.");

  const installed = await invoke(page, "material_install_bundle", {
    input: { bundlePath: setup.goodBundle }
  });
  assert(installed.ok, `Instalasi bundel sah gagal: ${JSON.stringify(installed.error)}`);
  assert(installed.value.materialId === MATERIAL_ID, "materialId hasil instalasi tidak sesuai.");
  assert(installed.value.version === "1.0.0", "Versi hasil instalasi tidak sesuai.");
  assert(installed.value.files === 5, `Jumlah berkas terpasang ${installed.value.files}, harus 5.`);
  log(
    `Bundel bertanda tangan terpasang: ${installed.value.title} v${installed.value.version} ` +
      `(${installed.value.files} berkas, ${Math.round(installed.value.bytes / 1024)} KB).`
  );

  const listed = await invoke(page, "material_list_installed");
  assert(listed.ok && listed.value.length === 1, "Daftar materi terpasang harus berisi satu materi.");
  assert(listed.value[0].materialId === MATERIAL_ID, "materialId pada daftar tidak sesuai.");
  assert(listed.value[0].installedAt, "installedAt kosong pada daftar materi.");
  log("Daftar materi terpasang memuat bundel baru.");

  const duplicate = await invoke(page, "material_install_bundle", {
    input: { bundlePath: setup.goodBundle }
  });
  assert(!duplicate.ok, "Instalasi versi yang sama seharusnya ditolak.");
  assert(
    duplicate.error?.code === "MATERIAL_INVALID",
    `Kode galat duplikat tidak sesuai: ${JSON.stringify(duplicate.error)}`
  );
  log("Instalasi versi yang sudah terpasang ditolak (MATERIAL_INVALID).");

  // Muat ulang layar Konten agar daftar dibaca ulang dari database.
  await clickButton(page, "Beranda");
  await page.waitFor(`document.body.textContent.includes("Materi disematkan")`, {
    label: "layar Beranda"
  });
  await clickButton(page, "Konten & Pembaruan");
  await page.waitFor(
    `document.querySelector('[data-material-installed-open="${MATERIAL_ID}"]') !== null`,
    { label: "materi terpasang tampil di UI" }
  );
  log("UI mendaftar materi terpasang dari database.");

  const opened = await page.evaluate(`
    (() => {
      const button = document.querySelector('[data-material-installed-open="${MATERIAL_ID}"]');
      if (!button) return "missing";
      if (button.disabled) return "disabled";
      button.click();
      return "clicked";
    })()
  `);
  assert(opened === "clicked", `Tombol buka materi terpasang tidak dapat diklik (${opened}).`);
  await page.waitFor(`document.querySelector("[data-material-viewer]") !== null`, {
    label: "penampil materi terpasang terbuka"
  });
  await page.waitFor(`document.querySelector("[data-material-status='siap']") !== null`, {
    label: "materi terpasang siap",
    timeoutMs: 25_000
  });
  const title = await page.evaluate(
    `document.querySelector("[data-material-viewer]")?.textContent ?? ""`
  );
  assert(title.includes("Siklus Air dalam Animasi"), "Penampil tidak menampilkan judul materi terpasang.");
  log("Penampil membuka materi hasil impor dan menerima pesan ready.");

  await page.waitFor(
    `Number(document.querySelector("[data-material-progress]")?.getAttribute("data-material-progress")) >= 34`,
    { label: "progres materi hasil impor", timeoutMs: 20_000 }
  );
  log("Progres dari iframe materi hasil impor diterima induk.");

  await page.screenshot(path.join(artifactDir, "material-import.png"));
  log("Screenshot materi terpasang tersimpan.");

  await pressEscape(page);
  await page.waitFor(`document.querySelector("[data-material-viewer]") === null`, {
    label: "penampil tertutup"
  });

  await page.screenshot(path.join(artifactDir, "material-installed-list.png"));
  log("Screenshot daftar materi terpasang tersimpan.");

  const afterCopy = await invoke(page, "material_install_bundle", {
    input: { bundlePath: path.join(artifactDir, "bundles", "baik", "lain.zip") }
  });
  assert(!afterCopy.ok && afterCopy.error?.code === "MATERIAL_NOT_FOUND", "Bundel tidak ada harus ditolak.");
  log("Path bundel tidak ada ditolak (MATERIAL_NOT_FOUND).");
}
