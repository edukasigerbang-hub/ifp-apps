# ADR-0029 — Isolasi perangkat IFP dengan tabel `ifp_devices`

- **Status:** Accepted · **Tanggal:** 2026-10-24
- **Konteks:** Project Supabase `qbccunwxfrwauuepxcbo` ternyata dipakai bersama aplikasi **Fanakon** (`F:\fanakon`, relay ESP32). Tabel `public.devices` sudah ada sebelum migrasi Gerbang, sehingga `create table if not exists` di `0001_init.sql` tidak membuat skema Gerbang. Tabel Fanakon: `devices`, `device_commands`, `device_events`, `device_telemetry`, `profiles`, `products`. Database dashboard meminta kolom `label`/`license_id` yang tidak ada → PostgREST 400; enrollment IFP juga akan menulis ke tabel relay.

## Keputusan

1. Gerbang memakai tabel terpisah **`public.ifp_devices`** (migrasi `supabase/migrations/0003_ifp_devices.sql`): `device_id` unik, `license_id`, `platform` (`windows|android`), `label`, `status` (`active|inactive|revoked`), `activated_at`, `owner_id`, `last_seen_at`, `created_at`; RLS owner select/insert.
2. FK `sync_events.device_id` diarahkan ulang ke `ifp_devices(device_id)`.
3. Dashboard web (`dashboardData`, `/api/activation`) dan Worker (`/v1/devices/enroll`, `/v1/sync/events`) memakai `ifp_devices`.
4. **Tabel dan data Fanakon tidak diubah/dihapus.** Tidak ada `DROP`/rename pada tabel Fanakon.

## Konsekuensi

- Skema Gerbang tidak lagi bergantung pada `public.devices`; asumsi di ADR-0028 bahwa `devices` milik web **tidak berlaku**.
- `profiles` dan `products` tetap dipakai bersama Fanakon; Gerbang tidak menulis ke keduanya pada alur ini.
- Untuk isolasi penuh di masa depan, project Supabase terpisah tetap opsi yang lebih bersih (biaya: provisioning ulang auth/env/secret).
- Verifikasi: migrasi dijalankan di SQL Editor; `ifp_devices` dapat dibaca via REST (200), Worker versi `872ec15d` live, bundle web memuat `ifp_devices`.
