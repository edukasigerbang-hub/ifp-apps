# ADR-0028 — Stack backend produksi: Supabase + Cloudflare

- **Status:** Accepted (increment 2) · **Tanggal:** 2026-10-24
- **Konteks:** Product Owner memilih **Supabase** untuk database/layanan data dan **Cloudflare Workers/Pages** untuk hosting API & situs. Situs marketing sudah ada di `https://gerbangedukasi.edukasigerbang.workers.dev/` (halaman statis, CTA Demo/Kontak).

## Addendum 2026-10-24 — integrasi dengan repo `web`

Repo [`edukasigerbang-hub/web`](https://github.com/edukasigerbang-hub/web) (Next.js 16 + Supabase) **sudah memiliki migrasi** `supabase/migrations/0001_init.sql` dengan tabel `profiles`, `licenses`, `devices`, `activations`, `partners`, `content`, `orders`, trigger `handle_new_user`, dan RLS. Route `src/app/api/activation` masih placeholder.

Karena itu:

- Migrasi di repo ini diubah menjadi **aditif** `supabase/migrations/0002_app_backend.sql`; **tidak** membuat ulang `licenses`/`devices`.
- Kunci perangkat memakai `public.devices.device_id` (text unik) yang sudah ada; `platform` wajib (`windows|android`).
- Kolom lisensi baru (`serial_hash`, `product_id`, `license_type`, `machine_id`, `key_id`, `activated_at`) ditambahkan via `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` ke `licenses` milik web.
- Tabel baru: `enrollment_codes`, `sync_events`, `license_audit`, `admin_roles`; RPC `consume_enrollment_code`.
- Urutan deployment: jalankan `web/supabase/migrations/0001_init.sql` lalu `0002_app_backend.sql` pada project Supabase yang sama.
- Aktivasi lisensi tetap di route web `/api/activation` (masih placeholder); Worker hanya enrollment + sync pada increment ini.

## Keputusan

1. **Supabase (Postgres + RLS)** sebagai penyimpanan server: perangkat, kode enrollment (hash), event sync, lisensi, audit, peran admin.
2. **Cloudflare Worker** (`workers/api`) sebagai API edge untuk enrollment perangkat dan sinkronisasi event; memanggil Supabase REST memakai **service role key sebagai secret Worker** (tidak pernah dikirim ke klien).
3. **Token perangkat** HMAC-SHA256 diterbitkan Worker (format sama dengan server referensi: `base64url(payload).base64url(signature)`, default 24 jam).
4. **Kode enrollment** disimpan sebagai hash (`SHA-256(pepper:code)`); konsumsi atomik lewat fungsi Postgres `consume_enrollment_code` (`FOR UPDATE`).
5. **RLS tanpa policy publik**; akses data hanya lewat service role. Bila admin memakai Supabase Auth, policy berbasis `admin_roles` ditambahkan pada increment berikutnya.
6. **Endpoint lisensi di Worker** untuk sementara mengembalikan `501 LICENSE_ENDPOINT_NOT_IMPLEMENTED`; signing lisensi/konten di edge menunggu keputusan KMS/HSM.
7. **Situs marketing** dicatat di `productConfig.links.marketing`; belum ditautkan dari aplikasi (butuh plugin opener / keputusan navigasi).

## Konsekuensi

- Repo kini berisi: server referensi (uji E2E/lokal) **dan** Worker produksi (Supabase). Kontrak OpenAPI menjadi acuan bersama.
- Secret yang dibutuhkan Worker: `SUPABASE_SERVICE_ROLE_KEY`, `DEVICE_TOKEN_SECRET`, `ENROLLMENT_CODE_PEPPER`; URL dan CORS via vars.
- Belum ada: migrasi otomatis Supabase dari CI, Supabase Auth/RBAC admin, signing lisensi/konten di Worker, rate limit edge (Cloudflare WAF), observability.
- Situs marketing dan aplikasi masih terpisah; integrasi akun/pembelian belum ada.

## Alternatif

| Alternatif | Alasan tidak dipilih |
|---|---|
| Supabase Edge Functions saja | Worker dipilih untuk edge/CORS dan konsistensi hosting Cloudflare |
| Akses Supabase langsung dari klien | Service key tidak boleh di klien; RLS/IAM belum siap |
| Tetap di server referensi | Bukan produksi; keputusan Product Owner Supabase + Cloudflare |
