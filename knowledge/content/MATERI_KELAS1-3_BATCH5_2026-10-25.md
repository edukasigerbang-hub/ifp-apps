# Batch 5 Materi Kelas 1–3 — 2026-10-25

**Status:** 16/152 gambar (Kelas 1: 16/48). Antrean: `content/materi/queue-kelas1-3.json` (indeks berikutnya = 16).

## Hasil

| Indeks | Paket | File | Catatan |
|---|---|---|---|
| 13 | `kelas1-pjok-b03-keseimbangan` | `kelas1-pjok-b03-keseimbangan.webp` | Ayu berdiri satu kaki dengan tangan direntangkan; Bima berjalan di balok busa rendah; cone dan matras; tanpa teks |
| 14 | `kelas1-pjok-b02-melompat` | `kelas1-pjok-b02-melompat.webp` | Bima melompati rintangan busa rendah; Ayu melompat di matras biru; lutut menekuk saat mendarat; tanpa teks |
| 15 | `kelas1-pendidikan-pancasila-b03-hak-kewajiban-rumah` | `kelas1-pendidikan-pancasila-b03-hak-kewajiban-rumah.webp` | Bima merapikan mobil mainan ke keranjang; Ayu menyiram tanaman; rak dan bantal rapi; bendera merah-putih; foto keluarga tanpa teks |

Semua 1200×896 WebP di `content/materi/kelas1/` (diverifikasi header VP8X: 1200×896).

## QA

- Tidak ada huruf/angka/teks terbaca: buku di rak hanya blok warna; bingkai foto berisi ilustrasi; bendera polos.
- Ayu konsisten hijab + lengan panjang pada ketiga gambar (kemeja olahraga panjang, kaus panjang, sweter panjang).
- Aturan tangan kanan tidak terpicu (tidak ada makan/minum).
- Tidak ada watermark/logo; adegan olahraga campuran tanpa kontak fisik.
- **Varian ditolak:** Keseimbangan varian A memuat papan nama "SEKOLAH DASAR" (teks terbaca); Hak & Kewajiban varian B memuat jam dinding dengan angka terbaca.

## Bukti Flow

- Gerak Keseimbangan: `edit/70d8572c-23cd-421b-85f3-192baf45414f` (varian B; varian A ditolak).
- Gerak Melompat: `edit/f3d4b892-2e6e-4ef4-8d5f-89c69d5219c6` (varian A).
- Hak dan Kewajiban di Rumah: `edit/364bddcd-959c-4197-b989-838b877d6774` (varian A; varian B `edit/3b30749b-62e2-4515-a925-491e62dceb24` ditolak).
- Satu pesan berisi 3 prompt ditolak filter kebijakan Flow ("Pembuatan ini mungkin melanggar kebijakan kami"); setiap topik dikirim sebagai prompt tunggal dan berhasil.
- Editor tiap hasil menampilkan dua chip "Bahan" (Ayu + Bima). Unduhan 1K (1200×896 JPEG) diverifikasi dengan `file` sebelum konversi; WebP dibuat via canvas 1200×896 → `toBlob('image/webp', 0.9)`.
