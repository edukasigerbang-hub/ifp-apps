# Batch 23 Materi Kelas 1–3 — 2026-10-26

**Status:** 87/152 gambar (Kelas 2: 39/48). Antrean berikutnya: indeks 87.

## Hasil

| Indeks | Paket | Catatan |
|---|---|---|
| 83 | `kelas2-matematika-b08-data` | Piktograf di papan tulis: ikon mobil/pohon/bintang + kolom titik hitung; tanpa angka (crop 3×) |
| 84 | `kelas2-matematika-b05-perkalian-pembagian` | Tiga piring berisi bintang (2/2/4) sebagai model perkalian–pembagian; papan tulis hanya bentuk |
| 85 | `kelas2-matematika-b03-perkalian-dasar` | Blok warna dalam nampan (2+2 dan 2+2); poster bentuk dengan judul blur tanpa huruf terbaca (crop 7×) |
| 86 | `kelas2-pjok-b05-bola-kecil` | Lapangan, bola tenis/kasti, pemukul, matras, cone; anak-anak berbaris; tanpa teks |

Semua 1200×896 WebP di `content/materi/kelas2/` (header VP8X 1200×896).

## QA

- Ayu konsisten hijab + lengan panjang (terlihat pada indeks 85–86).
- Tidak ada teks/angka terbaca; poster “Shapes” diperiksa 7× dan hanya blur tanpa bentuk huruf.
- Tidak ada makan/minum; tidak ada kontak tidak pantas.
- Indeks 84 dan 86 sempat kena banner “aktivitas yang tidak biasa”; 84 selesai lewat retry otomatis, 86 lewat satu refresh (tanpa bypass, tanpa ganti akun).

## Catatan proses

- Pola kirim yang dipakai: sembunyikan `.messages-list` → `take_snapshot` dengan `filePath` → uid composer dari snapshot → `fill` (input tepercaya) → tampilkan kembali daftar pesan → `Enter`.
- Kadang `Enter` membersihkan composer tanpa mengirim (indeks 85). Deteksi: pesan dengan topik tidak ada di `.messages-list`; kirim ulang setelah snapshot baru.
- Frasa akhir pesan Flow bervariasi (“Berikut adalah …” vs “Karena pengaturan default …”); verifikasi akhir dilakukan dengan memeriksa gambar `Option 1` pada pesan terakhir yang memuat topik.
