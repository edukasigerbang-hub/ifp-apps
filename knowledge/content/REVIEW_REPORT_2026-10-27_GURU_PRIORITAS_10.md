# Review Pedagogis — 10 Paket Prioritas (2026-10-27)

Sumber daftar: [BACKLOG.md § Review guru tertunda](../tasks/BACKLOG.md) — "Masih perlu penilaian guru".
Cakupan: **10 paket, 141 item** (58 soal kuis, 58 pasangan mencocokkan, 25 langkah urutan).

**Sifat review: AGENT, bukan guru.** Teks paket dan ilustrasi dibaca penuh, lalu setiap item dinilai terhadap materi paketnya.
Tidak ada `reviewStatus` yang diubah. Semua paket tetap `draft`. Tanda tangan guru tetap diperlukan sebelum rilis.

## 1. Putusan per paket

| Paket | Kuis | Pasangan | Urutan | Putusan |
|---|---|---|---|---|
| `kelas2-matematika-b08-data` | 5 | 5 | — | LAYAK DENGAN CATATAN |
| `kelas6-bahasa-indonesia-b02-eksposisi` | 6 | 6 | — | LAYAK DENGAN CATATAN |
| `kelas3-pendidikan-pancasila-b06-nkri` | 6 | 6 | — | LAYAK DENGAN CATATAN |
| `kelas4-ipas-b01-makhluk-hidup` | 6 | 6 | — | **PERLU PERBAIKAN** (F-01 tersisa; F-03 sudah diperbaiki) |
| `kelas2-pai-b05-puasa` | 5 | 5 | — | LAYAK DENGAN CATATAN |
| `kelas3-pjok-b06-senam-dasar` | 6 | 6 | 5 | LAYAK DENGAN CATATAN |
| `kelas4-seni-rupa-b08-pameran-kelas` | 6 | 6 | 5 | LAYAK |
| `kelas5-pjok-b06-senam-lantai` | 6 | 6 | 5 | LAYAK DENGAN CATATAN |
| `kelas6-pai-b07-sejarah-islam` | 6 | 6 | 5 | LAYAK |
| `kelas6-pjok-b03-atletik` | 6 | 6 | 5 | LAYAK (setelah perbaikan F-04)

Tidak ditemukan jawaban salah, salah hitung, atau fakta keliru pada 58 soal kuis. Urutan pada 4 dari 5 aktivitas urutan
sesuai prosedur (guling depan, menyiapkan pameran, latihan senam lantai, peristiwa awal Islam).

**Perbaikan diterapkan 2026-10-27:** F-03 dan F-04 (lihat §2). Analisis ulang: 336/336 paket lolos validator,
gerbang volume aktivitas lolos, `npm test` 105/105. F-01 dan F-02 **belum** dikerjakan — menunggu keputusan PO.

## 2. Temuan terverifikasi

### F-01 — Ilustrasi dan altText tidak cocok dengan materi (Sedang) — `kelas4-ipas-b01-makhluk-hidup`

`assets/kolam-ekosistem.webp` menampilkan ikan, siput, kupu-kupu, teratai/daun air, batu, rumput, dan air.
**Tidak ada katak dan tidak ada capung.** Namun:

- eksplorasi langkah 1 menjawab "Katak, ikan, capung, dan tumbuhan air";
- `altText` aset berbunyi "Kolam dengan katak, ikan, capung, teratai, batu, dan air" — deskripsi yang salah bagi pembaca layar;
- pasangan `Katak => Bernapas dengan kulit dan paru-paru` dan `Capung => Bernapas dengan trakea` menguji hewan yang tidak ada di gambar;
- soal "Capung bernapas dengan ..." bergantung pada hewan yang sama.

Usul perbaikan (pilih satu):
1. **Teks menyesuaikan gambar** (tanpa kerja aset): ubah jawaban langkah 1 menjadi "Ikan, siput, kupu-kupu, dan tumbuhan air"; ganti dua pasangan tersebut dengan fakta bergambar (mis. `Siput => Merayap di batu`, `Kupu-kupu => Terbang menghisap madu bunga`); perbaiki `altText`.
2. **Gambar menyesuaikan teks**: buat ulang ilustrasi dengan katak dan capung (butuh generate Flow).

### F-02 — Jawaban singkat dinilai persis satu string (Tinggi, lintas paket)

`src/content/quiz.ts:33` membandingkan `answer.trim().toLowerCase() === correct.trim().toLowerCase()`.
Tidak ada sinonim, tidak ada varian angka/kata, dan input tidak memberi petunjuk format.

Terdampak **4 paket / 24 soal** (semua paket `short-answer` di korpus). Contoh nyata:

| Paket | Soal | Kunci | Jawaban benar lain yang dihukum |
|---|---|---|---|
| `kelas4-ipas-b01-makhluk-hidup` | Sebutkan satu ciri makhluk hidup | `bernapas` | "bergerak", "tumbuh", "berkembang biak" — semuanya ada di materi |
| `kelas4-ipas-b01-makhluk-hidup` | Peran tumbuhan adalah menghasilkan ... | `oksigen` | "makanan" — materi menyebut "oksigen dan makanan" |
| `kelas4-bahasa-indonesia-b01-teks-deskripsi` | Sebutkan satu kata penglihatan pada gambar | `hijau` | kata penglihatan lain yang sah |
| `kelas4-bahasa-indonesia-b01-teks-deskripsi` | Sebutkan satu kata pendengaran pada gambar | `kicau burung` | "berkicau", "suara burung" |
| `kelas4-pendidikan-pancasila-b01-pancasila` | Musyawarah termasuk sila ke ... | `4` | "keempat", "empat" |

Skema sudah mengizinkan `correctResponse` berupa array (12 nilai), tetapi mesin penilai menolak array untuk `responseType: "text"`.
Usul: (a) terima daftar jawaban untuk soal teks + normalisasi angka/kata; atau (b) ubah empat prompt terbuka
("sebutkan satu ...") menjadi pilihan ganda. (a) memperbaiki akar, (b) hanya menutupi empat soal.

### F-03 — Soal "benda tak hidup" punya dua jawaban sah (Sedang) — `kelas4-ipas-b01-makhluk-hidup` — **DIPERBAIKI 2026-10-27**

"Benda tak hidup pada gambar adalah ..." dikunci `batu`. Gambar juga menampilkan **air**, yang sama-sama benda tak hidup.
Siswa yang menjawab "air" benar menurut gambar tetapi dihukum.

Perbaikan yang diterapkan: prompt menjadi **"Benda tak hidup yang ada di tepi kolam pada gambar adalah ..."** (kunci tetap `batu`).
Wording ini berbeda dari usul di draf pertama ("keras dan padat") karena gambar juga memuat pensil, buku, tiang bendera, dan
bangunan — semuanya keras dan padat, sehingga masih ambigu. "Di tepi kolam" hanya menunjuk batu.

### F-04 — Langkah urutan fiktif (Rendah) — `kelas6-pjok-b03-atletik` — **DIPERBAIKI 2026-10-27**

`ordering-atletik-kelas6` berisi lima item dengan item ke-5 **"Merapikan posisi"**. Lompat jauh punya empat tahap
(awalan, tolakan, melayang, mendarat); item kelima ditambahkan untuk memenuhi ambang 5 langkah.

Perbaikan yang diterapkan: item ke-5 menjadi **"Keluar dari bak lompat"** (`itemId` `langkah-keluar-bak`), yaitu langkah nyata
setelah mendarat. Agar materi tidak bertentangan dengan aktivitas, reveal langkah eksplorasi "Apa urutan lompat jauh?"
dan pasangan `Urutan lompat jauh` diperbarui memuat langkah yang sama. Jumlah item, jumlah pasangan, dan posisi kunci lain tidak berubah.

### F-05 — Petunjuk mencocokkan menyalin teks soal (Rendah, 27 paket)

**37 pasangan** di 27 paket memakai teks soal kuis sebagai sisi kiri, termasuk elipsis yang tertinggal
(mis. `Bahasa persatuan Indonesia adalah ...`, `Bilangan 100 dibaca ...`). Di kartu mencocokkan, elipsis itu tidak berfungsi
sebagai petunjuk dan terbaca seperti potongan soal yang belum selesai. Dua di antaranya ada di paket prioritas
(`kelas3-pendidikan-pancasila-b06-nkri`, `kelas2-pai-b05-puasa`). Usul: buang elipsis dan ubah menjadi frasa petunjuk.

### F-06 — Mencocokkan masih menyalin langkah eksplorasi (Struktural, Rendah)

Detektor R5 melaporkan 0 cermin karena syaratnya prompt **dan** jawaban identik. Dengan pencocokan yang menormalkan
tanda baca dan mengukur tumpang tindih kata pada sisi kiri, hasilnya:

- **311 dari 1.963 pasangan (15,8%) di 159 paket** dapat dijawab dengan menyalin jawaban yang sudah tertulis di layar eksplorasi;
- pada 10 paket prioritas: **28 dari 58 pasangan** (mis. `kelas2-matematika-b08-data` 4/5, `kelas2-pai-b05-puasa` 3/5).

Ini bukan jawaban salah, melainkan beban kognitif rendah: aktivitas mencocokkan menjadi latihan menyalin, bukan cek pemahaman.
Tidak diusulkan penulisan ulang massal; cukup aturan untuk batch berikutnya: sisi kiri pasangan harus berupa petunjuk
yang tidak memuat kata kunci jawaban.

### F-07 — Utang "kunci selalu opsi terpanjang" ternyata positif palsu (Info)

Diukur ulang pada 336 paket hari ini: **0 paket** dengan kunci selalu opsi **terpanjang-unik**.
Enam paket (`kelas1-matematika-b01`, `kelas1-matematika-b06`, `kelas2-matematika-b01`, `kelas3-matematika-b02`,
`kelas3-matematika-b06`, `kelas5-matematika-b06`) hanya **seri panjang** pada soal angka/urutan
(mis. `1, 2, 3, 4` vs `4, 3, 2, 1` sama panjang). Bukan bias. Catatan utang di BACKLOG dapat ditutup.

## 3. Catatan yang bukan cacat (keputusan guru)

| Paket | Catatan |
|---|---|
| `kelas2-matematika-b08-data` | Soal "selisih" (6−5) memakai istilah yang biasanya baru muncul kelas 3; konfirmasi apakah masuk CP kelas 2. Data buku (Senin 4, Selasa 6, Rabu 5) tidak ada di materi, tetapi tertulis lengkap di soal sehingga tetap dapat dijawab. Pasangan `Batang paling tinggi ... => Banyak data` dan `Mencari data terbanyak => Lihat batang tertinggi` saling tumpang tindih sehingga dapat tertukar. |
| `kelas6-bahasa-indonesia-b02-eksposisi` | Soal "bagian argumen berisi alasan dan bukti" (2 soal) bertumpu pada pengetahuan umum; materi hanya menyebut struktur tanpa menjelaskan isi argumen. Usul: tambah satu langkah eksplorasi. |
| `kelas3-pendidikan-pancasila-b06-nkri` | Bahasa persatuan, sikap saat pengibaran bendera, dan arti "RI" tidak ada di materi (pengetahuan umum kelas 3). Dapat diterima bila guru menyetujui asesmen di luar teks. |
| `kelas2-pai-b05-puasa` | Pasangan `Kurma dan air saat berbuka => Berbuka puasa` tautologis. Pengecoh soal hikmah lemah ("Menambah marah", "Menjadi malas"). Waktu mulai puasa (terbit fajar) dan pembatal puasa tidak ada di materi. |
| `kelas3-pjok-b06-senam-dasar` | Soal "Gerak berguling ke depan disebut ..." → "guling depan": jawaban ada di dalam pertanyaan. Usul: ganti dengan soal posisi tengkuk atau urutan. |
| `kelas4-seni-rupa-b08-pameran-kelas` | Semua item didukung materi. Pengecoh lemah ("disembunyikan", "ditumpuk rapat"), tetapi tidak menyesatkan. |
| `kelas5-pjok-b06-senam-lantai` | "Senam di atas matras disebut senam lantai" tidak tertulis di materi; siswa yang tahu istilah "senam artistik" dapat ragu. Pasangan "hal yang harus dijaga => Keselamatan" adalah simpulan, bukan fakta tertulis. |
| `kelas6-pai-b07-sejarah-islam` | Paling kuat dari sepuluh paket: semua soal tertopang materi, urutan peristiwa benar, pengecoh "Gua Tsur" dan "berdagang" relevan. Tidak ada perbaikan. |

## 4. Batasan

- Review ini menilai teks dan gambar yang ada; tidak menjalankan aplikasi untuk merasakan tampilan soal.
- Kesesuaian dengan CP/ATP per bab tetap tugas Curriculum Lead (OD-1 sudah disetujui, verifikasi per bab belum).
- Putusan "LAYAK" di sini berarti **tidak ditemukan cacat**, bukan persetujuan rilis.

## 5. Cara mengukur ulang temuan

Tiga ukuran di bawah dihitung dengan skrip sekali-pakai pada sesi 2026-10-27 (tidak di-commit, agar tidak
menimpa bukti bertanggal). Definisi yang dipakai:

- **F-05**: pasangan `matching` dengan `left` berakhir `...` → 37 pasangan / 27 paket.
- **F-06**: pasangan `matching` yang memenuhi dua syarat sekaligus: `right` sama persis (setelah normalisasi
  huruf kecil + buang tanda baca) dengan `reveal` salah satu langkah eksplorasi, **dan** ≥ 70% kata pada `left`
  muncul di `prompt` langkah yang sama → 311 pasangan / 159 paket dari 1.963 pasangan.
- **F-07**: soal pilihan ganda dengan ≥ 2 opsi, dihitung per paket: kunci selalu **lebih panjang** dari semua opsi
  lain (unik) → 0 paket; kunci selalu **≥** semua opsi lain (termasuk seri) → 6 paket, semuanya matematika.

Validator dan uji konten tetap dapat dijalankan tanpa efek samping:

```bash
npm run content:validate   # hanya paket demo (demo-pecahan-kelas3) — bukan seluruh korpus
npm test                   # vitest + fixture + katalog (336 entri)
```

Validasi seluruh 336 paket memakai `validatePackageDirectory` per direktori (skrip sekali-pakai, tidak di-commit).
