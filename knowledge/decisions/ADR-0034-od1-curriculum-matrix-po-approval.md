# ADR-0034 — Matriks Mapel & Kurikulum OD-1: Persetujuan Product Owner + Curriculum Lead

**Status:** Accepted (via instruksi sesi) — disetujui Product Owner dan Curriculum Lead 2026-10-26; **tanpa tanda tangan tertulis**. Pemetaan CP/ATP per bab tetap belum diverifikasi.
**Pengganti:** status `PROPOSED` pada [CURRICULUM_PROPOSAL.md](../content/CURRICULUM_PROPOSAL.md) · **Dasar:** [lembar keputusan OD-1](../content/OD1_DECISION_SHEET_2026-10-26.md) · [review teknis 2026-10-26](../content/REVIEW_REPORT_2026-10-26_ALL_DRAFTS.md)

## Konteks

OD-1 (matriks mata pelajaran & kurikulum) menghambat pengisian `curriculumRefs` dan klaim kesesuaian kurikulum. Review teknis 320 paket (2026-10-26) menyiapkan lembar keputusan D1–D8; Product Owner menyetujui seluruh butir melalui instruksi sesi. Pada sesi yang sama, pengguna menyatakan diri sebagai Curriculum Lead dan menyetujui D1–D8. Kedua persetujuan dicatat sebagai instruksi sesi, bukan tanda tangan tertulis; verifikasi CP/ATP per bab masih menjadi pekerjaan lanjutan.

Catatan nomor: proposal menyebut "ADR-0004", tetapi nomor itu sudah dipakai [ADR-0004 local persistence](ADR-0004-local-persistence.md). ADR ini memakai nomor berikutnya, **ADR-0034**.

## Keputusan (disetujui Product Owner + Curriculum Lead 2026-10-26)

| ID | Keputusan |
|---|---|
| D1 | Kerangka: **Kurikulum Merdeka** (Permendikbudristek No. 12 Tahun 2024) |
| D2 | **IPAS terpadu Kelas 3–6**; Kelas 1–2 tanpa IPAS |
| D3 | **Bahasa Inggris pilihan**, belum diproduksi pada rilis awal (0 paket, tanpa klaim cakupan) |
| D4 | **Satu strand `seni-rupa`**; musik/tari/teater masuk backlog |
| D5 | **Muatan lokal tidak ada** pada rilis awal; sekolah menentukan sendiri |
| D6 | Format `curriculumRefs` tetap `{ framework, id, version }`; fase A = Kelas 1–2, B = Kelas 3–4, C = Kelas 5–6 (provisional [ADR-0033](ADR-0033-curriculum-refs-d6-provisional.md)) |
| D7 | Standar konten lengkap: **8 unit/tahun/mapel (4/semester)**, total 320 paket |
| D8 | **PAI Islam saja dengan label eksplisit**; agama lain masuk backlog |

## Konsekuensi

- Produk memakai 7 mapel pada rilis awal: `bahasa-indonesia`, `matematika`, `pai`, `pendidikan-pancasila`, `pjok`, `seni-rupa`, `ipas` (Kelas 3–6) — sesuai katalog aktual 320 paket.
- **`curriculumRefs` terisi 320/320** dengan referensi phase-level `kurikulum-merdeka` fase A/B/C versi 2024; `reviewStatus` tetap `draft` sampai reviewer manusia menyelesaikan R1–R6, R8–R9, R12. Persetujuan D1–D8 bukan penilaian pedagogis.
- Label PAI harus eksplisit "Pendidikan Agama Islam" pada materi pemasaran/katalog; dilarang mengklaim cakupan multi-agama.
- Klaim pemasaran "sesuai Kurikulum Merdeka" tetap dilarang sampai R10 terisi dari referensi resmi dan reviewer manusia menandatangani R1–R12.
- Kedalaman dan duplikasi sudah diselesaikan T-070 (2026-10-26): 320/320 memenuhi ≥5 langkah/≥3 aktivitas/≥8 item; 0 grup duplikasi.
- Jika Curriculum Lead menetapkan ID/fase resmi berbeda, semua `curriculumRefs` diganti dan `packageVersion` dinaikkan.

## Yang perlu dilakukan Curriculum Lead

1. Verifikasi Permendikbudristek No. 12 Tahun 2024 dan regulasi yang berlaku pada tahun ajaran peluncuran (2026/2027).
2. ✅ Menyetujui D1–D8 via instruksi sesi 2026-10-26 (tercatat di [lembar keputusan](../content/OD1_DECISION_SHEET_2026-10-26.md); tanpa tanda tangan tertulis).
3. Tetapkan pemetaan CP/ATP per mapel/bab untuk mengganti referensi phase-level dengan referensi resmi (pekerjaan lanjutan).
