# Uji Konsistensi Karakter — 2026-10-25

**Status:** PASS untuk cast Kelas 1–3 (chibi). Belum diuji untuk Kelas 4–6.

## Metode

1. Dua karakter dibuat di Google Flow (fitur **Karakter**) dari deskripsi:
   - **Ayu** — perempuan, hijab putih, seragam putih-merah, 8 tahun.
   - **Bima** — laki-laki, rambut hitam pendek, seragam putih-merah, 8 tahun.
2. Kedua character sheet dilampirkan sebagai referensi pada setiap generate.
3. Tiga adegan 4:3 dibuat dengan gaya chibi 3D yang sama:
   - Kelas 1 Bahasa Indonesia — “Membaca Permulaan” (sudut baca).
   - Kelas 1 Matematika — “Membaca dan Menulis Bilangan” (blok nilai tempat).
   - Kelas 2 IPAS — “Makhluk Hidup di Sekitar Kita” (tanaman, kaca pembesar).

## Hasil

| Adegan | Wajah | Hijab/rambut | Seragam | Proporsi | Teks terbaca |
|---|---|---|---|---|---|
| Membaca Permulaan | Konsisten | Konsisten | Konsisten | Konsisten | Tidak ada |
| Membaca dan Menulis Bilangan | Konsisten | Konsisten | Konsisten | Konsisten | Tidak ada |
| Makhluk Hidup | Konsisten | Konsisten | Konsisten | Konsisten | Tidak ada |

**Kesimpulan:** referensi karakter bekerja. Wajah, hijab, seragam, dan proporsi tetap sama lintas tiga adegan. Variasi kecil pada volume rambut dan ukuran mata masih muncul, tetapi tidak mengubah identitas karakter.

## Aset

- Character sheet: `content/characters/ayu.jpg`, `content/characters/bima.jpg`
- Hasil uji: `content/materi/_tests/kelas1-bahasa-membaca-permulaan.webp`, `kelas1-matematika-bilangan.webp`, `kelas2-ipas-makhluk-hidup.webp`

> Hasil uji disimpan sebagai **preview 512×382**. Produksi final harus mengunduh versi 1K (1200×896) dari editor Flow.

## Batasan

- Uji ini hanya mencakup dua karakter dan tiga adegan Kelas 1–2.
- Cast Kelas 4–6 (semi-realistis) belum dibuat; perlu uji terpisah.
- Guru dan karakter pendukung belum masuk cast.
- Setiap gambar final tetap wajib melewati QA visual: tangan, teks liar, angka pada poster, dan konsistensi seragam.
