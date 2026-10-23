# ADR-0002 — Backend ditunda sampai Fase I

- **Status:** Accepted (deferred) · **Tanggal:** 2026-10-23
- **Konteks:** HLD §7 membiarkan pilihan backend terbuka (TypeScript atau FastAPI). Implementasi klien (Fase C–G) tidak bergantung pada backend.

## Keputusan

Tunda pemilihan stack backend. Fase C–H dikerjakan dengan batas domain lokal + kontrak yang belum berubah. Keputusan backend diambil sebelum Fase I (sync outbox + API contract).

## Alasan

- Memilih backend sekarang tanpa kebutuhan sync/admin yang terukur berisiko mengunci stack ganda (HLD §7: jangan mengunci stack backend ganda tanpa kebutuhan).
- Kontrak native dan domain lokal belum stabil; backend yang lebih awal akan mengikuti perubahan.

## Konsekuensi

- `OD-7` (API schema, auth, error contract) tetap OPEN dan menjadi blocker Fase I/J.
- Semua endpoint di `knowledge/api/API.md` tetap berstatus PROPOSED.

## Syarat sebelum keputusan diambil

1. Sync event schema dan volume data perangkat diketahui.
2. Kebutuhan admin/studio (RBAC, audit) jelas.
3. Kapabilitas tim dan operasi (hosting, observability) dinilai.
