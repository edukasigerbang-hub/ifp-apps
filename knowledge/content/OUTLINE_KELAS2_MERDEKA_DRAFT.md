# Outline Kurikulum Kelas 2 — Kurikulum Merdeka (DRAF)

**Status:** `DRAFT-UNVERIFIED` — usulan urutan bab untuk produksi; belum diverifikasi Curriculum Lead.
**Pemilik keputusan:** Product Owner + Curriculum Lead (OD-1).
**Tanggal:** 2026-10-24 · **Fase:** A (kelas 1–2).
**Rujukan untuk diverifikasi:** Permendikbudristek No. 12 Tahun 2024.

## Dokumen per semester

| Semester | Dokumen |
|---|---|
| Semester 1 (B01–B04 per mapel) | [KELAS2_SEMESTER1_MERDEKA_DRAFT.md](KELAS2_SEMESTER1_MERDEKA_DRAFT.md) |
| Semester 2 (B05–B08 per mapel) | [KELAS2_SEMESTER2_MERDEKA_DRAFT.md](KELAS2_SEMESTER2_MERDEKA_DRAFT.md) |

## Asumsi (harus dikonfirmasi)

| ID | Asumsi | Status |
|---|---|---|
| D1 | Kurikulum Merdeka | dipilih PO (2026-10-24) |
| D2 | Fase A **tanpa IPAS** (6 mapel inti) | mengikuti Merdeka; konfirmasi sekolah |
| D3 | Bahasa Inggris disertakan | **belum diputuskan** |
| D4 | Seni memakai strand **Seni Rupa** | **belum diputuskan** |
| D5 | Muatan lokal | **belum diputuskan** |
| D6 | Format `curriculumRefs` | objek `{framework, id, version}`, mis. `{ "framework": "kurikulum-merdeka", "id": "fase-a", "version": "2024" }` |
| D7 | Standar kelengkapan (OD-8) | belum diputuskan |

## Konvensi paket

- Satu paket = satu bab: `kelas2-<subject>-b<nn>-<slug>`.
- Bahasa sederhana, aktivitas 3 langkah, banyak gambar.
- `curriculumRefs` kosong sampai D6 disetujui.

## Hasil audit konten Kelas 2 (2026-10-24)

- **Tidak ada paket produksi Kelas 2.**
- Pola Kelas 1 dipakai ulang dengan peningkatan bertahap (bilangan 100, kalimat lebih panjang).

## Prioritas paket starter (batch 1)

Enam paket B01, satu per mapel:

1. `kelas2-matematika-b01-bilangan-1-100`
2. `kelas2-bahasa-indonesia-b01-membaca-lancar`
3. `kelas2-pendidikan-pancasila-b01-simbol-pancasila`
4. `kelas2-seni-rupa-b01-garis-bentuk-warna`
5. `kelas2-pjok-b01-gerak-lokomotor`
6. `kelas2-pai-b01-huruf-hijaiyah`

## Gerbang sebelum kenaikan status

- [ ] D3–D7 diputuskan PO + Curriculum Lead.
- [ ] Urutan bab diverifikasi terhadap CP/ATP resmi.
- [ ] `curriculumRefs` per bab diisi.
- [ ] Review pedagogis R1–R12 per paket.
