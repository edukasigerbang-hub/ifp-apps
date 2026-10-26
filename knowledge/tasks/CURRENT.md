# CURRENT — Task Aktif

**Sesi:** SESSION-2026-10-24-1
**Autonomy:** L1 (BALANCED)
**Status:** WIP — OD-1 disetujui PO + Curriculum Lead (via sesi); kedalaman, duplikasi, dan `curriculumRefs` 320/320 selesai; pra-review agent R1–R6/R8–R9/R12 selesai (bukan approval); P0 UX 5/6 selesai (metadata internal tertahan D-UX-4); UX-03 (fokus kartu hasil) selesai; mode belajar/admin selesai (T-077); sakelar ikon, thumbnail materi, pemilih kelas collapsible (T-078); **foto profil lokal + ilustrasi Beranda (T-079)**; a11y 17/17 PASS, E2E 7 skenario PASS; sisa prasyarat: review manusia

## Selesai sesi ini

| ID | Task | Hasil |
|---|---|---|
| T-000 | Inisialisasi knowledge OS | 20 artefak knowledge + state engine |
| T-001 | Fase A — Git + ADR | Repo Git, commit `503c2fc`, ADR-0001/0002 |
| T-002 | Fase C — app shell | Tauri 2 + React 19 + TS + Vite + Tailwind; 8 layar placeholder |
| T-003 | Fase D — schema konten | Zod schema v1 + validator + verifikasi hash + CLI + JSON Schema |
| T-004 | Prasyarat materi | Proposal OD-1, rubrik review pedagogis, ADR-0003 |
| T-005 | Pilot konten draft | `matematika-kelas3-pecahan` v0.1.0: 1 lesson, 2 aktivitas, 4 diagram; VALID |
| T-006 | Pratinjau Player | Paket pilot dirender di layar Player: eksplorasi 4 langkah + kuis + skor; desktop & mobile lulus |
| T-007 | Fase E — repository lokal | SQLite native + migrasi + 4 command; hasil kuis tersimpan atomik; layar Hasil Belajar |
| T-008 | Fase I — sinkronisasi | Outbox state native + engine TS + kontrak + mock server; 1 event acknowledged E2E |
| T-008b | Backend sinkronisasi referensi | HTTP server TS + SQLite; auth, idempotensi, batas, rate limit; 11 test + E2E nyata |
| T-010 | Review teknis konten | R11/R7/R10/R12; temuan kontras diperbaiki; laporan review ditulis |
| T-009 | Device spike (readiness) | Android init + build debug PASS (APK 129 MB); install/launch & Windows 11 NOT RUN |
| T-011 | Fase F — Content Manager | Impor folder, validasi native, staging, aktivasi atomik, rollback; E2E v1→v2→rollback PASS |
| T-012 | Content Runtime wiring | Player memuat paket impor aktif (managed-first) + aset via blob; E2E judul v2 & rollback PASS |
| T-013 | Katalog multi-paket | `content_list_active` + pemilih paket; E2E 2 paket (Matematika & IPA) ganti judul PASS |
| T-014 | Fase H — License core | Ed25519 canonical, verifikasi native, import offline, status UI, test vectors; E2E PASS |
| T-015 | License Service referensi | Aktivasi/refresh/verify/transfer/deactivate; serial hash; E2E aktivasi online PASS |
| T-016 | Backup & Restore | SQLite backup API + manifest + integrity + restore dengan guard schema; UI Pengaturan |
| T-017 | Windows release candidate | `tauri build` PASS; MSI 4.21 MiB + NSIS 2.94 MiB; belum install/sign/release |
| T-018 | Diagnostics export | JSON native dengan counts/status; redaksi ID & tanpa secret; UI Pengaturan |
| T-019 | Ekspor hasil belajar CSV | CSV BOM/CRLF, escaping + anti injection; UI Hasil Belajar |
| T-020 | Profil, sesi, preferensi | Profil lokal + aktif, sesi per profil, preferensi animasi/teks; E2E PASS |
| T-021 | Sinkronisasi otomatis | Scheduler 10 dtk/online/outbox/5 menit; E2E tanpa klik → server menerima 1 event |
| T-022 | CI + harness E2E | Workflow web+Rust, `npm run ci`, `npm run e2e` (CDP, data terisolasi); smoke 7 pemeriksaan |
| T-023 | Siklus hidup profil | Rename (unik, 1–80) + hapus dua langkah; proteksi profil terakhir; hapus data transaksional; E2E PASS |
| T-024 | Audit aksesibilitas | `npm run a11y` 8 layar + keyboard; kontras & heading diperbaiki; 0 error/0 warning |
| T-025 | E2E alur belajar | `npm run e2e:journey`: impor paket, Player managed, eksplorasi, kuis 100, sesi/attempt/outbox, Hasil Belajar; 11 pemeriksaan |
| T-026 | E2E rollback konten | `npm run e2e:rollback`: impor v0.1.0 → v0.2.0 → rollback → v0.1.0; badge/judul/status paket; 9 pemeriksaan |
| T-027 | E2E lisensi | `npm run e2e:license`: key Ed25519 per run via `IFP_LICENSE_KEYS`; impor valid, expired ditolak, signature rusak ditolak, lisensi lama tetap aktif; 8 pemeriksaan |
| T-028 | E2E aktivasi online | `npm run e2e:license-online`: server referensi + key sementara; aktivasi serial → native verify → server audit; serial tak dikenal ditolak; 7 pemeriksaan |
| T-029 | A11y reflow & state dinamis | `npm run a11y`: 8 layar + reflow 320/640 + teks 200% + target sentuh + konfirmasi hapus; 15 pemeriksaan, 0 warning |
| T-030 | Beranda & Jelajah Materi | Katalog per lesson (bundled + impor, managed menang), filter kelas/mapel/cari, pilih lesson → Player, kartu “Lanjutkan belajar”; 6 unit test + E2E 8 pemeriksaan |
| T-031 | Aktivitas benar-salah & jawaban singkat | `responseText` di kontrak lokal/sync; UI radio Benar/Salah + input teks; normalisasi jawaban; remount per aktivitas; E2E 5 pemeriksaan |
| T-032 | Pilihan ganda multi-jawaban | Checkbox, penilaian himpunan (tanpa nilai parsial), satu baris respons per opsi; E2E 6 pemeriksaan; harness menunggu shell |
| T-033 | Aktivitas matching & ordering | Kontrak `pairs`/`items+correctOrder` divalidasi Zod; UI select & naik/turun; skor per pasangan/posisi; E2E 5 aktivitas |
| T-034 | E2E backup → restore | Export/inspect (hash), mutasi, restore (profil/sesi/attempt/skor pulih), tolak schema lebih baru; 9 pemeriksaan |
| T-035 | A11y hasil kuis + preflight | `npm run a11y` 16 pemeriksaan: state hasil kuis diaudit; harness menolak start bila app masih berjalan |
| T-036 | Fase J — review konten lokal | Migrasi `0005`; RBAC guru native; ledger append-only + UI; audit & guard hapus profil reviewer; E2E 7 pemeriksaan |
| T-037 | Fase J — ekspor audit review | CSV BOM/CRLF + anti-injection; hanya guru; tolak overwrite; E2E 9 pemeriksaan |
| T-038 | OD-4 default privasi | Bagian “Privasi & data”; peringatan PII pada ekspor CSV hasil/review; ADR-0025 provisional; smoke 8 pemeriksaan |
| T-039 | OD-5 default lisensi | Clock rollback (last-seen 5 mnt); permintaan transfer (licenseId/machineId/alasan); UI + 4 test Rust; E2E 10 pemeriksaan |
| T-040 | OD-7 increment 1 | OpenAPI v1; enrollment perangkat + token HMAC; sync menerima token perangkat; `/healthz`; 4 test server baru |
| T-041 | OD-7 increment 2 (Supabase + Cloudflare) | Migrasi **aditif** `0002_app_backend.sql` (setelah skema web); Worker enrollment/sync (WebCrypto HMAC, Supabase REST); 7 test Worker |
| T-042 | Konten Kelas 4 Semester 2 lengkap | 28 paket draft (7 mapel × 4 bab); batch 13 menutup Seni B05–B07, PJOK B05–B07, PAI B05–B08; VALID + impor PASS; total 56 paket |
| T-043 | Konten Kelas 3 — outline + batch 1 | Outline S1/S2; 4 paket B01 (Matematika, Bahasa Indonesia, IPAS, Pancasila) VALID + impor PASS; filter Kelas 3 terverifikasi; total 60 paket |
| T-044 | Konten Kelas 3 lengkap | 52 paket sisa (S1 B02–B04 + S2 B05–B08) VALID; impor 56/56 PASS; E2E home 9/9; bundle utama 415 kB + lazy 86 kB; total 112 paket |
| T-045 | Konten Kelas 5 batch 1 | Outline S1/S2; 4 paket B01 (Matematika, Bahasa Indonesia, IPAS, Pancasila) VALID + impor PASS; filter Kelas 5 terverifikasi; total 116 paket |
| T-046 | Review teknis 116 paket + register blocker | Audit aktual: 116/116 VALID, alt lengkap, packageId unik; laporan review + 8 blocker rilis (0 selesai) |
| T-047 | Konten Kelas 5 batch 2 | 4 paket (Seni Rupa, PJOK, PAI B01 + Matematika B02) VALID + impor PASS; audit 120/120 VALID; total 120 paket |
| T-048 | Konten Kelas 5 batch 3 | 4 paket (Bahasa, IPAS, Pancasila B02 + Matematika B03) VALID + impor PASS; audit 124/124 VALID; total 124 paket |
| T-049 | Konten Kelas 5 Semester 1 lengkap | 16 paket sisa VALID; impor 28/28 PASS; audit 140/140 VALID; build 415 kB + lazy 108 kB |
| T-050 | Konten Kelas 5 Semester 2 lengkap | 28 paket VALID; impor 56/56 Kelas 5 PASS; audit 168/168 VALID; build 415 kB + lazy 130 kB |
| T-051 | Konten Kelas 6 lengkap | 56 paket (S1 28 + S2 28) VALID; impor 56/56 PASS; audit 224/224 VALID; build 415 kB + lazy 172 kB |
| T-052 | Konten Kelas 1 batch 1 | Outline S1/S2 + 6 paket B01 (6 mapel) VALID; impor 6/6 PASS; audit 230/230 VALID |
| T-053 | Konten Kelas 1 Semester 1 lengkap | 18 paket sisa VALID; impor 24/24 PASS; audit 248/248 VALID; build 415 kB + lazy 191 kB |
| T-054 | Konten Kelas 1 Semester 2 lengkap | 24 paket VALID; impor 48/48 Kelas 1 PASS; audit 272/272 VALID; build 415 kB + lazy 209 kB |
| T-055 | Konten Kelas 2 batch 1 | Outline S1/S2 + 6 paket B01 VALID; impor 6/6 PASS; audit 278/278 VALID |
| T-056 | Konten Kelas 1–6 inti lengkap | 42 paket sisa Kelas 2 VALID; impor 48/48 PASS; **total 320 paket** (Fase A 96 + B/C 224); audit 320/320 VALID |
| T-057 | Performa katalog 320 paket | Indeks `public/content-catalog.json` build-time (ADR-0031); Beranda 8,7 dtk (sebelumnya timeout >180 dtk); E2E home 9/9 PASS |
| T-058 | Blocker B-03: transfer/deactivate Worker | `licenseAdmin.ts` + token admin provisial (ADR-0032); 13/13 Worker test; typecheck PASS; deploy menunggu secret |
| T-059 | Checklist B-01 & B-04 | Checklist signing Windows/Android/updater + SMTP/DNS/reset end-to-end; siap dijalankan saat kredensial tersedia |
| T-060 | Checklist B-02/05/06/07/08 | Runbook backup/rotasi kunci, DV perangkat, review R1–R12, pembersihan secret, keputusan signature konten |
| T-061 | Cek konsistensi indeks katalog | Checker membandingkan 320 entri vs paket; masuk `npm test`; negative test exit 1; status OK 320/320 |
| T-062 | Lembar kerja review R1–R12 | CSV 320 baris + panduan Markdown per kelas/mapel; R10 BLOCKED-D6, R11 pre-verified |
| T-063 | Verifikasi P0 | Worker live masih 501; 3 file secret `%TEMP%` masih ada; backup kunci belum ditemukan; urutan B-02→B-07→B-03 |
| T-064 | Analisis gap kualitas 320 paket | 0/320 memenuhi G1–G12; semua 3 langkah/2 aktivitas/4–6 item; 16 paket aktivitas identik; 61 aset dipakai ulang; 54 tujuan belum tercakup penuh |
| T-065 | Pilot gold Kelas 4 B01 | 4 paket v0.2.0: 5 langkah, 3 aktivitas, 10 item, 4 tujuan; aset unik; 11/12 G PASS; G10 review manusia |
| T-066 | G8 pilot selesai | `curriculumRefs` fase-b/2024 diisi provisional (ADR-0033); validator 4/4 VALID 0 warning; G8 4/320 |
| T-067 | Inventaris aset + prompt pack | CSV 320 aset (82 hash, 61 reuse) + 333 prompt (6 cover kelas, 7 cover mapel, 320 materi) untuk Google Flow |
| T-068 | Review teknis 320 paket + lembar keputusan OD-1 | [Review 2026-10-26](../content/REVIEW_REPORT_2026-10-26_ALL_DRAFTS.md) (320/320 valid; R10 4/320; kedalaman 316 belum) + [lembar keputusan](../content/OD1_DECISION_SHEET_2026-10-26.md) D1–D8 |
| T-069 | Persetujuan PO OD-1 | D1–D8 disetujui Product Owner 2026-10-26 ([ADR-0034](../decisions/ADR-0034-od1-curriculum-matrix-po-approval.md)); Curriculum Lead belum tanda tangan; `curriculumRefs` belum diisi |
| T-070 | Pengayaan kedalaman & diferensiasi 320 paket | 316 paket warisan dinaikkan ke ≥5 langkah/≥3 aktivitas/≥8 item; 3 paket duplikat persis didiferensiasi; review ulang 320/320 VALID, 0 grup duplikasi; `npm test` 85/85, build PASS |
| T-071 | Persetujuan Curriculum Lead + `curriculumRefs` | D1–D8 disetujui Curriculum Lead via instruksi sesi 2026-10-26; 316 refs diisi via `scripts/fill-curriculum-refs.mjs`; R10 **320/320**; review 320/320 VALID |
| T-072 | Pra-review agent R1–R6/R8–R9/R12 | 320 paket dipindai deterministik: R1 66 paket sinyal, R3 40, R4 0, R5 184 (170 matching identik dengan langkah eksplorasi, 91 bias posisi kunci), R6/R8/R9 bersih, R12 1 temuan label PAI. **Bukan approval**; `reviewStatus` tetap `draft` — [laporan](../content/PEDAGOGICAL_PREREVIEW_2026-10-26.md) |
| T-073 | Perbaikan pemuatan paket bawaan | `packageDirOf` di `src/content/loadPackages.ts` salah menurunkan direktori untuk modul `lessons/`/`activities/`, sehingga Player menampilkan “Paket bawaan gagal divalidasi” dan Beranda 0 paket. Diperbaiki + unit test `loadPackages.test.ts`; paket bawaan terbuka di Player |
| T-074 | Dokumen review UX/UI gabungan | 7 screenshot full-page + audit kode + review eksternal digabung menjadi [`design/UX_REVIEW_LAYOUT_PEMBELAJARAN_2026-10-26.md`](../design/UX_REVIEW_LAYOUT_PEMBELAJARAN_2026-10-26.md): 20 temuan (5 P1, 10 P2, 5 P3), 8 prinsip UX, matriks 10 state interaksi, checklist 13 item, rekomendasi dua mode, baseline skala IFP, roadmap P0–P3, 6 keputusan terbuka. Berkas eksternal `.md` (337 baris/14.998 byte) diunduh & isinya digabung; 4 klaimnya dikoreksi setelah cek kode. **Bukan approval**; tidak ada usability test |
| T-075 | Eksekusi P0 UX yang tidak bergantung keputusan | 5 dari 6 butir P0 selesai: copy netral + istilah “Skor”, `subjectLabel()` bersama (Home/Curriculum/Player/Results), token kontras `teal-strong`/`danger-strong`, breadcrumb Beranda jadi tombol + alasan disabled matching, satu pesan penyimpanan. Butir 3 (metadata internal) tertahan D-UX-1/D-UX-4. `npm test` 89/89, build PASS; verifikasi DOM + 1 screenshot |
| T-076 | UX-03 + a11y + E2E | Kartu hasil `tabIndex={-1}` + `scrollIntoView`/`focus()` setelah penilaian di kuis, mencocokkan, mengurutkan (3 komponen). Harness a11y & E2E diperbarui ke konten aktual (“Kuis Penguatan”, tombol “Lanjut berlatih”) dan 3 asersi fokus baru. `npm test` 89/89, build PASS, `npm run a11y` **PASS 16 pemeriksaan** (0 error, 7 warning reflow), E2E smoke 8/8 · activities 8/8 · home 9/9 · journey 11/11 · profile 7/7 |
| T-077 | Dua mode: belajar & admin (D-UX-1) | Mode belajar = shell selebar perangkat **tanpa sidebar**, bar navigasi 4 tujuan (Beranda, Jelajah Materi, Aktivitas Interaktif, Hasil Belajar), layar Konten/Lisensi/Pengaturan disembunyikan. Mode admin = sidebar lengkap seperti sebelumnya. Sakelar “Belajar/Admin” di bilah atas (`aria-pressed`), tersimpan per perangkat (`preferences.appMode`, default `admin`; rekaman lama tetap terbaca). Layar di luar mode dialihkan ke Beranda. `npm test` 93/93, `cargo test` 64/64, build PASS, a11y **17 pemeriksaan PASS**, E2E baru `mode-switch` 5/5 + regresi 5 skenario PASS |
| T-078 | Sakelar mode ikon + thumbnail materi + rail + tile kelas | Sakelar mode kini **dua tombol ikon** (topi wisuda/slider), `aria-label` + `title`, target 44 px; persistensi tetap di SQLite `app_meta.preferences.appMode` (test baru `app_mode_survives_database_reopen`). Mode belajar memakai **rail ikon 80 px** (4 tujuan, label lewat tooltip + teks sr-only), bukan bar atas. Katalog membawa `coverAsset`; kartu Jelajah Materi dan kartu “Lanjutkan belajar” menampilkan thumbnail dari aset paket yang sudah ada (bundled via `import.meta.glob`, impor via `content_read_asset` → blob URL), fallback inisial subjek. Filter kelas berupa **tile thumbnail cover materi tiap kelas** (bukan dropdown) di dalam panel **collapsible** — header menampilkan chip kelas terpilih (“Kelas N”), panel menutup otomatis setelah memilih dan bisa dibuka lagi; grid materi 3 kolom. `npm test` 93/93, `cargo test` 65/65, build PASS, a11y 17/17 PASS, E2E home **13/13** + mode **6/6** + regresi 4 skenario PASS |
| T-079 | Foto profil lokal + ilustrasi Beranda | **Foto profil**: tabel `profile_avatars` (migrasi `0006`, BLOB + `mime_type` PNG/JPEG/WebP, FK cascade), perintah `profile_avatar_set/clear/get` dengan sniff magic bytes + batas 1,5 MB, `ProfileView.hasAvatar`; data URL dikembalikan ke webview; Pengaturan memakai dialog native (`@tauri-apps/plugin-dialog`) untuk memilih/menghapus foto. **Beranda**: hero bergradasi teal→surface dengan avatar bulat, eyebrow “Ruang belajar”, sapaan “Halo, {nama}”, dan **ilustrasi belajar** bingkai bergambar cover Flow yang sudah ada (pilihan: cover matematika kelas 3, fallback cover pertama) + aksen dekoratif; tanpa aset baru (aturan Flow-only). `cargo test` **67/67**, `npm test` PASS (fixture 4/4, catalog 320/320), build PASS, E2E `home-catalog` **14/14** (avatar + ilustrasi termuat, screenshot `hero-beranda.png`), a11y 17/17, mode-switch 6/6, profile-lifecycle 7/7, smoke 8/8 |

## Status prasyarat materi pembelajaran

| Prasyarat | Status | Bukti |
|---|---|---|
| Kontrak/schema paket konten | **DONE** | [SCHEMA.md](../content/SCHEMA.md), `schemaVersion 1.0.0` |
| Validator + test | **DONE** | `npm test` → 11/11 PASS; fixture VALID |
| Konten Kelas 4 draft | **DONE (draft)** | [Katalog](../content/CATALOG.md): 56 paket Kelas 4 (S1 28 + S2 28), VALID + 2 warning per paket; pilot kelas 3 dipindah ke fixture E2E |
| Konten Kelas 3 draft | **DONE (draft)** | 56 paket (S1 28 + S2 28), VALID + 2 warning per paket; impor 56/56 PASS |
| Konten Kelas 5 draft | **DONE (draft)** | 56 paket (S1 28 + S2 28), VALID + 2 warning per paket; impor 56/56 PASS |
| Konten Kelas 6 draft | **DONE (draft)** | 56 paket (S1 28 + S2 28), VALID + 2 warning per paket; impor 56/56 PASS |
| Fase B & C (Kelas 3–6) | **DONE (draft)** | 224 paket draft; Fase A dimulai |
| Konten Kelas 1 draft | **DONE (draft)** | 48 paket (S1 24 + S2 24), VALID + 2 warning per paket; impor 48/48 PASS |
| Konten Kelas 2 draft | **DONE (draft)** | 48 paket (S1 24 + S2 24), VALID + 2 warning per paket; impor 48/48 PASS |
| Konten inti Kelas 1–6 | **DONE (draft)** | **320 paket** (Fase A 96 + Fase B/C 224); semua VALID, `curriculumRefs` kosong |
| Daftar mapel/kurikulum (OD-1) | **DISETUJUI PO + CURRICULUM LEAD (via sesi) — 2026-10-26** | [lembar keputusan 2026-10-26](../content/OD1_DECISION_SHEET_2026-10-26.md) · [ADR-0034](../decisions/ADR-0034-od1-curriculum-matrix-po-approval.md) — D1–D8 disetujui kedua peran; tanpa tanda tangan tertulis; CP/ATP per bab belum diverifikasi |
| Rubrik review pedagogis | **TEKNIS PASS / PRA-REVIEW AGENT ADA / MANUSIA BELUM** | [Review teknis 2026-10-26](../content/REVIEW_REPORT_2026-10-26_ALL_DRAFTS.md): 320/320 valid; kedalaman 320/320; 0 duplikasi; R10 320/320 (phase-level) · [Pra-review agent R1–R6/R8–R9/R12](../content/PEDAGOGICAL_PREREVIEW_2026-10-26.md) (bukan approval) |
| Reviewer manusia ditunjuk | **BELUM** | Butuh guru/curriculum lead |
| Penyimpanan hasil lokal | **DONE** | SQLite native, transaksi attempt+respons+progress+outbox |
| Hak/lisensi aset | **TERDOKUMENTASI** | 320 aset internal via Google Flow (inventaris + laporan batch); tanpa lisensi pihak ketiga |

## Next task

**T-005b — Review Kelas 4 + sign-off OD-1** (butuh keputusan/reviewer manusia)
1. ✅ Review teknis 320 paket (2026-10-26): 320/320 valid + hash; R10 4/320; R5 struktur bersih (1 peringatan lunak); kedalaman 320/320 memenuhi standar; 0 grup duplikasi persis/aktivitas identik — [laporan review](../content/REVIEW_REPORT_2026-10-26_ALL_DRAFTS.md).
2. ✅ Product Owner **dan Curriculum Lead** menyetujui D1–D8 (2026-10-26, via instruksi sesi; tanpa tanda tangan tertulis) — [ADR-0034](../decisions/ADR-0034-od1-curriculum-matrix-po-approval.md) · [lembar keputusan OD-1](../content/OD1_DECISION_SHEET_2026-10-26.md).
3. ✅ Isi `curriculumRefs` 316 paket — selesai via `scripts/fill-curriculum-refs.mjs`; R10 **320/320** (fase A/B/C, versi 2024). ⏳ Verifikasi CP/ATP per bab tetap pekerjaan Curriculum Lead.
4. ✅ Perbaiki kedalaman (≥5 langkah/≥3 aktivitas/≥8 item) dan duplikasi — T-070 (2026-10-26): 316 paket warisan diperkaya; 320/320 memenuhi ambang; 0 duplikasi.
5. ⏳ Tunjuk reviewer manusia (curriculum + bahasa + aksesibilitas); `reviewStatus` tetap `draft` sampai semua R1–R12 LULUS.
6. ✅ Pra-review agent R1–R6/R8–R9/R12 selesai 2026-10-26 (T-072): bukti per paket + sampel baca 40 paket + CSV flag, **tanpa PASS/FAIL**. Reviewer manusia memakai paket ini sebagai bahan, bukan pengganti penilaian.

**T-009 acceptance — BLOCKED** (tidak ada perangkat Android 14 fisik / Windows 11 / panel 4K; lihat [readiness](../device/DEVICE_SPIKE_READINESS.md)).

**T-012 Content Runtime wiring — DONE.**
**T-013 Katalog multi-paket — DONE.**
**Fase H License core — DONE (online service referensi juga).**

**Berikutnya:** review manusia R1–R6/R8–R9/R12 untuk 320 paket (bahan pra-review agent tersedia di [PEDAGOGICAL_PREREVIEW_2026-10-26.md](../content/PEDAGOGICAL_PREREVIEW_2026-10-26.md)) + verifikasi CP/ATP per bab; lalu opsi D3 (Bahasa Inggris), D5 (mulok), Koding & KA. Blocker rilis: [RELEASE_BLOCKERS_2026-10-24.md](../api/RELEASE_BLOCKERS_2026-10-24.md) — 8 item, belum ada yang selesai. Register gap: [TEST_GAPS.md](../testing/TEST_GAPS.md).
## Verifikasi sesi ini

| Check | Hasil |
|---|---|
| `npm test` (T-070) | **PASS** — 85/85 unit + 4/4 fixture + catalog 320/320 |
| `npm run build` (T-070) | **PASS** — dist 320 WebP, 0 PNG |
| Review konten ulang (T-070) | **PASS** — 320/320 VALID; kedalaman 320/320; 0 duplikasi; R10 4/320 saat itu |
| Review konten ulang (T-071) | **PASS** — R10 **320/320** (fase A/B/C); 320/320 VALID; kedalaman 320/320; 0 duplikasi |
| `npm test` (T-071) | **PASS** — 85/85 + fixture 4/4 + catalog 320/320 |
| `npm test` (T-072) | **PASS** — 85/85 + fixture 4/4 + catalog 320/320 |
| Pra-review agent R1–R6/R8–R9/R12 (T-072) | **SELESAI — BUKAN APPROVAL** — 320 paket; R1 66, R3 40, R4 0, R5 184, R6 0, R8 0, R9 0, R12 1 temuan label |
| Sampel baca stratifikasi (T-072) | **ADA** — 40 paket (1 per sel kelas×mapel), teks apa adanya untuk ahli mapel |
| Pemuatan paket bawaan (T-073) | **PASS** — bug `packageDirOf` diperbaiki; Player membuka paket bawaan (Kelas 1 Bahasa Indonesia, 3 aktivitas, 5 langkah); `npm test` 86/86; `npm run build` PASS |
| E2E home/journey setelah T-073 | **NOT RUN** — aplikasi desktop sedang berjalan (harness menolak start bila app aktif) |
| Perbaikan P0 UX (T-075) | **PASS (sebagian)** — copy, label subjek, kontras, breadcrumb/hint, satu pesan penyimpanan selesai; metadata internal tertahan D-UX-1/D-UX-4 |
| `npm test` (T-075) | **PASS** — 89/89 unit test + fixture 4/4 + catalog 320 entri/320 paket |
| `npm run build` (T-075) | **PASS** — `tsc --noEmit` + Vite; 2082 modul ditransformasi; utilitas `text-teal-strong`/`text-danger-strong` ada di CSS hasil build |
| Verifikasi DOM (T-075) | **PASS** — opsi mapel “Bahasa Indonesia/PAI/PJOK/Pendidikan Pancasila”, breadcrumb pindah ke `#home`, hint “Lengkapi 6 pasangan lagi”, copy kuis “Skor minimal lulus: 75 dari 100”, eksplorasi “menyelesaikan 5 langkah”, satu pesan pratinjau |
| Verifikasi Hasil Belajar dengan data (T-075) | **NOT RUN** — data lokal hanya ada di jendela desktop; browser pratinjau menampilkan state kosong |
| Screenshot ulang P0 (T-075) | **PARTIAL** — `p0-01-kurikulum-label.png` tersimpan; screenshot Player gagal karena surface in-app Browser tersembunyi (`NATIVE_BROWSER_VIEWPORT_UNAVAILABLE`) |
| `npm run a11y` (T-076) | **PASS** — 16 pemeriksaan; 0 error, 7 warning (reflow 640/320 & target sentuh); termasuk state dinamis konfirmasi hapus & hasil kuis |
| E2E smoke (T-076) | **PASS** — 8 pemeriksaan |
| E2E activities (T-076) | **PASS** — 8 pemeriksaan; 3 asersi baru: fokus berpindah ke kartu hasil kuis benar-salah, mencocokkan, mengurutkan |
| E2E home-catalog (T-076) | **PASS** — 9 pemeriksaan |
| E2E learning-journey (T-076) | **PASS** — 11 pemeriksaan |
| E2E profile-lifecycle (T-076) | **PASS** — 7 pemeriksaan |
| `npm test` (T-077) | **PASS** — 93/93 unit (termasuk 4 test `navigation.test.ts`) + fixture 4/4 + catalog 320/320 |
| `cargo test` (T-077) | **PASS** — 64/64; `preferences` 5 test termasuk rekaman lama tanpa `appMode` tetap terbaca dan `appMode` invalid ditolak |
| `npm run build` (T-077) | **PASS** — `tsc --noEmit` + Vite |
| `npm run a11y` (T-077) | **PASS** — **17 pemeriksaan**; 0 error, 7 warning (reflow 640/320 & target sentuh); tambah audit mode belajar (tanpa sidebar + reflow 640/320) |
| E2E mode-switch (T-077) | **PASS** — 5 pemeriksaan: sidebar admin, konten 1600 px tanpa sidebar di mode belajar, 4 tujuan belajar, mode tersimpan (`preferences_get`), navigasi ke Hasil Belajar, kembali ke admin |
| E2E regresi (T-077) | **PASS** — smoke 8, home-catalog 9, activities 8, learning-journey 11, profile-lifecycle 7 |
| Screenshot dua mode (T-077) | **ADA** — `mode-admin.png` + `mode-belajar.png` di artefak `.tmp-e2e/…` (tidak di-commit); a11y `a11y-mode-belajar.png` |
| `cargo test` (T-078) | **PASS** — 65/65; tambah `app_mode_survives_database_reopen` (tulis → tutup → buka ulang DB → `appMode` tetap `belajar`) |
| Persistensi mode di SQLite (T-078) | **VERIFIED** — DB perangkat `%APPDATA%/id.gerbangedukasi.ifp/ifp.db`, `app_meta.preferences` = `{"reducedMotion":false,"fontScale":"normal","appMode":"belajar"}` setelah sakelar dipakai; `App.tsx` membaca nilai ini saat start |
| E2E home-catalog (T-078) | **PASS** — 10 pemeriksaan; 2 asersi thumbnail (bawaan + impor) dan screenshot `catalog-thumbnails.png` |
| E2E mode-switch (T-078) | **PASS** — 6 pemeriksaan: tombol ikon (`aria-label` Belajar/Admin), mode tersimpan, dan **restore setelah `Page.reload`** (simulasi restart: tetap tanpa sidebar + 4 tujuan belajar) |
| E2E regresi (T-078) | **PASS** — smoke 8, activities 8, learning-journey 11, profile-lifecycle 7 |
| `npm run a11y` (T-078) | **PASS** — 17 pemeriksaan; 0 error, 7 warning reflow/target sentuh |
| Grid katalog 3 kolom (T-078c) | **PASS** — `md:grid-cols-3`; E2E `home-catalog` 10/10 + screenshot 3 kartu per baris; a11y 17/17 |
| Rail ikon mode belajar (T-078d) | **PASS** — rail 80 px, 4 tujuan (label sr-only + tooltip), konten 1520 px pada viewport 1600; E2E `mode-switch` 6/6 termasuk restore setelah muat ulang |
| Tile kelas thumbnail (T-078d) | **PASS** — 6 tile kelas memakai cover materi (aset paket), chip “Semua kelas”; E2E `home-catalog` 11/11 |
| Pemilih kelas collapsible (T-078f) | **PASS** — header `aria-expanded`/`aria-controls` menampilkan chip “Semua kelas” / “Kelas N”; memilih kelas menutup panel (header tetap menampilkan “Kelas 3”), header membuka panel lagi; state tetap satu `grade` untuk filter; E2E `home-catalog` **13/13** + a11y 17/17 + build PASS |
| Tata letak lebar penuh (T-078e) | **PASS** — Beranda/Jelajah memakai lebar penuh (grid 3 kolom, mapel 3 kolom di xl); layar baca dipusatkan `mx-auto max-w-4xl`; build PASS, E2E 11/11 + 6/6, a11y 17/17, regresi PASS |
| `cargo test` (T-079) | **PASS** — **67/67**; 2 test avatar baru (simpan→baca data URL→hapus; tolak non-gambar/kosong/>1,5 MB dengan kode `PROFILE_AVATAR_INVALID`/`PROFILE_AVATAR_TOO_LARGE`) |
| Migrasi `0006_profile_avatars` (T-079) | **VERIFIED** — tabel `profile_avatars` (PK `profile_id`, `mime_type` CHECK PNG/JPEG/WebP, `bytes` BLOB, FK `ON DELETE CASCADE`); checksum migrasi terdaftar di `db.rs`; DB perangkat terbuka tanpa error |
| E2E home-catalog (T-079) | **PASS** — **14/14**; `profile_avatar_set` dengan cover Flow kelas 3 → `hasAvatar` benar → setelah `Page.reload` avatar `<img>` dan ilustrasi `[data-learning-illustration]` termuat (`naturalWidth > 0`); screenshot `hero-beranda.png` |
| `npm test` (T-079) | **PASS** — unit + fixture 4/4 + catalog 320/320 |
| `npm run build` (T-079) | **PASS** — `tsc --noEmit` + Vite |
| `npm run a11y` (T-079) | **PASS** — 17 pemeriksaan; 0 error, 7 warning reflow/target sentuh; Beranda 18 interaktif / 49 kontras, Pengaturan 24 interaktif / 56 kontras |
| E2E regresi (T-079) | **PASS** — mode-switch 6/6 (sakelar ikon + restore), profile-lifecycle 7/7, smoke 8/8 |
| Tautan & nomor baris dokumen UX (T-074) | **PASS** — 50 tautan relatif valid, 0 hilang; semua anotasi `#L<n>` ≤ jumlah baris berkas dan menunjuk baris tidak kosong |
| Unduh berkas review eksternal (T-074) | **PASS** — `review-layout-pembelajaran-gerbang-edukasi.md` 337 baris / 14.998 byte UTF-8; disimpan di `.tmp-external/` (git-ignored), tidak di-commit |
| Klaim eksternal vs kode (T-074) | **PASS** — 4 klaim diperiksa: player punya `loading` & storage `saved/error`; `Sebelumnya/Lanjut` ada di eksplorasi; pencarian & filter berfungsi |
| Review UX dengan pengguna (T-074) | **NOT RUN** — tidak ada sesi dengan guru/siswa; skor 6,5/10 bersifat heuristik eksternal |
| `npm test` | **PASS** — 15 unit test + 4 golden fixture |
| `npm run fixtures:check` | **PASS** — 4/4 cocok dengan expected (VALID/3/7/1 issue) |
| `npm run content:validate` | **PASS** — fixture VALID, 2 warning (draft, curriculumRefs kosong) |
| Review teknis konten | **PASS** — 1 temuan kontras diperbaiki (4.36 → 5.40); R10 masih BLOCKING |
| Review pedagogis manusia | **BELUM** — R1–R5/R8–R9 butuh guru/Curriculum Lead |
| Android build (debug) | **PASS** — APK universal 129 MB; Kotlin fallback dipakai |
| Install/launch Android 14 | **NOT RUN** — `adb devices` kosong |
| Windows 11 build/install | **NOT RUN** — mesin Windows 10 |
| Content Manager tests | **PASS** — 5/5 Rust (impor, hash, traversal, duplikat, rollback) |
| E2E Content Manager | **PASS** — impor v0.1.0 → v0.2.0 → rollback v0.1.0; UI status benar |
| E2E Content Runtime | **PASS** — Player menampilkan v0.2.0 (judul impor), aset blob 800px, rollback kembali v0.1.0 |
| E2E katalog multi-paket | **PASS** — 2 kartu paket; ganti Matematika ↔ IPA mengubah judul |
| License core tests | **PASS** — 11/11 (valid, grace, expired, not-yet, product, device, tamper, key, perpetual, DB) |
| E2E lisensi | **PASS** — lisensi Ed25519 diimpor; UI Berlaku; entitlements; request aktivasi |
| License Service tests | **PASS** — 9/9 (aktivasi, konflik binding, revoked, refresh, verify, transfer/deactivate admin, 503, hash serial) |
| E2E aktivasi online | **PASS** — serial → server menandatangani → client verifikasi native → UI Berlaku; audit `activated` |
| License online/transfer | **ADA (referensi)** — server referensi; produksi/TLS/rotasi key belum |
| Backup/restore | **PASS** — Rust 3 test + E2E export/inspect; UI ringkasan sebelum restore |
| Restore otomatis/retensi | **BELUM** — manual; OD-4 |
| Windows release build | **PASS** — MSI + NSIS dihasilkan; install/sign NOT RUN |
| Android release build | **BELUM** — hanya debug APK |
| Diagnostics export | **PASS** — 633 byte JSON, redaksi aman; UI tombol tersedia |
| Ekspor CSV hasil | **PASS** — 3 test (escaping/injection/overwrite); UI tombol |
| Profil & sesi | **PASS** — 3 test profil; E2E buat Budi, sesi & attempt terikat, Hasil menampilkan Budi |
| Preferensi | **PASS** — 3 test; E2E root `reduce-motion font-large` |
| Sinkronisasi otomatis | **PASS** — setelah simpan hasil, outbox acknowledged & server menerima 1 event tanpa klik |
| CI lokal (`npm run ci`) | **PASS** — 43 web + 20 server test, build PASS |
| Harness E2E (`npm run e2e`) | **PASS** — smoke 7 pemeriksaan; screenshot & result.json di `.tmp-e2e/` |
| Workflow CI remote | **PASS** — push `c51af2f` → run `40040384407`: web+server & Rust sukses (2026-10-24) |
| Branch protection `main` | **AKTIF** — wajib PR + 2 required checks (strict), admin terikat, force-push/hapus diblokir |
| Profil: rename & hapus | **PASS** — Rust 6 test; E2E Budi→Budi Santoso, hapus profil tanpa data, proteksi profil terakhir |
| Hapus profil berdata (UI) | **UNIT PASS / E2E BELUM** — jalur `PROFILE_HAS_DATA` diuji Rust; langkah UI kedua belum diotomasi |
| Audit aksesibilitas (`npm run a11y`) | **PASS** — 8 layar, 0 error/0 warning; skip link + 10 langkah Tab bernama |
| Screen reader / zoom / dialog | **BELUM** — audit heuristik; NVDA, reflow 200%, dan state dinamis belum diuji |
| E2E alur belajar | **PASS** — impor 8 file, managed-first, eksplorasi, kuis 100, 1 sesi/1 attempt, outbox 1, skor tampil |
| E2E rollback konten | **PASS** — v0.1.0 → v0.2.0 (judul E2E) → rollback → v0.1.0; list paket 0.1.0 active / 0.2.0 disabled |
| E2E lisensi | **PASS** — key e2e termuat; impor valid → UI “Berlaku”; expired → `LICENSE_EXPIRED`; signature rusak → `LICENSE_SIGNATURE_INVALID`; lisensi lama tetap aktif |
| E2E aktivasi online | **PASS** — server referensi seed serial; aktivasi → UI “Berlaku”; binding machine & audit `activated` di DB server; serial tak dikenal → `LICENSE_SERIAL_INVALID` |
| Reflow & teks 200% | **PASS** — 8 layar pada 640/320 px tanpa overflow; teks 200% tanpa overflow |
| Target sentuh | **PASS** — semua target ≥44 px setelah select preferensi diperbaiki dari 36 px |
| State dinamis konfirmasi hapus | **PASS** — 0 error/0 warning |
| Beranda & katalog | **PASS** — katalog 1 materi bawaan; cari/filter; buka lesson; kuis 100; kartu “Lanjutkan belajar” membuka lesson terakhir |
| Unit test katalog | **PASS** — 6 test baru; total 49/49 |
| Aktivitas benar-salah & jawaban singkat | **PASS** — E2E 5 pemeriksaan: dua aktivitas dinilai 100, 2 percobaan tersimpan, respons teks `responseText` |
| Regresi aktivitas | **PASS** — journey 11/11, a11y 15 pemeriksaan, cargo 48/48, npm 53/53 |
| A11y hasil kuis | **PASS** — 16 pemeriksaan, 0 error/0 warning (dua kali); preflight app berjalan |
| Review konten lokal | **PASS** — E2E 7 pemeriksaan: guru mencatat review, nama/catatan tersimpan; siswa ditolak `REVIEW_FORBIDDEN`; profil reviewer tidak dapat dihapus |
| Migrasi 0005 | **PASS** — `cargo test` 53/53; migrasi tercatat otomatis di backup |
| Ekspor audit review | **PASS** — CSV 1 baris/173 byte; BOM+CRLF; guru saja; siswa `REVIEW_FORBIDDEN`; `cargo test` 55/55 |
| Checksum migrasi lintas line ending | **PASS** — checksum ternormalisasi; legacy diterima & di-upgrade; app start pada DB pengguna; 3 test baru (cargo 58/58) |
| OD-4 default privasi | **PASS** — smoke 8/8 (bagian privasi + default retensi); a11y 16 pemeriksaan; build/tests PASS |
| OD-5 default lisensi | **PASS** — E2E lisensi 10/10 (transfer ditolak tanpa lisensi, berhasil dengan lisensi); cargo 62/62; a11y 16 pemeriksaan |
| OD-7 auth perangkat | **PASS** — server 24/24 (enrollment, kode salah, token sync, device mismatch, healthz); typecheck PASS |
| OD-7 Supabase + Worker | **PASS** — worker 7/7, typecheck PASS; npm total 79/79; migrasi aditif selaras skema repo web |
| Pilihan ganda multi-jawaban | **PASS** — E2E 6 pemeriksaan: 3 aktivitas dinilai 100, 3 percobaan, rata-rata 100; npm 56/56 |
| Matching & ordering | **PASS** — E2E 8 pemeriksaan: 5 aktivitas dinilai 100, 5 percobaan; validasi kontrak ditolak saat rusak (unit) |
| Unit test interaksi | **PASS** — 12 test baru; total npm 68/68 |
| E2E backup → restore | **PASS** — 9 pemeriksaan (dua kali): hash cocok, data pulih, schema lebih baru ditolak |
| Player memuat paket impor | **ADA** — semua paket aktif dapat dipilih (ADR-0009) |
| Player: eksplorasi → kuis | **PASS** — 4 langkah, skor 100/Lulus; logika gagal/ambang diuji unit |
| Player: desktop 1600×900 & mobile 640×900 | **PASS** — screenshot diperiksa |
| Rust repository tests | **PASS** — 6/6 (termasuk rollback event duplikat & persistensi reopen) |
| E2E simpan hasil (Tauri WebView via CDP) | **PASS** — 1 sesi, 1 attempt, 4 respons, 1 outbox pending; Hasil Belajar menampilkan skor 100 |
| Persistensi hasil belajar | **ADA** — `app_data_dir()/ifp.db`; sinkronisasi cloud belum |
| Rust sync tests | **PASS** — 5/5 (eligibility, backoff/dead-letter, ack idempotent, status, device ID) |
| Sync engine tests | **PASS** — 8/8 (accepted/duplicate, rejected, network, missing ack, empty, payload rusak, backoff) |
| E2E sinkronisasi (mock server) | **PASS** — "1 event tersinkronisasi"; outbox `acknowledged`, counts 0/0/1 |
| Server referensi | **PASS** — 11/11 test; typecheck PASS |
| E2E backend nyata | **PASS** — 1 event tersimpan di server + outbox client `acknowledged` |
| Backend produksi | **BELUM** — OD-7; server referensi bukan produksi |
| DV-01…DV-20 | NOT RUN |

## Blocker

| ID | Blocker | Dampak |
|---|---|---|
| OD-1 | Matriks mapel/kurikulum: **disetujui PO + Curriculum Lead via sesi 2026-10-26** | Phase-level terisi 320/320; CP/ATP per bab belum diverifikasi; klaim kesesuaian kurikulum tetap dilarang |
| — | Reviewer manusia belum ditunjuk | `reviewStatus: approved` tidak boleh disetel |
| GAP-1 | Prototype `index.html` tidak ada | Referensi UI visual hilang |

## Handoff

**Sesi ditutup 2026-10-24 01:25 +07:00, dibuka kembali 06:30 +07:00.** Working tree bersih pada `c51af2f`; tidak ada gelombang terbuka; aplikasi dev berjalan.

### Next Session Handoff

1. **Jaga CI hijau**: `main` dilindungi — alur sekarang branch → PR → 2 checks hijau → merge; push langsung diblokir (termasuk admin).
2. **Perluas E2E**: smoke, profil, alur belajar, rollback, lisensi offline/online, a11y sudah ada; sisa dialog native (impor file).
3. **A11y manual**: NVDA/TalkBack, zoom 200%/reflow, state dinamis (hasil kuis, konfirmasi hapus), target sentuh.
4. **Gate rilis**: OD-1 sign-off konten, OD-4 retensi/privasi, OD-5 kebijakan lisensi, OD-6 signing/identifier, OD-7 backend+CSP produksi, key lisensi produksi, DV-01…DV-20.

Resume minimal: `.qoder/state.json` → `.qoder/index/index-state.json` → `.qoder/context.md` → `.qoder/memory.md` → `CURRENT.md`.

Mulai dari [CATALOG.md](../content/CATALOG.md) dan [CURRICULUM_PROPOSAL.md](../content/CURRICULUM_PROPOSAL.md). D1–D8 sudah disetujui PO + Curriculum Lead via sesi 2026-10-26; tanpa review manusia, paket tetap **draft**. Arsitektur: [ADR-0004](../decisions/ADR-0004-local-persistence.md); profil [ADR-0015](../decisions/ADR-0015-profiles-preferences.md)/[ADR-0018](../decisions/ADR-0018-profile-lifecycle.md); testing [ADR-0017](../decisions/ADR-0017-ci-e2e-harness.md)/[ADR-0019](../decisions/ADR-0019-automated-a11y-audit.md).

### Handoff Aset Materi Kelas 1–3 (2026-10-26, lanjutan)

**Status:** **152/152 gambar LENGKAP** — Kelas 1 48/48; Kelas 2 48/48; **Kelas 3 56/56** (96–151). Seluruh 152 file WebP ada di `content/materi/kelas1`–`kelas3` dan cocok dengan `content/materi/queue-kelas1-3.json`. **Migrasi manifest selesai:** 320/320 paket (Kelas 1–6) kini menunjuk WebP; validasi 320/320 VALID; `npm test` 85/85 lulus; `npm run build` sukses (dist 320 WebP, 0 PNG). Laporan: `knowledge/content/MATERI_KELAS1-3_BATCH1_2026-10-25.md` … `MATERI_KELAS1-3_BATCH38_2026-10-26.md`.

**Akun & perkakas aktif (2026-10-26):** generasi dilanjutkan di akun **Dewi Gardenia** (label akun diverifikasi di UI), project `218ad195-1801-4997-bffc-c754043067d6` (“Okt 25 - 15:50”). Karakter bernama **Ayu** dan **Bima** dibuat di akun ini (Karakter → Karakter baru → “Tambahkan dari project” → `ayu.jpg`/`bima.jpg` → nama + kepribadian → Selesai) dan dilampirkan ke setiap prompt satu per satu via “Tambahkan bahan ke kotak perintah” (picker hanya menampilkan karakter yang belum terpasang; pasang dua chip per prompt). Indeks 89–123 tuntas.

**Catatan banner (2026-10-26):** indeks 91 sempat kena banner “aktivitas yang tidak biasa”; diselesaikan dengan satu retry “Coba lagi” lalu satu refresh halaman, lalu prompt dikirim ulang (prosedur sama seperti indeks 76/83/84/86/87; tanpa bypass, tanpa ganti akun). Batch 26 (92–95) bebas banner.

**Pasca-152 (SELESAI 2026-10-26):**
1. ✅ Migrasi manifes Kelas 1–6 dengan `scripts/migrate-materi-assets-to-webp.mjs --apply` — 320 paket, 669 referensi lesson/activity, idempoten.
2. ✅ Validasi 320/320 paket **VALID** (636 warning draft/curriculumRefs).
3. ✅ `npm test` 85/85 lulus; fixture 4/4; catalog 320 entri/320 paket. `npm run build` sukses (22,46 s; dist 320 WebP, 0 PNG).
4. ✅ Tidak ada paket yang masih menunjuk PNG; seluruh aset paket kini `.webp`.

### Catatan operasional Flow (2026-10-25 20:47 +07:00)

- Surface in-app Browser harus terlihat (`visibilityState = visible`) sebelum klik; saat hidden, CDP input tidak terkirim dan `take_screenshot` gagal (`NATIVE_BROWSER_VIEWPORT_UNAVAILABLE`). Bila terjadi: minta user membuka panel; jangan mengulang klik otomatis.
- **Rasio composer WAJIB 4:3 (`crop_landscape`)** — pernah tersetel 16:9 dan menghasilkan 1376×768 yang tidak dipakai. Cek chip setelan sebelum setiap kirim.
- Setelah panel terlihat, `Enter` pada composer mengirim prompt (klik tombol juga berfungsi).
- Unduhan 1K Flow kadang selesai sebagai `<uuid>.tmp` beberapa detik sebelum rename; tunggu ukuran stabil dan verifikasi `file` (JPEG 1200×896).
- Batch 7 keluar native 1200×896; konversi canvas 1200×896 → WebP 0.9 via queue server `127.0.0.1:4789`, simpan `&grade=1`.
- **Jalur unduh tanpa klik (dipakai sejak indeks 22):** baca `img.currentSrc` hasil generasi dari DOM → buka URL `flow-content.google/image/...` di tab kedua (same-origin) → `fetch(location.href)` → canvas 1200×896 → `toBlob('image/webp',0.9)` → POST ke queue server.
- **UI Flow berganti ke layout agent (sejak 2026-10-25 ~21:30):** project menampilkan sidebar agent + composer "Apa yang ingin Anda buat?" + "Petunjuk agen". Prompt cukup dikirim ke agent (satu topik; minta "1 ilustrasi"), agent memakai Ayu/Bima dari konteks project — **tidak perlu melampirkan karakter manual**. Agent membalas "Berikut adalah N gambar …".
- **Ambil resolusi penuh dari grid agent:** thumbnail di grid adalah `flow.google.com/asb/...=s512-rw`; ganti sufiks menjadi `=s1600-rw` → respons **WebP 1200×896** (bukan JPEG). `fetch` same-origin (flow.google.com) → POST blob langsung ke queue server, tanpa canvas.
- Surface hanya dibutuhkan untuk mengirim prompt (Enter bekerja bila tab ter-attach); unduhan tidak lagi menyentuh panel.

### Handoff Pengayaan Konten (2026-10-26, T-070)

**Status:** kedalaman & duplikasi **SELESAI** untuk 320 paket draft. 316 paket warisan diperkaya via `scripts/enrich-legacy-packages.mjs` (2 langkah eksplorasi baru + 1 aktivitas penguatan); 3 paket duplikat persis didiferensiasi via `scripts/differentiate-duplicate-packages.mjs`. Review ulang: 320/320 VALID, kedalaman 320/320 (≥5 langkah/≥3 aktivitas/≥8 item), 0 grup duplikasi persis, 0 grup aktivitas identik. `npm test` 85/85 + fixture 4/4 + catalog 320/320; `npm run build` dist 320 WebP / 0 PNG.

**OD-1 (T-071):** D1–D8 disetujui PO + Curriculum Lead via instruksi sesi 2026-10-26 (tanpa tanda tangan tertulis); `curriculumRefs` terisi **320/320** fase A/B/C versi 2024 via `scripts/fill-curriculum-refs.mjs`. Verifikasi CP/ATP per bab belum dilakukan.

**Sisa (butuh manusia):** reviewer manusia R1–R6, R8–R9, R12; verifikasi CP/ATP per bab oleh Curriculum Lead. `reviewStatus` tetap `draft`.

**Perintah lanjut:** `resume` atau `lanjutkan` (boot dari `state.json` + `CURRENT.md`; antrean gambar 152/152 tuntas, migrasi WebP dan pengayaan kedalaman selesai — lanjut ke prioritas berikutnya: tanda tangan Curriculum Lead / gate rilis).

### Handoff Pra-Review Agent (2026-10-26, T-072)

**Status:** pra-review agent R1–R6/R8–R9/R12 **SELESAI** untuk 320 paket — **bukan approval**, tanpa PASS/FAIL, `reviewStatus` tetap `draft`. Dihasilkan oleh `npm run content:prereview` (`scripts/pedagogical-prereview.mjs`), deterministik dan dapat dijalankan ulang.

| Artefak | Isi |
|---|---|
| [PEDAGOGICAL_PREREVIEW_2026-10-26.md](../content/PEDAGOGICAL_PREREVIEW_2026-10-26.md) | Ringkasan temuan per kriteria + batas peran agent vs manusia |
| [PEDAGOGICAL_SAMPLE_2026-10-26.md](../content/PEDAGOGICAL_SAMPLE_2026-10-26.md) | Sampel baca 40 paket (1 per kelas×mapel), teks apa adanya untuk ahli mapel |
| [prereview-flags-2026-10-26.csv](../content/prereview-flags-2026-10-26.csv) | 320 baris metrik + flag per paket |
| [prereview-evidence-2026-10-26.json](../content/prereview-evidence-2026-10-26.json) | Bukti penuh per paket (objektif, item, posisi kunci, hint, aset) |

**Angka sinyal (bahan periksa, bukan vonis):** R1 66 paket (67 tujuan cakupan kata kunci <0.5; 1 tujuan tanpa kata bermakna) · R3 40 paket (82 kalimat melewati batas kata/kelas) · R4 0 (estimasi 10,5–14,4 menit) · R5 184 paket (170 matching identik dengan langkah eksplorasi, 91 semua kunci di posisi sama, 1188/2851 item tak terpetakan via kata kunci) · R6 0 (policy 320/320, hint 320/320, 0 kata kasar, 20 nada negatif perlu konteks) · R8 0 · R9 0 (320 aset ada) · R12 1 file (`CATALOG.md` tanpa label eksplisit “Pendidikan Agama Islam”).

**Temuan desain utama untuk reviewer:** 170 paket memakai pasangan matching yang identik dengan prompt/reveal eksplorasi (beban ganda, bukan penguatan), dan 91 paket menempatkan seluruh kunci pilihan ganda pada posisi opsi yang sama.

**Lembar kerja reviewer** (`knowledge/release/REVIEW_WORKSHEET_2026-10-25.md` + CSV) sudah disinkronkan: jumlah aktivitas terbaru, kolom R1–R12 dan reviewer tetap kosong.

### Handoff Review UX/UI (2026-10-26, T-074)

**Status:** dokumen gabungan selesai di [`design/UX_REVIEW_LAYOUT_PEMBELAJARAN_2026-10-26.md`](../design/UX_REVIEW_LAYOUT_PEMBELAJARAN_2026-10-26.md) — **bukan approval**, tanpa usability test. Menggabungkan review eksternal (ChatGPT share, skor heuristik 6,5/10) dengan audit kode aktual.

**Angka:** 20 temuan — P1 5 (skala IFP, feedback per jawaban, hasil di luar viewport, metadata internal, copy hardcoded), P2 10, P3 5. Kontras terukur: teal 2,81–2,95:1, danger di tint 4,23:1, label sidebar 4,06:1; muted 4,76:1 dan putih/primary 5,38:1 lolos.

**Yang perlu diputuskan manusia (bukan agent):** D-UX-1 dua mode Siswa/Pengelola · D-UX-2 baseline skala IFP (16–18 px vs 20–24 px) · D-UX-3 font · D-UX-4 perlakuan metadata DRAFT/versi · D-UX-5 bentuk matching · D-UX-6 prioritas matching P1 (literasi kelas 1) vs P2.

**Merge berkas eksternal (2026-10-26):** `review-layout-pembelajaran-gerbang-edukasi.md` diunduh dari share page (tombol “Download file” membuka URL raw; pointer click gagal karena surface browser tersembunyi, tombol dipicu via DOM satu kali) → 337 baris/14.998 byte UTF-8. Isi unik digabung: 8 prinsip UX (§5.1), aturan ilustrasi/ikon (§7.1), skor heuristik per area (§8.1), matriks state interaksi (§9.1), checklist 13 item (§9.2), urutan P0 → prototipe → uji → P1 (§12). Berkas asli tidak di-commit (karya pihak ketiga); substansi masuk dokumen kanonik dengan atribusi.

**Koreksi setelah cek kode:** review eksternal menyebut player belum punya state memuat/penyimpanan eksplisit dan `Sebelumnya` belum ada — setelah verifikasi, `Memuat konten…` ada ([LessonPlayer.tsx:179-185](../../src/screens/LessonPlayer.tsx#L179)), storage `saved`/`error` ada ([LessonPlayer.tsx:28-34](../../src/screens/LessonPlayer.tsx#L28)), dan `Sebelumnya`/`Lanjut` ada di eksplorasi ([ExplorationActivity.tsx:156-170](../../src/components/content/ExplorationActivity.tsx#L156)); celah sebenarnya adalah konsistensi antar tipe aktivitas.

**Catatan bukti:** screenshot ada di `F:\_ifp-apps\.tmp-screenshots\` (git-ignored; zip `layout-pembelajaran-2026-10-26.zip`); Hasil Belajar berisi data **belum** diverifikasi karena butuh jendela desktop.

### Handoff Eksekusi P0 UX (2026-10-26, T-075)

**Status:** 5 dari 6 butir P0 di [`design/UX_REVIEW_LAYOUT_PEMBELAJARAN_2026-10-26.md`](../design/UX_REVIEW_LAYOUT_PEMBELAJARAN_2026-10-26.md) selesai. Butir 3 (sembunyikan metadata internal) **tidak dieksekusi** karena menunggu D-UX-1 (dua mode) dan D-UX-4 (perlakuan metadata).

**Perubahan:**
- Copy: `QuizActivity` memakai “Skor minimal lulus: N dari 100” + pujian netral; `ExplorationActivity` memakai jumlah langkah dinamis dan tombol “Lanjut berlatih”.
- Label: modul baru [`src/content/subjectLabel.ts`](../../src/content/subjectLabel.ts) dengan peta 7 slug mapel katalog + fallback; dipakai Home, Curriculum, Player (metadata & pemilih paket), dan Hasil Belajar (judul lesson/aktivitas via katalog + paket bawaan).
- Kontras: token `--color-teal-strong #0b6f69` dan `--color-danger-strong #a8323c`; seluruh teks error di tint danger memakai `danger-strong`; label grup & footer sidebar `white/70`; teks “scaffold” dihapus.
- Afordansi: breadcrumb “Beranda” menjadi tombol (klik terverifikasi → `#home`); matching menyebut sisa pasangan saat tombol nonaktif; pesan penyimpanan footer dihapus dan informasi “belum disinkronkan” dipindah ke banner status.

**Verifikasi:** `npm test` **89/89** (3 test baru `subjectLabel`) + fixture 4/4 + catalog 320/320; `npm run build` **PASS**; DOM dev terverifikasi untuk label, breadcrumb, hint, copy kuis/eksplorasi, dan pesan tunggal. Screenshot: `p0-01-kurikulum-label.png` (`.tmp-screenshots/`, git-ignored); screenshot Player gagal karena surface browser tersembunyi. `npm run a11y` dan Hasil Belajar berisi data **belum** dijalankan/diverifikasi.

**Sisa:** butir 3 P0 (gated D-UX-4), P1 (skala IFP, feedback per jawaban, hasil di viewport, progres lintas aktivitas, target sentuh), P2/P3; D-UX-1 selesai di T-077, sisa keputusan D-UX-2…D-UX-6.

### Handoff UX-03 + Audit a11y + E2E (2026-10-26, T-076)

**Status:** UX-03 (kartu hasil di luar viewport) **selesai** untuk bagian otomatis; label tiga keadaan per jawaban (UX-02) tetap tertahan D-UX-5.

**Perubahan kode:** `QuizActivity`, `MatchingActivity`, `OrderingActivity` — kartu hasil memakai `ref`, `tabIndex={-1}`, `scrollIntoView({ block: "nearest" })` dan `focus()` saat hasil muncul; `aria-live="polite"` tetap. Cincin fokus `focus-visible:ring-2 ring-primary/50` untuk pengguna keyboard.

**Perubahan harness:**
- `scripts/e2e/scenarios/a11y.mjs` — audit hasil kuis memakai paket bawaan aktual: tombol “Kuis Penguatan” + opsi `opsi-penguatan-1-1`/`-2-2` (sebelumnya merujuk paket pilot “Kuis Pecahan Sederhana” yang tidak lagi menjadi lesson default).
- `scripts/e2e/scenarios/learning-journey.mjs`, `home-catalog.mjs` — tombol “Lanjut ke kuis” → “Lanjut berlatih” (copy P0 T-075).
- `scripts/e2e/scenarios/activities.mjs` — 3 asersi fokus kartu hasil (`document.activeElement` memuat “Skor 100 dari 100”) untuk kuis, matching, ordering.

**Verifikasi aktual:** `npm test` 89/89 + fixture 4/4 + catalog 320/320 · `npm run build` PASS · `npm run a11y` **PASS 16 pemeriksaan** (0 error, 7 warning reflow) · `npm run e2e` 8/8 · `e2e:activities` 8/8 · `e2e:home` 9/9 · `e2e:journey` 11/11 · `e2e:profile` 7/7.

**Catatan operasional:** proses `ifp-apps.exe` (PID 94584) masih hidup meski user menyatakan app ditutup; setelah konfirmasi user, proses ditutup dengan `taskkill /PID 94584 /F` agar harness bisa berjalan.

**Sisa:** Hasil Belajar berisi data (belum diverifikasi dengan data desktop), NVDA/screen reader manual, D-UX-2…D-UX-6.

### Handoff Dua Mode: Belajar & Admin (2026-10-26, T-077)

**Status:** D-UX-1 **diputuskan PO** lewat instruksi sesi (“mode belajar harus full device tanpa sidebar”); implementasi awal **selesai**. Mode belajar = pembatas UI, **bukan otorisasi**: belum ada PIN/kunci mode admin.

**Perilaku:**
- Mode **admin** (default): sidebar navy lengkap (Belajar + Kelola), seperti sebelum T-077.
- Mode **belajar**: sidebar tidak dirender; konten selebar perangkat; bar navigasi horizontal 4 tujuan (Beranda, Jelajah Materi, Aktivitas Interaktif, Hasil Belajar); Player tetap dapat dibuka dari materi/Beranda tetapi tidak menjadi tujuan navigasi; Konten/Lisensi/Pengaturan tidak dapat dibuka (layar dipindahkan ke Beranda, hash diselaraskan).
- Sakelar mode di bilah atas: dua tombol ikon (topi wisuda = Belajar, slider = Admin) dengan grup `Mode aplikasi`, `aria-pressed`, `aria-label`, dan `title`; perubahan langsung berlaku dan disimpan ke `preferences.appMode` (SQLite `app_meta`).

**Perubahan kode:**
- `src/navigation.ts` — `AppMode`, `DEFAULT_APP_MODE` (`admin`), `studentNavigationItems`, `navigationItemsForMode()`, `isScreenAllowedInMode()`, `isAppMode()`.
- `src/components/layout/AppShell.tsx` — sidebar hanya mode admin; `StudentNavigation` hanya mode belajar; `MobileNavigation` memakai item sesuai mode.
- `src/components/layout/TopBar.tsx` — sakelar mode; pesan `aria-live` bila penyimpanan gagal.
- `src/components/layout/StudentNavigation.tsx` (baru; **digantikan rail ikon `StudentRail.tsx` pada T-078d**), `src/components/layout/MobileNavigation.tsx`.
- `src/App.tsx` — memuat `appMode` saat start, pengalihan layar terlarang, simpan via `preferences_set`.
- `src/data/preferencesRepository.ts` — `Preferences.appMode`.
- `src-tauri/src/preferences.rs` — `app_mode` dengan serde default `admin` (rekaman lama tetap terbaca), validasi `belajar|admin`, 2 test baru.
- `src/screens/SettingsScreen.tsx` — catatan bahwa mode diatur dari bilah atas.
- `src/navigation.test.ts` (baru) — 4 test; `scripts/e2e/scenarios/mode-switch.mjs` (baru) + `npm run e2e:mode`; `a11y.mjs` menambah audit mode belajar.

**Verifikasi aktual:** `npm test` 93/93 + fixture 4/4 + catalog 320/320 · `cargo test` 64/64 · `npm run build` PASS · `npm run a11y` **PASS 17 pemeriksaan** (0 error, 7 warning reflow) · E2E `mode-switch` 5/5 · regresi smoke 8/8 · home 9/9 · activities 8/8 · journey 11/11 · profile 7/7.

**Catatan operasional:** proses dev (`npm run tauri dev`) dan `ifp-apps.exe` sisa ditutup agar harness bisa start; aplikasi dev dijalankan ulang setelah verifikasi.

**Sisa:** skala tipografi/target sentuh mode siswa (D-UX-2), pemindahan metadata internal ke area pengelola (D-UX-4), keputusan PIN/kunci mode admin, verifikasi visual Hasil Belajar dengan data nyata + NVDA.

### Handoff Sakelar Ikon + Thumbnail Materi (2026-10-26, T-078)

**Status:** selesai dan terverifikasi. Permintaan PO: sakelar mode cukup ikon, wajib tersimpan di memori/SQL; setiap pilihan materi diberi thumbnail dari gambar yang sudah ada.

**Perubahan kode:**
- `src/components/layout/TopBar.tsx` — dua tombol ikon SVG inline (topi wisuda untuk Belajar, slider untuk Admin), 44×44 px, `aria-label` = “Belajar”/“Admin”, `title` = “Mode belajar”/“Mode admin”, `aria-pressed` tetap.
- `src/content/lessonCovers.ts` (baru) — peta URL aset bundled via `import.meta.glob(..., { eager: true, query: "?url" })` dan pemetaan media type dari ekstensi.
- `src/components/content/LessonThumbnail.tsx` (baru) — thumbnail `object-cover` 16:9; bundled memakai URL glob, paket impor memakai `content_read_asset` → blob URL (di-revoke saat unmount); fallback inisial subjek bila aset tidak ada/gagal.
- `src/content/catalog.ts`, `scripts/lib/contentCatalog.mjs`, `scripts/check-catalog-index.mjs` — field `coverAsset` (aset gambar pertama manifest) di 320/320 entri katalog.
- `src/screens/CurriculumScreen.tsx` — kartu materi menampilkan thumbnail di atas judul, grid **3 kolom** (md+); filter kelas berupa panel **collapsible** berisi tile thumbnail (cover materi per kelas), header menampilkan chip kelas terpilih dan menutup otomatis setelah memilih (T-078f), menggantikan dropdown.
- `src/components/layout/StudentRail.tsx` (baru) — rail ikon 80 px untuk mode belajar: 4 tujuan, ikon SVG inline, label sr-only + tooltip, `aria-current`; menggantikan bar horizontal `StudentNavigation.tsx` (dihapus).
- Tata letak (T-078e) — Beranda & Jelajah Materi memakai lebar penuh (`w-full`); daftar mapel Beranda 3 kolom di xl; layar baca (Results, Settings, Content, License, Player, placeholder) dipusatkan `mx-auto w-full max-w-4xl`.
- `src/screens/HomeScreen.tsx` — kartu “Lanjutkan belajar” menampilkan thumbnail (56 px lebar di md+).
- `src-tauri/src/preferences.rs` — test `app_mode_survives_database_reopen` membuktikan persistensi setelah DB ditutup dan dibuka ulang.
- E2E: `mode-switch.mjs` mencocokkan tombol lewat `aria-label`, mengukur rail 80 px dan konten sisa; `a11y.mjs` `clickLabel` menerima `aria-label`; `home-catalog.mjs` menunggu tile kelas + dua thumbnail termuat + screenshot `catalog-thumbnails.png`.

**Verifikasi aktual:** `npm test` 93/93 + fixture 4/4 + catalog 320/320 · `cargo test` **65/65** · `npm run build` PASS · `npm run a11y` **PASS 17** (0 error, 7 warning) · E2E `mode-switch` **6/6** (rail + restore setelah muat ulang) · `home-catalog` **13/13** (tile kelas, panel collapsible, thumbnail) · smoke 8/8 · activities 8/8 · journey 11/11 · profile 7/7. Screenshot `mode-belajar.png` memperlihatkan rail ikon dan Beranda selebar layar; `catalog-thumbnails.png` memperlihatkan header “Kelas 3” tertutup dan 3 kartu per baris.

**Catatan persistensi:** nilai tersimpan di SQLite `app_meta` (key `preferences`), bukan localStorage; dibaca `App.tsx` saat start. DB perangkat diperiksa langsung dan berisi `appMode":"belajar"` setelah sakelar dipakai.

**Sisa:** thumbnail memakai aset pertama paket (bukan gambar khusus sampul); mode masih pembatas UI tanpa PIN. Pada lebar 768–1023 px grid 3 kolom terasa sempit (judul membungkus).

### Handoff Foto Profil + Ilustrasi Beranda (2026-10-27, T-079)

**Status:** selesai dan terverifikasi. Permintaan PO: Beranda diberi ilustrasi yang relevan dan foto profil.

**Perubahan kode:**
- `src-tauri/src/migrations/0006_profile_avatars.sql` (baru) — tabel `profile_avatars(profile_id PK, mime_type CHECK png/jpeg/webp, bytes BLOB, updated_at, FK cascade)`; terdaftar di `db.rs` sebagai versi 6 (checksum SHA256, normalisasi CRLF).
- `src-tauri/src/profile.rs` — `MAX_AVATAR_BYTES = 1_500_000`; `sniff_image_mime` (magic bytes); `set_profile_avatar` (validasi profil/ukuran/mime, UPSERT), `clear_profile_avatar`, `get_profile_avatar` → data URL; `ProfileView.hasAvatar` lewat `EXISTS(...)`; perintah `profile_avatar_set` (path berkas; cek ukuran metadata dulu), `profile_avatar_clear`, `profile_avatar_get`; 2 test baru.
- `src-tauri/src/error.rs` — `PROFILE_AVATAR_INVALID`, `PROFILE_AVATAR_TOO_LARGE`, `PROFILE_AVATAR_UNREADABLE`. `src-tauri/src/lib.rs` — 3 perintah terdaftar.
- `src/data/profileRepository.ts` — `Profile.hasAvatar`, `readProfileAvatar` (cache modul), `setProfileAvatar`, `clearProfileAvatar`, invalidasi cache saat hapus profil.
- `src/components/profile/ProfileAvatar.tsx` (baru) — foto `object-cover` atau fallback inisial; `alt=""` dekoratif.
- `src/components/home/LearningIllustration.tsx` (baru) — bingkai kartu berisi thumbnail cover (16:10) + aksen lingkaran/sunburst/star; `aria-hidden`.
- `src/screens/HomeScreen.tsx` — hero `rounded-card` gradasi teal→surface: avatar 64/80 px, eyebrow “Ruang belajar”, “Halo, {nama}”, paragraf, ilustrasi di sisi kanan (max 320 px di md+). Ilustrasi memilih cover matematika kelas 3, fallback cover pertama.
- `src/screens/SettingsScreen.tsx` — setiap baris profil memakai `ProfileAvatar`; profil aktif punya “Pilih/Ganti foto…” (dialog native `open()` filter png/jpg/jpeg/webp), “Hapus foto”, petunjuk “PNG/JPEG/WebP, maks 1,5 MB”; backup & privasi menyebut foto profil.
- `scripts/e2e/scenarios/home-catalog.mjs` — menyetel avatar lewat `profile_avatar_set` (aset cover Flow kelas 3 yang sudah ada), memuat ulang, menunggu avatar + ilustrasi termuat, screenshot `hero-beranda.png`; skenario kini **14 pemeriksaan**.

**Verifikasi aktual:** `cargo test` **67/67** · `npm test` PASS (fixture 4/4, catalog 320/320) · `npm run build` PASS · `npm run a11y` **17 PASS** (0 error, 7 warning) · E2E home-catalog **14/14** · mode-switch 6/6 · profile-lifecycle 7/7 · smoke 8/8. Screenshot `hero-beranda.png` memperlihatkan avatar bulat, eyebrow, sapaan, dan ilustrasi matematika berbingkai.

**Catatan:** avatar disimpan sebagai BLOB di SQLite sehingga ikut dalam backup DB; tidak ada aset gambar baru yang dihasilkan (memakai cover Flow yang sudah ada, sesuai aturan Flow-only). Dialog pemilih berkas tidak diotomasi E2E (native); jalur set/clear diuji lewat perintah Rust + invoke.

**Sisa:** foto profil belum dipotong persegi secara eksplisit (hanya `object-cover` pada lingkaran); belum ada validasi dimensi minimum; ilustrasi Beranda statis (bukan rotasi).

### Handoff Cover Mapel Beranda + Editor Potong/Kompres Foto (2026-10-27, T-080)

**Status:** selesai dan terverifikasi. Permintaan PO: kartu mata pelajaran di Beranda diberi cover/thumbnail; karena batas ukuran foto profil, sediakan alat potong + kompres foto.

**Perubahan kode:**
- `src/screens/HomeScreen.tsx` — kartu “Materi tersedia” memakai `LessonThumbnail` 96×64 px (h-16 w-24) per mata pelajaran; cover diambil dari entri pertama yang punya `coverAsset` untuk subjek itu, fallback entri pertama → selalu ada gambar karena katalog `coverAsset` 320/320.
- `src/components/profile/avatarCrop.ts` (baru) — helper murni: `coverScale`, `clampOffset`, `centeredOffset`, `cropDrawRect`; konstanta viewport 288 px, output 512 px, target 1 MB.
- `src/components/profile/avatarCrop.test.ts` (baru) — 5 test (skala cover lanskap/portret/kosong, clamp, center, pemetaan crop→output).
- `src/components/profile/AvatarEditor.tsx` (baru) — modal `role="dialog"` + `aria-modal`, pratinjau bulat `touch-none`; geser (pointer capture) untuk pan, slider zoom 1–4× yang recenter ke tengah gambar, pratinjau kanvas 512 px yang di-debounce 150 ms; encoder mencoba WebP 0,9→0,5 lalu JPEG 0,85/0,7 dan memilih hasil pertama ≤1 MB; perkiraan ukuran diumumkan lewat `aria-live`; Esc → Batal, fokus awal ke judul; viewport menyesuaikan lebar jendela (min 160 px).
- `src-tauri/src/profile.rs` — `MAX_AVATAR_SOURCE_BYTES = 20 MB`; `profile_avatar_preview` membaca berkas → data URL (cek metadata, is_file, magic bytes); `profile_avatar_set_data` + `decode_avatar_data_url` (header wajib `data:image/*;base64`, decode base64 → `set_profile_avatar` yang tetap memvalidasi ulang magic bytes + 1,5 MB); perintah path-based `profile_avatar_set` **dihapus** (dead code).
- `src-tauri/src/error.rs` — `PROFILE_AVATAR_SOURCE_TOO_LARGE` (“Foto sumber maksimal 20 MB sebelum dipotong.”).
- `src/data/profileRepository.ts` — `readAvatarSource(sourcePath)` → `profile_avatar_preview`; `saveProfileAvatar(profileId, dataUrl)` → `profile_avatar_set_data` (invalidasi cache avatar); `setProfileAvatar` dihapus.
- `src/screens/SettingsScreen.tsx` — “Pilih/Ganti foto…” membuka dialog native lalu editor; simpan → reload daftar profil + pesan `Foto profil "{nama}" diperbarui.`; petunjuk baris menjadi “PNG/JPEG/WebP · dipotong persegi & dikompres otomatis”.
- `scripts/e2e/scenarios/home-catalog.mjs` — avatar demo via `profile_avatar_preview` → `profile_avatar_set_data`; tunggu kartu subjek (≥5, setiap `img[data-lesson-thumb]` termuat); jeda 500 ms sebelum `hero-beranda.png` agar compositor selesai melukis.

**Verifikasi aktual:** `cargo test` **69/69** (2 test baru: data URL round-trip + penolakan, pratinjau sumber) · `npm test` **98/98** (12 berkas; `avatarCrop` 5 test) + fixture 4/4 + catalog 320/320 · `npm run build` PASS · `npm run a11y` 17 pemeriksaan PASS (0 error, 7 warning) · E2E **home-catalog 16/16** (pratinjau+simpan avatar, cover 7 mapel, screenshot lengkap) · mode-switch 6/6 · profile-lifecycle 7/7 · smoke 8/8. Screenshot `hero-beranda.png` (`17-53-29`) menampilkan ketujuh cover mapel, avatar, dan ilustrasi.

**Catatan:** `cargo fmt` sempat mereformat 13 berkas Rust lain; churn format itu dibatalkan sebelum commit (working tree hanya berisi berkas fase ini). Editor tidak diotomasi E2E karena dialog pemilih berkas native; matematika crop diuji unit dan penyimpanan data URL diuji Rust + invoke.

**Sisa:** editor belum punya kontrol rotasi/mirror; tidak ada validasi dimensi minimum sumber; kompresi berhenti di target 1 MB (bukan kualitas tetap).
