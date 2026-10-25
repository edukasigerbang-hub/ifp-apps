# Batch 13 Materi Kelas 1–3 — 2026-10-26

**Status:** 48/152 gambar — **Kelas 1 LENGKAP (48/48)**. Antrean berikutnya: indeks 48 (Kelas 2).

## Hasil

| Indeks | Paket | Catatan |
|---|---|---|
| 44 | `kelas1-pjok-b06-senam-ringan` | Senam ringan di aula, matras, guru di depan, bendera & ring basket |
| 45 | `kelas1-pendidikan-pancasila-b05-simbol-warna` | Perisai besar lima simbol berwarna; Ayu, Bima, guru menunjuk |
| 46 | `kelas1-pendidikan-pancasila-b01-simbol-pancasila` | Puzzle kayu lima simbol dirakit di papan perisai |
| 47 | `kelas1-seni-rupa-b03-tekstur` | Tekstur: batu halus, kulit kayu, kain, spons, tikar rotan |

Semua 1200×896 WebP di `content/materi/kelas1/` (header VP8X 1200×896).

## QA

- Ayu konsisten hijab + lengan panjang di keempat gambar.
- Tidak ada teks/angka terbaca; perisai tidak memuat Garuda/ribbon bermotto (dicek crop 5×).
- Indeks 46 sempat gagal di agent ("Terjadi error") — prompt dikirim ulang dan berhasil.
- Banner biru di aula (indeks 44) hanya balok kuning, tanpa huruf (crop 3×).
- Tidak ada makan/minum; tidak ada kontak tidak pantas.

## Status Kelas 1

48/48 paket memiliki aset WebP 1200×896:

- Pendidikan Pancasila: 8/8
- Bahasa Indonesia: 8/8
- Matematika: 8/8
- Seni Rupa: 8/8
- PJOK: 8/8
- PAI: 8/8

Langkah berikutnya untuk Kelas 1: migrasi manifes paket ke WebP (`scripts/migrate-materi-assets-to-webp.mjs --apply`) setelah Kelas 1–3 selesai, lalu validasi + `npm test` + build.
