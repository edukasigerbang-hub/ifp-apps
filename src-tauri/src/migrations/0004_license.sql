CREATE TABLE IF NOT EXISTS license_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  license_json TEXT NOT NULL,
  license_id TEXT NOT NULL,
  license_type TEXT NOT NULL,
  product_id TEXT NOT NULL,
  machine_id TEXT NOT NULL,
  key_id TEXT NOT NULL,
  expires_at TEXT,
  imported_at TEXT NOT NULL,
  last_verified_at TEXT NOT NULL
);
