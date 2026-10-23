# ADR-0001 — App shell: Tauri 2 + React/TypeScript

- **Status:** Accepted (scaffolded) · **Tanggal:** 2026-10-23
- **Konteks:** HLD §7 menetapkan Tauri 2 + Rust sebagai kandidat app shell; target Windows 11 dan Android 14+ dengan pembelajaran offline-first, akses filesystem terkontrol, dan license manager native.

## Keputusan

Gunakan **Tauri 2 + Rust** sebagai app shell, **React 19 + TypeScript + Vite 8** untuk UI, **Tailwind CSS 4** untuk styling. Struktur: `src/` (frontend), `src-tauri/` (native).

## Alasan

- License manager dan content manager memerlukan native layer (Rust) sesuai HLD §6.6 dan LLD §8.
- Tauri memberi capability/permission model yang ketat (allowlist) — sesuai kebutuhan keamanan.
- React/TS memenuhi kebutuhan UI touch-first dan berbagi kontrak domain dengan web admin.

## Konsekuensi

- Dukungan platform **belum terbukti**: `VALIDATE` sampai DV-01/DV-02 PASS pada perangkat fisik.
- Perlu toolchain Rust MSVC di mesin build (terverifikasi tersedia: rustc 1.95.0, linker OK).
- WebView bergantung pada WebView2 (Windows) dan System WebView (Android); perbedaan codec/render harus diuji (risiko HLD §15).

## Alternatif yang ditolak (sementara)

| Alternatif | Alasan belum dipilih |
|---|---|
| Electron | Footprint lebih besar; native boundary lebih longgar untuk licensing |
| Flutter | Ekosistem konten HTML/Canvas/three.js kurang langsung untuk aktivitas interaktif |
| .NET MAUI | Tidak sesuai stack tim dan rencana konten berbasis web |

## Tindak lanjut

Technical spike Fase B wajib membuktikan Tauri berjalan di Windows 11 dan Android 14+ sebelum klaim kompatibilitas.
