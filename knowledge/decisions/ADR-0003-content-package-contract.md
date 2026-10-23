# ADR-0003 — Kontrak paket konten v1

- **Status:** Accepted (implemented) · **Tanggal:** 2026-10-23
- **Konteks:** Fase D diperlukan sebelum materi apa pun dibuat, agar konten tidak mengunci format yang salah.

## Keputusan

1. **Zod sebagai sumber tunggal** kontrak; JSON Schema di-generate dari Zod untuk kebutuhan Studio/backend.
2. **Lesson mereferensikan `activityIds`**, bukan menyematkan objek aktivitas. Aktivitas berdiri sendiri agar dapat dipakai ulang dan diuji terpisah.
3. **`curriculumRefs` opsional** di manifest/lesson. Tanpa ref, validator memberi peringatan bahwa kesesuaian kurikulum tidak boleh diklaim (mendukung OD-1 yang masih terbuka).
4. **Daftar mapel tidak di-hardcode**; `subjects` adalah slug data. Perubahan kurikulum tidak memerlukan perubahan schema.
5. **Larangan eksekusi kode**: strict object + pemindaian field/nilai terlarang pada `interactionConfig`.
6. **Verifikasi aset** memakai SHA-256 + ukuran, path relatif aman, media type allowlist.
7. **Versi kontrak** `schemaVersion: 1.0.0`; versi lain ditolak, bukan ditebak.

## Konsekuensi

- Content Studio wajib menghasilkan format ini; perubahan format = versi schema baru + migrasi.
- Validator runtime (Zod) wajib dipakai; JSON Schema saja tidak menangkap aturan lintas-field.
- Kontrak per tipe aktivitas (`matching`, `ordering`, dll.) masih generik → dituntaskan di Fase G tanpa mengubah manifest.
- Signature paket belum diverifikasi; ditunda sampai kebijakan distribusi/keamanan final.

## Alternatif yang tidak dipilih

| Alternatif | Alasan |
|---|---|
| JSON Schema sebagai sumber, Zod digenerate | Aturan lintas-field sulit dinyatakan; validasi runtime tetap perlu kode |
| Aktivitas disematkan di lesson | Duplikasi, sulit diuji ulang, paket membengkak |
| Hardcode daftar mapel di schema | OD-1 belum final; perubahan kurikulum memaksa migrasi |
