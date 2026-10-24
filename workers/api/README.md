# Worker API — Gerbang Edukasi

**Bukan endpoint lisensi produksi.** Worker ini menangani enrollment perangkat dan sinkronisasi event ke Supabase.

## Prasyarat Supabase

Repo [`edukasigerbang-hub/web`](https://github.com/edukasigerbang-hub/web) sudah memiliki `supabase/migrations/0001_init.sql` (profiles, licenses, devices, activations, partners, content, orders).

1. Jalankan `0001_init.sql` (web) pada project Supabase.
2. Jalankan `supabase/migrations/0002_app_backend.sql` (repo ini) — aditif: `enrollment_codes`, `sync_events`, `license_audit`, `admin_roles`, kolom lisensi tambahan.
3. Worker memakai `public.devices.device_id` (text unik) dan `platform` (`windows|android`).

## Menjalankan lokal

```bash
cp .dev.vars.example .dev.vars   # isi nilai, jangan commit
npx wrangler dev
```

## Endpoint

| Method | Path | Auth | Catatan |
|---|---|---|---|
| GET | `/healthz` | — | Health check |
| POST | `/v1/devices/enroll` | kode enrollment | Body: `enrollmentCode`, `platform`, `deviceId?` → token Bearer HMAC |
| POST | `/v1/sync/events` | token perangkat | `deviceId` batch harus sama dengan token |
| POST | `/v1/activations`, `/v1/licenses/*` | — | 501 sampai signing/KMS diputuskan |

## Secret

`wrangler secret put SUPABASE_SERVICE_ROLE_KEY` · `DEVICE_TOKEN_SECRET` · `ENROLLMENT_CODE_PEPPER`.
`SUPABASE_URL` dan `CORS_ORIGIN` via `[vars]` di `wrangler.toml`.
