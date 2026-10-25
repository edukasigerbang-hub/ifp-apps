# Batch 10 Materi Kelas 1–3 — 2026-10-25

**Status:** 33/152 gambar (Kelas 1: 33/48). Antrean: `content/materi/queue-kelas1-3.json` (indeks berikutnya = 33).

## Hasil

| Indeks | Paket | File | Catatan |
|---|---|---|---|
| 30 | `kelas1-pai-b01-huruf-hijaiyah` | `kelas1-pai-b01-huruf-hijaiyah.webp` | Ayu menulis lengkung di nampan pasir, Bima menyusun balok kayu; guru berhijab; kitab **tertutup** di rehal; sajadah tergulung, lentera, siluet masjid |
| 31 | `kelas1-pai-b06-mengenal-malaikat` | `kelas1-pai-b06-mengenal-malaikat.webp` | Ayu dan Bima memandang cahaya pagi di jendela; tanpa sosok malaikat/sayap/nabi; kitab tertutup di rehal, lentera, sajadah |
| 32 | `kelas1-seni-rupa-b02-menggambar-bebas` | `kelas1-seni-rupa-b02-menggambar-bebas.webp` | Ayu menggambar matahari & pohon, Bima menggambar rumah & kucing; kotak krayon, gambar-gambar dipasang di tali, kanvas kosong |

Semua 1200×896 WebP di `content/materi/kelas1/` (header VP8X 1200×896).

## QA

- Tidak ada huruf/angka/teks terbaca: kalender dinding dan papan pengumuman hanya coretan buram (dicek crop 2×), gambar anak-anak hanya ilustrasi, kanvas kosong.
- Ayu konsisten hijab + lengan panjang pada ketiga gambar.
- Tidak ada makan/minum; tidak ada watermark/logo.
- **Indeks 30 diulang sekali:** hasil pertama menampilkan Al-Qur'an **terbuka** dengan ornamen mirip kaligrafi Arab; prompt diulang dengan instruksi kitab tertutup + tanpa ornamen, hasil kedua lolos.
- Mengenal Malaikat tidak menampilkan malaikat (sesuai kaidah): hanya cahaya, awan, dan anak-anak.

## Catatan proses

- Produksi via composer agent Flow (satu topik per prompt, "Buat 1 ilustrasi … 4:3").
- Unduhan: `=s512-rw` → `=s1600-rw` (WebP 1200×896 native) → POST queue server.
