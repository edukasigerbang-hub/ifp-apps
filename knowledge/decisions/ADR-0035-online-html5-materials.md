# ADR-0035 — Materi Daring HTML5 di Luar Paket Konten

**Status:** Accepted (defaults via sesi 2026-10-28) — penampil + pemasang ZIP bertanda tangan sudah ada; katalog/unduhan server belum · **Tanggal:** 2026-10-28
**Terkait:** [Kontrak bundel materi v1](../content/MATERIAL_BUNDLE_CONTRACT.md) · [ADR-0003](ADR-0003-content-package-contract.md) · [CONTENT_SCHEMA v1](../content/SCHEMA.md) · [IMPLEMENTATION_CONTRACT.md §3](../../IMPLEMENTATION_CONTRACT.md)

## Konteks

- PO meminta materi yang dibuat di platform (editor/content creator berbasis HTML5 animation) disimpan di server Gerbang Edukasi dan muncul di **Jelajah Materi** aplikasi desktop setelah dipublikasikan. Editor halaman di mu-komik yang dibuka PO hanya **acuan tampilan**, bukan integrasi.
- Aplikasi kini offline-first: konten berupa paket JSON yang divalidasi Zod ([SCHEMA.md](../content/SCHEMA.md)), dimuat lewat Content Manager (staging → aktivasi atomik → rollback). CSP aplikasi saat ini `default-src 'self'; script-src 'self'` (`src-tauri/tauri.conf.json`), jadi skrip dari luar memang tidak bisa dijalankan di shell utama.
- Kontrak paket v1 **secara sengaja** menolak `script/entry/eval/exec/...` di `interactionConfig`, dan `IMPLEMENTATION_CONTRACT.md` §3 melarang menambahkan *arbitrary code execution* dari paket konten tanpa persetujuan eksplisit.
- Materi HTML5 berarti menjalankan kode pihak ketiga di dalam aplikasi. Ini keputusan batas keamanan, bukan sekadar fitur UI — karena itu ADR ini semula **Proposed**, dan `IMPLEMENTATION_CONTRACT.md` §3 mensyaratkan persetujuan eksplisit. PO memberi persetujuan pada **2026-10-28** ("setujui usulan OD lalu lanjut prototipe") untuk menjalankan materi bertanda tangan Gerbang Edukasi di dalam iframe tersandbox seperti di bawah.

## Keputusan

1. **Jenis konten baru `material`**, berdampingan dengan `package`. Bukan tipe aktivitas baru: materi tidak punya `activityIds`, asesmen, atau skor.
2. **Katalog daring + unduh-sekali**, bukan streaming. Setelah diunduh, materi dipakai offline. Katalog disimpan cache; bila kedaluwarsa ditandai, bukan dikosongkan.
3. **Bundel = ZIP** berisi `material.json`, `index.html`, dan aset. Wajib **self-contained**: tanpa CDN, font eksternal, atau panggilan jaringan saat runtime.
4. **Integritas dan asal**: manifest ditandatangani Ed25519 dengan kunci konten **terpisah** dari kunci lisensi; setiap berkas ber-SHA-256; aplikasi menolak bundel tanpa tanda tangan valid. Kanonikalisasi JSON memakai RFC 8785 (JCS).
5. **Isolasi render**: `iframe sandbox="allow-scripts allow-forms"` (tanpa `allow-same-origin`, tanpa `allow-top-navigation`) yang memuat `ifp-content://<materialId>/<version>/index.html` dari folder aplikasi. CSP aplikasi diperluas **hanya** dengan `frame-src ifp-content:`. Webview Tauri terpisah ditolak untuk v1: pengalaman keluar dari shell dan biaya Rust tidak sepadan.
6. **Jembatan `postMessage` minimal**: anak→induk hanya `ready`, `progress`, `complete`, `request-exit`; induk→anak hanya `config`. Induk memverifikasi `event.source === iframe.contentWindow` dan bentuk pesan ketat; pesan tak dikenal diabaikan. Tanpa PII.
7. **Aktivasi atomik**: unduh → verifikasi hash zip + tanda tangan → staging → aktifkan satu versi per `materialId`. Versi lama disimpan untuk rollback; pembersihan LRU saat melewati batas cache.
8. **Tanpa skor.** `complete` (opsional) hanya mencatat "selesai dibaca" di tabel terpisah; tidak masuk Hasil Belajar bergaya attempt sampai ada keputusan produk.
9. **A11y mengikat**: transkrip teks wajib, kontrol keyboard untuk aksi utama, tanpa audio autoplay, hormati *reduced motion*, dan tombol keluar selalu ada **di shell** (bukan di dalam iframe). Harness a11y memeriksa kontainer + transkrip, bukan isi animasi.
10. **Platform bertanggung jawab** menghasilkan bundel sesuai [MATERIAL_BUNDLE_CONTRACT.md](../content/MATERIAL_BUNDLE_CONTRACT.md) saat publish: validasi, tanda tangan, hash, baris katalog.

## Konsekuensi

- Dua jalur konten: paket terstruktur (berskor, mengisi Hasil Belajar) dan materi HTML5 (tanpa skor). Jelajah Materi perlu membedakan keduanya secara visual.
- Permukaan keamanan bertambah: WebView2 menjalankan kode pihak ketiga. Mitigasi berlapis — tanda tangan, hash, sandbox opaque-origin, tanpa akses IPC Tauri, `frame-src` sempit, larangan jaringan dari bundel, batas ukuran. Risiko yang **tidak** bisa dihilangkan: kerentanan renderer terhadap konten berbahaya; karena itu hanya bundel bertanda tangan Gerbang Edukasi yang diterima.
- Perubahan yang dibutuhkan: CSP `frame-src`, protokol kustom di Rust (`ifp-content://`), perintah unduh + verifikasi, tabel state materi, layar/overlay penampil, entri Jelajah Materi, skenario E2E + a11y baru.
- Batas **50 MB per bundel** dan anggaran cache **2 GB per perangkat** (LRU) menuntut unduhan yang bisa dibatalkan dan penanda sisa ruang di UI.
- Offline tetap terjaga **setelah** unduhan; katalog offline menampilkan cache terakhir dengan penanda kedaluwarsa.
- Paket konten v1 tidak berubah: larangan skrip di `interactionConfig` tetap berlaku.

## Urutan implementasi

1. Kontrak dibekukan (dokumen ini + `MATERIAL_BUNDLE_CONTRACT.md`). — selesai 2026-10-28
2. Prototipe penampil dengan **satu bundel contoh lokal** (tanpa server) untuk menguji isolasi, fullscreen, Esc, dan a11y kontainer. — selesai 2026-10-28 (T-114): iframe sandbox + protokol `ifp-content` + penampil modal; E2E `material-viewer` 8/8
3. Katalog + pengunduh + verifikasi tanda tangan.
   - 3a. **Pemasang bundel lokal** (ZIP + sidecar `.sig`) — selesai 2026-10-28 (T-115): manifest ketat §4, verifikasi Ed25519 per `keyId`, hash per berkas, staging → rename atomik, tabel `material_install`, daftar/buka di layar Konten, alat `scripts/material-pack.mjs`, E2E `material-import` 12/12.
   - 3b. **Katalog + unduhan dari server** (Worker `/v1/materials`, URL pre-signed, verifikasi `bundleSha256`) — **sisi aplikasi selesai 2026-10-28 (T-117)** dengan `reqwest` 0.13.5 (persetujuan G5 user): `material_catalog.rs` (ETag + cache SQLite `0012`, URL pre-signed tanpa simpan, tanda tangan diverifikasi sebelum unduh, `bundleSha256` diperiksa sebelum pasang), bagian “Jelajah materi daring” di layar Konten, server referensi `scripts/mock-catalog-server.mjs`, E2E `material-catalog` 8/8. **Sisi platform selesai sebagai kode 2026-10-29 (T-123), belum terpasang**: `workers/api/src/materials.ts` + `materialManifest.ts` (GET `/v1/materials` dengan filter §6 + ETag + URL pre-signed OD-12 ±10 menit; POST `/v1/materials/publish` dengan validator §4 + pemeriksaan ZIP + simpan Storage + tanda tangan Ed25519 atas manifest hasil baca ulang; POST `/v1/materials/unpublish`), `supabase/migrations/0004_material_catalog.sql` (belum dijalankan), `scripts/material-publish.mjs` (penerbit; tidak pernah memegang kunci konten). 18 test `workers/api/src/materials.test.ts` hijau dan alur penerbit→Worker→katalog diverifikasi dengan Supabase ditiru. Yang tersisa aksi pemilik project: jalankan migrasi 0004, buat bucket private `material-bundles`, `wrangler secret put CONTENT_SIGNING_KEY` + deploy, dan bakar publik key pasangan ke build aplikasi lewat `IFP_CONTENT_KEYS` (OD-11) — tanpa itu perangkat menolak bundel. Sematan materi juga sudah ada (T-116).
4. Progres baca, semat, dan pembersihan cache. — semat **selesai** (T-116); `material_progress` dan LRU **belum**.

## Keputusan yang dikonfirmasi (2026-10-28)

| ID | Pertanyaan | Keputusan |
|---|---|---|
| OD-10 | Materi tayang saat `draft`? | Katalog publik hanya memuat `reviewStatus` `reviewed` atau `approved`. Materi `draft` terlihat **hanya** di mode admin aplikasi. Endpoint katalog tidak pernah mengembalikan `draft` tanpa otorisasi admin. |
| OD-11 | Penitipan private key konten | Private key Ed25519 disimpan sebagai **secret Worker** (`CONTENT_SIGNING_KEY`), tidak pernah masuk repo maupun bundel. Rotasi memakai `keyId` baru; aplikasi membawa daftar kunci publik dan rilis aplikasi mendahului pemakaian kunci baru. KMS **tidak** dipakai untuk v1; ditinjau ulang bila jumlah penandatangan > 1. |
| OD-12 | Penyimpanan & URL unduhan | Bundel disimpan di **Supabase Storage** (bucket privat) dan diunduh lewat **URL pre-signed berumur 10 menit** yang dibuat Worker saat katalog diminta. Worker tidak mem-proxy isi bundel. |
| OD-13 | Batas ukuran & cache | **50 MB** per bundel; anggaran cache **2 GB** per perangkat; pengusiran **LRU** berdasarkan `last_opened_at`, materi yang sedang dibuka atau disematkan tidak diusir. Melebihi batas bundel → `MATERIAL_TOO_LARGE`. |
| OD-14 | "Selesai dibaca" di Hasil Belajar | **Tidak** ditampilkan di Ringkasan belajar / Hasil Belajar untuk sekarang. Sinyal `complete` hanya disimpan di `material_progress` dan boleh tampil sebagai penanda kecil di kartu materi. Dibuka kembali bila PO meminta. |
