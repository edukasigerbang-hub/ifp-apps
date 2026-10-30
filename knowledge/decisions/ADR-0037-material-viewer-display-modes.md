# ADR-0037 — Tiga Mode Lebar Penampil Materi & Kolom Baca Responsif

**Status:** Accepted (putusan PO 2026-10-30 via AskUserQuestion) — kode selesai & terverifikasi T-133 (`cargo test --lib` 132/132, unit 169/169, `npm test` hijau, `vite build` EXIT 0, a11y 19/19, E2E `material-viewer` 11/11 · `material-scene-sample` 5/5 · `material-studio` 31/31) · **Tanggal:** 2026-10-30
**Terkait:** [ADR-0035](ADR-0035-online-html5-materials.md) · [ADR-0036](ADR-0036-declared-online-media.md) · layar penuh Player T-093 di [LessonPlayer.tsx](../../src/screens/LessonPlayer.tsx) · [penampil materi](../../src/components/material/MaterialViewer.tsx) · [renderer Susun](../../src/components/studio/sceneRender.ts)

## Konteks

- Perangkat IFP adalah tablet/notebook **lanskap**; jendela aplikasi 1600×900 ([tauri.conf.json](../../src-tauri/tauri.conf.json)). Penampil materi HTML5 sebelumnya dikunci `max-w-5xl` (1024 px) dengan kolom baca `.material { max-width: 820px }`, jadi pemutar YouTube dan sematan GeoGebra tampil kecil di kiri-kanan kosong — pertanyaan PO: "apakah player-nya bisa dibuat landscape, sama dengan devicenya".
- Melebarkan saja tidak cukup sebagai satu-satuan tampilan: kartu sempit masih paling nyaman untuk materi berbasis teks di jendela kecil, dan ada perangkat/sesi yang benar-benar ingin konten penuh tanpa chrome. PO diberi pilihan dan memutuskan **tiga mode: Kartu | Lansekap | Layar penuh**.
- Untuk kolom baca ada dua jalur: (a) penampil menyuntik/menimpa gaya dokumen materi, atau (b) CSS yang dirender Studio memakai **media query** sehingga dokumen menyesuaikan dirinya sendiri. PO memilih **(b) media query di CSS bundel**.

## Keputusan

1. **Tiga mode, satu tombol siklus.** `kartu` → `lansekap` → `layar-penuh` melalui satu tombol "Tampilan: …" (`data-material-view-mode-toggle`), dan mode aktif tercatat di DOM lewat `data-material-view-mode` supaya uji E2E dapat mengukur, bukan menebak.
   - `kartu`: tetap seperti sebelumnya — dialog `max-w-5xl`, header lengkap (keterangan + metadata), transkrip menutupi sebagai overlay.
   - `lansekap`: dialog `max-w-none` mengisi bingkai jendela dikurangi padding tipis, transkrip **mendampingi** pemutar di kanan (`w-[26rem] max-w-[45%] shrink-0`), bukan menutupi.
   - `layar-penuh`: tanpa padding, tanpa bordir/pojok, tanpa baris keterangan & metadata, header dan bar progres dipadatkan.
2. **Mode diingat per profil**, memakai tabel `ui_state` yang sudah ada (T-111) dengan kunci baru `material-view-mode` (`MATERIAL_VIEW_MODE_KEY`). Nilai awal dibaca dari profil aktif saat penampil ter-mount; kegagalan baca (mis. pratinjau Studio tanpa profil) hanya berarti mode tidak dipersist, bukan error.
3. **Mode awal berasal dari viewport, bukan dari preferensi global:** jendela ≥ 1280 px mulai di `lansekap`, di bawah itu `kartu`. Begitu pengguna menyentuh tombol, preferensi tersimpan menang atas aturan viewport.
4. **Layar penuh memakai API jendela Tauri** (`getCurrentWindow().setFullscreen()`), **bukan** DOM Fullscreen API. Catatan perbedaan: T-093 (Player) sengaja membuat "layar penuh" sebagai state CSS di dalam jendela karena Fullscreen API DOM tidak konsisten di WebView2. Di penampil materi, mode `lansekap` sudah memenuhi seluruh area webview, jadi mode ketiga tidak menambah apa-apa kalau ia hanya CSS juga — maka ia naik ke fullscreen OS lewat panggilan native Tauri (bukan API DOM yang ditolak T-093). Efek sampingnya ditangani: meninggalkan mode (tombol, Escape, atau tutup penampil) selalu melepas layar penuh, dan di luar Tauri (pratinjau Studio) panggilan dilewati.
5. **Escape bertingkat:** transkrip terbuka → tutup transkrip; layar penuh → turun ke lansekap; selain itu → tutup penampil.
6. **Kolom baca melebar dari dalam bundel**, lewat dua titik putus di CSS yang dirender Studio ([sceneRender.ts](../../src/components/studio/sceneRender.ts)):
   - `@media (min-width:1000px)` → `.material{max-width:min(1180px,92%)}`, baris teks dibatasi `.step p,.step li{max-width:78ch}`, sematan ikut tinggi `min(72vh,640px)`;
   - `@media (min-width:1400px)` → `.material{max-width:min(1400px,94%)}`.
   Di bawah 1000 px kolom tetap 820 px sehingga panjang baris materi teks tidak melar. Dokumen materi tidak pernah disentuh dari sisi penampil (asal `ifp-content` berbeda, gaya induk tidak bisa masuk).

## Konsekuensi

- **Materi yang sudah terpasang sebelum perubahan ini tetap 820 px** sampai ditulis ulang/diterapkan ulang di Studio atau diterbitkan ulang: media query hidup di `assets/style.css` bundel, bukan injeksi runtime. Mode Lansekap/Layar penuh tetap bekerja untuk mereka — yang melebar hanya bingkai pemutar, bukan kolom teks.
- Penampil kini punya **dua sumbu tata letak** (mode tampilan × panel transkrip) sehingga uji E2E harus mengukur geometri, bukan hanya keberadaan elemen; [material-viewer.mjs](../../scripts/e2e/scenarios/material-viewer.mjs) menambah pengukuran `dialog`/`frame`/`transkrip` per mode dan [material-scene-sample.mjs](../../scripts/e2e/scenarios/material-scene-sample.mjs) mengukur kolom `.material` dari dalam OOPIF lewat sesi CDP dokumen materi.
- `position: fixed; inset: 0` **tidak** menutupi bilah gulir klasik: pada jendela 1600 px dialog layar penuh terukur 1585 px. Pembanding yang benar `document.documentElement.clientWidth`, bukan `window.innerWidth` (satu-satunya sumber kegagalan asersi pada penyusunan uji ini).
- Baris metadata (kelas, mapel, durasi, versi) hilang di layar penuh. Diterima: mode ini ditujukan untuk pemutaran di depan kelas, dan informasi itu tetap ada di daftar materi.
- Perpindahan ke mode `layar-penuh` mengubah jendela pada tingkat OS (title bar & bilah tugas hilang), jadi uji otomatis hanya dapat membuktikan **state mode + geometri DOM**, bukan bahwa fullscreen OS benar-benar terjadi di mesin pengguna. Yang terukur di E2E: `data-material-view-mode`, lebar dialog = `clientWidth`, dan tanpa keterangan/metadata.
- Karena mode ini menyentuh jendela, pratinjau Studio tidak ikut memakainya: di luar Tauri `canPersistLocally()` gagal sehingga panggilan `setFullscreen` dilewati dan preferensi tidak ditulis.
