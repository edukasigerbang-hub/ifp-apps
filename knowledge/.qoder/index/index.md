# Code Index — Ringkasan

**Status:** UNAVAILABLE
**Alasan:** repository belum berisi source code (hanya dokumen desain).
**Mode:** UNAVAILABLE (fallback: LIGHTWEIGHT_GREP saat kode tersedia tanpa backend SQLite).

## Yang belum diindeks

- `src/` (React + TypeScript) — belum ada
- `src-tauri/` (Rust commands) — belum ada
- Schema SQLite / migrasi — belum ada
- Test — belum ada

## Rencana

1. Fase C selesai (app shell) → INDEX awal `src/` + `src-tauri/`.
2. Setiap perubahan LARGE → targeted reindex, bukan full rebuild.
3. Index bukan sumber kebenaran; kode aktual menang.
