import { createHash, timingSafeEqual } from "node:crypto";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { z } from "zod";
import {
  enrollmentCodeMatches,
  isDeviceId,
  newDeviceId,
  signDeviceToken,
  verifyDeviceToken
} from "./auth";
import { LicenseService, type LicenseFile } from "./license";
import type { SyncStore } from "./store";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

const eventSchema = z.strictObject({
  eventId: z.string().regex(UUID_PATTERN, "eventId harus UUID"),
  eventType: z.literal("assessment.completed"),
  createdAt: z.string().regex(TIMESTAMP_PATTERN, "createdAt harus ISO-8601 UTC"),
  payload: z.record(z.string(), z.unknown())
});

const batchSchema = z.strictObject({
  deviceId: z.string().regex(UUID_PATTERN, "deviceId harus UUID"),
  schemaVersion: z.literal("1.0.0"),
  events: z.array(eventSchema).min(1).max(100)
});

const activationSchema = z.strictObject({
  schemaVersion: z.literal("1.0.0"),
  productId: z.string().min(1).max(64),
  machineId: z.string().regex(UUID_PATTERN, "machineId harus UUID"),
  serial: z.string().min(4).max(128),
  requestId: z.string().regex(UUID_PATTERN),
  nonce: z.string().regex(UUID_PATTERN),
  createdAt: z.string().regex(TIMESTAMP_PATTERN)
});

const refreshSchema = z.strictObject({
  licenseId: z.string().regex(UUID_PATTERN),
  machineId: z.string().regex(UUID_PATTERN)
});

const transferSchema = z.strictObject({
  licenseId: z.string().regex(UUID_PATTERN),
  machineId: z.string().regex(UUID_PATTERN)
});

const deactivateSchema = z.strictObject({
  licenseId: z.string().regex(UUID_PATTERN)
});

const licenseFileSchema = z.object({
  payload: z.record(z.string(), z.unknown()),
  signature: z.string().min(1)
});

const enrollSchema = z.strictObject({
  enrollmentCode: z.string().min(1).max(256),
  deviceId: z.string().regex(UUID_PATTERN).optional()
});

export interface SyncAppOptions {
  store: SyncStore;
  token: string;
  maxBodyBytes?: number;
  maxEventBytes?: number;
  rateLimit?: { limit: number; windowMs: number };
  corsOrigin?: string;
  license?: { service: LicenseService; adminToken: string };
  deviceAuth?: { enrollmentCode: string; tokenSecret: string; ttlSeconds?: number };
}

interface Acknowledgement {
  eventId: string;
  status: "accepted" | "duplicate" | "rejected";
  errorCode: string | null;
}

class RateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number
  ) {}

  allow(key: string, now: number): boolean {
    const recent = (this.hits.get(key) ?? []).filter((timestamp) => now - timestamp < this.windowMs);
    if (recent.length >= this.limit) {
      this.hits.set(key, recent);
      return false;
    }
    recent.push(now);
    this.hits.set(key, recent);
    return true;
  }
}

function tokenMatches(provided: string, expected: string): boolean {
  const providedHash = createHash("sha256").update(provided).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(providedHash, expectedHash);
}

function send(response: ServerResponse, status: number, body: unknown): void {
  const json = JSON.stringify(body);
  response.writeHead(status, {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(json)
  });
  response.end(json);
}

async function readBody(
  request: IncomingMessage,
  limit: number
): Promise<{ ok: true; value: string } | { ok: false }> {
  let size = 0;
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > limit) {
      return { ok: false };
    }
    chunks.push(buffer);
  }

  return { ok: true, value: Buffer.concat(chunks).toString("utf8") };
}

interface RouteResult {
  status: number;
  body: unknown;
}

function errorResult(status: number, code: string, message: string): RouteResult {
  return { status, body: { error: { code, message } } };
}

function handleLicense(
  service: LicenseService,
  adminToken: string,
  path: string,
  rawBody: unknown,
  authorization: string,
  now: Date
): RouteResult {
  if (path === "/v1/activations") {
    const parsed = activationSchema.safeParse(rawBody);
    if (!parsed.success) {
      return errorResult(400, "LICENSE_INVALID_REQUEST", "Permintaan aktivasi tidak valid.");
    }
    const result = service.activate(parsed.data.serial, parsed.data.machineId, now);
    return result.ok
      ? { status: 200, body: result.license }
      : errorResult(result.status, result.code, result.message);
  }

  if (path === "/v1/licenses/refresh") {
    const parsed = refreshSchema.safeParse(rawBody);
    if (!parsed.success) {
      return errorResult(400, "LICENSE_INVALID_REQUEST", "Permintaan refresh tidak valid.");
    }
    const result = service.refresh(parsed.data.licenseId, parsed.data.machineId, now);
    return result.ok
      ? { status: 200, body: result.license }
      : errorResult(result.status, result.code, result.message);
  }

  if (path === "/v1/licenses/verify") {
    const parsed = licenseFileSchema.safeParse(rawBody);
    if (!parsed.success) {
      return errorResult(400, "LICENSE_INVALID_REQUEST", "File lisensi tidak valid.");
    }
    const valid = service.verify(parsed.data as unknown as LicenseFile, now);
    return { status: 200, body: { valid } };
  }

  const adminAuthorized =
    authorization.startsWith("Bearer ") && tokenMatches(authorization.slice(7), adminToken);

  if (path === "/v1/licenses/transfer" || path === "/v1/activations/deactivate") {
    if (!adminAuthorized) {
      return errorResult(401, "LICENSE_UNAUTHORIZED_ADMIN", "Otorisasi admin diperlukan.");
    }

    if (path === "/v1/licenses/transfer") {
      const parsed = transferSchema.safeParse(rawBody);
      if (!parsed.success) {
        return errorResult(400, "LICENSE_INVALID_REQUEST", "Permintaan transfer tidak valid.");
      }
      const record = service.transfer(parsed.data.licenseId, parsed.data.machineId, now);
      return record
        ? { status: 200, body: { licenseId: record.licenseId, machineId: record.machineId } }
        : errorResult(404, "LICENSE_NOT_FOUND", "Lisensi tidak ditemukan.");
    }

    const parsed = deactivateSchema.safeParse(rawBody);
    if (!parsed.success) {
      return errorResult(400, "LICENSE_INVALID_REQUEST", "Permintaan deaktivasi tidak valid.");
    }
    const record = service.deactivate(parsed.data.licenseId, now);
    return record
      ? { status: 200, body: { licenseId: record.licenseId, machineId: record.machineId } }
      : errorResult(404, "LICENSE_NOT_FOUND", "Lisensi tidak ditemukan.");
  }

  return errorResult(404, "NOT_FOUND", "Endpoint tidak ditemukan.");
}

export function createSyncServer(options: SyncAppOptions): Server {
  const maxBodyBytes = options.maxBodyBytes ?? 1_048_576;
  const maxEventBytes = options.maxEventBytes ?? 262_144;
  const corsOrigin = options.corsOrigin ?? "*";
  const limiter = options.rateLimit ? new RateLimiter(options.rateLimit.limit, options.rateLimit.windowMs) : null;

  return createServer(async (request, response) => {
    response.setHeader("access-control-allow-origin", corsOrigin);
    response.setHeader("access-control-allow-headers", "authorization,content-type");
    response.setHeader("access-control-allow-methods", "GET,POST,OPTIONS");

    if (request.method === "OPTIONS") {
      response.writeHead(204);
      response.end();
      return;
    }

    try {
      if (request.method === "GET" && (request.url === "/health" || request.url === "/healthz")) {
        send(response, 200, { ok: true });
        return;
      }

      if (request.method === "POST" && request.url === "/v1/devices/enroll") {
        if (limiter && !limiter.allow(request.socket.remoteAddress ?? "unknown", Date.now())) {
          response.setHeader("retry-after", "60");
          send(response, 429, { error: { code: "SYNC_RATE_LIMITED" } });
          return;
        }
        if (!options.deviceAuth) {
          send(response, 503, {
            error: {
              code: "DEVICE_AUTH_UNAVAILABLE",
              message: "Enrollment perangkat belum dikonfigurasi."
            }
          });
          return;
        }

        const enrollBody = await readBody(request, maxBodyBytes);
        if (!enrollBody.ok) {
          request.resume();
          send(response, 413, { error: { code: "DEVICE_BODY_TOO_LARGE" } });
          return;
        }

        let enrollJson: unknown;
        try {
          enrollJson = JSON.parse(enrollBody.value);
        } catch {
          send(response, 400, { error: { code: "DEVICE_INVALID_BODY" } });
          return;
        }

        const parsedEnroll = enrollSchema.safeParse(enrollJson);
        if (!parsedEnroll.success) {
          send(response, 400, { error: { code: "DEVICE_INVALID_REQUEST" } });
          return;
        }
        if (
          !enrollmentCodeMatches(
            parsedEnroll.data.enrollmentCode,
            options.deviceAuth.enrollmentCode
          )
        ) {
          send(response, 401, { error: { code: "DEVICE_ENROLLMENT_INVALID" } });
          return;
        }

        const deviceId = parsedEnroll.data.deviceId ?? newDeviceId();
        const issued = signDeviceToken({
          deviceId,
          secret: options.deviceAuth.tokenSecret,
          ttlSeconds: options.deviceAuth.ttlSeconds
        });
        send(response, 201, {
          deviceId: issued.deviceId,
          token: issued.token,
          tokenType: "Bearer",
          expiresAt: issued.expiresAt
        });
        return;
      }

      if (request.url?.startsWith("/v1/activations") || request.url?.startsWith("/v1/licenses")) {
        if (request.method !== "POST") {
          send(response, 404, { error: { code: "NOT_FOUND" } });
          return;
        }
        if (limiter && !limiter.allow(request.socket.remoteAddress ?? "unknown", Date.now())) {
          response.setHeader("retry-after", "60");
          send(response, 429, { error: { code: "SYNC_RATE_LIMITED" } });
          return;
        }
        if (!options.license) {
          send(response, 503, {
            error: { code: "LICENSE_SERVICE_UNAVAILABLE", message: "Layanan lisensi belum dikonfigurasi." }
          });
          return;
        }

        const licenseBody = await readBody(request, maxBodyBytes);
        if (!licenseBody.ok) {
          request.resume();
          send(response, 413, { error: { code: "LICENSE_BODY_TOO_LARGE" } });
          return;
        }

        let licenseJson: unknown;
        try {
          licenseJson = JSON.parse(licenseBody.value);
        } catch {
          send(response, 400, { error: { code: "LICENSE_INVALID_BODY" } });
          return;
        }

        const result = handleLicense(
          options.license.service,
          options.license.adminToken,
          request.url,
          licenseJson,
          request.headers.authorization ?? "",
          new Date()
        );
        send(response, result.status, result.body);
        return;
      }

      if (request.method !== "POST" || request.url !== "/v1/sync/events") {
        send(response, 404, { error: { code: "NOT_FOUND" } });
        return;
      }

      if (limiter && !limiter.allow(request.socket.remoteAddress ?? "unknown", Date.now())) {
        response.setHeader("retry-after", "60");
        send(response, 429, { error: { code: "SYNC_RATE_LIMITED" } });
        return;
      }

      const authorization = request.headers.authorization ?? "";
      const bearer = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
      const legacyTokenValid = Boolean(bearer) && tokenMatches(bearer, options.token);
      const devicePayload =
        bearer && options.deviceAuth
          ? verifyDeviceToken(bearer, options.deviceAuth.tokenSecret)
          : null;
      if (!legacyTokenValid && !devicePayload) {
        send(response, 401, { error: { code: "SYNC_UNAUTHORIZED" } });
        return;
      }
      const tokenDeviceId = devicePayload?.deviceId ?? null;

      const body = await readBody(request, maxBodyBytes);
      if (!body.ok) {
        request.resume();
        send(response, 413, { error: { code: "SYNC_BATCH_TOO_LARGE" } });
        return;
      }

      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(body.value);
      } catch {
        send(response, 400, { error: { code: "SYNC_INVALID_BODY" } });
        return;
      }

      const parsed = batchSchema.safeParse(parsedJson);
      if (!parsed.success) {
        send(response, 400, {
          error: { code: "SYNC_INVALID_BATCH" },
          issues: parsed.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message
          }))
        });
        return;
      }

      const batch = parsed.data;
      if (tokenDeviceId && batch.deviceId !== tokenDeviceId) {
        send(response, 403, { error: { code: "DEVICE_MISMATCH" } });
        return;
      }
      for (const event of batch.events) {
        if (Buffer.byteLength(JSON.stringify(event.payload)) > maxEventBytes) {
          send(response, 400, {
            error: { code: "SYNC_INVALID_EVENT" },
            issues: [{ path: "events.payload", message: "payload terlalu besar" }]
          });
          return;
        }
      }

      const acknowledgements: Acknowledgement[] = batch.events.map((event) => {
        const outcome = options.store.record(batch.deviceId, {
          eventId: event.eventId,
          eventType: event.eventType,
          payload: event.payload
        });

        if (outcome === "conflict") {
          return { eventId: event.eventId, status: "rejected", errorCode: "SYNC_EVENT_REJECTED" };
        }
        return { eventId: event.eventId, status: outcome, errorCode: null };
      });

      send(response, 200, { acknowledgements });
    } catch (error) {
      console.error("sync server error", error);
      send(response, 500, { error: { code: "SYNC_INTERNAL_ERROR" } });
    }
  });
}
