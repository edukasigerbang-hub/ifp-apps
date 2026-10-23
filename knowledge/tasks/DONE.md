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
