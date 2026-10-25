# Batch 8 Materi Kelas 1–3 — 2026-10-25

**Status:** 27/152 gambar (Kelas 1: 27/48). Antrean: `content/materi/queue-kelas1-3.json` (indeks berikutnya = 27).

## Hasil

| Indeks | Paket | File | Catatan |
|---|---|---|---|
| 24 | `kelas1-pai-b07-kisah-nabi` | `kelas1-pai-b07-kisah-nabi.webp` | Ayu dan Bima duduk di karpet mendengarkan guru berhijab membaca buku cerita tertutup; lentera, sajadah tergulung, siluet masjid di jendela; tanpa penggambaran nabi/Tuhan |
| 25 | `kelas1-seni-rupa-b04-kolase` | `kelas1-seni-rupa-b04-kolase.webp` | Kolase kertas sederhana: potongan lingkaran/segitiga/persegi menjadi rumah dan pohon; lem stik, gunting anak, nampan sisa kertas; rak kertas warna |
| 26 | `kelas1-bahasa-indonesia-b08-kosakata-baru` | `kelas1-bahasa-indonesia-b08-kosakata-baru.webp` | Guru menunjukkan kartu gambar bola merah; keranjang berisi kartu gambar (pohon, sepatu, layang-layang); Ayu dan Bima menunjuk sambil menyebut nama benda |

Semua 1200×896 WebP di `content/materi/kelas1/` (header VP8X 1200×896).

## QA

- Tidak ada huruf/angka/teks terbaca: kartu gambar hanya ilustrasi objek; poster dinding hanya gambar; buku cerita tertutup; papan tulis tidak ada.
- Ayu konsisten hijab + lengan panjang (lengan mencapai pergelangan) pada ketiga gambar.
- Tidak ada makan/minum sehingga aturan tangan kanan tidak terpicu.
- Tidak ada watermark/logo; kisah nabi tidak menampilkan sosok nabi/Tuhan (hanya guru dan murid).
- Ketiga varian pertama lolos QA; tidak ada yang perlu diulang.

## Temuan operasional (penting)

- **UI Flow berganti ke layout agent** (sidebar kanan + composer "Apa yang ingin Anda buat?" + "Petunjuk agen") sejak sekitar 21:30. Prompt dikirim ke agent; agent memakai Ayu/Bima dari konteks project, jadi **tidak perlu melampirkan karakter manual**.
- Instruksi "Buat 1 ilustrasi (bukan gabungan), rasio 4:3 …" membuat agent menghasilkan **1 gambar** (bukan 2) — menghemat kuota dan menghindari varian ganda.
- **Unduhan tanpa klik:** thumbnail grid `flow.google.com/asb/...=s512-rw` diganti sufiksnya menjadi `=s1600-rw` → respons **WebP 1200×896 native**; `fetch` same-origin lalu POST langsung ke queue server. Tidak perlu canvas/editor/panel.
- Panel in-app Browser hanya dibutuhkan saat **mengirim** prompt; unduhan tetap bekerja meski `visibilityState=hidden` selama tab ter-attach.

## Bukti Flow

- Kisah Nabi: pesan agent "Berikut adalah 1 gambar ilustrasi untuk topik \"Kisah Nabi\" dengan karakter Ayu dan Bima."
- Kolase Sederhana: agent "…1 gambar… Kolase Sederhana … rasio 4:3".
- Kosakata Baru: agent "…menampilkan Ayu dan Bima."
- Rasio 4:3 dikonfirmasi oleh agent pada setiap balasan; ukuran akhir diverifikasi 1200×896.
