# ADR-0017 — CI pipeline dan harness E2E

- **Status:** Accepted (implemented) · **Tanggal:** 2026-10-24
- **Konteks:** Seluruh verifikasi E2E sebelumnya dijalankan ad-hoc lewat CDP lalu dibuang. Tidak ada pipeline CI, sehingga regresi hanya tertangkap bila seseorang menjalankan perintah secara manual. Register gap mencatat "CI otomatis" dan "E2E CDP tidak masuk `npm test`" sebagai gap terbuka.

## Keputusan

1. **CI** di `.github/workflows/ci.yml`:
   - Job `web` (Ubuntu): `npm ci`, `npm test` (unit + golden fixture), `npm run build`, typecheck & test server.
   - Job `rust` (Windows): build frontend lalu `cargo test` dengan cache Cargo.
2. **Skrip lokal** `npm run ci` menjalankan rangkaian web+server yang sama.
3. **Harness E2E** `scripts/e2e/`:
   - `npm run e2e` (skenario `smoke`) menjalankan `tauri dev` dengan `IFP_DATA_DIR` direktori sementara di luar repo dan WebView2 remote debugging pada port 9224.
   - Klien CDP memakai `fetch`/`WebSocket` bawaan Node 24 — tanpa dependensi baru.
   - Skenario berada di `scripts/e2e/scenarios/*.mjs`; artefak (screenshot, `result.json`) di `.tmp-e2e/` yang di-gitignore.
   - Proses aplikasi dan seluruh anak proses dimatikan di blok `finally`; port 1420/9224 dibersihkan bila ada sisa.
4. **E2E tidak dijalankan di CI headless**: butuh sesi desktop Windows + WebView2. Ini dicatat eksplisit, bukan disembunyikan.

## Konsekuensi

- Regresi build/test dasar tertangkap otomatis pada push/PR setelah repo memiliki remote.
- E2E menjadi dapat diulang dan menghasilkan bukti (screenshot + ringkasan langkah), menggantikan skrip sementara.
- Skenario E2E masih terbatas pada alur yang dapat diotomasi tanpa dialog native (impor berkas, backup, lisensi tetap manual).
- Penambahan skenario baru cukup menambah modul di `scenarios/` lalu mendaftarkan script npm bila perlu.

## Alternatif

| Alternatif | Alasan ditolak |
|---|---|
| Playwright/WebdriverIO | Menambah dependensi besar (G5) hanya untuk WebView2 yang sudah punya CDP |
| E2E di CI headless | WebView2 + sesi desktop tidak dapat diandalkan di runner; hasil bisa menyesatkan |
| Hanya unit test | Tidak menangkap regresi integrasi UI ↔ command native |
