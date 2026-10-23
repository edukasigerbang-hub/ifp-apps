# Database Schema — Lokal (SQLite)

> **DERIVED** dari [LLD §6](../../LLD.md). Tabel belum dibuat — belum ada kode/migrasi.
> Status: **PLANNED**. Tipe, constraint, index, retensi wajib dituangkan sebagai migrasi eksplisit.

## Tabel minimum

### `profiles`
`id`, `display_name`, `profile_type`, `created_at`, `updated_at`

### `content_packages`
`package_id`, `version`, `source`, `status`, `manifest_hash`, `installed_at`

### `content_assets`
`package_id`, `version`, `asset_path`, `sha256`, `size_bytes`

### `learning_sessions`
`id`, `profile_id`, `lesson_id`, `package_id`, `package_version`, `started_at`, `completed_at`, `state`

### `activity_attempts`
`id`, `session_id`, `activity_id`, `attempt_no`, `started_at`, `completed_at`, `score`, `state`

### `assessment_responses`
`id`, `attempt_id`, `question_id`, `response_json`, `is_correct`, `answered_at`

### `progress_snapshots`
`id`, `profile_id`, `lesson_id`, `package_version`, `progress_json`, `updated_at`

### `sync_outbox`
`id`, `event_id`, `event_type`, `payload_json`, `created_at`, `attempts`, `next_attempt_at`, `state`, `last_error_code`

### `schema_migrations`
`version`, `applied_at`, `checksum`

## Aturan transaksi (MENGIKAT)

1. Respons/hasil + event outbox ditulis dalam **satu transaksi**.
2. `sync_outbox.event_id` unik; server melakukan deduplication.
3. Event outbox **tidak dihapus** sampai acknowledgement server tersimpan.
4. Retry: exponential backoff + jitter + batas terkonfigurasi.
5. Media biner besar tidak disimpan di SQLite.
6. Backup konsisten dan **restore harus diuji**.
7. Migrasi bernomor, diuji dari versi sebelumnya; kegagalan → `DATABASE_MIGRATION_FAILED`, tidak boleh meninggalkan state separuh jadi.

## Retensi & privasi

- Minimalkan data identitas siswa; jangan simpan yang tidak diperlukan.
- Kebijakan retensi, ekspor, penghapusan profil **wajib ditetapkan sebelum produksi** (OPEN — lihat BACKLOG OD-4).

## Server (PostgreSQL) — ringkas

Katalog + versi paket, metadata aset & status publikasi, license records + hash serial + activation binding + audit transfer/deactivation, sync event IDs + idempotency, user administratif + role/permission, audit log dengan minimisasi data.
