# ADR-0031 — Indeks Katalog Konten Build-Time

**Status:** Accepted (implemented) · **Tanggal:** 2026-10-25

## Konteks

Katalog bawaan memuat 320 paket. Implementasi lama memanggil `loadContentPackages()` yang mengimpor manifest, lesson, aktivitas, dan aset setiap paket, lalu memvalidasi semuanya. Di `tauri dev`, cold-load 960+ modul melewati timeout 180 detik dan UI katalog tidak tampil.

## Keputusan

1. Skrip `scripts/build-content-catalog.mjs` menghasilkan `public/content-catalog.json` (satu baris per lesson) dari manifest + lesson + activityId.
2. `loadCatalog()` memuat JSON tersebut sekali (di-cache sebagai promise) dan menggabungkannya dengan paket impor yang tetap divalidasi saat runtime.
3. Aset dan validasi penuh tetap dilakukan saat paket dibuka di Player melalui `loadContentPackages({ includeAssets: true })`.
4. `predev` dan `prebuild` menjalankan `content:catalog` agar indeks selalu sinkron dengan `content/packages/`.

## Konsekuensi

- Beranda siap dalam **8,7 detik** termasuk cold start Tauri/Vite (sebelumnya timeout >180 detik).
- Katalog menampilkan **320 materi**; pencarian dan E2E `home-catalog` (9 pemeriksaan) PASS.
- Bundle utama tetap **416,03 kB**; indeks 150 kB dimuat terpisah.
- Risiko: indeks bisa basi bila konten diubah tanpa menjalankan `content:catalog`; mitigasi: hook `predev`/`prebuild` dan audit 320/320 VALID.
