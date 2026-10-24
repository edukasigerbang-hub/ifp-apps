# ADR-0020 — Beranda dan Jelajah Materi berbasis katalog

- **Status:** Accepted (implemented) · **Tanggal:** 2026-10-24
- **Konteks:** HLD menetapkan Beranda sebagai titik masuk (salam, ringkasan progres, lanjutkan belajar, kartu mata pelajaran) dan Jelajah Materi sebagai penemuan materi dengan filter kelas/mapel serta pencarian. Keduanya masih placeholder. Data paket, lesson, dan ringkasan belajar sudah tersedia lewat command native dan loader bawaan.

## Keputusan

1. **Sumber katalog tunggal** (`src/content/loadCatalog.ts`):
   - paket bawaan dari `loadContentPackages()` (sudah tervalidasi Zod);
   - paket impor aktif dari `content_list_active` + `content_get_package`, divalidasi ulang dengan validator yang sama sebelum masuk katalog.
   - Bila `packageId` sama muncul di bundled dan managed, entri **managed menang** (selaras dengan Player managed-first).
2. **Entri katalog = per lesson**, bukan per paket, sehingga pemilihan lesson bisa diteruskan ke Player. Setiap entri memuat judul lesson/paket, kelas, mapel, tujuan, jumlah aktivitas valid, dan sumber.
3. **Filter murni** (`filterCatalog`) mencakup kata kunci (judul, ringkasan, mapel, tujuan), kelas, dan mapel; facet kelas/mapel diturunkan dari data (`catalogFacets`). Logika ini diuji unit tanpa DOM.
4. **Pemilihan playback** (`src/state/playbackSelection.ts`): katalog/beranda menitipkan `{packageId, version, lessonId}`, lalu `LessonPlayer` mengonsumsinya saat mount. Bila paket/lesson tidak ditemukan, Player jatuh ke perilaku default (managed aktif pertama, lalu lesson pertama).
5. **Beranda**: sapaan profil aktif, ringkasan sesi/percobaan/rata-rata, kartu "Lanjutkan belajar" bila ada percobaan terakhir yang cocok di katalog, kartu mata pelajaran, dan daftar 3 aktivitas terbaru.
6. **"Lanjutkan belajar"** membuka **kembali lesson** (sesi baru), bukan melanjutkan posisi di tengah aktivitas. Ini eksplisit karena state progres per langkah belum menjadi kontrak sesi.

## Konsekuensi

- Katalog memuat metadata seluruh paket aktif saat layar dibuka; jumlah paket masih kecil. Bila katalog membesar, perlu command agregat/indeks.
- Menambah paket impor langsung terlihat di Beranda/Katalog tanpa restart.
- Player dapat dibuka untuk lesson tertentu; pemilih paket di Player mereset pilihan lesson ke lesson pertama.
- Ringkasan memakai `learning_get_summary` profil aktif; tanpa data menampilkan 0/—.

## Alternatif

| Alternatif | Alasan ditolak |
|---|---|
| Entri per paket | Paket dapat memuat banyak lesson; tombol buka akan menyesatkan |
| Query katalog di Rust | Duplikasi validasi Zod dan logika dedupe; command agregat belum diperlukan |
| Menyimpan pilihan di URL hash | Routing hash saat ini hanya nama layar; menambah format URL memperluas permukaan tanpa kebutuhan |
