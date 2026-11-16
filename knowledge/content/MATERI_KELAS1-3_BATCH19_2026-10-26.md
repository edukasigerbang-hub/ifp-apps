# Batch 19 Materi Kelas 1–3 — 2026-10-26

**Status:** 72/152 gambar (Kelas 2: 24/48). Antrean berikutnya: indeks 72.

## Hasil

| Indeks | Paket | Catatan |
|---|---|---|
| 68 | `kelas2-pjok-b08-kesehatan` | Makan sehat: Bima apel tangan kanan, Ayu minum tangan kanan; sayur & buah |
| 69 | `kelas2-pai-b07-kisah-nabi` | Guru (bukan nabi) bercerita di pojok baca; Ayu & Bima menyimak; buku halaman kosong |
| 70 | `kelas2-seni-rupa-b04-kolase` | Kolase kertas warna: pohon, rumah, matahari, ikan; tanpa teks |
| 71 | `kelas2-bahasa-indonesia-b03-kosakata` | Kartu bergambar pasangan lawan kata (gajah–tikus, jerapah–kelinci, matahari–salju) |

Semua 1200×896 WebP di `content/materi/kelas2/` (header VP8X 1200×896).

## QA

- Ayu konsisten hijab + lengan panjang pada keempat gambar.
- Tidak ada teks/angka terbaca; kartu hanya gambar; buku cerita dicek crop 4× — halaman kosong.
- Makan/minum memakai tangan kanan (sisi kiri layar); tidak ada makan sambil berjalan.
- Tidak ada penggambaran nabi/Tuhan; guru adalah tokoh terpisah.
- Tidak ada regenerasi pada batch ini.

## Catatan proses

- Simpan dengan `&grade=2`; ambil `img[alt="Option 1"]` dengan `y` terbesar.
- Pemeriksaan crop: salin WebP ke `.tmp-assets/`, render canvas 4× di tab Flow, simpan PNG sementara, baca, lalu hapus.
