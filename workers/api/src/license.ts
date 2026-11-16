import { z } from "zod";
import { failure, json, readJson } from "./http";
import { rest, type SupabaseEnv } from "./supabase";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const encoder = new TextEncoder();

export interface LicenseEnv extends SupabaseEnv {
  ACTIVATION_CODE_PEPPER: string;
  LICENSE_SIGNING_PRIVATE_KEY: string;
  LICENSE_PUBLIC_KEY?: string;
  LICENSE_KEY_ID?: string;
  LICENSE_PRODUCT_ID?: string;
  LICENSE_SUBSCRIPTION_DAYS?: string;
  LICENSE_GRACE_DAYS?: string;
}

const activationSchema = z.strictObject({
  schemaVersion: z.literal("1.0.0"),
  productId: z.string().min(1).max(64),
  machineId: z.string().regex(UUID),
  requestId: z.string().min(1).max(128),
  nonce: z.string().min(1).max(128),
  createdAt: z.string().min(10).max(40),
  serial: z.string().min(4).max(128)
});

const lookupSchema = z.strictObject({
  licenseId: z.string().regex(UUID),
  machineId: z.string().regex(UUID)
});

const licenseFileSchema = z.object({
  payload: z.record(z.string(), z.unknown()),
  signature: z.string().min(1)
});

interface LicenseRow {
  id: string;
  owner_id: string | null;
  plan: string;
  status: string;
  max_devices: number;
  starts_at: string;
  expires_at: string | null;
  serial_hash: string | null;
  product_id: string | null;
  license_type: string | null;
  machine_id: string | null;
  key_id: string | null;
  activated_at: string | null;
}

interface LicensePayload {
  schemaVersion: string;
  licenseId: string;
  productId: string;
  licenseType: string;
  machineId: string;
  deviceKeyThumbprint: string | null;
  issuedAt: string;
  notBefore: string;
  expiresAt: string | null;
  offlineGraceDays: number;
  entitlements: string[];
  keyId: string;
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

export async function hashSerial(serial: string, pepper: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(`${pepper}:${serial.trim().toUpperCase()}`)
  );
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.length);
  copy.set(bytes);
  return copy.buffer;
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

let cachedSigningKey: CryptoKey | null = null;
let cachedSigningSource = "";

async function signingKey(env: LicenseEnv): Promise<CryptoKey> {
  const source = env.LICENSE_SIGNING_PRIVATE_KEY;
  if (!source) {
    throw new Error("LICENSE_SIGNING_PRIVATE_KEY belum diset.");
  }
  if (!cachedSigningKey || cachedSigningSource !== source) {
    cachedSigningKey = await crypto.subtle.importKey(
      "pkcs8",
      toArrayBuffer(base64ToBytes(source)),
      { name: "Ed25519" } as AlgorithmIdentifier,
      false,
      ["sign"]
    );
    cachedSigningSource = source;
  }
  return cachedSigningKey;
}

async function signPayload(payload: LicensePayload, env: LicenseEnv): Promise<string> {
  const key = await signingKey(env);
  const signature = await crypto.subtle.sign(
    { name: "Ed25519" } as AlgorithmIdentifier,
    key,
    toArrayBuffer(encoder.encode(canonicalJson(payload)))
  );
  return bytesToBase64(new Uint8Array(signature));
}

function intEnv(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function keyId(env: LicenseEnv): string {
  return env.LICENSE_KEY_ID?.trim() || "prod-1";
}

async function findLicense(env: LicenseEnv, query: string): Promise<LicenseRow | null> {
  const rows = await rest(
    env,
    `/licenses?select=id,owner_id,plan,status,max_devices,starts_at,expires_at,serial_hash,product_id,license_type,machine_id,key_id,activated_at&${query}&limit=1`
  );
  return Array.isArray(rows) ? ((rows[0] as LicenseRow | undefined) ?? null) : null;
}

function issue(
  row: LicenseRow,
  machineId: string,
  env: LicenseEnv,
  now: Date,
  expiresAt: string | null
): Promise<{ payload: LicensePayload; signature: string }> {
  const payload: LicensePayload = {
    schemaVersion: "1.0.0",
    licenseId: row.id,
    productId: row.product_id ?? env.LICENSE_PRODUCT_ID?.trim() ?? "ifp-learning",
    licenseType: row.license_type ?? "subscription",
    machineId,
    deviceKeyThumbprint: null,
    issuedAt: now.toISOString(),
    notBefore: new Date(now.getTime() - 60_000).toISOString(),
    expiresAt,
    offlineGraceDays: intEnv(env.LICENSE_GRACE_DAYS, 7),
    entitlements: ["core"],
    keyId: keyId(env)
  };
  return signPayload(payload, env).then((signature) => ({ payload, signature }));
}

function expiryFor(row: LicenseRow, env: LicenseEnv, now: Date): string | null {
  const type = row.license_type ?? "subscription";
  if (type === "perpetual") {
    return null;
  }
  return row.expires_at ?? new Date(now.getTime() + intEnv(env.LICENSE_SUBSCRIPTION_DAYS, 30) * 86_400_000).toISOString();
}

function unavailable(env: LicenseEnv, corsOrigin: string): Response | null {
  if (!env.ACTIVATION_CODE_PEPPER || !env.LICENSE_SIGNING_PRIVATE_KEY) {
    return failure(503, "LICENSE_UNAVAILABLE", "Layanan lisensi belum dikonfigurasi.", corsOrigin);
  }
  return null;
}

async function audit(env: LicenseEnv, licenseId: string, action: string, machineId: string | null): Promise<void> {
  await rest(env, "/license_audit", {
    method: "POST",
    prefer: "return=minimal",
    body: { license_id: licenseId, action, machine_id: machineId, actor: "license-worker" }
  }).catch(() => undefined);
}

export async function handleActivation(
  request: Request,
  env: LicenseEnv,
  corsOrigin: string
): Promise<Response> {
  const notReady = unavailable(env, corsOrigin);
  if (notReady) {
    return notReady;
  }
  const body = await readJson(request);
  if (!body.ok) {
    return failure(400, "LICENSE_INVALID_REQUEST", "Body permintaan tidak valid.", corsOrigin);
  }
  const parsed = activationSchema.safeParse(body.value);
  if (!parsed.success) {
    return failure(400, "LICENSE_INVALID_REQUEST", "Permintaan aktivasi tidak valid.", corsOrigin);
  }

  const serialHash = await hashSerial(parsed.data.serial, env.ACTIVATION_CODE_PEPPER);
  const row = await findLicense(env, `serial_hash=eq.${serialHash}`);
  if (!row) {
    return failure(404, "LICENSE_SERIAL_INVALID", "Serial tidak dikenal.", corsOrigin);
  }

  const now = new Date();
  if (row.status === "revoked" || row.status === "cancelled") {
    return failure(403, "LICENSE_REVOKED", "Lisensi dicabut.", corsOrigin);
  }
  if (row.status === "expired") {
    return failure(403, "LICENSE_EXPIRED", "Lisensi sudah kedaluwarsa.", corsOrigin);
  }
  if (Date.parse(row.starts_at) > now.getTime()) {
    return failure(403, "LICENSE_NOT_STARTED", "Lisensi belum memasuki masa berlaku.", corsOrigin);
  }
  if (row.expires_at && Date.parse(row.expires_at) < now.getTime()) {
    return failure(403, "LICENSE_EXPIRED", "Lisensi sudah kedaluwarsa.", corsOrigin);
  }
  if (row.machine_id && row.machine_id !== parsed.data.machineId) {
    return failure(409, "LICENSE_ACTIVATION_CONFLICT", "Serial sudah terikat ke perangkat lain.", corsOrigin);
  }

  const expiresAt = expiryFor(row, env, now);
  const nowIso = now.toISOString();
  await rest(env, `/licenses?id=eq.${row.id}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: {
      machine_id: parsed.data.machineId,
      status: "active",
      activated_at: row.activated_at ?? nowIso,
      key_id: keyId(env),
      license_type: row.license_type ?? "subscription",
      product_id: row.product_id ?? env.LICENSE_PRODUCT_ID?.trim() ?? "ifp-learning",
      expires_at: expiresAt
    }
  });

  const license = await issue(row, parsed.data.machineId, env, now, expiresAt);
  await audit(env, row.id, "activated", parsed.data.machineId);
  return json(200, license, corsOrigin);
}

export async function handleRefresh(
  request: Request,
  env: LicenseEnv,
  corsOrigin: string
): Promise<Response> {
  const notReady = unavailable(env, corsOrigin);
  if (notReady) {
    return notReady;
  }
  const body = await readJson(request);
  if (!body.ok) {
    return failure(400, "LICENSE_INVALID_REQUEST", "Body permintaan tidak valid.", corsOrigin);
  }
  const parsed = lookupSchema.safeParse(body.value);
  if (!parsed.success) {
    return failure(400, "LICENSE_INVALID_REQUEST", "Permintaan refresh tidak valid.", corsOrigin);
  }

  const row = await findLicense(env, `id=eq.${parsed.data.licenseId}`);
  if (!row) {
    return failure(404, "LICENSE_NOT_FOUND", "Lisensi tidak ditemukan.", corsOrigin);
  }
  if (row.status === "revoked" || row.status === "cancelled") {
    return failure(403, "LICENSE_REVOKED", "Lisensi dicabut.", corsOrigin);
  }
  if (row.machine_id !== parsed.data.machineId) {
    return failure(409, "LICENSE_DEVICE_MISMATCH", "Lisensi tidak terikat ke perangkat ini.", corsOrigin);
  }

  const now = new Date();
  const expiresAt = expiryFor(row, env, now);
  if (row.license_type !== "perpetual" && row.expires_at !== expiresAt) {
    await rest(env, `/licenses?id=eq.${row.id}`, {
      method: "PATCH",
      prefer: "return=minimal",
      body: { expires_at: expiresAt }
    });
  }

  const license = await issue(row, parsed.data.machineId, env, now, expiresAt);
  await audit(env, row.id, "refreshed", parsed.data.machineId);
  return json(200, license, corsOrigin);
}

export async function handleVerify(
  request: Request,
  env: LicenseEnv,
  corsOrigin: string
): Promise<Response> {
  const body = await readJson(request);
  if (!body.ok) {
    return failure(400, "LICENSE_INVALID_REQUEST", "Body permintaan tidak valid.", corsOrigin);
  }
  const parsed = licenseFileSchema.safeParse(body.value);
  if (!parsed.success) {
    return failure(400, "LICENSE_INVALID_REQUEST", "File lisensi tidak valid.", corsOrigin);
  }
  const publicKey = env.LICENSE_PUBLIC_KEY?.trim();
  if (!publicKey) {
    return failure(503, "LICENSE_VERIFY_UNAVAILABLE", "Public key lisensi belum dikonfigurasi.", corsOrigin);
  }

  const payload = parsed.data.payload as unknown as LicensePayload;
  if (payload.schemaVersion !== "1.0.0") {
    return json(200, { valid: false }, corsOrigin);
  }
  let valid = false;
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      toArrayBuffer(base64ToBytes(publicKey)),
      { name: "Ed25519" } as AlgorithmIdentifier,
      false,
      ["verify"]
    );
    valid = await crypto.subtle.verify(
      { name: "Ed25519" } as AlgorithmIdentifier,
      key,
      toArrayBuffer(base64ToBytes(parsed.data.signature)),
      toArrayBuffer(encoder.encode(canonicalJson(payload)))
    );
  } catch {
    valid = false;
  }
  if (!valid) {
    return json(200, { valid }, corsOrigin);
  }

  const row = await findLicense(env, `id=eq.${payload.licenseId}`);
  const now = Date.now();
  valid = Boolean(
    row &&
      row.status !== "revoked" &&
      row.status !== "cancelled" &&
      row.machine_id === payload.machineId &&
      (!payload.expiresAt || Date.parse(payload.expiresAt) >= now)
  );
  return json(200, { valid }, corsOrigin);
}

