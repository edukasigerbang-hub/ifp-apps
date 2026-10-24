# Proposal OD-5 — Kebijakan Lisensi

**Status:** DRAFT untuk keputusan · **Tanggal:** 2026-10-24 · **Pemilik:** Product Owner + Finance/Legal
**Bukan kebijakan final.** Menentukan semantik grace, transfer, dan pembatalan yang memengaruhi implementasi.

## 1. Kondisi Saat Ini

- Lisensi Ed25519 bertanda tangan; payload memuat `licenseType`, masa berlaku, `offlineGraceDays`, entitlements, `keyId`.
- Klien memverifikasi native; server referensi mendukung aktivasi, refresh, verify, transfer/deactivate admin, audit.
- Belum ada: deteksi clock rollback, batas transfer, UI transfer, kebijakan pembatalan/refund, lisensi per sekolah.

## 2. Opsi Model Lisensi

| Model | Kelebihan | Kekurangan |
|---|---|---|
| Per perangkat (subscription) | Sederhana, cocok IFP | Penggantian perangkat perlu transfer |
| Per sekolah (site license) | Mudah untuk banyak panel | Perlu kuota/penegakan |
| Perpetual + update subscription | Sekolah suka "beli putus" | Pendapatan berulang lebih rendah |
| Hybrid (perpetual core + layanan konten) | Fleksibel | Kontrak lebih rumit |

**Rekomendasi:** subscription per perangkat untuk pilot, dengan opsi site license setelah data penggunaan tersedia.

## 3. Parameter yang Perlu Diputuskan

| Parameter | Usulan awal | Catatan |
|---|---|---|
| Grace offline | 7 hari (sudah default) | Dapat diperpanjang untuk sekolah tanpa internet stabil |
| Interval refresh | 30 hari saat online | Sebelum grace habis |
| Batas transfer | 1× per 30 hari | Admin melakukan; perangkat lama dinonaktifkan |
| Clock rollback | Deteksi; jam mundur → gunakan waktu terakhir terverifikasi | Perlu implementasi |
| Revocation | Server menandai revoked; klien menolak saat refresh | Offline tidak langsung tahu |
| Refund/pembatalan | Kebijakan komersial | Belum diimplementasikan |
| Entitlements | `core` sekarang | Fitur berbayar lain menyusul |

## 4. Alur yang Disarankan

1. Enrollment perangkat → aktivasi (online/offline) → lisensi tersimpan.
2. Refresh berkala; grace bila offline.
3. Transfer: admin server → perangkat lama revoked → perangkat baru aktivasi.
4. Revocation: tercatat di audit; klien menolak pada refresh berikutnya.
5. Semua aksi tercatat append-only di server.

## 5. Keputusan yang Diminta

- [ ] Model lisensi (per perangkat / per sekolah / perpetual / hybrid).
- [ ] Panjang grace dan interval refresh.
- [ ] Aturan transfer & penonaktifan perangkat lama.
- [ ] Kebijakan clock rollback dan toleransi.
- [ ] Kebijakan revocation/refund.
- [ ] Daftar entitlement berbayar (di luar `core`).

## 6. Kriteria Selesai OD-5

1. Kebijakan tertulis disetujui (termasuk teks untuk sekolah).
2. Server produksi menerapkan aturan transfer/revocation dengan audit.
3. Klien menangani grace, rollback, dan revocation sesuai kebijakan.
4. Uji E2E: aktivasi, refresh, transfer, revoke, grace habis.
