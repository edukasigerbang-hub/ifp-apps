# Batch 25 Materi Kelas 1–3 — 2026-10-26

**Status:** 92/152 gambar (Kelas 1 48/48; Kelas 2 44/48). Antrean berikutnya: indeks 92 `kelas2-pendidikan-pancasila-b01-simbol-pancasila`.

## Hasil

| Indeks | Paket | Catatan |
|---|---|---|
| 89 | `kelas2-bahasa-indonesia-b08-puisi-pantun` | Ayu dan Bima di sudut baca kelas dengan buku terbuka dan balon tutur kosong; pilihan Option 2; crop 5–7× pada sampul buku dan balon — hanya goresan buram, tanpa huruf/angka terbaca |
| 90 | `kelas2-pai-b04-salat` | Ayu dan Bima berdiri di atas sajadah dengan tangan bersedekap (qiyam), siluet masjid, Quran tertutup di rehal, lentera; pilihan Option 1; crop 5–7× pada sampul Quran dan tepi sajadah — ornamen abstrak, tanpa aksara terbaca |
| 91 | `kelas2-pjok-b06-senam` | Peregangan ringan berdiri di atas matras, kerucut, bola, halaman sekolah; pilihan Option 2; crop 7× pada emblem seragam — tanpa huruf terbaca |

Ketiganya 1200×896 WebP di `content/materi/kelas2/` (129.050 B; 134.088 B; 114.422 B).

## Akun & sesi Flow

- Kuota akun lama habis; generasi dilanjutkan di akun **Dewi Gardenia** (label akun diverifikasi di UI), project `218ad195-1801-4997-bffc-c754043067d6` (“Okt 25 - 15:50”).
- Karakter bernama **Ayu** dan **Bima** dibuat di akun ini lewat Karakter → Karakter baru → “Tambahkan dari project” (`ayu.jpg`, `bima.jpg`), lalu dilampirkan ke setiap prompt satu per satu melalui “Tambahkan bahan ke kotak perintah”.
- Indeks 89 sempat dibuat ulang di akun lama (Option 2); file final yang dipakai adalah hasil di akun aktif di atas agar konsisten dengan karakter bernama.
- Unduhan: editor Flow → URL `flow-content.google/image/<uuid>` (JPEG native 1200×896) → `fetch` Node → konversi WebP q90 effort 5 via sharp sementara di `.tmp-tools` (bukan dependensi proyek).

## QA

- Ayu konsisten hijab + lengan panjang; Bima kemeja putih, dasi merah, celana merah.
- Tidak ada teks/angka/aksara terbaca pada crop 5–7× (sampul Quran, tepi sajadah, balon tutur, emblem seragam).
- Tidak ada makan/minum pada ketiga gambar; tidak ada adegan salat berjajar lawan jenis.
- Indeks 91 kena banner “aktivitas yang tidak biasa”; diselesaikan dengan satu retry “Coba lagi” lalu satu refresh halaman (prosedur yang sama seperti indeks 76/83/84/86/87), tanpa bypass dan tanpa ganti akun.

## Blocker aktif

- Panel in-app Browser kembali **hidden** saat akan mengirim indeks 92 (`NATIVE_BROWSER_VIEWPORT_UNAVAILABLE`, `visibilityState=hidden`). Prompt indeks 92 sudah terisi di composer; chip karakter **belum** dilampirkan karena picker tidak dapat dibuka saat surface hidden. Menunggu user membuka panel.
- Tidak ada klik yang diulang otomatis saat surface hidden.
