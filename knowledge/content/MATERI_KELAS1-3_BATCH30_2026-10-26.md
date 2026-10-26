# Batch 30 Materi Kelas 1–3 — 2026-10-26

**Status:** 111/152 gambar (Kelas 1 48/48; Kelas 2 48/48; **Kelas 3 16/56**). Antrean berikutnya: indeks 112 (`kelas3-...`).

## Hasil

| Indeks | Paket | Catatan |
|---|---|---|
| 108 | `kelas3-pjok-b02-gerak-non-lokomotor` | Gimnasium dalam ruangan: Ayu berdiri satu kaki dengan tangan terbuka, Bima menyeimbangkan dengan satu tangan terangkat, hula hoop, kerucut, keranjang bola, matras, ring basket, bendera merah putih; pilihan **Option 2** (editor `9b8f01a6-1653-40c8-b6f3-b4e8877cfc80`); crop 3–10× pada papan ring basket, bendera, lencana Ayu/Bima, keranjang bola, hoop, dinding kanan — tanpa teks terbaca. Option 1 (editor `158c3388-4c09-421a-b03c-00b0bc59fde6`; matras di luar ruangan, sekolah/taman bermain) tidak dipakai |
| 109 | `kelas3-pendidikan-pancasila-b07-gotong-royong` | Gotong royong seluruh sekolah: Ayu menyapu, Bima memegang pengki, dua anak laki-laki membawa kantong sampah, seorang anak perempuan menyiram tanaman, anak lain membawa ember, lambang Garuda pada dinding gedung, bendera merah putih; pilihan **Option 2** (editor `30486254-f150-4228-a083-397148ca1ede`); crop 3–7× pada Garuda (pita kosong pada 7×), lencana Ayu/Bima, dua anak dengan kantong sampah, anak penyiram, jendela gedung, anak kanan — tanpa teks terbaca. Option 1 (editor `3bd7f83e-ddc5-4292-9049-bcdaab14c2e4`; halaman sekolah dengan papan lima simbol) tidak dipakai |
| 110 | `kelas3-pendidikan-pancasila-b03-hak-kewajiban` | Ruang keluarga: Ayu menyapu lantai, Bima membersihkan rak buku dengan kemoceng, lambang Garuda berbingkai pada dinding, rak buku (punggung buku kosong), sofa bermotif batik, tanaman pot; pilihan **Option 2** (editor `023d5512-0b80-40ac-847d-fa61418a4bec`); crop 5–10× pada Garuda (pita tidak terbaca pada 6×), punggung buku rak kiri/kanan, lencana Ayu/Bima, torso Bima — tanpa teks terbaca. **Option 1 ditolak** (editor `abe0ec4e-9683-499e-ab8f-9f21c1e1f292`): kalender dinding menampilkan “JANUARI 2023” + angka tanggal yang terbaca, dan matras bermain di lantai memuat huruf “A B C” yang terbaca |
| 111 | `kelas3-bahasa-indonesia-b03-ide-pokok` | Ruang kelas: Ayu menunjuk panel cerita bergambar pada buku terbuka, Bima menulis di halaman sebelahnya, balon percakapan dan kotak alur kosong pada halaman buku, papan tulis dengan diagram kotak/panah/balon kosong, rak buku (punggung polos), foto dinding (potret kabur + Garuda kecil), pensil warna dan kotak pensil; pilihan **Option 1** (editor `ebf57544-46bf-45b8-a4da-5b58be389b66`); crop 3–9× pada halaman buku, papan tulis, rak kiri/kanan, lencana Ayu/Bima, foto dinding — tanpa huruf/angka terbaca. Option 2 tidak diunduh |

Keempatnya 1200×896 WebP di `content/materi/kelas3/` (90.740 B; 169.244 B; 149.906 B; 124.620 B).

## Akun & sesi Flow

- Akun **Dewi Gardenia** (label diverifikasi di UI), project `218ad195-1801-4997-bffc-c754043067d6` (“Okt 25 - 15:50”).
- Karakter Ayu dan Bima dilampirkan satu per satu ke setiap prompt via “Tambahkan bahan ke kotak perintah” → tab Karakter; picker hanya menampilkan karakter yang belum terpasang sehingga tepat dua chip “Bahan” terpasang per prompt.
- Unduhan: editor Flow → URL `flow-content.google/image/<uuid>` (JPEG native 1200×896) → `fetch` Node → konversi WebP q90 effort 5 via sharp sementara di `.tmp-tools` (bukan dependensi proyek).
- Ukuran JPEG opsi terpilih: 108 `626.531 B`; 109 `786.411 B`; 110 `748.315 B`; 111 `703.728 B`.

## QA

- Ayu konsisten hijab putih + lengan panjang; Bima kemeja putih, dasi merah, celana merah; proporsi anak (bukan dewasa).
- Tidak ada teks/angka/aksara terbaca pada crop 3–10× di seluruh area berisiko (kalender, lambang, punggung buku, papan tulis, halaman buku, lencana, kemasan/kantong).
- Tidak ada makan/minum pada keempat gambar.
- Tidak ada banner “aktivitas yang tidak biasa” pada batch ini.
- Opsi dengan teks terbaca tidak dikonversi (indeks 110 opsi A).

## Catatan proses

- Indeks 108 memakai opsi B (gimnasium dalam ruangan) agar berbeda dari komposisi lapangan luar indeks 106/107.
- Indeks 110: opsi A diunduh dan diperiksa penuh, lalu ditolak karena teks kalender dan huruf pada matras terbaca; opsi B dipilih setelah crop lambang/buku/atribut bersih.
- Indeks 111: hanya opsi A yang diunduh dan lolos QA; opsi B tidak diunduh.
- Setiap perpindahan kartu dilakukan dengan membuka URL project langsung, bukan tombol `back`.
- Hanya opsi yang lolos QA yang dikonversi; opsi lain tidak disimpan.
- Tidak ada bypass, ganti akun, atau pengetikan kredensial.
