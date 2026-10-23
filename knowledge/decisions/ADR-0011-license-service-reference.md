# ADR-0011 — License Service referensi (server)

- **Status:** Accepted (reference implementation; not production) · **Tanggal:** 2026-10-24
- **Konteks:** Client license core (ADR-0010) sudah memverifikasi lisensi native, tetapi aktivasi online masih stub. Server referensi sinkronisasi sudah ada dan dapat diperluas.

## Keputusan

1. Endpoint lisensi ditambahkan ke server referensi yang sama (`server/`, port 8788):
   - `POST /v1/activations` — serial + machineId → lisensi bertanda tangan.
   - `POST /v1/licenses/refresh` — perpanjang subscription.
   - `POST /v1/licenses/verify` — verifikasi signature + registry.
   - `POST /v1/licenses/transfer` — admin only.
   - `POST /v1/activations/deactivate` — admin only.
2. Serial disimpan **hanya sebagai hash SHA-256** (`licenses.serial_hash`, UNIQUE).
3. Aktivasi mengikat `machine_id` secara atomik; serial yang sudah terikat ke perangkat lain → `409 LICENSE_ACTIVATION_CONFLICT`. Aktivasi ulang mesin yang sama bersifat idempotent.
4. Lisensi ditandatangani server dengan **Ed25519** atas canonical JSON yang sama dengan client (dan issuer dev).
5. Subscription memperoleh expiry `now + LICENSE_SUBSCRIPTION_DAYS` (default 30) + `offlineGraceDays` 7; perpetual tanpa expiry.
6. Transfer/deaktivasi memerlukan `Authorization: Bearer <LICENSE_ADMIN_TOKEN>`; setiap aksi menulis `license_audit`.
7. Serial awal di-seed via env `LICENSE_SEED_SERIALS` (dev); signing key dari `LICENSE_SIGNING_KEY_PATH` (PEM PKCS8).
8. Client mengaktifkan lewat `VITE_LICENSE_SERVER_URL` → server → respons lisensi → `license_import_json` (verifikasi native + simpan).

## Konsekuensi

- **Bukan produksi:** tanpa TLS, admin token statis, seed serial via env, rate limit per-IP (bukan per-serial), tanpa penerbitan serial/akun/tenant.
- Revocation hanya tersedia sebagai metode store (belum endpoint admin).
- Transfer/deaktivasi belum memiliki UI; diuji lewat API.
- Kebijakan komersial (OD-5), retensi/audit (OD-4), dan deployment (OD-7) tetap terbuka.

## Alternatif

| Alternatif | Alasan ditolak |
|---|---|
| Menyimpan serial plaintext | LLD meminta hash; mengurangi dampak kebocoran |
| Lisensi ditandatangani client | Private key tidak boleh di klien |
| Aktivasi tanpa registry | Tidak bisa mencegah serial ganda/transfer |
| Server terpisah | Menambah deployment tanpa kebutuhan referensi |
