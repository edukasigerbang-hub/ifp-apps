# Worker API — Gerbang Edukasi

**Bukan endpoint lisensi produksi.** Worker ini menangani enrollment perangkat dan sinkronisasi event ke Supabase.

## Prasyarat Supabase

Repo [`edukasigerbang-hub/web`](https://github.com/edukasigerbang-hub/web) sudah memiliki `supabase/migrations/0001_init.sql` (profiles, licenses, devices, activations, partners, content, orders).

1. Jalankan `0001_init.sql` (web) pada project Supabase.
2. Jalankan `supabase/migrations/0002_app_backend.sql`, `0003_ifp_devices.sql` lalu `0004_material_catalog.sql` (repo ini) — aditif: `enrollment_codes`, `sync_events`, `license_audit`, `admin_roles`, kolom lisensi tambahan, tabel `ifp_devices`, dan tabel katalog `materials`.
3. Worker memakai `public.ifp_devices.device_id` (text unik) dan `platform` (`windows|android`). Tabel `public.devices` milik project Fanakon tidak dipakai.

## Menjalankan lokal

```bash
cp .dev.vars.example .dev.vars   # isi nilai, jangan commit
npx wrangler dev
```

## Deploy

```bash
npx wrangler deploy
```

Produksi: `https://gerbangedukasi-api.edukasigerbang.workers.dev` (terverifikasi 2026-10-24).
`CORS_ORIGIN="*"` untuk sementara karena origin WebView2 berbeda per platform (Windows `https://tauri.localhost`, Android `http://tauri.localhost`); persempit setelah origin final ditetapkan.

## Endpoint

| Method | Path | Auth | Catatan |
|---|---|---|---|
| GET | `/healthz` | — | Health check |
| POST | `/v1/devices/enroll` | kode enrollment | Body: `enrollmentCode`, `platform`, `deviceId?` → token Bearer HMAC |
| POST | `/v1/sync/events` | token perangkat | `deviceId` batch harus sama dengan token |
| POST | `/v1/activations` | — | Serial → lisensi bertanda tangan Ed25519 (machine binding) |
| POST | `/v1/licenses/refresh` | — | Perbarui masa berlaku lisensi subscription |
| POST | `/v1/licenses/verify` | — | Verifikasi tanda tangan + status lisensi |
| POST | `/v1/licenses/transfer`, `/v1/activations/deactivate` | admin | 501 sampai RBAC/admin token diputuskan |
| GET | `/v1/materials` | — | Katalog materi HTML5 (§6): `grade` `subject` `cursor` `limit`; hanya `reviewed`/`approved`; ETag + URL unduhan berumur pendek |
| POST | `/v1/materials/publish` | admin | multipart `manifest` + `bundle` (ZIP) + opsional `cover`; validator §4 → simpan Storage → tulis baris → tanda tangan Ed25519 |
| POST | `/v1/materials/unpublish` | admin | JSON `{materialId, version}` → menandai `unpublished_at`, baris tidak dihapus |

## Materi HTML5 (kontrak bundel v1 §6/§11, ADR-0035)

Sisi platform penerbitan ada di tiga endpoint di atas. Alur satu kali terbit:

```bash
# 0) Prasyarat sekali (aksi pemilik project, bukan skrip):
#    - jalankan supabase/migrations/0004_material_catalog.sql
#    - buat bucket Storage private `material-bundles`
#    - wrangler secret put CONTENT_SIGNING_KEY  + ADMIN_API_TOKEN
#    - bakar publik key pasangan CONTENT_SIGNING_KEY ke build aplikasi lewat IFP_CONTENT_KEYS

# 1) Terbit dari folder bundel (mis. hasil ekspor Studio atau src-tauri/sample-material-…):
ADMIN_API_TOKEN=… npm run material:publish -- --source src-tauri/sample-material-fakta-opini --api http://localhost:8787
ADMIN_API_TOKEN=… npm run material:publish -- unpublish --material-id fakta-opini-kelas4 --version 1.0.0 --api http://localhost:8787
```

Catatan yang menegakkan kontrak:

- Worker menandatangani **manifest apa adanya seperti tersimpan di `jsonb`** (baca ulang setelah tulis), supaya byte yang nanti dikirim ke perangkat persis yang ditandatangani.
- Versi yang sama dengan isi berbeda ditolak `409 MATERIAL_VERSION_CONFLICT` (§11.6); terbit ulang hanya boleh untuk bundel dengan `bundle_sha256` sama.
- Baris tanpa `signature`/`key_id` tidak pernah disajikan; kegagalan URL bundel = `502`, kegagalan URL cover hanya menghilangkan `coverUrl`.
- `draft` hanya terlihat bagi pemanggil yang membawa `Authorization: Bearer $ADMIN_API_TOKEN` (OD-10).
- Skrip penerbit tidak pernah memegang kunci konten; kunci hanya ada sebagai secret Worker.

## Secret

`wrangler secret put SUPABASE_SERVICE_ROLE_KEY` · `DEVICE_TOKEN_SECRET` · `ENROLLMENT_CODE_PEPPER` · `ACTIVATION_CODE_PEPPER` · `LICENSE_SIGNING_PRIVATE_KEY` (PKCS8 base64) · `ADMIN_API_TOKEN` · `CONTENT_SIGNING_KEY` (Ed25519 PKCS8 base64).
`SUPABASE_URL`, `CORS_ORIGIN`, `LICENSE_KEY_ID`, `LICENSE_PRODUCT_ID`, `LICENSE_PUBLIC_KEY`, `LICENSE_SUBSCRIPTION_DAYS`, `LICENSE_GRACE_DAYS`, `CONTENT_KEY_ID`, `CONTENT_BUCKET`, `MATERIAL_URL_TTL_SECONDS` via `[vars]`.

## Lisensi di aplikasi

```bash
VITE_LICENSE_SERVER_URL=https://gerbangedukasi-api.edukasigerbang.workers.dev \
IFP_LICENSE_KEYS='[{"keyId":"prod-1","publicKey":"<LICENSE_PUBLIC_KEY>"}]' \
IFP_LICENSE_PRODUCT_ID=ifp-learning \
npm run tauri build
```

Lisensi offline memakai pasangan kunci yang sama (`scripts/license-issuer.mjs`) dan `IFP_LICENSE_KEYS`.
