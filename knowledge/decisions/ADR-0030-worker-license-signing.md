# ADR-0030 — Penerbitan lisensi Ed25519 di Cloudflare Worker

- **Status:** Accepted (kunci provisional) · **Tanggal:** 2026-10-24
- **Konteks:** Aplikasi Tauri membutuhkan aktivasi online (`POST /v1/activations`) yang mengembalikan lisensi bertanda tangan Ed25519. Sebelumnya endpoint lisensi di Worker mengembalikan `501`; hanya server referensi lokal yang mengimplementasikannya. Web `/api/activation` adalah alur berbeda (aktivasi perangkat lewat website).

## Keputusan

1. Worker `workers/api` kini mengimplementasikan:
   - `POST /v1/activations` — serial → lisensi bertanda tangan; binding `machine_id`, batas status/expiry, audit.
   - `POST /v1/licenses/refresh` — re-issue untuk perangkat yang sama; subscription memperpanjang `LICENSE_SUBSCRIPTION_DAYS`.
   - `POST /v1/licenses/verify` — verifikasi tanda tangan + status/machine/expiry.
   - Transfer/deaktivasi tetap `501 LICENSE_ADMIN_NOT_IMPLEMENTED` sampai RBAC admin diputuskan.
2. Serial di-hash `SHA-256(ACTIVATION_CODE_PEPPER : SERIAL.trim().toUpperCase())`, konsisten dengan web activation.
3. Private key Ed25519 (PKCS8 base64) disimpan sebagai secret Worker `LICENSE_SIGNING_PRIVATE_KEY`; public key di `[vars]` `LICENSE_PUBLIC_KEY` dan dipakai aplikasi lewat `IFP_LICENSE_KEYS`.
4. Payload lisensi mengikuti kontrak `server/src/license.ts` (schemaVersion `1.0.0`, entitlements `core`, grace 7 hari, keyId `prod-1`). Tanda tangan memakai canonical JSON (key terurut).

Isi payload: `schemaVersion, licenseId, productId, licenseType, machineId, deviceKeyThumbprint(null), issuedAt, notBefore, expiresAt, offlineGraceDays, entitlements, keyId`.

## Konsekuensi

- Aplikasi dapat aktivasi online dengan `VITE_LICENSE_SERVER_URL=https://gerbangedukasi-api.edukasigerbang.workers.dev` (build-time) dan `IFP_LICENSE_KEYS` (runtime) + `IFP_LICENSE_PRODUCT_ID=ifp-learning`.
- **Kunci `prod-1` bersifat provisional** untuk OD-6; keputusan KMS/HSM dan rotasi kunci produksi masih terbuka. Private key hanya ada di secret Worker dan file lokal `%TEMP%\gerbang-license-signing-key.txt` (harus dibackup aman lalu dihapus).
- `max_devices` belum diterapkan untuk lisensi aplikasi (binding satu machine); perlu tabel perangkat multi-seat bila dibutuhkan.
- Distribusi aplikasi memerlukan public key yang tertanam (saat ini env runtime); perlu build-time embed sebelum rilis.
- Verifikasi: 11/11 unit test Worker, aktivasi live 200 + signature valid, konflik 409, verify `valid:true`, aktivasi online dari aplikasi Tauri PASS.
