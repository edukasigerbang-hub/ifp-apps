# ADR-0014 — Ekspor laporan hasil belajar (CSV)

- **Status:** Accepted (implemented) · **Tanggal:** 2026-10-24
- **Konteks:** HLD §13.3 mencantumkan opsi ekspor laporan pada layar Hasil Belajar. Belum ada mekanisme ekspor.

## Keputusan

1. Command native `results_export_csv(destination)` menulis CSV **UTF-8 dengan BOM** dan CRLF (kompatibel Excel).
2. Kolom: `profil, lesson_id, activity_id, percobaan, skor, selesai_pada`; urut selesai terbaru.
3. **Escaping**: field dengan koma/quote/newline dikutip; quote di-escape ganda.
4. **CSV injection guard**: nilai yang dimulai `= + - @ TAB CR` diberi prefix apostrof.
5. Menolak menimpa file yang sudah ada; UI memakai dialog simpan.

## Konsekuensi

- File memuat **nama profil lokal** (PII) — harus dijaga, tidak diunggah otomatis.
- Belum ada filter tanggal/kelas/mapel; semua percobaan diekspor.
- Skor dua desimal; waktu dalam UTC (belum dilokalisasi).
- Tidak menyertakan jawaban mentah atau data lisensi.

## Alternatif

| Alternatif | Alasan ditolak |
|---|---|
| Ekspor dari UI (render tabel) | UI bukan sumber data; rawan tidak konsisten |
| XLSX sekarang | Menambah dependency; CSV cukup untuk laporan dasar |
| Tanpa guard formula | Risiko CSV injection saat dibuka di spreadsheet |
| Menyertakan jawaban mentah | Data berlebih; privasi |
