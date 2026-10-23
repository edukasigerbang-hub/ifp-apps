# ADR-0016 — Penjadwalan sinkronisasi otomatis

- **Status:** Accepted (implemented) · **Tanggal:** 2026-10-24
- **Konteks:** Client sync hanya berjalan saat tombol “Sinkronkan sekarang” ditekan. HLD/LLD mengharapkan event terkirim saat jaringan tersedia tanpa mengganggu pembelajaran.

## Keputusan

1. Scheduler berjalan saat aplikasi desktop dibuka **jika** `VITE_SYNC_BASE_URL`/`VITE_SYNC_TOKEN` dikonfigurasi.
2. Pemicu: 10 detik setelah mount, event `online`, event `ifp:outbox-changed` (debounce 2 detik, dipicu setelah hasil belajar disimpan), dan interval 5 menit.
3. `tick()` hanya berjalan bila `navigator.onLine` dan tidak ada proses sync lain (flag modul).
4. Kegagalan tidak menghentikan aplikasi; event tetap di outbox dan backoff dihitung engine/server state.
5. Tidak ada UI blocking; layar Pengaturan menampilkan status terkini saat dibuka.

## Konsekuensi

- Saat konfigurasi sync tersedia, aplikasi melakukan request jaringan latar belakang secara berkala.
- Aplikasi harus berjalan; tidak ada layanan background OS.
- Belum ada strategi baterai/backoff adaptif di scheduler (mengandalkan `next_attempt_at`).
- Konfigurasi produksi tetap memerlukan backend + token perangkat (OD-7).

## Alternatif

| Alternatif | Alasan ditolak |
|---|---|
| Hanya manual | Event menumpuk sampai pengguna menekan tombol |
| Background service OS | Kompleks dan di luar cakupan Tauri desktop |
| Interval sangat pendek | Boros baterai/jaringan |
