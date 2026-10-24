# Outline Kurikulum Kelas 1 — Kurikulum Merdeka (DRAF)

**Status:** `DRAFT-UNVERIFIED` — usulan urutan bab untuk produksi; belum diverifikasi Curriculum Lead.
**Pemilik keputusan:** Product Owner + Curriculum Lead (OD-1).
**Tanggal:** 2026-10-24 · **Fase:** A (kelas 1–2).
**Rujukan untuk diverifikasi:** Permendikbudristek No. 12 Tahun 2024.

## Dokumen per semester

| Semester | Dokumen |
|---|---|
| Semester 1 (B01–B04 per mapel) | [KELAS1_SEMESTER1_MERDEKA_DRAFT.md](KELAS1_SEMESTER1_MERDEKA_DRAFT.md) |
| Semester 2 (B05–B08 per mapel) | [KELAS1_SEMESTER2_MERDEKA_DRAFT.md](KELAS1_SEMESTER2_MERDEKA_DRAFT.md) |

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

- Satu paket = satu bab: `kelas1-<subject>-b<nn>-<slug>`.
- Bahasa lebih pendek, aktivitas 3 langkah, banyak gambar.
- `curriculumRefs` kosong sampai D6 disetujui.

## Hasil audit konten Kelas 1 (2026-10-24)

- **Tidak ada paket produksi Kelas 1.**
- Pola paket Fase B/C dipakai ulang dengan penyederhanaan bahasa dan aktivitas.

## Prioritas paket starter (batch 1)

Enam paket B01, satu per mapel:

1. `kelas1-matematika-b01-bilangan-1-10`
2. `kelas1-bahasa-indonesia-b01-huruf-suku-kata`
3. `kelas1-pendidikan-pancasila-b01-simbol-pancasila`
4. `kelas1-seni-rupa-b01-garis-warna`
5. `kelas1-pjok-b01-jalan-lari`
6. `kelas1-pai-b01-huruf-hijaiyah`

## Gerbang sebelum kenaikan status

- [ ] D3–D7 diputuskan PO + Curriculum Lead.
- [ ] Urutan bab diverifikasi terhadap CP/ATP resmi.
- [ ] `curriculumRefs` per bab diisi.
- [ ] Review pedagogis R1–R12 per paket.
