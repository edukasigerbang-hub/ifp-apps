# Release Checklist — Windows RC 0.1.0

**Status:** BUILD PASS · **BELUM LAYAK RILIS** · 2026-10-24

## Artefak

| Artefak | Ukuran | SHA-256 |
|---|---|---|
| `src-tauri/target/release/bundle/msi/Gerbang Edukasi_0.1.0_x64_en-US.msi` | 4.21 MiB | `7887c29cbea1756f5fd38c287b7463092100c505cb3d2c188891b96ac05f0687` |
| `src-tauri/target/release/bundle/nsis/Gerbang Edukasi_0.1.0_x64-setup.exe` | 2.94 MiB | `0c4d494cb0342083eacf879cbb8ab856ccd1243783b63f2ce5b06d2967b31418` |

- Perintah: `npm run tauri build` → exit **0**.
- Target: Windows x64. Artefak berada di `target/` (gitignored), tidak di-commit.
- Build memakai identifier **PROPOSED** `id.gerbangedukasi.ifp`.

## Terverifikasi pada build ini

- [x] Compile release Rust + frontend Tauri berhasil.
- [x] Bundel MSI dan NSIS dihasilkan.
- [x] `npm test` 43/43 + golden 4/4 (sebelum build).
- [x] `cargo test` 33/33 (sebelum build).
- [x] Hash artefak dicatat.

## Belum terverifikasi / blocker rilis

| # | Blocker | Dampak |
|---|---|---|
| R1 | Installer belum dijalankan | Install/launch, shortcut, uninstall, upgrade belum diuji |
| R2 | Tidak ada mesin Windows 11 | DV-02/03/04/08 tidak dapat dijalankan |
| R3 | Belum ada code-signing certificate | SmartScreen warning; distribusi komersial belum layak |
| R4 | Publisher & identifier masih PROPOSED (OD-6) | Perubahan setelah rilis merusak update/data |
| R5 | Public key lisensi belum di-embed | Installed app: `LICENSE_NOT_CONFIGURED`; lisensi tidak bisa diverifikasi tanpa env |
| R6 | CSP produksi hanya `'self'`/IPC | Sinkronisasi & aktivasi online diblokir sampai origin backend ditambahkan (OD-7) |
| R7 | Konten pilot DRAFT, belum direview | OD-1 + review manusia belum selesai; konten kelas 1–6 belum ada |
| R8 | Android release build belum dibuat | Hanya APK debug; DV Android NOT RUN |
| R9 | Auto-updater belum dikonfigurasi | DV-18 (update preservation) belum diuji |
| R10 | Backup tidak terenkripsi; retensi OPEN (OD-4) | Kebijakan data siswa belum final |
| R11 | Touch/4K/aksesibilitas perangkat belum diuji | DV-05/04 belum ada bukti |

## Gerbang rilis (harus semua hijau)

- [ ] OD-6 publisher & identifier final; signing certificate tersedia
- [ ] Public key lisensi produksi di-embed + rotasi key terdokumentasi
- [ ] Backend produksi + TLS + origin di CSP produksi (OD-7)
- [ ] DV-01…DV-20 PASS di perangkat fisik (Windows 11 + Android 14 + 4K + touch)
- [ ] Konten lengkap kelas 1–6 lulus review pedagogis (OD-1/OD-8)
- [ ] Installer diuji: install, launch, upgrade, uninstall, preserve data/lisensi
- [ ] Auto-updater + rollback diuji
- [ ] Kebijakan privasi/retensi/backup (OD-4) disetujui

## Catatan

Build ini adalah **verifikasi jalur build rilis**, bukan bukti kualitas produk atau kompatibilitas platform.
