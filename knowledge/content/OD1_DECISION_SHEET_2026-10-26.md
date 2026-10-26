# Lembar Keputusan OD-1 — Matriks Mapel & Kurikulum (2026-10-26)

**Status:** `MENUNGGU KEPUTUSAN` — **bukan approval**. Lembar ini disiapkan agar Product Owner + Curriculum Lead dapat memutuskan D1–D7 secara terpisah dari review pedagogis.
**Dasar:** [CURRICULUM_PROPOSAL.md](CURRICULUM_PROPOSAL.md) · [ADR-0033](../decisions/ADR-0033-curriculum-refs-d6-provisional.md) · [review teknis 2026-10-26](REVIEW_REPORT_2026-10-26_ALL_DRAFTS.md) · data aktual 320 paket.
**Yang tidak boleh dilakukan agent:** mengisi tanda tangan, menaikkan `reviewStatus`, atau mengklaim kesesuaian kurikulum tanpa referensi resmi.

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
| Kedalaman | 4 paket memenuhi ≥5 langkah/≥3 aktivitas/≥8 item; 316 belum |

## Keputusan yang diminta

| ID | Keputusan | Opsi | Rekomendasi agent (bukan keputusan) | Konsekuensi |
|---|---|---|---|---|
| D1 | Kerangka kurikulum | Kurikulum Merdeka / K13 / lainnya | **Kurikulum Merdeka** (Permendikbudristek 12/2024) | Menentukan struktur fase dan referensi resmi |
| D2 | IPA & IPS | IPAS terpadu / IPA + IPS terpisah | **IPAS terpadu Kelas 3–6** (sudah terimplementasi) | Tidak perlu ubah katalog; Kelas 1–2 tetap tanpa IPAS |
| D3 | Bahasa Inggris | Wajib / pilihan / tidak ada | **Pilihan, belum diproduksi** pada rilis awal | 0 paket; tidak ada klaim cakupan |
| D4 | Seni | Satu strand / pilihan strand | **Satu strand `seni-rupa`** untuk rilis awal | 48 paket; strand musik/tari/teater masuk backlog |
| D5 | Muatan lokal | Ada / tidak; penyedia | **Tidak ada di rilis awal** | Tidak ada konten pihak ketiga; sekolah menentukan sendiri |
| D6 | Format `curriculumRefs` | `{framework, id, version}` / string bebas | **Pertahankan `{framework, id, version}`** (provisional ADR-0033); fase A = Kelas 1–2, B = Kelas 3–4, C = Kelas 5–6 | 316 paket dapat diisi setelah keputusan; pemetaan CP per mapel tetap perlu verifikasi Curriculum Lead |
| D7 | Standar “konten lengkap” (OD-8) | Jumlah unit per mapel/kelas/semester | **8 unit/tahun/mapel (4/semester)**; total 320 paket | Menjadi gerbang cakupan rilis; kedalaman pelajaran dinilai terpisah |
| D8* | Cakupan PAI | PAI Islam saja (label eksplisit) / tambah agama lain / tunda | **PAI Islam saja dengan label eksplisit**, agama lain masuk backlog | Mencegah klaim “PAI-BP” multi-agama yang tidak akurat |

\* D8 adalah usulan tambahan dari review ini karena katalog hanya memuat PAI Islam; keputusan resmi tetap milik Product Owner + Curriculum Lead.

## Rekomendasi tambahan (bukan bagian D1–D7)

1. **Jangan tanda tangan OD-1 sebelum kedalaman diperbaiki.** 316 paket masih 3 langkah / 2 aktivitas / 4–6 item; standar internal menuntut ≥5 / ≥3 / ≥8.
2. **Isi `curriculumRefs` per mapel/fase hanya setelah referensi resmi diverifikasi** — bukan dari ringkasan sekunder. Format phase-level saja belum memenuhi R10 untuk audit per mapel.
3. **Perbaiki 3 grup duplikasi persis** dan 7 grup aktivitas identik sebelum review manusia, agar reviewer tidak menghabiskan waktu pada konten kembar.
4. **Jangan memakai klaim pemasaran “sesuai Kurikulum Merdeka”** sampai `curriculumRefs` terisi dan review manusia menandatangani R1–R12.

## Tanda tangan keputusan

| Peran | Nama | Keputusan D1–D8 | Tanggal | Tanda tangan |
|---|---|---|---|---|
| Product Owner |  |  |  |  |
| Curriculum Lead |  |  |  |  |

> Tanpa kedua tanda tangan, status OD-1 tetap **BELUM DISETUJUI** dan `reviewStatus` tetap `draft`.

## Setelah keputusan (urutan kerja teknis)

1. Catat keputusan sebagai ADR (menggantikan status `PROPOSED` proposal).
2. Isi `curriculumRefs` untuk 316 paket sesuai fase mapel; jalankan ulang `npx tsx scripts/review-content.ts` sampai R10 = 320/320.
3. Perbaiki kedalaman & diferensiasi; jalankan ulang review otomatis.
4. Serahkan ke reviewer manusia untuk R1–R6, R8–R9, R12 memakai [lembar kerja review](../release/REVIEW_WORKSHEET_2026-10-25.md).
