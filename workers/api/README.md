# Worker API — Gerbang Edukasi

**Bukan endpoint lisensi produksi.** Worker ini menangani enrollment perangkat dan sinkronisasi event ke Supabase.

## Prasyarat Supabase

Repo [`edukasigerbang-hub/web`](https://github.com/edukasigerbang-hub/web) sudah memiliki `supabase/migrations/0001_init.sql` (profiles, licenses, devices, activations, partners, content, orders).

1. Jalankan `0001_init.sql` (web) pada project Supabase.
2. Jalankan `supabase/migrations/0002_app_backend.sql` lalu `0003_ifp_devices.sql` (repo ini) — aditif: `enrollment_codes`, `sync_events`, `license_audit`, `admin_roles`, kolom lisensi tambahan, dan tabel `ifp_devices`.
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

## Secret

`wrangler secret put SUPABASE_SERVICE_ROLE_KEY` · `DEVICE_TOKEN_SECRET` · `ENROLLMENT_CODE_PEPPER` · `ACTIVATION_CODE_PEPPER` · `LICENSE_SIGNING_PRIVATE_KEY` (PKCS8 base64).
`SUPABASE_URL`, `CORS_ORIGIN`, `LICENSE_KEY_ID`, `LICENSE_PRODUCT_ID`, `LICENSE_PUBLIC_KEY`, `LICENSE_SUBSCRIPTION_DAYS`, `LICENSE_GRACE_DAYS` via `[vars]`.

## Lisensi di aplikasi

```bash
VITE_LICENSE_SERVER_URL=https://gerbangedukasi-api.edukasigerbang.workers.dev \
IFP_LICENSE_KEYS='[{"keyId":"prod-1","publicKey":"<LICENSE_PUBLIC_KEY>"}]' \
IFP_LICENSE_PRODUCT_ID=ifp-learning \
npm run tauri build
```

Lisensi offline memakai pasangan kunci yang sama (`scripts/license-issuer.mjs`) dan `IFP_LICENSE_KEYS`.
