# ADR-0006 — Backend sinkronisasi referensi

- **Status:** Accepted sebagai **implementasi referensi** (bukan stack produksi final) · **Tanggal:** 2026-10-23
- **Konteks:** Client sinkronisasi sudah berjalan dan kontrak v1 tertulis, tetapi belum ada server yang menyimpan event. OD-7 (stack backend) belum diputuskan.

## Keputusan

1. Backend referensi: **TypeScript + `node:http` + `node:sqlite` + Zod**, tanpa framework tambahan.
2. Endpoint `POST /v1/sync/events` + `GET /health`; auth bearer token dari env; CORS untuk `http://localhost:1420`.
3. Idempotensi lewat tabel `sync_events(event_id PRIMARY KEY, device_id, …)`:
   - event sama + device sama → `duplicate`
   - event sama + device berbeda → `rejected` (`SYNC_EVENT_REJECTED`)
4. Batas: body 1 MB, payload/event 256 KB, 100 event/batch, rate limit 60 request/menit per alamat.
5. Data disimpan di `SYNC_DB_PATH` (default `server/data/sync.db`, gitignored).

## Alasan

- Membuktikan kontrak end-to-end tanpa menunggu keputusan stack.
- `node:sqlite` menghindari dependency native dan layanan eksternal pada tahap ini.
- Zod memakai kontrak yang sama dengan validator konten.

## Konsekuensi / batasan

- **Bukan produksi:** `node:sqlite` masih experimental, single-process, tanpa TLS, tanpa observability terpusat, rate limit in-memory.
- Token statis dari env; produksi memerlukan device token dari License Service dan rotasi.
- Belum ada PostgreSQL, replikasi, backup, retensi, atau audit trail.
- Payload lengkap disimpan di server untuk deduplikasi; kebijakan privasi/retensi OPEN (OD-4).
- Stack produksi tetap menunggu OD-7; kontrak dan test dapat dipakai ulang.

## Alternatif

| Alternatif | Alasan belum dipilih |
|---|---|
| Fastify/Express | Menambah dependency tanpa kebutuhan pada tahap referensi |
| PostgreSQL sekarang | Operasional belum siap; stack produksi belum diputuskan |
| Hanya mock server | Tidak membuktikan persistensi/idempotensi nyata |
