import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateContentKeys, packBundle } from "../../material-pack.mjs";

// Bundel contoh hasil tab Susun: dipasang lewat pemasang Rust yang ketat
// (manifest §4, tanda tangan Ed25519, hash per berkas) lalu dibuka di penampil.
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const SOURCE = path.join(REPO_ROOT, "src-tauri", "sample-material-mengenal-huruf");
const MATERIAL_ID = "mengenal-huruf-vokal";
const TITLE = "Mengenal Huruf Vokal";
const KEY_ID = "e2e-scene-1";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
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

export async function setup({ artifactDir }) {
  const { privatePem, keys } = generateContentKeys(path.join(artifactDir, "keys"), KEY_ID);
  const packed = packBundle({
    sourceDir: SOURCE,
    outPath: path.join(artifactDir, "bundles", `${MATERIAL_ID}.zip`),
    privateKeyPem: privatePem,
    keyId: KEY_ID
  });
  return {
    bundlePath: packed.bundle,
    bundleBytes: packed.bytes,
    files: packed.files,
    env: { IFP_CONTENT_KEYS: JSON.stringify(keys) }
  };
}

export async function run({ page, artifactDir, setup: context, log }) {
  await page.waitFor(`typeof window.__TAURI_INTERNALS__?.invoke === "function"`, {
    label: "bridge Tauri"
  });

  // 7 berkas: index.html, style.css, app.js, cover.webp, nada-contoh.wav,
  // captions.vtt, transcript.txt (material.json tidak dihitung).
  assert(context.files === 7, `Bundel contoh berisi ${context.files} berkas, harus 7.`);
  log(`Bundel susunan ditandatangani: ${context.files} berkas, ${context.bundleBytes} byte.`);

  const installed = await invoke(page, "material_install_bundle", {
    input: { bundlePath: context.bundlePath }
  });
  assert(
    installed.ok,
    `Contoh materi ditolak pemasang: ${JSON.stringify(installed.error)}`
  );
  assert(installed.value.materialId === MATERIAL_ID, "materialId terpasang berbeda.");
  assert(
    installed.value.files === 7,
    `Berkas terpasang ${installed.value.files}, harus 7.`
  );
  log("Contoh materi lolos pemasang Rust (manifest §4, tanda tangan, hash per berkas).");

  await clickButton(page, "Konten & Pembaruan");
  await page.waitFor(
    `document.querySelector('[data-material-installed-open="${MATERIAL_ID}"]') !== null`,
    { label: "contoh tampil di layar Konten" }
  );
  await page.waitFor(
    `(() => {
      const button = document.querySelector('[data-material-installed-open="${MATERIAL_ID}"]');
      const image = button?.closest("li")?.querySelector("img[data-material-cover]");
      return !!image && image.src.startsWith("data:image/") && image.naturalWidth > 0;
    })()`,
    { label: "cover contoh tampil", timeoutMs: 30_000 }
  );
  log("Layar Konten menampilkan contoh beserta cover-nya.");

  await page.evaluate(
    `document.querySelector('[data-material-installed-open="${MATERIAL_ID}"]')?.click()`
  );
  await page.waitFor(`document.querySelector("[data-material-status='siap']") !== null`, {
    label: "penampil contoh siap",
    timeoutMs: 25_000
  });
  const viewerText = await page.evaluate(
    `document.querySelector("[data-material-viewer]")?.textContent ?? ""`
  );
  assert(viewerText.includes(TITLE), "Penampil tidak memuat judul contoh.");
  // Tiga langkah: langkah pertama melaporkan progres 33%.
  await page.waitFor(
    `Number(document.querySelector("[data-material-progress]")?.getAttribute("data-material-progress")) >= 30`,
    { label: "progres dari runtime susunan", timeoutMs: 20_000 }
  );
  await page.screenshot(path.join(artifactDir, "contoh-susun.png"));
  log("Penampil menjalankan runtime susunan dan menerima progres.");

  await page.evaluate(`document.querySelector("[data-material-close]")?.click()`);
  await page.waitFor(`document.querySelector("[data-material-viewer]") === null`, {
    label: "penampil tertutup"
  });
}
