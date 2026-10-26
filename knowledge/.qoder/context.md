# Context — L0 Active

**Sesi:** SESSION-2026-10-24-1 · **Autonomy:** L1 · **Fase:** pra-review agent + perbaikan loader (T-073) + dokumen review UX gabungan (T-074) + P0 UX 5/6 selesai (T-075) + UX-03 & audit a11y/E2E hijau (T-076) + dua mode Belajar/Admin (T-077) + sakelar ikon & thumbnail materi (T-078); menunggu reviewer manusia & keputusan desain

## Kondisi terverifikasi

- Git `main`, HEAD `ef7b89c` (sakelar mode ikon + thumbnail materi + grid katalog 3 kolom, T-078).
- App shell Tauri 2 + React 19 + TS + Vite + Tailwind; SQLite native; sync client + backend referensi.
- Konten: **320 paket draft** Kelas 1–6 (Fase A 96 + Fase B/C 224); seluruh aset paket **WebP** (320 hash unik, 0 reuse).
- Review teknis 2026-10-26 (pasca-T-070/T-071): **320/320 VALID**; alt/feedbackPolicy 320/320; kedalaman **320/320**; **0 duplikasi**; R10 `curriculumRefs` **320/320** (fase A/B/C, versi 2024).
- Pra-review agent 2026-10-26 (T-072): R1 **66** paket sinyal · R3 **40** · R4 **0** · R5 **184** (170 matching identik dengan eksplorasi, 91 bias posisi kunci; 1188/2851 item tak terpetakan via kata kunci) · R6 **0** · R8 **0** · R9 **0** · R12 **1** temuan (`CATALOG.md` tanpa label eksplisit “Pendidikan Agama Islam”). **Tanpa PASS/FAIL; bukan approval.**
- OD-1: Product Owner **dan Curriculum Lead** menyetujui D1–D8 via instruksi sesi 2026-10-26 ([ADR-0034](../decisions/ADR-0034-od1-curriculum-matrix-po-approval.md); tanpa tanda tangan tertulis); `curriculumRefs` 320/320 phase-level; CP/ATP per bab belum diverifikasi; `reviewStatus` tetap `draft`.
- Katalog: indeks build-time `public/content-catalog.json` (ADR-0031), 320 entri; Beranda siap 8,7 dtk termasuk cold start.
- Review UX/UI gabungan 2026-10-26 (T-074): [dokumen](../design/UX_REVIEW_LAYOUT_PEMBELAJARAN_2026-10-26.md) — 20 temuan (5 P1 · 10 P2 · 5 P3), 8 prinsip UX, matriks 10 state interaksi, checklist 13 item, rekomendasi dua mode, baseline skala IFP, roadmap P0–P3, 6 keputusan terbuka (D-UX-1…D-UX-6). Berkas eksternal `review-layout-pembelajaran-gerbang-edukasi.md` (337 baris/14.998 byte) diunduh dari share page lalu digabung; 4 klaimnya dikoreksi via kode. **Bukan approval; tanpa usability test**; verifikasi tautan 50/50 valid.
- P0 UX (T-075): **5/6 selesai** — copy netral, `subjectLabel()` bersama (7 slug + fallback), token `teal-strong`/`danger-strong`, breadcrumb Beranda tombol, hint matching, satu pesan penyimpanan. Butir 3 (metadata internal) tertahan D-UX-1/D-UX-4; P1 tertahan D-UX-2. Verifikasi DOM dev PASS; screenshot hanya Jelajah Materi.
- UX-03 (T-076): kartu hasil kuis/mencocokkan/mengurutkan `tabIndex={-1}` + `scrollIntoView`/`focus()` setelah penilaian; 3 asersi fokus di `e2e:activities`. Harness a11y memakai kuis bawaan “Kuis Penguatan”; tombol eksplorasi “Lanjut berlatih”. Hasil: a11y **16/16 PASS** (0 error, 7 warning reflow), E2E smoke 8 · activities 8 · home 9 · journey 11 · profile 7 PASS.
- Dua mode (T-077): `AppMode` `belajar|admin` di [navigation.ts](../../src/navigation.ts); mode belajar memakai lebar perangkat penuh tanpa sidebar + bar empat tujuan [StudentNavigation](../../src/components/layout/StudentNavigation.tsx), layar Konten/Lisensi/Pengaturan dialihkan ke Beranda; mode admin tetap sidebar lengkap. Sakelar “Mode aplikasi” di bilah atas berupa **dua tombol ikon** (`aria-pressed`), tersimpan per perangkat sebagai `preferences.appMode` di **SQLite `app_meta`** (default `admin`; rekaman lama tanpa field tetap terbaca). Bukti persistensi: test Rust `app_mode_survives_database_reopen` + DB perangkat berisi `"appMode":"belajar"` setelah sakelar dipakai. **Restore setelah muat ulang** dibuktikan E2E (T-078b). **Belum:** PIN/otorisasi mode admin, skala tipografi mode siswa (D-UX-2).
- Grid katalog (T-078): kartu materi **3 kolom** mulai 768 px (`md:grid-cols-3`, tetap satu kolom di ponsel); E2E `home-catalog` 10/10 + a11y 17/17.
- Thumbnail materi (T-078): katalog membawa `coverAsset` **320/320**; [LessonThumbnail](../../src/components/content/LessonThumbnail.tsx) dipakai kartu Jelajah Materi dan kartu “Lanjutkan belajar” — bundled via URL glob, paket impor via `content_read_asset` → blob URL, fallback inisial subjek. Bukti visual: `catalog-thumbnails.png` (artefak E2E).
- Blocker rilis: 8 item terdaftar ([RELEASE_BLOCKERS](../api/RELEASE_BLOCKERS_2026-10-24.md)); B-03 kode selesai tetapi belum di-deploy; B-07 secret sementara belum dibersihkan.
- Aset: 152 gambar Kelas 1–3 + 168 Kelas 4–6 dibuat internal via Google Flow; lisensi pihak ketiga: tidak ada.

## Keputusan aktif

- ADR-0001 Tauri 2 + React/TS · ADR-0003 kontrak konten v1 · ADR-0004 persistensi native · ADR-0031 katalog build-time · ADR-0033 `curriculumRefs` provisional · **ADR-0034 OD-1 D1–D8 (PO approved, provisional)**.

## Validasi terakhir

- `npm run content:prereview`: 320 paket → [PEDAGOGICAL_PREREVIEW_2026-10-26.md](../content/PEDAGOGICAL_PREREVIEW_2026-10-26.md) · [sampel 40 paket](../content/PEDAGOGICAL_SAMPLE_2026-10-26.md) · [CSV flag](../content/prereview-flags-2026-10-26.csv) · [JSON bukti](../content/prereview-evidence-2026-10-26.json). Status: **PRA-REVIEW AGENT — BUKAN APPROVAL**.
- `npx tsx scripts/review-content.ts`: 320 paket dianalisis (kedalaman 320/320, R10 320/320, 0 duplikasi); ringkasan ada di [REVIEW_REPORT_2026-10-26_ALL_DRAFTS.md](../content/REVIEW_REPORT_2026-10-26_ALL_DRAFTS.md).
- `npm test` 93/93 + fixture 4/4 + catalog 320/320 · `cargo test` 65/65 · validator 320/320 VALID · `npm run build` PASS (dist 320 WebP, 0 PNG).
- `npm run a11y` **PASS** 17 pemeriksaan (0 error, 7 warning reflow/target sentuh; termasuk shell mode belajar 640/320) · E2E smoke 8/8 · activities 8/8 · **home 10/10** · journey 11/11 · profile 7/7 · **mode-switch 6/6** (T-078, termasuk restore setelah muat ulang).
- DV-01…DV-20 NOT RUN; mesin dev Windows 10 vs target Windows 11 + Android 14.

## Next

1. ⏳ Reviewer manusia menilai R1–R6, R8–R9, R12 memakai [lembar kerja](../release/REVIEW_WORKSHEET_2026-10-25.md) + paket pra-review; **agent tidak boleh mengisi PASS/FAIL**.
2. ⏳ Verifikasi CP/ATP per bab oleh Curriculum Lead (referensi phase-level belum klaim per bab).
3. ⏳ Tindak lanjut temuan pra-review: 170 paket matching identik dengan eksplorasi, 91 paket bias posisi kunci, 82 kalimat panjang, 67 tujuan cakupan kata kunci rendah, label PAI di katalog.
4. ⏳ Coba dua mode di app desktop (sakelar Belajar/Admin di bilah atas), lalu verifikasi visual Hasil Belajar berisi data + NVDA. **D-UX-1 sudah diputuskan dan diterapkan (T-077).** Keputusan desain yang masih memblokir sisa UX: D-UX-2 (skala IFP), D-UX-4 (metadata), D-UX-5 (bentuk matching), D-UX-6 (prioritas matching). P0 butir 1–2, 4–6 dan UX-03 selesai (T-075/T-076).
5. Gate rilis lain: B-07 → B-02 → B-03, signing, DV-01…DV-20.
