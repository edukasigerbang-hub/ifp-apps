-- Migration 0001 — initial local learning data model
-- Semua waktu disimpan UTC ISO-8601 dengan format yang konsisten.

CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  profile_type TEXT NOT NULL DEFAULT 'student'
    CHECK (profile_type IN ('student', 'teacher', 'admin')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE content_packages (
  package_id TEXT NOT NULL,
  version TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('bundled', 'imported', 'downloaded')),
  status TEXT NOT NULL CHECK (status IN ('discovered', 'validated', 'active', 'disabled', 'removed')),
  manifest_hash TEXT,
  installed_at TEXT NOT NULL,
  PRIMARY KEY (package_id, version)
);

CREATE TABLE content_assets (
  package_id TEXT NOT NULL,
  version TEXT NOT NULL,
  asset_path TEXT NOT NULL,
  sha256 TEXT NOT NULL,
  size_bytes INTEGER NOT NULL CHECK (size_bytes >= 0),
  PRIMARY KEY (package_id, version, asset_path),
  FOREIGN KEY (package_id, version) REFERENCES content_packages(package_id, version)
);

CREATE TABLE learning_sessions (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  package_id TEXT NOT NULL,
  package_version TEXT NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  state TEXT NOT NULL CHECK (state IN ('active', 'completed', 'abandoned')),
  FOREIGN KEY (profile_id) REFERENCES profiles(id),
  FOREIGN KEY (package_id, package_version) REFERENCES content_packages(package_id, version)
);

CREATE TABLE activity_attempts (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  activity_id TEXT NOT NULL,
  attempt_no INTEGER NOT NULL CHECK (attempt_no >= 1),
  started_at TEXT NOT NULL,
  completed_at TEXT,
  score REAL CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
  state TEXT NOT NULL CHECK (state IN ('in-progress', 'completed', 'abandoned')),
  FOREIGN KEY (session_id) REFERENCES learning_sessions(id),
  UNIQUE (session_id, activity_id, attempt_no)
);

CREATE TABLE assessment_responses (
  id TEXT PRIMARY KEY,
  attempt_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  response_json TEXT NOT NULL,
  is_correct INTEGER NOT NULL CHECK (is_correct IN (0, 1)),
  answered_at TEXT NOT NULL,
  FOREIGN KEY (attempt_id) REFERENCES activity_attempts(id)
);

CREATE TABLE progress_snapshots (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  package_version TEXT NOT NULL,
  progress_json TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (profile_id) REFERENCES profiles(id),
  UNIQUE (profile_id, lesson_id, package_version)
);

CREATE TABLE sync_outbox (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  next_attempt_at TEXT,
  state TEXT NOT NULL CHECK (state IN ('pending', 'sending', 'acknowledged', 'failed')),
  last_error_code TEXT
);

CREATE INDEX idx_sessions_profile ON learning_sessions(profile_id, started_at);
CREATE INDEX idx_attempts_session ON activity_attempts(session_id);
CREATE INDEX idx_responses_attempt ON assessment_responses(attempt_id);
CREATE INDEX idx_progress_profile ON progress_snapshots(profile_id, lesson_id);
CREATE INDEX idx_outbox_state ON sync_outbox(state, next_attempt_at);
