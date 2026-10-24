# ADR-0026 — Default kebijakan lisensi (provisional, OD-5)

- **Status:** Accepted (provisional) · **Tanggal:** 2026-10-24
- **Konteks:** [Proposal OD-5](PROPOSAL-OD-5-license-policy.md) meminta keputusan komersial/legal. Sampai keputusan itu ada, implementasi memerlukan semantik default yang aman dan teruji.

## Keputusan (default sementara)

1. **Grace offline**: 7 hari (default `LICENSE_GRACE_DAYS`); belum diubah menjadi kebijakan final.
2. **Refresh**: manual/status; interval 30 hari adalah rekomendasi, belum ada penjadwalan otomatis khusus lisensi.
3. **Deteksi clock rollback**:
   - waktu terakhir terverifikasi disimpan di `app_meta.license_last_seen_at`;
   - jika `now + 5 menit < last_seen`, validitas dievaluasi pada `last_seen` (tidak memperpanjang masa berlaku) dan status diberi `LICENSE_CLOCK_ROLLBACK`;
   - `last_seen` tidak dimundurkan saat rollback;
   - ini mitigasi klien, bukan penegakan kriptografis — server tetap otoritas saat online.
4. **Transfer perangkat**: klien hanya mengekspor **permintaan transfer** (`licenseId`, `machineId`, `requestId`, alasan ≤500, waktu). Admin memproses lewat server; perangkat lama dinonaktifkan. Tidak ada transfer mandiri dari klien.
5. **Revocation**: ditandai server; klien menolak pada refresh berikutnya. Perangkat offline tidak dapat mengetahui revocation sampai online.
6. **Entitlements** saat ini `core`; fitur berbayar lain menunggu keputusan OD-5.

## Konsekuensi

- Pengguna dengan jam mundur melihat peringatan dan validitas tidak bertambah.
- Pengguna dapat memanipulasi `last_seen` lokal; karena itu server tetap melakukan verifikasi saat refresh/aktivasi.
- Transfer bergantung pada admin; belum ada antrean permintaan di server.
- Kebijakan final (grace, transfer limit, refund/revocation) masih menunggu OD-5.

## Alternatif

| Alternatif | Alasan ditolak |
|---|---|
| Menolak lisensi saat jam mundur | Dapat mengunci perangkat yang jamnya salah lalu diperbaiki |
| Transfer mandiri dari klien | Menghilangkan kontrol admin & audit server |
| Mengabaikan clock rollback | Memungkinkan perpanjangan grace dengan memundurkan jam |
