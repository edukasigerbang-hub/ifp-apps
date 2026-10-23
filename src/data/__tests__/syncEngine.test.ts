import { describe, expect, it } from "vitest";
import {
  computeBackoffMs,
  executeSync,
  type OutboxEvent,
  type SyncBatchRequest,
  type SyncDeps,
  type SyncOptions
} from "../syncEngine";

const options: SyncOptions = {
  batchSize: 20,
  maxAttempts: 5,
  baseDelayMs: 1000,
  baseUrl: "https://sync.test",
  token: "token"
};

function event(index: number, payloadJson = JSON.stringify({ n: index })): OutboxEvent {
  return {
    outboxId: `outbox-${index}`,
    eventId: `event-${index}`,
    eventType: "assessment.completed",
    payloadJson,
    createdAt: "2026-10-23T15:00:00.000Z",
    attempts: 0,
    nextAttemptAt: null
  };
}

function createDeps(events: OutboxEvent[], response: SyncDeps["sendBatch"]) {
  const acknowledged: string[] = [];
  const retried: Array<{ outboxId: string; errorCode: string; nextAttemptAt: string }> = [];
  const sent: SyncBatchRequest[] = [];

  const deps: SyncDeps = {
    getDeviceId: async () => "device-1",
    listPending: async () => events,
    markRetry: async (input) => {
      retried.push({ outboxId: input.outboxId, errorCode: input.errorCode, nextAttemptAt: input.nextAttemptAt });
    },
    markAcknowledged: async (input) => {
      acknowledged.push(input.outboxId);
    },
    sendBatch: async (request, baseUrl, token) => {
      sent.push(request);
      return response(request, baseUrl, token);
    },
    now: () => new Date("2026-10-23T16:00:00.000Z"),
    random: () => 0.5
  };

  return { deps, acknowledged, retried, sent };
}

describe("computeBackoffMs", () => {
  it("tumbuh eksponensial dengan jitter", () => {
    expect(computeBackoffMs(1, 1000, () => 0)).toBe(800);
    expect(computeBackoffMs(1, 1000, () => 1)).toBe(1200);
    expect(computeBackoffMs(3, 1000, () => 0.5)).toBe(4000);
  });

  it("dibatasi satu jam", () => {
    expect(computeBackoffMs(20, 30_000, () => 0.5)).toBe(3_600_000);
  });
});

describe("executeSync", () => {
  it("menandai acknowledged untuk accepted dan duplicate", async () => {
    const { deps, acknowledged, retried, sent } = createDeps([event(1), event(2)], async (request) => ({
      acknowledgements: request.events.map((entry, index) => ({
        eventId: entry.eventId,
        status: index === 0 ? "accepted" : "duplicate"
      }))
    }));

    const result = await executeSync(deps, options);

    expect(result.status).toBe("synced");
    expect(result.acknowledged).toBe(2);
    expect(acknowledged).toEqual(["outbox-1", "outbox-2"]);
    expect(retried).toEqual([]);
    expect(sent[0].deviceId).toBe("device-1");
    expect(sent[0].schemaVersion).toBe("1.0.0");
  });

  it("menjadwalkan ulang event yang ditolak server", async () => {
    const { deps, acknowledged, retried } = createDeps([event(1), event(2)], async (request) => ({
      acknowledgements: [
        { eventId: request.events[0].eventId, status: "accepted" },
        { eventId: request.events[1].eventId, status: "rejected", errorCode: "SYNC_EVENT_REJECTED" }
      ]
    }));

    const result = await executeSync(deps, options);

    expect(result.status).toBe("partial");
    expect(acknowledged).toEqual(["outbox-1"]);
    expect(retried[0].errorCode).toBe("SYNC_EVENT_REJECTED");
    expect(retried[0].nextAttemptAt > "2026-10-23T16:00:00.000Z").toBe(true);
  });

  it("menjadwalkan ulang semua event saat jaringan gagal", async () => {
    const { deps, acknowledged, retried } = createDeps([event(1), event(2)], async () => {
      throw new Error("network down");
    });

    const result = await executeSync(deps, options);

    expect(result.status).toBe("error");
    expect(acknowledged).toEqual([]);
    expect(retried).toHaveLength(2);
    expect(retried.every((entry) => entry.errorCode === "SYNC_NETWORK_UNAVAILABLE")).toBe(true);
  });

  it("menjadwalkan ulang event tanpa acknowledgement", async () => {
    const { deps, retried } = createDeps([event(1)], async () => ({ acknowledgements: [] }));

    const result = await executeSync(deps, options);

    expect(result.status).toBe("error");
    expect(retried[0].errorCode).toBe("SYNC_MISSING_ACK");
  });

  it("mengembalikan empty tanpa memanggil server", async () => {
    let called = false;
    const { deps } = createDeps([], async () => {
      called = true;
      return { acknowledgements: [] };
    });

    const result = await executeSync(deps, options);

    expect(result.status).toBe("empty");
    expect(called).toBe(false);
  });

  it("menolak payload JSON rusak tanpa mengirim", async () => {
    const { deps, retried, sent } = createDeps([event(1, "not-json")], async () => ({
      acknowledgements: []
    }));

    const result = await executeSync(deps, options);

    expect(result.status).toBe("error");
    expect(sent).toEqual([]);
    expect(retried[0].errorCode).toBe("SYNC_INVALID_PAYLOAD");
  });
});
