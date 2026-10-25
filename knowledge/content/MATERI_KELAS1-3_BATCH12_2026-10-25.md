# Batch 12 Materi Kelas 1–3 — 2026-10-25

**Status:** 44/152 gambar (Kelas 1: 44/48). Antrean: `content/materi/queue-kelas1-3.json` (indeks berikutnya = 44).

## Hasil

| Indeks | Paket | Catatan |
|---|---|---|
| 36 | `kelas1-seni-rupa-b05-mewarnai-bentuk` | Mewarnai bentuk geometri dengan krayon; hasil ditempel di tali |
| 37 | `kelas1-seni-rupa-b08-pameran` | Pameran kelas: karya di easel & papan, guru dan teman mengapresiasi |
| 38 | `kelas1-matematika-b04-pengukuran` | Mengukur meja dengan mistar kayu & pita kain (hanya garis skala, tanpa angka) |
| 39 | `kelas1-matematika-b02-penjumlahan-10` | Baki penghitung merah/biru, penjumlahan & pengurangan dengan benda |
| 40 | `kelas1-matematika-b06-penjumlahan-20` | Baki sepuluh, mangkuk penghitung, kubus susun |
| 41 | `kelas1-pjok-b05-permainan-sederhana` | Permainan lempar bola di halaman, cone, hula hoop, bendera |
| 42 | `kelas1-matematika-b08-pola-bilangan` | Pola manik merah-biru dan keping warna berulang |
| 43 | `kelas1-pendidikan-pancasila-b08-proyek-kelas` | Proyek kelas: maket lingkungan dari kardus/tutup botol/kertas |

Semua 1200×896 WebP di `content/materi/kelas1/` (header VP8X 1200×896).

## QA

- Ayu konsisten hijab + lengan panjang di kedelapan gambar.
- Tidak ada angka/watermark/logo; papan tulis dan label kosong.
- **Indeks 38 diulang sekali:** hasil pertama menampilkan angka kecil pada pita ukur; regenerasi dengan instruksi "hanya garis skala, tanpa angka" lolos.
- **Indeks 42 diulang sekali:** poster dinding memuat kata terbaca ("Geometri", "Bangun Datar"); regenerasi dengan dinding polos lolos.
- Indeks 43: poster latar memuat header berwarna dan garis abu-abu; dicek crop 3× — tidak terbaca, diterima.
- Tidak ada makan/minum; tidak ada kontak tidak pantas.

## Catatan proses

- Ambil gambar terbaru dari composer agent: pilih `img[alt="Option 1"]` dengan posisi `y` terbesar (paling bawah) — bukan `imgs[0]` (bisa kartu referensi karakter) dan bukan kartu grid (urutan tidak kronologis).
- Unduhan: `=s512-rw` → `=s1600-rw` (WebP 1200×896 native) → POST queue server.
