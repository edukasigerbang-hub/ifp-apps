# Rubrik Review Pedagogis — Gerbang Sebelum Produksi

**Status:** TEMPLATE — **belum ada materi yang direview**.
Rubrik ini dipakai reviewer manusia (guru/curriculum lead), bukan oleh agent. Agent tidak boleh menandai `approved`.

## Peran reviewer

| Peran | Tanggung jawab | Kualifikasi minimum |
|---|---|---|
| Curriculum Reviewer | Kesesuaian tujuan, urutan, dan beban kognitif | Guru SD / pengembang kurikulum |
| Language Reviewer | Keterbacaan sesuai usia, ejaan, istilah | Guru Bahasa Indonesia |
| Accessibility Reviewer | Alt text, caption, kontras, motorik | Praktisi aksesibilitas / guru pendamping |
| Subject Expert | Akurasi konsep mapel | Guru mapel terkait |

## Kriteria blocking (semua wajib LULUS)

| # | Kriteria | Cara verifikasi | Status |
|---|---|---|---|
| R1 | Tujuan pembelajaran terukur dan sesuai kelas | Cek `learningObjectives` vs aktivitas | NOT REVIEWED |
| R2 | Isi faktual benar (tidak ada miskonsepsi) | Review ahli mapel | NOT REVIEWED |
| R3 | Bahasa sesuai usia (panjang kalimat, kosakata) | Baca nyaring + cek level | NOT REVIEWED |
| R4 | Beban kognitif wajar (jumlah langkah/soal) | Estimasi durasi & uji coba | NOT REVIEWED |
| R5 | Asesmen mengukur tujuan (validitas) | Cocokkan soal ↔ objektif | NOT REVIEWED |
| R6 | Feedback suportif, tidak mempermalukan | Baca semua feedback | NOT REVIEWED |
| R7 | Aksesibilitas: alt text, caption/transkrip, bukan warna saja | Inspeksi aset & UI | NOT REVIEWED |
| R8 | Tidak ada data pribadi siswa / konten sensitif | Inspeksi teks & aset | NOT REVIEWED |
| R9 | Hak/ lisensi aset jelas | Cek sumber & izin setiap aset | NOT REVIEWED |
| R10 | `curriculumRefs` terisi dan dapat ditelusuri | Cek manifest/lesson | NOT REVIEWED |
| R11 | Validator konten lulus + hash aset cocok | `npm run content:validate` | NOT REVIEWED |
| R12 | Tidak ada klaim kurikulum tanpa referensi resmi | Cek teks pemasaran/UI | NOT REVIEWED |

## Aturan keputusan

- Semua R1–R12 **LULUS** → `reviewStatus: approved` boleh disetel oleh reviewer manusia.
- Satu saja `REVISI` → `reviewStatus` tetap `draft`/`reviewed`; materi tidak boleh dirilis.
- Reviewer tidak boleh mereview materi yang ia susun sendiri (pemisahan peran).
- Perubahan isi setelah approval membatalkan approval (review ulang).

## Format catatan review

```text
Materi        : <packageId>@<version>
Reviewer      : <nama, peran, institusi>
Tanggal       : <ISO-8601>
Cakupan       : <lesson/activity yang direview>
Temuan        : <R1..R12 + catatan>
Keputusan     : APPROVED / REVISI
Tanda tangan  : <nama>
```

## Batas kejujuran

Agent hanya dapat menjalankan R11 (validator) dan membantu memeriksa R7/R10 secara teknis. R1–R6, R8–R9, R12 memerlukan penilaian manusia. Jangan menulis "sudah direview" tanpa catatan reviewer di atas.
