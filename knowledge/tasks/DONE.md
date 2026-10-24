# DONE — Arsip Selesai

## 2026-10-23

### T-000 — Inisialisasi project knowledge OS dari HLD & LLD

**Status:** COMPLETED · **Change class:** SMALL (dokumentasi)

- `knowledge/` + `.qoder/` dibuat (20 artefak), hash dokumen sumber dicatat.
- Index kode: UNAVAILABLE saat itu (belum ada source).
- Gap tercatat: prototype `index.html` tidak ada; repo belum Git; backend belum dipilih.

### T-001 — Fase A: Git + ADR

**Status:** COMPLETED · **Change class:** SMALL

- `git init -b main`; baseline commit `503c2fc` (28 file, 5575 insertions).
- `.gitignore` untuk node_modules, dist, target, env, OS/editor.
- [ADR-0001](../decisions/ADR-0001-app-shell.md): Tauri 2 + React/TS diterima (scaffolded).
- [ADR-0002](../decisions/ADR-0002-backend-deferred.md): backend ditunda sampai Fase I (OD-7 tetap OPEN).

### T-002 — Fase C: app shell scaffold

**Status:** COMPLETED (scaffold) · **Change class:** LARGE

**Stack terpasang:** React 19.3.1 · TypeScript 7.0.2 · Vite 8.3.5 · Tailwind 4.3.3 · Tauri 2.12.5 · tauri-build 2.7.4 · Rust 1.95.0 (MSVC).

**Dibuat:**
- `src/config/product.ts` — productConfig (LLD §2), ID masih PROPOSED.
- `src/navigation.ts` — 8 layar + deskripsi + cakupan rencana.
- `src/components/layout/` — AppShell, SidebarNavigation, TopBar, MobileNavigation.
- `src/components/ui/` — PageHeader, StatusBadge, OfflineIndicator.
- `src/screens/ScreenPlaceholder.tsx` — placeholder eksplisit, tanpa data palsu.
- `src-tauri/` — konfigurasi Tauri, identifier `id.gerbangedukasi.ifp`, window 1600×900, CSP produksi dipisah dari `devCsp`, capability default.

**Verifikasi aktual:**

| Check | Hasil |
|---|---|
| `npm run build` (tsc + vite) | PASS |
| `cargo check` | PASS (exit 0) |
| UI smoke (dev, 632px) | PASS — navigasi + breadcrumb, 0 console error |
| UI desktop 1600×900 (Edge headless) | PASS |
| Preview produksi (4173, 1280×800) | PASS — HTTP 200, render benar |
| Unit/integration test | NOT RUN (belum ada suite) |
| `tauri dev` native window | NOT RUN |
| DV-01…DV-20 | NOT RUN — mesin dev Windows 10, target Windows 11/Android 14 |

**Commit:** `5fdced1` — scaffold + Fase D + fixture golden (96 file).

### T-003 — Fase D: kontrak paket konten v1

**Status:** COMPLETED · **Change class:** MEDIUM

**Dibuat:**
- Zod schema: manifest, lesson, activity/assessment, primitive (ID, SemVer, SHA-256, path aman).
- Registry tipe aktivitas (6 tipe) + aturan assessment wajib.
- Validator lintas-field: referensi aset/aktivitas, duplikat, packageId, dependensi, pemindaian field eksekusi.
- `verifyAssets`: SHA-256 + ukuran via WebCrypto.
- CLI `npm run content:validate`, ekspor JSON Schema `npm run content:schema`.
- Fixture `content/fixtures/valid-package/` + 11 test Vitest.

**Verifikasi:**
- `npm test` → 11/11 unit test PASS + 4/4 golden fixture PASS
- `content:validate` → fixture VALID
- `content:schema` → 4 file JSON Schema
- `npm run build` → PASS

**Fixture golden (ditambahkan):** `valid-package`, `invalid-structure` (traversal + `script` + duplikat), `invalid-references` (7 issue termasuk hash mismatch), `unsupported-schema`; expected report di `content/fixtures/expected/`; checker `npm run fixtures:check`. Dokumentasi lengkap: [FIXTURES.md](../content/FIXTURES.md).

### T-004 — Prasyarat materi: OD-1 + rubrik review

**Status:** COMPLETED (dokumen) · **Change class:** SMALL

- Proposal OD-1: opsi kurikulum, keputusan D1–D7, template matriks (TBD), kriteria penerimaan — status **PROPOSED**, bukan keputusan.
- Rubrik review pedagogis R1–R12 — template, 0 materi direview.
- ADR-0003: kontrak paket konten (Zod sumber tunggal, referensi aktivitas, larangan eksekusi kode).

**Tidak dikerjakan (sengaja):** mengisi matriks mapel, menandai review, membuat materi — menunggu keputusan/reviewer manusia.

### T-005 — Pilot konten: Matematika kelas 3, pecahan

**Status:** COMPLETED (draft) · **Change class:** MEDIUM

**Paket:** `content/packages/matematika-kelas3-pecahan/` v0.1.0
- 1 lesson "Mengenal Pecahan 1/2, 1/3, dan 1/4" dengan 3 tujuan pembelajaran.
- Aktivitas eksplorasi 4 langkah + kuis 4 soal pilihan ganda (lulus 75, boleh retry).
- 4 diagram PNG 800×600 dibuat deterministik via System.Drawing; diverifikasi visual (bagian sama besar, jumlah bagian berwarna benar).
- `curriculumRefs: []`, `reviewStatus: draft`, `signature: null`.

**Verifikasi:**
- `npm run content:validate -- content/packages/matematika-kelas3-pecahan` → VALID, 0 issue, 2 warning (draft & tanpa curriculumRefs).
- Hash 4 aset cocok dengan manifest.

**Belum:** review R1–R12, sign-off OD-1, tampilan di aplikasi (player masih placeholder).

### T-006 — Pratinjau Player

**Status:** COMPLETED · **Change class:** MEDIUM

- Loader paket via `import.meta.glob` + validasi runtime (`loadPackages.ts`); aset di-bundle Vite (bukan dari `public/`).
- Layar Player menampilkan lesson pilot: badge DRAFT, metadata, tujuan, tab aktivitas.
- Komponen `ExplorationActivity` (4 langkah, petunjuk, penjelasan, progress) dan `QuizActivity` (soal, skor, ambang lulus, retry, feedback suportif).
- Deep link `#player` untuk membuka layar langsung.
- Logika skor diekstrak ke `scoreQuiz` + 4 unit test (benar semua, gagal, ambang batas, kuis kosong).

**Verifikasi:**
- Alur UI: langkah 1→4, selesai, kuis, skor **100/Lulus** — PASS.
- `npm test` 15/15 + golden 4/4 — PASS.
- Screenshot desktop 1600×900 dan mobile 640×900 diperiksa — PASS.
- Persistensi hasil: **BELUM** (tidak ada SQLite).

### T-007 — Fase E: repository lokal + kontrak sesi

**Status:** COMPLETED · **Change class:** LARGE

- `rusqlite` (bundled) + `sha2`; migrasi native `0001_init` dengan checksum di `schema_migrations`.
- Tabel: profiles, content_packages, content_assets, learning_sessions, activity_attempts, assessment_responses, progress_snapshots, sync_outbox + index.
- Command: `learning_ensure_profile`, `learning_start_session`, `learning_save_attempt`, `learning_get_summary`.
- `learning_save_attempt` menulis attempt + respons + progress + outbox + status sesi dalam **satu transaksi**; `event_id` unik.
- UI: wrapper `learningRepository.ts`, status simpan di Player, layar **Hasil Belajar**, pratinjau browser tidak menyimpan.
- Isolasi uji: `IFP_DATA_DIR` (default `app_data_dir()`), `.tmp-data/` gitignored.

**Verifikasi:**
- `cargo test` → **6/6 PASS** (simpan lengkap, rollback event duplikat, attempt_no naik, summary, migrasi idempoten, persistensi reopen).
- E2E Tauri WebView (CDP) → "Tersimpan lokal — percobaan ke-1"; Hasil Belajar: Sesi 1, Percobaan 1, skor 100.
- DB terisolasi: profiles 1, sessions 1, attempts 1, responses 4, progress 1, outbox 1 `pending`.
- `npm run build` + `npm test` (15/15 + 4/4 golden) PASS.

**Catatan:** DB pengguna nyata (`%APPDATA%\id.gerbangedukasi.ifp`) masih menyimpan 2 sesi/1 attempt dari uji awal sebelum isolasi; pembersihan menunggu persetujuan.

### T-008 — Fase I: sinkronisasi outbox + kontrak

**Status:** COMPLETED (client) · **Change class:** LARGE

- Migrasi `0002_sync`: `app_meta` (installation_id), `acknowledged_at`, index outbox.
- Command: `sync_get_device_id`, `sync_list_pending`, `sync_mark_retry`, `sync_mark_acknowledged`, `sync_get_status`.
- Engine TS: batching 20, backoff eksponensial + jitter (30s → 1 jam), max 5 attempt, dead-letter, ack hanya setelah diterima.
- UI Pengaturan: status pending/failed/acknowledged + tombol sinkronkan; browser preview disabled.
- Mock server `npm run sync:mock` + CORS dev; CSP dev mengizinkan `localhost:8787`.
- Kontrak: [SYNC_CONTRACT.md](../api/SYNC_CONTRACT.md); ADR-0005.

**Verifikasi:**
- `cargo test` → **11/11 PASS** (6 learning + 5 sync).
- `npm test` → **23/23** + golden 4/4.
- E2E Tauri + mock: "1 event tersinkronisasi"; outbox `acknowledged`, counts Menunggu 0 / Gagal 0 / Tersinkron 1; device ID tersimpan.
- Screenshot layar Pengaturan diperiksa.

**Batas:** backend nyata belum ada (OD-7); CSP produksi belum mengizinkan host backend; token perangkat menunggu License Manager.

**DB cleanup (disetujui user):** DB lama dibackup ke `.tmp-data/backups/`, lalu dihapus; app membuat DB baru bersih.

### T-008b — Backend sinkronisasi referensi

**Status:** COMPLETED (reference) · **Change class:** LARGE

- `server/`: TypeScript + `node:http` + `node:sqlite` + Zod (ADR-0006).
- `POST /v1/sync/events`: bearer token, validasi batch, idempotensi `event_id`, batas body/payload, rate limit 60/menit, CORS dev.
- `sync_events` menyimpan payload; event sama + device berbeda → rejected.
- Test Vitest 11 kasus; typecheck `tsconfig.server.json`.

**Verifikasi:** server typecheck PASS; 11/11 test; E2E Tauri → server menyimpan 1 event, client outbox `acknowledged`; UI Menunggu 0 / Gagal 0 / Tersinkron 1.

**Batas:** bukan produksi (tanpa TLS, single-process, rate limit in-memory, token env, retensi belum ditetapkan); stack produksi tetap OD-7.

### T-010 — Review teknis konten pilot

**Status:** COMPLETED (technical only) · **Change class:** SMALL

- R11 validator + hash: PASS. R7 aksesibilitas: PASS setelah perbaikan.
- Temuan F1: teks badge teal 4.36:1 → diganti `#0B6F69` = 5.40:1 (StatusBadge + skor Hasil Belajar).
- R10 `curriculumRefs` kosong: **BLOCKING** (OD-1).
- R1–R5/R8–R9: NOT REVIEWED (manusia).
- Laporan: [REVIEW_REPORT_2026-10-23.md](../content/REVIEW_REPORT_2026-10-23.md); katalog diperbarui.
- `reviewStatus` tetap `draft`; tidak ada klaim kurikulum.

**Verifikasi:** `content:validate` VALID; `npm run build` PASS setelah perubahan warna.

### T-009 — Device spike (readiness)

**Status:** PARTIAL / BLOCKED (acceptance) · **Change class:** MEDIUM

- `npx tauri android init --ci` → project Android + Rust targets (aarch64/armv7/i686/x86_64).
- `npx tauri android build --debug -t aarch64` → **exit 0**; APK universal 129 MB + AAB.
- Kotlin daemon sempat gagal (cache lintas-drive C:/F:); Gradle fallback tanpa daemon berhasil.
- `adb devices` kosong → install/launch **NOT RUN**.
- Mesin Windows 10 (target Windows 11) → DV-02 **NOT RUN**; layar 1920×1080 (4K tidak ada).
- Laporan: [DEVICE_SPIKE_READINESS.md](../device/DEVICE_SPIKE_READINESS.md).

**Tidak diklaim:** kompatibilitas Android/Windows 11, touch, 4K, codec, WebGL, license, update preservation.

### T-011 — Fase F: Content Manager

**Status:** COMPLETED · **Change class:** LARGE

- `content.rs`: impor folder → validasi (manifest, path, symlink, 5.000 file/2 GiB, SHA-256) → staging → `rename` atomik → aktivasi DB transaksional.
- Migrasi `0003_content_activation`: `activated_at`; satu versi aktif per paket, versi lama `disabled`.
- Rollback satu langkah memilih versi impor dengan `activated_at` lebih lama; UI menyembunyikan tombol bila tidak ada versi sebelumnya.
- UI Konten & Pembaruan: folder picker (dialog plugin), daftar paket, impor, rollback, status.
- Player **belum** memuat paket impor (T-012).

**Verifikasi:**
- `cargo test` 16/16 (5 content: impor, hash mismatch, traversal, duplikat, rollback).
- E2E Tauri: impor v0.1.0 (8 file) → v0.2.0 (previous 0.1.0) → rollback; daftar/status sesuai; tombol rollback hilang setelah rollback.
- `npm run build` PASS; `npm test` 34/34 + golden 4/4.

### T-012 — Content Runtime wiring

**Status:** COMPLETED · **Change class:** MEDIUM

- Command native `content_get_active` (manifest/lessons/activities/metadata aset) dan `content_read_asset` (hanya versi aktif, maks 64 MB).
- Player memuat paket impor aktif lebih dulu; bundled sebagai fallback; validasi skema ulang sebelum render.
- Aset diubah menjadi Blob URL dan dicabut saat unmount; badge sumber “Paket impor vX” / “Paket bawaan build”.
- ADR-0008.

**Verifikasi:**
- `cargo test` 18/18 (2 test runtime: load aktif, aset versi non-aktif ditolak).
- E2E: tanpa impor → bundled; impor v0.1.0 → managed; impor v0.2.0 berjudul “EDISI IMPOR” → Player menampilkan judul baru; gambar blob 800×600; rollback → judul kembali v0.1.0.
- `npm run build` / `npm test` PASS.

**Batas:** satu paket impor aktif global; belum ada pemilihan multi-paket (T-013); aset besar belum streaming.

### T-013 — Katalog multi-paket

**Status:** COMPLETED · **Change class:** MEDIUM

- Command `content_list_active` (ringkasan semua paket impor aktif) dan `content_get_package(packageId, version)`.
- Player menampilkan pemilih paket bila >1; default paket pertama; mengganti paket me-remount lesson agar sesi tidak tercampur.
- Blob URL paket lama dicabut; aset per paket.
- ADR-0009.

**Verifikasi:**
- `cargo test` 19/19 (list 2 paket, load by id, tolak versi tidak aktif).
- E2E: impor Matematika + IPA → 2 kartu; default IPA; pilih Matematika → judul berubah; kembali IPA; gambar blob 800px.
- `npm run build` / `npm test` PASS.

### T-014 — Fase H: License core

**Status:** COMPLETED (core) · **Change class:** LARGE

- Installation ID = `app_meta.installation_id` (UUID, tanpa hardware fingerprint).
- Payload lisensi LLD + signature **Ed25519** atas canonical JSON (sorted keys, integer).
- Verifikasi native: schema, product, machine, notBefore, expiry + grace, keyId, signature.
- Public key dari `IFP_LICENSE_KEYS` (JSON base64 raw 32) + product env; tanpa key → `LICENSE_NOT_CONFIGURED`.
- Migrasi `0004_license`; lisensi tersimpan di `license_state` dan diverifikasi ulang saat status/refresh.
- UI Lisensi: status, expiry, entitlements, machine ID, impor file, ekspor request, catatan online belum tersedia.
- `scripts/license-issuer.mjs` untuk keypair + penerbitan lisensi dev (private key dihapus setelah uji).
- ADR-0010.

**Verifikasi:**
- `cargo test` 30/30 (11 license: valid, grace, expired, not-yet, product, device, tamper, unknown key, perpetual, DB import, unconfigured).
- E2E: machine ID → terbitkan lisensi Ed25519 → impor → UI “Berlaku”, entitlements `core`, request aktivasi berisi machineId.
- `npm run build` / `npm test` PASS.

**Belum:** License Service online, transfer/deactivation, revocation, clock-rollback detection, key publik produksi embedded.

### T-015 — License Service referensi

**Status:** COMPLETED (reference) · **Change class:** LARGE

- Endpoint server: `/v1/activations`, `/v1/licenses/refresh`, `/v1/licenses/verify`, `/v1/licenses/transfer` (admin), `/v1/activations/deactivate` (admin).
- Serial disimpan sebagai SHA-256; binding machine atomik; audit `license_audit`; lisensi ditandatangani Ed25519.
- Client: `VITE_LICENSE_SERVER_URL`, tombol Aktivasi online, respons diimpor via `license_import_json` (verifikasi native).
- ADR-0011; server dapat menonaktifkan endpoint lisensi jika signing key tidak dikonfigurasi (503).

**Verifikasi:**
- Server typecheck PASS; 20/20 test server (9 license).
- E2E: serial `DEV-SERIAL-1` → aktivasi online → UI “Berlaku”, machine binding + audit `activated` di DB server.
- `npm run build` PASS; Rust 30/30.

**Belum:** TLS/produksi, penerbitan serial via admin UI, rotasi key, UI transfer/deaktivasi, revocation endpoint.

### T-016 — Backup & Restore database lokal

**Status:** COMPLETED · **Change class:** MEDIUM

- `backup.rs`: SQLite backup API, tolak overwrite, finalisasi `journal_mode=DELETE`, manifest sidecar (sha256, migrasi, counts).
- `backup_inspect`: integrity check + schema/counts; `backup_restore`: guard schema tidak lebih baru, restore ke koneksi aktif, migrasi lanjutan.
- UI Pengaturan: Buat backup, pilih/inspect, ringkasan, tombol Pulihkan, peringatan restart.
- ADR-0012.

**Verifikasi:**
- `cargo test` 33/33 (3 backup: export/inspect/restore, invalid file, refuse overwrite).
- E2E: backup_export + inspect dari WebView; manifest + migrasi 1–4; UI menampilkan bagian Backup & Restore.
- `npm run build` / `npm test` PASS.

**Belum:** backup terjadwal/retensi otomatis, enkripsi, sertakan konten impor (OD-4).

### T-017 — Windows release candidate

**Status:** COMPLETED (build only) · **Change class:** MEDIUM

- `npm run tauri build` exit 0; MSI 4.21 MiB dan NSIS 2.94 MiB dihasilkan.
- Hash artefak dicatat; artefak tetap di `target/` (gitignored).
- Release checklist dibuat dengan 11 blocker dan gate rilis.

**Verifikasi:** build PASS; npm 43/43 + golden; cargo 33/33 (sebelum build).

**Belum:** install/launch/upgrade, code signing, Windows 11 acceptance, Android release, updater, embedded license public key, production CSP. Lihat [RELEASE_CHECKLIST.md](../release/RELEASE_CHECKLIST.md).

### T-018 — Diagnostics export

**Status:** COMPLETED · **Change class:** SMALL

- Command `app_export_diagnostics`: JSON dengan versi, OS/arch, migrasi, counts, status sync, ringkasan lisensi, metadata paket.
- Redaksi: tanpa nama profil, payload/signature/serial lisensi, ID perangkat penuh, atau path pengguna.
- UI Pengaturan: tombol Ekspor diagnostik dengan dialog simpan.
- ADR-0013.

**Verifikasi:** Rust 35/35 (2 diagnostics); E2E ekspor 633 byte, isi sesuai, tanpa `license_json`/`signature`/`serial`; `npm run build` PASS.

### T-019 — Ekspor hasil belajar CSV

**Status:** COMPLETED · **Change class:** SMALL

- `results.rs`: CSV UTF-8 BOM + CRLF, kolom profil/lesson/activity/percobaan/skor/selesai_pada.
- Escaping CSV + anti formula injection; menolak menimpa file.
- UI Hasil Belajar: tombol Ekspor laporan CSV (dialog simpan).
- ADR-0014.

**Verifikasi:** Rust 38/38 (3 results: escaping+injection, empty header, refuse overwrite); `npm run build` PASS.

**Belum:** filter tanggal/kelas, lokalisasi waktu, XLSX; file berisi PII lokal.

### T-020 — Profil lokal, sesi per profil, dan preferensi

**Status:** COMPLETED · **Change class:** LARGE

- `profile.rs`: list/create/get-active/set-active; profil default otomatis; profil aktif di `app_meta`.
- `preferences.rs`: `reducedMotion` + `fontScale` di `app_meta`; diterapkan sebagai kelas `<html>`.
- Sesi belajar memakai profil aktif; Hasil Belajar menampilkan profil.
- UI Pengaturan: daftar/aktifkan profil, tambah profil, toggle animasi, ukuran teks.
- ADR-0015; register gap diperbarui.

**Verifikasi:**
- `cargo test` 44/44 (3 profile, 3 preferences).
- E2E: buat “Budi” (2 profil, aktif), preferensi `reduce-motion font-large`, kuis tersimpan, Hasil Belajar “Profil aktif: Budi” + 1 sesi/1 attempt.
- `npm run build` / `npm test` PASS.

**Belum:** hapus/rename profil, PIN/orang tua, preferensi per profil, preferensi suara.

### T-021 — Sinkronisasi otomatis

**Status:** COMPLETED · **Change class:** SMALL

- Hook `useSyncScheduler`: pemicu 10 dtk setelah mount, event `online`, event `ifp:outbox-changed` (debounce 2 dtk), dan interval 5 menit.
- Koalesensi via flag modul; hanya saat desktop, terkonfigurasi, dan online.
- `notifyOutboxChanged()` dipanggil setelah hasil belajar tersimpan.
- ADR-0016.

**Verifikasi:** E2E dengan backend referensi — kuis disimpan, tanpa klik sinkronisasi, 6 dtk kemudian Pengaturan menampilkan Tersinkron 1; client outbox `acknowledged`; server 1 event. `npm run build` PASS.

### T-022 — CI pipeline + harness E2E

**Status:** COMPLETED · **Change class:** SMALL

- `.github/workflows/ci.yml`: job web (ubuntu) dan rust (windows) + cache.
- `npm run ci` untuk rangkaian lokal; `scripts/e2e/` (CDP) dengan `IFP_DATA_DIR` sementara.
- Skenario `smoke`: bridge Tauri, navigasi, profil default, screenshot; artefak di `.tmp-e2e/`.
- ADR-0017.

**Verifikasi:** `npm run ci` PASS (43 web + 20 server, build PASS); `npm run e2e` PASS 7 pemeriksaan. Harness menemukan dan menutup bug daftar profil kosong saat first run.

**Belum:** workflow belum berjalan di remote (repo belum punya remote); skenario E2E baru smoke.

### T-023 — Siklus hidup profil

**Status:** COMPLETED · **Change class:** MEDIUM

- `profile_rename`: trim, 1–80 karakter, unik case-insensitive, no-op bila sama.
- `profile_delete`: menolak profil terakhir; menolak bila ada data kecuali `deleteData`; hapus respons→percobaan→progres→sesi→outbox→profil dalam satu transaksi; aktif pindah ke profil tertua tersisa.
- UI Pengaturan: form rename inline, konfirmasi hapus dua langkah, peringatan data ikut terhapus.
- ADR-0018.

**Verifikasi:** `cargo test` 47/47 (3 test baru); `npm test` 43/43 + golden; `npm run build` PASS; `npm run e2e:profile` PASS 7 pemeriksaan.

**Belum:** jalur konfirmasi hapus berdata belum diotomasi di UI; tanpa audit trail/undo.

### T-024 — Audit aksesibilitas otomatis

**Status:** COMPLETED · **Change class:** SMALL

- Skenario `npm run a11y`: 8 layar, nama aksesibel, alt, ID unik, heading, landmark, tab, kontras, skip link, 10 langkah Tab.
- Perbaikan: `--color-muted` 4.47→4.76:1; `<h1>` di Player; tab aktivitas `aria-controls`/`tabpanel` + panah/Home/End.
- ADR-0019.

**Verifikasi:** `npm run a11y` PASS 12 pemeriksaan, 0 error/0 warning; `npm run build`, `npm test`, `npm run e2e`, `npm run e2e:profile` PASS.

**Belum:** NVDA/TalkBack, zoom 200%/reflow, keadaan dinamis, target sentuh, preferensi gerak.

### T-025 — E2E alur belajar

**Status:** COMPLETED · **Change class:** SMALL

- Skenario `scripts/e2e/scenarios/learning-journey.mjs` (`npm run e2e:journey`): impor paket pilot via command, verifikasi Player memakai paket impor, selesaikan eksplorasi 4 langkah, jawab kuis, cek penyimpanan lokal.
- Assertion state: 1 sesi, 1 percobaan, rata-rata 100, outbox 1 event, Hasil Belajar menampilkan skor 100.
- Data dir tetap sementara; tidak menyentuh data pengguna.

**Verifikasi:** `npm run e2e:journey` PASS 11 pemeriksaan (dua kali berturut-turut).

**Belum:** impor lewat dialog native, rollback konten, dan alur lisensi belum menjadi skenario.

### T-026 — E2E rollback konten

**Status:** COMPLETED · **Change class:** SMALL

- Skenario `scripts/e2e/scenarios/content-rollback.mjs` (`npm run e2e:rollback`).
- v2 dibangun saat runtime di artefak (salin paket pilot, ubah `packageVersion`/judul lesson) — tidak menambah fixture ke repo.
- Alur: impor v0.1.0 → Player v0.1.0 → impor v0.2.0 (`previousVersion 0.1.0`) → remount Player v0.2.0 → `content_rollback_package` → Player v0.1.0 → status paket 0.1.0 active / 0.2.0 disabled.

**Verifikasi:** `npm run e2e:rollback` PASS 9 pemeriksaan (dua kali berturut-turut).

**Belum:** rollback lewat tombol UI (saat ini command), impor via dialog native, alur lisensi.

### T-027 — E2E lisensi

**Status:** COMPLETED · **Change class:** SMALL

- Harness `launchApp` menerima `extraEnv`; skenario menyuntikkan `IFP_LICENSE_KEYS` dengan keypair Ed25519 yang dibuat per run.
- Skenario: status awal configured + tidak valid → impor lisensi valid (machine-bound, entitlements `core`) → UI “Berlaku” + licenseId → lisensi kedaluwarsa ditolak `LICENSE_EXPIRED` → signature diubah ditolak `LICENSE_SIGNATURE_INVALID` → lisensi valid lama tetap aktif.

**Verifikasi:** `npm run e2e:license` PASS 8 pemeriksaan (dua kali berturut-turut, machine ID berbeda per run).

**Belum:** impor lewat dialog native; aktivasi online dengan server referensi belum masuk harness; key produksi belum di-embed.

### T-028 — E2E aktivasi online

**Status:** COMPLETED · **Change class:** SMALL

- Harness `run.mjs` mendapat hook `setup`/`teardown`; skenario menyalakan server referensi di port 8788 dengan DB & key sementara.
- Skenario `npm run e2e:license-online`: UI form serial → aktivasi → lisensi ditandatangani server → verifikasi native → UI “Berlaku”; machine binding & audit `activated` diverifikasi langsung di SQLite server.
- Negatif: serial tidak dikenal → `LICENSE_SERIAL_INVALID`; lisensi valid lama tetap aktif.
- Private key dihapus saat teardown; artefak DB tetap di `.tmp-e2e/`.

**Verifikasi:** `npm run e2e:license-online` PASS 7 pemeriksaan (dua kali berturut-turut); port 8788/1420 bersih setelah run.

**Belum:** impor lewat dialog native; TLS/produksi (OD-7); key produksi.

### T-029 — A11y reflow, teks 200%, target sentuh, state dinamis

**Status:** COMPLETED · **Change class:** SMALL

- Skenario `npm run a11y` diperluas: reflow 640/320 px per layar, teks 200%, target sentuh (44/24 px), dan audit panel konfirmasi hapus.
- Temuan & perbaikan: select preferensi 36 px → `min-h-11` (44 px).
- ADR-0019 addendum.

**Verifikasi:** `npm run a11y` PASS 15 pemeriksaan, 0 error/0 warning (dua kali berturut-turut); `npm run build` PASS.

**Belum:** NVDA/TalkBack, hasil kuis sebagai state dinamis, dialog native, perangkat fisik.

### T-030 — Beranda & Jelajah Materi

**Status:** COMPLETED · **Change class:** MEDIUM

- Katalog per lesson dari paket bawaan + impor aktif (validasi Zod, managed menang atas bundled): `src/content/catalog.ts`, `loadCatalog.ts`.
- Beranda: sapaan profil, ringkasan sesi/percobaan/rata-rata, kartu “Lanjutkan belajar”, kartu mapel, 3 aktivitas terbaru.
- Jelajah Materi: pencarian, filter kelas & mapel, kartu lesson, tombol “Buka materi”.
- Pemilihan lesson diteruskan ke Player via `playbackSelection`; Player memilih paket/lesson yang diminta, fallback ke default.
- ADR-0020; 6 unit test katalog.

**Verifikasi:** `npm test` 49/49 + golden 4/4; `npm run build` PASS; `npm run e2e:home` PASS 8 pemeriksaan (dua kali); regression smoke & journey PASS; `npm run a11y` 15 pemeriksaan PASS.

**Belum:** “Lanjutkan” membuka sesi baru (bukan posisi tengah aktivitas); katalog memuat metadata semua paket saat layar dibuka.
