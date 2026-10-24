# Register Blocker Rilis — 2026-10-24

**Status:** `AUDIT` — berbasis bukti aktual, bukan penilaian "siap rilis".
**Cakupan:** aplikasi IFP (Windows/Android), backend lisensi, konten, dan review.

## Bukti yang diverifikasi hari ini

| Pemeriksaan | Hasil |
|---|---|
| Worker produksi `/healthz` | **200** (`https://gerbangedukasi-api.edukasigerbang.workers.dev/healthz`) |
| Worker `POST /v1/licenses/transfer` | **501** `LICENSE_ADMIN_NOT_IMPLEMENTED` (sesuai kode) |
| Validasi seluruh paket konten | **116/116 VALID**, alt text lengkap, tanpa packageId duplikat |
| `curriculumRefs` | **116/116 kosong** — menunggu D6 |
| Build web | PASS; chunk utama 415,32 kB + lazy 86,28 kB (sebelum 4 paket Kelas 5) |

## Daftar blocker

| ID | Blocker | Status | Bukti / lokasi | Pemilik | Tindakan untuk membuka |
|---|---|---|---|---|---|
| B-01 | Identitas rilis & code signing (Windows/Android) | **BLOCKED — keputusan** | `knowledge/decisions/PROPOSAL-OD-6-release-identity.md`; build Windows unsigned; Android hanya debug | Product Owner + Tech Lead | Tetapkan publisher, identifier final, metode signing, pemegang kunci |
| B-02 | Kunci lisensi produksi: backup & rotasi | **PENDING — user** | `workers/api/wrangler.toml` memakai `LICENSE_PUBLIC_KEY`; private key hanya di secret Cloudflare | User | Backup terenkripsi + prosedur rotasi `keyId`; jangan simpan di repo |
| B-03 | Admin RBAC/OIDC + transfer/deactivate di Worker | **CODE FIXED — deploy pending** | `workers/api/src/licenseAdmin.ts`; 13/13 test Worker PASS; endpoint memakai `ADMIN_API_TOKEN` provisial + audit | Tech Lead | Set secret `ADMIN_API_TOKEN`, deploy Worker, lalu putuskan OIDC/RBAC final |
| B-04 | SMTP kustom untuk reset password | **BLOCKED — vendor** | Supabase SMTP default pernah 429 | User | Aktifkan SMTP vendor (mis. Resend/SES) + template surel |
| B-05 | DV-01…DV-20 acceptance perangkat | **BLOCKED — hardware** | `knowledge/device/DEVICE_SPIKE_READINESS.md`; belum ada Windows 11 / Android 14 fisik | User + QA | Sediakan perangkat; jalankan checklist DV |
| B-06 | Review pedagogis R1–R12 | **BLOCKED — manusia** | [REVIEW_REPORT_2026-10-24_ALL_DRAFTS.md](../content/REVIEW_REPORT_2026-10-24_ALL_DRAFTS.md); 116 paket teknis bersih, tetapi kualitas pedagogis belum dinilai | Curriculum Lead + guru | Tunjuk reviewer; isi temuan R1–R12; putuskan D3–D7 |
| B-07 | Secret sementara di `%TEMP%` | **ACTION — user** | Ditemukan: `%TEMP%\\gerbang-license-signing-key.txt`, `%TEMP%\\gerbang-edukasi-admin-temp-password.txt`, `%TEMP%\\gerbang-app-license.json` | User | Backup kunci ke secret manager, lalu hapus file; rotasi password admin |
| B-08 | Tanda tangan paket konten | **PENDING — keputusan** | `signature: null` pada semua manifest | Product Owner | Putuskan apakah paket perlu signature sebelum distribusi |

## Yang sudah dapat diselesaikan tanpa keputusan baru

1. **Paket review** untuk 116 paket — sudah dibuat (laporan teknis + tabel per paket).
2. **Pembersihan secret sementara** (B-07) dan **backup kunci lisensi** (B-02) — tindakan user.
3. **Runbook rilis** — dapat disusun setelah B-01 diputuskan.

## Urutan usulan

1. B-07 & B-02 (higiene kunci).
2. B-01 (identitas + signing) — membuka build yang dapat didistribusikan.
3. B-03 (RBAC admin + transfer/deactivate) — membuka operasi lisensi produksi.
4. B-04 (SMTP) — membuka reset password mandiri.
5. B-05 (acceptance perangkat) — membuktikan kesiapan perangkat.
6. B-06 (review pedagogis) — membuka kenaikan `reviewStatus`.

> Catatan: laporan ini **tidak** menyatakan aplikasi siap rilis. Blocker yang tersisa membutuhkan keputusan pemilik produk, kredensial vendor, atau perangkat fisik.

## Pembaruan 2026-10-25

### B-03 — diperbaiki di kode

- Endpoint `POST /v1/licenses/transfer` dan `POST /v1/activations/deactivate` tidak lagi 501.
- Handler: `workers/api/src/licenseAdmin.ts`.
- Otorisasi: bearer `ADMIN_API_TOKEN` (perbandingan SHA-256 konstan-waktu), provisional sampai OIDC/RBAC diputuskan.
- Audit: `license_audit` dengan actor `license-admin`.
- Test: **13/13 Worker tests PASS**, `worker:typecheck` PASS.
- Langkah deploy (butuh persetujuan user):
  1. `wrangler secret put ADMIN_API_TOKEN --config workers/api/wrangler.toml`
  2. `wrangler deploy --config workers/api/wrangler.toml`
  3. Uji transfer/deactivate dengan lisensi uji, lalu cek baris `license_audit`.

### B-01, B-02, B-04, B-05, B-06, B-08 — masih terblokir eksternal

| ID | Mengapa belum bisa diselesaikan kode |
|---|---|
| B-01 | Butuh entitas legal, identifier final, dan sertifikat/HSM signing |
| B-02 | Butuh akses kunci privat produksi + kebijakan backup/rotasi |
| B-04 | Butuh akun vendor SMTP dan verifikasi domain |
| B-05 | Butuh perangkat Windows 11 / Android 14 fisik |
| B-06 | Butuh reviewer pedagogis manusia; tidak boleh difabrikasi |
| B-08 | Butuh keputusan apakah paket konten ditandatangani + tata kelola kunci |

B-07 adalah tindakan user (file sementara sudah teridentifikasi).

### Checklist operasional

- **B-01 (identitas & signing):** [CHECKLIST_B01_B04_2026-10-25.md](../release/CHECKLIST_B01_B04_2026-10-25.md#b-01--identitas-rilis--code-signing)
- **B-04 (SMTP):** [CHECKLIST_B01_B04_2026-10-25.md](../release/CHECKLIST_B01_B04_2026-10-25.md#b-04--smtp-kustom-untuk-reset-password)
