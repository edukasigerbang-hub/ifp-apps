# Proposal OD-7 — Backend/API Produksi

**Status:** DRAFT untuk keputusan · **Tanggal:** 2026-10-24 · **Pemilik keputusan:** Product Owner + Tech Lead
**Bukan implementasi.** Dokumen ini merangkum opsi, rekomendasi arsitektur, dan keputusan yang harus diambil sebelum Fase J (publish) dan Fase I (sinkronisasi produksi) dilanjutkan.

## 1. Lingkup

| Area | Wajib untuk rilis? | Catatan |
|---|---|---|
| Sinkronisasi hasil belajar (`SYNC_CONTRACT`) | Ya | Outbox sudah ada; backend referensi belum produksi |
| Lisensi perangkat (aktivasi/refresh/transfer) | Ya | Ed25519 sudah; issuance & hosting belum |
| Publikasi konten + kanal rilis | Ya (konten lengkap) | Manifest bertanda tangan + unduhan offline |
| Admin/RBAC + audit | Ya (tata kelola konten) | Review lokal sudah ada; persetujuan global belum |
| Analitik/telemetri | Tidak | Hanya jika OD-4 mengizinkan, opt-in |

Non-goal: LMS lengkap, akun siswa terpusat, nilai rapor, integrasi DAPODIK (perlu keputusan terpisah).

## 2. Opsi Arsitektur

| Kriteria | A. Managed BaaS | B. Self-hosted penuh | **C. API sendiri + layanan terkelola (rekomendasi)** |
|---|---|---|---|
| Kecepatan awal | Cepat | Lambat | Sedang |
| Kontrol data/residensi | Rendah–sedang | Tinggi | Tinggi |
| Beban operasional | Rendah | Tinggi | Sedang |
| Lock-in | Tinggi | Rendah | Rendah |
| Kepatuhan/data siswa | Tergantung vendor | Penuh | Penuh (DB/storage di wilayah pilihan) |
| Kecocokan offline-first + signing | Perlu adaptasi | Natural | Natural |

**Rekomendasi C:** API container (TypeScript/Node — kontrak referensi sudah ada), **PostgreSQL terkelola**, **object storage S3-compatible** untuk paket konten, CDN opsional untuk unduhan paket. Vendor & wilayah tetap terbuka sampai keputusan Anda.

## 3. Bentuk yang Diusulkan (vendor-neutral)

```text
[App Tauri] --HTTPS--> [API gateway/TLS]
                          |-- Auth service (device + admin)
                          |-- Sync service  (/v1/sync)
                          |-- License service (/v1/licenses*)
                          |-- Content service (/v1/content/*)
                          |-- Admin/audit (RBAC)
                          +--> PostgreSQL (metadata, outbox server, audit)
                          +--> Object storage (paket konten, backup)
                          +--> KMS/HSM (kunci signing lisensi & konten)
```

- **Tanpa state di memori**: idempotensi berbasis `eventId`/`requestId` disimpan di DB.
- **Rate limit** per perangkat/token; batas body sesuai `SYNC_CONTRACT`.
- **Observability**: log terstruktur tanpa PII, metrik latensi/error, alert backlog sync.
- **Backup**: RPO/RTO ditetapkan pada keputusan (usulan awal RPO 24 jam, RTO 4 jam).

## 4. Autentikasi & RBAC

1. **Perangkat**: enrollment sekali (kode dari admin/sekolah) → `device_id` + token perangkat berumur pendek + refresh; token disimpan di secure storage OS. Bukan login siswa.
2. **Admin/reviewer/publisher**: OIDC/SSO organisasi (atau akun lokal sebagai fallback).
3. **Peran minimum**: `viewer`, `reviewer`, `publisher`, `admin`. Hanya `publisher/admin` boleh merilis; `reviewer` tidak boleh merilis kontennya sendiri.
4. **Audit append-only** untuk: enrollment, aktivasi/transfer lisensi, publish/rollback konten, perubahan peran.
5. **Kunci**: signing lisensi & konten di KMS/HSM; rotasi dengan `keyId` (sudah didukung format lisensi).

## 5. Permukaan API (ringkas)

| Grup | Endpoint | Status kontrak |
|---|---|---|
| Sync | `POST /v1/sync/events`, `GET /v1/sync/status` | Sudah ada di `SYNC_CONTRACT` |
| License | `POST /v1/activations`, `POST /v1/licenses/refresh`, `POST /v1/activations/deactivate`, `POST /v1/licenses/transfer` | Referensi sudah ada |
| Content | `GET /v1/content/feed?channel=stable`, `GET /v1/content/packages/:id/:version`, `POST /v1/content/admin/publish`, `POST /v1/content/admin/revoke` | Baru — perlu spesifikasi |
| Admin | `POST /v1/devices`, `POST /v1/devices/:id/revoke`, `GET /v1/audit`, `PUT /v1/roles/:userId` | Baru |
| Health | `GET /healthz` | Baru |

Aturan: versioning `/v1`, error code stabil (tanpa detail internal), `Idempotency-Key` untuk operasi tulis.

## 6. Konten & Publikasi

- Paket diunggah → **validasi server-side** (schema, hash, path) → review (OD-1) → **sign manifest** dengan kunci platform → rilis pada channel (`stable`, `beta`).
- Aplikasi memverifikasi signature & hash sebelum aktivasi; rollback tetap lokal.
- Konten tanpa signature/kanal tidak boleh dipasang pada build produksi.
- Metadata rilis (reviewer, waktu, hash) masuk audit.

## 7. Keamanan, Privasi, dan Kepatuhan

- TLS wajib; HSTS; CSP produksi hanya mengizinkan origin API (bukan `localhost`).
- PII minimal: event sync memakai `profileId` pseudonim; nama siswa tidak dikirim secara default (keputusan OD-4).
- Retensi: hasil belajar & audit mengikuti OD-4; hapus profil lokal tidak otomatis menghapus data server (perlu kebijakan).
- Rahasia hanya di secret manager; rotasi berkala; tidak ada kunci di repo.
- Uji beban awal: 1 sekolah (50 perangkat), 1 tahun ajaran data.

## 8. Migrasi dari Server Referensi

1. Pertahankan kontrak sync & license yang sudah diuji E2E.
2. Tambahkan auth/tenancy/versioning tanpa mengubah payload.
3. Dual-run: referensi untuk pengujian, produksi untuk pilot terbatas.
4. Cutover setelah DV-01…DV-20 dan uji restore/rollback.

## 9. Keputusan yang Diminta

- [ ] Pilihan model hosting (A/B/C) dan **wilayah data**.
- [ ] Vendor DB/object storage (boleh menyusul setelah model dipilih).
- [ ] Model auth admin (OIDC provider vs akun lokal).
- [ ] Siapa pemegang kunci signing konten/lisensi (KMS/HSM) dan proses rotasi.
- [ ] RPO/RTO, retensi, dan kebijakan PII (bersama OD-4).
- [ ] Kebijakan kanal rilis & siapa yang boleh publish.
- [ ] Anggaran operasional dan SLA dukungan sekolah.

## 10. Kriteria Selesai OD-7

1. Spesifikasi OpenAPI (auth, sync, license, content, admin) disetujui.
2. Environment staging + produksi dengan TLS dan secret manager.
3. Uji integrasi app ↔ backend: sync, aktivasi, refresh, transfer, unduh & verifikasi paket.
4. Audit RBAC terbukti (reviewer tidak bisa publish; admin bisa revoke).
5. Uji restore backup server dan rotasi kunci.
6. Rencana insiden & kontak dukungan tertulis.

## 11. Risiko

| Risiko | Mitigasi |
|---|---|
| Kompleksitas auth perangkat | Mulai dari enrollment satu kali + token refresh; hindari SSO siswa |
| Konten tanpa review manusia | Gate publish hanya `publisher` setelah review tercatat |
| Vendor lock-in | Kontrak API sendiri; storage S3-compatible |
| Beban operasional | Mulai managed DB/storage; otomatisasi backup & alert |
| Data siswa sensitif | Pseudonim, minimalisasi, retensi eksplisit (OD-4) |
