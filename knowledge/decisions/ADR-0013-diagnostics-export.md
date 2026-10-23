# ADR-0013 — Diagnostics export tanpa secret

- **Status:** Accepted (implemented) · **Tanggal:** 2026-10-24
- **Konteks:** HLD §12 mewajibkan diagnostics export yang tidak memuat secret dan meminimalkan data pribadi.

## Keputusan

1. Command native `app_export_diagnostics` menulis **JSON** ke file baru (menolak menimpa).
2. Isi: versi aplikasi, OS/arch, daftar migrasi, jumlah baris tabel utama, jumlah event outbox per status, ringkasan status lisensi, dan metadata paket konten (tanpa isi).
3. **Diredaksi:** nama profil tidak disertakan; ID perangkat hanya 8 karakter pertama + `…`; payload/signature lisensi, serial, token, path pengguna, dan log mentah tidak disertakan.
4. UI Pengaturan menyediakan tombol **Ekspor diagnostik…** dengan dialog simpan.

## Konsekuensi

- File diagnostik tetap dapat mengungkap pola penggunaan (jumlah sesi/percobaan) dan prefix ID perangkat; perlakukan sebagai data internal.
- Belum ada unggah otomatis atau bundling log; pengguna mengirim file secara manual.
- Tidak ada data siswa, jawaban, atau konten lisensi di dalamnya.

## Alternatif

| Alternatif | Alasan ditolak |
|---|---|
| Menyertakan log mentah | Risiko memuat path/secret/data siswa |
| ID perangkat penuh | Tidak perlu untuk diagnosa awal |
| Menyertakan payload lisensi | Dapat mengungkap serial/entitlement |
| Unggah otomatis | Belum ada persetujuan privasi/backend |
