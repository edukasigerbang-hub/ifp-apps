# Memory — L1 Project (VERIFIED)

Hanya pengetahuan reusable yang sudah terverifikasi dari dokumen sumber. Jangan menyalin isi HLD/LLD penuh.

## Identitas

- Produk: **Gerbang Edukasi — IFP Apps**, platform belajar SD 1–6 di Interactive Flat Panel.
- Product ID teknis: `ifp-learning` (PROPOSED). Identifier: `id.gerbangedukasi.ifp` (PROPOSED).
- Otentikasi online **tidak wajib**; belajar, profil, progres, dan hasil bersifat lokal-first.
- Sinkronisasi cloud, unduhan konten, aktivasi = opsional.

## Invariant yang tidak boleh dilanggar

1. Offline-first: kegagalan jaringan tidak boleh menghalangi belajar.
2. Semua paket/file impor = tidak tepercaya; validasi sebelum staging/aktivasi.
3. Aktivasi konten atomik; gagal → versi lama tetap aktif.
4. Hasil belajar + event outbox ditulis dalam **satu transaksi**.
5. Respons evaluasi historis append-only; dilarang last-write-wins untuk menghapus jawaban.
6. Lisensi diverifikasi di **Rust/native**; UI hanya menampilkan.
7. Private signing key tidak pernah di klien; client hanya public key/key rotation set.
8. Tidak ada eksekusi kode arbitrer dari paket; tipe aktivitas hanya dari registry.
9. SQLite menyimpan metadata, bukan media biner besar.
10. UI tidak menyentuh SQLite/API/filesystem/lisensi langsung.

## Konvensi

- ID domain: UUID/ULID. Waktu: UTC ISO-8601. Versi paket: SemVer.
- Migrasi DB bernomor + checksum + diuji dari versi sebelumnya.
- Error: `code`, `message` aman, `retryable`, `correlationId`.
- Status bukti: PASS / FAIL / NOT RUN — tanpa rekayasa.

## Status platform

- Windows 11, Android 14+, RAM 8 GB, storage 128 GB, FHD/4K = **target kompatibilitas**, belum diuji.
- DV-01…DV-20 = NOT RUN.

## Jebakan yang sudah diketahui

- `REPLACE_WITH_REAL_HASH` pada contoh manifest LLD = placeholder, bukan paket valid.
- `public/` setelah bundling bukan storage yang bisa diasumsikan writable → gunakan app-data.
- Revocation offline tidak real-time → perlu grace policy transparan.
- Clock rollback hanya sinyal risiko, bukan kontrol tunggal.

## Sumber

Root `HLD.md` (v1.1, sha256 `06c85df1…`), `LLD.md` (`29f7fa3e…`), `IMPLEMENTATION_CONTRACT.md` (`356c1ae6…`), `DEVICE_VALIDATION.md` (`c59df7be…`). Jika memory berbeda dengan sumber → **sumber menang**, memory diperbarui.
