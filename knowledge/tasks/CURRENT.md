# CURRENT â Task Aktif

**Sesi:** SESSION-2026-10-24-1
**Autonomy:** L1 (BALANCED)
**Status:** WIP â OD-1 disetujui PO + Curriculum Lead (via sesi); kedalaman, duplikasi, dan `curriculumRefs` 320/320 selesai; pra-review agent R1âR6/R8âR9/R12 selesai (bukan approval); P0 UX 5/6 selesai (metadata internal tertahan D-UX-4); UX-03 (fokus kartu hasil) selesai; mode belajar/admin selesai (T-077); sakelar ikon, thumbnail materi, pemilih kelas collapsible (T-078); **foto profil lokal + ilustrasi Beranda (T-079)**; **16 paket IPAS kelas 1â2 dengan cover unik per topik (T-089/T-090)**; **temuan deterministik R5 dibereskan (T-091)**; **volume latihan kelas 1â6 dinaikkan ke 5â10 item per aktivitas dinilai (T-092: +695 soal kuis, +361 pasangan)**; **Player dipadatkan + mode layar penuh (T-093)**; **setiap paket kini punya kuis (T-094/OD-9: +499 soal pada 88 paket)**; **21 item pada 17 paket bermateri tipis dibetulkan (T-095)**; **10 paket prioritas ditinjau agent â 141 item, 4 cacat terverifikasi (T-096)**; **F-01â¦F-04 diterapkan (T-097 F-03/F-04, T-098 F-01/F-02)**; **putusan review kini terikat ke sidik jari isi + sampling audit (T-104)**; **tombol aktivitas eksplorasi ditata ulang: satu aksi primer per langkah, dukungan & navigasi terpisah (T-105)**; **sematan materi per profil dengan tiga tab Beranda â default Materi disematkan, jatuh ke Materi tersedia bila kosong (T-106/T-107)**; **Lanjutkan belajar, Ringkasan belajar, dan Aktivitas terbaru kini tiga kolom sejajar tepat di bawah sapaan (T-108), dipadatkan ke Â±112 px atau ~1/3 tinggi sebelumnya (T-109)**; **kuis & latihan kini berurutan â satu soal per halaman dengan `Lanjut`/`Lihat hasil` lalu kartu hasil (T-110)**; **tab Beranda terakhir & posisi soal kuis kini diingat per profil di SQLite (T-111)**; **tombol Sematkan/Disematkan kini ada di header Player, jadi materi bisa disematkan langsung dari layar belajar (T-112) dan balapan "sesi belum siap" saat kuis selesai cepat ikut diperbaiki**; **ADR-0035 kini Accepted (OD-10â¦OD-14 dikunci PO 2026-10-28) dan prototipe penampil materi HTML5 berjalan di iframe sandbox dari protokol lokal `ifp-content://` dengan satu bundel contoh (T-113/T-114)**; **pemasang bundel materi bertanda tangan selesai (T-115): ZIP + sidecar `.sig`, Ed25519 per `keyId`, hash tiap berkas, staging â rename atomik, tabel `material_install`, daftar + buka materi di layar Konten, alat `scripts/material-pack.mjs`, E2E `material-import` 12/12**; **materi HTML5 terpasang kini bisa disematkan ke Beranda â tabel `pinned_materials`, batas 24 sematan dipakai bersama dengan paket, kartu materi di tab Materi disematkan, buka penampil langsung dari Beranda, E2E `material-pin` 12/12 (T-116)**; **katalog materi daring prototipe berjalan (T-117): klien HTTP Rust `material_catalog.rs` (alamat dari `app_meta`, fallback `IFP_CATALOG_URL`, https wajib kecuali loopback), cache ETag di SQLite (`0012`), unduhan pre-signed 10 menit dengan verifikasi `bundleSha256` sebelum masuk pemasang, server katalog referensi `scripts/mock-catalog-server.mjs`, bagian âJelajah materi daringâ di layar Konten (alamat katalog, filter kelas/mapel, pasang + status terpasang), E2E `material-catalog` 8/8**; **dua bundel contoh untuk demo katalog tersedia (T-118): materi interaktif Matematika kelas 2 âPerkalian sebagai Penjumlahan Berulangâ + `npm run catalog:dev` yang membangun/menandatangani kedua bundel lalu menulis `catalog.json`**; **materi demo ketiga âMemilah Fakta dan Opiniâ (Kelas 4 Bahasa Indonesia) menambah pola interaksi ketiga di katalog demo (T-119)**; **cover bundel kini tampil di UI katalog (T-120): `coverUrl` opsional per item katalog, perintah Rust `material_catalog_cover`/`material_installed_cover` mengembalikan data URL (magic bytes, batas 2 MB), komponen `MaterialCover` dipakai baris katalog daring + daftar materi terpasang, E2E `material-catalog` 10/10**; **kartu sematan materi di Beranda kini memakai cover bundel selebar kartu (T-121), bukan lagi kotak gradien âMATERI HTML5â**; **Studio Materi menambahkan penulis bundel HTML5 di dalam aplikasi (T-122): kerangka `eksplorasi`/`kuis` â editor berkas â cover dari disk atau katalog â pemeriksaan mandiri kontrak â pratinjau lewat penampil â ekspor folder sumber + ZIP tanpa `.sig`, tanda tangan tetap di luar aplikasi lewat `scripts/material-pack.mjs`, E2E `material-studio` 23/23**; **sisi platform katalog materi ada sebagai kode Worker (T-123): `GET /v1/materials` + publish/unpublish + penandatangan Ed25519 di server + URL pre-signed + migrasi `0004_material_catalog.sql` + `npm run material:publish` â 18 test worker hijau, belum di-deploy**; **tab Susun kini berlayout seperti PowerPoint (T-127): daftar langkah pindah ke sidebar kiri dengan toggle ringkasan blok per langkah, penyunting langkah terpilih tampil dinamis di panel kanan, dan pilihan langkah tidak lagi terlempar ke langkah 1 setelah Terapkan (E2E `material-studio` 26/26)**; **Studio Materi kini membuka draft di halaman editor tersendiri (T-128): daftar draft + form pembuatan tetap di halaman lama, editor punya header sendiri dengan tombol ââ Daftar draftâ, toolbar tab lengket di atas, dan Susun ditata tiga zona â langkah di kiri, penyunting + pratinjau di tengah, properti di kanan â dengan pratinjau mengikuti langkah yang dipilih (E2E `material-studio` 28/28)**; **form pembuatan materi tidak lagi tampil di halaman Studio (T-129): kartu âDraft materiâ hanya berisi daftar + tombol â+ Buat materiâ, dan form lengkap muncul sebagai dialog modal (fokus awal, Escape, Tab berputar, Batal) saat tombol ditekan (E2E `material-studio` 29/29)**; **panel tengah Susun kini dua tab â Editor | Pratinjau â dengan Editor sebagai tampilan awal, dan tab Pratinjau memakai tinggi penuh kolom tengah (T-130, E2E `material-studio` 30/30)**; **tab Susun menambah blok Video (YouTube / daring / lokal) dan Sematan HTML daring dengan penanganan offline (T-131, [ADR-0036](../decisions/ADR-0036-declared-online-media.md)): validator bundel jadi sadar-naskah sehingga hanya alamat yang dinyatakan naskah â termasuk URL pemutar turunan â yang diizinkan, aset video 25 MB (`mp4`/`webm` di Rust + Worker + pack), sandbox pemutar diperluas, dan pemeriksaan mandiri memberi peringatan bukan blokir (E2E `material-studio` 31/31, `material-viewer` 8/8, `cargo test --lib` 131/131)**; **T-132: blok YouTube/sematan kini benar-benar berputar di penampil â CSP dokumen materi mendapat `frame-src https:` + `media-src â¦ https:` (sebelumnya `default-src 'none'` memblokir iframe sebelum ada permintaan jaringan) dan frame penampil mengirim `referrerPolicy="origin"` + delegasi `allow` pemutar, karena YouTube menolak embed tanpa Referer (Error 153) (`cargo test --lib` 132/132, `material-viewer` PASS)**; **T-133 ([ADR-0037](../decisions/ADR-0037-material-viewer-display-modes.md)): penampil materi punya tiga mode lebar â Kartu (1024 px) | Lansekap (selebar jendela) | Layar penuh (fullscreen jendela Tauri, bukan Fullscreen API DOM) â dengan mode aktif diingat per profil di `ui_state`, kolom baca bundel ikut melebar lewat media query di CSS yang dirender Studio (820 px â 1180 px â 1400 px; materi yang sudah terpasang baru melebar setelah diterapkan ulang) (`material-viewer` 11/11, `material-scene-sample` 5/5)**; **T-134: kerangka Studio + tiga bundel demo katalog ikut diberi media query pelebar kolom (820/760 px â 1180 px â 1400 px) sehingga draft baru dan materi contoh benar-benar melebar, `SEED_VERSION` naik ke 5, dan dua uji Rust penjaga mengunci titik putus di sumber CSS bundel (`cargo test --lib` 134/134, `material-studio` 31/31)**; **T-135: tab Susun memindahkan baris tambah blok (+Teks/+Gambar/+Suara/+Video/+Semat) dari dasar editor ke atas panel **Parameter** baru di kanan â satu panel berjudul dengan tiga section ber-divider (Tambah blok | Langkah | Halaman), grid dua kolom, gulir internal lengket â dan Studio mendapat tombol Â«Tandai siap pakaiÂ»: satu klik yang menjalankan pemeriksaan kontrak lebih dulu lalu menaikkan `reviewStatus` manifest draft `draft â reviewed` (lencana Â«Siap pakaiÂ» ikut muncul di header editor dan daftar draft; materi tetap lokal, terbit online tetap lewat Ekspor â katalog, tanda tangan tetap di luar aplikasi, dan agen tidak pernah menaikkannya sendiri) (`cargo test --lib` 135/135, `material-studio` 32/32)**; **T-136: paket pilot pecahan dinaikkan jadi materi contoh â 4 tujuan selaras, eksplorasi 6 langkah, kuis 8 soal dengan posisi kunci seimbang (2/3/3) + `accessibilityMetadata`, dan aktivitas mencocokkan 5 pasangan (`cargo test --lib` 135/135, `learning-journey` 14/14, `home-catalog` 29/29)**; **T-137: ilustrasi eksplorasi dirender sekali per aktivitas — satu simpul gambar di atas langkah yang bertahan saat berpindah, 1.683 render gambar di 336 paket turun jadi 336, paket bergambar berbeda per langkah tetap utuh (`npm test` 173/173, `e2e:cover` 3/3, `learning-journey` 14/14)**; **T-138: 48 paket matematika kelas 1–6 kini punya ilustrasi aktivitas sendiri — 48 resep vektor dirasterisasi ke PNG 800×600 (341.570 byte), entri aset ditambahkan setelah cover sehingga katalog 336 entri tidak berubah, wiring manifest/langkah/altText idempoten (`tsc` bersih, `npm test` 173/173, E2E cover 3/3, journey 14/14, activities 17/17, home-catalog 29/29)**; **T-139: ilustrasi eksplorasi matematika kini berbeda di setiap langkah — 240 PNG vektor 800×600 (1.594,6 KiB, 240 hash unik) untuk 48 aktivitas kelas 1–6, entri aset lama diganti lima aset langkah setelah cover sehingga `coverAsset` dan katalog 336 entri tidak berubah, wiring manifest/langkah/altText idempoten, UI per langkah aktif tanpa perubahan kode (`tsc` bersih, `npm test` 173/173, validator 48/48 VALID, E2E cover-illustration 7/7, journey 14/14, activities 17/17, home-catalog 29/29)**; **T-140: Player matematika ditata ulang — hero 228 → 71 px, tab + `Layar penuh` satu baris, langkah eksplorasi dua kolom (ilustrasi + rel **Petunjuk**/**Pembahasan** sebagai disclosure) sehingga seluruh langkah terlihat tanpa menggulir pada 1024–1920 px, `Ringkasan sesi` pindah ke aside kanan, dan ilustrasi dinormalisasi ke kanvas 800×600 yang sama (`T-140b`: 93/240 PNG diperbesar, 40 manifest di-wire ulang) (`tsc` bersih, `npm test` 173/173, build PASS, validator 0 issue; E2E belum dijalankan karena aplikasi dev berjalan)**; **T-141: pembahasan lengkap per aktivitas eksplorasi — field opsional `interactionConfig.explanation` (`{ title?, paragraphs[] }`) tanpa perubahan skema, tombol “Pembahasan lengkap” di rel teks setiap langkah + “Baca pembahasan lengkap” di kartu selesai membuka tampilan pembahasan tersendiri (kolom baca 70ch, gulir internal, fokus pindah ke judul lalu kembali ke tombol), satu paket contoh Kelas 1 Matematika “Bilangan 1–10” diisi lima paragraf (`tsc` bersih, `npm test` 173/173, build PASS, validator VALID; E2E `explanation` 7/7 + regresi `activities` 17/17, `learning-journey` 14/14, `player-fullscreen` 6/6, `cover-illustration` 7/7, `smoke` 8/8, `a11y` 19/19)**; **T-142: isi pembahasan lengkap kini memenuhi lebar panel — batas `max-w-[70ch]` dihapus dan paragraf dibagi dua kolom seimbang menurut jumlah karakter bila panel cukup lebar (container query), satu kolom penuh di bawahnya, gulir internal `max-h-[clamp(160px,44vh,520px)]` (`tsc` bersih, `npm test` 173/173, build PASS; E2E `explanation` 7/7 memeriksa isi = lebar bagian dan jumlah kolom sesuai ambang, regresi activities/journey/cover/fullscreen/smoke/a11y hijau)**; **T-143: ambang dua kolom diturunkan 860 → 760 px — 1440×900 (panel 774 px) kini dua kolom 365+365 tanpa gulir internal, 1024/1366 tetap satu kolom (`tsc` bersih, `npm test` 173/173, build PASS, E2E `explanation` 7/7 + regresi activities/journey/cover/fullscreen/smoke/a11y hijau)**; **T-144: pembahasan lengkap kini tersedia di seluruh 48 paket Matematika kelas 1–6 — 47 paket baru diisi lima paragraf yang diturunkan dari langkah eksplorasi masing-masing (paket contoh Bilangan 1–10 sudah terisi sejak T-141), teks ditulis agen dan belum dinilai guru (`reviewStatus` tetap `draft`), wiring lewat `npm run content:explanation:wire` yang idempoten (`--force` untuk menimpa teks berbeda; gagal bila ada paket matematika tanpa teks) (`tsc` bersih, `npm test` 173/173, build PASS, validator 48/48 VALID, E2E `explanation` 7/7)**; a11y 19/19 PASS, E2E smoke/activities/journey/mode-switch/player-fullscreen/quiz-coverage/material-viewer/material-import/material-pin/pinned-materials/material-catalog/material-studio PASS; sisa prasyarat: review manusia, deploy sisi platform + kunci konten produksi di `IFP_CONTENT_KEYS`

## Selesai sesi ini

| ID | Task | Hasil |
|---|---|---|
| T-000 | Inisialisasi knowledge OS | 20 artefak knowledge + state engine |
| T-001 | Fase A â Git + ADR | Repo Git, commit `503c2fc`, ADR-0001/0002 |
| T-002 | Fase C â app shell | Tauri 2 + React 19 + TS + Vite + Tailwind; 8 layar placeholder |
| T-003 | Fase D â schema konten | Zod schema v1 + validator + verifikasi hash + CLI + JSON Schema |
| T-004 | Prasyarat materi | Proposal OD-1, rubrik review pedagogis, ADR-0003 |
| T-005 | Pilot konten draft | `matematika-kelas3-pecahan` v0.1.0: 1 lesson, 2 aktivitas, 4 diagram; VALID |
| T-006 | Pratinjau Player | Paket pilot dirender di layar Player: eksplorasi 4 langkah + kuis + skor; desktop & mobile lulus |
| T-007 | Fase E â repository lokal | SQLite native + migrasi + 4 command; hasil kuis tersimpan atomik; layar Hasil Belajar |
| T-008 | Fase I â sinkronisasi | Outbox state native + engine TS + kontrak + mock server; 1 event acknowledged E2E |
| T-008b | Backend sinkronisasi referensi | HTTP server TS + SQLite; auth, idempotensi, batas, rate limit; 11 test + E2E nyata |
| T-010 | Review teknis konten | R11/R7/R10/R12; temuan kontras diperbaiki; laporan review ditulis |
| T-009 | Device spike (readiness) | Android init + build debug PASS (APK 129 MB); install/launch & Windows 11 NOT RUN |
| T-011 | Fase F â Content Manager | Impor folder, validasi native, staging, aktivasi atomik, rollback; E2E v1âv2ârollback PASS |
| T-012 | Content Runtime wiring | Player memuat paket impor aktif (managed-first) + aset via blob; E2E judul v2 & rollback PASS |
| T-013 | Katalog multi-paket | `content_list_active` + pemilih paket; E2E 2 paket (Matematika & IPA) ganti judul PASS |
| T-014 | Fase H â License core | Ed25519 canonical, verifikasi native, import offline, status UI, test vectors; E2E PASS |
| T-015 | License Service referensi | Aktivasi/refresh/verify/transfer/deactivate; serial hash; E2E aktivasi online PASS |
| T-016 | Backup & Restore | SQLite backup API + manifest + integrity + restore dengan guard schema; UI Pengaturan |
| T-017 | Windows release candidate | `tauri build` PASS; MSI 4.21 MiB + NSIS 2.94 MiB; belum install/sign/release |
| T-018 | Diagnostics export | JSON native dengan counts/status; redaksi ID & tanpa secret; UI Pengaturan |
| T-019 | Ekspor hasil belajar CSV | CSV BOM/CRLF, escaping + anti injection; UI Hasil Belajar |
| T-020 | Profil, sesi, preferensi | Profil lokal + aktif, sesi per profil, preferensi animasi/teks; E2E PASS |
| T-021 | Sinkronisasi otomatis | Scheduler 10 dtk/online/outbox/5 menit; E2E tanpa klik â server menerima 1 event |
| T-022 | CI + harness E2E | Workflow web+Rust, `npm run ci`, `npm run e2e` (CDP, data terisolasi); smoke 7 pemeriksaan |
| T-023 | Siklus hidup profil | Rename (unik, 1â80) + hapus dua langkah; proteksi profil terakhir; hapus data transaksional; E2E PASS |
| T-024 | Audit aksesibilitas | `npm run a11y` 8 layar + keyboard; kontras & heading diperbaiki; 0 error/0 warning |
| T-025 | E2E alur belajar | `npm run e2e:journey`: impor paket, Player managed, eksplorasi, kuis 100, sesi/attempt/outbox, Hasil Belajar; 11 pemeriksaan |
| T-026 | E2E rollback konten | `npm run e2e:rollback`: impor v0.1.0 â v0.2.0 â rollback â v0.1.0; badge/judul/status paket; 9 pemeriksaan |
| T-027 | E2E lisensi | `npm run e2e:license`: key Ed25519 per run via `IFP_LICENSE_KEYS`; impor valid, expired ditolak, signature rusak ditolak, lisensi lama tetap aktif; 8 pemeriksaan |
| T-028 | E2E aktivasi online | `npm run e2e:license-online`: server referensi + key sementara; aktivasi serial â native verify â server audit; serial tak dikenal ditolak; 7 pemeriksaan |
| T-029 | A11y reflow & state dinamis | `npm run a11y`: 8 layar + reflow 320/640 + teks 200% + target sentuh + konfirmasi hapus; 15 pemeriksaan, 0 warning |
| T-030 | Beranda & Jelajah Materi | Katalog per lesson (bundled + impor, managed menang), filter kelas/mapel/cari, pilih lesson â Player, kartu âLanjutkan belajarâ; 6 unit test + E2E 8 pemeriksaan |
| T-031 | Aktivitas benar-salah & jawaban singkat | `responseText` di kontrak lokal/sync; UI radio Benar/Salah + input teks; normalisasi jawaban; remount per aktivitas; E2E 5 pemeriksaan |
| T-032 | Pilihan ganda multi-jawaban | Checkbox, penilaian himpunan (tanpa nilai parsial), satu baris respons per opsi; E2E 6 pemeriksaan; harness menunggu shell |
| T-033 | Aktivitas matching & ordering | Kontrak `pairs`/`items+correctOrder` divalidasi Zod; UI select & naik/turun; skor per pasangan/posisi; E2E 5 aktivitas |
| T-034 | E2E backup â restore | Export/inspect (hash), mutasi, restore (profil/sesi/attempt/skor pulih), tolak schema lebih baru; 9 pemeriksaan |
| T-035 | A11y hasil kuis + preflight | `npm run a11y` 16 pemeriksaan: state hasil kuis diaudit; harness menolak start bila app masih berjalan |
| T-036 | Fase J â review konten lokal | Migrasi `0005`; RBAC guru native; ledger append-only + UI; audit & guard hapus profil reviewer; E2E 7 pemeriksaan |
| T-037 | Fase J â ekspor audit review | CSV BOM/CRLF + anti-injection; hanya guru; tolak overwrite; E2E 9 pemeriksaan |
| T-038 | OD-4 default privasi | Bagian âPrivasi & dataâ; peringatan PII pada ekspor CSV hasil/review; ADR-0025 provisional; smoke 8 pemeriksaan |
| T-039 | OD-5 default lisensi | Clock rollback (last-seen 5 mnt); permintaan transfer (licenseId/machineId/alasan); UI + 4 test Rust; E2E 10 pemeriksaan |
| T-040 | OD-7 increment 1 | OpenAPI v1; enrollment perangkat + token HMAC; sync menerima token perangkat; `/healthz`; 4 test server baru |
| T-041 | OD-7 increment 2 (Supabase + Cloudflare) | Migrasi **aditif** `0002_app_backend.sql` (setelah skema web); Worker enrollment/sync (WebCrypto HMAC, Supabase REST); 7 test Worker |
| T-042 | Konten Kelas 4 Semester 2 lengkap | 28 paket draft (7 mapel Ã 4 bab); batch 13 menutup Seni B05âB07, PJOK B05âB07, PAI B05âB08; VALID + impor PASS; total 56 paket |
| T-043 | Konten Kelas 3 â outline + batch 1 | Outline S1/S2; 4 paket B01 (Matematika, Bahasa Indonesia, IPAS, Pancasila) VALID + impor PASS; filter Kelas 3 terverifikasi; total 60 paket |
| T-044 | Konten Kelas 3 lengkap | 52 paket sisa (S1 B02âB04 + S2 B05âB08) VALID; impor 56/56 PASS; E2E home 9/9; bundle utama 415 kB + lazy 86 kB; total 112 paket |
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
| T-056 | Konten Kelas 1â6 inti lengkap | 42 paket sisa Kelas 2 VALID; impor 48/48 PASS; **total 320 paket** (Fase A 96 + B/C 224); audit 320/320 VALID |
| T-057 | Performa katalog 320 paket | Indeks `public/content-catalog.json` build-time (ADR-0031); Beranda 8,7 dtk (sebelumnya timeout >180 dtk); E2E home 9/9 PASS |
| T-058 | Blocker B-03: transfer/deactivate Worker | `licenseAdmin.ts` + token admin provisial (ADR-0032); 13/13 Worker test; typecheck PASS; deploy menunggu secret |
| T-059 | Checklist B-01 & B-04 | Checklist signing Windows/Android/updater + SMTP/DNS/reset end-to-end; siap dijalankan saat kredensial tersedia |
| T-060 | Checklist B-02/05/06/07/08 | Runbook backup/rotasi kunci, DV perangkat, review R1âR12, pembersihan secret, keputusan signature konten |
| T-061 | Cek konsistensi indeks katalog | Checker membandingkan 320 entri vs paket; masuk `npm test`; negative test exit 1; status OK 320/320 |
| T-062 | Lembar kerja review R1âR12 | CSV 320 baris + panduan Markdown per kelas/mapel; R10 BLOCKED-D6, R11 pre-verified |
| T-063 | Verifikasi P0 | Worker live masih 501; 3 file secret `%TEMP%` masih ada; backup kunci belum ditemukan; urutan B-02âB-07âB-03 |
| T-064 | Analisis gap kualitas 320 paket | 0/320 memenuhi G1âG12; semua 3 langkah/2 aktivitas/4â6 item; 16 paket aktivitas identik; 61 aset dipakai ulang; 54 tujuan belum tercakup penuh |
| T-065 | Pilot gold Kelas 4 B01 | 4 paket v0.2.0: 5 langkah, 3 aktivitas, 10 item, 4 tujuan; aset unik; 11/12 G PASS; G10 review manusia |
| T-066 | G8 pilot selesai | `curriculumRefs` fase-b/2024 diisi provisional (ADR-0033); validator 4/4 VALID 0 warning; G8 4/320 |
| T-067 | Inventaris aset + prompt pack | CSV 320 aset (82 hash, 61 reuse) + 333 prompt (6 cover kelas, 7 cover mapel, 320 materi) untuk Google Flow |
| T-068 | Review teknis 320 paket + lembar keputusan OD-1 | [Review 2026-10-26](../content/REVIEW_REPORT_2026-10-26_ALL_DRAFTS.md) (320/320 valid; R10 4/320; kedalaman 316 belum) + [lembar keputusan](../content/OD1_DECISION_SHEET_2026-10-26.md) D1âD8 |
| T-069 | Persetujuan PO OD-1 | D1âD8 disetujui Product Owner 2026-10-26 ([ADR-0034](../decisions/ADR-0034-od1-curriculum-matrix-po-approval.md)); Curriculum Lead belum tanda tangan; `curriculumRefs` belum diisi |
| T-070 | Pengayaan kedalaman & diferensiasi 320 paket | 316 paket warisan dinaikkan ke â¥5 langkah/â¥3 aktivitas/â¥8 item; 3 paket duplikat persis didiferensiasi; review ulang 320/320 VALID, 0 grup duplikasi; `npm test` 85/85, build PASS |
| T-071 | Persetujuan Curriculum Lead + `curriculumRefs` | D1âD8 disetujui Curriculum Lead via instruksi sesi 2026-10-26; 316 refs diisi via `scripts/fill-curriculum-refs.mjs`; R10 **320/320**; review 320/320 VALID |
| T-072 | Pra-review agent R1âR6/R8âR9/R12 | 320 paket dipindai deterministik: R1 66 paket sinyal, R3 40, R4 0, R5 184 (170 matching identik dengan langkah eksplorasi, 91 bias posisi kunci), R6/R8/R9 bersih, R12 1 temuan label PAI. **Bukan approval**; `reviewStatus` tetap `draft` â [laporan](../content/PEDAGOGICAL_PREREVIEW_2026-10-26.md) |
| T-073 | Perbaikan pemuatan paket bawaan | `packageDirOf` di `src/content/loadPackages.ts` salah menurunkan direktori untuk modul `lessons/`/`activities/`, sehingga Player menampilkan âPaket bawaan gagal divalidasiâ dan Beranda 0 paket. Diperbaiki + unit test `loadPackages.test.ts`; paket bawaan terbuka di Player |
| T-074 | Dokumen review UX/UI gabungan | 7 screenshot full-page + audit kode + review eksternal digabung menjadi [`design/UX_REVIEW_LAYOUT_PEMBELAJARAN_2026-10-26.md`](../design/UX_REVIEW_LAYOUT_PEMBELAJARAN_2026-10-26.md): 20 temuan (5 P1, 10 P2, 5 P3), 8 prinsip UX, matriks 10 state interaksi, checklist 13 item, rekomendasi dua mode, baseline skala IFP, roadmap P0âP3, 6 keputusan terbuka. Berkas eksternal `.md` (337 baris/14.998 byte) diunduh & isinya digabung; 4 klaimnya dikoreksi setelah cek kode. **Bukan approval**; tidak ada usability test |
| T-075 | Eksekusi P0 UX yang tidak bergantung keputusan | 5 dari 6 butir P0 selesai: copy netral + istilah âSkorâ, `subjectLabel()` bersama (Home/Curriculum/Player/Results), token kontras `teal-strong`/`danger-strong`, breadcrumb Beranda jadi tombol + alasan disabled matching, satu pesan penyimpanan. Butir 3 (metadata internal) tertahan D-UX-1/D-UX-4. `npm test` 89/89, build PASS; verifikasi DOM + 1 screenshot |
| T-076 | UX-03 + a11y + E2E | Kartu hasil `tabIndex={-1}` + `scrollIntoView`/`focus()` setelah penilaian di kuis, mencocokkan, mengurutkan (3 komponen). Harness a11y & E2E diperbarui ke konten aktual (âKuis Penguatanâ, tombol âLanjut berlatihâ) dan 3 asersi fokus baru. `npm test` 89/89, build PASS, `npm run a11y` **PASS 16 pemeriksaan** (0 error, 7 warning reflow), E2E smoke 8/8 Â· activities 8/8 Â· home 9/9 Â· journey 11/11 Â· profile 7/7 |
| T-077 | Dua mode: belajar & admin (D-UX-1) | Mode belajar = shell selebar perangkat **tanpa sidebar**, bar navigasi 4 tujuan (Beranda, Jelajah Materi, Aktivitas Interaktif, Hasil Belajar), layar Konten/Lisensi/Pengaturan disembunyikan. Mode admin = sidebar lengkap seperti sebelumnya. Sakelar âBelajar/Adminâ di bilah atas (`aria-pressed`), tersimpan per perangkat (`preferences.appMode`, default `admin`; rekaman lama tetap terbaca). Layar di luar mode dialihkan ke Beranda. `npm test` 93/93, `cargo test` 64/64, build PASS, a11y **17 pemeriksaan PASS**, E2E baru `mode-switch` 5/5 + regresi 5 skenario PASS |
| T-078 | Sakelar mode ikon + thumbnail materi + rail + tile kelas | Sakelar mode kini **dua tombol ikon** (topi wisuda/slider), `aria-label` + `title`, target 44 px; persistensi tetap di SQLite `app_meta.preferences.appMode` (test baru `app_mode_survives_database_reopen`). Mode belajar memakai **rail ikon 80 px** (4 tujuan, label lewat tooltip + teks sr-only), bukan bar atas. Katalog membawa `coverAsset`; kartu Jelajah Materi dan kartu âLanjutkan belajarâ menampilkan thumbnail dari aset paket yang sudah ada (bundled via `import.meta.glob`, impor via `content_read_asset` â blob URL), fallback inisial subjek. Filter kelas berupa **tile thumbnail cover materi tiap kelas** (bukan dropdown) di dalam panel **collapsible** â header menampilkan chip kelas terpilih (âKelas Nâ), panel menutup otomatis setelah memilih dan bisa dibuka lagi; grid materi 3 kolom. `npm test` 93/93, `cargo test` 65/65, build PASS, a11y 17/17 PASS, E2E home **13/13** + mode **6/6** + regresi 4 skenario PASS |
| T-079 | Foto profil lokal + ilustrasi Beranda | **Foto profil**: tabel `profile_avatars` (migrasi `0006`, BLOB + `mime_type` PNG/JPEG/WebP, FK cascade), perintah `profile_avatar_set/clear/get` dengan sniff magic bytes + batas 1,5 MB, `ProfileView.hasAvatar`; data URL dikembalikan ke webview; Pengaturan memakai dialog native (`@tauri-apps/plugin-dialog`) untuk memilih/menghapus foto. **Beranda**: hero bergradasi tealâsurface dengan avatar bulat, eyebrow âRuang belajarâ, sapaan âHalo, {nama}â, dan **ilustrasi belajar** bingkai bergambar cover Flow yang sudah ada (pilihan: cover matematika kelas 3, fallback cover pertama) + aksen dekoratif; tanpa aset baru (aturan Flow-only). `cargo test` **67/67**, `npm test` PASS (fixture 4/4, catalog 320/320), build PASS, E2E `home-catalog` **14/14** (avatar + ilustrasi termuat, screenshot `hero-beranda.png`), a11y 17/17, mode-switch 6/6, profile-lifecycle 7/7, smoke 8/8 |

## Status prasyarat materi pembelajaran

| Prasyarat | Status | Bukti |
|---|---|---|
| Kontrak/schema paket konten | **DONE** | [SCHEMA.md](../content/SCHEMA.md), `schemaVersion 1.0.0` |
| Validator + test | **DONE** | `npm test` â 11/11 PASS; fixture VALID |
| Konten Kelas 4 draft | **DONE (draft)** | [Katalog](../content/CATALOG.md): 56 paket Kelas 4 (S1 28 + S2 28), VALID + 2 warning per paket; pilot kelas 3 dipindah ke fixture E2E |
| Konten Kelas 3 draft | **DONE (draft)** | 56 paket (S1 28 + S2 28), VALID + 2 warning per paket; impor 56/56 PASS |
| Konten Kelas 5 draft | **DONE (draft)** | 56 paket (S1 28 + S2 28), VALID + 2 warning per paket; impor 56/56 PASS |
| Konten Kelas 6 draft | **DONE (draft)** | 56 paket (S1 28 + S2 28), VALID + 2 warning per paket; impor 56/56 PASS |
| Fase B & C (Kelas 3â6) | **DONE (draft)** | 224 paket draft; Fase A dimulai |
| Konten Kelas 1 draft | **DONE (draft)** | 48 paket (S1 24 + S2 24), VALID + 2 warning per paket; impor 48/48 PASS |
| Konten Kelas 2 draft | **DONE (draft)** | 48 paket (S1 24 + S2 24), VALID + 2 warning per paket; impor 48/48 PASS |
| Konten inti Kelas 1â6 | **DONE (draft)** | **320 paket** (Fase A 96 + Fase B/C 224); semua VALID, `curriculumRefs` kosong |
| IPAS Kelas 1â2 (T-089) | **DONE (draft) â DI LUAR MATRIKS FASE A** | 16 paket (8 kelas 1 + 8 kelas 2), VALID; `curriculumRefs` fase-a provisional; IPAS tidak ada di daftar mapel Fase A OD-1 sehingga perlu keputusan Curriculum Lead |
| Daftar mapel/kurikulum (OD-1) | **DISETUJUI PO + CURRICULUM LEAD (via sesi) â 2026-10-26** | [lembar keputusan 2026-10-26](../content/OD1_DECISION_SHEET_2026-10-26.md) Â· [ADR-0034](../decisions/ADR-0034-od1-curriculum-matrix-po-approval.md) â D1âD8 disetujui kedua peran; tanpa tanda tangan tertulis; CP/ATP per bab belum diverifikasi |
| Rubrik review pedagogis | **TEKNIS PASS / PRA-REVIEW AGENT ADA / MANUSIA BELUM** | [Review teknis 2026-10-26](../content/REVIEW_REPORT_2026-10-26_ALL_DRAFTS.md): 320/320 valid; kedalaman 320/320; 0 duplikasi; R10 320/320 (phase-level) Â· [Pra-review agent R1âR6/R8âR9/R12](../content/PEDAGOGICAL_PREREVIEW_2026-10-26.md) (bukan approval) |
| Reviewer manusia ditunjuk | **BELUM** | Butuh guru/curriculum lead |
| Penyimpanan hasil lokal | **DONE** | SQLite native, transaksi attempt+respons+progress+outbox |
| Hak/lisensi aset | **TERDOKUMENTASI** | 320 aset internal via Google Flow (inventaris + laporan batch); tanpa lisensi pihak ketiga |

## Next task

**T-005b â Review Kelas 4 + sign-off OD-1** (butuh keputusan/reviewer manusia)
1. â Review teknis 320 paket (2026-10-26): 320/320 valid + hash; R10 4/320; R5 struktur bersih (1 peringatan lunak); kedalaman 320/320 memenuhi standar; 0 grup duplikasi persis/aktivitas identik â [laporan review](../content/REVIEW_REPORT_2026-10-26_ALL_DRAFTS.md).
2. â Product Owner **dan Curriculum Lead** menyetujui D1âD8 (2026-10-26, via instruksi sesi; tanpa tanda tangan tertulis) â [ADR-0034](../decisions/ADR-0034-od1-curriculum-matrix-po-approval.md) Â· [lembar keputusan OD-1](../content/OD1_DECISION_SHEET_2026-10-26.md).
3. â Isi `curriculumRefs` 316 paket â selesai via `scripts/fill-curriculum-refs.mjs`; R10 **320/320** (fase A/B/C, versi 2024). â³ Verifikasi CP/ATP per bab tetap pekerjaan Curriculum Lead.
4. â Perbaiki kedalaman (â¥5 langkah/â¥3 aktivitas/â¥8 item) dan duplikasi â T-070 (2026-10-26): 316 paket warisan diperkaya; 320/320 memenuhi ambang; 0 duplikasi.
5. â³ Tunjuk reviewer manusia (curriculum + bahasa + aksesibilitas); `reviewStatus` tetap `draft` sampai semua R1âR12 LULUS.
6. â Pra-review agent R1âR6/R8âR9/R12 selesai 2026-10-26 (T-072): bukti per paket + sampel baca 40 paket + CSV flag, **tanpa PASS/FAIL**. Reviewer manusia memakai paket ini sebagai bahan, bukan pengganti penilaian.

**T-009 acceptance â BLOCKED** (tidak ada perangkat Android 14 fisik / Windows 11 / panel 4K; lihat [readiness](../device/DEVICE_SPIKE_READINESS.md)).

**T-012 Content Runtime wiring â DONE.**
**T-013 Katalog multi-paket â DONE.**
**Fase H License core â DONE (online service referensi juga).**

**Berikutnya:** empat temuan review 10 paket sudah diterapkan (T-097: F-03/F-04; T-098: F-01/F-02) dan utang kosmetik F-05 sudah dibereskan (T-099: 39 pasangan di 27 paket). Sisa pekerjaan konten: **tanda tangan guru manusia** atas daftar di BACKLOG â termasuk memastikan daftar varian jawaban teks (F-02) memadai dan menyetujui pilihan "teks menyesuaikan gambar" untuk IPAS kelas 4 (F-01); **F-06** diputuskan 2026-10-28 (T-100) sebagai utang desain â aturan authoring untuk batch berikutnya sudah ditetapkan dan guru memilih pasangan yang perlu ditulis ulang dari daftar 309 pasangan / 160 paket, tanpa penulisan ulang massal. Lalu review manusia R1âR6/R8âR9/R12 untuk 320 paket (bahan pra-review agent tersedia di [PEDAGOGICAL_PREREVIEW_2026-10-26.md](../content/PEDAGOGICAL_PREREVIEW_2026-10-26.md)) + verifikasi CP/ATP per bab; lalu opsi D3 (Bahasa Inggris), D5 (mulok), Koding & KA. Sinyal R5 mekanis sudah dibersihkan 2026-10-27 (T-091) dan volume latihan kelas 1â6 sudah 5â10 item per aktivitas dinilai (T-092) â laporan pra-review 2026-10-26 tetap sebagai bukti historis, angka terbaru ada di handoff T-091/T-092/T-096/T-097/T-098/T-099. Blocker rilis: [RELEASE_BLOCKERS_2026-10-24.md](../api/RELEASE_BLOCKERS_2026-10-24.md) â 8 item, belum ada yang selesai. Register gap: [TEST_GAPS.md](../testing/TEST_GAPS.md).

**Baru selesai (T-116):** materi HTML5 terpasang bisa disematkan ke Beranda lewat tombol `Sematkan`/`Disematkan` di daftar "Materi terpasang" (layar Konten). Batas **24 sematan dipakai bersama** paket dan materi (satu penghitung `count_pins`), kartu materi muncul di tab "Materi disematkan" bersama kartu paket (urut `pinned_at` turun), dan `Buka` pada kartu membuka penampil `MaterialViewer` tanpa pindah layar. **Langkah materi berikutnya:** tahap 3b ADR-0035 â katalog `/v1/materials`, unduhan + verifikasi `bundleSha256`, dan penandatanganan saat publish; ini memerlukan HTTP client baru di Rust (persetujuan dependensi terpisah) dan endpoint platform yang belum ada. Setelah itu `material_progress` + LRU (tahap 4).
## Verifikasi sesi ini

| Check | Hasil |
|---|---|
| Review 10 paket prioritas (T-096) | **SELESAI (agent, bukan guru)** â 141 item dibaca penuh: 58 soal kuis, 58 pasangan, 25 langkah urutan. Putusan: 1 **perlu perbaikan**, 1 perlu perbaikan kecil, 7 layak dengan catatan, 1 layak. 0 jawaban salah / 0 salah hitung. Laporan: [REVIEW_REPORT_2026-10-27_GURU_PRIORITAS_10.md](../content/REVIEW_REPORT_2026-10-27_GURU_PRIORITAS_10.md) |
| Jawaban singkat (T-096) | **CACAT TERVERIFIKASI** â `src/content/quiz.ts:33` membandingkan satu string persis (tanpa sinonim/varian angka-kata); 4 paket / 24 soal; 4 prompt terbuka ("Sebutkan satu ...") hanya menerima satu kata kunci, jawaban benar lain dihukum |
| Ilustrasi vs materi (T-096) | **CACAT TERVERIFIKASI** â `kelas4-ipas-b01-makhluk-hidup`: ilustrasi tidak memuat katak/capung, tetapi eksplorasi, `altText`, 2 pasangan, dan 1 soal menyebut keduanya |
| Kunci opsi terpanjang (T-096) | **0 paket** dengan kunci selalu terpanjang-**unik**; 6 paket hanya seri panjang (matematika, opsi angka/urutan) â utang BACKLOG ditutup sebagai positif palsu |
| Pasangan menyalin eksplorasi (T-096) | **TERUKUR** â 311/1.963 pasangan (15,8%) di 159 paket: sisi kanan identik `reveal` + sisi kiri â¥70% kata prompt eksplorasi; 28/58 pada 10 paket prioritas |
| Validator konten (T-096) | **PASS** â 336/336 VALID, 0 issue, 336 warning (draft) â konten tidak diubah oleh review |
| Perbaikan F-03 (T-097) | **DITERAPKAN** â `kelas4-ipas-b01-makhluk-hidup` soal-3 prompt â "Benda tak hidup yang ada di tepi kolam pada gambar adalah ..."; kunci tetap `batu`; jumlah soal/opsi tidak berubah |
| Perbaikan F-04 (T-097) | **DITERAPKAN** â `kelas6-pjok-b03-atletik` item ke-5 `langkah-rapi`/"Merapikan posisi" â `langkah-keluar-bak`/"Keluar dari bak lompat"; `correctOrder`, reveal eksplorasi langkah 2, dan `pasangan-2` diselaraskan; 5 item / 6 pasangan tetap |
| Validator konten (T-097) | **PASS** â 336/336 VALID, 0 issue, 336 warning (draft) setelah perbaikan |
| Volume aktivitas (T-097) | **PASS** â "Semua aktivitas dinilai berada dalam rentang target" |
| Unit test + fixture + katalog (T-097) | **PASS** â `Tests 105 passed (105)`, `4/4 fixture cocok dengan expected`, `catalog-index OK: 336 entri, 336 paket` |
| Perbaikan F-01 (T-098) | **DITERAPKAN** â `kelas4-ipas-b01-makhluk-hidup`: langkah 1 â "Ikan, siput, kupu-kupu, dan tumbuhan air"; altText 4 berkas â "Dua siswa mengamati kolam dengan ikan, siput di atas batu, kupu-kupu, dan teratai"; pasangan Katak/Capung â Siput/Kupu-kupu; soal "Capung bernapas" â "Kupu-kupu bernapas" (kunci `trakea` tetap); 0 sisa kata katak/capung |
| Perbaikan F-02 (T-098) | **DITERAPKAN** â `src/content/quiz.ts`: soal teks menerima daftar `correctResponse` + normalisasi NFKC/huruf/tanda baca/spasi; 14 soal di 4 paket mendapat alternatif; 5 unit test baru |
| Unit test pasca-F-01/F-02 (T-098) | **PASS** â `Tests 110 passed (110)` (15 berkas), `4/4 fixture cocok dengan expected`, `catalog-index OK: 336 entri, 336 paket` |
| Build (T-098) | **PASS** â `npm run build` (`tsc --noEmit` + vite) |
| E2E activities (T-098) | **PASS** â 14 pemeriksaan; termasuk "Aktivitas jawaban singkat dinilai 100 (normalisasi huruf) dan tersimpan", layout dua kolom, cover header blob, kartu kemajuan 1/5, ringkasan sesi, tombol Hasil Belajar |
| Pasangan berelipsis (F-05, T-099) | **DITERAPKAN** â 37 pasangan di 27 paket: `left` berelipsis â frasa petunjuk; 2 pasangan duplikat jawaban dibetulkan (`kelas1-seni-rupa-b05`: "Merah, kuning, dan biru" Ã2; `kelas6-matematika-b03`: "4 : 3" Ã2). Total **39 pasangan**; jumlah pasangan tetap **1.963**; tidak ada `pairId` ditambah/dihapus |
| Verifikasi F-05 (T-099) | **PASS** â detektor elipsis ulang **0/1.963**; duplikat kiri/kanan **0** pada 27 paket terdampak; validator **336/336 VALID** (0 issue, 336 warning draft); volume gate "Semua aktivitas dinilai berada dalam rentang target"; `npm test` **110/110** (15 berkas) + fixture 4/4 + katalog 336/336; `npm run build` **PASS** |
| E2E setelah F-05 (T-099) | **NOT RUN** â perubahan hanya teks `left`/`right` pada aktivitas matching; tidak ada perubahan kode/UI. Skenario `activities` memakai paket fixture sendiri, jadi tidak merender paket yang disunting |
| Keputusan F-06 (T-100) | **DIPUTUSKAN â utang desain, tanpa penulisan ulang massal** â diukur ulang: **309 pasangan / 160 paket** dari 1.963 (84 pasangan tumpang tindih 100% kata prompt, 40 paket memuat â¥3 pasangan; angka historis 311/159). Aturan authoring batch berikutnya: sisi kiri **<70%** kata prompt eksplorasi dan tanpa kata kunci jawaban. Daftar seleksi guru: [F06_MIRROR_PAIRS_2026-10-28.csv](../content/F06_MIRROR_PAIRS_2026-10-28.csv) (309 baris, 7 kolom) |
| Verifikasi F-06 (T-100) | **PASS (lingkup dokumen)** â CSV dihitung dari `.tmp-assets/r5-focused.json`: 309 baris data + header, 160 `packageId` unik; tidak ada berkas konten/kode yang diubah, jadi validator/`npm test`/build **tidak dijalankan ulang** (angka terakhir tetap 336/336 VALID, 110/110, PASS pada T-099) |
| Parameterisasi tanggal & penjaga bukti (T-101) | **PASS** â `scripts/lib/reviewOutput.mjs`: `--date YYYY-MM-DD` (default hari ini), `--out-dir`, `--force`; tanpa `--force` skrip menolak menimpa berkas bertanggal yang sudah ada (diuji: exit 1 + daftar berkas; `--force` exit 0) |
| Detektor longgar F-06 di skrip baku (T-101) | **PASS** â `scripts/lib/mirrorPairs.mjs` menghasilkan **309 pasangan/160 paket** yang identik dengan CSV F-06 (kunci `packageId + aktivitas + pairId + wordOverlap`, 0 selisih); laporan pratayang menampilkan metrik informasi R5 (**bukan** flag); CSV menambah kolom `explorationCopies` + `explorationCopyShare` |
| Verifikasi alat T-101 | **PASS** â pratinjau ditulis ke `.tmp-assets/` tanpa menyentuh bukti `2026-10-26`: pratayang pedagogis 336 paket, laporan teknis 336 paket; `npm test` 110/110 + fixture 4/4 + katalog 336/336; `npm run build` PASS; `npx tsc --noEmit` exit 0 |
| `analyze-content-quality` bertanggal (T-102) | **PASS** â skrip memakai `parseReviewArgs`/`ensureWritable` yang sama: `--date`/`--out-dir`/`--force`, keluaran `QUALITY_GAP_<tanggal>.md` + `quality-gap-<tanggal>.json`; tanpa `--force` exit 1 dengan daftar berkas, `--force` exit 0 |
| Angka analisis gap hari ini (T-102) | **PASS (informasi, bukan approval)** â dijalankan pada 336 paket: G1/G2/G3/G5/G6/G7/G8/G9/G11/G12 semuanya 336/336, G4 (tujuan tercakup penuh) 295/336, G10 (sudah direview manusia) 0/336, duplikasi persis 0 grup, aktivitas identik 0 grup, 336 hash aset unik. Satu paket menampilkan opsi berbeda **hanya kapitalisasi** (`kelas1-bahasa-indonesia-b05-membaca-kalimat`, soal "Kalimat yang benar") â dicatat sebagai catatan, bukan duplikat |
| Koreksi detektor G11 (T-102) | **PASS** â detektor lama membandingkan opsi tanpa membedakan kapitalisasi sehingga menandai paket yang justru menguji kapitalisasi; laporan 2026-10-25 mencatat 319/320, seharusnya 320/320. Kini duplikat = teks **persis** per soal, kapitalisasi-saja dilaporkan terpisah; hasil 336/336 (0 duplikat) |
| Deep link Player (T-103) | **DITERAPKAN** â `#player/<packageId>[/<lessonId>]`: `buildPlayerHash`/`parsePlayerHash` di [playbackSelection.ts](../../src/state/playbackSelection.ts) menolak layar lain, segmen ekstra, id kosong, dan escape rusak; `initialScreen()` memulihkan seleksi dari hash saat boot; `navigate()` menulis deep link untuk layar Player; Player menyelaraskan hash dengan materi yang benar-benar tampil (tanpa lesson â lesson pertama, paket tak dikenal â paket pertama, tidak ada id palsu tertinggal). 4 unit test baru |
| Unit/build T-103 | **PASS** â `npm test` **114/114** (15 berkas) + fixture 4/4 + katalog 336/336; `npm run build` exit 0 |
| E2E player-deeplink (T-103) | **PASS 7/7** â muat ulang di `#player/kelas6-pai-b06-zakat/zakat` membuka "Zakat dan Infak"; `#player/kelas1-ipas-b01-tubuh-dan-indera` â lesson pertama dan hash dilengkapi (`â¦/tubuh-dan-indera`); paket tak dikenal â "Mengenal Huruf dan Suku Kata" + hash diperbaiki dan stabil setelah muat ulang; buka materi dari katalog menulis `#player/kelas3-matematika-b04-pecahan/pecahan-sederhana`; muat ulang tetap di materi yang sama |
| Regresi E2E pasca T-103 | **PASS** â `home-catalog` **28/28** dan `learning-journey` **11/11** (buka materi lintas paket, eksplorasi, kuis 100, simpan lokal) |
| `npm run a11y` (T-103) | **PASS 17/17** (0 error, 7 warning) pada **dua percobaan berturut-turut**, setelah 4 percobaan gagal sebelumnya: 3Ã timeout `Tersimpan lokal` dengan banner tetap "Penyimpanan lokal siapâ¦" (skor 100 tampil, tidak ada exception, "Menyimpan hasil belajar" tidak pernah muncul) dan 1Ã halaman blank setelah BerandaâJelajah (audit 0 elemen). **Akar masalah tidak ditemukan** â lihat utang teknis di BACKLOG. Harness kini merekam konsol halaman (`Runtime.consoleAPICalled`/`exceptionThrown`) dan riwayat teks banner saat timeout |
| Ikatan putusan review (T-104) | **DITERAPKAN** â migrasi `0007_content_review_binding` menambah `content_reviews.content_sha256` + `rubric_version`; baris lama **NULL** (dibuat sebelum ikatan ada, karena itu tidak sah untuk isi sekarang). `review_record` menolak digest yang bukan 64 heksadesimal, menormalkan ke huruf kecil, dan menyimpan `RUBRIC_VERSION = "1"`; ekspor CSV menambah kolom `content_sha256`,`rubric_version`. Sidik jari = SHA-256 JSON kanonik paket **setelah validasi** (kunci diurut, `reviewStatus`/`releaseState`/`signature` dibuang, lesson/aktivitas diurut per id) karena schema Zod menambah default sehingga objek tervalidasi â  JSON mentah |
| Alat verifikasi ikatan (T-104) | **PASS** â `npm run content:review-binding` memindai 336 paket + berkas attestation (`knowledge/content/review-attestations/`): menolak approved tanpa digest sah, paket tak dikenal, isi tak tervalidasi, digest tidak cocok, dan paket non-`draft` tanpa putusan terikat. Keadaan sekarang: 0 attestation â "tidak ada yang perlu diverifikasi" (exit 0); CSV sintetis 3 baris dengan 1 digest salah â exit 1 menyebut reviewer yang harus menilai ulang |
| Sampling audit review (T-104) | **PASS** â `npm run content:review-sample -- --n 5 --seed <nilai>` mengurutkan `sha256("<benih>|<packageId>@<version>")` lalu mengambil n teratas (deterministik: benih sama â sampel sama). Keluaran memuat reviewer/tanggal/catatan, status cocok sidik jari, berkas lesson/aktivitas, volume item, dan checklist R1âR12 untuk diisi manusia. Digest menyimpang â exit 1. Uji sintetis: benih `uji-2026-10-28` memilih 3/3 paket, 1 mismatch terdeteksi |
| Unit/Rust T-104 | **PASS** â `npm test` **120/120** (16 berkas; 6 test `packageDigest` baru) + fixture 4/4 + katalog 336/336 + binding PASS Â· `cargo test` **71/71** (8 test `review::`; 3 baru: bentuk digest, normalisasi huruf kecil, kolom CSV) Â· `npm run build` exit 0 |
| E2E content-review (T-104) | **PASS 9/9** â review guru mencatat digest 64-hex + `rubricVersion` `1`; ekspor CSV memuat header dan digest baru; siswa tetap ditolak `REVIEW_FORBIDDEN` (validasi digest ditempatkan **setelah** cek peran); screenshot diperiksa |
| Batas ikatan (T-104) | **BELUM TAMPER-PROOF** â digest dihitung klien (Rust tidak membaca isi paket bawaan), identitas reviewer = nama profil lokal yang diisi sendiri, dan attestation berupa CSV biasa di `knowledge/`. Tanda tangan Ed25519 atas putusan (L3) belum ada |
| Hierarki tombol eksplorasi (T-105) | **DITERAPKAN** â sebelumnya "Tampilkan penjelasan" bergaya primer (biru) berdampingan dengan "Lanjut" yang juga primer, sehingga dua aksi bersaing; kini petunjuk + penjelasan menjadi **satu baris tombol sekunder** dengan status tertekan (`border-primary/40 bg-primary/5`) dan `aria-controls` ke panelnya, sedangkan navigasi pindah ke **baris footer** bergaris atas: `Sebelumnya` sekunder (nonaktif di langkah 1) di kiri, satu tombol primer `Lanjut`/`Selesai` di kanan. Panel selesai ikut disamakan (`Ulangi eksplorasi` sekunder, `Lanjut berlatih` primer) |
| E2E learning-journey (T-105) | **PASS 14/14** (naik dari 11) â 9 asersi baru: tepat **1** tombol bergaya primer dalam lingkup eksplorasi, petunjuk & penjelasan satu induk, keduanya bukan primer, `Sebelumnya` bukan primer + nonaktif di langkah 1, footer navigasi dipisah `border-top` dan tidak memuat tombol dukungan, `aria-controls` petunjuk menunjuk panel yang benar-benar muncul saat `aria-expanded=true`, panel penjelasan muncul setelah tombolnya diklik |
| Artefak visual T-105 | **DIPERIKSA** â `.tmp-e2e/<run>/exploration-buttons.png` (digulir ke baris kontrol): prompt â dua tombol sekunder sebaris â panel petunjuk & penjelasan â garis pemisah â `Sebelumnya` nonaktif + `Lanjut` primer |
| Regresi E2E T-105 | **PASS** â `activities` **14/14** dan `player-deeplink` **7/7** (keduanya membuka Player dengan tombol eksplorasi) |
| Unit/build/a11y T-105 | **PASS** â `npm test` **120/120** (16 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `npm run build` exit 0 Â· `npm run a11y` **17/17** (0 error, 7 warning) pada percobaan pertama Â· `cargo test` tidak dijalankan (tanpa perubahan Rust) |
| Batas T-105 | **BELUM KOMPONEN BERSAMA** â gaya tombol masih kelas Tailwind inline per komponen (tidak ada `Button`), jadi hierarki ini belum dijamin konsisten di layar lain; belum ada uji visual 320 px khusus footer eksplorasi (reflow 640/320 hanya lulus tanpa error) |
| Sematan materi (T-106) | **DITERAPKAN** â migrasi `0008_pinned_lessons` (`profile_id, package_id, lesson_id, pinned_at`; PK gabungan; FK `profiles(id) ON DELETE CASCADE`; indeks `(profile_id, pinned_at DESC)`); [pins.rs](../../src-tauri/src/pins.rs) membatasi **24** sematan/profil (`VALIDATION_FAILED`), id 1â120 karakter, profil tak dikenal â `PROFILE_NOT_FOUND`, sematkan ulang saat penuh tetap boleh (idempoten), lepas sematan idempoten; perintah `pinned_list`/`pinned_set`. Tombol `Sematkan`/`Disematkan` (`aria-pressed`) ada di tiap kartu Jelajah Materi; Beranda membaca sematan per profil aktif |
| Beranda default T-106 | **DIGANTI T-107** â dulu tiga seksi bertumpuk dalam urutan Materi disematkan â Materi tersedia â Jelajahi materi; sejak T-107 ketiganya menjadi tab yang saling menggantikan. Sematan dimuat terpisah dari katalog agar kegagalan salah satu tidak mengosongkan panel lain; pratinjau browser menampilkan pesan âtidak menyimpan sematanâ |
| E2E pinned-materials (T-106) | **PASS 8/8** (dua percobaan berturut-turut) â urutan seksi + tiga judul, empty state membuka katalog, tombol berubah `Disematkan` (`aria-pressed=true`), kartu muncul di Beranda dengan thumbnail + `Kelola sematan`, sematan bertahan setelah muat ulang dan terbaca `pinned_list` dari SQLite, status sematan terbaca ulang di katalog, `Lepas` mengembalikan empty state, dan `pinned_list` kosong setelah muat ulang |
| Unit/Rust/build/a11y T-106 | **PASS** â `npm test` **120/120** (16 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `cargo test` **77/77** (6 test `pins::` baru) Â· `npm run build` exit 0 Â· `npm run a11y` **17/17** (0 error, 7 warning) |
| Regresi E2E T-106 | **PASS** â `home-catalog` **28/28** dan `learning-journey` **14/14**; `activities` gagal sekali pada tunggu âsimpan benar-salahâ (banner tetap âPenyimpanan lokal siapâ) lalu **14/14** pada eksekusi ulang â flake jalur simpan yang sudah tercatat di BACKLOG sejak T-103, bukan perubahan T-106 |
| Batas T-106 | **KATALOGâBERANDA SAJA** â sematan tidak tampil di layar lain, tidak ada penataan urutan manual (urut `pinned_at DESC`), batas 24 belum bisa diubah pengguna, dan sematan per profil tidak disinkronkan ke server (outbox hanya event belajar) |
| Tab Beranda (T-107) | **DITERAPKAN** â tiga seksi Beranda digabung menjadi satu kontrol `role="tablist"` berlabel "Bagian Beranda" dengan tiga `role="tab"` (`Materi disematkan`, `Materi tersedia`, `Jelajahi materi`), masing-masing `aria-controls` ke `role="tabpanel"` (`home-panel-<id>`) yang selalu ada di DOM dan disembunyikan lewat atribut `hidden`; roving `tabIndex`, panah kiri/kanan + Home/End memindahkan tab sekaligus fokus. Tab sematan menampilkan jumlah sematan sebagai lencana `aria-hidden`. Petunjuk tab sematan diperbarui menjadi "tersimpan per profil dan selalu tampil lebih dulu" |
| Default tab T-107 | **DITERAPKAN** â Beranda terbuka di **Materi disematkan** bila profil punya sematan; bila sematan kosong (atau gagal dimuat tanpa sematan), Beranda terbuka di **Materi tersedia** sesuai permintaan PO. Pilihan manual pengguna tidak ditimpa oleh efek default; melepas sematan terakhir langsung memindahkan tampilan ke **Materi tersedia**. Pilihan tab belum diingat antar kunjungan (selalu kembali ke aturan default) |
| Empty state sematan (T-107) | **DIPERTAHANKAN** â tab sematan tetap punya empty state "Belum ada materi yang disematkan" dengan tombol `Buka Jelajah Materi`; judul kartu sematan diubah dari `h3` menjadi paragraf (`data-pinned-title`) agar hierarki heading tidak melompat (h1 â h3) ketika seksi tidak lagi punya `h2` sendiri |
| E2E pinned-materials (T-107) | **PASS 11/11** â tiga tab berlabel benar + `aria-controls` menunjuk panel `tabpanel` valid, tanpa sematan tab aktif `Materi tersedia` dan hanya panel itu yang tampil, hanya tab aktif di urutan Tab, panah kanan/End/Home memindahkan tab & fokus, tab sematan menampilkan empty state lalu membuka katalog, sematan membuat tab sematan jadi default, sematan bertahan setelah muat ulang, `Lepas` memindahkan tampilan ke `Materi tersedia`, dan `pinned_list` kosong setelah muat ulang |
| Regresi E2E T-107 | **PASS** â `home-catalog` **28/28**, `learning-journey` **14/14**, `activities` **14/14** |
| Unit/build/a11y T-107 | **PASS** â `npm test` **120/120** (16 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `npm run build` exit 0 Â· `npm run a11y` **17/17** (0 error, 7 warning) Â· `cargo test` tidak dijalankan (tanpa perubahan Rust) |
| Batas T-107 | **BELUM DIINGAT** â pilihan tab tidak disimpan; panel Beranda hanya memuat satu tab sekaligus (sejak T-108 seksi Lanjutkan belajar/Ringkasan/Aktivitas terbaru dipindah ke atas tab sebagai tiga kolom tetap); kontras tab aktif diuji a11y tetapi mode gelap belum ada |
| Ringkasan tiga kolom (T-108) | **DITERAPKAN** â [HomeScreen.tsx](../../src/screens/HomeScreen.tsx) menaruh `<section data-home-overview>` tepat setelah banner galat dan sebelum tablist: grid `lg:grid-cols-3` berisi `data-resume-column` (Lanjutkan belajar: thumbnail 16:9, judul, paket Â· kelas, tombol `Lanjutkan`), `data-summary-column` (tiga kartu angka Sesi/Percobaan/Rata-rata, `content-start` agar tidak melar setinggi kolom), dan `data-recent-column` (maks 3 aktivitas + `Lihat semua hasil` di dasar kolom). Ketiga kolom selalu dirender agar grid tidak bergeser; keadaan kosong berupa `data-resume-empty` ("Belum ada materi yang sedang dipelajariâ¦"), pesan pratinjau browser, dan "Belum ada aktivitas yang dinilai." Blok lama yang bertumpuk di bawah tab (kartu lanjutkan, Ringkasan `sm:grid-cols-3`, Aktivitas terbaru) dihapus agar tidak ada judul ganda |
| E2E home-catalog (T-108) | **PASS 28/28** â asersi baru: tiga kolom sejajar di baris yang sama (`Math.abs(top â section.top) < 2`), label berurutan `Lanjutkan belajar â Ringkasan belajar â Aktivitas terbaru`, blok berada **di bawah** hero dan **di atas** tablist, keadaan kosong tanpa `[data-resume-entry]`, tiga angka ringkasan tampil, kolom aktivitas kosong; setelah kuis, `[data-resume-entry]` memuat "Mengenal Pecahan 1/2, 1/3, dan 1/4" dan kolom aktivitas terisi, lalu `Lanjutkan` membuka Player. Artefak `beranda-tiga-kolom.png` diperiksa mata |
| Regresi E2E T-108 | **PASS** â `pinned-materials` **11/11** (dua eksekusi), `learning-journey` **14/14**, `activities` **14/14** |
| Unit/build/a11y T-108 | **PASS** â `npm test` **120/120** (16 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `npm run build` exit 0 Â· `npm run a11y` **17/17** (0 error, 7 warning; Beranda 20 interaktif / 4 heading / 69 kontras) Â· `cargo test` tidak dijalankan (tanpa perubahan Rust) |
| Batas T-108 | **DIGANTI T-109** â tinggi tiga kolom semula Â±375 px (thumbnail 16:9 + kartu angka bertumpuk label). Sejak T-109 kolom dipadatkan menjadi Â±112 px (~1/3) sehingga kartu mapel kembali terlihat tanpa menggulir pada 1600Ã900. Tetap berlaku: susunan baru hanya diuji `lg` (â¥1024 px) dan menumpuk vertikal di bawahnya |
| Tinggi tiga kolom (T-109) | **DITERAPKAN** â permintaan PO "tingginya 1/3 dari tinggi sekarang". [HomeScreen.tsx](../../src/screens/HomeScreen.tsx): semua kartu `p-4`, judul kolom `text-xs`; kolom Lanjutkan memakai thumbnail persegi `h-14 w-14` + judul/meta satu baris (`truncate`) + tombol `Lanjutkan` sebaris (tetap `min-h-11` agar target sentuh 44 px); kolom Ringkasan memakai `<dl className="flex items-end gap-6">` (label di atas, angka `text-2xl leading-none` sebaris) alih-alih tiga kartu bertumpuk; kolom Aktivitas menaruh `Lihat semua hasil` di baris judul dan tiga baris aktivitas `text-xs leading-4` tanpa kartu. Hasil ukur E2E: **102 px** saat kosong, **114 px** saat terisi (sebelumnya Â±375 px) |
| E2E home-catalog (T-109) | **PASS 29/29** â ditambah dua asersi tinggi: `[data-home-overview]` â¤150 px saat kosong (102 px) dan â¤150 px saat terisi (114 px); seluruh asersi T-108 (3 kolom sejajar, urutan label, posisi di bawah hero & di atas tablist, keadaan kosong/terisi) tetap lolos. Artefak `beranda-tiga-kolom.png` diperiksa: tiga kartu tipis sejajar, thumbnail persegi kecil, angka 2 / 1 / 100 sebaris, satu baris aktivitas + `Lihat semua hasil` di kanan atas kartu, dan tab materi kembali tampak pada 1600Ã900 |
| Regresi & gate T-109 | **PASS** â `pinned-materials` 11/11 Â· `learning-journey` 14/14 Â· `activities` 14/14 Â· `npm run a11y` 17/17 (0 error, 7 warning; Beranda 20 interaktif / 4 heading / 69 kontras) Â· `npm test` 120/120 (16 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `npm run build` exit 0 Â· `cargo test` tidak dijalankan (tanpa perubahan Rust) |
| Batas T-109 | **TERPOTONG** â judul materi dan baris meta di kolom Lanjutkan terpotong elipsis pada lebar kartu Â±405 px (mis. "Mengenal Pecahan 1/2, 1/3, dâ¦"); thumbnail 16:9 diganti persegi 56 px sehingga ilustrasi hanya tampak sebagian; aktivitas terbaru tetap maks 3 baris dengan teks 12 px; hanya diuji `lg` (â¥1024 px) |
| Kuis berurutan (T-110) | **DITERAPKAN** â [QuizActivity.tsx](../../src/components/content/QuizActivity.tsx) menampilkan **satu soal per halaman**: `questionIndex` + `answers` akumulatif, kepala soal `[data-quiz-progress]` "Soal N dari M" + `role="progressbar"` "Kemajuan kuis", kartu soal `tabIndex={-1}` + `legend` `sr-only`, navigasi `Sebelumnya` (nonaktif di soal 1) dan `Lanjut`/`Lihat hasil` (nonaktif sampai soal terjawab, dengan hint "Pilih atau tulis jawaban untuk melanjutkan."). Penilaian tetap `scoreQuiz` saat tombol terakhir ditekan, jadi `attempt`/`outbox`/`onGraded` tidak berubah. Kartu hasil kini menampilkan "Skor N dari 100 â Lulus/Belum lulus", "Benar X dari M soal", skor minimal lulus, apresiasi, dan `Ulangi kuis` (mengosongkan jawaban + kembali ke soal 1). Fokus dipindah ke kartu soal saat berpindah dan ke kartu hasil saat selesai (`questionRef`/`resultRef` + `scrollIntoView`) |
| E2E urutan kuis (T-110) | **PASS** â `activities` **16/16** (benar-salah 2 soal: `fieldsets` 1, progres "Soal 1 dari 2", `Lanjut` nonaktif sebelum dijawab; jawaban singkat 2 soal + `Ulangi kuis` mereset ke soal 1 tanpa pilihan tercentang; pilihan ganda multi-jawaban 2 soal) Â· `learning-journey` **14/14** (4 soal dijawab satu per satu, satu `fieldset` per halaman) Â· `home-catalog` **29/29** Â· `quiz-coverage` **5/5** (jumlah soal diparse dari `[data-quiz-progress]`, artefak `quiz-baru-soal-1.png` + `quiz-baru-soal-terakhir.png`) Â· `a11y` **18/18** (satu state audit baru "Player (soal kuis)") |
| Regresi & gate T-110 | **PASS** â `player-fullscreen` 6/6 Â· `smoke` 8/8 Â· `npx tsc --noEmit` bersih Â· `npm run build` exit 0 (8,59 dtk) Â· `npm test` **120/120** (16 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `npm run a11y` **18/18** (0 error, 7 warning) Â· `cargo test` tidak dijalankan (tanpa perubahan Rust) |
| Batas T-110 | **SEBAGIAN** â hanya `multiple-choice`/`true-false`/`short-answer` yang berurutan; `MatchingActivity` dan `OrderingActivity` sengaja tetap satu halaman karena seluruh pasangan/urutan harus terlihat bersamaan (bukan kumpulan soal lepas). Penyimpanan "soal terakhir" belum ada di T-110 â **DIGANTI T-111** (posisi soal + jawaban kini diingat per profil). Uji menempel kolom samping kini dilaporkan **tidak diuji** karena halaman satu soal lebih pendek dari kartu samping sehingga tidak ada ruang gulir |
| Ingat tab & posisi soal (T-111) | **DITERAPKAN** â keadaan antarmuka ringan per profil di SQLite: migrasi [0009_profile_ui_state.sql](../../src-tauri/src/migrations/0009_profile_ui_state.sql) (`profile_ui_state(profile_id, state_key, value, updated_at)`, PK gabungan, FK `ON DELETE CASCADE`), [ui_state.rs](../../src-tauri/src/ui_state.rs) (`MAX_KEY_CHARS = 64`, `MAX_VALUE_BYTES = 8 KiB`, kunci `[A-Za-z0-9_-]`, profil tak dikenal â `PROFILE_NOT_FOUND`, `set` idempoten lewat `ON CONFLICT â¦ DO UPDATE`, `clear` idempoten) dengan perintah `ui_state_get`/`ui_state_set`/`ui_state_clear`. Webview: [uiStateRepository.ts](../../src/data/uiStateRepository.ts) (kunci `home-tab` dan `quiz-resume`), [quizResume.ts](../../src/content/quizResume.ts) (serialisasi + validasi: identitas paket/lesson/aktivitas, indeks bulat â¥0 di-clamp ke jumlah soal, jawaban hanya untuk id soal yang dikenal). [HomeScreen.tsx](../../src/screens/HomeScreen.tsx) membaca `home-tab` sekali saat profil termuat, memakai tab tersimpan bila masih sah (tab `pinned` hanya bila sematan >0), menyimpan saat tab dipilih dan saat sematan terakhir dilepas; [QuizActivity.tsx](../../src/components/content/QuizActivity.tsx) menerima `resumeTarget` dari [LessonPlayer.tsx](../../src/screens/LessonPlayer.tsx) (`profileId` + identitas kuis), memulihkan indeks & jawaban hanya bila identitas cocok dan pengguna belum menyentuh kuis, menyimpan dengan jeda 300 ms + flush langsung saat `Lanjut`/`Sebelumnya`, dan menghapus simpanan saat submit atau `Ulangi kuis`. Guest browser (tanpa Tauri) tetap tanpa persistensi |
| E2E ingat keadaan (T-111) | **PASS** â `pinned-materials` **13/13**: pilih tab `Jelajahi materi` â `ui_state_get(profile, "home-tab")` = `"explore"` â muat ulang â tab `explore` `aria-selected` + panel tampil. `activities` **17/17**: isi soal 1 "Setengah" â `Lanjut` â muat ulang aplikasi â buka ulang Player + aktivitas â "Soal 2 dari 2" dipulihkan â `Sebelumnya` â input soal 1 bernilai "Setengah" |
| Regresi & gate T-111 | **PASS** â `npx tsc --noEmit` bersih Â· `npm run build` exit 0 Â· `npm test` **124/124** (17 berkas; 4 test `quizResume`) + fixture 4/4 + katalog 336/336 + binding PASS Â· `cargo test` **83/83** (6 test `ui_state::`) Â· `npm run a11y` **18/18** (0 error, 7 warning) Â· E2E `pinned-materials` 13/13, `activities` 17/17, `learning-journey` 14/14, `home-catalog` 29/29, `quiz-coverage` 5/5, `smoke` 8/8, `player-fullscreen` 6/6, `profile-lifecycle` 7/7, `backup-restore` 9/9, `player-deeplink` 7/7, `mode-switch` 6/6, `content-rollback` 9/9 |
| Batas T-111 | **SEBAGIAN** â hanya satu tab Beranda dan satu posisi kuis per profil (baru membuka kuis lain menimpa simpanan kuis sebelumnya); jawaban disimpan dengan jeda 300 ms sehingga ketukan terakhir dalam <300 ms sebelum aplikasi ditutup hilang; `MatchingActivity`/`OrderingActivity` tidak memakai posisi soal; keadaan antarmuka tidak disinkronkan ke server; `ui_state_clear` selalu menghapus kunci `quiz-resume`, bukan per kuis |
| Semat dari Player (T-112) | **DITERAPKAN** â [LessonPlayer.tsx](../../src/screens/LessonPlayer.tsx) menampilkan tombol `data-pin-toggle` "Sematkan"/"Disematkan" di header materi (gaya sama dengan katalog: `aria-pressed`, `aria-label` menyebut judul, ikon pembatas buku terisi saat aktif), memakai `pinned_list`/`pinned_set` yang sudah ada sehingga tanpa perubahan Rust/migrasi; status samping `[data-player-pin-status]` `aria-live="polite"` mengumumkan "â¦ disematkan ke Beranda." / "â¦ dilepas dari Beranda." dan galat batas 24 tampil di tempat yang sama. Tombol hanya dirender bila persistensi lokal tersedia (pratinjau browser tetap tanpa tombol) dan nonaktif sampai profil aktif termuat |
| Perbaikan balapan sesi (T-112) | **DIPERBAIKI** â `handleGraded` dulu membuang hasil dengan "Sesi belajar belum siap" bila kuis selesai sebelum `getOrStartSession` rampung, lalu efek sesi menimpa galat itu dengan "Penyimpanan lokal siap" sehingga kegagalan tak terlihat. Kini efek menyimpan promise sesi di `sessionReadyRef` dan pengiriman hasil menunggu sesi tersebut sebelum `saveAttempt`; galat sesi tetap tampil sebagai status `error`. Ini juga menjelaskan gejala flake "banner tetap siap, simpan tidak pernah mulai" yang tercatat sejak T-103 |
| E2E semat dari Player (T-112) | **PASS** â `pinned-materials` **16/16** (13 â 16): buka materi lewat hash `#player/kelas2-pai-b06-zakat/zakat` â tombol header berlabel "Sematkan Zakat dan Infak" `aria-pressed=false` â klik â label/pressed/teks berubah + `pinned_list` berisi 1 entri â Beranda tab Materi disematkan menampilkan kartu "Zakat dan Infak" â `Buka` pada kartu â header Player sudah "Disematkan" â klik â `pinned_list` kosong. Artefak `player-sematkan.png` |
| Regresi & gate T-112 | **PASS** â `npx tsc --noEmit` bersih Â· `npm run build` exit 0 (16,02 dtk) Â· `npm test` **124/124** (17 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `npm run a11y` **18/18** (0 error, 7 warning) Â· E2E `activities` **17/17**, `pinned-materials` 16/16, `learning-journey` 14/14, `home-catalog` 29/29, `player-deeplink` 7/7, `player-fullscreen` 6/6, `smoke` 8/8 Â· `cargo test` tidak dijalankan (tanpa perubahan Rust) |
| Batas T-112 | **SEBAGIAN** â sematan hanya bisa dipasang dari katalog dan header Player (bukan dari Hasil Belajar atau layar Aktivitas); urutan sematan tetap `pinned_at DESC` tanpa drag; tombol belum muncul di mode layar penuh (header disembunyikan); kegagalan baca sematan menyembunyikan tombol alih-alih menampilkan galat; `npm run a11y` dua kali gagal sebelum perbaikan karena harness membaca `[aria-live="polite"]` pertama (kini `[data-player-storage]`), bukan karena pelanggaran aksesibilitas |
| Penampil materi HTML5 (T-114) | **DIPROTOTIPEKAN** â [material.rs](../../src-tauri/src/material.rs) menyalin bundel contoh `contoh-siklus-air/1.0.0` (index.html, assets/app.js, style.css, cover.png, transcript.txt) ke `<app_data>/materials/` dengan penanda `seed.json {seedVersion:4}` dan pola stagingârename; perintah `material_open_sample` mengembalikan `MaterialView` (20 field manifest + transkrip). Protokol kustom `ifp-content` didaftarkan di [lib.rs](../../src-tauri/src/lib.rs) dan hanya menyajikan berkas di bawah root materi (percent-decode, tolak `..`/path absolut, allowlist MIME, batas 50 MB) dengan CSP dokumen materi `default-src 'none'` + `connect-src 'none'` dan `Cache-Control: no-store`. [MaterialViewer.tsx](../../src/components/material/MaterialViewer.tsx): dialog `role="dialog" aria-modal`, iframe `sandbox="allow-scripts allow-forms"` + `referrerPolicy="no-referrer"`, jembatan `postMessage` dengan cek `event.source`, `config` tema/reduced-motion, progres `role="progressbar"`, aturan dwell 2 detik sebelum `complete` diterima, Esc menutup (transkrip lebih dulu bila terbuka), panel transkrip. Entri `data-material-open` ada di [ContentScreen.tsx](../../src/screens/ContentScreen.tsx); CSP aplikasi ditambah `frame-src 'self' ifp-content: http://ifp-content.localhost` |
| Bug URL materi (T-114) | **DIPERBAIKI** â `convertFileSrc(path, "ifp-content")` meng-encode seluruh path menjadi **satu** segmen (`contoh-siklus-air%2F1.0.0%2Findex.html`), sehingga URL relatif `assets/app.js`/`style.css` menunjuk ke luar bundel dan tidak pernah dimuat â materi tampak kosong dan `ready` tak pernah datang. [materialRepository.ts](../../src/data/materialRepository.ts) kini mengambil URL dasar lalu meng-encode **per segmen**. Bukti diagnosis: `performance.getEntriesByType("resource")` di dalam frame menunjukkan `/assets/app.js` dengan `transferSize 0`, dan navigasi target frame ke `.../assets/app.js` menampilkan berkas yang benar |
| E2E material-viewer (T-114) | **PASS 8/8** â skenario baru [material-viewer.mjs](../../scripts/e2e/scenarios/material-viewer.mjs) (`npm run e2e:material`). Iframe materi berjalan sebagai **OOPIF** sehingga `Page.getFrameTree` tidak melihatnya; dipakai `Target.getTargets` + `Target.attachToTarget {flatten:true}` + `Runtime.evaluate` dengan `sessionId` ([cdp.mjs](../../scripts/e2e/cdp.mjs) `send` kini menerima `sessionId`). Asersi: `src` berawalan `http://ifp-content.localhost/`, sandbox tepat `allow-scripts allow-forms`, `contentDocument === null`, dialog `aria-modal`, progres â¥34, transkrip memuat "SIKLUS AIR"/"PENGUAPAN", screenshot `material-viewer.png` diperiksa, Esc menutup, buka ulang â progres â¥100 â klik `#complete` di dalam frame â status induk `selesai` ("Sudah ditandai") â `#exit` menutup dan jumlah iframe 0 |
| Regresi & gate T-114 | **PASS** â `npx tsc --noEmit` bersih Â· `npm run build` exit 0 (15,18 dtk) Â· `npm test` **124/124** (17 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `cargo test` **86/86** (3 test `material::`) Â· `npm run a11y` **18/18** (0 error, 7 warning) Â· E2E `material-viewer` **8/8**, `smoke` **8/8**, `pinned-materials` **16/16** |
| Batas T-114 | **SEBAGIAN** â hanya satu bundel contoh lokal yang disemai lewat `include_bytes!`; belum ada katalog, unduhan ZIP, tanda tangan Ed25519, verifikasi hash, tabel `material_install`/`material_progress`, atau progres yang disimpan; dwell 2 detik berasal dari manifest contoh, bukan aturan global; `frame-src` kini berlaku untuk seluruh shell; E2E bergantung pada CDP OOPIF sehingga harness lebih rapuh; bundel nyata sampai 50 MB belum diuji; materi contoh adalah berkas tepercaya di repo, jadi belum membuktikan keamanan konten pihak ketiga |
| Cakupan kuis per paket (T-094/OD-9) | **PASS** â 336/336 paket punya aktivitas kuis; 88 paket baru (kelas 1â2: 5 soal, kelas 3â6: 6 soal) = 499 soal; katalog memuat 88 entri `activityCount: 4` |
| Volume latihan per kelas (T-094) | **PASS** â tiap kelas 56 aktivitas kuis; "Semua aktivitas dinilai berada dalam rentang target" |
| Validator konten (T-094/T-095) | **PASS** â 336/336 VALID, 0 issue, 336 warning (draft per paket) |
| R5 pasca T-094/T-095 | **PASS** â cermin 0, bias posisi 0 paket (578/559/578/163), kunci-terpanjang 0 paket |
| Kedalaman pasca T-094 | **PASS** â minimum 5 langkah / 3 aktivitas / 10 item, 0 paket di bawah ambang |
| Audit materi item (T-095) | **SELESAI** â 49 paket bermateri tipis dibaca penuh (283 soal + 283 pasangan); 21 item cacat di 17 paket dibetulkan; 0 jawaban bertentangan/salah hitung pada 12 soal matematika yang dicek manual |
| `npm test` / `npm run build` (T-094/T-095) | **PASS** â 105/105 + fixture 4/4 + catalog 336/336; `tsc` + Vite PASS |
| `npm run a11y` (T-094) | **PASS** â 17/17 (0 error, 7 warning reflow/target sentuh) |
| E2E (T-094) | **PASS** â player-fullscreen 6/6, learning-journey 11/11, activities 14/14 (satu percobaan kena timeout simpan pertama yang sudah tercatat sebagai flake, lalu PASS tanpa perubahan kode) |
| E2E quiz-coverage (T-094) | **PASS** â 4 pemeriksaan: paket 4 aktivitas (Menyimak Cerita) dan 3 aktivitas, tab "Kuis Penguatan" ada, 5 soal dirender & dapat dijawab, skor tampil. Temuan: 4 tab membungkus ke 2 baris (96 px) pada 1280 karena judul aktivitas panjang â berfungsi, belum dirapikan lebih jauh |
| `cargo test` (T-094/T-095) | **NOT RUN** â tanpa perubahan Rust |
| Volume latihan kelas 1â2 (T-092) | **PASS** â kuis 5 soal/paket (min 5, maks 5), mencocokkan 5 pasangan (min 5, maks 6); 112 paket |
| Volume latihan kelas 3â6 (T-092) | **PASS** â kuis 6 soal (min 6, maks 6), mencocokkan 6 pasangan (min 6, maks 7) pada 224 paket; `check-practice-volume.mjs`: "Semua aktivitas dinilai berada dalam rentang target" |
| Kedalaman pasca T-092 | **PASS** â minimum aktual 5 langkah / 3 aktivitas / **10 item** (sebelumnya 8); 0 paket di bawah ambang |
| R5 pasca T-092 | **PASS** â cermin 0, posisi kunci 0 paket menumpuk (413/393/410/163), kunci-terpanjang 0 paket (sebelumnya 10/3) |
| Validator konten (T-092) | **PASS** â 336/336 VALID, 0 issue, 336 warning (draft per paket) |
| `npm test` (T-092) | **PASS** â 105/105 unit (15 berkas) + fixture 4/4 + catalog 336/336 |
| `npm run build` (T-092) | **PASS** â `tsc --noEmit` + Vite |
| Cakupan kuis per paket (T-092) | **TIDAK TERPENUHI + TERCATAT** â 88 paket (26%) tidak punya aktivitas kuis sama sekali (eksplorasi + mencocokkan + mengurutkan); lihat BACKLOG |
| E2E player-fullscreen (T-093) | **PASS** â 6 pemeriksaan; chrome/tujuan/kemajuan/ringkasan tersembunyi, tepat 1 h1, tanpa overflow horizontal, Escape keluar, jawaban kuis bertahan saat mode dibuka-tutup (1280 & 1024) |
| Pengukuran panel aktivitas (T-093) | **TERUKUR** â 1280: 601 â 1225 px; 1024: 689 â 969 px (chrome + sidebar hilang) |
| `npm run a11y` (T-093) | **PASS** â 17/17 (0 error, 7 warning reflow/target sentuh); Player 0 error/0 warning |
| `npm test` / `npm run build` (T-093) | **PASS** â 105/105 + fixture 4/4 + catalog 336/336; build PASS |
| E2E (T-093) | **PASS** â smoke 8/8, activities 14/14, learning-journey 11/11, mode-switch 6/6, player-fullscreen 6/6 |
| `cargo test` (T-092/T-093) | **NOT RUN** â tanpa perubahan Rust |
| Bias posisi kunci kuis sebelum T-091a | **TERUKUR** â 694 soal pilihan ganda: posisi 0 = 528 (76,1%), posisi 1 = 147 (21,2%), posisi 2 = 19 (2,7%), posisi 3 = 0; **91 paket** (â¥3 soal) menempatkan semua kunci di posisi sama |
| Bias posisi kunci setelah T-091a | **PASS** â posisi 0 = 206 (29,7%), 1 = 189 (27,2%), 2 = 203 (29,3%), 3 = 96 (13,8%); **0 paket** semua kunci di posisi sama; share per-paket tertinggi 66,7% (199 berkas aktivitas berubah, commit `12ce2e1`) |
| Pasangan matching menyalin eksplorasi sebelum T-091b | **TERUKUR** â 1.828 pasangan di 336 aktivitas; **908 identik byte** dengan `prompt`+`reveal` langkah eksplorasi paket yang sama (di 184 paket), 230 di antaranya juga boilerplate refleksi |
| Pasangan matching setelah T-091b | **PASS** â 1.602 pasangan; **0 cermin** (penuh maupun sebagian), **0 boilerplate**; 230 dihapus, 678 ditulis ulang (128 lewat override authored, 550 lewat aturan), 4 pasangan authored ditambahkan ke 2 paket |
| Ambang item dinilai (pasca T-091b) | **PASS** â 336/336 paket â¥5 langkah / â¥3 aktivitas / â¥8 item (minimum aktual: 5 langkah, 3 aktivitas, 8 item) |
| Validator konten (pasca T-091b) | **PASS** â 336/336 **VALID**, 0 issue, 336 warning (draft, per paket) |
| `npm test` (T-091) | **PASS** â 105/105 unit (15 berkas) + fixture 4/4 + catalog 336/336 |
| `npm run build` (T-091) | **PASS** â `tsc --noEmit` + Vite; katalog 336 entri; dist 349 WebP, 0 PNG |
| `npm run a11y` (T-091) | **PASS** â 17/17 (0 error, 7 warning reflow/target sentuh) |
| E2E (T-091) | **PASS** â activities 14/14, home-catalog 28/28, smoke 8/8 |
| Idempotensi transform (T-091b) | **PASS** â dijalankan ulang `rewrite-matching-pairs.mjs --apply`: 0 berkas berubah, residuals 0, belowFloor 0, collisions 0, authoredUnused 0 |
| Sinyal R5 yang tersisa (T-091) | **BELUM SELESAI saat itu** â **10 paket** masih punya kunci selalu merupakan opsi terpanjang (`longestCorrectRatio = 1`); butuh penulisan ulang teks opsi, bukan transform mekanis. **Diukur ulang pasca T-092 (2026-10-27): 0 paket.** |
| `cargo test` (T-091) | **NOT RUN** â tanpa perubahan Rust |
| Paket IPAS kelas 1â2 (T-089) | **PASS** â 16 paket baru (8 kelas 1 + 8 kelas 2) VALID 16/16, 0 issue, 1 warning/paket (draft) |
| Katalog (T-089) | **PASS** â 336 entri / 336 paket; tiap kelas 56, tiap mapel 48; `content:catalog:check` ikut `npm test` |
| `npm test` (T-089) | **PASS** â 105/105 unit (15 berkas) + fixture 4/4 + catalog 336/336 |
| `npm run build` (T-089) | **PASS** â `tsc --noEmit` + Vite |
| E2E home-catalog (T-089) | **PASS** â **28/28**; regresi baru: chip Kelas 1 â 8 kartu IPAS kelas 1 (`katalog-ipas-kelas1.png`) |
| E2E regresi (T-089) | **PASS** â activities 14/14, smoke 8/8, a11y 17/17 (0 error, 7 warning) |
| `cargo test` (T-089) | **NOT RUN** â tanpa perubahan Rust |
| `npm test` (T-070) | **PASS** â 85/85 unit + 4/4 fixture + catalog 320/320 |
| `npm run build` (T-070) | **PASS** â dist 320 WebP, 0 PNG |
| Review konten ulang (T-070) | **PASS** â 320/320 VALID; kedalaman 320/320; 0 duplikasi; R10 4/320 saat itu |
| Review konten ulang (T-071) | **PASS** â R10 **320/320** (fase A/B/C); 320/320 VALID; kedalaman 320/320; 0 duplikasi |
| `npm test` (T-071) | **PASS** â 85/85 + fixture 4/4 + catalog 320/320 |
| `npm test` (T-072) | **PASS** â 85/85 + fixture 4/4 + catalog 320/320 |
| Pra-review agent R1âR6/R8âR9/R12 (T-072) | **SELESAI â BUKAN APPROVAL** â 320 paket; R1 66, R3 40, R4 0, R5 184, R6 0, R8 0, R9 0, R12 1 temuan label |
| Sampel baca stratifikasi (T-072) | **ADA** â 40 paket (1 per sel kelasÃmapel), teks apa adanya untuk ahli mapel |
| Pemuatan paket bawaan (T-073) | **PASS** â bug `packageDirOf` diperbaiki; Player membuka paket bawaan (Kelas 1 Bahasa Indonesia, 3 aktivitas, 5 langkah); `npm test` 86/86; `npm run build` PASS |
| E2E home/journey setelah T-073 | **NOT RUN** â aplikasi desktop sedang berjalan (harness menolak start bila app aktif) |
| Perbaikan P0 UX (T-075) | **PASS (sebagian)** â copy, label subjek, kontras, breadcrumb/hint, satu pesan penyimpanan selesai; metadata internal tertahan D-UX-1/D-UX-4 |
| `npm test` (T-075) | **PASS** â 89/89 unit test + fixture 4/4 + catalog 320 entri/320 paket |
| `npm run build` (T-075) | **PASS** â `tsc --noEmit` + Vite; 2082 modul ditransformasi; utilitas `text-teal-strong`/`text-danger-strong` ada di CSS hasil build |
| Verifikasi DOM (T-075) | **PASS** â opsi mapel âBahasa Indonesia/PAI/PJOK/Pendidikan Pancasilaâ, breadcrumb pindah ke `#home`, hint âLengkapi 6 pasangan lagiâ, copy kuis âSkor minimal lulus: 75 dari 100â, eksplorasi âmenyelesaikan 5 langkahâ, satu pesan pratinjau |
| Verifikasi Hasil Belajar dengan data (T-075) | **NOT RUN** â data lokal hanya ada di jendela desktop; browser pratinjau menampilkan state kosong |
| Screenshot ulang P0 (T-075) | **PARTIAL** â `p0-01-kurikulum-label.png` tersimpan; screenshot Player gagal karena surface in-app Browser tersembunyi (`NATIVE_BROWSER_VIEWPORT_UNAVAILABLE`) |
| `npm run a11y` (T-076) | **PASS** â 16 pemeriksaan; 0 error, 7 warning (reflow 640/320 & target sentuh); termasuk state dinamis konfirmasi hapus & hasil kuis |
| E2E smoke (T-076) | **PASS** â 8 pemeriksaan |
| E2E activities (T-076) | **PASS** â 8 pemeriksaan; 3 asersi baru: fokus berpindah ke kartu hasil kuis benar-salah, mencocokkan, mengurutkan |
| E2E home-catalog (T-076) | **PASS** â 9 pemeriksaan |
| E2E learning-journey (T-076) | **PASS** â 11 pemeriksaan |
| E2E profile-lifecycle (T-076) | **PASS** â 7 pemeriksaan |
| `npm test` (T-077) | **PASS** â 93/93 unit (termasuk 4 test `navigation.test.ts`) + fixture 4/4 + catalog 320/320 |
| `cargo test` (T-077) | **PASS** â 64/64; `preferences` 5 test termasuk rekaman lama tanpa `appMode` tetap terbaca dan `appMode` invalid ditolak |
| `npm run build` (T-077) | **PASS** â `tsc --noEmit` + Vite |
| `npm run a11y` (T-077) | **PASS** â **17 pemeriksaan**; 0 error, 7 warning (reflow 640/320 & target sentuh); tambah audit mode belajar (tanpa sidebar + reflow 640/320) |
| E2E mode-switch (T-077) | **PASS** â 5 pemeriksaan: sidebar admin, konten 1600 px tanpa sidebar di mode belajar, 4 tujuan belajar, mode tersimpan (`preferences_get`), navigasi ke Hasil Belajar, kembali ke admin |
| E2E regresi (T-077) | **PASS** â smoke 8, home-catalog 9, activities 8, learning-journey 11, profile-lifecycle 7 |
| Screenshot dua mode (T-077) | **ADA** â `mode-admin.png` + `mode-belajar.png` di artefak `.tmp-e2e/â¦` (tidak di-commit); a11y `a11y-mode-belajar.png` |
| `cargo test` (T-078) | **PASS** â 65/65; tambah `app_mode_survives_database_reopen` (tulis â tutup â buka ulang DB â `appMode` tetap `belajar`) |
| Persistensi mode di SQLite (T-078) | **VERIFIED** â DB perangkat `%APPDATA%/id.gerbangedukasi.ifp/ifp.db`, `app_meta.preferences` = `{"reducedMotion":false,"fontScale":"normal","appMode":"belajar"}` setelah sakelar dipakai; `App.tsx` membaca nilai ini saat start |
| E2E home-catalog (T-078) | **PASS** â 10 pemeriksaan; 2 asersi thumbnail (bawaan + impor) dan screenshot `catalog-thumbnails.png` |
| E2E mode-switch (T-078) | **PASS** â 6 pemeriksaan: tombol ikon (`aria-label` Belajar/Admin), mode tersimpan, dan **restore setelah `Page.reload`** (simulasi restart: tetap tanpa sidebar + 4 tujuan belajar) |
| E2E regresi (T-078) | **PASS** â smoke 8, activities 8, learning-journey 11, profile-lifecycle 7 |
| `npm run a11y` (T-078) | **PASS** â 17 pemeriksaan; 0 error, 7 warning reflow/target sentuh |
| Grid katalog 3 kolom (T-078c) | **PASS** â `md:grid-cols-3`; E2E `home-catalog` 10/10 + screenshot 3 kartu per baris; a11y 17/17 |
| Rail ikon mode belajar (T-078d) | **PASS** â rail 80 px, 4 tujuan (label sr-only + tooltip), konten 1520 px pada viewport 1600; E2E `mode-switch` 6/6 termasuk restore setelah muat ulang |
| Tile kelas thumbnail (T-078d) | **PASS** â 6 tile kelas memakai cover materi (aset paket), chip âSemua kelasâ; E2E `home-catalog` 11/11 |
| Pemilih kelas collapsible (T-078f) | **PASS** â header `aria-expanded`/`aria-controls` menampilkan chip âSemua kelasâ / âKelas Nâ; memilih kelas menutup panel (header tetap menampilkan âKelas 3â), header membuka panel lagi; state tetap satu `grade` untuk filter; E2E `home-catalog` **13/13** + a11y 17/17 + build PASS |
| Tata letak lebar penuh (T-078e) | **PASS** â Beranda/Jelajah memakai lebar penuh (grid 3 kolom, mapel 3 kolom di xl); layar baca dipusatkan `mx-auto max-w-4xl`; build PASS, E2E 11/11 + 6/6, a11y 17/17, regresi PASS |
| `cargo test` (T-079) | **PASS** â **67/67**; 2 test avatar baru (simpanâbaca data URLâhapus; tolak non-gambar/kosong/>1,5 MB dengan kode `PROFILE_AVATAR_INVALID`/`PROFILE_AVATAR_TOO_LARGE`) |
| Migrasi `0006_profile_avatars` (T-079) | **VERIFIED** â tabel `profile_avatars` (PK `profile_id`, `mime_type` CHECK PNG/JPEG/WebP, `bytes` BLOB, FK `ON DELETE CASCADE`); checksum migrasi terdaftar di `db.rs`; DB perangkat terbuka tanpa error |
| E2E home-catalog (T-079) | **PASS** â **14/14**; `profile_avatar_set` dengan cover Flow kelas 3 â `hasAvatar` benar â setelah `Page.reload` avatar `<img>` dan ilustrasi `[data-learning-illustration]` termuat (`naturalWidth > 0`); screenshot `hero-beranda.png` |
| `npm test` (T-079) | **PASS** â unit + fixture 4/4 + catalog 320/320 |
| `npm run build` (T-079) | **PASS** â `tsc --noEmit` + Vite |
| `npm run a11y` (T-079) | **PASS** â 17 pemeriksaan; 0 error, 7 warning reflow/target sentuh; Beranda 18 interaktif / 49 kontras, Pengaturan 24 interaktif / 56 kontras |
| E2E regresi (T-079) | **PASS** â mode-switch 6/6 (sakelar ikon + restore), profile-lifecycle 7/7, smoke 8/8 |
| Tautan & nomor baris dokumen UX (T-074) | **PASS** â 50 tautan relatif valid, 0 hilang; semua anotasi `#L<n>` â¤ jumlah baris berkas dan menunjuk baris tidak kosong |
| Unduh berkas review eksternal (T-074) | **PASS** â `review-layout-pembelajaran-gerbang-edukasi.md` 337 baris / 14.998 byte UTF-8; disimpan di `.tmp-external/` (git-ignored), tidak di-commit |
| Klaim eksternal vs kode (T-074) | **PASS** â 4 klaim diperiksa: player punya `loading` & storage `saved/error`; `Sebelumnya/Lanjut` ada di eksplorasi; pencarian & filter berfungsi |
| Review UX dengan pengguna (T-074) | **NOT RUN** â tidak ada sesi dengan guru/siswa; skor 6,5/10 bersifat heuristik eksternal |
| `npm test` | **PASS** â 15 unit test + 4 golden fixture |
| `npm run fixtures:check` | **PASS** â 4/4 cocok dengan expected (VALID/3/7/1 issue) |
| `npm run content:validate` | **PASS** â fixture VALID, 2 warning (draft, curriculumRefs kosong) |
| Review teknis konten | **PASS** â 1 temuan kontras diperbaiki (4.36 â 5.40); R10 masih BLOCKING |
| Review pedagogis manusia | **BELUM** â R1âR5/R8âR9 butuh guru/Curriculum Lead |
| Android build (debug) | **PASS** â APK universal 129 MB; Kotlin fallback dipakai |
| Install/launch Android 14 | **NOT RUN** â `adb devices` kosong |
| Windows 11 build/install | **NOT RUN** â mesin Windows 10 |
| Content Manager tests | **PASS** â 5/5 Rust (impor, hash, traversal, duplikat, rollback) |
| E2E Content Manager | **PASS** â impor v0.1.0 â v0.2.0 â rollback v0.1.0; UI status benar |
| E2E Content Runtime | **PASS** â Player menampilkan v0.2.0 (judul impor), aset blob 800px, rollback kembali v0.1.0 |
| E2E katalog multi-paket | **PASS** â 2 kartu paket; ganti Matematika â IPA mengubah judul |
| License core tests | **PASS** â 11/11 (valid, grace, expired, not-yet, product, device, tamper, key, perpetual, DB) |
| E2E lisensi | **PASS** â lisensi Ed25519 diimpor; UI Berlaku; entitlements; request aktivasi |
| License Service tests | **PASS** â 9/9 (aktivasi, konflik binding, revoked, refresh, verify, transfer/deactivate admin, 503, hash serial) |
| E2E aktivasi online | **PASS** â serial â server menandatangani â client verifikasi native â UI Berlaku; audit `activated` |
| License online/transfer | **ADA (referensi)** â server referensi; produksi/TLS/rotasi key belum |
| Backup/restore | **PASS** â Rust 3 test + E2E export/inspect; UI ringkasan sebelum restore |
| Restore otomatis/retensi | **BELUM** â manual; OD-4 |
| Windows release build | **PASS** â MSI + NSIS dihasilkan; install/sign NOT RUN |
| Android release build | **BELUM** â hanya debug APK |
| Diagnostics export | **PASS** â 633 byte JSON, redaksi aman; UI tombol tersedia |
| Ekspor CSV hasil | **PASS** â 3 test (escaping/injection/overwrite); UI tombol |
| Profil & sesi | **PASS** â 3 test profil; E2E buat Budi, sesi & attempt terikat, Hasil menampilkan Budi |
| Preferensi | **PASS** â 3 test; E2E root `reduce-motion font-large` |
| Sinkronisasi otomatis | **PASS** â setelah simpan hasil, outbox acknowledged & server menerima 1 event tanpa klik |
| CI lokal (`npm run ci`) | **PASS** â 43 web + 20 server test, build PASS |
| Harness E2E (`npm run e2e`) | **PASS** â smoke 7 pemeriksaan; screenshot & result.json di `.tmp-e2e/` |
| Workflow CI remote | **PASS** â push `c51af2f` â run `40040384407`: web+server & Rust sukses (2026-10-24) |
| Branch protection `main` | **AKTIF** â wajib PR + 2 required checks (strict), admin terikat, force-push/hapus diblokir |
| Profil: rename & hapus | **PASS** â Rust 6 test; E2E BudiâBudi Santoso, hapus profil tanpa data, proteksi profil terakhir |
| Hapus profil berdata (UI) | **UNIT PASS / E2E BELUM** â jalur `PROFILE_HAS_DATA` diuji Rust; langkah UI kedua belum diotomasi |
| Audit aksesibilitas (`npm run a11y`) | **PASS** â 8 layar, 0 error/0 warning; skip link + 10 langkah Tab bernama |
| Screen reader / zoom / dialog | **BELUM** â audit heuristik; NVDA, reflow 200%, dan state dinamis belum diuji |
| E2E alur belajar | **PASS** â impor 8 file, managed-first, eksplorasi, kuis 100, 1 sesi/1 attempt, outbox 1, skor tampil |
| E2E rollback konten | **PASS** â v0.1.0 â v0.2.0 (judul E2E) â rollback â v0.1.0; list paket 0.1.0 active / 0.2.0 disabled |
| E2E lisensi | **PASS** â key e2e termuat; impor valid â UI âBerlakuâ; expired â `LICENSE_EXPIRED`; signature rusak â `LICENSE_SIGNATURE_INVALID`; lisensi lama tetap aktif |
| E2E aktivasi online | **PASS** â server referensi seed serial; aktivasi â UI âBerlakuâ; binding machine & audit `activated` di DB server; serial tak dikenal â `LICENSE_SERIAL_INVALID` |
| Reflow & teks 200% | **PASS** â 8 layar pada 640/320 px tanpa overflow; teks 200% tanpa overflow |
| Target sentuh | **PASS** â semua target â¥44 px setelah select preferensi diperbaiki dari 36 px |
| State dinamis konfirmasi hapus | **PASS** â 0 error/0 warning |
| Beranda & katalog | **PASS** â katalog 1 materi bawaan; cari/filter; buka lesson; kuis 100; kartu âLanjutkan belajarâ membuka lesson terakhir |
| Unit test katalog | **PASS** â 6 test baru; total 49/49 |
| Aktivitas benar-salah & jawaban singkat | **PASS** â E2E 5 pemeriksaan: dua aktivitas dinilai 100, 2 percobaan tersimpan, respons teks `responseText` |
| Regresi aktivitas | **PASS** â journey 11/11, a11y 15 pemeriksaan, cargo 48/48, npm 53/53 |
| A11y hasil kuis | **PASS** â 16 pemeriksaan, 0 error/0 warning (dua kali); preflight app berjalan |
| Review konten lokal | **PASS** â E2E 7 pemeriksaan: guru mencatat review, nama/catatan tersimpan; siswa ditolak `REVIEW_FORBIDDEN`; profil reviewer tidak dapat dihapus |
| Migrasi 0005 | **PASS** â `cargo test` 53/53; migrasi tercatat otomatis di backup |
| Ekspor audit review | **PASS** â CSV 1 baris/173 byte; BOM+CRLF; guru saja; siswa `REVIEW_FORBIDDEN`; `cargo test` 55/55 |
| Checksum migrasi lintas line ending | **PASS** â checksum ternormalisasi; legacy diterima & di-upgrade; app start pada DB pengguna; 3 test baru (cargo 58/58) |
| OD-4 default privasi | **PASS** â smoke 8/8 (bagian privasi + default retensi); a11y 16 pemeriksaan; build/tests PASS |
| OD-5 default lisensi | **PASS** â E2E lisensi 10/10 (transfer ditolak tanpa lisensi, berhasil dengan lisensi); cargo 62/62; a11y 16 pemeriksaan |
| OD-7 auth perangkat | **PASS** â server 24/24 (enrollment, kode salah, token sync, device mismatch, healthz); typecheck PASS |
| OD-7 Supabase + Worker | **PASS** â worker 7/7, typecheck PASS; npm total 79/79; migrasi aditif selaras skema repo web |
| Pilihan ganda multi-jawaban | **PASS** â E2E 6 pemeriksaan: 3 aktivitas dinilai 100, 3 percobaan, rata-rata 100; npm 56/56 |
| Matching & ordering | **PASS** â E2E 8 pemeriksaan: 5 aktivitas dinilai 100, 5 percobaan; validasi kontrak ditolak saat rusak (unit) |
| Unit test interaksi | **PASS** â 12 test baru; total npm 68/68 |
| E2E backup â restore | **PASS** â 9 pemeriksaan (dua kali): hash cocok, data pulih, schema lebih baru ditolak |
| Player memuat paket impor | **ADA** â semua paket aktif dapat dipilih (ADR-0009) |
| Player: eksplorasi â kuis | **PASS** â 4 langkah, skor 100/Lulus; logika gagal/ambang diuji unit |
| Player: desktop 1600Ã900 & mobile 640Ã900 | **PASS** â screenshot diperiksa |
| Rust repository tests | **PASS** â 6/6 (termasuk rollback event duplikat & persistensi reopen) |
| E2E simpan hasil (Tauri WebView via CDP) | **PASS** â 1 sesi, 1 attempt, 4 respons, 1 outbox pending; Hasil Belajar menampilkan skor 100 |
| Persistensi hasil belajar | **ADA** â `app_data_dir()/ifp.db`; sinkronisasi cloud belum |
| Rust sync tests | **PASS** â 5/5 (eligibility, backoff/dead-letter, ack idempotent, status, device ID) |
| Sync engine tests | **PASS** â 8/8 (accepted/duplicate, rejected, network, missing ack, empty, payload rusak, backoff) |
| E2E sinkronisasi (mock server) | **PASS** â "1 event tersinkronisasi"; outbox `acknowledged`, counts 0/0/1 |
| Server referensi | **PASS** â 11/11 test; typecheck PASS |
| E2E backend nyata | **PASS** â 1 event tersimpan di server + outbox client `acknowledged` |
| Backend produksi | **BELUM** â OD-7; server referensi bukan produksi |
| DV-01â¦DV-20 | NOT RUN |
| Pemasang bundel materi â Rust (T-115a) | **PASS** â `cargo test --lib` **98/98** (12 test baru `material_install::tests::*`): pasang + buka, manifest diubah, hash berkas salah, berkas ekstra, path traversal, duplikat case-insensitive, `keyId` tak dikenal, tanpa `.sig`, rujukan eksternal, `minAppVersion` lebih baru, schema mayor lain, versi baru men-supersede versi lama. `material.json` divalidasi ketat (Â§4) sebelum aktivasi; staging â `fs::rename`; `material_install` (migrasi `0010`) aktif satu versi per `materialId` |
| Alat paket materi (T-115b) | **PASS** â [material-pack.mjs](../../scripts/material-pack.mjs) `keygen`/`pack`; `node --check` bersih; bundel contoh 5 berkas/15.673 byte; pembaca ZIP independen (central directory) + `crypto.verify` memastikan tanda tangan cocok dengan manifest kanonik dan seluruh hash berkas sesuai; `.sig` = `{keyId, algorithm:"ed25519", value: base64url}` |
| UI materi terpasang (T-115c) | **PASS** â [ContentScreen.tsx](../../src/screens/ContentScreen.tsx) menambah tombol `data-material-import`, pesan hasil, dan daftar `data-material-installed` dengan tombol `data-material-installed-open`; [materialRepository.ts](../../src/data/materialRepository.ts) menambah `pickMaterialBundle` (filter `.zip`), `installMaterialBundle`, `listInstalledMaterials`, `openInstalledMaterial`. Dua screenshot diperiksa: penampil materi hasil impor (judul, meta, 34% progres, âMateri siap.â) dan daftar âMateri terpasangâ (judul, v1.0.0, kelas 3, 5 menit, 13 KB, draft) |
| E2E material-import (T-115d) | **PASS 12/12** â [material-import.mjs](../../scripts/e2e/scenarios/material-import.mjs) (`npm run e2e:material-import`): kunci Ed25519 sementara via `IFP_CONTENT_KEYS`; bundel negatif hash salah â `MATERIAL_HASH_MISMATCH`, tanda tangan diacak â `MATERIAL_SIGNATURE_INVALID`, daftar tetap kosong; bundel sah terpasang 5 berkas; duplikat â `MATERIAL_INVALID`; daftar UI terbaca setelah muat ulang layar; tombol buka membuka penampil sampai `siap` + progres â¥34; path tidak ada â `MATERIAL_NOT_FOUND`. **Batas:** dialog pemilih berkas native tidak dapat diotomasi, jadi pemasangan pada E2E memakai bridge `invoke`; jalur UI yang diuji adalah daftar + buka |
| Gate T-115 | **PASS** â `npx tsc --noEmit` bersih Â· `npm run build` exit 0 Â· `npm test` **124/124** (17 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `cargo test --lib` **98/98** Â· `npm run a11y` **18/18** (0 error, 7 warning) Â· E2E `material-import` 12/12, `material-viewer` 8/8, `smoke` 8/8, `pinned-materials` 16/16 |
| Batas T-115 | **SEBAGIAN** â hanya impor dari ZIP lokal + sidecar `.sig`; belum ada katalog/unduhan server, verifikasi `bundleSha256`, penandatanganan saat publish, `material_progress`, atau LRU cache; `material_install.sha256` menyimpan digest manifest, bukan digest ZIP; bundel nyata mendekati 50 MB belum diuji |
| Sematan materi â Rust (T-116a) | **PASS** â `cargo test --lib` **103/103** (5 test baru): semat + daftar sekali (idempoten), batas 24 **dipakai bersama** dengan sematan paket, materi belum terpasang ditolak `MATERIAL_NOT_FOUND`, baris sematan dibersihkan saat materi tidak lagi aktif, profil tak dikenal ditolak. Migrasi `0011_pinned_materials.sql`: PK `(profile_id, material_id)`, FK profil CASCADE, **tanpa** FK ke `material_install` (PK-nya `(material_id, version)`); keberadaan materi divalidasi saat menyematkan dan baris menggantung dipangkas saat daftar dibaca |
| Sematan materi â UI (T-116b) | **PASS** â [ContentScreen.tsx](../../src/screens/ContentScreen.tsx) menambah tombol `data-material-pin` dengan `aria-pressed`, teks `Sematkan`/`Disematkan`, pesan `aria-live`, dan galat batas 24 dari Rust; [pinnedRepository.ts](../../src/data/pinnedRepository.ts) menambah `listPinnedMaterials`/`setPinnedMaterial`. Screenshot `konten-sematkan-materi.png` diperiksa (tombol Disematkan aktif di samping Buka materi) |
| Sematan materi â Beranda (T-116c) | **PASS** â [HomeScreen.tsx](../../src/screens/HomeScreen.tsx) menggabungkan sematan paket + materi menjadi satu daftar (`PinnedCard`) urut `pinnedAt` turun; kartu materi berlabel `Materi HTML5`, judul, kelas/menit, `Buka` â `MaterialViewer` (E2E: status `siap`), `Lepas` â `pinned_material_set`; hitungan tab, syarat empty state, syarat `Kelola sematan`, dan pemilihan tab awal memakai total gabungan |
| E2E material-pin (T-116d) | **PASS 12/12** â [material-pin.mjs](../../scripts/e2e/scenarios/material-pin.mjs) (`npm run e2e:material-pin`, memakai ulang `setup` `material-import`): pasang bundel â tombol `Sematkan` (`aria-pressed=false`) â klik â `Disematkan` + `pinned_material_list` 1 baris â muat ulang â tab Materi disematkan terbuka dengan kartu materi â buka penampil sampai `siap` â `Lepas` â kartu hilang + Beranda pindah ke Materi tersedia + SQLite bersih â daftar Konten kembali `Sematkan` â menyematkan materi tak terpasang ditolak `MATERIAL_NOT_FOUND`. **Batas:** pemasangan masih lewat bridge `invoke` (dialog native tidak dapat diotomasi), dan batas 24 bersama tidak diuji sampai 24 baris nyata di E2E (dibuktikan unit test Rust) |
| Gate T-116 | **PASS** â `npx tsc --noEmit` bersih Â· `npm run build` exit 0 Â· `npm test` **124/124** (17 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `cargo test --lib` **103/103** Â· `npm run a11y` **18/18** (0 error, 7 warning) Â· E2E `material-pin` 12/12, `material-import` 12/12, `pinned-materials` 16/16, `material-viewer` 8/8, `smoke` 8/8 |
| Batas T-116 | **SEBAGIAN** â sematan materi hanya dari daftar "Materi terpasang" (belum dari penampil materi); kartu materi memakai placeholder gradien, bukan cover bundel; bila materi dihapus dari disk, kartu hilang tanpa pemberitahuan; urutan gabungan memakai `pinnedAt` dari SQLite (detik-milidetik sama bisa berurutan stabil, bukan acak) dan tidak bisa diatur pengguna |
| Katalog materi daring â Rust (T-117a) | **PASS** â `cargo test --lib` **112/112** (9 test `material_catalog::tests::*`): daftar + pasang dari katalog, halaman cache dipakai saat katalog mati, tanpa cache â `MATERIAL_FETCH_FAILED`, ZIP tidak cocok `bundleSha256` â `MATERIAL_HASH_MISMATCH` dan tidak ada berkas terpasang, URL katalog wajib diatur (`MATERIAL_INVALID`), http non-loopback + query/fragmen katalog ditolak, URL unduhan pre-signed (query) diterima tetapi fragmen ditolak, URL pre-signed tidak pernah masuk cache. Migrasi `0012_material_catalog_cache.sql`; `downloadUrl` dikosongkan sebelum baris cache ditulis (OD-12). Batas ukuran: katalog 2 MB, bundel `MAX_BUNDLE_BYTES`, connect 10 dtk / request 60 dtk |
| Server katalog referensi (T-117b) | **PASS** â [mock-catalog-server.mjs](../../scripts/mock-catalog-server.mjs) (`npm run catalog:mock`): `GET /v1/materials` memvalidasi duplikat/rentang parameter (limit 1â100 default 50, kelas 1â6, slug mapel), hanya `reviewed`/`approved`, urut `publishedAt` turun dengan cursor offset base64url, ETag stabil (dari `generatedAt` berkas atau mtime) + **304 tanpa body**, `GET /bundles/<nama>?token=` dengan penjagaan basename (403 token salah, 404 hilang). Galat selalu `{error:{code,message}}`; katalog dibaca ulang tiap permintaan. **Bukan produksi** |
| UI jelajah materi daring (T-117c) | **PASS** â [ContentScreen.tsx](../../src/screens/ContentScreen.tsx) bagian âJelajah materi daring (prototipe)â: `data-catalog-url` + `Simpan alamat` (disimpan ke `app_meta`), `data-catalog-config` menampilkan asal alamat (pengaturan perangkat / variabel lingkungan / belum diatur), select kelas 1â6 + mapel dari `subjectKeys`, `Muat ulang katalog`, kartu `data-catalog-item` (judul, ringkasan, kelas, mapel, menit, ukuran, status review), tombol `Pasang`/`Pasang vâ¦`/`Memasangâ¦`/`Terpasang`, lencana `data-catalog-stale`. Draf alamat tidak ditimpa hasil muat asinkron (`catalogUrlDraft = null` berarti belum disunting). Screenshot `katalog-daring.png` diperiksa |
| E2E material-catalog (T-117d) | **PASS 8/8** â [material-catalog.mjs](../../scripts/e2e/scenarios/material-catalog.mjs) (`npm run e2e:material-catalog`): server referensi **in-process** (port acak) dengan bundel bertanda tangan `sample-material`, `reviewStatus: "reviewed"`, plus satu entri `draft` sebagai kontrol; alamat katalog diisi lewat UI dan disimpan; `bundleSha256` salah â `MATERIAL_HASH_MISMATCH`, tanda tangan diacak â `MATERIAL_SIGNATURE_INVALID`, keduanya tidak meninggalkan materi terpasang; katalog sah â item tampil, entri `draft` tidak tampil, filter kelas 1 â âTidak ada materi pada filter ini.â; `Pasang` â tombol `Terpasang` + daftar materi terpasang 1 baris v1.0.0; server dimatikan lalu muat ulang â lencana `data-catalog-stale` âMenampilkan cache lokalâ dengan item tetap tampil |
| Gate T-117 | **PASS** â `npx tsc --noEmit` bersih Â· `npm run build` exit 0 Â· `npm test` **124/124** (17 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `cargo test --lib` **112/112** Â· `npm run a11y` **18/18** (0 error, 7 warning) Â· E2E `material-catalog` 8/8, `smoke` 8/8, `material-import` 12/12, `material-viewer` 8/8, `material-pin` 12/12, `pinned-materials` 16/16 |
| Batas T-117 | **PROTOTIPE** â katalog masih server referensi lokal: belum ada `/v1/materials` produksi, penandatanganan saat publish, bucket Supabase Storage, atau tabel katalog. `bundleSha256` diverifikasi tetapi tidak disimpan di `material_install` (kolomnya masih digest manifest). Belum ada jalur pasang-ulang/repair untuk versi yang sama, `material_progress`, atau LRU 2 GB. Cache katalog berkunci per kombinasi filter tanpa TTL lokal (kesegaran hanya lewat ETag/304); respons `304` memakai halaman cache tanpa memperbarui `fetchedAt`. Bundel nyata mendekati 50 MB belum diuji |
| Materi contoh kedua â Matematika kelas 2 (T-118a) | **PASS** â [sample-material-perkalian/](../../src-tauri/sample-material-perkalian/): materi **interaktif** (bukan animasi) â `Tambah kelompok` menyusun sampai 4 kelompok Ã 4 jeruk, persamaan `3 Ã 4 = 4 + 4 + 4 = 12 jeruk` dihitung ulang tiap klik, kuis `2 Ã 3` dengan umpan balik, `Tandai selesai` baru aktif setelah 2 dtk (ambang `minDwellSeconds` ditegakkan penampil), `Ulangi`, `Keluar dari materi`, transkrip penuh. Protokol `ifp-content` sama dengan bundel pertama (ready/hello/config/progress/complete/request-exit), `aria-live`, fokus terlihat, `prefers-reduced-motion`. Cover memakai salinan [cover-mapel-matematika.webp](../../content/covers/pelajaran/cover-mapel-matematika.webp) (61.252 B) â belum ada ilustrasi khusus topik |
| Pembangun katalog demo (T-118b) | **PASS** â [dev-catalog.mjs](../../scripts/dev-catalog.mjs) (`npm run catalog:dev`, tambah `-- --serve`): memakai ulang kunci dev `.tmp-catalog/keys/dev-content-1-private.pem`, menyalin sumber ke `.tmp-catalog/material-src/<id>`, menandatangani kedua bundel, **memeriksa sendiri** sha256 ZIP terhadap hasil packer dan memverifikasi tanda tangan Ed25519 dengan kunci publik, lalu menulis `.tmp-catalog/catalog.json` (2 item, `generatedAt` baru tiap bangun). `packBundle` tetap sumber tanda tangan; `canonical` di [material-pack.mjs](../../scripts/material-pack.mjs) kini diekspor agar pemeriksaan independen memakai JCS yang sama |
| Verifikasi bundel T-118 | **PASS** â pemeriksaan independen (urai ZIP + hash tiap berkas + `crypto.verify` dengan kunci publik `dev-content-1` `0NN0Zp1dâ¦`): `perkalian-kelompok-jeruk.zip` **5/5 berkas cocok**, tanda tangan sah, 6 entri, 76.919 B, sha256 `6c14a974â¦`; `siklus-air-contoh.zip` 5/5 cocok, 15.679 B, sha256 `f7c52c95â¦`. HTTP: `GET /v1/materials` â 2 item; `?grade=2` â 1; `?subject=matematika` â 1. Visual (Chrome headless): 1024 px â 3 kelompok tampil, persamaan `3 Ã 4 = 4 + 4 + 4 = 12 jeruk`, kuis benar â2 Ã 3 = 3 + 3 = 6â, tombol `Tandai selesai` aktif; 360 px (emulasi CDP) â `scrollWidth == innerWidth == 360` (tanpa luberan), grid kelompok 2 kolom, tombol menumpuk penuh |
| Gate T-118 | **PASS** â `npm test` **124/124** (17 berkas) + fixture 4/4 + katalog 336/336 + binding PASS. Tidak ada perubahan TypeScript/Rust sehingga `tsc`/`cargo`/E2E tidak dijalankan ulang |
| Batas T-118 | **PROTOTIPE** â (1) materi kedua belum dipasang lewat UI aplikasi di sesi ini; alur pasang/verifikasi tetap terbukti lewat E2E `material-catalog` 8/8 dan `material-import` 12/12. (2) Cover memakai salinan cover mapel, bukan ilustrasi topik. (3) `.tmp-catalog/` (termasuk private key dev) tidak pernah di-commit; `material.json` di repo memuat `files: []` dan daftar itu diisi ulang oleh packer saat bundel dibangun. (4) `catalog:dev` hanya membangun/menyajikan fixture â bukan alat publish. (5) Kuis materi baru satu soal tetap, belum adaptif |
| Materi contoh ketiga â Bahasa Indonesia kelas 4 (T-119) | **PASS** â [sample-material-fakta-opini/](../../src-tauri/sample-material-fakta-opini/): `fakta-opini-kelas4` v1.0.0 Â· Kelas 4 Â· bahasa-indonesia Â· topik âFakta dan opiniâ Â· Â±6 menit Â· `reviewed`. Pola interaksi **ketiga** (setelah animasi dan berhitung): enam pernyataan dipilah satu per satu dengan tombol `Fakta`/`Opini`, tiap jawaban menampilkan alasan, `Lanjut`/`Lihat hasil`, ringkasan `N dari 6 benar` + `Ulangi`; kartu soal disembunyikan saat ringkasan tampil. `Tandai selesai` aktif setelah 2 dtk; potongan `progress` = jumlah pernyataan terjawab. Fokus keyboard dipindah ke pernyataan hanya saat berpindah soal (bukan saat muat pertama), `aria-live` untuk umpan balik, `prefers-reduced-motion`. Cover = **ilustrasi Flow yang sudah ada** (paket [kelas4-bahasa-indonesia-b03-ide-pokok](../../content/materi/kelas4/kelas4-bahasa-indonesia-b03-ide-pokok.webp): Ayu & Bima membaca buku sambil menata kartu bergambar, 1200Ã896 4:3), dipasang T-119d |
| Cacat T-119 yang diperbaiki | `relabelTitle()` menulis `cardTitle.textContent`, sehingga `<span id="counter">`/`<span id="total">` **terlepas dari dokumen** dan penghitung soal tidak pernah ada saat diuji; ditemukan lewat probe DOM (`document.getElementById("counter") === null`). Penulisan teks dihapus â judul sudah memuat âPernyataan N dari Mâ, hanya isi span yang diubah. Juga: tombol status benar/salah tampak pudar karena `button:disabled { opacity: .6 }` mengenai tombol ber-`data-state` (kini hanya tombol tanpa status) |
| Verifikasi bundel T-119 | **PASS** â `npm run catalog:dev` â 3 bundel; `fakta-opini-kelas4` 5 berkas **121.371 B** sha256 `edc443c4bf52â¦`, tanda tangan `dev-content-1` sah, 6 entri ZIP, 5/5 hash berkas cocok, `index.html`/cover/transkrip ada. HTTP: `/v1/materials` â 3 item (urut `publishedAt` turun: fakta-opini â perkalian â siklus-air), `?grade=4` dan `?subject=bahasa-indonesia` â 1 item, unduhan `fakta-opini-kelas4.zip` â **200, 121.371 B**. Visual: keadaan awal, keadaan terjawab, dan ringkasan dirender Chrome headless (klik mouse sungguhan lewat CDP) â â5 dari 6 benarâ (satu jawaban sengaja salah); 360 px `innerWidth == scrollWidth == 360` |
| Gate T-119 | **PASS** â `npm test` **124/124** (17 berkas) + fixture 4/4 + katalog 336/336 + binding PASS. Tidak ada perubahan TypeScript/Rust sehingga `tsc`/`cargo`/E2E tidak dijalankan ulang |
| Batas T-119 | **PROTOTIPE** â (1) belum dipasang lewat UI aplikasi di sesi ini (jalur pasang terbukti lewat E2E `material-catalog` 8/8 dan `material-import` 12/12). (2) Cover memakai ilustrasi Flow yang sudah ada, dipinjam dari paket lain â bukan ilustrasi khusus materi ini, dan **belum dirender UI mana pun** (katalog, daftar terpasang, kartu sematan, penampil semuanya belum menampilkan cover bundel). (3) Skor hanya di memori â `material_progress` belum ada, jadi ringkasan hilang saat penampil ditutup. (4) Soal tetap enam butir, tanpa pengacakan urutan. (5) `material_id` & `publishedAt` diatur manual di `dev-catalog.mjs` (bukan dari editor platform) |
| Cover materi ketiga (T-119d) | **PASS** â percobaan membuat ilustrasi baru lewat Flow ditolak tiga kali ("Gagal Pembuatan ini mungkin melanggar kebijakan kami") tanpa aset dihasilkan, lalu user memilih memakai ilustrasi yang sudah ada. `assets/cover.webp` diganti dengan [kelas4-bahasa-indonesia-b03-ide-pokok.webp](../../content/materi/kelas4/kelas4-bahasa-indonesia-b03-ide-pokok.webp) (164.688 B, 1200Ã896, kast Ayu/Bima, latar kelas, teks tidak terbaca pada 1Ã). Bundel ditandatangani ulang: **181.493 B** sha256 `0a6765c1e54fâ¦`, 5/5 berkas cocok hash, tanda tangan `dev-content-1` sah, byte cover di dalam ZIP identik dengan sumber; `/v1/materials?subject=bahasa-indonesia` memuat `bundleSha256` baru dan unduhan ZIP **200 / 181.493 B** |
| Cover katalog â Rust (T-120a) | **PASS** â `cargo test --lib` **116/116** (4 test baru). [material.rs](../../src-tauri/src/material.rs): `sniff_image` (WebP `RIFFâ¦.WEBP`, PNG, JPEG), `image_data_url`, `cover_data_url` (cover manifest dipisah dari akar bundel â `canonicalize` + `starts_with` akar, berkas biasa, â¤ `MAX_COVER_BYTES` 2 MB). [material_install.rs](../../src-tauri/src/material_install.rs) `material_installed_cover` memakai versi aktif dari `material_install`; [material_catalog.rs](../../src-tauri/src/material_catalog.rs) `RawItem.cover_url` (`#[serde(default)]`), `cover_from_catalog` + `download_cover` (validator URL unduhan â 200 â `read_capped` 2 MB â data URL), command `material_catalog_cover`. Input tak sah, cover absen, atau unduhan gagal â `Ok(None)` (kartu tetap tampil). Cache SQLite mengosongkan `coverUrl` seperti `downloadUrl` (test `cache_never_keeps_presigned_url` diperluas) |
| Cover katalog â server referensi (T-120b) | **PASS** â [mock-catalog-server.mjs](../../scripts/mock-catalog-server.mjs): `GET /covers/<nama>?token=` (penjagaan basename, 403 token salah, content type per ekstensi), `withDownloadUrl` membuang `coverFile`/`bundleFile` lalu menambah `coverUrl` pre-signed; opsi `coverDir`/`MOCK_COVER_DIR`. [dev-catalog.mjs](../../scripts/dev-catalog.mjs) menyalin cover tiap bundel ke `.tmp-catalog/covers/` (`coverFile` di katalog). **Bukan produksi** |
| Cover katalog â UI (T-120c) | **PASS** â [MaterialCover.tsx](../../src/components/material/MaterialCover.tsx) baru: sumber `catalog`/`installed`, cache modul per `${kind}:${id}@${version}` (render ulang/ganti filter tidak memicu unduhan lagi), `<img data-material-cover alt="">` 96Ã64 `object-cover` atau fallback dua huruf label mapel; [materialRepository.ts](../../src/data/materialRepository.ts) `getInstalledCover`/`getCatalogCover`; [ContentScreen.tsx](../../src/screens/ContentScreen.tsx) memakai komponen itu di baris âJelajah materi daringâ (query filter ikut dikirim) dan âMateri terpasangâ. Data URL dipilih agar **CSP tidak dilonggarkan** (`img-src â¦ data:` sudah ada) |
| E2E material-catalog cover (T-120d) | **PASS 10/10** â [material-catalog.mjs](../../scripts/e2e/scenarios/material-catalog.mjs): fixture menyalin cover ke `covers/<id>.png` + `coverFile`, server dijalankan dengan `coverDir`; dua asersi baru â kartu katalog memuat `img[data-material-cover]` dengan `src` berawalan `data:image/png;base64,` dan `naturalWidth > 0`, lalu setelah pasang baris `[data-material-installed]` juga memuat cover. Screenshot `katalog-daring.png` diperiksa: thumbnail tampil di dua baris, lencana cache lokal dan tombol `Terpasang` nonaktif |
| Gate T-120 | **PASS** â `npx tsc --noEmit` bersih Â· `npm run build` ââ built in 9.60sâ Â· `cargo test --lib` **116/116** Â· `npm test` **124/124** (17 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `npm run a11y` **18/18** (0 error, 7 warning) Â· E2E `material-catalog` 10/10, `material-import` 12/12, `smoke` 8/8 |
| Batas T-120 | **PROTOTIPE** â (1) cover katalog **tidak diverifikasi tanda tangan** (status sama dengan judul/ringkasan yang juga belum terikat tanda tangan item) dan hanya kosmetik: server bisa menampilkan gambar lain; (2) `coverUrl` hanya ada di server referensi lokal, belum ada bucket/endpoint produksi; (3) kartu sematan Beranda dan header penampil **masih gradien**, belum memakai cover; (4) cache modul hidup selama sesi renderer â tidak dibatasi LRU; (5) cover hanya WebP/PNG/JPEG â¤ 2 MB, bukan gambar beranimasi/AVIF; (6) data URL base64 membengkak Â±33% di memori renderer |
| Cover kartu sematan Beranda (T-121) | **PASS** â [HomeScreen.tsx](../../src/screens/HomeScreen.tsx): kartu `[data-pinned-material]` kini memakai `MaterialCover` sumber `installed` selebar kartu dengan rasio 16:9 (bukan kotak gradien), label `Materi HTML5` menjadi lencana di atas cover sehingga identitas kartu dan asersi lama tetap sah; [MaterialCover.tsx](../../src/components/material/MaterialCover.tsx) tidak lagi memaksa `rounded-control` â radius kini tanggung jawab pemanggil (dua pemakaian [ContentScreen.tsx](../../src/screens/ContentScreen.tsx) diberi `rounded-control`, kartu Beranda mengandalkan `rounded-card` + `overflow-hidden` milik `<li>`) |
| E2E material-pin cover (T-121) | **PASS 12/12** â [material-pin.mjs](../../scripts/e2e/scenarios/material-pin.mjs): menunggu `[data-pinned-material] img[data-material-cover]` ber-`src` `data:image/` dengan `naturalWidth > 0`, lalu asersi `cover.prefix.startsWith("data:image/png;base64")` + lebar > 0. Screenshot `beranda-sematkan-materi.png` diperiksa: ilustrasi siklus air tampil penuh selebar kartu dengan lencana MATERI HTML5 di sudut kiri atas |
| Gate T-121 | **PASS** â `npx tsc --noEmit` bersih Â· `npm run build` ââ built in 9.46sâ Â· `npm test` **124/124** (17 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `npm run a11y` **18/18** (0 error, 7 warning) Â· E2E `material-pin` 12/12, `material-catalog` 10/10, `home-catalog` 29/29, `pinned-materials` 16/16, `smoke` 8/8. Tidak ada perubahan Rust, jadi `cargo test` tidak dijalankan ulang (terakhir 116/116 pada T-120) |
| Studio Materi (T-122) | **PASS** â [material_author.rs](../../src-tauri/src/material_author.rs): 12 perintah draft, kerangka `eksplorasi`/`kuis`, hash dihitung ulang di Rust setiap mutasi, rujukan `http(s)://` ditolak saat menyimpan **dan** memeriksa, pratinjau lewat `material::open_material`, ekspor folder sumber + ZIP tanpa `.sig` + tolak menimpa; [0013_material_draft.sql](../../src-tauri/src/migrations/0013_material_draft.sql) hanya tabel indeks; [material_install.rs](../../src-tauri/src/material_install.rs) menolak instalasi yang menabrak draft |
| E2E material-studio (T-122) | **PASS 23 pemeriksaan** â [material-studio.mjs](../../scripts/e2e/scenarios/material-studio.mjs): kerangka menulis 6 berkas, draft terpisah dari daftar terpasang, `https://` ditolak saat simpan, metadata `estimatedMinutes` 7 tanpa mengubah `materialId`, cover katalog terpasang sebagai `assets/cover.webp` (cover png placeholder hilang), pemeriksaan mandiri lolos tapi tetap menagih review, pratinjau mengirim pesan `siap`, ekspor ke folder belum ada ditolak, ekspor 122 KB tanpa `.sig` dan tidak menimpa, hasil ekspor ditandatangani di luar aplikasi lewat `scripts/material-pack.mjs` lalu **terpasang sebagai materi nyata**, muncul di layar Konten dengan cover, dan terbuka di penampil; impor yang menabrak draft ditolak; hapus terkunci sampai konfirmasi ketik dan draft `e2e-studio-uji@1.0.0` bersih setelahnya |
| Gate T-122 | **PASS** â `cargo test` **122/122** (EXIT 0, 6 unit test `material_author` baru) Â· `npx tsc --noEmit` EXIT 0 Â· `npm test` **124/124** (17 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `npx vite build` EXIT 0 (18,75 dtk â diulang setelah perbaikan tinggi kontrol) Â· E2E `material-studio` 23/23 Â· `npm run a11y` **19/19** (Studio Materi 0 error 0 warning; 8 warning tersisa = target sentuh 24 px breadcrumb âBerandaâ, pola lama di 8 layar) Â· regresi `smoke` 8/8, `material-import` 12/12, `material-pin` 12/12, `material-catalog` 10/10, `home-catalog` 29/29, `pinned-materials` 16/16 |
| Ilustrasi eksplorasi sekali per aktivitas (T-137) | **PASS** — sebab: satu gambar per paket dipakai sebagai `coverAsset` katalog, cover header Player, dan `steps[].assetPath` **setiap** langkah (336/336 paket 1 gambar, 1.683 referensi). [explorationIllustration.ts](../../src/components/content/explorationIllustration.ts) `sharedStepAsset()` mengembalikan path hanya bila semua langkah memakai gambar yang sama; [ExplorationActivity.tsx](../../src/components/content/ExplorationActivity.tsx) merender satu `<img data-exploration-illustration="shared">` di atas langkah (simpul bertahan saat navigasi), sedangkan gambar berbeda per langkah tetap per langkah. Heuristik kata kunci **ditolak** karena banyak langkah merujuk diagram tanpa menyebut "gambar". Render gambar **1.683 → 336** (matematika kelas 1–6: 240 → 48) |
| Verifikasi T-137 | **PASS** — `npx tsc --noEmit` bersih · `npm test` **173/173** (20 berkas; 4 uji `explorationIllustration`) + fixture 4/4 + katalog 336/336 + `content:review-binding` PASS · E2E baru `cover-illustration` **PASS 3** (`npm run e2e:cover`, konten bawaan kelas4 matematika: 1 gambar bersama, simpul sama di langkah 2–3, mundur tidak menggandakan) · regresi `learning-journey` **PASS 14**. Konten/skema tidak disentuh; `reviewStatus` tetap `draft` |
| Ilustrasi aktivitas khusus 48 paket matematika (T-138) | **PASS** — [generate-activity-illustrations.mjs](../../scripts/generate-activity-illustrations.mjs) memuat `PLAN` 48 resep (kelas 1–6 b01–b08) yang menggambar vektor lalu merasterisasi ke PNG 800×600 lewat [illustrationKit.mjs](../../scripts/lib/illustrationKit.mjs) (`node:zlib` + crc32, tanpa dependensi baru); [wire-activity-illustrations.mjs](../../scripts/wire-activity-illustrations.mjs) (dry-run default / `--apply`) membaca `PLAN` dari generator, menambahkan entri aset **di akhir** `manifest.assets` (cover tetap gambar pertama), menetapkan `activity.assets`, `steps[].assetPath`/`altText`, `accessibilityMetadata.altText`, dan mengganti `reveal` yang menyalin alt generik (38 paket). 48 PNG = 341.570 byte; `public/content-catalog.json` tanpa diff; wiring diulang → “0 paket perlu dihubungkan · 48 sudah sinkron” |
| Verifikasi T-138 | **PASS** — 48/48 paket **VALID** (`npx tsx scripts/validate-content.ts <dir>` per paket) · `npx tsc --noEmit` bersih · `npm test` **173/173** + fixture 4/4 + katalog 336/336 + `content:review-binding` PASS · E2E `cover-illustration` **PASS 3**, `learning-journey` **PASS 14**, `activities` **PASS 17**, `home-catalog` **PASS 29** (aplikasi dev dihentikan untuk E2E). Batas: hanya 48 paket matematika; ilustrasi buatan kode belum dinilai guru; `reviewStatus` tetap `draft` |
| Ilustrasi berbeda per langkah 48 paket matematika (T-139) | **PASS** — [generate-activity-illustrations.mjs](../../scripts/generate-activity-illustrations.mjs) kini menyusun `PLAN` dari enam modul [activityPlans/kelas1…6.mjs](../../scripts/lib/activityPlans), tiap paket lima `draw` berbeda dengan bantuan adegan bersama [activityScenes.mjs](../../scripts/lib/activityScenes.mjs); PNG 800×600 dirasterisasi [illustrationKit.mjs](../../scripts/lib/illustrationKit.mjs) (tanpa dependensi baru). [wire-activity-illustrations.mjs](../../scripts/wire-activity-illustrations.mjs) menghapus entri `assets/<base>.png` lama + berkasnya lalu menambahkan lima entri langkah **setelah cover**, menetapkan `activity.assets`, `steps[].assetPath`/`altText` (dan `reveal` bila menyalin alt lama), `accessibilityMetadata.altText` = ringkasan. `sharedStepAsset()` → `null` saat lima path berbeda, jadi `<img data-exploration-illustration="step">` dirender per langkah **tanpa perubahan kode UI**. 240 PNG = **1.632.874 byte (1.594,6 KiB)**, **240 hash unik**, 0 kelompok duplikat (pasangan lintas paket dibedakan: kelas4 b02#1↔kelas5 b03#1, kelas4 b06#2↔kelas5 b04#1, kelas1 b07#4↔kelas2 b06#4, kelas3 b05#2↔kelas4 b05#2); `public/content-catalog.json` tanpa diff |
| Verifikasi T-139 | **PASS** — `npx tsx .tmp-tools/validate-all-math.ts` → **48 paket · 48 VALID · 0 masalah** · `npx tsc --noEmit` bersih · `npm test` **173/173** (20 berkas) + fixture 4/4 + katalog 336/336 + `content:review-binding` PASS · E2E (`npm run e2e:cover`, aplikasi dev dihentikan) `cover-illustration` **PASS 7** (lima `src` berbeda dan lima alt ≥20 karakter, `shared === 0` di tiap langkah, kembali ke langkah 4 memulihkan gambar+alt) · regresi `learning-journey` 14/14, `activities` 17/17, `home-catalog` 29/29 · wiring diulang → “0 paket perlu dihubungkan · 48 sudah sinkron” · visual `ilustrasi-langkah-2.png` diperiksa (gambar berbeda, “Langkah 2 dari 5”, badge DRAFT, `reviewStatus` tetap `draft`); koreksi alt paket Bilangan 1–10 (“apel”/“centang” → titik merah/garis penanda) lewat rencana + wire ulang, commit `ec83b61`. Batas: hanya 48 paket matematika; ilustrasi buatan kode belum dinilai guru; 288 paket lain masih memakai satu cover untuk semua langkah |
| Player matematika ditata ulang (T-140) | **PASS** — [LessonPlayer.tsx](../../src/screens/LessonPlayer.tsx) hero 228 → **71 px** (cover 48×80, judul, badge, meta, ringkasan satu baris, Sematkan), baris tab berisi tiga tab + `Layar penuh` dan pesan penyimpanan pindah ke baris terpisah yang terpotong (hanya tampil untuk pratinjau/galat/tersimpan), panel eksplorasi `p-4 md:p-5`; aside kanan (`xl`, 17,5 rem → 20 rem 2xl) memuat Tujuan, Aktivitas & kemajuan, dan **Ringkasan sesi** (pindah dari pita bawah) sehingga hilang otomatis di layar penuh. [ExplorationActivity.tsx](../../src/components/content/ExplorationActivity.tsx) memakai panggung dua kolom — ilustrasi (`h-[clamp(200px,38vh,520px)]`, `xl` 44vh, layar penuh 56vh) + rel teks 15 rem — dengan kartu gambar selebar rasionya sendiri, label dukungan **Petunjuk** (ikon lampu) dan **Pembahasan** (ikon buku) berupa baris disclosure penuh dengan chevron + `aria-expanded`/`aria-controls`, panel dibuka di rel (bukan menumpuk ke bawah), navigasi di footer bergaris atas |
| Verifikasi T-140 | **PASS (tanpa E2E)** — `npx tsc --noEmit` bersih · `npm run build` “✓ built in 11.41s” · `npm test` **173/173** (20 berkas) + fixture 4/4 + katalog 336/336 + `content:review-binding` PASS · `npm run content:validate` 0 issue · pengukuran CDP `1366×768`: hero 71, tabs 44, panel 270–755, gambar 444×338, `Lanjut` 690–734 (terlihat), `main.scrollHeight = clientHeight = 728`, tanpa overflow horizontal; `1600`, `1920`, `1024` terlihat penuh (nav 664–708 pada 1024) · layar penuh 1366: hero/aside/progress/summary tersembunyi, panel 1326 lebar, gambar 573×430, nav 678–722, `scrollHeight = clientHeight = 768` · label panel `["Petunjuk","Pembahasan","Sebelumnya","Lanjut"]`, `naturalWidth` 800 · E2E **belum dijalankan** (aplikasi dev masih berjalan; harness menolak saat `ifp-apps.exe` aktif) |
| Normalisasi framing ilustrasi (T-140b) | **PASS** — [illustrationKit.mjs](../../scripts/lib/illustrationKit.mjs) `normalizeContent()` mengukur kotak isi (piksel non-putih, ambang <250) lalu memotong margin dan memperbesar isi ke kanvas 800×600 yang sama (margin 20 px, `minGain` 1,25, `maxGain` 1,9, bilinear dari render 2×) sehingga ukuran/rasio berkas dan skema aset tidak berubah; [generate-activity-illustrations.mjs](../../scripts/generate-activity-illustrations.mjs) memanggilnya di `renderStep` · **93 dari 240 PNG** berubah (gain ≥1,25×; sisa 147 sudah memenuhi kanvas), `npm run content:assets:wire -- --apply` memperbarui `sizeBytes`/`sha256` di **40 manifest** (8 sudah sinkron), `content:catalog` 336 entri, `content:gallery` 48 paket/240 gambar · pengukuran cakupan isi sebelum normalisasi: lebar **median 81%** (min 28%), tinggi **median 56%** (min 8%); 59 langkah punya gain ≥1,35× (maks 2,83×) |
| Pembahasan lengkap eksplorasi (T-141) | **PASS** — [ExplorationActivity.tsx](../../src/components/content/ExplorationActivity.tsx) membaca `interactionConfig.explanation` opsional (`{ title?, paragraphs[] }`, `readExplanation()`); tombol **Pembahasan lengkap** (ikon ringkasan, garis putus-putus teal) di rel teks setiap langkah dan **Baca pembahasan lengkap** di kartu selesai membuka tampilan `explanation` menggantikan langkah: eyebrow, `h2` ber-`tabIndex={-1}` yang menerima fokus, isi `max-w-[70ch]` dengan gulir internal `max-h-[clamp(160px,38vh,460px)]`, footer **Kembali ke langkah** (+ **Lanjut berlatih** bila aktivitas sudah selesai) yang mengembalikan fokus ke tombol pemicu; paket tanpa `explanation` tidak menampilkan pemicu. Data contoh: [activity-001.json](../../content/packages/kelas1-matematika-b01-bilangan-1-10/activities/activity-001.json) lima paragraf yang selaras dengan lima langkah dan tiga tujuan pelajaran |
| Verifikasi T-141 | **PASS** — `npx tsc --noEmit` bersih · `npm run build` PASS · `npm test` **173/173** (20 berkas) + fixture 4/4 + katalog 336/336 + `content:review-binding` PASS · `npm run content:validate -- <paket>` **VALID**, 0 issue · pengukuran CDP: **1366×768** pemicu 466–510, bagian 291–719, isi 292/381 (bergulir), kembali 675–719, fokus di `h2`, `main.scrollHeight = clientHeight = 713`; **1024** bagian 311–739, isi 292/381, kembali 695–739; **1920** isi 381/381 (muat), lebar isi 604 px · **kartu selesai 1366**: tombol `["Ulangi eksplorasi","Baca pembahasan lengkap","Lanjut berlatih"]`, lalu tampilan pembahasan `["Kembali ke langkah","Lanjut berlatih"]` · tangkapan layar `explanation-1366-step/open/complete/complete-open`, `explanation-1024-open`, `explanation-1920-open` diperiksa · **E2E baru `explanation` PASS 7** ([explanation.mjs](../../scripts/e2e/scenarios/explanation.mjs), aplikasi dev ditutup; deep link `#player/kelas1-matematika-b01-bilangan-1-10/bilangan-1-10`): satu pemicu di langkah 1, pembahasan 5 paragraf/kolom 604 px/tinggi 342–381 px, fokus pindah ke judul lalu kembali ke pemicu, kartu selesai memuat tiga tombol, `Lanjut berlatih` berpindah ke tab kuis, dan paket “Bilangan Cacah Besar” tanpa field tidak menampilkan pemicu · regresi `activities` 17/17, `learning-journey` 14/14, `player-fullscreen` **6/6**, `cover-illustration` 7/7, `smoke` 8/8, `a11y` **19/19** (0 error, 8 warning reflow/target sentuh lama) |
| Pembahasan memenuhi lebar panel (T-142) | **PASS** — [ExplorationActivity.tsx](../../src/components/content/ExplorationActivity.tsx) menghapus batas `max-w-[70ch]`; `splitParagraphs()` membagi paragraf menurut jumlah karakter sehingga dua kolom seimbang muncul lewat container query `@min-[760px]:grid-cols-2` (panel ≥760 px, diturunkan dari 860 px pada T-143) dan tetap satu kolom penuh di bawahnya; gulir internal `max-h-[clamp(160px,44vh,520px)]`. Pemilihan dua kolom berbasis lebar panel, bukan viewport, supaya layar penuh di 1366 px dan panel sempit di 1920 px sama-sama benar |
| Verifikasi T-142 | **PASS** — `npx tsc --noEmit` bersih · `npm run build` "✓ built in 17.03s" (CSS memuat `@container (width>=860px)`) · `npm test` **173/173** + fixture 4/4 + katalog 336/336 + `content:review-binding` PASS · pengukuran CDP: **1024×768** panel 647, isi 647/647, satu kolom (blok bertumpuk), tinggi 338/381, `main.scrollHeight = clientHeight = 1309`; **1366×768** panel 685, isi 685/685, satu kolom, 338/381, `727/727`; **1920×1080** panel 1014, isi 1014/1014, **dua kolom 485+485**, tinggi 288/288 (muat tanpa gulir); `overflowX` false di ketiganya · tangkapan layar `explanation-lebar-1024/1366/1920.png` diperiksa · **E2E `explanation` PASS 7** — kini memeriksa `bodyWidth ≥ sectionWidth − 2` dan jumlah kolom sesuai ambang 860 px (window E2E: panel 894 → 2 kolom, lebar 894/894, tinggi 313/313) · regresi `activities` 17/17, `learning-journey` 14/14, `cover-illustration` 7/7, `player-fullscreen` 6/6, `smoke` 8/8, `a11y` 19/19 (0 error, 8 warning reflow/target sentuh lama) |
| Verifikasi T-143 | **PASS** — `npx tsc --noEmit` bersih · `npm run build` "built in 12.67s", CSS memuat `@container (width>=760px)` · `npm test` **173/173** (20 berkas) + fixture 4/4 + katalog 336/336 + `content:review-binding` PASS · pengukuran CDP via `Emulation.setDeviceMetricsOverride`: **1024×768** panel 647 satu kolom 338/381, **1366×768** 685 satu kolom 338/381, **1440×900** 774 **dua kolom 365+365** 386/386, **1536×960** 830 dua kolom 393+393 361/361, **1920×1080** 1014 dua kolom 485+485 288/288; `overflowX` false di semua lebar · tangkapan layar `explanation-lebar-1440.png` diperiksa · E2E `explanation` **PASS 7** (panel harness 894 → 2 kolom) · regresi `activities` 17/17, `learning-journey` 14/14, `cover-illustration` 7/7, `player-fullscreen` 6/6, `smoke` 8/8, `a11y` 19/19 (0 error, 8 warning lama); aplikasi dev ditutup untuk E2E (WebView2 satu instance) |
| Pembahasan lengkap 48 paket matematika (T-144) | **PASS** — modul teks baru [mathExplanations/kelas1…6.mjs](../../scripts/lib/mathExplanations/) memuat **47 entri** (7+8+8+8+8+8) berformat `{ title, paragraphs[5] }`; tiap paragraf diturunkan dari `prompt`/`reveal`/`hint` dan tujuan paketnya — bukan templat — dan paragraf terakhir memberi contoh hitung dengan angka berbeda. [wire-math-explanations.mjs](../../scripts/wire-math-explanations.mjs) baru: dry-run default, `--apply` menulis, `--force` menimpa teks berbeda, memvalidasi judul + 3–8 paragraf + paket `-matematika-`, menolak aktivitas non-eksplorasi, dan **gagal bila ada paket matematika tanpa teks**; idempoten lewat perbandingan deep-equal. `npm run content:explanation:wire` ditambahkan ke [package.json](../../package.json). 47 × `activities/activity-001.json` mendapat satu blok `explanation` setelah `steps` (+10 baris per berkas; 47 berkas, 517 insertions). Kasus negatif E2E dipindah ke paket non-matematika karena seluruh paket matematika kini punya pembahasan |
| Verifikasi T-144 | **PASS** — 48/48 paket matematika **VALID** (loop `validatePackageDirectory`; catatan: `npm run content:validate` hanya memvalidasi satu direktori, jadi dipakai skrip sementara `.tmp-e2e/validate-math.ts`) · `npx tsc --noEmit` bersih · `npm run build` PASS · `npm test` **173/173** (20 berkas) + fixture 4/4 + katalog 336/336 + `content:review-binding` PASS · `content:explanation:wire` dijalankan dua kali: apply lalu verifikasi → “0 paket perlu diperbarui · 47 sudah sinkron · 1 di luar data” · E2E `explanation` **PASS 7** — paket contoh tetap 5 paragraf/2 kolom, dan paket pembanding IPAS “Tubuhku dan Inderaku” tanpa field tidak menampilkan pemicu · pengukuran CDP dua paket baru (`kelas1-matematika-b04-pengukuran`, `kelas6-matematika-b04-lingkaran`): pembahasan terbuka, 5 paragraf, tinggi isi = `scrollHeight` (239/239 dan 215/215), `overflowX` false; tangkapan layar `pembahasan-kelas1-pengukuran.png` dan `pembahasan-kelas6-lingkaran.png` diperiksa (dua kolom seimbang, fokus di judul, lencana DRAFT, sidebar utuh) · **belum dinilai guru**; `reviewStatus` 336 paket tetap `draft` |
## Blocker

| ID | Blocker | Dampak |
|---|---|---|
| OD-1 | Matriks mapel/kurikulum: **disetujui PO + Curriculum Lead via sesi 2026-10-26** | Phase-level terisi 320/320; CP/ATP per bab belum diverifikasi; klaim kesesuaian kurikulum tetap dilarang |
| â | Reviewer manusia belum ditunjuk | `reviewStatus: approved` tidak boleh disetel |
| GAP-1 | Prototype `index.html` tidak ada | Referensi UI visual hilang |

## Handoff

**Sesi ditutup 2026-10-24 01:25 +07:00, dibuka kembali 06:30 +07:00.** Working tree bersih pada `c51af2f`; tidak ada gelombang terbuka; aplikasi dev berjalan.

### Next Session Handoff

1. **Jaga CI hijau**: `main` dilindungi â alur sekarang branch â PR â 2 checks hijau â merge; push langsung diblokir (termasuk admin).
2. **Perluas E2E**: smoke, profil, alur belajar, rollback, lisensi offline/online, a11y sudah ada; sisa dialog native (impor file).
3. **A11y manual**: NVDA/TalkBack, zoom 200%/reflow, state dinamis (hasil kuis, konfirmasi hapus), target sentuh.
4. **Gate rilis**: OD-1 sign-off konten, OD-4 retensi/privasi, OD-5 kebijakan lisensi, OD-6 signing/identifier, OD-7 backend+CSP produksi, key lisensi produksi, DV-01â¦DV-20.

Resume minimal: `.qoder/state.json` â `.qoder/index/index-state.json` â `.qoder/context.md` â `.qoder/memory.md` â `CURRENT.md`.

Mulai dari [CATALOG.md](../content/CATALOG.md) dan [CURRICULUM_PROPOSAL.md](../content/CURRICULUM_PROPOSAL.md). D1âD8 sudah disetujui PO + Curriculum Lead via sesi 2026-10-26; tanpa review manusia, paket tetap **draft**. Arsitektur: [ADR-0004](../decisions/ADR-0004-local-persistence.md); profil [ADR-0015](../decisions/ADR-0015-profiles-preferences.md)/[ADR-0018](../decisions/ADR-0018-profile-lifecycle.md); testing [ADR-0017](../decisions/ADR-0017-ci-e2e-harness.md)/[ADR-0019](../decisions/ADR-0019-automated-a11y-audit.md).

### Handoff Aset Materi Kelas 1â3 (2026-10-26, lanjutan)

**Status:** **152/152 gambar LENGKAP** â Kelas 1 48/48; Kelas 2 48/48; **Kelas 3 56/56** (96â151). Seluruh 152 file WebP ada di `content/materi/kelas1`â`kelas3` dan cocok dengan `content/materi/queue-kelas1-3.json`. **Migrasi manifest selesai:** 320/320 paket (Kelas 1â6) kini menunjuk WebP; validasi 320/320 VALID; `npm test` 85/85 lulus; `npm run build` sukses (dist 320 WebP, 0 PNG). Laporan: `knowledge/content/MATERI_KELAS1-3_BATCH1_2026-10-25.md` â¦ `MATERI_KELAS1-3_BATCH38_2026-10-26.md`.

**Akun & perkakas aktif (2026-10-26):** generasi dilanjutkan di akun **Dewi Gardenia** (label akun diverifikasi di UI), project `218ad195-1801-4997-bffc-c754043067d6` (âOkt 25 - 15:50â). Karakter bernama **Ayu** dan **Bima** dibuat di akun ini (Karakter â Karakter baru â âTambahkan dari projectâ â `ayu.jpg`/`bima.jpg` â nama + kepribadian â Selesai) dan dilampirkan ke setiap prompt satu per satu via âTambahkan bahan ke kotak perintahâ (picker hanya menampilkan karakter yang belum terpasang; pasang dua chip per prompt). Indeks 89â123 tuntas.

**Catatan banner (2026-10-26):** indeks 91 sempat kena banner âaktivitas yang tidak biasaâ; diselesaikan dengan satu retry âCoba lagiâ lalu satu refresh halaman, lalu prompt dikirim ulang (prosedur sama seperti indeks 76/83/84/86/87; tanpa bypass, tanpa ganti akun). Batch 26 (92â95) bebas banner.

**Pasca-152 (SELESAI 2026-10-26):**
1. â Migrasi manifes Kelas 1â6 dengan `scripts/migrate-materi-assets-to-webp.mjs --apply` â 320 paket, 669 referensi lesson/activity, idempoten.
2. â Validasi 320/320 paket **VALID** (636 warning draft/curriculumRefs).
3. â `npm test` 85/85 lulus; fixture 4/4; catalog 320 entri/320 paket. `npm run build` sukses (22,46 s; dist 320 WebP, 0 PNG).
4. â Tidak ada paket yang masih menunjuk PNG; seluruh aset paket kini `.webp`.

### Catatan operasional Flow (2026-10-25 20:47 +07:00)

- Surface in-app Browser harus terlihat (`visibilityState = visible`) sebelum klik; saat hidden, CDP input tidak terkirim dan `take_screenshot` gagal (`NATIVE_BROWSER_VIEWPORT_UNAVAILABLE`). Bila terjadi: minta user membuka panel; jangan mengulang klik otomatis.
- **Rasio composer WAJIB 4:3 (`crop_landscape`)** â pernah tersetel 16:9 dan menghasilkan 1376Ã768 yang tidak dipakai. Cek chip setelan sebelum setiap kirim.
- Setelah panel terlihat, `Enter` pada composer mengirim prompt (klik tombol juga berfungsi).
- Unduhan 1K Flow kadang selesai sebagai `<uuid>.tmp` beberapa detik sebelum rename; tunggu ukuran stabil dan verifikasi `file` (JPEG 1200Ã896).
- Batch 7 keluar native 1200Ã896; konversi canvas 1200Ã896 â WebP 0.9 via queue server `127.0.0.1:4789`, simpan `&grade=1`.
- **Jalur unduh tanpa klik (dipakai sejak indeks 22):** baca `img.currentSrc` hasil generasi dari DOM â buka URL `flow-content.google/image/...` di tab kedua (same-origin) â `fetch(location.href)` â canvas 1200Ã896 â `toBlob('image/webp',0.9)` â POST ke queue server.
- **UI Flow berganti ke layout agent (sejak 2026-10-25 ~21:30):** project menampilkan sidebar agent + composer "Apa yang ingin Anda buat?" + "Petunjuk agen". Prompt cukup dikirim ke agent (satu topik; minta "1 ilustrasi"), agent memakai Ayu/Bima dari konteks project â **tidak perlu melampirkan karakter manual**. Agent membalas "Berikut adalah N gambar â¦".
- **Ambil resolusi penuh dari grid agent:** thumbnail di grid adalah `flow.google.com/asb/...=s512-rw`; ganti sufiks menjadi `=s1600-rw` â respons **WebP 1200Ã896** (bukan JPEG). `fetch` same-origin (flow.google.com) â POST blob langsung ke queue server, tanpa canvas.
- Surface hanya dibutuhkan untuk mengirim prompt (Enter bekerja bila tab ter-attach); unduhan tidak lagi menyentuh panel.

### Handoff Pengayaan Konten (2026-10-26, T-070)

**Status:** kedalaman & duplikasi **SELESAI** untuk 320 paket draft. 316 paket warisan diperkaya via `scripts/enrich-legacy-packages.mjs` (2 langkah eksplorasi baru + 1 aktivitas penguatan); 3 paket duplikat persis didiferensiasi via `scripts/differentiate-duplicate-packages.mjs`. Review ulang: 320/320 VALID, kedalaman 320/320 (â¥5 langkah/â¥3 aktivitas/â¥8 item), 0 grup duplikasi persis, 0 grup aktivitas identik. `npm test` 85/85 + fixture 4/4 + catalog 320/320; `npm run build` dist 320 WebP / 0 PNG.

**OD-1 (T-071):** D1âD8 disetujui PO + Curriculum Lead via instruksi sesi 2026-10-26 (tanpa tanda tangan tertulis); `curriculumRefs` terisi **320/320** fase A/B/C versi 2024 via `scripts/fill-curriculum-refs.mjs`. Verifikasi CP/ATP per bab belum dilakukan.

**Sisa (butuh manusia):** reviewer manusia R1âR6, R8âR9, R12; verifikasi CP/ATP per bab oleh Curriculum Lead. `reviewStatus` tetap `draft`.

**Perintah lanjut:** `resume` atau `lanjutkan` (boot dari `state.json` + `CURRENT.md`; antrean gambar 152/152 tuntas, migrasi WebP dan pengayaan kedalaman selesai â lanjut ke prioritas berikutnya: tanda tangan Curriculum Lead / gate rilis).

### Handoff Pra-Review Agent (2026-10-26, T-072)

**Status:** pra-review agent R1âR6/R8âR9/R12 **SELESAI** untuk 320 paket â **bukan approval**, tanpa PASS/FAIL, `reviewStatus` tetap `draft`. Dihasilkan oleh `npm run content:prereview` (`scripts/pedagogical-prereview.mjs`), deterministik dan dapat dijalankan ulang.

| Artefak | Isi |
|---|---|
| [PEDAGOGICAL_PREREVIEW_2026-10-26.md](../content/PEDAGOGICAL_PREREVIEW_2026-10-26.md) | Ringkasan temuan per kriteria + batas peran agent vs manusia |
| [PEDAGOGICAL_SAMPLE_2026-10-26.md](../content/PEDAGOGICAL_SAMPLE_2026-10-26.md) | Sampel baca 40 paket (1 per kelasÃmapel), teks apa adanya untuk ahli mapel |
| [prereview-flags-2026-10-26.csv](../content/prereview-flags-2026-10-26.csv) | 320 baris metrik + flag per paket |
| [prereview-evidence-2026-10-26.json](../content/prereview-evidence-2026-10-26.json) | Bukti penuh per paket (objektif, item, posisi kunci, hint, aset) |

**Angka sinyal (bahan periksa, bukan vonis):** R1 66 paket (67 tujuan cakupan kata kunci <0.5; 1 tujuan tanpa kata bermakna) Â· R3 40 paket (82 kalimat melewati batas kata/kelas) Â· R4 0 (estimasi 10,5â14,4 menit) Â· R5 184 paket (170 matching identik dengan langkah eksplorasi, 91 semua kunci di posisi sama, 1188/2851 item tak terpetakan via kata kunci) Â· R6 0 (policy 320/320, hint 320/320, 0 kata kasar, 20 nada negatif perlu konteks) Â· R8 0 Â· R9 0 (320 aset ada) Â· R12 1 file (`CATALOG.md` tanpa label eksplisit âPendidikan Agama Islamâ).

**Temuan desain utama untuk reviewer:** 170 paket memakai pasangan matching yang identik dengan prompt/reveal eksplorasi (beban ganda, bukan penguatan), dan 91 paket menempatkan seluruh kunci pilihan ganda pada posisi opsi yang sama.

**Lembar kerja reviewer** (`knowledge/release/REVIEW_WORKSHEET_2026-10-25.md` + CSV) sudah disinkronkan: jumlah aktivitas terbaru, kolom R1âR12 dan reviewer tetap kosong.

### Handoff Review UX/UI (2026-10-26, T-074)

**Status:** dokumen gabungan selesai di [`design/UX_REVIEW_LAYOUT_PEMBELAJARAN_2026-10-26.md`](../design/UX_REVIEW_LAYOUT_PEMBELAJARAN_2026-10-26.md) â **bukan approval**, tanpa usability test. Menggabungkan review eksternal (ChatGPT share, skor heuristik 6,5/10) dengan audit kode aktual.

**Angka:** 20 temuan â P1 5 (skala IFP, feedback per jawaban, hasil di luar viewport, metadata internal, copy hardcoded), P2 10, P3 5. Kontras terukur: teal 2,81â2,95:1, danger di tint 4,23:1, label sidebar 4,06:1; muted 4,76:1 dan putih/primary 5,38:1 lolos.

**Yang perlu diputuskan manusia (bukan agent):** D-UX-1 dua mode Siswa/Pengelola Â· D-UX-2 baseline skala IFP (16â18 px vs 20â24 px) Â· D-UX-3 font Â· D-UX-4 perlakuan metadata DRAFT/versi Â· D-UX-5 bentuk matching Â· D-UX-6 prioritas matching P1 (literasi kelas 1) vs P2.

**Merge berkas eksternal (2026-10-26):** `review-layout-pembelajaran-gerbang-edukasi.md` diunduh dari share page (tombol âDownload fileâ membuka URL raw; pointer click gagal karena surface browser tersembunyi, tombol dipicu via DOM satu kali) â 337 baris/14.998 byte UTF-8. Isi unik digabung: 8 prinsip UX (Â§5.1), aturan ilustrasi/ikon (Â§7.1), skor heuristik per area (Â§8.1), matriks state interaksi (Â§9.1), checklist 13 item (Â§9.2), urutan P0 â prototipe â uji â P1 (Â§12). Berkas asli tidak di-commit (karya pihak ketiga); substansi masuk dokumen kanonik dengan atribusi.

**Koreksi setelah cek kode:** review eksternal menyebut player belum punya state memuat/penyimpanan eksplisit dan `Sebelumnya` belum ada â setelah verifikasi, `Memuat kontenâ¦` ada ([LessonPlayer.tsx:179-185](../../src/screens/LessonPlayer.tsx#L179)), storage `saved`/`error` ada ([LessonPlayer.tsx:28-34](../../src/screens/LessonPlayer.tsx#L28)), dan `Sebelumnya`/`Lanjut` ada di eksplorasi ([ExplorationActivity.tsx:156-170](../../src/components/content/ExplorationActivity.tsx#L156)); celah sebenarnya adalah konsistensi antar tipe aktivitas.

**Catatan bukti:** screenshot ada di `F:\_ifp-apps\.tmp-screenshots\` (git-ignored; zip `layout-pembelajaran-2026-10-26.zip`); Hasil Belajar berisi data **belum** diverifikasi karena butuh jendela desktop.

### Handoff Eksekusi P0 UX (2026-10-26, T-075)

**Status:** 5 dari 6 butir P0 di [`design/UX_REVIEW_LAYOUT_PEMBELAJARAN_2026-10-26.md`](../design/UX_REVIEW_LAYOUT_PEMBELAJARAN_2026-10-26.md) selesai. Butir 3 (sembunyikan metadata internal) **tidak dieksekusi** karena menunggu D-UX-1 (dua mode) dan D-UX-4 (perlakuan metadata).

**Perubahan:**
- Copy: `QuizActivity` memakai âSkor minimal lulus: N dari 100â + pujian netral; `ExplorationActivity` memakai jumlah langkah dinamis dan tombol âLanjut berlatihâ.
- Label: modul baru [`src/content/subjectLabel.ts`](../../src/content/subjectLabel.ts) dengan peta 7 slug mapel katalog + fallback; dipakai Home, Curriculum, Player (metadata & pemilih paket), dan Hasil Belajar (judul lesson/aktivitas via katalog + paket bawaan).
- Kontras: token `--color-teal-strong #0b6f69` dan `--color-danger-strong #a8323c`; seluruh teks error di tint danger memakai `danger-strong`; label grup & footer sidebar `white/70`; teks âscaffoldâ dihapus.
- Afordansi: breadcrumb âBerandaâ menjadi tombol (klik terverifikasi â `#home`); matching menyebut sisa pasangan saat tombol nonaktif; pesan penyimpanan footer dihapus dan informasi âbelum disinkronkanâ dipindah ke banner status.

**Verifikasi:** `npm test` **89/89** (3 test baru `subjectLabel`) + fixture 4/4 + catalog 320/320; `npm run build` **PASS**; DOM dev terverifikasi untuk label, breadcrumb, hint, copy kuis/eksplorasi, dan pesan tunggal. Screenshot: `p0-01-kurikulum-label.png` (`.tmp-screenshots/`, git-ignored); screenshot Player gagal karena surface browser tersembunyi. `npm run a11y` dan Hasil Belajar berisi data **belum** dijalankan/diverifikasi.

**Sisa:** butir 3 P0 (gated D-UX-4), P1 (skala IFP, feedback per jawaban, hasil di viewport, progres lintas aktivitas, target sentuh), P2/P3; D-UX-1 selesai di T-077, sisa keputusan D-UX-2â¦D-UX-6.

### Handoff UX-03 + Audit a11y + E2E (2026-10-26, T-076)

**Status:** UX-03 (kartu hasil di luar viewport) **selesai** untuk bagian otomatis; label tiga keadaan per jawaban (UX-02) tetap tertahan D-UX-5.

**Perubahan kode:** `QuizActivity`, `MatchingActivity`, `OrderingActivity` â kartu hasil memakai `ref`, `tabIndex={-1}`, `scrollIntoView({ block: "nearest" })` dan `focus()` saat hasil muncul; `aria-live="polite"` tetap. Cincin fokus `focus-visible:ring-2 ring-primary/50` untuk pengguna keyboard.

**Perubahan harness:**
- `scripts/e2e/scenarios/a11y.mjs` â audit hasil kuis memakai paket bawaan aktual: tombol âKuis Penguatanâ + opsi `opsi-penguatan-1-1`/`-2-2` (sebelumnya merujuk paket pilot âKuis Pecahan Sederhanaâ yang tidak lagi menjadi lesson default).
- `scripts/e2e/scenarios/learning-journey.mjs`, `home-catalog.mjs` â tombol âLanjut ke kuisâ â âLanjut berlatihâ (copy P0 T-075).
- `scripts/e2e/scenarios/activities.mjs` â 3 asersi fokus kartu hasil (`document.activeElement` memuat âSkor 100 dari 100â) untuk kuis, matching, ordering.

**Verifikasi aktual:** `npm test` 89/89 + fixture 4/4 + catalog 320/320 Â· `npm run build` PASS Â· `npm run a11y` **PASS 16 pemeriksaan** (0 error, 7 warning reflow) Â· `npm run e2e` 8/8 Â· `e2e:activities` 8/8 Â· `e2e:home` 9/9 Â· `e2e:journey` 11/11 Â· `e2e:profile` 7/7.

**Catatan operasional:** proses `ifp-apps.exe` (PID 94584) masih hidup meski user menyatakan app ditutup; setelah konfirmasi user, proses ditutup dengan `taskkill /PID 94584 /F` agar harness bisa berjalan.

**Sisa:** Hasil Belajar berisi data (belum diverifikasi dengan data desktop), NVDA/screen reader manual, D-UX-2â¦D-UX-6.

### Handoff Dua Mode: Belajar & Admin (2026-10-26, T-077)

**Status:** D-UX-1 **diputuskan PO** lewat instruksi sesi (âmode belajar harus full device tanpa sidebarâ); implementasi awal **selesai**. Mode belajar = pembatas UI, **bukan otorisasi**: belum ada PIN/kunci mode admin.

**Perilaku:**
- Mode **admin** (default): sidebar navy lengkap (Belajar + Kelola), seperti sebelum T-077.
- Mode **belajar**: sidebar tidak dirender; konten selebar perangkat; bar navigasi horizontal 4 tujuan (Beranda, Jelajah Materi, Aktivitas Interaktif, Hasil Belajar); Player tetap dapat dibuka dari materi/Beranda tetapi tidak menjadi tujuan navigasi; Konten/Lisensi/Pengaturan tidak dapat dibuka (layar dipindahkan ke Beranda, hash diselaraskan).
- Sakelar mode di bilah atas: dua tombol ikon (topi wisuda = Belajar, slider = Admin) dengan grup `Mode aplikasi`, `aria-pressed`, `aria-label`, dan `title`; perubahan langsung berlaku dan disimpan ke `preferences.appMode` (SQLite `app_meta`).

**Perubahan kode:**
- `src/navigation.ts` â `AppMode`, `DEFAULT_APP_MODE` (`admin`), `studentNavigationItems`, `navigationItemsForMode()`, `isScreenAllowedInMode()`, `isAppMode()`.
- `src/components/layout/AppShell.tsx` â sidebar hanya mode admin; `StudentNavigation` hanya mode belajar; `MobileNavigation` memakai item sesuai mode.
- `src/components/layout/TopBar.tsx` â sakelar mode; pesan `aria-live` bila penyimpanan gagal.
- `src/components/layout/StudentNavigation.tsx` (baru; **digantikan rail ikon `StudentRail.tsx` pada T-078d**), `src/components/layout/MobileNavigation.tsx`.
- `src/App.tsx` â memuat `appMode` saat start, pengalihan layar terlarang, simpan via `preferences_set`.
- `src/data/preferencesRepository.ts` â `Preferences.appMode`.
- `src-tauri/src/preferences.rs` â `app_mode` dengan serde default `admin` (rekaman lama tetap terbaca), validasi `belajar|admin`, 2 test baru.
- `src/screens/SettingsScreen.tsx` â catatan bahwa mode diatur dari bilah atas.
- `src/navigation.test.ts` (baru) â 4 test; `scripts/e2e/scenarios/mode-switch.mjs` (baru) + `npm run e2e:mode`; `a11y.mjs` menambah audit mode belajar.

**Verifikasi aktual:** `npm test` 93/93 + fixture 4/4 + catalog 320/320 Â· `cargo test` 64/64 Â· `npm run build` PASS Â· `npm run a11y` **PASS 17 pemeriksaan** (0 error, 7 warning reflow) Â· E2E `mode-switch` 5/5 Â· regresi smoke 8/8 Â· home 9/9 Â· activities 8/8 Â· journey 11/11 Â· profile 7/7.

**Catatan operasional:** proses dev (`npm run tauri dev`) dan `ifp-apps.exe` sisa ditutup agar harness bisa start; aplikasi dev dijalankan ulang setelah verifikasi.

**Sisa:** skala tipografi/target sentuh mode siswa (D-UX-2), pemindahan metadata internal ke area pengelola (D-UX-4), keputusan PIN/kunci mode admin, verifikasi visual Hasil Belajar dengan data nyata + NVDA.

### Handoff Sakelar Ikon + Thumbnail Materi (2026-10-26, T-078)

**Status:** selesai dan terverifikasi. Permintaan PO: sakelar mode cukup ikon, wajib tersimpan di memori/SQL; setiap pilihan materi diberi thumbnail dari gambar yang sudah ada.

**Perubahan kode:**
- `src/components/layout/TopBar.tsx` â dua tombol ikon SVG inline (topi wisuda untuk Belajar, slider untuk Admin), 44Ã44 px, `aria-label` = âBelajarâ/âAdminâ, `title` = âMode belajarâ/âMode adminâ, `aria-pressed` tetap.
- `src/content/lessonCovers.ts` (baru) â peta URL aset bundled via `import.meta.glob(..., { eager: true, query: "?url" })` dan pemetaan media type dari ekstensi.
- `src/components/content/LessonThumbnail.tsx` (baru) â thumbnail `object-cover` 16:9; bundled memakai URL glob, paket impor memakai `content_read_asset` â blob URL (di-revoke saat unmount); fallback inisial subjek bila aset tidak ada/gagal.
- `src/content/catalog.ts`, `scripts/lib/contentCatalog.mjs`, `scripts/check-catalog-index.mjs` â field `coverAsset` (aset gambar pertama manifest) di 320/320 entri katalog.
- `src/screens/CurriculumScreen.tsx` â kartu materi menampilkan thumbnail di atas judul, grid **3 kolom** (md+); filter kelas berupa panel **collapsible** berisi tile thumbnail (cover materi per kelas), header menampilkan chip kelas terpilih dan menutup otomatis setelah memilih (T-078f), menggantikan dropdown.
- `src/components/layout/StudentRail.tsx` (baru) â rail ikon 80 px untuk mode belajar: 4 tujuan, ikon SVG inline, label sr-only + tooltip, `aria-current`; menggantikan bar horizontal `StudentNavigation.tsx` (dihapus).
- Tata letak (T-078e) â Beranda & Jelajah Materi memakai lebar penuh (`w-full`); daftar mapel Beranda 3 kolom di xl; layar baca (Results, Settings, Content, License, Player, placeholder) dipusatkan `mx-auto w-full max-w-4xl`.
- `src/screens/HomeScreen.tsx` â kartu âLanjutkan belajarâ menampilkan thumbnail (56 px lebar di md+).
- `src-tauri/src/preferences.rs` â test `app_mode_survives_database_reopen` membuktikan persistensi setelah DB ditutup dan dibuka ulang.
- E2E: `mode-switch.mjs` mencocokkan tombol lewat `aria-label`, mengukur rail 80 px dan konten sisa; `a11y.mjs` `clickLabel` menerima `aria-label`; `home-catalog.mjs` menunggu tile kelas + dua thumbnail termuat + screenshot `catalog-thumbnails.png`.

**Verifikasi aktual:** `npm test` 93/93 + fixture 4/4 + catalog 320/320 Â· `cargo test` **65/65** Â· `npm run build` PASS Â· `npm run a11y` **PASS 17** (0 error, 7 warning) Â· E2E `mode-switch` **6/6** (rail + restore setelah muat ulang) Â· `home-catalog` **13/13** (tile kelas, panel collapsible, thumbnail) Â· smoke 8/8 Â· activities 8/8 Â· journey 11/11 Â· profile 7/7. Screenshot `mode-belajar.png` memperlihatkan rail ikon dan Beranda selebar layar; `catalog-thumbnails.png` memperlihatkan header âKelas 3â tertutup dan 3 kartu per baris.

**Catatan persistensi:** nilai tersimpan di SQLite `app_meta` (key `preferences`), bukan localStorage; dibaca `App.tsx` saat start. DB perangkat diperiksa langsung dan berisi `appMode":"belajar"` setelah sakelar dipakai.

**Sisa:** thumbnail memakai aset pertama paket (bukan gambar khusus sampul); mode masih pembatas UI tanpa PIN. Pada lebar 768â1023 px grid 3 kolom terasa sempit (judul membungkus).

### Handoff Foto Profil + Ilustrasi Beranda (2026-10-27, T-079)

**Status:** selesai dan terverifikasi. Permintaan PO: Beranda diberi ilustrasi yang relevan dan foto profil.

**Perubahan kode:**
- `src-tauri/src/migrations/0006_profile_avatars.sql` (baru) â tabel `profile_avatars(profile_id PK, mime_type CHECK png/jpeg/webp, bytes BLOB, updated_at, FK cascade)`; terdaftar di `db.rs` sebagai versi 6 (checksum SHA256, normalisasi CRLF).
- `src-tauri/src/profile.rs` â `MAX_AVATAR_BYTES = 1_500_000`; `sniff_image_mime` (magic bytes); `set_profile_avatar` (validasi profil/ukuran/mime, UPSERT), `clear_profile_avatar`, `get_profile_avatar` â data URL; `ProfileView.hasAvatar` lewat `EXISTS(...)`; perintah `profile_avatar_set` (path berkas; cek ukuran metadata dulu), `profile_avatar_clear`, `profile_avatar_get`; 2 test baru.
- `src-tauri/src/error.rs` â `PROFILE_AVATAR_INVALID`, `PROFILE_AVATAR_TOO_LARGE`, `PROFILE_AVATAR_UNREADABLE`. `src-tauri/src/lib.rs` â 3 perintah terdaftar.
- `src/data/profileRepository.ts` â `Profile.hasAvatar`, `readProfileAvatar` (cache modul), `setProfileAvatar`, `clearProfileAvatar`, invalidasi cache saat hapus profil.
- `src/components/profile/ProfileAvatar.tsx` (baru) â foto `object-cover` atau fallback inisial; `alt=""` dekoratif.
- `src/components/home/LearningIllustration.tsx` (baru) â bingkai kartu berisi thumbnail cover (16:10) + aksen lingkaran/sunburst/star; `aria-hidden`.
- `src/screens/HomeScreen.tsx` â hero `rounded-card` gradasi tealâsurface: avatar 64/80 px, eyebrow âRuang belajarâ, âHalo, {nama}â, paragraf, ilustrasi di sisi kanan (max 320 px di md+). Ilustrasi memilih cover matematika kelas 3, fallback cover pertama.
- `src/screens/SettingsScreen.tsx` â setiap baris profil memakai `ProfileAvatar`; profil aktif punya âPilih/Ganti fotoâ¦â (dialog native `open()` filter png/jpg/jpeg/webp), âHapus fotoâ, petunjuk âPNG/JPEG/WebP, maks 1,5 MBâ; backup & privasi menyebut foto profil.
- `scripts/e2e/scenarios/home-catalog.mjs` â menyetel avatar lewat `profile_avatar_set` (aset cover Flow kelas 3 yang sudah ada), memuat ulang, menunggu avatar + ilustrasi termuat, screenshot `hero-beranda.png`; skenario kini **14 pemeriksaan**.

**Verifikasi aktual:** `cargo test` **67/67** Â· `npm test` PASS (fixture 4/4, catalog 320/320) Â· `npm run build` PASS Â· `npm run a11y` **17 PASS** (0 error, 7 warning) Â· E2E home-catalog **14/14** Â· mode-switch 6/6 Â· profile-lifecycle 7/7 Â· smoke 8/8. Screenshot `hero-beranda.png` memperlihatkan avatar bulat, eyebrow, sapaan, dan ilustrasi matematika berbingkai.

**Catatan:** avatar disimpan sebagai BLOB di SQLite sehingga ikut dalam backup DB; tidak ada aset gambar baru yang dihasilkan (memakai cover Flow yang sudah ada, sesuai aturan Flow-only). Dialog pemilih berkas tidak diotomasi E2E (native); jalur set/clear diuji lewat perintah Rust + invoke.

**Sisa:** foto profil belum dipotong persegi secara eksplisit (hanya `object-cover` pada lingkaran); belum ada validasi dimensi minimum; ilustrasi Beranda statis (bukan rotasi).

### Handoff Cover Mapel Beranda + Editor Potong/Kompres Foto (2026-10-27, T-080)

**Status:** selesai dan terverifikasi. Permintaan PO: kartu mata pelajaran di Beranda diberi cover/thumbnail; karena batas ukuran foto profil, sediakan alat potong + kompres foto.

**Perubahan kode:**
- `src/screens/HomeScreen.tsx` â kartu âMateri tersediaâ memakai `LessonThumbnail` 96Ã64 px (h-16 w-24) per mata pelajaran; cover diambil dari entri pertama yang punya `coverAsset` untuk subjek itu, fallback entri pertama â selalu ada gambar karena katalog `coverAsset` 320/320.
- `src/components/profile/avatarCrop.ts` (baru) â helper murni: `coverScale`, `clampOffset`, `centeredOffset`, `cropDrawRect`; konstanta viewport 288 px, output 512 px, target 1 MB.
- `src/components/profile/avatarCrop.test.ts` (baru) â 5 test (skala cover lanskap/portret/kosong, clamp, center, pemetaan cropâoutput).
- `src/components/profile/AvatarEditor.tsx` (baru) â modal `role="dialog"` + `aria-modal`, pratinjau bulat `touch-none`; geser (pointer capture) untuk pan, slider zoom 1â4Ã yang recenter ke tengah gambar, pratinjau kanvas 512 px yang di-debounce 150 ms; encoder mencoba WebP 0,9â0,5 lalu JPEG 0,85/0,7 dan memilih hasil pertama â¤1 MB; perkiraan ukuran diumumkan lewat `aria-live`; Esc â Batal, fokus awal ke judul; viewport menyesuaikan lebar jendela (min 160 px).
- `src-tauri/src/profile.rs` â `MAX_AVATAR_SOURCE_BYTES = 20 MB`; `profile_avatar_preview` membaca berkas â data URL (cek metadata, is_file, magic bytes); `profile_avatar_set_data` + `decode_avatar_data_url` (header wajib `data:image/*;base64`, decode base64 â `set_profile_avatar` yang tetap memvalidasi ulang magic bytes + 1,5 MB); perintah path-based `profile_avatar_set` **dihapus** (dead code).
- `src-tauri/src/error.rs` â `PROFILE_AVATAR_SOURCE_TOO_LARGE` (âFoto sumber maksimal 20 MB sebelum dipotong.â).
- `src/data/profileRepository.ts` â `readAvatarSource(sourcePath)` â `profile_avatar_preview`; `saveProfileAvatar(profileId, dataUrl)` â `profile_avatar_set_data` (invalidasi cache avatar); `setProfileAvatar` dihapus.
- `src/screens/SettingsScreen.tsx` â âPilih/Ganti fotoâ¦â membuka dialog native lalu editor; simpan â reload daftar profil + pesan `Foto profil "{nama}" diperbarui.`; petunjuk baris menjadi âPNG/JPEG/WebP Â· dipotong persegi & dikompres otomatisâ.
- `scripts/e2e/scenarios/home-catalog.mjs` â avatar demo via `profile_avatar_preview` â `profile_avatar_set_data`; tunggu kartu subjek (â¥5, setiap `img[data-lesson-thumb]` termuat); jeda 500 ms sebelum `hero-beranda.png` agar compositor selesai melukis.

**Verifikasi aktual:** `cargo test` **69/69** (2 test baru: data URL round-trip + penolakan, pratinjau sumber) Â· `npm test` **98/98** (12 berkas; `avatarCrop` 5 test) + fixture 4/4 + catalog 320/320 Â· `npm run build` PASS Â· `npm run a11y` 17 pemeriksaan PASS (0 error, 7 warning) Â· E2E **home-catalog 16/16** (pratinjau+simpan avatar, cover 7 mapel, screenshot lengkap) Â· mode-switch 6/6 Â· profile-lifecycle 7/7 Â· smoke 8/8. Screenshot `hero-beranda.png` (`17-53-29`) menampilkan ketujuh cover mapel, avatar, dan ilustrasi.

**Catatan:** `cargo fmt` sempat mereformat 13 berkas Rust lain; churn format itu dibatalkan sebelum commit (working tree hanya berisi berkas fase ini). Editor tidak diotomasi E2E karena dialog pemilih berkas native; matematika crop diuji unit dan penyimpanan data URL diuji Rust + invoke.

**Sisa:** editor belum punya kontrol rotasi/mirror; tidak ada validasi dimensi minimum sumber; kompresi berhenti di target 1 MB (bukan kualitas tetap).

### Handoff Filter Mapel Bergambar (2026-10-27, T-081)

**Status:** selesai dan terverifikasi. Permintaan PO: filter mata pelajaran di Jelajah Materi memakai perilaku seperti filter kelas (bukan dropdown biasa).

**Perubahan kode:**
- `src/screens/CurriculumScreen.tsx` â dropdown `<select aria-label="Filter mata pelajaran">` diganti panel collapsible: tombol header `aria-expanded`/`aria-controls="filter-mapel-grid"` dengan chip âSemua mapelâ atau label mapel terpilih (label sr-only âMata pelajaranâ); grid `role="group"` berisi 8 tile (Semua mapel + 7 mapel) dengan cover `coverAsset` per mapel (peta `subjectCovers`); memilih tile menutup panel; tombol kelas & mapel kini berdampingan (`md:flex-row`, masing-masing `md:flex-1`).
- `scripts/e2e/scenarios/home-catalog.mjs` â helper `clickSubject()`; menunggu 7 thumbnail mapel termuat, menyimpan `filter-mapel.png`, memeriksa chip âMatematikaâ + panel tertutup; `selectFilter` dihapus. Skenario kini **18 pemeriksaan**.

**Verifikasi aktual:** `npm test` **98/98** (12 berkas) + fixture 4/4 + catalog 320/320 Â· `cargo test` **69/69** (tidak ada perubahan Rust) Â· `npm run build` PASS Â· `npm run a11y` **17 pemeriksaan PASS** (0 error, 7 warning; termasuk tile mapel baru) Â· E2E **home-catalog 18/18** Â· mode-switch 6/6 Â· smoke 8/8. Bukti visual: `filter-mapel.png` memperlihatkan 8 tile bergambar, chip âSemua mapelâ, dan panel yang menutup setelah âMatematikaâ dipilih (`catalog-thumbnails.png`).

**Catatan:** perilaku, bukan hanya tampilan â panel default terbuka seperti panel kelas, chip di header, tutup otomatis setelah memilih, dan bisa dibuka kembali. Grid mapel memakai `md:grid-cols-8` agar 8 tile muat satu baris di desktop.

**Sisa:** pilihan filter belum dipertahankan saat berpindah layar; tidak ada tombol âreset semua filterâ.

### Handoff Cover Kelas/Mapel Khusus (2026-10-27, T-082)

**Status:** selesai dan terverifikasi. Permintaan PO: sambungkan 13 cover khusus yang sudah dibuat via Flow tetapi belum dipakai aplikasi.

**Perubahan kode:**
- `src/content/coverArt.ts` (baru) â `import.meta.glob` untuk `content/covers/kelas/cover-kelas-*.webp` (6) dan `content/covers/pelajaran/cover-mapel-*.webp` (7); `gradeCoverUrl(grade)` / `subjectCoverUrl(subject)` mengembalikan URL bundel atau `null`. Varian `_pilot-cover-kelas-4-chibi.webp` tidak cocok pola sehingga tidak ikut.
- `src/content/coverArt.test.ts` (baru) â 3 test: keenam kelas, ketujuh mapel inti, dan `null` untuk kelas 7 / `bahasa-inggris`.
- `src/components/content/CoverArt.tsx` (baru) â `<img data-cover-art>` dekoratif (`alt=""`, lazy) `object-cover` dengan placeholder `teal/10` bila URL kosong.
- `src/screens/CurriculumScreen.tsx` â tile kelas memakai `gradeCoverUrl(value)`, tile mapel memakai `subjectCoverUrl(value)`; rasio tile 4:3 â **16:9** agar cocok dengan cover; fallback tetap `LessonThumbnail` (`coverAsset`) lalu placeholder.
- `src/screens/HomeScreen.tsx` â kartu âMateri tersediaâ memakai `CoverArt` 96Ã56 px (`h-14 w-24`, fallback `LessonThumbnail`); hero memakai `subjectCoverUrl(heroEntry.subjects[0])`.
- `src/components/home/LearningIllustration.tsx` â prop `coverUrl`; memakai `CoverArt` 16:9, fallback `LessonThumbnail` 16:9.
- `scripts/e2e/scenarios/home-catalog.mjs` â asersi `img[data-cover-art]` dan `src` memuat `cover-kelas-`/`cover-mapel-` (tile kelas, tile mapel, kartu Beranda, ilustrasi hero); screenshot baru `filter-kelas.png`; tetap **18 pemeriksaan**.

**Verifikasi aktual:** `npm test` **101/101** (13 berkas; `coverArt` 3 test) + fixture 4/4 + catalog 320/320 Â· `cargo test` **69/69** (tanpa perubahan Rust) Â· `npm run build` PASS â 13 cover WebP masuk `dist/assets` Â· `npm run a11y` **17 pemeriksaan PASS** (0 error, 7 warning) Â· E2E **home-catalog 18/18** Â· mode-switch 6/6 Â· smoke 8/8. Bukti visual: `filter-kelas.png` (6 cover kelas 16:9), `filter-mapel.png` (7 cover mapel), `hero-beranda.png` (hero + 7 kartu mapel).

**Catatan:** tambahan bundel Â±1,46 MB (kelas 118â196 KB; mapel 60â102 KB); kartu materi di grid tetap memakai thumbnail aset paket karena itu thumbnail isi materi. Cover kelas membedakan gaya: kelas 1â3 chibi, kelas 4â6 semi-realistis.

**Sisa:** cover belum dipakai di layar lain (mis. header Player); belum ada rotasi cover.

### Handoff Layout Konten Materi (2026-10-27, T-083)

**Status:** selesai dan terverifikasi. Permintaan PO: perbaiki layout konten materi karena banyak ruang kosong.

**Diagnosis terukur (sebelum):** kontainer Player dipatok `max-w-4xl` (896 px) di tengah area utama 1152 px; gambar eksplorasi `max-w-xl` â hanya 601Ã431 px; kartu âTujuan pembelajaranâ 896 px dengan teks terisi Â±40 %; kolom kanan kosong total pada IFP 1920 px.

**Perubahan kode:**
- `src/screens/LessonPlayer.tsx` â kontainer luar `max-w-4xl` â `max-w-[1400px]`; `LessonView` disusun ulang sebagai grid `lg:grid-cols-[minmax(0,1fr)_20rem]` / `xl:â¦22rem` (`gap-x-6 gap-y-5`): tab + panel aktivitas di kolom kiri, pesan penyimpanan + kartu âTujuan pembelajaranâ di kolom kanan (`data-player-aside`, `lg:sticky lg:top-6`); judul `max-w-4xl`, ringkasan `max-w-3xl`. Kolom kanan memakai `<div>` bukan `<aside>` agar tidak rancu dengan sidembar admin (deteksi mode E2E).
- `src/components/content/ExplorationActivity.tsx` â gambar langkah: `w-full max-w-xl` â `mx-auto max-h-[60vh] w-auto max-w-full` (IFP 1080 px â Â±864Ã648 px).
- `scripts/e2e/scenarios/activities.mjs` â pemeriksaan layout baru (kolom samping ada & di kanan panel, panel â¥ 55 % lebar grid pada â¥ 1024 px, `position: sticky`, ada ruang menempel, tanpa gulir horizontal) + uji menempel saat menggulir bila halaman dapat digulir. **10 pemeriksaan.**
- `scripts/e2e/scenarios/a11y.mjs` â penanda mode diganti `nav[aria-label="Navigasi utama"]`; tambah pemeriksaan overflow horizontal Player pada 1600Ã900.
- `scripts/e2e/scenarios/mode-switch.mjs` â menunggu rail belajar muncul setelah muat ulang (menghapus balapan sidebar admin).

**Verifikasi aktual:** `npm test` **101/101** + fixture 4/4 + catalog 320/320 Â· `npm run build` PASS Â· `npm run a11y` **17/17** (0 error, 7 warning) Â· E2E **activities 10/10** (`panel 889px, samping 352px; 312px dalam grid 700px, position sticky` pada 1600 px) Â· **learning-journey 11/11** Â· **home-catalog 18/18** Â· **mode-switch 6/6** Â· **smoke 8/8**. Ukuran sesudah pada viewport 1247 px: grid 1088 px, panel 744 px, kolom samping 320 px (x=880), tanpa gulir horizontal. Bukti visual: `activities.png`, `a11y-mode-belajar.png`. `cargo test` tidak dijalankan (tanpa perubahan Rust).

**Catatan:** flake tulis-perdana dan kedipan sidebar saat boot dicatat sebagai utang teknis di BACKLOG; keduanya tidak disebabkan perubahan layout.

**Sisa:** kolom samping masih kosong di bawah kartunya bila panel aktivitas jauh lebih tinggi; ruang vertikal bawah Player belum dimanfaatkan (mis. ringkasan progres); cover khusus belum dipakai di header Player.

### Handoff Seleksi Materi Player (2026-10-27, T-084)

**Status:** selesai dan terverifikasi. Laporan PO: semua materi selalu membuka âMengenal Huruf dan Suku Kataâ.

**Akar masalah (terbukti):** `consumePlaybackSelection()` membaca lalu menghapus seleksi. Effect React berjalan dua kali di StrictMode; pembacaan kedua bernilai `null` â Player jatuh ke paket pertama. Instrumentasi mencatat `["kelas6-pai-b06-zakat", null]` pada satu klik.

**Perubahan kode:**
- `src/state/playbackSelection.ts` â `getPlaybackSelection()` idempoten menggantikan `consumePlaybackSelection()`.
- `src/screens/LessonPlayer.tsx` â effect memakai pembacaan idempoten.
- `src/state/playbackSelection.test.ts` â 2 test regresi.
- `scripts/e2e/scenarios/home-catalog.mjs` â buka materi dari paket lain dan cocokkan `h1` dengan judul kartu; helper `openMaterial()` mencocokkan `li` kartu (bukan teks seluruh `<ul>`). **19 pemeriksaan.**

**Verifikasi aktual:** `npm test` **103/103** (14 berkas) + fixture 4/4 + catalog 320/320 Â· `npm run build` PASS Â· E2E **home-catalog 19/19**, **activities 10/10**, **learning-journey 11/11**, **content-rollback 9/9**, **smoke 8/8**, **a11y 17/17** (0 error, 7 warning) Â· uji manual: klik âZakat dan Infakâ â `h1` âZakat dan Infakâ. `cargo test` tidak dijalankan (tanpa perubahan Rust).

**Sisa:** seleksi hanya di memori â muat ulang langsung di `#player` kembali ke paket pertama; belum ada deep link materi di hash.

### Handoff Sisa Layout Player (2026-10-27, T-085)

**Status:** selesai dan terverifikasi. PO memilih tiga sisa item T-083: isi ruang kosong kolom samping, manfaatkan ruang vertikal bawah, pakai cover khusus di header Player.

**Perubahan kode:**
- `src/screens/LessonPlayer.tsx` â header `data-player-hero` (badge + judul + ringkasan di kiri; cover 16:9 `data-player-cover` di kanan, sumber: gambar pertama `manifest.assets` â `lesson.assetRefs` â `subjectCoverUrl` â `gradeCoverUrl`); kartu `data-player-progress` âAktivitas & kemajuanâ (`role="progressbar"`, bar teal, status per aktivitas `Skor N`/`Dibuka`/`Belum`, label âsesi iniâ); band `data-session-summary` lebar penuh dengan Aktivitas dinilai, Skor terakhir, Rata-rata aktivitas, dan tombol Buka Hasil Belajar; prop opsional `onNavigate`.
- `src/App.tsx` â `<LessonPlayer onNavigate={navigate} />`.
- `scripts/e2e/scenarios/activities.mjs` â 4 pemeriksaan baru (header+cover termuat, kartu kemajuan, ringkasan ikut diperbarui, tombol Hasil Belajar), artefak `activities-hero.png`; probe sticky kini memakai `document.scrollingElement` dan ambang 24 px. **14 pemeriksaan.**

**Verifikasi aktual:** `npm test` **103/103** (14 berkas) + fixture 4/4 + catalog 320/320 Â· `npm run build` PASS Â· E2E **activities 14/14** (layout 1600 px: panel 889 px, samping 352/566 px dalam grid 700 px) Â· **home-catalog 19/19** Â· **a11y 17/17** (0 error, 7 warning) Â· **learning-journey 11/11** Â· **content-rollback 9/9** Â· **smoke 8/8**. `cargo test` tidak dijalankan (tanpa perubahan Rust). Commit `f80ff8f`.

**Sisa:** cover header = gambar pertama manifest, jadi paket >1 lesson akan berbagi cover (belum ada paket seperti itu); kartu kemajuan hanya sesi berjalan (riwayat per aktivitas belum dimuat dari DB); jendela sticky belum teruji pada 1600Ã900 (jarak gulir dokumen 227 px) dan belum dilihat di IFP 1920 px asli.

### Handoff Kartu Mapel Beranda & Katalog Terfilter (2026-10-27, T-086)

**Status:** selesai dan terverifikasi. PO melaporkan thumbnail mapel Beranda terlalu kecil dan klik âMatematikaâ menampilkan semua pelajaran.

**Akar masalah (terbukti):** tombol âLihatâ pada kartu mapel hanya memanggil `onNavigate("curriculum")` tanpa membawa mapel â katalog selalu terbuka tanpa filter.

**Perubahan kode:**
- `src/state/catalogFilter.ts` (baru) â `setCatalogFilter()` / `getCatalogFilter()` idempoten / `clearCatalogFilter()`; pembacaan idempoten agar aman terhadap effect ganda StrictMode (pelajaran T-084).
- `src/state/catalogFilter.test.ts` (baru) â 2 test regresi.
- `src/screens/HomeScreen.tsx` â kartu mapel jadi tile 16:9 selebar kolom (grid 2/3/4 kolom), seluruh kartu `<button>`, label + jumlah materi + chevron; klik menyetel filter mapel lalu navigasi ke katalog.
- `src/screens/CurriculumScreen.tsx` â effect sekali-per-kunjungan (penjaga `useRef`) menerapkan lalu menghapus permintaan filter; `<li>` hasil membawa `data-catalog-subjects`.
- `scripts/e2e/scenarios/home-catalog.mjs` â klik Kartu âMatematikaâ â katalog terfilter (49 kartu, semua `matematika`, chip âMatematikaâ); kembali ke Beranda lalu buka katalog lagi tanpa filter. **21 pemeriksaan.**

**Verifikasi aktual:** `npm test` **105/105** (15 berkas) + fixture 4/4 + catalog 320/320 Â· `npm run build` PASS Â· E2E **home-catalog 21/21**, **a11y 17/17** (0 error, 0 warning), **activities 14/14**, **learning-journey 11/11**, **content-rollback 9/9**, **smoke 8/8** Â· artefak `hero-beranda.png`. `cargo test` tidak dijalankan (tanpa perubahan Rust).

**Sisa:** permintaan filter hanya di memori proses (muat ulang di `#curriculum` kembali tanpa filter); layar lain (Aktivitas Interaktif, Hasil Belajar) belum ikut memakai mapel terpilih.

### Handoff Alur Beranda â Mapel â Kelas (2026-10-27, T-087)

**Status:** selesai dan terverifikasi. PO menguji alur dan melaporkan halaman setelah memilih mapel tidak menuntun ke pemilihan kelas.

**Akar masalah (terbukti):**
1. `navigate()` tidak mengembalikan posisi gulir; yang menggulir adalah dokumen, jadi katalog terbuka di tengah daftar (judul + pemilih kelas di atas tak terlihat).
2. Grid mapel tetap terbuka setelah mapel dipilih dari Beranda sehingga grid kelas terdorong jauh ke bawah.

**Perubahan kode:**
- `src/App.tsx` â effect pada `activeScreen` mengembalikan `document.scrollingElement.scrollTop` ke 0.
- `src/screens/CurriculumScreen.tsx` â kunjungan ber-filter mapel melipat grid mapel (`subjectsOpen = false`) sehingga grid kelas langsung terlihat; kartu hasil menambah `data-catalog-grades`.
- `scripts/e2e/scenarios/home-catalog.mjs` â 2 pemeriksaan alur baru (tiba di `scrollTop 0` + grid mapel terlipat + grid kelas terbuka; klik âKelas 3â â 49 jadi **9 kartu**, semua `matematika` grade 3), artefak `katalog-dari-mapel.png` + `katalog-matematika-kelas3.png`. **23 pemeriksaan.**

**Verifikasi aktual:** `npm test` **105/105** (15 berkas) + fixture 4/4 + catalog 320/320 Â· `npm run build` PASS Â· E2E **home-catalog 23/23**, **a11y 17/17** (0 error, 7 warning; percobaan pertama kena flake timeout simpan kuis, lolos pada ulangan), **activities 14/14**, **learning-journey 11/11**, **content-rollback 9/9**, **profile-lifecycle 7/7**, **mode-switch 6/6**, **smoke 8/8**. `cargo test` tidak dijalankan (tanpa perubahan Rust).

**Sisa:** pemilihan kelas tetap di halaman katalog yang sama (bukan wizard dua langkah); permintaan filter hanya di memori proses.

### Handoff Pencarian "ipas" Kosong (2026-10-27, T-088)

**Status:** selesai dan terverifikasi. PO melaporkan pencarian pelajaran IPAS "tidak ada".

**Temuan (terbukti):** pencarian bebas menemukan IPAS (32 entri; IPAS = 8 materi Ã kelas 3â6). Hasil kosong terjadi karena **filter aktif**: chip mapel masih Matematika dan/atau kelas 1â2 (IPAS mulai kelas 3). Empty state lama tidak menyebut filter sehingga terbaca sebagai materi hilang.

**Perubahan kode:**
- `src/screens/CurriculumScreen.tsx` â empty state `data-catalog-empty` menyebut kata kunci + filter aktif; tombol **Cari di semua mapel**, **Cari di semua kelas**, **Hapus semua filter**; helper `emptyStateMessage()`.
- `scripts/e2e/scenarios/home-catalog.mjs` â 2 regresi baru (penjelasan filter aktif saat mencari âipasâ di Matematika + Kelas 3; âCari di semua mapelâ â **8 materi IPAS kelas 3**), artefak `katalog-ipas-filter-aktif.png`. **26 pemeriksaan.**

**Verifikasi aktual:** `npm test` **105/105** (15 berkas) + fixture 4/4 + catalog 320/320 Â· `npm run build` PASS Â· E2E **home-catalog 26/26**, **a11y 17/17** (0 error, 7 warning), **activities 14/14**, **smoke 8/8**. `cargo test` tidak dijalankan (tanpa perubahan Rust).

**Sisa:** pencarian tetap di dalam filter aktif (bukan global) â kini dijelaskan; IPAS memang belum ada untuk kelas 1â2. *(Sejak T-089 IPAS kelas 1â2 sudah tersedia â lihat handoff di bawah.)*

### Handoff Paket IPAS Kelas 1â2 (2026-10-27, T-089)

**Status:** selesai dan terverifikasi. Permintaan PO: "tambah materi IPAS kelas 1-2 juga". Keputusan PO untuk ilustrasi: **paket dulu, gambar menyusul** â 16 paket dibuat lengkap sekarang dengan salinan cover mapel IPAS sebagai aset sementara; ilustrasi Flow menyusul saat kuota/akun tersedia.

**Konteks kurikulum (mengikat):** pada matriks OD-1, Fase A (kelas 1â2) berisi **6 mapel inti** dan **IPAS baru mulai Fase B (kelas 3)**. Ke-16 paket ini karena itu **di luar matriks yang disetujui**; `curriculumRefs` diisi `fase-a/2024` secara **provisional** mengikuti preseden ADR-0033, `reviewStatus` dan `releaseState` tetap `draft`. Perluasan IPAS ke Fase A **belum diputuskan Curriculum Lead** â jangan diklaim sesuai kurikulum.

**Paket baru (16):**
- Kelas 1: `kelas1-ipas-b01-tubuh-dan-indera`, `b02-makhluk-hidup-di-sekitarku`, `b03-merawat-tubuh`, `b04-makanan-sehat`, `b05-cuaca-di-sekitarku`, `b06-lingkungan-rumah-sekolah`, `b07-hewan-tumbuhan-peliharaan`, `b08-keselamatan-diri`.
- Kelas 2: `kelas2-ipas-b01-pertumbuhan-manusia-hewan`, `b02-bagian-tumbuhan`, `b03-siklus-hidup-sederhana`, `b04-wujud-benda`, `b05-perubahan-cuaca-musim`, `b06-sumber-daya-alam`, `b07-hemat-air-listrik`, `b08-lingkungan-bersih-sehat`.

**Struktur tiap paket:** `manifest.json` (v0.2.0, `gradeLevels` satu kelas, `subjects ["ipas"]`, 1 aset) + `lessons/lesson-001.json` (4 tujuan, 3 activityIds, 1 assessmentRef) + 3 aktivitas: eksplorasi **5 langkah**, matching **6 pasangan**, kuis pilihan ganda **2 soal** â **8 item dinilai**. `lessonId` = slug paket sehingga tidak menambah tabrakan `lessonId@version` (tetap 38 benturan lama di paket warisan).

**Perubahan kode/alat:**
- `scripts/add-ipas-kelas1-2.mjs` (baru) â generator satu-kali dari array `topics` (judul, ringkasan, tujuan, langkah, pasangan, soal); menyalin `content/covers/pelajaran/cover-mapel-ipas.webp` ke `assets/<slug>.webp` dan menghitung SHA-256; melewati folder yang sudah ada kecuali `--force`.
- `public/content-catalog.json` â dibangun ulang: **336 entri / 336 paket** (setiap kelas 56, setiap mapel 48; ipas 48).
- `scripts/e2e/scenarios/home-catalog.mjs` â regresi baru: setelah pencarian "ipas", buka panel kelas (kondisional â panel terbuka default), klik **Kelas 1** â 8 kartu IPAS kelas 1, artefak `katalog-ipas-kelas1.png`; lalu "Semua kelas" mengembalikan 48 hasil, sebelum alur Kelas 3 yang sudah ada. **28 pemeriksaan.**

**Verifikasi aktual:** validator 16/16 **VALID** (0 issue, 1 warning draft per paket) Â· `npm test` **105/105** + fixture 4/4 + catalog **336/336** Â· `npm run build` PASS Â· E2E **home-catalog 28/28**, **activities 14/14**, **smoke 8/8**, `npm run a11y` **17/17** (0 error, 7 warning) Â· `cargo test` tidak dijalankan (tanpa perubahan Rust). Bukti visual: `katalog-ipas-kelas1.png` (chip "Kelas 1", "8 materi ditemukan", kartu "KELAS 1 Â· IPAS").

**Batasan (jujur):** ke-16 thumbnail masih memakai **satu gambar yang sama** (cover mapel IPAS) â belum ada ilustrasi per topik Â· belum ada review pedagogis manusia, jadi `reviewStatus` tetap `draft` Â· E2E memverifikasi tampilan **kelas 1**; kelas 2 diverifikasi lewat validator, katalog, dan data paket, bukan klik UI Â· kuis hanya 2 soal (ambang â¥8 item dipenuhi via matching).

**Sisa:** buat 16 ilustrasi Flow (satu per topik, 4:3 1200Ã896), migrasikan manifest ke aset unik, lalu jalankan ulang validator + katalog; minta keputusan Curriculum Lead soal IPAS di Fase A.

### Handoff Cover Unik per Topik IPAS Kelas 1â2 (2026-10-27, T-090)

**Status:** selesai dan terverifikasi. Permintaan PO: "ganti gambar cover per topik berbeda" â melunasi janji "gambar menyusul" dari T-089.

**Koreksi cast (diakui):** 5 ilustrasi pertama sempat dibuat dengan anak generik (perempuan tanpa hijab). Setelah PO bertanya, seluruh 16 topik **diregenerasi** memakai prefiks karakter baku yang sama dengan 152 ilustrasi Kelas 1â3: *"Gunakan karakter Ayu dan Bima yang dilampirkan sebagai desain karakter yang sama persis (Ayu: hijab putih, seragam lengan panjang; Bima: kemeja putih, dasi merah, celana merah)."* Setiap scene menyebut Ayu/Bima secara eksplisit.

**Produksi:** Google Flow project `218ad195-1801-4997-bffc-c754043067d6` (akun Dewi Gardenia, label diverifikasi), 2 kandidat per topik (Nano Banana 2.1), unduh `=s1600-rw` â WebP 1200Ã896 lewat queue server `127.0.0.1:4789`. Tidak ada otomasi picker karakter (diblokir classifier Auto-mode), tidak ada bypass, tidak ada kredensial diketik.

**Pilihan final:** Kelas 1 â 1A 2A 3B 4B 5A 6A 7A 8A Â· Kelas 2 â 9A 10A 11A 12B 13A 14A 15A 16A. Kriteria: komposisi bersih, wajah kedua anak terlihat, kesesuaian adegan, tanpa teks terbaca. `hemat-air-listrik` opsi B ditolak (keran mengalir â bertentangan dengan topik); `wujud-benda` opsi B dipilih karena latar krem polos dan tokoh besar.

**Wiring:** `content/packages/kelas{1,2}-ipas-b0*/assets/<slug>.webp` diganti bytes pilihan; `manifest.json` `sizeBytes` + `sha256` dihitung ulang (**16/16 cocok**, 0 selisih); `lesson-001.json` + `activity-001.json` memakai `altText` spesifik topik. 32 `altText` aktivitas matching/kuis yang masih menyalin deskripsi aset lama ("tanaman muda berakarâ¦") diperbaiki menjadi deskripsi aktivitas. 33 berkas kandidat `-a`/`-b` dihapus setelah pemilihan.

**Verifikasi aktual:** validator **336/336 VALID** (0 issue, 1 warning draft/paket) Â· `npm test` **105/105** (15 berkas) + fixture 4/4 + catalog **336/336** Â· `npm run build` PASS Â· E2E **home-catalog 28/28**, **activities 14/14**, **smoke 8/8** Â· `npm run a11y` **17/17** (0 error, 7 warning reflow/target sentuh) Â· `cargo test` tidak dijalankan (tanpa perubahan Rust). Bukti visual: `katalog-ipas-kelas1.png` â kartu "Cuaca di Sekitarku", "Hewan dan Tumbuhan Peliharaan", "Keselamatan Diri" memakai ilustrasi berbeda berisi Ayu & Bima.

**Batas (jujur):** belum ada review visual manusia (guru/PO) selain pemeriksaan agent Â· `reviewStatus`/`releaseState` tetap `draft` Â· ilustrasi tidak memuat teks terbaca (disengaja) sehingga topik hanya dikenali dari adegan Â· kuis tetap 2 soal (ambang â¥8 item dipenuhi via matching) Â· E2E memverifikasi tampilan kelas 1; kelas 2 diverifikasi lewat validator, katalog, dan hash aset.

**Sisa:** keputusan Curriculum Lead soal IPAS di Fase A (OD-1) Â· review manusia R1âR6/R8âR9/R12 Â· verifikasi CP/ATP per bab Â· D-UX-2/4/5/6 Â· blocker rilis B-01â¦B-08.

### Handoff Perbaikan Temuan Deterministik R5 (2026-10-27, T-091)

**Status:** selesai dan terverifikasi untuk dua sinyal R5 yang bersifat mekanis. Permintaan PO: "kerjakan rekomendasi nomor 1" dari ringkasan pasca-T-090, yaitu membereskan temuan deterministik pra-review (bias posisi kunci + duplikasi matching). Keputusan PO atas pilihan ruang lingkup: **opsi A â ganti yang rusak + tulis ulang** (bukan penulisan ulang penuh Â±1.100 pasangan lintas sesi, dan bukan hanya menghapus 230 yang rusak).

**Definisi yang dipakai (diambil dari `scripts/pedagogical-prereview.mjs`, bukan asumsi):**
- *Cermin* = pasangan matching yang `left` identik byte dengan `step.prompt` **dan** `right` identik dengan `step.reveal` pada aktivitas eksplorasi paket yang sama.
- *Bias posisi* = paket dengan â¥3 soal pilihan ganda di mana seluruh kunci berada pada indeks opsi yang sama.
- *Kunci terpanjang* = paket di mana opsi benar selalu opsi terpanjang (`longestCorrectRatio = 1`) â **sinyal tekstual, tidak diperbaiki pada sesi ini.**

**T-091a â siarkan posisi kunci (`scripts/spread-answer-positions.mjs`, commit `12ce2e1`, 199 berkas aktivitas):**
- Sebelum: 694 soal â indeks 0 = 528 (76,1%), 1 = 147 (21,2%), 2 = 19 (2,7%), 3 = 0; **91 paket** kuncinya menumpuk di satu posisi.
- Sesudah: indeks 0 = 206 (29,7%), 1 = 189 (27,2%), 2 = 203 (29,3%), 3 = 96 (13,8%); **0 paket** semua kunci di posisi sama; share per-paket tertinggi 66,7%.
- Metode: **susun ulang urutan opsi, bukan isinya** â kunci dipindah ke `(hash(packageId) + ordinal soal dalam paket) % jumlah opsi`; `optionId` bergerak bersama teksnya sehingga `correctResponse` dan penilaian tidak berubah. Deterministik dan idempoten. Soal dengan <3 opsi dibiarkan (memindahkannya tidak memberi pilihan yang berarti); pada soal multi-jawaban hanya opsi benar pertama yang digeser, mengikuti cara detektor mengukur posisi kunci. Aktivitas benar/salah **tidak dijamah** karena tampilan Benar/Salah di-hardcode di `src/components/content/QuizActivity.tsx`, jadi menggeser array tidak mengubah posisi yang dilihat siswa.

**T-091b â hapus duplikasi matching (`scripts/rewrite-matching-pairs.mjs` + `scripts/data/matching-rewrite-2026-10-27.json`, commit `0e24dbc`, 184 berkas aktivitas):**
- Sebelum: 1.828 pasangan di 336 aktivitas mencocokkan; **908 di antaranya cermin langkah eksplorasi** di 184 paket; 230 dari 908 itu juga boilerplate refleksi ("Apa hal penting yang kamu pelajariâ¦", "Bagaimana urutan yang benar untukâ¦").
- Sesudah: 1.602 pasangan; **0 cermin**, 0 boilerplate, 0 pasangan duplikat dalam satu aktivitas.
- Rincian 908 cermin: **230 dihapus** (boilerplate), **678 ditulis ulang** menjadi bentuk petunjukâjawaban â 128 pasangan memakai override yang ditulis tangan (119 entri `pairOverrides`, dikunci pada `left`+`right` asli), 550 memakai aturan pola kalimat tanya (`Apa yangâ¦` â `Yangâ¦`, `Berapaâ¦` â `Banyakâ¦`, `Kapanâ¦` â `Waktuâ¦`, isian `â¦` â batang kalimat, ds.), dan **4 pasangan authored ditambahkan** ke 2 paket yang akan turun di bawah ambang 8 item setelah penghapusan.
- Ikutan: `pairId` dinomori ulang `pasangan-N` (skema hanya menuntut keunikan; penilaian tidak bergantung urutan), instruksi 184 aktivitas berubah menjadi "Pasangkan setiap petunjuk dengan jawaban yang tepat.", `altText` diregenerasi hanya bila polanya masih menyalin judul aktivitas. 152 paket lain (matching di `activity-002.json`) tidak tersentuh karena tidak punya pasangan cermin.
- Alat: **snapshot SHA-256** 336 berkas sebelum transform di `.tmp-assets/snapshots-before-matching/` (git-ignored); skrip **dry-run default**, `--apply` untuk menulis, dan **idempoten** â dijalankan ulang menghasilkan 0 perubahan. Digunakan dua kali untuk rollback + terapkan ulang setelah aturan diperbaiki (sisa "Banyak banyakâ¦": digabung lewat `withPrefix()`; petunjuk berakhiran titik: strip final `.`).

**Ambang & validasi setelah kedua fase (angka di bawah diukur pada pohon kerja = HEAD `0e24dbc`):**
- Validator: **336/336 VALID**, 0 issue, 336 warning (draft).
- Kedalaman (aturan kanonik `scripts/review-content.ts` â langkah eksplorasi, jumlah aktivitas, item dinilai): minimum aktual **5 langkah / 3 aktivitas / 8 item**, **0 paket di bawah ambang**.
- `npm test` **105/105** + fixture 4/4 + konsistensi katalog 336/336 Â· `npm run build` PASS Â· `npm run a11y` **17/17** (0 error, 7 warning) Â· E2E **activities 14/14**, **home-catalog 28/28**, **smoke 8/8** Â· `cargo test` tidak dijalankan (tanpa perubahan Rust).

**Batas (jujur, tidak disembunyikan):**
1. **10 paket** masih memicu sinyal R5 lain: opsi benar selalu yang terpanjang. Ini butuh penulisan ulang teks opsi (bukan transform mekanis) â sengaja ditinggalkan, tercatat di BACKLOG.
2. Penulisan ulang 550 pasangan memakai **aturan bahasa**, bukan penilaian guru; frasanya sah secara pedoman tapi belum tentu paling tepat secara pedagogis. Bentuknya menghilangkan beban ganda (soal tidak lagi menyalin jawaban eksplorasi), itu klaim yang didukung bukti; kualitas petunjuk adalah klaim yang **tidak** didukung bukti.
3. Sinyal R5 lain dari pra-review 2026-10-26 (1.188/2.851 item tak terpetakan oleh kata kunci tujuan) **tidak disentuh** â itu soal cakupan tujuan, bukan duplikasi.
4. `reviewStatus`/`releaseState` tetap `draft`. Tidak ada approval manusia; perbaikan ini mengurangi beban kerja reviewer, bukan menggantikannya.
5. `scripts/pedagogical-prereview.mjs` dan `scripts/review-content.ts` **menulis ke path bertanggal tetap** (`â¦_2026-10-26.*`), sehingga keduanya **tidak dijalankan ulang** â menjalankan akan menimpa laporan historis. Verifikasi memakai analisis di `.tmp-assets/` yang mengimplementasikan semantik detektor yang sama; angka "0 cermin / 0 bias" berasal dari sana, bukan dari laporan pra-review baru.
6. E2E tidak menguji 336 paket satu per satu; ia memuat aktivitas matching bawaan. Cross-check korpus dilakukan lewat skrip, bukan UI.

**Sisa:** 10 paket kunci-terpanjang Â· reviewer manusia R1âR6/R8âR9/R12 Â· keputusan Curriculum Lead IPAS Fase A (OD-1) Â· CP/ATP per bab Â· D-UX-2/4/5/6 Â· blocker rilis B-01â¦B-08.

### Handoff Volume Latihan per Kelas (2026-10-27, T-092)

**Status:** selesai dan terverifikasi untuk seluruh kelas 1â6. Permintaan PO: "kerjakan sesuai kelas saja â saya ingin setiap latihan berisi 5â10 soal". Ruang lingkup dikunci lewat pilihan PO: **kuis + mencocokkan + mengurutkan**, dengan target **5 soal kelas 1â2** dan **6â8 soal kelas 3â6** (dioperasionalkan: kelas 1â2 = tepat 5 kuis + 5 pasangan; kelas 3â6 = tepat 6 kuis + 6 pasangan; mengurutkan â¥5; plafon 10).

**Alur per kelas (1 â 6):** digest materi â `needs-kelas<N>-{a,b,c}.json` (kekurangan per paket) â 3 agen penulis paralel (satu berkas data per agen, dilarang menyentuh `content/packages/`) â `precheck.mjs` â `add-practice-items.mjs --apply` â `spread-answer-positions.mjs --apply` â `check-practice-volume.mjs` â validator 336 paket â analisis R5 â cek kedalaman â `npm test` + `npm run build` â commit per kelas.

**Hasil terukur (19 berkas `scripts/data/practice-items-kelas*-2026-10-27.json`):**
- Kelas 1: +95 soal / +38 pasangan (56 paket; commit `3ea86e6`) â kuis min 5 maks 5, pasangan min 5 maks 6.
- Kelas 2: +93 / +33 (commit `06fa649`) â kuis 5/5, pasangan 5â8.
- Kelas 3: +126 / +78 (commit `4d52f15`) â kuis 6/6, pasangan 6/6.
- Kelas 4: +123 / +71 (commit `034bb27`) â kuis 6/6, pasangan 6/6.
- Kelas 5: +132 / +71 (commit `0c7e020`) â kuis 6/6, pasangan 6/6.
- Kelas 6: +126 / +70 (commit `abc1be6`) â kuis 6/6, pasangan 6â7.
- **Total +695 soal kuis + 361 pasangan.** `check-practice-volume.mjs`: "Semua aktivitas dinilai berada dalam rentang target".

**Verifikasi aktual (pohon kerja = HEAD `abc1be6`):** validator **336/336 VALID** (0 issue, 336 warning draft) Â· kedalaman minimum **5 langkah / 3 aktivitas / 10 item**, 0 paket di bawah ambang Â· R5: cermin **0**, bias posisi kunci **0 paket** (sebaran 413/393/410/163), kunci-selalu-terpanjang **0 paket** (sebelumnya 10) Â· `npm test` **105/105** (15 berkas) + fixture 4/4 + catalog **336/336** Â· `npm run build` PASS Â· `cargo test` tidak dijalankan (tanpa perubahan Rust).

**Batas (jujur):**
1. **88 paket (26%) tidak memiliki aktivitas kuis sama sekali** â kombinasinya eksplorasi + mencocokkan + mengurutkan (umumnya keterampilan menulis/bercerita/seni/PJOK/PAI praktik). Target "5â10 item" terpenuhi untuk **setiap aktivitas dinilai yang ada**, tetapi bukan untuk setiap paket. Menambah kuis ke 88 paket itu keputusan desain konten â tercatat sebagai pertanyaan terbuka di BACKLOG.
2. Item ditulis agen dari digest paket, **belum dinilai guru**; `reviewStatus` tetap `draft`. Daftar paket bermateri tipis ada di BACKLOG.
3. E2E tidak menguji isi 695 soal baru; verifikasi isi lewat skrip korpus (R5, kedalaman, validator), bukan penilaian pedagogis.

**Sisa:** review guru atas item baru (lihat BACKLOG) Â· keputusan 88 paket tanpa kuis Â· reviewer manusia R1âR6/R8âR9/R12 Â· OD-1 IPAS Fase A Â· blocker rilis B-01â¦B-08.

### Handoff Player Padat + Mode Layar Penuh (2026-10-27, T-093)

**Status:** selesai dan terverifikasi. Permintaan PO (sebagai UX/UI): "perbaiki halaman Player Pembelajaran karena masih banyak ruang kosong; saya ingin ada fullscreen mode yang bila diaktifkan hanya menampilkan halaman interaktif, tanpa header tujuan pembelajaran dan progres belajar".

**Desain yang dipilih:**
- **Mode layar penuh = state di `App`**, bukan Fullscreen API native (WebView2/pratinjau browser tidak konsisten). Tombol "Layar penuh"/"Keluar layar penuh" ada di baris status Player, `aria-pressed` mengikuti state; Escape juga keluar; berpindah layar atau berganti mode otomatis mematikan mode ini.
- **Tanpa remount:** chrome shell dibungkus `<div className="contents" style={{display:"none"}}>` dan blok lesson memakai atribut `hidden`, sehingga panel aktivitas tidak dilepas dari DOM â **jawaban kuis yang belum diperiksa bertahan** saat mode dibuka-tutup (dibuktikan E2E).
- Di layar penuh hanya tersisa: strip judul (h1 + kelas/mapel), baris tab aktivitas, satu baris status (disembunyikan kecuali `preview`/`error`), dan panel aktivitas selebar layar.
- **Kepadatan normal:** hero lebih rapat (padding 4/5, cover 16â20rem), strip penyimpanan pindah dari kolom samping ke baris status, ringkasan sesi lebih ringkas, dan tata letak dua kolom baru aktif di `xl` (1280) sehingga 1024 memakai satu kolom penuh.
- **Isi aktivitas:** tiap aktivitas dibatasi kolom baca `max-w-5xl` dan opsi kuis memakai dua kolom di layar lebar, agar baris opsi tidak melar selebar panel.

**Bukti terukur (skenario `e2e/player-fullscreen`, 1280Ã800 & 1024Ã768):** panel aktivitas **601 â 1225 px** (1280) dan **689 â 969 px** (1024); sidebar, top bar, "Tujuan pembelajaran", kartu kemajuan, dan ringkasan sesi tidak terlihat; tepat **1** `<h1>` terlihat; tanpa overflow horizontal; Escape keluar; jawaban kuis tetap tersimpan. Screenshot: `player-normal-1280.png`, `player-fullscreen-1280.png`, `player-normal-1024.png`, `player-fullscreen-1024.png` di `.tmp-e2e/<stamp>/`.

**Verifikasi aktual:** `npm run a11y` **17/17** (0 error, 7 warning reflow/target sentuh; Player 0 error/0 warning) Â· E2E **player-fullscreen 6/6**, **activities 14/14**, **learning-journey 11/11**, **smoke 8/8**, **mode-switch 6/6** Â· `npm test` **105/105** + fixture 4/4 + catalog 336/336 Â· `npm run build` PASS Â· commit `e56149f`.

**Batas (jujur):** layar penuh adalah mode di dalam jendela aplikasi, **bukan** fullscreen OS. Ruang kosong yang tersisa di layar penuh berasal dari gambar eksplorasi yang mempertahankan rasio aspek (di-center), bukan dari layout. Mode layar penuh diuji pada mode admin (sidebar) â mekanisme penyembunyian chrome sama untuk mode belajar (rail ikon), tetapi klik UI pada mode belajar belum diuji dengan layar penuh.

**Sisa:** keputusan D-UX-2/4/5/6 Â· utang shell `main` vs dokumen sebagai scroller (BACKLOG) Â· review visual guru/PO.

### Handoff Kuis untuk 88 Paket + Perbaikan Item (2026-10-27, T-094 + T-095)

**Status:** selesai dan terverifikasi. Permintaan PO: "lakukan perbaikan" atas dua hal yang sebelumnya sengaja tidak diputuskan sendiri â OD-9 (88 paket tanpa aktivitas kuis) dan item latihan yang masih `draft` karena materinya tipis.

**T-094 â kuis untuk 88 paket (commit `d9c4ac9`).**
- Sebaran: kelas 1 15 Â· kelas 2 14 Â· kelas 3 16 Â· kelas 4 12 Â· kelas 5 15 Â· kelas 6 16 paket.
- Tiap paket mendapat berkas `activities/activity-00N.json` bertipe multiple-choice, `activityId` = `kuis-penguatan`, 5 soal (kelas 1â2) atau 6 soal (kelas 3â6), 3 opsi per soal; lesson diperbarui (`activityIds` + `assessmentRefs`), sehingga tombol "Lanjut berlatih" pada eksplorasi kini menuju kuis.
- **499 soal baru** ditulis 6 agen penulis dari materi paket masing-masing (referensi/tujuan/eksplorasi/mencocokkan/mengurutkan), bukan dari digest ringkas.
- Alat baru `scripts/add-quiz-activity.mjs` (dry-run default, `--apply`, idempoten: paket yang sudah punya `kuis-penguatan` dilewati; menolak soal <3 atau >4 opsi, opsi duplikat, prompt berulang). Diuji kering + diterapkan pada 1 paket percobaan, divalidasi, lalu dikembalikan sebelum pemakaian massal.
- Posisi kunci disebar ulang dengan `scripts/spread-answer-positions.mjs` (deterministik): 578/559/578/163 (indeks 0/1/2/3).

**T-095 â perbaikan item bermateri tipis (commit `983bd09`).**
- 49 paket bermateri tertipis (daftar dari T-092) diaudit baca-penuh oleh 3 agen reviewer: 283 soal + 283 pasangan diperiksa terhadap materi paketnya.
- Hasil: **21 item cacat di 17 paket** â 8 soal kuis (5 pengecoh mustahil, 3 ambigu, 2 fakta di luar materi yang tumpang tindih) dan 13 pasangan (jawaban duplikat/sinonim 10, salah pasang 3).
- Semua pengganti memakai fakta yang ada di materi; jumlah item, `optionId`, dan posisi kunci tidak berubah. Satu usulan reviewer yang memperkenalkan pengecoh ambigu ("bel berbunyi" untuk "dengarkan sampai â¦") diganti sebelum diterapkan.
- Alat baru `scripts/apply-item-patches.mjs` (dry-run default, menolak id tak dikenal/opsi duplikat/`correctResponse` asing), data patch di `scripts/data/item-patches-kelas{12,34,56}-2026-10-27.json`.
- Reviewer menemukan **0** jawaban kuis bertentangan dengan materi dan **0** salah hitung pada 12 soal matematika yang diperiksa manual.

**Verifikasi aktual (HEAD `983bd09`):** validator **336/336 VALID** (0 issue) Â· volume gate "Semua aktivitas dinilai berada dalam rentang target" (tiap kelas 56 aktivitas kuis) Â· R5 cermin **0** / bias posisi **0** / kunci-terpanjang **0** Â· kedalaman minimum **10 item**, 0 paket di bawah ambang Â· katalog **88 entri `activityCount: 4`** Â· `npm test` **105/105** + fixture 4/4 + catalog 336/336 Â· `npm run build` PASS Â· `npm run a11y` **17/17** Â· E2E player-fullscreen 6/6, learning-journey 11/11, activities 14/14 (satu percobaan kena timeout simpan pertama â flake yang sudah tercatat di BACKLOG â lalu PASS pada percobaan berikutnya tanpa perubahan kode) Â· `cargo test` tidak dijalankan (tanpa perubahan Rust).

**Batas (jujur):**
1. 499 + 695 soal tetap **belum dinilai guru**; `reviewStatus` tetap `draft`. Audit ini menurunkan risiko faktual, bukan menggantikan penilaian pedagogis.
2. Sejumlah kuis memakai 4 opsi dengan pengecoh lemah (mis. PAI "Hari libur/Hari ujian"); 4 opsi sah menurut aturan, pemangkasan ke 3 opsi butuh penulisan manual â belum dikerjakan.
3. Daftar sisa paket yang perlu perhatian guru ada di BACKLOG bagian "Review guru tertunda".
4. E2E tidak menelusuri 499 soal baru satu per satu; verifikasi isi lewat audit baca-penuh 49 paket + skrip korpus.
5. Tab aktivitas kini bisa berjumlah 4 per paket; tata letak memakai `flex-wrap` sehingga baris tab bisa menjadi dua baris di layar sempit â belum ada tangkapan visual khusus untuk kasus 4 tab.

**Sisa:** review guru atas item baru Â· D-UX-2/4/5/6 Â· reviewer manusia R1âR6/R8âR9/R12 Â· OD-1 IPAS Fase A Â· blocker rilis B-01â¦B-08.

### Handoff Review 10 Paket Prioritas (2026-10-27, T-096)

**Status:** selesai (read-only). Permintaan PO: "review guru pada daftar prioritas di BACKLOG.md".
Ini review **agent**, bukan tanda tangan guru; `reviewStatus` seluruh paket tetap `draft`, tidak ada berkas konten yang diubah.

**Metode.** Sepuluh paket dari daftar "Masih perlu penilaian guru" dibaca penuh: berkas lesson + semua aktivitas + aset gambar.
141 item dinilai satu per satu (58 soal kuis, 58 pasangan mencocokkan, 25 langkah urutan). Setiap item dinilai terhadap materi paketnya
(eksplorasi + gambar), bukan terhadap pengetahuan umum saja.

**Putusan.** 1 perlu perbaikan (`kelas4-ipas-b01-makhluk-hidup`) Â· 1 perlu perbaikan kecil (`kelas6-pjok-b03-atletik`) Â·
7 layak dengan catatan Â· 1 layak tanpa catatan (`kelas6-pai-b07-sejarah-islam`). Tidak ada jawaban salah atau salah hitung.

**Temuan yang butuh tindakan:**
- F-01 `kelas4-ipas-b01-makhluk-hidup`: ilustrasi tidak memuat katak/capung, tetapi eksplorasi langkah 1, `altText` aset, 2 pasangan, dan 1 soal menyebut keduanya. Dua jalur perbaikan (teks menyesuaikan gambar / gambar dibuat ulang) ada di laporan.
- F-02 jawaban singkat dinilai persis satu string (`src/content/quiz.ts:33`) â 4 paket / 24 soal. Empat prompt terbuka hanya menerima satu kata kunci; jawaban benar lain dihukum. Perbaikan akar: mesin penilai menerima daftar jawaban + normalisasi angka/kata.
- F-03 "Benda tak hidup pada gambar" punya dua jawaban sah (batu dan air).
- F-04 `kelas6-pjok-b03-atletik`: langkah urutan ke-5 "Merapikan posisi" adalah pengisi untuk memenuhi ambang 5 langkah.

**Temuan struktural (bukan cacat jawaban):**
- F-05 37 pasangan di 27 paket memakai teks soal sebagai sisi kiri, elipsis ikut tertinggal â **DIPERBAIKI 2026-10-28 (T-099)**, total 39 pasangan.
- F-06 311/1.963 pasangan (15,8%) di 159 paket masih dapat dicocokkan dengan menyalin jawaban yang sudah tertulis di layar eksplorasi; detektor R5 lama melaporkan 0 karena mensyaratkan prompt identik â **DIPUTUSKAN 2026-10-28 (T-100): utang desain + aturan authoring + seleksi guru**; diukur ulang 309 pasangan / 160 paket.
- F-07 utang "10 paket kunci selalu opsi terpanjang" **ditutup**: 0 paket dengan terpanjang-unik; 6 paket hanya seri panjang pada opsi angka (matematika).

**Verifikasi aktual:** validator **336/336 VALID**, 0 issue, 336 warning (draft) â dijalankan ulang setelah review, konten tidak berubah Â·
tidak ada test/build lain yang dijalankan karena tidak ada perubahan kode maupun konten Â· `cargo test` tidak dijalankan.

**Sisa:** keputusan PO atas F-01/F-02 (F-03 + F-04 diterapkan pada T-097) Â· tanda tangan guru manusia Â· D-UX-2/4/5/6 Â· reviewer manusia R1âR6/R8âR9/R12 Â· OD-1 IPAS Fase A Â· blocker rilis B-01â¦B-08.

### Handoff Perbaikan F-03/F-04 (2026-10-27, T-097)

**Status:** diterapkan + diverifikasi. Permintaan PO: "lanjut kerjakan F-03 dan F-04" â hanya dua temuan itu; F-01 dan F-02 **tidak** disentuh.

**Perubahan konten (4 berkas):**
- `kelas4-ipas-b01-makhluk-hidup/activities/activity-003.json` â prompt soal-3 â "Benda tak hidup yang ada di tepi kolam pada gambar adalah ..." (kunci `batu` tetap). Wording dipilih karena usul awal "keras dan padat" masih cocok untuk pensil/buku/tiang bendera/bangunan pada gambar.
- `kelas6-pjok-b03-atletik/activities/activity-002.json` â item ke-5 `langkah-rapi`/"Merapikan posisi" â `langkah-keluar-bak`/"Keluar dari bak lompat"; `correctOrder` disesuaikan.
- `kelas6-pjok-b03-atletik/activities/activity-001.json` â reveal langkah "Apa urutan lompat jauh?" memuat langkah keluar bak.
- `kelas6-pjok-b03-atletik/activities/activity-003.json` â `pasangan-2` kanan memuat urutan yang sama.

Jumlah item, optionId, pasangan, dan posisi kunci tidak berubah. `scripts/apply-item-patches.mjs` tidak dipakai karena hanya mendukung `quiz`/`matching`; suntingan ordering/short-answer dilakukan langsung lalu diverifikasi `git diff`.

**Verifikasi aktual:** validator per direktori **336/336 VALID, 0 issue, 336 warning (draft)** Â· `check-practice-volume.mjs` "Semua aktivitas dinilai berada dalam rentang target" Â· `npm test` â `Tests 105 passed (105)`, `4/4 fixture cocok dengan expected`, `catalog-index OK: 336 entri, 336 paket`. `npm run build`, a11y, E2E, dan `cargo test` tidak dijalankan (tidak ada perubahan kode/UI).

**Sisa:** tanda tangan guru manusia (termasuk persetujuan atas solusi F-01 dan kecukupan daftar varian F-02) Â· D-UX-2/4/5/6 Â· reviewer manusia R1âR6/R8âR9/R12 Â· OD-1 IPAS Fase A Â· blocker rilis B-01â¦B-08.

### Handoff Perbaikan F-01/F-02 (2026-10-27, T-098)

**Status:** diterapkan + diverifikasi. Permintaan PO: "lanjut kerjakan F-01 dan F-02". Dua jalur dipilih tanpa menunggu keputusan tambahan: F-01 **teks menyesuaikan gambar** (tanpa kerja aset Flow), F-02 **perbaikan akar di mesin penilai** (bukan mengubah empat soal terbuka menjadi pilihan ganda).

**F-01 â `kelas4-ipas-b01-makhluk-hidup` (4 berkas):**
- `activity-001.json` langkah 1 reveal â "Ikan, siput, kupu-kupu, dan tumbuhan air."; 5 `altText` langkah + `accessibilityMetadata` â "Dua siswa mengamati kolam dengan ikan, siput di atas batu, kupu-kupu, dan teratai."
- `activity-002.json` `pasangan-1` Katak â **Siput / Merayap di atas batu**; `pasangan-3` Capung â **Kupu-kupu / Terbang menghisap madu bunga**; `accessibilityMetadata` diperbaiki.
- `activity-003.json` soal `soal-capung-bernapas-dengan` â **`soal-kupu-kupu-bernapas-dengan`** / "Kupu-kupu bernapas dengan ..." (kunci `trakea` tetap); `accessibilityMetadata` diperbaiki.
- `lessons/lesson-001.json` `altText` diperbaiki. Grep akhir: **0 sisa kata "katak"/"capung"** di paket ini.
- Jumlah langkah (5), pasangan (6), soal (6) tidak berubah.

**F-02 â mesin penilai + data:**
- `src/content/quiz.ts`: soal `text` menerima `correctResponse` string **atau** array; normalisasi NFKC + huruf kecil + buang tanda baca + rapatkan spasi (garis miring dipertahankan agar `1/4` tidak berubah). Jawaban kosong/whitespace tetap salah. Soal boolean/single-choice/multi tidak berubah.
- Data alternatif: 14 soal di 4 paket â IPAS 2 (ciri makhluk hidup, peran tumbuhan), Bahasa Indonesia 5, Pancasila 2 (sila 4/5 + kata), Matematika 5 (nilai tempat/nilai angka). 10 soal lain tetap satu kunci karena memang satu jawaban.
- `src/content/__tests__/quiz.test.ts`: +5 test (daftar jawaban, varian angka/kata, tanda baca/spasi, angka bertitik `12.354` vs `12354`, penolakan jawaban non-teks).

**Verifikasi aktual:** validator seluruh korpus **336/336 VALID, 0 issue, 336 warning (draft)** Â· `check-practice-volume.mjs` "Semua aktivitas dinilai berada dalam rentang target" Â· `npm test` â `Tests 110 passed (110)` (15 berkas), `4/4 fixture cocok dengan expected`, `catalog-index OK: 336 entri, 336 paket` Â· `npm run build` **PASS** (`tsc --noEmit` + vite).

**E2E:** `npm run e2e:activities` **PASS** â 14 pemeriksaan (dijalankan setelah aplikasi desktop ditutup, artefak `.tmp-e2e/2026-10-27T20-24-54-673Z`). Skenario memakai paket fixture sendiri dan memeriksa jalur jawaban singkat ("dinilai 100 (normalisasi huruf)"), jadi normalisasi baru terbukti lewat unit test, bukan lewat teks IPAS yang disunting.

**Tidak dijalankan:** a11y, E2E lain, dan `cargo test` (tidak ada perubahan Rust).

**Sisa:** guru perlu menyetujui solusi F-01 (teks menyesuaikan gambar) dan memastikan daftar varian F-02 memadai Â· tanda tangan guru manusia Â· D-UX-2/4/5/6 Â· reviewer manusia R1âR6/R8âR9/R12 Â· OD-1 IPAS Fase A Â· blocker rilis B-01â¦B-08.

### Handoff Perbaikan F-05 â 39 Pasangan Mencocokkan (2026-10-28, T-099)

**Status:** diterapkan + diverifikasi. Permintaan PO: "lanjut ke backlog berikutnya" â item terpilih **F-05** dari laporan review 10 paket prioritas.

**Masalah:** 37 pasangan `matching` di 27 paket memakai teks soal kuis sebagai sisi kiri dan membawa elipsis (`...`) yang tidak berfungsi sebagai petunjuk di kartu mencocokkan. Dua pasangan tambahan ditemukan saat audit aktivitas yang sama: kartu jawabannya duplikat dengan pasangan lain (`kelas1-seni-rupa-b05-mewarnai-bentuk`, `kelas6-matematika-b03-rasio-proporsi`) sehingga siswa tidak bisa membedakan pasangan mana yang dimaksud.

**Perubahan:** 39 pasangan di 27 paket, semuanya `activity-003.json`. Contoh:
- `kelas1-bahasa-indonesia-b02-membaca-kata`: "Bunyi awal kata bola adalah ..." â "Huruf pertama pada kata bola".
- `kelas3-pendidikan-pancasila-b06-nkri`: "Bahasa persatuan Indonesia adalah ..." â "Alat pemersatu bangsa".
- `kelas5-ipas-b07-energi-listrik`: "Mencabut alat listrik yang tidak dipakai termasuk ..." â "Bahan yang dapat menghantarkan listrik" (kuis: logam).
- `kelas5-pendidikan-pancasila-b04-musyawarah-demokrasi`: tiga pasangan memakai urutan langkah ("Langkah pertama dalam musyawarah" â "Menyampaikan masalah", dst.).
- Duplikat: `kelas1-seni-rupa-b05` pasangan-1 â "Langkah pertama sebelum mewarnai" / "Menyiapkan alat"; `kelas6-matematika-b03` pasangan terakhir â "Rasio 10 : 5 sama dengan" / "2 : 1".

Setiap pengganti diambil dari langkah eksplorasi, petunjuk, urutan langkah, atau opsi kuis paket itu sendiri. Jumlah pasangan tidak berubah (**1.963** di korpus); tidak ada `pairId` ditambah/dihapus; semua item tetap `reviewStatus: draft`.

**Alat & bukti:** `scripts/apply-item-patches.mjs` (dry-run lalu `--apply`). Patch: `scripts/data/item-patches-2026-10-28-f05.json` (27 paket / 39 pasangan) dan `scripts/data/item-patches-2026-10-28-f05b.json` (2 koreksi wording setelah audit grounding: `kelas1-pai-b06` "Sikap malaikat terhadap Allah" / "Selalu taat"; `kelas5-ppkn-b08` "Langkah sesudah menyusun rencana proyek" / "Membagi tugas", menggantikan "Bersama" yang tidak berbasis materi).

**Verifikasi aktual:** detektor elipsis ulang â **0/1.963** Â· pemeriksa duplikat kiri/kanan pada 27 paket terdampak â **0** Â· validator per direktori **336/336 VALID** (0 issue, 336 warning draft) Â· `check-practice-volume.mjs` "Semua aktivitas dinilai berada dalam rentang target" Â· `npm test` â `Tests 110 passed (110)` (15 berkas), `4/4 fixture cocok dengan expected`, `catalog-index OK: 336 entri, 336 paket` Â· `npm run build` **PASS**.

**Tidak dijalankan:** a11y, E2E, dan `cargo test` â perubahan hanya teks data matching, tanpa perubahan kode/UI/Rust. Skenario `activities` juga memakai paket fixture sendiri sehingga tidak akan merender 27 paket yang disunting.

**Sisa:** seleksi guru atas **309 pasangan F-06** (daftar CSV) Â· tanda tangan guru manusia atas 550 pasangan hasil aturan + 119 override + 39 perubahan F-05 Â· D-UX-2/4/5/6 Â· reviewer manusia R1âR6/R8âR9/R12 Â· OD-1 IPAS Fase A Â· blocker rilis B-01â¦B-08.

### Handoff Alat QA â Tanggal Terparameterkan + Detektor F-06 di Skrip Baku (2026-10-28, T-101)

**Status:** selesai dan terverifikasi. Permintaan PO: "lanjutkan" setelah keputusan F-06.

**Masalah:** `scripts/pedagogical-prereview.mjs` dan `scripts/review-content.ts` menulis ke nama bertanggal tetap `2026-10-26`, sehingga menjalankannya kembali akan menimpa bukti historis â alat tidak bisa dipakai untuk memverifikasi perbaikan setelah tanggal itu. Detektor F-06 (longgar) hanya hidup di skrip sekali-pakai, sementara detektor R5 baku tetap memakai kesamaan ketat dan melaporkan 0.

**Yang diubah (kode saja, tidak ada konten yang disentuh):**
- `scripts/lib/reviewOutput.mjs` â `parseReviewArgs` (`--date YYYY-MM-DD` tervalidasi, default tanggal lokal hari ini; `--out-dir`; `--force`; argumen tak dikenal ditolak), `localDateStamp`, `ensureWritable` (menolak menimpa berkas yang sudah ada kecuali `--force`, sekaligus membuat direktori keluaran).
- `scripts/lib/mirrorPairs.mjs` â `detectExplorationCopies`: `right` = `reveal` (NFKC, huruf kecil, tanda baca â spasi) dan `min(|Lâ©P|/|L|, |Lâ©P|/|P|) â¥ 0,70` terhadap `prompt` langkah yang sama; token = kata â¥3 karakter setelah tanda baca tepi dibuang, memakai langkah pertama yang reveal-nya cocok. Aturan token disamakan dengan pengukuran T-100 agar angkanya identik.
- `pedagogical-prereview.mjs` â semua nama berkas/judul/tautan memakai `--date`; paket draft dihitung dinamis (bukan "320"); metrik `explorationCopies` masuk JSON + CSV dan tampil sebagai **metrik informasi** di bagian R5 (bukan flag, karena flag R5 sengaja hanya sinyal deterministik).
- `review-content.ts` â tanggal pada judul/status/tautan + `--out-dir`/`--force` memakai lib yang sama; angka paket diambil dari `summary.total`.

**Bukti reproduksi:** `node scripts/pedagogical-prereview.mjs --out-dir .tmp-assets/prereview-check --date 2026-10-28` â 336 paket, `explorationCopies {pairs: 309, packages: 160}`; 309 baris JSON (`packageId + aktivitas + pairId + wordOverlap`) **identik** dengan `F06_MIRROR_PAIRS_2026-10-28.csv` (0 hilang, 0 tambahan). `npx tsx scripts/review-content.ts --out-dir .tmp-assets/review-check --date 2026-10-28` â 336 paket, VALID 336/336.

**Verifikasi:** penjagaan timpa diuji pada kedua skrip (tanpa `--force` exit 1 dengan daftar berkas; `--force` exit 0) Â· `npm test` 110/110 + fixture 4/4 + katalog 336/336 Â· `npm run build` PASS Â· `npx tsc --noEmit` exit 0. a11y/E2E/`cargo test` **tidak dijalankan** (tanpa perubahan UI/Rust); bukti historis `2026-10-26` tidak ditulis ulang.

**Sisa:** ~~`scripts/analyze-content-quality.mjs` masih memakai path bertanggal tetap `QUALITY_GAP_2026-10-25.*`~~ **DITUTUP 2026-10-28 (T-102)** Â· seleksi + tanda tangan guru atas 309 pasangan F-06 Â· D-UX-2/4/5/6 Â· reviewer manusia R1âR6/R8âR9/R12 Â· OD-1 IPAS Fase A Â· blocker rilis B-01â¦B-08. `reviewStatus` tetap `draft`.

### Handoff Alat QA â Analisis Gap Kualitas Bertanggal (2026-10-28, T-102)

**Status:** selesai dan terverifikasi. Permintaan PO: "lanjutkan" setelah T-101.

**Masalah:** `scripts/analyze-content-quality.mjs` (npm `content:quality-gap`) masih menulis ke `QUALITY_GAP_2026-10-25.*` dan memuat kalimat mati yang tidak lagi benar ("pembacaan 320 paket", "semua paket 3 langkah/2 aktivitas/4â6 item"). Menjalankannya hari ini akan menimpa bukti 2026-10-25 sekaligus mencetak klaim palsu.

**Yang diubah:**
- Path keluaran memakai lib bersama: `--date YYYY-MM-DD` (default hari ini), `--out-dir`, `--force`; `ensureWritable` menolak menimpa berkas bertanggal.
- Kalimat mati diganti nilai terhitung: judul + status memakai `date`/`total`; klaim kedalaman menjadi "Paket yang memenuhi G1âG3 â¦ `${depthCompliant}/${total}`"; JSON menambah `generatedAt`; skrip mencetak path laporan.
- **Koreksi detektor G11:** `optionDuplicates` dulu membandingkan opsi **tanpa** membedakan kapitalisasi per soal sehingga menandai `kelas1-bahasa-indonesia-b05-membaca-kalimat` sebagai duplikat â padahal soal itu justru menguji kapitalisasi ("budi bermain bola" vs "Budi bermain bola."). Kini duplikat = teks **persis**; opsi yang hanya berbeda kapitalisasi dilaporkan terpisah sebagai catatan, bukan kegagalan.

**Verifikasi:** `node scripts/analyze-content-quality.mjs --out-dir .tmp-assets/quality-check --date 2026-10-28` â 336 paket (`report` + `gap` tercetak) Â· menjalankan ulang tanpa `--force` â **exit 1** dengan daftar `QUALITY_GAP_2026-10-28.md` + `quality-gap-2026-10-28.json`; `--force` â exit 0 Â· `npm test` 110/110 (15 berkas) + fixture 4/4 + katalog 336/336. Bukti historis `QUALITY_GAP_2026-10-25.*` tidak tersentuh; a11y/E2E/`cargo test`/build tidak dijalankan (hanya skrip `.mjs` yang berubah, di luar `tsconfig` `src` dan suite).

**Temuan sampingan dari eksekusi (informasi, bukan approval):** G1/G2/G3/G5/G6/G7/G8/G9/G11/G12 = 336/336; G4 (tujuan tercakup penuh) 295/336 (41 sebagian, 0 nol); G10 (sudah direview manusia) 0/336 karena semua paket `draft`; duplikasi persis 0 grup; aktivitas identik 0 grup; 336 hash aset unik. Satu catatan kapitalisasi: `kelas1-bahasa-indonesia-b05-membaca-kalimat`. **Konsekuensi:** angka G11 pada laporan 2026-10-25 (319/320) adalah positif palsu; laporan itu tidak ditulis ulang karena merupakan bukti historis.

**Sisa:** seleksi + tanda tangan guru (309 F-06 Â· 550 hasil aturan Â· 119 override Â· 39 F-05 Â· F-01/F-02) Â· D-UX-2/4/5/6 Â· reviewer manusia R1âR6/R8âR9/R12 Â· OD-1 IPAS Fase A Â· blocker rilis B-01â¦B-08. `reviewStatus` tetap `draft`.

### Handoff Keputusan F-06 â Utang Desain + Aturan Authoring (2026-10-28, T-100)

**Status:** diputuskan + didokumentasikan. Permintaan PO: "lanjut" setelah F-05. Pilihan arah dari PO: **"Aturan + seleksi guru"** â **bukan** penulisan ulang massal 309 pasangan.

**Masalah:** 309 pasangan (dari 1.963) di 160 paket masih dapat dicocokkan dengan menyalin jawaban yang sudah tertulis di layar eksplorasi: `right` sama dengan `reveal` langkah dan sisi kiri â¥70% kata `prompt` langkah itu. Laporan awal mencatat 311/159; pengukuran ulang dengan definisi yang sama (normalisasi huruf/tanda baca, token â¥3 huruf, `min` tumpang tindih dua arah) menghasilkan **309/160** â selisih kecil, tidak ditelusuri penyebabnya satu per satu.

**Kenapa tidak ditulis ulang:** pasangan ini adalah keluaran transform T-091b (soal â frasa petunjuk). Parafrase mekanis berikutnya hanya menurunkan angka detektor tanpa menambah tuntutan pemahaman â risiko yang sudah dinyatakan saat T-091b. Petunjuk mana yang benar-benar membingungkan adalah penilaian guru.

**Yang ditetapkan:**
- **Aturan authoring (mengikat, batch konten berikutnya):** (1) sisi kiri berupa petunjuk, tumpang tindih kata terhadap `prompt` eksplorasi **<70%**; (2) sisi kiri tidak memuat kata kunci jawaban atau sinonim dekatnya; (3) sisi kanan boleh sama dengan `reveal`, yang dilarang adalah kombinasi itu dengan sisi kiri â¥70%; (4) tiap batch diverifikasi dengan definisi Â§5 laporan, target 0 hit baru.
- **Daftar seleksi guru:** `knowledge/content/F06_MIRROR_PAIRS_2026-10-28.csv` â 309 baris (`packageId, activity, pairId, left, right, explorationPrompt, wordOverlap`), diurutkan per paket. Guru cukup menandai pasangan yang perlu ditulis ulang, bukan menilai ulang 1.963 pasangan.
- **Angka pendukung:** 84 pasangan bertumpang tindih **100%** kata prompt (salinan paling telanjang); 40 paket memuat â¥3 pasangan.

**Bukti & alat:** pengukuran memakai skrip sekali-pakai `.tmp-assets/r5-focused.json` (semantik detektor laporan Â§5); CSV diturunkan dari berkas itu. Laporan [REVIEW_REPORT_2026-10-27_GURU_PRIORITAS_10.md](../content/REVIEW_REPORT_2026-10-27_GURU_PRIORITAS_10.md) Â§F-06 + Â§5 ditambah blok keputusan dan anotasi pengukuran ulang; BACKLOG mencatat keputusan + aturan + butir seleksi guru.

**Verifikasi:** CSV 309 baris data + header, 160 `packageId` unik. Tidak ada berkas konten/kode yang berubah, jadi validator, `npm test`, build, a11y, E2E, dan `cargo test` **tidak dijalankan ulang**; angka terakhir tetap dari T-099 (336/336 VALID, 110/110, build PASS).

**Sisa:** ~~detektor R5 baku masih memakai kesamaan ketat sehingga melaporkan 0 untuk kelas ini â mempromosikan detektor longgar ke skrip baku masih utang alat~~ **DITUTUP 2026-10-28 (T-101)**: detektor longgar ada di `scripts/lib/mirrorPairs.mjs` dan dipakai skrip baku Â· seleksi + tanda tangan guru Â· D-UX-2/4/5/6 Â· reviewer manusia R1âR6/R8âR9/R12 Â· OD-1 IPAS Fase A Â· blocker rilis B-01â¦B-08. `reviewStatus` tetap `draft`.

### Handoff Deep Link Player (2026-10-28, T-103)

**Status:** selesai dan terverifikasi. Permintaan PO: "lanjutkan" (butir 1 daftar agent-actionable).

**Masalah:** seleksi materi hanya hidup di memori proses (`playbackSelection`), sedangkan hash hanya berisi nama layar (`#player`). Memuat ulang di layar Player karena itu kembali ke paket pertama, dan tautan/riwayat tidak bisa menunjuk materi tertentu.

**Yang diubah:**
- [playbackSelection.ts](../../src/state/playbackSelection.ts) â `buildPlayerHash` (`#player/<encodeURIComponent(packageId)>[/<lessonId>]`) dan `parsePlayerHash` (menolak layar lain, segmen ekstra, id kosong, `decodeURIComponent` yang gagal); pembacaan tetap idempoten (pelajaran T-084).
- [App.tsx](../../src/App.tsx) â `initialScreen()` memulihkan `setPlaybackSelection` dari hash sebelum layar ditentukan; `navigate()` menulis deep link bila tujuan `player` dan seleksi diketahui, selain itu tetap `#<screen>`.
- [LessonPlayer.tsx](../../src/screens/LessonPlayer.tsx) â effect penyelaras seleksi + hash: `state.lessonId` kosong memakai lesson pertama paket, paket tak dikenal jatuh ke paket pertama lalu hash ditulis ulang, dan pergantian paket di dalam Player tidak meninggalkan URL lama.
- [playbackSelection.test.ts](../../src/state/playbackSelection.test.ts) â 4 test baru: format hash, round-trip (termasuk hash berawalan `#/`), paket tanpa lesson, dan hash tidak sah (`""`, `#home`, `#player`, `#player/`, `#player/a/b/c`, `#player/%E0%A4%A`).
- [player-deeplink.mjs](../../scripts/e2e/scenarios/player-deeplink.mjs) + npm `e2e:deeplink`.

**Verifikasi aktual:** `npm test` **114/114** (15 berkas) + fixture 4/4 + katalog 336/336 Â· `npm run build` exit 0 (`tsc --noEmit` + Vite) Â· E2E `player-deeplink` **7/7** Â· regresi E2E `home-catalog` 28/28 dan `learning-journey` 11/11 (dijalankan setelah perubahan, bukan diasumsikan) Â· `npm run a11y` **17/17** (0 error, 7 warning) pada dua percobaan berturut-turut â setelah 4 percobaan gagal dengan dua gejala berbeda (lihat baris verifikasi di atas dan utang teknis di BACKLOG) Â· `cargo test` tidak dijalankan (tanpa perubahan Rust).

**Diagnostik harness (bagian dari T-103):** [cdp.mjs](../../scripts/e2e/cdp.mjs) kini meneruskan event CDP (`page.on(...)`) dan [run.mjs](../../scripts/e2e/run.mjs) merekam `Runtime.consoleAPICalled`/`Runtime.exceptionThrown` ke `result.json` serta mencetaknya saat gagal; langkah simpan kuis di [a11y.mjs](../../scripts/e2e/scenarios/a11y.mjs) mencatat riwayat teks banner. Tanpa ini, "Timeout menunggu penyimpanan hasil kuis" tidak dapat dibedakan antara simpan lambat, simpan gagal, dan banner yang tertimpa.

**Batasan jujur:**
1. Hash tidak memuat `version`, jadi dua versi paket yang sama tidak dapat dibedakan lewat URL â `loadManagedPackage` mencari per `packageId` dan versi aktif menang.
2. Aplikasi tetap memakai `replaceState` (tanpa entri riwayat baru), jadi tombol Back browser tidak berubah perilakunya.
3. **a11y tidak lulus pada 4 percobaan pertama** (3Ã timeout simpan kuis, 1Ã halaman blank) dan lulus 2Ã sesudahnya. Bukti yang berhasil dikumpulkan: tidak ada exception/konsol error, skor 100 tampil, tetapi banner tetap "Penyimpanan lokal siapâ¦" dan "Menyimpan hasil belajarâ¦" tidak pernah muncul â jadi simpan **tidak pernah dimulai** pada percobaan yang gagal. Akar masalah **belum terbukti**; dugaan (belum diverifikasi) adalah effect sesi `[contentPackage, lesson.lessonId]` berjalan ulang dan menimpa status banner, atau panggilan `getOrStartSession` terganggu beban mesin saat 4â6 proses WebView2/Node aktif bersamaan. Tidak ada perubahan kode T-103 yang menyentuh jalur penyimpanan.

**Sisa:** boot flicker shell admin sebelum preferensi `appMode` terbaca Â· kontainer gulir shell `main#main-content` tidak pernah menggulir Â· diagnosis timeout tulis-pertama 30 dtk pada E2E Â· G4 41 paket (tujuan belum tercakup penuh) Â· daftar prasyarat manusia (seleksi + tanda tangan guru 309 F-06 / 550 hasil aturan / 119 override / 39 F-05, reviewer R1âR6/R8âR9/R12, CP/ATP per bab, OD-1 IPAS Fase A, D-UX-2/4/5/6) Â· blocker rilis B-01â¦B-08. `reviewStatus` tetap `draft`.

### Handoff Ikatan Putusan Review ke Isi + Sampling Audit (2026-10-28, T-104)

**Status:** selesai dan terverifikasi. Permintaan PO: "ya, kerjakan L2 + L4" â lapisan 2 (ikatan bukti) dan lapisan 4 (sampling) dari usulan validasi keputusan manusia.

**Masalah yang ditutup:** catatan review hanya terikat ke `package_id + version`. Setelah isi paket disunting (F-01â¦F-05 mengubah teks), putusan lama tetap tampak sah. Selain itu tidak ada cara memeriksa ulang sampel putusan secara berkala.

**Yang diubah:**
- [0007_content_review_binding.sql](../../src-tauri/src/migrations/0007_content_review_binding.sql) + [db.rs](../../src-tauri/src/db.rs) â kolom `content_sha256` dan `rubric_version` pada `content_reviews`; baris lama dibiarkan `NULL`.
- [review.rs](../../src-tauri/src/review.rs) â `RUBRIC_VERSION = "1"`; `ReviewView`/`RecordReviewInput` membawa digest; `review_record` **setelah** cek peran guru menolak digest yang bukan 64 heksadesimal dan menyimpan versi dalam huruf kecil; `review_list`/`find_review` mengembalikan kedua kolom; ekspor CSV menambah `content_sha256`,`rubric_version`.
- [packageDigest.ts](../../src/content/packageDigest.ts) â JSON kanonik (kunci diurut rekursif, `reviewStatus`/`releaseState`/`signature` dibuang, lesson diurut `lessonId`, aktivitas diurut `activityId`) + SHA-256 via `crypto.subtle`. **Dihitung atas objek hasil validasi**, bukan JSON mentah, karena schema Zod menyisipkan default (`assets: []`, `runtimeCapabilities: []`).
- [reviewDigest.ts](../../src/data/reviewDigest.ts) â menyelesaikan digest untuk paket bawaan (`loadContentPackages`) dan paket impor (`getPackage` + `validateContentPackage`); isi yang tidak lolos validasi tidak menghasilkan digest (dan karenanya tidak bisa di-approve).
- [ContentScreen.tsx](../../src/screens/ContentScreen.tsx) â form review menghitung digest sebelum memanggil `review_record`, dan pesan sukses menyebut 8 karakter pertama digest.
- [scripts/lib/reviewAttestation.ts](../../scripts/lib/reviewAttestation.ts) â pembaca CSV attestation (BOM/CRLF/kutip), pemindai 336 paket repo (digest + status review + volume item), pembaca folder `knowledge/content/review-attestations/`.
- [check-review-binding.ts](../../scripts/check-review-binding.ts) (npm `content:review-binding`, ikut `npm test`) â menolak approved tanpa digest sah, paket tak dikenal, isi tak tervalidasi, digest â  isi sekarang, dan paket non-`draft` tanpa putusan terikat.
- [sample-approved-reviews.ts](../../scripts/sample-approved-reviews.ts) (npm `content:review-sample`) â sampling deterministik `sha256("<benih>|<packageId>@<version>")`, `--n` (default 5), `--seed` (default tanggal Jakarta), `--out`; cetak reviewer/tanggal/catatan, status sidik jari, berkas lesson/aktivitas, volume item, dan checklist R1âR12; exit 1 bila ada digest menyimpang.

**Verifikasi aktual:** `npm test` **120/120** (16 berkas) + fixture 4/4 + katalog 336/336 + `content:review-binding` PASS Â· `cargo test` **71/71** Â· `npm run build` exit 0 Â· E2E `content-review` **9/9** (dijalankan pada build yang baru dikompilasi; percobaan pertama gagal karena kompilasi Rust 2m47s melewati batas tunggu harness, bukan kegagalan aplikasi) Â· screenshot `content-review.png` diperiksa. Uji manual alat dengan CSV sintetis di `%TEMP%`: binding exit 1 saat satu digest tidak cocok, exit 0 tanpa attestation; sampler memilih 3/3 paket dan menandai baris yang menyimpang.

**Cara pakai untuk reviewer manusia:**
1. Ekspor audit dari layar Konten & Pembaruan (`review_export_csv`) â simpan ke `knowledge/content/review-attestations/<tanggal>.csv`.
2. `npm run content:review-binding` â gagal berarti ada putusan yang tidak lagi cocok dengan isi.
3. `npm run content:review-sample -- --n 5` â sampel putusan untuk diperiksa ulang guru; checklist R1âR12 diisi manusia, bukan agent.

**Batasan jujur:**
1. **Belum tamper-proof.** Digest dihitung di klien; aplikasi yang dimodifikasi dapat mengirim digest palsu. Rust hanya memvalidasi bentuk, bukan kebenaran isi (tidak ada akses ke isi paket bawaan). Penutupnya adalah lapisan 3 (tanda tangan Ed25519 atas putusan) yang **belum** dikerjakan.
2. **Identitas reviewer tetap lokal dan diisi sendiri** â nama tampilan profil guru, bukan akun terverifikasi.
3. Attestation adalah CSV biasa di dalam repo; tidak ada segel kriptografis, hanya keterlacakan lewat git.
4. Baris review lama (sebelum migrasi 0007) tidak punya digest, sehingga tidak dapat dipakai sebagai bukti untuk isi sekarang â dihitung gagal oleh checker, sesuai maksud.

**Sisa:** lapisan 3 (tanda tangan putusan) Â· penunjukan reviewer manusia + pengisian R1âR12 Â· seleksi + tanda tangan guru 309 F-06 / 550 hasil aturan / 119 override / 39 F-05 Â· D-UX-2/4/5/6 Â· CP/ATP per bab Â· OD-1 IPAS Fase A Â· boot flicker Â· kontainer gulir shell Â· diagnosis timeout tulis-pertama E2E Â· blocker rilis B-01â¦B-08. `reviewStatus` tetap `draft`.

### Handoff Hierarki Tombol Aktivitas Eksplorasi (2026-10-28, T-105)

**Status:** selesai dan terverifikasi. Permintaan PO: "rapihkan tombol tombol itu di player, bekerjalah sebagai ux ui designer" (dengan tangkapan layar langkah eksplorasi).

**Masalah desain yang ditutup:** pada satu langkah eksplorasi ada empat tombol dengan dua di antaranya **bergaya primer (biru)** â `Tampilkan penjelasan` persis seperti `Lanjut` â sehingga dua aksi bersaing dan mata tidak tahu mana yang mengakhiri langkah; `Lihat petunjuk` dan `Sebelumnya` memakai gaya berbeda tanpa pola, dan tidak ada batas antara tombol bantuan dengan navigasi.

**Yang diubah:**
- [ExplorationActivity.tsx](../../src/components/content/ExplorationActivity.tsx) â petunjuk + penjelasan menjadi **satu baris tombol sekunder** (`mt-5 flex flex-wrap items-center gap-2`, `px-4`, status tertekan `border-primary/40 bg-primary/5 text-ink`, idle `border-ink/15 bg-surface hover:bg-paper`); panel bantuan tetap muncul di bawah tombolnya; navigasi pindah ke **footer bergaris** (`mt-6 â¦ border-t border-ink/10 pt-5`) dengan `Sebelumnya` sekunder di kiri (nonaktif di langkah pertama) dan **satu** tombol primer `Lanjut`/`Selesai` (`px-6`, `hover:bg-primary/90`) di kanan; panel selesai disamakan (`Ulangi eksplorasi` sekunder, `Lanjut berlatih` primer).
- [ExplorationActivity.tsx](../../src/components/content/ExplorationActivity.tsx) â aksesibilitas: `aria-controls` tiap tombol bantuan menunjuk id panel dinamis (`exploration-hint-<activityId>` / `exploration-reveal-<activityId>`), dan keempat tombol eksplorasi mendapat `focus-visible:ring-2 ring-primary/50` (tombol primer ditambah `ring-offset-2`) di samping outline global.
- [learning-journey.mjs](../../scripts/e2e/scenarios/learning-journey.mjs) â 9 asersi tata letak + 2 asersi `aria-controls`, dan artefak `exploration-buttons.png` (digulir ke baris kontrol sebelum ditangkap).

**Prinsip UX yang dipakai:** satu aksi primer per langkah (sisanya sekunder) Â· kelompokkan aksi sejenis (bantuan bersama bantuan, navigasi bersama navigasi) Â· pisahkan kelompok dengan garis, bukan dengan warna tambahan Â· status tertekan harus terbaca tanpa mengubah bobot visual tombol.

**Verifikasi aktual:** `npm test` **120/120** (16 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `npm run build` exit 0 Â· E2E `learning-journey` **14/14** (11 â 14) Â· regresi `activities` **14/14** dan `player-deeplink` **7/7** Â· `npm run a11y` **17/17** (0 error, 7 warning) pada percobaan pertama Â· `cargo test` tidak dijalankan (tanpa perubahan Rust) Â· screenshot `exploration-buttons.png` diperiksa mata: prompt â dua tombol sekunder sebaris â panel petunjuk + penjelasan â garis â `Sebelumnya` nonaktif + `Lanjut` biru.

**Batasan jujur:**
1. Belum ada komponen `Button` bersama; gaya masih kelas Tailwind inline, jadi hierarki ini belum dijamin konsisten di layar lain (utang teknis, lihat BACKLOG).
2. Gambar eksplorasi `max-h-[60vh]` membuat kontrol berada di bawah lipatan pada jendela 1600Ã900 ketika gambar tinggi â bukan bagian T-105, tetapi terlihat saat verifikasi.
3. Uji visual khusus 320 px untuk footer ini belum ada; yang terbukti hanya reflow 640/320 tanpa error.

**Sisa:** komponen tombol bersama Â· pratinjau 320 px footer eksplorasi Â· daftar prasyarat manusia (seleksi + tanda tangan guru 309 F-06 / 550 hasil aturan / 119 override / 39 F-05, reviewer R1âR6/R8âR9/R12, CP/ATP per bab, OD-1 IPAS Fase A, D-UX-2/4/5/6) Â· tanda tangan putusan (L3) Â· boot flicker Â· kontainer gulir shell Â· diagnosis timeout tulis-pertama E2E Â· blocker rilis B-01â¦B-08. `reviewStatus` tetap `draft`.

### Handoff Sematan Materi di Beranda (2026-10-28, T-106)

**Status:** selesai dan terverifikasi. Permintaan PO: "saya ingin ada fitur pinned materi, jika dipinned akan muncul di halaman home, dan ini jadi tampilan default di home, jadi ada pilihan pinned materi, materi tersedia dan jelajahi materi".

**Keputusan produk:** sematan disimpan **per profil siswa** di SQLite, bukan per perangkat, karena perangkat dipakai bergantian oleh beberapa siswa â preferensi perangkat akan membuat sematan satu siswa muncul di Beranda siswa lain.

**Yang diubah:**
- [0008_pinned_lessons.sql](../../src-tauri/src/migrations/0008_pinned_lessons.sql) + [db.rs](../../src-tauri/src/db.rs) â tabel `pinned_lessons` dengan PK `(profile_id, package_id, lesson_id)`, `FOREIGN KEY (profile_id) â¦ ON DELETE CASCADE`, indeks `(profile_id, pinned_at DESC)`; migrasi terdaftar sebagai versi 8 (checksum SHA-256 tetap ditegakkan).
- [pins.rs](../../src-tauri/src/pins.rs) â `MAX_PINNED = 24`; `list_pinned` urut `pinned_at DESC, rowid DESC`; `set_pinned` idempoten (sematkan yang sudah ada = sukses tanpa menggeser waktu), menolak id kosong/lebih dari 120 karakter, profil tak dikenal â `PROFILE_NOT_FOUND`, dan hanya menolak penambahan **baru** saat batas tercapai; 6 test termasuk hapus profil â sematan ikut terhapus.
- [lib.rs](../../src-tauri/src/lib.rs) â `mod pins;` + dua perintah terdaftar.
- [pinnedRepository.ts](../../src/data/pinnedRepository.ts) â pembungkus `pinned_list`/`pinned_set`, `pinnedKey` (`packageId:lessonId`), dan pemetaan pesan galat.
- [CurriculumScreen.tsx](../../src/screens/CurriculumScreen.tsx) â tombol **Sematkan/Disematkan** (`data-pin-toggle`, `aria-pressed`, `aria-label` menyebut judul materi) di tiap kartu, status diambil dari `pinned_list` profil aktif; kegagalan muat/sematkan tampil sebagai banner, keberhasilan diumumkan lewat `aria-live`.
- [HomeScreen.tsx](../../src/screens/HomeScreen.tsx) â urutan default baru: hero â **Materi disematkan** (maks 24, kartu `Buka` + `Lepas`, `Kelola sematan`, empty state â Jelajah Materi) â **Materi tersedia** (grid mapel) â **Jelajahi materi** â Lanjutkan belajar â Ringkasan â Aktivitas terbaru. Pemuatan sematan dipisah dari katalog.
- [pinned-materials.mjs](../../scripts/e2e/scenarios/pinned-materials.mjs) + npm `e2e:pinned`.

**Verifikasi aktual:** `npm test` **120/120** (16 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `cargo test` **77/77** Â· `npm run build` exit 0 Â· E2E `pinned-materials` **8/8** dua kali berturut-turut Â· regresi `home-catalog` **28/28**, `learning-journey` **14/14**, `activities` **14/14** (satu kegagalan flake âsimpan benar-salahâ sebelum eksekusi ulang) Â· `npm run a11y` **17/17** (0 error, 7 warning). Screenshot `beranda-disematkan.png` dan `katalog-sematkan.png` diperiksa mata: kartu sematan teal dengan thumbnail, tombol `Buka` primer + `Lepas` sekunder, dan tombol `Disematkan` tertekan (ikon terisi) di katalog.

**Batasan jujur:**
1. Sematan hanya muncul di Beranda dan hanya bisa dipasang dari Jelajah Materi (bukan dari Player, Hasil Belajar, atau Aktivitas).
2. Urutan sematan tetap `pinned_at DESC` â belum ada drag/atur urutan.
3. Batas 24 adalah konstanta Rust; belum ada UI yang menjelaskan sisa kuota selain pesan galat saat penuh.
4. Tombol sematkan baru muncul setelah profil aktif selesai dimuat, jadi sesaat setelah katalog terbuka kartu belum menampilkan tombol itu.
5. Sematan tidak disinkronkan ke server.

**Sisa:** komponen tombol bersama Â· penataan urutan sematan Â· semat dari layar lain Â· pratinjau 320 px Â· daftar prasyarat manusia (seleksi + tanda tangan guru 309 F-06 / 550 hasil aturan / 119 override / 39 F-05, reviewer R1âR6/R8âR9/R12, CP/ATP per bab, OD-1 IPAS Fase A, D-UX-2/4/5/6) Â· tanda tangan putusan (L3) Â· boot flicker Â· kontainer gulir shell Â· diagnosis timeout tulis-pertama E2E Â· blocker rilis B-01â¦B-08. `reviewStatus` tetap `draft`.

### Handoff Tab Beranda (2026-10-28, T-107)

**Status:** selesai dan terverifikasi. Permintaan PO: "materi sematan, materi tersedia, jelajahi materi, diakses menggunakan switch, tampilan default adalah sematan, kalau sematan gak ada maka yang tampil materi tersedia".

**Keputusan desain:**
1. Ketiga bagian jadi **tablist bergaya segmented control** (bukan seksi bertumpuk), sehingga hanya satu panel tampil dan Beranda jauh lebih pendek.
2. Panel memakai `hidden` (bukan render bersyarat) supaya `aria-controls` setiap tab selalu menunjuk elemen nyata â pemindai a11y menandai `aria-controls` yang menggantung sebagai peringatan.
3. Default mengikuti data: ada sematan â tab sematan; kosong â tab tersedia. Pilihan manual pengguna disimpan di `sectionChosenRef` agar tidak ditimpa efek default setiap kali data sematan berubah.
4. Melepas sematan terakhir memindahkan tampilan ke tab tersedia, karena tab sematan saat itu hanya berisi empty state.

**Yang diubah:**
- [HomeScreen.tsx](../../src/screens/HomeScreen.tsx) â `homeSectionIds`/`HomeSection` + `activeSection` state; efek default (`pinsLoaded` + `pins.length === 0` â `available`); `selectSection` (menandai pilihan manual) dan `onTabKeyDown` (panah kiri/kanan, Home, End, fokus ikut pindah); `role="tablist"` + tiga `role="tab"` dengan `aria-selected`/`aria-controls`/roving `tabIndex`/lencana jumlah sematan; tiga `role="tabpanel"` dengan `hidden`; judul seksi lama yang menduplikasi label tab diganti petunjuk singkat, judul kartu sematan `h3` â paragraf `data-pinned-title`; tombol empty state berganti nama menjadi `Buka Jelajah Materi`; seksi Lanjutkan belajar dipindah ke bawah blok tab.
- [pinned-materials.mjs](../../scripts/e2e/scenarios/pinned-materials.mjs) â asersi tab (label, `aria-selected`, roving `tabIndex`, `aria-controls` valid, panel terlihat), navigasi keyboard lewat `Input.dispatchKeyEvent`, default mengikuti sematan, dan pemulihan ke tab tersedia setelah `Lepas`.

**Verifikasi aktual:** `npm test` **120/120** (16 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `npm run build` exit 0 Â· E2E `pinned-materials` **11/11** Â· regresi `home-catalog` **28/28**, `learning-journey` **14/14**, `activities` **14/14** Â· `npm run a11y` **17/17** (0 error, 7 warning). Screenshot diperiksa mata: `beranda-tab-tersedia.png` (segmented control, tab "Materi tersedia" biru, "Materi disematkan" berlencana 0), `beranda-disematkan.png` (tab sematan aktif, kartu Zakat dan Infak dengan thumbnail + `Buka`/`Lepas`), `beranda-tanpa-sematan.png` (kembali ke tab tersedia setelah sematan dilepas + muat ulang).

**Batasan jujur:**
1. Pilihan tab tidak diingat â membuka Beranda lagi selalu kembali ke aturan default.
2. Panel tersedia/eksplorasi yang tersembunyi tetap ada di DOM (atribut `hidden`), jadi teksnya masih terbaca oleh `textContent` pada uji; bukan masalah aksesibilitas karena `display:none` mengeluarkan isinya dari pohon aksesibilitas.
3. Tidak ada transisi/animasi antar panel.
4. `Buka Jelajah Materi` muncul dua kali di DOM (empty state sematan dan panel eksplorasi); hanya satu yang tampil pada satu waktu.

**Sisa:** komponen `Button` bersama Â· ingat pilihan tab Â· pratinjau 320 px tab Â· daftar prasyarat manusia (seleksi + tanda tangan guru 309 F-06 / 550 hasil aturan / 119 override / 39 F-05, reviewer R1âR6/R8âR9/R12, CP/ATP per bab, OD-1 IPAS Fase A, D-UX-2/4/5/6) Â· tanda tangan putusan (L3) Â· boot flicker Â· kontainer gulir shell Â· diagnosis timeout tulis-pertama E2E Â· blocker rilis B-01â¦B-08. `reviewStatus` tetap `draft`.

### Handoff Ringkasan Tiga Kolom (2026-10-28, T-108)

**Status:** selesai dan terverifikasi. Permintaan PO: "letakkan di bawah greeting, jadikan 3 kolom, kolom satu lanjutkan belajar, kolom 2 ringkasan belajar, kolom 3 aktivitas terbaru".

**Keputusan desain:**
1. Ketiga blok menjadi satu `<section data-home-overview>` bergrid `lg:grid-cols-3` yang diletakkan **tepat setelah hero** dan **sebelum** segmented control materi â jadi yang pertama dilihat setelah sapaan adalah keadaan belajar siswa, bukan katalog.
2. Semua kolom **selalu dirender** dengan keadaan kosong pendek (bukan disembunyikan), supaya jumlah kolom dan posisi tab tidak berubah-ubah antar profil.
3. Kartu statistik memakai `content-start` (bukan `flex-1`) agar tidak melar setinggi kolom; tombol `Lanjutkan` dan `Lihat semua hasil` memakai `mt-auto` supaya rata bawah di kolomnya.
4. Blok lama di bawah tab dihapus seluruhnya â kalau dibiarkan akan ada dua judul "Lanjutkan belajar"/"Ringkasan belajar"/"Aktivitas terbaru" di satu layar.

**Yang diubah:**
- [HomeScreen.tsx](../../src/screens/HomeScreen.tsx) â `<section data-home-overview>` dengan `data-resume-column` (thumbnail 16:9 + judul + paket/kelas + `Lanjutkan`, atau `data-resume-empty`), `data-summary-column` (tiga angka), `data-recent-column` (maks 3 aktivitas + `Lihat semua hasil`, atau "Belum ada aktivitas yang dinilai."); tiga seksi lama (kartu lanjutkan, Ringkasan belajar, Aktivitas terbaru) dihapus.
- [home-catalog.mjs](../../scripts/e2e/scenarios/home-catalog.mjs) â asersi lama berbasis `h2` "Lanjutkan belajar" diganti asersi `data-home-overview` (3 kolom sejajar, urutan label, posisi di bawah hero & di atas tablist, keadaan kosong) dan `[data-resume-entry]` untuk keadaan terisi; ditambah artefak `beranda-tiga-kolom.png`.

**Verifikasi aktual:** `npm test` **120/120** (16 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `npm run build` exit 0 Â· E2E `home-catalog` **28/28** (dua eksekusi) Â· regresi `pinned-materials` **11/11**, `learning-journey` **14/14**, `activities` **14/14** Â· `npm run a11y` **17/17** (0 error, 7 warning; Beranda 20 interaktif / 4 heading / 69 kontras). `beranda-tiga-kolom.png` diperiksa mata: tiga kartu sejajar (teal untuk Lanjutkan, putih untuk Ringkasan dan Aktivitas), angka 2 / 1 / 100, satu baris "Mengenal Pecahan 1/2, 1/3, dan 1/4 â Skor 100", segmented control materi tetap di bawahnya.

**Batasan jujur:**
1. Tiga kolom menambah tinggi area atas; pada 1600Ã900 kartu mapel kini mulai di bawah lipatan sehingga pengguna harus menggulir lebih jauh untuk katalog.
2. Hanya diuji pada `lg` (â¥1024 px di harness 1600Ã900); di bawah itu kolom menumpuk vertikal dan belum ada pratinjau visual 320 px.
3. Kolom Ringkasan dan Aktivitas menyisakan ruang kosong karena tinggi baris mengikuti kolom Lanjutkan yang berisi thumbnail.
4. Isi kolom lanjutkan bergantung pada `entries` katalog yang sudah dimuat; judul aktivitas memakai fallback `lessonId` bila paketnya tidak ada di katalog aktif.

**Sisa:** komponen `Button` bersama Â· ingat pilihan tab Â· pratinjau 320 px Â· penataan urutan sematan Â· semat dari layar lain Â· daftar prasyarat manusia (seleksi + tanda tangan guru 309 F-06 / 550 hasil aturan / 119 override / 39 F-05, reviewer R1âR6/R8âR9/R12, CP/ATP per bab, OD-1 IPAS Fase A, D-UX-2/4/5/6) Â· tanda tangan putusan (L3) Â· boot flicker Â· kontainer gulir shell Â· diagnosis timeout tulis-pertama E2E Â· blocker rilis B-01â¦B-08. `reviewStatus` tetap `draft`.

### Handoff Kerapatan Tiga Kolom (2026-10-28, T-109)

**Status:** selesai dan terverifikasi. Permintaan PO: "tingginya 1/3 dari tinggi sekarang" (tiga kolom ringkasan Beranda).

**Keputusan desain:**
1. Tinggi dipangkas dengan membuang tumpukan vertikal, bukan mengecilkan target sentuh: tombol `Lanjutkan` dan `Lihat semua hasil` tetap `min-h-11` (44 px), persis ambang yang dipakai pemindai a11y.
2. Thumbnail 16:9 diganti persegi 56 px â memberi identitas visual tanpa memakan tinggi.
3. Kartu angka Sesi/Percobaan/Rata-rata yang tadinya tiga kotak bertumpuk label diganti `<dl>` satu baris (`items-end`), angka `text-2xl leading-none`.
4. `Lihat semua hasil` naik ke baris judul kolom Aktivitas, tiga aktivitas jadi baris `text-xs leading-4` tanpa kartu.

**Hasil ukur (E2E, jendela 1600Ã900):** 375 px â **102 px** saat kosong, **114 px** saat terisi (â1/3, 30%).

**Yang diubah:**
- [HomeScreen.tsx](../../src/screens/HomeScreen.tsx) â padding `p-4` pada ketiga kartu, judul kolom `text-xs`, thumbnail `h-14 w-14`, judul/meta `truncate` sebaris, tombol sebaris dengan teks, `<dl className="mt-2 flex items-end gap-6">`, daftar aktivitas `mt-1 space-y-1 text-xs` dengan `leading-4` dan `truncate`, tombol `Lihat semua hasil` dipindah ke baris judul (`text-xs`, `min-h-11`, `px-3`).
- [home-catalog.mjs](../../scripts/e2e/scenarios/home-catalog.mjs) â dua asersi baru: `[data-home-overview]` â¤150 px saat kosong dan saat terisi; log menyebut tinggi terukur. Total **29 pemeriksaan**.

**Verifikasi aktual:** `npx tsc --noEmit` bersih Â· `npm run build` exit 0 Â· E2E `home-catalog` **29/29** Â· regresi `pinned-materials` **11/11**, `learning-journey` **14/14**, `activities` **14/14** Â· `npm run a11y` **17/17** (0 error, 7 warning â tidak bertambah meski banyak tombol mengecil, karena tombol aksi tetap 44 px) Â· `npm test` **120/120** (16 berkas) + fixture 4/4 + katalog 336/336 + binding PASS. Screenshot `beranda-tiga-kolom.png` diperiksa: kartu mapel kembali tampak pada 1600Ã900 tanpa menggulir.

**Batasan jujur:**
1. Judul materi dan meta di kolom Lanjutkan terpotong elipsis ("Mengenal Pecahan 1/2, 1/3, dâ¦") karena tombol berbagi baris; nama lengkap tidak terlihat pada lebar Â±405 px.
2. Ilustrasi hanya tampak sebagian (persegi 56 px), bukan cover utuh.
3. Aktivitas terbaru tetap dibatasi 3 baris dengan teks 12 px â lebih kecil dari teks isi lain di aplikasi.
4. Hanya diuji `lg` (â¥1024 px); di bawah itu kolom menumpuk dan tinggi total bertambah lagi.

**Sisa:** komponen `Button` bersama Â· ingat pilihan tab Â· pratinjau 320 px Â· penataan urutan sematan Â· semat dari layar lain Â· daftar prasyarat manusia (seleksi + tanda tangan guru 309 F-06 / 550 hasil aturan / 119 override / 39 F-05, reviewer R1âR6/R8âR9/R12, CP/ATP per bab, OD-1 IPAS Fase A, D-UX-2/4/5/6) Â· tanda tangan putusan (L3) Â· boot flicker Â· kontainer gulir shell Â· diagnosis timeout tulis-pertama E2E Â· blocker rilis B-01â¦B-08. `reviewStatus` tetap `draft`.

### Handoff Kuis Berurutan (2026-10-28, T-110)

**Status:** selesai dan terverifikasi. Permintaan PO: "saya ingin soap quis dan latihan di buat seaquense, satu soal di jawab, kemudian pindah ke halamn soal berikutnya sampai akhir dan ada hasilnya".

**Keputusan desain:**
1. Cakupan = `QuizActivity` (tipe `multiple-choice`, `true-false`, `short-answer`) â yaitu yang dibuka tombol "kuis"/"Lanjut berlatih", termasuk "latihan" karena aktivitas itulah yang dinilai per soal. `MatchingActivity` dan `OrderingActivity` **sengaja tidak diubah**: keduanya satu latihan utuh yang semua pasangan/itemnya harus terlihat bersamaan, bukan kumpulan soal lepas.
2. Navigasi eksplisit (`Lanjut`, `Lihat hasil`), bukan pindah otomatis â soal pilihan ganda bisa butuh beberapa pilihan sebelum lanjut, dan tombol eksplisit menjaga alur papan ketik/pembaca layar tetap terduga. `Lanjut` nonaktif sampai soal terjawab, dengan hint kecil yang menjelaskan sebabnya.
3. Penilaian tetap di akhir (`scoreQuiz` dipanggil sekali saat tombol terakhir), sehingga payload `onGraded`, attempt, rerata, dan outbox tidak berubah. `Ulangi kuis` mengosongkan `answers` + `result` dan kembali ke soal 1.
4. Satu soal per halaman berarti panel lebih pendek dari kartu samping; asersi "kolom samping punya ruang menempel â¥80 px" dihapus dan uji menempel dilaporkan **tidak diuji** (bukan dilemahkan diam-diam).

**Yang diubah:**
- [QuizActivity.tsx](../../src/components/content/QuizActivity.tsx) â state `questionIndex`, `result`, ref `questionRef`/`resultRef`/`focusQuestionRef`; kepala soal `[data-quiz-progress]` + `progressbar` "Kemajuan kuis"; `fieldset`/`legend` `sr-only` per soal; navigasi `Sebelumnya`/`Lanjut`/`Lihat hasil`; kartu hasil dengan "Benar X dari M soal" + `Ulangi kuis`; fokus pindah ke kartu soal/hasil.
- [activities.mjs](../../scripts/e2e/scenarios/activities.mjs) â benar-salah, jawaban singkat (termasuk `Ulangi kuis`), dan pilihan ganda multi-jawaban kini dijalankan soal per soal; asersi `fieldsets` 1, progres, dan `Lanjut` nonaktif; asersi ruang menempel dihapus + alasan dicatat di log.
- [learning-journey.mjs](../../scripts/e2e/scenarios/learning-journey.mjs), [home-catalog.mjs](../../scripts/e2e/scenarios/home-catalog.mjs), [quiz-coverage.mjs](../../scripts/e2e/scenarios/quiz-coverage.mjs), [a11y.mjs](../../scripts/e2e/scenarios/a11y.mjs) â loop per soal; `quiz-coverage` membaca jumlah soal dari `[data-quiz-progress]`, `a11y` menambah state audit "Player (soal kuis)".

**Verifikasi aktual:** `npx tsc --noEmit` bersih Â· `npm run build` exit 0 ("built in 8.59s") Â· E2E `activities` **16/16**, `learning-journey` **14/14**, `home-catalog` **29/29**, `quiz-coverage` **5/5**, `player-fullscreen` **6/6**, `smoke` **8/8** Â· `npm run a11y` **18/18** (0 error, 7 warning; state soal kuis 0 error/0 warning) Â· `npm test` **120/120** (16 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `cargo test` tidak dijalankan (tanpa perubahan Rust). Screenshot diperiksa mata: `quiz-baru-soal-1.png`, `quiz-baru-soal-terakhir.png`, `a11y-quiz-step.png`, `a11y-quiz-result.png` â progres dan penghitung soal tampil sekali (bukan ganda), kartu hasil terbaca.

**Batasan jujur:**
1. Hanya aktivitas kuis yang berurutan; mencocokkan dan mengurutkan tetap satu halaman.
2. Tidak ada penyimpanan posisi soal â keluar dari Player mengulang dari soal 1 (jawaban juga tidak dipersistensi di tengah jalan, sama seperti sebelumnya).
3. Uji kolom samping "menempel" tidak lagi dijalankan pada `activities` karena halaman satu soal tidak cukup tinggi (ruang gulir 277 px vs kartu samping); sticky tetap ada di CSS dan diverifikasi lewat kode, bukan E2E.
4. Tombol `Sebelumnya` memungkinkan mengubah jawaban soal lama sebelum submit; skor hanya dihitung saat submit, jadi tidak ada penilaian parsial.

**Sisa:** komponen `Button` bersama Â· ingat pilihan tab Â· pratinjau 320 px Â· penataan urutan sematan Â· semat dari layar lain Â· pratinjau soal panjang/multibaris pada 320 px Â· daftar prasyarat manusia (seleksi + tanda tangan guru 309 F-06 / 550 hasil aturan / 119 override / 39 F-05, reviewer R1âR6/R8âR9/R12, CP/ATP per bab, OD-1 IPAS Fase A, D-UX-2/4/5/6) Â· tanda tangan putusan (L3) Â· boot flicker Â· kontainer gulir shell Â· diagnosis timeout tulis-pertama E2E Â· blocker rilis B-01â¦B-08. `reviewStatus` tetap `draft`.

### Handoff Ingat Tab Beranda & Posisi Soal (2026-10-28, T-111)

**Status:** selesai dan terverifikasi. Permintaan PO: "Mulai opsi 1" â ingat tab Beranda + posisi soal terakhir per profil, disimpan di SQLite, jadi membuka lagi tidak me-reset.

**Keputusan desain:**
1. Satu tabel generik `profile_ui_state` (kunciânilai) alih-alih kolom baru di `profiles` atau tabel per fitur: tab Beranda dan posisi kuis hanyalah keadaan antarmuka, dan kunci tetap (`home-tab`, `quiz-resume`) menjaga jumlah baris per profil konstan (maks 2) â tidak menumpuk riwayat.
2. Posisi kuis menyimpan **identitas kuis** (`packageId`/`lessonId`/`activityId`) di dalam nilai, bukan di kunci; kunci gabungan akan melewati batas 64 karakter dan meninggalkan baris basi tiap kuis yang dibuka. Saat memulihkan, identitas harus cocok â posisi dari kuis lain diabaikan.
3. Jawaban ikut dipulihkan, bukan hanya nomor soal, karena soal pilihan ganda satu per halaman tanpa jawaban terpilih membuat `Lanjut` nonaktif dan pengguna terjebak mengulang.
4. Tulis ditunda 300 ms agar mengetik tidak menulis SQLite per ketukan, **tetapi** `Lanjut`/`Sebelumnya` menulis segera â perpindahan soal adalah titik aman yang paling mungkin diikuti penutupan aplikasi.
5. Pemuatan tidak menimpa masukan pengguna: pembaruan memakai functional updater dan hanya berlaku bila jawaban/indeks masih kosong. Kegagalan baca/tulis diabaikan (`catch {}`) â keadaan antarmuka bersifat tambahan, tidak boleh memblokir kuis.
6. Tab Beranda hanya menang bila masih sah: `pinned` tersimpan tetapi sematan kosong â jatuh ke `available`. Pilihan manual (`sectionChosenRef`) tetap tidak ditimpa, dan melepas sematan terakhir menyimpan `available`.

**Yang diubah:**
- [0009_profile_ui_state.sql](../../src-tauri/src/migrations/0009_profile_ui_state.sql), [ui_state.rs](../../src-tauri/src/ui_state.rs), [db.rs](../../src-tauri/src/db.rs) (migrasi 9), [lib.rs](../../src-tauri/src/lib.rs) (tiga perintah) â nilai maks 8 KiB, kunci `[A-Za-z0-9_-]` maks 64 karakter, `clear` idempoten, hapus profil menghapus state (FK cascade).
- [uiStateRepository.ts](../../src/data/uiStateRepository.ts) baru; [quizResume.ts](../../src/content/quizResume.ts) + [quizResume.test.ts](../../src/content/__tests__/quizResume.test.ts) baru (4 test).
- [HomeScreen.tsx](../../src/screens/HomeScreen.tsx) â baca simpanan sekali, efek default memakai tab tersimpan, simpan pada `selectSection`.
- [QuizActivity.tsx](../../src/components/content/QuizActivity.tsx) â prop `resumeTarget`, efek pemulihan, tulis berjeda + flush, `clearProgress()` pada `submit`/`retry`.
- [LessonPlayer.tsx](../../src/screens/LessonPlayer.tsx) â `profileId` state + `resumeTarget`; banner penyimpanan diberi `data-player-storage` agar uji bisa membaca status sebenarnya.
- [pinned-materials.mjs](../../scripts/e2e/scenarios/pinned-materials.mjs) â blok tab tersimpan setelah muat ulang; [activities.mjs](../../scripts/e2e/scenarios/activities.mjs) â blok posisi soal setelah muat ulang + helper `waitForSaved` yang melaporkan banner/judul/hash saat gagal.

**Verifikasi aktual:** `npx tsc --noEmit` bersih Â· `npm run build` exit 0 Â· `npm test` **124/124** (17 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `cargo test` **83/83** (6 test `ui_state`) Â· `npm run a11y` **18/18** (0 error, 7 warning) Â· E2E `activities` **17/17**, `pinned-materials` **13/13**, `learning-journey` 14/14, `home-catalog` 29/29, `quiz-coverage` 5/5, `smoke` 8/8, `player-fullscreen` 6/6, `profile-lifecycle` 7/7, `backup-restore` 9/9, `player-deeplink` 7/7, `mode-switch` 6/6, `content-rollback` 9/9.

**Batasan jujur:**
1. Satu simpanan per profil untuk posisi kuis â membuka kuis lain menimpa posisi kuis sebelumnya (bukan riwayat per kuis).
2. Ketukan terakhir yang terjadi <300 ms sebelum aplikasi ditutup belum tersimpan (jendela debounce); perpindahan soal tidak terkena karena ditulis segera.
3. Setelah muat ulang, sesi belajar baru dibuat â ringkasan sesi E2E `activities` kini melaporkan **2 sesi, 5 percobaan** (sebelumnya 1 sesi) karena satu percobaan dilakukan setelah muat ulang.
4. `MatchingActivity`/`OrderingActivity` tidak memakai posisi soal (satu halaman utuh), dan keadaan antarmuka tidak disinkronkan ke server.
5. Flake lama "banner simpan tidak berubah dari siap" (tercatat sejak T-103) muncul lagi 2Ã saat menjalankan `activities` dari 3 percobaan; setelah blok uji dibereskan, run terakhir PASS penuh. Helper `waitForSaved` kini mencetak banner, judul layar, dan hash saat gagal sehingga penyebab dapat dilacak â akar masalah tetap belum terbukti.

**Sisa:** komponen `Button` bersama Â· pratinjau 320 px Â· penataan urutan sematan Â· semat dari layar lain Â· pratinjau soal panjang/multibaris pada 320 px Â· diagnosis flake banner simpan E2E Â· daftar prasyarat manusia (seleksi + tanda tangan guru 309 F-06 / 550 hasil aturan / 119 override / 39 F-05, reviewer R1âR6/R8âR9/R12, CP/ATP per bab, OD-1 IPAS Fase A, D-UX-2/4/5/6) Â· tanda tangan putusan (L3) Â· boot flicker Â· kontainer gulir shell Â· blocker rilis B-01â¦B-08. `reviewStatus` tetap `draft`.

### Handoff Semat dari Header Player (2026-10-28, T-112)

**Status:** selesai dan terverifikasi. Instruksi PO: "lanjutkan" â dilanjutkan ke butir berikutnya pada daftar sisa: semat dari layar lain (Player), karena ini melengkapi fitur sematan T-106 yang sebelumnya hanya bisa dipasang dari Jelajah Materi.

**Yang diubah:**
- [LessonPlayer.tsx](../../src/screens/LessonPlayer.tsx) â tombol `data-pin-toggle` di header materi (teks "Sematkan"/"Disematkan", `aria-pressed`, `aria-label` menyebut judul, ikon pembatas buku, gaya sama dengan katalog: `border-teal/50 bg-teal/10` saat aktif). Status `[data-player-pin-status]` `aria-live="polite"` mengumumkan hasil atau galat batas 24 di baris yang sama. Status dibaca lewat `pinned_list` saat `profileId` siap; tombol hanya dirender jika `canPersistLocally()`.
- [LessonPlayer.tsx](../../src/screens/LessonPlayer.tsx) â `sessionReadyRef` menyimpan promise `ensureLocalProfile` + `getOrStartSession`; `handleGraded` menunggu promise itu bila `sessionId` belum ada, bukan langsung gagal.
- [pinned-materials.mjs](../../scripts/e2e/scenarios/pinned-materials.mjs) â blok siklus penuh semat/lepas dari Player (13 â 16 pemeriksaan).
- [a11y.mjs](../../scripts/e2e/scenarios/a11y.mjs) â pembacaan banner simpan memakai `[data-player-storage]`, bukan `[aria-live="polite"]` pertama, karena Player kini punya dua wilayah live.

**Keputusan desain:**
1. **Tanpa Rust/migrasi baru** â `pinned_set`/`pinned_list` sudah punya semantik yang dibutuhkan (idempoten, batas 24, `PROFILE_NOT_FOUND`); menambah perintah baru hanya akan menggandakan kontrak.
2. **Status di samping tombol, bukan di banner penyimpanan** â pesan sematan dan pesan penyimpanan hasil berbeda pemilik dan berbeda masa hidup; menyatukannya membuat satu pesan menimpa pesan lain.
3. **Tombol disembunyikan di pratinjau browser** â tanpa SQLite, `pinned_set` pasti gagal; lebih jujur tidak menawarkan aksi yang tidak bisa disimpan.
4. **Menunggu sesi, bukan menolak hasil** â kuis yang selesai <1 detik setelah Player terbuka adalah kasus nyata (siswa membuka materi lalu langsung menjawab); kehilangan hasil karena balapan internal tidak dapat diterima.

**Verifikasi aktual:** `npx tsc --noEmit` bersih Â· `npm run build` exit 0 (16,02 dtk) Â· `npm test` **124/124** (17 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `npm run a11y` **18/18** (0 error, 7 warning) Â· E2E `pinned-materials` **16/16**, `activities` **17/17**, `learning-journey` **14/14**, `home-catalog` **29/29**, `player-deeplink` **7/7**, `player-fullscreen` **6/6**, `smoke` **8/8** Â· `cargo test` tidak dijalankan (tanpa perubahan Rust). Screenshot `player-sematkan.png` diperiksa mata: tombol teal "Disematkan" + ikon terisi di bawah ringkasan, teks status "Zakat dan Infak disematkan ke Beranda." di sebelahnya, tidak bersaing dengan tab aktivitas.

**Batasan jujur:**
1. Semat masih belum bisa dari layar Hasil Belajar atau Aktivitas Interaktif.
2. Urutan sematan tetap `pinned_at DESC` (belum bisa diatur), dan tombol tidak muncul di mode layar penuh karena header disembunyikan.
3. Bila pembacaan sematan gagal, tombol tidak tampil dan hanya galat teks kecil yang muncul â bukan pemblokir belajar.
4. `npm run a11y` gagal **dua kali berturut-turut** setelah tombol ditambahkan, dengan gejala `riwayat banner: [{"ms":13,"text":""}]`. Penyebabnya harness membaca `[aria-live="polite"]` **pertama** di halaman, yang kini wilayah status sematan (kosong), bukan banner simpan. Ini masalah selektor uji, bukan pelanggaran a11y; selektor dipersempit ke `[data-player-storage]` dan audit kembali 18/18.
5. Flake lama "banner tetap siap, simpan tidak pernah mulai" kini punya penjelasan terverifikasi dari screenshot + kode: `sessionId` masih kosong saat kuis selesai â galat "Sesi belajar belum siap" ditulis â efek sesi yang belum rampung menimpanya dengan "siap". Perbaikan menunggu sesi membuat `activities` PASS 17/17 pada percobaan pertama. Klaim ini **kuat tetapi belum eksklusif** â flake lama bersifat intermiten, jadi perlu beberapa run berikutnya untuk memastikan tidak ada penyebab kedua.

**Sisa:** komponen `Button` bersama Â· pratinjau 320 px (tab Beranda + soal panjang) Â· penataan urutan sematan Â· semat dari layar Hasil Belajar/Aktivitas Â· pantau apakah flake banner simpan hilang setelah perbaikan balapan sesi (BACKLOG) Â· daftar prasyarat manusia (seleksi + tanda tangan guru 309 F-06 / 550 hasil aturan / 119 override / 39 F-05, reviewer R1âR6/R8âR9/R12, CP/ATP per bab, OD-1 IPAS Fase A, D-UX-2/4/5/6) Â· tanda tangan putusan (L3) Â· boot flicker Â· kontainer gulir shell Â· blocker rilis B-01â¦B-08. `reviewStatus` tetap `draft`.

### Handoff Materi Daring HTML5 â ADR + Kontrak (2026-10-28, T-113)

**Status:** desain selesai, **belum ada kode**. Instruksi PO: materi dibuat di platform (editor/content creator berbasis HTML5 animation), disimpan di server Gerbang Edukasi, dan muncul di Jelajah Materi setelah publish; PO minta mulai dari ADR + kontrak. Editor mu-komik yang dibuka PO hanya acuan tampilan, bukan integrasi.

**Yang ditulis:**
- [ADR-0035](../../knowledge/decisions/ADR-0035-online-html5-materials.md) â **Proposed**: jenis konten `material` (bukan tipe aktivitas baru), katalog + unduh-sekali, bundel bertanda tangan Ed25519 dengan kunci konten terpisah dari lisensi, render di `iframe sandbox="allow-scripts allow-forms"` dari `ifp-content://`, CSP hanya ditambah `frame-src`, jembatan `postMessage` minimal, tanpa skor, a11y mengikat.
- [MATERIAL_BUNDLE_CONTRACT.md](../../knowledge/content/MATERIAL_BUNDLE_CONTRACT.md) â skema `material.json` (20 field + `files` per-hash), aturan bundel self-contained, kanonikalisasi RFC 8785, endpoint `GET /v1/materials`, urutan verifikasi 7 langkah + 7 kode galat, rancangan tabel state lokal, skema pesan jembatan, syarat a11y, alur publish, kompatibilitas.

**Keputusan desain penting:**
1. **Unduh-sekali, bukan streaming** â premis aplikasi offline-first; streaming membuat Jelajah Materi kosong saat internet sekolah mati.
2. **Kunci konten â  kunci lisensi** â kompromi kunci lisensi tidak boleh otomatis mengizinkan penyuntikan materi.
3. **Iframe sandbox, bukan webview Tauri terpisah** â isolasi origin (opaque) + tanpa akses IPC sudah cukup untuk v1; webview terpisah menambah biaya Rust dan mengeluarkan pengguna dari shell.
4. **Larangan jaringan di dalam bundel** â animasi yang memanggil CDN akan mati offline dan membuka permukaan pelacakan; karena itu diperiksa saat publish.
5. **Tanpa skor** â materi tidak mengisi Hasil Belajar sampai OD-14 diputuskan; mencampur keduanya akan merusak arti "skor".
6. **ADR berstatus Proposed** â kontrak v1 melarang menjalankan kode dari konten (`IMPLEMENTATION_CONTRACT.md` Â§3); mengaktifkannya butuh persetujuan eksplisit PO.

**Verifikasi aktual:** hanya pemeriksaan dokumen â `grep`/baca kode untuk memastikan klaim (CSP di [tauri.conf.json](../../src-tauri/tauri.conf.json), larangan skrip di [SCHEMA.md](../../knowledge/content/SCHEMA.md), bentuk galat Worker `{error:{code,message}}` di [http.ts](../../workers/api/src/http.ts), route Worker yang ada di [index.ts](../../workers/api/src/index.ts)). **Tidak ada** test/build/E2E yang dijalankan karena tidak ada kode yang berubah. Tidak ada URL, ukuran, atau angka yang diklaim terverifikasi â semua batas (50 MB, 2 GB cache, TTL 10 menit, 60 req/menit) ditandai usulan.

**Batasan jujur:**
1. Kontrak belum dibekukan; semua nama field, path endpoint, dan angka batas masih dapat berubah.
2. Belum ada yang membuktikan iframe sandbox cukup aman untuk bundel nyata â itu harus diuji di prototipe tahap 2 sebelum katalog dibangun.
3. Pemeriksaan "self-contained" berbasis pola, bukan sandbox; bundel berbahaya yang lolos review tetap mungkin. Mitigasi sebenarnya adalah tanda tangan + hanya Gerbang Edukasi yang bisa menerbitkan.
4. Sisi platform (validator publish, penandatanganan, storage) berada di luar repo ini dan belum ada.
5. Lima keputusan terbuka (OD-10â¦OD-14) memblokir implementasi katalog.

**Sisa:** persetujuan PO atas ADR-0035 Â· jawaban OD-10â¦OD-14 Â· prototipe penampil dengan bundel contoh lokal Â· lalu katalog + pengunduh. Daftar sisa lama tidak berubah (Button bersama, pratinjau 320 px, urutan sematan, semat dari Hasil/Aktivitas, pantau flake banner, prasyarat manusia, L3, boot flicker, kontainer gulir, blocker rilis). `reviewStatus` tetap `draft`.

### Handoff Penampil Materi HTML5 (2026-10-28, T-114)

**Status:** prototipe penampil berjalan dan terverifikasi di aplikasi desktop. Instruksi PO: "setujui usulan OD lalu lanjut prototipe" â OD-10â¦OD-14 dikunci di [ADR-0035](../../knowledge/decisions/ADR-0035-online-html5-materials.md) lalu tahap 2 ("prototipe penampil dengan satu bundel contoh lokal") dikerjakan.

**Yang diubah:**
- [material.rs](../../src-tauri/src/material.rs) â modul baru: `SAMPLE_FILES` lewat `include_bytes!`, `ensure_sample_material` (penanda `seed.json {seedVersion:4}` + stagingârename agar penulisan tidak separuh), `material_open_sample`, `resolve_request` (percent-decode, tolak `..`/absolut, allowlist MIME, batas 50 MB, containment di root), `material_response` (CSP materi, `no-store`, `nosniff`); 3 unit test.
- [lib.rs](../../src-tauri/src/lib.rs) â `register_uri_scheme_protocol("ifp-content", â¦)` + `MaterialState { root: <app_data>/materials }` + perintah `material_open_sample`.
- [tauri.conf.json](../../src-tauri/tauri.conf.json) â `frame-src 'self' ifp-content: http://ifp-content.localhost` di `csp` dan `devCsp`.
- [MaterialViewer.tsx](../../src/components/material/MaterialViewer.tsx) â dialog modal, iframe sandbox, jembatan pesan, progres, dwell, Esc, transkrip.
- [materialRepository.ts](../../src/data/materialRepository.ts) â tipe `MaterialView` + URL entri per segmen.
- [ContentScreen.tsx](../../src/screens/ContentScreen.tsx) â bagian "Materi HTML5 (prototipe)" dengan tombol `data-material-open`; hanya tampil di desktop.
- [cdp.mjs](../../scripts/e2e/cdp.mjs) + [material-viewer.mjs](../../scripts/e2e/scenarios/material-viewer.mjs) + `npm run e2e:material`.
- [sample-material/](../../src-tauri/sample-material/) â bundel contoh tiga langkah siklus air, gaya sendiri, kontrol Jeda/Lanjutkan/Tandai selesai/Keluar, transkrip.

**Keputusan desain:**
1. **Origin terpisah lewat protokol kustom, bukan `asset:`** â materi harus berada di origin berbeda agar `sandbox` benar-benar mencabut akses ke shell; `asset:` berbagi kebijakan dengan aset aplikasi.
2. **Iframe OOPIF adalah kenyataan, bukan bug** â WebView2 memindahkan frame lintas-origin ke proses lain, sehingga pesan awal bisa hilang; karena itu materi mengumumkan `ready` berulang (â¤25Ã400 ms) sampai menerima `config`, dan induk mengirim `hello` saat `onLoad`.
3. **Dwell ditegakkan di induk** â `complete` dari isi materi tidak dipercaya; induk membandingkan `Date.now()` dengan waktu buka. Nilai 2 detik dibaca dari manifest, bukan konstanta kode.
4. **CSP materi `connect-src 'none'`** â menegakkan syarat self-contained kontrak pada tingkat browser, bukan hanya pola di validator publish.
5. **Tombol hanya di mode desktop** â tanpa Tauri tidak ada perintah/protokol; menampilkan tombol yang pasti gagal lebih buruk daripada menjelaskan batasnya.

**Verifikasi aktual:** `npx tsc --noEmit` bersih Â· `npm run build` exit 0 (15,18 dtk) Â· `npm test` **124/124** (17 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `cargo test` **86/86** (3 test `material::`) Â· `npm run a11y` **18/18** (0 error, 7 warning) Â· E2E `material-viewer` **8/8**, `smoke` **8/8**, `pinned-materials` **16/16**. Screenshot `material-viewer.png` diperiksa mata: materi bergaya penuh (bukan halaman kosong), langkah 2 tersorot, progres 33%, status "Materi siap.".

**Cacat yang ditemukan dan diperbaiki:** `convertFileSrc` meng-encode seluruh path menjadi satu segmen (`contoh-siklus-air%2F1.0.0%2Findex.html`). Dokumen tetap termuat, tetapi `assets/app.js` dan `style.css` dicari di `/assets/â¦` (di luar bundel) sehingga tidak pernah dimuat dan `ready` tak pernah dikirim. Gejala awal "timeout menunggu materi siap" sempat disalahduga sebagai masalah sandbox/pesan; bukti `performance.getEntriesByType("resource")` (`/assets/app.js`, `transferSize 0`) membuktikan sebaliknya. Perbaikan: encode per segmen.

**Batasan jujur:**
1. Satu bundel contoh disemai dari biner aplikasi; tidak ada katalog, unduhan ZIP, tanda tangan Ed25519, verifikasi hash, atau pemilihan materi.
2. `material_install`/`material_progress` belum ada â `complete` hanya mengubah status di memori dan hilang saat penampil ditutup (sesuai OD-14, tetapi belum ada penyimpanan sama sekali).
3. Materi contoh adalah berkas tepercaya di repo; keamanan konten pihak ketiga, bundel 50 MB, dan serangan renderer belum diuji.
4. `frame-src` kini berlaku untuk seluruh shell, bukan hanya layar Konten.
5. Harness E2E bergantung pada `Target.attachToTarget` (OOPIF); bila WebView2 berubah perilaku, skenario materi perlu disesuaikan.
6. Pemutaran audio dan `captionsPath` belum diuji karena bundel contoh tidak memuat media.

**Sisa:** katalog `/v1/materials` + pengunduh ZIP + verifikasi tanda tangan/hash + tabel state materi (tahap 3 ADR-0035) Â· progres/semat/pembersihan cache (tahap 4) Â· sisi platform (validator publish, penandatanganan, storage) di luar repo ini Â· daftar sisa lama (Button bersama, pratinjau 320 px, urutan sematan, semat dari Hasil/Aktivitas, pantau flake banner, prasyarat manusia, L3, boot flicker, kontainer gulir, blocker rilis). `reviewStatus` tetap `draft`.

### Handoff Pemasang Bundel Materi (2026-10-28, T-115)

**Status:** pemasangan bundel materi **dari ZIP lokal + tanda tangan** berjalan dan terverifikasi di aplikasi desktop. Lanjutan dari handoff T-114; tahap 3 ADR-0035 dipisah: 3a (pemasang lokal) selesai, 3b (katalog + unduhan server) belum.

**Yang diubah:**
- `src-tauri/src/material_manifest.rs` â model manifest ketat bersama (`deny_unknown_fields`), validasi kontrak Â§4 (id slug, SemVer, grade 1â6, subject slug, entry `index.html`, cover/transkrip wajib terdaftar, `captionsPath` bila ada audio, `keyboardNavigable`, `minAppVersion` vs versi aplikasi), allowlist tipe media + pola self-contained.
- `src-tauri/src/material_install.rs` â pembaca ZIP (`zip` 9.1.3, deflate): batas 50 MB, maks 5.000 entri, tolak symlink/path traversal/duplikat case-insensitive, cek ukuran deklarasi; verifikasi tanda tangan Ed25519 **dengan `keyId` persis** dari sidecar `.sig`; `material_install_bundle`, `material_list_installed`, `material_open_installed`; staging `<root>/.staging/<uuid>` â `fs::rename`; 12 unit test.
- `src-tauri/src/migrations/0010_material_install.sql` â tabel `material_install` (`state â staged|active|superseded`).
- `src-tauri/src/material.rs` â manifest bersama menggantikan salinan lokal; `open_material` tetap `pub(crate)` dan memakai validator yang sama; `license::canonical_value` dijadikan `pub(crate)` untuk dipakai ulang.
- `scripts/material-pack.mjs` â `keygen`/`pack`: ZIP STORED tanpa dependensi tambahan, manifest kanonik, sidecar `.sig`, `--transform` untuk membuat fixture negatif.
- `src/data/materialRepository.ts` + `src/screens/ContentScreen.tsx` â tombol impor (filter `.zip`), pesan hasil, daftar "Materi terpasang" + tombol buka.
- `scripts/e2e/scenarios/material-import.mjs` + `npm run e2e:material-import`; `package.json` menambah `material:pack`.

**Keputusan desain:**
1. **Tanda tangan di luar bundel** (`<nama>.zip` + `<nama>.sig`) karena `material.json` harus ikutditandatangani dan tidak bisa memuat tanda tangannya sendiri. `bundleSha256` baru relevan saat unduhan (verifikasi transport), bukan saat impor lokal.
2. **`keyId` mengikat, bukan sekadar "salah satu kunci sah"** â tanpa ini, bundel yang ditandatangani kunci lama bisa mengaku kunci baru.
3. **`sha256` di tabel = digest manifest kanonik**, bukan digest ZIP; manifest sudah memuat hash setiap berkas, jadi verifikasi ZIP utuh tidak menambah jaminan untuk jalur impor lokal.
4. **Duplikat ditolak, bukan ditimpa** â versi yang sama harus diterbitkan ulang dengan nomor versi baru.

**Verifikasi aktual:** `npx tsc --noEmit` bersih Â· `npm run build` exit 0 Â· `npm test` **124/124** Â· `cargo test --lib` **98/98** Â· `npm run a11y` **18/18** Â· E2E `material-import` **12/12**, `material-viewer` **8/8**, `smoke` **8/8**, `pinned-materials` **16/16**. Dua screenshot diperiksa: penampil materi impor dan daftar materi terpasang.

**Batasan jujur:**
1. Dialog pemilih berkas native tidak dapat diotomasi; E2E memasang lewat bridge `invoke` lalu menguji daftar + buka. Jalur tombol â dialog belum diuji otomatis.
2. Belum ada katalog/unduhan server, `bundleSha256`, `material_progress`, atau LRU (tahap 3b/4).
3. Pemindai self-contained berbasis pola teks, bukan sandbox; mitigasi sebenarnya tetap tanda tangan penerbit.
4. Bundel mendekati 50 MB, audio/`captionsPath`, dan materi berbahaya belum diuji.
5. Penolakan duplikat berarti tidak ada jalur "pasang ulang/repair" bila folder materi rusak di disk; saat ini pengguna harus menaikkan versi.

**Sisa:** katalog `/v1/materials` + unduhan + verifikasi `bundleSha256` (butuh HTTP client â persetujuan dependensi terpisah) Â· `material_progress` + LRU Â· sisi platform (validator publish, penandatanganan, storage) Â· daftar sisa lama. `reviewStatus` tetap `draft` semua paket.

### Handoff Sematan Materi HTML5 di Beranda (2026-10-28, T-116)

**Status:** materi HTML5 terpasang kini bisa disematkan per profil ke Beranda, dengan **batas 24 sematan yang dipakai bersama** paket dan materi. Lanjutan langsung T-115; keputusan PO di sesi: "batas sematan dibagi bersama (24 total)".

**Yang diubah:**
- `src-tauri/src/migrations/0011_pinned_materials.sql` â tabel `pinned_materials` (PK `profile_id`+`material_id`, FK profil CASCADE, indeks `(profile_id, pinned_at DESC)`).
- `src-tauri/src/db.rs` â migrasi registri versi 11.
- `src-tauri/src/pins.rs` â `count_pins` (gabungan `pinned_lessons` + `pinned_materials`) dipakai kedua jalur semat; `PinnedMaterial`/`SetPinnedMaterialInput`; `list_pinned_materials` (pangkas baris yang menunjuk materi tak aktif) + `set_pinned_material`; command `pinned_material_list`/`pinned_material_set`; 5 unit test baru.
- `src-tauri/src/lib.rs` â dua command baru didaftarkan; `material_install.rs` mengembalikan `use std::path::PathBuf` ke modul test.
- `src/data/pinnedRepository.ts` â `PinnedMaterial`, `SetPinnedMaterialInput`, `listPinnedMaterials`, `setPinnedMaterial`.
- `src/screens/ContentScreen.tsx` â tombol `data-material-pin` (`aria-pressed`, `Sematkan`/`Disematkan`), pesan `aria-live`, galat batas dari Rust.
- `src/screens/HomeScreen.tsx` â `PinnedCard` gabungan (paket + materi) urut `pinnedAt` turun; kartu materi `data-pinned-material` dengan `Buka` (â `MaterialViewer`) dan `Lepas`; hitungan tab, empty state, `Kelola sematan`, dan tab awal memakai total gabungan.
- `scripts/e2e/scenarios/material-pin.mjs` + `npm run e2e:material-pin`.

**Keputusan desain:**
1. **Tanpa FK ke `material_install`** â PK tabel itu `(material_id, version)`, jadi `material_id` saja bukan kunci unik. Keberadaan materi divalidasi saat menyematkan (`state='active'`), dan baris menggantung dipangkas saat daftar dibaca.
2. **Satu penghitung batas** (`count_pins`) di kedua jalur, supaya paket dan materi tidak bisa masing-masing mencapai 24.
3. **Kartu Beranda di-join ke `material_list_installed`**, bukan ke tabel sematan, supaya judul/kelas/menit dibaca dari manifest aktif dan materi yang hilang dari disk otomatis tidak tampil sebagai kartu rusak.
4. **Penampil dibuka di Beranda** (`MaterialViewer` dirender di layar yang sama) agar sematan tidak memaksa pindah ke layar Konten.

**Verifikasi aktual:** `npx tsc --noEmit` bersih Â· `npm run build` exit 0 Â· `npm test` **124/124** (17 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `cargo test --lib` **103/103** Â· `npm run a11y` **18/18** (0 error, 7 warning) Â· E2E `material-pin` **12/12**, `material-import` **12/12**, `pinned-materials` **16/16**, `material-viewer` **8/8**, `smoke` **8/8**. Tiga screenshot E2E diperiksa (tombol Disematkan di daftar materi, tab Materi disematkan berisi kartu `Materi HTML5`, penampil terbuka dari Beranda).

**Batasan jujur:**
1. Tombol semat hanya ada di daftar "Materi terpasang", belum di dalam penampil materi.
2. Kartu materi memakai placeholder gradien, bukan `cover` dari bundel.
3. Batas 24 bersama dibuktikan unit test Rust; E2E tidak membuat 24 sematan nyata.
4. Bila berkas materi hilang dari disk, sematan tetap ada di SQLite lalu dipangkas saat daftar dibaca â pengguna tidak menerima pemberitahuan.
5. Urutan kartu mengikuti `pinned_at` dan belum bisa diatur pengguna.

**Sisa:** semat dari dalam penampil Â· cover bundel pada kartu Â· katalog `/v1/materials` + unduhan + `bundleSha256` (butuh HTTP client) Â· `material_progress` + LRU Â· daftar sisa lama. `reviewStatus` tetap `draft` semua paket.

### Handoff Katalog Materi Daring (2026-10-28, T-117)

**Status:** tahap 3b ADR-0035 berjalan di prototipe â aplikasi bisa menampilkan katalog materi daring dari server, mengunduh bundel, memverifikasi `bundleSha256` + tanda tangan, lalu memasangnya lewat pemasang T-115. Sisi platform masih **server referensi lokal** (`scripts/mock-catalog-server.mjs`), bukan `/v1/materials` produksi. Persetujuan dependensi (G5) diberikan user di sesi untuk `reqwest` 0.13.5.

**Yang diubah:**
- [material_catalog.rs](../../src-tauri/src/material_catalog.rs) â klien katalog: `list_catalog` (ETag/If-None-Match, cache SQLite, fallback `stale`), `install_from_catalog` (validasi tanda tangan **sebelum** unduh â `download_bundle` â `material_install::install_from_bytes` dengan `ExpectedBundle`), `material_catalog_config_get/set`, command `material_catalog_list`/`material_catalog_install`; `CatalogQuery` diberi `#[serde(default)]` + `camelCase` agar input parsial sah.
- `src-tauri/src/migrations/0012_material_catalog_cache.sql` â tabel `material_catalog_cache(cache_key, etag, body, fetched_at)`; `downloadUrl` dikosongkan sebelum ditulis.
- `src-tauri/src/material_install.rs` â `install_from_bytes` menerima `ExpectedBundle` (`material_id`, `version`, `bundle_sha256`) dan menolak ketidakcocokan `MATERIAL_HASH_MISMATCH`; `verify_signed_manifest` diekspos untuk jalur katalog.
- `src-tauri/src/db.rs`, `src-tauri/src/lib.rs`, `src-tauri/src/error.rs` â registri migrasi 12, registrasi command, galat katalog.
- `scripts/mock-catalog-server.mjs` + `npm run catalog:mock` â server referensi (katalog + berkas bundel, token sederhana, ETag stabil).
- `scripts/material-pack.mjs` â `packBundle` kini mengembalikan `manifest` agar fixture bisa menyematkan manifest yang ditandatangani ke katalog.
- `src/data/materialRepository.ts` â `getCatalogConfig`, `setCatalogConfig`, `listMaterialCatalog`, `installMaterialFromCatalog`, tipe `CatalogItem`/`CatalogPage`/`MaterialCatalogConfig`/`CatalogQuery`.
- `src/content/subjectLabel.ts` â ekspor `subjectKeys`.
- `src/screens/ContentScreen.tsx` â bagian âJelajah materi daring (prototipe)â di antara materi HTML5 lokal dan review konten.
- `scripts/e2e/scenarios/material-catalog.mjs` + `npm run e2e:material-catalog`.
- `scripts/e2e/run.mjs` â batas tunggu `document.readyState` dinaikkan ke 60 dtk (Vite cold start setelah `tauri dev` baru).

**Keputusan desain:**
1. **Tanda tangan diverifikasi sebelum unduh** (kontrak Â§7) â katalog palsu tidak bisa menghabiskan kuota perangkat; hash ZIP baru diperiksa setelah byte diterima.
2. **`downloadUrl` tidak pernah disimpan** (OD-12) â baris cache menyimpan halaman tanpa URL pre-signed; pemasangan selalu mengambil halaman baru tanpa ETag agar URL segar.
3. **Alamat katalog dari `app_meta` lebih dulu**, lalu `IFP_CATALOG_URL`; UI menampilkan asal alamat supaya tidak ambigu saat E2E/produksi berbeda sumber.
4. **Cache hanya untuk tampilan**: saat server tak terjangkau, halaman cache dipakai dengan lencana âMenampilkan cache lokalâ; tanpa cache, galat asli diteruskan (`MATERIAL_FETCH_FAILED`).
5. **Validator URL dipisah**: URL katalog menolak query/fragmen, URL unduhan mengizinkan query (token pre-signed) tetapi menolak fragmen.

**Verifikasi aktual:** `npx tsc --noEmit` bersih Â· `npm run build` exit 0 Â· `npm test` **124/124** (17 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `cargo test --lib` **112/112** Â· `npm run a11y` **18/18** (0 error, 7 warning) Â· E2E `material-catalog` **8/8**, `smoke` **8/8**, `material-import` **12/12**, `material-viewer` **8/8**, `material-pin` **12/12**, `pinned-materials` **16/16**. Screenshot `katalog-daring.png` diperiksa (lencana cache lokal, kartu materi, tombol terpasang).

**Batasan jujur:**
1. Server katalog hanya referensi lokal â belum ada Worker `/v1/materials`, penandatanganan saat publish, bucket Supabase Storage, atau tabel katalog; alur ini belum pernah diuji terhadap layanan nyata.
2. `bundleSha256` diverifikasi tetapi tidak disimpan; `material_install.sha256` tetap digest manifest, jadi tidak ada bukti pasca-pasang bahwa ZIP tertentu yang dipasang.
3. Tidak ada jalur pasang-ulang/repair untuk versi yang sama, belum ada `material_progress`, LRU 2 GB, atau pembersihan cache katalog.
4. Cache katalog tanpa TTL lokal; respons `304` tidak memperbarui `fetched_at`.
5. Katalog hanya mengenal kelas 1â6 dan slug mapel; bundel nyata mendekati 50 MB dan materi dengan audio belum diuji.
6. Pemasangan di E2E tetap lewat bridge `invoke`; dialog native tidak diotomasi.

**Sisa:** `/v1/materials` produksi + penandatanganan publish + bucket Â· simpan `bundleSha256` di `material_install` Â· jalur repair/versi sama Â· `material_progress` + LRU Â· semat dari penampil Â· cover bundel pada kartu Â· daftar sisa lama. `reviewStatus` tetap `draft` semua paket.

### Materi Demo Kedua & Pembangun Katalog (2026-10-28, T-118)

**Status:** demo katalog lokal kini menyajikan **dua** materi bertanda tangan. Materi kedua adalah materi **interaktif** (bukan animasi) dan sengaja berbeda kelas + mapel dari yang pertama supaya filter katalog terlihat bekerja. Ini fixture demo, bukan fitur produk baru.

**Yang diubah:**
- [sample-material-perkalian/](../../src-tauri/sample-material-perkalian/) â materi baru `perkalian-kelompok-jeruk` v1.0.0, Kelas 2 Â· matematika Â· topik âPerkalianâ, Â±4 menit: `index.html`, `assets/app.js`, `assets/style.css`, `assets/cover.webp` (salinan [cover-mapel-matematika.webp](../../content/covers/pelajaran/cover-mapel-matematika.webp)), `transcript.txt`, `material.json` (`files: []` â diisi packer saat bundel dibangun).
- [dev-catalog.mjs](../../scripts/dev-catalog.mjs) + `npm run catalog:dev` â membangun kedua bundel dari sumber repo memakai kunci dev yang sudah ada, memverifikasi hasilnya, lalu menulis `.tmp-catalog/catalog.json`; `-- --serve` sekaligus menjalankan server katalog di `http://127.0.0.1:8789`.
- [material-pack.mjs](../../scripts/material-pack.mjs) â `canonical` diekspor (dipakai pemeriksaan independen, bukan diubah perilakunya).

**Keputusan desain:**
1. **Materi kedua interaktif, bukan animasi berjalan** â membuktikan `progress`/`complete` dari aksi pengguna, bukan timer; sekaligus contoh materi yang âdisusunâ anak.
2. **Beda kelas dan mapel** (Kelas 2 matematika vs Kelas 3 IPAS) â filter `grade`/`subject` di katalog dan UI bisa dibedakan tanpa menebak.
3. **Cover dipinjam dari cover mapel** â aturan aset Flow-only (4:3, kast Ayu/Bima) tidak dilanggar untuk fixture; ilustrasi khusus topik menyusul bila materi ini jadi kandidat nyata.
4. **Skrip dev memverifikasi hasilnya sendiri** â sha256 ZIP dihitung ulang dari berkas di disk dan tanda tangan diperiksa dengan kunci publik, jadi bangun fixture tidak bisa lolos dengan bundel rusak.
5. **Kunci dev tidak pernah ditulis ke repo** â `.tmp-catalog/keys/` diabaikan `.gitignore` (`.tmp-*`); `IFP_CONTENT_KEYS` tetap diberikan lewat environment saat aplikasi dijalankan.

**Verifikasi aktual:** `npm run catalog:dev` â 2 bundel (`perkalian-kelompok-jeruk` 76.919 B sha256 `6c14a974â¦`, `siklus-air-contoh` 15.679 B sha256 `f7c52c95â¦`), keduanya lolos pemeriksaan sha256 + Ed25519 terhadap kunci publik `dev-content-1`. Pemeriksaan independen atas ZIP: 5/5 berkas tiap bundel cocok hash-nya, `index.html`/cover/transkrip ada di dalam arsip. HTTP: `/v1/materials` â 2 item, `?grade=2` â 1, `?subject=matematika` â 1. Visual: Chrome headless 1024 px (3 kelompok jeruk, `3 Ã 4 = 4 + 4 + 4 = 12 jeruk`, kuis â2 Ã 3â benar, tombol `Tandai selesai` aktif) dan 360 px via emulasi CDP (`innerWidth == scrollWidth == 360`, grid 2 kolom, tombol menumpuk). `npm test` **124/124** (17 berkas) + fixture 4/4 + katalog 336/336 + binding PASS.

**Batasan jujur:**
1. Materi belum dipasang lewat UI aplikasi di sesi ini; jalur pasang/verifikasi tetap terbukti oleh E2E `material-catalog` 8/8 dan `material-import` 12/12 (bundel yang berbeda, kode jalur yang sama).
2. Cover bukan ilustrasi khusus topik.
3. `catalog:dev` hanya membangun fixture lokal â bukan alat publish, tidak menandatangani atas nama platform.
4. Kuis materi baru satu soal tetap; belum ada percabangan atau penilaian tersimpan (`material_progress` belum ada).
5. Demo hanya hidup selama `.tmp-catalog/` ada dan server `catalog:dev --serve` berjalan; aplikasi harus dijalankan dengan `IFP_CONTENT_KEYS` yang cocok.

**Sisa:** materi contoh keempat dan seterusnya bila demo butuh variasi (cukup tambah entri di `MATERIALS` pada `dev-catalog.mjs`) Â· ilustrasi cover khusus topik via Flow Â· `material_progress` Â· sisa daftar T-117.

### Materi Demo Ketiga (2026-10-28, T-119)

**Status:** katalog demo kini menyajikan **tiga** materi bertanda tangan, dengan tiga pola interaksi berbeda (animasi, berhitung, memilah). Masih fixture demo.

**Yang diubah:**
- [sample-material-fakta-opini/](../../src-tauri/sample-material-fakta-opini/) â `fakta-opini-kelas4` v1.0.0 Â· Kelas 4 Â· bahasa-indonesia Â· Â±6 menit: `index.html`, `assets/app.js`, `assets/style.css`, `assets/cover.webp` (ilustrasi Flow yang sudah ada: [kelas4-bahasa-indonesia-b03-ide-pokok.webp](../../content/materi/kelas4/kelas4-bahasa-indonesia-b03-ide-pokok.webp), T-119d), `transcript.txt`, `material.json`.
- [dev-catalog.mjs](../../scripts/dev-catalog.mjs) â entri ketiga (`publishedAt` 2026-10-28T03:00:00Z, jadi tampil paling atas).

**Keputusan desain:**
1. **Pola interaksi ketiga** â memilah (pilih kategori, dapat alasan, akhiri dengan skor) membuktikan `progress` bisa berasal dari jumlah butir terjawab, bukan timer atau satu tombol.
2. **Kelas 4 Bahasa Indonesia** â kelas dan mapel berbeda dari dua materi sebelumnya sehingga filter katalog punya tiga sampel berbeda.
3. **Kartu soal disembunyikan saat ringkasan** â percobaan pertama membiarkan judul âPernyataan 6 dari 6â di atas teks âLatihan selesai.â; itu menyesatkan, jadi kartu soal kini hilang dan hanya kartu hasil yang tampil.
4. **Fokus hanya saat berpindah soal** â memfokuskan pernyataan pada muat pertama memunculkan cincin fokus tanpa alasan; fokus programatik kini hanya pada `Lanjut`/`Ulangi`.

**Cacat yang ditemukan & diperbaiki:** `relabelTitle()` menulis `cardTitle.textContent` sehingga `<span id="counter">` dan `<span id="total">` terlepas dari dokumen â penghitung soal hilang dan tidak ada yang menyadarinya dari tampilan. Ditemukan karena probe DOM mengembalikan `null` untuk `#counter`; perbaikannya membuang penulisan judul dan hanya mengubah isi span. Selain itu `button:disabled { opacity: .6 }` membuat tombol jawaban benar/salah tampak pudar; opasitas kini hanya untuk tombol tanpa `data-state`.

**Verifikasi aktual:** `npm run catalog:dev` â 3 bundel; `fakta-opini-kelas4` 121.371 B sha256 `edc443c4bf52â¦`, tanda tangan sah, 5/5 berkas cocok hash; `/v1/materials` â 3 item, filter kelas 4 dan mapel bahasa-indonesia â 1, unduhan ZIP 200 (121.371 B); keadaan awal/terjawab/ringkasan dirender Chrome headless dengan klik mouse CDP sungguhan (`5 dari 6 benar`, satu jawaban sengaja salah) dan 360 px tanpa luberan; `npm test` 124/124 + fixture 4/4 + katalog 336/336 + binding PASS.

**Batasan jujur:**
1. Belum dipasang lewat UI aplikasi di sesi ini; jalur pasang terbukti lewat E2E dengan bundel lain.
2. Cover memakai ilustrasi Flow yang sudah ada (dipinjam dari paket b03 ide pokok), bukan ilustrasi khusus materi ini; **UI belum menampilkan cover bundel** di katalog maupun daftar terpasang, jadi penggantian ini baru terlihat di manifest/ZIP.
3. Skor hanya di memori (`material_progress` belum ada); menutup penampil menghapusnya.
4. Enam butir tetap, tanpa pengacakan urutan.
5. `materialId`/`publishedAt` diatur manual di skrip demo, bukan keluaran editor platform.

**Sisa:** materi keempat+ lewat `MATERIALS` Â· **tampilkan cover bundel di UI** (kartu katalog, daftar terpasang, kartu sematan Beranda â butuh URL aset materi + `img-src` untuk origin `ifp-content`) Â· ilustrasi khusus topik via Flow bila percobaan generate berikutnya lolos Â· `material_progress` Â· sisa daftar T-117.

### Cover Bundel di UI Katalog (2026-10-28, T-120)

**Status:** baris katalog daring dan daftar materi terpasang kini menampilkan **cover bundel** sebagai thumbnail 96Ã64, bukan lagi kotak inisial saja. Masih prototipe terhadap server katalog referensi lokal.

**Yang diubah:**
- [material.rs](../../src-tauri/src/material.rs) â `MAX_COVER_BYTES` 2 MB, `sniff_image`, `image_data_url`, `cover_data_url` (baca `material.json`, pastikan cover berada di dalam akar bundel).
- [material_install.rs](../../src-tauri/src/material_install.rs) â `material_installed_cover` (versi aktif dari `material_install`).
- [material_catalog.rs](../../src-tauri/src/material_catalog.rs) â `cover_url` pada item mentah, `cover_from_catalog`, `download_cover`, command `material_catalog_cover`; `coverUrl` ikut dikosongkan di baris cache.
- [lib.rs](../../src-tauri/src/lib.rs) â registrasi dua command.
- [mock-catalog-server.mjs](../../scripts/mock-catalog-server.mjs) â rute `/covers/` + `coverUrl` pre-signed; [dev-catalog.mjs](../../scripts/dev-catalog.mjs) menyalin cover ke `.tmp-catalog/covers/`.
- [materialRepository.ts](../../src/data/materialRepository.ts) + [MaterialCover.tsx](../../src/components/material/MaterialCover.tsx) baru + [ContentScreen.tsx](../../src/screens/ContentScreen.tsx).
- [MATERIAL_BUNDLE_CONTRACT.md](../content/MATERIAL_BUNDLE_CONTRACT.md) Â§6 â `coverUrl` opsional: pre-signed 10 menit, thumbnail saja, **tidak** diverifikasi tanda tangan (sama seperti judul/ringkasan), tidak di-cache, kegagalan tidak merusak daftar, server lama tanpa field ini tetap sah.
- [material-catalog.mjs](../../scripts/e2e/scenarios/material-catalog.mjs) â fixture `coverDir` + 2 asersi cover.

**Keputusan desain:**
1. **Data URL dari Rust, bukan URL mentah di `<img>`** â CSP `img-src` tidak perlu dilonggarkan ke origin katalog, dan pre-signed URL tetap tidak disimpan (OD-12). Biayanya Â±33% memori renderer per cover.
2. **Magic bytes + batas 2 MB di kedua jalur** â cover bundel terpasang dan cover katalog diperlakukan sama; berkas non-gambar atau kebesaran diabaikan, bukan jadi galat.
3. **Cover tidak terikat tanda tangan item** â konsisten dengan judul/ringkasan yang juga belum; dinyatakan di kontrak agar tidak menimbulkan klaim integritas yang salah.
4. **Kegagalan cover tidak boleh merusak daftar** â `Ok(None)` lalu fallback inisial mapel.
5. **Cache di tingkat modul** â ganti filter atau render ulang tidak mengunduh ulang, tetapi cache hilang saat renderer dimuat ulang (bukan penyimpanan permanen).

**Verifikasi aktual:** `npx tsc --noEmit` bersih Â· `npm run build` exit 0 (9,60 dtk) Â· `cargo test --lib` **116/116** (4 test cover baru) Â· `npm test` **124/124** (17 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `npm run a11y` **18/18** (0 error, 7 warning) Â· E2E `material-catalog` **10/10** (dua asersi cover: kartu katalog `img[data-material-cover]` `data:image/png;base64,` + `naturalWidth > 0`, dan baris terpasang setelah pemasangan), `material-import` 12/12, `smoke` 8/8. Screenshot `katalog-daring.png` (360 px, CDP) diperiksa.

**Batasan jujur:**
1. Cover katalog kosmetik dan tidak terverifikasi â server bisa menyajikan gambar lain tanpa terdeteksi.
2. `coverUrl` hanya ada di server referensi lokal; belum ada endpoint/bucket produksi.
3. Kartu sematan Beranda dan header penampil **masih gradien**; hanya dua daftar di layar Konten yang memakai cover.
4. Cache cover hidup selama sesi renderer; tidak ada LRU atau batas jumlah.
5. Hanya WebP/PNG/JPEG â¤ 2 MB.
6. Belum diuji dengan katalog berisi puluhan item bergambar (biaya memori data URL belum diukur).

**Sisa:** cover di kartu sematan Beranda + header penampil Â· `coverUrl` di `/v1/materials` produksi + bucket Â· batas ukuran cache cover (LRU) Â· ilustrasi khusus topik lewat Flow Â· `material_progress` Â· sisa daftar T-117. `reviewStatus` tetap `draft` semua paket.

### Cover Bundel di Kartu Sematan Beranda (2026-10-29, T-121)

**Status:** kartu sematan materi di tab âMateri disematkanâ Beranda kini menampilkan **cover bundel** selebar kartu (rasio 16:9) dengan lencana kecil `Materi HTML5` di sudut kiri atas â bukan lagi kotak gradien dengan label di tengah. Ini menutup butir batas T-120 #3 untuk Beranda (header penampil masih gradien).

**Yang diubah:**
- [HomeScreen.tsx](../../src/screens/HomeScreen.tsx) â cabang kartu `material` memakai `MaterialCover` (`source={{ kind: "installed", materialId }}`, `fallbackLabel` = label mapel pertama) di dalam pembungkus `relative` ber-rasio 16:9; label `Materi HTML5` jadi `<span>` absolut `pointer-events-none` di atas cover.
- [MaterialCover.tsx](../../src/components/material/MaterialCover.tsx) â `rounded-control` dihapus dari pembungkus: radius menjadi tanggung jawab pemanggil agar gambar bisa rata tepi di dalam `<li className="rounded-card overflow-hidden">`.
- [ContentScreen.tsx](../../src/screens/ContentScreen.tsx) â dua pemakaian (baris katalog daring + daftar materi terpasang) diberi `rounded-control` eksplisit; tampilan tidak berubah.
- [material-pin.mjs](../../scripts/e2e/scenarios/material-pin.mjs) â asersi cover baru (`img[data-material-cover]`, `data:image/png;base64`, `naturalWidth > 0`) dan `cover` masuk ke `materialCardState`.

**Keputusan desain:**
1. **Label teks dipertahankan** sebagai lencana di atas cover: `material-pin.mjs` dan identitas visual kartu bergantung pada teks âMateri HTML5â; menghapusnya berarti kehilangan penanda jenis materi.
2. **Radius dipindah ke pemanggil**, bukan `rounded-none` di className: urutan kelas Tailwind tidak menjamin `rounded-none` menang atas utilitas tema `rounded-control`, sedangkan komponen tanpa radius selalu bisa ditimpa pemanggil.
3. **Sumber `installed`, bukan `catalog`** â Beranda hanya menampilkan sematan materi yang sudah terpasang, sehingga cover dibaca dari bundel lokal (tanpa jaringan, tanpa pre-signed URL).
4. **Kegagalan cover tetap aman** â fallback inisial mapel dari `MaterialCover` sudah ada, lencana tetap tampil.

**Verifikasi aktual:** `npx tsc --noEmit` bersih Â· `npx vite build` exit 0 (9,46 dtk) Â· `npm test` **124/124** (17 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `npm run a11y` **18/18** (0 error, 7 warning) Â· E2E `material-pin` **12/12** (cover 640 px, data URL PNG), `material-catalog` **10/10**, `home-catalog` **29/29**, `pinned-materials` **16/16**, `smoke` **8/8**. Screenshot `.tmp-e2e/2026-10-28T19-57-46-430Z/beranda-sematkan-materi.png` diperiksa.

**Batasan jujur:**
1. Header penampil materi (`MaterialViewer`) **masih gradien** â belum memakai cover.
2. Kartu sematan tidak mengukur ulang saat cover gagal di tengah jalan; fallback hanya muncul bila unduhan/baca berkas gagal sejak awal (`onError`).
3. Sama seperti T-120: cover tidak terikat tanda tangan item; hanya WebP/PNG/JPEG â¤ 2 MB; data URL Â±33% lebih besar di memori renderer.
4. Verifikasi visual memakai tangkapan WebView 360 px dari E2E; tampilan jendela lebar (â¥1280 px, grid tiga kolom) tidak ditangkap ulang pada sesi ini.

**Sisa:** cover di header penampil Â· `coverUrl` di `/v1/materials` produksi + bucket Supabase Â· LRU cache cover Â· `material_progress` Â· jalur pasang-ulang versi sama Â· sisa daftar T-117. `reviewStatus` tetap `draft` semua paket.

### Studio Materi â Editor Bundel HTML5 di Aplikasi (2026-10-29, T-122)

**Status:** langkah 1 Â§11 [MATERIAL_BUNDLE_CONTRACT.md](../content/MATERIAL_BUNDLE_CONTRACT.md) kini punya antarmuka. Layar **Studio Materi** (grup âkelolaâ, hanya mode admin) memungkinkan guru menulis materi HTML5 dari dalam aplikasi tanpa alat eksternal: pilih kerangka (`eksplorasi` âEksplorasi berpoinâ atau `kuis` âKuis pilihan gandaâ) â sunting berkas â pasang cover (dari disk **atau** dari 336 aset katalog) â isi metadata â pemeriksaan mandiri kontrak â pratinjau lewat penampil materi â ekspor **folder sumber + ZIP tanpa `.sig`**, yang lalu ditandatangani di luar aplikasi dan dipasang lewat layar Konten. Satu skenario E2E membuktikan seluruh rantai itu: draft hasil Studio diekspor, ditandatangani `scripts/material-pack.mjs`, dipasang sebagai materi nyata, dan terbuka di penampil dengan cover-nya.

**Yang diubah:**
- [material_author.rs](../../src-tauri/src/material_author.rs) (baru, 1.505 baris) â 12 perintah Tauri (`material_draft_templates/create/list/read/file_write/asset_add/file_delete/manifest_set/check/open/export/delete`), dua kerangka, batas 512 KiB teks Â· 8 MiB aset Â· 200 berkas Â· 50 MB total, penolakan rujukan eksternal saat **menyimpan** dan saat **memeriksa**, hash berkas dihitung ulang di Rust setiap mutasi, pratinjau memakai `material::open_material` (tanpa jalur baru), ekspor menulis folder sumber + ZIP dan menolak menimpa hasil sebelumnya.
- [0013_material_draft.sql](../../src-tauri/src/migrations/0013_material_draft.sql) (baru) + [db.rs](../../src-tauri/src/db.rs) â tabel indeks `material_draft` ( kunci `material_id`+`version`); isi tetap di disk, dan **tidak pernah** menjadi baris `material_install`.
- [material_install.rs](../../src-tauri/src/material_install.rs) â pemasangan bundel yang menabrak draft ditolak (`MATERIAL_INVALID`) karena keduanya menempati `materials/<id>/<version>/`.
- [material-templates/](../../src-tauri/material-templates) (baru) â `eksplorasi/` dan `kuis/` masing-masing `index.html` + `assets/app.js` + `transcript.txt`, plus `style.css` dan `cover-placeholder.png` bersama.
- [materialStudioRepository.ts](../../src/data/materialStudioRepository.ts) (baru, 207 baris) â 12 pembungkus `invoke` (semua field opsional dikirim `null` karena `deny_unknown_fields`), dialog pilih folder ekspor, pembaca cover (FileReader data URL dan unduh dari katalog dengan `bytesToBase64` per 32 KB).
- [StudioScreen.tsx](../../src/screens/StudioScreen.tsx) (baru, 515 baris) + [src/components/studio/](../../src/components/studio) (`ui.ts`, `DraftCodePanel`, `DraftMetaPanel`, `DraftAssetPanel`, `DraftCheckPanel`, `DraftExportPanel`) â daftar draft, formulir pembuatan, tab Berkas/Metadata/Aset/Pemeriksaan/Ekspor, hapus dengan konfirmasi ketik.
- [navigation.ts](../../src/navigation.ts) Â· [App.tsx](../../src/App.tsx) Â· [navigation.test.ts](../../src/navigation.test.ts) Â· [a11y.mjs](../../scripts/e2e/scenarios/a11y.mjs) â `studio` masuk daftar layar grup âkelolaâ (9 item), uji izin dua mode, dan langkah audit a11y baru.
- [material-studio.mjs](../../scripts/e2e/scenarios/material-studio.mjs) (baru, 442 baris) â skenario E2E 23 asersi + `npm run e2e:studio` ([package.json](../../package.json)).
- [ui.ts](../../src/components/studio/ui.ts) â `controlClass` diberi `min-h-11` setelah audit a11y menemukan 7 kontrol Studio (input 38 px, select 39 px) di bawah target sentuh 44 px; angka warning reflow turun dari 15 kembali ke 8.

**Keputusan desain:**
1. **Tanpa dependensi baru** â editor kode memakai `<textarea>` + pemilih berkas, bukan Monaco/CodeMirror. Menambah paket butuh persetujuan terpisah (Â§0.7 G5), dan kontraknya tetap terbaca tanpa highlight sintaks.
2. **Draft memakai layout folder yang sama dengan bundel terpasang** (`<data_dir>/materials/<id>/<version>/`) sehingga pratinjau berjalan lewat `ifp-content://` tanpa perubahan CSP atau jalur pembaca baru.
3. **Tanda tangan tetap di luar aplikasi** â panel ekspor hanya menampilkan perintah `scripts/material-pack.mjs`; kunci privat tidak pernah masuk aplikasi dan ZIP keluaran Studio sengaja tanpa `.sig`.
4. **UI tidak dipercaya soal hash** â setiap perintah berkas/aset/manifest menghitung ulang `manifest.files` dari disk di Rust, jadi manifest usang atau berkas yang diganti diam-diam tertangkap sebagai galat pemeriksaan.
5. **Self-containment ditegakkan saat menyimpan**, bukan hanya saat pemeriksaan: rujukan `http(s)://` ditolak dengan pesan `Berkas {path} memuat rujukan eksternal ({pattern}).`, sehingga penulis tidak bisa menyunting berjam-jam lalu gagal di akhir.
6. **Proteksi dua arah antara draft dan materi terpasang** â draft tidak dapat dibuat di atas versi yang sudah terpasang, dan instalasi tidak dapat menimpa draft.
7. **Pemeriksaan mandiri tidak menaikkan status apa pun** â ia tetap menagih review manusia dan tidak menyentuh `reviewStatus`/`releaseState`.

**Verifikasi aktual:** `cargo test` **122/122** (EXIT 0; 6 unit test baru di `material_author.rs`) Â· `npx tsc --noEmit` bersih (EXIT 0) Â· `npm test` **124/124** (17 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `npx vite build` EXIT 0 (18,75 dtk â diulang setelah perbaikan tinggi kontrol) Â· E2E `material-studio` **PASS 23 pemeriksaan** Â· `npm run a11y` **19/19** (0 error; Studio Materi sendiri 0 error 0 warning, sisa 8 warning adalah target sentuh 24 px breadcrumb âBerandaâ yang sudah ada sejak sebelum T-122) Â· regresi `smoke` 8/8, `material-import` 12/12, `material-pin` 12/12, `material-catalog` 10/10, `home-catalog` 29/29, `pinned-materials` 16/16.

**Cacat uji ditemukan & diperbaiki:** `material-studio` gagal pada percobaan kedua dengan `Kerangka draft hanya 0, harus â¥ 2` â skenario menghitung `<option>` sesaat setelah form muncul, padahal daftar kerangka datang dari `invoke` asinkron. Diperbaiki dengan `waitFor` pada jumlah opsi â¥ 2 sebelum dibaca (bug test, bukan bug produk), lalu skenario lolos penuh 23/23.

**Batasan jujur:**
1. **Unggah cover dari disk dan pemilihan folder ekspor memakai dialog native** â keduanya terbukti lewat unit test Rust dan `invoke` langsung di skenario E2E, **bukan** lewat klik pada dialog native; harness E2E tidak dapat mengotomasi pemilih berkas sistem.
2. Editor tanpa highlight sintaks, tanpa lint, tanpa multi-cursor, dan tanpa pratinjau langsung HTML â putaran sunting tetap harus lewat pemeriksaan + pratinjau.
3. Batas keras tanpa mekanisme pecah: 512 KiB per berkas teks, 8 MiB per aset, 200 berkas, 50 MB total bundel.
4. Hasil ekspor belum bisa dipublikasikan â `/v1/materials` produksi, bucket katalog, dan penandatanganan saat publish belum ada, jadi materi hasil Studio hanya terpasang lokal lewat layar Konten.
5. `check_draft` hanyalah validator kontrak Â§4/Â§10; ia tidak menilai mutu pedagogik dan tidak mengganti reviewer manusia.
6. Rust di HEAD tidak dirapikan rustfmt; perubahan T-122 ditulis mengikuti gaya berkas sekitar (3 berkas Rust = 34 baris tambah). `cargo fmt` penuh sengaja **tidak** dijalankan agar commit tidak mengaduk 18 berkas lain.

**Sisa:** tanda tangan + publish otomatis (tahap 3b: `/v1/materials` Worker, bucket Supabase, `bundleSha256` di `material_install`) Â· `material_progress` + LRU 2 GB (tahap 4) Â· cover di header penampil Â· validator pascak-publish + alur `reviewStatus` untuk materi hasil Studio Â· peningkatan editor (highlight/lint) bila dependensi baru disetujui. `reviewStatus` seluruh paket tetap `draft`.

### Sisi Platform Katalog Materi â Worker publish + katalog + pre-signed (2026-10-29, T-123)

**Status:** tahap **3b sisi platform selesai sebagai kode**. Worker kini punya tiga endpoint materi, penandatanganan Ed25519 di server, dan tabel katalog. **Belum terpasang di produksi** â deploy, DDL, bucket, dan secret adalah aksi pemilik project.

**Yang diubah:**
- [materials.ts](../../workers/api/src/materials.ts) (baru, Â±660 baris) â `handleMaterials` (GET `/v1/materials`: filter Â§6 `grade|subject|cursor|limit`, hanya `reviewed|approved` untuk publik, `draft` hanya untuk pemanggil `ADMIN_API_TOKEN` (OD-10), `generatedAt` stabil dari queries terpisah, ETag atas payload tanpa URL pre-signed + 304, `cache-control: public, max-age=300`), `handleMaterialPublish` (multipart `manifest|bundle|cover`; Â§4 â batas 50 MB â pembaca Central Directory ZIP â `bundle_sha256` â tolak `409 MATERIAL_VERSION_CONFLICT` bila versi sama isinya beda (Â§11.6) â unggah Storage â upsert `on_conflict=material_id,version` â **baca ulang baris lalu tanda tangan manifest sebagaimana tersimpan di jsonb** â PATCH `key_id|signature`), `handleMaterialUnpublish` (menandai `unpublished_at`, baris tidak dihapus). Bucket default `material-bundles`, TTL URL dijepit 60â900 dtk default 600 (OD-12), kegagalan URL bundel = 502 sedangkan kegagalan URL cover hanya menghilangkan `coverUrl`, baris tanpa signature tidak pernah disajikan.
- [materialManifest.ts](../../workers/api/src/materialManifest.ts) (baru) â port Zod v4 dari Â§4: `strictObject` (field tak dikenal ditolak) + pass semantik terpisah (`entry` literal, `keyboardNavigable` wajib true, `hasAudio â captionsPath`, keunikan `gradeLevels|subjects`, tipe cover/transkrip, cek `files[]` per path + mediaType vs ekstensi + bytes + sha256, larang `material.json` di `files[]`, duplikat case-insensitive).
- [index.ts](../../workers/api/src/index.ts) â `Env extends LicenseEnv, MaterialsEnv` + tiga rute `/v1/materials*` sebelum fallthrough 404.
- [0004_material_catalog.sql](../../supabase/migrations/0004_material_catalog.sql) (baru, **belum dijalankan**) â tabel `public.materials` kunci `(material_id, version)`, `review_status` enum, `size_bytes â¤ 52428800`, `bundle_sha256 ~ ^[0-9a-f]{64}$`, `manifest jsonb`, `unpublished_at`, indeks urutan katalog + GIN `grade_levels|subjects`, RLS aktif tanpa policy publik, grant hanya `service_role`.
- [material-pack.mjs](../../scripts/material-pack.mjs) â `buildBundle()` dipisah dari `packBundle()` (ZIP + manifest final tanpa tanda tangan) supaya penerbit tidak perlu kunci privat. **Perubahan netral secara perilaku**: `npm run catalog:dev` pasca-refactor menghasilkan ZIP dengan sha256 identik untuk ketiga bundel demo (`0a6765c1e54fâ¦`, `6c14a97430d8â¦`, `f7c52c954e5dâ¦`).
- [material-publish.mjs](../../scripts/material-publish.mjs) (baru) + `npm run material:publish` â penerbit CLI: `--source <folder>` (+ `--cover`, `--api`) dan `unpublish --material-id --version`. `ADMIN_API_TOKEN` **hanya** dari environment, tidak pernah dibaca dari berkas dan tidak pernah dicetak; kunci konten tidak pernah disentuh skrip.
- [materials.test.ts](../../workers/api/src/materials.test.ts) (baru, 18 test) â kunci item = persis 10 field `RawItem` Rust, filter anonim vs admin, filter kelas/mapel, penolakan query, ETag stabil + 304, baris unsigned tak disajikan, `coverUrl` hilang saat cover dinonaktifkan, round-trip cursor, verifikasi Ed25519 atas `canonicalJson(manifest)`, gerbang admin, pelanggaran Â§4, ZIP berkas tambahan, konflik versi, jalur publish penuh, unpublish.
- Dokumentasi: [README Worker](../../workers/api/README.md) (tabel endpoint + bagian âMateri HTML5â + daftar secret/vars), [wrangler.toml](../../workers/api/wrangler.toml) (`CONTENT_KEY_ID`/`CONTENT_BUCKET`/`MATERIAL_URL_TTL_SECONDS` + secret `CONTENT_SIGNING_KEY`), [.dev.vars.example](../../workers/api/.dev.vars.example), [MATERIAL_BUNDLE_CONTRACT.md Â§13](../content/MATERIAL_BUNDLE_CONTRACT.md), [ADR-0035](../decisions/ADR-0035-online-html5-materials.md) tahap 3b.

**Keputusan desain:**
1. **Tanda tangan di atas manifest hasil baca ulang, bukan kiriman klien** â jsonb bisa menormalkan bentuk; yang ditandatangani harus byte-identik dengan yang nanti dikirim ke perangkat.
2. **Struktur ZIP diperiksa lewat Central Directory** tanpa mendekompresi â material v1 disimpan STORE, jadi `uncompressedSize` tiap entri bisa dibandingkan langsung dengan `files[].bytes`, dan berkas tak terdaftar (vektor XSS) tertolak meski manifestnya sah.
3. **ETag dihitung sebelum URL pre-signed dipasang** â kalau tidak, setiap halaman dapat URL berbeda dan 304 tidak pernah terjadi.
4. **Cover bersifat kosmetik** â kegagalannya tidak boleh menghilangkan materi dari katalog; kegagalan URL bundel tetap 502 karena tanpa itu kartu tidak bisa dipasang.
5. **Unpublish = penanda, bukan delete** â riwayat `bundle_sha256` per versi harus bertahan supaya Â§11.6 tetap bisa menegakkan âversi sama, isi berbedaâ.

**Verifikasi aktual:** `npx vitest run workers/api/src/materials.test.ts` **18/18** (EXIT 0) Â· `npm run worker:typecheck` bersih (EXIT 0) Â· `npm test` **142/142** (18 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `npm run catalog:dev` ulang: hash ZIP tidak berubah Â· pemeriksaan alur nyata `.tmp-publish/check.ts` (gitignored, Supabase ditiru di proses yang sama): CLI menerbitkan `fakta-opini-kelas4` â EXIT 0, dua objek terunggah (`bundle.zip`, `cover.webp`), satu baris tersimpan, **tanda tangan Ed25519 terverifikasi atas manifest tersimpan**, katalog mengembalikan 1 item dengan kunci `materialId,version,publishedAt,updatedAt,sizeBytes,bundleSha256,downloadUrl,signature,material,coverUrl` dan URL pre-signed.

**Cacat uji ditemukan & diperbaiki:** fixture ZIP `buildZip()` memakai `{name,text}` sementara sumbernya `FILES` berbentuk `{path,text}`, sehingga 4 entri tersalin bernama `undefined` â publish mengembalikan 400 (berkas manifest tidak ada di ZIP) dan test pembaca Central Directory gagal karena fixture `zip` dideklarasikan di dalam satu `describe` tetapi dipakai `describe` lain. Diperbaiki dengan `ZIP_ENTRIES` di cakupan modul (`FILES.map` â `name`) dan pemindahan `zip` ke cakupan yang sama; test lain tidak diubah.

**Batasan jujur:**
1. **Tidak ada satu pun yang terpasang di produksi.** Migrasi 0004 belum dijalankan, bucket `material-bundles` belum dibuat, secret `CONTENT_SIGNING_KEY`/`ADMIN_API_TOKEN` belum di-put, Worker belum di-deploy. `wrangler` juga **bukan dependensi repo** (dipakai lewat `npx`), jadi langkah dev/deploy ada di tangan pemilik project.
2. **Perangkat belum bisa memverifikasi tanda tangan Worker** â `MaterialKeyring::from_env()` hanya membaca `IFP_CONTENT_KEYS`; belum ada kunci konten produksi yang dibakar ke build aplikasi, dan kunci itu harus dibuat lebih dulu (OD-11: publik key pasangan, rilis aplikasi mendahului pemakaian `keyId` baru).
3. **Pemeriksaan alur end-to-end memakai Supabase yang ditiru di proses Node**, bukan Supabase sungguhan â bentuk request Storage/REST mengikuti `supabase.ts` dan kontrak, tapi belum dibuktikan terhadap service nyata.
4. **Worker tidak menilai siapa yang menaikkan `reviewStatus`.** Publish menerima `reviewStatus` dari manifest dan menyimpannya apa adanya; pemalsuan `reviewed` oleh pemegang `ADMIN_API_TOKEN` tidak tercegah â alur reviewer manusia (Â§11 langkah 3) masih terbuka.
5. Tanpa `Content-Encoding`/kompresi untuk payload katalog; baliknya kecil (< 100 item) tapi belum diukur terhadap batas respons Worker.

**Sisa:** jalankan 0004 + buat bucket + `wrangler secret put` + deploy + bakar publik key ke build Â· `material_progress` + LRU 2 GB (tahap 4) Â· `bundleSha256` di `material_install` Â· alur `reviewStatus` reviewer Â· uji `material-catalog` E2E terhadap Worker yang sudah ter-deploy.

### Editor Blok HTML5 â Tab âSusunâ di Studio Materi (2026-10-29, T-124)

**Status:** Studio sekarang punya editor visual di samping editor kode. Tab **Susun** menyusun materi dari langkah dan blok â teks (paragraf, catatan, kutipan, daftar poin), gambar, efek visual, dan efek suara â lalu menulis ulang `index.html`, `assets/style.css`, dan `assets/app.js` secara deterministik. Naskahnya sendiri disimpan di dalam `index.html` sebagai blok `<script type="application/json" id="ifp-scene">`, jadi bundel tetap satu berkas mandiri dan isinya masih terbaca oleh tab Kode.

**Yang diubah:**
- [sceneModel.ts](../../src/components/studio/sceneModel.ts) (baru) â tipe `Scene`/`SceneStep`/`TextBlock`/`ImageBlock`, batas 20 langkah Â· 12 blok/langkah Â· 1.200 karakter teks, `parseScene` toleran untuk naskah rusak, `sceneIssues` yang memeriksa judul, teks kosong, gambar hilang dari draft, teks alternatif wajib, dan alamat web di dalam teks.
- [sceneRender.ts](../../src/components/studio/sceneRender.ts) (baru) â `renderIndexHtml`, `renderStyle`, `renderRuntime`, `renderPreviewDocument`, `extractSceneDocument`. Markup langkah dirender statis (bukan dari JS) supaya isi terbaca meski skrip gagal; runtime hanya mengatur langkah aktif, efek, dan suara. Runtime memakai protokol `ifp` yang sama dengan kerangka bawaan (`ready`/`progress`/`complete`/`request-exit`, menjawab `config`), menghormati `reducedMotion`, dan menambahkan navigasi panah/Home/End.
- [DraftScenePanel.tsx](../../src/components/studio/DraftScenePanel.tsx) (baru) â judul halaman, tema (cerah/tenang/petualangan), daftar langkah (tambah/duplikat/naik/turun/hapus), editor blok (pindah/hapus), pemilih gambar dari aset draft atau unggah berkas, pratinjau susunan di iframe, dan tombol **Terapkan ke materi** yang terkunci sampai naskah valid dan kotak âsaya mengertiâ dicentang.
- [StudioScreen.tsx](../../src/screens/StudioScreen.tsx) â tab `scene` âSusunâ sebagai tab pertama.
- [DraftCodePanel.tsx](../../src/components/studio/DraftCodePanel.tsx) â **perbaikan bug**: buffer editor tidak lagi menyimpan isi lama setelah panel lain menulis berkas yang sama. Sebelumnya, menekan Simpan di tab Kode setelah tab Susun menulis ulang `index.html` mengembalikan isi lama tanpa peringatan (ditemukan lewat E2E, bukan lewat tinjauan kode). Buffer hanya disegarkan bila belum ada suntingan lokal.
- [sceneRender.test.ts](../../src/components/studio/sceneRender.test.ts) (baru, 10 test) â tulis-baca naskah tanpa kehilangan isi, teks `</script>` tidak memutus blok JSON, tiga berkas bebas `http(s)://`/`fetch(`/`window.open`/WebSocket, atribut gambar + alt, pratinjau memakai CSS sebaris, runtime memuat protokol `ifp`, dan validasi naskah.
- [material-studio.mjs](../../scripts/e2e/scenarios/material-studio.mjs) â langkah E2E baru: tab Susun â buat naskah â isi dua langkah â tambah blok gambar + teks alternatif â terapkan â periksa `index.html` di disk (2 `<article class="step">`, `data-effect="konfeti"`, `data-sound="bel"`, `src`/`alt` gambar, tanpa rujukan luar) â tangkapan layar `studio-susun.png`; ditambah asersi bahwa tab Kode memuat ulang isi baru (regresi bug di atas).

**Keputusan desain:**
1. **Naskah tinggal di dalam `index.html`, bukan berkas JSON terpisah** â CSP materi memakai `connect-src 'none'`, jadi `fetch` berkas JSON akan diblokir; blok JSON inert di HTML bisa dibaca ulang tanpa jaringan dan tanpa menambah tipe berkas yang boleh disunting Rust.
2. **Efek suara disintesis WebAudio, bukan berkas audio** â tidak ada CDN, tidak ada aset biner, dan `accessibility.hasAudio` tetap `false` sehingga kewajiban `captionsPath` tidak dipicu oleh bunyi penanda antarmuka. Audio narasi tetap lewat tab Aset + tab Kode.
3. **Markup statis, bukan dirender runtime** â pembaca layar dan mode tanpa skrip tetap mendapat isi; runtime hanya menyalakan efek.
4. **Kotak persetujuan sebelum menimpa** â tab Susun menulis tiga berkas milik kerangka; penimpaan harus disengaja. Panel juga memvalidasi sebelum menulis sehingga berkas tidak pernah setengah jadi karena satu blok kosong.
5. **Tanpa dependensi baru** â tidak ada library editor, animasi memakai CSS keyframes, suara memakai `AudioContext` bawaan.

**Verifikasi aktual:** `npx tsc --noEmit` bersih (EXIT 0) Â· `npm test` **152/152** (19 berkas; 10 test baru) + fixture 4/4 + katalog 336/336 + binding PASS Â· `npx vite build` EXIT 0 (20,45 dtk) Â· E2E `material-studio` **PASS 24 pemeriksaan** (sebelumnya 23) termasuk langkah Susun dan regresi buffer Kode Â· `npm run a11y` **19/19** (0 error; 8 warning lama target sentuh breadcrumb) Â· tangkapan layar: `studio-susun.png` (panel), `studio-preview.png` (materi hasil susunan tampil di penampil: judul, langkah 1/2, progres 50%, tombol).

**Cacat ditemukan & diperbaiki saat verifikasi:** E2E gagal dua kali sebelum hijau. (a) Tombol Terapkan terkunci karena kotak persetujuan belum dicentang â perilaku disengaja, skenario yang kurang; (b) **bug produk**: pratinjau menampilkan isi kerangka lama karena tab Kode menyimpan buffer basi lalu menimpanya saat disimpan. Diperbaiki dengan penyegaran buffer berbasis baseline + ref, plus asersi E2E agar tidak kembali.

**Batasan jujur:**
1. Belum ada blok audio berbasis berkas: audio narasi harus lewat tab Aset + tab Kode, dan pembaca tidak bisa memilih berkas suara dari panel Susun.
2. Belum ada undo/redo, drag-and-drop, atau penyuntingan gaya per blok (warna, ukuran, tata letak) â hanya gaya teks bawaan dan tiga tema.
3. Naskah hanya hidup selama blok JSON di `index.html` masih ada; menulis ulang `index.html` dari luar (mis. di tab Kode menghapus blok itu) menghilangkan naskah, dan panel akan menawarkan mulai dari nol.
4. Pratinjau susunan menampilkan gambar sebagai kotak placeholder (path ikut ditulis); pratinjau sebenarnya tetap lewat tombol Pratinjau materi.
5. Efek suara butuh satu gerakan pengguna lebih dulu (kebijakan autoplay browser), jadi suara langkah pertama biasanya belum terdengar.
6. Batas keras tanpa mekanisme pecah: 20 langkah, 12 blok/langkah, 1.200 karakter per blok teks.

**Sisa:** blok audio berkas + `captionsPath` otomatis Â· undo/redo Â· gaya per blok Â· galeri efek tambahan Â· blok kuis interaktif Â· ekspor pratinjau gambar nyata. **Keempat yang pertama ditutup T-125 (di bawah).**

### Editor Susun Diperluas â Gambar Asli, Urungkan, Audio, Gaya (2026-10-29, T-125)

**Status:** menutup empat batasan T-124 yang dipilih pengguna: galeri + pratinjau gambar asli, undo/redo + sisip/duplikat blok, blok audio berkas dengan `captionsPath` otomatis, dan gaya teks/tata letak.

**Yang diubah:**
- [material_author.rs](../../src-tauri/src/material_author.rs) â perintah baru `material_draft_asset_read` (`ReadDraftAssetInput` â `DraftAssetView`): hanya gambar WebP/PNG/JPG, jenis ditentukan dari magic bytes (`sniff_image`), batas 8 MB, containment `canonicalize` terhadap root materi, path traversal ditolak lewat `validate_relative_path`. Terdaftar di [lib.rs](../../src-tauri/src/lib.rs). Unit test baru `reads_draft_image_as_data_url_and_rejects_others` (data URL sah, isi bukan gambar ditolak `VALIDATION_FAILED`, traversal ditolak `MATERIAL_INVALID`).
- [materialStudioRepository.ts](../../src/data/materialStudioRepository.ts) â `readStudioAsset` + tipe `StudioDraftAsset`.
- [sceneModel.ts](../../src/components/studio/sceneModel.ts) â `AudioBlock` (`kind: "suara"`, `path`, `label`, `caption`), gaya teks (`bold`, `italic`, `tone`, `size`, `align`), tata letak gambar (`penuh|kiri|kanan`), label-label baru, `CAPTIONS_PATH`, `sceneAudioBlocks`, `sceneImages`; validasi naskah ikut memeriksa berkas suara, label, dan alamat web di caption/label.
- [sceneRender.ts](../../src/components/studio/sceneRender.ts) â markup audio (`<audio controls>` + label + caption), kelas gaya teks dan float gambar, `renderCaptions()` (VTT: satu cue 10 detik per klip + NOTE bahwa waktunya perkiraan), `renderPreviewDocument(scene, assets)` yang menyisipkan data URL gambar asli, `renderSceneFiles()` mengembalikan `captions`.
- [DraftScenePanel.tsx](../../src/components/studio/DraftScenePanel.tsx) â galeri thumbnail aset draft (maks 24, dimuat lewat `material_draft_asset_read`), unggah gambar **dan** audio lewat input berkas, riwayat undo/redo (satu langkah per sesi ketik lewat `onFocus`, 60 langkah), sisip blok di posisi mana pun, duplikat blok/langkah, kontrol gaya teks (B/I, warna, ukuran, perataan), tata letak gambar, dan **Terapkan** kini juga menulis `assets/captions.vtt` + menyetel `accessibility.hasAudio`/`captionsPath` dari naskah.
- [material-studio.mjs](../../scripts/e2e/scenarios/material-studio.mjs) â E2E menambah: galeri memuat `data:image/`, unggah PNG + WAV lewat `DOM.setFileInputFiles`, undo struktural (langkah ketiga lalu diurungkan), dan asersi `captions.vtt` + `hasAudio` + `captionsPath`; jumlah berkas terpasang naik dari 5 ke 8.
- [sceneRender.test.ts](../../src/components/studio/sceneRender.test.ts) â 4 test baru (kelas gaya + tata letak, audio + captions, tanpa audio â tanpa captions, pratinjau memakai data URL).

**Keputusan desain:**
1. **Gambar dibaca sebagai data URL lewat perintah Rust baru**, bukan `ifp-content://` â panel berjalan di luar WebView materi dan hanya protokol materi yang memegang sandbox; data URL juga dipakai langsung di `srcdoc` pratinjau.
2. **Magic bytes, bukan ekstensi** â berkas bernama `.png` yang isinya bukan gambar ditolak; ini pola yang sama dengan cover materi.
3. **Captions dibuat dari naskah, dengan waktu perkiraan yang dinyatakan terang-terangan** â kontrak Â§4 mewajibkan `captionsPath` begitu `hasAudio` menyala; panel mengisi keduanya otomatis dan menulis NOTE di VTT bahwa cue 10 detik per klip adalah perkiraan.
4. **Undo per sesi ketik** â riwayat didorong saat kontrol difokuskan (bukan tiap ketukan), jadi Ctrl+Z/Urungkan mengembalikan satu sesi sunting, bukan satu huruf.
5. **Terapkan tetap satu pintu** â semua perubahan (termasuk manifest) hanya menulis saat Terapkan; unggahan aset tetap langsung ke draft karena itu penambahan berkas, bukan penulisan ulang materi.

**Verifikasi aktual:** `cargo test material_author` **7/7** (EXIT 0) Â· `npx tsc --noEmit` bersih Â· `npm test` **156/156** (19 berkas; 14 test scene) + fixture 4/4 + katalog 336/336 + binding PASS Â· `npx vite build` EXIT 0 (19,19 dtk) Â· E2E `material-studio` **PASS 25 pemeriksaan** (sebelumnya 24) Â· `npm run a11y` **19/19** (0 error, 8 warning lama) Â· tangkapan layar `studio-susun.png` diperiksa: panel menampilkan Urungkan/Ulangi, langkah, kontrol gaya, dan pesan âassets/captions.vtt dibuatâ.

**Cacat ditemukan & diperbaiki:** unit test Rust pertama gagal karena `invalid()` memetakan ke `VALIDATION_FAILED`, bukan `MATERIAL_INVALID` â asersi yang salah, bukan kode produk (traversal memang `MATERIAL_INVALID` lewat `validate_relative_path`).

**Batasan jujur:**
1. Waktu cue captions adalah perkiraan 10 detik per klip; durasi sebenarnya tidak dibaca dari berkas audio.
2. Galeri memuat maksimal 24 gambar pertama dan seluruhnya sebagai data URL â draft dengan puluhan gambar besar memperlambat panel.
3. Undo tidak mencakup unggahan aset (berkas langsung ditulis) dan tidak bertahan setelah naskah diterapkan atau draft dibuka ulang.
4. Efek audio blok tetap butuh gestur pengguna; pratinjau susunan menampilkan pemutar tanpa sumber karena aset hanya bisa diakses lewat protokol materi.
5. Belum ada drag-and-drop, penyuntingan gaya per kata, atau pemotongan audio.

### Contoh Materi dari Workflow Susun (2026-10-29, T-126)

**Status:** satu bundel contoh nyata dibangun **dengan penulis yang sama** yang dipakai tab Susun, bukan ditulis tangan: `src-tauri/sample-material-mengenal-huruf` â âMengenal Huruf Vokalâ (kelas 1, bahasa-indonesia), 3 langkah, 7 berkas konten, 241.898 B. Statusnya **`draft`** dan isinya lengkap; tidak lagi dipalsukan menjadi `reviewed`. Karena katalog publik menolak draft (OD-10), contoh ini **tidak** didaftarkan di katalog demo; ia disemai sebagai **draft Studio** `contoh-huruf-vokal` v1.0.0 di perangkat sehingga bisa dibuka di tab Susun dan dipratinjau seperti draft biasa.

**Isi contoh:**
- Langkah 1 âLima huruf vokalâ â teks paragraf + daftar poin (A/I/U/E/O), efek `kilau`, suara `bel`.
- Langkah 2 âDengar lalu tirukanâ â catatan, gambar `assets/cover.webp` (ilustrasi Ayu & Bima yang sudah ada di `content/packages/kelas1-bahasa-indonesia-b01-huruf-suku-kata`, dipakai ulang, bukan dibuat baru) dengan tata letak kanan, dan blok audio `assets/nada-contoh.wav` (nada 440 Hz 1 detik, label âContoh nadaâ, caption menyatakan itu bukan narasi) yang memicu `assets/captions.vtt` + `hasAudio`.
- Langkah 3 âSebutkan namamuâ â teks tebal ukuran besar rata tengah, efek `konfeti`, suara `tepuk`.
- `index.html` memuat naskah `id="ifp-scene"`, jadi contoh ini bisa dibuka di tab Susun dan disunting seperti draft biasa.

**Yang diubah:**
- [src-tauri/sample-material-mengenal-huruf/](../../src-tauri/sample-material-mengenal-huruf) (baru) â `material.json` (`reviewStatus: draft`, files kosong seperti sampel lain), `index.html`, `assets/style.css`, `assets/app.js`, `assets/captions.vtt`, `assets/nada-contoh.wav`, `assets/cover.webp`, `transcript.txt`. Berkas HTML/CSS/JS/VTT dihasilkan `renderSceneFiles()`; pembangunnya skrip sekali-pakai di `.tmp-studio/` (gitignored), bukan tool baru di repo.
- [dev-catalog.mjs](../../scripts/dev-catalog.mjs) â **tidak** didaftarkan: katalog publik menyaring `draft` (OD-10), jadi katalog demo tetap 3 item dan tidak ada draft yang menyamar sebagai materi terbit.
- **Draft Studio di perangkat:** `contoh-huruf-vokal` v1.0.0 disemai ke `%APPDATA%\id.gerbangedukasi.ifp\materials\contoh-huruf-vokal\1.0.0` + baris `material_draft` (DB dicadangkan dulu ke `.tmp-studio/backup-seed-*`). Berkas sama dengan contoh repo, hanya `materialId`/`version`/`reviewStatus` disesuaikan dan `files[]` diisi dari disk; materi terpasang lain tidak disentuh.
- [material-scene-sample.mjs](../../scripts/e2e/scenarios/material-scene-sample.mjs) (baru) + `npm run e2e:scene-sample` â skenario permanen: menandatangani contoh dengan kunci sementara, memasang lewat `material_install_bundle` (**gerbang ketat**: manifest Â§4, Ed25519, hash per berkas), memastikan muncul di layar Konten dengan cover, lalu membuka penampil dan menunggu `ready` + progres â¥ 30 (langkah 1 dari 3).

**Keputusan desain:**
1. **Dibangun dari renderer asli, bukan dikarang terpisah** â supaya contoh selalu sama dengan keluaran tab Susun; bila renderer berubah, contoh bisa dibangun ulang dengan skrip yang sama.
2. **Memakai ulang ilustrasi yang sudah ada** untuk cover dan gambar langkah, bukan membuat aset baru (tidak ada generasi gambar di sesi ini).
3. **Audio contoh diberi label jujur** (âContoh nadaâ¦ bukan narasi pelajaranâ) agar pipeline audio + captions tetap teruji tanpa menyamar sebagai narasi.
4. **Status tetap `draft` sesuai permintaan pengguna** â contoh lengkap tetapi belum direview; konsekuensinya ia tidak muncul di katalog publik, jadi jalur melihatnya adalah draft Studio (atau memasang bundelnya sendiri). Tidak ada `reviewStatus` yang dinaikkan demi tampil di katalog.

**Verifikasi aktual:** `npm run catalog:dev` menulis **3 item** (contoh draft sengaja tidak ikut) Â· `npm run e2e:scene-sample` **PASS 4 pemeriksaan** (tanda tangan 7 berkas 241.898 B, pemasang Rust menerima bundel draft, layar Konten menampilkan cover, penampil `siap` + progres â¥ 30) Â· pemeriksaan draft tersemai lewat aplikasi nyata + CDP (`.tmp-studio/verify-seeded-draft.mjs`): `material_draft_list` memuat `contoh-huruf-vokal`, `material_draft_read` 8 berkas dengan `reviewStatus: draft` + `hasAudio: true`, `material_draft_open` mengembalikan `contoh-huruf-vokal/1.0.0/index.html`, dan tab Susun memuat naskah (screenshot `studio-draft-contoh.png`) Â· `npm test` **156/156** + fixture 4/4 + katalog 336/336 + binding PASS Â· `npx vite build` EXIT 0.

**Batasan jujur:**
1. Nada contoh bukan narasi pelajaran; kalau materi ini dipakai untuk mengajar, audio perlu diganti rekaman guru dan caption disesuaikan (cue masih perkiraan 10 detik).
2. Karena `draft`, contoh **tidak muncul** di katalog/jelajah materi daring; ia hanya ada di Studio pada perangkat ini dan di repo. Materi `mengenal-huruf-vokal` yang dulu terpasang dari katalog tetap ada di perangkat sebagai salinan lama.
3. Contoh ini tidak diuji terhadap katalog Worker (belum ter-deploy) maupun Android.
4. Draft tersemai dibuat langsung di folder perangkat + baris DB (bukan lewat `material_draft_create`), jadi bila kode membuat draft berubah, skrip semai perlu disesuaikan.

**Sisa:** ganti nada contoh dengan narasi nyata + cue waktu sebenarnya Â· tambah contoh kedua yang memakai tema `petualangan` Â· uji contoh terhadap Worker setelah deploy.

### Susun Bergaya PowerPoint â Sidebar Langkah + Panel Kanan Dinamis (2026-10-29, T-127)

**Status:** panel Susun dipecah dua kolom. Daftar langkah pindah ke **sidebar kiri** dengan toggle ringkasan blok per langkah; penyunting langkah terpilih tampil **dinamis di panel kanan**. Blok di panel kanan tetap bisa dilipat lewat header-nya. Ini menggantikan akordeon T-126 (daftar langkah dan penyunting menyatu, satu langkah terbuka di tengah daftar).

**Yang diubah:**
- [DraftScenePanel.tsx](../../src/components/studio/DraftScenePanel.tsx) â grid `lg:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)]`: `<aside data-scene-steps>` kiri (sticky di layar lebar) + `<section data-scene-step-body>` kanan. Tiap baris langkah punya tombol toggle (`data-scene-step-toggle`, `aria-expanded`, chevron â¸/â¾) yang membuka `data-scene-step-outline-list` berisi ringkasan blok, dan tombol nama langkah (`data-scene-step`, `aria-current="step"`) untuk memilih. Aksi Duplikat/â/â/Hapus pindah ke header panel kanan (berlaku untuk langkah terpilih); â+ Langkahâ tetap di header sidebar.
- State: `stepOpen` (akordeon) diganti `outlineOpen: Set<string>` per id langkah; `activeStep` selalu tampil di panel kanan. Pilihan langkah hanya direset saat **pindah draft** (`draftRef`), jadi Terapkan â yang menulis ulang `index.html` dan memicu parse ulang â tidak lagi melempar pengguna ke langkah 1.
- Blok: toggle lipat (`data-scene-block-toggle` â `data-scene-block-body`) tetap ada, kini dengan `id`/`aria-controls` yang benar (dua atribut itu sempat kosong akibat patch skrip yang salah kutip).
- [material-studio.mjs](../../scripts/e2e/scenarios/material-studio.mjs) â pemeriksaan baru: toggle ringkasan langkah 2 membuka tepat 3 baris lalu menutup lagi; memilih langkah 1 menukar isi panel kanan (teks langkah 1 muncul lagi, `data-step` berubah) dan bloknya bisa dilipat; setelah Terapkan panel tetap di langkah 2. Screenshot tambahan `studio-langkah-sidebar.png`.

**Keputusan desain:**
1. **Toggle per langkah = ringkasan blok di sidebar**, bukan menyembunyikan penyunting â penyunting langkah terpilih selalu tampil di kanan, seperti PowerPoint; toggle mengatur seberapa detail sidebar, bukan apakah langkah bisa disunting.
2. **Pilihan langkah bertahan setelah Terapkan** â menekan Terapkan tidak boleh membuang posisi kerja; reset hanya saat berpindah draft.
3. **Sidebar `sticky`, bukan tinggi penuh** â kartu sidebar setinggi isinya (`lg:self-start`) supaya tidak menyisakan kotak kosong di samping penyunting yang panjang.

**Verifikasi aktual:** `npx tsc --noEmit` bersih Â· `npx vite build` EXIT 0 Â· `npm test` **156/156** (19 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `npm run e2e:studio` **PASS 26 pemeriksaan** Â· `npm run e2e:scene-sample` **PASS 4 pemeriksaan** Â· screenshot `studio-susun.png` dan `studio-langkah-sidebar.png` diperiksa: sidebar kiri memuat 2 langkah dengan chevron dan ringkasan â1. Teks Â· â¦ / 2. Gambar Â· ilustrasi.png / 3. Suara Â· Narasi siklus airâ, panel kanan berjudul âLangkah 2 dari 2â dengan kontrol vfx/sndfx dan blok teks/gambar.

**Batasan jujur:**
1. Satu langkah disunting pada satu waktu; sidebar tidak menampilkan thumbnail slide, hanya judul + jumlah blok + ringkasan teks.
2. Pada layar < `lg` susunan kembali menumpuk vertikal (sidebar di atas penyunting); `sticky` tidak aktif.
3. Ringkasan blok hanya teks, bukan pratinjau visual, dan tidak bisa disunting dari sidebar.
4. Belum ada pintasan papan tombol untuk berpindah langkah.
5. `npm run a11y` tidak dijalankan ulang: harness-nya tidak membuka Studio/draft, jadi panel ini tidak tercakup audit otomatis. Kontrol baru memakai `aria-expanded`, `aria-current="step"`, dan `aria-label` Indonesia, tetapi belum diverifikasi pembaca layar.

**Sisa:** thumbnail slide di sidebar Â· pintasan langkah Â· drag-and-drop urutan langkah Â· audit a11y khusus Studio (butuh harness yang membuat draft).

### Editor di Halaman Tersendiri + Tata Letak Tiga Zona (2026-10-29, T-128)

**Status:** membuka draft tidak lagi menumpuk editor di bawah daftar draft. Halaman daftar (header + status + form âDraft baruâ + kartu draft) tetap seperti sebelumnya; begitu draft dibuka atau dibuat, seluruh layar diganti **halaman editor** dengan header sendiri (tombol ââ Daftar draftâ, judul draft, `id Â· jumlah berkas Â· KB`, tombol âPratinjau materiâ), **toolbar tab lengket di atas**, dan isi tab selebar layar. Tab Susun ditata tiga zona: **langkah di kiri Â· penyunting + pratinjau di tengah Â· properti di kanan**, dengan toolbar aksi (Urungkan/Ulangi/Pratinjau/Terapkan) di atas ketiganya.

**Yang diubah:**
- [StudioScreen.tsx](../../src/screens/StudioScreen.tsx) â `content` kosong â halaman daftar; `content` ada â halaman editor (`data-studio-editor-card`, kunci `materialId@version`). `backToList()` mengosongkan content/report/preview/codeDirty/error; `scrollToTop()` menggulir `window` dan `#main-content` ke atas setelah buka/buat. Toolbar tab jadi `sticky top-0 z-20` dengan `bg-paper/95 backdrop-blur`; status pesan/error dipindah ke halaman daftar (`data-studio-status`). Tidak ada `ScreenId` baru dan tidak ada perubahan navigasi/mode.
- [DraftScenePanel.tsx](../../src/components/studio/DraftScenePanel.tsx) â grid `lg:grid-cols-[minmax(12rem,15rem)_minmax(0,1fr)] xl:grid-cols[â¦_minmax(15rem,19rem)]`: `data-scene-toolbar` di atas, `aside[data-scene-steps]` kiri, `section[data-scene-step-body]` tengah (header langkah + kartu pratinjau + daftar blok + tombol tambah blok), `aside[data-scene-props]` kanan (Judul langkah, vfx, sndfx, Duplikat/â/â/Hapus + âHalamanâ: judul, tema, kalimat pembuka). Semua hook `data-scene-*` lama dipertahankan.
- Pratinjau: state `preview` kini `{ html, step }`. Pratinjau pertama muncul otomatis setelah gambar draft termuat; berpindah langkah memuat ulang pratinjau ke langkah itu; setelah menyunting isinya dibiarkan (ditandai usang, tombol âMuat ulangâ) supaya iframe tidak berkedip tiap ketikan.
- [sceneRender.ts](../../src/components/studio/sceneRender.ts) â `renderPreviewDocument(scene, assets, activeIndex)` dan `renderRuntime(startIndex)` meneruskan langkah aktif ke `data-stage`, `data-active`, `data-sound`, teks status, dan `show(n)` di runtime; `renderIndexHtml`/`renderSceneFiles` tetap mulai dari langkah 1.
- [material-studio.mjs](../../scripts/e2e/scenarios/material-studio.mjs) â setelah buat draft: menunggu `[data-studio-editor-card]`, memastikan form dan daftar draft tidak ikut tampil, screenshot `studio-halaman-editor.png`, lalu ââ Daftar draftâ â draft tampil lagi â buka dari daftar. Pemeriksaan tata letak 4 panel + posisi (toolbar di atas, langkah di kiri, properti di kanan) pada lebar â¥ 1280, dan pemeriksaan pratinjau mengikuti langkah (`srcdoc` memuat `data-stage="0"` lalu `"1"`).

**Keputusan desain:**
1. **Halaman editor di dalam StudioScreen**, bukan `ScreenId` baru â tidak menambah entri navigasi atau mengubah gerbang mode; tombol kembali yang eksplisit sudah cukup.
2. **Toolbar tab lengket, toolbar Susun tidak** â dua batang lengket bertumpuk akan saling menutupi.
3. **Pratinjau tidak dirender ulang tiap ketikan** â iframe berkedip dan fokus mengetik terganggu; isi usang ditandai teks + tombol Muat ulang.
4. **Pratinjau mengikuti langkah terpilih** â pratinjau tengah harus menunjukkan halaman yang sedang disunting, bukan selalu langkah 1.

**Verifikasi aktual:** `npx tsc --noEmit` bersih Â· `npm test` **157/157** (19 berkas, +1 test pratinjau langkah aktif) + fixture 4/4 + katalog 336/336 + binding PASS Â· `npx vite build` EXIT 0 (13,74 dtk) Â· `npm run e2e:studio` **PASS 28 pemeriksaan** (`.tmp-e2e/2026-10-29T14-10-37-947Z`) Â· `npm run e2e:scene-sample` **PASS 4 pemeriksaan** Â· screenshot `studio-halaman-editor.png` (halaman editor + tombol Daftar draft + tab) dan `studio-susun.png` (toolbar atas, langkah kiri, pratinjau tengah menampilkan âLangkah 2â dengan konfeti, properti kanan) diperiksa.

**Batasan jujur:**
1. Editor bukan rute URL sendiri â memuat ulang aplikasi (atau keluar dari layar Studio) menutup draft dan kembali ke daftar.
2. Pada layar < `lg` tiga zona menumpuk vertikal (langkah â penyunting â properti); pratinjau tetap di dalam kolom tengah.
3. âMuat ulangâ pratinjau memuat iframe baru, jadi posisi gulir di dalam pratinjau kembali ke atas.
4. Belum ada indikator âbelum disimpanâ pada halaman daftar selain `data-studio-toolbar` di dalam editor.
5. `npm run a11y` tidak dijalankan ulang: harness-nya belum membuka Studio/draft, jadi halaman editor ini belum tercakup audit otomatis.

**Sisa:** rute/deep-link editor agar tahan muat ulang Â· konfirmasi saat meninggalkan editor dengan naskah belum diterapkan Â· thumbnail slide di sidebar Â· pintasan langkah Â· audit a11y khusus Studio.

### Form Buat Materi Pindah ke Dialog Modal (2026-10-29, T-129)

**Status:** halaman Studio Materi tidak lagi menampilkan form pembuatan. Kartu âDraft materiâ hanya memuat daftar draft dan tombol **â+ Buat materiâ**; form (materialId, versi, judul, kerangka, mapel, kelas, menit, ringkasan) baru muncul sebagai **dialog modal** saat tombol itu ditekan.

**Yang diubah:**
- [StudioScreen.tsx](../../src/screens/StudioScreen.tsx) â state `creating` + `createTriggerRef`/`createDialogRef`/`materialIdRef`. `<section>` âDraft baruâ yang tadinya selalu tampil dihapus; header kartu daftar kini `flex justify-between` berisi judul âDraft materiâ + `<button data-studio-create-open>` (â+ Buat materiâ). Dialog di root layar (`data-studio-create-dialog`, overlay `fixed inset-0 z-50 bg-ink/40`, panel `max-w-3xl`) dengan `role="dialog"`, `aria-modal="true"`, `aria-labelledby="studio-create-heading"`, tombol tutup `data-studio-create-close`, `data-studio-create-cancel` (Batal), dan `data-studio-create` (Buat draft dari kerangka). `handleCreate` sukses â `setCreating(false)` sebelum pindah ke halaman editor.
- Fokus: fokus awal ke isian materialId; `Escape` menutup (kecuali sedang membuat); `Tab`/`Shift+Tab` berputar di dalam dialog; fokus kembali ke tombol pemicu saat ditutup. Klik latar juga menutup, diblokir selama `busy`.
- Error pembuatan dirender **di dalam dialog** (`role="alert"`), dan error halaman daftar disembunyikan selama dialog terbuka agar tidak tampil ganda di balik overlay.
- [material-studio.mjs](../../scripts/e2e/scenarios/material-studio.mjs) â urutan baru: dipastikan `[data-studio-create]`/`[data-studio-create-dialog]` tidak ada saat layar dibuka (screenshot `studio-daftar-tombol.png`), klik tombol â dialog muncul â Batal â dialog hilang dan form tetap tidak ada di halaman, buka lagi â opsi kerangka â¥ 2 (screenshot `studio-buat-materi.png`), isi id/judul â buat â halaman editor tanpa form/dialog/daftar, screenshot `studio-daftar-draft.png` (daftar berisi satu draft + tombol tetap di header), dan setelah hapus draft halaman tidak lagi membuka dialog. E2E naik 28 â **29 pemeriksaan**.

**Keputusan desain:**
1. **Dialog, bukan halaman/rute baru** â pembuatan materi adalah aksi sesekali dengan 8 isian; modal menjaga daftar draft tetap terlihat di belakang dan tidak menambah entri navigasi.
2. **Tombol diletakkan di header kartu âDraft materiâ**, bukan di `PageHeader` â aksinya milik daftar draft, dan tetap terlihat saat daftar kosong (empty state menunjuk ke tombol itu).
3. **Tutup diblokir selama pembuatan** (`busy`) agar permintaan tidak berjalan tanpa umpan balik yang terlihat.

**Verifikasi aktual:** `npx tsc --noEmit` bersih Â· `npm test` **157/157** (19 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `npx vite build` EXIT 0 Â· `npm run e2e:studio` **PASS 29 pemeriksaan** (`.tmp-e2e/2026-10-29T16-45-55-725Z`) Â· `npm run e2e:scene-sample` **PASS 4 pemeriksaan** Â· screenshot `studio-daftar-tombol.png` (hanya tombol + empty state, tanpa form), `studio-buat-materi.png` (dialog dengan fokus di materialId), `studio-daftar-draft.png` (daftar berisi draft + tombol di header), `studio-final.png` diperiksa.

**Batasan jujur:**
1. Dialog tidak menahan gulir halaman di belakangnya (`body` tidak di-lock); overlay menutupi, tetapi roda gulir masih bisa menggeser latar.
2. Nilai form tidak direset saat dialog dibatalkan â dibuka lagi akan menampilkan ketikan sebelumnya (hanya direset setelah draft berhasil dibuat).
3. `Escape`/klik latar sengaja tidak menutup selama pembuatan berjalan, jadi pembatalan di tengah permintaan belum tersedia.
4. `npm run a11y` tidak dijalankan ulang: harness belum membuka Studio, jadi dialog ini belum tercakup audit otomatis; pola fokus/Escape/Tab belum diuji pembaca layar.

**Sisa:** kunci gulir latar saat dialog terbuka Â· reset form saat Batal Â· unit test fokus dialog Â· perluas harness a11y ke layar Studio.

### Panel Tengah Susun: Tab Editor & Pratinjau (2026-10-30, T-130)

**Status:** pratinjau naskah tidak lagi menumpuk di atas penyunting blok. Kolom tengah tab Susun kini punya **dua tab â Editor | Pratinjau â dengan Editor sebagai tampilan awal**, sehingga ruang kerja menulis tidak termakan kartu pratinjau; tab Pratinjau memakai seluruh tinggi kolom tengah (iframe 320 â 420 px).

**Yang diubah:**
- [DraftScenePanel.tsx](../../src/components/studio/DraftScenePanel.tsx) â state `bodyTab` (`"editor" | "preview"`, awal `"editor"`). Tablist `data-scene-body-tabs` (`role="tablist" aria-label="Editor dan pratinjau langkah"`) berisi `button[role="tab"]` `data-scene-body-tab="editor"|"preview"` dengan `aria-selected` + `aria-controls`; tab aktif bergaya `bg-primary/10 text-primary`, tab pasif bergaris. Dua `role="tabpanel"`: `data-scene-editor-panel` (daftar blok + tombol â+ Teks/Gambar/Suaraâ) dan `data-scene-preview-panel` (kartu `data-scene-preview-card` yang lama, termasuk tombol `data-scene-preview-refresh`), masing-masing `hidden` saat tidak aktif. `handlePreview()` kini juga `setBodyTab("preview")`, jadi tombol âPratinjauâ di toolbar dan âMuat ulangâ sama-sama membawa pengguna ke tab Pratinjau.
- [material-studio.mjs](../../scripts/e2e/scenarios/material-studio.mjs) â pemeriksaan tab awal (Editor `aria-selected="true"`, panel pratinjau `hidden`), lalu blok pratinjau: klik `[data-scene-body-tab='preview']` â panel editor tersembunyi â Muat ulang â `srcdoc` memuat `data-stage="0"` â screenshot `studio-susun-preview.png` â pindah langkah 2 â `data-stage="1"` â kembali ke tab Editor dan panel pratinjau tersembunyi. E2E naik 29 â **30 pemeriksaan**.

**Keputusan desain:**
1. **Tab, bukan akordeon/lipatan** â dua permukaan (menulis vs melihat hasil) dipakai bergantian, bukan bersamaan; tab memberi pratinjau tinggi penuh tanpa menggeser tombol tambah blok.
2. **Editor sebagai tab awal** â tugas utama panel ini menulis naskah; pratinjau dibuka saat ingin memeriksa.
3. **Pratinjau tetap dirender di latar meski tabnya tertutup** â iframe yang disembunyikan tidak kehilangan isi, sehingga membuka tab Pratinjau tidak memicu muat ulang dan tidak berkedip (`srcdoc` tetap diperbarui saat langkah berganti dan belum usang).

**Verifikasi aktual:** `npx tsc --noEmit` bersih Â· `npm test` **157/157** (19 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `npx vite build` EXIT 0 Â· `npm run e2e:studio` **PASS 30 pemeriksaan** (`.tmp-e2e/2026-10-29T21-17-43-658Z`) Â· `npm run e2e:scene-sample` **PASS 4 pemeriksaan** Â· screenshot `studio-susun.png` (tab Editor aktif, blok teks langkah 2 + properti kanan, tanpa kartu pratinjau menumpuk) dan `studio-susun-preview.png` (tab Pratinjau aktif, iframe penuh menampilkan âLangkah 1 / 2â) diperiksa.

**Batasan jujur:**
1. Tab pilihan tidak disimpan: mengganti draft me-remount panel (kunci `materialId@version`) sehingga kembali ke tab Editor; pindah tab Studio lain tidak mereset karena panel tetap ter-mount.
2. Papan tombol `â`/`â` antar tab belum ditangani; tab hanya bisa diganti dengan klik/Enter pada tombol (pola `role="tab"` standar belum lengkap).
3. Pratinjau di tab tetap tidak bisa menampilkan audio nyata (pemutar kosong) dan posisi gulirnya kembali ke atas tiap âMuat ulangâ â sama seperti T-128.
4. `npm run a11y` belum membuka Studio, jadi tabpanel baru ini belum tercakup audit otomatis.

**Sisa:** navigasi tab dengan papan tombol Â· ingat tab terakhir per draft Â· konfirmasi keluar editor dengan naskah belum diterapkan Â· rute/deep-link draft.

### Blok Video (YouTube/Daring/Lokal) + Sematan HTML Daring (2026-10-30, T-131)

**Status:** tab Susun bisa menyisipkan **blok `video` dengan tiga sumber** â `youtube`, `daring` (berkas https), `lokal` (berkas di `assets/`) â dan **blok `semat`** (halaman https seperti GeoGebra). Bundel yang memuat alamat daring itu **tetap lolos pemeriksaan mandiri dan pemasangan**, karena validator kini membaca naskah; materi tanpa koneksi menampilkan **pemberitahuan**, bukan pemutar kosong. Keputusan tercatat di [ADR-0036](../decisions/ADR-0036-declared-online-media.md).

**Yang diubah:**
- [sceneModel.ts](../../src/components/studio/sceneModel.ts) â `VIDEO_SOURCES = ["youtube","daring","lokal"]`, `MAX_LOCAL_VIDEO_BYTES = 25 MB`, `youtubeId()` (watch/youtu.be/embed/shorts/live/v), `isHttpsUrl()`, `blockNeedsInternet()`/`sceneNeedsInternet()`, dan `sceneIssues()` baru: "tautan YouTube belum sah.", "berkas video daring harus alamat https://.", "alamat sematan harus diawali https://.", plus judul wajib untuk kedua blok.
- [sceneRender.ts](../../src/components/studio/sceneRender.ts) â YouTube â `<iframe src="https://www.youtube-nocookie.com/embed/<id>?rel=0" sandbox="allow-scripts allow-same-origin allow-presentation allow-popups" referrerpolicy="strict-origin-when-cross-origin">`; daring â `<video â¦ data-online src="httpsâ¦">`; lokal â `<video â¦ src="assets/â¦">`; semat â `<iframe src="httpsâ¦" sandbox="allow-scripts allow-same-origin allow-forms allow-popups">`. Tiap blok daring mendapat `<p class="offline-note" data-offline-note hidden>` dan runtime memasang listener `online`/`offline` + `error` pada `video[data-online]` untuk menampilkan/menyembunyikannya. CSS `.offline-note` ikut dirender.
- [DraftScenePanel.tsx](../../src/components/studio/DraftScenePanel.tsx) â tombol "Sisip â Video | Semat" + penyunting per blok: `data-scene-video-source` (radio tiga sumber), `data-scene-video-url` (youtube/daring), `data-scene-video-file` + `data-scene-video` (unggah lokal, ditolak > 25 MB), `data-scene-video-title`, `data-scene-embed-url`, `data-scene-embed-title`; banner `data-scene-internet-note` saat langkah memuat blok daring. Pratinjau tab **tidak** memuat pemutar daring â yang tampil penanda "â¦ diputar di materi terpasang".
- [material_manifest.rs](../../src-tauri/src/material_manifest.rs) â `MAX_VIDEO_BYTES` 25 MB + `is_video()` + tipe `mp4`/`webm`; `ensure_self_contained()` menjadi **sadar-naskah**: memotong segmen `<script id="ifp-scene">`, memvalidasi URL tiap blok video/semat, lalu menetralkan URL **dideklarasikan** dan URL **turunan** (`scene_embed_urls()` â `youtube_video_id()` â alamat pemutar nocookie yang dirender) sebelum pemindaian pola. `scene_remote_urls()` dipakai untuk peringatan. Fungsi yang sama dipakai `write_draft_file`, `check_draft`, dan `material_install`.
- [material_author.rs](../../src-tauri/src/material_author.rs) â `add_draft_asset` memakai batas 25 MB khusus video (gambar/suara tetap 8 MB); `check_draft` menambah peringatan "Materi memuat N blok video/sematan daring; â¦".
- [MaterialViewer.tsx](../../src/components/material/MaterialViewer.tsx) â sandbox frame materi: `allow-scripts allow-forms` â `allow-scripts allow-forms allow-same-origin allow-popups` (YouTube menolak asal opaque; materi tetap beda asal `ifp-content` sehingga tidak menyentuh dokumen induk).
- [DraftCheckPanel.tsx](../../src/components/studio/DraftCheckPanel.tsx) â teks pembuka menjelaskan bahwa hanya alamat yang dinyatakan di tab Susun yang diizinkan.
- [material-pack.mjs](../../scripts/material-pack.mjs) + [workers/api/src/materialManifest.ts](../../workers/api/src/materialManifest.ts) â `mp4`/`webm` ditambahkan ke `MEDIA_TYPES` agar tiga lapisan tipe konten tetap cocok. **Catatan jujur:** pemindaian rujukan eksternal hanya ada di Rust; skrip penerbit dan Worker tidak memindai, jadi pemeriksaan mandiri + pemasangan di perangkat adalah penegaknya.
- [material-studio.mjs](../../scripts/e2e/scenarios/material-studio.mjs) â alur video/embed nyata: sisip 3 blok video + 1 semat, isi URL, asersi pesan sah/tidak sah di `[role='alert']`, unggah `assets/pembuka.mp4` lewat `DOM.setFileInputFiles`, tunggu banner `data-scene-internet-note`, periksa tab Pratinjau hanya menampilkan penanda (screenshot `studio-susun-preview-video.png`), dan **tetap** menguji penolakan `https://` di luar blok terdeklarasi. E2E naik 30 â **31 pemeriksaan**.
- [material-viewer.mjs](../../scripts/e2e/scenarios/material-viewer.mjs) â asersi sandbox diperbarui ke empat token + asersi baru bahwa dokumen materi tetap tidak terbaca induk (`frame.crossOrigin`).

**Keputusan desain:**
1. **Pengecualian terdeklarasi, bukan pelonggaran pola.** Alamat daring yang lolos harus berasal dari blok `video`/`semat` di naskah tervalidasi; alamat lain di berkas mana pun tetap ditolak (dibuktikan test `undeclared_external_reference_is_rejected` dan `rendered_youtube_embed_is_allowed` yang memakai ID asing).
2. **URL turunan ikut dideklarasi.** Pemutar nocookie dibangun dari `watch?v=` yang ditulis penulis; tanpa `scene_embed_urls()` berkas hasil render ditolak validator â ini bug yang ditemukan E2E run 3 dan sudah ditutup dengan test regresi.
3. **Satu validator untuk tiga waktu** (simpan draft, pemeriksaan mandiri, pemasangan) supaya tidak ada jalur yang lebih longgar.
4. **Kebijakan PO "daring bebas + peringatan"** â materi yang butuh internet tidak diblokir; UI menandai dan runtime memberi pemberitahuan.
5. **Video lokal = satu-satunya jalur tanpa jaringan**; batas 25 MB per berkas, anggaran bundel 50 MB tidak berubah.

**Verifikasi aktual:** `cargo test --lib` **131/131** (EXIT 0; modul `#[test]` di `material_manifest.rs` baru â 8 test) Â· `npx tsc --noEmit` bersih Â· `npm test` **168/168** (19 berkas; `sceneRender.test.ts` 15 â 23 `it()`) + fixture 4/4 + katalog 336/336 + binding PASS Â· `npx vitest run workers/api` **34/34** (`materials.test.ts` 18 â 21) Â· `npm run worker:typecheck` EXIT 0 Â· E2E `material-studio` **PASS 31 pemeriksaan** (`.tmp-e2e/2026-10-30T01-52-37-675Z`) Â· `material-scene-sample` **PASS 4** (`.tmp-e2e/2026-10-30T01-59-16-756Z`) Â· `material-viewer` **PASS 8** (`.tmp-e2e/2026-10-30T02-03-10-368Z`). Screenshot diperiksa: `studio-susun.png` (Editor, "Sisip di bawah: Teks | Gambar | Suara | Video | Semat", 7/12 blok), `studio-susun-preview-video.png` (banner amber + status `Video assets/pembuka.mp4 ditambahkan ke draft.`), `studio-final.png` (daftar draft bersih setelah penghapusan).

**Batasan jujur:**
1. **Pemutaran nyata belum diverifikasi lewat jaringan.** E2E membuktikan markup, unggah, penerimaan pemasangan, dan penanda pratinjau â bukan bahwa video YouTube/GeoGebra benar-benar berputar di penampil.
2. Pratinjau Studio sengaja tidak memuat media daring (CSP aplikasi `frame-src 'self' ifp-content:`); tidak dilonggarkan.
3. Halaman https yang dideklarasikan bisa berubah isi setelah pasang; mitigasinya tanda tangan penerbit + tinjauan manusia, bukan teknis. ADR-0036 menyebut pemeriksaan ini "pola + tinjauan manusia, bukan sandbox".
4. `allow-same-origin` memberi frame asal `ifp-content` sendiri â cookie/localStorage domain materi kini mungkin; `allow-popups` membuka jendela baru. `allow-top-navigation` tetap tidak diberikan.
5. Satu video 25 MB bisa menghabiskan separuh anggaran bundel; total byte masih dilihat penulis di panel pemeriksaan.
6. `npm run a11y` tidak dijalankan ulang: harness belum membuka Studio, jadi blok video/semat baru belum tercakup audit otomatis.
7. Rust tidak dirapikan `cargo fmt` penuh (menjalankan fmt penuh mengaduk 18 berkas lain); gaya mengikuti berkas sekitar.

**Sisa:** uji pemutaran nyata di penampil dengan jaringan aktif Â· tombol "uji koneksi" di panel pemeriksaan Â· pratinjau lokal video di tab Pratinjau (kini penanda) Â· batas agregat video per bundel Â· perluas harness a11y ke layar Studio.

### Perbaikan T-132 â YouTube/sematan daring tidak berputar di penampil materi (2026-10-30)

Laporan user: "video youtube gak bisa di putar coba kamu cek di mengenak huruf". Draft `mengenal-huruf` v1.0.0 (disimpan 09:44) sudah berisi blok `"kind":"video","source":"youtube","url":"https://www.youtube.com/watch?v=FaefTAgfv-0&t=18s"` dan `index.html` hasil Terapkan sudah merender `<iframe src="https://www.youtube-nocookie.com/embed/FaefTAgfv-0?rel=0">`. Jadi naskah, validator, dan renderer benar â kerusakan ada di **lingkungan jalan**.

| Bagian | Hasil |
|---|---|
| Diagnosis (ukur, bukan asumsi) | (a) Top-level navigasi ke alamat embed â snapshot browser menampilkan "Video player configuration error / **Error 153**". (b) `curl` A/B: tanpa Referer 135.854 B dan berisi teks "Error 153"; dengan `Referer: http://ifp-content.localhost/` 141.472 B dan bersih â YouTube menolak embed tanpa Referer dan menerima asal `ifp-content`. (c) Probe CSP di browser dengan header CSP materi **lama**: konsol `Framing 'https://www.youtube-nocookie.com/' violates the following Content Security Policy directive: "default-src 'none'". â¦ 'frame-src' was not explicitly set` â **inilah blocker utama**; dengan CSP **baru**: nol pesan, permintaan embed 200. (d) Probe pewarisan referrer pada rantai frame (outer `no-referrer` â dokumen materi â frame lintas-port) mencatat header `Referer` **tetap terkirim**, jadi `no-referrer` pada frame induk bukan penyebab kegagalan di mesin ini. (e) `allow-fullscreen` dicoba lalu **dibuang**: `Error while parsing the 'sandbox' attribute: 'allow-fullscreen' is an invalid sandbox flag`. |
| [material.rs](../../src-tauri/src/material.rs) | `MATERIAL_CSP` menambah `frame-src https: ifp-content:` dan `https:` pada `media-src`. Tanpa `frame-src`, CSP materi jatuh ke `default-src 'none'` sehingga iframe YouTube dan sematan diblokir sebelum ada permintaan jaringan. `connect-src 'none'`, `script-src`, `object-src`, `base-uri`, `form-action`, `default-src` tidak dilonggarkan. Test baru `material_csp_permits_declared_online_media` membaca header respons `/contoh-siklus-air/1.0.0/index.html`: `frame-src` dan `media-src` harus memuat `https:`, `connect-src` tetap `'none'`, `script-src` tidak boleh `https:`. |
| [MaterialViewer.tsx](../../src/components/material/MaterialViewer.tsx) | Frame materi: `referrerPolicy="no-referrer"` â `"origin"` dan `allow="fullscreen; autoplay; encrypted-media; picture-in-picture"` ditambahkan (izin harus diwarisi sepanjang rantai frame). Komentar mencatat alasan YouTube agar tidak "dirapikan" kembali. |
| [material-viewer.mjs](../../scripts/e2e/scenarios/material-viewer.mjs) | Harness membaca + mengunci `referrerpolicy` dan `allow` frame materi (2 asersi baru; jumlah `log()` tetap 8 karena asersi ini tidak mencetak baris). |
| [sceneRender.test.ts](../../src/components/studio/sceneRender.test.ts) | Test blok YouTube kini mengunci `referrerpolicy="strict-origin-when-cross-origin"`, `allow="encrypted-media; picture-in-picture; fullscreen"`, dan string sandbox penuh + `.not.toContain('referrerpolicy="no-referrer"')`. **Markup yang dirender tidak berubah** â draft lama tidak perlu diterapkan ulang. |
| Verifikasi | `cargo test --lib` **132/132** (131 â 132) Â· `npx tsc --noEmit` bersih Â· `npm test` **168/168** (19 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `npx vite build` EXIT 0 Â· E2E `material-viewer` **PASS 8** (`.tmp-e2e/2026-10-30T03-17-56-945Z`) Â· `material-scene-sample` **PASS 4** Â· `material-studio` **PASS 31**. Aplikasi dev dihentikan sementara untuk E2E (satu instance WebView2) lalu dijalankan ulang. |

**Keputusan:** CSP dokumen materi ikut dilonggarkan karena kebijakan PO "daring bebas + peringatan" (ADR-0036 butir 1â4) memang menyiratkan alamat terdeklarasi harus bisa dimuat; melonggarkan hanya sandbox/frame tanpa menyentuh CSP membuat fitur ini tampak selesai padahal mati. `referrerPolicy` ditetapkan `origin` (bukan mengembalikan `no-referrer` dan mengandalkan pewarisan Chromium) supaya permintaan embed selalu membawa Referer di mesin mana pun, dan yang dikirim hanya asal materi â bukan nama berkas atau parameternya. ADR-0036 diberi butir 8 + catatan koreksi.

**Batas:** pemutaran nyata di WebView2 belum dibuktikan otomatis â dokumen materi adalah OOPIF lintas asal, jadi harness tidak bisa membaca isi pemutar; buktinya gabungan probe browser + curl + asersi atribut frame. Pratinjau Studio tetap penanda (srcdoc mewarisi CSP aplikasi yang tidak punya `frame-src https:`). Untuk materi yang **sudah terpasang sebelum perbaikan ini**, tidak perlu pasang ulang: yang berubah adalah header CSP dan atribut frame di sisi aplikasi, jadi cukup jalankan ulang aplikasi.

### Tiga Mode Lebar Penampil Materi (2026-10-30, T-133 â [ADR-0037](../decisions/ADR-0037-material-viewer-display-modes.md))

**Status:** selesai dan terverifikasi. Permintaan PO: "apakah player-nya bisa dibuat landscape, sama dengan devicenya", lalu "kalau ada beberapa mode gimana?". Putusan via AskUserQuestion: **tiga mode Kartu | Lansekap | Layar penuh** dan pelebaran kolom lewat **media query di CSS bundel** (bukan injeksi dari penampil).

| Bagian | Hasil |
|---|---|
| [MaterialViewer.tsx](../../src/components/material/MaterialViewer.tsx) | `ViewMode = kartu \| lansekap \| layar-penuh` dengan satu tombol siklus (`data-material-view-mode-toggle`, label "Tampilan: â¦") dan `data-material-view-mode` di dialog untuk bahan ukur uji. `kartu` = seperti sebelumnya (`max-w-5xl`, header lengkap, transkrip overlay); `lansekap` = `max-w-none` + padding tipis, transkrip **mendampingi** di kanan (`w-[26rem] max-w-[45%] shrink-0`); `layar-penuh` = tanpa padding/bordir, baris keterangan & metadata hilang, header dan bar progres dipadatkan. Mode awal dari viewport (â¥1280 px â lansekap), lalu preferensi profil menang. Escape bertingkat: transkrip â layar penuh turun ke lansekap â tutup. |
| Layar penuh | `getCurrentWindow().setFullscreen()` (API jendela Tauri), **bukan** Fullscreen API DOM yang ditolak preseden T-093; dilewati bila tidak di dalam Tauri (pratinjau Studio), dan selalu dilepas saat mode ditinggalkan atau penampil ditutup. |
| [uiStateRepository.ts](../../src/data/uiStateRepository.ts) | Kunci baru `MATERIAL_VIEW_MODE_KEY = "material-view-mode"` pada tabel `ui_state` yang sudah ada (T-111) â tanpa migrasi baru. Baca saat mount (gagal = hanya berarti tidak dipersist), tulis lewat `applyMode()`. |
| [sceneRender.ts](../../src/components/studio/sceneRender.ts) | CSS yang dirender Studio menambah `@media (min-width:1000px)` â `.material{max-width:min(1180px,92%)}` + `.step p,.step li{max-width:78ch}` + sematan `min(72vh,640px)`, dan `@media (min-width:1400px)` â `.material{max-width:min(1400px,94%)}`. [style.css bundel contoh](../../src-tauri/sample-material-mengenal-huruf/assets/style.css) ikut dua titik putus yang sama (tanpa baris sematan) supaya teruji runtime. |
| Uji unit | [sceneRender.test.ts](../../src/components/studio/sceneRender.test.ts) "kolom konten ikut melebar di bingkai lanskap" mengunci dua media query, batas 78ch, dan bahwa aturan dasar 820 px **masih ada**. |
| Uji E2E | [material-viewer.mjs](../../scripts/e2e/scenarios/material-viewer.mjs) mengukur geometri per mode (`dialog`/`frame`/`transkrip`) + mengunci: kartu tetap Â±1024 px dan berketerangan; lansekap > kartu + 300 px tanpa overflow; layar penuh dialog = `clientWidth` dan tanpa keterangan; transkrip berdampingan di lansekap; **mode diingat per profil** (sengaja ditutup pada kartu lalu dibuka ulang di jendela 1600 px â tanpa preferensi ia akan jatuh ke lansekap). 8 â **11 pemeriksaan**. [material-scene-sample.mjs](../../scripts/e2e/scenarios/material-scene-sample.mjs) mengevaluasi di dalam OOPIF dokumen materi (sesi CDP sendiri) dan mengunci kolom `.material`: **820 px @bingkai 920 px â 1400 px @1567 px â 1400 px @1585 px**, tanpa overflow. 4 â **5 pemeriksaan**. |
| Verifikasi | `cargo test --lib` **132/132** Â· `npx tsc --noEmit` bersih Â· `npm test` **169/169** (19 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `npx vite build` EXIT 0 (10,45 dtk) Â· `npm run a11y` **19/19** (0 error, 8 warning lama) Â· E2E `material-viewer` **PASS 11**, `material-scene-sample` **PASS 5**, `material-studio` **PASS 31** tanpa regresi. |

**Keputusan:** tiga mode, bukan satu â kartu masih paling nyaman untuk materi teks di jendela kecil sementara pemutar video/GeoGebra butuh bingkai penuh. Kolom diperlebar dari dalam bundel karena penampil tidak bisa menjangkau dokumen materi (asal `ifp-content` berbeda; gaya induk tidak menembus). Baris teks dibatasi `78ch` agar yang melebar hanya bingkai, bukan panjang baris.

**Batas (jujur):**
1. **Materi yang sudah terpasang sebelum ini tetap 820 px** sampai diterapkan ulang di Studio / diterbitkan ulang â media query hidup di `assets/style.css` bundel. Bingkai pemutarnya tetap ikut melebar.
2. Yang dibuktikan otomatis adalah **state mode + geometri DOM**; bahwa fullscreen OS benar-benar terjadi di mesin pengguna belum ada ukurannya. `setFullscreen` dibungkus `catch` sehingga kegagalan tidak menghentikan penampil.
3. `position: fixed; inset: 0` tidak menutupi bilah gulir klasik: dialog layar penuh terukur **1585 px** pada jendela 1600 px. Pembanding yang benar `document.documentElement.clientWidth`, bukan `window.innerWidth` (inilah satu-satunya kegagalan asersi saat menyusun uji, dua putaran).
4. Metadata (kelas/mapel/durasi/versi) sengaja hilang di layar penuh; satu tombol siklus (bukan tiga tombol) membuat berpindah ke mode tertentu butuh 1â2 klik.
5. Skenario `material-viewer` kini menulis preferensi mode ke profil aktif perangkat (sisa uji); pilihan itu memang milik pengguna dan dapat berubah kapan saja.
6. `npm run a11y` pernah gagal sekali pada tab Beranda (kontras 1,80:1 / 2,03:1) **tanpa perubahan kode apa pun**, lalu PASS 19/19 pada pengulangan â harness membaca warna saat `transition-colors` tab Beranda masih berjalan. Bukan temuan T-133; tercatat sebagai flake pengukuran (lihat BACKLOG: kunci warna setelah transisi sebelum audit kontras).

**Sisa:** buktikan fullscreen OS pada perangkat (hanya state mode + geometri yang terukur otomatis) Â· terapkan ulang bundel yang sudah terpasang (atau diterbitkan ulang lewat katalog) supaya kolom bacanya ikut melebar Â· pilih mode langsung (bukan siklus satu langkah) bila pengguna mulai meminta shortcut per mode Â· pertimbangkan mode `lansekap` sebagai default juga di jendela 1024â1280 px bila materi teks ternyata masih kekecilan.

### Pelebar Kolom Konten di Semua Sumber CSS Bundel (2026-10-30, T-134 â lanjutan [ADR-0037](../decisions/ADR-0037-material-viewer-display-modes.md))

**Status:** selesai dan terverifikasi. Gejala PO setelah T-133: "kenapa bagian dalamnya tidak ikut berubah" â bingkai Lansekap/Layar penuh melebar, kolom isi tetap sempit. Akar terbukti, bukan dugaan: keenam bundel di perangkat tidak punya media query (`grep -c` = 0) dan tiga di antaranya masih `.material{max-width:820px}`, sementara di repo hanya [style.css mengenal-huruf](../../src-tauri/sample-material-mengenal-huruf/assets/style.css) yang sudah dilebari. Putusan PO: **Terapkan ulang + rapikan sumber** â bukan injeksi CSS saat melayani berkas (memecahkan hash/tanda tangan bundel dan membalik ADR-0037) dan bukan terbitkan ulang lewat katalog.

| Bagian | Hasil |
|---|---|
| [material-templates/style.css](../../src-tauri/material-templates/style.css) | Kerangka draft baru dapat `@media (min-width:1000px){.material{max-width:min(1180px,92%)}}` + `@media (min-width:1400px){â¦min(1400px,94%)}`. |
| Tiga bundel demo katalog | [sample-material](../../src-tauri/sample-material/assets/style.css), [sample-material-perkalian](../../src-tauri/sample-material-perkalian/assets/style.css), [sample-material-fakta-opini](../../src-tauri/sample-material-fakta-opini/assets/style.css) memakai `width: min(760px, 100%)` (bukan `max-width`), jadi query-nya ikut `width` supaya tidak saling menimpa. |
| [material.rs](../../src-tauri/src/material.rs) | `SEED_VERSION` 4 â 5 supaya bundel contoh di perangkat ditulis ulang. Sebelum naik, salinan perangkat dicek identik byte-per-byte dengan repo (`ensure_sample_material()` menghapus folder target, jadi itu satu-satunya jalan yang aman). |
| Uji Rust penjaga | [material.rs](../../src-tauri/src/material.rs) `bundled_styles_carry_the_wide_column_breakpoints` membaca lima sumber CSS dan memaksa dua titik putus + nilai `min()` per properti (whitespace dihapus supaya kerangka bertingkat dan keluaran Susun satu baris setara); [material_author.rs](../../src-tauri/src/material_author.rs) `new_draft_kerangka_carries_the_wide_column_breakpoints` menciptakan draft lewat `create_draft()` dan mengunci query pada `assets/style.css` yang benar-benar ditulis ke disk. |
| Katalog dev | `npm run catalog:dev` membangun ulang 3 bundel bertanda tangan; `unzip -p â¦ assets/style.css \| grep -c "min-width: 1000px"` = **1** untuk ketiganya. |
| Verifikasi | `cargo test --lib` **134/134** (132 + 2 uji baru) Â· `npx tsc --noEmit` bersih Â· `npm test` **169/169** (19 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `npx vite build` EXIT 0 Â· E2E `material-scene-sample` **PASS 5**, `material-viewer` **PASS 11**, `material-studio` **PASS 31** tanpa regresi. |

**Keputusan:** pelebaran tinggal di dalam bundel (satu-satunya tempat yang menembus dokumen materi), dan karena `sample_manifest()` menghitung ulang sha256 tiap berkas dari `include_bytes!` saat jalan, mengubah CSS tidak membuat manifest bundel contoh rusak sendiri.

**Batas (jujur):** materi yang **sudah terpasang** sebelum perubahan ini tidak ikut melebar dengan sendirinya. Draft milik PO cukup **Studio â tab Susun â Terapkan** (menulis ulang `style.css`, tanpa perlu jalankan ulang aplikasi). Dua bundel terpasang hasil review â `perkalian-kelompok-jeruk` dan `mengenal-huruf-vokal` â sengaja tidak dihapus/dipasang ulang; kalau ingin keduanya lebar, perlu pasang ulang versi baru atau hapus folder instalasinya lebih dulu (butuh persetujuan PO).

### Toolbar Tambah Blok di Panel Parameter + Tombol "Tandai Siap Pakai" (2026-10-30, T-135)

**Status:** selesai dan terverifikasi. Permintaan PO tiga bagian: letakkan toolbar tambah blok di atas parameternya, rapikan tata letak UI parameter, dan sediakan tombol publish yang mengubah draft menjadi mode siap pakai. Dua keputusan dikunci lewat AskUserQuestion: (a) toolbar pindah **di atas panel Parameter (kanan)**, (b) "publish" = **Tandai siap pakai di Studio** â satu klik menandai draft selesai di dalam aplikasi, **bukan** menerbitkan ke katalog.

| Bagian | Hasil |
|---|---|
| [DraftScenePanel.tsx](../../src/components/studio/DraftScenePanel.tsx) | `ADD_BLOCK_KINDS` (baris 79) jadi satu-satunya sumber lima jenis blok. Baris lima tombol di dasar tab Editor (sebelumnya Â±1495-1541) **dihapus** â daftar blok kini langsung menutup tabpanel; baris "Sisip di bawah:" per posisi tetap di tengah. |
| Panel Parameter | `<aside data-scene-props>` (baris 1556) kini berjudul `<h3>Parameter</h3>` dan berisi **tiga section** ber-divider atas `border-t border-ink/10 pt-3`: **Tambah blok** (grid dua kolom `data-scene-add-block-bar`, hint "Blok baru masuk di akhir langkah N; batas 12 blok per langkah." / "Tambahkan langkah lebih duluâ¦"), **Langkah** (judul langkah + Duplikat/â/â/Hapus, semua `px-2 text-xs`; kosong â "Tambahkan langkah untuk menyunting parameternya."), **Halaman** (judul + subjudul + orientasi). Kolom kanan lengket dengan gulir internal sendiri: `xl:sticky xl:top-4 xl:max-h-[calc(100vh-8rem)] xl:overflow-y-auto`. |
| Kesetaraan state pratinjau | Input judul **langkah** kini memanggil `setPreviewStale(true)` sebelum `setHistory`, sama seperti judul/subjudul **halaman** yang memang sudah begitu â sebelumnya sunting judul langkah tidak pernah menandai pratinjau basi. |
| [material_author.rs](../../src-tauri/src/material_author.rs) | `DraftInfo.review_status` (baris 75) + `manifest_review_status()` (323) yang membaca `material.json` dengan fallback `"draft"`. Sengaja **bukan kolom DB baru**: tabel `material_draft` hanya indeks folder, sedangkan `reviewStatus` kanonik ada di manifest dan sudah divalidasi enum-nya di `material_manifest.rs`. Nol migrasi. |
| Tandai siap pakai | `mark_draft_ready()` (838): jalankan `check_draft` dulu â bila `!report.ok` kembalikan error berisi daftar `report.errors` ("Materi belum siap pakai: â¦") â bila status sudah `reviewed`/`approved` **idempoten** (tidak menulis ulang) â jika masih `draft`, tulis `reviewStatus: "reviewed"` lewat `set_draft_manifest` (yang memaksa id/versi, menghitung ulang `files`, dan memvalidasi). Perintah `material_draft_mark_ready` (1199) terdaftar di [lib.rs](../../src-tauri/src/lib.rs). |
| [materialStudioRepository.ts](../../src/data/materialStudioRepository.ts) | `StudioDraft.reviewStatus`, helper `draftReviewStatus()` (baca manifest, fallback `"draft"`), `markStudioDraftReady()`. |
| [StudioScreen.tsx](../../src/screens/StudioScreen.tsx) | `READY_LABELS` + `ReviewBadge` (63-78, `data-studio-review-badge`) dipakai **dua tempat**: header editor (di samping judul) dan baris daftar draft (524). `handleMarkReady()` (275) â `busy: "Memeriksa kesiapan materiâ¦"` â muat isi baru â segarkan daftar â pesan sukses yang menyebut urutan nyata (Ekspor â tanda tangan penerbit di luar aplikasi â pasang/terbitkan). Tombol `data-studio-mark-ready` (354) **hanya muncul saat status masih `draft`** dan nonaktif ketika suntingan kode belum diterapkan (`codeDirty`). |
| E2E | Asersi geometri layout diperluas: `addBar` harus berada **di dalam** kotak panel kanan dan **tidak boleh** berada di atas `data-scene-step-title` â dua kegagalan bernama ("tambah blok di luar panel parameter" / "tambah blok tidak di atas judul langkah"). Alur baru: cek label tombol + lencana `draft` â klik â tunggu pesan & lencana `reviewed` â baca `material_draft_read` (manifest `reviewStatus`) â tombol hilang â `material_draft_list` membawa `reviewStatus` â kembali ke daftar dan screenshot `studio-siap-pakai.png`. `material-studio` 31 â **32 pemeriksaan**. |
| Verifikasi | `cargo test --lib` **135/135** (134 â 135, uji baru `mark_ready_requires_a_passing_check_and_is_idempotent`) Â· `npx tsc --noEmit` bersih Â· `npm test` **169/169** (19 berkas) + fixture 4/4 + katalog 336/336 + binding PASS Â· `npx vite build` EXIT 0 Â· E2E `material-studio` **PASS 32** (dua kali jalan berurutan) Â· `npm run a11y` **PASS 19**, 0 error, 8 warning (layar Studio Materi: 13 target interaktif, 0 error, 0 warning). Artefak: `.tmp-e2e/2026-10-30T06-22-10-251Z/studio-susun.png` + `studio-siap-pakai.png`. |

**Keputusan:**
1. **"Siap pakai" = `draft â reviewed`, bukan `approved`.** Status `approved` tetap milik reviewer manusia; tombol ini menyatakan "draft ini sudah selesai dari sisi penulis" dan itu persis arti `reviewed` pada enum kontrak.
2. **Pemeriksaan kontrak adalah prasyarat, bukan hiasan.** Tombol menolak menaikkan status sebelum `check_draft` hijau, sehingga tidak ada draft rusak yang bisa berlabel "Siap pakai".
3. **Hanya manusia yang menekan.** Agen tidak pernah memanggil `material_draft_mark_ready` untuk materi milik PO; `reviewStatus` di 320 paket dan seluruh draft tetap `draft` sampai PO bertindak.
4. **Naik status sekali jalan.** Setelah `reviewed`, tombol hilang; menurunkan kembali harus lewat pemilih status di tab Metadata (jalur manual yang sudah ada), supaya tidak ada aksi "unpublish" diam-diam.

**Batas (jujur):**
1. **Ini bukan penerbitan.** Materi tidak naik ke katalog dan tidak terpasang di perangkat; tidak ada satu byte pun yang ditandatangani. Terbit nyata tetap: Ekspor folder sumber â `scripts/material-pack.mjs` (tanda tangan di luar aplikasi) â katalog/Worker sisi platform yang belum di-deploy (T-123).
2. **Pemasangan tidak dibedakan.** `material`/`material_install` tidak memeriksa `reviewStatus`, jadi lencana "Siap pakai" adalah penanda administratif di dalam Studio â bukan gerbang teknis.
3. **Tidak ada filter/urut berdasarkan status** di daftar draft; lencana hanya informatif.
4. Belum ada jalur "turunkan ke draft" berupa tombol, dan `approved` belum punya tombol penanda sendiri di UI.
5. `npm run a11y` mengaudit **halaman daftar** Studio Materi, bukan editor draft maupun dialog; markup panel Parameter baru tidak tercakup audit otomatis.
6. E2E membuktikan **state + geometri DOM**; screenshot `studio-susun.png` dan `studio-siap-pakai.png` adalah bukti tambahan yang tetap perlu dibaca manusia.

**Sisa:** tambahkan tombol "turunkan ke draft" + status `approved` bila PO mulai memakai status tiga tingkat itu Â· perluas `npm run a11y` ke layar editor draft (plafon: 12 dokumen) Â· pertimbangkan filter "Siap pakai" di daftar draft Â· hubungkan lencana siap pakai ke ekspor (mis. ingatkan bahwa ZIP belum bertanda tangan) Â· jalankan ulang aplikasi dev (mati selama E2E) dan minta PO menekan **Studio â draft mengenal-huruf â tab Susun â Terapkan** agar `style.css` draft-nya ikut melebar (T-134).
### Paket Pilot Pecahan Dinaikkan Jadi Materi Contoh (2026-11-16, T-136)

**Status:** selesai dan terverifikasi. Paket fixture `matematika-kelas3-pecahan` (dipakai E2E + satu uji Rust) kini memenuhi standar batch sesudahnya dan bisa dipakai sebagai contoh materi: tujuan pembelajaran selaras dengan isi & asesmen, volume cukup, posisi kunci tidak bias, dan setiap aktivitas punya metadata aksesibilitas. `reviewStatus` tetap **draft** — hanya PO yang boleh menaikkannya.

| Bagian | Hasil |
|---|---|
| [lesson-001.json](../../scripts/e2e/fixtures/pilot-pecahan-kelas3/lessons/lesson-001.json) | 4 tujuan: 1/2–1/3–1/4–2/3 dari gambar; menuliskan lambang; menjelaskan 2/3 menyisakan 1/3; membandingkan 1/2 vs 1/4 dan 1/3 vs 1/4. `activityIds` berurutan **eksplorasi → kuis → mencocokkan**, sehingga alur E2E lama (Selesai eksplorasi → Lanjut berlatih = kuis) tetap sah. |
| [activity-001.json](../../scripts/e2e/fixtures/pilot-pecahan-kelas3/activities/activity-001.json) | Eksplorasi **6 langkah** (dari 4): dua langkah baru — membandingkan 1/2 dengan 1/4, dan menghitung sisa 1/3 pada gambar 2/3. Semua langkah tetap punya prompt/altText/reveal/hint. |
| [activity-002.json](../../scripts/e2e/fixtures/pilot-pecahan-kelas3/activities/activity-002.json) | Kuis **8 soal** (dari 4): kunci benar di posisi 1,2,0,2,1,0,2,1 (tally 2/3/3, bukan lagi 3 dari 4 di posisi 0), `showCorrectAnswer` true, `accessibilityMetadata` ditambahkan, `passingScore` 75 = 6 dari 8. Soal `soal-setengah`/`opsi-setengah` dipertahankan karena dipakai E2E backup-restore. |
| [activity-003.json](../../scripts/e2e/fixtures/pilot-pecahan-kelas3/activities/activity-003.json) | Aktivitas **matching** baru: 5 pasangan pecahan ↔ arti, termasuk “angka bawah pada pecahan” ↔ “jumlah semua bagian sama besar”. Feedback immediate + showCorrectAnswer true, a11y altText. |
| [content.rs](../../src-tauri/src/content.rs) | Uji `active_package_loads_after_import` menyesuaikan jumlah aktivitas 2 → **3** (baris 973); jumlah aset tetap 4. |
| [learning-journey.mjs](../../scripts/e2e/scenarios/learning-journey.mjs) | Harapan diperbarui ke `Langkah 1 dari 6`, 5 klik Lanjut, dan 8 opsi jawaban benar. |
| [home-catalog.mjs](../../scripts/e2e/scenarios/home-catalog.mjs) | Sama: `Langkah 6 dari 6` dan `Soal 1 dari 8` beserta 8 opsi jawaban. |
| Verifikasi | `content:validate` **VALID**, 0 issue, 2 warning (draft & tanpa `curriculumRefs`) · `npm test` **169/169** + fixture 4/4 + katalog 336/336 + review binding PASS · `cargo test --lib` **135/135** · E2E `learning-journey` **PASS 14** (skor 100, 8/8 soal) · E2E `home-catalog` **PASS 29** · impor paket kini **9 file**. |

**Keputusan:**
1. **Versi tetap 0.1.0.** `packageVersion` 0.1.0 dipakai hardcoded oleh skenario E2E, uji Rust, dan data sesi; fixture ini bukan paket produksi dan tidak masuk katalog. Menaikkan versi akan merusak rantai uji tanpa manfaat rilis.
2. **Tidak ada soal bergambar.** Skema pertanyaan kuis tidak punya `assetPath` (hanya langkah eksplorasi); menambahkannya berarti mengubah skema + penampil, di luar lingkup. Gambar tetap dipakai di eksplorasi dan dirujuk secara verbal di kuis.
3. **Mencocokkan diletakkan setelah kuis.** Supaya alur E2E eksplorasi → kuis tidak berubah; urutan tetap sah secara pedagogis (asesmen lalu pemantapan).
4. **Kualitas dijaga manual.** Validator hanya memeriksa kontrak, bukan bias posisi kunci; sebaran 2/3/3 dicatat sebagai bukti, bukan klaim otomatis.

**Batas (jujur):**
1. `reviewStatus` tetap **draft** dan tidak ada keputusan review manusia yang diklaim; agen tidak menaikkan status.
2. `curriculumRefs` masih kosong, jadi paket tidak boleh diklaim sesuai Kurikulum Merdeka.
3. Ini fixture E2E, bukan paket yang dibundel atau terbit; memakainya sebagai contoh di katalog demo butuh keputusan PO.
4. E2E membuktikan alur & skor; kualitas pedagogis tetap perlu dibaca manusia.

**Sisa:** pertimbangkan memindahkan mencocokkan sebelum kuis bila alur E2E diperbarui · tambah soal bergambar hanya bila skema pertanyaan diperluas (perlu perubahan penampil) · jadikan paket ini contoh di katalog demo bila PO setuju.

### Ilustrasi Aktivitas Vektor 48 Paket Matematika (2026-11-16, T-138)

**Status:** selesai dan terverifikasi. Permintaan PO: "ya buatkan asset baru, tapi kalau kamu bisa membuat dengan vektor juga gpp seperti gambar pada pilot" — lanjutan T-137: cover tidak lagi diulang di setiap langkah, tetapi ilustrasi aktivitas masih memakai cover. Kini setiap aktivitas eksplorasi pada **48 paket matematika kelas 1–6** punya ilustrasi topiknya sendiri.

| Bagian | Hasil |
|---|---|
| [generate-activity-illustrations.mjs](../../scripts/generate-activity-illustrations.mjs) | Baru: `PLAN` berisi **48 resep** (satu per paket `kelasN-matematika-b01…b08`). Setiap resep menggambar dengan primitif vektor — persegi/garis/lingkaran/panah, garis bilangan, pecahan berarsir, kubus/balok, diagram batang, jam, uang, sudut — lalu dirasterisasi 2× dan di-downsample ke **PNG 800×600**. Bisa dijalankan langsung (`node`) atau diimpor sebagai sumber `PLAN`. |
| [illustrationKit.mjs](../../scripts/lib/illustrationKit.mjs) | Baru: permukaan piksel RGBA + primitif + encoder PNG murni (`node:zlib` `deflateSync`, IHDR/IDAT/IEND, crc32). **Tanpa dependensi baru.** |
| [wire-activity-illustrations.mjs](../../scripts/wire-activity-illustrations.mjs) | Baru: membaca `PLAN` dari generator (satu sumber nama berkas + alt), memastikan `content/packages/<dir>/assets/<file>` ada, lalu — hanya dengan `--apply` — menambahkan entri `{path, mediaType:"image/png", sizeBytes, sha256}` **di akhir** `manifest.assets`, menetapkan `activity.assets`, `steps[].assetPath`/`altText`, `accessibilityMetadata.altText`, dan mengganti `step.reveal` yang sebelumnya menyalin alt generik. Default dry-run; idempoten. |
| [package.json](../../package.json) | `npm run content:assets` (render 48 PNG) dan `npm run content:assets:wire` (dry-run default). |
| 48 manifest + 48 `activity-001.json` | `assets` eksplorasi menunjuk `assets/aktivitas-*.png` baru; cover tetap entri pertama manifest; 38 paket juga mendapat `reveal` langkah yang tidak lagi menyalin alt generik. |
| Verifikasi | 48/48 paket **VALID** · `npx tsc --noEmit` bersih · `npm test` **173/173** + fixture 4/4 + katalog 336/336 + review binding PASS · E2E `cover-illustration` **PASS 3**, `learning-journey` **PASS 14**, `activities` **PASS 17**, `home-catalog` **PASS 29** · `public/content-catalog.json` tanpa diff · wiring diulang: “0 paket perlu dihubungkan · 48 sudah sinkron”. |

**Keputusan:**
1. **Vektor dirasterisasi ke PNG, bukan SVG.** Enum `mediaType` manifest hanya menerima png/jpeg/webp/avif/audio/video/json/txt; loader Rust memverifikasi `sizeBytes` + `sha256` setiap aset. PNG 800×600 memenuhi keduanya tanpa perubahan skema.
2. **Aset baru ditambahkan setelah cover.** `coverAsset` = gambar pertama manifest ([contentCatalog.mjs](../../scripts/lib/contentCatalog.mjs), ADR-0031), jadi urutan ini menjaga katalog dan thumbnail Beranda tetap memakai cover tanpa regenerasi `public/content-catalog.json`.
3. **48 resep berbeda, bukan pola berulang.** Setiap topik (bilangan, pecahan, bangun ruang, sudut, data, peluang) digambar khusus agar ilustrasi menerangkan langkahnya; tidak ada teks terbaca di dalam gambar — altText yang menjelaskan.
4. **Wiring idempoten dan default dry-run.** Skrip membaca `PLAN` dari generator sehingga nama berkas dan alt tidak bisa menyimpang; menjalankan ulang tidak menulis apa pun.
5. **Konten pedagogis tidak disentuh.** Hanya `assets`/`assetPath`/`altText`/`reveal` yang berubah; `reviewStatus` tetap `draft` dan agen tidak menaikkannya.

**Batas (jujur):**
1. **Hanya 48 paket matematika.** 288 paket lain (mapel lain + IPAS 1–2) masih memakai cover sebagai ilustrasi aktivitas — sejak T-137 dirender sekali per aktivitas, tetapi bukan ilustrasi khusus.
2. **Ilustrasi buatan kode, bukan Flow.** Gaya geometris bersih dan konsisten, tetapi bukan pengganti ilustrasi pedagogis bergaya kartun; kualitasnya belum dinilai guru.
3. **Satu gambar per aktivitas.** Ilustrasi tidak berubah antar langkah (sesuai T-137); topik bertahap diringkas dalam satu komposisi.
4. **Beberapa topik abstrak disederhanakan** (peluang, statistika); makna penuh tetap di teks langkah.
5. **E2E membuktikan wiring + render, bukan kecocokan visual per topik.** Pemeriksaan mata PO tetap diperlukan.
6. **Aplikasi dev perlu dijalankan ulang** agar paket bawaan memuat aset baru di UI; commit sudah dibuat tanpa push.

**Sisa:** perluas ilustrasi khusus ke mapel lain dan IPAS 1–2 bila PO setuju · reviewer manusia menilai kecocokan ilustrasi dengan langkah · pertimbangkan galeri kecil agar 48 gambar bisa diperiksa sekaligus · jalankan ulang aplikasi dev + server katalog demo (`npm run catalog:dev -- --serve`).

### Ilustrasi Berbeda per Langkah 48 Paket Matematika (2026-11-16, T-139)

**Status:** selesai dan terverifikasi. Permintaan PO (dua kali): **"harusnya setiap langkah gambarnya berbeda"** — T-138 memberi satu ilustrasi per aktivitas, sehingga gambar yang sama tampil di kelima langkah. Kini tiap langkah punya ilustrasi sendiri: **48 aktivitas × 5 langkah = 240 PNG**.

| Bagian | Hasil |
|---|---|
| [activityPlans/kelas1…6.mjs](../../scripts/lib/activityPlans) | Baru: enam modul rencana, **8 paket per kelas**, tiap paket `{packageDir, base, summaryAlt, steps[5]}` dengan `alt` ≥20 karakter dan fungsi `draw` berbeda per langkah. Dipilih sesuai permintaan PO: aset baru digambar vektor. |
| [activityScenes.mjs](../../scripts/lib/activityScenes.mjs) | Baru (±1.066 baris): pustaka adegan bersama — `drawShape`, `equalSideMarks`, `rightAngleMarks`, `factorArcs`, `numberLine`, `angleFigure`, `tableGrid`, `pictograph`, `placeValueBoard`, `summaryTrio`, `multipleVenn`, `prismSolid`, objek (koin, jam, timbangan, apel), dan miniatur untuk kartu rangkuman. Diekstrak dari generator T-138. |
| [generate-activity-illustrations.mjs](../../scripts/generate-activity-illustrations.mjs) | Diubah: menyusun `PLAN` dari keenam modul, memvalidasi rencana (paket ganda, base kosong, jumlah langkah ≠5, alt pendek/ganda, `draw` bukan fungsi), merender `.tmp-aktivitas/` (dry-run) atau `assets/` (`--apply`), mendukung `--filter=<dir>` untuk render ulang sebagian. |
| [wire-activity-illustrations.mjs](../../scripts/wire-activity-illustrations.mjs) | Diubah: menghapus entri & berkas `assets/<base>.png` lama, menambahkan lima entri langkah **setelah cover**, menetapkan `activity.assets` (5 path), `steps[].assetPath`/`altText`, menyinkronkan `reveal` yang menyalin alt lama, dan `accessibilityMetadata.altText = summaryAlt`. Default dry-run; idempoten. |
| 48 manifest + 48 `activity-001.json` + 240 PNG | Manifest: 5 entri aset per paket, cover tetap pertama. Aktivitas: lima path langkah berbeda; 48 aset lama dihapus. |
| [cover-illustration.mjs](../../scripts/e2e/scenarios/cover-illustration.mjs) | Ditulis ulang: **PASS 7** — tiap langkah `shared === 0`, `perStep === 1`, `naturalWidth > 0`, `src` berakhir di `…-N.png` yang diharapkan, alt ≥20 karakter; lima `src` dan lima alt berbeda (`Set` = 5); screenshot `ilustrasi-langkah-N.png`; kembali ke langkah 4 memulihkan gambar+alt. |
| Verifikasi | 240 PNG = **1.632.874 byte (1.594,6 KiB)**, **240 hash unik**, 0 duplikat · validator **48/48 VALID** · `npx tsc --noEmit` bersih · `npm test` **173/173** + fixture 4/4 + katalog 336/336 + binding PASS · E2E cover **7/7** + journey 14/14 + activities 17/17 + home-catalog 29/29 · catalog tanpa diff · wiring diulang “0 paket perlu dihubungkan · 48 sudah sinkron”. |

**Keputusan:**
1. **Lima path berbeda, bukan satu simpul bersama.** `sharedStepAsset()` hanya mengembalikan path bila semua langkah identik; dengan lima path, nilainya `null` dan `ExplorationActivity` merender `<img data-exploration-illustration="step">` per langkah — **tidak ada perubahan kode UI**.
2. **Pustaka adegan diekstrak** agar enam modul rencana tidak menyalin primitif; generator hanya merender + memvalidasi.
3. **Duplikat lintas paket dibereskan, bukan dibiarkan.** Pemeriksaan SHA-256 menemukan pasangan byte-identik antar paket (mis. kelas4 b02#1 ↔ kelas5 b03#1); gambar pada kelas lebih tinggi dibedakan (kelas5 ×2, kelas2 ×1, kelas4 ×1) lalu dirender ulang lewat `--filter`, di-wire ulang, dan divalidasi ulang sampai **0 kelompok duplikat**.
4. **Cover tidak berubah.** Aset langkah tetap ditambahkan setelah cover agar `coverAsset` dan katalog build-time tetap sama.
5. **Konten pedagogis tidak disentuh.** Hanya aset, `assetPath`, `altText`, `reveal`, dan `accessibilityMetadata`; `reviewStatus` tetap `draft`.

**Batas (jujur):**
1. **Hanya 48 paket matematika.** 288 paket lain masih memakai satu cover untuk semua langkah.
2. **Ilustrasi buatan kode, bukan Flow**, dan belum dinilai guru.
3. **E2E membuktikan wiring + render + kebaruan gambar, bukan kecocokan pedagogis per topik.**
4. **Aplikasi dev perlu dijalankan ulang** agar UI memuat 240 aset baru; commit dibuat tanpa push.

**Sisa:** galeri 240 gambar agar bisa diperiksa sekaligus · perluas ke mapel lain/IPAS bila PO setuju · reviewer manusia menilai kecocokan ilustrasi dengan tiap langkah.
