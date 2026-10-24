# Analisis Gap Kualitas Konten — 2026-10-25

**Status:** `ANALISIS` — bukan approval. Angka dihasilkan dari pembacaan 320 paket aktual.
**Standar acuan:** kedalaman, asesmen, keselarasan, bahasa, diferensiasi, aksesibilitas.

## Ringkasan

- Total paket: **320**
- Paket yang memenuhi seluruh G1–G12: **0/320**
- Paket dalam grup duplikasi persis: **6** (3 grup)
- Paket dengan aktivitas identik lintas paket: **16** (8 grup)
- Aset dipakai ulang lintas paket: **61** hash
- Tujuan tercakup penuh: **266/320** · sebagian: **54** · nol: **0**
- Aset unik: **82** hash untuk 320 paket

## Temuan khusus

- Semua paket memiliki **3 langkah eksplorasi, 2 aktivitas, dan 4–6 item asesmen** — belum ada satu pun yang memenuhi G1–G3.
- Opsi jawaban duplikat: `kelas1-bahasa-indonesia-b05-membaca-kalimat`.
- Tujuan tercakup sebagian: **54 paket** — contoh: `kelas1-matematika-b02-penjumlahan-10`, `kelas1-matematika-b06-penjumlahan-20`, `kelas1-matematika-b07-bangun-datar`, `kelas1-pai-b03-akhlak`, `kelas1-pai-b05-huruf-harakat`, `kelas1-pai-b08-adab`.
- Duplikasi penuh: **3 grup** (6 paket); aktivitas identik: **8 grup** (16 paket).

## Gap terhadap standar

| ID | Kriteria | Lulus | Gagal | % Lulus |
|---|---|---:|---:|---:|
| G1 | Langkah eksplorasi ≥ 5 | 4 | 316 | 1% |
| G2 | Aktivitas ≥ 3 | 4 | 316 | 1% |
| G3 | Item asesmen ≥ 8 | 4 | 316 | 1% |
| G4 | Tujuan ≥ 3 dan semua tercakup aktivitas | 266 | 54 | 83% |
| G5 | Bahasa dalam batas kata/kalimat kelas | 320 | 0 | 100% |
| G6 | Tanpa duplikasi persis antar paket | 314 | 6 | 98% |
| G7 | Aset tidak dipakai ulang lintas kelas | 21 | 299 | 7% |
| G8 | `curriculumRefs` terisi | 0 | 320 | 0% |
| G9 | Alt text lengkap | 320 | 0 | 100% |
| G10 | Sudah direview manusia | 0 | 320 | 0% |
| G11 | Tidak ada opsi jawaban duplikat | 319 | 1 | 100% |
| G12 | Aktivitas tidak identik dengan paket lain | 304 | 16 | 95% |

## Rata-rata per kelas

| Kelas | Paket | Langkah | Aktivitas | Item asesmen | Kata/kalimat |
|---|---:|---:|---:|---:|---:|
| 1 | 48 | 3.0 | 2.0 | 5.1 | 4.3 |
| 2 | 48 | 3.0 | 2.0 | 5.1 | 4.3 |
| 3 | 56 | 3.0 | 2.0 | 5.1 | 6.0 |
| 4 | 56 | 3.1 | 2.1 | 5.2 | 7.6 |
| 5 | 56 | 3.0 | 2.0 | 5.2 | 5.6 |
| 6 | 56 | 3.0 | 2.0 | 5.1 | 5.1 |

## Duplikasi per mapel

| Mapel | Paket | Paket duplikat (penuh/aktivitas) |
|---|---:|---:|
| Bahasa Indonesia | 48 | 2 |
| IPAS | 32 | 0 |
| Matematika | 48 | 0 |
| PAI | 48 | 8 |
| Pendidikan Pancasila | 48 | 0 |
| PJOK | 48 | 2 |
| Seni Rupa | 48 | 4 |

## Grup duplikasi persis (prioritas diferensiasi)

- `kelas1-pai-b08-adab` (Kelas 1) = `kelas2-pai-b08-adab` (Kelas 2)
- `kelas1-pjok-b08-kesehatan-kebersihan` (Kelas 1) = `kelas2-pjok-b08-kesehatan` (Kelas 2)
- `kelas1-seni-rupa-b07-apresiasi` (Kelas 1) = `kelas2-seni-rupa-b07-apresiasi` (Kelas 2)

## Grup aktivitas identik (prioritas diferensiasi)

- `kelas1-bahasa-indonesia-b07-bercerita` (Kelas 1) = `kelas2-bahasa-indonesia-b07-bercerita` (Kelas 2)
- `kelas1-pai-b02-iman-allah` (Kelas 1) = `kelas2-pai-b02-iman-allah` (Kelas 2)
- `kelas1-pai-b03-akhlak` (Kelas 1) = `kelas2-pai-b03-akhlak` (Kelas 2)
- `kelas1-pai-b08-adab` (Kelas 1) = `kelas2-pai-b08-adab` (Kelas 2)
- `kelas1-pjok-b08-kesehatan-kebersihan` (Kelas 1) = `kelas2-pjok-b08-kesehatan` (Kelas 2)
- `kelas1-seni-rupa-b04-kolase` (Kelas 1) = `kelas2-seni-rupa-b04-kolase` (Kelas 2)
- `kelas1-seni-rupa-b07-apresiasi` (Kelas 1) = `kelas2-seni-rupa-b07-apresiasi` (Kelas 2)
- `kelas5-pai-b08-adab` (Kelas 5) = `kelas6-pai-b08-adab` (Kelas 6)

## Paket dengan prioritas tertinggi

| packageId | Kelas | Mapel | Langkah | Aktivitas | Item | Gap | Duplikat |
|---|---:|---|---:|---:|---:|---:|---:|
| `kelas1-pai-b03-akhlak` | 1 | PAI | 3 | 2 | 6 | 7 | 2 |
| `kelas1-pai-b08-adab` | 1 | PAI | 3 | 2 | 4 | 7 | 2 |
| `kelas1-pjok-b08-kesehatan-kebersihan` | 1 | PJOK | 3 | 2 | 6 | 7 | 2 |
| `kelas2-pai-b03-akhlak` | 2 | PAI | 3 | 2 | 6 | 7 | 2 |
| `kelas2-pai-b08-adab` | 2 | PAI | 3 | 2 | 4 | 7 | 2 |
| `kelas2-pjok-b08-kesehatan` | 2 | PJOK | 3 | 2 | 6 | 7 | 2 |
| `kelas6-pai-b08-adab` | 6 | PAI | 3 | 2 | 4 | 7 | 2 |
| `kelas1-bahasa-indonesia-b07-bercerita` | 1 | Bahasa Indonesia | 3 | 2 | 5 | 6 | 2 |
| `kelas1-pai-b02-iman-allah` | 1 | PAI | 3 | 2 | 6 | 6 | 2 |
| `kelas1-seni-rupa-b04-kolase` | 1 | Seni Rupa | 3 | 2 | 5 | 6 | 2 |
| `kelas1-seni-rupa-b07-apresiasi` | 1 | Seni Rupa | 3 | 2 | 4 | 6 | 2 |
| `kelas2-bahasa-indonesia-b07-bercerita` | 2 | Bahasa Indonesia | 3 | 2 | 5 | 6 | 2 |
| `kelas2-pai-b02-iman-allah` | 2 | PAI | 3 | 2 | 6 | 6 | 2 |
| `kelas2-seni-rupa-b04-kolase` | 2 | Seni Rupa | 3 | 2 | 5 | 6 | 2 |
| `kelas2-seni-rupa-b07-apresiasi` | 2 | Seni Rupa | 3 | 2 | 4 | 6 | 2 |
| `kelas5-pai-b08-adab` | 5 | PAI | 3 | 2 | 4 | 6 | 2 |
| `kelas1-matematika-b02-penjumlahan-10` | 1 | Matematika | 3 | 2 | 6 | 6 | - |
| `kelas1-matematika-b06-penjumlahan-20` | 1 | Matematika | 3 | 2 | 4 | 6 | - |
| `kelas1-matematika-b07-bangun-datar` | 1 | Matematika | 3 | 2 | 6 | 6 | - |
| `kelas1-pai-b05-huruf-harakat` | 1 | PAI | 3 | 2 | 6 | 6 | - |
| `kelas1-pendidikan-pancasila-b03-hak-kewajiban-rumah` | 1 | Pendidikan Pancasila | 3 | 2 | 6 | 6 | - |
| `kelas1-pjok-b01-jalan-lari` | 1 | PJOK | 3 | 2 | 6 | 6 | - |
| `kelas1-pjok-b02-melompat` | 1 | PJOK | 3 | 2 | 4 | 6 | - |
| `kelas1-pjok-b03-keseimbangan` | 1 | PJOK | 3 | 2 | 5 | 6 | - |
| `kelas1-pjok-b04-kebersihan` | 1 | PJOK | 3 | 2 | 6 | 6 | - |
| `kelas1-pjok-b05-permainan-sederhana` | 1 | PJOK | 3 | 2 | 4 | 6 | - |
| `kelas1-pjok-b06-senam-ringan` | 1 | PJOK | 3 | 2 | 5 | 6 | - |
| `kelas1-seni-rupa-b05-mewarnai-bentuk` | 1 | Seni Rupa | 3 | 2 | 5 | 6 | - |
| `kelas2-bahasa-indonesia-b05-membaca-pemahaman` | 2 | Bahasa Indonesia | 3 | 2 | 4 | 6 | - |
| `kelas2-matematika-b02-penjumlahan-100` | 2 | Matematika | 3 | 2 | 4 | 6 | - |
| `kelas2-matematika-b03-perkalian-dasar` | 2 | Matematika | 3 | 2 | 6 | 6 | - |
| `kelas2-pai-b06-zakat` | 2 | PAI | 3 | 2 | 6 | 6 | - |
| `kelas2-pai-b07-kisah-nabi` | 2 | PAI | 3 | 2 | 5 | 6 | - |
| `kelas2-pendidikan-pancasila-b03-hak-kewajiban-siswa` | 2 | Pendidikan Pancasila | 3 | 2 | 6 | 6 | - |
| `kelas2-pendidikan-pancasila-b04-musyawarah` | 2 | Pendidikan Pancasila | 3 | 2 | 5 | 6 | - |
| `kelas2-pendidikan-pancasila-b06-nkri` | 2 | Pendidikan Pancasila | 3 | 2 | 4 | 6 | - |
| `kelas2-pjok-b01-gerak-lokomotor` | 2 | PJOK | 3 | 2 | 6 | 6 | - |
| `kelas2-pjok-b04-kebugaran-kebersihan` | 2 | PJOK | 3 | 2 | 6 | 6 | - |
| `kelas2-pjok-b05-bola-kecil` | 2 | PJOK | 3 | 2 | 4 | 6 | - |
| `kelas2-pjok-b06-senam` | 2 | PJOK | 3 | 2 | 5 | 6 | - |

## Rekomendasi urutan perbaikan

1. **Diferensiasi** — pecah grup duplikasi persis; bedakan teks, contoh, dan asesmen per kelas.
2. **Kedalaman** — naikkan eksplorasi menjadi 5+ langkah dan tambah aktivitas ketiga (remediasi/pengayaan).
3. **Asesmen** — minimal 8 item per paket, pengecoh masuk akal, umpan balik per jawaban.
4. **Keselarasan** — pastikan setiap tujuan punya bukti di aktivitas/asesmen.
5. **Bahasa & aset** — sesuaikan panjang kalimat per kelas; kurangi pemakaian ulang aset yang identik.
6. **Review manusia** — R1–R12 setelah perbaikan; `curriculumRefs` menunggu D6.
