# Kontrak Sinkronisasi v1

**Status:** Client IMPLEMENTED (Fase I) · Server **BELUM ADA** · schema `1.0.0`
**Terkait:** [ADR-0005](../decisions/ADR-0005-sync-client.md) · [SCHEMA.md](../database/SCHEMA.md)

Server belum diimplementasikan. Kontrak ini mengikat perilaku client dan menjadi acuan backend saat OD-7 diputuskan.

## Endpoint

```http
POST /v1/sync/events
Authorization: Bearer <device-token>
Content-Type: application/json
```

- TLS wajib di produksi.
- Token perangkat diterbitkan License Service (belum ada); **jangan** menanam token produksi di bundle.
- Rate limit per device (usulan: 60 request/menit). `429` harus dihormati via `Retry-After`.

## Request

```json
{
  "deviceId": "<uuid>",
  "schemaVersion": "1.0.0",
  "events": [
    {
      "eventId": "<uuid>",
      "eventType": "assessment.completed",
      "createdAt": "2026-10-23T15:00:00.000Z",
      "payload": {
        "profileId": "<uuid>",
        "packageId": "matematika-kelas3-pecahan",
        "packageVersion": "0.1.0",
        "lessonId": "pecahan-sederhana",
        "activityId": "kuis-pecahan-sederhana",
        "attemptId": "<uuid>",
        "score": 100,
        "occurredAt": "2026-10-23T15:00:00.000Z",
        "answers": [
          { "questionId": "soal-setengah", "optionId": "opsi-setengah", "isCorrect": true }
        ]
      }
    }
  ]
}
```

Batas (usulan, wajib dikonfirmasi backend): maksimal **100 event** per batch, **256 KB** per event, **1 MB** per batch. Pelanggaran → `413`.

## Response

```json
{
  "acknowledgements": [
    { "eventId": "<uuid>", "status": "accepted", "errorCode": null },
    { "eventId": "<uuid>", "status": "duplicate", "errorCode": null },
    { "eventId": "<uuid>", "status": "rejected", "errorCode": "SYNC_EVENT_REJECTED" }
  ]
}
```

- `accepted` — event baru tersimpan.
- `duplicate` — `eventId` sudah pernah diterima (idempotent, tetap dianggap sukses).
- `rejected` — tidak diterima; client menjadwalkan retry dengan `errorCode`.
- Setiap event wajib punya acknowledgement; ack yang hilang diperlakukan sebagai retry.

## Perilaku client (MENGIKAT)

1. Ambil event eligible: `state IN ('pending','failed')`, `attempts < maxAttempts`, `next_attempt_at <= now`, urut `created_at, id`.
2. Maksimal 20 event per batch (konfigurasi default client).
3. Kirim batch; event dengan payload JSON rusak **tidak dikirim** dan dijadwalkan ulang (`SYNC_INVALID_PAYLOAD`).
4. `accepted`/`duplicate` → tandai `acknowledged` **hanya setelah** ack diterima dan disimpan lokal.
5. `rejected`, ack hilang, atau kegagalan jaringan → `attempts += 1`, state `failed`, backoff eksponensial + jitter:
   `delay = min(30s × 2^(attempt-1), 1 jam) × (0.8..1.2)`.
6. Setelah `maxAttempts` (5), `next_attempt_at = NULL` → dead-letter; tidak dikirim lagi otomatis.
7. **Event tidak pernah dihapus** sebelum ack; outbox dipertahankan untuk audit/rekonsiliasi.
8. Kegagalan sinkronisasi tidak boleh menghalangi belajar atau menyimpan hasil lokal.

## Kode error

| Kode | Sisi | Retryable |
|---|---|---|
| `SYNC_NETWORK_UNAVAILABLE` | client | ya |
| `SYNC_MISSING_ACK` | client | ya |
| `SYNC_INVALID_PAYLOAD` | client | ya (sampai dead-letter) |
| `SYNC_EVENT_REJECTED` | server | ya |
| `SYNC_UNAUTHORIZED` | server | tidak (token perlu diperbaiki) |
| `SYNC_INVALID_BATCH` / `SYNC_INVALID_EVENT` | server | tidak |

## Status HTTP

`200` sukses · `400` batch tidak valid · `401` token tidak valid · `413` terlalu besar · `429` rate limit · `5xx` retryable.

## Keamanan & privasi

- Authorization diverifikasi server-side; rate limit + audit per device.
- Payload tidak memuat nama/serial siswa; ID profil lokal tidak dipetakan ke identitas cloud sampai proses linking eksplisit (LLD §7).
- Jangan mencatat token, serial, atau payload mentah berisi data siswa.
- Retensi & penghapusan data server: **OPEN (OD-4)**.

## Dev / mock

```bash
npm run sync:mock         # server mock di :8787, token dev-token
VITE_SYNC_BASE_URL=http://localhost:8787 VITE_SYNC_TOKEN=dev-token npm run tauri dev
```

- Mock menerima CORS dari `http://localhost:1420` (header `*`) untuk pengembangan saja.
- CSP dev mengizinkan `http://localhost:8787`; **CSP produksi belum mengizinkan backend mana pun** — origin backend wajib ditambahkan ke `csp.connect-src` saat backend dipilih.
- Token via env hanya untuk dev; produksi harus memakai token perangkat dari License Manager.

## Open items (OD-7)

1. Stack backend dan host.
2. Penerbitan/rotasi device token.
3. Skema penyimpanan server + deduplication store.
4. Batas ukuran/rate limit final.
5. Retensi data & kepatuhan privasi.
