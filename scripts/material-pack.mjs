#!/usr/bin/env node
// Pembuat bundel materi HTML5 bertanda tangan (kontrak bundel v1 §3–§5).
// Dipakai untuk membuat bundel uji/dev; sisi platform (editor + server) belum ada.
import { createHash, generateKeyPairSync, sign } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import zlib from "node:zlib";

const MEDIA_TYPES = {
  html: "text/html",
  js: "text/javascript",
  mjs: "text/javascript",
  css: "text/css",
  json: "application/json",
  webp: "image/webp",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  svg: "image/svg+xml",
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  ogg: "audio/ogg",
  wav: "audio/wav",
  woff2: "font/woff2",
  ttf: "font/ttf",
  vtt: "text/vtt",
  txt: "text/plain"
};

export function canonical(value) {
  if (Array.isArray(value)) {
    return `[${value.map(canonical).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const keys = Object.keys(value).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
  }
  if (typeof value === "number" && !Number.isInteger(value)) {
    throw new Error("Manifest materi hanya mendukung angka integer");
  }
  return JSON.stringify(value);
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function extensionOf(name) {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
}

function collectSource(sourceDir) {
  const files = [];
  const seen = new Set();

  function walk(current, relative) {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      const pathname = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isSymbolicLink()) {
        throw new Error(`Symlink tidak diizinkan: ${pathname}`);
      }
      if (entry.isDirectory()) {
        walk(absolute, pathname);
        continue;
      }
      if (!entry.isFile()) {
        throw new Error(`Entri tidak didukung: ${pathname}`);
      }
      if (pathname === "material.json") {
        continue;
      }
      if (pathname.includes("\\") || pathname.split("/").some((part) => part === ".." || part === ".")) {
        throw new Error(`Path tidak valid: ${pathname}`);
      }
      const mediaType = MEDIA_TYPES[extensionOf(pathname)];
      if (!mediaType) {
        throw new Error(`Tipe berkas tidak diizinkan: ${pathname}`);
      }
      if (seen.has(pathname.toLowerCase())) {
        throw new Error(`Path duplikat (case-insensitive): ${pathname}`);
      }
      seen.add(pathname.toLowerCase());

      const data = readFileSync(absolute);
      files.push({ path: pathname, bytes: data.length, sha256: sha256(data), mediaType, data });
    }
  }

  walk(sourceDir, "");
  if (files.length === 0) {
    throw new Error("Folder sumber tidak memuat berkas materi");
  }
  return files.sort((left, right) => left.path.localeCompare(right.path));
}

// ZIP dengan entri STORED: cukup untuk bundel uji, tanpa dependensi tambahan.
function zipStored(entries) {
  const chunks = [];
  const central = [];
  let offset = 0;

  for (const entry of entries) {
    const name = Buffer.from(entry.path, "utf8");
    const data = entry.data;
    const crc = zlib.crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0x21, 12);
    local.writeUInt32LE(crc >>> 0, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    chunks.push(local, name, data);

    const directory = Buffer.alloc(46);
    directory.writeUInt32LE(0x02014b50, 0);
    directory.writeUInt16LE(20, 4);
    directory.writeUInt16LE(20, 6);
    directory.writeUInt16LE(0x0800, 8);
    directory.writeUInt16LE(0, 10);
    directory.writeUInt16LE(0, 12);
    directory.writeUInt16LE(0x21, 14);
    directory.writeUInt32LE(crc >>> 0, 16);
    directory.writeUInt32LE(data.length, 20);
    directory.writeUInt32LE(data.length, 24);
    directory.writeUInt16LE(name.length, 28);
    directory.writeUInt16LE(0, 30);
    directory.writeUInt16LE(0, 32);
    directory.writeUInt16LE(0, 34);
    directory.writeUInt16LE(0, 36);
    directory.writeUInt32LE(0, 38);
    directory.writeUInt32LE(offset, 42);
    central.push(Buffer.concat([directory, name]));

    offset += local.length + name.length + data.length;
  }

  const centralBuf = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...chunks, centralBuf, end]);
}

export function generateContentKeys(directory, keyId = "content-dev-1") {
  mkdirSync(directory, { recursive: true });
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  const privatePem = privateKey.export({ type: "pkcs8", format: "pem" });
  const publicDer = publicKey.export({ type: "spki", format: "der" });
  const publicRaw = Buffer.from(publicDer.subarray(publicDer.length - 32));

  const privatePath = path.join(directory, `${keyId}-private.pem`);
  writeFileSync(privatePath, privatePem);
  const keys = [{ keyId, publicKey: publicRaw.toString("base64url") }];
  writeFileSync(path.join(directory, `${keyId}-keys.json`), `${JSON.stringify(keys)}\n`);

  return { privatePath, privatePem, keys };
}

/**
 * Membangun ZIP + manifest final tanpa menandatangani.
 * Sisi penerbit yang memakai Worker memakai ini; kunci privat tetap di Worker.
 */
export function buildBundle({ sourceDir, transformManifest }) {
  const manifest = JSON.parse(readFileSync(path.join(sourceDir, "material.json"), "utf8"));
  const files = collectSource(sourceDir);
  manifest.files = files.map(({ path: filePath, bytes, sha256: digest, mediaType }) => ({
    path: filePath,
    mediaType,
    bytes,
    sha256: digest
  }));

  if (transformManifest) {
    transformManifest(manifest);
  }

  const manifestBytes = Buffer.from(canonical(manifest), "utf8");
  const archive = zipStored([
    { path: "material.json", data: manifestBytes },
    ...files.map((file) => ({ path: file.path, data: file.data }))
  ]);

  return {
    manifest,
    manifestBytes,
    archive,
    bundleSha256: sha256(archive),
    fileCount: files.length
  };
}

/**
 * Membuat `<outPath>` + `<outPath tanpa .zip>.sig`.
 * `transformManifest` hanya dipakai untuk membuat fixture negatif (mis. hash salah).
 */
export function packBundle({ sourceDir, outPath, privateKeyPem, keyId = "content-dev-1", transformManifest }) {
  const { manifest, manifestBytes, archive, bundleSha256, fileCount } = buildBundle({ sourceDir, transformManifest });
  const signature = sign(null, manifestBytes, privateKeyPem);

  mkdirSync(path.dirname(outPath), { recursive: true });
  writeFileSync(outPath, archive);

  const signaturePath = outPath.replace(/\.zip$/i, ".sig");
  writeFileSync(
    signaturePath,
    `${JSON.stringify(
      { keyId, algorithm: "ed25519", value: Buffer.from(signature).toString("base64url") },
      null,
      2
    )}\n`
  );

  return {
    bundle: outPath,
    signature: signaturePath,
    materialId: manifest.materialId,
    version: manifest.version,
    files: fileCount,
    bytes: archive.length,
    bundleSha256,
    manifest
  };
}

function arg(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

function cli() {
  const mode = process.argv[2];

  if (mode === "keygen") {
    const result = generateContentKeys(arg("dir", "."), arg("key-id", "content-dev-1"));
    console.log(JSON.stringify({ private: result.privatePath, keys: result.keys }, null, 2));
    return;
  }

  if (mode === "pack") {
    const source = arg("source");
    const out = arg("out");
    const privatePath = arg("private");
    if (!source || !out || !privatePath) {
      throw new Error("pack memerlukan --source, --out, dan --private");
    }
    const result = packBundle({
      sourceDir: source,
      outPath: out,
      privateKeyPem: readFileSync(privatePath, "utf8"),
      keyId: arg("key-id", "content-dev-1")
    });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log("Usage:");
  console.log("  node scripts/material-pack.mjs keygen --dir <dir> [--key-id content-dev-1]");
  console.log("  node scripts/material-pack.mjs pack --source <dir> --out <zip> --private <pem> [--key-id content-dev-1]");
  process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  cli();
}
