# ADR-0012 — Backup & Restore database lokal

- **Status:** Accepted (implemented) · **Tanggal:** 2026-10-24
- **Konteks:** HLD/LLD mewajibkan backup/restore yang diuji. Kebijakan retensi (OD-4) belum ditetapkan, jadi fitur ini bersifat manual dan non-destruktif terhadap data lama.

## Keputusan

1. Backup dibuat dengan **SQLite Online Backup API** ke file tujuan baru; menolak menimpa file yang sudah ada.
2. Setelah backup, file difinalisasi ke `journal_mode=DELETE` agar self-contained (tanpa `-wal/-shm`).
3. Sidecar `<backup>.manifest.json` menyimpan path, ukuran, SHA-256, waktu, versi migrasi, dan jumlah baris tabel utama.
4. `backup_inspect` memeriksa `PRAGMA integrity_check`, `schema_migrations`, dan counts tanpa mengubah file.
5. Restore hanya diizinkan bila migrasi backup ≤ migrasi aplikasi (mencegah downgrade schema), memakai backup API ke koneksi aktif, lalu menjalankan migrasi yang belum ada.
6. UI menampilkan ringkasan backup sebelum tombol **Pulihkan data**; setelah restore pengguna diminta menjalankan ulang aplikasi.
7. Backup **tidak** menyertakan paket konten impor (dapat diimpor ulang); hanya database lokal.

## Konsekuensi

- Restore menimpa database saat ini; tidak ada undo otomatis selain backup lain.
- Backup tidak dienkripsi; file berisi profil/hasil lokal dan harus dijaga.
- Belum ada backup terjadwal, retensi otomatis, atau verifikasi restore otomatis (OD-4).
- Restore saat aplikasi berjalan dapat membuat state UI sementara tidak sinkron sampai restart.

## Alternatif

| Alternatif | Alasan ditolak |
|---|---|
| Copy file DB langsung | Tidak konsisten saat WAL aktif |
| Menyertakan konten impor | Duplikasi besar; konten dapat diimpor ulang |
| Restore otomatis saat startup | Belum ada kebijakan retensi/konfirmasi |
| Enkripsi backup sekarang | Kebijakan kunci/rahasia belum ditetapkan |
