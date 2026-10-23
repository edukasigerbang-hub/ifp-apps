# ADR-0008 — Content Runtime: memuat paket impor aktif

- **Status:** Accepted (implemented; multi-paket dilanjutkan di ADR-0009) · **Tanggal:** 2026-10-23
- **Konteks:** Content Manager (ADR-0007) sudah bisa mengimpor dan mengaktifkan paket, tetapi Player masih memuat paket bundled melalui `import.meta.glob`.

## Keputusan

1. Player mencoba **paket impor aktif lebih dulu** (`content_packages.status='active' AND source='imported'`), lalu jatuh ke paket bundled bila tidak ada.
2. Command native `content_get_active` mengembalikan manifest, lessons, activities, dan metadata aset versi aktif.
3. Command `content_read_asset` mengembalikan byte aset hanya untuk versi yang **aktif** dan path relatif yang tervalidasi (maks 64 MB per aset).
4. UI membuat **Blob URL** dari byte tersebut dan mencabutnya saat komponen dilepas.
5. Paket impor divalidasi ulang dengan skema Zod sebelum dirender; bila gagal, Player menampilkan error (tidak diam-diam memakai bundled).
6. UI menampilkan sumber konten: “Paket impor vX” atau “Paket bawaan build”.

## Konsekuensi

- Transfer aset via IPC berupa array byte (JSON). Cukup untuk gambar pilot, **tidak** cocok untuk video/aset besar → perlu asset protocol/streaming nanti.
- Saat ini hanya **satu paket impor aktif global** yang dimuat (yang terakhir diaktifkan). Pemilihan multi-paket/mapel belum ada (T-013).
- Rollback memengaruhi paket yang dimuat pada mount Player berikutnya, bukan sesi yang sedang berjalan.
- Paket bundled tetap menjadi fallback jika belum ada paket impor aktif.

## Alternatif

| Alternatif | Alasan ditolak |
|---|---|
| Asset protocol Tauri | Scope path app-data tidak mencakup `IFP_DATA_DIR` uji; konfigurasi glob berisiko |
| `import.meta.glob` untuk paket impor | Tidak bisa memuat file runtime di luar build |
| Base64 di manifest | Duplikasi data dan membengkakkan JSON |
| Menampilkan semua paket aktif sekaligus | Belum ada model katalog/kurikulum (OD-1) |
