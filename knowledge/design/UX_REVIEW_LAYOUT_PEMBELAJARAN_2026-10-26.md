# Review UX/UI — Layout Pembelajaran (Dokumen Gabungan)

**Tanggal:** 2026-10-26 · **Status:** DRAFT — **bukan approval**, bukan hasil usability test
**Lingkup:** Jelajah Materi, Player Pembelajaran (eksplorasi, matching, kuis), Aktivitas Interaktif, Hasil Belajar, shell & navigasi
**Sumber:** 7 screenshot full-page (pratinjau browser, 1320 px) + kode aktual + review eksternal AI

> Dokumen ini menggabungkan dua review atas screenshot yang sama:
> (1) review eksternal ChatGPT pada tautan share `chatgpt.com/share/6adf2314-74f0-83ec-8c78-a8f5291cba48` (judul “Review Dan Rekomendasi Desain”, skor heuristik 6,5/10; dokumen `.md`-nya diunduh 2026-10-26 — `review-layout-pembelajaran-gerbang-edukasi.md`, 337 baris / 14.998 byte UTF-8, dibaca penuh), dan
> (2) review UX/UI berbasis kode pada sesi ini.
> Isi unik dari berkas eksternal (skor per area, 8 prinsip UX, daftar state interaksi, aturan ilustrasi, checklist penerimaan) sudah digabung ke §5.1, §7.1, §8.1, §9.1–§9.2. Berkas aslinya disimpan sementara di `.tmp-external/` (git-ignored, tidak di-commit karena karya pihak ketiga); substansinya masuk ke dokumen kanonik ini dengan atribusi.
> Keduanya **bukan** pengganti pengujian dengan guru/siswa. Tidak ada PASS/FAIL, tidak ada keputusan desain yang diambil sepihak.

## 1. Ringkasan eksekutif

Fondasi visual dan aksesibilitas sudah layak dilanjutkan: token warna dan radius konsisten, skip link, focus ring, `role="tablist"` dengan navigasi panah, `role="progressbar"` bernilai, dan target sentuh 44 px. Yang belum siap adalah **kecocokan dengan perangkat sasaran**: aplikasi ini ditujukan untuk IFP 1920×1080/4K touch-first ([01_PROJECT.md:36](../01_PROJECT.md#L36)), tetapi layout berperilaku seperti aplikasi web laptop — kolom konten 896–1024 px, teks 14 px, tombol 44 px, dan status interaktif yang bergantung pada `hover`.

Tiga hal yang paling menahan kualitas pengalaman belajar:

1. **Umpan balik penilaian tidak mendidik.** Setelah “Periksa”, siswa hanya melihat skor total; jawaban benar tidak ditandai dan kunci matching tidak diperlihatkan.
2. **Metadata internal bocor ke layar siswa/guru.** `DRAFT — belum direview`, `Paket bawaan build`, `scaffold`, slug `bahasa-indonesia`, dan ID mentah `activity-001` di Hasil Belajar.
3. **Konten belajar tenggelam oleh chrome.** Di 1080p, soal pertama berada di bawah lipatan karena badge + banner + tujuan + tab memakai ±545 px lebih dulu.

Skor 6,5/10 dari review eksternal adalah **penilaian heuristik visual** (diakui sendiri oleh penulisnya), bukan hasil pengukuran. Review ini tidak memberi skor gabungan karena tidak ada usability test; gunakan daftar temuan dan checklist di §9.2.

## 2. Metode, bukti, dan batas

| Aspek | Isi |
|---|---|
| Bukti visual | 7 screenshot full-page di `F:\_ifp-apps\.tmp-screenshots\` (+ zip `layout-pembelajaran-2026-10-26.zip`); folder **git-ignored**, tidak masuk repo |
| Layar yang dinilai | Jelajah Kelas 1 (48 materi), Player langkah 1/5, Player feedback matching (33/100), Matching kosong (0/6), Kuis (2 soal), Aktivitas Interaktif, Hasil Belajar |
| Bukti kode | `src/screens/*`, `src/components/content/*`, `src/components/layout/*`, `src/components/ui/*`, `src/index.css` |
| Kontras | Dihitung dari token CSS dengan rumus WCAG 2.x (bukan alat otomatis) |
| Sudut pandang IFP | **INFERRED**: asumsi panel 65" 16:9, jarak 3 m, 1080 px CSS pada 100% scaling |
| Objek review eksternal | Arsip `layout-pembelajaran-2026-10-26.zip` (7 screenshot yang sama), tanpa akses kode |
| Tidak dinilai | Beranda dan Hasil Belajar **berisi data** (butuh jendela desktop/native); perilaku sentuh nyata di panel; tablet/Android; pengujian dengan anak atau guru |
| Tidak dinilai (review eksternal) | Performa, keamanan/privasi, kebenaran pedagogis, ketahanan penyimpanan/sinkronisasi, dan aksesibilitas menurut standar — dinyatakan sendiri oleh penulisnya |
| Audit aksesibilitas | Dokumen ini hanya menghitung rasio kontras token; skenario `npm run a11y` (`scripts/e2e/scenarios/a11y.mjs`, audit kustom) **belum** dijalankan saat review disusun — baru dijalankan 2026-10-26 setelah perbaikan P0/UX-03 (PASS 16 pemeriksaan, 0 error, 7 warning); tetap bukan audit WCAG penuh |

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

**UX-01 · Skala IFP belum ada.** Kolom `max-w-4xl` = 896 px ([LessonPlayer.tsx:210](../../src/screens/LessonPlayer.tsx#L210)), `max-w-5xl` = 1024 px ([CurriculumScreen.tsx:76](../../src/screens/CurriculumScreen.tsx#L76)) → hanya 47%/53% lebar 1920. Body 14 px, opsi kuis 14 px dengan radio 16 px ([QuizActivity.tsx:155](../../src/components/content/QuizActivity.tsx#L155)). → Terapkan skala panel (lihat §6) sebagai mode/token, bukan zoom global.

**UX-02 · Tidak ada umpan balik benar/salah per jawaban.** Opsi kuis setelah dinilai hanya `disabled opacity-80`, tanpa penanda benar/salah maupun kunci ([QuizActivity.tsx:148-196](../../src/components/content/QuizActivity.tsx#L148)); matching menulis “Salah” tetapi tidak menunjukkan pasangan yang benar ([MatchingActivity.tsx:90-96](../../src/components/content/MatchingActivity.tsx#L90)). → Tiga keadaan: dipilih–benar, dipilih–salah, dan kunci jawaban; tambah kalimat koreksi singkat.

**UX-03 · Kartu hasil di luar viewport.** Kartu skor berada di atas tombol, setelah 6 baris matching / 2 fieldset ([MatchingActivity.tsx:102-114](../../src/components/content/MatchingActivity.tsx#L102), [QuizActivity.tsx:212-229](../../src/components/content/QuizActivity.tsx#L212)); siswa melihat tombol berubah “Ulangi” tanpa melihat skor. → Auto-scroll/fokus ke hasil, atau bar hasil sticky. **Selesai 2026-10-26 (bagian otomatis):** kartu hasil `tabIndex={-1}` + `scrollIntoView`/`focus()` di kuis, mencocokkan, dan mengurutkan; label tiga keadaan per jawaban tetap UX-02/D-UX-5.

**UX-04 · Metadata internal di layar belajar.** Badge DRAFT dan “Paket bawaan build” ([LessonPlayer.tsx:379-393](../../src/screens/LessonPlayer.tsx#L379)), “Versi 0.1.0 · scaffold” ([SidebarNavigation.tsx:59](../../src/components/layout/SidebarNavigation.tsx#L59)), “Scaffold Fase C” ([ScreenPlaceholder.tsx:15](../../src/screens/ScreenPlaceholder.tsx#L15)), slug `bahasa-indonesia` ([LessonPlayer.tsx:389-392](../../src/screens/LessonPlayer.tsx#L389)), dan ID mentah di Hasil Belajar ([ResultsScreen.tsx:166-168](../../src/screens/ResultsScreen.tsx#L166)). → Pindahkan metadata QA ke area admin/debug; pakai `subjectLabel()` untuk subjek; Hasil Belajar menampilkan judul lesson/aktivitas, bukan ID.

**UX-05 · Copy hasil penilaian salah konteks & hardcoded.** Pesan lulus menyebut “pecahan sederhana” pada pelajaran huruf ([QuizActivity.tsx:223](../../src/components/content/QuizActivity.tsx#L223)); “mengamati keempat gambar” padahal langkah bisa 5 ([ExplorationActivity.tsx:67](../../src/components/content/ExplorationActivity.tsx#L67)). → Copy netral per tipe aktivitas, atau ambil dari paket konten.

### P2 — kualitas pengalaman

**UX-06 · Aktivitas tenggelam oleh chrome.** Badge + H1 + ringkasan + banner + tujuan + tab memakai ±545 px; soal pertama di bawah lipatan 1080p ([LessonPlayer.tsx:379-474](../../src/screens/LessonPlayer.tsx#L379)). → Tujuan jadi `<details>` ringkas; status penyimpanan jadi indikator kecil di header; pertimbangkan header ringkas saat menggulir.

**UX-07 · Pesan penyimpanan ganda & berbahasa developer.** Banner “Penyimpanan lokal siap.” ([LessonPlayer.tsx:398-403](../../src/screens/LessonPlayer.tsx#L398)) lalu diulang di footer ([LessonPlayer.tsx:510-514](../../src/screens/LessonPlayer.tsx#L510)). Di browser pesan pratinjau juga muncul dua kali. → Satu indikator, bahasa pengguna, detail teknis hanya di Pengaturan/Diagnostik.

**UX-08 · CTA bersaing.** “Tampilkan penjelasan” biru penuh ([ExplorationActivity.tsx:137-152](../../src/components/content/ExplorationActivity.tsx#L137)) dan “Lanjut” biru penuh ([ExplorationActivity.tsx:164-170](../../src/components/content/ExplorationActivity.tsx#L164)). → Satu primary per layar; reveal jadi secondary.

**UX-09 · Disabled tanpa alasan.** “Periksa pasangan” 40% opacity (kontras 1,65:1) dan masih tampak aktif ([MatchingActivity.tsx:116-125](../../src/components/content/MatchingActivity.tsx#L116)). → Sertakan hint “Lengkapi 6 pasangan dulu”, atau aktifkan tombol dan beri pesan validasi.

**UX-10 · Jelajah memindai lambat.** 48 kartu identik tanpa thumbnail (padahal aset WebP tersedia), 48 tombol biru identik, tanpa kode warna mapel, tanpa status selesai/belum ([CurriculumScreen.tsx:149-175](../../src/screens/CurriculumScreen.tsx#L149)); filter tanpa reset/chip aktif ([CurriculumScreen.tsx:88-141](../../src/screens/CurriculumScreen.tsx#L88)). → Kartu berilustrasi + warna mapel + status progres; klik seluruh kartu; chip filter + reset; kelompokkan per mapel.

**UX-11 · Breadcrumb mati & jalan pulang tidak konsisten.** “Beranda” bukan tautan ([TopBar.tsx:18](../../src/components/layout/TopBar.tsx#L18)); dari Player tidak ada kembali ke Jelajah atau materi berikutnya; navigasi langkah hanya ada di eksplorasi (`Sebelumnya`/`Lanjut` 44 px, [ExplorationActivity.tsx:155-169](../../src/components/content/ExplorationActivity.tsx#L155)), sedangkan matching/kuis hanya punya “Periksa” tanpa “Sebelumnya”. → Jadikan breadcrumb interaktif; samakan pola navigasi langkah di semua tipe aktivitas; tambah “Materi berikutnya”.

**UX-12 · Profil tidak terlihat saat belajar.** Player tidak menampilkan profil aktif, padahal perangkat dipakai bergantian ([LessonPlayer.tsx:289](../../src/screens/LessonPlayer.tsx#L289)); Hasil Belajar justru menampilkannya. → Indikator profil di header (nama + tombol ganti) sebelum menyimpan attempt.

**UX-13 · Navigasi mencampur peran & tanpa ikon.** Sembilan item belajar + kelola setara ([SidebarNavigation.tsx:26-57](../../src/components/layout/SidebarNavigation.tsx#L26)); brand “GERBANG EDUKASI” diulang dua baris ([SidebarNavigation.tsx:17-24](../../src/components/layout/SidebarNavigation.tsx#L17)); navigasi seluler = 9 item scroll horizontal tanpa ikon ([MobileNavigation.tsx:14-31](../../src/components/layout/MobileNavigation.tsx#L14)). → Pemisahan mode Siswa/Guru (lihat §5); ikon + label; di seluler prioritaskan 4–5 item utama.

**UX-14 · Progres tidak konsisten.** Eksplorasi punya progress bar; kuis/matching hanya teks “Terjawab 0 dari 2” ([QuizActivity.tsx:122-124](../../src/components/content/QuizActivity.tsx#L122), [MatchingActivity.tsx:52-55](../../src/components/content/MatchingActivity.tsx#L52)). → Satu komponen progres untuk semua tipe aktivitas.

**UX-15 · Umpan balik tekan tidak ada.** Semua CTA memakai `hover:opacity-90` tanpa `active:`/skala; di layar sentuh tidak ada respons saat disentuh (contoh [CurriculumScreen.tsx:166-172](../../src/screens/CurriculumScreen.tsx#L166)). → Tambah status `active`/pressed dan target 56–64 px.

### P3 — aksesibilitas & konsistensi

| ID | Temuan | Bukti | Angka |
|---|---|---|---|
| UX-16 | “Benar” teal 14 px gagal AA | [MatchingActivity.tsx:90-96](../../src/components/content/MatchingActivity.tsx#L90) | **2,81–2,95:1** (butuh 4,5) |
| UX-17 | “Salah” merah di tint gagal AA | [MatchingActivity.tsx:90-96](../../src/components/content/MatchingActivity.tsx#L90) | **4,23:1** |
| UX-18 | Label grup sidebar 11 px & footer 12 px gagal AA | [SidebarNavigation.tsx:29](../../src/components/layout/SidebarNavigation.tsx#L29), [:59](../../src/components/layout/SidebarNavigation.tsx#L59) | **4,06:1** |
| UX-19 | Prompt kuis bukan bagian `<legend>` | [QuizActivity.tsx:128-130](../../src/components/content/QuizActivity.tsx#L128) | Pembaca layar mengumumkan grup “Soal 1”, bukan pertanyaan |
| UX-20 | Istilah campur & tanda baca | “Nilai lulus” vs “Skor” ([QuizActivity.tsx:123](../../src/components/content/QuizActivity.tsx#L123)); “Terjawab 6 dari 6.”; “Apa pasangan dari …” | Konsistensi bahasa |

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

**Status implementasi (2026-10-26, T-077/T-078):** D-UX-1 diputuskan PO lewat instruksi sesi. Mode belajar diterapkan dengan **rail ikon 80 px** (empat tujuan: Beranda, Jelajah Materi, Aktivitas Interaktif, Hasil Belajar; label lewat tooltip dan teks sr-only), bukan sidebar admin; konten mengisi sisa lebar perangkat. Layar Konten/Lisensi/Pengaturan disembunyikan; mode admin mempertahankan sidebar lengkap. Sakelar Belajar/Admin berupa dua tombol ikon di bilah atas dan tersimpan per perangkat (`preferences.appMode`, default `admin`). Skala tipografi/target sentuh mode siswa (§6, D-UX-2) belum diterapkan, dan metadata internal (UX-04) belum dipindahkan ke area pengelola.

| Aspek | Implementasi (bukti kode) |
|---|---|
| Model mode | `AppMode`, `navigationItemsForMode()`, `isScreenAllowedInMode()` di [navigation.ts](../../src/navigation.ts) |
| Shell | [AppShell.tsx](../../src/components/layout/AppShell.tsx): sidebar mode admin; rail ikon mode belajar [StudentRail.tsx](../../src/components/layout/StudentRail.tsx) |
| Sakelar | [TopBar.tsx](../../src/components/layout/TopBar.tsx): grup “Mode aplikasi” berisi dua tombol ikon (44 px) dengan `aria-pressed`, `aria-label`, dan `title` |
| Filter kelas | [CurriculumScreen.tsx](../../src/screens/CurriculumScreen.tsx): panel collapsible berisi tile thumbnail cover materi tiap kelas (bukan dropdown); header menampilkan chip “Semua kelas”/“Kelas N” dan menutup otomatis setelah memilih; grid kartu 3 kolom di md+ |
| Thumbnail materi | `coverAsset` di katalog; [LessonThumbnail.tsx](../../src/components/content/LessonThumbnail.tsx) dipakai kartu Jelajah Materi dan “Lanjutkan belajar” (bundled + paket impor) |
| Persistensi | `preferences.appMode` di `app_meta` (default `admin`; rekaman lama tanpa field tetap terbaca) |
| Pengalihan | Layar di luar mode dipindahkan ke Beranda, hash diselaraskan ([App.tsx](../../src/App.tsx)) |

Verifikasi 2026-10-26: `npm test` 93/93, `cargo test` 65/65, `npm run build` PASS, a11y 17 pemeriksaan PASS (0 error, 7 warning reflow), E2E `mode-switch` 6/6 PASS (rail 80 px + restore setelah muat ulang), `home-catalog` 13/13 (tile kelas, panel collapsible “Kelas 3”, thumbnail), serta regresi smoke 8/8, activities 8/8, journey 11/11, profile 7/7. Sakelar mode memakai ikon saja; thumbnail materi memakai aset paket yang sudah ada.

### 5.1 Prinsip UX yang disepakati

Delapan prinsip dari berkas review eksternal (§6 di sana) disetujui karena cocok dengan temuan kode; kolom terakhir menunjukkan di mana prinsip itu punya konsekuensi konkret, supaya tidak berhenti sebagai slogan.

| # | Prinsip | Konsekuensi di dokumen ini |
|---|---|---|
| 1 | **Content-first** — materi/aktivitas lebih dominan daripada chrome UI | UX-06 (soal di bawah lipatan), UX-01 (kolom 896 px) |
| 2 | **Local-first clarity** — status lokal & sinkronisasi dijelaskan dalam bahasa pengguna | UX-07 (pesan ganda), status `saved`/`error` yang sudah ada (§8) |
| 3 | **Progress over score** — tampilkan proses & penyelesaian, bukan hanya angka | UX-14 (progres tidak konsisten), UX-05 (copy hasil) |
| 4 | **Accessible interaction** — alternatif tap selain drag-and-drop, dukungan keyboard | UX-15 (tanpa pressed state), P2 matching tap-to-match |
| 5 | **Age-appropriate UI** — instruksi singkat, target besar, istilah sesuai usia | §6 skala IFP, UX-20 istilah campur |
| 6 | **Consistent navigation** — posisi lanjut/kembali/progres tidak berubah tanpa alasan | UX-11 (breadcrumb mati, tanpa “materi berikutnya”), UX-13 |
| 7 | **Graceful empty states** — halaman tanpa data tetap menjelaskan & menawarkan langkah | Hasil Belajar kosong, Aktivitas Interaktif, Jelajah tanpa hasil (sudah ada teks, belum ada CTA/reset) |
| 8 | **Pedagogical feedback** — respons benar/salah membantu pemahaman & memberi kesempatan mengulang | UX-02 (tanpa penanda benar/salah), UX-03 (skor di luar viewport) |

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

### 7.1 Ilustrasi & ikon

Aturan dari review eksternal (§5.3 di sana), disesuaikan dengan kondisi aset project:

1. **Satu gaya per layar.** Jangan mencampur ikon outline, ilustrasi datar, dan karakter 3D dalam satu tampilan tanpa aturan eksplisit.
2. **Ilustrasi menjelaskan konsep**, bukan dekorasi; kalau tidak menambah pemahaman, hapus.
3. **Gambar tidak boleh menggeser keterbacaan**: instruksi dan opsi jawaban tetap ≥20 px (Mode Siswa), area gambar maksimal ±60% tinggi konten pada 1080p (§6).
4. **Katalog memakai aset yang sudah ada.** 320 paket sudah memiliki aset WebP cover/materi, tetapi `CurriculumScreen` belum menampilkan satu pun ([CurriculumScreen.tsx:149-175](../../src/screens/CurriculumScreen.tsx#L149)) — ini UX-10, bukan pekerjaan desain baru.
5. **Ikon navigasi**: satu set, 24–32 px, selalu berpasangan dengan label teks; jangan ikon saja untuk anak kelas awal.

## 8. Rekonsiliasi dengan review eksternal

| Poin review eksternal | Status di dokumen ini | Catatan |
|---|---|---|
| 6,5/10 heuristik | Dicatat, tidak digabung | Bukan hasil pengukuran |
| Dua mode (pengelola/siswa) | **Setuju** | Menjadi §5 |
| Teks & tombol diperbesar | **Setuju, dengan koreksi** | 16–18 px/48–56 px kurang untuk IFP; lihat §6 |
| Matching dropdown → kartu tap/drag | **Setuju** | Data `pairs` sudah ada; tidak perlu ubah skema |
| Umpan balik benar/salah | **Setuju** | Dipertajam: kunci jawaban wajib tampil (UX-02) |
| Hasil Belajar 4 state (kosong / lokal / menunggu sinkron / gagal) | **Setuju** | Tambahan: state “belum ada hasil” harus punya CTA, dan data harus diverifikasi di desktop |
| Aktivitas Interaktif terlalu kosong | **Setuju** | Item nav sebaiknya disembunyikan sampai siap (UX-04/13) |
| Ganti palet/token | **Ditolak (sebagian)** | Palet hampir sama; teal usulan tetap gagal kontras |
| Tidak menangkap defect kode | **Tambahan** | UX-02/04/05/11/12/16–18 tidak terlihat dari screenshot |
| Inter untuk tipografi | **Ditunda** | Perlu keputusan desain; bukan blocker |
| Matching diprioritaskan P1 (literasi kelas awal) | **Tidak diikuti — tetap P2** | Kontrak `pairs` sudah memadai dan dampak P1 Player lebih besar; naikkan ke P1 bila pilot kelas 1 literasi dijadwalkan lebih dulu (D-UX-6) |
| “Satukan Sebelumnya, Lanjut, dan indikator langkah” | **Setuju + koreksi fakta** | `Sebelumnya`/`Lanjut` sudah ada, tetapi hanya di eksplorasi langkah ([ExplorationActivity.tsx:155-169](../../src/components/content/ExplorationActivity.tsx#L155)); matching/kuis tidak memilikinya. Masuk P1 sebagai konsistensi, bukan fitur baru |
| “Pencarian dan filter tersedia” | **Diverifikasi akurat** | Pencarian (`query`) dan filter kelas/mapel benar-benar memfilter ([CurriculumScreen.tsx:55-64](../../src/screens/CurriculumScreen.tsx#L55)); yang hilang hanya reset/chip (UX-10) |
| “Jangan nyatakan data tersimpan/aman tanpa konfirmasi aplikasi” | **Sebagian sudah dipenuhi** | Player sudah punya status `saved`/`error` eksplisit ([LessonPlayer.tsx:28-34](../../src/screens/LessonPlayer.tsx#L28)); yang tersisa: duplikasi & bahasa teknis (UX-07) serta pesan pratinjau yang muncul di layar siswa |
| Aksesibilitas | **Di luar lingkup review eksternal** | Review eksternal menyatakan tidak mengaudit a11y; dokumen ini hanya menghitung kontras token (§2) |

### 8.1 Skor heuristik eksternal per area

Angka berikut berasal dari berkas eksternal (§3 di sana), dihitung dari screenshot tanpa akses kode. Dicatat untuk melacak prioritas penulisnya — **bukan** hasil pengukuran dan tidak digabung menjadi skor dokumen ini.

| Area | Skor eksternal | Catatan |
|---|---:|---|
| Struktur navigasi | 7/10 | Konsisten dengan §3 dokumen ini |
| Katalog materi | 7/10 | Berlebihan bila dibanding UX-10 (48 kartu identik tanpa thumbnail) |
| Player pembelajaran | 7/10 | Inkonsisten dengan temuan utama penulisnya sendiri (“peluang peningkatan terbesar”); UX-01/02/03 menunjukkan masalah yang lebih dalam |
| Aktivitas mencocokkan | 5/10 | Sesuai UX-02/09 |
| Kuis | 6/10 | Sesuai UX-02/03/19 |
| Aktivitas Interaktif | 4/10 | Sesuai UX-04/13 (placeholder) |
| Hasil Belajar | 4/10 | Hanya menilai kondisi kosong; layar berisi data belum pernah dilihat |
| Konsistensi visual | 7/10 | Sesuai §3 |
| **Keseluruhan** | **6,5/10** | Heuristik visual, diakui penulisnya |

## 9. Roadmap gabungan + kriteria penerimaan

### P0 — perbaikan kecil, dampak langsung (tanpa redesign)

1. Copy: hapus “pecahan sederhana” & “keempat gambar” hardcoded; samakan istilah “skor/nilai”.
2. Label: subjek memakai `subjectLabel()`; Hasil Belajar memakai judul lesson/aktivitas.
3. Sembunyikan metadata internal dari Mode Siswa (DRAFT, versi, scaffold, “Paket bawaan build”).
4. Kontras: `text-teal` → `#0b6f69`; teks danger di tint dipergelap; label sidebar ≥4,5:1.
5. Breadcrumb “Beranda” jadi tombol; hint pada tombol disabled.
6. Satu pesan penyimpanan (bukan dua).

**Kriteria penerimaan P0:** tidak ada ID mentah/jargon di layar siswa; semua teks status ≥4,5:1; tombol disabled punya alasan; screenshot ulang sebagai bukti.

**Status implementasi (2026-10-26):** butir 1, 2, 4, 5, 6 **selesai** dan diverifikasi build/uji/DOM; butir 3 **tertahan** D-UX-4 (D-UX-1 sudah diputuskan 2026-10-26). Setelah itu dijalankan verifikasi penuh: `npm run a11y` **PASS** 16 pemeriksaan (0 error, 7 warning reflow) dan 5 skenario E2E PASS (smoke 8, activities 8, home 9, journey 11, profile 7).

| Butir | Status | Bukti |
|---|---|---|
| 1 Copy hardcoded & istilah | Selesai | `QuizActivity` memakai “Skor minimal lulus: N dari 100” dan copy netral; `ExplorationActivity` memakai `{steps.length} langkah`; DOM menampilkan “Kamu sudah menyelesaikan 5 langkah.” |
| 2 Label subjek & judul | Selesai | [`subjectLabel.ts`](../../src/content/subjectLabel.ts) dipakai Home, Curriculum, Player, Results; 3 unit test; DOM menampilkan “Bahasa Indonesia”, “PAI”, “PJOK”, “Pendidikan Pancasila” |
| 3 Sembunyikan metadata internal | **Tertahan** | Menunggu D-UX-4 (perlakuan metadata DRAFT/versi); mode belajar sudah tersedia sebagai tempat memindahkan metadata pengelola |
| 4 Kontras | Selesai | Token `--color-teal-strong #0b6f69` dan `--color-danger-strong #a8323c`; label sidebar `white/70`; utilitas terverifikasi di CSS hasil build |
| 5 Breadcrumb & alasan disabled | Selesai | `TopBar` menerima `onNavigate`; klik “Beranda” terverifikasi pindah ke `#home`; matching menampilkan “Lengkapi N pasangan lagi…” |
| 6 Satu pesan penyimpanan | Selesai | Pesan footer ganda dihapus; banner menyimpan status siap/tersimpan + “belum disinkronkan” |

**Batas bukti:** screenshot baru hanya untuk layar Jelajah Materi (`p0-01-kurikulum-label.png`); surface in-app Browser kembali tersembunyi sebelum screenshot Player (galat `NATIVE_BROWSER_VIEWPORT_UNAVAILABLE`), sehingga butir lain diverifikasi lewat DOM + build, bukan tangkapan layar.

**Verifikasi susulan 2026-10-26 (UX-03):** `npm test` 89/89 · `npm run build` PASS · `npm run a11y` PASS 16 pemeriksaan (0 error, 7 warning reflow; termasuk state hasil kuis) · E2E smoke 8/8, activities 8/8 (3 asersi baru: fokus pindah ke kartu hasil kuis/matching/ordering), home-catalog 9/9, learning-journey 11/11, profile-lifecycle 7/7. Harness diperbarui: audit hasil kuis memakai paket bawaan (“Kuis Penguatan”), tombol eksplorasi “Lanjut berlatih”.

### P1 — Player siswa (dampak terbesar)

1. Token skala IFP + kolom konten lebih lebar.
2. Tujuan pembelajaran jadi ringkas; status penyimpanan jadi indikator header.
3. Feedback 3 keadaan + kunci jawaban (UX-02, tertahan D-UX-5); **hasil auto-scroll/fokus selesai 2026-10-26** (UX-03).
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

### 9.1 State interaksi wajib

Daftar dari review eksternal (§5.4 di sana) dengan status aktual di kode. Kolom status adalah bukti, bukan penilaian.

| State | Dipakai pada | Status sekarang |
|---|---|---|
| default | semua kontrol | Ada |
| hover | perangkat berpointer | Ada (`hover:opacity-90`), tetapi tidak terasa di layar sentuh |
| focus | semua kontrol | Ada — `:focus-visible` 3 px ([index.css:3](../../src/index.css#L3)) |
| selected | opsi kuis, tab, filter | Ada (`checked`, `aria-selected`, nilai select) |
| correct | opsi/kartu setelah dinilai | **Tidak ada** (UX-02) |
| incorrect | opsi/kartu setelah dinilai | **Tidak ada** untuk opsi kuis; matching/ordering menulis “Salah” dengan warna `danger-strong` yang lolos kontras ([MatchingActivity.tsx:90-96](../../src/components/content/MatchingActivity.tsx#L90)) |
| disabled | CTA “Periksa” | Ada dengan alasan: matching menyebut jumlah pasangan tersisa; kuis menampilkan “Terjawab X dari Y” (UX-09 sebagian selesai) |
| loading | katalog, player, ekspor | Katalog (`Memuat materi…`) dan player (`Memuat konten…`, [LessonPlayer.tsx:179-185](../../src/screens/LessonPlayer.tsx#L179)) ada; ekspor hanya menonaktifkan tombol tanpa label proses ([ResultsScreen.tsx:138-142](../../src/screens/ResultsScreen.tsx#L138)) |
| error | katalog, penyimpanan, ekspor | Ada di katalog, penyimpanan (`saved`/`error`), ekspor, dan Hasil Belajar |
| completed | tab/langkah setelah selesai | **Tidak ada** (UX-14) |
| pressed/active | CTA sentuh (tambahan dokumen ini) | **Tidak ada** (UX-15) |

Kesimpulan dari tabel: celah state bukan pada loading/error (yang sudah ditangani), melainkan pada **umpan balik jawaban (`correct`/`incorrect`)**, **penyelesaian (`completed`)**, dan **respons sentuh (`pressed`)** — tiga hal yang paling terasa oleh siswa.

### 9.2 Checklist penerimaan gabungan

Dipakai sebelum menyatakan redesign selesai — digabung dari §8 berkas eksternal dan kriteria P0/P1 di atas. Tidak ada item yang boleh dicentang tanpa bukti screenshot/uji.

- [ ] Siswa dapat menemukan dan membuka materi tanpa kebingungan (uji tugas, bukan opini).
- [ ] Instruksi dipahami tanpa membaca paragraf panjang.
- [ ] Semua tombol utama mudah dikenali; tidak ada target <56 px di Mode Siswa.
- [ ] Setiap jawaban punya status benar/salah **dan** kunci jawaban (UX-02).
- [ ] Navigasi maju/mundur konsisten di semua tipe aktivitas (sekarang hanya eksplorasi yang punya `Sebelumnya`/`Lanjut`).
- [ ] Halaman tanpa data punya pesan dan CTA tindakan (Hasil Belajar, Aktivitas Interaktif, Jelajah tanpa hasil).
- [ ] Status penyimpanan/sinkronisasi tidak menyesatkan; aplikasi tidak mengklaim “tersimpan” sebelum konfirmasi.
- [ ] Soal pertama dan skor terlihat tanpa menggulir pada 1080p.
- [ ] Tampilan terbaca pada 1920×1080 dan 4K sesuai §6.
- [ ] Interaksi inti dapat diselesaikan tanpa drag-and-drop.
- [ ] Tidak ada ID mentah, slug, DRAFT, atau “scaffold” di layar siswa.
- [ ] Guru/pengelola tetap efisien mengakses fungsi administrasi (Mode Pengelola).
- [ ] Hasil uji dengan siswa/guru nyata dipakai memvalidasi keputusan desain.

## 10. Keputusan terbuka (bukan milik agent)

| ID | Keputusan | Pemilik | Dampak bila ditunda |
|---|---|---|---|
| D-UX-1 | Menerapkan dua mode (Siswa/Pengelola) | PO + desain | **Diputuskan 2026-10-26** (PO via instruksi sesi); implementasi awal T-077 selesai. Skala mode siswa tetap D-UX-2; PIN mode admin belum ada |
| D-UX-2 | Baseline skala IFP (16–18 px vs 20–24 px) | Desain + QA perangkat | Risiko redesign dua kali |
| D-UX-3 | Inter vs Segoe UI | Desain | Churn font tanpa manfaat jelas |
| D-UX-4 | Perlakuan metadata DRAFT/versi | PO + Curriculum Lead | Guru melihat status draft secara menyesatkan |
| D-UX-5 | Bentuk matching (kartu vs select) | Desain + QA sentuh | UX-02/P2 tertahan |
| D-UX-6 | Prioritas matching P1 (literasi kelas 1) vs P2 (semua kelas) | PO + desain | Menentukan urutan P1/P2 pada pilot pertama |

## 11. Traceability & batas klaim

- Semua tautan kode di dokumen ini menunjuk baris yang dibaca langsung pada 2026-10-26; tidak ada nomor baris yang dikarang.
- Berkas eksternal `review-layout-pembelajaran-gerbang-edukasi.md` (337 baris, 14.998 byte, diunduh 2026-10-26 dari tautan share) dibaca penuh; isi yang digabung ditandai di §5.1, §7.1, §8.1, §9.1–§9.2. Klaimnya tidak naik menjadi VERIFIED tanpa pengecekan kode (lihat §8).
- Angka kontras dihitung dari token di `src/index.css`; angka sudut pandang adalah **estimasi** dengan asumsi yang dinyatakan.
- Screenshot berada di folder sementara (git-ignored); dokumen ini tidak mengklaim screenshot sebagai artefak rilis.
- Tidak ada pengujian dengan siswa/guru, tidak ada pengukuran waktu tugas, tidak ada klaim peningkatan hasil belajar.
- Dokumen ini **tidak** menyetujui konten; `reviewStatus` paket tetap `draft`.

## 12. Langkah berikutnya

Urutan gabungan (menggantikan urutan P0–P3 bila keduanya bertabrakan): **P0 → prototipe → uji → P1**.

1. Putuskan D-UX-2 (skala IFP) dan tindak lanjut mode siswa; D-UX-1 sudah diputuskan 2026-10-26.
2. Eksekusi P0 (perubahan kecil, dapat diverifikasi dengan screenshot + a11y).
3. Verifikasi Hasil Belajar **di desktop dengan data nyata** sebelum mendesain ulang layar tersebut.
4. Susun prototipe alur kelas 1: Jelajah → Player → Aktivitas → Kuis → Hasil, memakai baseline skala IFP §6.
5. Render prototipe di 1920×1080, 4K, dan 1280; tandai ukuran teks/tombol terkecil yang masih terbaca dari ±3 m.
6. Uji dengan 5 siswa kelas 1 + 2 guru memakai tugas nyata; catat waktu tugas, kesalahan, dan bantuan yang diminta.
7. Implementasikan komponen bersama + seluruh state di §9.1, lalu terapkan pola ke mapel/kelas lain.
