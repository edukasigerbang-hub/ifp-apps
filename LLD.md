# LLD --- Low-Level Design

## 1. Konvensi

-   Semua ID domain menggunakan UUID/ULID yang tidak bergantung pada
    nama tampilan.
-   Semua waktu tersimpan sebagai UTC ISO-8601 atau integer epoch yang
    konsisten; UI menampilkan zona waktu lokal.
-   Versi paket menggunakan SemVer atau kebijakan versi yang
    didefinisikan eksplisit.
-   Semua input file/paket dianggap tidak tepercaya.
-   Perubahan database memakai migrasi bernomor dan diuji dari versi
    sebelumnya.
-   Error memiliki `code`, `message` aman untuk pengguna, `retryable`,
    dan `correlationId` bila relevan.

## 2. Konfigurasi produk

Display name dapat diubah tanpa mengubah identitas teknis.

Contoh konfigurasi:

``` ts
export const productConfig = {
  app: {
    displayName: "Gerbang Edukasi – IFP Apps",
    publisherName: "Gerbang Edukasi",
    productId: "ifp-learning"
  },
  platform: {
    windowsIdentifier: "id.gerbangedukasi.ifp",
    androidApplicationId: "id.gerbangedukasi.ifp"
  },
  licensing: {
    productId: "ifp-learning"
  }
} as const;
```

**PROPOSED:** contoh ID di atas belum final. Konfirmasi nama legal
publisher dan identifier unik sebelum rilis. Setelah rilis, jangan
mengubah Windows identifier atau Android applicationId tanpa rencana
migrasi karena dapat memengaruhi update, data lokal, dan lisensi.
`displayName` bukan identifier keamanan.

## 3. Domain model konten

### ContentPackage

-   `packageId`: ID stabil.
-   `version`: versi immutable.
-   `schemaVersion`: versi skema yang digunakan.
-   `title`, `locale`, `gradeLevels`, `subjects`.
-   `curriculumRefs`: referensi resmi dan versi kurikulum.
-   `assets`: daftar path, media type, size, SHA-256.
-   `dependencies`: package ID + range versi.
-   `signature`: optional/required sesuai kebijakan distribusi.
-   `releaseState`: draft, validated, approved, published, withdrawn.

### Lesson

-   `lessonId`, `packageId`, `title`, `summary`.
-   `curriculumRefs`, `learningObjectives`.
-   `activities[]`, `assessmentRefs[]`.
-   `assetRefs[]`, `accessibilityMetadata`.
-   `contentVersion`, `reviewStatus`.

### Activity contract

-   `activityId`, `type`, `schemaVersion`, `title`.
-   `instructions`, `assets`, `interactionConfig`.
-   `assessmentConfig` bila aktivitas dinilai.
-   `completionPolicy`, `feedbackPolicy`.
-   `runtimeCapabilities` seperti `touch`, `audio`, `webgl` (metadata
    untuk kompatibilitas, bukan jaminan).

Jenis aktivitas menggunakan registry yang diizinkan oleh aplikasi.
Jangan menerima nama modul JavaScript atau path executable dari paket
konten.

## 4. Manifest contoh

``` json
{
  "manifestVersion": 1,
  "packageId": "subject-grade-unit-001",
  "packageVersion": "1.0.0",
  "schemaVersion": "1.0.0",
  "title": "Contoh Unit Pembelajaran",
  "locale": "id-ID",
  "gradeLevels": [1],
  "subjects": ["subject-id"],
  "curriculumRefs": [],
  "assets": [
    {
      "path": "assets/images/example.webp",
      "mediaType": "image/webp",
      "sizeBytes": 12345,
      "sha256": "REPLACE_WITH_REAL_HASH"
    }
  ],
  "dependencies": [],
  "signature": null
}
```

Contoh ini bersifat skematis; nilai hash dan referensi kurikulum
placeholder harus diganti. Jangan menerbitkan contoh sebagai paket
valid.

## 5. Paket dan file system

-   Bundled content: read-only assets yang ikut installer/build,
    misalnya build resource directory.
-   Managed content: app-data directory yang dikelola Content Manager.
-   Jangan menganggap folder `public/` setelah bundling selalu dapat
    ditulis pengguna.
-   Windows: sediakan `Open Content Folder` yang membuka managed content
    directory.
-   Android: gunakan Storage Access Framework / system document picker
    yang sesuai; jangan bergantung pada akses arbitrary path.
-   Import harus membatasi path traversal, symlink berbahaya, ukuran
    file, jumlah file, compression ratio, dan tipe file.
-   Extract ke staging; tolak file di luar root paket.
-   Paket aktif tidak dihapus saat update. Aktivasi versi baru dilakukan
    melalui transaksi/marker aktif setelah validasi.

### State machine paket

`discovered → importing → validating → staged → active` - Validasi
gagal: `rejected`, simpan kode alasan. - Aktivasi gagal: pertahankan
versi aktif sebelumnya. - Add-on: boleh `disabled` atau `removed` jika
tidak dipakai sesi aktif/dependensi lain. - Bundled core: boleh
`hidden/disabled` jika kebijakan produk mengizinkan, tetapi tidak
dihapus secara permanen melalui operasi normal.

## 6. Database lokal

### Tabel minimum

-   `profiles(id, display_name, profile_type, created_at, updated_at)`
-   `content_packages(package_id, version, source, status, manifest_hash, installed_at)`
-   `content_assets(package_id, version, asset_path, sha256, size_bytes)`
-   `learning_sessions(id, profile_id, lesson_id, package_id, package_version, started_at, completed_at, state)`
-   `activity_attempts(id, session_id, activity_id, attempt_no, started_at, completed_at, score, state)`
-   `assessment_responses(id, attempt_id, question_id, response_json, is_correct, answered_at)`
-   `progress_snapshots(id, profile_id, lesson_id, package_version, progress_json, updated_at)`
-   `sync_outbox(id, event_id, event_type, payload_json, created_at, attempts, next_attempt_at, state, last_error_code)`
-   `schema_migrations(version, applied_at, checksum)`

Detail tipe, constraint, index, dan retensi harus menjadi migrasi
eksplisit. Hindari menyimpan data identitas siswa yang tidak diperlukan.
Tentukan kebijakan penghapusan profil dan ekspor data sebelum produksi.

### Aturan transaksi

-   Simpan respons/hasil dan event outbox dalam transaksi yang sama.
-   `event_id` unik; server melakukan deduplication.
-   Jangan menghapus event outbox sampai acknowledgement server
    tersimpan.
-   Retry menggunakan exponential backoff dengan jitter dan batas yang
    dapat dikonfigurasi.
-   Hindari menyimpan seluruh media biner dalam SQLite.
-   Backup harus konsisten dan diuji restore-nya.

## 7. Sinkronisasi

### Alur

1.  Repository menulis data lokal dan outbox dalam satu transaksi.
2.  Sync engine memilih batch yang eligible ketika jaringan tersedia.
3.  Client mengirim `eventId`, `deviceId`, `schemaVersion`, `createdAt`,
    dan payload yang tervalidasi.
4.  Server memvalidasi authorization, ukuran, schema, dan idempotency.
5.  Server menyimpan hasil dan mengembalikan per-event acknowledgement.
6.  Client menandai event acknowledged setelah ack terverifikasi.
7.  Kegagalan jaringan tidak menghentikan belajar; event tetap di
    outbox.

### Konflik

-   Hasil evaluasi dan respons historis bersifat append-only.
-   Ringkasan progres dapat dihitung ulang dari event, dengan aturan
    deterministik.
-   Jangan menggunakan last-write-wins untuk menghapus atau mengganti
    jawaban historis.
-   Akun cloud tidak wajib untuk pembelajaran lokal. Bila sinkronisasi
    memerlukan identitas, proses linking akun/tenant harus eksplisit dan
    opsional.
-   Tentukan bagaimana profil lokal dipetakan ke cloud sebelum
    mengaktifkan sinkronisasi produksi.

## 8. Kontrak Rust / Tauri

Commands yang direkomendasikan: - `license_get_status` -
`license_get_machine_id` - `license_activate_online` -
`license_export_request` - `license_import_file` - `license_refresh` -
`license_get_entitlements` - `license_request_deactivation` -
`content_import_package` - `content_validate_package` -
`content_activate_package` - `content_list_packages` -
`content_open_managed_folder` (platform-dependent) -
`content_remove_addon` - `app_export_diagnostics`

Aturan: - Validasi argumen dan batas ukuran pada native boundary. -
Jangan expose command generik untuk menjalankan shell, arbitrary file
path, atau arbitrary code. - Tampilkan typed errors; jangan kirim
panic/backtrace/secret ke UI. - Commands yang mengubah state harus
idempotent atau memiliki request ID. - Terapkan capability/permission
Tauri minimal dan allowlist yang ketat. - API command di atas adalah
usulan kontrak, bukan bukti bahwa plugin/command sudah tersedia di
platform.

## 9. License Manager

### Identitas

-   Buat random installation ID kriptografis, disimpan di app-data dan
    stabil saat update.
-   Jangan gunakan hardware fingerprint sebagai default.
-   Jika app-data dihapus atau aplikasi diinstal ulang, installation ID
    mungkin berubah; sediakan proses transfer/reset yang diawasi.
-   Optional device keypair hanya setelah secure storage pada target
    teruji.

### Signed license

Payload minimal: - `schemaVersion`, `licenseId`, `productId`,
`licenseType`. - `machineId`, optional `deviceKeyThumbprint`. -
`issuedAt`, `notBefore`, `expiresAt` (null untuk perpetual). -
`offlineGraceDays`, `entitlements`, `keyId`. - Signature Ed25519 atas
representasi payload yang canonical/deterministic.

Private signing key hanya di issuer. Client hanya membawa public key/key
rotation set. Jangan menandatangani JSON non-canonical dengan asumsi
byte serialization selalu sama.

### Serial dan activation

-   Serial memiliki entropy kriptografis minimal 128-bit sebelum
    encoding.
-   Server menyimpan hash serial; tidak menyimpan plaintext serial bila
    tidak diperlukan.
-   Aktivasi harus atomik dengan unique binding; cegah dua perangkat
    memenangkan race.
-   Gunakan idempotency key dan rate limit.
-   Offline request berisi product ID, installation ID, request
    ID/nonce, dan public key bila device-key binding digunakan.
-   Offline issuer harus merekonsiliasi binding dengan database
    otoritatif; tool offline tanpa state bersama berisiko menerbitkan
    lisensi ganda.
-   Perpetual license tidak memiliki expiry normal, tetapi kebijakan
    pencabutan yang sah harus terdokumentasi.
-   Subscription offline bergantung pada signed expiry/grace. Offline
    revocation tidak dapat diterapkan seketika.
-   Perubahan jam sistem harus menjadi sinyal risiko, bukan satu-satunya
    kontrol keamanan.

### Server endpoint konseptual

-   `POST /v1/activations`
-   `POST /v1/activations/verify`
-   `POST /v1/licenses/refresh`
-   `POST /v1/licenses/transfer`
-   `POST /v1/activations/deactivate`

Endpoint, auth, request/response schema, rate limits, dan error contract
harus dirinci sebelum backend implementasi.

## 10. Error model

Gunakan kode stabil, misalnya: - `CONTENT_PACKAGE_INVALID` -
`CONTENT_SCHEMA_UNSUPPORTED` - `CONTENT_ASSET_HASH_MISMATCH` -
`CONTENT_DEPENDENCY_MISSING` - `CONTENT_ACTIVATION_FAILED` -
`LICENSE_SIGNATURE_INVALID` - `LICENSE_WRONG_PRODUCT` -
`LICENSE_DEVICE_MISMATCH` - `LICENSE_EXPIRED` -
`LICENSE_ACTIVATION_CONFLICT` - `SYNC_NETWORK_UNAVAILABLE` -
`SYNC_EVENT_REJECTED` - `DATABASE_MIGRATION_FAILED` -
`PLATFORM_CAPABILITY_UNAVAILABLE`

Setiap error harus memiliki pesan aman bagi pengguna, detail teknis yang
disensor, status retryable, dan correlation ID bila relevan.

## 11. Pengujian minimum

-   Schema/content parser: valid, malformed, unsupported version,
    oversized files, traversal, missing asset, hash mismatch.
-   Update: success, interruption, crash during staging, crash during
    activation, rollback.
-   Local DB: migration from previous version, corruption recovery,
    backup/restore.
-   Sync: offline, timeout, duplicate event, partial acknowledgement,
    retry, conflict.
-   License: forged/modified signature, wrong product, wrong device,
    expired subscription, perpetual offline, clock rollback, key
    rotation, concurrent activation, transfer.
-   UI: touch-only, keyboard accessibility where applicable, Full HD,
    4K, text scaling, no hover-only controls.
-   Device: cold start, resume, media playback, 3D, import/export, low
    free space, long-running session.
