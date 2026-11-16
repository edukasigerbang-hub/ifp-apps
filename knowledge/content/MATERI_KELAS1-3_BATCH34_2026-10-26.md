# Batch 34 Materi Kelas 1–3 — 2026-10-26

**Status:** 127/152 gambar (Kelas 1 48/48; Kelas 2 48/48; **Kelas 3 32/56**). Antrean berikutnya: indeks 128 (`kelas3-bahasa-indonesia-b08-menulis-cerita`).

## Hasil

| Indeks | Paket | Catatan |
|---|---|---|
| 124 | `kelas3-pai-b01-surah-pendek` | Ruang belajar bernuansa magrib: siluet masjid di balik jendela lengkung, dua sajadah, lentera, Al-Qur'an di rehal, kurma dan air di meja rendah; 1200×896 WebP (106.586 B); crop 5× pada halaman & sampul Al-Qur'an, lentera, meja — pola hiasan abstrak, tanpa aksara/angka terbaca |
| 125 | `kelas3-seni-rupa-b07-apresiasi-karya` | Pameran seni kelas: dinding galeri dengan lukisan, batik, patung tanah liat, keramik, kolase kertas; Ayu menunjuk karya, Bima menanggapi dengan sopan; 1200×896 WebP (134.992 B); crop 6–20× pada label dinding, bingkai, batik, seragam — label hanya bilah abu-abu buram, tanpa huruf terbaca |
| 126 | `kelas3-bahasa-indonesia-b01-teks-deskripsi` | Sudut baca: Ayu dan Bima duduk di karpet membaca buku bergambar, satu balon bicara kosong, dua buku tertutup di samping; dinding krem polos + satu jendela; 1200×896 WebP (65.794 B); editor `6247e3b6-a836-44c5-b95e-7d5a7dc66852`; crop 4–12× pada lencana Ayu/Bima, halaman buku, punggung buku, rak — tanpa teks/angka terbaca |
| 127 | `kelas3-seni-rupa-b02-menggambar-bentuk` | Meja menggambar: Ayu menggambar lingkaran & persegi, Bima menggambar persegi panjang, krayon di baki polos, balok geometri kayu (kubus, bola, limas, kerucut); 1200×896 WebP (82.722 B); editor `f2d95617-45f3-4402-9c9b-43f96f88e646`; crop 4–12× pada lencana, bungkus krayon, kertas gambar, balok — tanpa teks/angka terbaca |

## Akun & sesi Flow

- Akun **Dewi Gardenia** (label diverifikasi di UI setiap snapshot), project `218ad195-1801-4997-bffc-c754043067d6` ("Okt 25 - 15:50").
- Karakter Ayu dan Bima dilampirkan satu per satu ke setiap prompt; tepat dua chip "Bahan" diverifikasi sebelum "Mulai pembuatan".
- Unduhan: editor Flow → URL `flow-content.google/image/<uuid>` (JPEG native 1200×896) → `fetch` Node → WebP q90 effort 5 via sharp sementara di `.tmp-tools`.
- Ukuran JPEG terpilih: 126 `533.813 B`; 127 `568.972 B`.

## QA

- Ayu konsisten hijab putih + lengan panjang; Bima kemeja putih, dasi merah, celana merah; proporsi anak.
- Tidak ada teks/angka/aksara terbaca pada crop 4–20× di seluruh permukaan berisiko (halaman & sampul Al-Qur'an, lentera, label galeri, bingkai, lencana seragam, halaman/punggung buku, bungkus krayon, kertas gambar, balok kayu, rak).
- 124: tidak ada makan/minum yang dipegang; kurma dan air berada di meja (aturan tangan kanan tidak terpicu).
- Lencana sekolah pada seragam bersifat embossed abstrak, tidak terbaca pada 8–12×; papan nama dada polos.
- Tidak ada banner "aktivitas yang tidak biasa" pada batch ini.

## Catatan proses

- **Deviasi 124:** prompt meminta "closed Quran on a rehal"; hasil menampilkan Al-Qur'an **terbuka** di rehal. Dipertahankan karena halaman hanya menampilkan pola hiasan abstrak tanpa aksara terbaca dan komposisinya paling sesuai topik; deviasi dicatat di sini.
- **Adaptasi 125:** klausa seni rupa generik ("art supplies, paint palette, brushes, colored paper collage, clay, simple gallery wall") diadaptasi menjadi suasana **pameran/apresiasi karya** agar sesuai topik "Mengapresiasi Karya Seni"; sisa prompt (gaya, larangan teks, aturan tangan kanan) tetap.
- **Adaptasi 126:** klausa Bahasa Indonesia generik ("reading, open books, storytelling circle") dipertahankan temanya, tetapi pemandangan disederhanakan menjadi sudut baca tanpa poster, rak tinggi, tong sampah, atau balok huruf. Lima kandidat ditolak berurutan karena teks terbaca:
  1. `ANqvLObi3KPj` — judul buku terbaca di punggung buku ("Library Picture Book", "Forest Friends").
  2. `ANqvLOadb_p8` — huruf "SD" kuning terbaca di dasi merah (crop 6×).
  3. `ANqvLOaitfwE` — poster dinding berlabel "Geometri" dan nama hewan (terbaca 1×).
  4. `ANqvLOYsqMcu` — angka oranye "3" pada tong hijau (terbaca 1× dan 8×).
  5. Percobaan dengan prompt "childlike poses" **ditolak kebijakan Flow** ("Pembuatan ini mungkin melanggar kebijakan kami") — tanpa bypass; prompt ditulis ulang tanpa frasa tubuh/anatomi lalu dikirim ulang.
  6. Kandidat berikutnya menampilkan balok huruf "N"/"O" (terbaca 1×) — ditolak.
  7. Percobaan terakhir (scene minimal + klausa "no alphabet blocks, no letter blocks") menghasilkan dua kartu; kartu teratas diterima, kartu kedua tidak diunduh.
- **Adaptasi 127:** klausa seni rupa generik diganti pemandangan menggambar bentuk geometri; ditambahkan larangan eksplisit balok huruf/angka karena kandidat 126 sempat memunculkannya.
- **Picker karakter (127):** tombol "Tambahkan ke perintah" tidak muncul di snapshot aksesibilitas (panel detail baru), sehingga diklik via pencarian tombol berdasarkan teks di DOM; hasil diverifikasi lewat snapshot (chip "Bahan" bertambah). Tidak ada bypass autentikasi.
- Tidak ada bypass, ganti akun, atau pengetikan kredensial.
