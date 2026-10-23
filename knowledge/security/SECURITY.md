# Security & Privacy

> **DERIVED** dari [HLD §10](../../HLD.md), [LLD §8–§9](../../LLD.md), [IMPLEMENTATION_CONTRACT §3](../../IMPLEMENTATION_CONTRACT.md).

## Prinsip

1. Semua file impor dan konten = **input tidak tepercaya**.
2. Verifikasi lisensi di **native layer**, dengan signature digital.
3. Private signing key hanya di lingkungan issuer yang dilindungi — **tidak pernah** di klien, source, fixture, log, atau commit.
4. UI badge lisensi **bukan** sumber otoritatif.
5. Tidak ada eksekusi JavaScript/native arbitrer dari paket konten.
6. Data siswa diminimalkan; retensi/ekspor/penghapusan ditetapkan sebelum produksi.

## Ancaman & kontrol

| Ancaman | Kontrol wajib |
|---|---|
| Path traversal (zip slip) | Tolak file di luar root paket saat ekstraksi |
| Archive bomb | Batas ukuran, jumlah file, compression ratio |
| File terlalu besar | Batas ukuran per file & total paket |
| Hash mismatch / konten korup | SHA-256 per aset + validasi menyeluruh di staging |
| Paket tidak kompatibel | `schemaVersion` + dependency check; aktivasi ditolak |
| Update terputus | Staging + atomic activation + rollback |
| Lisensi palsu/dimodifikasi | Verifikasi Ed25519 atas payload canonical |
| Produk/perangkat salah | Cek `productId` + `machineId`/device binding |
| License ganda | Serial ≥128-bit, hash serial di server, unique binding, aktivasi atomik, idempotency, rate limit |
| Replay sync / duplikasi | `eventId` unik + deduplication server |
| Jam sistem dimundurkan | Clock rollback = sinyal risiko, bukan satu-satunya kontrol |
| Revocation offline | Tidak dapat real-time — kebijakan grace/transparansi wajib |
| Admin API disalahgunakan | Authorization server-side + audit + RBAC |

## Rahasia (MENGIKAT)

- Sumber kredensial hanya environment variable atau secret store.
- Nilai secret tidak pernah ditulis ke output, log, `state.json`, knowledge, index, snapshot, atau commit.
- Dilarang mencatat serial mentah, private key, token, atau data siswa yang tidak perlu.
- Jika secret terdeteksi sudah ter-commit: **hentikan**, laporkan, eskalasi rotasi kredensial.

## Batas otorisasi agent (dari Implementation Contract §3)

Tanpa persetujuan eksplisit, dilarang: mengubah Windows identifier / Android applicationId setelah identitas rilis diputuskan; mengubah product ID, license semantics, signed payload, atau key material; menghapus/mengubah data produksi; migrasi destruktif; mempublikasikan paket; menonaktifkan test/lint/security check; menambahkan arbitrary code execution; mengklaim dukungan platform tanpa evidence build/test.

## Status audit

| Item | Status |
|---|---|
| Security review atas skema lisensi | **BELUM** — required sebelum rilis |
| Threat model tertulis | Belum ada (DERIVED saja) |
| Secret scanning di CI | Belum ada (belum ada repo/CI) |
| Retensi & penghapusan data siswa | OPEN (OD-4) |
