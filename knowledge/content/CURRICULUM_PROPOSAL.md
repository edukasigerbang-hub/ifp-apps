# Proposal OD-1 — Matriks Mata Pelajaran & Kurikulum

**Status:** `PROPOSED` — **BELUM DISETUJUI**. Dokumen ini bukan keputusan resmi dan tidak boleh dipakai untuk mengklaim kesesuaian kurikulum.

**Pemilik keputusan:** Product Owner + Curriculum Lead.
**Tanggal:** 2026-10-23 · **Menghambat:** produksi konten (Fase K), schema konten final, kurikulumRefs.

## Mengapa ini harus diputuskan manusia

Schema konten sengaja **tidak** mengunci daftar mapel. Yang belum ada adalah otoritas akademik: mapel resmi, fase/kelas, dan referensi kurikulum yang berlaku untuk tahun ajaran peluncuran. Keputusan ini tidak boleh diambil dari blog atau ringkasan pihak ketiga.

**Rujukan regulasi untuk diverifikasi (bukan bukti final):**
- Permendikbudristek No. 12 Tahun 2024 — [BPK](https://peraturan.bpk.go.id/Details/281847/permendikbudriset-no-12-tahun-2024) · [PDF peraturan.go.id](https://peraturan.go.id/files/permendikbudristek-no-12-tahun-2024.pdf)
- Salinan Kemendikdasmen — [file 1391](https://www.kemendikdasmen.go.id/download/file/1391)
- Periksa juga regulasi terbaru yang berlaku pada tahun ajaran peluncuran (2026/2027); jangan mengandalkan ringkasan sekunder.

## Keputusan yang diminta

| ID | Keputusan | Opsi | Dampak |
|---|---|---|---|
| D1 | Kerangka kurikulum | Kurikulum Merdeka / K13 / lainnya | Menentukan struktur mapel & referensi |
| D2 | IPA & IPS | IPAS terpadu **atau** IPA + IPS terpisah | Jumlah paket & navigasi mapel |
| D3 | Bahasa Inggris | Wajib / pilihan / tidak ada | Cakupan konten |
| D4 | Seni | Satu strand / pilihan (Rupa, Musik, Tari, Teater) | Struktur paket seni |
| D5 | Muatan lokal | Ada / tidak; siapa penyedia | Katalog & hak konten |
| D6 | Format `curriculumRefs` | ID resmi + versi (contoh `kurikulum-merdeka:2024`) | Keterlacakan & audit |
| D7 | Standar "konten lengkap" (OD-8) | Jumlah unit per mapel/kelas/semester | Gerbang rilis |

## Template matriks (ISI SETELAH D1–D7 disetujui)

| subjectId (slug) | Label tampilan | Kelas 1–3 | Kelas 4–6 | Wajib? | Catatan |
|---|---|---|---|---|---|
| `pai-bp` | Pendidikan Agama & Budi Pekerti | _TBD_ | _TBD_ | _TBD_ | Perlu pemetaan per agama |
| `pendidikan-pancasila` | Pendidikan Pancasila | _TBD_ | _TBD_ | _TBD_ | |
| `bahasa-indonesia` | Bahasa Indonesia | _TBD_ | _TBD_ | _TBD_ | |
| `matematika` | Matematika | _TBD_ | _TBD_ | _TBD_ | |
| `ipas` **atau** `ipa` + `ips` | IPAS / IPA & IPS | _TBD_ | _TBD_ | _TBD_ | D2 |
| `seni` | Seni Budaya | _TBD_ | _TBD_ | _TBD_ | D4 |
| `pjok` | PJOK | _TBD_ | _TBD_ | _TBD_ | |
| `bahasa-inggris` | Bahasa Inggris | _TBD_ | _TBD_ | _TBD_ | D3 |
| `mulok` | Muatan Lokal | _TBD_ | _TBD_ | _TBD_ | D5 |

> Tabel di atas sengaja berisi `TBD`. Mengisinya tanpa persetujuan Curriculum Lead akan menciptakan klaim palsu.

## Kriteria penerimaan proposal

- [ ] D1–D7 diputuskan dan ditandatangani Product Owner + Curriculum Lead.
- [ ] Setiap baris matriks punya referensi resmi (dokumen + pasal/halaman) di `curriculumRefs`.
- [ ] Daftar unit minimum per kelas/mapel disepakati (OD-8).
- [ ] Keputusan dicatat sebagai ADR-0004 (menggantikan status proposal ini).

## Yang sudah siap menyambut keputusan ini

- Schema konten v1 menerima `subjects` sebagai slug bebas → **tidak perlu ubah kode**.
- `curriculumRefs` sudah tersedia di manifest dan lesson.
- Validator memberi peringatan bila `curriculumRefs` kosong.
