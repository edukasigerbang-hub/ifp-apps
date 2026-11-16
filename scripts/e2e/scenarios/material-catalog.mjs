import { cp, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateContentKeys, packBundle } from "../../material-pack.mjs";
import { startMockCatalogServer } from "../../mock-catalog-server.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const SAMPLE_SOURCE = path.join(REPO_ROOT, "src-tauri", "sample-material");
const MATERIAL_ID = "siklus-air-uji";
const KEY_ID = "e2e-catalog-1";

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
  reviewStatus: "reviewed",
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

  const { privatePem, keys } = generateContentKeys(path.join(artifactDir, "keys"), KEY_ID);
  const packed = packBundle({
    sourceDir,
    outPath: path.join(artifactDir, "bundles", "siklus-air-uji.zip"),
    privateKeyPem: privatePem,
    keyId: KEY_ID
  });
  const signature = JSON.parse(await readFile(packed.signature, "utf8"));

  // Cover disajikan terpisah dari ZIP (URL pre-signed) agar kartu katalog bisa
  // menampilkan gambar sebelum bundel dipasang.
  const coverName = `${packed.materialId}.png`;
  await cp(
    path.join(sourceDir, MANIFEST.cover),
    path.join(artifactDir, "covers", coverName)
  );

  const baseItem = {
    materialId: packed.materialId,
    version: packed.version,
    publishedAt: "2026-10-28T01:00:00.000Z",
    updatedAt: "2026-10-28T01:00:00.000Z",
    sizeBytes: packed.bytes,
    bundleSha256: packed.bundleSha256,
    bundleFile: path.basename(packed.bundle),
    coverFile: coverName,
    signature,
    material: packed.manifest
  };

  // Draf tidak boleh muncul di katalog (OD-10).
  const draftItem = {
    ...baseItem,
    materialId: "materi-draf-uji",
    material: { ...packed.manifest, materialId: "materi-draf-uji", reviewStatus: "draft" }
  };

  const catalogFile = path.join(artifactDir, "catalog.json");
  async function writeCatalog(item) {
    await writeFile(
      catalogFile,
      `${JSON.stringify(
        {
          schemaVersion: "1.0.0",
          generatedAt: "2026-10-28T02:00:00.000Z",
          items: [item, draftItem]
        },
        null,
        2
      )}\n`,
      "utf8"
    );
  }
  await writeCatalog(baseItem);

  const server = await startMockCatalogServer({
    catalogFile,
    bundleDir: path.dirname(packed.bundle),
    coverDir: path.join(artifactDir, "covers"),
    token: "e2e-token",
    quiet: true
  });

  return {
    origin: server.origin,
    catalogFile,
    close: server.close,
    writeCatalog,
    baseItem,
    signature,
    materialId: MATERIAL_ID,
    keyId: KEY_ID,
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

async function fillValue(page, selector, value, eventName) {
  const result = await page.evaluate(`
    (() => {
      const field = document.querySelector(${JSON.stringify(selector)});
      if (!field) return "missing";
      const prototype = field instanceof HTMLSelectElement
        ? window.HTMLSelectElement.prototype
        : window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(prototype, "value").set;
      setter.call(field, ${JSON.stringify(value)});
      field.dispatchEvent(new Event(${JSON.stringify(eventName)}, { bubbles: true }));
      return "filled";
    })()
  `);
  assert(result === "filled", `Field ${selector} tidak ditemukan (${result}).`);
}

async function clickSelector(page, selector) {
  const result = await page.evaluate(`
    (() => {
      const target = document.querySelector(${JSON.stringify(selector)});
      if (!target) return "missing";
      if (target.disabled) return "disabled";
      target.click();
      return "clicked";
    })()
  `);
  assert(result === "clicked", `Elemen ${selector} tidak dapat diklik (${result}).`);
}

export async function run({ page, artifactDir, setup: fixture, log }) {
  await page.waitFor(`typeof window.__TAURI_INTERNALS__?.invoke === "function"`, {
    label: "bridge Tauri"
  });

  await clickButton(page, "Konten & Pembaruan");
  await page.waitFor(`document.body.textContent.includes("Jelajah materi daring (prototipe)")`, {
    label: "bagian jelajah materi daring"
  });
  await page.waitFor(`document.querySelector("[data-catalog-url]") !== null`, {
    label: "kolom alamat katalog"
  });
  log("Layar Konten menampilkan bagian jelajah materi daring.");

  await fillValue(page, "[data-catalog-url]", fixture.origin, "input");
  await clickButton(page, "Simpan alamat");
  await page.waitFor(
    `document.querySelector("[data-catalog-config]")?.textContent.includes(${JSON.stringify(
      fixture.origin
    )}) && document.body.textContent.includes("pengaturan perangkat")`,
    { label: "alamat katalog tersimpan" }
  );
  log(`Alamat katalog tersimpan lewat UI: ${fixture.origin}.`);

  // Negatif 1: katalog mengumumkan SHA-256 bundel yang salah.
  await fixture.writeCatalog({ ...fixture.baseItem, bundleSha256: "0".repeat(64) });
  const badHash = await invoke(page, "material_catalog_install", {
    input: { materialId: fixture.materialId, version: "1.0.0" }
  });
  assert(!badHash.ok, "Bundel dengan SHA-256 katalog salah seharusnya ditolak.");
  assert(
    badHash.error?.code === "MATERIAL_HASH_MISMATCH",
    `Kode galat hash katalog tidak sesuai: ${JSON.stringify(badHash.error)}`
  );
  log("SHA-256 bundel yang tidak cocok ditolak (MATERIAL_HASH_MISMATCH).");

  // Negatif 2: tanda tangan item katalog diacak (base64url tetap valid).
  const tampered = Buffer.from(fixture.signature.value, "base64url");
  tampered[tampered.length - 1] ^= 0x01;
  await fixture.writeCatalog({
    ...fixture.baseItem,
    signature: { ...fixture.signature, value: tampered.toString("base64url") }
  });
  const badSignature = await invoke(page, "material_catalog_install", {
    input: { materialId: fixture.materialId, version: "1.0.0" }
  });
  assert(!badSignature.ok, "Item katalog dengan tanda tangan salah seharusnya ditolak.");
  assert(
    badSignature.error?.code === "MATERIAL_SIGNATURE_INVALID",
    `Kode galat tanda tangan katalog tidak sesuai: ${JSON.stringify(badSignature.error)}`
  );
  log("Tanda tangan item katalog diverifikasi sebelum unduh (MATERIAL_SIGNATURE_INVALID).");

  const empty = await invoke(page, "material_list_installed");
  assert(empty.ok && empty.value.length === 0, "Tidak boleh ada materi terpasang setelah penolakan.");

  await fixture.writeCatalog(fixture.baseItem);
  await clickSelector(page, "[data-catalog-refresh]");
  await page.waitFor(
    `document.querySelector('[data-catalog-item="${fixture.materialId}"]') !== null`,
    { label: "daftar materi katalog" }
  );
  const listing = await page.evaluate(`document.body.textContent`);
  assert(!listing.includes("materi-draf-uji"), "Materi berstatus draft tidak boleh tampil di katalog.");
  assert(
    listing.includes("Kelas 3") || listing.includes("kelas 3"),
    "Kartu katalog harus menampilkan kelas materi."
  );
  log("Daftar katalog memuat materi reviewed dan menyembunyikan draf.");

  // Cover item katalog diunduh Rust lewat URL pre-signed dan tampil sebagai data URL.
  await page.waitFor(
    `(() => {
      const image = document.querySelector('[data-catalog-item="${fixture.materialId}"] img[data-material-cover]');
      return !!image && image.src.startsWith("data:image/") && image.naturalWidth > 0;
    })()`,
    { label: "cover katalog tampil", timeoutMs: 30_000 }
  );
  const catalogCover = await page.evaluate(`
    (() => {
      const image = document.querySelector('[data-catalog-item="${fixture.materialId}"] img[data-material-cover]');
      return { prefix: image.src.slice(0, 21), width: image.naturalWidth, height: image.naturalHeight };
    })()
  `);
  assert(
    catalogCover.prefix.startsWith("data:image/png;base64"),
    `Cover katalog bukan data URL PNG: ${catalogCover.prefix}`
  );
  assert(catalogCover.width > 0, "Cover katalog tidak punya lebar alami.");
  log(
    `Cover katalog tampil sebagai data URL (${catalogCover.width}×${catalogCover.height}).`
  );

  // Filter kelas 1 kosong, lalu kembali ke semua kelas.
  await fillValue(page, "[data-catalog-grade]", "1", "change");
  await clickSelector(page, "[data-catalog-refresh]");
  await page.waitFor(`document.body.textContent.includes("Tidak ada materi pada filter ini.")`, {
    label: "hasil filter kelas kosong"
  });
  await fillValue(page, "[data-catalog-grade]", "", "change");
  await clickSelector(page, "[data-catalog-refresh]");
  await page.waitFor(
    `document.querySelector('[data-catalog-item="${fixture.materialId}"]') !== null`,
    { label: "katalog kembali tanpa filter" }
  );
  log("Filter kelas dijalankan di server katalog (kelas 1 kosong, semua kelas memuat materi).");

  await clickSelector(page, `[data-catalog-install="${fixture.materialId}"]`);
  await page.waitFor(
    `document.querySelector('[data-catalog-install="${fixture.materialId}"]')?.textContent.trim() === "Terpasang"`,
    { label: "tombol katalog berubah jadi Terpasang" }
  );
  const installed = await invoke(page, "material_list_installed");
  assert(installed.ok && installed.value.length === 1, "Materi katalog harus terpasang setelah unduhan.");
  assert(installed.value[0].materialId === fixture.materialId, "materialId terpasang tidak sesuai.");
  assert(
    installed.value[0].version === "1.0.0",
    `Versi terpasang tidak sesuai: ${installed.value[0].version}`
  );
  log(
    `Materi daring terpasang dari katalog: ${installed.value[0].title} ` +
      `v${installed.value[0].version} (${Math.round(installed.value[0].sizeBytes / 1024)} KB).`
  );

  // Baris "Materi terpasang" memakai cover dari bundel di disk.
  await page.waitFor(
    `(() => {
      const image = document.querySelector('[data-material-installed] img[data-material-cover]');
      return !!image && image.src.startsWith("data:image/") && image.naturalWidth > 0;
    })()`,
    { label: "cover materi terpasang tampil", timeoutMs: 30_000 }
  );
  log("Cover materi terpasang dibaca dari bundel lokal.");

  // Katalog dimatikan: daftar harus jatuh ke cache lokal dengan penanda stale.
  await fixture.close();
  await clickSelector(page, "[data-catalog-refresh]");
  await page.waitFor(`document.querySelector("[data-catalog-stale]") !== null`, {
    label: "penanda katalog stale",
    timeoutMs: 30_000
  });
  const staleListing = await page.evaluate(`
    document.body.textContent.includes("Menampilkan cache lokal") &&
      document.querySelector('[data-catalog-item="${fixture.materialId}"]') !== null
  `);
  assert(staleListing, "Cache lokal harus menampilkan materi saat katalog tidak terjangkau.");
  log("Katalog mati → daftar memakai cache lokal dan menandai stale.");

  await page.evaluate(`document.querySelector("[data-catalog-stale]")?.scrollIntoView({ block: "center" })`);
  await page.screenshot(path.join(artifactDir, "katalog-daring.png"));
}
