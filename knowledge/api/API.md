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

## Sinkronisasi (IMPLEMENTED client — server pending)

| Command | Input | Output |
|---|---|---|
| `sync_get_device_id` | — | UUID instalasi (stabil) |
| `sync_list_pending` | `limit`, `maxAttempts` | event eligible (`outboxId`, `eventId`, `payloadJson`, `attempts`, `nextAttemptAt`) |
| `sync_mark_retry` | `outboxId`, `errorCode`, `nextAttemptAt`, `maxAttempts` | `updated` |
| `sync_mark_acknowledged` | `outboxId`, `acknowledgedAt` | `updated` (idempotent) |
| `sync_get_status` | — | `pending`, `failed`, `acknowledged`, `nextAttemptAt` |

Kontrak jaringan lengkap: [SYNC_CONTRACT.md](SYNC_CONTRACT.md). Engine: `src/data/syncEngine.ts`; UI: Pengaturan. Server referensi: `server/` (`npm run server:dev`, ADR-0006) — belum produksi.

## Content Manager (IMPLEMENTED — Fase F)

| Command | Input | Output |
|---|---|---|
| `content_import_package` | `sourcePath` | `packageId`, `version`, `previousVersion`, `files`, `bytes` |
| `content_list_packages` | — | daftar `packageId`, `version`, `status`, `source`, `installedAt`, `activatedAt` |
| `content_rollback_package` | `packageId` | `packageId`, `activeVersion` |
| `content_get_active` | — | manifest, lessons, activities, assets versi impor aktif (terbaru) |
| `content_read_asset` | `packageId`, `version`, `path` | byte aset (hanya versi aktif, maks 64 MB) |
| `content_list_active` | — | ringkasan semua paket impor aktif |
| `content_get_package` | `packageId`, `version` | manifest, lessons, activities, assets paket aktif tertentu |

## License (IMPLEMENTED core — server pending)

| Command | Input | Output |
|---|---|---|
| `license_get_machine_id` | — | installation ID (UUID) |
| `license_get_status` | — | configured/valid, lisensi, expiry, entitlements, inGrace, kode/message |
| `license_import_file` | `path` | status setelah verifikasi + simpan |
| `license_get_entitlements` | — | daftar entitlement bila valid |
| `license_export_request` | — | productId, machineId, requestId, nonce, createdAt |
| `license_refresh` | — | verifikasi ulang status |
| `license_activate_online` | — | `LICENSE_SERVER_UNAVAILABLE` (belum ada server) |

Error: `LICENSE_NOT_CONFIGURED`, `LICENSE_INVALID`, `LICENSE_SIGNATURE_INVALID`, `LICENSE_WRONG_PRODUCT`, `LICENSE_DEVICE_MISMATCH`, `LICENSE_EXPIRED`, `LICENSE_NOT_YET_VALID`, `LICENSE_SERVER_UNAVAILABLE`. Detail: [ADR-0010](../decisions/ADR-0010-license-core.md).

## License Service (server referensi — ADR-0011)

| Method | Path | Auth | Body → Respons |
|---|---|---|---|
| POST | `/v1/activations` | serial | schemaVersion, productId, machineId, serial, requestId, nonce, createdAt → license file |
| POST | `/v1/licenses/refresh` | licenseId+machine | licenseId, machineId → license file baru |
| POST | `/v1/licenses/verify` | signature | license file → `{valid}` |
| POST | `/v1/licenses/transfer` | admin bearer | licenseId, machineId → binding baru |
| POST | `/v1/activations/deactivate` | admin bearer | licenseId → machine dilepas |

- Serial disimpan sebagai SHA-256; aktivasi mengikat machine secara atomik; audit di `license_audit`.
- Env: `LICENSE_SIGNING_KEY_PATH`, `LICENSE_KEY_ID`, `LICENSE_SEED_SERIALS`, `LICENSE_ADMIN_TOKEN`, `LICENSE_SUBSCRIPTION_DAYS`, `LICENSE_GRACE_DAYS`.
- Bukan produksi (tanpa TLS, token admin statis, seed via env). Client: `VITE_LICENSE_SERVER_URL` + tombol Aktivasi online.

## Backup & Restore (IMPLEMENTED — ADR-0012)

| Command | Input | Output |
|---|---|---|
| `backup_export` | `destination` | path, bytes, sha256, migrations, counts |
| `backup_inspect` | `path` | ringkasan terverifikasi (integrity check) |
| `backup_restore` | `path` | ringkasan setelah restore |

- Backup memakai SQLite backup API; file tujuan tidak boleh sudah ada.
- Restore menolak backup dengan schema lebih baru; jalankan ulang aplikasi setelah restore.
- Error: `BACKUP_INVALID`, `BACKUP_FAILED`, `BACKUP_SCHEMA_TOO_NEW`.
- Backup tidak menyertakan paket konten impor; tidak terenkripsi.

- Validasi native: manifest, path traversal, symlink, batas file/ukuran, SHA-256 aset.
- Aktivasi atomik: staging → rename → transaksi DB; rollback satu langkah.
- Error: `CONTENT_PACKAGE_INVALID`, `CONTENT_ASSET_HASH_MISMATCH`, `CONTENT_ACTIVATION_FAILED`.
- UI: layar Konten & Pembaruan (folder picker via dialog plugin). Player memuat paket impor aktif lebih dulu, lalu bundled (ADR-0008).

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
