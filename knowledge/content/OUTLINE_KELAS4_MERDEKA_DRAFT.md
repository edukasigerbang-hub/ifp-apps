# Outline Kurikulum Kelas 4 — Kurikulum Merdeka (DRAF)

**Status:** `DRAFT-UNVERIFIED` — **bukan keputusan resmi**. Urutan bab adalah usulan untuk memulai produksi konten; belum diverifikasi Curriculum Lead dan tidak boleh diklaim sebagai kesesuaian resmi.
**Pemilik keputusan:** Product Owner + Curriculum Lead (OD-1).
**Tanggal:** 2026-10-24 · **Fase:** B (kelas 3–4).
**Rujukan untuk diverifikasi:** Permendikbudristek No. 12 Tahun 2024 (lihat [CURRICULUM_PROPOSAL.md](CURRICULUM_PROPOSAL.md)).

## Dokumen per semester

| Semester | Dokumen |
|---|---|
| Semester 1 (B01–B04 per mapel) | [KELAS4_SEMESTER1_MERDEKA_DRAFT.md](KELAS4_SEMESTER1_MERDEKA_DRAFT.md) |
| Semester 2 (B05–B08 per mapel) | [KELAS4_SEMESTER2_MERDEKA_DRAFT.md](KELAS4_SEMESTER2_MERDEKA_DRAFT.md) |

## Asumsi (harus dikonfirmasi)

| ID | Asumsi | Status |
|---|---|---|
| D1 | Kurikulum Merdeka | dipilih PO (2026-10-24) |
| D2 | IPAS terpadu (IPA + IPS) | mengikuti Merdeka; konfirmasi sekolah |
| D3 | Bahasa Inggris disertakan | **belum diputuskan** (pilihan sekolah) |
| D4 | Seni memakai strand **Seni Rupa** | **belum diputuskan** (Rupa/Musik/Tari/Teater) |
| D5 | Muatan lokal | **belum diputuskan** (di luar outline ini) |
| D6 | Format `curriculumRefs` | usulan: `kurikulum-merdeka:2024` |
| D7 | Standar kelengkapan (OD-8) | belum diputuskan |

## Konvensi paket

- Satu paket = satu bab: `kelas4-<subject>-b<nn>-<slug>` (contoh `kelas4-matematika-b03-pecahan`).
- Tipe aktivitas yang didukung: `exploration`, kuis MCQ (tunggal/multi), `true-false`, `short-answer`, `matching`, `ordering`.
- `curriculumRefs` diisi setelah D6 disetujui; sebelum itu kosong dan validator memberi warning.
- Rincian bab dan aktivitas ada di dokumen semester; dokumen ini tidak menduplikasi tabel.

## Prioritas paket starter (gabungan)

1. `kelas4-matematika-b03-pecahan`
2. `kelas4-ipas-b01-makhluk-hidup`
3. `kelas4-bahasa-indonesia-b01-teks-deskripsi`
4. `kelas4-pendidikan-pancasila-b01-pancasila`

Masing-masing: 1 lesson + 2 aktivitas + 1 aset, lalu divalidasi dan diimpor ke aplikasi.

## Gerbang sebelum produksi massal

- [ ] D3, D4, D5, D6, D7 diputuskan PO + Curriculum Lead.
- [ ] Urutan bab diverifikasi terhadap CP/ATP resmi tahun ajaran peluncuran.
- [ ] `curriculumRefs` per bab diisi dengan referensi resmi.
- [ ] Review pedagogis R1–R12 per paket (OD-1).
