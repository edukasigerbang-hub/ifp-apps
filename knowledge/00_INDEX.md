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
| Kontrak bundel materi HTML5 v1 (DRAF, ADR-0035) | [`content/MATERIAL_BUNDLE_CONTRACT.md`](content/MATERIAL_BUNDLE_CONTRACT.md) |
| Katalog konten | [`content/CATALOG.md`](content/CATALOG.md) |
| Fixture input/output validator | [`content/FIXTURES.md`](content/FIXTURES.md) |
| Proposal kurikulum (OD-1) | [`content/CURRICULUM_PROPOSAL.md`](content/CURRICULUM_PROPOSAL.md) |
| Outline Kelas 4 Kurikulum Merdeka (DRAF) | [induk](content/OUTLINE_KELAS4_MERDEKA_DRAFT.md) · [Semester 1](content/KELAS4_SEMESTER1_MERDEKA_DRAFT.md) · [Semester 2](content/KELAS4_SEMESTER2_MERDEKA_DRAFT.md) |
| Outline Kelas 3 Kurikulum Merdeka (DRAF) | [induk](content/OUTLINE_KELAS3_MERDEKA_DRAFT.md) · [Semester 1](content/KELAS3_SEMESTER1_MERDEKA_DRAFT.md) · [Semester 2](content/KELAS3_SEMESTER2_MERDEKA_DRAFT.md) |
| Outline Kelas 5 Kurikulum Merdeka (DRAF) | [induk](content/OUTLINE_KELAS5_MERDEKA_DRAFT.md) · [Semester 1](content/KELAS5_SEMESTER1_MERDEKA_DRAFT.md) · [Semester 2](content/KELAS5_SEMESTER2_MERDEKA_DRAFT.md) |
| Outline Kelas 6 Kurikulum Merdeka (DRAF) | [induk](content/OUTLINE_KELAS6_MERDEKA_DRAFT.md) · [Semester 1](content/KELAS6_SEMESTER1_MERDEKA_DRAFT.md) · [Semester 2](content/KELAS6_SEMESTER2_MERDEKA_DRAFT.md) |
| Outline Kelas 1 Kurikulum Merdeka (DRAF) | [induk](content/OUTLINE_KELAS1_MERDEKA_DRAFT.md) · [Semester 1](content/KELAS1_SEMESTER1_MERDEKA_DRAFT.md) · [Semester 2](content/KELAS1_SEMESTER2_MERDEKA_DRAFT.md) |
| Outline Kelas 2 Kurikulum Merdeka (DRAF) | [induk](content/OUTLINE_KELAS2_MERDEKA_DRAFT.md) · [Semester 1](content/KELAS2_SEMESTER1_MERDEKA_DRAFT.md) · [Semester 2](content/KELAS2_SEMESTER2_MERDEKA_DRAFT.md) |
| Review teknis seluruh paket draft (2026-10-24) | [`content/REVIEW_REPORT_2026-10-24_ALL_DRAFTS.md`](content/REVIEW_REPORT_2026-10-24_ALL_DRAFTS.md) |
| Review teknis seluruh paket draft (2026-10-26, pasca-pengayaan) | [`content/REVIEW_REPORT_2026-10-26_ALL_DRAFTS.md`](content/REVIEW_REPORT_2026-10-26_ALL_DRAFTS.md) · [JSON](content/review-flags-2026-10-26.json) |
| Lembar keputusan OD-1 D1–D8 (2026-10-26) | [`content/OD1_DECISION_SHEET_2026-10-26.md`](content/OD1_DECISION_SHEET_2026-10-26.md) |
| Register blocker rilis (2026-10-24) | [`api/RELEASE_BLOCKERS_2026-10-24.md`](api/RELEASE_BLOCKERS_2026-10-24.md) |
| Checklist B-01 signing & B-04 SMTP (2026-10-25) | [`release/CHECKLIST_B01_B04_2026-10-25.md`](release/CHECKLIST_B01_B04_2026-10-25.md) |
| Checklist B-02, B-05, B-06, B-07, B-08 (2026-10-25) | [`release/CHECKLIST_B02_B05_B06_B07_B08_2026-10-25.md`](release/CHECKLIST_B02_B05_B06_B07_B08_2026-10-25.md) |
| Lembar kerja review R1–R12 (2026-10-25) | [panduan](release/REVIEW_WORKSHEET_2026-10-25.md) · [CSV](release/review-worksheet-2026-10-25.csv) |
| Pra-review agent R1–R6/R8–R9/R12 (2026-10-26, **bukan approval**) | [laporan](content/PEDAGOGICAL_PREREVIEW_2026-10-26.md) · [sampel baca 40 paket](content/PEDAGOGICAL_SAMPLE_2026-10-26.md) · [CSV flag](content/prereview-flags-2026-10-26.csv) · [JSON bukti](content/prereview-evidence-2026-10-26.json) |
| Review UX/UI layout pembelajaran (2026-10-26, **bukan approval**; termasuk merge berkas `.md` eksternal; P0 5/6 selesai; UX-03 selesai; dua mode Belajar/Admin selesai — T-077; a11y/E2E PASS) | [`design/UX_REVIEW_LAYOUT_PEMBELAJARAN_2026-10-26.md`](design/UX_REVIEW_LAYOUT_PEMBELAJARAN_2026-10-26.md) |
| Analisis gap kualitas 320 paket (2026-10-25) | [`content/QUALITY_GAP_2026-10-25.md`](content/QUALITY_GAP_2026-10-25.md) · [JSON](content/quality-gap-2026-10-25.json) |
| Review 10 paket prioritas (2026-10-27; F-01…F-04 diperbaiki, F-05 ditutup, F-06 diputuskan sebagai utang desain) | [laporan](content/REVIEW_REPORT_2026-10-27_GURU_PRIORITAS_10.md) · [CSV 309 pasangan F-06](content/F06_MIRROR_PAIRS_2026-10-28.csv) |
| Pilot gold Kelas 4 B01 (2026-10-25) | [`content/PILOT_GOLD_KELAS4_B01_2026-10-25.md`](content/PILOT_GOLD_KELAS4_B01_2026-10-25.md) |
| Inventaris aset konten (2026-10-25) | [`content/ASSET_INVENTORY_2026-10-25.md`](content/ASSET_INVENTORY_2026-10-25.md) · [CSV](content/asset-inventory-2026-10-25.csv) |
| Prompt pack aset — cover & materi (2026-10-25) | [`content/ASSET_PROMPTS_2026-10-25.md`](content/ASSET_PROMPTS_2026-10-25.md) · [CSV](content/asset-prompts-2026-10-25.csv) |
| Jadwal produksi konten Kelas 1–6 | [`content/PRODUCTION_SCHEDULE.md`](content/PRODUCTION_SCHEDULE.md) |
| Rubrik review pedagogis | [`content/REVIEW_RUBRIC.md`](content/REVIEW_RUBRIC.md) |
| Laporan review teknis pilot | [`content/REVIEW_REPORT_2026-10-23.md`](content/REVIEW_REPORT_2026-10-23.md) |
| Review teknis starter Kelas 4 (2026-10-24) | [`content/REVIEW_REPORT_2026-10-24_KELAS4_STARTERS.md`](content/REVIEW_REPORT_2026-10-24_KELAS4_STARTERS.md) |
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
| Log sesi | [`logs/2026-10-23.md`](logs/2026-10-23.md) · [`logs/2026-10-24.md`](logs/2026-10-24.md) · [`logs/2026-10-25.md`](logs/2026-10-25.md) · [`logs/2026-10-26.md`](logs/2026-10-26.md) |

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
| [ADR-0019](decisions/ADR-0019-automated-a11y-audit.md) | Audit aksesibilitas otomatis | Accepted (implemented) |
| [ADR-0020](decisions/ADR-0020-home-catalog.md) | Beranda & Jelajah Materi berbasis katalog | Accepted (implemented) |
| [ADR-0021](decisions/ADR-0021-true-false-short-answer.md) | Aktivitas benar-salah & jawaban singkat (`responseText`) | Accepted (implemented) |
| [ADR-0022](decisions/ADR-0022-multi-answer-mcq.md) | Pilihan ganda multi-jawaban | Accepted (implemented) |
| [ADR-0023](decisions/ADR-0023-matching-ordering.md) | Kontrak aktivitas matching & ordering | Accepted (implemented) |
| [ADR-0024](decisions/ADR-0024-local-content-review.md) | Review konten lokal (Fase J increment 1) | Accepted (implemented) |
| [ADR-0025](decisions/ADR-0025-privacy-defaults.md) | Default privasi & retensi (provisional, OD-4) | Accepted (provisional) |
| [ADR-0026](decisions/ADR-0026-license-policy-defaults.md) | Default kebijakan lisensi (provisional, OD-5) | Accepted (provisional) |
| [ADR-0027](decisions/ADR-0027-device-auth-openapi.md) | OD-7 increment 1: auth perangkat & OpenAPI | Accepted (reference) |
| [ADR-0031](decisions/ADR-0031-content-catalog-index.md) | Indeks katalog konten build-time untuk 320 paket | Accepted (implemented) |
| [ADR-0032](decisions/ADR-0032-admin-api-token-provisional.md) | Token admin provisial untuk transfer/deaktivasi lisensi | Accepted (provisional) |
| [ADR-0033](decisions/ADR-0033-curriculum-refs-d6-provisional.md) | Format & pengisian awal `curriculumRefs` (D6 provisional) | Accepted (provisional) |
| [ADR-0034](decisions/ADR-0034-od1-curriculum-matrix-po-approval.md) | OD-1 D1–D8: persetujuan Product Owner + Curriculum Lead | Accepted via sesi 2026-10-26; CP/ATP per bab belum diverifikasi |
| [ADR-0035](decisions/ADR-0035-online-html5-materials.md) | Materi daring HTML5: jenis konten `material`, katalog + unduh-sekali, tanda tangan Ed25519, render di iframe sandbox | **Accepted 2026-10-28** — OD-10…14 dikunci; prototipe penampil lokal T-114 selesai (E2E 8/8) |
| [ADR-0028](decisions/ADR-0028-supabase-cloudflare.md) | Stack backend: Supabase + Cloudflare | Accepted (increment 2) |
| [ADR-0029](decisions/ADR-0029-ifp-devices-isolation.md) | Isolasi perangkat IFP dengan `ifp_devices` (project dipakai bersama Fanakon) | Accepted |
| [ADR-0030](decisions/ADR-0030-worker-license-signing.md) | Penerbitan lisensi Ed25519 di Worker (kunci provisional `prod-1`) | Accepted (provisional) |

OD-1 kini tercatat di ADR-0034 (PO + Curriculum Lead setuju via sesi; tanpa tanda tangan tertulis) — catatan: proposal lama menyebut “ADR-0004”, nomor itu sudah dipakai persistensi lokal. Keputusan berikutnya yang perlu ADR: license semantics (OD-5), API contract (OD-7).

### Proposal keputusan terbuka

| ID | Proposal |
|---|---|
| OD-1 | [Matriks kurikulum & opsi](content/CURRICULUM_PROPOSAL.md) — PO + Curriculum Lead setuju D1–D8 ([ADR-0034](decisions/ADR-0034-od1-curriculum-matrix-po-approval.md)); `curriculumRefs` 320/320, CP/ATP per bab belum diverifikasi |
| OD-4 | [Privasi, retensi, penghapusan](decisions/PROPOSAL-OD-4-privacy-retention.md) |
| OD-5 | [Kebijakan lisensi](decisions/PROPOSAL-OD-5-license-policy.md) |
| OD-6 | [Identitas rilis & signing](decisions/PROPOSAL-OD-6-release-identity.md) |
| OD-7 | [Backend/API produksi](api/PRODUCTION_BACKEND_PROPOSAL.md) |
| OD-10…14 | Materi daring HTML5 — **DIKUNCI 2026-10-28**: katalog publik hanya `reviewed`/`approved`; private key di secret Worker; Supabase Storage + pre-signed 10 menit; 50 MB/bundel & 2 GB/perangkat (LRU); "selesai dibaca" tidak masuk Hasil Belajar — [ADR-0035](decisions/ADR-0035-online-html5-materials.md#keputusan-yang-dikonfirmasi-2026-10-28) |
