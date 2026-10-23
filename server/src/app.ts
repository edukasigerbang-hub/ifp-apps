import { createHash, timingSafeEqual } from "node:crypto";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { z } from "zod";
import type { SyncStore } from "./store";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

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

export interface SyncAppOptions {
  store: SyncStore;
  token: string;
  maxBodyBytes?: number;
  maxEventBytes?: number;
  rateLimit?: { limit: number; windowMs: number };
  corsOrigin?: string;
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
      if (request.method === "GET" && request.url === "/health") {
        send(response, 200, { ok: true });
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
      if (!authorization.startsWith("Bearer ") || !tokenMatches(authorization.slice(7), options.token)) {
        send(response, 401, { error: { code: "SYNC_UNAUTHORIZED" } });
        return;
      }

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
