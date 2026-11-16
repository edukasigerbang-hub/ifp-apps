# Batch 1 Materi Kelas 1–3 — 2026-10-25

**Status:** 4/152 gambar (Kelas 1: 4/48). Antrean: `content/materi/queue-kelas1-3.json` (indeks berikutnya = 4).

## Persiapan

- Karakter **Ayu** dan **Bima** dibuat ulang di akun Flow baru dari `content/characters/`.
- **Koreksi penting:** Ayu memakai hijab, sehingga kemejanya **lengan panjang** (bukan pendek). Potret Ayu di Flow diedit ke lengan panjang, dan `content/characters/ayu.jpg` diganti dengan potret tersebut agar akun/referensi berikutnya konsisten.
- Gaya: **chibi 3D** (kepala besar, mata besar, cream backdrop) untuk kelas 1–3.
- Antrean: 3 prompt per pesan; simpan ke `content/materi/kelas{1,2,3}` (server `?grade=`).

## Hasil

| Paket | File | Catatan |
|---|---|---|
| `kelas1-pai-b08-adab` | `kelas1-pai-b08-adab.webp` | v2: tanpa adegan makan/minum; kurma & air di meja |
| `kelas1-pai-b03-akhlak` | `kelas1-pai-b03-akhlak.webp` | v2: mangkuk di meja, tangan anak kosong |
| `kelas1-seni-rupa-b07-apresiasi` | `kelas1-seni-rupa-b07-apresiasi.webp` | galeri karya anak, tanpa teks |
| `kelas1-pendidikan-pancasila-b02-aturan-rumah` | `kelas1-pendidikan-pancasila-b02-aturan-rumah.webp` | anak + orang tua, bagan ikon tanpa huruf |

Semua 1200×896 WebP di `content/materi/kelas1/`.

## QA

- **Aturan tangan kanan diperketat:** antrean kini menyebut “right hand = hand on the viewer’s left side”, dan menyarankan makanan tetap di meja.
- Dua gambar pertama (adab, akhlak) diregenerasi karena makan/memegang makanan dengan tangan kiri.
- Ayu konsisten: hijab + lengan panjang di keempat gambar.
