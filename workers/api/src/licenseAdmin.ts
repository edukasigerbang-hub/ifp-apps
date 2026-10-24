import { z } from "zod";
import { failure, json, readJson } from "./http";
import { rest, type SupabaseEnv } from "./supabase";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const encoder = new TextEncoder();

export interface AdminEnv extends SupabaseEnv {
  ADMIN_API_TOKEN?: string;
}

const transferSchema = z.strictObject({
  licenseId: z.string().regex(UUID),
  machineId: z.string().regex(UUID)
});

const deactivateSchema = z.strictObject({
  licenseId: z.string().regex(UUID)
});

interface LicenseRow {
  id: string;
  status: string;
  machine_id: string | null;
  expires_at: string | null;
}

function bearer(request: Request): string {
  const authorization = request.headers.get("authorization") ?? "";
  return authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
}

async function digest(value: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

interface AuthFailure {
  status: 401 | 503;
  code: string;
  message: string;
}

async function authorize(request: Request, env: AdminEnv): Promise<AuthFailure | null> {
  const expected = env.ADMIN_API_TOKEN?.trim();
  if (!expected) {
    return {
      status: 503,
      code: "LICENSE_ADMIN_UNAVAILABLE",
      message: "Admin API belum dikonfigurasi."
    };
  }
  const token = bearer(request);
  const [actualHash, expectedHash] = await Promise.all([digest(token), digest(expected)]);
  let difference = 0;
  for (let index = 0; index < expectedHash.length; index += 1) {
    difference |= actualHash[index] ^ expectedHash[index];
  }
  if (token.length === 0 || difference !== 0) {
    return {
      status: 401,
      code: "LICENSE_UNAUTHORIZED_ADMIN",
      message: "Otorisasi admin diperlukan."
    };
  }
  return null;
}

async function findLicense(env: AdminEnv, licenseId: string): Promise<LicenseRow | null> {
  const rows = await rest(
    env,
    `/licenses?select=id,status,machine_id,expires_at&id=eq.${licenseId}&limit=1`
  );
  return Array.isArray(rows) ? ((rows[0] as LicenseRow | undefined) ?? null) : null;
}

async function audit(
  env: AdminEnv,
  licenseId: string,
  action: string,
  machineId: string | null
): Promise<void> {
  await rest(env, "/license_audit", {
    method: "POST",
    prefer: "return=minimal",
    body: { license_id: licenseId, action, machine_id: machineId, actor: "license-admin" }
  }).catch(() => undefined);
}

function blocked(row: LicenseRow, now: number, corsOrigin: string): Response | null {
  if (row.status === "revoked" || row.status === "cancelled") {
    return failure(403, "LICENSE_REVOKED", "Lisensi dicabut.", corsOrigin);
  }
  if (row.status === "expired") {
    return failure(403, "LICENSE_EXPIRED", "Lisensi sudah kedaluwarsa.", corsOrigin);
  }
  if (row.expires_at && Date.parse(row.expires_at) < now) {
    return failure(403, "LICENSE_EXPIRED", "Lisensi sudah kedaluwarsa.", corsOrigin);
  }
  return null;
}

export async function handleTransfer(
  request: Request,
  env: AdminEnv,
  corsOrigin: string
): Promise<Response> {
  const denied = await authorize(request, env);
  if (denied) {
    return failure(denied.status, denied.code, denied.message, corsOrigin);
  }
  const body = await readJson(request);
  if (!body.ok) {
    return failure(400, "LICENSE_INVALID_REQUEST", "Body permintaan tidak valid.", corsOrigin);
  }
  const parsed = transferSchema.safeParse(body.value);
  if (!parsed.success) {
    return failure(400, "LICENSE_INVALID_REQUEST", "Permintaan transfer tidak valid.", corsOrigin);
  }

  const row = await findLicense(env, parsed.data.licenseId);
  if (!row) {
    return failure(404, "LICENSE_NOT_FOUND", "Lisensi tidak ditemukan.", corsOrigin);
  }
  const expired = blocked(row, Date.now(), corsOrigin);
  if (expired) {
    return expired;
  }

  if (row.machine_id === parsed.data.machineId) {
    return json(
      200,
      { licenseId: row.id, machineId: row.machine_id, status: row.status, changed: false },
      corsOrigin
    );
  }

  await rest(env, `/licenses?id=eq.${row.id}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: {
      machine_id: parsed.data.machineId,
      status: "active",
      activated_at: new Date().toISOString()
    }
  });
  await audit(env, row.id, "transferred", parsed.data.machineId);
  return json(
    200,
    { licenseId: row.id, machineId: parsed.data.machineId, status: "active", changed: true },
    corsOrigin
  );
}

export async function handleDeactivate(
  request: Request,
  env: AdminEnv,
  corsOrigin: string
): Promise<Response> {
  const denied = await authorize(request, env);
  if (denied) {
    return failure(denied.status, denied.code, denied.message, corsOrigin);
  }
  const body = await readJson(request);
  if (!body.ok) {
    return failure(400, "LICENSE_INVALID_REQUEST", "Body permintaan tidak valid.", corsOrigin);
  }
  const parsed = deactivateSchema.safeParse(body.value);
  if (!parsed.success) {
    return failure(400, "LICENSE_INVALID_REQUEST", "Permintaan deaktivasi tidak valid.", corsOrigin);
  }

  const row = await findLicense(env, parsed.data.licenseId);
  if (!row) {
    return failure(404, "LICENSE_NOT_FOUND", "Lisensi tidak ditemukan.", corsOrigin);
  }
  if (!row.machine_id) {
    return json(200, { licenseId: row.id, machineId: null, status: row.status, changed: false }, corsOrigin);
  }

  await rest(env, `/licenses?id=eq.${row.id}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: { machine_id: null, activated_at: null }
  });
  await audit(env, row.id, "deactivated", null);
  return json(200, { licenseId: row.id, machineId: null, status: row.status, changed: true }, corsOrigin);
}
