# ADR-0004 — Persistensi lokal native (Rust + SQLite)

- **Status:** Accepted (implemented) · **Tanggal:** 2026-10-23
- **Konteks:** Fase E membutuhkan penyimpanan hasil belajar yang atomik: attempt, respons, progres, dan event outbox harus tersimpan bersama. UI juga dilarang mengakses SQLite langsung (HLD §13.6).

## Keputusan

1. **Repository berada di Rust** (`src-tauri/src/learning.rs`) memakai `rusqlite` (SQLite bundled), bukan plugin SQL dari JavaScript.
2. **Migrasi dijalankan native** saat startup: tabel `schema_migrations(version, applied_at, checksum)` + SQL `0001_init.sql`; checksum SHA-256 diverifikasi, migrasi dijalankan dalam transaksi.
3. **Empat command Tauri**: `learning_ensure_profile`, `learning_start_session`, `learning_save_attempt`, `learning_get_summary`.
4. **Satu transaksi** menulis `activity_attempts` + `assessment_responses` + `progress_snapshots` + `sync_outbox`, lalu menandai sesi selesai. Jika salah satu gagal (mis. `event_id` duplikat), seluruh upaya di-rollback.
5. **Lokasi data**: `app_data_dir()/ifp.db` (WAL, foreign keys ON). Env `IFP_DATA_DIR` hanya untuk pengujian terisolasi.
6. UI memakai wrapper bertipe (`src/data/learningRepository.ts`) dan menampilkan status simpan; pratinjau browser tidak menyimpan.

## Alasan

- `tauri-plugin-sql` tidak menyediakan transaksi lintas panggilan; memisahkan insert hasil dan outbox akan melanggar aturan transaksi HLD/LLD.
- Boundary native menjaga UI tetap tidak menyentuh SQL dan memungkinkan validasi input di batas Rust.
- Migrasi native dengan checksum mencegah skema basi diterapkan diam-diam.

## Konsekuensi

- Menambah dependency Rust (`rusqlite` bundled, `sha2`); build lebih berat, tetapi tanpa runtime tambahan di perangkat.
- Semua perubahan skema harus berupa migrasi bernomor baru; mengubah migrasi yang sudah diterapkan akan ditolak oleh checksum.
- Sinkronisasi cloud belum ada; outbox tersimpan `pending` dan belum dikirim.
- Backup/restore dan retensi data belum diimplementasikan (OPEN).
- Data uji E2E memakai `.tmp-data/` (gitignored) agar DB pengguna tidak tersentuh.

## Alternatif yang ditolak

| Alternatif | Alasan |
|---|---|
| `tauri-plugin-sql` dari JS | Tidak ada transaksi lintas `execute`; risiko hasil tersimpan tanpa outbox |
| SQLite di browser (sql.js) | Tidak persisten di filesystem aplikasi; tidak sesuai HLD |
| In-memory store | Tidak memenuhi persistensi; dilarang mengklaim tersimpan |
| Trigger SQLite untuk outbox | Logika tersembunyi, sulit diuji dan diaudit |
