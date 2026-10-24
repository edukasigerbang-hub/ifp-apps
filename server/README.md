# Server Referensi — Gerbang Edukasi

**Bukan backend produksi.** Server ini adalah implementasi kontrak untuk pengujian lokal/E2E dan rujukan implementasi. Hosting, TLS, database terkelola, dan identitas admin menunggu OD-7 ([proposal](../knowledge/api/PRODUCTION_BACKEND_PROPOSAL.md)).

## Menjalankan

```bash
SYNC_TOKEN=dev-token SYNC_DB_PATH=server/data/sync.db npm run server:dev
```

Opsional lisensi:

```bash
LICENSE_SIGNING_KEY_PATH=path/private.pem \
LICENSE_KEY_ID=dev-1 \
LICENSE_SEED_SERIALS=DEV-SERIAL-1 \
LICENSE_ADMIN_TOKEN=dev-admin \
npm run server:dev
```

Enrollment perangkat (OD-7 increment 1):

```bash
DEVICE_ENROLLMENT_CODE=kelas-3a \
DEVICE_TOKEN_SECRET=ganti-di-produksi \
DEVICE_TOKEN_TTL_SECONDS=86400 \
npm run server:dev
```

## Endpoint

Spesifikasi lengkap: [`openapi.v1.yaml`](openapi.v1.yaml).

| Method | Path | Auth | Catatan |
|---|---|---|---|
| GET | `/healthz` | — | Health check |
| POST | `/v1/devices/enroll` | kode enrollment | Mengembalikan token Bearer perangkat (HMAC-SHA256) |
| POST | `/v1/sync/events` | token perangkat **atau** `SYNC_TOKEN` | `deviceId` batch harus sama dengan token perangkat |
| POST | `/v1/activations` | — | Serial → lisensi bertanda tangan |
| POST | `/v1/licenses/refresh` / `verify` | — | Refresh/verifikasi lisensi |
| POST | `/v1/licenses/transfer` | token admin | Pindah perangkat |
| POST | `/v1/activations/deactivate` | token admin | Nonaktifkan lisensi |

## Catatan keamanan

- Token perangkat ditandatangani HMAC-SHA256 dengan `DEVICE_TOKEN_SECRET`; masa berlaku default 24 jam.
- `SYNC_TOKEN` statis hanya untuk referensi/pengujian; produksi harus memakai token perangkat + rotasi.
- Admin masih memakai token statis; produksi harus memakai identitas admin teraudit (OIDC/RBAC) — OD-7.
- Semua endpoint menolak body melebihi batas; rate limit per alamat.
