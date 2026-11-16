# Batch 3 Materi Kelas 1–3 — 2026-10-25

**Status:** 10/152 gambar (Kelas 1: 10/48). Antrean: `content/materi/queue-kelas1-3.json` (indeks berikutnya = 10).

## Hasil

| Indeks | Paket | File | Catatan |
|---|---|---|---|
| 7 | `kelas1-matematika-b03-bentuk-pola` | `kelas1-matematika-b03-bentuk-pola.webp` | anak menyusun pola bentuk geometri; papan pola tanpa huruf/angka; Ayu lengan panjang |
| 8 | `kelas1-bahasa-indonesia-b07-bercerita` | `kelas1-bahasa-indonesia-b07-bercerita.webp` | lingkaran bercerita di karpet; balon ucapan **kosong tanpa huruf**; papan cerita bergambar (kecambah, bunga) tanpa teks |
| 9 | `kelas1-matematika-b01-bilangan-1-10` | `kelas1-matematika-b01-bilangan-1-10.webp` | Ayu & Bima menyusun balok hitung; benda konkret menggantikan angka; tanpa numeral terbaca |

Semua 1200×896 WebP di `content/materi/kelas1/` (diverifikasi header VP8X: 1200×896).

## QA

- Tidak ada huruf/angka/teks terbaca: balon ucapan kosong, papan tulis dan papan buletin hanya bentuk/gambar, punggung buku kosong.
- Ayu konsisten hijab + kemeja lengan panjang pada ketiga gambar.
- Aturan tangan kanan tidak terpicu (tidak ada makan/minum); tangan yang memegang/menunjuk balok adalah tangan kanan (sisi kiri layar pada Ayu).
- Tidak ada watermark/logo.

## Bukti Flow

- Bentuk dan Pola: `edit/788bbf32-7f9e-49b4-8c46-4aed49648703`.
- Bercerita: `edit/5dd7f228-4034-48e5-9b49-e791ce60dc12`.
- Bilangan 1–10: `edit/1be71493-7294-4a6b-a634-a629936bab28`.
- Unduhan 1K (1200×896 JPEG) diverifikasi dengan `file` sebelum konversi; WebP dibuat via canvas 1200×896 → `toBlob('image/webp', 0.9)`.
- Catatan: satu kirim 3 prompt dengan setelan x2 menghasilkan 6 gambar; dipilih satu varian lolos QA per topik, sisanya tidak diunduh.
