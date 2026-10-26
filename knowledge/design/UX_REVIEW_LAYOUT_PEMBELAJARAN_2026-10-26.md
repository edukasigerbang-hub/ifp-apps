# Review UX/UI — Layout Pembelajaran (Dokumen Gabungan)

**Tanggal:** 2026-10-26 · **Status:** DRAFT — **bukan approval**, bukan hasil usability test
**Lingkup:** Jelajah Materi, Player Pembelajaran (eksplorasi, matching, kuis), Aktivitas Interaktif, Hasil Belajar, shell & navigasi
**Sumber:** 7 screenshot full-page (pratinjau browser, 1320 px) + kode aktual + review eksternal AI

> Dokumen ini menggabungkan dua review atas screenshot yang sama:
> (1) review eksternal ChatGPT pada tautan share `chatgpt.com/share/6adf2314-74f0-83ec-8c78-a8f5291cba48` (judul “Review Dan Rekomendasi Desain”, skor heuristik 6,5/10), dan
> (2) review UX/UI berbasis kode pada sesi ini.
> Keduanya **bukan** pengganti pengujian dengan guru/siswa. Tidak ada PASS/FAIL, tidak ada keputusan desain yang diambil sepihak.

## 1. Ringkasan eksekutif

Fondasi visual dan aksesibilitas sudah layak dilanjutkan: token warna dan radius konsisten, skip link, focus ring, `role="tablist"` dengan navigasi panah, `role="progressbar"` bernilai, dan target sentuh 44 px. Yang belum siap adalah **kecocokan dengan perangkat sasaran**: aplikasi ini ditujukan untuk IFP 1920×1080/4K touch-first ([01_PROJECT.md:36](../01_PROJECT.md#L36)), tetapi layout berperilaku seperti aplikasi web laptop — kolom konten 896–1024 px, teks 14 px, tombol 44 px, dan status interaktif yang bergantung pada `hover`.

Tiga hal yang paling menahan kualitas pengalaman belajar:

1. **Umpan balik penilaian tidak mendidik.** Setelah “Periksa”, siswa hanya melihat skor total; jawaban benar tidak ditandai dan kunci matching tidak diperlihatkan.
2. **Metadata internal bocor ke layar siswa/guru.** `DRAFT — belum direview`, `Paket bawaan build`, `scaffold`, slug `bahasa-indonesia`, dan ID mentah `activity-001` di Hasil Belajar.
3. **Konten belajar tenggelam oleh chrome.** Di 1080p, soal pertama berada di bawah lipatan karena badge + banner + tujuan + tab memakai ±545 px lebih dulu.

Skor 6,5/10 dari review eksternal adalah **penilaian heuristik visual** (diakui sendiri oleh penulisnya), bukan hasil pengukuran. Review ini tidak memberi skor gabungan karena tidak ada usability test; gunakan daftar temuan dan kriteria penerimaan di §9.

## 2. Metode, bukti, dan batas

| Aspek | Isi |
|---|---|
| Bukti visual | 7 screenshot full-page di `F:\_ifp-apps\.tmp-screenshots\` (+ zip `layout-pembelajaran-2026-10-26.zip`); folder **git-ignored**, tidak masuk repo |
| Layar yang dinilai | Jelajah Kelas 1 (48 materi), Player langkah 1/5, Player feedback matching (33/100), Matching kosong (0/6), Kuis (2 soal), Aktivitas Interaktif, Hasil Belajar |
| Bukti kode | `src/screens/*`, `src/components/content/*`, `src/components/layout/*`, `src/components/ui/*`, `src/index.css` |
| Kontras | Dihitung dari token CSS dengan rumus WCAG 2.x (bukan alat otomatis) |
| Sudut pandang IFP | **INFERRED**: asumsi panel 65" 16:9, jarak 3 m, 1080 px CSS pada 100% scaling |
| Tidak dinilai | Beranda dan Hasil Belajar **berisi data** (butuh jendela desktop/native); perilaku sentuh nyata di panel; tablet/Android; pengujian dengan anak atau guru |

Catatan kondisi: pratinjau browser tidak memiliki database lokal, sehingga Hasil Belajar tampil kosong dan banner “hasil belajar tidak disimpan” muncul dua kali. Ini **artefak pratinjau**, bukan perilaku aplikasi desktop.

## 3. Kekuatan yang harus dipertahankan

- Sistem warna/radius dari satu `@theme` ([src/index.css:3](../../src/index.css#L3)); tidak ada warna liar di komponen.
- Aksesibilitas dasar: skip link ([AppShell.tsx:16](../../src/components/layout/AppShell.tsx#L16)), `:focus-visible` 3 px, tab dengan roving `tabIndex` + `aria-selected` + panah kiri/kanan ([LessonPlayer.tsx:417](../../src/screens/LessonPlayer.tsx#L417)), progressbar bernilai ([ExplorationActivity.tsx:97](../../src/components/content/ExplorationActivity.tsx#L97)), label sr-only pada matching.
- Navigasi sidebar → breadcrumb → judul halaman konsisten di semua layar.
- Struktur kartu materi seragam (eyebrow → judul → ringkasan → meta → CTA) dan pemisahan aktivitas lewat tab, bukan halaman terpisah.
- Palet tidak perlu diganti (lihat §7): usulan review eksternal hampir identik dengan token yang sudah ada.

## 4. Temuan gabungan

Format: **ID · prioritas · layar · temuan → rekomendasi**. Prioritas P1 = sebelum pilot kelas; P2 = kualitas pengalaman; P3 = aksesibilitas/konsistensi.

### P1 — sebelum pilot kelas

**UX-01 · Skala IFP belum ada.** Kolom `max-w-4xl` = 896 px ([LessonPlayer.tsx:210](../../src/screens/LessonPlayer.tsx#L210)), `max-w-5xl` = 1024 px ([CurriculumScreen.tsx:76](../../src/screens/CurriculumScreen.tsx#L76)) → hanya 47%/53% lebar 1920. Body 14 px, opsi kuis 14 px dengan radio 16 px ([QuizActivity.tsx:148](../../src/components/content/QuizActivity.tsx#L148)). → Terapkan skala panel (lihat §6) sebagai mode/token, bukan zoom global.

**UX-02 · Tidak ada umpan balik benar/salah per jawaban.** Opsi kuis setelah dinilai hanya `disabled opacity-80`, tanpa penanda benar/salah maupun kunci ([QuizActivity.tsx:148-196](../../src/components/content/QuizActivity.tsx#L148)); matching menulis “Salah” tetapi tidak menunjukkan pasangan yang benar ([MatchingActivity.tsx:83-89](../../src/components/content/MatchingActivity.tsx#L83)). → Tiga keadaan: dipilih–benar, dipilih–salah, dan kunci jawaban; tambah kalimat koreksi singkat.

**UX-03 · Kartu hasil di luar viewport.** Kartu skor berada di atas tombol, setelah 6 baris matching / 2 fieldset ([MatchingActivity.tsx:95-107](../../src/components/content/MatchingActivity.tsx#L95), [QuizActivity.tsx:204-221](../../src/components/content/QuizActivity.tsx#L204)); siswa melihat tombol berubah “Ulangi” tanpa melihat skor. → Auto-scroll/fokus ke hasil, atau bar hasil sticky.

**UX-04 · Metadata internal di layar belajar.** Badge DRAFT dan “Paket bawaan build” ([LessonPlayer.tsx:379-393](../../src/screens/LessonPlayer.tsx#L379)), “Versi 0.1.0 · scaffold” ([SidebarNavigation.tsx:59](../../src/components/layout/SidebarNavigation.tsx#L59)), “Scaffold Fase C” ([ScreenPlaceholder.tsx:15](../../src/screens/ScreenPlaceholder.tsx#L15)), slug `bahasa-indonesia` ([LessonPlayer.tsx:389-392](../../src/screens/LessonPlayer.tsx#L389)), dan ID mentah di Hasil Belajar ([ResultsScreen.tsx:166-168](../../src/screens/ResultsScreen.tsx#L166)). → Pindahkan metadata QA ke area admin/debug; pakai `subjectLabel()` untuk subjek; Hasil Belajar menampilkan judul lesson/aktivitas, bukan ID.

**UX-05 · Copy hasil penilaian salah konteks & hardcoded.** Pesan lulus menyebut “pecahan sederhana” pada pelajaran huruf ([QuizActivity.tsx:216](../../src/components/content/QuizActivity.tsx#L216)); “mengamati keempat gambar” padahal langkah bisa 5 ([ExplorationActivity.tsx:67](../../src/components/content/ExplorationActivity.tsx#L67)). → Copy netral per tipe aktivitas, atau ambil dari paket konten.

### P2 — kualitas pengalaman

**UX-06 · Aktivitas tenggelam oleh chrome.** Badge + H1 + ringkasan + banner + tujuan + tab memakai ±545 px; soal pertama di bawah lipatan 1080p ([LessonPlayer.tsx:379-474](../../src/screens/LessonPlayer.tsx#L379)). → Tujuan jadi `<details>` ringkas; status penyimpanan jadi indikator kecil di header; pertimbangkan header ringkas saat menggulir.

**UX-07 · Pesan penyimpanan ganda & berbahasa developer.** Banner “Penyimpanan lokal siap.” ([LessonPlayer.tsx:398-403](../../src/screens/LessonPlayer.tsx#L398)) lalu diulang di footer ([LessonPlayer.tsx:510-514](../../src/screens/LessonPlayer.tsx#L510)). Di browser pesan pratinjau juga muncul dua kali. → Satu indikator, bahasa pengguna, detail teknis hanya di Pengaturan/Diagnostik.

**UX-08 · CTA bersaing.** “Tampilkan penjelasan” biru penuh ([ExplorationActivity.tsx:136-151](../../src/components/content/ExplorationActivity.tsx#L136)) dan “Lanjut” biru penuh ([ExplorationActivity.tsx:163-169](../../src/components/content/ExplorationActivity.tsx#L163)). → Satu primary per layar; reveal jadi secondary.

**UX-09 · Disabled tanpa alasan.** “Periksa pasangan” 40% opacity (kontras 1,65:1) dan masih tampak aktif ([MatchingActivity.tsx:109-118](../../src/components/content/MatchingActivity.tsx#L109)). → Sertakan hint “Lengkapi 6 pasangan dulu”, atau aktifkan tombol dan beri pesan validasi.

**UX-10 · Jelajah memindai lambat.** 48 kartu identik tanpa thumbnail (padahal aset WebP tersedia), 48 tombol biru identik, tanpa kode warna mapel, tanpa status selesai/belum ([CurriculumScreen.tsx:149-175](../../src/screens/CurriculumScreen.tsx#L149)); filter tanpa reset/chip aktif ([CurriculumScreen.tsx:88-141](../../src/screens/CurriculumScreen.tsx#L88)). → Kartu berilustrasi + warna mapel + status progres; klik seluruh kartu; chip filter + reset; kelompokkan per mapel.

**UX-11 · Breadcrumb mati & tanpa jalan pulang.** “Beranda” bukan tautan ([TopBar.tsx:18](../../src/components/layout/TopBar.tsx#L18)); dari Player tidak ada kembali ke Jelajah atau materi berikutnya. → Jadikan breadcrumb interaktif; tambah “Materi berikutnya” setelah aktivitas selesai.

**UX-12 · Profil tidak terlihat saat belajar.** Player tidak menampilkan profil aktif, padahal perangkat dipakai bergantian ([LessonPlayer.tsx:289](../../src/screens/LessonPlayer.tsx#L289)); Hasil Belajar justru menampilkannya. → Indikator profil di header (nama + tombol ganti) sebelum menyimpan attempt.

**UX-13 · Navigasi mencampur peran & tanpa ikon.** Sembilan item belajar + kelola setara ([SidebarNavigation.tsx:26-57](../../src/components/layout/SidebarNavigation.tsx#L26)); brand “GERBANG EDUKASI” diulang dua baris ([SidebarNavigation.tsx:17-24](../../src/components/layout/SidebarNavigation.tsx#L17)); navigasi seluler = 9 item scroll horizontal tanpa ikon ([MobileNavigation.tsx:14-31](../../src/components/layout/MobileNavigation.tsx#L14)). → Pemisahan mode Siswa/Guru (lihat §5); ikon + label; di seluler prioritaskan 4–5 item utama.

**UX-14 · Progres tidak konsisten.** Eksplorasi punya progress bar; kuis/matching hanya teks “Terjawab 0 dari 2” ([QuizActivity.tsx:115-117](../../src/components/content/QuizActivity.tsx#L115), [MatchingActivity.tsx:45-48](../../src/components/content/MatchingActivity.tsx#L45)). → Satu komponen progres untuk semua tipe aktivitas.

**UX-15 · Umpan balik tekan tidak ada.** Semua CTA memakai `hover:opacity-90` tanpa `active:`/skala; di layar sentuh tidak ada respons saat disentuh (contoh [CurriculumScreen.tsx:166-172](../../src/screens/CurriculumScreen.tsx#L166)). → Tambah status `active`/pressed dan target 56–64 px.

### P3 — aksesibilitas & konsistensi

| ID | Temuan | Bukti | Angka |
|---|---|---|---|
| UX-16 | “Benar” teal 14 px gagal AA | [MatchingActivity.tsx:83-89](../../src/components/content/MatchingActivity.tsx#L83) | **2,81–2,95:1** (butuh 4,5) |
| UX-17 | “Salah” merah di tint gagal AA | [MatchingActivity.tsx:83-89](../../src/components/content/MatchingActivity.tsx#L83) | **4,23:1** |
| UX-18 | Label grup sidebar 11 px & footer 12 px gagal AA | [SidebarNavigation.tsx:29](../../src/components/layout/SidebarNavigation.tsx#L29), [:59](../../src/components/layout/SidebarNavigation.tsx#L59) | **4,06:1** |
| UX-19 | Prompt kuis bukan bagian `<legend>` | [QuizActivity.tsx:121-123](../../src/components/content/QuizActivity.tsx#L121) | Pembaca layar mengumumkan grup “Soal 1”, bukan pertanyaan |
| UX-20 | Istilah campur & tanda baca | “Nilai lulus” vs “Skor” ([QuizActivity.tsx:116](../../src/components/content/QuizActivity.tsx#L116)); “Terjawab 6 dari 6.”; “Apa pasangan dari …” | Konsistensi bahasa |

Kontras yang **lolos**: muted `#5f7085` di paper 4,76:1; putih di primary 5,38:1; putih di navy 11,25:1; ink di paper 14,29:1.

## 5. Rekomendasi strategis — satu design system, dua mode

Direkomendasikan oleh review eksternal dan konsisten dengan kebutuhan produk (mode dipandu guru vs mandiri siswa): **jangan** membuat dua aplikasi, tetapi dua pengalaman di atas komponen yang sama.

| Aspek | Mode Pengelola (Guru/Admin) | Mode Siswa |
|---|---|---|
| Navigasi | Sidebar navy lengkap (konten, lisensi, pengaturan) | 4–5 tujuan utama; pengaturan disembunyikan |
| Kepadatan | Tabel/daftar, filter, status konten | Kartu besar, satu fokus per layar |
| Tipografi | 14–16 px (meja kerja) | 20–24 px instruksi, 32–40 px judul |
| Target sentuh | 44 px | 56–64 px |
| Metadata | Versi, DRAFT, sumber paket, ID | Disembunyikan; hanya progres & pencapaian |
| Warna | Sama | Sama + aksen mapel |

Konsekuensi: label internal (UX-04) tidak perlu dihapus dari produk — cukup dipindahkan ke Mode Pengelola/area debug.

## 6. Skala IFP — angka yang perlu diputuskan

Asumsi **INFERRED**: panel 65" 16:9, 1080 px CSS, jarak pandang 3 m → 1 px ≈ 0,75 mm.

| Ukuran sekarang | Tinggi fisik | Sudut pandang | Status |
|---|---|---|---|
| 14 px (body/opsi) | ±10,5 mm | ±0,20° | Terlalu kecil |
| 18 px | ±13,5 mm | ±0,26° | Masih marginal |
| 20 px | ±15,0 mm | ±0,29° | Batas bawah |
| 22 px | ±16,5 mm | ±0,31° | Aman |
| 24 px | ±18,0 mm | ±0,34° | Nyaman |

Usulan baseline Mode Siswa (untuk diuji, bukan aturan final):

- Instruksi/opsi jawaban **20–24 px**; judul aktivitas **32–40 px**; judul halaman **40–48 px**.
- Tombol **56–64 px** tinggi; jarak antar opsi ≥12 px.
- Kolom konten **1440–1600 px** di 1920, atau grid 3 kolom untuk Jelajah di ≥1600 px.
- Panduan gambar aktivitas: minimal 60% tinggi area konten pada 1080p.

Review eksternal mengusulkan 16–18 px instruksi dan tombol 48–56 px. Itu cukup untuk laptop, **belum** untuk panel kelas; angka di atas adalah koreksinya dan tetap perlu diverifikasi di perangkat.

## 7. Token — bandingkan, jangan ganti

| Token | Sekarang | Usulan review eksternal | Kontras usulan | Rekomendasi |
|---|---|---|---|---|
| Navy | `#173b69` | `#173B67` | 11,30:1 | **Pertahankan** (praktis identik) |
| Primary | `#2764d8` | `#2563EB` | 5,17:1 | **Pertahankan** (5,38:1, sedikit lebih baik) |
| Teal | `#13a89e` | `#19A99A` | 2,92:1 | **Jangan untuk teks**; pakai `#0b6f69` (sudah dipakai badge) |
| Paper | `#f5f8fc` | `#F4F8FD` | — | **Pertahankan** |
| Radius kartu | 20 px | 12–16 px | — | **Pertahankan**; tidak ada masalah yang diperbaiki |
| Font | Segoe UI/system | Inter | — | **Belum perlu** ganti; Inter menambah unduhan, dan target Windows sudah punya Segoe UI |

Kesimpulan: masalah desain bukan palet, melainkan **skala, hierarki, dan state interaksi**. Mengganti palet hanya menambah churn tanpa memperbaiki UX-01/02/03.

## 8. Rekonsiliasi dengan review eksternal

| Poin review eksternal | Status di dokumen ini | Catatan |
|---|---|---|
| 6,5/10 heuristik | Dicatat, tidak digabung | Bukan hasil pengukuran |
| Dua mode (pengelola/siswa) | **Setuju** | Menjadi §5 |
| Teks & tombol diperbesar | **Setuju, dengan koreksi** | 16–18 px/48–56 px kurang untuk IFP; lihat §6 |
| Matching dropdown → kartu tap/drag | **Setuju** | Data `pairs` sudah ada; tidak perlu ubah skema |
| Umpan balik benar/salah | **Setuju** | Dipertajam: kunci jawaban wajib tampil (UX-02) |
| Hasil Belajar 3 state | **Setuju** | Tambahan: state “belum ada hasil” harus punya CTA, dan data harus diverifikasi di desktop |
| Aktivitas Interaktif terlalu kosong | **Setuju** | Item nav sebaiknya disembunyikan sampai siap (UX-04/13) |
| Ganti palet/token | **Ditolak (sebagian)** | Palet hampir sama; teal usulan tetap gagal kontras |
| Tidak menangkap defect kode | **Tambahan** | UX-02/04/05/11/12/16–18 tidak terlihat dari screenshot |
| Inter untuk tipografi | **Ditunda** | Perlu keputusan desain; bukan blocker |

## 9. Roadmap gabungan + kriteria penerimaan

### P0 — perbaikan kecil, dampak langsung (tanpa redesign)

1. Copy: hapus “pecahan sederhana” & “keempat gambar” hardcoded; samakan istilah “skor/nilai”.
2. Label: subjek memakai `subjectLabel()`; Hasil Belajar memakai judul lesson/aktivitas.
3. Sembunyikan metadata internal dari Mode Siswa (DRAFT, versi, scaffold, “Paket bawaan build”).
4. Kontras: `text-teal` → `#0b6f69`; teks danger di tint dipergelap; label sidebar ≥4,5:1.
5. Breadcrumb “Beranda” jadi tombol; hint pada tombol disabled.
6. Satu pesan penyimpanan (bukan dua).

**Kriteria penerimaan P0:** tidak ada ID mentah/jargon di layar siswa; semua teks status ≥4,5:1; tombol disabled punya alasan; screenshot ulang sebagai bukti.

### P1 — Player siswa (dampak terbesar)

1. Token skala IFP + kolom konten lebih lebar.
2. Tujuan pembelajaran jadi ringkas; status penyimpanan jadi indikator header.
3. Feedback 3 keadaan + kunci jawaban; hasil auto-scroll/fokus.
4. Satu komponen progres lintas aktivitas; tab dengan status selesai.
5. Target sentuh 56–64 px + status pressed.

**Kriteria penerimaan P1:** soal pertama terlihat tanpa menggulir pada 1080p; skor terlihat tanpa menggulir; setiap jawaban punya status benar/salah + kunci; tidak ada elemen <56 px di Mode Siswa; screenshot sebelum/sesudah.

### P2 — Interaktivitas

1. Matching menjadi kartu tap-to-match (fallback drag), tanpa mengubah kontrak `pairs`.
2. Kuis lebih visual: satu soal per layar atau kelompok kecil, kartu jawaban besar.
3. Reward/audio hanya jika ada tujuan pembelajarannya (bukan dekorasi).

### P3 — Katalog & responsivitas

1. Kartu materi berilustrasi + warna mapel + status progres + “Lanjutkan belajar”.
2. Chip filter + reset; pengelompokan per mapel.
3. Tablet/Android & layout 1280; state loading/error yang konsisten.
4. Pemisahan navigasi per peran.

## 10. Keputusan terbuka (bukan milik agent)

| ID | Keputusan | Pemilik | Dampak bila ditunda |
|---|---|---|---|
| D-UX-1 | Menerapkan dua mode (Siswa/Pengelola) | PO + desain | P0/P3 tidak bisa dieksekusi konsisten |
| D-UX-2 | Baseline skala IFP (16–18 px vs 20–24 px) | Desain + QA perangkat | Risiko redesign dua kali |
| D-UX-3 | Inter vs Segoe UI | Desain | Churn font tanpa manfaat jelas |
| D-UX-4 | Perlakuan metadata DRAFT/versi | PO + Curriculum Lead | Guru melihat status draft secara menyesatkan |
| D-UX-5 | Bentuk matching (kartu vs select) | Desain + QA sentuh | UX-02/P2 tertahan |

## 11. Traceability & batas klaim

- Semua tautan kode di dokumen ini menunjuk baris yang dibaca langsung pada 2026-10-26; tidak ada nomor baris yang dikarang.
- Angka kontras dihitung dari token di `src/index.css`; angka sudut pandang adalah **estimasi** dengan asumsi yang dinyatakan.
- Screenshot berada di folder sementara (git-ignored); dokumen ini tidak mengklaim screenshot sebagai artefak rilis.
- Tidak ada pengujian dengan siswa/guru, tidak ada pengukuran waktu tugas, tidak ada klaim peningkatan hasil belajar.
- Dokumen ini **tidak** menyetujui konten; `reviewStatus` paket tetap `draft`.

## 12. Langkah berikutnya

1. Putuskan D-UX-1 dan D-UX-2.
2. Eksekusi P0 (perubahan kecil, dapat diverifikasi dengan screenshot + a11y).
3. Verifikasi Hasil Belajar **di desktop dengan data nyata** sebelum mendesain ulang layar tersebut.
4. Susun prototipe alur kelas 1: Jelajah → Player → Aktivitas → Kuis → Hasil, memakai baseline skala IFP.
