# ADR-0027 — OD-7 increment 1: auth perangkat & kontrak OpenAPI

- **Status:** Accepted (reference implementation) · **Tanggal:** 2026-10-24
- **Konteks:** [Proposal OD-7](../api/PRODUCTION_BACKEND_PROPOSAL.md) meminta keputusan hosting/vendor. Bagian yang tidak bergantung vendor dapat dimulai: kontrak API dan autentikasi perangkat. Server referensi saat ini hanya memakai `SYNC_TOKEN` statis.

## Keputusan

1. **Kontrak OpenAPI 3.1** di `server/openapi.v1.yaml` untuk health, enrollment, sync, dan lisensi (aktivasi/refresh/verify/transfer/deactivate).
2. **Enrollment perangkat** (`POST /v1/devices/enroll`):
   - kode enrollment dari environment dibandingkan constant-time;
   - server menerbitkan `deviceId` (UUID) + token Bearer HMAC-SHA256 berisi `{deviceId, iat, exp}`;
   - masa berlaku default 24 jam (`DEVICE_TOKEN_TTL_SECONDS`);
   - endpoint nonaktif (503) bila belum dikonfigurasi.
3. **Sync menerima token perangkat**; `SYNC_TOKEN` statis tetap didukung **hanya** untuk referensi/pengujian. Bila token perangkat dipakai, `deviceId` pada batch wajib sama (`403 DEVICE_MISMATCH`).
4. **`GET /healthz`** ditambahkan (alias `/health`).
5. **Tidak** mengubah klien: enrollment klien, rotasi token, dan penjadwalan refresh belum diimplementasikan.

## Konsekuensi

- Server referensi kini memiliki dasar auth perangkat tanpa dependensi baru (node:crypto).
- Token perangkat bersifat bearer; pencurian token memungkinkan akses sampai kedaluwarsa. Produksi perlu TLS, rotasi, dan pencabutan token.
- Admin masih memakai token statis; RBAC/OIDC menunggu keputusan OD-7.
- Hosting, Postgres/object storage, signing konten, dan CSP produksi tetap terbuka.

## Alternatif

| Alternatif | Alasan ditolak |
|---|---|
| Menunggu keputusan hosting | Kontrak & auth perangkat tidak bergantung vendor |
| JWT library | Menambah dependensi; HMAC compact token cukup untuk referensi |
| Hanya `SYNC_TOKEN` statis | Tidak ada identitas perangkat; tidak layak produksi |
