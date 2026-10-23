# LLD — Ringkasan Kerja

> **DERIVED** dari [`../../LLD.md`](../../LLD.md) (sha256 `29f7fa3e…`).
> Sumber otoritatif tetap LLD root.

## Domain model konten

**ContentPackage:** `packageId`, `version` (immutable), `schemaVersion`, `title`, `locale`, `gradeLevels`, `subjects`, `curriculumRefs`, `assets[]` (path, mediaType, size, SHA-256), `dependencies[]`, `signature`, `releaseState` (draft/validated/approved/published/withdrawn).

**Lesson:** `lessonId`, `packageId`, `title`, `summary`, `curriculumRefs`, `learningObjectives`, `activities[]`, `assessmentRefs[]`, `assetRefs[]`, `accessibilityMetadata`, `contentVersion`, `reviewStatus`.

**Activity contract:** `activityId`, `type`, `schemaVersion`, `title`, `instructions`, `assets`, `interactionConfig`, `assessmentConfig`, `completionPolicy`, `feedbackPolicy`, `runtimeCapabilities` (touch/audio/webgl — metadata, bukan jaminan).

Aturan: tipe aktivitas hanya dari **registry yang diizinkan**; jangan menerima nama modul JS atau path executable dari paket.

## Manifest paket

Field wajib: `manifestVersion`, `packageId`, `packageVersion`, `schemaVersion`, `title`, `locale`, `gradeLevels`, `subjects`, `curriculumRefs`, `assets[]` (dengan `sha256` nyata), `dependencies`, `signature`.
Contoh di LLD memakai `REPLACE_WITH_REAL_HASH` — **contoh bukan paket valid**.

## State machine paket

```text
discovered → importing → validating → staged → active
validating gagal            → rejected (simpan kode alasan)
aktivasi gagal              → pertahankan versi aktif sebelumnya
add-on                      → boleh disabled / removed (cek dependensi & sesi aktif)
bundled core                → boleh hidden/disabled, TIDAK dihapus permanen via operasi normal
```

## Paket & filesystem

- Bundled content: read-only, ikut installer/build.
- Managed content: app-data, dikelola Content Manager.
- Windows: `Open Content Folder` untuk membuka managed directory.
- Android: Storage Access Framework / document picker (tanpa arbitrary path).
- Impor membatasi: path traversal, symlink berbahaya, ukuran file, jumlah file, compression ratio, tipe file.
- Ekstraksi ke staging; tolak file di luar root paket.
- Paket aktif tidak dihapus saat update; aktivasi via transaksi/marker setelah validasi.

## Rust / Tauri commands (USULAN — belum tersedia)

`license_get_status`, `license_get_machine_id`, `license_activate_online`, `license_export_request`, `license_import_file`, `license_refresh`, `license_get_entitlements`, `license_request_deactivation`, `content_import_package`, `content_validate_package`, `content_activate_package`, `content_list_packages`, `content_open_managed_folder`, `content_remove_addon`, `app_export_diagnostics`.

Aturan: validasi argumen & batas ukuran di native boundary; tanpa command generik shell/arbitrary path/code; typed errors tanpa panic/backtrace/secret; command pengubah state idempotent atau ber-request ID; capability Tauri minimal + allowlist ketat.

## Lisensi

- Installation ID acak kriptografis di app-data, stabil saat update; **bukan** hardware fingerprint.
- Signed payload minimal: `schemaVersion`, `licenseId`, `productId`, `licenseType`, `machineId`, optional `deviceKeyThumbprint`, `issuedAt`, `notBefore`, `expiresAt` (null = perpetual), `offlineGraceDays`, `entitlements`, `keyId` + signature Ed25519 atas representasi **canonical**.
- Client hanya membawa public key / key rotation set.
- Serial ≥128-bit entropy; server menyimpan hash; aktivasi atomik + unique binding; idempotency key + rate limit.
- Offline request: product ID, installation ID, request ID/nonce, public key bila device-key binding.
- Clock rollback = sinyal risiko, bukan satu-satunya kontrol.

## Error codes (subset wajib)

`CONTENT_PACKAGE_INVALID`, `CONTENT_SCHEMA_UNSUPPORTED`, `CONTENT_ASSET_HASH_MISMATCH`, `CONTENT_DEPENDENCY_MISSING`, `CONTENT_ACTIVATION_FAILED`, `LICENSE_SIGNATURE_INVALID`, `LICENSE_WRONG_PRODUCT`, `LICENSE_DEVICE_MISMATCH`, `LICENSE_EXPIRED`, `LICENSE_ACTIVATION_CONFLICT`, `SYNC_NETWORK_UNAVAILABLE`, `SYNC_EVENT_REJECTED`, `DATABASE_MIGRATION_FAILED`, `PLATFORM_CAPABILITY_UNAVAILABLE`.

Setiap error: pesan aman, detail tersensor, `retryable`, `correlationId`.
