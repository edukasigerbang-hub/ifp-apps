# ADR-0032 — Token Admin Provisial untuk Transfer/Deaktivasi Lisensi

**Status:** Accepted (provisional) · **Tanggal:** 2026-10-25

## Konteks

Worker lisensi mengembalikan 501 untuk `POST /v1/licenses/transfer` dan `POST /v1/activations/deactivate`. Otorisasi admin final (OIDC/RBAC) belum diputuskan, tetapi operasi lisensi produksi membutuhkan endpoint ini.

## Keputusan

1. Endpoint diimplementasikan di `workers/api/src/licenseAdmin.ts`.
2. Otorisasi memakai bearer `ADMIN_API_TOKEN` dari secret Worker.
3. Perbandingan token memakai SHA-256 + loop XOR konstan-waktu; token kosong ditolak.
4. Jika `ADMIN_API_TOKEN` belum diset, endpoint mengembalikan **503** (fail-closed), bukan 501.
5. Setiap perubahan menulis `license_audit` dengan actor `license-admin`.
6. Ini **provisional**: belum ada peran/otorisasi per-admin; rotasi token manual.

## Konsekuensi

- Blocker B-03 tidak lagi memblokir kode; deployment menunggu secret `ADMIN_API_TOKEN` dan persetujuan user.
- Sebelum multi-admin/produksi penuh, ganti dengan OIDC/RBAC dan audit aktor per pengguna.
- Transfer menolak lisensi revoked/cancelled/expired; deaktivasi melepas binding tanpa mengubah status lisensi.
- Test: 13/13 Worker tests PASS; `worker:typecheck` PASS.
