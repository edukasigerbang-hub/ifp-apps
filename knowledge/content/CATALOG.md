# Katalog Konten

**Status:** 1 paket draft · 0 paket disetujui · review teknis selesai (review manusia belum)

| packageId | Versi | Kelas | Mapel | Topik | Status | Validasi | Reviewer |
|---|---|---|---|---|---|---|---|
| `matematika-kelas3-pecahan` | 0.1.0 | 3 | matematika | Pecahan 1/2, 1/3, 1/4 | **DRAFT** | VALID (2 warning) | Teknis PASS* / manusia belum |

\* Review teknis 2026-10-23: 1 temuan kontras diperbaiki (4.36 → 5.40). R10 `curriculumRefs` **BLOCKING**; R1–R5/R8–R9 belum direview manusia. Laporan: [REVIEW_REPORT_2026-10-23.md](REVIEW_REPORT_2026-10-23.md).

## `matematika-kelas3-pecahan` v0.1.0

- **Path:** [`content/packages/matematika-kelas3-pecahan/`](../../content/packages/matematika-kelas3-pecahan/)
- **Kurikulum:** `curriculumRefs: []` — **tidak ada klaim** kesesuaian kurikulum (OD-1 belum disetujui).
- **Judul:** Pecahan Sederhana — Matematika Kelas 3 (Draft).
- **Tujuan pembelajaran:**
  1. Menunjukkan pecahan 1/2, 1/3, dan 1/4 dari gambar yang dibagi sama besar.
  2. Menuliskan pecahan sederhana sesuai gambar.
  3. Membandingkan 1/2 dan 1/4 menggunakan dua gambar berukuran sama.
- **Isi:**
  - 1 lesson (`pecahan-sederhana`), reviewStatus `draft`.
  - Aktivitas eksplorasi 4 langkah dengan 4 diagram.
  - Kuis 4 soal pilihan ganda, nilai lulus 75, boleh mencoba lagi.
  - 4 aset PNG dibuat deterministik (bukan AI image) dan diverifikasi visual: bagian benar-benar sama besar.
- **Impor:** dapat diimpor via layar Konten & Pembaruan (validasi native + aktivasi/rollback). Player masih memuat paket bundled; wiring runtime = T-012.
- **Aset:** 800×600 px, palet sesuai design token HLD §13.5 (teal/navy), tanpa teks di dalam gambar (teks ada di instruksi).

## Hasil validasi

```bash
npm run content:validate -- content/packages/matematika-kelas3-pecahan
```

```text
status: VALID
issues: []
warnings:
- lesson 'pecahan-sederhana' masih berstatus draft dan belum boleh dianggap materi produksi
- manifest tidak memiliki curriculumRefs; jangan mengklaim kesesuaian kurikulum
```

## Yang belum dilakukan (jujur)

| Item | Status |
|---|---|
| Review pedagogis R1–R12 | **BELUM** — butuh guru/curriculum lead |
| Sign-off OD-1 / curriculumRefs | **BELUM** — proposal masih PROPOSED |
| Tampilan di aplikasi | **ADA** — Player + Hasil Belajar; hasil kuis tersimpan di SQLite lokal |
| Sinkronisasi cloud | **BELUM** — outbox tersimpan `pending`, belum dikirim |
| Signature paket | Null — kebijakan signature belum final |
| Hak/lisensi aset | Aman untuk draft: dibuat sendiri, bukan aset pihak ketiga |

## Next

1. Tunjuk reviewer (curriculum + bahasa + aksesibilitas) → isi [REVIEW_RUBRIC.md](REVIEW_RUBRIC.md).
2. Setujui OD-1 → isi `curriculumRefs` dan naikkan `reviewStatus`.
3. Setelah Fase E/G (repository + learning runtime), simpan hasil belajar dan hubungkan paket lain ke Content Runtime.
