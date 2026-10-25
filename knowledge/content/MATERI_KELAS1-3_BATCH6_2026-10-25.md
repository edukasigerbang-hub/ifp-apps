# Batch 6 Materi Kelas 1–3 — 2026-10-25

**Status:** 19/152 gambar (Kelas 1: 19/48). Antrean: `content/materi/queue-kelas1-3.json` (indeks berikutnya = 19).

## Hasil

| Indeks | Paket | File | Catatan |
|---|---|---|---|
| 16 | `kelas1-pai-b05-huruf-harakat` | `kelas1-pai-b05-huruf-harakat.webp` | Ayu menulis bentuk huruf di nampan pasir; Bima menyusun keping bentuk kayu warna; buku gambar kosong; siluet masjid; Al-Qur'an tertutup di rehal; sajadah tergulung; lentera |
| 17 | `kelas1-pai-b02-iman-allah` | `kelas1-pai-b02-iman-allah.webp` | Ayu dan Bima berdampingan di jendela kelas mengamati langit pagi, burung, pohon, dan bukit; Al-Qur'an tertutup di rehal; sajadah tergulung; lentera; tidak ada penggambaran Tuhan/nabi |
| 18 | `kelas1-pendidikan-pancasila-b07-tolong-menolong` | `kelas1-pendidikan-pancasila-b07-tolong-menolong.webp` | Ayu membawa tumpukan buku gambar; Bima menahan pintu kayu untuk anak lebih kecil yang membawa kotak pensil; anak lain memungut pensil warna ke dalam kaleng; bendera merah-putih; papan tulis kosong |

Semua 1200×896 WebP di `content/materi/kelas1/` (diverifikasi header VP8X: 1200×896).

## QA

- Tidak ada huruf/angka/teks terbaca: papan tulis kosong; buku gambar hanya blok warna; lencana seragam berupa lambang tanpa huruf; ornamen sampul Al-Qur'an tidak terbaca sebagai ayat.
- Ayu konsisten hijab + lengan panjang pada ketiga gambar (lengan mencapai pergelangan).
- Aturan tangan kanan tidak terpicu (tidak ada makan/minum).
- Tidak ada watermark/logo; Imam Allah tidak menampilkan sosok Tuhan/nabi; tidak ada adegan salat berjajar lawan jenis.
- **Varian ditolak:** tidak ada pada batch ini — ketiga varian A lolos QA.
- Editor varian A indeks 16 sempat menampilkan "Gagal memuat gambar."; klik "Coba lagi" memuat ulang dan unduhan berhasil.

## Bukti Flow

- Huruf Hijaiyah dan Harakat: `edit/ac57d619-15ee-4adf-a8f3-4a9767091b84` (varian A).
- Iman kepada Allah: `edit/500c203c-48cf-4e14-ab81-42455bdb9dbc` (varian A).
- Kebersamaan dan Tolong-Menolong: `edit/e3c83963-1680-41bd-a059-920c2a212eea` (varian A).
- **Protokol baru:** satu topik per pengiriman prompt — percobaan menggabungkan dua entri antrean dalam satu pesan diblokir classifier Auto-mode sebagai pelanggaran protokol sesi; seluruh gambar berikutnya dikirim sebagai prompt tunggal.
- Editor tiap hasil menampilkan dua chip "Bahan" (Ayu + Bima). Unduhan 1K (1200×896 JPEG) diverifikasi dengan `file` sebelum konversi; WebP dibuat via canvas 1200×896 → `toBlob('image/webp', 0.9)`.
