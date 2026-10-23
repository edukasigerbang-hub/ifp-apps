# ADR-0005 — Arsitektur client sinkronisasi

- **Status:** Accepted (client implemented; server pending) · **Tanggal:** 2026-10-23
- **Konteks:** Outbox sudah tersimpan atomik bersama hasil belajar (ADR-0004). Fase I membutuhkan pengiriman event yang tahan offline, idempoten, dan tidak menghapus data sebelum ack.

## Keputusan

1. **State outbox dikelola native** (Rust): `sync_list_pending`, `sync_mark_retry`, `sync_mark_acknowledged`, `sync_get_status`, `sync_get_device_id`.
2. **Engine orkestrasi di TypeScript** (`src/data/syncEngine.ts`): batching, validasi payload, backoff + jitter, pencocokan ack.
3. **Transport abstrak** (`SyncDeps.sendBatch`): implementasi default memakai `fetch`; dapat diganti untuk pengujian tanpa jaringan.
4. **Tidak ada penghapusan event**; status akhir `acknowledged` atau dead-letter (`failed`, `next_attempt_at = NULL`).
5. **Device ID** disimpan di `app_meta` (UUID v4, stabil setelah dibuat).
6. **Konfigurasi** lewat `VITE_SYNC_BASE_URL` dan `VITE_SYNC_TOKEN`, hanya untuk dev/testing.
7. **Mock server** (`scripts/mock-sync-server.mjs`) untuk kontrak dan E2E; CORS longgar hanya di dev.

## Alasan

- Transaksi outbox sudah atomik; memisahkan state mesin ke Rust menjaga invariant dan mencegah UI mengubah state langsung.
- Backoff/jitter dan pencocokan ack adalah logika murni yang mudah diuji di TS.
- Menghapus event setelah kirim akan menghilangkan bukti dan mencegah rekonsiliasi.

## Konsekuensi

- Produksi memerlukan backend + token perangkat + origin backend di CSP produksi (saat ini CSP produksi tidak mengizinkan host mana pun untuk connect).
- `VITE_SYNC_TOKEN` tidak boleh dipakai sebagai kredensial produksi.
- Belum ada UI konflik/duplikasi lanjutan; server harus idempoten per `eventId`.
- Retensi, rate limit, dan skema server tetap OPEN (OD-7/OD-4).

## Alternatif yang ditolak

| Alternatif | Alasan |
|---|---|
| Kirim langsung saat menyimpan hasil | Tidak ada retry; jaringan gagal = kehilangan sinkronisasi |
| Hapus event setelah POST sukses | Kehilangan audit; ack bisa hilang di tengah jalan |
| Sinkronisasi dari UI tanpa state native | UI bisa mengubah state outbox; rawan race |
| Plugin SQL JS | Tidak ada transaksi lintas panggilan (ADR-0004) |
