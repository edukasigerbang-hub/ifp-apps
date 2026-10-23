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
| Kontrak sinkronisasi | [`api/SYNC_CONTRACT.md`](api/SYNC_CONTRACT.md) |
| Keamanan & privasi | [`security/SECURITY.md`](security/SECURITY.md) |
| Kontrak konten v1 | [`content/SCHEMA.md`](content/SCHEMA.md) |
| Katalog konten | [`content/CATALOG.md`](content/CATALOG.md) |
| Fixture input/output validator | [`content/FIXTURES.md`](content/FIXTURES.md) |
| Proposal kurikulum (OD-1) | [`content/CURRICULUM_PROPOSAL.md`](content/CURRICULUM_PROPOSAL.md) |
| Rubrik review pedagogis | [`content/REVIEW_RUBRIC.md`](content/REVIEW_RUBRIC.md) |
| Laporan review teknis pilot | [`content/REVIEW_REPORT_2026-10-23.md`](content/REVIEW_REPORT_2026-10-23.md) |
| Device spike readiness | [`device/DEVICE_SPIKE_READINESS.md`](device/DEVICE_SPIKE_READINESS.md) |
| Release checklist (Windows RC) | [`release/RELEASE_CHECKLIST.md`](release/RELEASE_CHECKLIST.md) |
| Register test gap | [`testing/TEST_GAPS.md`](testing/TEST_GAPS.md) |
| Keputusan arsitektur | [`decisions/`](decisions/) |

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
| Log sesi | [`logs/2026-10-23.md`](logs/2026-10-23.md) · [`logs/2026-10-24.md`](logs/2026-10-24.md) |

## Modul

Belum ada. `modules/` sengaja belum dibuat karena belum ada kode sumber (aturan: dilarang membuat placeholder kosong).

## ADR

| ID | Keputusan | Status |
|---|---|---|
| [ADR-0001](decisions/ADR-0001-app-shell.md) | App shell Tauri 2 + React/TS | Accepted (scaffolded) |
| [ADR-0002](decisions/ADR-0002-backend-deferred.md) | Backend ditunda sampai Fase I | Accepted (deferred) |
| [ADR-0003](decisions/ADR-0003-content-package-contract.md) | Kontrak paket konten v1 (Zod) | Accepted (implemented) |
| [ADR-0004](decisions/ADR-0004-local-persistence.md) | Persistensi lokal native (Rust + SQLite) | Accepted (implemented) |
| [ADR-0005](decisions/ADR-0005-sync-client.md) | Arsitektur client sinkronisasi | Accepted (client implemented) |
| [ADR-0006](decisions/ADR-0006-sync-backend-reference.md) | Backend sinkronisasi referensi | Accepted (reference only) |
| [ADR-0007](decisions/ADR-0007-content-manager.md) | Content Manager: staging + aktivasi atomik | Accepted (implemented) |
| [ADR-0008](decisions/ADR-0008-content-runtime.md) | Content Runtime: muat paket impor aktif | Accepted (implemented) |
| [ADR-0009](decisions/ADR-0009-content-catalog.md) | Katalog multi-paket di Player | Accepted (implemented) |
| [ADR-0010](decisions/ADR-0010-license-core.md) | License core (Ed25519, verifikasi native) | Accepted (core implemented) |
| [ADR-0011](decisions/ADR-0011-license-service-reference.md) | License Service referensi | Accepted (reference only) |
| [ADR-0012](decisions/ADR-0012-backup-restore.md) | Backup & Restore database lokal | Accepted (implemented) |
| [ADR-0013](decisions/ADR-0013-diagnostics-export.md) | Diagnostics export tanpa secret | Accepted (implemented) |
| [ADR-0014](decisions/ADR-0014-results-export.md) | Ekspor laporan hasil belajar CSV | Accepted (implemented) |
| [ADR-0015](decisions/ADR-0015-profiles-preferences.md) | Profil lokal dan preferensi | Accepted (implemented) |
| [ADR-0016](decisions/ADR-0016-auto-sync.md) | Penjadwalan sinkronisasi otomatis | Accepted (implemented) |
| [ADR-0017](decisions/ADR-0017-ci-e2e-harness.md) | CI pipeline + harness E2E | Accepted (implemented) |
| [ADR-0018](decisions/ADR-0018-profile-lifecycle.md) | Rename & hapus profil | Accepted (implemented) |

Keputusan berikutnya yang perlu ADR: matriks kurikulum (OD-1 → ADR-0004), license semantics (OD-5), API contract (OD-7).
