# Batch 2 Materi Kelas 1–3 — 2026-10-25

**Status:** 7/152 gambar (Kelas 1: 7/48). Antrean: `content/materi/queue-kelas1-3.json` (indeks berikutnya = 7).

## Hasil

| Indeks | Paket | File | Catatan |
|---|---|---|---|
| 4 | `kelas1-pendidikan-pancasila-b06-aturan-sekolah` | `kelas1-pendidikan-pancasila-b06-aturan-sekolah.webp` | musyawarah kelas di meja kelompok; bendera; papan simbol Pancasila tanpa huruf; Ayu lengan panjang |
| 5 | `kelas1-matematika-b07-bangun-datar` | `kelas1-matematika-b07-bangun-datar.webp` | papan tulis kosong; balok & bangun datar; tanpa angka; Bima memegang balok dengan tangan kanan |
| 6 | `kelas1-pai-b04-belajar-salat` | `kelas1-pai-b04-belajar-salat.webp` | **regenerasi v2**: Ayu & Bima duduk membaca buku panduan salat; tidak ada adegan berdiri salat berjajar; halaman buku hanya gambar abstrak |

Semua 1200×896 WebP di `content/materi/kelas1/` (diverifikasi header VP8X: 1200×896).

## QA

- **PAI B04 v1 ditolak:** menampilkan anak laki-laki & perempuan berdiri salat berdampingan (tidak sesuai keputusan kesopanan religius), plus poster berlabel teks. Prompt antrean indeks 6 diperbarui ke komposisi "duduk membaca buku panduan", lalu diregenerasi.
- Tanpa teks/huruf/angka terbaca pada ketiga gambar (halaman buku, papan tulis, papan simbol diperiksa).
- Ayu konsisten hijab + lengan panjang; tidak ada makan/minum sehingga aturan tangan kanan tidak terpicu.
- Tidak ada watermark/logo.

## Bukti Flow

- Aset PAI B04 v2: `edit/9f8b1006-01aa-4fe7-b19f-d8b467401daa` (judul kartu "Children reading prayer guide book").
- Unduhan 1K (1200×896 JPEG) diverifikasi dengan `file` sebelum konversi; WebP dibuat via canvas 1200×896 → `toBlob('image/webp', 0.9)`.
