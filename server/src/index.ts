import { createSyncServer } from "./app";
import { SqliteSyncStore } from "./store";

const port = Number(process.env.PORT ?? 8788);
const token = process.env.SYNC_TOKEN ?? "dev-token";
const dbPath = process.env.SYNC_DB_PATH ?? "server/data/sync.db";
const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:1420";

if (!process.env.SYNC_TOKEN) {
  console.warn("SYNC_TOKEN tidak diset; memakai dev-token. Jangan dipakai di produksi.");
}

const store = new SqliteSyncStore(dbPath);
const server = createSyncServer({
  store,
  token,
  corsOrigin,
  rateLimit: { limit: Number(process.env.SYNC_RATE_LIMIT ?? 60), windowMs: 60_000 }
});

server.listen(port, () => {
  console.log(`sync backend listening on http://localhost:${port} (db: ${dbPath})`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close(() => {
      store.close();
      process.exit(0);
    });
  });
}
