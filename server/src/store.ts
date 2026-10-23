import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

export type RecordOutcome = "accepted" | "duplicate" | "conflict";

export interface StoredEvent {
  eventId: string;
  eventType: string;
  payload: unknown;
}

export interface SyncStore {
  record(deviceId: string, event: StoredEvent): RecordOutcome;
  close(): void;
}

export class SqliteSyncStore implements SyncStore {
  private readonly db: DatabaseSync;

  constructor(path: string) {
    if (path !== ":memory:") {
      mkdirSync(dirname(path), { recursive: true });
    }
    this.db = new DatabaseSync(path);
    if (path !== ":memory:") {
      this.db.exec("PRAGMA journal_mode = WAL;");
    }
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sync_events (
        event_id TEXT PRIMARY KEY,
        device_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        received_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_sync_events_device
        ON sync_events(device_id, received_at);
    `);
  }

  record(deviceId: string, event: StoredEvent): RecordOutcome {
    const existing = this.db
      .prepare("SELECT device_id FROM sync_events WHERE event_id = ?")
      .get(event.eventId) as { device_id: string } | undefined;

    if (existing) {
      return existing.device_id === deviceId ? "duplicate" : "conflict";
    }

    this.db
      .prepare(
        `INSERT INTO sync_events (event_id, device_id, event_type, payload_json, received_at)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(
        event.eventId,
        deviceId,
        event.eventType,
        JSON.stringify(event.payload),
        new Date().toISOString()
      );

    return "accepted";
  }

  count(): number {
    const row = this.db.prepare("SELECT COUNT(*) AS total FROM sync_events").get() as { total: number };
    return Number(row.total);
  }

  close(): void {
    this.db.close();
  }
}
