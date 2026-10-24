# Outline Kurikulum Kelas 5 — Kurikulum Merdeka (DRAF)

**Status:** `DRAFT-UNVERIFIED` — usulan urutan bab untuk produksi; belum diverifikasi Curriculum Lead.
**Pemilik keputusan:** Product Owner + Curriculum Lead (OD-1).
**Tanggal:** 2026-10-24 · **Fase:** C (kelas 5–6).
**Rujukan untuk diverifikasi:** Permendikbudristek No. 12 Tahun 2024.

## Dokumen per semester

| Semester | Dokumen |
|---|---|
| Semester 1 (B01–B04 per mapel) | [KELAS5_SEMESTER1_MERDEKA_DRAFT.md](KELAS5_SEMESTER1_MERDEKA_DRAFT.md) |
| Semester 2 (B05–B08 per mapel) | [KELAS5_SEMESTER2_MERDEKA_DRAFT.md](KELAS5_SEMESTER2_MERDEKA_DRAFT.md) |

## Asumsi (harus dikonfirmasi)

| ID | Asumsi | Status |
|---|---|---|
| D1 | Kurikulum Merdeka | dipilih PO (2026-10-24) |
| D2 | IPAS terpadu | mengikuti Merdeka; konfirmasi sekolah |
| D3 | Bahasa Inggris disertakan | **belum diputuskan** |
| D4 | Seni memakai strand **Seni Rupa** | **belum diputuskan** |
| D5 | Muatan lokal | **belum diputuskan** |
| D6 | Format `curriculumRefs` | objek `{framework, id, version}`, mis. `{ "framework": "kurikulum-merdeka", "id": "fase-c", "version": "2024" }` |
| D7 | Standar kelengkapan (OD-8) | belum diputuskan |

## Konvensi paket

- Satu paket = satu bab: `kelas5-<subject>-b<nn>-<slug>`.
- Tipe aktivitas: `exploration`, MCQ, `true-false`, `short-answer`, `matching`, `ordering`.
- `curriculumRefs` kosong sampai D6 disetujui; validator memberi warning.

## Hasil audit konten Kelas 5 (2026-10-24)

- **Tidak ada paket produksi Kelas 5.**
- Pola paket Fase B dipakai ulang; kedalaman materi dinaikkan (teks lebih panjang, konsep abstrak, data).

## Prioritas paket starter (batch 1)

1. `kelas5-matematika-b01-bilangan-1000000`
2. `kelas5-bahasa-indonesia-b01-teks-deskripsi`
3. `kelas5-ipas-b01-sistem-pencernaan`
4. `kelas5-pendidikan-pancasila-b01-sejarah-pancasila`

## Gerbang sebelum produksi massal

- [ ] D3–D7 diputuskan PO + Curriculum Lead.
- [ ] Urutan bab diverifikasi terhadap CP/ATP resmi.
- [ ] `curriculumRefs` per bab diisi.
- [ ] Review pedagogis R1–R12 per paket.
