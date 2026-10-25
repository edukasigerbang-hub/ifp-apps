# Batch 11 Materi Kelas 1–3 — 2026-10-25

**Status:** 36/152 gambar (Kelas 1: 36/48). Antrean: `content/materi/queue-kelas1-3.json` (indeks berikutnya = 36).

## Hasil

| Indeks | Paket | File | Catatan |
|---|---|---|---|
| 33 | `kelas1-bahasa-indonesia-b04-menulis-kata` | `kelas1-bahasa-indonesia-b04-menulis-kata.webp` | Ayu menelusuri garis di nampan pasir, Bima memegang pensil di atas kertas kosong; guru membimbing tangan; kartu kosong |
| 34 | `kelas1-bahasa-indonesia-b06-menulis-kalimat` | `kelas1-bahasa-indonesia-b06-menulis-kalimat.webp` | Ayu dan Bima menulis di buku tulis kosong pada meja terpisah; guru di samping papan tulis kosong |
| 35 | `kelas1-bahasa-indonesia-b03-menyimak-cerita` | `kelas1-bahasa-indonesia-b03-menyimak-cerita.webp` | Guru berhijab bercerita dengan buku bergambar terbuka dan boneka kelinci; Ayu dan Bima duduk menyimak penuh perhatian |

Semua 1200×896 WebP di `content/materi/kelas1/` (header VP8X 1200×896).

## QA

- Ayu konsisten hijab + lengan panjang pada ketiga gambar.
- Tidak ada angka/logo/watermark; papan tulis dan buku tulis kosong.
- **Catatan indeks 35:** halaman buku cerita memuat blok teks kecil yang **tidak terbaca** (diverifikasi crop 4×: hanya garis/gumpalan, bukan huruf yang dapat dibaca). Sesuai standar "tanpa teks terbaca" pada batch sebelumnya, gambar diterima; bila ingin nol total teks, perlu regenerasi dengan buku tanpa halaman teks.
- Tidak ada makan/minum; tidak ada kontak tidak pantas.

## Catatan proses

- Produksi via composer agent Flow (satu topik per prompt, "Buat 1 ilustrasi … 4:3").
- Unduhan: `=s512-rw` → `=s1600-rw` (WebP 1200×896 native) → POST queue server.
