# ADR-0025 — Default privasi & retensi (provisional, OD-4)

- **Status:** Accepted (provisional) · **Tanggal:** 2026-10-24
- **Konteks:** [Proposal OD-4](PROPOSAL-OD-4-privacy-retention.md) meminta keputusan legal/privasi. Sampai keputusan itu ada, aplikasi memerlukan perilaku default yang aman, dapat dijelaskan ke sekolah, dan reversible.

## Keputusan (default sementara)

1. **Retensi lokal:** data belajar disimpan sampai dihapus eksplisit; **tidak ada pemangkasan otomatis**.
2. **Tidak ada sinkronisasi nama:** payload sinkronisasi hanya memuat `profileId` (UUID) dan data hasil; nama profil tidak dikirim.
3. **Hapus profil:** menghapus sesi/percobaan/progres/outbox terkait (sudah); profil dengan riwayat review diblokir (`PROFILE_HAS_REVIEWS`).
4. **Ekspor = PII:** CSV hasil dan CSV audit review memuat nama; UI menampilkan peringatan bahwa file yang sudah diekspor tidak ikut terhapus.
5. **Backup** tetap manual; backup menyimpan salinan penuh (termasuk PII) dan tidak ikut berubah saat data dihapus.
6. **Diagnostik** tetap diredaksi (ID perangkat disamarkan; tanpa nama/payload).
7. **Pemberitahuan** ditampilkan di Pengaturan → “Privasi & data”.

## Konsekuensi

- Perilaku ini **bukan** persetujuan legal; kebijakan resmi (retensi server, consent, SLA hapus) tetap menunggu OD-4.
- Bila kebijakan resmi berbeda (mis. prune otomatis 12 bulan), perlu migrasi/opsi tambahan.
- Peringatan PII harus dipertahankan pada setiap jalur ekspor baru.

## Alternatif

| Alternatif | Alasan ditolak |
|---|---|
| Menunggu OD-4 tanpa default | Aplikasi tetap dipakai; risiko ekspor tanpa peringatan |
| Prune otomatis tanpa kebijakan | Dapat menghapus data sekolah secara tak terduga |
| Menyinkronkan nama siswa | Memperbesar PII server sebelum ada dasar hukum |
