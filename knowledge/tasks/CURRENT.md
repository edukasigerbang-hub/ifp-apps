# CURRENT — Task Aktif

**Sesi:** SESSION-2026-10-23-1
**Autonomy:** L1 (BALANCED)
**Change class sesi:** SMALL (dokumentasi/inisialisasi, tanpa kode)
**Status:** COMPLETED (inisialisasi) → project WIP

## Task aktif

**T-000 — Inisialisasi project knowledge OS dari HLD & LLD** ✅ selesai 2026-10-23.

Acceptance criteria:
- [x] Artefak wajib `knowledge/` dibuat dengan isi nyata (bukan placeholder)
- [x] State engine `.qoder/` dibuat dan valid
- [x] Index kode dinyatakan UNAVAILABLE secara jujur (tidak ada kode)
- [x] Gap & open decision tercatat di BACKLOG
- [x] Handoff berikutnya ditentukan

## Next task (belum dimulai — butuh keputusan user)

**T-001 — Fase A: Repo reconnaissance + ADR confirmation** (dari Implementation Contract §7)
1. Putuskan: inisialisasi Git? (saat ini **bukan** repo)
2. Putuskan app shell: Tauri 2 + Rust (HLD) — konfirmasi sebelum scaffold
3. Catat ADR-0001 (stack & struktur repo), ADR-0002 (pilihan backend TS vs FastAPI)
4. Setelah itu: Fase B technical spike perangkat (Tauri hello-world, SQLite, file picker, media/WebGL, Ed25519).

## Konteks minimal untuk sesi berikutnya

- Sumber: `HLD.md` (v1.1), `LLD.md`, `IMPLEMENTATION_CONTRACT.md`, `DEVICE_VALIDATION.md`.
- Tidak ada kode, tidak ada `package.json`, tidak ada `Cargo.toml`, tidak ada Git.
- Jangan mengklaim kompatibilitas platform tanpa DV-01…DV-20 berstatus PASS (saat ini NOT RUN).

## Blocker

| ID | Blocker | Dampak |
|---|---|---|
| OD-1 | Daftar resmi mata pelajaran & referensi kurikulum | Konten & schema kurikulum tidak bisa difinalkan |
| OD-6 | Nama publisher resmi & identifier final | Rilis & signing |
| OD-7 | API schema, auth, error contract | Backend & sync tidak bisa diimplementasikan |
| GAP-1 | Prototype `index.html` dirujuk HLD §13 tetapi tidak ada | Referensi UI hilang |

## Handoff

Mulai dari `knowledge/00_INDEX.md`, lalu tugas **T-001** di atas. Jangan scaffold kode sebelum user memilih Git + ADR app shell.
