# Outline Kurikulum Kelas 6 — Kurikulum Merdeka (DRAF)

**Status:** `DRAFT-UNVERIFIED` — usulan urutan bab untuk produksi; belum diverifikasi Curriculum Lead.
**Pemilik keputusan:** Product Owner + Curriculum Lead (OD-1).
**Tanggal:** 2026-10-24 · **Fase:** C (kelas 5–6).
**Rujukan untuk diverifikasi:** Permendikbudristek No. 12 Tahun 2024.

## Dokumen per semester

| Semester | Dokumen |
|---|---|
| Semester 1 (B01–B04 per mapel) | [KELAS6_SEMESTER1_MERDEKA_DRAFT.md](KELAS6_SEMESTER1_MERDEKA_DRAFT.md) |
| Semester 2 (B05–B08 per mapel) | [KELAS6_SEMESTER2_MERDEKA_DRAFT.md](KELAS6_SEMESTER2_MERDEKA_DRAFT.md) |

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

- Satu paket = satu bab: `kelas6-<subject>-b<nn>-<slug>`.
- Tipe aktivitas: `exploration`, MCQ, `true-false`, `short-answer`, `matching`, `ordering`.
- `curriculumRefs` kosong sampai D6 disetujui; validator memberi warning.

## Hasil audit konten Kelas 6 (2026-10-24)

- **Tidak ada paket produksi Kelas 6.**
- Pola paket Fase C (Kelas 5) dipakai ulang; kedalaman materi disesuaikan untuk kelas akhir.
- **Produksi selesai (2026-10-24):** 56 paket draft (S1 28 + S2 28), semua VALID dan terimpor. Status tetap `draft` sampai review R1–R12 dan OD-1.

## Prioritas paket

Produksi dibagi per mapel (8 paket per mapel) agar review tidak menumpuk.

## Gerbang sebelum kenaikan status

- [ ] D3–D7 diputuskan PO + Curriculum Lead.
- [ ] Urutan bab diverifikasi terhadap CP/ATP resmi.
- [ ] `curriculumRefs` per bab diisi.
- [ ] Review pedagogis R1–R12 per paket.
