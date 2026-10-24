import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { createSyncServer, type SyncAppOptions } from "./app";
import { SqliteSyncStore } from "./store";

const TOKEN = "test-token";

interface TestBody {
  acknowledgements?: Array<{ eventId: string; status: string; errorCode: string | null }>;
  error?: { code: string };
  ok?: boolean;
}

let closers: Array<() => Promise<void>> = [];

afterEach(async () => {
  for (const close of closers.reverse()) {
    await close();
  }
  closers = [];
});

async function start(overrides: Partial<SyncAppOptions> = {}) {
  const store = new SqliteSyncStore(":memory:");
  const server = createSyncServer({
    store,
    token: TOKEN,
    rateLimit: { limit: 100, windowMs: 60_000 },
    ...overrides
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("server tidak memiliki port");
  }

  closers.push(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    store.close();
  });

  return { base: `http://127.0.0.1:${address.port}`, store };
}

function event(overrides: Record<string, unknown> = {}) {
  return {
    eventId: randomUUID(),
    eventType: "assessment.completed",
    createdAt: "2026-10-23T15:00:00.000Z",
    payload: { score: 100, lessonId: "pecahan-sederhana" },
    ...overrides
  };
}

function batch(overrides: Record<string, unknown> = {}) {
  return {
    deviceId: randomUUID(),
    schemaVersion: "1.0.0",
    events: [event()],
    ...overrides
  };
}

async function post(base: string, body: unknown, token = TOKEN) {
  return fetch(`${base}/v1/sync/events`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  });
}

describe("sync backend", () => {
  it("menjawab health check", async () => {
    const { base } = await start();
    const response = await fetch(`${base}/health`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });

  it("menolak token yang salah", async () => {
    const { base } = await start();
    const response = await post(base, batch(), "wrong");
    expect(response.status).toBe(401);
    const body = (await response.json()) as TestBody;
    expect(body.error?.code).toBe("SYNC_UNAUTHORIZED");
  });

  it("menerima batch valid dan menyimpannya sekali", async () => {
    const { base, store } = await start();
    const payload = batch();
    const response = await post(base, payload);

    expect(response.status).toBe(200);
    const body = (await response.json()) as TestBody;
    expect(body.acknowledgements).toHaveLength(1);
    expect(body.acknowledgements?.[0].status).toBe("accepted");
    expect(store.count()).toBe(1);
  });

  it("mengembalikan duplicate untuk eventId yang sama", async () => {
    const { base, store } = await start();
    const payload = batch();
    await post(base, payload);
    const response = await post(base, payload);

    expect(response.status).toBe(200);
    const body = (await response.json()) as TestBody;
    expect(body.acknowledgements?.[0].status).toBe("duplicate");
    expect(store.count()).toBe(1);
  });

  it("menolak eventId sama dari perangkat berbeda", async () => {
    const { base } = await start();
    const first = batch();
    await post(base, first);

    const second = { ...first, deviceId: randomUUID() };
    const response = await post(base, second);
    const body = (await response.json()) as TestBody;

    expect(response.status).toBe(200);
    expect(body.acknowledgements?.[0].status).toBe("rejected");
    expect(body.acknowledgements?.[0].errorCode).toBe("SYNC_EVENT_REJECTED");
  });

  it("menolak schemaVersion yang tidak didukung", async () => {
    const { base } = await start();
    const response = await post(base, batch({ schemaVersion: "2.0.0" }));
    expect(response.status).toBe(400);
    const body = (await response.json()) as TestBody;
    expect(body.error?.code).toBe("SYNC_INVALID_BATCH");
  });

  it("menolak deviceId bukan UUID", async () => {
    const { base } = await start();
    const response = await post(base, batch({ deviceId: "not-a-uuid" }));
    expect(response.status).toBe(400);
  });

  it("menolak batch lebih dari 100 event", async () => {
    const { base } = await start();
    const response = await post(base, batch({ events: Array.from({ length: 101 }, () => event()) }));
    expect(response.status).toBe(400);
  });

  it("menolak body yang melebihi batas", async () => {
    const { base } = await start({ maxBodyBytes: 80 });
    const response = await post(base, batch());
    expect(response.status).toBe(413);
    const body = (await response.json()) as TestBody;
    expect(body.error?.code).toBe("SYNC_BATCH_TOO_LARGE");
  });

  it("menolak payload event yang melebihi batas", async () => {
    const { base } = await start({ maxEventBytes: 16 });
    const response = await post(base, batch({ events: [event({ payload: { text: "x".repeat(100) } })] }));
    expect(response.status).toBe(400);
    const body = (await response.json()) as TestBody;
    expect(body.error?.code).toBe("SYNC_INVALID_EVENT");
  });

  it("menerapkan rate limit", async () => {
    const { base } = await start({ rateLimit: { limit: 1, windowMs: 60_000 } });
    const first = await post(base, batch());
    const second = await post(base, batch());

    expect(first.status).toBe(200);
    expect(second.status).toBe(429);
    expect(second.headers.get("retry-after")).toBe("60");
  });
});

describe("device enrollment", () => {
  const deviceAuth = {
    enrollmentCode: "enroll-test",
    tokenSecret: "device-secret-test",
    ttlSeconds: 3600
  };

  async function enroll(base: string, code: string) {
    return fetch(`${base}/v1/devices/enroll`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ enrollmentCode: code })
    });
  }

  it("menjawab /healthz", async () => {
    const { base } = await start();
    const response = await fetch(`${base}/healthz`);
    expect(response.status).toBe(200);
  });

  it("menerbitkan token perangkat dan menolak kode salah", async () => {
    const { base } = await start({ deviceAuth });

    const wrong = await enroll(base, "salah");
    expect(wrong.status).toBe(401);

    const response = await enroll(base, "enroll-test");
    expect(response.status).toBe(201);
    const body = (await response.json()) as {
      deviceId: string;
      token: string;
      tokenType: string;
      expiresAt: string;
    };
    expect(body.deviceId).toMatch(/^[0-9a-f-]{36}$/);
    expect(body.token).toContain(".");
    expect(body.tokenType).toBe("Bearer");
    expect(Number.isNaN(Date.parse(body.expiresAt))).toBe(false);
  });

  it("menolak enrollment bila belum dikonfigurasi", async () => {
    const { base } = await start();
    const response = await enroll(base, "enroll-test");
    expect(response.status).toBe(503);
    const body = (await response.json()) as TestBody;
    expect(body.error?.code).toBe("DEVICE_AUTH_UNAVAILABLE");
  });

  it("menerima token perangkat dan menolak deviceId yang tidak cocok", async () => {
    const { base } = await start({ deviceAuth });
    const enrolled = (await (await enroll(base, "enroll-test")).json()) as {
      deviceId: string;
      token: string;
    };

    const accepted = await post(
      base,
      batch({ deviceId: enrolled.deviceId }),
      enrolled.token
    );
    expect(accepted.status).toBe(200);

    const mismatched = await post(base, batch(), enrolled.token);
    expect(mismatched.status).toBe(403);
    const body = (await mismatched.json()) as TestBody;
    expect(body.error?.code).toBe("DEVICE_MISMATCH");

    const legacy = await post(base, batch());
    expect(legacy.status).toBe(200);
  });
});
