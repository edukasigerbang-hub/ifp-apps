# Katalog Konten

**Status:** 20 paket draft · 0 paket disetujui · review manusia belum

| packageId | Versi | Kelas | Mapel | Topik | Status | Validasi | Reviewer |
|---|---|---|---|---|---|---|---|
| `matematika-kelas3-pecahan` | 0.1.0 | 3 | matematika | Pecahan 1/2, 1/3, 1/4 | **DRAFT** | VALID (2 warning) | Teknis PASS* / manusia belum |
| `kelas4-matematika-b03-pecahan` | 0.1.0 | 4 | matematika | Pecahan senilai | **DRAFT** | VALID (2 warning) | belum |
| `kelas4-ipas-b01-makhluk-hidup` | 0.1.0 | 4 | ipas | Makhluk hidup & lingkungan | **DRAFT** | VALID (2 warning) | belum |
| `kelas4-bahasa-indonesia-b01-teks-deskripsi` | 0.1.0 | 4 | bahasa-indonesia | Teks deskripsi | **DRAFT** | VALID (2 warning) | belum |
| `kelas4-pendidikan-pancasila-b01-pancasila` | 0.1.0 | 4 | pendidikan-pancasila | Nilai Pancasila | **DRAFT** | VALID (2 warning) | belum |
| `kelas4-matematika-b01-bilangan-cacah` | 0.1.0 | 4 | matematika | Bilangan cacah besar | **DRAFT** | VALID (2 warning) | belum |
| `kelas4-ipas-b02-wujud-zat` | 0.1.0 | 4 | ipas | Wujud zat & perubahan | **DRAFT** | VALID (2 warning) | belum |
| `kelas4-bahasa-indonesia-b02-kalimat-efektif` | 0.1.0 | 4 | bahasa-indonesia | Kalimat efektif & kosakata | **DRAFT** | VALID (2 warning) | belum |
| `kelas4-pendidikan-pancasila-b02-norma-aturan` | 0.1.0 | 4 | pendidikan-pancasila | Norma & aturan | **DRAFT** | VALID (2 warning) | belum |
| `kelas4-matematika-b02-faktor-kelipatan` | 0.1.0 | 4 | matematika | Faktor, kelipatan, KPK/FPB | **DRAFT** | VALID (2 warning) | belum |
| `kelas4-ipas-b03-gaya-gerak` | 0.1.0 | 4 | ipas | Gaya & gerak | **DRAFT** | VALID (2 warning) | belum |
| `kelas4-bahasa-indonesia-b03-ide-pokok` | 0.1.0 | 4 | bahasa-indonesia | Menyimak & ide pokok | **DRAFT** | VALID (2 warning) | belum |
| `kelas4-pendidikan-pancasila-b03-hak-kewajiban` | 0.1.0 | 4 | pendidikan-pancasila | Hak & kewajiban | **DRAFT** | VALID (2 warning) | belum |
| `kelas4-matematika-b04-pengukuran` | 0.1.0 | 4 | matematika | Pengukuran panjang & berat | **DRAFT** | VALID (2 warning) | belum |
| `kelas4-ipas-b04-energi` | 0.1.0 | 4 | ipas | Energi & perubahannya | **DRAFT** | VALID (2 warning) | belum |
| `kelas4-bahasa-indonesia-b04-menulis-deskripsi` | 0.1.0 | 4 | bahasa-indonesia | Menulis teks deskripsi | **DRAFT** | VALID (2 warning) | belum |
| `kelas4-pendidikan-pancasila-b04-musyawarah` | 0.1.0 | 4 | pendidikan-pancasila | Musyawarah | **DRAFT** | VALID (2 warning) | belum |
| `kelas4-seni-rupa-b01-unsur-prinsip` | 0.1.0 | 4 | seni-rupa | Unsur & prinsip seni rupa | **DRAFT** | VALID (2 warning) | belum |
| `kelas4-pjok-b01-gerak-dasar` | 0.1.0 | 4 | pjok | Gerak lokomotor & non-lokomotor | **DRAFT** | VALID (2 warning) | belum |
| `kelas4-pai-b01-surah-pendek` | 0.1.0 | 4 | pai | Surah pendek & adab (varian Islam) | **DRAFT** | VALID (2 warning) | belum |

\* Review teknis 2026-10-23: 1 temuan kontras diperbaiki (4.36 → 5.40). R10 `curriculumRefs` **BLOCKING**; R1–R5/R8–R9 belum direview manusia. Laporan: [REVIEW_REPORT_2026-10-23.md](REVIEW_REPORT_2026-10-23.md).

## `matematika-kelas3-pecahan` v0.1.0

- **Path:** [`content/packages/matematika-kelas3-pecahan/`](../../content/packages/matematika-kelas3-pecahan/)
- **Kurikulum:** `curriculumRefs: []` — **tidak ada klaim** kesesuaian kurikulum (OD-1 belum disetujui).
- **Judul:** Pecahan Sederhana — Matematika Kelas 3 (Draft).
- **Tujuan pembelajaran:**
  1. Menunjukkan pecahan 1/2, 1/3, dan 1/4 dari gambar yang dibagi sama besar.
  2. Menuliskan pecahan sederhana sesuai gambar.
  3. Membandingkan 1/2 dan 1/4 menggunakan dua gambar berukuran sama.
- **Isi:**
  - 1 lesson (`pecahan-sederhana`), reviewStatus `draft`.
  - Aktivitas eksplorasi 4 langkah dengan 4 diagram.
  - Kuis 4 soal pilihan ganda, nilai lulus 75, boleh mencoba lagi.
  - 4 aset PNG dibuat deterministik (bukan AI image) dan diverifikasi visual: bagian benar-benar sama besar.
- **Impor:** dapat diimpor via layar Konten & Pembaruan (validasi native + aktivasi/rollback). Player memuat paket impor aktif lebih dulu, lalu bundled (ADR-0008).
- **Aset:** 800×600 px, palet sesuai design token HLD §13.5 (teal/navy), tanpa teks di dalam gambar (teks ada di instruksi).

## Hasil validasi

```bash
npm run content:validate -- content/packages/matematika-kelas3-pecahan
```

```text
status: VALID
issues: []
warnings:
- lesson 'pecahan-sederhana' masih berstatus draft dan belum boleh dianggap materi produksi
- manifest tidak memiliki curriculumRefs; jangan mengklaim kesesuaian kurikulum
```

## Yang belum dilakukan (jujur)

| Item | Status |
|---|---|
| Review pedagogis R1–R12 | **BELUM** — butuh guru/curriculum lead |
| Sign-off OD-1 / curriculumRefs | **BELUM** — proposal masih PROPOSED |
| Tampilan di aplikasi | **ADA** — Player + Hasil Belajar; hasil kuis tersimpan di SQLite lokal |
| Sinkronisasi cloud | **BELUM** — outbox tersimpan `pending`, belum dikirim |
| Signature paket | Null — kebijakan signature belum final |
| Hak/lisensi aset | Aman untuk draft: dibuat sendiri, bukan aset pihak ketiga |

## Next

1. Tunjuk reviewer (curriculum + bahasa + aksesibilitas) → isi [REVIEW_RUBRIC.md](REVIEW_RUBRIC.md).
2. Setujui OD-1 → isi `curriculumRefs` dan naikkan `reviewStatus`.
3. Setelah Fase E/G (repository + learning runtime), simpan hasil belajar dan hubungkan paket lain ke Content Runtime.

## Paket starter Kelas 4 (2026-10-24)

Empat paket draft untuk G1 (Fase B Semester 1):

| packageId | Lesson | Aktivitas | Aset |
|---|---|---|---|
| `kelas4-matematika-b03-pecahan` | Pecahan Senilai dan Membandingkan Pecahan | eksplorasi + MCQ (4 soal) | `pecahan-senilai.png` |
| `kelas4-ipas-b01-makhluk-hidup` | Ciri Makhluk Hidup dan Lingkungannya | eksplorasi + matching (5 pasangan) | `habitat-makhluk-hidup.png` |
| `kelas4-bahasa-indonesia-b01-teks-deskripsi` | Mengenal dan Menulis Teks Deskripsi | eksplorasi + MCQ (4 soal) | `halaman-sekolah.png` |
| `kelas4-pendidikan-pancasila-b01-pancasila` | Nilai Pancasila dalam Kehidupan Sehari-hari | eksplorasi + matching (5 pasangan) | `gotong-royong.png` |

- Semua: 1 lesson + 2 aktivitas + 1 PNG 800×600 deterministik (dibuat oleh `scripts/generate-content-assets.mjs`), `curriculumRefs: []`, `reviewStatus: draft`.
- Validasi: **VALID**, 0 issue, 2 warning (status draft + `curriculumRefs` kosong).
- Impor: `content_import_package` untuk keempat paket **PASS** di data dir bersih; masing-masing 5 file, status `active`.
- Review teknis: R7/R8/R9/R11/R12 PASS (teknis); **R10 BLOCKING**; R1–R6/R8–R9/R12 menunggu reviewer manusia. Laporan: [REVIEW_REPORT_2026-10-24_KELAS4_STARTERS.md](REVIEW_REPORT_2026-10-24_KELAS4_STARTERS.md).
- Keputusan: **belum approved**; `reviewStatus` tetap `draft`.
- Matching tidak dipakai sebagai `assessmentRef` karena tidak memiliki `assessmentConfig`; kedua lesson matching memakai `assessmentRefs: []`.

## Batch 2 Kelas 4 (2026-10-24)

| packageId | Lesson | Aktivitas | Aset |
|---|---|---|---|
| `kelas4-matematika-b01-bilangan-cacah` | Nilai Tempat dan Operasi Bilangan Cacah Besar | eksplorasi + MCQ (4 soal) | `nilai-tempat.png` |
| `kelas4-ipas-b02-wujud-zat` | Wujud Zat dan Perubahannya | eksplorasi + ordering (4 item) | `wujud-zat.png` |
| `kelas4-bahasa-indonesia-b02-kalimat-efektif` | Kalimat Efektif dan Kosakata Baru | eksplorasi + MCQ (4 soal) | `sudut-baca.png` |
| `kelas4-pendidikan-pancasila-b02-norma-aturan` | Norma dan Aturan di Rumah, Sekolah, dan Masyarakat | eksplorasi + matching (5 pasangan) | `antrean-kelas.png` |

- Semua: 1 lesson + 2 aktivitas + 1 PNG 800×600 deterministik, `reviewStatus: draft`, `curriculumRefs: []`.
- Validasi: **VALID**, 0 issue, 2 warning (draft + `curriculumRefs` kosong).
- Impor: `content_import_package` keempat paket **PASS** (5 file/paket, status `active`).
- Belum direview manusia; R10 tetap BLOCKING sampai D6.

## Batch 3 Kelas 4 (2026-10-24)

| packageId | Lesson | Aktivitas | Aset |
|---|---|---|---|
| `kelas4-matematika-b02-faktor-kelipatan` | Faktor, Kelipatan, KPK, dan FPB | eksplorasi + MCQ (4 soal) | `faktor-kelipatan.png` |
| `kelas4-ipas-b03-gaya-gerak` | Gaya dan Gerak di Sekitar Kita | eksplorasi + matching (5 pasangan) | `gaya-gerak.png` |
| `kelas4-bahasa-indonesia-b03-ide-pokok` | Menyimak dan Menentukan Ide Pokok | eksplorasi + MCQ (4 soal) | `mendengarkan-cerita.png` |
| `kelas4-pendidikan-pancasila-b03-hak-kewajiban` | Hak dan Kewajiban di Rumah, Sekolah, dan Masyarakat | eksplorasi + matching (6 pasangan) | `belajar-dan-bertugas.png` |

- Semua: 1 lesson + 2 aktivitas + 1 PNG 800×600 deterministik, `reviewStatus: draft`, `curriculumRefs: []`.
- Validasi: **VALID**, 0 issue, 2 warning (draft + `curriculumRefs` kosong).
- Impor: `content_import_package` keempat paket **PASS** (5 file/paket, status `active`).
- Ilustrasi diperbaiki setelah inspeksi visual: Venn diberi area irisan oranye; panel gaya/gerak dipisah agar tidak tumpang tindih.

## Batch 4 Kelas 4 (2026-10-24)

| packageId | Lesson | Aktivitas | Aset |
|---|---|---|---|
| `kelas4-matematika-b04-pengukuran` | Mengukur Panjang dan Berat | eksplorasi + MCQ (4 soal) | `pengukuran-panjang-berat.png` |
| `kelas4-ipas-b04-energi` | Energi dan Perubahannya | eksplorasi + matching (5 pasangan) | `energi-perubahan.png` |
| `kelas4-bahasa-indonesia-b04-menulis-deskripsi` | Menulis Teks Deskripsi | eksplorasi + MCQ (4 soal) | `menulis-deskripsi.png` |
| `kelas4-pendidikan-pancasila-b04-musyawarah` | Musyawarah untuk Mufakat | eksplorasi + ordering (5 langkah) | `musyawarah-kelas.png` |

- Semua: 1 lesson + 2 aktivitas + 1 PNG 800×600 deterministik, `reviewStatus: draft`, `curriculumRefs: []`.
- Validasi: **VALID**, 0 issue, 2 warning (draft + `curriculumRefs` kosong).
- Impor: `content_import_package` keempat paket **PASS** (5 file/paket, status `active`).
- Dengan batch ini, **seluruh 4 bab Semester 1** untuk Matematika, IPAS, Bahasa Indonesia, dan Pendidikan Pancasila sudah tersedia sebagai draft (16 paket Kelas 4).

## Batch 5 Kelas 4 (2026-10-24)

| packageId | Lesson | Aktivitas | Aset |
|---|---|---|---|
| `kelas4-seni-rupa-b01-unsur-prinsip` | Unsur dan Prinsip Seni Rupa | eksplorasi + matching (5 pasangan) | `unsur-seni.png` |
| `kelas4-pjok-b01-gerak-dasar` | Gerak Lokomotor dan Non-lokomotor | eksplorasi + matching (6 pasangan) | `gerak-dasar.png` |
| `kelas4-pai-b01-surah-pendek` | Mengenal Surah Pendek dan Adab Membacanya | eksplorasi + matching (4 pasangan) | `membaca-quran.png` |

- Semua: 1 lesson + 2 aktivitas + 1 PNG 800×600 deterministik, `reviewStatus: draft`, `curriculumRefs: []`.
- Validasi: **VALID**, 0 issue, 2 warning per paket.
- Impor: `content_import_package` ketiga paket **PASS** (5 file/paket, `active`).
- PAI di sini adalah **varian Islam**; agama lain memerlukan paket terpisah sesuai kebijakan sekolah (D5/OD-1).
- Sisa Semester 1: Seni Rupa, PJOK, dan PAI B02–B04 (9 paket).

## Inventaris sebelum produksi Kelas 4 (2026-10-24)

Hasil audit materi yang ada:

- Satu-satunya paket produksi: `matematika-kelas3-pecahan` v0.1.0 (kelas 3, draft, 1 lesson, 2 aktivitas: eksplorasi + MCQ, 4 aset PNG, `curriculumRefs: []`). Review teknis PASS; R10 `curriculumRefs` masih BLOCKING dan review manusia belum.
- `content/fixtures/*` hanya untuk pengujian validator, **tidak** dibundel (`loadPackages` hanya membaca `content/packages/*`).
- **Tidak ada paket Kelas 4** dan tidak ada materi lain yang perlu diubah isinya.

Penyesuaian sebelum membuat paket baru:

1. `curriculumRefs` wajib berupa **objek** `{framework, id, version}`; string seperti `kurikulum-merdeka:2024` ditolak skema. Isi setelah D6 disetujui.
2. Skema aktivitas sudah mendukung `exploration`, MCQ (`single-choice`/`multiple-choice`), `true-false` (`boolean`), `short-answer` (`text`), `matching`, dan `ordering` — **tidak perlu ubah kode**.
3. Aset hanya boleh PNG/JPEG/WebP/AVIF (SVG tidak didukung), harus dicantumkan `sizeBytes` + `sha256`, dan sebaiknya mengikuti konvensi pilot: 800×600, tanpa teks di gambar, alt text di metadata.
4. Paket pecahan Kelas 4 B03 dibuat **baru** (`kelas4-matematika-b03-pecahan`); jangan mengubah pilot kelas 3.
5. Setelah D6, isi juga `curriculumRefs` pilot kelas 3 agar R10 bisa ditutup.
6. Setiap paket baru harus ditambahkan ke tabel katalog dan `00_INDEX`.

Rencana urutan produksi seluruh kelas: [PRODUCTION_SCHEDULE.md](PRODUCTION_SCHEDULE.md).

