#!/usr/bin/env node
// Membangun katalog materi tiruan untuk demo lokal: setiap bundel contoh di bawah
// ditandatangani dengan kunci dev di .tmp-catalog/keys lalu dicatat di catalog.json.
// Jalankan `node scripts/dev-catalog.mjs --serve` untuk sekaligus melayani
// /v1/materials di http://127.0.0.1:8789 (lihat scripts/mock-catalog-server.mjs).
//
// Kunci dev di .tmp-catalog/ TIDAK BOLEH di-commit (.gitignore: `.tmp-*`).
import { createHash, createPublicKey, verify } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { canonical, generateContentKeys, packBundle } from "./material-pack.mjs";
import { startMockCatalogServer } from "./mock-catalog-server.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(REPO_ROOT, ".tmp-catalog");
const KEY_ID = "dev-content-1";
const SECRET_DIR = path.join(OUT_DIR, "keys");

const MATERIALS = [
  {
    source: "src-tauri/sample-material-fakta-opini",
    publishedAt: "2026-10-28T03:00:00.000Z"
  },
  {
    source: "src-tauri/sample-material-perkalian",
    publishedAt: "2026-10-28T02:00:00.000Z"
  },
  {
    source: "src-tauri/sample-material",
    publishedAt: "2026-10-28T01:00:00.000Z",
    // Bundel pertama tidak membawa material.json di repositori (dipakai juga
    // oleh include_bytes! dan E2E), jadi manifest-nya ditulis di sini.
    manifest: {
      schemaVersion: "1.0.0",
      materialId: "siklus-air-contoh",
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
    }
  }
];

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function loadKey() {
  const privatePath = path.join(SECRET_DIR, `${KEY_ID}-private.pem`);
  const keysPath = path.join(SECRET_DIR, `${KEY_ID}-keys.json`);
  if (existsSync(privatePath) && existsSync(keysPath)) {
    const privatePem = readFileSync(privatePath, "utf8");
    const keys = JSON.parse(readFileSync(keysPath, "utf8"));
    return { privatePem, keys };
  }
  return generateContentKeys(SECRET_DIR, KEY_ID);
}

function publicKeyObject(privatePem) {
  return createPublicKey(privatePem);
}

async function prepareSource(entry, materialId) {
  const stageDir = path.join(OUT_DIR, "material-src", materialId);
  await cp(path.join(REPO_ROOT, entry.source), stageDir, { recursive: true });
  if (entry.manifest) {
    await writeFile(
      path.join(stageDir, "material.json"),
      `${JSON.stringify(entry.manifest, null, 2)}\n`,
      "utf8"
    );
    return stageDir;
  }
  const committed = path.join(stageDir, "material.json");
  if (!existsSync(committed)) {
    throw new Error(`Sumber ${entry.source} tidak memuat material.json.`);
  }
  return stageDir;
}

async function buildItem(entry, { privatePem, publicKey }) {
  const sourceManifest = entry.manifest
    ? entry.manifest
    : JSON.parse(await readFile(path.join(REPO_ROOT, entry.source, "material.json"), "utf8"));
  const materialId = sourceManifest.materialId;
  const stageDir = await prepareSource(entry, materialId);
  const packed = packBundle({
    sourceDir: stageDir,
    outPath: path.join(OUT_DIR, "bundles", `${materialId}.zip`),
    privateKeyPem: privatePem,
    keyId: KEY_ID
  });

  const signature = JSON.parse(await readFile(packed.signature, "utf8"));
  const zipBytes = await readFile(packed.bundle);
  const digest = sha256(zipBytes);
  if (digest !== packed.bundleSha256) {
    throw new Error(`SHA-256 bundel ${materialId} tidak cocok dengan isi berkasnya.`);
  }
  const signatureOk = verify(
    null,
    Buffer.from(canonical(packed.manifest), "utf8"),
    publicKey,
    Buffer.from(signature.value, "base64url")
  );
  if (!signatureOk) {
    throw new Error(`Tanda tangan ${materialId} tidak sah terhadap kunci ${KEY_ID}.`);
  }

  return {
    materialId: packed.materialId,
    version: packed.version,
    publishedAt: entry.publishedAt,
    updatedAt: entry.publishedAt,
    sizeBytes: packed.bytes,
    bundleSha256: packed.bundleSha256,
    bundleFile: path.basename(packed.bundle),
    signature,
    material: packed.manifest,
    files: packed.files
  };
}

async function main() {
  const serve = process.argv.includes("--serve");
  const { privatePem, keys } = loadKey();
  const publicKey = publicKeyObject(privatePem);

  await mkdir(path.join(OUT_DIR, "bundles"), { recursive: true });
  await mkdir(path.join(OUT_DIR, "material-src"), { recursive: true });

  const built = [];
  for (const entry of MATERIALS) {
    built.push(await buildItem(entry, { privatePem, publicKey }));
  }
  built.sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt));

  const catalogFile = path.join(OUT_DIR, "catalog.json");
  await writeFile(
    catalogFile,
    `${JSON.stringify(
      {
        schemaVersion: "1.0.0",
        generatedAt: new Date().toISOString(),
        items: built.map(({ files, ...item }) => item)
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  console.log(`katalog tiruan: ${path.relative(REPO_ROOT, catalogFile)}`);
  for (const item of built) {
    console.log(
      `  ${item.materialId} v${item.version} · kelas ${item.material.gradeLevels.join(",")} · ` +
        `${item.material.subjects.join(",")} · ${item.files} berkas · ${item.sizeBytes} byte · ` +
        `sha256 ${item.bundleSha256.slice(0, 12)}…`
    );
  }
  console.log(`kunci: ${JSON.stringify(keys)}`);
  console.log("IFP_CONTENT_KEYS harus memuat kunci di atas saat aplikasi dijalankan.");

  if (!serve) {
    console.log("jalankan server: npm run catalog:dev -- --serve   (http://127.0.0.1:8789)");
    return;
  }

  const server = await startMockCatalogServer({
    catalogFile,
    bundleDir: path.join(OUT_DIR, "bundles"),
    token: "dev-token",
    port: Number(process.env.MOCK_CATALOG_PORT ?? 8789)
  });
  console.log(`server katalog: ${server.origin}/v1/materials`);

  const shutdown = () => {
    server.close().then(() => process.exit(0));
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

await main();
