# Proposal OD-6 — Identitas Rilis dan Code Signing

**Status:** DRAFT untuk keputusan · **Tanggal:** 2026-10-24 · **Pemilik:** Product Owner + Tech Lead
**Bukan keputusan final.** Menentukan publisher, identifier, sertifikat, dan tata kelola kunci.

## 1. Kondisi Saat Ini

- Identifier aplikasi: `id.gerbangedukasi.ifp` (status **PROPOSED**, belum final).
- Build Windows RC (MSI/NSIS) berhasil tetapi **unsigned**; belum di-install.
- Android debug APK berhasil; release signing belum.
- Updater belum dikonfigurasi; kunci lisensi produksi belum di-embed.

## 2. Keputusan Identitas

| Item | Usulan | Dampak |
|---|---|---|
| Nama publisher resmi | Entitas legal "Gerbang Edukasi" (perlu konfirmasi) | Sertifikat, store, privasi |
| App identifier Windows/Android | `id.gerbangedukasi.ifp` (final) | Update continuity; **tidak boleh berubah setelah rilis** |
| Nama tampilan | "Gerbang Edukasi – IFP Apps" | Store listing |
| Domain surel/dukungan | Belum ada | Verifikasi store & privasi |

**Penting:** identifier dan publisher mengikat update. Perubahan setelah rilis memerlukan instalasi ulang/migrasi.

## 3. Code Signing Windows

| Opsi | Kelebihan | Kekurangan |
|---|---|---|
| OV certificate (file/PFX) | Lebih murah | Reputasi SmartScreen perlu waktu; kunci harus dijaga |
| EV certificate (token/HSM) | Reputasi SmartScreen lebih cepat | Biaya & proses verifikasi lebih berat |
| Cloud signing (Azure Trusted Signing dll.) | Kunci tidak keluar dari HSM; CI-friendly | Biaya layanan; vendor lock-in ringan |

**Rekomendasi:** cloud signing/HSM (EV-class) agar kunci tidak berada di repo/CI, dengan proses rilis terdokumentasi.

## 4. Android Signing

- **Upload key** dipegang publisher; aktifkan **Play App Signing** bila distribusi via Play.
- Simpan keystore di secret manager; jangan pernah commit. Rotasi mengikuti prosedur Play.
- Jika distribusi non-Play (MDM/sekolah), kelola APK signing key sendiri + dokumentasi update.

## 5. Updater & Kunci

- Updater Tauri memerlukan kunci tanda tangan terpisah; kunci publik di-embed, privat di HSM.
- Lisensi menggunakan kunci Ed25519 terpisah (format `keyId` sudah mendukung rotasi).
- Simpan daftar kunci aktif/rotasi + prosedur darurat.

## 6. Keputusan yang Diminta

- [ ] Nama entitas legal publisher + domain dukungan.
- [ ] Konfirmasi final `id.gerbangedukasi.ifp`.
- [ ] Metode signing Windows (OV/EV/cloud) dan vendor.
- [ ] Distribusi Android (Play vs MDM) dan pengelolaan keystore.
- [ ] Pemegang kunci signing (individu/role) dan prosedur rotasi.
- [ ] Pemilik akun store/developer dan alur persetujuan rilis.

## 7. Kriteria Selesai OD-6

1. Sertifikat signing aktif dan build Windows terverifikasi (`signtool verify`).
2. APK/AAB release bertanda tangan; instalasi bersih diuji.
3. Updater dikonfigurasi dengan kunci produksi dan diuji dari versi lama.
4. Dokumen runbook rilis + kontak pemegang kunci.
5. Identifier & publisher dibekukan pada release checklist.
