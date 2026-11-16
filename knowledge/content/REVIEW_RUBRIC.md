# Rubrik Review Pedagogis — Gerbang Sebelum Produksi

**Status:** TEMPLATE — **belum ada materi yang direview manusia**.
Rubrik ini dipakai reviewer manusia (guru/curriculum lead), bukan oleh agent. Agent tidak boleh menandai `approved`.

**Versi rubrik: 1** — setiap putusan yang dicatat menyimpan versi ini. Naikkan versi bila kriteria berubah agar putusan lama tidak tampak memakai rubrik terbaru.

**Bahan pra-review agent (2026-10-26):** [laporan](PEDAGOGICAL_PREREVIEW_2026-10-26.md) · [sampel baca 40 paket](PEDAGOGICAL_SAMPLE_2026-10-26.md) · [CSV flag](prereview-flags-2026-10-26.csv) · [JSON bukti](prereview-evidence-2026-10-26.json) — keluaran agent yang hanya mengumpulkan bukti; **bukan review, bukan approval**, dan status kriteria tetap NOT REVIEWED sampai reviewer manusia menilai.

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
- Perubahan isi setelah approval membatalkan approval (review ulang) — **diperiksa mekanis** sejak 2026-10-28 (lihat di bawah).

## Ikatan bukti putusan (sejak 2026-10-28)

Putusan yang dicatat aplikasi menyimpan **sidik jari isi** (`content_sha256`, SHA-256 JSON kanonik paket hasil validasi) dan **versi rubrik**. Mengubah isi paket setelah approval karena itu membuat putusan lama tidak lagi cocok.

```bash
# 1) Ekspor audit dari layar Konten & Pembaruan, simpan ke folder ini:
#    knowledge/content/review-attestations/<tanggal>.csv
# 2) Periksa setiap putusan approved terhadap isi paket sekarang:
npm run content:review-binding
# 3) Ambil sampel deterministik untuk diperiksa ulang manusia:
npm run content:review-sample -- --n 5 [--seed 2026-10-28] [--out laporan.md]
```

`content:review-binding` gagal bila: approved tanpa sidik jari sah, paket tidak dikenal, isi paket tidak tervalidasi, isi berubah setelah disetujui, atau ada paket non-`draft` tanpa putusan terikat. `content:review-sample` mencetak reviewer/tanggal/catatan, status sidik jari, berkas yang harus dibaca, dan checklist R1–R12; exit 1 bila ada yang menyimpang.

**Batas:** sidik jari dihitung klien dan identitas reviewer berasal dari profil lokal, jadi mekanisme ini membuktikan **keterikatan ke isi**, bukan keaslian identitas. Tanda tangan kriptografis atas putusan belum ada.

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
