# Context — L0 Active

**Sesi:** SESSION-2026-10-23-1 · **Autonomy:** L1 · **Phase:** E + I selesai (persistensi & sync client)

## Kondisi terverifikasi

- Git `main`, HEAD `085cdae` (sync client). Working tree bersih setelah commit.
- App shell Tauri 2 + React 19 + TS 7 + Vite 8 + Tailwind 4.
- Konten: **320 paket draft — seluruh inti Kelas 1–6 selesai** (Fase A 96 + Fase B/C 224); outline semua kelas tersedia. Pilot kelas 3 dipindahkan ke `scripts/e2e/fixtures/pilot-pecahan-kelas3` (fixture E2E, tidak dibundel).
- Review teknis: 320/320 VALID, alt text lengkap, packageId unik; `curriculumRefs` kosong menunggu D6.
- Katalog: indeks build-time `public/content-catalog.json` (ADR-0031); Beranda siap 8,7 dtk termasuk cold start; E2E home 9/9 PASS.
- Blocker rilis: B-03 diperbaiki di kode (transfer/deactivate Worker, `ADMIN_API_TOKEN` provisial, 13/13 test); checklist B-01/B-04 dan B-02/05/06/07/08 tersedia; lembar kerja review R1–R12 (CSV 320 paket) siap diisi reviewer.
- Kualitas konten: pilot gold Kelas 4 B01 (4 paket v0.2.0) lulus **11/12 G**; G8 diisi provisional fase-b/2024 (ADR-0033); G10 menunggu review manusia. 316 paket lain masih standar lama. Blocker rilis: 8 item terdaftar (OD-6/OD-7, SMTP, DV, review manusia).
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
