import { invoke } from "@tauri-apps/api/core";
import { canPersistLocally } from "./learningRepository";

export interface OutboxEvent {
  outboxId: string;
  eventId: string;
  eventType: string;
  payloadJson: string;
  createdAt: string;
  attempts: number;
  nextAttemptAt: string | null;
}

export interface SyncStatus {
  pending: number;
  failed: number;
  acknowledged: number;
  nextAttemptAt: string | null;
}

export type AckStatus = "accepted" | "duplicate" | "rejected";

export interface SyncAck {
  eventId: string;
  status: AckStatus;
  errorCode?: string | null;
}

export interface SyncBatchRequest {
  deviceId: string;
  schemaVersion: string;
  events: Array<{
    eventId: string;
    eventType: string;
    createdAt: string;
    payload: unknown;
  }>;
}

export interface SyncBatchResponse {
  acknowledgements: SyncAck[];
}

export type SyncRunStatus = "synced" | "partial" | "empty" | "not-configured" | "unavailable" | "error";

export interface SyncRunResult {
  status: SyncRunStatus;
  acknowledged: number;
  retried: number;
  message: string;
}

const SYNC_SCHEMA_VERSION = "1.0.0";
const MAX_BACKOFF_MS = 60 * 60 * 1000;

export const syncConfig = {
  baseUrl: (import.meta.env.VITE_SYNC_BASE_URL ?? "").trim(),
  token: (import.meta.env.VITE_SYNC_TOKEN ?? "").trim(),
  batchSize: 20,
  maxAttempts: 5,
  baseDelayMs: 30_000
};

export function isSyncConfigured(): boolean {
  return syncConfig.baseUrl.length > 0 && syncConfig.token.length > 0;
}

export function computeBackoffMs(attempt: number, baseDelayMs: number, random: () => number): number {
  const exponential = baseDelayMs * 2 ** Math.max(0, attempt - 1);
  const capped = Math.min(exponential, MAX_BACKOFF_MS);
  return Math.round(capped * (0.8 + random() * 0.4));
}

export interface SyncDeps {
  getDeviceId(): Promise<string>;
  listPending(limit: number, maxAttempts: number): Promise<OutboxEvent[]>;
  markRetry(input: {
    outboxId: string;
    errorCode: string;
    nextAttemptAt: string;
    maxAttempts: number;
  }): Promise<void>;
  markAcknowledged(input: { outboxId: string; acknowledgedAt: string }): Promise<void>;
  sendBatch(request: SyncBatchRequest, baseUrl: string, token: string): Promise<SyncBatchResponse>;
  now(): Date;
  random(): number;
}

export interface SyncOptions {
  batchSize: number;
  maxAttempts: number;
  baseDelayMs: number;
  baseUrl: string;
  token: string;
}

function parsePayload(event: OutboxEvent): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(event.payloadJson) as unknown };
  } catch {
    return { ok: false };
  }
}

async function scheduleRetry(
  deps: SyncDeps,
  event: OutboxEvent,
  errorCode: string,
  options: SyncOptions
): Promise<void> {
  const delay = computeBackoffMs(event.attempts + 1, options.baseDelayMs, deps.random);
  const nextAttemptAt = new Date(deps.now().getTime() + delay).toISOString();
  await deps.markRetry({
    outboxId: event.outboxId,
    errorCode,
    nextAttemptAt,
    maxAttempts: options.maxAttempts
  });
}

export async function executeSync(deps: SyncDeps, options: SyncOptions): Promise<SyncRunResult> {
  const events = await deps.listPending(options.batchSize, options.maxAttempts);
  if (events.length === 0) {
    return {
      status: "empty",
      acknowledged: 0,
      retried: 0,
      message: "Tidak ada event yang menunggu sinkronisasi."
    };
  }

  const deviceId = await deps.getDeviceId();
  const sendable: OutboxEvent[] = [];
  const batchEvents: SyncBatchRequest["events"] = [];
  let retried = 0;

  for (const event of events) {
    const payload = parsePayload(event);
    if (!payload.ok) {
      await scheduleRetry(deps, event, "SYNC_INVALID_PAYLOAD", options);
      retried += 1;
      continue;
    }
    sendable.push(event);
    batchEvents.push({
      eventId: event.eventId,
      eventType: event.eventType,
      createdAt: event.createdAt,
      payload: payload.value
    });
  }

  if (sendable.length === 0) {
    return {
      status: "error",
      acknowledged: 0,
      retried,
      message: "Payload event tidak valid; event dijadwalkan ulang."
    };
  }

  let response: SyncBatchResponse;
  try {
    response = await deps.sendBatch(
      { deviceId, schemaVersion: SYNC_SCHEMA_VERSION, events: batchEvents },
      options.baseUrl,
      options.token
    );
  } catch (error) {
    for (const event of sendable) {
      await scheduleRetry(deps, event, "SYNC_NETWORK_UNAVAILABLE", options);
    }
    return {
      status: "error",
      acknowledged: 0,
      retried: retried + sendable.length,
      message: error instanceof Error ? error.message : "Jaringan tidak tersedia."
    };
  }

  const acknowledgements = new Map(response.acknowledgements.map((ack) => [ack.eventId, ack]));
  let acknowledged = 0;

  for (const event of sendable) {
    const ack = acknowledgements.get(event.eventId);
    if (ack && (ack.status === "accepted" || ack.status === "duplicate")) {
      await deps.markAcknowledged({
        outboxId: event.outboxId,
        acknowledgedAt: deps.now().toISOString()
      });
      acknowledged += 1;
    } else {
      await scheduleRetry(deps, event, ack?.errorCode ?? "SYNC_MISSING_ACK", options);
      retried += 1;
    }
  }

  const status: SyncRunStatus = retried === 0 ? "synced" : acknowledged > 0 ? "partial" : "error";
  return {
    status,
    acknowledged,
    retried,
    message:
      status === "synced"
        ? `${acknowledged} event tersinkronisasi.`
        : `${acknowledged} tersinkronisasi, ${retried} dijadwalkan ulang.`
  };
}

const tauriDeps: SyncDeps = {
  getDeviceId: () => invoke<string>("sync_get_device_id"),
  listPending: (limit, maxAttempts) =>
    invoke<OutboxEvent[]>("sync_list_pending", { limit, maxAttempts }),
  markRetry: async (input) => {
    await invoke("sync_mark_retry", { input });
  },
  markAcknowledged: async (input) => {
    await invoke("sync_mark_acknowledged", { input });
  },
  sendBatch: async (request, baseUrl, token) => {
    const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/v1/sync/events`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`
      },
      body: JSON.stringify(request)
    });
    if (!response.ok) {
      throw new Error(`Server sinkronisasi menolak permintaan (HTTP ${response.status}).`);
    }
    return (await response.json()) as SyncBatchResponse;
  },
  now: () => new Date(),
  random: () => Math.random()
};

export async function runSyncOnce(): Promise<SyncRunResult> {
  if (!canPersistLocally()) {
    return {
      status: "unavailable",
      acknowledged: 0,
      retried: 0,
      message: "Sinkronisasi hanya tersedia di aplikasi desktop."
    };
  }
  if (!isSyncConfigured()) {
    return {
      status: "not-configured",
      acknowledged: 0,
      retried: 0,
      message: "Backend sinkronisasi belum dikonfigurasi."
    };
  }

  try {
    return await executeSync(tauriDeps, syncConfig);
  } catch (error) {
    return {
      status: "error",
      acknowledged: 0,
      retried: 0,
      message: error instanceof Error ? error.message : "Sinkronisasi gagal."
    };
  }
}

export async function getSyncStatus(): Promise<SyncStatus> {
  return invoke<SyncStatus>("sync_get_status");
}
