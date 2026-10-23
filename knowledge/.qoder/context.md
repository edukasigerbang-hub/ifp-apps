# Context — L0 Active

**Sesi:** SESSION-2026-10-23-1 · **Autonomy:** L1 · **Phase:** E + I selesai (persistensi & sync client)

## Kondisi terverifikasi

- Git `main`, HEAD `085cdae` (sync client). Working tree bersih setelah commit.
- App shell Tauri 2 + React 19 + TS 7 + Vite 8 + Tailwind 4.
- Konten pilot `matematika-kelas3-pecahan` v0.1.0 — **DRAFT**, belum direview, tanpa `curriculumRefs`.
- Player: eksplorasi + kuis; nilai disimpan ke SQLite native.
- DB pengguna bersih (0 baris); backup uji di `.tmp-data/backups/db-20261023-225208/`.
- Sinkronisasi client: outbox native + engine TS + mock server; E2E 1 event acknowledged.
- Backend nyata, device token, dan CSP produksi untuk backend: **BELUM**.

## Keputusan aktif

- ADR-0001 Tauri 2 + React/TS · ADR-0002 backend ditunda · ADR-0003 kontrak konten v1 · ADR-0004 persistensi native · ADR-0005 sync client.

## Validasi terakhir

- `cargo test` 11/11 · `npm test` 23/23 + golden 4/4 · `npm run build` PASS.
- E2E: simpan hasil (1 sesi/1 attempt) dan sync (1 ack).
- DV-01…DV-20 NOT RUN; mesin dev Windows 10 vs target Windows 11 + Android 14.

## Next

1. Backend sinkronisasi + device token (OD-7); tambahkan origin backend ke CSP produksi.
2. T-009 device technical spike di perangkat fisik.
3. Review konten R1–R12 + sign-off OD-1.
4. Backup/restore dan retensi data (OD-4).
