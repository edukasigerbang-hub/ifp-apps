# Batch 35 Materi Kelas 1–3 — 2026-10-26

**Status:** 131/152 gambar (Kelas 1 48/48; Kelas 2 48/48; **Kelas 3 36/56**). Antrean berikutnya: indeks 132 (`kelas3-seni-rupa-b08-pameran-kelas`).

## Hasil

| Indeks | Paket | Catatan |
|---|---|---|
| 128 | `kelas3-bahasa-indonesia-b08-menulis-cerita` | Ayu dan Bima di meja kelas dengan lima kartu gambar kecil (gerbang sekolah, anak bermain, anak melambai saat senja), buku tulis kosong, pensil, penghapus; dinding krem + jendela; 1200×896 WebP (94.048 B); editor `ad0df3a1-74fa-4084-9f98-54bcffc53c46`; crop 5–12× pada kartu, buku, kotak pensil, lencana — tanpa teks terbaca |
| 129 | `kelas3-bahasa-indonesia-b04-menulis-paragraf` | Ayu dan Bima menyusun sticky note warna-warni kosong di atas kertas putih besar (rencana paragraf), buku tulis kosong, pensil warna di gelas polos; 1200×896 WebP (90.170 B); editor `42d52dfa-0bb5-4f29-9a76-61f584b83fde`; crop 3–10× pada sticky note, lencana, pensil — tanpa teks terbaca |
| 130 | `kelas3-pendidikan-pancasila-b04-musyawarah` | Musyawarah kelas: Ayu, Bima, dan tiga teman duduk melingkar, satu teman mengangkat tangan, bendera merah-putih polos di sudut, dinding krem + jendela; 1200×896 WebP (113.574 B); editor `b49b7f27-e8fa-46ba-a081-1e63e5bf53da`; crop 5–22× pada lencana, bendera, buku meja, tas — lencana crest kabur tanpa huruf terbaca |
| 131 | `kelas3-pendidikan-pancasila-b06-nkri` | NKRI: peta relief kepulauan Indonesia polos di dinding (hanya bentuk pulau, tanpa label), Ayu menunjuk peta, Bima memegang bendera merah-putih kecil, bendera besar di stand, tumpukan buku polos di meja; 1200×896 WebP (81.454 B); editor `8fe14a2f-6b68-4cd5-9725-b4d9ffec7956`; crop 2–20× pada peta, lencana, buku — tanpa teks terbaca |

## Akun & sesi Flow

- Akun **Dewi Gardenia** (label diverifikasi di UI setiap snapshot), project `218ad195-1801-4997-bffc-c754043067d6` ("Okt 25 - 15:50").
- Karakter Ayu dan Bima dilampirkan satu per satu (dua chip "Bahan" diverifikasi) sebelum "Mulai pembuatan".
- Unduhan: editor Flow → URL `flow-content.google/image/<uuid>` (JPEG native 1200×896) → `fetch` Node → WebP q90 effort 5 via sharp sementara di `.tmp-tools`.
- Ukuran JPEG terpilih: 128 `616.155 B`; 129 `609.627 B`; 130 `663.765 B`; 131 `601.042 B`.

## QA

- Ayu konsisten hijab putih + lengan panjang; Bima kemeja putih, dasi merah, celana merah.
- Tidak ada teks/angka/aksara terbaca pada crop 2–24× di seluruh permukaan berisiko (kartu gambar, sticky note, halaman buku, lencana seragam, peta, bendera, kotak pensil, tas, tumpukan buku).
- 128–131: tidak ada makan/minum ditampilkan (aturan tangan kanan tidak terpicu).
- Lencana sekolah pada seragam tetap berupa crest embossed abstrak; pada 20–24× hanya bercak warna tanpa huruf terbaca.
- Banner aktivitas tidak biasa tidak muncul pada batch ini.

## Catatan proses

- **Deviasi 128:** prompt meminta **tiga** kartu gambar berurutan; hasil menampilkan **lima** kartu kecil tersebar. Dipertahankan karena seluruh kartu hanya berisi gambar sederhana tanpa huruf/angka dan komposisi tetap sesuai topik "menulis cerita pengalaman".
- **Deviasi 129:** prompt meminta pola **1 catatan besar + 3 catatan kecil**; hasil menampilkan sekitar sembilan sticky note kosong tersebar. Dipertahankan karena semua catatan benar-benar kosong dan tidak ada teks.
- **Deviasi 130:** simbol-simbol Pancasila dekoratif yang disebut klausa antrean generik **tidak** dimasukkan (risiko teks pada plakat); diganti bendera merah-putih polos dan lingkaran musyawarah. Selain itu Flow menolak satu dari dua gambar ("melanggar kebijakan kami"); tanpa bypass, satu gambar yang berhasil dipakai.
- **Deviasi 131:** model monumen kayu yang diminta tidak muncul; sebagai gantinya tumpukan buku polos di meja. Satu dari dua gambar juga ditolak kebijakan Flow; gambar yang berhasil dipakai.
- **Interaksi composer:** pada 130–131 tombol kirim programatik tidak berfungsi; pengiriman dilakukan dengan `press_key Enter` setelah composer difokuskan. Picker karakter memakai pemilihan satu-per-satu (Bima lalu Ayu) karena daftar bersifat single-select; chip gambar yang sempat ikut terlampir dihapus sebelum kirim.
- Tidak ada bypass autentikasi, ganti akun, atau pengetikan kredensial.
