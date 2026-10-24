# Jadwal & Urutan Produksi Konten — Kelas 1–6

**Status:** `DRAFT PLAN` — bergantung pada persetujuan OD-1 (D3–D7). Bukan komitmen tanggal.
**Tanggal:** 2026-10-24 · **Acuan struktur:** Kurikulum Merdeka, Fase A/B/C + pembaruan Permendikdasmen 13/2025 (Koding & KA pilihan mulai kelas 5).

## Asumsi perencanaan

1. Satu paket = satu bab; satu lesson + 2 aktivitas + minimal 1 aset PNG per paket.
2. Rata-rata **8 bab per mapel per tahun** (4 bab/semester). Ini asumsi perencanaan, bukan ketentuan resmi.
3. Mapel inti: Fase A = 6; Fase B/C = 7 (IPAS mulai kelas 3).
4. Pilihan: Bahasa Inggris (kelas 3–6, sesuai kebijakan sekolah), Muatan Lokal, dan Koding & KA (kelas 5–6).
5. Setiap paket melewati gate: draft → validated → reviewed → approved → imported.
6. `curriculumRefs` diisi setelah D6 disetujui; sebelum itu paket berstatus draft dengan warning validator.

## Jumlah paket

| Kelas | Fase | Mapel inti | Paket inti/tahun | + Bahasa Inggris | + Koding & KA |
|---|---|---:|---:|---:|---:|
| 1 | A | 6 | 48 | 48 (tidak ada di Fase A) | — |
| 2 | A | 6 | 48 | 48 | — |
| 3 | B | 7 | 56 | 64 | — |
| 4 | B | 7 | 56 | 64 | — |
| 5 | C | 7 | 56 | 64 | 72 |
| 6 | C | 7 | 56 | 64 | 72 |
| **Total** | | | **320** | **384** | **400** |

Muatan lokal menambah sesuai jumlah mapel yang dipilih sekolah.

## Urutan produksi (gelombang)

Alasan urutan: mulai dari Fase B karena pilot kelas 3 dan outline kelas 4 sudah ada; lanjut Fase C; Fase A terakhir karena konten lebih sederhana dan bisa memakai template yang sudah matang.

| Gelombang | Isi | Paket inti | Prasyarat | Exit criteria |
|---|---|---:|---|---|
| **G0 Fondasi** | OD-1 D3–D7, template paket, pipeline aset, reviewer, harness impor | 0 | PO + Curriculum Lead | D3–D7 disetujui; 1 template tervalidasi |
| **G1 Fase B S1** | Kelas 4 (starter 4 paket → sisa S1) lalu Kelas 3 S1 | 56 | G0; outline Fase B | 4 starter lolos review; impor aplikasi PASS |
| **G2 Fase B S2** | Kelas 4 S2 lalu Kelas 3 S2 | 56 | G1 | Seluruh Fase B tervalidasi + review |
| **G3 Fase C S1** | Kelas 5 S1 lalu Kelas 6 S1 | 56 | G2 | Fase C S1 tervalidasi + review |
| **G4 Fase C S2** | Kelas 5 S2 lalu Kelas 6 S2 | 56 | G3 | Fase C lengkap |
| **G5 Fase A S1** | Kelas 1 S1 lalu Kelas 2 S1 | 48 | G2 (template matang) | Fase A S1 tervalidasi + review |
| **G6 Fase A S2** | Kelas 1 S2 lalu Kelas 2 S2 | 48 | G5 | Fase A lengkap |
| **G7 Pilihan** | Bahasa Inggris 3–6 (64 paket) dan/atau Koding & KA 5–6 (16 paket) | 0–80 | Keputusan sekolah/PO | Opsi tervalidasi + review |

Di dalam setiap gelombang, produksi dilakukan per **batch 4 paket** (satu paket per mapel) agar review pedagogis tidak menumpuk.

## Kalender indikatif

Mulai dihitung setelah G0 selesai. Kapasitas produksi 8 paket/minggu (2 alur paralel) + buffer review 20%.

| Gelombang | Durasi | Minggu (relatif) |
|---|---|---|
| G0 | 1 minggu | 1 |
| G1 | 8 minggu | 2–9 |
| G2 | 8 minggu | 10–17 |
| G3 | 8 minggu | 18–25 |
| G4 | 8 minggu | 26–33 |
| G5 | 7 minggu | 34–40 |
| G6 | 7 minggu | 41–47 |
| G7 (opsional) | 9–14 minggu | 48–61 |

Total inti ±47 minggu (≈11 bulan). Dengan Bahasa Inggris + Koding/KA ±14 bulan.

Skenario kapasitas lain untuk 320 paket inti:

| Kapasitas | Waktu produksi | + buffer review 20% |
|---|---:|---:|
| 4 paket/minggu | 80 minggu | ±96 minggu (≈22 bulan) |
| 8 paket/minggu | 40 minggu | ±48 minggu (≈11 bulan) |
| 12 paket/minggu | ±27 minggu | ±32 minggu (≈7,5 bulan) |

Bottleneck utama bukan penulisan, melainkan **review pedagogis R1–R12** dan penyediaan aset. Tambah reviewer sebelum menaikkan kapasitas.

## Gate per paket

1. **Draft** — manifest, lesson, 2 aktivitas, aset, alt text.
2. **Validated** — `npm run content:validate -- content/packages/<id>` → VALID (warning `curriculumRefs` boleh selama D6 belum disetujui).
3. **Reviewed** — rubrik R1–R12 oleh reviewer manusia; R10 (`curriculumRefs`) tetap BLOCKING sampai D6.
4. **Approved** — reviewStatus naik; katalog diperbarui.
5. **Imported** — impor ke aplikasi + uji Player/Hasil Belajar; rollback diuji sekali per batch.

## Risiko & mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Reviewer pedagogis terbatas | Gelombang tertunda | Batch 4 paket; reviewer pool; review paralel per mapel |
| D3–D7 belum diputuskan | Paket tidak bisa `approved` | G0 wajib selesai sebelum G1 |
| Aset visual banyak | Waktu produksi naik | Template aset deterministik; standar 800×600; alt text wajib |
| PAI & mulok bervariasi | Duplikasi paket | Satu paket per agama/varian; keputusan sekolah |
| Koding & KA baru (2025) | Pedoman belum matang | Tunda ke G7 sampai kebijakan sekolah jelas |
| `curriculumRefs` salah format | Validator gagal | Gunakan objek `{framework, id, version}` |

## Keputusan yang masih diperlukan

- D3 Bahasa Inggris: masuk gelombang inti atau G7?
- D4 strand Seni: Rupa/Musik/Tari/Teater per kelas?
- D5 muatan lokal: ada/tidak dan siapa penyedianya?
- D6 format `curriculumRefs` dan ID resminya.
- D7 jumlah unit minimum per mapel/kelas (OD-8).
