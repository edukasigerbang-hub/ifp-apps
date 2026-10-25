# Migrasi Aset Materi ke WebP — 2026-10-25

**Status:** 168 paket Kelas 4–6 memakai aset WebP yang diproduksi Flow. Paket Kelas 1–3 tidak diubah.

## Yang diubah

- `content/packages/kelas{4,5,6}-*/assets/*.png` → `*.webp` (nama dasar sama, ekstensi berubah).
- `manifest.json` → `assets[0]`: `path`, `mediaType: image/webp`, `sizeBytes`, `sha256`.
- Referensi turunan diperbarui: `lessons/*.json` (`assetRefs`) dan `activities/*.json` (`assets`, `interactionConfig.steps[].assetPath`).
- File PNG lama dihapus setelah salinan WebP terverifikasi.
- `public/content-catalog.json` dibangun ulang.

Skrip: `scripts/migrate-materi-assets-to-webp.mjs` (dry-run default, `--apply` untuk menulis).

## Verifikasi

| Pemeriksaan | Hasil |
|---|---|
| Paket Kelas 4/5/6 termigrasi | 168/168 |
| Referensi `.png` tersisa di paket termigrasi | 0 |
| File `.png` tersisa di paket termigrasi | 0 |
| `sizeBytes` + `sha256` cocok dengan file | 168/168 |
| Hash aset paket = hash sumber `content/materi` | 168/168 |
| Validasi seluruh paket (`validatePackageDirectory`) | 320/320 VALID |
| `npm test` | 85/85 + fixture 4/4 + catalog-index OK (320) |
| `npm run build` | PASS; `dist/assets` berisi 168 WebP |
| Referensi JSON yang diperbarui (lesson/activity) | 365 |

## Catatan

- `altText` lama dipertahankan; teks alternatif masih generik dan perlu penyempurnaan saat review pedagogis.
- Aset Kelas 1–3 (152 PNG) belum dimigrasikan karena belum ada produksi gambar Flow untuk kelas tersebut dalam sesi ini.
