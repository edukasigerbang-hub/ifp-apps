# ADR-0009 — Katalog multi-paket di Player

- **Status:** Accepted (implemented) · **Tanggal:** 2026-10-23
- **Konteks:** Content Runtime sebelumnya hanya memuat satu paket impor aktif (yang terakhir diaktifkan). Beberapa paket mapel dapat aktif bersamaan.

## Keputusan

1. Command `content_list_active` mengembalikan ringkasan semua paket impor aktif: `packageId`, `version`, `title`, `gradeLevels`, `subjects`, `lessonCount`.
2. Command `content_get_package(packageId, version)` memuat paket tertentu; hanya versi `active` + `source='imported'` yang diizinkan.
3. Player menampilkan pemilih paket bila ada lebih dari satu paket aktif; default = paket pertama (urut `packageId`).
4. Mengganti paket me-remount `LessonView` (kunci `packageId@version`) agar sesi/aktivitas tidak tercampur; Blob URL paket lama dicabut.
5. `content_read_asset` tetap memeriksa bahwa pasangan paket+versi aktif.

## Konsekuensi

- Pemilihan belum difilter berdasarkan kelas/mapel dan tidak diingat antar-mount (default selalu paket pertama).
- Hanya paket impor yang muncul di pemilih; paket bundled tidak terdaftar sebagai katalog.
- Aset tetap dikirim via IPC byte + Blob URL (belum streaming).
- Urutan katalog alfabetis berdasarkan `packageId`, bukan urutan kurikulum (OD-1).

## Alternatif

| Alternatif | Alasan belum dipilih |
|---|---|
| Tetap satu paket global | Tidak mendukung multi-mapel |
| Katalog di layar Jelajah Materi | Membutuhkan model kurikulum/filter (OD-1) |
| Simpan pilihan terakhir | Belum ada preferensi profil; default deterministik lebih aman |
