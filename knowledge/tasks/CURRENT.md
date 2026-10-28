# CURRENT — Task Aktif

**Sesi:** SESSION-2026-10-24-1
**Autonomy:** L1 (BALANCED)
**Status:** WIP — OD-1 disetujui PO + Curriculum Lead (via sesi); kedalaman, duplikasi, dan `curriculumRefs` 320/320 selesai; pra-review agent R1–R6/R8–R9/R12 selesai (bukan approval); P0 UX 5/6 selesai (metadata internal tertahan D-UX-4); UX-03 (fokus kartu hasil) selesai; mode belajar/admin selesai (T-077); sakelar ikon, thumbnail materi, pemilih kelas collapsible (T-078); **foto profil lokal + ilustrasi Beranda (T-079)**; **16 paket IPAS kelas 1–2 dengan cover unik per topik (T-089/T-090)**; **temuan deterministik R5 dibereskan (T-091)**; **volume latihan kelas 1–6 dinaikkan ke 5–10 item per aktivitas dinilai (T-092: +695 soal kuis, +361 pasangan)**; **Player dipadatkan + mode layar penuh (T-093)**; **setiap paket kini punya kuis (T-094/OD-9: +499 soal pada 88 paket)**; **21 item pada 17 paket bermateri tipis dibetulkan (T-095)**; **10 paket prioritas ditinjau agent — 141 item, 4 cacat terverifikasi (T-096)**; **F-01…F-04 diterapkan (T-097 F-03/F-04, T-098 F-01/F-02)**; **putusan review kini terikat ke sidik jari isi + sampling audit (T-104)**; **tombol aktivitas eksplorasi ditata ulang: satu aksi primer per langkah, dukungan & navigasi terpisah (T-105)**; **sematan materi per profil dengan tiga tab Beranda — default Materi disematkan, jatuh ke Materi tersedia bila kosong (T-106/T-107)**; **Lanjutkan belajar, Ringkasan belajar, dan Aktivitas terbaru kini tiga kolom sejajar tepat di bawah sapaan (T-108), dipadatkan ke ±112 px atau ~1/3 tinggi sebelumnya (T-109)**; **kuis & latihan kini berurutan — satu soal per halaman dengan `Lanjut`/`Lihat hasil` lalu kartu hasil (T-110)**; **tab Beranda terakhir & posisi soal kuis kini diingat per profil di SQLite (T-111)**; **tombol Sematkan/Disematkan kini ada di header Player, jadi materi bisa disematkan langsung dari layar belajar (T-112) dan balapan "sesi belum siap" saat kuis selesai cepat ikut diperbaiki**; **desain materi daring HTML5 ditulis sebagai ADR-0035 (Proposed) + kontrak bundel v1 (DRAF) — belum ada kode, menunggu persetujuan PO atas OD-10…OD-14**; a11y 18/18 PASS, E2E smoke/activities/journey/mode-switch/player-fullscreen/quiz-coverage PASS; sisa prasyarat: review manusia

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
| IPAS Kelas 1–2 (T-089) | **DONE (draft) — DI LUAR MATRIKS FASE A** | 16 paket (8 kelas 1 + 8 kelas 2), VALID; `curriculumRefs` fase-a provisional; IPAS tidak ada di daftar mapel Fase A OD-1 sehingga perlu keputusan Curriculum Lead |
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

**Berikutnya:** empat temuan review 10 paket sudah diterapkan (T-097: F-03/F-04; T-098: F-01/F-02) dan utang kosmetik F-05 sudah dibereskan (T-099: 39 pasangan di 27 paket). Sisa pekerjaan konten: **tanda tangan guru manusia** atas daftar di BACKLOG — termasuk memastikan daftar varian jawaban teks (F-02) memadai dan menyetujui pilihan "teks menyesuaikan gambar" untuk IPAS kelas 4 (F-01); **F-06** diputuskan 2026-10-28 (T-100) sebagai utang desain — aturan authoring untuk batch berikutnya sudah ditetapkan dan guru memilih pasangan yang perlu ditulis ulang dari daftar 309 pasangan / 160 paket, tanpa penulisan ulang massal. Lalu review manusia R1–R6/R8–R9/R12 untuk 320 paket (bahan pra-review agent tersedia di [PEDAGOGICAL_PREREVIEW_2026-10-26.md](../content/PEDAGOGICAL_PREREVIEW_2026-10-26.md)) + verifikasi CP/ATP per bab; lalu opsi D3 (Bahasa Inggris), D5 (mulok), Koding & KA. Sinyal R5 mekanis sudah dibersihkan 2026-10-27 (T-091) dan volume latihan kelas 1–6 sudah 5–10 item per aktivitas dinilai (T-092) — laporan pra-review 2026-10-26 tetap sebagai bukti historis, angka terbaru ada di handoff T-091/T-092/T-096/T-097/T-098/T-099. Blocker rilis: [RELEASE_BLOCKERS_2026-10-24.md](../api/RELEASE_BLOCKERS_2026-10-24.md) — 8 item, belum ada yang selesai. Register gap: [TEST_GAPS.md](../testing/TEST_GAPS.md).
## Verifikasi sesi ini

| Check | Hasil |
|---|---|
| Review 10 paket prioritas (T-096) | **SELESAI (agent, bukan guru)** — 141 item dibaca penuh: 58 soal kuis, 58 pasangan, 25 langkah urutan. Putusan: 1 **perlu perbaikan**, 1 perlu perbaikan kecil, 7 layak dengan catatan, 1 layak. 0 jawaban salah / 0 salah hitung. Laporan: [REVIEW_REPORT_2026-10-27_GURU_PRIORITAS_10.md](../content/REVIEW_REPORT_2026-10-27_GURU_PRIORITAS_10.md) |
| Jawaban singkat (T-096) | **CACAT TERVERIFIKASI** — `src/content/quiz.ts:33` membandingkan satu string persis (tanpa sinonim/varian angka-kata); 4 paket / 24 soal; 4 prompt terbuka ("Sebutkan satu ...") hanya menerima satu kata kunci, jawaban benar lain dihukum |
| Ilustrasi vs materi (T-096) | **CACAT TERVERIFIKASI** — `kelas4-ipas-b01-makhluk-hidup`: ilustrasi tidak memuat katak/capung, tetapi eksplorasi, `altText`, 2 pasangan, dan 1 soal menyebut keduanya |
| Kunci opsi terpanjang (T-096) | **0 paket** dengan kunci selalu terpanjang-**unik**; 6 paket hanya seri panjang (matematika, opsi angka/urutan) → utang BACKLOG ditutup sebagai positif palsu |
| Pasangan menyalin eksplorasi (T-096) | **TERUKUR** — 311/1.963 pasangan (15,8%) di 159 paket: sisi kanan identik `reveal` + sisi kiri ≥70% kata prompt eksplorasi; 28/58 pada 10 paket prioritas |
| Validator konten (T-096) | **PASS** — 336/336 VALID, 0 issue, 336 warning (draft) — konten tidak diubah oleh review |
| Perbaikan F-03 (T-097) | **DITERAPKAN** — `kelas4-ipas-b01-makhluk-hidup` soal-3 prompt → "Benda tak hidup yang ada di tepi kolam pada gambar adalah ..."; kunci tetap `batu`; jumlah soal/opsi tidak berubah |
| Perbaikan F-04 (T-097) | **DITERAPKAN** — `kelas6-pjok-b03-atletik` item ke-5 `langkah-rapi`/"Merapikan posisi" → `langkah-keluar-bak`/"Keluar dari bak lompat"; `correctOrder`, reveal eksplorasi langkah 2, dan `pasangan-2` diselaraskan; 5 item / 6 pasangan tetap |
| Validator konten (T-097) | **PASS** — 336/336 VALID, 0 issue, 336 warning (draft) setelah perbaikan |
| Volume aktivitas (T-097) | **PASS** — "Semua aktivitas dinilai berada dalam rentang target" |
| Unit test + fixture + katalog (T-097) | **PASS** — `Tests 105 passed (105)`, `4/4 fixture cocok dengan expected`, `catalog-index OK: 336 entri, 336 paket` |
| Perbaikan F-01 (T-098) | **DITERAPKAN** — `kelas4-ipas-b01-makhluk-hidup`: langkah 1 → "Ikan, siput, kupu-kupu, dan tumbuhan air"; altText 4 berkas → "Dua siswa mengamati kolam dengan ikan, siput di atas batu, kupu-kupu, dan teratai"; pasangan Katak/Capung → Siput/Kupu-kupu; soal "Capung bernapas" → "Kupu-kupu bernapas" (kunci `trakea` tetap); 0 sisa kata katak/capung |
| Perbaikan F-02 (T-098) | **DITERAPKAN** — `src/content/quiz.ts`: soal teks menerima daftar `correctResponse` + normalisasi NFKC/huruf/tanda baca/spasi; 14 soal di 4 paket mendapat alternatif; 5 unit test baru |
| Unit test pasca-F-01/F-02 (T-098) | **PASS** — `Tests 110 passed (110)` (15 berkas), `4/4 fixture cocok dengan expected`, `catalog-index OK: 336 entri, 336 paket` |
| Build (T-098) | **PASS** — `npm run build` (`tsc --noEmit` + vite) |
| E2E activities (T-098) | **PASS** — 14 pemeriksaan; termasuk "Aktivitas jawaban singkat dinilai 100 (normalisasi huruf) dan tersimpan", layout dua kolom, cover header blob, kartu kemajuan 1/5, ringkasan sesi, tombol Hasil Belajar |
| Pasangan berelipsis (F-05, T-099) | **DITERAPKAN** — 37 pasangan di 27 paket: `left` berelipsis → frasa petunjuk; 2 pasangan duplikat jawaban dibetulkan (`kelas1-seni-rupa-b05`: "Merah, kuning, dan biru" ×2; `kelas6-matematika-b03`: "4 : 3" ×2). Total **39 pasangan**; jumlah pasangan tetap **1.963**; tidak ada `pairId` ditambah/dihapus |
| Verifikasi F-05 (T-099) | **PASS** — detektor elipsis ulang **0/1.963**; duplikat kiri/kanan **0** pada 27 paket terdampak; validator **336/336 VALID** (0 issue, 336 warning draft); volume gate "Semua aktivitas dinilai berada dalam rentang target"; `npm test` **110/110** (15 berkas) + fixture 4/4 + katalog 336/336; `npm run build` **PASS** |
| E2E setelah F-05 (T-099) | **NOT RUN** — perubahan hanya teks `left`/`right` pada aktivitas matching; tidak ada perubahan kode/UI. Skenario `activities` memakai paket fixture sendiri, jadi tidak merender paket yang disunting |
| Keputusan F-06 (T-100) | **DIPUTUSKAN — utang desain, tanpa penulisan ulang massal** — diukur ulang: **309 pasangan / 160 paket** dari 1.963 (84 pasangan tumpang tindih 100% kata prompt, 40 paket memuat ≥3 pasangan; angka historis 311/159). Aturan authoring batch berikutnya: sisi kiri **<70%** kata prompt eksplorasi dan tanpa kata kunci jawaban. Daftar seleksi guru: [F06_MIRROR_PAIRS_2026-10-28.csv](../content/F06_MIRROR_PAIRS_2026-10-28.csv) (309 baris, 7 kolom) |
| Verifikasi F-06 (T-100) | **PASS (lingkup dokumen)** — CSV dihitung dari `.tmp-assets/r5-focused.json`: 309 baris data + header, 160 `packageId` unik; tidak ada berkas konten/kode yang diubah, jadi validator/`npm test`/build **tidak dijalankan ulang** (angka terakhir tetap 336/336 VALID, 110/110, PASS pada T-099) |
| Parameterisasi tanggal & penjaga bukti (T-101) | **PASS** — `scripts/lib/reviewOutput.mjs`: `--date YYYY-MM-DD` (default hari ini), `--out-dir`, `--force`; tanpa `--force` skrip menolak menimpa berkas bertanggal yang sudah ada (diuji: exit 1 + daftar berkas; `--force` exit 0) |
| Detektor longgar F-06 di skrip baku (T-101) | **PASS** — `scripts/lib/mirrorPairs.mjs` menghasilkan **309 pasangan/160 paket** yang identik dengan CSV F-06 (kunci `packageId + aktivitas + pairId + wordOverlap`, 0 selisih); laporan pratayang menampilkan metrik informasi R5 (**bukan** flag); CSV menambah kolom `explorationCopies` + `explorationCopyShare` |
| Verifikasi alat T-101 | **PASS** — pratinjau ditulis ke `.tmp-assets/` tanpa menyentuh bukti `2026-10-26`: pratayang pedagogis 336 paket, laporan teknis 336 paket; `npm test` 110/110 + fixture 4/4 + katalog 336/336; `npm run build` PASS; `npx tsc --noEmit` exit 0 |
| `analyze-content-quality` bertanggal (T-102) | **PASS** — skrip memakai `parseReviewArgs`/`ensureWritable` yang sama: `--date`/`--out-dir`/`--force`, keluaran `QUALITY_GAP_<tanggal>.md` + `quality-gap-<tanggal>.json`; tanpa `--force` exit 1 dengan daftar berkas, `--force` exit 0 |
| Angka analisis gap hari ini (T-102) | **PASS (informasi, bukan approval)** — dijalankan pada 336 paket: G1/G2/G3/G5/G6/G7/G8/G9/G11/G12 semuanya 336/336, G4 (tujuan tercakup penuh) 295/336, G10 (sudah direview manusia) 0/336, duplikasi persis 0 grup, aktivitas identik 0 grup, 336 hash aset unik. Satu paket menampilkan opsi berbeda **hanya kapitalisasi** (`kelas1-bahasa-indonesia-b05-membaca-kalimat`, soal "Kalimat yang benar") — dicatat sebagai catatan, bukan duplikat |
| Koreksi detektor G11 (T-102) | **PASS** — detektor lama membandingkan opsi tanpa membedakan kapitalisasi sehingga menandai paket yang justru menguji kapitalisasi; laporan 2026-10-25 mencatat 319/320, seharusnya 320/320. Kini duplikat = teks **persis** per soal, kapitalisasi-saja dilaporkan terpisah; hasil 336/336 (0 duplikat) |
| Deep link Player (T-103) | **DITERAPKAN** — `#player/<packageId>[/<lessonId>]`: `buildPlayerHash`/`parsePlayerHash` di [playbackSelection.ts](../../src/state/playbackSelection.ts) menolak layar lain, segmen ekstra, id kosong, dan escape rusak; `initialScreen()` memulihkan seleksi dari hash saat boot; `navigate()` menulis deep link untuk layar Player; Player menyelaraskan hash dengan materi yang benar-benar tampil (tanpa lesson → lesson pertama, paket tak dikenal → paket pertama, tidak ada id palsu tertinggal). 4 unit test baru |
| Unit/build T-103 | **PASS** — `npm test` **114/114** (15 berkas) + fixture 4/4 + katalog 336/336; `npm run build` exit 0 |
| E2E player-deeplink (T-103) | **PASS 7/7** — muat ulang di `#player/kelas6-pai-b06-zakat/zakat` membuka "Zakat dan Infak"; `#player/kelas1-ipas-b01-tubuh-dan-indera` → lesson pertama dan hash dilengkapi (`…/tubuh-dan-indera`); paket tak dikenal → "Mengenal Huruf dan Suku Kata" + hash diperbaiki dan stabil setelah muat ulang; buka materi dari katalog menulis `#player/kelas3-matematika-b04-pecahan/pecahan-sederhana`; muat ulang tetap di materi yang sama |
| Regresi E2E pasca T-103 | **PASS** — `home-catalog` **28/28** dan `learning-journey` **11/11** (buka materi lintas paket, eksplorasi, kuis 100, simpan lokal) |
| `npm run a11y` (T-103) | **PASS 17/17** (0 error, 7 warning) pada **dua percobaan berturut-turut**, setelah 4 percobaan gagal sebelumnya: 3× timeout `Tersimpan lokal` dengan banner tetap "Penyimpanan lokal siap…" (skor 100 tampil, tidak ada exception, "Menyimpan hasil belajar" tidak pernah muncul) dan 1× halaman blank setelah Beranda→Jelajah (audit 0 elemen). **Akar masalah tidak ditemukan** — lihat utang teknis di BACKLOG. Harness kini merekam konsol halaman (`Runtime.consoleAPICalled`/`exceptionThrown`) dan riwayat teks banner saat timeout |
| Ikatan putusan review (T-104) | **DITERAPKAN** — migrasi `0007_content_review_binding` menambah `content_reviews.content_sha256` + `rubric_version`; baris lama **NULL** (dibuat sebelum ikatan ada, karena itu tidak sah untuk isi sekarang). `review_record` menolak digest yang bukan 64 heksadesimal, menormalkan ke huruf kecil, dan menyimpan `RUBRIC_VERSION = "1"`; ekspor CSV menambah kolom `content_sha256`,`rubric_version`. Sidik jari = SHA-256 JSON kanonik paket **setelah validasi** (kunci diurut, `reviewStatus`/`releaseState`/`signature` dibuang, lesson/aktivitas diurut per id) karena schema Zod menambah default sehingga objek tervalidasi ≠ JSON mentah |
| Alat verifikasi ikatan (T-104) | **PASS** — `npm run content:review-binding` memindai 336 paket + berkas attestation (`knowledge/content/review-attestations/`): menolak approved tanpa digest sah, paket tak dikenal, isi tak tervalidasi, digest tidak cocok, dan paket non-`draft` tanpa putusan terikat. Keadaan sekarang: 0 attestation → "tidak ada yang perlu diverifikasi" (exit 0); CSV sintetis 3 baris dengan 1 digest salah → exit 1 menyebut reviewer yang harus menilai ulang |
| Sampling audit review (T-104) | **PASS** — `npm run content:review-sample -- --n 5 --seed <nilai>` mengurutkan `sha256("<benih>|<packageId>@<version>")` lalu mengambil n teratas (deterministik: benih sama → sampel sama). Keluaran memuat reviewer/tanggal/catatan, status cocok sidik jari, berkas lesson/aktivitas, volume item, dan checklist R1–R12 untuk diisi manusia. Digest menyimpang → exit 1. Uji sintetis: benih `uji-2026-10-28` memilih 3/3 paket, 1 mismatch terdeteksi |
| Unit/Rust T-104 | **PASS** — `npm test` **120/120** (16 berkas; 6 test `packageDigest` baru) + fixture 4/4 + katalog 336/336 + binding PASS · `cargo test` **71/71** (8 test `review::`; 3 baru: bentuk digest, normalisasi huruf kecil, kolom CSV) · `npm run build` exit 0 |
| E2E content-review (T-104) | **PASS 9/9** — review guru mencatat digest 64-hex + `rubricVersion` `1`; ekspor CSV memuat header dan digest baru; siswa tetap ditolak `REVIEW_FORBIDDEN` (validasi digest ditempatkan **setelah** cek peran); screenshot diperiksa |
| Batas ikatan (T-104) | **BELUM TAMPER-PROOF** — digest dihitung klien (Rust tidak membaca isi paket bawaan), identitas reviewer = nama profil lokal yang diisi sendiri, dan attestation berupa CSV biasa di `knowledge/`. Tanda tangan Ed25519 atas putusan (L3) belum ada |
| Hierarki tombol eksplorasi (T-105) | **DITERAPKAN** — sebelumnya "Tampilkan penjelasan" bergaya primer (biru) berdampingan dengan "Lanjut" yang juga primer, sehingga dua aksi bersaing; kini petunjuk + penjelasan menjadi **satu baris tombol sekunder** dengan status tertekan (`border-primary/40 bg-primary/5`) dan `aria-controls` ke panelnya, sedangkan navigasi pindah ke **baris footer** bergaris atas: `Sebelumnya` sekunder (nonaktif di langkah 1) di kiri, satu tombol primer `Lanjut`/`Selesai` di kanan. Panel selesai ikut disamakan (`Ulangi eksplorasi` sekunder, `Lanjut berlatih` primer) |
| E2E learning-journey (T-105) | **PASS 14/14** (naik dari 11) — 9 asersi baru: tepat **1** tombol bergaya primer dalam lingkup eksplorasi, petunjuk & penjelasan satu induk, keduanya bukan primer, `Sebelumnya` bukan primer + nonaktif di langkah 1, footer navigasi dipisah `border-top` dan tidak memuat tombol dukungan, `aria-controls` petunjuk menunjuk panel yang benar-benar muncul saat `aria-expanded=true`, panel penjelasan muncul setelah tombolnya diklik |
| Artefak visual T-105 | **DIPERIKSA** — `.tmp-e2e/<run>/exploration-buttons.png` (digulir ke baris kontrol): prompt → dua tombol sekunder sebaris → panel petunjuk & penjelasan → garis pemisah → `Sebelumnya` nonaktif + `Lanjut` primer |
| Regresi E2E T-105 | **PASS** — `activities` **14/14** dan `player-deeplink` **7/7** (keduanya membuka Player dengan tombol eksplorasi) |
| Unit/build/a11y T-105 | **PASS** — `npm test` **120/120** (16 berkas) + fixture 4/4 + katalog 336/336 + binding PASS · `npm run build` exit 0 · `npm run a11y` **17/17** (0 error, 7 warning) pada percobaan pertama · `cargo test` tidak dijalankan (tanpa perubahan Rust) |
| Batas T-105 | **BELUM KOMPONEN BERSAMA** — gaya tombol masih kelas Tailwind inline per komponen (tidak ada `Button`), jadi hierarki ini belum dijamin konsisten di layar lain; belum ada uji visual 320 px khusus footer eksplorasi (reflow 640/320 hanya lulus tanpa error) |
| Sematan materi (T-106) | **DITERAPKAN** — migrasi `0008_pinned_lessons` (`profile_id, package_id, lesson_id, pinned_at`; PK gabungan; FK `profiles(id) ON DELETE CASCADE`; indeks `(profile_id, pinned_at DESC)`); [pins.rs](../../src-tauri/src/pins.rs) membatasi **24** sematan/profil (`VALIDATION_FAILED`), id 1–120 karakter, profil tak dikenal → `PROFILE_NOT_FOUND`, sematkan ulang saat penuh tetap boleh (idempoten), lepas sematan idempoten; perintah `pinned_list`/`pinned_set`. Tombol `Sematkan`/`Disematkan` (`aria-pressed`) ada di tiap kartu Jelajah Materi; Beranda membaca sematan per profil aktif |
| Beranda default T-106 | **DIGANTI T-107** — dulu tiga seksi bertumpuk dalam urutan Materi disematkan → Materi tersedia → Jelajahi materi; sejak T-107 ketiganya menjadi tab yang saling menggantikan. Sematan dimuat terpisah dari katalog agar kegagalan salah satu tidak mengosongkan panel lain; pratinjau browser menampilkan pesan “tidak menyimpan sematan” |
| E2E pinned-materials (T-106) | **PASS 8/8** (dua percobaan berturut-turut) — urutan seksi + tiga judul, empty state membuka katalog, tombol berubah `Disematkan` (`aria-pressed=true`), kartu muncul di Beranda dengan thumbnail + `Kelola sematan`, sematan bertahan setelah muat ulang dan terbaca `pinned_list` dari SQLite, status sematan terbaca ulang di katalog, `Lepas` mengembalikan empty state, dan `pinned_list` kosong setelah muat ulang |
| Unit/Rust/build/a11y T-106 | **PASS** — `npm test` **120/120** (16 berkas) + fixture 4/4 + katalog 336/336 + binding PASS · `cargo test` **77/77** (6 test `pins::` baru) · `npm run build` exit 0 · `npm run a11y` **17/17** (0 error, 7 warning) |
| Regresi E2E T-106 | **PASS** — `home-catalog` **28/28** dan `learning-journey` **14/14**; `activities` gagal sekali pada tunggu “simpan benar-salah” (banner tetap “Penyimpanan lokal siap”) lalu **14/14** pada eksekusi ulang — flake jalur simpan yang sudah tercatat di BACKLOG sejak T-103, bukan perubahan T-106 |
| Batas T-106 | **KATALOG–BERANDA SAJA** — sematan tidak tampil di layar lain, tidak ada penataan urutan manual (urut `pinned_at DESC`), batas 24 belum bisa diubah pengguna, dan sematan per profil tidak disinkronkan ke server (outbox hanya event belajar) |
| Tab Beranda (T-107) | **DITERAPKAN** — tiga seksi Beranda digabung menjadi satu kontrol `role="tablist"` berlabel "Bagian Beranda" dengan tiga `role="tab"` (`Materi disematkan`, `Materi tersedia`, `Jelajahi materi`), masing-masing `aria-controls` ke `role="tabpanel"` (`home-panel-<id>`) yang selalu ada di DOM dan disembunyikan lewat atribut `hidden`; roving `tabIndex`, panah kiri/kanan + Home/End memindahkan tab sekaligus fokus. Tab sematan menampilkan jumlah sematan sebagai lencana `aria-hidden`. Petunjuk tab sematan diperbarui menjadi "tersimpan per profil dan selalu tampil lebih dulu" |
| Default tab T-107 | **DITERAPKAN** — Beranda terbuka di **Materi disematkan** bila profil punya sematan; bila sematan kosong (atau gagal dimuat tanpa sematan), Beranda terbuka di **Materi tersedia** sesuai permintaan PO. Pilihan manual pengguna tidak ditimpa oleh efek default; melepas sematan terakhir langsung memindahkan tampilan ke **Materi tersedia**. Pilihan tab belum diingat antar kunjungan (selalu kembali ke aturan default) |
| Empty state sematan (T-107) | **DIPERTAHANKAN** — tab sematan tetap punya empty state "Belum ada materi yang disematkan" dengan tombol `Buka Jelajah Materi`; judul kartu sematan diubah dari `h3` menjadi paragraf (`data-pinned-title`) agar hierarki heading tidak melompat (h1 → h3) ketika seksi tidak lagi punya `h2` sendiri |
| E2E pinned-materials (T-107) | **PASS 11/11** — tiga tab berlabel benar + `aria-controls` menunjuk panel `tabpanel` valid, tanpa sematan tab aktif `Materi tersedia` dan hanya panel itu yang tampil, hanya tab aktif di urutan Tab, panah kanan/End/Home memindahkan tab & fokus, tab sematan menampilkan empty state lalu membuka katalog, sematan membuat tab sematan jadi default, sematan bertahan setelah muat ulang, `Lepas` memindahkan tampilan ke `Materi tersedia`, dan `pinned_list` kosong setelah muat ulang |
| Regresi E2E T-107 | **PASS** — `home-catalog` **28/28**, `learning-journey` **14/14**, `activities` **14/14** |
| Unit/build/a11y T-107 | **PASS** — `npm test` **120/120** (16 berkas) + fixture 4/4 + katalog 336/336 + binding PASS · `npm run build` exit 0 · `npm run a11y` **17/17** (0 error, 7 warning) · `cargo test` tidak dijalankan (tanpa perubahan Rust) |
| Batas T-107 | **BELUM DIINGAT** — pilihan tab tidak disimpan; panel Beranda hanya memuat satu tab sekaligus (sejak T-108 seksi Lanjutkan belajar/Ringkasan/Aktivitas terbaru dipindah ke atas tab sebagai tiga kolom tetap); kontras tab aktif diuji a11y tetapi mode gelap belum ada |
| Ringkasan tiga kolom (T-108) | **DITERAPKAN** — [HomeScreen.tsx](../../src/screens/HomeScreen.tsx) menaruh `<section data-home-overview>` tepat setelah banner galat dan sebelum tablist: grid `lg:grid-cols-3` berisi `data-resume-column` (Lanjutkan belajar: thumbnail 16:9, judul, paket · kelas, tombol `Lanjutkan`), `data-summary-column` (tiga kartu angka Sesi/Percobaan/Rata-rata, `content-start` agar tidak melar setinggi kolom), dan `data-recent-column` (maks 3 aktivitas + `Lihat semua hasil` di dasar kolom). Ketiga kolom selalu dirender agar grid tidak bergeser; keadaan kosong berupa `data-resume-empty` ("Belum ada materi yang sedang dipelajari…"), pesan pratinjau browser, dan "Belum ada aktivitas yang dinilai." Blok lama yang bertumpuk di bawah tab (kartu lanjutkan, Ringkasan `sm:grid-cols-3`, Aktivitas terbaru) dihapus agar tidak ada judul ganda |
| E2E home-catalog (T-108) | **PASS 28/28** — asersi baru: tiga kolom sejajar di baris yang sama (`Math.abs(top − section.top) < 2`), label berurutan `Lanjutkan belajar → Ringkasan belajar → Aktivitas terbaru`, blok berada **di bawah** hero dan **di atas** tablist, keadaan kosong tanpa `[data-resume-entry]`, tiga angka ringkasan tampil, kolom aktivitas kosong; setelah kuis, `[data-resume-entry]` memuat "Mengenal Pecahan 1/2, 1/3, dan 1/4" dan kolom aktivitas terisi, lalu `Lanjutkan` membuka Player. Artefak `beranda-tiga-kolom.png` diperiksa mata |
| Regresi E2E T-108 | **PASS** — `pinned-materials` **11/11** (dua eksekusi), `learning-journey` **14/14**, `activities` **14/14** |
| Unit/build/a11y T-108 | **PASS** — `npm test` **120/120** (16 berkas) + fixture 4/4 + katalog 336/336 + binding PASS · `npm run build` exit 0 · `npm run a11y` **17/17** (0 error, 7 warning; Beranda 20 interaktif / 4 heading / 69 kontras) · `cargo test` tidak dijalankan (tanpa perubahan Rust) |
| Batas T-108 | **DIGANTI T-109** — tinggi tiga kolom semula ±375 px (thumbnail 16:9 + kartu angka bertumpuk label). Sejak T-109 kolom dipadatkan menjadi ±112 px (~1/3) sehingga kartu mapel kembali terlihat tanpa menggulir pada 1600×900. Tetap berlaku: susunan baru hanya diuji `lg` (≥1024 px) dan menumpuk vertikal di bawahnya |
| Tinggi tiga kolom (T-109) | **DITERAPKAN** — permintaan PO "tingginya 1/3 dari tinggi sekarang". [HomeScreen.tsx](../../src/screens/HomeScreen.tsx): semua kartu `p-4`, judul kolom `text-xs`; kolom Lanjutkan memakai thumbnail persegi `h-14 w-14` + judul/meta satu baris (`truncate`) + tombol `Lanjutkan` sebaris (tetap `min-h-11` agar target sentuh 44 px); kolom Ringkasan memakai `<dl className="flex items-end gap-6">` (label di atas, angka `text-2xl leading-none` sebaris) alih-alih tiga kartu bertumpuk; kolom Aktivitas menaruh `Lihat semua hasil` di baris judul dan tiga baris aktivitas `text-xs leading-4` tanpa kartu. Hasil ukur E2E: **102 px** saat kosong, **114 px** saat terisi (sebelumnya ±375 px) |
| E2E home-catalog (T-109) | **PASS 29/29** — ditambah dua asersi tinggi: `[data-home-overview]` ≤150 px saat kosong (102 px) dan ≤150 px saat terisi (114 px); seluruh asersi T-108 (3 kolom sejajar, urutan label, posisi di bawah hero & di atas tablist, keadaan kosong/terisi) tetap lolos. Artefak `beranda-tiga-kolom.png` diperiksa: tiga kartu tipis sejajar, thumbnail persegi kecil, angka 2 / 1 / 100 sebaris, satu baris aktivitas + `Lihat semua hasil` di kanan atas kartu, dan tab materi kembali tampak pada 1600×900 |
| Regresi & gate T-109 | **PASS** — `pinned-materials` 11/11 · `learning-journey` 14/14 · `activities` 14/14 · `npm run a11y` 17/17 (0 error, 7 warning; Beranda 20 interaktif / 4 heading / 69 kontras) · `npm test` 120/120 (16 berkas) + fixture 4/4 + katalog 336/336 + binding PASS · `npm run build` exit 0 · `cargo test` tidak dijalankan (tanpa perubahan Rust) |
| Batas T-109 | **TERPOTONG** — judul materi dan baris meta di kolom Lanjutkan terpotong elipsis pada lebar kartu ±405 px (mis. "Mengenal Pecahan 1/2, 1/3, d…"); thumbnail 16:9 diganti persegi 56 px sehingga ilustrasi hanya tampak sebagian; aktivitas terbaru tetap maks 3 baris dengan teks 12 px; hanya diuji `lg` (≥1024 px) |
| Kuis berurutan (T-110) | **DITERAPKAN** — [QuizActivity.tsx](../../src/components/content/QuizActivity.tsx) menampilkan **satu soal per halaman**: `questionIndex` + `answers` akumulatif, kepala soal `[data-quiz-progress]` "Soal N dari M" + `role="progressbar"` "Kemajuan kuis", kartu soal `tabIndex={-1}` + `legend` `sr-only`, navigasi `Sebelumnya` (nonaktif di soal 1) dan `Lanjut`/`Lihat hasil` (nonaktif sampai soal terjawab, dengan hint "Pilih atau tulis jawaban untuk melanjutkan."). Penilaian tetap `scoreQuiz` saat tombol terakhir ditekan, jadi `attempt`/`outbox`/`onGraded` tidak berubah. Kartu hasil kini menampilkan "Skor N dari 100 — Lulus/Belum lulus", "Benar X dari M soal", skor minimal lulus, apresiasi, dan `Ulangi kuis` (mengosongkan jawaban + kembali ke soal 1). Fokus dipindah ke kartu soal saat berpindah dan ke kartu hasil saat selesai (`questionRef`/`resultRef` + `scrollIntoView`) |
| E2E urutan kuis (T-110) | **PASS** — `activities` **16/16** (benar-salah 2 soal: `fieldsets` 1, progres "Soal 1 dari 2", `Lanjut` nonaktif sebelum dijawab; jawaban singkat 2 soal + `Ulangi kuis` mereset ke soal 1 tanpa pilihan tercentang; pilihan ganda multi-jawaban 2 soal) · `learning-journey` **14/14** (4 soal dijawab satu per satu, satu `fieldset` per halaman) · `home-catalog` **29/29** · `quiz-coverage` **5/5** (jumlah soal diparse dari `[data-quiz-progress]`, artefak `quiz-baru-soal-1.png` + `quiz-baru-soal-terakhir.png`) · `a11y` **18/18** (satu state audit baru "Player (soal kuis)") |
| Regresi & gate T-110 | **PASS** — `player-fullscreen` 6/6 · `smoke` 8/8 · `npx tsc --noEmit` bersih · `npm run build` exit 0 (8,59 dtk) · `npm test` **120/120** (16 berkas) + fixture 4/4 + katalog 336/336 + binding PASS · `npm run a11y` **18/18** (0 error, 7 warning) · `cargo test` tidak dijalankan (tanpa perubahan Rust) |
| Batas T-110 | **SEBAGIAN** — hanya `multiple-choice`/`true-false`/`short-answer` yang berurutan; `MatchingActivity` dan `OrderingActivity` sengaja tetap satu halaman karena seluruh pasangan/urutan harus terlihat bersamaan (bukan kumpulan soal lepas). Penyimpanan "soal terakhir" belum ada di T-110 — **DIGANTI T-111** (posisi soal + jawaban kini diingat per profil). Uji menempel kolom samping kini dilaporkan **tidak diuji** karena halaman satu soal lebih pendek dari kartu samping sehingga tidak ada ruang gulir |
| Ingat tab & posisi soal (T-111) | **DITERAPKAN** — keadaan antarmuka ringan per profil di SQLite: migrasi [0009_profile_ui_state.sql](../../src-tauri/src/migrations/0009_profile_ui_state.sql) (`profile_ui_state(profile_id, state_key, value, updated_at)`, PK gabungan, FK `ON DELETE CASCADE`), [ui_state.rs](../../src-tauri/src/ui_state.rs) (`MAX_KEY_CHARS = 64`, `MAX_VALUE_BYTES = 8 KiB`, kunci `[A-Za-z0-9_-]`, profil tak dikenal → `PROFILE_NOT_FOUND`, `set` idempoten lewat `ON CONFLICT … DO UPDATE`, `clear` idempoten) dengan perintah `ui_state_get`/`ui_state_set`/`ui_state_clear`. Webview: [uiStateRepository.ts](../../src/data/uiStateRepository.ts) (kunci `home-tab` dan `quiz-resume`), [quizResume.ts](../../src/content/quizResume.ts) (serialisasi + validasi: identitas paket/lesson/aktivitas, indeks bulat ≥0 di-clamp ke jumlah soal, jawaban hanya untuk id soal yang dikenal). [HomeScreen.tsx](../../src/screens/HomeScreen.tsx) membaca `home-tab` sekali saat profil termuat, memakai tab tersimpan bila masih sah (tab `pinned` hanya bila sematan >0), menyimpan saat tab dipilih dan saat sematan terakhir dilepas; [QuizActivity.tsx](../../src/components/content/QuizActivity.tsx) menerima `resumeTarget` dari [LessonPlayer.tsx](../../src/screens/LessonPlayer.tsx) (`profileId` + identitas kuis), memulihkan indeks & jawaban hanya bila identitas cocok dan pengguna belum menyentuh kuis, menyimpan dengan jeda 300 ms + flush langsung saat `Lanjut`/`Sebelumnya`, dan menghapus simpanan saat submit atau `Ulangi kuis`. Guest browser (tanpa Tauri) tetap tanpa persistensi |
| E2E ingat keadaan (T-111) | **PASS** — `pinned-materials` **13/13**: pilih tab `Jelajahi materi` → `ui_state_get(profile, "home-tab")` = `"explore"` → muat ulang → tab `explore` `aria-selected` + panel tampil. `activities` **17/17**: isi soal 1 "Setengah" → `Lanjut` → muat ulang aplikasi → buka ulang Player + aktivitas → "Soal 2 dari 2" dipulihkan → `Sebelumnya` → input soal 1 bernilai "Setengah" |
| Regresi & gate T-111 | **PASS** — `npx tsc --noEmit` bersih · `npm run build` exit 0 · `npm test` **124/124** (17 berkas; 4 test `quizResume`) + fixture 4/4 + katalog 336/336 + binding PASS · `cargo test` **83/83** (6 test `ui_state::`) · `npm run a11y` **18/18** (0 error, 7 warning) · E2E `pinned-materials` 13/13, `activities` 17/17, `learning-journey` 14/14, `home-catalog` 29/29, `quiz-coverage` 5/5, `smoke` 8/8, `player-fullscreen` 6/6, `profile-lifecycle` 7/7, `backup-restore` 9/9, `player-deeplink` 7/7, `mode-switch` 6/6, `content-rollback` 9/9 |
| Batas T-111 | **SEBAGIAN** — hanya satu tab Beranda dan satu posisi kuis per profil (baru membuka kuis lain menimpa simpanan kuis sebelumnya); jawaban disimpan dengan jeda 300 ms sehingga ketukan terakhir dalam <300 ms sebelum aplikasi ditutup hilang; `MatchingActivity`/`OrderingActivity` tidak memakai posisi soal; keadaan antarmuka tidak disinkronkan ke server; `ui_state_clear` selalu menghapus kunci `quiz-resume`, bukan per kuis |
| Semat dari Player (T-112) | **DITERAPKAN** — [LessonPlayer.tsx](../../src/screens/LessonPlayer.tsx) menampilkan tombol `data-pin-toggle` "Sematkan"/"Disematkan" di header materi (gaya sama dengan katalog: `aria-pressed`, `aria-label` menyebut judul, ikon pembatas buku terisi saat aktif), memakai `pinned_list`/`pinned_set` yang sudah ada sehingga tanpa perubahan Rust/migrasi; status samping `[data-player-pin-status]` `aria-live="polite"` mengumumkan "… disematkan ke Beranda." / "… dilepas dari Beranda." dan galat batas 24 tampil di tempat yang sama. Tombol hanya dirender bila persistensi lokal tersedia (pratinjau browser tetap tanpa tombol) dan nonaktif sampai profil aktif termuat |
| Perbaikan balapan sesi (T-112) | **DIPERBAIKI** — `handleGraded` dulu membuang hasil dengan "Sesi belajar belum siap" bila kuis selesai sebelum `getOrStartSession` rampung, lalu efek sesi menimpa galat itu dengan "Penyimpanan lokal siap" sehingga kegagalan tak terlihat. Kini efek menyimpan promise sesi di `sessionReadyRef` dan pengiriman hasil menunggu sesi tersebut sebelum `saveAttempt`; galat sesi tetap tampil sebagai status `error`. Ini juga menjelaskan gejala flake "banner tetap siap, simpan tidak pernah mulai" yang tercatat sejak T-103 |
| E2E semat dari Player (T-112) | **PASS** — `pinned-materials` **16/16** (13 → 16): buka materi lewat hash `#player/kelas2-pai-b06-zakat/zakat` → tombol header berlabel "Sematkan Zakat dan Infak" `aria-pressed=false` → klik → label/pressed/teks berubah + `pinned_list` berisi 1 entri → Beranda tab Materi disematkan menampilkan kartu "Zakat dan Infak" → `Buka` pada kartu → header Player sudah "Disematkan" → klik → `pinned_list` kosong. Artefak `player-sematkan.png` |
| Regresi & gate T-112 | **PASS** — `npx tsc --noEmit` bersih · `npm run build` exit 0 (16,02 dtk) · `npm test` **124/124** (17 berkas) + fixture 4/4 + katalog 336/336 + binding PASS · `npm run a11y` **18/18** (0 error, 7 warning) · E2E `activities` **17/17**, `pinned-materials` 16/16, `learning-journey` 14/14, `home-catalog` 29/29, `player-deeplink` 7/7, `player-fullscreen` 6/6, `smoke` 8/8 · `cargo test` tidak dijalankan (tanpa perubahan Rust) |
| Batas T-112 | **SEBAGIAN** — sematan hanya bisa dipasang dari katalog dan header Player (bukan dari Hasil Belajar atau layar Aktivitas); urutan sematan tetap `pinned_at DESC` tanpa drag; tombol belum muncul di mode layar penuh (header disembunyikan); kegagalan baca sematan menyembunyikan tombol alih-alih menampilkan galat; `npm run a11y` dua kali gagal sebelum perbaikan karena harness membaca `[aria-live="polite"]` pertama (kini `[data-player-storage]`), bukan karena pelanggaran aksesibilitas |
| Cakupan kuis per paket (T-094/OD-9) | **PASS** — 336/336 paket punya aktivitas kuis; 88 paket baru (kelas 1–2: 5 soal, kelas 3–6: 6 soal) = 499 soal; katalog memuat 88 entri `activityCount: 4` |
| Volume latihan per kelas (T-094) | **PASS** — tiap kelas 56 aktivitas kuis; "Semua aktivitas dinilai berada dalam rentang target" |
| Validator konten (T-094/T-095) | **PASS** — 336/336 VALID, 0 issue, 336 warning (draft per paket) |
| R5 pasca T-094/T-095 | **PASS** — cermin 0, bias posisi 0 paket (578/559/578/163), kunci-terpanjang 0 paket |
| Kedalaman pasca T-094 | **PASS** — minimum 5 langkah / 3 aktivitas / 10 item, 0 paket di bawah ambang |
| Audit materi item (T-095) | **SELESAI** — 49 paket bermateri tipis dibaca penuh (283 soal + 283 pasangan); 21 item cacat di 17 paket dibetulkan; 0 jawaban bertentangan/salah hitung pada 12 soal matematika yang dicek manual |
| `npm test` / `npm run build` (T-094/T-095) | **PASS** — 105/105 + fixture 4/4 + catalog 336/336; `tsc` + Vite PASS |
| `npm run a11y` (T-094) | **PASS** — 17/17 (0 error, 7 warning reflow/target sentuh) |
| E2E (T-094) | **PASS** — player-fullscreen 6/6, learning-journey 11/11, activities 14/14 (satu percobaan kena timeout simpan pertama yang sudah tercatat sebagai flake, lalu PASS tanpa perubahan kode) |
| E2E quiz-coverage (T-094) | **PASS** — 4 pemeriksaan: paket 4 aktivitas (Menyimak Cerita) dan 3 aktivitas, tab "Kuis Penguatan" ada, 5 soal dirender & dapat dijawab, skor tampil. Temuan: 4 tab membungkus ke 2 baris (96 px) pada 1280 karena judul aktivitas panjang — berfungsi, belum dirapikan lebih jauh |
| `cargo test` (T-094/T-095) | **NOT RUN** — tanpa perubahan Rust |
| Volume latihan kelas 1–2 (T-092) | **PASS** — kuis 5 soal/paket (min 5, maks 5), mencocokkan 5 pasangan (min 5, maks 6); 112 paket |
| Volume latihan kelas 3–6 (T-092) | **PASS** — kuis 6 soal (min 6, maks 6), mencocokkan 6 pasangan (min 6, maks 7) pada 224 paket; `check-practice-volume.mjs`: "Semua aktivitas dinilai berada dalam rentang target" |
| Kedalaman pasca T-092 | **PASS** — minimum aktual 5 langkah / 3 aktivitas / **10 item** (sebelumnya 8); 0 paket di bawah ambang |
| R5 pasca T-092 | **PASS** — cermin 0, posisi kunci 0 paket menumpuk (413/393/410/163), kunci-terpanjang 0 paket (sebelumnya 10/3) |
| Validator konten (T-092) | **PASS** — 336/336 VALID, 0 issue, 336 warning (draft per paket) |
| `npm test` (T-092) | **PASS** — 105/105 unit (15 berkas) + fixture 4/4 + catalog 336/336 |
| `npm run build` (T-092) | **PASS** — `tsc --noEmit` + Vite |
| Cakupan kuis per paket (T-092) | **TIDAK TERPENUHI + TERCATAT** — 88 paket (26%) tidak punya aktivitas kuis sama sekali (eksplorasi + mencocokkan + mengurutkan); lihat BACKLOG |
| E2E player-fullscreen (T-093) | **PASS** — 6 pemeriksaan; chrome/tujuan/kemajuan/ringkasan tersembunyi, tepat 1 h1, tanpa overflow horizontal, Escape keluar, jawaban kuis bertahan saat mode dibuka-tutup (1280 & 1024) |
| Pengukuran panel aktivitas (T-093) | **TERUKUR** — 1280: 601 → 1225 px; 1024: 689 → 969 px (chrome + sidebar hilang) |
| `npm run a11y` (T-093) | **PASS** — 17/17 (0 error, 7 warning reflow/target sentuh); Player 0 error/0 warning |
| `npm test` / `npm run build` (T-093) | **PASS** — 105/105 + fixture 4/4 + catalog 336/336; build PASS |
| E2E (T-093) | **PASS** — smoke 8/8, activities 14/14, learning-journey 11/11, mode-switch 6/6, player-fullscreen 6/6 |
| `cargo test` (T-092/T-093) | **NOT RUN** — tanpa perubahan Rust |
| Bias posisi kunci kuis sebelum T-091a | **TERUKUR** — 694 soal pilihan ganda: posisi 0 = 528 (76,1%), posisi 1 = 147 (21,2%), posisi 2 = 19 (2,7%), posisi 3 = 0; **91 paket** (≥3 soal) menempatkan semua kunci di posisi sama |
| Bias posisi kunci setelah T-091a | **PASS** — posisi 0 = 206 (29,7%), 1 = 189 (27,2%), 2 = 203 (29,3%), 3 = 96 (13,8%); **0 paket** semua kunci di posisi sama; share per-paket tertinggi 66,7% (199 berkas aktivitas berubah, commit `12ce2e1`) |
| Pasangan matching menyalin eksplorasi sebelum T-091b | **TERUKUR** — 1.828 pasangan di 336 aktivitas; **908 identik byte** dengan `prompt`+`reveal` langkah eksplorasi paket yang sama (di 184 paket), 230 di antaranya juga boilerplate refleksi |
| Pasangan matching setelah T-091b | **PASS** — 1.602 pasangan; **0 cermin** (penuh maupun sebagian), **0 boilerplate**; 230 dihapus, 678 ditulis ulang (128 lewat override authored, 550 lewat aturan), 4 pasangan authored ditambahkan ke 2 paket |
| Ambang item dinilai (pasca T-091b) | **PASS** — 336/336 paket ≥5 langkah / ≥3 aktivitas / ≥8 item (minimum aktual: 5 langkah, 3 aktivitas, 8 item) |
| Validator konten (pasca T-091b) | **PASS** — 336/336 **VALID**, 0 issue, 336 warning (draft, per paket) |
| `npm test` (T-091) | **PASS** — 105/105 unit (15 berkas) + fixture 4/4 + catalog 336/336 |
| `npm run build` (T-091) | **PASS** — `tsc --noEmit` + Vite; katalog 336 entri; dist 349 WebP, 0 PNG |
| `npm run a11y` (T-091) | **PASS** — 17/17 (0 error, 7 warning reflow/target sentuh) |
| E2E (T-091) | **PASS** — activities 14/14, home-catalog 28/28, smoke 8/8 |
| Idempotensi transform (T-091b) | **PASS** — dijalankan ulang `rewrite-matching-pairs.mjs --apply`: 0 berkas berubah, residuals 0, belowFloor 0, collisions 0, authoredUnused 0 |
| Sinyal R5 yang tersisa (T-091) | **BELUM SELESAI saat itu** — **10 paket** masih punya kunci selalu merupakan opsi terpanjang (`longestCorrectRatio = 1`); butuh penulisan ulang teks opsi, bukan transform mekanis. **Diukur ulang pasca T-092 (2026-10-27): 0 paket.** |
| `cargo test` (T-091) | **NOT RUN** — tanpa perubahan Rust |
| Paket IPAS kelas 1–2 (T-089) | **PASS** — 16 paket baru (8 kelas 1 + 8 kelas 2) VALID 16/16, 0 issue, 1 warning/paket (draft) |
| Katalog (T-089) | **PASS** — 336 entri / 336 paket; tiap kelas 56, tiap mapel 48; `content:catalog:check` ikut `npm test` |
| `npm test` (T-089) | **PASS** — 105/105 unit (15 berkas) + fixture 4/4 + catalog 336/336 |
| `npm run build` (T-089) | **PASS** — `tsc --noEmit` + Vite |
| E2E home-catalog (T-089) | **PASS** — **28/28**; regresi baru: chip Kelas 1 → 8 kartu IPAS kelas 1 (`katalog-ipas-kelas1.png`) |
| E2E regresi (T-089) | **PASS** — activities 14/14, smoke 8/8, a11y 17/17 (0 error, 7 warning) |
| `cargo test` (T-089) | **NOT RUN** — tanpa perubahan Rust |
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

### Handoff Filter Mapel Bergambar (2026-10-27, T-081)

**Status:** selesai dan terverifikasi. Permintaan PO: filter mata pelajaran di Jelajah Materi memakai perilaku seperti filter kelas (bukan dropdown biasa).

**Perubahan kode:**
- `src/screens/CurriculumScreen.tsx` — dropdown `<select aria-label="Filter mata pelajaran">` diganti panel collapsible: tombol header `aria-expanded`/`aria-controls="filter-mapel-grid"` dengan chip “Semua mapel” atau label mapel terpilih (label sr-only “Mata pelajaran”); grid `role="group"` berisi 8 tile (Semua mapel + 7 mapel) dengan cover `coverAsset` per mapel (peta `subjectCovers`); memilih tile menutup panel; tombol kelas & mapel kini berdampingan (`md:flex-row`, masing-masing `md:flex-1`).
- `scripts/e2e/scenarios/home-catalog.mjs` — helper `clickSubject()`; menunggu 7 thumbnail mapel termuat, menyimpan `filter-mapel.png`, memeriksa chip “Matematika” + panel tertutup; `selectFilter` dihapus. Skenario kini **18 pemeriksaan**.

**Verifikasi aktual:** `npm test` **98/98** (12 berkas) + fixture 4/4 + catalog 320/320 · `cargo test` **69/69** (tidak ada perubahan Rust) · `npm run build` PASS · `npm run a11y` **17 pemeriksaan PASS** (0 error, 7 warning; termasuk tile mapel baru) · E2E **home-catalog 18/18** · mode-switch 6/6 · smoke 8/8. Bukti visual: `filter-mapel.png` memperlihatkan 8 tile bergambar, chip “Semua mapel”, dan panel yang menutup setelah “Matematika” dipilih (`catalog-thumbnails.png`).

**Catatan:** perilaku, bukan hanya tampilan — panel default terbuka seperti panel kelas, chip di header, tutup otomatis setelah memilih, dan bisa dibuka kembali. Grid mapel memakai `md:grid-cols-8` agar 8 tile muat satu baris di desktop.

**Sisa:** pilihan filter belum dipertahankan saat berpindah layar; tidak ada tombol “reset semua filter”.

### Handoff Cover Kelas/Mapel Khusus (2026-10-27, T-082)

**Status:** selesai dan terverifikasi. Permintaan PO: sambungkan 13 cover khusus yang sudah dibuat via Flow tetapi belum dipakai aplikasi.

**Perubahan kode:**
- `src/content/coverArt.ts` (baru) — `import.meta.glob` untuk `content/covers/kelas/cover-kelas-*.webp` (6) dan `content/covers/pelajaran/cover-mapel-*.webp` (7); `gradeCoverUrl(grade)` / `subjectCoverUrl(subject)` mengembalikan URL bundel atau `null`. Varian `_pilot-cover-kelas-4-chibi.webp` tidak cocok pola sehingga tidak ikut.
- `src/content/coverArt.test.ts` (baru) — 3 test: keenam kelas, ketujuh mapel inti, dan `null` untuk kelas 7 / `bahasa-inggris`.
- `src/components/content/CoverArt.tsx` (baru) — `<img data-cover-art>` dekoratif (`alt=""`, lazy) `object-cover` dengan placeholder `teal/10` bila URL kosong.
- `src/screens/CurriculumScreen.tsx` — tile kelas memakai `gradeCoverUrl(value)`, tile mapel memakai `subjectCoverUrl(value)`; rasio tile 4:3 → **16:9** agar cocok dengan cover; fallback tetap `LessonThumbnail` (`coverAsset`) lalu placeholder.
- `src/screens/HomeScreen.tsx` — kartu “Materi tersedia” memakai `CoverArt` 96×56 px (`h-14 w-24`, fallback `LessonThumbnail`); hero memakai `subjectCoverUrl(heroEntry.subjects[0])`.
- `src/components/home/LearningIllustration.tsx` — prop `coverUrl`; memakai `CoverArt` 16:9, fallback `LessonThumbnail` 16:9.
- `scripts/e2e/scenarios/home-catalog.mjs` — asersi `img[data-cover-art]` dan `src` memuat `cover-kelas-`/`cover-mapel-` (tile kelas, tile mapel, kartu Beranda, ilustrasi hero); screenshot baru `filter-kelas.png`; tetap **18 pemeriksaan**.

**Verifikasi aktual:** `npm test` **101/101** (13 berkas; `coverArt` 3 test) + fixture 4/4 + catalog 320/320 · `cargo test` **69/69** (tanpa perubahan Rust) · `npm run build` PASS — 13 cover WebP masuk `dist/assets` · `npm run a11y` **17 pemeriksaan PASS** (0 error, 7 warning) · E2E **home-catalog 18/18** · mode-switch 6/6 · smoke 8/8. Bukti visual: `filter-kelas.png` (6 cover kelas 16:9), `filter-mapel.png` (7 cover mapel), `hero-beranda.png` (hero + 7 kartu mapel).

**Catatan:** tambahan bundel ±1,46 MB (kelas 118–196 KB; mapel 60–102 KB); kartu materi di grid tetap memakai thumbnail aset paket karena itu thumbnail isi materi. Cover kelas membedakan gaya: kelas 1–3 chibi, kelas 4–6 semi-realistis.

**Sisa:** cover belum dipakai di layar lain (mis. header Player); belum ada rotasi cover.

### Handoff Layout Konten Materi (2026-10-27, T-083)

**Status:** selesai dan terverifikasi. Permintaan PO: perbaiki layout konten materi karena banyak ruang kosong.

**Diagnosis terukur (sebelum):** kontainer Player dipatok `max-w-4xl` (896 px) di tengah area utama 1152 px; gambar eksplorasi `max-w-xl` → hanya 601×431 px; kartu “Tujuan pembelajaran” 896 px dengan teks terisi ±40 %; kolom kanan kosong total pada IFP 1920 px.

**Perubahan kode:**
- `src/screens/LessonPlayer.tsx` — kontainer luar `max-w-4xl` → `max-w-[1400px]`; `LessonView` disusun ulang sebagai grid `lg:grid-cols-[minmax(0,1fr)_20rem]` / `xl:…22rem` (`gap-x-6 gap-y-5`): tab + panel aktivitas di kolom kiri, pesan penyimpanan + kartu “Tujuan pembelajaran” di kolom kanan (`data-player-aside`, `lg:sticky lg:top-6`); judul `max-w-4xl`, ringkasan `max-w-3xl`. Kolom kanan memakai `<div>` bukan `<aside>` agar tidak rancu dengan sidembar admin (deteksi mode E2E).
- `src/components/content/ExplorationActivity.tsx` — gambar langkah: `w-full max-w-xl` → `mx-auto max-h-[60vh] w-auto max-w-full` (IFP 1080 px → ±864×648 px).
- `scripts/e2e/scenarios/activities.mjs` — pemeriksaan layout baru (kolom samping ada & di kanan panel, panel ≥ 55 % lebar grid pada ≥ 1024 px, `position: sticky`, ada ruang menempel, tanpa gulir horizontal) + uji menempel saat menggulir bila halaman dapat digulir. **10 pemeriksaan.**
- `scripts/e2e/scenarios/a11y.mjs` — penanda mode diganti `nav[aria-label="Navigasi utama"]`; tambah pemeriksaan overflow horizontal Player pada 1600×900.
- `scripts/e2e/scenarios/mode-switch.mjs` — menunggu rail belajar muncul setelah muat ulang (menghapus balapan sidebar admin).

**Verifikasi aktual:** `npm test` **101/101** + fixture 4/4 + catalog 320/320 · `npm run build` PASS · `npm run a11y` **17/17** (0 error, 7 warning) · E2E **activities 10/10** (`panel 889px, samping 352px; 312px dalam grid 700px, position sticky` pada 1600 px) · **learning-journey 11/11** · **home-catalog 18/18** · **mode-switch 6/6** · **smoke 8/8**. Ukuran sesudah pada viewport 1247 px: grid 1088 px, panel 744 px, kolom samping 320 px (x=880), tanpa gulir horizontal. Bukti visual: `activities.png`, `a11y-mode-belajar.png`. `cargo test` tidak dijalankan (tanpa perubahan Rust).

**Catatan:** flake tulis-perdana dan kedipan sidebar saat boot dicatat sebagai utang teknis di BACKLOG; keduanya tidak disebabkan perubahan layout.

**Sisa:** kolom samping masih kosong di bawah kartunya bila panel aktivitas jauh lebih tinggi; ruang vertikal bawah Player belum dimanfaatkan (mis. ringkasan progres); cover khusus belum dipakai di header Player.

### Handoff Seleksi Materi Player (2026-10-27, T-084)

**Status:** selesai dan terverifikasi. Laporan PO: semua materi selalu membuka “Mengenal Huruf dan Suku Kata”.

**Akar masalah (terbukti):** `consumePlaybackSelection()` membaca lalu menghapus seleksi. Effect React berjalan dua kali di StrictMode; pembacaan kedua bernilai `null` → Player jatuh ke paket pertama. Instrumentasi mencatat `["kelas6-pai-b06-zakat", null]` pada satu klik.

**Perubahan kode:**
- `src/state/playbackSelection.ts` — `getPlaybackSelection()` idempoten menggantikan `consumePlaybackSelection()`.
- `src/screens/LessonPlayer.tsx` — effect memakai pembacaan idempoten.
- `src/state/playbackSelection.test.ts` — 2 test regresi.
- `scripts/e2e/scenarios/home-catalog.mjs` — buka materi dari paket lain dan cocokkan `h1` dengan judul kartu; helper `openMaterial()` mencocokkan `li` kartu (bukan teks seluruh `<ul>`). **19 pemeriksaan.**

**Verifikasi aktual:** `npm test` **103/103** (14 berkas) + fixture 4/4 + catalog 320/320 · `npm run build` PASS · E2E **home-catalog 19/19**, **activities 10/10**, **learning-journey 11/11**, **content-rollback 9/9**, **smoke 8/8**, **a11y 17/17** (0 error, 7 warning) · uji manual: klik “Zakat dan Infak” → `h1` “Zakat dan Infak”. `cargo test` tidak dijalankan (tanpa perubahan Rust).

**Sisa:** seleksi hanya di memori — muat ulang langsung di `#player` kembali ke paket pertama; belum ada deep link materi di hash.

### Handoff Sisa Layout Player (2026-10-27, T-085)

**Status:** selesai dan terverifikasi. PO memilih tiga sisa item T-083: isi ruang kosong kolom samping, manfaatkan ruang vertikal bawah, pakai cover khusus di header Player.

**Perubahan kode:**
- `src/screens/LessonPlayer.tsx` — header `data-player-hero` (badge + judul + ringkasan di kiri; cover 16:9 `data-player-cover` di kanan, sumber: gambar pertama `manifest.assets` → `lesson.assetRefs` → `subjectCoverUrl` → `gradeCoverUrl`); kartu `data-player-progress` “Aktivitas & kemajuan” (`role="progressbar"`, bar teal, status per aktivitas `Skor N`/`Dibuka`/`Belum`, label “sesi ini”); band `data-session-summary` lebar penuh dengan Aktivitas dinilai, Skor terakhir, Rata-rata aktivitas, dan tombol Buka Hasil Belajar; prop opsional `onNavigate`.
- `src/App.tsx` — `<LessonPlayer onNavigate={navigate} />`.
- `scripts/e2e/scenarios/activities.mjs` — 4 pemeriksaan baru (header+cover termuat, kartu kemajuan, ringkasan ikut diperbarui, tombol Hasil Belajar), artefak `activities-hero.png`; probe sticky kini memakai `document.scrollingElement` dan ambang 24 px. **14 pemeriksaan.**

**Verifikasi aktual:** `npm test` **103/103** (14 berkas) + fixture 4/4 + catalog 320/320 · `npm run build` PASS · E2E **activities 14/14** (layout 1600 px: panel 889 px, samping 352/566 px dalam grid 700 px) · **home-catalog 19/19** · **a11y 17/17** (0 error, 7 warning) · **learning-journey 11/11** · **content-rollback 9/9** · **smoke 8/8**. `cargo test` tidak dijalankan (tanpa perubahan Rust). Commit `f80ff8f`.

**Sisa:** cover header = gambar pertama manifest, jadi paket >1 lesson akan berbagi cover (belum ada paket seperti itu); kartu kemajuan hanya sesi berjalan (riwayat per aktivitas belum dimuat dari DB); jendela sticky belum teruji pada 1600×900 (jarak gulir dokumen 227 px) dan belum dilihat di IFP 1920 px asli.

### Handoff Kartu Mapel Beranda & Katalog Terfilter (2026-10-27, T-086)

**Status:** selesai dan terverifikasi. PO melaporkan thumbnail mapel Beranda terlalu kecil dan klik “Matematika” menampilkan semua pelajaran.

**Akar masalah (terbukti):** tombol “Lihat” pada kartu mapel hanya memanggil `onNavigate("curriculum")` tanpa membawa mapel — katalog selalu terbuka tanpa filter.

**Perubahan kode:**
- `src/state/catalogFilter.ts` (baru) — `setCatalogFilter()` / `getCatalogFilter()` idempoten / `clearCatalogFilter()`; pembacaan idempoten agar aman terhadap effect ganda StrictMode (pelajaran T-084).
- `src/state/catalogFilter.test.ts` (baru) — 2 test regresi.
- `src/screens/HomeScreen.tsx` — kartu mapel jadi tile 16:9 selebar kolom (grid 2/3/4 kolom), seluruh kartu `<button>`, label + jumlah materi + chevron; klik menyetel filter mapel lalu navigasi ke katalog.
- `src/screens/CurriculumScreen.tsx` — effect sekali-per-kunjungan (penjaga `useRef`) menerapkan lalu menghapus permintaan filter; `<li>` hasil membawa `data-catalog-subjects`.
- `scripts/e2e/scenarios/home-catalog.mjs` — klik Kartu “Matematika” → katalog terfilter (49 kartu, semua `matematika`, chip “Matematika”); kembali ke Beranda lalu buka katalog lagi tanpa filter. **21 pemeriksaan.**

**Verifikasi aktual:** `npm test` **105/105** (15 berkas) + fixture 4/4 + catalog 320/320 · `npm run build` PASS · E2E **home-catalog 21/21**, **a11y 17/17** (0 error, 0 warning), **activities 14/14**, **learning-journey 11/11**, **content-rollback 9/9**, **smoke 8/8** · artefak `hero-beranda.png`. `cargo test` tidak dijalankan (tanpa perubahan Rust).

**Sisa:** permintaan filter hanya di memori proses (muat ulang di `#curriculum` kembali tanpa filter); layar lain (Aktivitas Interaktif, Hasil Belajar) belum ikut memakai mapel terpilih.

### Handoff Alur Beranda → Mapel → Kelas (2026-10-27, T-087)

**Status:** selesai dan terverifikasi. PO menguji alur dan melaporkan halaman setelah memilih mapel tidak menuntun ke pemilihan kelas.

**Akar masalah (terbukti):**
1. `navigate()` tidak mengembalikan posisi gulir; yang menggulir adalah dokumen, jadi katalog terbuka di tengah daftar (judul + pemilih kelas di atas tak terlihat).
2. Grid mapel tetap terbuka setelah mapel dipilih dari Beranda sehingga grid kelas terdorong jauh ke bawah.

**Perubahan kode:**
- `src/App.tsx` — effect pada `activeScreen` mengembalikan `document.scrollingElement.scrollTop` ke 0.
- `src/screens/CurriculumScreen.tsx` — kunjungan ber-filter mapel melipat grid mapel (`subjectsOpen = false`) sehingga grid kelas langsung terlihat; kartu hasil menambah `data-catalog-grades`.
- `scripts/e2e/scenarios/home-catalog.mjs` — 2 pemeriksaan alur baru (tiba di `scrollTop 0` + grid mapel terlipat + grid kelas terbuka; klik “Kelas 3” → 49 jadi **9 kartu**, semua `matematika` grade 3), artefak `katalog-dari-mapel.png` + `katalog-matematika-kelas3.png`. **23 pemeriksaan.**

**Verifikasi aktual:** `npm test` **105/105** (15 berkas) + fixture 4/4 + catalog 320/320 · `npm run build` PASS · E2E **home-catalog 23/23**, **a11y 17/17** (0 error, 7 warning; percobaan pertama kena flake timeout simpan kuis, lolos pada ulangan), **activities 14/14**, **learning-journey 11/11**, **content-rollback 9/9**, **profile-lifecycle 7/7**, **mode-switch 6/6**, **smoke 8/8**. `cargo test` tidak dijalankan (tanpa perubahan Rust).

**Sisa:** pemilihan kelas tetap di halaman katalog yang sama (bukan wizard dua langkah); permintaan filter hanya di memori proses.

### Handoff Pencarian "ipas" Kosong (2026-10-27, T-088)

**Status:** selesai dan terverifikasi. PO melaporkan pencarian pelajaran IPAS "tidak ada".

**Temuan (terbukti):** pencarian bebas menemukan IPAS (32 entri; IPAS = 8 materi × kelas 3–6). Hasil kosong terjadi karena **filter aktif**: chip mapel masih Matematika dan/atau kelas 1–2 (IPAS mulai kelas 3). Empty state lama tidak menyebut filter sehingga terbaca sebagai materi hilang.

**Perubahan kode:**
- `src/screens/CurriculumScreen.tsx` — empty state `data-catalog-empty` menyebut kata kunci + filter aktif; tombol **Cari di semua mapel**, **Cari di semua kelas**, **Hapus semua filter**; helper `emptyStateMessage()`.
- `scripts/e2e/scenarios/home-catalog.mjs` — 2 regresi baru (penjelasan filter aktif saat mencari “ipas” di Matematika + Kelas 3; “Cari di semua mapel” → **8 materi IPAS kelas 3**), artefak `katalog-ipas-filter-aktif.png`. **26 pemeriksaan.**

**Verifikasi aktual:** `npm test` **105/105** (15 berkas) + fixture 4/4 + catalog 320/320 · `npm run build` PASS · E2E **home-catalog 26/26**, **a11y 17/17** (0 error, 7 warning), **activities 14/14**, **smoke 8/8**. `cargo test` tidak dijalankan (tanpa perubahan Rust).

**Sisa:** pencarian tetap di dalam filter aktif (bukan global) — kini dijelaskan; IPAS memang belum ada untuk kelas 1–2. *(Sejak T-089 IPAS kelas 1–2 sudah tersedia — lihat handoff di bawah.)*

### Handoff Paket IPAS Kelas 1–2 (2026-10-27, T-089)

**Status:** selesai dan terverifikasi. Permintaan PO: "tambah materi IPAS kelas 1-2 juga". Keputusan PO untuk ilustrasi: **paket dulu, gambar menyusul** — 16 paket dibuat lengkap sekarang dengan salinan cover mapel IPAS sebagai aset sementara; ilustrasi Flow menyusul saat kuota/akun tersedia.

**Konteks kurikulum (mengikat):** pada matriks OD-1, Fase A (kelas 1–2) berisi **6 mapel inti** dan **IPAS baru mulai Fase B (kelas 3)**. Ke-16 paket ini karena itu **di luar matriks yang disetujui**; `curriculumRefs` diisi `fase-a/2024` secara **provisional** mengikuti preseden ADR-0033, `reviewStatus` dan `releaseState` tetap `draft`. Perluasan IPAS ke Fase A **belum diputuskan Curriculum Lead** — jangan diklaim sesuai kurikulum.

**Paket baru (16):**
- Kelas 1: `kelas1-ipas-b01-tubuh-dan-indera`, `b02-makhluk-hidup-di-sekitarku`, `b03-merawat-tubuh`, `b04-makanan-sehat`, `b05-cuaca-di-sekitarku`, `b06-lingkungan-rumah-sekolah`, `b07-hewan-tumbuhan-peliharaan`, `b08-keselamatan-diri`.
- Kelas 2: `kelas2-ipas-b01-pertumbuhan-manusia-hewan`, `b02-bagian-tumbuhan`, `b03-siklus-hidup-sederhana`, `b04-wujud-benda`, `b05-perubahan-cuaca-musim`, `b06-sumber-daya-alam`, `b07-hemat-air-listrik`, `b08-lingkungan-bersih-sehat`.

**Struktur tiap paket:** `manifest.json` (v0.2.0, `gradeLevels` satu kelas, `subjects ["ipas"]`, 1 aset) + `lessons/lesson-001.json` (4 tujuan, 3 activityIds, 1 assessmentRef) + 3 aktivitas: eksplorasi **5 langkah**, matching **6 pasangan**, kuis pilihan ganda **2 soal** → **8 item dinilai**. `lessonId` = slug paket sehingga tidak menambah tabrakan `lessonId@version` (tetap 38 benturan lama di paket warisan).

**Perubahan kode/alat:**
- `scripts/add-ipas-kelas1-2.mjs` (baru) — generator satu-kali dari array `topics` (judul, ringkasan, tujuan, langkah, pasangan, soal); menyalin `content/covers/pelajaran/cover-mapel-ipas.webp` ke `assets/<slug>.webp` dan menghitung SHA-256; melewati folder yang sudah ada kecuali `--force`.
- `public/content-catalog.json` — dibangun ulang: **336 entri / 336 paket** (setiap kelas 56, setiap mapel 48; ipas 48).
- `scripts/e2e/scenarios/home-catalog.mjs` — regresi baru: setelah pencarian "ipas", buka panel kelas (kondisional — panel terbuka default), klik **Kelas 1** → 8 kartu IPAS kelas 1, artefak `katalog-ipas-kelas1.png`; lalu "Semua kelas" mengembalikan 48 hasil, sebelum alur Kelas 3 yang sudah ada. **28 pemeriksaan.**

**Verifikasi aktual:** validator 16/16 **VALID** (0 issue, 1 warning draft per paket) · `npm test` **105/105** + fixture 4/4 + catalog **336/336** · `npm run build` PASS · E2E **home-catalog 28/28**, **activities 14/14**, **smoke 8/8**, `npm run a11y` **17/17** (0 error, 7 warning) · `cargo test` tidak dijalankan (tanpa perubahan Rust). Bukti visual: `katalog-ipas-kelas1.png` (chip "Kelas 1", "8 materi ditemukan", kartu "KELAS 1 · IPAS").

**Batasan (jujur):** ke-16 thumbnail masih memakai **satu gambar yang sama** (cover mapel IPAS) — belum ada ilustrasi per topik · belum ada review pedagogis manusia, jadi `reviewStatus` tetap `draft` · E2E memverifikasi tampilan **kelas 1**; kelas 2 diverifikasi lewat validator, katalog, dan data paket, bukan klik UI · kuis hanya 2 soal (ambang ≥8 item dipenuhi via matching).

**Sisa:** buat 16 ilustrasi Flow (satu per topik, 4:3 1200×896), migrasikan manifest ke aset unik, lalu jalankan ulang validator + katalog; minta keputusan Curriculum Lead soal IPAS di Fase A.

### Handoff Cover Unik per Topik IPAS Kelas 1–2 (2026-10-27, T-090)

**Status:** selesai dan terverifikasi. Permintaan PO: "ganti gambar cover per topik berbeda" — melunasi janji "gambar menyusul" dari T-089.

**Koreksi cast (diakui):** 5 ilustrasi pertama sempat dibuat dengan anak generik (perempuan tanpa hijab). Setelah PO bertanya, seluruh 16 topik **diregenerasi** memakai prefiks karakter baku yang sama dengan 152 ilustrasi Kelas 1–3: *"Gunakan karakter Ayu dan Bima yang dilampirkan sebagai desain karakter yang sama persis (Ayu: hijab putih, seragam lengan panjang; Bima: kemeja putih, dasi merah, celana merah)."* Setiap scene menyebut Ayu/Bima secara eksplisit.

**Produksi:** Google Flow project `218ad195-1801-4997-bffc-c754043067d6` (akun Dewi Gardenia, label diverifikasi), 2 kandidat per topik (Nano Banana 2.1), unduh `=s1600-rw` → WebP 1200×896 lewat queue server `127.0.0.1:4789`. Tidak ada otomasi picker karakter (diblokir classifier Auto-mode), tidak ada bypass, tidak ada kredensial diketik.

**Pilihan final:** Kelas 1 → 1A 2A 3B 4B 5A 6A 7A 8A · Kelas 2 → 9A 10A 11A 12B 13A 14A 15A 16A. Kriteria: komposisi bersih, wajah kedua anak terlihat, kesesuaian adegan, tanpa teks terbaca. `hemat-air-listrik` opsi B ditolak (keran mengalir — bertentangan dengan topik); `wujud-benda` opsi B dipilih karena latar krem polos dan tokoh besar.

**Wiring:** `content/packages/kelas{1,2}-ipas-b0*/assets/<slug>.webp` diganti bytes pilihan; `manifest.json` `sizeBytes` + `sha256` dihitung ulang (**16/16 cocok**, 0 selisih); `lesson-001.json` + `activity-001.json` memakai `altText` spesifik topik. 32 `altText` aktivitas matching/kuis yang masih menyalin deskripsi aset lama ("tanaman muda berakar…") diperbaiki menjadi deskripsi aktivitas. 33 berkas kandidat `-a`/`-b` dihapus setelah pemilihan.

**Verifikasi aktual:** validator **336/336 VALID** (0 issue, 1 warning draft/paket) · `npm test` **105/105** (15 berkas) + fixture 4/4 + catalog **336/336** · `npm run build` PASS · E2E **home-catalog 28/28**, **activities 14/14**, **smoke 8/8** · `npm run a11y` **17/17** (0 error, 7 warning reflow/target sentuh) · `cargo test` tidak dijalankan (tanpa perubahan Rust). Bukti visual: `katalog-ipas-kelas1.png` — kartu "Cuaca di Sekitarku", "Hewan dan Tumbuhan Peliharaan", "Keselamatan Diri" memakai ilustrasi berbeda berisi Ayu & Bima.

**Batas (jujur):** belum ada review visual manusia (guru/PO) selain pemeriksaan agent · `reviewStatus`/`releaseState` tetap `draft` · ilustrasi tidak memuat teks terbaca (disengaja) sehingga topik hanya dikenali dari adegan · kuis tetap 2 soal (ambang ≥8 item dipenuhi via matching) · E2E memverifikasi tampilan kelas 1; kelas 2 diverifikasi lewat validator, katalog, dan hash aset.

**Sisa:** keputusan Curriculum Lead soal IPAS di Fase A (OD-1) · review manusia R1–R6/R8–R9/R12 · verifikasi CP/ATP per bab · D-UX-2/4/5/6 · blocker rilis B-01…B-08.

### Handoff Perbaikan Temuan Deterministik R5 (2026-10-27, T-091)

**Status:** selesai dan terverifikasi untuk dua sinyal R5 yang bersifat mekanis. Permintaan PO: "kerjakan rekomendasi nomor 1" dari ringkasan pasca-T-090, yaitu membereskan temuan deterministik pra-review (bias posisi kunci + duplikasi matching). Keputusan PO atas pilihan ruang lingkup: **opsi A — ganti yang rusak + tulis ulang** (bukan penulisan ulang penuh ±1.100 pasangan lintas sesi, dan bukan hanya menghapus 230 yang rusak).

**Definisi yang dipakai (diambil dari `scripts/pedagogical-prereview.mjs`, bukan asumsi):**
- *Cermin* = pasangan matching yang `left` identik byte dengan `step.prompt` **dan** `right` identik dengan `step.reveal` pada aktivitas eksplorasi paket yang sama.
- *Bias posisi* = paket dengan ≥3 soal pilihan ganda di mana seluruh kunci berada pada indeks opsi yang sama.
- *Kunci terpanjang* = paket di mana opsi benar selalu opsi terpanjang (`longestCorrectRatio = 1`) — **sinyal tekstual, tidak diperbaiki pada sesi ini.**

**T-091a — siarkan posisi kunci (`scripts/spread-answer-positions.mjs`, commit `12ce2e1`, 199 berkas aktivitas):**
- Sebelum: 694 soal — indeks 0 = 528 (76,1%), 1 = 147 (21,2%), 2 = 19 (2,7%), 3 = 0; **91 paket** kuncinya menumpuk di satu posisi.
- Sesudah: indeks 0 = 206 (29,7%), 1 = 189 (27,2%), 2 = 203 (29,3%), 3 = 96 (13,8%); **0 paket** semua kunci di posisi sama; share per-paket tertinggi 66,7%.
- Metode: **susun ulang urutan opsi, bukan isinya** — kunci dipindah ke `(hash(packageId) + ordinal soal dalam paket) % jumlah opsi`; `optionId` bergerak bersama teksnya sehingga `correctResponse` dan penilaian tidak berubah. Deterministik dan idempoten. Soal dengan <3 opsi dibiarkan (memindahkannya tidak memberi pilihan yang berarti); pada soal multi-jawaban hanya opsi benar pertama yang digeser, mengikuti cara detektor mengukur posisi kunci. Aktivitas benar/salah **tidak dijamah** karena tampilan Benar/Salah di-hardcode di `src/components/content/QuizActivity.tsx`, jadi menggeser array tidak mengubah posisi yang dilihat siswa.

**T-091b — hapus duplikasi matching (`scripts/rewrite-matching-pairs.mjs` + `scripts/data/matching-rewrite-2026-10-27.json`, commit `0e24dbc`, 184 berkas aktivitas):**
- Sebelum: 1.828 pasangan di 336 aktivitas mencocokkan; **908 di antaranya cermin langkah eksplorasi** di 184 paket; 230 dari 908 itu juga boilerplate refleksi ("Apa hal penting yang kamu pelajari…", "Bagaimana urutan yang benar untuk…").
- Sesudah: 1.602 pasangan; **0 cermin**, 0 boilerplate, 0 pasangan duplikat dalam satu aktivitas.
- Rincian 908 cermin: **230 dihapus** (boilerplate), **678 ditulis ulang** menjadi bentuk petunjuk→jawaban — 128 pasangan memakai override yang ditulis tangan (119 entri `pairOverrides`, dikunci pada `left`+`right` asli), 550 memakai aturan pola kalimat tanya (`Apa yang…` → `Yang…`, `Berapa…` → `Banyak…`, `Kapan…` → `Waktu…`, isian `…` → batang kalimat, ds.), dan **4 pasangan authored ditambahkan** ke 2 paket yang akan turun di bawah ambang 8 item setelah penghapusan.
- Ikutan: `pairId` dinomori ulang `pasangan-N` (skema hanya menuntut keunikan; penilaian tidak bergantung urutan), instruksi 184 aktivitas berubah menjadi "Pasangkan setiap petunjuk dengan jawaban yang tepat.", `altText` diregenerasi hanya bila polanya masih menyalin judul aktivitas. 152 paket lain (matching di `activity-002.json`) tidak tersentuh karena tidak punya pasangan cermin.
- Alat: **snapshot SHA-256** 336 berkas sebelum transform di `.tmp-assets/snapshots-before-matching/` (git-ignored); skrip **dry-run default**, `--apply` untuk menulis, dan **idempoten** — dijalankan ulang menghasilkan 0 perubahan. Digunakan dua kali untuk rollback + terapkan ulang setelah aturan diperbaiki (sisa "Banyak banyak…": digabung lewat `withPrefix()`; petunjuk berakhiran titik: strip final `.`).

**Ambang & validasi setelah kedua fase (angka di bawah diukur pada pohon kerja = HEAD `0e24dbc`):**
- Validator: **336/336 VALID**, 0 issue, 336 warning (draft).
- Kedalaman (aturan kanonik `scripts/review-content.ts` — langkah eksplorasi, jumlah aktivitas, item dinilai): minimum aktual **5 langkah / 3 aktivitas / 8 item**, **0 paket di bawah ambang**.
- `npm test` **105/105** + fixture 4/4 + konsistensi katalog 336/336 · `npm run build` PASS · `npm run a11y` **17/17** (0 error, 7 warning) · E2E **activities 14/14**, **home-catalog 28/28**, **smoke 8/8** · `cargo test` tidak dijalankan (tanpa perubahan Rust).

**Batas (jujur, tidak disembunyikan):**
1. **10 paket** masih memicu sinyal R5 lain: opsi benar selalu yang terpanjang. Ini butuh penulisan ulang teks opsi (bukan transform mekanis) — sengaja ditinggalkan, tercatat di BACKLOG.
2. Penulisan ulang 550 pasangan memakai **aturan bahasa**, bukan penilaian guru; frasanya sah secara pedoman tapi belum tentu paling tepat secara pedagogis. Bentuknya menghilangkan beban ganda (soal tidak lagi menyalin jawaban eksplorasi), itu klaim yang didukung bukti; kualitas petunjuk adalah klaim yang **tidak** didukung bukti.
3. Sinyal R5 lain dari pra-review 2026-10-26 (1.188/2.851 item tak terpetakan oleh kata kunci tujuan) **tidak disentuh** — itu soal cakupan tujuan, bukan duplikasi.
4. `reviewStatus`/`releaseState` tetap `draft`. Tidak ada approval manusia; perbaikan ini mengurangi beban kerja reviewer, bukan menggantikannya.
5. `scripts/pedagogical-prereview.mjs` dan `scripts/review-content.ts` **menulis ke path bertanggal tetap** (`…_2026-10-26.*`), sehingga keduanya **tidak dijalankan ulang** — menjalankan akan menimpa laporan historis. Verifikasi memakai analisis di `.tmp-assets/` yang mengimplementasikan semantik detektor yang sama; angka "0 cermin / 0 bias" berasal dari sana, bukan dari laporan pra-review baru.
6. E2E tidak menguji 336 paket satu per satu; ia memuat aktivitas matching bawaan. Cross-check korpus dilakukan lewat skrip, bukan UI.

**Sisa:** 10 paket kunci-terpanjang · reviewer manusia R1–R6/R8–R9/R12 · keputusan Curriculum Lead IPAS Fase A (OD-1) · CP/ATP per bab · D-UX-2/4/5/6 · blocker rilis B-01…B-08.

### Handoff Volume Latihan per Kelas (2026-10-27, T-092)

**Status:** selesai dan terverifikasi untuk seluruh kelas 1–6. Permintaan PO: "kerjakan sesuai kelas saja — saya ingin setiap latihan berisi 5–10 soal". Ruang lingkup dikunci lewat pilihan PO: **kuis + mencocokkan + mengurutkan**, dengan target **5 soal kelas 1–2** dan **6–8 soal kelas 3–6** (dioperasionalkan: kelas 1–2 = tepat 5 kuis + 5 pasangan; kelas 3–6 = tepat 6 kuis + 6 pasangan; mengurutkan ≥5; plafon 10).

**Alur per kelas (1 → 6):** digest materi → `needs-kelas<N>-{a,b,c}.json` (kekurangan per paket) → 3 agen penulis paralel (satu berkas data per agen, dilarang menyentuh `content/packages/`) → `precheck.mjs` → `add-practice-items.mjs --apply` → `spread-answer-positions.mjs --apply` → `check-practice-volume.mjs` → validator 336 paket → analisis R5 → cek kedalaman → `npm test` + `npm run build` → commit per kelas.

**Hasil terukur (19 berkas `scripts/data/practice-items-kelas*-2026-10-27.json`):**
- Kelas 1: +95 soal / +38 pasangan (56 paket; commit `3ea86e6`) — kuis min 5 maks 5, pasangan min 5 maks 6.
- Kelas 2: +93 / +33 (commit `06fa649`) — kuis 5/5, pasangan 5–8.
- Kelas 3: +126 / +78 (commit `4d52f15`) — kuis 6/6, pasangan 6/6.
- Kelas 4: +123 / +71 (commit `034bb27`) — kuis 6/6, pasangan 6/6.
- Kelas 5: +132 / +71 (commit `0c7e020`) — kuis 6/6, pasangan 6/6.
- Kelas 6: +126 / +70 (commit `abc1be6`) — kuis 6/6, pasangan 6–7.
- **Total +695 soal kuis + 361 pasangan.** `check-practice-volume.mjs`: "Semua aktivitas dinilai berada dalam rentang target".

**Verifikasi aktual (pohon kerja = HEAD `abc1be6`):** validator **336/336 VALID** (0 issue, 336 warning draft) · kedalaman minimum **5 langkah / 3 aktivitas / 10 item**, 0 paket di bawah ambang · R5: cermin **0**, bias posisi kunci **0 paket** (sebaran 413/393/410/163), kunci-selalu-terpanjang **0 paket** (sebelumnya 10) · `npm test` **105/105** (15 berkas) + fixture 4/4 + catalog **336/336** · `npm run build` PASS · `cargo test` tidak dijalankan (tanpa perubahan Rust).

**Batas (jujur):**
1. **88 paket (26%) tidak memiliki aktivitas kuis sama sekali** — kombinasinya eksplorasi + mencocokkan + mengurutkan (umumnya keterampilan menulis/bercerita/seni/PJOK/PAI praktik). Target "5–10 item" terpenuhi untuk **setiap aktivitas dinilai yang ada**, tetapi bukan untuk setiap paket. Menambah kuis ke 88 paket itu keputusan desain konten — tercatat sebagai pertanyaan terbuka di BACKLOG.
2. Item ditulis agen dari digest paket, **belum dinilai guru**; `reviewStatus` tetap `draft`. Daftar paket bermateri tipis ada di BACKLOG.
3. E2E tidak menguji isi 695 soal baru; verifikasi isi lewat skrip korpus (R5, kedalaman, validator), bukan penilaian pedagogis.

**Sisa:** review guru atas item baru (lihat BACKLOG) · keputusan 88 paket tanpa kuis · reviewer manusia R1–R6/R8–R9/R12 · OD-1 IPAS Fase A · blocker rilis B-01…B-08.

### Handoff Player Padat + Mode Layar Penuh (2026-10-27, T-093)

**Status:** selesai dan terverifikasi. Permintaan PO (sebagai UX/UI): "perbaiki halaman Player Pembelajaran karena masih banyak ruang kosong; saya ingin ada fullscreen mode yang bila diaktifkan hanya menampilkan halaman interaktif, tanpa header tujuan pembelajaran dan progres belajar".

**Desain yang dipilih:**
- **Mode layar penuh = state di `App`**, bukan Fullscreen API native (WebView2/pratinjau browser tidak konsisten). Tombol "Layar penuh"/"Keluar layar penuh" ada di baris status Player, `aria-pressed` mengikuti state; Escape juga keluar; berpindah layar atau berganti mode otomatis mematikan mode ini.
- **Tanpa remount:** chrome shell dibungkus `<div className="contents" style={{display:"none"}}>` dan blok lesson memakai atribut `hidden`, sehingga panel aktivitas tidak dilepas dari DOM — **jawaban kuis yang belum diperiksa bertahan** saat mode dibuka-tutup (dibuktikan E2E).
- Di layar penuh hanya tersisa: strip judul (h1 + kelas/mapel), baris tab aktivitas, satu baris status (disembunyikan kecuali `preview`/`error`), dan panel aktivitas selebar layar.
- **Kepadatan normal:** hero lebih rapat (padding 4/5, cover 16–20rem), strip penyimpanan pindah dari kolom samping ke baris status, ringkasan sesi lebih ringkas, dan tata letak dua kolom baru aktif di `xl` (1280) sehingga 1024 memakai satu kolom penuh.
- **Isi aktivitas:** tiap aktivitas dibatasi kolom baca `max-w-5xl` dan opsi kuis memakai dua kolom di layar lebar, agar baris opsi tidak melar selebar panel.

**Bukti terukur (skenario `e2e/player-fullscreen`, 1280×800 & 1024×768):** panel aktivitas **601 → 1225 px** (1280) dan **689 → 969 px** (1024); sidebar, top bar, "Tujuan pembelajaran", kartu kemajuan, dan ringkasan sesi tidak terlihat; tepat **1** `<h1>` terlihat; tanpa overflow horizontal; Escape keluar; jawaban kuis tetap tersimpan. Screenshot: `player-normal-1280.png`, `player-fullscreen-1280.png`, `player-normal-1024.png`, `player-fullscreen-1024.png` di `.tmp-e2e/<stamp>/`.

**Verifikasi aktual:** `npm run a11y` **17/17** (0 error, 7 warning reflow/target sentuh; Player 0 error/0 warning) · E2E **player-fullscreen 6/6**, **activities 14/14**, **learning-journey 11/11**, **smoke 8/8**, **mode-switch 6/6** · `npm test` **105/105** + fixture 4/4 + catalog 336/336 · `npm run build` PASS · commit `e56149f`.

**Batas (jujur):** layar penuh adalah mode di dalam jendela aplikasi, **bukan** fullscreen OS. Ruang kosong yang tersisa di layar penuh berasal dari gambar eksplorasi yang mempertahankan rasio aspek (di-center), bukan dari layout. Mode layar penuh diuji pada mode admin (sidebar) — mekanisme penyembunyian chrome sama untuk mode belajar (rail ikon), tetapi klik UI pada mode belajar belum diuji dengan layar penuh.

**Sisa:** keputusan D-UX-2/4/5/6 · utang shell `main` vs dokumen sebagai scroller (BACKLOG) · review visual guru/PO.

### Handoff Kuis untuk 88 Paket + Perbaikan Item (2026-10-27, T-094 + T-095)

**Status:** selesai dan terverifikasi. Permintaan PO: "lakukan perbaikan" atas dua hal yang sebelumnya sengaja tidak diputuskan sendiri — OD-9 (88 paket tanpa aktivitas kuis) dan item latihan yang masih `draft` karena materinya tipis.

**T-094 — kuis untuk 88 paket (commit `d9c4ac9`).**
- Sebaran: kelas 1 15 · kelas 2 14 · kelas 3 16 · kelas 4 12 · kelas 5 15 · kelas 6 16 paket.
- Tiap paket mendapat berkas `activities/activity-00N.json` bertipe multiple-choice, `activityId` = `kuis-penguatan`, 5 soal (kelas 1–2) atau 6 soal (kelas 3–6), 3 opsi per soal; lesson diperbarui (`activityIds` + `assessmentRefs`), sehingga tombol "Lanjut berlatih" pada eksplorasi kini menuju kuis.
- **499 soal baru** ditulis 6 agen penulis dari materi paket masing-masing (referensi/tujuan/eksplorasi/mencocokkan/mengurutkan), bukan dari digest ringkas.
- Alat baru `scripts/add-quiz-activity.mjs` (dry-run default, `--apply`, idempoten: paket yang sudah punya `kuis-penguatan` dilewati; menolak soal <3 atau >4 opsi, opsi duplikat, prompt berulang). Diuji kering + diterapkan pada 1 paket percobaan, divalidasi, lalu dikembalikan sebelum pemakaian massal.
- Posisi kunci disebar ulang dengan `scripts/spread-answer-positions.mjs` (deterministik): 578/559/578/163 (indeks 0/1/2/3).

**T-095 — perbaikan item bermateri tipis (commit `983bd09`).**
- 49 paket bermateri tertipis (daftar dari T-092) diaudit baca-penuh oleh 3 agen reviewer: 283 soal + 283 pasangan diperiksa terhadap materi paketnya.
- Hasil: **21 item cacat di 17 paket** — 8 soal kuis (5 pengecoh mustahil, 3 ambigu, 2 fakta di luar materi yang tumpang tindih) dan 13 pasangan (jawaban duplikat/sinonim 10, salah pasang 3).
- Semua pengganti memakai fakta yang ada di materi; jumlah item, `optionId`, dan posisi kunci tidak berubah. Satu usulan reviewer yang memperkenalkan pengecoh ambigu ("bel berbunyi" untuk "dengarkan sampai …") diganti sebelum diterapkan.
- Alat baru `scripts/apply-item-patches.mjs` (dry-run default, menolak id tak dikenal/opsi duplikat/`correctResponse` asing), data patch di `scripts/data/item-patches-kelas{12,34,56}-2026-10-27.json`.
- Reviewer menemukan **0** jawaban kuis bertentangan dengan materi dan **0** salah hitung pada 12 soal matematika yang diperiksa manual.

**Verifikasi aktual (HEAD `983bd09`):** validator **336/336 VALID** (0 issue) · volume gate "Semua aktivitas dinilai berada dalam rentang target" (tiap kelas 56 aktivitas kuis) · R5 cermin **0** / bias posisi **0** / kunci-terpanjang **0** · kedalaman minimum **10 item**, 0 paket di bawah ambang · katalog **88 entri `activityCount: 4`** · `npm test` **105/105** + fixture 4/4 + catalog 336/336 · `npm run build` PASS · `npm run a11y` **17/17** · E2E player-fullscreen 6/6, learning-journey 11/11, activities 14/14 (satu percobaan kena timeout simpan pertama — flake yang sudah tercatat di BACKLOG — lalu PASS pada percobaan berikutnya tanpa perubahan kode) · `cargo test` tidak dijalankan (tanpa perubahan Rust).

**Batas (jujur):**
1. 499 + 695 soal tetap **belum dinilai guru**; `reviewStatus` tetap `draft`. Audit ini menurunkan risiko faktual, bukan menggantikan penilaian pedagogis.
2. Sejumlah kuis memakai 4 opsi dengan pengecoh lemah (mis. PAI "Hari libur/Hari ujian"); 4 opsi sah menurut aturan, pemangkasan ke 3 opsi butuh penulisan manual — belum dikerjakan.
3. Daftar sisa paket yang perlu perhatian guru ada di BACKLOG bagian "Review guru tertunda".
4. E2E tidak menelusuri 499 soal baru satu per satu; verifikasi isi lewat audit baca-penuh 49 paket + skrip korpus.
5. Tab aktivitas kini bisa berjumlah 4 per paket; tata letak memakai `flex-wrap` sehingga baris tab bisa menjadi dua baris di layar sempit — belum ada tangkapan visual khusus untuk kasus 4 tab.

**Sisa:** review guru atas item baru · D-UX-2/4/5/6 · reviewer manusia R1–R6/R8–R9/R12 · OD-1 IPAS Fase A · blocker rilis B-01…B-08.

### Handoff Review 10 Paket Prioritas (2026-10-27, T-096)

**Status:** selesai (read-only). Permintaan PO: "review guru pada daftar prioritas di BACKLOG.md".
Ini review **agent**, bukan tanda tangan guru; `reviewStatus` seluruh paket tetap `draft`, tidak ada berkas konten yang diubah.

**Metode.** Sepuluh paket dari daftar "Masih perlu penilaian guru" dibaca penuh: berkas lesson + semua aktivitas + aset gambar.
141 item dinilai satu per satu (58 soal kuis, 58 pasangan mencocokkan, 25 langkah urutan). Setiap item dinilai terhadap materi paketnya
(eksplorasi + gambar), bukan terhadap pengetahuan umum saja.

**Putusan.** 1 perlu perbaikan (`kelas4-ipas-b01-makhluk-hidup`) · 1 perlu perbaikan kecil (`kelas6-pjok-b03-atletik`) ·
7 layak dengan catatan · 1 layak tanpa catatan (`kelas6-pai-b07-sejarah-islam`). Tidak ada jawaban salah atau salah hitung.

**Temuan yang butuh tindakan:**
- F-01 `kelas4-ipas-b01-makhluk-hidup`: ilustrasi tidak memuat katak/capung, tetapi eksplorasi langkah 1, `altText` aset, 2 pasangan, dan 1 soal menyebut keduanya. Dua jalur perbaikan (teks menyesuaikan gambar / gambar dibuat ulang) ada di laporan.
- F-02 jawaban singkat dinilai persis satu string (`src/content/quiz.ts:33`) — 4 paket / 24 soal. Empat prompt terbuka hanya menerima satu kata kunci; jawaban benar lain dihukum. Perbaikan akar: mesin penilai menerima daftar jawaban + normalisasi angka/kata.
- F-03 "Benda tak hidup pada gambar" punya dua jawaban sah (batu dan air).
- F-04 `kelas6-pjok-b03-atletik`: langkah urutan ke-5 "Merapikan posisi" adalah pengisi untuk memenuhi ambang 5 langkah.

**Temuan struktural (bukan cacat jawaban):**
- F-05 37 pasangan di 27 paket memakai teks soal sebagai sisi kiri, elipsis ikut tertinggal — **DIPERBAIKI 2026-10-28 (T-099)**, total 39 pasangan.
- F-06 311/1.963 pasangan (15,8%) di 159 paket masih dapat dicocokkan dengan menyalin jawaban yang sudah tertulis di layar eksplorasi; detektor R5 lama melaporkan 0 karena mensyaratkan prompt identik — **DIPUTUSKAN 2026-10-28 (T-100): utang desain + aturan authoring + seleksi guru**; diukur ulang 309 pasangan / 160 paket.
- F-07 utang "10 paket kunci selalu opsi terpanjang" **ditutup**: 0 paket dengan terpanjang-unik; 6 paket hanya seri panjang pada opsi angka (matematika).

**Verifikasi aktual:** validator **336/336 VALID**, 0 issue, 336 warning (draft) — dijalankan ulang setelah review, konten tidak berubah ·
tidak ada test/build lain yang dijalankan karena tidak ada perubahan kode maupun konten · `cargo test` tidak dijalankan.

**Sisa:** keputusan PO atas F-01/F-02 (F-03 + F-04 diterapkan pada T-097) · tanda tangan guru manusia · D-UX-2/4/5/6 · reviewer manusia R1–R6/R8–R9/R12 · OD-1 IPAS Fase A · blocker rilis B-01…B-08.

### Handoff Perbaikan F-03/F-04 (2026-10-27, T-097)

**Status:** diterapkan + diverifikasi. Permintaan PO: "lanjut kerjakan F-03 dan F-04" — hanya dua temuan itu; F-01 dan F-02 **tidak** disentuh.

**Perubahan konten (4 berkas):**
- `kelas4-ipas-b01-makhluk-hidup/activities/activity-003.json` — prompt soal-3 → "Benda tak hidup yang ada di tepi kolam pada gambar adalah ..." (kunci `batu` tetap). Wording dipilih karena usul awal "keras dan padat" masih cocok untuk pensil/buku/tiang bendera/bangunan pada gambar.
- `kelas6-pjok-b03-atletik/activities/activity-002.json` — item ke-5 `langkah-rapi`/"Merapikan posisi" → `langkah-keluar-bak`/"Keluar dari bak lompat"; `correctOrder` disesuaikan.
- `kelas6-pjok-b03-atletik/activities/activity-001.json` — reveal langkah "Apa urutan lompat jauh?" memuat langkah keluar bak.
- `kelas6-pjok-b03-atletik/activities/activity-003.json` — `pasangan-2` kanan memuat urutan yang sama.

Jumlah item, optionId, pasangan, dan posisi kunci tidak berubah. `scripts/apply-item-patches.mjs` tidak dipakai karena hanya mendukung `quiz`/`matching`; suntingan ordering/short-answer dilakukan langsung lalu diverifikasi `git diff`.

**Verifikasi aktual:** validator per direktori **336/336 VALID, 0 issue, 336 warning (draft)** · `check-practice-volume.mjs` "Semua aktivitas dinilai berada dalam rentang target" · `npm test` → `Tests 105 passed (105)`, `4/4 fixture cocok dengan expected`, `catalog-index OK: 336 entri, 336 paket`. `npm run build`, a11y, E2E, dan `cargo test` tidak dijalankan (tidak ada perubahan kode/UI).

**Sisa:** tanda tangan guru manusia (termasuk persetujuan atas solusi F-01 dan kecukupan daftar varian F-02) · D-UX-2/4/5/6 · reviewer manusia R1–R6/R8–R9/R12 · OD-1 IPAS Fase A · blocker rilis B-01…B-08.

### Handoff Perbaikan F-01/F-02 (2026-10-27, T-098)

**Status:** diterapkan + diverifikasi. Permintaan PO: "lanjut kerjakan F-01 dan F-02". Dua jalur dipilih tanpa menunggu keputusan tambahan: F-01 **teks menyesuaikan gambar** (tanpa kerja aset Flow), F-02 **perbaikan akar di mesin penilai** (bukan mengubah empat soal terbuka menjadi pilihan ganda).

**F-01 — `kelas4-ipas-b01-makhluk-hidup` (4 berkas):**
- `activity-001.json` langkah 1 reveal → "Ikan, siput, kupu-kupu, dan tumbuhan air."; 5 `altText` langkah + `accessibilityMetadata` → "Dua siswa mengamati kolam dengan ikan, siput di atas batu, kupu-kupu, dan teratai."
- `activity-002.json` `pasangan-1` Katak → **Siput / Merayap di atas batu**; `pasangan-3` Capung → **Kupu-kupu / Terbang menghisap madu bunga**; `accessibilityMetadata` diperbaiki.
- `activity-003.json` soal `soal-capung-bernapas-dengan` → **`soal-kupu-kupu-bernapas-dengan`** / "Kupu-kupu bernapas dengan ..." (kunci `trakea` tetap); `accessibilityMetadata` diperbaiki.
- `lessons/lesson-001.json` `altText` diperbaiki. Grep akhir: **0 sisa kata "katak"/"capung"** di paket ini.
- Jumlah langkah (5), pasangan (6), soal (6) tidak berubah.

**F-02 — mesin penilai + data:**
- `src/content/quiz.ts`: soal `text` menerima `correctResponse` string **atau** array; normalisasi NFKC + huruf kecil + buang tanda baca + rapatkan spasi (garis miring dipertahankan agar `1/4` tidak berubah). Jawaban kosong/whitespace tetap salah. Soal boolean/single-choice/multi tidak berubah.
- Data alternatif: 14 soal di 4 paket — IPAS 2 (ciri makhluk hidup, peran tumbuhan), Bahasa Indonesia 5, Pancasila 2 (sila 4/5 + kata), Matematika 5 (nilai tempat/nilai angka). 10 soal lain tetap satu kunci karena memang satu jawaban.
- `src/content/__tests__/quiz.test.ts`: +5 test (daftar jawaban, varian angka/kata, tanda baca/spasi, angka bertitik `12.354` vs `12354`, penolakan jawaban non-teks).

**Verifikasi aktual:** validator seluruh korpus **336/336 VALID, 0 issue, 336 warning (draft)** · `check-practice-volume.mjs` "Semua aktivitas dinilai berada dalam rentang target" · `npm test` → `Tests 110 passed (110)` (15 berkas), `4/4 fixture cocok dengan expected`, `catalog-index OK: 336 entri, 336 paket` · `npm run build` **PASS** (`tsc --noEmit` + vite).

**E2E:** `npm run e2e:activities` **PASS** — 14 pemeriksaan (dijalankan setelah aplikasi desktop ditutup, artefak `.tmp-e2e/2026-10-27T20-24-54-673Z`). Skenario memakai paket fixture sendiri dan memeriksa jalur jawaban singkat ("dinilai 100 (normalisasi huruf)"), jadi normalisasi baru terbukti lewat unit test, bukan lewat teks IPAS yang disunting.

**Tidak dijalankan:** a11y, E2E lain, dan `cargo test` (tidak ada perubahan Rust).

**Sisa:** guru perlu menyetujui solusi F-01 (teks menyesuaikan gambar) dan memastikan daftar varian F-02 memadai · tanda tangan guru manusia · D-UX-2/4/5/6 · reviewer manusia R1–R6/R8–R9/R12 · OD-1 IPAS Fase A · blocker rilis B-01…B-08.

### Handoff Perbaikan F-05 — 39 Pasangan Mencocokkan (2026-10-28, T-099)

**Status:** diterapkan + diverifikasi. Permintaan PO: "lanjut ke backlog berikutnya" — item terpilih **F-05** dari laporan review 10 paket prioritas.

**Masalah:** 37 pasangan `matching` di 27 paket memakai teks soal kuis sebagai sisi kiri dan membawa elipsis (`...`) yang tidak berfungsi sebagai petunjuk di kartu mencocokkan. Dua pasangan tambahan ditemukan saat audit aktivitas yang sama: kartu jawabannya duplikat dengan pasangan lain (`kelas1-seni-rupa-b05-mewarnai-bentuk`, `kelas6-matematika-b03-rasio-proporsi`) sehingga siswa tidak bisa membedakan pasangan mana yang dimaksud.

**Perubahan:** 39 pasangan di 27 paket, semuanya `activity-003.json`. Contoh:
- `kelas1-bahasa-indonesia-b02-membaca-kata`: "Bunyi awal kata bola adalah ..." → "Huruf pertama pada kata bola".
- `kelas3-pendidikan-pancasila-b06-nkri`: "Bahasa persatuan Indonesia adalah ..." → "Alat pemersatu bangsa".
- `kelas5-ipas-b07-energi-listrik`: "Mencabut alat listrik yang tidak dipakai termasuk ..." → "Bahan yang dapat menghantarkan listrik" (kuis: logam).
- `kelas5-pendidikan-pancasila-b04-musyawarah-demokrasi`: tiga pasangan memakai urutan langkah ("Langkah pertama dalam musyawarah" → "Menyampaikan masalah", dst.).
- Duplikat: `kelas1-seni-rupa-b05` pasangan-1 → "Langkah pertama sebelum mewarnai" / "Menyiapkan alat"; `kelas6-matematika-b03` pasangan terakhir → "Rasio 10 : 5 sama dengan" / "2 : 1".

Setiap pengganti diambil dari langkah eksplorasi, petunjuk, urutan langkah, atau opsi kuis paket itu sendiri. Jumlah pasangan tidak berubah (**1.963** di korpus); tidak ada `pairId` ditambah/dihapus; semua item tetap `reviewStatus: draft`.

**Alat & bukti:** `scripts/apply-item-patches.mjs` (dry-run lalu `--apply`). Patch: `scripts/data/item-patches-2026-10-28-f05.json` (27 paket / 39 pasangan) dan `scripts/data/item-patches-2026-10-28-f05b.json` (2 koreksi wording setelah audit grounding: `kelas1-pai-b06` "Sikap malaikat terhadap Allah" / "Selalu taat"; `kelas5-ppkn-b08` "Langkah sesudah menyusun rencana proyek" / "Membagi tugas", menggantikan "Bersama" yang tidak berbasis materi).

**Verifikasi aktual:** detektor elipsis ulang → **0/1.963** · pemeriksa duplikat kiri/kanan pada 27 paket terdampak → **0** · validator per direktori **336/336 VALID** (0 issue, 336 warning draft) · `check-practice-volume.mjs` "Semua aktivitas dinilai berada dalam rentang target" · `npm test` → `Tests 110 passed (110)` (15 berkas), `4/4 fixture cocok dengan expected`, `catalog-index OK: 336 entri, 336 paket` · `npm run build` **PASS**.

**Tidak dijalankan:** a11y, E2E, dan `cargo test` — perubahan hanya teks data matching, tanpa perubahan kode/UI/Rust. Skenario `activities` juga memakai paket fixture sendiri sehingga tidak akan merender 27 paket yang disunting.

**Sisa:** seleksi guru atas **309 pasangan F-06** (daftar CSV) · tanda tangan guru manusia atas 550 pasangan hasil aturan + 119 override + 39 perubahan F-05 · D-UX-2/4/5/6 · reviewer manusia R1–R6/R8–R9/R12 · OD-1 IPAS Fase A · blocker rilis B-01…B-08.

### Handoff Alat QA — Tanggal Terparameterkan + Detektor F-06 di Skrip Baku (2026-10-28, T-101)

**Status:** selesai dan terverifikasi. Permintaan PO: "lanjutkan" setelah keputusan F-06.

**Masalah:** `scripts/pedagogical-prereview.mjs` dan `scripts/review-content.ts` menulis ke nama bertanggal tetap `2026-10-26`, sehingga menjalankannya kembali akan menimpa bukti historis — alat tidak bisa dipakai untuk memverifikasi perbaikan setelah tanggal itu. Detektor F-06 (longgar) hanya hidup di skrip sekali-pakai, sementara detektor R5 baku tetap memakai kesamaan ketat dan melaporkan 0.

**Yang diubah (kode saja, tidak ada konten yang disentuh):**
- `scripts/lib/reviewOutput.mjs` — `parseReviewArgs` (`--date YYYY-MM-DD` tervalidasi, default tanggal lokal hari ini; `--out-dir`; `--force`; argumen tak dikenal ditolak), `localDateStamp`, `ensureWritable` (menolak menimpa berkas yang sudah ada kecuali `--force`, sekaligus membuat direktori keluaran).
- `scripts/lib/mirrorPairs.mjs` — `detectExplorationCopies`: `right` = `reveal` (NFKC, huruf kecil, tanda baca → spasi) dan `min(|L∩P|/|L|, |L∩P|/|P|) ≥ 0,70` terhadap `prompt` langkah yang sama; token = kata ≥3 karakter setelah tanda baca tepi dibuang, memakai langkah pertama yang reveal-nya cocok. Aturan token disamakan dengan pengukuran T-100 agar angkanya identik.
- `pedagogical-prereview.mjs` — semua nama berkas/judul/tautan memakai `--date`; paket draft dihitung dinamis (bukan "320"); metrik `explorationCopies` masuk JSON + CSV dan tampil sebagai **metrik informasi** di bagian R5 (bukan flag, karena flag R5 sengaja hanya sinyal deterministik).
- `review-content.ts` — tanggal pada judul/status/tautan + `--out-dir`/`--force` memakai lib yang sama; angka paket diambil dari `summary.total`.

**Bukti reproduksi:** `node scripts/pedagogical-prereview.mjs --out-dir .tmp-assets/prereview-check --date 2026-10-28` → 336 paket, `explorationCopies {pairs: 309, packages: 160}`; 309 baris JSON (`packageId + aktivitas + pairId + wordOverlap`) **identik** dengan `F06_MIRROR_PAIRS_2026-10-28.csv` (0 hilang, 0 tambahan). `npx tsx scripts/review-content.ts --out-dir .tmp-assets/review-check --date 2026-10-28` → 336 paket, VALID 336/336.

**Verifikasi:** penjagaan timpa diuji pada kedua skrip (tanpa `--force` exit 1 dengan daftar berkas; `--force` exit 0) · `npm test` 110/110 + fixture 4/4 + katalog 336/336 · `npm run build` PASS · `npx tsc --noEmit` exit 0. a11y/E2E/`cargo test` **tidak dijalankan** (tanpa perubahan UI/Rust); bukti historis `2026-10-26` tidak ditulis ulang.

**Sisa:** ~~`scripts/analyze-content-quality.mjs` masih memakai path bertanggal tetap `QUALITY_GAP_2026-10-25.*`~~ **DITUTUP 2026-10-28 (T-102)** · seleksi + tanda tangan guru atas 309 pasangan F-06 · D-UX-2/4/5/6 · reviewer manusia R1–R6/R8–R9/R12 · OD-1 IPAS Fase A · blocker rilis B-01…B-08. `reviewStatus` tetap `draft`.

### Handoff Alat QA — Analisis Gap Kualitas Bertanggal (2026-10-28, T-102)

**Status:** selesai dan terverifikasi. Permintaan PO: "lanjutkan" setelah T-101.

**Masalah:** `scripts/analyze-content-quality.mjs` (npm `content:quality-gap`) masih menulis ke `QUALITY_GAP_2026-10-25.*` dan memuat kalimat mati yang tidak lagi benar ("pembacaan 320 paket", "semua paket 3 langkah/2 aktivitas/4–6 item"). Menjalankannya hari ini akan menimpa bukti 2026-10-25 sekaligus mencetak klaim palsu.

**Yang diubah:**
- Path keluaran memakai lib bersama: `--date YYYY-MM-DD` (default hari ini), `--out-dir`, `--force`; `ensureWritable` menolak menimpa berkas bertanggal.
- Kalimat mati diganti nilai terhitung: judul + status memakai `date`/`total`; klaim kedalaman menjadi "Paket yang memenuhi G1–G3 … `${depthCompliant}/${total}`"; JSON menambah `generatedAt`; skrip mencetak path laporan.
- **Koreksi detektor G11:** `optionDuplicates` dulu membandingkan opsi **tanpa** membedakan kapitalisasi per soal sehingga menandai `kelas1-bahasa-indonesia-b05-membaca-kalimat` sebagai duplikat — padahal soal itu justru menguji kapitalisasi ("budi bermain bola" vs "Budi bermain bola."). Kini duplikat = teks **persis**; opsi yang hanya berbeda kapitalisasi dilaporkan terpisah sebagai catatan, bukan kegagalan.

**Verifikasi:** `node scripts/analyze-content-quality.mjs --out-dir .tmp-assets/quality-check --date 2026-10-28` → 336 paket (`report` + `gap` tercetak) · menjalankan ulang tanpa `--force` → **exit 1** dengan daftar `QUALITY_GAP_2026-10-28.md` + `quality-gap-2026-10-28.json`; `--force` → exit 0 · `npm test` 110/110 (15 berkas) + fixture 4/4 + katalog 336/336. Bukti historis `QUALITY_GAP_2026-10-25.*` tidak tersentuh; a11y/E2E/`cargo test`/build tidak dijalankan (hanya skrip `.mjs` yang berubah, di luar `tsconfig` `src` dan suite).

**Temuan sampingan dari eksekusi (informasi, bukan approval):** G1/G2/G3/G5/G6/G7/G8/G9/G11/G12 = 336/336; G4 (tujuan tercakup penuh) 295/336 (41 sebagian, 0 nol); G10 (sudah direview manusia) 0/336 karena semua paket `draft`; duplikasi persis 0 grup; aktivitas identik 0 grup; 336 hash aset unik. Satu catatan kapitalisasi: `kelas1-bahasa-indonesia-b05-membaca-kalimat`. **Konsekuensi:** angka G11 pada laporan 2026-10-25 (319/320) adalah positif palsu; laporan itu tidak ditulis ulang karena merupakan bukti historis.

**Sisa:** seleksi + tanda tangan guru (309 F-06 · 550 hasil aturan · 119 override · 39 F-05 · F-01/F-02) · D-UX-2/4/5/6 · reviewer manusia R1–R6/R8–R9/R12 · OD-1 IPAS Fase A · blocker rilis B-01…B-08. `reviewStatus` tetap `draft`.

### Handoff Keputusan F-06 — Utang Desain + Aturan Authoring (2026-10-28, T-100)

**Status:** diputuskan + didokumentasikan. Permintaan PO: "lanjut" setelah F-05. Pilihan arah dari PO: **"Aturan + seleksi guru"** — **bukan** penulisan ulang massal 309 pasangan.

**Masalah:** 309 pasangan (dari 1.963) di 160 paket masih dapat dicocokkan dengan menyalin jawaban yang sudah tertulis di layar eksplorasi: `right` sama dengan `reveal` langkah dan sisi kiri ≥70% kata `prompt` langkah itu. Laporan awal mencatat 311/159; pengukuran ulang dengan definisi yang sama (normalisasi huruf/tanda baca, token ≥3 huruf, `min` tumpang tindih dua arah) menghasilkan **309/160** — selisih kecil, tidak ditelusuri penyebabnya satu per satu.

**Kenapa tidak ditulis ulang:** pasangan ini adalah keluaran transform T-091b (soal → frasa petunjuk). Parafrase mekanis berikutnya hanya menurunkan angka detektor tanpa menambah tuntutan pemahaman — risiko yang sudah dinyatakan saat T-091b. Petunjuk mana yang benar-benar membingungkan adalah penilaian guru.

**Yang ditetapkan:**
- **Aturan authoring (mengikat, batch konten berikutnya):** (1) sisi kiri berupa petunjuk, tumpang tindih kata terhadap `prompt` eksplorasi **<70%**; (2) sisi kiri tidak memuat kata kunci jawaban atau sinonim dekatnya; (3) sisi kanan boleh sama dengan `reveal`, yang dilarang adalah kombinasi itu dengan sisi kiri ≥70%; (4) tiap batch diverifikasi dengan definisi §5 laporan, target 0 hit baru.
- **Daftar seleksi guru:** `knowledge/content/F06_MIRROR_PAIRS_2026-10-28.csv` — 309 baris (`packageId, activity, pairId, left, right, explorationPrompt, wordOverlap`), diurutkan per paket. Guru cukup menandai pasangan yang perlu ditulis ulang, bukan menilai ulang 1.963 pasangan.
- **Angka pendukung:** 84 pasangan bertumpang tindih **100%** kata prompt (salinan paling telanjang); 40 paket memuat ≥3 pasangan.

**Bukti & alat:** pengukuran memakai skrip sekali-pakai `.tmp-assets/r5-focused.json` (semantik detektor laporan §5); CSV diturunkan dari berkas itu. Laporan [REVIEW_REPORT_2026-10-27_GURU_PRIORITAS_10.md](../content/REVIEW_REPORT_2026-10-27_GURU_PRIORITAS_10.md) §F-06 + §5 ditambah blok keputusan dan anotasi pengukuran ulang; BACKLOG mencatat keputusan + aturan + butir seleksi guru.

**Verifikasi:** CSV 309 baris data + header, 160 `packageId` unik. Tidak ada berkas konten/kode yang berubah, jadi validator, `npm test`, build, a11y, E2E, dan `cargo test` **tidak dijalankan ulang**; angka terakhir tetap dari T-099 (336/336 VALID, 110/110, build PASS).

**Sisa:** ~~detektor R5 baku masih memakai kesamaan ketat sehingga melaporkan 0 untuk kelas ini — mempromosikan detektor longgar ke skrip baku masih utang alat~~ **DITUTUP 2026-10-28 (T-101)**: detektor longgar ada di `scripts/lib/mirrorPairs.mjs` dan dipakai skrip baku · seleksi + tanda tangan guru · D-UX-2/4/5/6 · reviewer manusia R1–R6/R8–R9/R12 · OD-1 IPAS Fase A · blocker rilis B-01…B-08. `reviewStatus` tetap `draft`.

### Handoff Deep Link Player (2026-10-28, T-103)

**Status:** selesai dan terverifikasi. Permintaan PO: "lanjutkan" (butir 1 daftar agent-actionable).

**Masalah:** seleksi materi hanya hidup di memori proses (`playbackSelection`), sedangkan hash hanya berisi nama layar (`#player`). Memuat ulang di layar Player karena itu kembali ke paket pertama, dan tautan/riwayat tidak bisa menunjuk materi tertentu.

**Yang diubah:**
- [playbackSelection.ts](../../src/state/playbackSelection.ts) — `buildPlayerHash` (`#player/<encodeURIComponent(packageId)>[/<lessonId>]`) dan `parsePlayerHash` (menolak layar lain, segmen ekstra, id kosong, `decodeURIComponent` yang gagal); pembacaan tetap idempoten (pelajaran T-084).
- [App.tsx](../../src/App.tsx) — `initialScreen()` memulihkan `setPlaybackSelection` dari hash sebelum layar ditentukan; `navigate()` menulis deep link bila tujuan `player` dan seleksi diketahui, selain itu tetap `#<screen>`.
- [LessonPlayer.tsx](../../src/screens/LessonPlayer.tsx) — effect penyelaras seleksi + hash: `state.lessonId` kosong memakai lesson pertama paket, paket tak dikenal jatuh ke paket pertama lalu hash ditulis ulang, dan pergantian paket di dalam Player tidak meninggalkan URL lama.
- [playbackSelection.test.ts](../../src/state/playbackSelection.test.ts) — 4 test baru: format hash, round-trip (termasuk hash berawalan `#/`), paket tanpa lesson, dan hash tidak sah (`""`, `#home`, `#player`, `#player/`, `#player/a/b/c`, `#player/%E0%A4%A`).
- [player-deeplink.mjs](../../scripts/e2e/scenarios/player-deeplink.mjs) + npm `e2e:deeplink`.

**Verifikasi aktual:** `npm test` **114/114** (15 berkas) + fixture 4/4 + katalog 336/336 · `npm run build` exit 0 (`tsc --noEmit` + Vite) · E2E `player-deeplink` **7/7** · regresi E2E `home-catalog` 28/28 dan `learning-journey` 11/11 (dijalankan setelah perubahan, bukan diasumsikan) · `npm run a11y` **17/17** (0 error, 7 warning) pada dua percobaan berturut-turut — setelah 4 percobaan gagal dengan dua gejala berbeda (lihat baris verifikasi di atas dan utang teknis di BACKLOG) · `cargo test` tidak dijalankan (tanpa perubahan Rust).

**Diagnostik harness (bagian dari T-103):** [cdp.mjs](../../scripts/e2e/cdp.mjs) kini meneruskan event CDP (`page.on(...)`) dan [run.mjs](../../scripts/e2e/run.mjs) merekam `Runtime.consoleAPICalled`/`Runtime.exceptionThrown` ke `result.json` serta mencetaknya saat gagal; langkah simpan kuis di [a11y.mjs](../../scripts/e2e/scenarios/a11y.mjs) mencatat riwayat teks banner. Tanpa ini, "Timeout menunggu penyimpanan hasil kuis" tidak dapat dibedakan antara simpan lambat, simpan gagal, dan banner yang tertimpa.

**Batasan jujur:**
1. Hash tidak memuat `version`, jadi dua versi paket yang sama tidak dapat dibedakan lewat URL — `loadManagedPackage` mencari per `packageId` dan versi aktif menang.
2. Aplikasi tetap memakai `replaceState` (tanpa entri riwayat baru), jadi tombol Back browser tidak berubah perilakunya.
3. **a11y tidak lulus pada 4 percobaan pertama** (3× timeout simpan kuis, 1× halaman blank) dan lulus 2× sesudahnya. Bukti yang berhasil dikumpulkan: tidak ada exception/konsol error, skor 100 tampil, tetapi banner tetap "Penyimpanan lokal siap…" dan "Menyimpan hasil belajar…" tidak pernah muncul — jadi simpan **tidak pernah dimulai** pada percobaan yang gagal. Akar masalah **belum terbukti**; dugaan (belum diverifikasi) adalah effect sesi `[contentPackage, lesson.lessonId]` berjalan ulang dan menimpa status banner, atau panggilan `getOrStartSession` terganggu beban mesin saat 4–6 proses WebView2/Node aktif bersamaan. Tidak ada perubahan kode T-103 yang menyentuh jalur penyimpanan.

**Sisa:** boot flicker shell admin sebelum preferensi `appMode` terbaca · kontainer gulir shell `main#main-content` tidak pernah menggulir · diagnosis timeout tulis-pertama 30 dtk pada E2E · G4 41 paket (tujuan belum tercakup penuh) · daftar prasyarat manusia (seleksi + tanda tangan guru 309 F-06 / 550 hasil aturan / 119 override / 39 F-05, reviewer R1–R6/R8–R9/R12, CP/ATP per bab, OD-1 IPAS Fase A, D-UX-2/4/5/6) · blocker rilis B-01…B-08. `reviewStatus` tetap `draft`.

### Handoff Ikatan Putusan Review ke Isi + Sampling Audit (2026-10-28, T-104)

**Status:** selesai dan terverifikasi. Permintaan PO: "ya, kerjakan L2 + L4" — lapisan 2 (ikatan bukti) dan lapisan 4 (sampling) dari usulan validasi keputusan manusia.

**Masalah yang ditutup:** catatan review hanya terikat ke `package_id + version`. Setelah isi paket disunting (F-01…F-05 mengubah teks), putusan lama tetap tampak sah. Selain itu tidak ada cara memeriksa ulang sampel putusan secara berkala.

**Yang diubah:**
- [0007_content_review_binding.sql](../../src-tauri/src/migrations/0007_content_review_binding.sql) + [db.rs](../../src-tauri/src/db.rs) — kolom `content_sha256` dan `rubric_version` pada `content_reviews`; baris lama dibiarkan `NULL`.
- [review.rs](../../src-tauri/src/review.rs) — `RUBRIC_VERSION = "1"`; `ReviewView`/`RecordReviewInput` membawa digest; `review_record` **setelah** cek peran guru menolak digest yang bukan 64 heksadesimal dan menyimpan versi dalam huruf kecil; `review_list`/`find_review` mengembalikan kedua kolom; ekspor CSV menambah `content_sha256`,`rubric_version`.
- [packageDigest.ts](../../src/content/packageDigest.ts) — JSON kanonik (kunci diurut rekursif, `reviewStatus`/`releaseState`/`signature` dibuang, lesson diurut `lessonId`, aktivitas diurut `activityId`) + SHA-256 via `crypto.subtle`. **Dihitung atas objek hasil validasi**, bukan JSON mentah, karena schema Zod menyisipkan default (`assets: []`, `runtimeCapabilities: []`).
- [reviewDigest.ts](../../src/data/reviewDigest.ts) — menyelesaikan digest untuk paket bawaan (`loadContentPackages`) dan paket impor (`getPackage` + `validateContentPackage`); isi yang tidak lolos validasi tidak menghasilkan digest (dan karenanya tidak bisa di-approve).
- [ContentScreen.tsx](../../src/screens/ContentScreen.tsx) — form review menghitung digest sebelum memanggil `review_record`, dan pesan sukses menyebut 8 karakter pertama digest.
- [scripts/lib/reviewAttestation.ts](../../scripts/lib/reviewAttestation.ts) — pembaca CSV attestation (BOM/CRLF/kutip), pemindai 336 paket repo (digest + status review + volume item), pembaca folder `knowledge/content/review-attestations/`.
- [check-review-binding.ts](../../scripts/check-review-binding.ts) (npm `content:review-binding`, ikut `npm test`) — menolak approved tanpa digest sah, paket tak dikenal, isi tak tervalidasi, digest ≠ isi sekarang, dan paket non-`draft` tanpa putusan terikat.
- [sample-approved-reviews.ts](../../scripts/sample-approved-reviews.ts) (npm `content:review-sample`) — sampling deterministik `sha256("<benih>|<packageId>@<version>")`, `--n` (default 5), `--seed` (default tanggal Jakarta), `--out`; cetak reviewer/tanggal/catatan, status sidik jari, berkas lesson/aktivitas, volume item, dan checklist R1–R12; exit 1 bila ada digest menyimpang.

**Verifikasi aktual:** `npm test` **120/120** (16 berkas) + fixture 4/4 + katalog 336/336 + `content:review-binding` PASS · `cargo test` **71/71** · `npm run build` exit 0 · E2E `content-review` **9/9** (dijalankan pada build yang baru dikompilasi; percobaan pertama gagal karena kompilasi Rust 2m47s melewati batas tunggu harness, bukan kegagalan aplikasi) · screenshot `content-review.png` diperiksa. Uji manual alat dengan CSV sintetis di `%TEMP%`: binding exit 1 saat satu digest tidak cocok, exit 0 tanpa attestation; sampler memilih 3/3 paket dan menandai baris yang menyimpang.

**Cara pakai untuk reviewer manusia:**
1. Ekspor audit dari layar Konten & Pembaruan (`review_export_csv`) → simpan ke `knowledge/content/review-attestations/<tanggal>.csv`.
2. `npm run content:review-binding` — gagal berarti ada putusan yang tidak lagi cocok dengan isi.
3. `npm run content:review-sample -- --n 5` — sampel putusan untuk diperiksa ulang guru; checklist R1–R12 diisi manusia, bukan agent.

**Batasan jujur:**
1. **Belum tamper-proof.** Digest dihitung di klien; aplikasi yang dimodifikasi dapat mengirim digest palsu. Rust hanya memvalidasi bentuk, bukan kebenaran isi (tidak ada akses ke isi paket bawaan). Penutupnya adalah lapisan 3 (tanda tangan Ed25519 atas putusan) yang **belum** dikerjakan.
2. **Identitas reviewer tetap lokal dan diisi sendiri** — nama tampilan profil guru, bukan akun terverifikasi.
3. Attestation adalah CSV biasa di dalam repo; tidak ada segel kriptografis, hanya keterlacakan lewat git.
4. Baris review lama (sebelum migrasi 0007) tidak punya digest, sehingga tidak dapat dipakai sebagai bukti untuk isi sekarang — dihitung gagal oleh checker, sesuai maksud.

**Sisa:** lapisan 3 (tanda tangan putusan) · penunjukan reviewer manusia + pengisian R1–R12 · seleksi + tanda tangan guru 309 F-06 / 550 hasil aturan / 119 override / 39 F-05 · D-UX-2/4/5/6 · CP/ATP per bab · OD-1 IPAS Fase A · boot flicker · kontainer gulir shell · diagnosis timeout tulis-pertama E2E · blocker rilis B-01…B-08. `reviewStatus` tetap `draft`.

### Handoff Hierarki Tombol Aktivitas Eksplorasi (2026-10-28, T-105)

**Status:** selesai dan terverifikasi. Permintaan PO: "rapihkan tombol tombol itu di player, bekerjalah sebagai ux ui designer" (dengan tangkapan layar langkah eksplorasi).

**Masalah desain yang ditutup:** pada satu langkah eksplorasi ada empat tombol dengan dua di antaranya **bergaya primer (biru)** — `Tampilkan penjelasan` persis seperti `Lanjut` — sehingga dua aksi bersaing dan mata tidak tahu mana yang mengakhiri langkah; `Lihat petunjuk` dan `Sebelumnya` memakai gaya berbeda tanpa pola, dan tidak ada batas antara tombol bantuan dengan navigasi.

**Yang diubah:**
- [ExplorationActivity.tsx](../../src/components/content/ExplorationActivity.tsx) — petunjuk + penjelasan menjadi **satu baris tombol sekunder** (`mt-5 flex flex-wrap items-center gap-2`, `px-4`, status tertekan `border-primary/40 bg-primary/5 text-ink`, idle `border-ink/15 bg-surface hover:bg-paper`); panel bantuan tetap muncul di bawah tombolnya; navigasi pindah ke **footer bergaris** (`mt-6 … border-t border-ink/10 pt-5`) dengan `Sebelumnya` sekunder di kiri (nonaktif di langkah pertama) dan **satu** tombol primer `Lanjut`/`Selesai` (`px-6`, `hover:bg-primary/90`) di kanan; panel selesai disamakan (`Ulangi eksplorasi` sekunder, `Lanjut berlatih` primer).
- [ExplorationActivity.tsx](../../src/components/content/ExplorationActivity.tsx) — aksesibilitas: `aria-controls` tiap tombol bantuan menunjuk id panel dinamis (`exploration-hint-<activityId>` / `exploration-reveal-<activityId>`), dan keempat tombol eksplorasi mendapat `focus-visible:ring-2 ring-primary/50` (tombol primer ditambah `ring-offset-2`) di samping outline global.
- [learning-journey.mjs](../../scripts/e2e/scenarios/learning-journey.mjs) — 9 asersi tata letak + 2 asersi `aria-controls`, dan artefak `exploration-buttons.png` (digulir ke baris kontrol sebelum ditangkap).

**Prinsip UX yang dipakai:** satu aksi primer per langkah (sisanya sekunder) · kelompokkan aksi sejenis (bantuan bersama bantuan, navigasi bersama navigasi) · pisahkan kelompok dengan garis, bukan dengan warna tambahan · status tertekan harus terbaca tanpa mengubah bobot visual tombol.

**Verifikasi aktual:** `npm test` **120/120** (16 berkas) + fixture 4/4 + katalog 336/336 + binding PASS · `npm run build` exit 0 · E2E `learning-journey` **14/14** (11 → 14) · regresi `activities` **14/14** dan `player-deeplink` **7/7** · `npm run a11y` **17/17** (0 error, 7 warning) pada percobaan pertama · `cargo test` tidak dijalankan (tanpa perubahan Rust) · screenshot `exploration-buttons.png` diperiksa mata: prompt → dua tombol sekunder sebaris → panel petunjuk + penjelasan → garis → `Sebelumnya` nonaktif + `Lanjut` biru.

**Batasan jujur:**
1. Belum ada komponen `Button` bersama; gaya masih kelas Tailwind inline, jadi hierarki ini belum dijamin konsisten di layar lain (utang teknis, lihat BACKLOG).
2. Gambar eksplorasi `max-h-[60vh]` membuat kontrol berada di bawah lipatan pada jendela 1600×900 ketika gambar tinggi — bukan bagian T-105, tetapi terlihat saat verifikasi.
3. Uji visual khusus 320 px untuk footer ini belum ada; yang terbukti hanya reflow 640/320 tanpa error.

**Sisa:** komponen tombol bersama · pratinjau 320 px footer eksplorasi · daftar prasyarat manusia (seleksi + tanda tangan guru 309 F-06 / 550 hasil aturan / 119 override / 39 F-05, reviewer R1–R6/R8–R9/R12, CP/ATP per bab, OD-1 IPAS Fase A, D-UX-2/4/5/6) · tanda tangan putusan (L3) · boot flicker · kontainer gulir shell · diagnosis timeout tulis-pertama E2E · blocker rilis B-01…B-08. `reviewStatus` tetap `draft`.

### Handoff Sematan Materi di Beranda (2026-10-28, T-106)

**Status:** selesai dan terverifikasi. Permintaan PO: "saya ingin ada fitur pinned materi, jika dipinned akan muncul di halaman home, dan ini jadi tampilan default di home, jadi ada pilihan pinned materi, materi tersedia dan jelajahi materi".

**Keputusan produk:** sematan disimpan **per profil siswa** di SQLite, bukan per perangkat, karena perangkat dipakai bergantian oleh beberapa siswa — preferensi perangkat akan membuat sematan satu siswa muncul di Beranda siswa lain.

**Yang diubah:**
- [0008_pinned_lessons.sql](../../src-tauri/src/migrations/0008_pinned_lessons.sql) + [db.rs](../../src-tauri/src/db.rs) — tabel `pinned_lessons` dengan PK `(profile_id, package_id, lesson_id)`, `FOREIGN KEY (profile_id) … ON DELETE CASCADE`, indeks `(profile_id, pinned_at DESC)`; migrasi terdaftar sebagai versi 8 (checksum SHA-256 tetap ditegakkan).
- [pins.rs](../../src-tauri/src/pins.rs) — `MAX_PINNED = 24`; `list_pinned` urut `pinned_at DESC, rowid DESC`; `set_pinned` idempoten (sematkan yang sudah ada = sukses tanpa menggeser waktu), menolak id kosong/lebih dari 120 karakter, profil tak dikenal → `PROFILE_NOT_FOUND`, dan hanya menolak penambahan **baru** saat batas tercapai; 6 test termasuk hapus profil → sematan ikut terhapus.
- [lib.rs](../../src-tauri/src/lib.rs) — `mod pins;` + dua perintah terdaftar.
- [pinnedRepository.ts](../../src/data/pinnedRepository.ts) — pembungkus `pinned_list`/`pinned_set`, `pinnedKey` (`packageId:lessonId`), dan pemetaan pesan galat.
- [CurriculumScreen.tsx](../../src/screens/CurriculumScreen.tsx) — tombol **Sematkan/Disematkan** (`data-pin-toggle`, `aria-pressed`, `aria-label` menyebut judul materi) di tiap kartu, status diambil dari `pinned_list` profil aktif; kegagalan muat/sematkan tampil sebagai banner, keberhasilan diumumkan lewat `aria-live`.
- [HomeScreen.tsx](../../src/screens/HomeScreen.tsx) — urutan default baru: hero → **Materi disematkan** (maks 24, kartu `Buka` + `Lepas`, `Kelola sematan`, empty state → Jelajah Materi) → **Materi tersedia** (grid mapel) → **Jelajahi materi** → Lanjutkan belajar → Ringkasan → Aktivitas terbaru. Pemuatan sematan dipisah dari katalog.
- [pinned-materials.mjs](../../scripts/e2e/scenarios/pinned-materials.mjs) + npm `e2e:pinned`.

**Verifikasi aktual:** `npm test` **120/120** (16 berkas) + fixture 4/4 + katalog 336/336 + binding PASS · `cargo test` **77/77** · `npm run build` exit 0 · E2E `pinned-materials` **8/8** dua kali berturut-turut · regresi `home-catalog` **28/28**, `learning-journey` **14/14**, `activities` **14/14** (satu kegagalan flake “simpan benar-salah” sebelum eksekusi ulang) · `npm run a11y` **17/17** (0 error, 7 warning). Screenshot `beranda-disematkan.png` dan `katalog-sematkan.png` diperiksa mata: kartu sematan teal dengan thumbnail, tombol `Buka` primer + `Lepas` sekunder, dan tombol `Disematkan` tertekan (ikon terisi) di katalog.

**Batasan jujur:**
1. Sematan hanya muncul di Beranda dan hanya bisa dipasang dari Jelajah Materi (bukan dari Player, Hasil Belajar, atau Aktivitas).
2. Urutan sematan tetap `pinned_at DESC` — belum ada drag/atur urutan.
3. Batas 24 adalah konstanta Rust; belum ada UI yang menjelaskan sisa kuota selain pesan galat saat penuh.
4. Tombol sematkan baru muncul setelah profil aktif selesai dimuat, jadi sesaat setelah katalog terbuka kartu belum menampilkan tombol itu.
5. Sematan tidak disinkronkan ke server.

**Sisa:** komponen tombol bersama · penataan urutan sematan · semat dari layar lain · pratinjau 320 px · daftar prasyarat manusia (seleksi + tanda tangan guru 309 F-06 / 550 hasil aturan / 119 override / 39 F-05, reviewer R1–R6/R8–R9/R12, CP/ATP per bab, OD-1 IPAS Fase A, D-UX-2/4/5/6) · tanda tangan putusan (L3) · boot flicker · kontainer gulir shell · diagnosis timeout tulis-pertama E2E · blocker rilis B-01…B-08. `reviewStatus` tetap `draft`.

### Handoff Tab Beranda (2026-10-28, T-107)

**Status:** selesai dan terverifikasi. Permintaan PO: "materi sematan, materi tersedia, jelajahi materi, diakses menggunakan switch, tampilan default adalah sematan, kalau sematan gak ada maka yang tampil materi tersedia".

**Keputusan desain:**
1. Ketiga bagian jadi **tablist bergaya segmented control** (bukan seksi bertumpuk), sehingga hanya satu panel tampil dan Beranda jauh lebih pendek.
2. Panel memakai `hidden` (bukan render bersyarat) supaya `aria-controls` setiap tab selalu menunjuk elemen nyata — pemindai a11y menandai `aria-controls` yang menggantung sebagai peringatan.
3. Default mengikuti data: ada sematan → tab sematan; kosong → tab tersedia. Pilihan manual pengguna disimpan di `sectionChosenRef` agar tidak ditimpa efek default setiap kali data sematan berubah.
4. Melepas sematan terakhir memindahkan tampilan ke tab tersedia, karena tab sematan saat itu hanya berisi empty state.

**Yang diubah:**
- [HomeScreen.tsx](../../src/screens/HomeScreen.tsx) — `homeSectionIds`/`HomeSection` + `activeSection` state; efek default (`pinsLoaded` + `pins.length === 0` → `available`); `selectSection` (menandai pilihan manual) dan `onTabKeyDown` (panah kiri/kanan, Home, End, fokus ikut pindah); `role="tablist"` + tiga `role="tab"` dengan `aria-selected`/`aria-controls`/roving `tabIndex`/lencana jumlah sematan; tiga `role="tabpanel"` dengan `hidden`; judul seksi lama yang menduplikasi label tab diganti petunjuk singkat, judul kartu sematan `h3` → paragraf `data-pinned-title`; tombol empty state berganti nama menjadi `Buka Jelajah Materi`; seksi Lanjutkan belajar dipindah ke bawah blok tab.
- [pinned-materials.mjs](../../scripts/e2e/scenarios/pinned-materials.mjs) — asersi tab (label, `aria-selected`, roving `tabIndex`, `aria-controls` valid, panel terlihat), navigasi keyboard lewat `Input.dispatchKeyEvent`, default mengikuti sematan, dan pemulihan ke tab tersedia setelah `Lepas`.

**Verifikasi aktual:** `npm test` **120/120** (16 berkas) + fixture 4/4 + katalog 336/336 + binding PASS · `npm run build` exit 0 · E2E `pinned-materials` **11/11** · regresi `home-catalog` **28/28**, `learning-journey` **14/14**, `activities` **14/14** · `npm run a11y` **17/17** (0 error, 7 warning). Screenshot diperiksa mata: `beranda-tab-tersedia.png` (segmented control, tab "Materi tersedia" biru, "Materi disematkan" berlencana 0), `beranda-disematkan.png` (tab sematan aktif, kartu Zakat dan Infak dengan thumbnail + `Buka`/`Lepas`), `beranda-tanpa-sematan.png` (kembali ke tab tersedia setelah sematan dilepas + muat ulang).

**Batasan jujur:**
1. Pilihan tab tidak diingat — membuka Beranda lagi selalu kembali ke aturan default.
2. Panel tersedia/eksplorasi yang tersembunyi tetap ada di DOM (atribut `hidden`), jadi teksnya masih terbaca oleh `textContent` pada uji; bukan masalah aksesibilitas karena `display:none` mengeluarkan isinya dari pohon aksesibilitas.
3. Tidak ada transisi/animasi antar panel.
4. `Buka Jelajah Materi` muncul dua kali di DOM (empty state sematan dan panel eksplorasi); hanya satu yang tampil pada satu waktu.

**Sisa:** komponen `Button` bersama · ingat pilihan tab · pratinjau 320 px tab · daftar prasyarat manusia (seleksi + tanda tangan guru 309 F-06 / 550 hasil aturan / 119 override / 39 F-05, reviewer R1–R6/R8–R9/R12, CP/ATP per bab, OD-1 IPAS Fase A, D-UX-2/4/5/6) · tanda tangan putusan (L3) · boot flicker · kontainer gulir shell · diagnosis timeout tulis-pertama E2E · blocker rilis B-01…B-08. `reviewStatus` tetap `draft`.

### Handoff Ringkasan Tiga Kolom (2026-10-28, T-108)

**Status:** selesai dan terverifikasi. Permintaan PO: "letakkan di bawah greeting, jadikan 3 kolom, kolom satu lanjutkan belajar, kolom 2 ringkasan belajar, kolom 3 aktivitas terbaru".

**Keputusan desain:**
1. Ketiga blok menjadi satu `<section data-home-overview>` bergrid `lg:grid-cols-3` yang diletakkan **tepat setelah hero** dan **sebelum** segmented control materi — jadi yang pertama dilihat setelah sapaan adalah keadaan belajar siswa, bukan katalog.
2. Semua kolom **selalu dirender** dengan keadaan kosong pendek (bukan disembunyikan), supaya jumlah kolom dan posisi tab tidak berubah-ubah antar profil.
3. Kartu statistik memakai `content-start` (bukan `flex-1`) agar tidak melar setinggi kolom; tombol `Lanjutkan` dan `Lihat semua hasil` memakai `mt-auto` supaya rata bawah di kolomnya.
4. Blok lama di bawah tab dihapus seluruhnya — kalau dibiarkan akan ada dua judul "Lanjutkan belajar"/"Ringkasan belajar"/"Aktivitas terbaru" di satu layar.

**Yang diubah:**
- [HomeScreen.tsx](../../src/screens/HomeScreen.tsx) — `<section data-home-overview>` dengan `data-resume-column` (thumbnail 16:9 + judul + paket/kelas + `Lanjutkan`, atau `data-resume-empty`), `data-summary-column` (tiga angka), `data-recent-column` (maks 3 aktivitas + `Lihat semua hasil`, atau "Belum ada aktivitas yang dinilai."); tiga seksi lama (kartu lanjutkan, Ringkasan belajar, Aktivitas terbaru) dihapus.
- [home-catalog.mjs](../../scripts/e2e/scenarios/home-catalog.mjs) — asersi lama berbasis `h2` "Lanjutkan belajar" diganti asersi `data-home-overview` (3 kolom sejajar, urutan label, posisi di bawah hero & di atas tablist, keadaan kosong) dan `[data-resume-entry]` untuk keadaan terisi; ditambah artefak `beranda-tiga-kolom.png`.

**Verifikasi aktual:** `npm test` **120/120** (16 berkas) + fixture 4/4 + katalog 336/336 + binding PASS · `npm run build` exit 0 · E2E `home-catalog` **28/28** (dua eksekusi) · regresi `pinned-materials` **11/11**, `learning-journey` **14/14**, `activities` **14/14** · `npm run a11y` **17/17** (0 error, 7 warning; Beranda 20 interaktif / 4 heading / 69 kontras). `beranda-tiga-kolom.png` diperiksa mata: tiga kartu sejajar (teal untuk Lanjutkan, putih untuk Ringkasan dan Aktivitas), angka 2 / 1 / 100, satu baris "Mengenal Pecahan 1/2, 1/3, dan 1/4 — Skor 100", segmented control materi tetap di bawahnya.

**Batasan jujur:**
1. Tiga kolom menambah tinggi area atas; pada 1600×900 kartu mapel kini mulai di bawah lipatan sehingga pengguna harus menggulir lebih jauh untuk katalog.
2. Hanya diuji pada `lg` (≥1024 px di harness 1600×900); di bawah itu kolom menumpuk vertikal dan belum ada pratinjau visual 320 px.
3. Kolom Ringkasan dan Aktivitas menyisakan ruang kosong karena tinggi baris mengikuti kolom Lanjutkan yang berisi thumbnail.
4. Isi kolom lanjutkan bergantung pada `entries` katalog yang sudah dimuat; judul aktivitas memakai fallback `lessonId` bila paketnya tidak ada di katalog aktif.

**Sisa:** komponen `Button` bersama · ingat pilihan tab · pratinjau 320 px · penataan urutan sematan · semat dari layar lain · daftar prasyarat manusia (seleksi + tanda tangan guru 309 F-06 / 550 hasil aturan / 119 override / 39 F-05, reviewer R1–R6/R8–R9/R12, CP/ATP per bab, OD-1 IPAS Fase A, D-UX-2/4/5/6) · tanda tangan putusan (L3) · boot flicker · kontainer gulir shell · diagnosis timeout tulis-pertama E2E · blocker rilis B-01…B-08. `reviewStatus` tetap `draft`.

### Handoff Kerapatan Tiga Kolom (2026-10-28, T-109)

**Status:** selesai dan terverifikasi. Permintaan PO: "tingginya 1/3 dari tinggi sekarang" (tiga kolom ringkasan Beranda).

**Keputusan desain:**
1. Tinggi dipangkas dengan membuang tumpukan vertikal, bukan mengecilkan target sentuh: tombol `Lanjutkan` dan `Lihat semua hasil` tetap `min-h-11` (44 px), persis ambang yang dipakai pemindai a11y.
2. Thumbnail 16:9 diganti persegi 56 px — memberi identitas visual tanpa memakan tinggi.
3. Kartu angka Sesi/Percobaan/Rata-rata yang tadinya tiga kotak bertumpuk label diganti `<dl>` satu baris (`items-end`), angka `text-2xl leading-none`.
4. `Lihat semua hasil` naik ke baris judul kolom Aktivitas, tiga aktivitas jadi baris `text-xs leading-4` tanpa kartu.

**Hasil ukur (E2E, jendela 1600×900):** 375 px → **102 px** saat kosong, **114 px** saat terisi (≈1/3, 30%).

**Yang diubah:**
- [HomeScreen.tsx](../../src/screens/HomeScreen.tsx) — padding `p-4` pada ketiga kartu, judul kolom `text-xs`, thumbnail `h-14 w-14`, judul/meta `truncate` sebaris, tombol sebaris dengan teks, `<dl className="mt-2 flex items-end gap-6">`, daftar aktivitas `mt-1 space-y-1 text-xs` dengan `leading-4` dan `truncate`, tombol `Lihat semua hasil` dipindah ke baris judul (`text-xs`, `min-h-11`, `px-3`).
- [home-catalog.mjs](../../scripts/e2e/scenarios/home-catalog.mjs) — dua asersi baru: `[data-home-overview]` ≤150 px saat kosong dan saat terisi; log menyebut tinggi terukur. Total **29 pemeriksaan**.

**Verifikasi aktual:** `npx tsc --noEmit` bersih · `npm run build` exit 0 · E2E `home-catalog` **29/29** · regresi `pinned-materials` **11/11**, `learning-journey` **14/14**, `activities` **14/14** · `npm run a11y` **17/17** (0 error, 7 warning — tidak bertambah meski banyak tombol mengecil, karena tombol aksi tetap 44 px) · `npm test` **120/120** (16 berkas) + fixture 4/4 + katalog 336/336 + binding PASS. Screenshot `beranda-tiga-kolom.png` diperiksa: kartu mapel kembali tampak pada 1600×900 tanpa menggulir.

**Batasan jujur:**
1. Judul materi dan meta di kolom Lanjutkan terpotong elipsis ("Mengenal Pecahan 1/2, 1/3, d…") karena tombol berbagi baris; nama lengkap tidak terlihat pada lebar ±405 px.
2. Ilustrasi hanya tampak sebagian (persegi 56 px), bukan cover utuh.
3. Aktivitas terbaru tetap dibatasi 3 baris dengan teks 12 px — lebih kecil dari teks isi lain di aplikasi.
4. Hanya diuji `lg` (≥1024 px); di bawah itu kolom menumpuk dan tinggi total bertambah lagi.

**Sisa:** komponen `Button` bersama · ingat pilihan tab · pratinjau 320 px · penataan urutan sematan · semat dari layar lain · daftar prasyarat manusia (seleksi + tanda tangan guru 309 F-06 / 550 hasil aturan / 119 override / 39 F-05, reviewer R1–R6/R8–R9/R12, CP/ATP per bab, OD-1 IPAS Fase A, D-UX-2/4/5/6) · tanda tangan putusan (L3) · boot flicker · kontainer gulir shell · diagnosis timeout tulis-pertama E2E · blocker rilis B-01…B-08. `reviewStatus` tetap `draft`.

### Handoff Kuis Berurutan (2026-10-28, T-110)

**Status:** selesai dan terverifikasi. Permintaan PO: "saya ingin soap quis dan latihan di buat seaquense, satu soal di jawab, kemudian pindah ke halamn soal berikutnya sampai akhir dan ada hasilnya".

**Keputusan desain:**
1. Cakupan = `QuizActivity` (tipe `multiple-choice`, `true-false`, `short-answer`) — yaitu yang dibuka tombol "kuis"/"Lanjut berlatih", termasuk "latihan" karena aktivitas itulah yang dinilai per soal. `MatchingActivity` dan `OrderingActivity` **sengaja tidak diubah**: keduanya satu latihan utuh yang semua pasangan/itemnya harus terlihat bersamaan, bukan kumpulan soal lepas.
2. Navigasi eksplisit (`Lanjut`, `Lihat hasil`), bukan pindah otomatis — soal pilihan ganda bisa butuh beberapa pilihan sebelum lanjut, dan tombol eksplisit menjaga alur papan ketik/pembaca layar tetap terduga. `Lanjut` nonaktif sampai soal terjawab, dengan hint kecil yang menjelaskan sebabnya.
3. Penilaian tetap di akhir (`scoreQuiz` dipanggil sekali saat tombol terakhir), sehingga payload `onGraded`, attempt, rerata, dan outbox tidak berubah. `Ulangi kuis` mengosongkan `answers` + `result` dan kembali ke soal 1.
4. Satu soal per halaman berarti panel lebih pendek dari kartu samping; asersi "kolom samping punya ruang menempel ≥80 px" dihapus dan uji menempel dilaporkan **tidak diuji** (bukan dilemahkan diam-diam).

**Yang diubah:**
- [QuizActivity.tsx](../../src/components/content/QuizActivity.tsx) — state `questionIndex`, `result`, ref `questionRef`/`resultRef`/`focusQuestionRef`; kepala soal `[data-quiz-progress]` + `progressbar` "Kemajuan kuis"; `fieldset`/`legend` `sr-only` per soal; navigasi `Sebelumnya`/`Lanjut`/`Lihat hasil`; kartu hasil dengan "Benar X dari M soal" + `Ulangi kuis`; fokus pindah ke kartu soal/hasil.
- [activities.mjs](../../scripts/e2e/scenarios/activities.mjs) — benar-salah, jawaban singkat (termasuk `Ulangi kuis`), dan pilihan ganda multi-jawaban kini dijalankan soal per soal; asersi `fieldsets` 1, progres, dan `Lanjut` nonaktif; asersi ruang menempel dihapus + alasan dicatat di log.
- [learning-journey.mjs](../../scripts/e2e/scenarios/learning-journey.mjs), [home-catalog.mjs](../../scripts/e2e/scenarios/home-catalog.mjs), [quiz-coverage.mjs](../../scripts/e2e/scenarios/quiz-coverage.mjs), [a11y.mjs](../../scripts/e2e/scenarios/a11y.mjs) — loop per soal; `quiz-coverage` membaca jumlah soal dari `[data-quiz-progress]`, `a11y` menambah state audit "Player (soal kuis)".

**Verifikasi aktual:** `npx tsc --noEmit` bersih · `npm run build` exit 0 ("built in 8.59s") · E2E `activities` **16/16**, `learning-journey` **14/14**, `home-catalog` **29/29**, `quiz-coverage` **5/5**, `player-fullscreen` **6/6**, `smoke` **8/8** · `npm run a11y` **18/18** (0 error, 7 warning; state soal kuis 0 error/0 warning) · `npm test` **120/120** (16 berkas) + fixture 4/4 + katalog 336/336 + binding PASS · `cargo test` tidak dijalankan (tanpa perubahan Rust). Screenshot diperiksa mata: `quiz-baru-soal-1.png`, `quiz-baru-soal-terakhir.png`, `a11y-quiz-step.png`, `a11y-quiz-result.png` — progres dan penghitung soal tampil sekali (bukan ganda), kartu hasil terbaca.

**Batasan jujur:**
1. Hanya aktivitas kuis yang berurutan; mencocokkan dan mengurutkan tetap satu halaman.
2. Tidak ada penyimpanan posisi soal — keluar dari Player mengulang dari soal 1 (jawaban juga tidak dipersistensi di tengah jalan, sama seperti sebelumnya).
3. Uji kolom samping "menempel" tidak lagi dijalankan pada `activities` karena halaman satu soal tidak cukup tinggi (ruang gulir 277 px vs kartu samping); sticky tetap ada di CSS dan diverifikasi lewat kode, bukan E2E.
4. Tombol `Sebelumnya` memungkinkan mengubah jawaban soal lama sebelum submit; skor hanya dihitung saat submit, jadi tidak ada penilaian parsial.

**Sisa:** komponen `Button` bersama · ingat pilihan tab · pratinjau 320 px · penataan urutan sematan · semat dari layar lain · pratinjau soal panjang/multibaris pada 320 px · daftar prasyarat manusia (seleksi + tanda tangan guru 309 F-06 / 550 hasil aturan / 119 override / 39 F-05, reviewer R1–R6/R8–R9/R12, CP/ATP per bab, OD-1 IPAS Fase A, D-UX-2/4/5/6) · tanda tangan putusan (L3) · boot flicker · kontainer gulir shell · diagnosis timeout tulis-pertama E2E · blocker rilis B-01…B-08. `reviewStatus` tetap `draft`.

### Handoff Ingat Tab Beranda & Posisi Soal (2026-10-28, T-111)

**Status:** selesai dan terverifikasi. Permintaan PO: "Mulai opsi 1" — ingat tab Beranda + posisi soal terakhir per profil, disimpan di SQLite, jadi membuka lagi tidak me-reset.

**Keputusan desain:**
1. Satu tabel generik `profile_ui_state` (kunci–nilai) alih-alih kolom baru di `profiles` atau tabel per fitur: tab Beranda dan posisi kuis hanyalah keadaan antarmuka, dan kunci tetap (`home-tab`, `quiz-resume`) menjaga jumlah baris per profil konstan (maks 2) — tidak menumpuk riwayat.
2. Posisi kuis menyimpan **identitas kuis** (`packageId`/`lessonId`/`activityId`) di dalam nilai, bukan di kunci; kunci gabungan akan melewati batas 64 karakter dan meninggalkan baris basi tiap kuis yang dibuka. Saat memulihkan, identitas harus cocok — posisi dari kuis lain diabaikan.
3. Jawaban ikut dipulihkan, bukan hanya nomor soal, karena soal pilihan ganda satu per halaman tanpa jawaban terpilih membuat `Lanjut` nonaktif dan pengguna terjebak mengulang.
4. Tulis ditunda 300 ms agar mengetik tidak menulis SQLite per ketukan, **tetapi** `Lanjut`/`Sebelumnya` menulis segera — perpindahan soal adalah titik aman yang paling mungkin diikuti penutupan aplikasi.
5. Pemuatan tidak menimpa masukan pengguna: pembaruan memakai functional updater dan hanya berlaku bila jawaban/indeks masih kosong. Kegagalan baca/tulis diabaikan (`catch {}`) — keadaan antarmuka bersifat tambahan, tidak boleh memblokir kuis.
6. Tab Beranda hanya menang bila masih sah: `pinned` tersimpan tetapi sematan kosong → jatuh ke `available`. Pilihan manual (`sectionChosenRef`) tetap tidak ditimpa, dan melepas sematan terakhir menyimpan `available`.

**Yang diubah:**
- [0009_profile_ui_state.sql](../../src-tauri/src/migrations/0009_profile_ui_state.sql), [ui_state.rs](../../src-tauri/src/ui_state.rs), [db.rs](../../src-tauri/src/db.rs) (migrasi 9), [lib.rs](../../src-tauri/src/lib.rs) (tiga perintah) — nilai maks 8 KiB, kunci `[A-Za-z0-9_-]` maks 64 karakter, `clear` idempoten, hapus profil menghapus state (FK cascade).
- [uiStateRepository.ts](../../src/data/uiStateRepository.ts) baru; [quizResume.ts](../../src/content/quizResume.ts) + [quizResume.test.ts](../../src/content/__tests__/quizResume.test.ts) baru (4 test).
- [HomeScreen.tsx](../../src/screens/HomeScreen.tsx) — baca simpanan sekali, efek default memakai tab tersimpan, simpan pada `selectSection`.
- [QuizActivity.tsx](../../src/components/content/QuizActivity.tsx) — prop `resumeTarget`, efek pemulihan, tulis berjeda + flush, `clearProgress()` pada `submit`/`retry`.
- [LessonPlayer.tsx](../../src/screens/LessonPlayer.tsx) — `profileId` state + `resumeTarget`; banner penyimpanan diberi `data-player-storage` agar uji bisa membaca status sebenarnya.
- [pinned-materials.mjs](../../scripts/e2e/scenarios/pinned-materials.mjs) — blok tab tersimpan setelah muat ulang; [activities.mjs](../../scripts/e2e/scenarios/activities.mjs) — blok posisi soal setelah muat ulang + helper `waitForSaved` yang melaporkan banner/judul/hash saat gagal.

**Verifikasi aktual:** `npx tsc --noEmit` bersih · `npm run build` exit 0 · `npm test` **124/124** (17 berkas) + fixture 4/4 + katalog 336/336 + binding PASS · `cargo test` **83/83** (6 test `ui_state`) · `npm run a11y` **18/18** (0 error, 7 warning) · E2E `activities` **17/17**, `pinned-materials` **13/13**, `learning-journey` 14/14, `home-catalog` 29/29, `quiz-coverage` 5/5, `smoke` 8/8, `player-fullscreen` 6/6, `profile-lifecycle` 7/7, `backup-restore` 9/9, `player-deeplink` 7/7, `mode-switch` 6/6, `content-rollback` 9/9.

**Batasan jujur:**
1. Satu simpanan per profil untuk posisi kuis — membuka kuis lain menimpa posisi kuis sebelumnya (bukan riwayat per kuis).
2. Ketukan terakhir yang terjadi <300 ms sebelum aplikasi ditutup belum tersimpan (jendela debounce); perpindahan soal tidak terkena karena ditulis segera.
3. Setelah muat ulang, sesi belajar baru dibuat — ringkasan sesi E2E `activities` kini melaporkan **2 sesi, 5 percobaan** (sebelumnya 1 sesi) karena satu percobaan dilakukan setelah muat ulang.
4. `MatchingActivity`/`OrderingActivity` tidak memakai posisi soal (satu halaman utuh), dan keadaan antarmuka tidak disinkronkan ke server.
5. Flake lama "banner simpan tidak berubah dari siap" (tercatat sejak T-103) muncul lagi 2× saat menjalankan `activities` dari 3 percobaan; setelah blok uji dibereskan, run terakhir PASS penuh. Helper `waitForSaved` kini mencetak banner, judul layar, dan hash saat gagal sehingga penyebab dapat dilacak — akar masalah tetap belum terbukti.

**Sisa:** komponen `Button` bersama · pratinjau 320 px · penataan urutan sematan · semat dari layar lain · pratinjau soal panjang/multibaris pada 320 px · diagnosis flake banner simpan E2E · daftar prasyarat manusia (seleksi + tanda tangan guru 309 F-06 / 550 hasil aturan / 119 override / 39 F-05, reviewer R1–R6/R8–R9/R12, CP/ATP per bab, OD-1 IPAS Fase A, D-UX-2/4/5/6) · tanda tangan putusan (L3) · boot flicker · kontainer gulir shell · blocker rilis B-01…B-08. `reviewStatus` tetap `draft`.

### Handoff Semat dari Header Player (2026-10-28, T-112)

**Status:** selesai dan terverifikasi. Instruksi PO: "lanjutkan" — dilanjutkan ke butir berikutnya pada daftar sisa: semat dari layar lain (Player), karena ini melengkapi fitur sematan T-106 yang sebelumnya hanya bisa dipasang dari Jelajah Materi.

**Yang diubah:**
- [LessonPlayer.tsx](../../src/screens/LessonPlayer.tsx) — tombol `data-pin-toggle` di header materi (teks "Sematkan"/"Disematkan", `aria-pressed`, `aria-label` menyebut judul, ikon pembatas buku, gaya sama dengan katalog: `border-teal/50 bg-teal/10` saat aktif). Status `[data-player-pin-status]` `aria-live="polite"` mengumumkan hasil atau galat batas 24 di baris yang sama. Status dibaca lewat `pinned_list` saat `profileId` siap; tombol hanya dirender jika `canPersistLocally()`.
- [LessonPlayer.tsx](../../src/screens/LessonPlayer.tsx) — `sessionReadyRef` menyimpan promise `ensureLocalProfile` + `getOrStartSession`; `handleGraded` menunggu promise itu bila `sessionId` belum ada, bukan langsung gagal.
- [pinned-materials.mjs](../../scripts/e2e/scenarios/pinned-materials.mjs) — blok siklus penuh semat/lepas dari Player (13 → 16 pemeriksaan).
- [a11y.mjs](../../scripts/e2e/scenarios/a11y.mjs) — pembacaan banner simpan memakai `[data-player-storage]`, bukan `[aria-live="polite"]` pertama, karena Player kini punya dua wilayah live.

**Keputusan desain:**
1. **Tanpa Rust/migrasi baru** — `pinned_set`/`pinned_list` sudah punya semantik yang dibutuhkan (idempoten, batas 24, `PROFILE_NOT_FOUND`); menambah perintah baru hanya akan menggandakan kontrak.
2. **Status di samping tombol, bukan di banner penyimpanan** — pesan sematan dan pesan penyimpanan hasil berbeda pemilik dan berbeda masa hidup; menyatukannya membuat satu pesan menimpa pesan lain.
3. **Tombol disembunyikan di pratinjau browser** — tanpa SQLite, `pinned_set` pasti gagal; lebih jujur tidak menawarkan aksi yang tidak bisa disimpan.
4. **Menunggu sesi, bukan menolak hasil** — kuis yang selesai <1 detik setelah Player terbuka adalah kasus nyata (siswa membuka materi lalu langsung menjawab); kehilangan hasil karena balapan internal tidak dapat diterima.

**Verifikasi aktual:** `npx tsc --noEmit` bersih · `npm run build` exit 0 (16,02 dtk) · `npm test` **124/124** (17 berkas) + fixture 4/4 + katalog 336/336 + binding PASS · `npm run a11y` **18/18** (0 error, 7 warning) · E2E `pinned-materials` **16/16**, `activities` **17/17**, `learning-journey` **14/14**, `home-catalog` **29/29**, `player-deeplink` **7/7**, `player-fullscreen` **6/6**, `smoke` **8/8** · `cargo test` tidak dijalankan (tanpa perubahan Rust). Screenshot `player-sematkan.png` diperiksa mata: tombol teal "Disematkan" + ikon terisi di bawah ringkasan, teks status "Zakat dan Infak disematkan ke Beranda." di sebelahnya, tidak bersaing dengan tab aktivitas.

**Batasan jujur:**
1. Semat masih belum bisa dari layar Hasil Belajar atau Aktivitas Interaktif.
2. Urutan sematan tetap `pinned_at DESC` (belum bisa diatur), dan tombol tidak muncul di mode layar penuh karena header disembunyikan.
3. Bila pembacaan sematan gagal, tombol tidak tampil dan hanya galat teks kecil yang muncul — bukan pemblokir belajar.
4. `npm run a11y` gagal **dua kali berturut-turut** setelah tombol ditambahkan, dengan gejala `riwayat banner: [{"ms":13,"text":""}]`. Penyebabnya harness membaca `[aria-live="polite"]` **pertama** di halaman, yang kini wilayah status sematan (kosong), bukan banner simpan. Ini masalah selektor uji, bukan pelanggaran a11y; selektor dipersempit ke `[data-player-storage]` dan audit kembali 18/18.
5. Flake lama "banner tetap siap, simpan tidak pernah mulai" kini punya penjelasan terverifikasi dari screenshot + kode: `sessionId` masih kosong saat kuis selesai → galat "Sesi belajar belum siap" ditulis → efek sesi yang belum rampung menimpanya dengan "siap". Perbaikan menunggu sesi membuat `activities` PASS 17/17 pada percobaan pertama. Klaim ini **kuat tetapi belum eksklusif** — flake lama bersifat intermiten, jadi perlu beberapa run berikutnya untuk memastikan tidak ada penyebab kedua.

**Sisa:** komponen `Button` bersama · pratinjau 320 px (tab Beranda + soal panjang) · penataan urutan sematan · semat dari layar Hasil Belajar/Aktivitas · pantau apakah flake banner simpan hilang setelah perbaikan balapan sesi (BACKLOG) · daftar prasyarat manusia (seleksi + tanda tangan guru 309 F-06 / 550 hasil aturan / 119 override / 39 F-05, reviewer R1–R6/R8–R9/R12, CP/ATP per bab, OD-1 IPAS Fase A, D-UX-2/4/5/6) · tanda tangan putusan (L3) · boot flicker · kontainer gulir shell · blocker rilis B-01…B-08. `reviewStatus` tetap `draft`.

### Handoff Materi Daring HTML5 — ADR + Kontrak (2026-10-28, T-113)

**Status:** desain selesai, **belum ada kode**. Instruksi PO: materi dibuat di platform (editor/content creator berbasis HTML5 animation), disimpan di server Gerbang Edukasi, dan muncul di Jelajah Materi setelah publish; PO minta mulai dari ADR + kontrak. Editor mu-komik yang dibuka PO hanya acuan tampilan, bukan integrasi.

**Yang ditulis:**
- [ADR-0035](../../knowledge/decisions/ADR-0035-online-html5-materials.md) — **Proposed**: jenis konten `material` (bukan tipe aktivitas baru), katalog + unduh-sekali, bundel bertanda tangan Ed25519 dengan kunci konten terpisah dari lisensi, render di `iframe sandbox="allow-scripts allow-forms"` dari `ifp-content://`, CSP hanya ditambah `frame-src`, jembatan `postMessage` minimal, tanpa skor, a11y mengikat.
- [MATERIAL_BUNDLE_CONTRACT.md](../../knowledge/content/MATERIAL_BUNDLE_CONTRACT.md) — skema `material.json` (20 field + `files` per-hash), aturan bundel self-contained, kanonikalisasi RFC 8785, endpoint `GET /v1/materials`, urutan verifikasi 7 langkah + 7 kode galat, rancangan tabel state lokal, skema pesan jembatan, syarat a11y, alur publish, kompatibilitas.

**Keputusan desain penting:**
1. **Unduh-sekali, bukan streaming** — premis aplikasi offline-first; streaming membuat Jelajah Materi kosong saat internet sekolah mati.
2. **Kunci konten ≠ kunci lisensi** — kompromi kunci lisensi tidak boleh otomatis mengizinkan penyuntikan materi.
3. **Iframe sandbox, bukan webview Tauri terpisah** — isolasi origin (opaque) + tanpa akses IPC sudah cukup untuk v1; webview terpisah menambah biaya Rust dan mengeluarkan pengguna dari shell.
4. **Larangan jaringan di dalam bundel** — animasi yang memanggil CDN akan mati offline dan membuka permukaan pelacakan; karena itu diperiksa saat publish.
5. **Tanpa skor** — materi tidak mengisi Hasil Belajar sampai OD-14 diputuskan; mencampur keduanya akan merusak arti "skor".
6. **ADR berstatus Proposed** — kontrak v1 melarang menjalankan kode dari konten (`IMPLEMENTATION_CONTRACT.md` §3); mengaktifkannya butuh persetujuan eksplisit PO.

**Verifikasi aktual:** hanya pemeriksaan dokumen — `grep`/baca kode untuk memastikan klaim (CSP di [tauri.conf.json](../../src-tauri/tauri.conf.json), larangan skrip di [SCHEMA.md](../../knowledge/content/SCHEMA.md), bentuk galat Worker `{error:{code,message}}` di [http.ts](../../workers/api/src/http.ts), route Worker yang ada di [index.ts](../../workers/api/src/index.ts)). **Tidak ada** test/build/E2E yang dijalankan karena tidak ada kode yang berubah. Tidak ada URL, ukuran, atau angka yang diklaim terverifikasi — semua batas (50 MB, 2 GB cache, TTL 10 menit, 60 req/menit) ditandai usulan.

**Batasan jujur:**
1. Kontrak belum dibekukan; semua nama field, path endpoint, dan angka batas masih dapat berubah.
2. Belum ada yang membuktikan iframe sandbox cukup aman untuk bundel nyata — itu harus diuji di prototipe tahap 2 sebelum katalog dibangun.
3. Pemeriksaan "self-contained" berbasis pola, bukan sandbox; bundel berbahaya yang lolos review tetap mungkin. Mitigasi sebenarnya adalah tanda tangan + hanya Gerbang Edukasi yang bisa menerbitkan.
4. Sisi platform (validator publish, penandatanganan, storage) berada di luar repo ini dan belum ada.
5. Lima keputusan terbuka (OD-10…OD-14) memblokir implementasi katalog.

**Sisa:** persetujuan PO atas ADR-0035 · jawaban OD-10…OD-14 · prototipe penampil dengan bundel contoh lokal · lalu katalog + pengunduh. Daftar sisa lama tidak berubah (Button bersama, pratinjau 320 px, urutan sematan, semat dari Hasil/Aktivitas, pantau flake banner, prasyarat manusia, L3, boot flicker, kontainer gulir, blocker rilis). `reviewStatus` tetap `draft`.
