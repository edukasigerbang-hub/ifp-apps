# ADR-0023 — Kontrak aktivitas matching & ordering

- **Status:** Accepted (implemented) · **Tanggal:** 2026-10-24
- **Konteks:** `activityTypes` mencakup `matching` dan `ordering`, tetapi `interactionConfig` masih bebas dan Player belum merendernya. Keduanya tidak membutuhkan `assessmentConfig`; skor dihitung dari kecocokan pasangan/posisi.

## Keputusan

1. **Matching** menggunakan `interactionConfig.pairs`:
   ```json
   { "pairs": [
     { "pairId": "pasangan-setengah", "left": "1/2", "right": "Setengah" }
   ] }
   ```
   - 2–12 pasangan; `pairId` unik; `left`/`right` 1–200 karakter.
   - UI: satu `<select>` per baris kiri; opsi kanan memakai `pairId` sebagai nilai.
   - Skor = pasangan benar / total × 100. Satu baris respons per pasangan: `questionId = pairId`, `optionId = pairId pilihan`.
2. **Ordering** menggunakan `interactionConfig.items` + `correctOrder`:
   ```json
   { "items": [{ "itemId": "angka-1", "text": "Angka 1" }],
     "correctOrder": ["angka-1", "angka-2"] }
   ```
   - 2–12 item; `itemId` unik; `correctOrder` memuat setiap `itemId` tepat sekali.
   - UI: daftar dengan tombol naik/turun (44 px, berlabel `Naikkan/Turunkan <teks>`).
   - Skor = posisi benar / total × 100. Satu baris respons per item: `questionId = itemId`, `optionId = "pos-<n>"`.
3. **Validasi kontrak** ditambahkan ke `activitySchema` (Zod) agar paket dengan konfigurasi salah ditolak sebelum aktivasi, bukan gagal di runtime.
4. **Tanpa nilai parsial per pasangan/posisi**; ambang kelulusan mengikuti `completionPolicy.threshold` (default 70 bila tidak ada).
5. **Registry**: `matching.requiresAssessment` diubah menjadi `false` agar konsisten dengan skema (skor dari `interactionConfig`, bukan `assessmentConfig`).

## Konsekuensi

- Kontrak ini adalah konvensi klien yang tervalidasi; backend hanya menerima `optionId` seperti aktivitas lain (tidak menilai ulang).
- Penilaian dilakukan di klien; `isCorrect` per baris adalah sinyal, bukan otoritas.
- Mengubah urutan/ pasangan setelah aktivitas dicoba mengubah skor retrospektif — sama seperti kuis.
- E2E membangun paket runtime dengan lima aktivitas untuk menguji seluruh tipe.

## Alternatif

| Alternatif | Alasan ditolak |
|---|---|
| Drag-and-drop bebas | Sulit diakses keyboard/touch dan tidak dapat diuji stabil via CDP |
| `assessmentConfig` untuk matching | Memaksa model soal-opsi yang tidak cocok dengan pasangan |
| Tanpa validasi skema | Paket rusak baru terdeteksi saat siswa membuka aktivitas |
