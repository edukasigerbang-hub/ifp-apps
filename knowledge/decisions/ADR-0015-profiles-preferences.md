# ADR-0015 — Profil lokal dan preferensi

- **Status:** Accepted (implemented) · **Tanggal:** 2026-10-24
- **Konteks:** Sebelumnya hanya ada satu profil hardcoded (“Siswa Lokal”) di localStorage, dan preferensi belum tersedia. HLD membutuhkan profil lokal, sesi per profil, serta preferensi tampilan.

## Keputusan

1. Profil disimpan di tabel `profiles` (id UUID, nama, tipe `student|teacher`, timestamp).
2. Profil aktif disimpan di `app_meta` key `active_profile_id`; bila kosong, profil pertama dipakai atau “Siswa Lokal” dibuat otomatis.
3. Command: `profile_list`, `profile_create`, `profile_get_active`, `profile_set_active`.
4. Sesi belajar memakai profil aktif (`ensureLocalProfile` → `profile_get_active`), sehingga `learning_sessions`/hasil terikat ke profil.
5. Preferensi disimpan JSON di `app_meta` key `preferences`: `reducedMotion`, `fontScale` (`normal|large`).
6. Preferensi diterapkan sebagai kelas pada `<html>`: `reduce-motion` (animasi/transisi dimatikan) dan `font-large` (root 112.5%).
7. UI Pengaturan: daftar/aktifkan profil, form tambah profil, toggle animasi, dan ukuran teks.

## Konsekuensi

- Mengganti profil saat Player terbuka tidak memindahkan sesi berjalan; sesi baru mengikuti profil setelah Player di-mount ulang.
- Belum ada hapus/rename profil, PIN/orang tua, atau pembatasan peran; tipe `teacher` baru label.
- Preferensi suara belum diterapkan (belum ada audio).
- Preferensi bersifat perangkat, bukan per profil.

## Alternatif

| Alternatif | Alasan ditolak |
|---|---|
| Profil di localStorage | Tidak ikut backup/DB dan tidak transaksional |
| Preferensi per profil | Belum ada kebutuhan; menambah kompleksitas skema |
| Banyak preferensi sekaligus | Hanya preferensi dengan efek nyata yang diimplementasikan |
