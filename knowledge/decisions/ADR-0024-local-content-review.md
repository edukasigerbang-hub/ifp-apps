# ADR-0024 — Review konten lokal (Fase J, increment pertama)

- **Status:** Accepted (implemented) · **Tanggal:** 2026-10-24
- **Konteks:** Fase J menuntut alur draft→review→approved→build→publish, RBAC, dan audit. Publikasi server dan identitas pengguna masih bergantung pada OD-7; konten pilot juga belum boleh dianggap disetujui (OD-1). Namun kebutuhan mencatat keputusan review manusia secara lokal dan dapat diaudit sudah nyata.

## Keputusan

1. **Ledger review lokal** (`content_reviews`, migrasi `0005`): append-only, menyimpan `package_id`, `package_version`, reviewer (FK profil), keputusan `approved|rejected`, catatan ≤1000 karakter, dan waktu.
2. **RBAC ditegakkan native**, bukan hanya UI: `review_record` menolak profil aktif yang bukan `teacher` dengan `REVIEW_FORBIDDEN`.
3. **UI** di layar Konten & Pembaruan: hanya profil guru melihat form (pilih paket, keputusan, catatan); daftar review terbaru menampilkan reviewer dan waktu. Label eksplisit **“Review konten (lokal)”**.
4. **Tidak mengubah apa pun di paket**: `reviewStatus` manifest, hash, katalog, dan pemuatan Player tidak berubah. Review lokal bukan persetujuan global dan bukan publikasi.
5. **Audit**: baris review tidak dapat diubah/dihapus dari aplikasi; urutan daftar memakai `created_at` + `rowid` agar deterministik.
6. **Build/publish server tidak diimplementasikan** pada increment ini; tetap menunggu OD-7 dan kebijakan review (OD-1).

## Konsekuensi

- Review tersimpan di perangkat (ikut backup database) dan tidak portabel lewat paket konten.
- Satu perangkat dapat memuat beberapa review untuk paket/versi yang sama; “keputusan terbaru” ditentukan urutan waktu+rowid.
- Guru masih dapat mencatat review tanpa organisasi/otorisasi server; ini batas yang disadari sampai OD-7.
- Menghapus profil guru yang sudah pernah mereview **diblokir** dengan `PROFILE_HAS_REVIEWS`; audit tidak boleh hilang atau menggantung.

## Alternatif

| Alternatif | Alasan ditolak |
|---|---|
| Mengubah `reviewStatus` di manifest | Mengubah hash/signature dan menyamar sebagai persetujuan global |
| Review otomatis dari skor teknis | Melanggar larangan mengarang persetujuan manusia |
| Menunggu OD-7 sepenuhnya | Audit review lokal tetap berguna dan dapat dimigrasikan |
