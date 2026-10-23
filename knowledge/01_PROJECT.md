# 01 — Project

## Identitas

- **Nama produk:** Gerbang Edukasi — IFP Apps
- **Jenis:** Platform pembelajaran interaktif untuk SD kelas 1–6 pada Interactive Flat Panel
- **Product ID teknis:** `ifp-learning` (PROPOSED, belum final)
- **Identifier:** `id.gerbangedukasi.ifp` untuk Windows & Android (PROPOSED)
- **Display name** dapat diubah tanpa mengubah identitas teknis
- **Status dokumen:** HLD v1.1 Draft arsitektur; belum ada implementasi

## Ringkasan produk

Aplikasi mendukung mode dipandu guru dan mode belajar mandiri siswa, dengan materi, aktivitas interaktif, game, kuis, evaluasi, dan konten multimedia. Pembelajaran inti berjalan **tanpa internet**; sinkronisasi cloud, unduhan konten, dan aktivasi lisensi bersifat opsional.

## Keputusan produk yang sudah ditetapkan (VERIFIED dari HLD §2)

1. Target internal dan komersial.
2. Tidak mewajibkan akun online untuk belajar.
3. Profil, sesi, progres, dan hasil belajar disimpan lokal.
4. Sinkronisasi cloud opsional saat jaringan tersedia.
5. Pembaruan konten via impor lokal/USB dan unduhan online.
6. Lisensi perpetual & subscription; aktivasi online/offline; satu serial per perangkat.
7. Cakupan awal: player, aktivitas, game, kuis, evaluasi, laporan dasar — bukan LMS lanjutan.
8. Konten kelas 1–6 lengkap harus tersedia saat peluncuran.
9. Konten bawaan ikut paket instalasi; konten kelolaan pengguna di app-data.

## Target platform

| Aspek | Target | Status |
|---|---|---|
| Android | 14+ | VALIDATE (belum diuji) |
| Windows | 11 | VALIDATE (belum diuji) |
| RAM | minimum 8 GB | VALIDATE |
| Storage internal | minimum 128 GB | VALIDATE |
| Resolusi | Full HD 1920×1080 dan 4K 3840×2160 | VALIDATE |
| Interaksi | touch-first IFP | VALIDATE |

## Stack (kandidat — MENGIKAT hanya setelah ADR)

| Lapisan | Kandidat | Status |
|---|---|---|
| App shell | Tauri 2 + Rust | ADOPTED — scaffold; platform VALIDATE |
| UI | React + TypeScript + Vite | ADOPTED (React 19, TS 7, Vite 8) |
| Styling | Tailwind CSS | ADOPTED (v4) |
| DB lokal | SQLite (migrasi bernomor) | PLANNED — belum ada |
| Validasi TS | JSON Schema / Zod | Proposed |
| Validasi native | Rust schema/boundary validation | Proposed |
| Game 2D | HTML Canvas / Phaser | VALIDATE performa |
| 3D | Three.js + glTF/GLB | VALIDATE WebGL/memory/FPS |
| Backend | TypeScript **atau** FastAPI (pilih satu) | BELUM DIPUTUSKAN |
| Server DB | PostgreSQL / Supabase atau setara | Proposed |
| Object storage | Versioning + checksum | Proposed |
| Signature lisensi | Ed25519 | Proposed, security review required |

## Konvensi wajib (VERIFIED dari LLD §1)

- Semua ID domain = UUID/ULID, tidak bergantung nama tampilan.
- Waktu disimpan UTC ISO-8601 atau epoch integer konsisten; UI menampilkan lokal.
- Versi paket = SemVer (atau kebijakan eksplisit).
- Semua file/paket impor = input tidak tepercaya.
- Perubahan DB = migrasi bernomor, diuji dari versi sebelumnya.
- Error wajib punya `code`, `message` aman, `retryable`, `correlationId`.
- Kontrak paket konten: `schemaVersion 1.0.0`, sumber Zod, JSON Schema di-generate (ADR-0003).

## Non-negotiable

- Dilarang mengeksekusi kode arbitrer dari paket konten.
- Private signing key tidak pernah berada di klien.
- Lisensi diverifikasi di native layer, bukan UI.
- Hasil belajar + event outbox ditulis dalam satu transaksi.
- Konten aktif tidak boleh rusak oleh paket gagal/impor terputus.
- Dilarang mengklaim PASS tanpa bukti eksekusi (Pakai PASS / FAIL / NOT RUN).

## Status repository (VERIFIED 2026-10-23)

| Item | Kondisi |
|---|---|
| Source code | **Ada** — scaffold Fase C + schema konten Fase D |
| Git | **Ada** — baseline commit `503c2fc` (main); scaffold belum di-commit |
| `package.json` / `package-lock.json` | Ada |
| `Cargo.toml` | Ada (`src-tauri`) |
| Node / npm / cargo | v22.15.0 / 11.3.0 / 1.95.0 |
| Prototype `index.html` (dirujuk HLD §13) | **TIDAK ADA** → GAP-1 |
| Code index | LIGHTWEIGHT_GREP (61 file: src, src-tauri, scripts, content) |

## Struktur aktual (scaffold Fase C)

```text
src/            # React 19 + TypeScript 7 (UI, navigasi, layout shell)
src-tauri/      # Rust/Tauri 2: config, capabilities, icons
index.html      # entry Vite (bukan prototype HLD)
content/        # BELUM ADA — bundled content (Fase K)
knowledge/      # knowledge OS
```

Detail file: lihat [`.qoder/index/index.md`](.qoder/index/index.md). Struktur final menunggu device spike dan ADR konten/kurikulum.
