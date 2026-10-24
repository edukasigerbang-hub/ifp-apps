# BACKLOG — Antrean Kerja

Urutan fase **MENGIKAT** dari [IMPLEMENTATION_CONTRACT §7](../../IMPLEMENTATION_CONTRACT.md).
Jangan mengerjakan semua fase dalam satu prompt besar; tiap fase punya acceptance criteria dan review.

## Fase implementasi

| ID | Fase | Acceptance criteria ringkas | Status |
|---|---|---|---|
| A | Repo reconnaissance + ADR confirmation | Git init diputuskan, stack dikonfirmasi, ADR-0001/0002 tertulis | DONE (backend ditunda via ADR-0002) |
| B | Device technical spike | DV gate §5: Tauri hello-world (2 OS), SQLite migrasi, document picker/managed folder, media+WebGL, Ed25519 verify, app update preserves data | PARTIAL — Android build PASS; install/launch & Win11 acceptance NOT RUN (hardware) |
| C | Product configuration + app shell | `productConfig`, AppShell, navigasi, tema token, build kedua platform | PARTIAL — scaffold + web build PASS; build per-platform belum |
| D | Content schema + validator | Schema terversi, validator manifest/asset/hash/dependency, test malformed/traversal/oversize | DONE 2026-10-23 — 11 test PASS |
| E | Local repository + learning session contracts | Migrasi SQLite + repository; sesi/attempt/response; transaksi hasil+outbox | DONE 2026-10-23 — 6 test Rust + E2E |
| F | Content importer + atomic activation | staging → validate → activate → rollback; state machine teruji | DONE 2026-10-23 — 5 test Rust + E2E; runtime wiring T-012 |
| G | Learning runtime + basic activities | Registry tipe aktivitas, lifecycle sesi, skor, feedback aksesibel | PARTIAL — Beranda, katalog, eksplorasi, pilihan ganda (tunggal & multi), benar-salah, jawaban singkat, matching, ordering selesai; gaya guru & aktivitas lanjutan belum |
| H | License core + test vectors | Installation ID, signed payload canonical, verifikasi Ed25519, online+offline activation, transfer | PARTIAL — core + server referensi PASS; produksi/TLS/rotasi key/transfer UI pending |
| I | Sync outbox + API contract | Batch, retry/backoff, dedup, ack, conflict rules | PARTIAL — client + auto-schedule + server referensi PASS; stack produksi pending OD-7 |
| J | Studio/admin workflows | Draft→review→approved→build→publish; RBAC; audit | PARTIAL — review lokal append-only + RBAC guru native + UI audit selesai; build/publish server, RBAC multi-pengguna, dan alur persetujuan global belum (OD-7) |
| K | Content production/QA pipeline | Matriks kelengkapan kelas 1–6, review pedagogis, gerbang rilis | PARTIAL — 1 pilot draft; review teknis PASS, review manusia & OD-1 pending |
| L | Device hardening & release | DV-01…DV-20 PASS, installer/updater, backup/restore teruji | PARTIAL — backup & Windows RC build PASS; install/DV/signing/updater pending |

## Keputusan terbuka (HLD §16)

| ID | Keputusan | Memengaruhi | Status |
|---|---|---|---|
| OD-1 | Daftar resmi mata pelajaran + referensi kurikulum | Schema kurikulum, konten, validasi pedagogis | **PROPOSED** — [matriks & opsi](../content/CURRICULUM_PROPOSAL.md), menunggu Product Owner + Curriculum Lead |
| OD-2 | Model perangkat IFP nyata + arsitektur CPU | Build matrix, spike, DV | OPEN |
| OD-3 | Batas ukuran paket, codec media, target performa numerik | Import limits, DV-11/12/20 | OPEN |
| OD-4 | Kebijakan retensi, backup, ekspor, penghapusan data siswa | Privacy, DB, UI | **PROPOSED** — [brief privasi/retensi](../decisions/PROPOSAL-OD-4-privacy-retention.md); default sementara diterapkan ([ADR-0025](../decisions/ADR-0025-privacy-defaults.md)); persetujuan legal belum |
| OD-5 | Grace period subscription offline, transfer perangkat, clock rollback policy | License semantics | **PROPOSED** — [brief kebijakan lisensi](../decisions/PROPOSAL-OD-5-license-policy.md); default sementara diterapkan ([ADR-0026](../decisions/ADR-0026-license-policy-defaults.md)); keputusan komersial belum |
| OD-6 | Nama publisher resmi + identifier aplikasi final | Signing, store, update continuity | **PROPOSED** — [brief identitas rilis & signing](../decisions/PROPOSAL-OD-6-release-identity.md) |
| OD-7 | API schema, auth/authorization, error contract lengkap | Backend, sync, admin | **PROPOSED** — [proposal backend/API produksi](../api/PRODUCTION_BACKEND_PROPOSAL.md); keputusan hosting/auth/kunci diminta |
| OD-8 | Standar "konten lengkap" per mapel/unit | Gerbang rilis konten | OPEN |

## Gap terverifikasi

| ID | Gap | Bukti | Dampak |
|---|---|---|---|
| GAP-1 | `index.html` prototype dirujuk HLD §13 tetapi tidak ada | `glob **/index.html` → 0 hasil | Referensi layout/perilaku UI hilang; tidak boleh dianggap ada |
| GAP-2 | ~~Repository belum Git~~ | **TERTUTUP** 2026-10-23: baseline commit `503c2fc` | — |
| GAP-3 | Backend stack belum dipilih (TS vs FastAPI) | HLD §7 | Fase I/J tidak bisa dimulai |
| GAP-4 | ~~Belum ada ADR~~ | **TERTUTUP** 2026-10-23: ADR-0001, ADR-0002 | — |
| GAP-5 | ~~Layout desktop belum diverifikasi visual~~ | **TERTUTUP** 2026-10-23: Edge headless 1600×900 | — |

## Validasi perangkat (semua NOT RUN)

DV-01…DV-20 belum dijalankan. Lihat [DEVICE_VALIDATION.md](../../DEVICE_VALIDATION.md).
**Dilarang** mengklaim dukungan platform sebelum ada evidence build/test pada perangkat fisik.

## Utang teknis yang sudah diketahui

- Retensi & index DB belum dirancang (menunggu OD-4).
- Skema `sync_outbox` state enum belum ditetapkan.
- Remote GitHub aktif (`origin`); CI berjalan di remote sejak 2026-10-24 (run `40040384407` PASS).
- Branch protection `main`: wajib PR + required checks `Web + server tests`, `Rust tests` (strict), admin terikat.
