import { createHash, generateKeyPairSync, randomUUID, verify } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { createSyncServer, type SyncAppOptions } from "./app";
import { canonicalJson, LicenseService, LicenseStore, type LicenseFile } from "./license";
import { SqliteSyncStore } from "./store";

const TOKEN = "sync-token";
const ADMIN = "admin-token";
let closers: Array<() => Promise<void>> = [];

afterEach(async () => {
  for (const close of closers.reverse()) {
    await close();
  }
  closers = [];
});

function serialHash(serial: string): string {
  return createHash("sha256").update(serial).digest("hex");
}

async function start(withLicense = true) {
  const syncStore = new SqliteSyncStore(":memory:");
  const licenseStore = new LicenseStore(":memory:");
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const service = new LicenseService(licenseStore, {
    productId: "ifp-learning",
    keyId: "test-1",
    privateKey,
    publicKey,
    subscriptionDays: 30,
    graceDays: 7,
    entitlements: ["core"]
  });

  const now = "2026-10-24T00:00:00.000Z";
  licenseStore.seed("SERIAL-1", "subscription", "ifp-learning", now);
  const revoked = licenseStore.seed("SERIAL-REVOKED", "subscription", "ifp-learning", now);
  licenseStore.revoke(revoked.licenseId, now);

  const options: SyncAppOptions = {
    store: syncStore,
    token: TOKEN,
    rateLimit: { limit: 1000, windowMs: 60_000 },
    license: withLicense ? { service, adminToken: ADMIN } : undefined
  };
  const server = createSyncServer(options);

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("no port");
  closers.push(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    syncStore.close();
    licenseStore.close();
  });

  return { base: `http://127.0.0.1:${address.port}`, licenseStore, publicKey, now };
}

function activation(machineId: string, serial = "SERIAL-1") {
  return {
    schemaVersion: "1.0.0",
    productId: "ifp-learning",
    machineId,
    serial,
    requestId: randomUUID(),
    nonce: randomUUID(),
    createdAt: "2026-10-24T00:00:00.000Z"
  };
}

async function post(base: string, path: string, body: unknown, admin = false) {
  return fetch(`${base}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(admin ? { authorization: `Bearer ${ADMIN}` } : {})
    },
    body: JSON.stringify(body)
  });
}

describe("license service", () => {
  it("activates a serial and signs the license", async () => {
    const { base, publicKey } = await start();
    const machineId = randomUUID();
    const response = await post(base, "/v1/activations", activation(machineId));

    expect(response.status).toBe(200);
    const license = (await response.json()) as LicenseFile;
    expect(license.payload.machineId).toBe(machineId);
    expect(license.payload.licenseType).toBe("subscription");
    expect(license.payload.expiresAt).not.toBeNull();

    const valid = verify(
      null,
      Buffer.from(canonicalJson(license.payload)),
      publicKey,
      Buffer.from(license.signature, "base64")
    );
    expect(valid).toBe(true);
  });

  it("is idempotent for the same machine", async () => {
    const { base } = await start();
    const machineId = randomUUID();
    const first = (await (await post(base, "/v1/activations", activation(machineId))).json()) as LicenseFile;
    const second = (await (await post(base, "/v1/activations", activation(machineId))).json()) as LicenseFile;

    expect(second.payload.licenseId).toBe(first.payload.licenseId);
  });

  it("rejects activation on a second machine", async () => {
    const { base } = await start();
    await post(base, "/v1/activations", activation(randomUUID()));
    const response = await post(base, "/v1/activations", activation(randomUUID()));

    expect(response.status).toBe(409);
    const body = (await response.json()) as { error: { code: string } };
    expect(body.error.code).toBe("LICENSE_ACTIVATION_CONFLICT");
  });

  it("rejects unknown and revoked serials", async () => {
    const { base } = await start();
    const unknown = await post(base, "/v1/activations", activation(randomUUID(), "NOPE-0000"));
    expect(unknown.status).toBe(404);

    const revoked = await post(base, "/v1/activations", activation(randomUUID(), "SERIAL-REVOKED"));
    expect(revoked.status).toBe(403);
  });

  it("refreshes a subscription", async () => {
    const { base } = await start();
    const machineId = randomUUID();
    const first = (await (await post(base, "/v1/activations", activation(machineId))).json()) as LicenseFile;

    const response = await post(base, "/v1/licenses/refresh", {
      licenseId: first.payload.licenseId,
      machineId
    });

    expect(response.status).toBe(200);
    const refreshed = (await response.json()) as LicenseFile;
    expect(refreshed.payload.expiresAt).not.toBeNull();
    expect(new Date(refreshed.payload.expiresAt!).getTime()).toBeGreaterThanOrEqual(
      new Date(first.payload.expiresAt!).getTime()
    );
  });

  it("verifies a valid license and rejects tampering", async () => {
    const { base } = await start();
    const machineId = randomUUID();
    const license = (await (await post(base, "/v1/activations", activation(machineId))).json()) as LicenseFile;

    const valid = (await (await post(base, "/v1/licenses/verify", license)).json()) as { valid: boolean };
    expect(valid.valid).toBe(true);

    const tampered = { ...license, payload: { ...license.payload, entitlements: ["premium"] } };
    const invalid = (await (await post(base, "/v1/licenses/verify", tampered)).json()) as { valid: boolean };
    expect(invalid.valid).toBe(false);
  });

  it("requires admin authorization for transfer and deactivation", async () => {
    const { base } = await start();
    const machineId = randomUUID();
    const license = (await (await post(base, "/v1/activations", activation(machineId))).json()) as LicenseFile;
    const newMachine = randomUUID();

    const unauthorized = await post(base, "/v1/licenses/transfer", {
      licenseId: license.payload.licenseId,
      machineId: newMachine
    });
    expect(unauthorized.status).toBe(401);

    const transfer = await post(
      base,
      "/v1/licenses/transfer",
      { licenseId: license.payload.licenseId, machineId: newMachine },
      true
    );
    expect(transfer.status).toBe(200);

    const oldMachineRefresh = await post(base, "/v1/licenses/refresh", {
      licenseId: license.payload.licenseId,
      machineId
    });
    expect(oldMachineRefresh.status).toBe(409);

    const deactivate = await post(
      base,
      "/v1/activations/deactivate",
      { licenseId: license.payload.licenseId },
      true
    );
    expect(deactivate.status).toBe(200);

    const reactivate = await post(base, "/v1/activations", activation(randomUUID()));
    expect(reactivate.status).toBe(200);
  });

  it("returns 503 when the license service is not configured", async () => {
    const { base } = await start(false);
    const response = await post(base, "/v1/activations", activation(randomUUID()));
    expect(response.status).toBe(503);
  });

  it("stored serial is hashed, not plaintext", async () => {
    const { licenseStore } = await start();
    const record = licenseStore.findBySerialHash(serialHash("SERIAL-1"));
    expect(record).not.toBeNull();
    expect(record!.serialHash).not.toContain("SERIAL-1");
    expect(record!.serialHash).toHaveLength(64);
  });
});
