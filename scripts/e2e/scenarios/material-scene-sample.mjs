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

async function setViewport(page, width, height) {
  await page.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false
  });
  await page.waitFor(`window.innerWidth === ${width}`, { label: `viewport ${width}px` });
  await settle();
}

function settle() {
  return new Promise((resolve) => setTimeout(resolve, 250));
}

// Dokumen materi berjalan sebagai proses terpisah (OOPIF): pengukurannya butuh
// sesi CDP sendiri, bukan page.evaluate biasa.
async function iframeSession(page) {
  const { targetInfos } = await page.send("Target.getTargets");
  const target = targetInfos.find(
    (info) => info.type === "iframe" && info.url.startsWith("http://ifp-content.localhost/")
  );
  assert(target, "target iframe materi tidak ditemukan.");
  const { sessionId } = await page.send("Target.attachToTarget", {
    targetId: target.targetId,
    flatten: true
  });
  return sessionId;
}

async function frameEvaluate(page, sessionId, expression) {
  const result = await page.send(
    "Runtime.evaluate",
    { expression, returnByValue: true, awaitPromise: true },
    sessionId
  );
  if (result.exceptionDetails) {
    throw new Error(
      result.exceptionDetails.exception?.description ??
        result.exceptionDetails.text ??
        "Evaluasi iframe gagal."
    );
  }
  return result.result?.value;
}

const MODE_ORDER = ["kartu", "lansekap", "layar-penuh"];

async function setViewerMode(page, wanted) {
  for (let step = 0; step < MODE_ORDER.length; step += 1) {
    const current = await page.evaluate(
      `document.querySelector("[data-material-viewer]")?.getAttribute("data-material-view-mode")`
    );
    if (current === wanted) {
      return;
    }
    const expected = MODE_ORDER[(MODE_ORDER.indexOf(current) + 1) % MODE_ORDER.length];
    await page.evaluate(`document.querySelector("[data-material-view-mode-toggle]")?.click()`);
    await page.waitFor(
      `document.querySelector("[data-material-viewer]")?.getAttribute("data-material-view-mode") === ${JSON.stringify(expected)}`,
      { label: `mode ${expected}` }
    );
    await settle();
  }
  throw new Error(`Mode "${wanted}" tidak tercapai lewat tombol tampilan.`);
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
  // Kolom baca bundel (820px) harus ikut melebar saat bingkai penampil melebar;
  // di bingkai sempit ia harus tetap 820px agar baris teks tidak melar.
  // Titik putus dihitung dari lebar viewport dokumen materi itu sendiri (lebar
  // media query == clientWidth), bukan dari lebar jendela aplikasi.
  const columnWidth = async (session) =>
    frameEvaluate(page, session, `(() => {
      const column = document.querySelector(".material");
      if (!column) return null;
      return {
        viewport: document.documentElement.clientWidth,
        pixels: Math.round(column.getBoundingClientRect().width),
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
      };
    })()`);

  const expectedColumn = (viewport) => {
    if (viewport >= 1400) return Math.min(1400, viewport * 0.94);
    if (viewport >= 1000) return Math.min(1180, viewport * 0.92);
    return Math.min(820, viewport);
  };

  await setViewport(page, 1600, 900);
  await setViewerMode(page, "layar-penuh");
  const frameSession = await iframeSession(page);
  const immersiveColumn = await columnWidth(frameSession);
  assert(immersiveColumn, "Contoh susunan tidak punya elemen .material untuk diukur.");
  assert(
    !immersiveColumn.overflow,
    `Layar penuh: isi contoh meluber horizontal di bingkai ${immersiveColumn.viewport}px.`
  );
  assert(
    Math.abs(immersiveColumn.pixels - expectedColumn(immersiveColumn.viewport)) <= 2 &&
      immersiveColumn.pixels > 1300,
    `Layar penuh memakai titik putus 1400px (didapat ${immersiveColumn.pixels}px dari bingkai ${immersiveColumn.viewport}px).`
  );

  await setViewerMode(page, "lansekap");
  const landscapeColumn = await columnWidth(frameSession);
  assert(
    Math.abs(landscapeColumn.pixels - expectedColumn(landscapeColumn.viewport)) <= 2,
    `Lansekap tidak mengikuti titik putus yang berlaku (${landscapeColumn.pixels}px dari bingkai ${landscapeColumn.viewport}px).`
  );
  assert(
    landscapeColumn.pixels > 820,
    `Lansekap harus lebih lebar dari kolom baca 820px (didapat ${landscapeColumn.pixels}px).`
  );

  await setViewport(page, 1000, 700);
  await setViewerMode(page, "kartu");
  const narrowColumn = await columnWidth(frameSession);
  assert(
    narrowColumn.viewport < 1000,
    `Bingkai kartu sempit harus di bawah titik putus 1000px (didapat ${narrowColumn.viewport}px).`
  );
  assert(
    narrowColumn.pixels === 820,
    `Bingkai sempit harus tetap memakai kolom baca 820px (didapat ${narrowColumn.pixels}px dari bingkai ${narrowColumn.viewport}px).`
  );
  log(
    `Kolom materi melebar bersama bingkai: ${narrowColumn.pixels}px @${narrowColumn.viewport}px → ${landscapeColumn.pixels}px @${landscapeColumn.viewport}px → ${immersiveColumn.pixels}px @${immersiveColumn.viewport}px.`
  );

  await setViewport(page, 1600, 900);
  await setViewerMode(page, "lansekap");
  await page.screenshot(path.join(artifactDir, "contoh-susun.png"));
  log("Penampil menjalankan runtime susunan dan menerima progres.");

  await page.evaluate(`document.querySelector("[data-material-close]")?.click()`);
  await page.waitFor(`document.querySelector("[data-material-viewer]") === null`, {
    label: "penampil tertutup"
  });
  await page.send("Emulation.clearDeviceMetricsOverride");
}
