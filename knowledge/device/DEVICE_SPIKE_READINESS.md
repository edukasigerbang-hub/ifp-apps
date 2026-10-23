# Device Spike Readiness — T-009

**Status:** **PARTIAL / BLOCKED untuk acceptance** · 2026-10-23
**Build Android:** PASS · **Install/launch:** NOT RUN (tidak ada perangkat) · **Windows 11:** NOT RUN (mesin Windows 10)

## Lingkungan aktual

| Item | Nilai | Dampak |
|---|---|---|
| OS pengembangan | Windows 10 Home 10.0.19045 | Target produk Windows 11 → DV-02 tidak bisa diklaim |
| CPU/RAM | x64 · 16 GB | Memenuhi minimum RAM 8 GB (bukan bukti perangkat target) |
| Resolusi | 1920×1080 @96 DPI | Full HD tersedia; **4K tidak** |
| Disk bebas | C: 44.1 GB · F: 64.7 GB | Cukup untuk build; DV-16 belum diuji |
| Android SDK | `F:\AndroidSdk` (platforms 34/35/36, build-tools 34/35/36) | Siap build |
| NDK | 28.2.13676358 | Siap build |
| Java | OpenJDK 17.0.20 | Siap |
| adb | `F:\AndroidSdk\platform-tools\adb.exe` | Ada; **0 perangkat terhubung** |
| Rust target Android | aarch64, armv7, i686, x86_64 (dipasang via `tauri android init`) | Siap |
| WebView2 (Windows) | 156.0.4314.42 | Siap desktop |

## Yang sudah dijalankan

1. `npx tauri android init --ci` → project Android dibuat, Rust targets terpasang.
2. `npx tauri android build --debug -t aarch64` → **exit 0**.
   - APK: `src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk` (**129 MB**, debug/universal).
   - AAB: `.../bundle/universalDebug/app-universal-debug.aab`.
   - Catatan: Kotlin daemon sempat gagal karena cache lintas-drive (C: vs F:); Gradle beralih ke compile tanpa daemon dan build tetap sukses.
3. `adb devices` → daftar kosong; tidak ada instalasi/launch.
4. `tauri build` Windows **belum** dijalankan; installer belum dibuat.

## Matriks DV (jujur)

| ID | Status | Catatan |
|---|---|---|
| DV-01 Build/install Android 14 | **PARTIAL** | Build APK PASS; install/launch NOT RUN |
| DV-02 Build/install Windows 11 | **NOT RUN** | Mesin Windows 10; butuh perangkat Win11 |
| DV-03 Full HD layout | **NOT RUN (target)** | Screenshot 1920×1080 di Win10 bukan acceptance perangkat |
| DV-04 4K | **NOT RUN** | Tidak ada panel 4K |
| DV-05 Touch IFP | **NOT RUN** | Tidak ada perangkat sentuh |
| DV-06 SQLite migrasi | **PARTIAL** | Teruji di desktop (6+ test Rust); belum di Android |
| DV-07 Android document picker | **NOT RUN** | Perlu implementasi picker + perangkat |
| DV-08 Windows managed folder | **NOT RUN** | Fitur belum diimplementasikan |
| DV-09 Paket invalid | **PARTIAL** | Validator menolak (test); belum di perangkat |
| DV-10 Update terputus | **NOT RUN** | Content Manager belum ada |
| DV-11 Codec media | **NOT RUN** | Belum ada media produksi |
| DV-12 WebGL/3D | **NOT RUN** | Belum ada konten 3D |
| DV-13 Cold launch offline | **PARTIAL** | Desktop offline; belum di perangkat |
| DV-14 Sync reconnect | **PARTIAL** | E2E backend desktop; belum di perangkat |
| DV-15 Aktivasi lisensi | **NOT RUN** | License core belum ada |
| DV-16 Low disk | **NOT RUN** | — |
| DV-17 Force close update | **NOT RUN** | — |
| DV-18 App update preserve | **NOT RUN** | — |
| DV-19 Invalid signature | **NOT RUN** | Signature belum diimplementasikan |
| DV-20 Long run | **NOT RUN** | — |

## Blocker

1. **Tidak ada perangkat Android 14 fisik** (hanya emulator/system image; emulator tidak menggantikan acceptance).
2. **Tidak ada mesin Windows 11**; target DV-02/03/04/08 tidak dapat dijalankan.
3. **Tidak ada panel 4K/touch IFP**.
4. Fitur yang diuji DV-07/10/15/19 belum diimplementasikan (picker, Content Manager, license, signature).

## Langkah saat perangkat tersedia

```powershell
# Android 14 fisik (USB debugging aktif)
& "F:\AndroidSdk\platform-tools\adb.exe" devices
& "F:\AndroidSdk\platform-tools\adb.exe" install -r `
  "F:\_ifp-apps\src-tauri\gen\android\app\build\outputs\apk\universal\debug\app-universal-debug.apk"
& "F:\AndroidSdk\platform-tools\adb.exe" shell am start -n id.gerbangedukasi.ifp/.MainActivity

# Windows 11 (di mesin target)
npm run tauri build
```

Catat perangkat, OS build, RAM, resolusi, versi app, artefak, hasil, dan issue. **Jangan menulis PASS tanpa bukti** (lihat `DEVICE_VALIDATION.md` §5).

## Kesimpulan

T-009 baru menyelesaikan **build-path spike** (Android compile + packaging). Acceptance perangkat tetap **BLOCKED**; tidak ada klaim kompatibilitas platform.
