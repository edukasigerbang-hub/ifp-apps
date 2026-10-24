# Pilot Gold Standard — Kelas 4 B01 (2026-10-25)

**Status:** `PILOT-UPGRADED` — **11/12** kriteria terpenuhi; G10 menunggu review manusia.

## Paket

| packageId | Mapel | Versi |
|---|---|---|
| `kelas4-matematika-b01-bilangan-cacah` | Matematika | 0.2.0 |
| `kelas4-bahasa-indonesia-b01-teks-deskripsi` | Bahasa Indonesia | 0.2.0 |
| `kelas4-ipas-b01-makhluk-hidup` | IPAS | 0.2.0 |
| `kelas4-pendidikan-pancasila-b01-pancasila` | Pendidikan Pancasila | 0.2.0 |

## Perubahan dari 0.1.0

| Aspek | Sebelum | Sesudah |
|---|---|---|
| Langkah eksplorasi | 3 | **5** |
| Aktivitas | 2 | **3** (eksplorasi + matching + jawaban singkat) |
| Item asesmen | 4–6 | **10** (6 pasangan + 4 jawaban singkat) |
| Tujuan | 3 | **4**, semuanya tercakup aktivitas |
| Aset | dipakai ulang lintas paket | **4 aset baru unik** |
| Versi | 0.1.0 | **0.2.0** |

## Status G1–G12

| ID | Kriteria | Status |
|---|---|---|
| G1 | Langkah eksplorasi ≥5 | **PASS (5)** |
| G2 | Aktivitas ≥3 | **PASS (3)** |
| G3 | Item asesmen ≥8 | **PASS (10)** |
| G4 | Tujuan tercakup penuh | **PASS (4/4 tiap paket)** |
| G5 | Bahasa sesuai kelas | **PASS** |
| G6 | Tanpa duplikasi penuh | **PASS** |
| G7 | Aset unik lintas kelas | **PASS (0 berbagi)** |
| G8 | `curriculumRefs` terisi | **PASS (provisional)** — `fase-b`/2024, ADR-0033 |
| G9 | Alt text lengkap | **PASS** |
| G10 | Review manusia | **BELUM — R1–R12** |
| G11 | Opsi jawaban unik | **PASS** |
| G12 | Aktivitas tidak identik | **PASS** |

## Verifikasi aktual

| Check | Hasil |
|---|---|
| Validasi 4 paket | **VALID 4/4** |
| Impor `content_import_package` | **PASS 4/4**, 6 file/paket, `active` |
| UI katalog | Pencarian “Bilangan Cacah Besar” menampilkan **3 aktivitas · Paket impor**; screenshot terverifikasi |
| Indeks katalog | **OK 320 entri / 320 paket** |
| `npm test` | **85/85** + golden 4/4 |
| `npm run build` | **PASS** — utama 416,03 kB |

## Aset baru

- `pasar-nilai-tempat.png` — lima kolom nilai tempat.
- `taman-kota.png` — taman dengan air mancur, bangku, bunga, burung.
- `kolam-ekosistem.png` — kolam dengan katak, ikan, capung, teratai.
- `kelas-pancasila.png` — lima kegiatan kelas sesuai sila.

## Batas

- **G8** memakai referensi phase-level `{framework: kurikulum-merdeka, id: fase-b, version: 2024}` sesuai ADR-0033. Ini bukan pemetaan CP/ATP per bab; R10 tetap perlu verifikasi Curriculum Lead.
- **G10** hanya dapat dipenuhi reviewer manusia dengan formulir R1–R12.
- Empat paket ini menjadi template untuk 316 paket lain; replikasi tetap per batch dan harus direview manusia.
