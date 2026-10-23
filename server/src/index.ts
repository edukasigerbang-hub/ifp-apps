import { createPrivateKey, createPublicKey } from "node:crypto";
import { readFileSync } from "node:fs";
import { createSyncServer, type SyncAppOptions } from "./app";
import { LicenseService, LicenseStore } from "./license";
import { SqliteSyncStore } from "./store";

const port = Number(process.env.PORT ?? 8788);
const token = process.env.SYNC_TOKEN ?? "dev-token";
const dbPath = process.env.SYNC_DB_PATH ?? "server/data/sync.db";
const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:1420";

if (!process.env.SYNC_TOKEN) {
  console.warn("SYNC_TOKEN tidak diset; memakai dev-token. Jangan dipakai di produksi.");
}

let licenseStore: LicenseStore | null = null;
let licenseOptions: SyncAppOptions["license"] | undefined;

const signingKeyPath = process.env.LICENSE_SIGNING_KEY_PATH;
if (signingKeyPath) {
  const privateKey = createPrivateKey(readFileSync(signingKeyPath, "utf8"));
  const publicKey = createPublicKey(privateKey);
  const productId = process.env.LICENSE_PRODUCT_ID ?? "ifp-learning";
  const keyId = process.env.LICENSE_KEY_ID ?? "dev-1";

  licenseStore = new LicenseStore(dbPath);
  const seededSerials = (process.env.LICENSE_SEED_SERIALS ?? "")
    .split(",")
    .map((serial) => serial.trim())
    .filter(Boolean);
  const seedType = process.env.LICENSE_SEED_TYPE ?? "subscription";
  const now = new Date().toISOString();
  for (const serial of seededSerials) {
    licenseStore.seed(serial, seedType, productId, now);
  }
  if (seededSerials.length > 0) {
    console.log(`seeded ${seededSerials.length} license serial(s)`);
  }

  licenseOptions = {
    service: new LicenseService(licenseStore, {
      productId,
      keyId,
      privateKey,
      publicKey,
      subscriptionDays: Number(process.env.LICENSE_SUBSCRIPTION_DAYS ?? 30),
      graceDays: Number(process.env.LICENSE_GRACE_DAYS ?? 7),
      entitlements: ["core"]
    }),
    adminToken: process.env.LICENSE_ADMIN_TOKEN ?? "dev-admin"
  };
} else {
  console.warn("LICENSE_SIGNING_KEY_PATH tidak diset; endpoint lisensi dinonaktifkan (503).");
}

const store = new SqliteSyncStore(dbPath);
const server = createSyncServer({
  store,
  token,
  corsOrigin,
  license: licenseOptions,
  rateLimit: { limit: Number(process.env.SYNC_RATE_LIMIT ?? 60), windowMs: 60_000 }
});

server.listen(port, () => {
  console.log(`sync backend listening on http://localhost:${port} (db: ${dbPath})`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close(() => {
      store.close();
      licenseStore?.close();
      process.exit(0);
    });
  });
}
