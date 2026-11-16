# ADR-0033 — Format & Pengisian Awal `curriculumRefs` (D6 Provisional)

**Status:** Accepted (provisional) · **Tanggal:** 2026-10-25
**Dasar:** instruksi Product Owner untuk menyelesaikan G8 sebelum replikasi pilot.

## Konteks

G8 mensyaratkan `curriculumRefs` terisi. D6 (format/ID resmi) belum disahkan Curriculum Lead. Menunda G8 menghambat replikasi pilot; mengisi ID karangan akan menciptakan klaim kurikulum palsu.

## Keputusan

1. Format mengikuti proposal D6: objek `{ framework, id, version }`.
2. Untuk pilot Kelas 4 digunakan:
   ```json
   { "framework": "kurikulum-merdeka", "id": "fase-b", "version": "2024" }
   ```
3. Referensi ini bersifat **phase-level** dan merujuk pada Permendikbudristek No. 12 Tahun 2024 (Fase B: kelas 3–4).
4. `curriculumRefs` diisi identik pada manifest dan lesson.
5. Pemetaan per mata pelajaran/bab ke CP/ATP resmi **belum** dilakukan; itu tetap tugas Curriculum Lead.

## Konsekuensi

- G8 lulus secara teknis untuk 4 pilot; warning validator berkurang.
- **R10 belum dianggap final**: reviewer manusia tetap harus memverifikasi kesesuaian CP/ATP per bab sebelum `reviewStatus` naik.
- Replikasi boleh memakai pola fase (`fase-a` untuk kelas 1–2, `fase-c` untuk kelas 5–6), tetapi dilarang mengklaim pemetaan per-bab tanpa persetujuan Curriculum Lead.
- Jika Curriculum Lead menetapkan ID resmi berbeda, semua `curriculumRefs` diganti dan versi paket dinaikkan.
