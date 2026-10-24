import { z } from "zod";
import { hashEnrollmentCode, signDeviceToken, verifyDeviceToken } from "./auth";
import { rest, rpc, SupabaseError, type SupabaseEnv } from "./supabase";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const enrollSchema = z.strictObject({
  enrollmentCode: z.string().min(1).max(256),
  deviceId: z.string().regex(UUID).optional()
});

const eventSchema = z.strictObject({
  eventId: z.string().regex(UUID),
  eventType: z.literal("assessment.completed"),
  createdAt: z.string().min(10).max(40),
  payload: z.record(z.string(), z.unknown())
});

const batchSchema = z.strictObject({
  deviceId: z.string().regex(UUID),
  schemaVersion: z.literal("1.0.0"),
  events: z.array(eventSchema).min(1).max(100)
});

export interface Env extends SupabaseEnv {
  DEVICE_TOKEN_SECRET: string;
  ENROLLMENT_CODE_PEPPER: string;
  CORS_ORIGIN?: string;
}

const MAX_BODY_BYTES = 1_048_576;
const MAX_EVENT_BYTES = 262_144;

function json(status: number, body: unknown, corsOrigin: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": corsOrigin
    }
  });
}

function failure(status: number, code: string, message: string, corsOrigin: string): Response {
  return json(status, { error: { code, message } }, corsOrigin);
}

async function readJson(request: Request): Promise<{ ok: true; value: unknown } | { ok: false }> {
  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) {
    return { ok: false };
  }
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false };
  }
}

function bearerToken(request: Request): string {
  const authorization = request.headers.get("authorization") ?? "";
  return authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
}

async function handleEnroll(request: Request, env: Env, corsOrigin: string): Promise<Response> {
  const body = await readJson(request);
  if (!body.ok) {
    return failure(400, "DEVICE_INVALID_BODY", "Body permintaan tidak valid.", corsOrigin);
  }
  const parsed = enrollSchema.safeParse(body.value);
  if (!parsed.success) {
    return failure(400, "DEVICE_INVALID_REQUEST", "Permintaan enrollment tidak valid.", corsOrigin);
  }

  const codeHash = await hashEnrollmentCode(parsed.data.enrollmentCode, env.ENROLLMENT_CODE_PEPPER);
  const consumed = await rpc(env, "consume_enrollment_code", { p_code_hash: codeHash });
  const row = Array.isArray(consumed) ? consumed[0] : consumed;
  const allowed = Boolean(row && typeof row === "object" && (row as { allowed?: unknown }).allowed === true);
  if (!allowed) {
    return failure(401, "DEVICE_ENROLLMENT_INVALID", "Kode enrollment tidak valid.", corsOrigin);
  }

  const deviceId = parsed.data.deviceId ?? crypto.randomUUID();
  await rest(env, "/devices?on_conflict=id", {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=minimal",
    body: { id: deviceId, label: null, status: "active" }
  });

  const issued = await signDeviceToken({
    deviceId,
    secret: env.DEVICE_TOKEN_SECRET
  });
  return json(
    201,
    {
      deviceId,
      token: issued.token,
      tokenType: "Bearer",
      expiresAt: issued.expiresAt
    },
    corsOrigin
  );
}

async function handleSync(request: Request, env: Env, corsOrigin: string): Promise<Response> {
  const token = bearerToken(request);
  const payload = token ? await verifyDeviceToken(token, env.DEVICE_TOKEN_SECRET) : null;
  if (!payload) {
    return failure(401, "SYNC_UNAUTHORIZED", "Token perangkat tidak valid.", corsOrigin);
  }

  const body = await readJson(request);
  if (!body.ok) {
    return failure(400, "SYNC_INVALID_BODY", "Body permintaan tidak valid.", corsOrigin);
  }
  const parsed = batchSchema.safeParse(body.value);
  if (!parsed.success) {
    return failure(400, "SYNC_INVALID_BATCH", "Batch tidak valid.", corsOrigin);
  }
  if (parsed.data.deviceId !== payload.deviceId) {
    return failure(403, "DEVICE_MISMATCH", "deviceId tidak cocok dengan token.", corsOrigin);
  }

  for (const event of parsed.data.events) {
    if (new TextEncoder().encode(JSON.stringify(event.payload)).length > MAX_EVENT_BYTES) {
      return failure(400, "SYNC_INVALID_EVENT", "Payload event terlalu besar.", corsOrigin);
    }
  }

  const acknowledgements: Array<{
    eventId: string;
    status: "accepted" | "duplicate";
    errorCode: null;
  }> = [];

  for (const event of parsed.data.events) {
    const inserted = await rest(env, "/sync_events?on_conflict=device_id,event_id", {
      method: "POST",
      prefer: "resolution=ignore-duplicates,return=representation",
      body: {
        device_id: payload.deviceId,
        event_id: event.eventId,
        event_type: event.eventType,
        payload: event.payload
      }
    });
    const status = Array.isArray(inserted) && inserted.length > 0 ? "accepted" : "duplicate";
    acknowledgements.push({ eventId: event.eventId, status, errorCode: null });
  }

  await rest(env, `/devices?id=eq.${payload.deviceId}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: { last_seen_at: new Date().toISOString() }
  }).catch(() => undefined);

  return json(200, { acknowledgements }, corsOrigin);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsOrigin = env.CORS_ORIGIN ?? "*";

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": corsOrigin,
          "access-control-allow-headers": "authorization,content-type",
          "access-control-allow-methods": "GET,POST,OPTIONS"
        }
      });
    }

    const url = new URL(request.url);

    try {
      if (request.method === "GET" && (url.pathname === "/healthz" || url.pathname === "/health")) {
        return json(200, { ok: true }, corsOrigin);
      }

      if (request.method === "POST" && url.pathname === "/v1/devices/enroll") {
        return await handleEnroll(request, env, corsOrigin);
      }

      if (request.method === "POST" && url.pathname === "/v1/sync/events") {
        return await handleSync(request, env, corsOrigin);
      }

      if (url.pathname.startsWith("/v1/activations") || url.pathname.startsWith("/v1/licenses")) {
        return failure(
          501,
          "LICENSE_ENDPOINT_NOT_IMPLEMENTED",
          "Endpoint lisensi di Worker belum diaktifkan; gunakan server referensi sampai increment berikutnya.",
          corsOrigin
        );
      }

      return failure(404, "NOT_FOUND", "Endpoint tidak ditemukan.", corsOrigin);
    } catch (error) {
      if (error instanceof SupabaseError) {
        console.error("supabase error", error.status, error.message);
        return failure(502, "BACKEND_UNAVAILABLE", "Backend data tidak tersedia.", corsOrigin);
      }
      console.error("worker error", error);
      return failure(500, "INTERNAL_ERROR", "Kesalahan internal.", corsOrigin);
    }
  }
};
