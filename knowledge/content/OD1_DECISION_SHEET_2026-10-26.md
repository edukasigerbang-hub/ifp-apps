# Lembar Keputusan OD-1 — Matriks Mapel & Kurikulum (2026-10-26)

**Status:** `DISETUJUI PRODUCT OWNER + CURRICULUM LEAD (via instruksi sesi) — 2026-10-26`. D1–D8 disetujui kedua peran melalui instruksi sesi; **tidak ada tanda tangan tertulis**. `curriculumRefs` boleh diisi dengan referensi phase-level provisional ADR-0033; klaim CP/ATP per bab dan `reviewStatus: approved` tetap dilarang sampai review manusia. Lihat [ADR-0034](../decisions/ADR-0034-od1-curriculum-matrix-po-approval.md).
**Dasar:** [CURRICULUM_PROPOSAL.md](CURRICULUM_PROPOSAL.md) · [ADR-0033](../decisions/ADR-0033-curriculum-refs-d6-provisional.md) · [review teknis 2026-10-26](REVIEW_REPORT_2026-10-26_ALL_DRAFTS.md) · data aktual 320 paket.
**Yang tidak boleh dilakukan agent:** mengisi tanda tangan, menaikkan `reviewStatus`, atau mengklaim kesesuaian kurikulum tanpa referensi resmi.

> **Catatan persetujuan (2026-10-26):** Product Owner menyetujui D1–D8 sesuai rekomendasi pada tabel keputusan. Pada sesi yang sama, pengguna menyatakan diri sebagai Curriculum Lead dan menyetujui D1–D8. Kedua persetujuan dicatat sebagai instruksi sesi, **bukan tanda tangan tertulis**; nama dan tanda tangan tidak diisi oleh agent. OD-1 kini sah untuk mengisi `curriculumRefs` phase-level (ADR-0033), tetapi belum menjadi klaim CP/ATP per bab dan belum menaikkan `reviewStatus`.

## Fakta aktual per 2026-10-26

| Fakta | Nilai |
|---|---|
| Paket | 320 (8 unit/mapel/tahun; IPAS mulai Kelas 3) |
| Mapel di katalog | `bahasa-indonesia` 48 · `matematika` 48 · `pai` 48 · `pendidikan-pancasila` 48 · `pjok` 48 · `seni-rupa` 48 · `ipas` 32 |
| Kelas 1–2 | 96 paket; tanpa IPAS |
| Kelas 3–6 | 224 paket; IPAS 8 unit/kelas |
| `reviewStatus` | `draft` 320/320 |
| `curriculumRefs` | terisi 4/320 (starter Kelas 4, referensi provisional `{kurikulum-merdeka, fase-b, 2024}`) |
| Klaim “Kurikulum Merdeka” di UI/CATALOG | 0 file |
| Validator + hash | 320/320 VALID |
| Kedalaman | **320/320** memenuhi ≥5 langkah/≥3 aktivitas/≥8 item (T-070, 2026-10-26) |
| Duplikasi | **0 grup** duplikasi persis; **0 grup** aktivitas identik (T-070, 2026-10-26) |

## Keputusan yang diminta

| ID | Keputusan | Opsi | Rekomendasi agent (bukan keputusan) | Konsekuensi |
|---|---|---|---|---|
| D1 | Kerangka kurikulum | Kurikulum Merdeka / K13 / lainnya | **Kurikulum Merdeka** (Permendikbudristek 12/2024) | Menentukan struktur fase dan referensi resmi |
| D2 | IPA & IPS | IPAS terpadu / IPA + IPS terpisah | **IPAS terpadu Kelas 3–6** (sudah terimplementasi) | Tidak perlu ubah katalog; Kelas 1–2 tetap tanpa IPAS |
| D3 | Bahasa Inggris | Wajib / pilihan / tidak ada | **Pilihan, belum diproduksi** pada rilis awal | 0 paket; tidak ada klaim cakupan |
| D4 | Seni | Satu strand / pilihan strand | **Satu strand `seni-rupa`** untuk rilis awal | 48 paket; strand musik/tari/teater masuk backlog |
| D5 | Muatan lokal | Ada / tidak; penyedia | **Tidak ada di rilis awal** | Tidak ada konten pihak ketiga; sekolah menentukan sendiri |
| D6 | Format `curriculumRefs` | `{framework, id, version}` / string bebas | **Pertahankan `{framework, id, version}`** (provisional ADR-0033); fase A = Kelas 1–2, B = Kelas 3–4, C = Kelas 5–6 | Sudah diisi 320/320 (fase A/B/C, versi 2024); pemetaan CP per bab tetap perlu verifikasi Curriculum Lead |
| D7 | Standar “konten lengkap” (OD-8) | Jumlah unit per mapel/kelas/semester | **8 unit/tahun/mapel (4/semester)**; total 320 paket | Menjadi gerbang cakupan rilis; kedalaman pelajaran dinilai terpisah |
| D8* | Cakupan PAI | PAI Islam saja (label eksplisit) / tambah agama lain / tunda | **PAI Islam saja dengan label eksplisit**, agama lain masuk backlog | Mencegah klaim “PAI-BP” multi-agama yang tidak akurat |

\* D8 adalah usulan tambahan dari review ini karena katalog hanya memuat PAI Islam; keputusan resmi tetap milik Product Owner + Curriculum Lead.

## Rekomendasi tambahan (bukan bagian D1–D8)

1. ✅ **Kedalaman sudah diperbaiki (T-070, 2026-10-26).** 320/320 paket memenuhi ≥5 langkah/≥3 aktivitas/≥8 item; tidak ada lagi paket 3/2/4–6. Gap kedalaman tidak lagi menjadi penghalang tanda tangan.
2. **Isi `curriculumRefs` per mapel/fase hanya setelah referensi resmi diverifikasi** — bukan dari ringkasan sekunder. Format phase-level saja belum memenuhi R10 untuk audit per mapel.
3. ✅ **Duplikasi sudah diselesaikan (T-070, 2026-10-26).** 0 grup duplikasi persis dan 0 grup aktivitas identik.
4. **Jangan memakai klaim pemasaran “sesuai Kurikulum Merdeka”** sampai `curriculumRefs` terisi dan review manusia menandatangani R1–R12.

## Pemeriksaan pra-tanda-tangan (otomatis, 2026-10-26)

| Pemeriksaan | Hasil | Bukti |
|---|---|---|
| Validator + hash | 320/320 VALID | `npx tsx scripts/review-content.ts` |
| Kedalaman | 320/320 (≥5 langkah, ≥3 aktivitas, ≥8 item) | T-070, commit `04e51d0` |
| Duplikasi | 0 grup persis, 0 grup aktivitas identik | review 2026-10-26 |
| Alt text / feedback policy | 320/320 lengkap | metadata paket |
| `reviewStatus` | draft 320/320 | belum ada approval manusia |
| `curriculumRefs` | 4/320 (provisional ADR-0033) | diisi setelah tanda tangan |
| Klaim “Kurikulum Merdeka” di UI/CATALOG | 0 file | pemindaian `src/` + CATALOG |

**Yang tetap harus diverifikasi Curriculum Lead secara manual:** kesesuaian D1–D8 dengan referensi resmi CP/ATP per mapel/fase, kecukupan cakupan 8 unit/tahun/mapel, dan penggunaan label PAI.

## Tanda tangan keputusan

| Peran | Nama | Keputusan D1–D8 | Tanggal | Tanda tangan |
|---|---|---|---|---|
| Product Owner | _(tidak diisi agent)_ | **SETUJU** D1–D8 sesuai tabel | 2026-10-26 | Disetujui via instruksi sesi (tanpa tanda tangan tertulis) |
| Curriculum Lead | _(tidak diisi agent)_ | **SETUJU** D1–D8 sesuai tabel | 2026-10-26 | Disetujui via instruksi sesi (tanpa tanda tangan tertulis) |

> Kedua persetujuan tercatat, tetapi **bukan tanda tangan tertulis** dan **bukan review pedagogis**. `reviewStatus` tetap `draft`; klaim “sesuai Kurikulum Merdeka” dan pemetaan CP/ATP per bab tetap dilarang sampai reviewer manusia menyelesaikan R1–R12.

## Setelah keputusan (urutan kerja teknis)

1. ✅ Catat keputusan PO + Curriculum Lead sebagai [ADR-0034](../decisions/ADR-0034-od1-curriculum-matrix-po-approval.md) (proposal diperbarui; ADR berstatus *accepted via instruksi sesi*).
2. ✅ **Curriculum Lead menyetujui D1–D8** via instruksi sesi 2026-10-26 (tanpa tanda tangan tertulis); verifikasi CP/ATP per bab tetap menjadi pekerjaan lanjutan.
3. ✅ Isi `curriculumRefs` 316 paket sesuai fase mapel via `scripts/fill-curriculum-refs.mjs`; review otomatis R10 = **320/320**. ⏳ Verifikasi CP/ATP per bab tetap pekerjaan Curriculum Lead.
4. ✅ Perbaiki kedalaman & diferensiasi — selesai T-070 (2026-10-26); review otomatis 320/320 kedalaman, 0 duplikasi.
5. ⏳ Serahkan ke reviewer manusia untuk R1–R6, R8–R9, R12 memakai [lembar kerja review](../release/REVIEW_WORKSHEET_2026-10-25.md).

> Persetujuan PO atas D1–D8 **bukan** persetujuan rilis konten: review pedagogis manusia (R1–R6, R8–R9, R12) tetap menjadi prasyarat sebelum `reviewStatus` naik. Kedalaman dan duplikasi sudah diselesaikan T-070.
