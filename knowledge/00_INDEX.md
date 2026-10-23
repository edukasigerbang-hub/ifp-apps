# 00 — Indeks Navigasi Project

**Project:** Gerbang Edukasi — IFP Apps
**Dibuat:** 2026-10-23 · **Status knowledge:** FRESH (inisialisasi pertama)

## Sumber otoritatif (di root repo)

| Dokumen | Path | Versi | SHA-256 (8 awal) |
|---|---|---|---|
| High-Level Design | [`../HLD.md`](../HLD.md) | 1.1 | `06c85df1` |
| Low-Level Design | [`../LLD.md`](../LLD.md) | — | `29f7fa3e` |
| Implementation Contract | [`../IMPLEMENTATION_CONTRACT.md`](../IMPLEMENTATION_CONTRACT.md) | — | `356c1ae6` |
| Device Validation Plan | [`../DEVICE_VALIDATION.md`](../DEVICE_VALIDATION.md) | — | `c59df7be` |
| Agent OS (prompt core) | [`../AGENTS.md`](../AGENTS.md) | v4.3 | `02f75eef` |

> Dokumen di `knowledge/architecture/` adalah **ringkasan turunan** untuk navigasi cepat.
> Jika berbeda dengan root HLD/LLD → **root menang**, dan ringkasan ditandai STALE.

## Pengetahuan project

| Area | Dokumen |
|---|---|
| Identitas, stack, konvensi, status repo | [`01_PROJECT.md`](01_PROJECT.md) |
| Konteks sistem & trust boundary | [`architecture/SYSTEM_CONTEXT.md`](architecture/SYSTEM_CONTEXT.md) |
| Ringkasan arsitektur | [`architecture/HLD.md`](architecture/HLD.md) |
| Desain detail (domain, kontrak, DB) | [`architecture/LLD.md`](architecture/LLD.md) |
| Alur data utama | [`architecture/DATA_FLOW.md`](architecture/DATA_FLOW.md) |
| Skema database lokal | [`database/SCHEMA.md`](database/SCHEMA.md) |
| Kontrak API & native commands | [`api/API.md`](api/API.md) |
| Keamanan & privasi | [`security/SECURITY.md`](security/SECURITY.md) |

## Operasional

| Artefak | Dokumen |
|---|---|
| Task aktif & next step | [`tasks/CURRENT.md`](tasks/CURRENT.md) |
| Antrean fase + keputusan terbuka | [`tasks/BACKLOG.md`](tasks/BACKLOG.md) |
| Arsip selesai | [`tasks/DONE.md`](tasks/DONE.md) |
| Memori project (L1) | [`.qoder/memory.md`](.qoder/memory.md) |
| Konteks aktif (L0) | [`.qoder/context.md`](.qoder/context.md) |
| State mesin | [`.qoder/state.json`](.qoder/state.json) |
| Status index kode | [`.qoder/index/index-state.json`](.qoder/index/index-state.json) |
| Log sesi | [`logs/2026-10-23.md`](logs/2026-10-23.md) |

## Modul

Belum ada. `modules/` sengaja belum dibuat karena belum ada kode sumber (aturan: dilarang membuat placeholder kosong).

## ADR

Belum ada. Keputusan arsitektural pertama yang perlu dicatat: pemilihan stack backend dan model konten (lihat [`tasks/BACKLOG.md`](tasks/BACKLOG.md)).
