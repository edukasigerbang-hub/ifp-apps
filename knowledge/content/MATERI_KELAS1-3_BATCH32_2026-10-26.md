# Batch 32 Materi Kelas 1–3 — 2026-10-26

**Status:** 119/152 gambar (Kelas 1 48/48; Kelas 2 48/48; **Kelas 3 24/56**). Antrean berikutnya: indeks 120 (`kelas3-...`).

## Hasil

| Indeks | Paket | Catatan |
|---|---|---|
| 116 | `kelas3-ipas-b08-ekonomi` | Pasar sederhana: Ayu dan Bima membeli buah dari penjual, keranjang dan peti buah, karung, timbangan gantung, latar krem bersih; pilihan **Option 1** (editor `5773e656-18d1-4ac8-820f-9ca82128da4c`); crop 4–20× pada lencana Ayu, dada Bima, peti, karung, timbangan, kain batik penjual — tanpa teks/angka terbaca. Option 2 tidak diunduh |
| 117 | `kelas3-matematika-b06-keliling-luas` | Meja kelas: Ayu dan Bima menyusun ubin warna pada papan kisi, penggaris berlubang takik tanpa angka, busur pecahan, poster bentuk geometri, rak buku (punggung polos); pilihan **Option 1** (editor `563ef491-5c6c-4b84-a204-6ed22654ab60`); crop 3–9× pada penggaris, busur, papan, lencana Ayu/Bima, poster, rak — tanpa teks/angka terbaca. Option 2 tidak diunduh |
| 118 | `kelas3-ipas-b06-keragaman-budaya` | Latar kelas budaya: Ayu dan Bima berseragam di tengah delapan anak berkostum daerah, rak batik, rumah adat mini, angklung, gendang, keranjang anyaman, bendera merah putih, panel motif dinding; pilihan **Option 1** (editor `0b820ffa-f243-429e-9f97-e224a1b6d810`); crop 4–8× pada lencana Ayu/Bima, batik, panel dinding, papan kosong, gendang/keranjang, umbul-umbul — tanpa teks terbaca. Option 2 tidak diunduh |
| 119 | `kelas3-seni-rupa-b06-kerajinan-bahan-alam` | Meja kerajinan: Ayu menempel kolase daun pada kertas, Bima menganyam bilah bambu di atas tempurung kelapa, biji/daun/ranting/tali raffia, botol lem polos, gunting, papan kreasi berisi kolase hewan dari daun; pilihan **Option 1** (editor `305ba8b1-c150-464f-8e18-d33d9c2dcf82`); crop 2–9× pada dinding kreasi, lencana Ayu/Bima, botol lem, rak/keranjang — tanpa teks terbaca. Option 2 tidak diunduh |

Keempatnya 1200×896 WebP di `content/materi/kelas3/` (101.998 B; 86.498 B; 208.068 B; 180.612 B).

## Akun & sesi Flow

- Akun **Dewi Gardenia** (label diverifikasi di UI), project `218ad195-1801-4997-bffc-c754043067d6` ("Okt 25 - 15:50").
- Karakter Ayu dan Bima dilampirkan satu per satu ke setiap prompt via "Tambahkan bahan ke kotak perintah" → tab Karakter; tepat dua chip "Bahan" per prompt.
- Unduhan: editor Flow → URL `flow-content.google/image/<uuid>` (JPEG native 1200×896) → `fetch` Node → konversi WebP q90 effort 5 via sharp sementara di `.tmp-tools`.
- Ukuran JPEG opsi terpilih: 116 `571.634 B`; 117 `608.448 B`; 118 `845.481 B`; 119 `800.945 B`.

## QA

- Ayu konsisten hijab putih + lengan panjang; Bima kemeja putih, dasi merah, celana merah; proporsi anak (bukan dewasa).
- Tidak ada teks/angka/aksara terbaca pada crop 2–20× di seluruh area berisiko (lencana, penggaris, papan, batik, panel dinding, umbul-umbul, gendang, keranjang, botol, kemasan, papan kreasi).
- Tidak ada makan/minum pada keempat gambar.
- Tidak ada banner "aktivitas yang tidak biasa" pada batch ini.
- Hanya opsi terpilih yang diunduh; tidak ada opsi ditolak pada batch ini.

## Catatan proses

- **Adaptasi prompt (transparan):** antrean `queue-kelas1-3.json` memuat klausa pemandangan IPAS generik "Show plants, animals, human body model, water cycle, earth and space, simple science experiment tools" untuk indeks 116 (`Kegiatan Ekonomi Sederhana`) dan 118 (`Keragaman Budaya di Sekitar`) — tidak cocok dengan topik. Klausa itu diganti pemandangan yang sesuai topik pada 116 (pasar: produksi/distribusi/konsumsi) dan 118 (kostum daerah, rumah adat, alat musik, batik); sisa prompt (gaya, larangan teks, aturan tangan kanan) tetap sama. Indeks 122/123/150 memiliki klausa generik yang sama dan akan diadaptasi serupa.
- Indeks 119: klausa seni rupa generik ("paint palette, brushes, colored paper collage, clay") diadaptasi ke bahan alam (daun, biji, bambu, tempurung, raffia) agar sesuai judul "Kerajinan Bahan Alam".
- Navigasi antar-kartu memakai URL project langsung; hanya opsi yang lolos QA yang dikonversi.
- Tidak ada bypass, ganti akun, atau pengetikan kredensial.
