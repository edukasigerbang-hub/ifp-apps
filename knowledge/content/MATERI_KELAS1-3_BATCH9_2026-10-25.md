# Batch 9 Materi Kelas 1–3 — 2026-10-25

**Status:** 30/152 gambar (Kelas 1: 30/48). Antrean: `content/materi/queue-kelas1-3.json` (indeks berikutnya = 30).

## Hasil

| Indeks | Paket | File | Catatan |
|---|---|---|---|
| 27 | `kelas1-bahasa-indonesia-b05-membaca-kalimat` | `kelas1-bahasa-indonesia-b05-membaca-kalimat.webp` | Ayu dan Bima membaca buku bergambar besar (hanya ilustrasi) bersama guru berhijab; sudut baca dengan bantal, rak buku, tanaman |
| 28 | `kelas1-bahasa-indonesia-b02-membaca-kata` | `kelas1-bahasa-indonesia-b02-membaca-kata.webp` | Permainan mencocokkan: kartu gambar (bola, buku, kucing, cangkir) + keping kayu kosong; guru memberi arahan; keranjang kartu |
| 29 | `kelas1-bahasa-indonesia-b01-huruf-suku-kata` | `kelas1-bahasa-indonesia-b01-huruf-suku-kata.webp` | Guru dan kedua anak bertepuk tangan menghitung suku kata; kartu gambar (ikan, layang-layang, mangga) + keping kayu kosong; dinding dengan bentuk warna |

Semua 1200×896 WebP di `content/materi/kelas1/` (header VP8X 1200×896).

## QA

- Tidak ada huruf/angka/teks **terbaca**: halaman buku hanya ilustrasi; keping kayu kosong; kartu hanya gambar objek; dinding hanya bentuk geometris.
- Indeks 27 & 28: sampul buku di rak menampilkan coretan buram menyerupai teks (tidak terbaca pada 1200×896); crop 3× memastikan tidak ada huruf yang dapat dibaca.
- Ayu konsisten hijab + lengan panjang pada ketiga gambar.
- Tidak ada makan/minum (aturan tangan kanan tidak terpicu); tidak ada watermark/logo.
- Ketiga varian pertama lolos QA; tidak ada pengulangan.

## Catatan proses

- Seluruh batch diproduksi lewat composer agent Flow dengan instruksi "Buat 1 ilustrasi … rasio 4:3"; agent memakai Ayu/Bima dari konteks project.
- Unduhan: thumbnail `=s512-rw` → `=s1600-rw` (WebP 1200×896 native) → POST ke queue server. Tanpa editor, tanpa panel.
