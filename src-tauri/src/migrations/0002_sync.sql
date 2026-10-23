CREATE TABLE app_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

ALTER TABLE sync_outbox ADD COLUMN acknowledged_at TEXT;

CREATE INDEX idx_outbox_pending
  ON sync_outbox(state, next_attempt_at, created_at);
