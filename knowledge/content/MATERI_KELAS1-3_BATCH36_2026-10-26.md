# Batch 36 Materi Kelas 1–3 — 2026-10-26

**Status:** 135/152 gambar (Kelas 1 48/48; Kelas 2 48/48; **Kelas 3 40/56**). Antrean berikutnya: indeks 136 (`kelas3-matematika-b03-perkalian-pembagian`).

## Hasil

| Indeks | Paket | Catatan |
|---|---|---|
| 132 | `kelas3-seni-rupa-b08-pameran-kelas` | Pameran kelas: Ayu dan Bima mempersembahkan tiga easel kayu berisi lukisan pemandangan (gunung, sawah, pohon), meja panjang berisi hewan tanah liat dan vas gerabah polos, dinding kanan penuh karya anak bergambar rumah/bunga/matahari; 1200×896 WebP (106.522 B); editor `86c56ad4-deb6-45ca-9b4f-ac60efdd4014`; crop 3–22× pada dinding karya, easel, lencana, alas nomeklatur — tanpa teks terbaca |
| 133 | `kelas3-matematika-b04-pecahan` | Pecahan sederhana: Ayu menyusun potongan setengah lingkaran menjadi lingkaran utuh, Bima menyusun empat potongan seperempat pada nampan kayu; lingkaran pecahan berwarna polos, tanpa angka/simbol; 1200×896 WebP (92.554 B); editor `42cc4fd7-b981-47bc-87af-6af0ff95557d`; crop 4–22× pada potongan, buku, lencana — tanpa teks terbaca |
| 134 | `kelas3-matematika-b02-penjumlahan-pengurangan` | Penjumlahan/pengurangan: Ayu menggabungkan batang kayu satuan-puluhan, Bima memindahkan kubus satuan ke nampan kosong; blok kayu polos tanpa angka/titik/simbol; 1200×896 WebP (111.110 B); editor `8b4403aa-f816-4000-b8e4-36e398433466`; crop 4–22× pada papan karya, buku, kotak pensil, lencana — tanpa teks terbaca |
| 135 | `kelas3-matematika-b08-penyajian-data` | Penyajian data: papan kantong kayu dengan kolom balok warna + baris kartu gambar (bintang, pisang, apel, pohon), Ayu menambah satu kartu, Bima menggeser balok; tanpa angka/sumbu/label; 1200×896 WebP (93.990 B); editor `e7dc8b57-56e7-4f67-8afc-646c6515941b`; crop 6–16× pada kartu gambar, poster dinding, rak buku, lencana, nampan — tanpa teks terbaca |

## Akun & sesi Flow

- Akun **Dewi Gardenia** (label diverifikasi di UI setiap snapshot), project `218ad195-1801-4997-bffc-c754043067d6` ("Okt 25 - 15:50").
- Karakter Ayu dan Bima dilampirkan satu per satu (dua chip "Bahan" diverifikasi) sebelum kirim; chip gambar lama yang ikut terlampir dihapus lebih dulu.
- Unduhan: editor Flow → URL `flow-content.google/image/<uuid>` (JPEG native 1200×896) → `fetch` Node → WebP q90 effort 5 via sharp sementara di `.tmp-tools`.
- Ukuran JPEG terpilih: 132 `664.188 B`; 133 `623.513 B`; 134 `664.128 B`; 135 `620.907 B`.

## QA

- Ayu konsisten hijab putih + lengan panjang; Bima kemeja putih, dasi merah, celana merah.
- Tidak ada teks/angka/aksara terbaca pada crop 3–22× di seluruh permukaan berisiko (karya anak di dinding, lukisan easel, kartu gambar, balok pecahan, blok satuan, papan kantong, poster, rak buku, lencana seragam, kotak pensil, buku).
- 132–135: tidak ada makan/minum ditampilkan (aturan tangan kanan tidak terpicu).
- Lencana sekolah tetap crest embossed abstrak; pada 12–22× hanya bercak warna tanpa huruf terbaca.
- Banner aktivitas tidak biasa tidak muncul pada batch ini.

## Catatan proses

- **132a ditolak QA:** kandidat pertama memuat lukisan abstrak di easel kanan dengan bentuk huruf terbaca ("G", "R", "O" — dikonfirmasi pada 8×). Prompt ditulis ulang menjadi lukisan pemandangan bergambar alam dan dikirim ulang sebagai 132b. Karena itu indeks 132 memakai **dua** pembuatan.
- **Deviasi 132:** hasil menampilkan tiga easel (bukan satu easel + kolase bahan alam); dinding kanan penuh karya anak. Dipertahankan karena seluruh karya hanya berisi gambar rumah/bunga/pohon/matahari tanpa huruf.
- **Deviasi 133:** hasil menampilkan satu lingkaran pecahan bergaya pai berwarna polos ditambah potongan segitiga; tetap sesuai topik dan tanpa angka/simbol.
- **Deviasi 134:** muncul papan corkboard berisi empat gambar anak, padahal prompt meminta dinding polos tanpa poster. Dipertahankan setelah crop 4–20× memastikan gambar hanya floral/lansekap tanpa huruf. Sampul buku catatan berpola titik-titik (bukan angka).
- **Deviasi 135:** muncul poster dinding bergaya peta warna dan rak buku di latar, padahal prompt meminta dinding polos. Dipertahankan setelah crop 6× memastikan poster berupa blok warna tanpa huruf dan punggung buku polos.
- **Penolakan kebijakan Flow:** pada 132, 133, 134, dan 135 Flow hanya menghasilkan **satu** dari dua gambar; gambar kedua selalu ditolak dengan pesan "mungkin melanggar kebijakan kami". Tanpa bypass; satu gambar yang berhasil dipakai pada tiap indeks.
- **Interaksi composer:** prompt dimasukkan lewat DOM (`contenteditable` + `execCommand insertText`), karakter ditambahkan satu per satu (picker single-select), pengiriman via `press_key Enter`.
- Tidak ada bypass autentikasi, ganti akun, atau pengetikan kredensial.
