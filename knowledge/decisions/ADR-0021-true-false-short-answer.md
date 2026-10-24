# ADR-0021 — Aktivitas benar-salah & jawaban singkat (responseText)

- **Status:** Accepted (implemented) · **Tanggal:** 2026-10-24
- **Konteks:** Skema aktivitas sudah mendefinisikan enam tipe, tetapi Player baru merender `multiple-choice` dan `exploration`. `true-false` dan `short-answer` sudah memiliki kontrak penilaian di skema (`responseType: boolean`/`text`), sehingga dapat diimplementasikan tanpa mengarang format baru. Namun tabel `assessment_responses` dan payload sinkronisasi hanya mengenal `optionId`, yang tidak cocok untuk jawaban teks.

## Keputusan

1. **Penilaian bersama** (`src/content/quiz.ts`):
   - `isAnswerCorrect(question, answer)` dipakai oleh skor dan penandaan per jawaban;
   - jawaban `text` dibandingkan setelah `trim()` + `toLowerCase()`;
   - `boolean` memakai nilai `"true"`/`"false"`.
2. **UI** (`QuizActivity`): merender radio untuk `single-choice`/`boolean` (label “Benar”/“Salah”) dan input teks untuk `responseType: "text"`. Tombol periksa hanya aktif bila semua soal terjawab (teks tidak boleh kosong).
3. **Kontrak jawaban diperluas**:
   - `AnswerInput` (Rust) mendapat `response_text: Option<String>`;
   - tepat satu dari `option_id` **atau** `response_text` wajib terisi; teks 1–500 karakter;
   - `assessment_responses.response_json` menyimpan `{"optionId": ..., "responseText": ...}`;
   - payload sinkronisasi memuat `responseText` (nullable). Backend referensi menyimpan apa adanya; penilaian tetap di klien dengan `isCorrect` sebagai sinyal, bukan otoritas server.
4. **Routing Player**: `multiple-choice`, `true-false`, dan `short-answer` memakai `QuizActivity`; setiap aktivitas diberi `key` agar state tidak bocor antar-tab (bug ditemukan E2E saat dua aktivitas kuis bertipe sama).
5. `matching`, `ordering`, dan `multiple-choice` multi-jawaban **tidak** diimplementasikan pada fase ini karena belum ada kontrak interaksi yang disepakati (OD-1/OD-7).

## Konsekuensi

- Payload sinkronisasi berubah (menambah `responseText`); client dan server referensi diperbarui. Backend produksi harus menerima field ini (OD-7).
- Jawaban teks dinilai otomatis hanya untuk kecocokan persis setelah normalisasi; variasi ejaan tidak diterima. Ini eksplisit agar tidak ada penilaian semu.
- Data lama tanpa `responseText` tetap valid (`serde(default)` / field opsional).

## Alternatif

| Alternatif | Alasan ditolak |
|---|---|
| Menyimpan teks di `optionId` | Melanggar aturan ID, membingungkan data dan sinkronisasi |
| Penilaian teks dengan fuzzy matching | Risiko salah nilai tanpa kesepakatan pedagogis |
| Menunggu OD-1 | `true-false`/`short-answer` sudah punya kontrak skema; menunggu menghambat Fase G tanpa alasan teknis |
