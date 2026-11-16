# Batch 4 Materi Kelas 1–3 — 2026-10-25

**Status:** 13/152 gambar (Kelas 1: 13/48). Antrean: `content/materi/queue-kelas1-3.json` (indeks berikutnya = 13).

## Hasil

| Indeks | Paket | File | Catatan |
|---|---|---|---|
| 10 | `kelas1-matematika-b05-bilangan-11-20` | `kelas1-matematika-b05-bilangan-11-20.webp` | Ayu & Bima membilang stik dan balok satuan-puluhan; poster kelas hanya bentuk/hewan; tidak ada angka terbaca |
| 11 | `kelas1-seni-rupa-b01-garis-warna` | `kelas1-seni-rupa-b01-garis-warna.webp` | anak menggambar garis zig-zag/spiral dan kolase warna; karya di dinding tanpa teks; palet & kuas |
| 12 | `kelas1-pjok-b01-jalan-lari` | `kelas1-pjok-b01-jalan-lari.webp` | lintasan lari, cone, bola, matras; Ayu berjalan dan Bima berlari; bendera tanpa tulisan |

Semua 1200×896 WebP di `content/materi/kelas1/` (diverifikasi header VP8X: 1200×896).

## QA

- Tidak ada huruf/angka/teks terbaca: poster bilangan hanya bentuk geometri dan hewan; papan tulis hanya gambar kapur; karya seni hanya garis/warna; bendera polos.
- Ayu konsisten hijab + lengan panjang (kemeja sekolah dan pakaian olahraga lengan panjang).
- Aturan tangan kanan tidak terpicu (tidak ada makan/minum); kuas dipegang tangan kanan Ayu (sisi kiri layar).
- Tidak ada watermark/logo. Adegan olahraga campuran tanpa kontak fisik.
- Varian kedua Bilangan 11–20 juga lolos QA (balok hitung + abakus tanpa numeral) tetapi tidak dipakai; varian kedua Seni dan PJOK tidak diunduh.

## Bukti Flow

- Bilangan 11–20: `edit/0a23fa28-ef4a-4173-8dac-37b3e999ff34` (varian B: `edit/468504a4-b9cc-41eb-9c65-7a7235935115`).
- Garis dan Warna: `edit/845de1e0-185e-4854-afab-08b63eeb4c31`.
- Jalan dan Lari: `edit/0ad3593e-19bc-48a2-b9bb-958575b05b4a`.
- Unduhan 1K (1200×896 JPEG) diverifikasi dengan `file` sebelum konversi; WebP dibuat via canvas 1200×896 → `toBlob('image/webp', 0.9)`.
- Satu kirim 3 prompt dengan setelan x2 menghasilkan 6 gambar; dipilih satu varian lolos QA per topik.
