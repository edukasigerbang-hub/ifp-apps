# ADR-0018 — Siklus hidup profil: rename & hapus

- **Status:** Accepted (implemented) · **Tanggal:** 2026-10-24
- **Konteks:** Profil lokal sudah dapat dibuat dan diaktifkan (ADR-0015), tetapi belum dapat diubah namanya atau dihapus. Skema `learning_sessions`, `progress_snapshots`, dan `sync_outbox` mereferensikan profil tanpa `ON DELETE CASCADE`, sehingga penghapusan dangkal akan gagal atau meninggalkan data yatim. Kebijakan retensi data siswa (OD-4) belum diputuskan.

## Keputusan

1. **Rename** (`profile_rename`):
   - Nama di-trim, panjang 1–80 karakter, unik tanpa membedakan huruf besar/kecil.
   - Rename ke nama yang sama persis adalah no-op (tidak mengubah `updated_at`).
2. **Hapus** (`profile_delete`):
   - Profil terakhir tidak dapat dihapus (`PROFILE_LAST_REMAINING`).
   - Bila profil memiliki sesi/percobaan/respons/progres/outbox, penghapusan **ditolak** (`PROFILE_HAS_DATA`) kecuali pemanggil mengirim `deleteData: true`.
   - Dengan konfirmasi, seluruh data profil dihapus dalam satu transaksi: respons → percobaan → progres → sesi → event outbox yang memuat `profileId` → profil.
   - Menghapus profil aktif memindahkan profil aktif ke profil tersisa yang paling lama dibuat.
3. **UI** memakai konfirmasi dua langkah: tombol Hapus → panel konfirmasi → (bila ada data) panel kedua yang menjelaskan data akan ikut terhapus.
4. **Tidak ada soft delete** untuk saat ini; backup database (ADR-0012) menjadi jalur pemulihan. Bila OD-4 menetapkan retensi/penghapusan teraudit, semantik ini ditinjau ulang.

## Konsekuensi

- Penghapusan bersifat permanen dan tidak dapat dibatalkan dari dalam aplikasi.
- Event outbox yang belum terkirim milik profil ikut dihapus agar data yang dihapus tidak tersinkron kemudian.
- Belum ada audit trail penghapusan; belum ada undo.
- Nama profil adalah data pribadi; penghapusan mengurangi permukaan PII lokal.

## Alternatif

| Alternatif | Alasan ditolak |
|---|---|
| Soft delete (`deleted_at`) | Menambah filter di semua query dan belum ada kebijakan retensi (OD-4) |
| `ON DELETE CASCADE` di migrasi | Migrasi destruktif pada data pengguna; semantik konfirmasi tetap diperlukan |
| Menolak hapus profil yang punya data | Tidak menyelesaikan kebutuhan nyata (perangkat dipakai bergantian) |
