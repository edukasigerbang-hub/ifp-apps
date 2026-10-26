# Batch 27 Materi Kelas 1–3 — 2026-10-26

**Status:** 99/152 gambar (Kelas 1 48/48; Kelas 2 48/48; **Kelas 3 4/56**). Antrean berikutnya: indeks 100 (`kelas3-...`).

## Hasil

| Indeks | Paket | Catatan |
|---|---|---|
| 96 | `kelas3-pai-b08-adab-kisah-teladan` | Guru berhijab + batik bercerita kepada 4 anak di karpet (Ayu tengah-kiri, Bima tengah-kanan), Quran di rehal, kurma dan air, masjid lewat jendela lengkung, lentera, sajadah tergulung, sepatu di luar karpet, karya anak; pilihan Option 1; crop 4–10× pada poster, medali sampul Quran, buku guru, lencana, punggung buku — tanpa huruf terbaca |
| 97 | `kelas3-pai-b03-akhlak` | Ayu menyerahkan Quran tertutup kepada Bima, keduanya berlutut di sajadah, kurma dan air di meja kecil, lentera, tanaman, siluet masjid; pilihan Option 1; crop 4–8× pada lencana, sampul Quran, meja — tanpa huruf terbaca. Option 2 **ditolak** karena poster memuat teks “PENDIDIKAN…” yang terbaca |
| 98 | `kelas3-pjok-b07-atletik-dasar` | Ayu melompati gawang rendah, Bima berlari di lintasan dengan cone dan matras, gedung sekolah dan pohon palem; pilihan Option 1; crop 4–8× pada lencana, bangunan, bendera, papan lantai — tanpa huruf terbaca. Option 2 juga lolos QA; Option 1 dipilih karena komposisi dua karakter lebih seimbang |
| 99 | `kelas3-pendidikan-pancasila-b02-aturan` | Bima menyapu kelas, Ayu merapikan buku di rak, lambang Garuda berpita kosong, dua foto resmi berbingkai, poster dinding, bendera merah-putih, papan tulis kosong; pilihan Option 1; crop 4–6× pada poster kiri, poster biru, foto resmi, punggung buku — hanya goresan/label tanpa huruf terbaca. Option 2 (lingkaran musyawarah) **tidak dipakai**: figur berhijab putih tampil sebagai guru dewasa dan tidak ada Ayu anak, sehingga tidak konsisten dengan desain karakter |

Keempatnya 1200×896 WebP di `content/materi/kelas3/` (149.044 B; 122.374 B; 90.262 B; 112.312 B).

## Akun & sesi Flow

- Akun **Dewi Gardenia** (label diverifikasi di UI), project `218ad195-1801-4997-bffc-c754043067d6` (“Okt 25 - 15:50”).
- Karakter bernama Ayu dan Bima dilampirkan ke setiap prompt satu per satu; picker hanya menampilkan karakter yang belum terpasang, sehingga tepat dua chip “Bahan” terpasang per prompt.
- Unduhan: editor Flow → URL `flow-content.google/image/<uuid>` (JPEG native 1200×896) → `fetch` Node → konversi WebP q90 effort 5 via sharp sementara di `.tmp-tools` (bukan dependensi proyek).
- Folder `content/materi/kelas3/` dibuat pada batch ini.

## QA

- Ayu konsisten hijab putih + lengan panjang; Bima kemeja putih, dasi merah, celana merah.
- Tidak ada teks/angka/aksara terbaca pada crop 4–10× di seluruh area berisiko (poster, foto resmi, pita Garuda, sampul Quran, punggung buku, lencana, papan tulis).
- Tidak ada makan/minum; kurma dan air tetap di meja (indeks 96 dan 97).
- Tidak ada banner “aktivitas yang tidak biasa” pada batch ini.

## Catatan proses

- Navigasi `back` di Flow kadang mendarat di editor gambar sebelumnya; setiap perpindahan opsi dilakukan dengan membuka URL project langsung, lalu memilih kartu editor dari snapshot baru.
- Dua klik sempat terhalang overlay `FLOW-LOADING-PAGE` (“Memuat…”); diselesaikan dengan menunggu overlay hilang, mengambil snapshot baru, lalu mengklik uid baru — tanpa mengulang klik otomatis.
- Opsi 1 indeks 97 dan opsi 2 indeks 99 tidak disimpan setelah QA; hanya opsi yang lolos yang dikonversi.
- Tidak ada bypass atau ganti akun.
