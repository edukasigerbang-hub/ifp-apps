import { afterEach, describe, expect, it, vi } from "vitest";
import { signDeviceToken, verifyDeviceToken } from "./auth";
import worker, { type Env } from "./index";
import { canonicalJson } from "./license";

const TEST_PRIVATE_KEY =
  "MC4CAQAwBQYDK2VwBCIEIFcCWpPVtIyUjgFFlqeXoOZeWiNU1S7iqq43GSIZAdIk";
const TEST_PUBLIC_KEY = "HxYJgNrK0CMB6EnzmL1pBMPjWIcPwze12ecr/xBAoYo=";

const env: Env = {
  SUPABASE_URL: "https://supabase.test",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-test",
  DEVICE_TOKEN_SECRET: "device-secret-test",
  ENROLLMENT_CODE_PEPPER: "pepper-test",
  ACTIVATION_CODE_PEPPER: "activation-pepper-test",
  LICENSE_SIGNING_PRIVATE_KEY: TEST_PRIVATE_KEY,
  LICENSE_PUBLIC_KEY: TEST_PUBLIC_KEY,
  LICENSE_KEY_ID: "test-1",
  LICENSE_PRODUCT_ID: "ifp-learning",
  ADMIN_API_TOKEN: "admin-token-test",
  CORS_ORIGIN: "http://localhost:1420"
};

function arrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.length);
  copy.set(bytes);
  return copy.buffer;
}

function base64Bytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function licenseRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    owner_id: null,
    plan: "personal",
    status: "trial",
    max_devices: 1,
    starts_at: "2026-01-01T00:00:00.000Z",
    expires_at: null,
    serial_hash: "hash",
    product_id: "ifp-learning",
    license_type: "subscription",
    machine_id: null,
    key_id: null,
    activated_at: null,
    ...overrides
  };
}

function activation(machineId: string, serial: string) {
  return {
    schemaVersion: "1.0.0",
    productId: "ifp-learning",
    machineId,
    requestId: crypto.randomUUID(),
    nonce: "nonce-test",
    createdAt: new Date().toISOString(),
    serial
  };
}

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
      if (url.includes("/rest/v1/ifp_devices")) {
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
      if (url.includes("/rest/v1/ifp_devices")) {
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

  it("menolak permintaan aktivasi yang tidak valid", async () => {
    mockSupabase(() => new Response("unexpected", { status: 500 }));
    const response = await worker.fetch(
      post("/v1/activations", { schemaVersion: "1.0.0" }),
      env
    );
    expect(response.status).toBe(400);
    const body = (await response.json()) as { error?: { code?: string } };
    expect(body.error?.code).toBe("LICENSE_INVALID_REQUEST");
  });

  it("menolak serial yang tidak dikenal", async () => {
    mockSupabase(() => Response.json([]));
    const response = await worker.fetch(
      post("/v1/activations", activation(crypto.randomUUID(), "SERIAL-PALSU")),
      env
    );
    expect(response.status).toBe(404);
    const body = (await response.json()) as { error?: { code?: string } };
    expect(body.error?.code).toBe("LICENSE_SERIAL_INVALID");
  });

  it("menolak serial yang terikat ke perangkat lain", async () => {
    mockSupabase(() => Response.json([licenseRow({ machine_id: crypto.randomUUID() })]));
    const response = await worker.fetch(
      post("/v1/activations", activation(crypto.randomUUID(), "SERIAL-TERIKAT")),
      env
    );
    expect(response.status).toBe(409);
    const body = (await response.json()) as { error?: { code?: string } };
    expect(body.error?.code).toBe("LICENSE_ACTIVATION_CONFLICT");
  });

  it("menerbitkan lisensi bertanda tangan Ed25519", async () => {
    const row = licenseRow();
    mockSupabase((url, init) => {
      if (init.method === "PATCH" && url.includes("/rest/v1/licenses?")) {
        return new Response(null, { status: 204 });
      }
      if (init.method === "POST" && url.includes("/rest/v1/license_audit")) {
        return new Response(null, { status: 201 });
      }
      if (url.includes("/rest/v1/licenses?")) {
        return Response.json([row]);
      }
      return new Response("unexpected", { status: 500 });
    });

    const machineId = crypto.randomUUID();
    const response = await worker.fetch(
      post("/v1/activations", activation(machineId, "SERIAL-VALID")),
      env
    );
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      payload: Record<string, unknown>;
      signature: string;
    };
    expect(body.payload.machineId).toBe(machineId);
    expect(body.payload.licenseId).toBe(row.id);
    expect(body.payload.keyId).toBe("test-1");

    const key = await crypto.subtle.importKey(
      "raw",
      arrayBuffer(base64Bytes(TEST_PUBLIC_KEY)),
      { name: "Ed25519" } as AlgorithmIdentifier,
      false,
      ["verify"]
    );
    const valid = await crypto.subtle.verify(
      { name: "Ed25519" } as AlgorithmIdentifier,
      key,
      arrayBuffer(base64Bytes(body.signature)),
      arrayBuffer(new TextEncoder().encode(canonicalJson(body.payload)))
    );
    expect(valid).toBe(true);
  });

  it("menolak transfer tanpa token admin", async () => {
    mockSupabase(() => new Response("unexpected", { status: 500 }));
    const response = await worker.fetch(
      post("/v1/licenses/transfer", {
        licenseId: crypto.randomUUID(),
        machineId: crypto.randomUUID()
      }),
      env
    );
    expect(response.status).toBe(401);
    const body = (await response.json()) as { error?: { code?: string } };
    expect(body.error?.code).toBe("LICENSE_UNAUTHORIZED_ADMIN");
  });

  it("memindahkan lisensi ke perangkat baru", async () => {
    const row = licenseRow({ machine_id: crypto.randomUUID(), status: "active" });
    const nextMachine = crypto.randomUUID();
    const patches: Array<Record<string, unknown>> = [];
    let audited = false;
    mockSupabase((url, init) => {
      if (url.includes("/rest/v1/licenses?select=")) {
        return Response.json([row]);
      }
      if (url.includes("/rest/v1/licenses?id=eq.")) {
        patches.push(JSON.parse(String(init.body)) as Record<string, unknown>);
        return new Response(null, { status: 204 });
      }
      if (url.includes("/rest/v1/license_audit")) {
        audited = true;
        return new Response(null, { status: 201 });
      }
      return new Response("unexpected", { status: 500 });
    });

    const response = await worker.fetch(
      post("/v1/licenses/transfer", { licenseId: row.id, machineId: nextMachine }, "admin-token-test"),
      env
    );
    expect(response.status).toBe(200);
    const body = (await response.json()) as { machineId: string; changed: boolean };
    expect(body.machineId).toBe(nextMachine);
    expect(body.changed).toBe(true);
    expect(patches[0]?.machine_id).toBe(nextMachine);
    expect(patches[0]?.status).toBe("active");
    expect(audited).toBe(true);
  });

  it("melepas lisensi dari perangkat", async () => {
    const row = licenseRow({ machine_id: crypto.randomUUID(), status: "active" });
    const patches: Array<Record<string, unknown>> = [];
    mockSupabase((url, init) => {
      if (url.includes("/rest/v1/licenses?select=")) {
        return Response.json([row]);
      }
      if (url.includes("/rest/v1/licenses?id=eq.")) {
        patches.push(JSON.parse(String(init.body)) as Record<string, unknown>);
        return new Response(null, { status: 204 });
      }
      if (url.includes("/rest/v1/license_audit")) {
        return new Response(null, { status: 201 });
      }
      return new Response("unexpected", { status: 500 });
    });

    const response = await worker.fetch(
      post("/v1/activations/deactivate", { licenseId: row.id }, "admin-token-test"),
      env
    );
    expect(response.status).toBe(200);
    const body = (await response.json()) as { machineId: null; changed: boolean };
    expect(body.machineId).toBeNull();
    expect(body.changed).toBe(true);
    expect(patches[0]?.machine_id).toBeNull();
  });
});
