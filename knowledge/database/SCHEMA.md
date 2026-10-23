# Database Schema — Lokal (SQLite)

**Status:** IMPLEMENTED (Fase E + I) · **Migrasi:** `0001_init`, `0002_sync` · **Sejak:** 2026-10-23
**Lokasi runtime:** `app_data_dir()/ifp.db` (WAL). Untuk pengujian: env `IFP_DATA_DIR`.

## Migrasi

- Runner native di `src-tauri/src/db.rs`; SQL di `src-tauri/src/migrations/0001_init.sql`.
- Tabel `schema_migrations(version INTEGER PK, applied_at TEXT, checksum TEXT)`.
- Checksum SHA-256 diverifikasi setiap startup; jika SQL migrasi berubah setelah diterapkan → startup gagal (mencegah skema basi).
- Migrasi dijalankan dalam transaksi; `PRAGMA foreign_keys=ON`, `journal_mode=WAL`, `busy_timeout=5000`.

## Tabel (aktual)

### `profiles`
`id` PK, `display_name`, `profile_type` (`student|teacher|admin`), `created_at`, `updated_at`.

### `content_packages`
PK (`package_id`, `version`); `source` (`bundled|imported|downloaded`), `status` (`discovered|validated|active|disabled|removed`), `manifest_hash`, `installed_at`.

### `content_assets`
PK (`package_id`, `version`, `asset_path`); `sha256`, `size_bytes`; FK ke `content_packages`.

### `learning_sessions`
`id` PK; `profile_id` FK; `lesson_id`; `package_id` + `package_version` FK; `started_at`; `completed_at`; `state` (`active|completed|abandoned`).

### `activity_attempts`
`id` PK; `session_id` FK; `activity_id`; `attempt_no` (≥1); `started_at`; `completed_at`; `score` (0–100); `state` (`in-progress|completed|abandoned`); UNIQUE (`session_id`, `activity_id`, `attempt_no`).

### `assessment_responses`
`id` PK; `attempt_id` FK; `question_id`; `response_json`; `is_correct` (0/1); `answered_at`.

### `progress_snapshots`
`id` PK; `profile_id` FK; `lesson_id`; `package_version`; `progress_json`; `updated_at`; UNIQUE (`profile_id`, `lesson_id`, `package_version`) → upsert.

### `sync_outbox`
`id` PK; `event_id` **UNIQUE**; `event_type`; `payload_json`; `created_at`; `attempts` (≥0); `next_attempt_at`; `state` (`pending|sending|acknowledged|failed`); `last_error_code`; `acknowledged_at` (migrasi 0002).

Transisi: `pending → acknowledged` (ack) atau `pending → failed` (retry, `attempts+1`, backoff) → dead-letter bila `attempts >= maxAttempts` (`next_attempt_at = NULL`). Event tidak pernah dihapus.

### `app_meta` (migrasi 0002)
`key` PK, `value`, `updated_at`; menyimpan `installation_id` (UUID v4) untuk sync.

### Index
`learning_sessions(profile_id, started_at)` · `activity_attempts(session_id)` · `assessment_responses(attempt_id)` · `progress_snapshots(profile_id, lesson_id)` · `sync_outbox(state, next_attempt_at)` · `sync_outbox(state, next_attempt_at, created_at)`. Indeks terakhir ditambahkan di migrasi 0002.

## Jaminan transaksi

`learning_save_attempt` menulis dalam **satu transaksi**:
1. `activity_attempts` (attempt_no dihitung dari MAX+1),
2. `assessment_responses` (satu baris per soal),
3. `progress_snapshots` (upsert),
4. `learning_sessions` → `completed`,
5. `sync_outbox` (`event_id` unik, state `pending`).

Kegagalan di langkah mana pun (termasuk event duplikat) → rollback seluruh upaya.

## Bukti verifikasi

- `cargo test` → **6/6 PASS**: simpan lengkap, rollback duplikat event, attempt_no naik, agregasi summary, migrasi idempoten, persistensi antar-reopen.
- E2E Tauri (CDP) → 1 sesi, 1 attempt, 4 respons, 1 progress, 1 outbox `pending`; Results menampilkan Sesi 1 / Percobaan 1 / skor 100.

## Batasan

- Backup/restore belum diimplementasikan; retensi data siswa OPEN (OD-4).
- Belum ada pengiriman outbox (Fase I) dan signature/verifikasi paket.
- Media tetap di filesystem, bukan blob SQLite.
