import { failure, json } from "./http";
import { checkManifest } from "./materialManifest";
import { rest, type SupabaseEnv } from "./supabase";

// Katalog materi HTML5 daring (kontrak bundel v1 §6, §11; ADR-0035 OD-10…OD-13).
// Worker ini yang menandatangani manifest dan membuat URL unduhan berumur pendek;
// kunci privat tidak pernah keluar dari secret Worker dan tidak pernah masuk aplikasi.

export interface MaterialsEnv extends SupabaseEnv {
  CONTENT_SIGNING_KEY?: string;
  CONTENT_KEY_ID?: string;
  CONTENT_BUCKET?: string;
  MATERIAL_URL_TTL_SECONDS?: string;
  ADMIN_API_TOKEN?: string;
  CORS_ORIGIN?: string;
}

const encoder = new TextEncoder();

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;
const MAX_BUNDLE_BYTES = 52_428_800; // 50 MB (OD-13)
const PUBLIC_REVIEW_STATES = ["reviewed", "approved"];
const SUBJECT_PATTERN = /^[a-z0-9-]{1,40}$/;
const CURSOR_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const QUERY_PARAMS = new Set(["grade", "subject", "cursor", "limit"]);

export interface MaterialRow {
  material_id: string;
  version: string;
  title: string;
  summary: string;
  review_status: string;
  manifest: unknown;
  bundle_path: string;
  cover_path: string | null;
  size_bytes: number;
  bundle_sha256: string;
  key_id: string | null;
  signature: string | null;
  published_at: string;
  updated_at: string;
}

function bucket(env: MaterialsEnv): string {
  return env.CONTENT_BUCKET?.trim() || "material-bundles";
}

function contentKeyId(env: MaterialsEnv): string {
  return env.CONTENT_KEY_ID?.trim() || "content-2026-1";
}

function urlTtlSeconds(env: MaterialsEnv): number {
  const parsed = Number(env.MATERIAL_URL_TTL_SECONDS);
  return Number.isInteger(parsed) && parsed >= 60 && parsed <= 900 ? parsed : 600;
}

function base(env: MaterialsEnv): string {
  return env.SUPABASE_URL.replace(/\/+$/, "");
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", toArrayBuffer(bytes));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.length);
  copy.set(bytes);
  return copy.buffer;
}

function base64ToBytes(value: string): Uint8Array {
  const normalized = value.includes("-") || value.includes("_")
    ? value.replace(/-/g, "+").replace(/_/g, "/")
    : value;
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(",")}}`;
  }
  if (typeof value === "number" && !Number.isInteger(value)) {
    throw new Error("canonical JSON hanya mendukung bilangan bulat");
  }
  return JSON.stringify(value);
}

async function signManifest(env: MaterialsEnv, manifest: unknown): Promise<string> {
  const source = env.CONTENT_SIGNING_KEY;
  if (!source) {
    throw new Error("CONTENT_SIGNING_KEY belum diset.");
  }
  const key = await crypto.subtle.importKey(
    "pkcs8",
    toArrayBuffer(base64ToBytes(source)),
    { name: "Ed25519" } as AlgorithmIdentifier,
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    { name: "Ed25519" } as AlgorithmIdentifier,
    key,
    toArrayBuffer(encoder.encode(canonicalJson(manifest)))
  );
  return bytesToBase64Url(new Uint8Array(signature));
}

// ---------------------------------------------------------------- Supabase Storage

async function storageRequest(
  env: MaterialsEnv,
  path: string,
  init: { method?: string; body?: BodyInit; contentType?: string; upsert?: boolean } = {}
): Promise<Response> {
  const response = await fetch(`${base(env)}${path}`, {
    method: init.method ?? "GET",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      ...(init.contentType ? { "content-type": init.contentType } : {}),
      ...(init.upsert ? { "x-upsert": "true" } : {})
    },
    body: init.body
  });
  return response;
}

async function uploadObject(
  env: MaterialsEnv,
  objectPath: string,
  bytes: Uint8Array,
  contentType: string,
  upsert: boolean
): Promise<void> {
  const response = await storageRequest(env, `/storage/v1/object/${bucket(env)}/${objectPath}`, {
    method: "POST",
    body: toArrayBuffer(bytes),
    contentType,
    upsert
  });
  if (!response.ok) {
    throw new Error(`Gagal mengunggah ${objectPath}: HTTP ${response.status}`);
  }
}

/// URL pre-signed berumur pendek (OD-12). Supabase mengembalikan jalur relatif.
async function signedUrl(env: MaterialsEnv, objectPath: string | null): Promise<string | null> {
  if (!objectPath) {
    return null;
  }
  const response = await storageRequest(env, `/storage/v1/object/sign/${bucket(env)}/${objectPath}`, {
    method: "POST",
    body: JSON.stringify({ expiresIn: urlTtlSeconds(env) })
  });
  if (!response.ok) {
    throw new Error(`Gagal membuat URL pre-signed untuk ${objectPath}: HTTP ${response.status}`);
  }
  const payload = (await response.json()) as { signedURL?: string };
  if (!payload.signedURL) {
    throw new Error(`Supabase tidak mengembalikan signedURL untuk ${objectPath}.`);
  }
  return `${base(env)}${payload.signedURL}`;
}

// ------------------------------------------------------------------- ZIP pembacaan

interface ZipEntry {
  name: string;
  uncompressedSize: number;
}

/// Membaca Central Directory ZIP tanpa mendekompresi apa pun (material v1 disimpan
/// STORE tanpa kompresi oleh `scripts/material-pack.mjs`, jadi ukuran entri bisa
/// langsung dibandingkan dengan `files[]` manifest).
export function readZipEntries(bytes: Uint8Array): ZipEntry[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const EOCDA = 0x06054b50;
  let eocd = -1;
  const lowest = Math.max(0, bytes.length - 66_000);
  for (let offset = bytes.length - 22; offset >= lowest; offset -= 1) {
    if (offset < 0) break;
    if (view.getUint32(offset, true) === EOCDA) {
      eocd = offset;
      break;
    }
  }
  if (eocd < 0) {
    throw new Error("Berkas bukan ZIP yang sah (End of Central Directory tidak ditemukan).");
  }
  const count = view.getUint16(eocd + 10, true);
  let pointer = view.getUint32(eocd + 16, true);
  const entries: ZipEntry[] = [];
  for (let index = 0; index < count; index += 1) {
    if (pointer + 46 > bytes.length || view.getUint32(pointer, true) !== 0x02014b50) {
      throw new Error("Struktur Central Directory ZIP tidak dapat dibaca.");
    }
    const uncompressed = view.getUint32(pointer + 24, true);
    const nameLength = view.getUint16(pointer + 28, true);
    const extraLength = view.getUint16(pointer + 30, true);
    const commentLength = view.getUint16(pointer + 32, true);
    const nameStart = pointer + 46;
    const name = new TextDecoder().decode(bytes.slice(nameStart, nameStart + nameLength));
    entries.push({ name, uncompressedSize: uncompressed });
    pointer = nameStart + nameLength + extraLength + commentLength;
  }
  return entries;
}

// ------------------------------------------------------------------- query §6

interface CatalogQuery {
  grade: number | null;
  subject: string | null;
  offset: number;
  limit: number;
}

function parseQuery(searchParams: URLSearchParams): { query: CatalogQuery } | { error: string } {
  for (const name of searchParams.keys()) {
    if (!QUERY_PARAMS.has(name)) {
      return { error: `Parameter "${name}" tidak dikenal katalog.` };
    }
    if (searchParams.getAll(name).length > 1) {
      return { error: `Parameter "${name}" hanya boleh muncul sekali.` };
    }
  }

  const grade = searchParams.get("grade");
  if (grade !== null && !/^[1-6]$/.test(grade)) {
    return { error: "grade harus 1–6." };
  }

  const subject = searchParams.get("subject");
  if (subject !== null && !SUBJECT_PATTERN.test(subject)) {
    return { error: "subject harus slug huruf kecil." };
  }

  const limit = searchParams.get("limit");
  if (limit !== null) {
    const parsed = Number(limit);
    if (!/^\d{1,3}$/.test(limit) || parsed < 1 || parsed > MAX_LIMIT) {
      return { error: `limit harus 1–${MAX_LIMIT}.` };
    }
  }

  let offset = 0;
  const cursor = searchParams.get("cursor");
  if (cursor !== null) {
    if (!CURSOR_PATTERN.test(cursor)) {
      return { error: "cursor tidak valid." };
    }
    const decoded = Number(atob(cursor.replace(/-/g, "+").replace(/_/g, "/").padEnd(4, "=")));
    if (!Number.isInteger(decoded) || decoded < 0) {
      return { error: "cursor tidak valid." };
    }
    offset = decoded;
  }

  return {
    query: {
      grade: grade === null ? null : Number(grade),
      subject,
      offset,
      limit: limit === null ? DEFAULT_LIMIT : Number(limit)
    }
  };
}

function encodeCursor(offset: number): string {
  return bytesToBase64Url(encoder.encode(String(offset)));
}

function rowsFilter(query: CatalogQuery, includeDrafts: boolean): string {
  const parts = [
    "select=material_id,version,title,summary,review_status,manifest,bundle_path,cover_path,size_bytes,bundle_sha256,key_id,signature,published_at,updated_at",
    "unpublished_at=is.null",
    includeDrafts
      ? `review_status=in.(${["draft", ...PUBLIC_REVIEW_STATES].join(",")})`
      : `review_status=in.(${PUBLIC_REVIEW_STATES.join(",")})`
  ];
  if (query.grade !== null) {
    parts.push(`grade_levels=cs.${encodeURIComponent(`{${query.grade}}`)}`);
  }
  if (query.subject !== null) {
    parts.push(`subjects=cs.${encodeURIComponent(`{${query.subject}}`)}`);
  }
  parts.push("order=published_at.desc,material_id.asc");
  return parts.join("&");
}

function toCatalogItem(row: MaterialRow, downloadUrl: string, coverUrl: string | null) {
  const item: Record<string, unknown> = {
    materialId: row.material_id,
    version: row.version,
    publishedAt: isoOf(row.published_at),
    updatedAt: isoOf(row.updated_at),
    sizeBytes: Number(row.size_bytes),
    bundleSha256: row.bundle_sha256,
    downloadUrl,
    signature: { keyId: row.key_id, algorithm: "ed25519", value: row.signature },
    material: row.manifest
  };
  // coverUrl opsional (§6): katalog lama tanpa field ini tetap sah bagi aplikasi.
  if (coverUrl) {
    item.coverUrl = coverUrl;
  }
  return item;
}

function isoOf(value: string): string {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? value : new Date(parsed).toISOString();
}

function adminAuthorized(request: Request, env: MaterialsEnv): boolean {
  const expected = env.ADMIN_API_TOKEN?.trim();
  if (!expected) {
    return false;
  }
  const authorization = request.headers.get("authorization") ?? "";
  return authorization === `Bearer ${expected}`;
}

function errorBody(code: string, message: string) {
  return { error: { code, message } };
}

// ------------------------------------------------------------------ GET katalog

export async function handleMaterials(
  request: Request,
  env: MaterialsEnv,
  corsOrigin: string
): Promise<Response> {
  const url = new URL(request.url);
  const parsed = parseQuery(url.searchParams);
  if ("error" in parsed) {
    return failure(400, "INVALID_QUERY", parsed.error, corsOrigin);
  }
  const { query } = parsed;
  const includeDrafts = adminAuthorized(request, env);

  const filter = rowsFilter(query, includeDrafts);
  let rows: unknown;
  let newest: unknown;
  try {
    // Dua kueri: halaman isi, lalu updated_at terbaru untuk seluruh himpunan
    // yang cocok. generatedAt harus stabil agar ETag (dan karena itu 304) berarti.
    [rows, newest] = await Promise.all([
      rest(env, `/materials?${filter}&limit=${query.limit + 1}&offset=${query.offset}`),
      rest(env, `/materials?${filter}&select=updated_at&limit=1`)
    ]);
  } catch (error) {
    const status = error instanceof Error ? error.message : "unknown";
    return failure(502, "CATALOG_UNAVAILABLE", `Katalog materi tidak tersedia: ${status}`, corsOrigin);
  }

  const list = Array.isArray(rows) ? (rows as MaterialRow[]) : [];
  const page = list.slice(0, query.limit);
  const hasMore = list.length > query.limit;

  const newestRows = Array.isArray(newest) ? (newest as Array<{ updated_at: string }>) : [];
  const generatedAt = newestRows[0]?.updated_at
    ? isoOf(newestRows[0].updated_at)
    : new Date(0).toISOString();

  // ETag dihitung atas ISI, tanpa URL pre-signed yang berganti tiap permintaan;
  // kalau ikut URL, 304 tidak akan pernah terjadi.
  const stablePayload = JSON.stringify({
    schemaVersion: "1.0.0",
    generatedAt,
    items: page.map((row) => ({
      materialId: row.material_id,
      version: row.version,
      publishedAt: isoOf(row.published_at),
      updatedAt: isoOf(row.updated_at),
      sizeBytes: Number(row.size_bytes),
      bundleSha256: row.bundle_sha256,
      signatureKeyId: row.key_id,
      signatureValue: row.signature,
      material: row.manifest
    })),
    nextCursor: hasMore ? encodeCursor(query.offset + page.length) : null
  });
  const etag = `"${await sha256Hex(encoder.encode(stablePayload))}"`;
  const cacheHeaders: Record<string, string> = {
    etag,
    "cache-control": "public, max-age=300",
    "access-control-allow-origin": corsOrigin
  };

  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers: cacheHeaders });
  }

  const items: unknown[] = [];
  for (const row of page) {
    if (!row.signature || !row.key_id) {
      // Baris tanpa tanda tangan tidak pernah boleh sampai ke perangkat.
      continue;
    }
    let downloadUrl: string | null;
    try {
      downloadUrl = await signedUrl(env, row.bundle_path);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("signed url bundel gagal", row.material_id, message);
      return failure(502, "CATALOG_UNAVAILABLE", "URL unduhan materi tidak dapat dibuat.", corsOrigin);
    }
    // Cover hanya kosmetik (§6): kegagalan URL cover tidak menggagalkan item.
    const coverUrl = await signedUrl(env, row.cover_path).catch(() => null);
    items.push(toCatalogItem(row, downloadUrl ?? "", coverUrl));
  }

  const body = {
    schemaVersion: "1.0.0",
    generatedAt,
    items,
    nextCursor: hasMore ? encodeCursor(query.offset + page.length) : null
  };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...cacheHeaders, "content-type": "application/json" }
  });
}

// -------------------------------------------------------------- POST publish

function formString(form: FormData, name: string): string | null {
  const value = form.get(name);
  return typeof value === "string" && value.length > 0 ? value : null;
}

async function formBytes(form: FormData, name: string): Promise<Uint8Array | null> {
  const value = form.get(name);
  if (!(value instanceof File)) {
    return null;
  }
  return new Uint8Array(await value.arrayBuffer());
}

export async function handleMaterialPublish(
  request: Request,
  env: MaterialsEnv,
  corsOrigin: string
): Promise<Response> {
  if (!adminAuthorized(request, env)) {
    return failure(401, "MATERIAL_ADMIN_REQUIRED", "Publish materi memerlukan token admin.", corsOrigin);
  }
  if (!env.CONTENT_SIGNING_KEY) {
    return failure(503, "MATERIAL_SIGNING_UNAVAILABLE", "Kunci tanda tangan materi belum dikonfigurasi.", corsOrigin);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return failure(400, "MATERIAL_INVALID_BODY", "Permintaan harus multipart dengan manifest dan bundle.", corsOrigin);
  }

  const manifestText = formString(form, "manifest");
  if (!manifestText) {
    return failure(400, "MATERIAL_INVALID_BODY", "Bidang manifest tidak ada.", corsOrigin);
  }
  let manifestValue: unknown;
  try {
    manifestValue = JSON.parse(manifestText);
  } catch {
    return failure(400, "MATERIAL_INVALID_BODY", "manifest bukan JSON yang sah.", corsOrigin);
  }

  const issues = checkManifest(manifestValue);
  if (issues.length > 0) {
    return failure(
      400,
      "MATERIAL_MANIFEST_INVALID",
      issues.slice(0, 12).map((issue) => `${issue.path}: ${issue.message}`).join("; "),
      corsOrigin
    );
  }
  const manifest = manifestValue as {
    materialId: string;
    version: string;
    schemaVersion: string;
    title: string;
    summary: string;
    reviewStatus: string;
    gradeLevels: number[];
    subjects: string[];
    cover: string;
    files: Array<{ path: string; bytes: number; sha256: string; mediaType: string }>;
  };

  const bundle = await formBytes(form, "bundle");
  if (!bundle || bundle.length === 0) {
    return failure(400, "MATERIAL_INVALID_BODY", "Berkas bundle (ZIP) tidak ada.", corsOrigin);
  }
  if (bundle.length > MAX_BUNDLE_BYTES) {
    return failure(413, "MATERIAL_TOO_LARGE", `Bundel melebihi batas 50 MB (OD-13).`, corsOrigin);
  }

  let entries: ZipEntry[];
  try {
    entries = readZipEntries(bundle);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return failure(400, "MATERIAL_BUNDLE_INVALID", message, corsOrigin);
  }

  const names = new Set(entries.map((entry) => entry.name));
  if (!names.has("material.json")) {
    return failure(400, "MATERIAL_BUNDLE_INVALID", "ZIP tidak memuat material.json.", corsOrigin);
  }
  const sizes = new Map(entries.map((entry) => [entry.name, entry.uncompressedSize]));
  for (const file of manifest.files) {
    if (!names.has(file.path)) {
      return failure(400, "MATERIAL_BUNDLE_INVALID", `Berkas terdaftar tidak ada di ZIP: ${file.path}`, corsOrigin);
    }
    if (sizes.get(file.path) !== file.bytes) {
      return failure(400, "MATERIAL_BUNDLE_INVALID", `Ukuran berkas berbeda dari manifest: ${file.path}`, corsOrigin);
    }
  }
  const allowed = new Set([...manifest.files.map((file) => file.path), "material.json"]);
  const extras = [...names].filter((name) => !allowed.has(name));
  if (extras.length > 0) {
    return failure(400, "MATERIAL_BUNDLE_INVALID", `ZIP memuat berkas tak terdaftar: ${extras.join(", ")}`, corsOrigin);
  }

  const bundleSha256 = await sha256Hex(bundle);
  const existing = await rest(
    env,
    `/materials?select=bundle_sha256,size_bytes,unpublished_at&material_id=eq.${manifest.materialId}&version=eq.${manifest.version}&limit=1`
  );
  const prior = Array.isArray(existing) ? ((existing as Array<{ bundle_sha256: string }>)[0] ?? null) : null;
  if (prior && prior.bundle_sha256 !== bundleSha256) {
    // §11.6 — satu versi tidak boleh terbit ulang dengan isi berbeda.
    return failure(409, "MATERIAL_VERSION_CONFLICT", `${manifest.materialId}@${manifest.version} sudah terbit dengan isi lain. Naikkan version.`, corsOrigin);
  }

  const coverFile = await formBytes(form, "cover");
  const bundlePath = `${manifest.materialId}/${manifest.version}/bundle.zip`;
  const coverPath = coverFile && coverFile.length > 0
    ? `${manifest.materialId}/${manifest.version}/${manifest.cover.split("/").pop()}`
    : null;

  try {
    await uploadObject(env, bundlePath, bundle, "application/zip", Boolean(prior));
    if (coverPath && coverFile) {
      const extension = coverPath.split(".").pop()?.toLowerCase() ?? "";
      const contentType = extension === "png" ? "image/png" : extension === "jpg" || extension === "jpeg" ? "image/jpeg" : "image/webp";
      await uploadObject(env, coverPath, coverFile, contentType, Boolean(prior));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return failure(502, "MATERIAL_STORAGE_UNAVAILABLE", message, corsOrigin);
  }

  const now = new Date().toISOString();
  const body = {
    material_id: manifest.materialId,
    version: manifest.version,
    schema_version: manifest.schemaVersion,
    title: manifest.title,
    summary: manifest.summary,
    review_status: manifest.reviewStatus,
    grade_levels: manifest.gradeLevels,
    subjects: manifest.subjects,
    manifest,
    bundle_path: bundlePath,
    cover_path: coverPath,
    size_bytes: bundle.length,
    bundle_sha256: bundleSha256,
    updated_at: now,
    unpublished_at: null,
    ...(prior ? {} : { published_at: now })
  };

  try {
    await rest(env, `/materials?on_conflict=material_id,version`, {
      method: "POST",
      prefer: "resolution=merge-duplicates,return=minimal",
      body
    });
    // Tandatangani manifest SEBAGAIMANA DIBACA KEMBALI dari basis data. jsonb
    // bisa menormalkan bentuk; menandatangani objek hasil baca menjamin tanda
    // tangan cocok dengan byte yang nanti dikirim ke perangkat.
    const stored = await rest(
      env,
      `/materials?select=manifest&material_id=eq.${manifest.materialId}&version=eq.${manifest.version}&limit=1`
    );
    const storedRow = Array.isArray(stored) ? ((stored as Array<{ manifest: unknown }>)[0] ?? null) : null;
    if (!storedRow) {
      return failure(500, "MATERIAL_PUBLISH_FAILED", "Baris katalog tidak terbaca kembali setelah publish.", corsOrigin);
    }
    const value = await signManifest(env, storedRow.manifest);
    await rest(env, `/materials?material_id=eq.${manifest.materialId}&version=eq.${manifest.version}`, {
      method: "PATCH",
      prefer: "return=minimal",
      body: { key_id: contentKeyId(env), signature: value }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return failure(502, "MATERIAL_PUBLISH_FAILED", `Gagal menulis katalog: ${message}`, corsOrigin);
  }

  return json(
    200,
    {
      materialId: manifest.materialId,
      version: manifest.version,
      reviewStatus: manifest.reviewStatus,
      sizeBytes: bundle.length,
      bundleSha256,
      keyId: contentKeyId(env),
      bundlePath,
      coverPath
    },
    corsOrigin
  );
}

// ------------------------------------------------------------ POST unpublish

export async function handleMaterialUnpublish(
  request: Request,
  env: MaterialsEnv,
  corsOrigin: string
): Promise<Response> {
  if (!adminAuthorized(request, env)) {
    return failure(401, "MATERIAL_ADMIN_REQUIRED", "Penarikan materi memerlukan token admin.", corsOrigin);
  }
  const body = (await request.json().catch(() => null)) as { materialId?: unknown; version?: unknown } | null;
  const materialId = typeof body?.materialId === "string" ? body.materialId : "";
  const version = typeof body?.version === "string" ? body.version : "";
  if (!/^[a-z0-9][a-z0-9-]{2,63}$/.test(materialId) || !/^\d+\.\d+\.\d+/.test(version)) {
    return failure(400, "MATERIAL_INVALID_BODY", "materialId dan version wajib sah.", corsOrigin);
  }

  let rows: unknown;
  try {
    rows = await rest(env, `/materials?material_id=eq.${materialId}&version=eq.${version}`, {
      method: "PATCH",
      prefer: "return=representation",
      body: { unpublished_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return failure(502, "MATERIAL_UNPUBLISH_FAILED", message, corsOrigin);
  }
  const changed = Array.isArray(rows) ? rows.length : 0;
  if (changed === 0) {
    return failure(404, "MATERIAL_NOT_FOUND", "Materi tidak ada di katalog.", corsOrigin);
  }
  return json(200, { materialId, version, unpublished: true }, corsOrigin);
}
