# ADR-0019 — Audit aksesibilitas otomatis

- **Status:** Accepted (implemented) · **Tanggal:** 2026-10-24
- **Konteks:** Register gap mencatat belum ada audit aksesibilitas menyeluruh; target perangkat adalah panel sentuh di ruang kelas dan siswa sekolah dasar, sehingga nama aksesibel, struktur heading, kontras, dan navigasi keyboard adalah syarat fungsional, bukan pelengkap. Menambah pustaka seperti `axe-core` akan memicu gate dependensi (G5) dan menambah bobot tooling.

## Keputusan

1. Audit dijalankan sebagai skenario E2E `npm run a11y` memakai harness CDP yang sudah ada (ADR-0017), tanpa dependensi baru.
2. Pemeriksaan otomatis per layar (8 layar):
   - nama aksesibel untuk seluruh elemen interaktif;
   - `alt` pada gambar; ID unik; `button[type]`;
   - tepat satu `<h1>`, tanpa lompatan level heading;
   - satu landmark `<main>`, `<nav>` bernama;
   - `role="tab"` memiliki `aria-controls` yang menunjuk panel valid;
   - kontras teks terlihat (ambang 4.5:1 normal, 3:1 teks besar, sampling seluruh teks terlihat).
3. Pemeriksaan keyboard: Tab pertama harus memfokuskan tautan “Lewati ke konten utama”; 10 langkah Tab berikutnya harus memiliki nama dan indikator fokus.
4. Temuan diperbaiki pada fase ini:
   - token `--color-muted` `#64748b` → `#5f7085` (4.47:1 → 4.76:1 pada `paper`);
   - Player memakai `<h1>` untuk judul lesson (sebelumnya `<h2>`);
   - tab aktivitas memiliki `aria-controls`/`role="tabpanel"`/`aria-labelledby` + navigasi panah/Home/End.

## Addendum 2026-10-24 — reflow, teks 200%, target sentuh, state dinamis

Cakupan audit diperluas (masih skenario `npm run a11y`):

5. **Reflow**: setiap layar diuji pada lebar 640 px dan 320 px; gagal bila `scrollWidth > clientWidth`.
6. **Teks 200%**: root font-size dinaikkan 200% pada Pengaturan; gagal bila muncul overflow horizontal.
7. **Target sentuh**: elemen interaktif terlihat harus ≥ 44 px tinggi (warning) dan ≥ 24 px (error); radio/checkbox diukur lewat `<label>` pembungkusnya. Ditemukan select preferensi 36 px → diperbaiki ke `min-h-11`.
8. **State dinamis**: panel konfirmasi hapus profil diaudit dengan aturan yang sama (nama, heading, kontras).
9. **Hasil kuis** (addendum 2026-10-24): skenario menyelesaikan kuis pilot hingga “Skor 100” dan penyimpanan lokal, lalu menjalankan seluruh aturan audit pada state hasil (banner feedback, tombol ulangi).

## Batas yang diakui

- Ini audit heuristik, bukan pengganti audit manusia/screen reader (NVDA/TalkBack).
- Kontras dihitung dari warna computed; teks di atas gambar/gradien dilewati.
- State dinamis yang diaudit: panel konfirmasi hapus dan hasil kuis; dialog native dan pesan error lain belum.
- Target sentuh diukur dari `getBoundingClientRect`, bukan pengujian jari nyata.
- Harness menolak berjalan bila masih ada `ifp-apps.exe` (mencegah bentrok WebView2), bukan mematikannya otomatis.
- DV-01…DV-20 tetap wajib pada perangkat fisik.

## Konsekuensi

- `npm run a11y` menjadi gerbang tambahan sebelum rilis; gagal bila ada error.
- Laporan `a11y-report.json` disimpan bersama artefak E2E untuk bukti.
- Perubahan token warna menyentuh seluruh UI; build, smoke, dan E2E profil dijalankan ulang sebagai regresi.

## Alternatif

| Alternatif | Alasan ditolak |
|---|---|
| `axe-core` | Dependensi baru (G5) dan tetap tidak menguji keyboard/skip link |
| Audit manual saja | Tidak dapat diulang dan mudah terlewat saat UI berubah |
| Lighthouse | Tidak tersedia untuk WebView2/Tauri |
