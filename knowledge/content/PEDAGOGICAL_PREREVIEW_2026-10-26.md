# Pra-Review Pedagogis Agent — 2026-10-26

**Status:** `PRA-REVIEW AGENT — BUKAN APPROVAL`. Laporan ini mengumpulkan bukti untuk reviewer manusia; **tidak ada PASS/FAIL**, **tidak ada** perubahan `reviewStatus`, dan **bukan** pengganti penilaian R1–R6, R8–R9, R12.
**Cakupan:** 320 paket draft (`content/packages/`).
**Rubrik:** [REVIEW_RUBRIC.md](REVIEW_RUBRIC.md) · **Lembar kerja:** [REVIEW_WORKSHEET_2026-10-25.md](../release/REVIEW_WORKSHEET_2026-10-25.md)
**Berkas pendamping:** [sampel baca stratifikasi](PEDAGOGICAL_SAMPLE_2026-10-26.md) · [bukti per paket (JSON)](prereview-evidence-2026-10-26.json) · [flag per paket (CSV)](prereview-flags-2026-10-26.csv)

## Batas peran

| Kriteria | Yang dilakukan agent | Yang wajib diputuskan manusia |
|---|---|---|
| R1 | Menghitung cakupan kata kunci tujuan → aktivitas | Apakah tujuan terukur dan sesuai kelas |
| R2 | Menyiapkan daftar jawaban/klaim faktual untuk dibaca | Kebenaran konsep per mapel |
| R3 | Mengukur panjang kalimat/kata + estimasi waktu baca | Kesesuaian bahasa dengan usia |
| R4 | Menghitung langkah/aktivitas/item + estimasi durasi | Kewajaran beban kognitif (butuh uji coba) |
| R5 | Memetakan soal → tujuan, bias posisi kunci, item tak terpetakan | Validitas asesmen terhadap tujuan |
| R6 | Memeriksa `feedbackPolicy`, cakupan hint, pindai nada negatif | Apakah umpan balik suportif dan tidak mempermalukan |
| R8 | Pindai regex data pribadi/konten sensitif pada teks | Apakah ada data pribadi/konteks sensitif yang lolos |
| R9 | Memeriksa keberadaan file aset, URL eksternal, jumlah aset | Kejelasan hak/lisensi tiap aset |
| R12 | Memindai klaim kurikulum di permukaan pengguna | Apakah klaim pemasaran boleh dipakai |

## Ringkasan temuan (320 paket)

| Kriteria | Paket dengan flag | Temuan utama |
|---|---:|---|
| R1 | 66 | 67 tujuan cakupan kata kunci < 0.5; 1 tujuan tanpa kata bermakna (cek manual) |
| R3 | 40 | 82 kalimat melebihi batas kata/kelas |
| R4 | 0 | 0 paket di atas anggaran menit; 0 di bawah 5 menit |
| R5 | 184 | 170 paket matching identik penuh dengan eksplorasi; 91 paket semua kunci di posisi sama; 1188 item tak terpetakan (kata kunci) |
| R6 | 0 | Policy lengkap 320/320; hint lengkap 320/320; nada negatif 20 paket |
| R8 | 0 | Pola data pribadi 0 paket; pola sensitif 0 paket |
| R9 | 0 | File aset hilang 0; paket dengan URL eksternal 0 |
| R12 | 1 file | Klaim “kurikulum” di permukaan pengguna: 0 file; label PAI eksplisit absen di 1 file |

## R1 — Tujuan ↔ aktivitas

Metode: kata bermakna (≥4 huruf, stopword dibuang) dari setiap tujuan dicari di seluruh teks aktivitas; cakupan = kata ditemukan / kata bermakna. Ambang sinyal: cakupan < 0.5 atau tujuan tanpa kata bermakna (cek manual). Ini **bukan** penilaian keterukuran tujuan.

- `kelas1-matematika-b02-penjumlahan-10` (Kelas 1):
  - cakupan 0 · aktivitas fokus 0 — “Menyelesaikan soal cerita sederhana.”
- `kelas1-matematika-b06-penjumlahan-20` (Kelas 1):
  - cakupan 0 · aktivitas fokus 0 — “Menyelesaikan soal cerita.”
- `kelas1-pai-b03-akhlak` (Kelas 1):
  - cakupan 0 · aktivitas fokus 0 — “Memberi contoh.”
- `kelas1-pai-b05-huruf-harakat` (Kelas 1):
  - cakupan 0.33 · aktivitas fokus 0 — “Membaca huruf berharakat.”
  - cakupan 0 · aktivitas fokus 0 — “Menerapkan adab membaca.”
- `kelas1-pai-b08-adab` (Kelas 1):
  - cakupan 0 · aktivitas fokus 0 — “Memberi contoh.”
- `kelas1-pendidikan-pancasila-b03-hak-kewajiban-rumah` (Kelas 1):
  - cakupan 0 · aktivitas fokus 0 — “Melaksanakan keduanya.”
- `kelas1-pendidikan-pancasila-b05-simbol-warna` (Kelas 1):
  - cakupan 0.33 · aktivitas fokus 0 — “Menunjukkan sikap sesuai sila.”
- `kelas1-pjok-b01-jalan-lari` (Kelas 1):
  - cakupan 0 · aktivitas fokus 0 — “Menjaga keselamatan.”
- `kelas1-pjok-b02-melompat` (Kelas 1):
  - cakupan 0 · aktivitas fokus 0 — “Menjaga keselamatan.”
- `kelas1-pjok-b03-keseimbangan` (Kelas 1):
  - cakupan 0 · aktivitas fokus 0 — “Menjaga keselamatan.”
- `kelas1-pjok-b05-permainan-sederhana` (Kelas 1):
  - cakupan 0 · aktivitas fokus 0 — “Menjaga sportivitas.”
- `kelas1-pjok-b06-senam-ringan` (Kelas 1):
  - cakupan 0 · aktivitas fokus 0 — “Menjaga keselamatan.”
- `kelas1-pjok-b07-kebugaran` (Kelas 1):
  - cakupan 0.33 · aktivitas fokus 0 — “Menjaga pola hidup sehat.”
- `kelas1-seni-rupa-b05-mewarnai-bentuk` (Kelas 1):
  - cakupan 0 · aktivitas fokus 0 — “Menjaga kebersihan karya.”
- `kelas2-bahasa-indonesia-b05-membaca-pemahaman` (Kelas 2):
  - cakupan 0 · aktivitas fokus 0 — “Menyimpulkan isi.”
- `kelas2-matematika-b02-penjumlahan-100` (Kelas 2):
  - cakupan 0 · aktivitas fokus 0 — “Menyelesaikan soal cerita.”
- `kelas2-matematika-b03-perkalian-dasar` (Kelas 2):
  - cakupan 0 · aktivitas fokus 0 — “Menyelesaikan soal sederhana.”
- `kelas2-matematika-b06-bangun-datar` (Kelas 2):
  - cakupan 0.33 · aktivitas fokus 0 — “Menemukan bangun di sekitar.”
- `kelas2-pai-b03-akhlak` (Kelas 2):
  - cakupan 0 · aktivitas fokus 0 — “Memberi contoh.”
- `kelas2-pai-b06-zakat` (Kelas 2):
  - cakupan 0 · aktivitas fokus 0 — “Membedakan keduanya.”
- `kelas2-pai-b08-adab` (Kelas 2):
  - cakupan 0 · aktivitas fokus 0 — “Memberi contoh.”
- `kelas2-pendidikan-pancasila-b01-simbol-pancasila` (Kelas 2):
  - cakupan 0.33 · aktivitas fokus 0 — “Menerapkan sikap sesuai sila.”
- `kelas2-pendidikan-pancasila-b03-hak-kewajiban-siswa` (Kelas 2):
  - tanpa kata bermakna — cek manual: “Menyebutkan hak siswa.”
  - cakupan 0 · aktivitas fokus 0 — “Melaksanakan keduanya.”
- `kelas2-pendidikan-pancasila-b06-nkri` (Kelas 2):
  - cakupan 0 · aktivitas fokus 0 — “Menunjukkan cinta tanah air.”
- `kelas2-pjok-b01-gerak-lokomotor` (Kelas 2):
  - cakupan 0 · aktivitas fokus 0 — “Menjaga keselamatan.”
- `kelas2-pjok-b06-senam` (Kelas 2):
  - cakupan 0 · aktivitas fokus 0 — “Menjaga keselamatan.”
- `kelas3-ipas-b08-ekonomi` (Kelas 3):
  - cakupan 0 · aktivitas fokus 0 — “Menghargai pekerjaan orang lain.”
- `kelas3-matematika-b02-penjumlahan-pengurangan` (Kelas 3):
  - cakupan 0.4 · aktivitas fokus 3 — “Menyelesaikan soal cerita penjumlahan dan pengurangan.”
- `kelas3-matematika-b03-perkalian-pembagian` (Kelas 3):
  - cakupan 0.25 · aktivitas fokus 0 — “Mengingat tabel perkalian 2 sampai 9.”
- `kelas3-pai-b07-sejarah-islam` (Kelas 3):
  - cakupan 0.25 · aktivitas fokus 0 — “Mengambil teladan dari perjuangan Nabi.”
- `kelas3-pendidikan-pancasila-b08-proyek-kewargaan` (Kelas 3):
  - cakupan 0.33 · aktivitas fokus 0 — “Bekerja sama dalam proyek.”
- `kelas3-pjok-b03-gerak-manipulatif` (Kelas 3):
  - cakupan 0.33 · aktivitas fokus 0 — “Bekerja sama saat bermain.”
- `kelas3-pjok-b05-bola-kecil` (Kelas 3):
  - cakupan 0.25 · aktivitas fokus 0 — “Mematuhi aturan dan bekerja sama.”
- `kelas4-bahasa-indonesia-b08-apresiasi-sastra` (Kelas 4):
  - cakupan 0.4 · aktivitas fokus 2 — “Menunjukkan sikap menghargai karya orang lain.”
- `kelas4-ipas-b02-wujud-zat` (Kelas 4):
  - cakupan 0.4 · aktivitas fokus 3 — “Memberikan contoh perubahan wujud dalam kehidupan sehari-hari.”
- `kelas4-ipas-b05-siklus-air` (Kelas 4):
  - cakupan 0 · aktivitas fokus 0 — “Menunjukkan cara menghemat air.”
- `kelas4-ipas-b07-sejarah-kerajaan` (Kelas 4):
  - cakupan 0.25 · aktivitas fokus 0 — “Menunjukkan sikap menghargai sejarah bangsa.”
- `kelas4-pendidikan-pancasila-b04-musyawarah` (Kelas 4):
  - cakupan 0.33 · aktivitas fokus 0 — “Menjelaskan pengertian dan tujuan musyawarah.”
- `kelas4-pendidikan-pancasila-b05-bhinneka` (Kelas 4):
  - cakupan 0.33 · aktivitas fokus 0 — “Menyebutkan contoh keberagaman di Indonesia.”
- `kelas4-pjok-b01-gerak-dasar` (Kelas 4):
  - cakupan 0 · aktivitas fokus 0 — “Menerapkan keselamatan saat bergerak.”
- … +26 paket lain (lihat CSV/JSON).

## R2 — Bahan baca akurasi faktual

Agent tidak menilai kebenaran konsep. Bahan baca lengkap ada di [sampel baca](PEDAGOGICAL_SAMPLE_2026-10-26.md); setiap jawaban eksplorasi, kunci soal, pasangan matching, dan urutan ordering ditampilkan apa adanya untuk ahli mapel.

- Total klaim di seluruh 320 paket: **4454** (1603 jawaban eksplorasi · 678 soal · 1732 pasangan · 441 item urutan); sampel baca memuat sebagian untuk pembacaan ahli.
- Seluruh paket memiliki minimal 3 aktivitas dan 8 item asesmen (standar kedalaman 320/320).

## R3 — Bahasa sesuai usia

Metode: batas kata per kalimat 12 (Kelas 1–2), 16 (Kelas 3–4), 20 (Kelas 5–6); estimasi baca 100 kata/menit.

- `kelas4-pai-b07-sejarah-islam` (Kelas 4, batas 16): 2 kalimat; terpanjang 24 kata — “Nabi Muhammad lahir di Makkah → Menerima wahyu pertama di Gua Hira → Berdakwah di Makkah → Hijrah ke Madinah → Membangun Masjid Nabawi”
- `kelas4-pjok-b06-senam-dasar` (Kelas 4, batas 16): 2 kalimat; terpanjang 24 kata — “Melakukan pemanasan → Jongkok dengan dagu menempel dada → Meletakkan tengkuk di matras → Berguling ke depan → Berdiri tegak dan mengangkat kedua tangan”
- `kelas3-pai-b07-sejarah-islam` (Kelas 3, batas 16): 2 kalimat; terpanjang 23 kata — “Nabi Muhammad lahir di Makkah → Menerima wahyu di Gua Hira → Berdakwah di Makkah → Hijrah ke Madinah → Membangun Masjid Nabawi”
- `kelas3-seni-rupa-b05-seni-cetak` (Kelas 3, batas 16): 2 kalimat; terpanjang 23 kata — “Menyiapkan alat dan bahan → Memotong pelepah hingga rata → Mencelupkan pelepah ke cat → Menekan pelepah pada kertas → Mengangkat pelepah perlahan”
- `kelas5-pai-b07-sejarah-islam` (Kelas 5, batas 20): 2 kalimat; terpanjang 23 kata — “Nabi Muhammad lahir di Makkah → Menerima wahyu di Gua Hira → Berdakwah di Makkah → Hijrah ke Madinah → Membangun Masjid Nabawi”
- `kelas6-pai-b07-sejarah-islam` (Kelas 6, batas 20): 2 kalimat; terpanjang 23 kata — “Nabi Muhammad lahir di Makkah → Menerima wahyu di Gua Hira → Berdakwah di Makkah → Hijrah ke Madinah → Membangun Masjid Nabawi”
- `kelas3-bahasa-indonesia-b07-wawancara` (Kelas 3, batas 16): 2 kalimat; terpanjang 20 kata — “Menentukan narasumber → Menyusun pertanyaan → Meminta izin dan memperkenalkan diri → Bertanya dan mencatat jawaban → Mengucapkan terima kasih”
- `kelas3-pjok-b06-senam-dasar` (Kelas 3, batas 16): 2 kalimat; terpanjang 20 kata — “Melakukan pemanasan → Jongkok dengan dagu menempel dada → Meletakkan tengkuk di matras → Berguling ke depan → Berdiri tegak”
- `kelas4-ipas-b05-siklus-air` (Kelas 4, batas 16): 4 kalimat; terpanjang 20 kata — “Penguapan air laut → Pengembunan uap air → Pembentukan awan → Hujan turun → Air kembali ke laut atau sungai”
- `kelas3-bahasa-indonesia-b03-ide-pokok` (Kelas 3, batas 16): 2 kalimat; terpanjang 19 kata — “Menyimak cerita dengan tenang → Mencatat peristiwa penting → Menentukan ide pokok → Menyusun urutan peristiwa → Menceritakan kembali”
- `kelas4-pendidikan-pancasila-b04-musyawarah` (Kelas 4, batas 16): 2 kalimat; terpanjang 19 kata — “Menyampaikan pendapat → Mendengarkan pendapat orang lain → Mencatat usulan → Menyimpulkan atau memilih keputusan → Melaksanakan keputusan bersama”
- `kelas4-seni-rupa-b02-menggambar-bentuk` (Kelas 4, batas 16): 2 kalimat; terpanjang 19 kata — “Benda tiga dimensi sederhana di atas meja: kubus oranye, bola teal, dan tabung kuning dengan cahaya dari kiri atas”
- `kelas3-bahasa-indonesia-b05-teks-prosedur` (Kelas 3, batas 16): 2 kalimat; terpanjang 18 kata — “Menyiapkan pot dan tanah → Menanam biji → Menyiram biji → Meletakkan di tempat terang → Merawat tanaman”
- `kelas3-matematika-b01-bilangan-10000` (Kelas 3, batas 16): 2 kalimat; terpanjang 18 kata — “Empat kolom balok nilai tempat: tiga balok ribuan, empat balok ratusan, lima batang puluhan, dan dua balok satuan”
- `kelas4-bahasa-indonesia-b05-teks-prosedur` (Kelas 4, batas 16): 2 kalimat; terpanjang 18 kata — “Menyiapkan pot dan tanah → Menanam biji → Menyiram biji → Meletakkan di tempat terang → Merawat tanaman”
- `kelas1-pendidikan-pancasila-b07-tolong-menolong` (Kelas 1, batas 12): 2 kalimat; terpanjang 17 kata — “Melihat teman yang kesulitan → Menanyakan keadaannya → Membantu → Menghibur → Melapor kepada guru bila perlu”
- `kelas4-matematika-b05-bangun-datar` (Kelas 4, batas 16): 2 kalimat; terpanjang 17 kata — “Empat bangun datar di atas kertas berpetak: persegi oranye, persegi panjang teal, segitiga kuning, dan lingkaran merah”
- `kelas1-pendidikan-pancasila-b04-kebersamaan` (Kelas 1, batas 12): 2 kalimat; terpanjang 16 kata — “Datang ke sekolah → Belajar bersama → Bermain bersama → Membantu teman → Pulang dengan rapi”
- `kelas2-bahasa-indonesia-b06-menulis-paragraf` (Kelas 2, batas 12): 2 kalimat; terpanjang 16 kata — “Menentukan ide pokok → Menulis kalimat → Menyusun paragraf → Memberi tanda baca → Memeriksa tulisan”
- `kelas2-pai-b07-kisah-nabi` (Kelas 2, batas 12): 2 kalimat; terpanjang 16 kata — “Nabi lahir di Makkah → Nabi kecil belajar → Menerima wahyu → Berdakwah → Menjadi teladan”
- `kelas1-bahasa-indonesia-b04-menulis-kata` (Kelas 1, batas 12): 2 kalimat; terpanjang 15 kata — “Memegang pensil → Menulis huruf → Menulis suku kata → Menulis kata → Memeriksa tulisan”
- `kelas1-bahasa-indonesia-b06-menulis-kalimat` (Kelas 1, batas 12): 2 kalimat; terpanjang 15 kata — “Menentukan ide → Menulis kata → Menyusun kalimat → Memberi tanda baca → Memeriksa tulisan”
- `kelas1-bahasa-indonesia-b07-bercerita` (Kelas 1, batas 12): 2 kalimat; terpanjang 15 kata — “Memilih cerita → Menceritakan awal → Menceritakan tengah → Menceritakan akhir → Mengucapkan terima kasih”
- `kelas1-pjok-b03-keseimbangan` (Kelas 1, batas 12): 2 kalimat; terpanjang 15 kata — “Pemanasan → Berdiri satu kaki → Merentangkan tangan → Menghitung sampai lima → Mengganti kaki”
- `kelas2-bahasa-indonesia-b02-menulis-kalimat` (Kelas 2, batas 12): 2 kalimat; terpanjang 15 kata — “Menentukan ide → Memilih kata → Menyusun kalimat → Memberi tanda baca → Memeriksa tulisan”
- `kelas2-bahasa-indonesia-b07-bercerita` (Kelas 2, batas 12): 2 kalimat; terpanjang 15 kata — “Memilih cerita → Menceritakan awal → Menceritakan tengah → Menceritakan akhir → Mengucapkan terima kasih”
- `kelas2-pjok-b03-manipulatif` (Kelas 2, batas 12): 2 kalimat; terpanjang 15 kata — “Berdiri siap → Memegang bola → Melempar ke teman → Teman menangkap → Mengembalikan bola”
- `kelas1-bahasa-indonesia-b03-menyimak-cerita` (Kelas 1, batas 12): 2 kalimat; terpanjang 14 kata — “Duduk tenang → Mendengarkan cerita → Menyebutkan tokoh → Menceritakan kembali → Menyimpulkan pesan”
- `kelas1-pendidikan-pancasila-b08-proyek-kelas` (Kelas 1, batas 12): 2 kalimat; terpanjang 14 kata — “Memilih kegiatan → Membagi tugas → Bekerja bersama → Menyelesaikan pekerjaan → Melaporkan hasil”
- `kelas1-seni-rupa-b04-kolase` (Kelas 1, batas 12): 2 kalimat; terpanjang 14 kata — “Menyiapkan bahan → Menyusun pola → Mengoles lem → Menempel bahan → Merapikan karya”
- … +10 paket lain (lihat CSV).

## R4 — Beban kognitif (estimasi)

Metode estimasi: baca 100 kata/menit + 0,75 menit/langkah + 0,5 menit/soal + 0,5 menit/pasangan + 0,5 menit/item ordering + 0,5 menit/aktivitas. Anggaran: 15 menit (Kelas 1–2), 20 (3–4), 25 (5–6). Estimasi ini **belum** diuji coba ke siswa.

- Di atas anggaran: **0** paket.
- Di bawah 5 menit: **0** paket.
- Rentang estimasi seluruh paket: 10.5–14.4 menit.

## R5 — Asesmen ↔ tujuan

Metode: (a) setiap item dipetakan ke tujuan dengan kata bermakna; (b) pasangan matching dibandingkan **persis** dengan langkah eksplorasi (prompt + reveal); (c) bias kunci bila ≥3 soal pilihan. Pencocokan kata dapat menghasilkan positif palsu karena sinonim; duplikasi persis dan bias kunci bersifat deterministik. Flag R5 hanya memakai sinyal deterministik (duplikasi penuh atau bias 100%).

- Item tak terpetakan (kata kunci): **1188** dari 2851 — bahan periksa, bukan vonis.
- Tujuan tanpa item asesmen (kata kunci): **343** tujuan pada 219 paket.
- **Matching identik penuh dengan eksplorasi: 170 paket**; duplikasi sebagian: 14 paket. Ini berarti aktivitas matching mengulang jawaban eksplorasi, bukan asesmen mandiri.
- Bias posisi/panjang kunci: **91** paket (91 semua kunci di posisi sama; 10 kunci selalu opsi terpanjang).

- `kelas1-bahasa-indonesia-b03-menyimak-cerita`: 5/5 pasangan = langkah eksplorasi.
- `kelas1-bahasa-indonesia-b04-menulis-kata`: 5/5 pasangan = langkah eksplorasi.
- `kelas1-bahasa-indonesia-b05-membaca-kalimat`: 5/5 pasangan = langkah eksplorasi.
- `kelas1-bahasa-indonesia-b06-menulis-kalimat`: 5/5 pasangan = langkah eksplorasi.
- `kelas1-bahasa-indonesia-b07-bercerita`: 5/5 pasangan = langkah eksplorasi.
- `kelas1-matematika-b01-bilangan-1-10`: 5/5 pasangan = langkah eksplorasi.
- `kelas1-matematika-b06-penjumlahan-20`: 5/5 pasangan = langkah eksplorasi.
- `kelas1-matematika-b08-pola-bilangan`: 5/5 pasangan = langkah eksplorasi.
- `kelas1-pai-b04-belajar-salat`: 5/5 pasangan = langkah eksplorasi.
- `kelas1-pai-b07-kisah-nabi`: 5/5 pasangan = langkah eksplorasi.
- `kelas1-pai-b08-adab`: 5/5 pasangan = langkah eksplorasi.
- `kelas1-pendidikan-pancasila-b02-aturan-rumah`: 5/5 pasangan = langkah eksplorasi.
- `kelas1-pendidikan-pancasila-b04-kebersamaan`: 5/5 pasangan = langkah eksplorasi.
- `kelas1-pendidikan-pancasila-b06-aturan-sekolah`: 5/5 pasangan = langkah eksplorasi.
- `kelas1-pendidikan-pancasila-b07-tolong-menolong`: 5/5 pasangan = langkah eksplorasi.
- `kelas1-pendidikan-pancasila-b08-proyek-kelas`: 5/5 pasangan = langkah eksplorasi.
- `kelas1-pjok-b02-melompat`: 5/5 pasangan = langkah eksplorasi.
- `kelas1-pjok-b03-keseimbangan`: 5/5 pasangan = langkah eksplorasi.
- `kelas1-pjok-b05-permainan-sederhana`: 5/5 pasangan = langkah eksplorasi.
- `kelas1-pjok-b06-senam-ringan`: 5/5 pasangan = langkah eksplorasi.
- … +150 paket lain (lihat CSV).


- `kelas1-bahasa-indonesia-b02-membaca-kata`: 4 soal pilihan, semua kunci di posisi 1.
- `kelas1-bahasa-indonesia-b05-membaca-kalimat`: 4 soal pilihan, semua kunci di posisi 1.
- `kelas1-matematika-b01-bilangan-1-10`: 4 soal pilihan, semua kunci di posisi 1.
- `kelas1-matematika-b04-pengukuran`: 4 soal pilihan, semua kunci di posisi 1.
- `kelas1-matematika-b06-penjumlahan-20`: 4 soal pilihan, semua kunci di posisi 1.
- `kelas1-matematika-b08-pola-bilangan`: 4 soal pilihan, semua kunci di posisi 1.
- `kelas1-pai-b06-mengenal-malaikat`: 4 soal pilihan, semua kunci di posisi 1.
- `kelas1-pai-b08-adab`: 4 soal pilihan, semua kunci di posisi 1.
- `kelas1-pendidikan-pancasila-b02-aturan-rumah`: 4 soal pilihan, semua kunci di posisi 1.
- `kelas1-pendidikan-pancasila-b06-aturan-sekolah`: 4 soal pilihan, semua kunci di posisi 1.

## R6 — Umpan balik suportif

Metode: kelengkapan `feedbackPolicy` per aktivitas, cakupan `hint` pada langkah eksplorasi, dan pindai kata bernada negatif pada teks. Skema saat ini **belum** menyimpan umpan balik per jawaban; penilaian nada akhir tetap milik reviewer.

- `feedbackPolicy` lengkap: **320/320** paket.
- Hint di semua langkah eksplorasi: **320/320** paket.
- Kata kasar: **0** paket.
- Nada negatif (perlu dibaca dalam konteks): **20** paket.
  - `kelas1-pai-b06-mengenal-malaikat`: “Salah satunya Jibril”
  - `kelas1-pendidikan-pancasila-b06-aturan-sekolah`: “Semua malas”
  - `kelas1-seni-rupa-b07-apresiasi`: “Menjadi malas”
  - `kelas2-bahasa-indonesia-b03-kosakata`: “Malas”
  - `kelas2-pai-b05-puasa`: “Menjadi malas”
  - `kelas2-pendidikan-pancasila-b02-aturan-sekolah`: “Semua malas”
  - `kelas2-seni-rupa-b07-apresiasi`: “Menjadi malas”
  - `kelas3-bahasa-indonesia-b02-kalimat-efektif`: “Jelek”; “Malas”
  - `kelas3-pai-b02-iman`: “Malas belajar”
  - `kelas3-pai-b05-puasa`: “Menjadi malas”
  - `kelas3-seni-rupa-b07-apresiasi-karya`: “Menjadi malas”
  - `kelas4-pjok-b04-bola-besar`: “Mempraktikkan teknik dasar salah satu permainan bola besar”
  - `kelas4-pjok-b05-bola-kecil`: “Mempraktikkan gerak dasar salah satu permainan bola kecil”
  - `kelas5-pai-b05-puasa`: “Menjadi malas”
  - `kelas5-pjok-b01-bola-besar`: “Mempraktikkan teknik dasar salah satu permainan”

## R8 — Data pribadi & konten sensitif

Metode: regex email/URL/telepon/NIK + frasa sensitif (alamat rumah, nomor kontak, tanggal lahir, NISN, foto siswa, media sosial) pada seluruh teks paket. Aset visual tidak di-OCR.

- Tidak ada pola terdeteksi pada teks paket.

## R9 — Hak & lisensi aset

Metode: keberadaan file aset di disk, URL eksternal di JSON paket, jumlah aset per paket. Provenance: seluruh aset dibuat internal via Google Flow; tidak ada lisensi pihak ketiga. Rincian format/hash aktual ada di [ASSET_INVENTORY_2026-10-25.md](ASSET_INVENTORY_2026-10-25.md) (addendum 2026-10-26: 320 WebP, 320 hash unik). CSV inventaris adalah snapshot pra-migrasi.

- File aset hilang: **0**.
- Paket dengan URL eksternal di JSON: **0**.
- Total aset paket: **320** (320 paket).

## R12 — Klaim kurikulum & label PAI

Metode: pindai `src/`, `index.html`, `README.md`, `knowledge/content/CATALOG.md`, `package.json` untuk “Kurikulum Merdeka”, “sesuai kurikulum”, “Kurikulum 2013/K-13”, “capaian pembelajaran”. Label PAI diperiksa terhadap keberadaan frasa “Pendidikan Agama Islam”.

- Tidak ada klaim kurikulum di permukaan yang dipindai.
- **Label PAI eksplisit belum ada** di: `knowledge/content/CATALOG.md`. Sesuai D8, materi pemasaran/katalog harus memakai label eksplisit “Pendidikan Agama Islam”.

## Prioritas baca untuk reviewer manusia

Skor = jumlah kategori flag otomatis (bukan penilaian pedagogis).

| # | packageId | Kelas | Mapel | Skor | Flag |
|---:|---|---:|---|---:|---|
| 1 | `kelas6-pai-b08-adab` | 6 | PAI | 4 | R1 1 tujuan cakupan kata kunci < 0.5; R5 5/5 pasangan matching identik dengan langkah eksplorasi; R5 semua kunci pada posisi yang sama; R5 kunci selalu opsi terpanjang |
| 2 | `kelas6-pendidikan-pancasila-b02-hak-kewajiban` | 6 | Pendidikan Pancasila | 4 | R1 1 tujuan cakupan kata kunci < 0.5; R5 5/5 pasangan matching identik dengan langkah eksplorasi; R5 semua kunci pada posisi yang sama; R5 kunci selalu opsi terpanjang |
| 3 | `kelas1-matematika-b06-penjumlahan-20` | 1 | Matematika | 3 | R1 1 tujuan cakupan kata kunci < 0.5; R5 5/5 pasangan matching identik dengan langkah eksplorasi; R5 semua kunci pada posisi yang sama |
| 4 | `kelas1-pai-b08-adab` | 1 | PAI | 3 | R1 1 tujuan cakupan kata kunci < 0.5; R5 5/5 pasangan matching identik dengan langkah eksplorasi; R5 semua kunci pada posisi yang sama |
| 5 | `kelas1-pjok-b02-melompat` | 1 | PJOK | 3 | R1 1 tujuan cakupan kata kunci < 0.5; R5 5/5 pasangan matching identik dengan langkah eksplorasi; R5 semua kunci pada posisi yang sama |
| 6 | `kelas1-pjok-b03-keseimbangan` | 1 | PJOK | 3 | R1 1 tujuan cakupan kata kunci < 0.5; R3 2 kalimat > 12 kata; R5 5/5 pasangan matching identik dengan langkah eksplorasi |
| 7 | `kelas1-pjok-b05-permainan-sederhana` | 1 | PJOK | 3 | R1 1 tujuan cakupan kata kunci < 0.5; R5 5/5 pasangan matching identik dengan langkah eksplorasi; R5 semua kunci pada posisi yang sama |
| 8 | `kelas1-seni-rupa-b05-mewarnai-bentuk` | 1 | Seni Rupa | 3 | R1 1 tujuan cakupan kata kunci < 0.5; R3 2 kalimat > 12 kata; R5 5/5 pasangan matching identik dengan langkah eksplorasi |
| 9 | `kelas2-bahasa-indonesia-b05-membaca-pemahaman` | 2 | Bahasa Indonesia | 3 | R1 1 tujuan cakupan kata kunci < 0.5; R5 5/5 pasangan matching identik dengan langkah eksplorasi; R5 semua kunci pada posisi yang sama |
| 10 | `kelas2-matematika-b02-penjumlahan-100` | 2 | Matematika | 3 | R1 1 tujuan cakupan kata kunci < 0.5; R5 5/5 pasangan matching identik dengan langkah eksplorasi; R5 semua kunci pada posisi yang sama |
| 11 | `kelas2-pendidikan-pancasila-b06-nkri` | 2 | Pendidikan Pancasila | 3 | R1 1 tujuan cakupan kata kunci < 0.5; R5 5/5 pasangan matching identik dengan langkah eksplorasi; R5 semua kunci pada posisi yang sama |
| 12 | `kelas3-matematika-b01-bilangan-10000` | 3 | Matematika | 3 | R3 2 kalimat > 16 kata; R5 5/5 pasangan matching identik dengan langkah eksplorasi; R5 semua kunci pada posisi yang sama |
| 13 | `kelas3-matematika-b02-penjumlahan-pengurangan` | 3 | Matematika | 3 | R1 1 tujuan cakupan kata kunci < 0.5; R5 5/5 pasangan matching identik dengan langkah eksplorasi; R5 semua kunci pada posisi yang sama |
| 14 | `kelas3-pai-b07-sejarah-islam` | 3 | PAI | 3 | R1 1 tujuan cakupan kata kunci < 0.5; R3 2 kalimat > 16 kata; R5 5/5 pasangan matching identik dengan langkah eksplorasi |
| 15 | `kelas3-pai-b08-adab-kisah-teladan` | 3 | PAI | 3 | R5 5/5 pasangan matching identik dengan langkah eksplorasi; R5 semua kunci pada posisi yang sama; R5 kunci selalu opsi terpanjang |
| 16 | `kelas3-pjok-b05-bola-kecil` | 3 | PJOK | 3 | R1 1 tujuan cakupan kata kunci < 0.5; R5 5/5 pasangan matching identik dengan langkah eksplorasi; R5 semua kunci pada posisi yang sama |
| 17 | `kelas3-seni-rupa-b07-apresiasi-karya` | 3 | Seni Rupa | 3 | R5 5/5 pasangan matching identik dengan langkah eksplorasi; R5 semua kunci pada posisi yang sama; R5 kunci selalu opsi terpanjang |
| 18 | `kelas4-bahasa-indonesia-b08-apresiasi-sastra` | 4 | Bahasa Indonesia | 3 | R1 1 tujuan cakupan kata kunci < 0.5; R5 5/5 pasangan matching identik dengan langkah eksplorasi; R5 semua kunci pada posisi yang sama |
| 19 | `kelas4-ipas-b05-siklus-air` | 4 | IPAS | 3 | R1 1 tujuan cakupan kata kunci < 0.5; R3 4 kalimat > 16 kata; R5 5/5 pasangan matching identik dengan langkah eksplorasi |
| 20 | `kelas4-pai-b08-adab-kisah-teladan` | 4 | PAI | 3 | R5 5/5 pasangan matching identik dengan langkah eksplorasi; R5 semua kunci pada posisi yang sama; R5 kunci selalu opsi terpanjang |
| 21 | `kelas4-pendidikan-pancasila-b04-musyawarah` | 4 | Pendidikan Pancasila | 3 | R1 1 tujuan cakupan kata kunci < 0.5; R3 2 kalimat > 16 kata; R5 5/5 pasangan matching identik dengan langkah eksplorasi |
| 22 | `kelas4-pjok-b06-senam-dasar` | 4 | PJOK | 3 | R1 1 tujuan cakupan kata kunci < 0.5; R3 2 kalimat > 16 kata; R5 5/5 pasangan matching identik dengan langkah eksplorasi |
| 23 | `kelas4-seni-rupa-b02-menggambar-bentuk` | 4 | Seni Rupa | 3 | R3 2 kalimat > 16 kata; R5 5/5 pasangan matching identik dengan langkah eksplorasi; R5 semua kunci pada posisi yang sama |
| 24 | `kelas4-seni-rupa-b07-apresiasi-karya` | 4 | Seni Rupa | 3 | R5 5/5 pasangan matching identik dengan langkah eksplorasi; R5 semua kunci pada posisi yang sama; R5 kunci selalu opsi terpanjang |
| 25 | `kelas5-pai-b07-sejarah-islam` | 5 | PAI | 3 | R1 1 tujuan cakupan kata kunci < 0.5; R3 2 kalimat > 20 kata; R5 5/5 pasangan matching identik dengan langkah eksplorasi |
| 26 | `kelas5-pai-b08-adab` | 5 | PAI | 3 | R5 5/5 pasangan matching identik dengan langkah eksplorasi; R5 semua kunci pada posisi yang sama; R5 kunci selalu opsi terpanjang |
| 27 | `kelas5-pendidikan-pancasila-b03-hak-kewajiban` | 5 | Pendidikan Pancasila | 3 | R5 5/5 pasangan matching identik dengan langkah eksplorasi; R5 semua kunci pada posisi yang sama; R5 kunci selalu opsi terpanjang |
| 28 | `kelas5-pjok-b01-bola-besar` | 5 | PJOK | 3 | R1 1 tujuan cakupan kata kunci < 0.5; R5 5/5 pasangan matching identik dengan langkah eksplorasi; R5 semua kunci pada posisi yang sama |
| 29 | `kelas5-pjok-b05-bola-besar-lanjutan` | 5 | PJOK | 3 | R1 1 tujuan cakupan kata kunci < 0.5; R5 5/5 pasangan matching identik dengan langkah eksplorasi; R5 semua kunci pada posisi yang sama |
| 30 | `kelas5-seni-rupa-b07-apresiasi` | 5 | Seni Rupa | 3 | R5 5/5 pasangan matching identik dengan langkah eksplorasi; R5 semua kunci pada posisi yang sama; R5 kunci selalu opsi terpanjang |

## Sampel baca stratifikasi

Satu paket per sel kelas × mapel (40 paket) didump lengkap di [PEDAGOGICAL_SAMPLE_2026-10-26.md](PEDAGOGICAL_SAMPLE_2026-10-26.md) — tujuan, langkah, kunci, pasangan, urutan, dan kebijakan umpan balik.

## Yang tidak dilakukan agent

- Tidak menulis PASS/FAIL pada R1–R6, R8–R9, R12.
- Tidak mengubah `reviewStatus` (tetap `draft` 320/320).
- Tidak mengisi nama/tanda tangan reviewer.
- Tidak mengklaim materi “sudah direview”.

## Langkah reviewer

1. Baca laporan ini + sampel; tandai temuan yang relevan.
2. Untuk tiap paket, isi `reviewer`, R1–R6/R8–R9/R12, dan `notes` pada [lembar kerja](../release/REVIEW_WORKSHEET_2026-10-25.md).
3. Jika ada FAIL, buat tugas perbaikan; jangan ubah `reviewStatus` sebelum reviewer manusia menandatangani.
4. `reviewStatus: approved` hanya setelah seluruh R1–R12 LULUS dan formulir ditandatangani.

