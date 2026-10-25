# Batch 7 Materi Kelas 1–3 — 2026-10-25

**Status:** 22/152 gambar (Kelas 1: 22/48). Antrean: `content/materi/queue-kelas1-3.json` (indeks berikutnya = 22).

## Hasil

| Indeks | Paket | File | Catatan |
|---|---|---|---|
| 19 | `kelas1-pendidikan-pancasila-b04-kebersamaan` | `kelas1-pendidikan-pancasila-b04-kebersamaan.webp` | Ayu (hijab, lengan panjang) dan Bima duduk dalam lingkaran musyawarah dengan tiga teman di karpet kelas; satu anak mengangkat tangan; bendera merah-putih di sudut; lambang perisai lima simbol di atas papan tulis kosong |
| 20 | `kelas1-pjok-b04-kebersihan` | `kelas1-pjok-b04-kebersihan.webp` | Ayu dan Bima mencuci tangan dengan sabun di wastafel keramik halaman sekolah; keran, sabun, handuk, cermin, sikat gigi di rak; tanaman pot; seragam olahraga merah-putih lengan panjang untuk Ayu |
| 21 | `kelas1-pjok-b07-kebugaran` | `kelas1-pjok-b07-kebugaran.webp` | Ayu dan Bima peregangan pagi di lapangan sekolah; lintasan lari, cone oranye, matras, bola, botol air di bangku kayu; gedung sekolah dan pepohonan |

Semua 1200×896 WebP di `content/materi/kelas1/` (diverifikasi header VP8X: 1200×896).

## QA

- Tidak ada huruf/angka/teks terbaca: papan tulis kosong; lambang perisai hanya bentuk; label/ornamen tidak terbaca.
- Ayu konsisten hijab + lengan panjang pada ketiga gambar (lengan mencapai pergelangan, termasuk seragam olahraga).
- Aturan tangan kanan tidak terpicu (tidak ada makan/minum); botol air hanya diam di bangku.
- Tidak ada watermark/logo; tidak ada kontak fisik tidak pantas.
- **Varian ditolak:** satu pasang 16:9 (1376×768) pada indeks 19 — lihat catatan rasio.

## Temuan operasional

- **Rasio composer sempat 16:9** saat indeks 19 pertama dikirim (dua gambar 1376×768, tidak dipakai). Rasio dikembalikan ke **4:3 (`crop_landscape`)**; seluruh hasil batch ini kemudian keluar **native 1200×896** tanpa upscale. Rasio wajib dicek sebelum setiap kirim.
- Surface in-app Browser sempat hilang (`visibilityState=hidden`) sehingga klik CDP tidak terkirim; setelah panel terlihat, klik normal dan **Enter pada composer** sama-sama mengirim prompt. Diagnostik: 0 event pointerdown/click saat hidden.
- Unduhan 1K Flow kadang selesai sebagai `<uuid>.tmp` beberapa detik sebelum rename ke `.jpg`; verifikasi ukuran stabil + `file` (JPEG 1200×896) sebelum dipakai.
- Unduhan diberi nama otomatis oleh Flow (mis. `Children_washing_hands_at_school_*.jpg`); file tidak di-commit, hanya WebP hasil konversi.

## Bukti Flow

- Kebersamaan di Sekolah: `edit/4969dd80-5a36-4bb7-b22d-7d2a1ea6db86` (varian A).
- Kebersihan Diri: `edit/740bf710-d34f-42f3-9075-56f1bc496766` (varian A).
- Kebugaran: `edit/5e504a9f-c2b3-4087-823d-a27fad55f355` (varian A).
- Editor tiap hasil menampilkan dua chip "Bahan" (Ayu + Bima); rasio tercatat 4:3 pada panel detail aset.
