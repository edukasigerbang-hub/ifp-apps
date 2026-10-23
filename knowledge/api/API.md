# API & Kontrak Antarmuka

> **DERIVED** dari [LLD §7–§10](../../LLD.md). Semua endpoint masih **KONSEPTUAL**.
> Auth, request/response schema, rate limit, dan error contract **wajib dirinci sebelum implementasi backend**.

## Native (Tauri commands) — USULAN

| Command | Arah | Catatan |
|---|---|---|
| `license_get_status` | read | Status dari native, bukan UI |
| `license_get_machine_id` | read | Installation ID acak, persisten |
| `license_activate_online` | write | Idempotent / ber-request ID |
| `license_export_request` | write | Offline activation request |
| `license_import_file` | write | Verifikasi signature native |
| `license_refresh` | write | Subscription grace |
| `license_get_entitlements` | read | Fitur yang diizinkan |
| `license_request_deactivation` | write | Transfer perangkat |
| `content_import_package` | write | Impor → staging |
| `content_validate_package` | read | Manifest/schema/hash/deps |
| `content_activate_package` | write | Atomik + rollback |
| `content_list_packages` | read | Katalog lokal |
| `content_open_managed_folder` | action | Platform-dependent |
| `content_remove_addon` | write | Cek dependensi/sesi aktif |
| `app_export_diagnostics` | action | Tanpa secret |

Aturan native boundary: validasi argumen + batas ukuran; **tanpa** command generik shell/arbitrary path/arbitrary code; typed error tanpa panic/backtrace/secret; capability Tauri minimal + allowlist ketat.

## Learning repository (IMPLEMENTED — Fase E)

| Command | Input | Output |
|---|---|---|
| `learning_ensure_profile` | `profileId`, `displayName` | `profileId` |
| `learning_start_session` | `sessionId`, `profileId`, `packageId`, `packageVersion`, `lessonId`, `manifestHash?` | `sessionId`, `startedAt` |
| `learning_save_attempt` | `attemptId`, `progressId`, `outboxId`, `eventId`, `sessionId`, `activityId`, `score`, `occurredAt`, `answers[]` | `attemptId`, `attemptNo`, `score`, `outboxEventId` |
| `learning_get_summary` | `profileId` | `sessions`, `attempts`, `averageScore`, `recent[]` |

- `learning_save_attempt` menulis attempt + responses + progress + outbox dalam **satu transaksi** (lihat [SCHEMA.md](../database/SCHEMA.md)).
- Error terketik: `VALIDATION_FAILED`, `SESSION_NOT_FOUND`, `STATE_UNAVAILABLE`, `DATABASE_WRITE_FAILED`, `DATABASE_READ_FAILED`.
- Semua ID dibuat di klien (`crypto.randomUUID`); Rust memvalidasi bentuknya.
- Hanya tersedia di runtime Tauri; pratinjau browser menampilkan status "tidak disimpan".

## Server (konseptual) — USULAN

| Method | Path |
|---|---|
| POST | `/v1/activations` |
| POST | `/v1/activations/verify` |
| POST | `/v1/licenses/refresh` |
| POST | `/v1/licenses/transfer` |
| POST | `/v1/activations/deactivate` |

## Sync event (client → server)

```json
{
  "eventId": "<uuid>",
  "deviceId": "<installation-id>",
  "schemaVersion": "1.0.0",
  "createdAt": "<UTC ISO-8601>",
  "payload": {}
}
```

Server: authorization → size/schema validation → idempotency → persist → per-event acknowledgement.

## Error contract

```json
{ "code": "CONTENT_ASSET_HASH_MISMATCH", "message": "<aman untuk pengguna>", "retryable": false, "correlationId": "<id>" }
```

Kode stabil: lihat [LLD ringkasan §Error codes](LLD.md#error-codes-subset-wajib).

## Status

| Kontrak | Status |
|---|---|
| Native commands | PROPOSED — belum ada implementasi |
| Server endpoints | PROPOSED — skema belum ditetapkan (OPEN) |
| Sync schema | PROPOSED v1.0.0 draft |
| Auth/authorization | BELUM DITETAPKAN (OPEN) |
