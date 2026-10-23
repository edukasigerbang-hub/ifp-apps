# ADR-0010 — License core: payload Ed25519 dan verifikasi native

- **Status:** Accepted (core implemented; online reference implemented in ADR-0011) · **Tanggal:** 2026-10-24
- **Konteks:** Fase H membutuhkan lisensi yang diverifikasi native, mendukung aktivasi offline, dan tidak bergantung pada UI. Kebijakan komersial (OD-5) dan server lisensi (OD-7) belum final.

## Keputusan

1. **Installation ID** memakai `app_meta.installation_id` (UUID v4 acak, stabil, tanpa hardware fingerprint) — sama dengan device ID sinkronisasi.
2. Payload lisensi mengikuti LLD §9: `schemaVersion`, `licenseId`, `productId`, `licenseType`, `machineId`, `deviceKeyThumbprint?`, `issuedAt`, `notBefore`, `expiresAt` (null untuk perpetual), `offlineGraceDays`, `entitlements`, `keyId`.
3. **Signature Ed25519** atas **canonical JSON** (key diurutkan, integer saja, string di-escape JSON). Implementasi Rust dan issuer dev harus identik.
4. Verifikasi native memeriksa: schemaVersion, productId, machineId, licenseType, notBefore, expiry + grace days, keyId dikenal, dan signature. `inGrace` dilaporkan bila melewati expiry tetapi masih dalam grace.
5. Client membawa **public key** dari env `IFP_LICENSE_KEYS` (JSON `[{keyId, publicKey(base64 raw 32)}]`); product dari `IFP_LICENSE_PRODUCT_ID` (default `ifp-learning`). Tanpa key → `LICENSE_NOT_CONFIGURED`.
6. Lisensi terverifikasi disimpan di tabel `license_state` (migrasi 0004); status/refresh memverifikasi ulang setiap kali.
7. Aktivasi offline lewat impor file; permintaan aktivasi diekspor sebagai JSON (productId, machineId, requestId, nonce, createdAt). Aktivasi online mengembalikan `LICENSE_SERVER_UNAVAILABLE` sampai License Service ada.
8. Alat dev `scripts/license-issuer.mjs` membuat keypair dan menerbitkan lisensi bertanda tangan; private key hanya di direktori sementara dan dihapus setelah uji.

## Konsekuensi

- **Public key produksi belum di-embed**: masih lewat env. Rilis harus menetapkan key set/rotasi (OPEN).
- Belum ada transfer perangkat, deactivation, revocation, atau clock-rollback detection; grace policy tetap OD-5.
- Entitlements baru ditampilkan, belum menegakkan akses fitur.
- Server lisensi online, rate limit, dan audit aktivasi belum ada (OD-7).

## Alternatif

| Alternatif | Alasan ditolak |
|---|---|
| Hardware fingerprint | LLD melarang sebagai default; rusak saat komponen berubah |
| JWT standar | Format/klaim lebih longgar; canonical byte tetap perlu |
| Signature atas raw file bytes | Whitespace/urutan field dapat berubah; LLD meminta canonical |
| Menyimpan lisensi di UI/localStorage | UI bukan sumber otoritatif; mudah dimodifikasi |
