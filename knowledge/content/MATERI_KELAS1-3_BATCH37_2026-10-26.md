# Batch 37 Materi Kelas 1–3 — 2026-10-26

**Status:** 140/152 gambar (Kelas 1 48/48; Kelas 2 48/48; **Kelas 3 45/56**). Antrean berikutnya: indeks 141 (`kelas3-pai-b07-sejarah-islam`).

## Hasil

| Indeks | Paket | Catatan |
|---|---|---|
| 136 | `kelas3-matematika-b03-perkalian-pembagian` | Perkalian & pembagian: Ayu menyusun deret cakram kayu polos di meja, Bima memasukkan cakram ke cangkir kayu (pengelompokan); tanpa angka/titik/simbol; 1200×896 WebP (71.652 B); editor `343dfb26-858f-4218-b9a5-320498b9bb86`; JPEG sumber 549.089 B; crop 4–14× pada cakram, cangkir, rak blok, lencana — tanpa teks terbaca |
| 137 | `kelas3-pjok-b05-bola-kecil` | Permainan bola kecil: Ayu melempar bola putih polos, Bima bersiap memukul dengan bat kayu polos; kerucut oranye polos, bangku kayu, lapangan rumput; latar guru memegang buku tanpa tulisan dan dua anak berkaus polos; 1200×896 WebP (204.234 B); editor `712d09e7-ebbf-47f8-9397-ae95c5723b6b`; JPEG sumber 821.211 B; crop 2–14× pada buku guru, bat, bola, kerucut, anak latar, lencana — tanpa teks terbaca |
| 138 | `kelas3-pendidikan-pancasila-b08-proyek-kewargaan` | Proyek kewargaan: Ayu, Bima, dan tiga teman duduk melingkar di tikar menyusun kolase gambar (peta, ikan, bunga, awan) dan buku bergambar; bendera merah-putih polos di tiang kayu; 1200×896 WebP (283.848 B); editor `83322932-bf7f-48ac-8bf3-186d25a8f610`; JPEG sumber 944.239 B; crop 4–14× pada kolase, dua buku terbuka, buku catatan anak, papan dinding, lencana, anak latar — tanpa teks terbaca |
| 139 | `kelas3-pai-b05-puasa` | Puasa: still-life ruang salat sekolah — buku hijau polos tertutup di rehal kayu, tikar lipat polos, mangkuk keramik berisi kurma, gelas air, lentera kuningan menyala; jendela lengkung dengan siluet masjid saat senja; 1200×896 WebP (69.214 B); editor `97f086f5-eb59-451e-871f-6f18dbf80672`; JPEG sumber 580.593 B; crop 6–9× pada buku, mangkuk, lentera — tanpa teks terbaca |
| 140 | `kelas3-pai-b04-salat` | Salat: Ayu (mukena putih panjang) dan Bima (baju koko putih, peci putih, celana putih) berdiri bersebelahan di atas sajadah, tangan dilipat, pandangan tertunduk; ruang salat sederhana dengan jendela lengkung dan rak buku polos; 1200×896 WebP (97.652 B); editor `3b582a2b-7348-4196-85b1-dbb9ecbec703`; JPEG sumber 628.394 B; crop 3–7× pada kedua sajadah, rak buku, lencana — tanpa teks terbaca |

## Akun & sesi Flow

- Akun **Dewi Gardenia** (label diverifikasi di UI setiap snapshot), project `218ad195-1801-4997-bffc-c754043067d6` ("Okt 25 - 15:50").
- Prompt dimasukkan lewat DOM (`contenteditable` + `execCommand insertText`), panjang teks diverifikasi sama dengan berkas prompt.
- Ayu dan Bima dilampirkan satu per satu (dua chip karakter diverifikasi) untuk 137, 138, dan 140. Indeks 139 (still-life) dikirim tanpa karakter.
- Unduhan: editor Flow → URL `flow-content.google/image/<uuid>` (JPEG native 1200×896) → `fetch` Node → WebP q90 effort 5 via sharp sementara di `.tmp-tools`.

## QA

- Ayu konsisten hijab putih + lengan panjang; pada 140 memakai mukena panjang menutup aurat; Bima pada 140 memakai baju koko, peci, dan celana panjang putih (bukan celana merah) agar sesuai ibadah salat.
- Tidak ada teks/angka/aksara terbaca pada crop 2–14× di permukaan berisiko: buku guru, bat, bola, kerucut, kolase gambar, buku terbuka, buku catatan, papan dinding, rak buku, sajadah, lencana seragam, dan punggung buku.
- 139 tidak menampilkan karakter; tidak ada makan/minum (kurma & air hanya properti still-life, tidak ada yang memegang).
- 132–140 tidak ada adegan makan/minum oleh karakter; aturan tangan kanan tidak terpicu.
- Lencana sekolah tetap crest embossed abstrak; pada 8–14× hanya bercak warna tanpa huruf terbaca.
- Banner aktivitas tidak biasa tidak muncul pada batch ini.

## Catatan proses

- **Penolakan kebijakan Flow:** 136, 137, 138, dan 140 masing-masing hanya menghasilkan **satu** dari dua gambar; gambar kedua ditolak dengan pesan "mungkin melanggar kebijakan kami". Tanpa bypass; satu gambar yang berhasil dipakai.
- **Pengecualian 139:** Flow menghasilkan **dua** gambar sekaligus tanpa penolakan. Kandidat A (`f4206530-08e4-46ab-bf60-0569f4264809`, 764.960 B) menampilkan ruang salat dengan buku berornamen relief dan sajadah bercorak padat; tidak dipakai karena prompt meminta buku bersampul polos dan motif padat itu berisiko terbaca sebagai aksara pada zoom tinggi. Kandidat B dipakai karena seluruh properti polos.
- **Deviasi 137:** pose yang diminta (Ayu melempar, Bima memukul) tertukar menjadi Bima memegang bat dan Ayu melempar bola; dua anak serta seorang guru muncul di latar. Dipertahankan setelah crop 6–14× memastikan tidak ada teks pada buku guru dan pakaian.
- **Deviasi 138:** kolase anak menampilkan lukisan bergambar (peta, ikan, bunga) yang tidak diminta; buku catatan anak kosong; papan tulis tidak muncul. Dipertahankan karena seluruh gambar bersifat piktorial tanpa huruf.
- **Deviasi 139:** tikar salat tampil sebagai kain lipat polos (bukan sajadah bermotif), buku hijau polos tanpa ornamen; sesuai semangat prompt bebas teks.
- **Deviasi 140:** sajadah memuat motif tenun dekoratif (floral/geometris) yang lazim pada sajadah; pada 3× hanya pola anyaman, bukan huruf.
- Tidak ada bypass autentikasi, ganti akun, atau pengetikan kredensial.
