# ADR-0022 — Pilihan ganda multi-jawaban

- **Status:** Accepted (implemented) · **Tanggal:** 2026-10-24
- **Konteks:** Skema pertanyaan sudah mendukung `responseType: "multiple-choice"` dengan `correctResponse` berupa array `optionId`, tetapi Player hanya merender satu pilihan (radio). Kontrak ini tidak memerlukan field baru, hanya perilaku UI dan penyimpanan jawaban.

## Keputusan

1. **Penilaian himpunan**: jawaban benar hanya jika himpunan opsi terpilih **sama persis** dengan `correctResponse` (urutan diabaikan, duplikat dinormalkan). Tidak ada nilai parsial.
2. **UI**: `multiple-choice` dirender sebagai checkbox; jawaban disimpan sebagai array opsi di state. Tombol periksa aktif bila minimal satu opsi dipilih untuk setiap soal multi.
3. **Penyimpanan**: setiap opsi terpilih menjadi satu baris respons (`questionId` sama, `optionId` berbeda) dengan `responseText: null`. `isCorrect` per opsi berarti “opsi ini termasuk jawaban benar”, bukan benar/salah soal. Skor soal tetap dihitung dari kecocokan himpunan.
4. **Sinkronisasi**: payload dapat memuat beberapa entri `answers` dengan `questionId` sama; backend menyimpan apa adanya (SYNC_CONTRACT diperbarui).
5. **Harness**: skrip E2E menunggu shell aplikasi (“Jelajah Materi”) sebelum menjalankan skenario, memperbaiki kegagalan transien halaman kosong saat WebView2 baru start.

## Konsekuensi

- Laporan hasil per soal harus mengagregasi baris respons berdasarkan `questionId` bila ingin menghitung “soal benar”, bukan menghitung baris.
- Tidak ada umpan balik sebagian (mis. 1 dari 2 opsi benar) — konsisten dengan kontrak skor saat ini.
- `matching` dan `ordering` tetap belum diimplementasikan karena belum ada kontrak interaksi.

## Alternatif

| Alternatif | Alasan ditolak |
|---|---|
| Menyimpan satu baris dengan `optionId` gabungan | Melanggar aturan ID dan menyulitkan analisis per opsi |
| Nilai parsial per opsi | Mengubah semantik skor dan ambang kelulusan tanpa kesepakatan |
| Checkbox tanpa `name` per soal | Menyulitkan pengelompokan dan pengujian aksesibilitas |
