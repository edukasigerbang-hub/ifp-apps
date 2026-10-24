import { afterEach, describe, expect, it, vi } from "vitest";
import { signDeviceToken, verifyDeviceToken } from "./auth";
import worker, { type Env } from "./index";

const env: Env = {
  SUPABASE_URL: "https://supabase.test",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-test",
  DEVICE_TOKEN_SECRET: "device-secret-test",
  ENROLLMENT_CODE_PEPPER: "pepper-test",
  CORS_ORIGIN: "http://localhost:1420"
};

let calls: Array<{ url: string; init: RequestInit }> = [];

function mockSupabase(handler: (url: string, init: RequestInit) => Response | Promise<Response>) {
  calls = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const requestInit = init ?? {};
      calls.push({ url, init: requestInit });
      return handler(url, requestInit);
    })
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

function post(path: string, body: unknown, token?: string): Request {
  return new Request(`https://api.test${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
}

function batch(deviceId: string) {
  return {
    deviceId,
    schemaVersion: "1.0.0",
    events: [
      {
        eventId: crypto.randomUUID(),
        eventType: "assessment.completed",
        createdAt: "2026-10-24T00:00:00.000Z",
        payload: { score: 100 }
      }
    ]
  };
}

describe("cloudflare worker", () => {
  it("menjawab healthz", async () => {
    const response = await worker.fetch(
      new Request("https://api.test/healthz"),
      env
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });

  it("menerbitkan token perangkat untuk kode enrollment yang valid", async () => {
    mockSupabase((url) => {
      if (url.includes("/rpc/consume_enrollment_code")) {
        return new Response(JSON.stringify([{ code_id: crypto.randomUUID(), allowed: true }]), {
          status: 200
        });
      }
      if (url.includes("/rest/v1/devices")) {
        return new Response(null, { status: 201 });
      }
      return new Response("unexpected", { status: 500 });
    });

    const response = await worker.fetch(
      post("/v1/devices/enroll", { enrollmentCode: "kelas-3a", platform: "windows" }),
      env
    );
    expect(response.status).toBe(201);
    const body = (await response.json()) as { deviceId: string; token: string; expiresAt: string };
    expect(body.token).toContain(".");
    const payload = await verifyDeviceToken(body.token, env.DEVICE_TOKEN_SECRET);
    expect(payload?.deviceId).toBe(body.deviceId);
    expect(Number.isNaN(Date.parse(body.expiresAt))).toBe(false);
  });

  it("menolak kode enrollment yang salah", async () => {
    mockSupabase((url) =>
      url.includes("/rpc/consume_enrollment_code")
        ? new Response(JSON.stringify([{ code_id: null, allowed: false }]), { status: 200 })
        : new Response("unexpected", { status: 500 })
    );

    const response = await worker.fetch(
      post("/v1/devices/enroll", { enrollmentCode: "salah", platform: "windows" }),
      env
    );
    expect(response.status).toBe(401);
    const body = (await response.json()) as { error?: { code?: string } };
    expect(body.error?.code).toBe("DEVICE_ENROLLMENT_INVALID");
  });

  it("menerima event baru dan menandai duplikat", async () => {
    const deviceId = crypto.randomUUID();
    const issued = await signDeviceToken({ deviceId, secret: env.DEVICE_TOKEN_SECRET });
    let inserts = 0;
    mockSupabase((url) => {
      if (url.includes("/rest/v1/sync_events")) {
        inserts += 1;
        return new Response(inserts === 1 ? JSON.stringify([{ id: 1 }]) : "[]", { status: 201 });
      }
      if (url.includes("/rest/v1/devices")) {
        return new Response(null, { status: 204 });
      }
      return new Response("unexpected", { status: 500 });
    });

    const first = await worker.fetch(post("/v1/sync/events", batch(deviceId), issued.token), env);
    expect(first.status).toBe(200);
    const firstBody = (await first.json()) as {
      acknowledgements: Array<{ status: string }>;
    };
    expect(firstBody.acknowledgements[0].status).toBe("accepted");

    const second = await worker.fetch(post("/v1/sync/events", batch(deviceId), issued.token), env);
    const secondBody = (await second.json()) as {
      acknowledgements: Array<{ status: string }>;
    };
    expect(secondBody.acknowledgements[0].status).toBe("duplicate");
  });

  it("menolak deviceId batch yang tidak cocok dengan token", async () => {
    const issued = await signDeviceToken({
      deviceId: crypto.randomUUID(),
      secret: env.DEVICE_TOKEN_SECRET
    });
    mockSupabase(() => new Response("unexpected", { status: 500 }));

    const response = await worker.fetch(
      post("/v1/sync/events", batch(crypto.randomUUID()), issued.token),
      env
    );
    expect(response.status).toBe(403);
    const body = (await response.json()) as { error?: { code?: string } };
    expect(body.error?.code).toBe("DEVICE_MISMATCH");
  });

  it("menolak token tidak valid", async () => {
    mockSupabase(() => new Response("unexpected", { status: 500 }));
    const response = await worker.fetch(
      post("/v1/sync/events", batch(crypto.randomUUID()), "token-palsu"),
      env
    );
    expect(response.status).toBe(401);
  });

  it("menandai endpoint lisensi belum diimplementasikan", async () => {
    mockSupabase(() => new Response("unexpected", { status: 500 }));
    const response = await worker.fetch(
      post("/v1/activations", { schemaVersion: "1.0.0" }),
      env
    );
    expect(response.status).toBe(501);
    const body = (await response.json()) as { error?: { code?: string } };
    expect(body.error?.code).toBe("LICENSE_ENDPOINT_NOT_IMPLEMENTED");
  });
});
