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
| OD-7 | API schema, auth/authorization, error contract lengkap | Backend, sync, admin | **PARTIAL** — Supabase + Cloudflare dipilih; OpenAPI v1, Worker enrollment/sync, skema RLS ([ADR-0027](../decisions/ADR-0027-device-auth-openapi.md), [ADR-0028](../decisions/ADR-0028-supabase-cloudflare.md)); lisensi di Worker, RBAC admin, signing konten belum |
| OD-8 | Standar "konten lengkap" per mapel/unit | Gerbang rilis konten | OPEN |
| OD-9 | Apakah **88 paket tanpa aktivitas kuis** perlu diberi kuis? | Bentuk latihan, beban guru, target "5–10 soal" per paket | OPEN — temuan T-092 (2026-10-27): 244 paket eksplorasi+mencocokkan+pilihan ganda · **88 paket eksplorasi+mencocokkan+mengurutkan** · 4 paket eksplorasi+mencocokkan+jawaban singkat. Target 5–10 item sudah terpenuhi untuk setiap aktivitas dinilai yang ada; paket tanpa kuis umumnya keterampilan menulis/bercerita/seni/PJOK/PAI praktik. Butuh keputusan PO + Curriculum Lead, bukan kerja mekanis |

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

- E2E: penulisan attempt pertama setelah aplikasi baru dinyalakan kadang melewati batas tunggu 30 s (`Tersimpan lokal`) pada skenario `activities` / `learning-journey` / `home-catalog`, lalu PASS saat diulang tanpa perubahan kode (bukti 2026-10-27 lanjutan 65). Perlu diagnosis waktu tulis pertama (inisialisasi DB/outbox) atau timeout yang diperpanjang dengan alasan.
- Boot: sidebar admin ter-render sesaat sebelum preferensi `appMode` terbaca sehingga mode belajar "berkedip" dari admin setelah muat ulang. Skenario `mode-switch` sudah menunggu rail belajar, tetapi aplikasi sebaiknya tidak menggambar shell admin sebelum mode diketahui.
- Player: materi terpilih hanya disimpan di memori proses (`playbackSelection`), jadi memuat ulang halaman langsung di `#player` kembali ke paket pertama. Usulan: deep link `#player/<packageId>/<lessonId>` agar muat ulang, tautan, dan riwayat tetap membuka materi yang sama (T-084).
- Shell: `main#main-content` memakai `overflow-y-auto` tetapi induknya `flex min-h-screen` tanpa tinggi tetap, sehingga tidak pernah menggulir sendiri — yang menggulir adalah dokumen. Akibatnya probe sticky E2E dulu membaca elemen yang salah dan jendela uji menempel sempit (±6 px pada 1600×900). Perlu keputusan: beri tinggi `h-screen` pada shell (menu tetap, konten menggulir) atau lepas `overflow-y-auto` yang tidak berfungsi.
- Retensi & index DB belum dirancang (menunggu OD-4).
- Skema `sync_outbox` state enum belum ditetapkan.
- Konten: **10 paket** masih memicu sinyal R5 "opsi benar selalu yang terpanjang" (`longestCorrectRatio = 1`). Tidak dapat diperbaiki dengan transform mekanis — butuh penulisan ulang teks opsi agar panjangnya setara (temuan T-091, 2026-10-27).
- Konten: **550 pasangan matching hasil aturan bahasa** (T-091b) belum dinilai guru; 119 override tulisan tangan juga belum. Bentuknya sudah terbukti berhenti menyalin langkah eksplorasi, tetapi mutu petunjuknya belum ada penilaian manusia.
- Alat QA: `scripts/pedagogical-prereview.mjs` dan `scripts/review-content.ts` menulis ke **path bertanggal tetap** (`PEDAGOGICAL_PREREVIEW_2026-10-26.md`, `review-flags-2026-10-26.json`, dst.). Menjalankannya ulang **menimpa bukti historis**, jadi keduanya tidak bisa dipakai untuk memverifikasi perbaikan setelah tanggal itu. Perlu: tanggal sebagai argumen (default hari ini) + tolak menulis di atas berkas yang sudah ada kecuali `--force`.
- Remote GitHub aktif (`origin`); CI berjalan di remote sejak 2026-10-24 (run `40040384407` PASS).
- Branch protection `main`: wajib PR + required checks `Web + server tests`, `Rust tests` (strict), admin terikat.

## Review guru tertunda — item latihan T-092 (2026-10-27)

695 soal kuis + 361 pasangan ditulis agen dari materi paket lalu dipasang otomatis. Semua lolos validator, volume gate, dan detektor R5, tetapi **belum dinilai manusia**; `reviewStatus` tetap `draft`. Paket berikut materi sumbernya tipis sehingga item sebagian berupa parafrase jauh atau diturunkan dari langkah urutan/eksplorasi — prioritaskan saat review guru:

- **Kelas 1–2:** `kelas2-bahasa-indonesia` b02, b04, b06, b07 · `kelas2-matematika` b08 · `kelas2-pai` b04, b05, b07
- **Kelas 3:** `kelas3-pendidikan-pancasila` b06, b08 · `kelas3-ipas` b07 · `kelas3-pai` b04 · `kelas3-pjok` b06 · `kelas3-seni-rupa` b05
- **Kelas 4:** `kelas4-ipas` b01, b05, b07 · `kelas4-pendidikan-pancasila` b08 · `kelas4-pai` b04, b07 · `kelas4-pjok` b06 · `kelas4-seni-rupa` b05, b08
- **Kelas 5:** `kelas5-bahasa-indonesia` b02, b04, b07, b08 · `kelas5-matematika` b03 (ejaan "FPB/KPK" sesuai kurikulum)
- **Kelas 6:** `kelas6-bahasa-indonesia` b01, b02, b03, b07 · `kelas6-matematika` b05 (alas tabung = lingkaran disimpulkan), b07 (peluang mata genap 3/6 tidak dinyatakan) · `kelas6-ipas` b02 (3 fakta inti, variasi sudut pandang), b04, b05 · `kelas6-pai` b02 (materi paling tipis) · `kelas6-pjok` b03, b05 (pasangan bersifat peralatan/keselamatan) · `kelas6-seni-rupa` b02, b04, b06, b08 · `kelas6-pendidikan-pancasila` b07 (pasangan disimpulkan dari langkah ordering)

Catatan: daftar ini **bukan** penilaian kualitas; ia hanya menandai paket yang materinya paling sedikit sehingga item baru lebih berisiko melenceng dari tujuan pembelajaran.
