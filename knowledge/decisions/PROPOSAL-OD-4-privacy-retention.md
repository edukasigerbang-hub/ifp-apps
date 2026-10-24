# Proposal OD-4 — Privasi, Retensi, dan Penghapusan Data

**Status:** DRAFT untuk keputusan · **Tanggal:** 2026-10-24 · **Pemilik:** Product Owner + Privacy/Legal
**Bukan kebijakan final.** Dokumen ini merangkum data yang disimpan, opsi retensi, dan keputusan yang diperlukan.

## 1. Data yang Disimpan Saat Ini

| Data | Lokasi | Sifat | Catatan |
|---|---|---|---|
| Nama profil siswa/guru | SQLite lokal (`profiles`) | PII | Dibuat di perangkat |
| Sesi, percobaan, jawaban, skor | SQLite lokal | Data belajar | Terikat `profile_id` |
| Progres per lesson | SQLite lokal | Data belajar | Upsert |
| Review konten + catatan | SQLite lokal | PII reviewer | Append-only |
| ID perangkat / installation ID | SQLite + payload sync | Pseudonim | UUID acak |
| Lisensi (payload + serial hash) | SQLite lokal/server | Pseudonim | Nama sekolah belum dikirim |
| Backup database | File pilihan pengguna | Salinan penuh | Termasuk PII di atas |
| Ekspor CSV hasil/review | File pilihan pengguna | PII | Nama profil/reviewer |
| Diagnostik | JSON pilihan pengguna | Redaksi ID | Tanpa nama/payload |

## 2. Opsi Retensi

| Data | Opsi A (rekomendasi) | Opsi B | Opsi C |
|---|---|---|---|
| Hasil belajar lokal | Simpan sampai dihapus eksplisit oleh guru/admin | Prune otomatis > 24 bulan | Prune > 12 bulan |
| Backup lokal | Manual; retensi ditentukan sekolah | Otomatis simpan 5 terakhir | Tanpa backup lokal |
| Review lokal | Permanen (audit) | Permanen + arsip > 3 tahun | Prune > 2 tahun |
| Data server (OD-7) | Pseudonim; retensi 24 bulan | 12 bulan | Tanpa data individual (agregat saja) |

**Rekomendasi A** untuk lokal (tanpa penghapusan otomatis yang mengejutkan), dengan kontrol ekspor/hapus yang jelas. Retensi server mengikuti OD-7.

## 3. Penghapusan & Ekspor

- Hapus profil: sudah menghapus sesi/percobaan/progres/outbox; profil reviewer diblokir bila punya audit.
- Backup/CSV yang sudah diekspor **tidak ikut terhapus**; UI harus memperingatkan sebelum ekspor.
- Penghapusan data server (bila ada) memerlukan alur permintaan + SLA (OD-7).
- Diagnostik sudah diredaksi; pastikan tidak ada nama/notes review di masa depan.

## 4. Kontrol Pengguna

- Pemberitahuan singkat di Pengaturan: data disimpan lokal, apa yang diekspor, cara menghapus.
- Konfirmasi eksplisit untuk ekspor CSV (mengandung nama) dan hapus profil berdata.
- Mode/privacy notice untuk orang tua/wali; belum ada consent flow formal.

## 5. Keputusan yang Diminta

- [ ] Periode retensi lokal untuk hasil belajar (A/B/C).
- [ ] Apakah nama siswa boleh disinkronkan ke server (disarankan: **tidak**, hanya `profileId` pseudonim).
- [ ] Retensi data server dan SLA permintaan penghapusan.
- [ ] Apakah backup otomatis diaktifkan dan berapa jumlah yang disimpan.
- [ ] Dasar hukum/consent (sekolah vs orang tua) dan teks pemberitahuan.
- [ ] Apakah review lokal memuat nama reviewer di ekspor (disarankan: ya, untuk audit, dengan peringatan).

## 6. Kriteria Selesai OD-4

1. Kebijakan retensi tertulis per jenis data (lokal & server).
2. Teks pemberitahuan privasi disetujui dan ditampilkan di Pengaturan.
3. Perilaku hapus/ekspor sesuai kebijakan (termasuk peringatan backup/CSV).
4. Uji: hapus profil, ekspor, restore backup, dan (jika ada) penghapusan server.

## 7. Batas

Dokumen ini tidak menetapkan dasar hukum, vendor, atau yurisdiksi. Keputusan tersebut memerlukan Legal/DPO.
