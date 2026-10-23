# ADR-0007 — Content Manager: staging, aktivasi atomik, rollback

- **Status:** Accepted (implemented) · **Tanggal:** 2026-10-23
- **Konteks:** Fase F membutuhkan impor paket yang aman: validasi, staging, aktivasi atomik, dan rollback, tanpa membuat UI menyentuh filesystem.

## Keputusan

1. **Native Rust** (`src-tauri/src/content.rs`) menangani impor, validasi struktural, penyalinan, dan aktivasi.
2. Penyimpanan terkelola: `app_data_dir()/content/{staging,packages}/`.
   Versi disimpan immutable di `packages/<packageId>/<version>/`.
3. Alur impor: kumpulkan file → validasi path/ukuran/jumlah → parse manifest → verifikasi SHA-256 aset → salin ke staging → `rename` ke folder versi → aktivasi DB dalam transaksi.
4. Aktivasi DB: satu versi `active` per paket; versi aktif sebelumnya menjadi `disabled`; `activated_at` dicatat (migrasi 0003).
5. Rollback: memilih versi `disabled` hasil impor dengan `activated_at` lebih lama, lalu menukar status dalam transaksi. Rollback satu langkah; tidak menghapus file.
6. Folder dipilih lewat `tauri-plugin-dialog`; command menerima path dan tetap memvalidasi ulang (path dari UI tidak dipercaya).
7. Batas: 5.000 file, 2 GiB total, kedalaman 12, symlink ditolak, file non-reguler ditolak.

## Konsekuensi

- Paket impor **belum** dirender Player: loader masih memakai paket bundled via `import.meta.glob`; Content Runtime perlu dihubungkan ke versi aktif DB (pekerjaan berikut).
- Signature paket belum diverifikasi; hanya hash aset + struktur.
- Rollback hanya satu langkah dan tidak menghapus versi.
- Impor bersifat sinkron; paket besar dapat memblokir UI sampai selesai.
- Tidak ada impor ZIP; sumber harus direktori.

## Alternatif

| Alternatif | Alasan ditolak |
|---|---|
| Copy langsung ke folder aktif | Update terputus dapat merusak paket aktif |
| Validasi hanya di TypeScript | Path dari UI tetap harus divalidasi di batas native |
| Hapus versi lama saat update | Menghilangkan rollback dan bukti |
| Impor via `public/` | Tidak writable setelah bundling (HLD) |
