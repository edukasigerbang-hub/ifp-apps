# ADR-0036 — Pengecualian Daring Terdeklarasi untuk Blok Video & Sematan Materi

**Status:** Accepted (putusan PO 2026-10-30 via AskUserQuestion) — kode selesai & terverifikasi T-131 (Rust 131/131, unit 168/168, worker 34/34, E2E studio 31/31 · scene-sample 4/4 · material-viewer 8/8) · **Tanggal:** 2026-10-30
**Terkait:** [ADR-0035](ADR-0035-online-html5-materials.md) · [Kontrak bundel materi v1 §3](../content/MATERIAL_BUNDLE_CONTRACT.md) · [Studio scene model](../../src/components/studio/sceneModel.ts) · [Validator manifest](../../src-tauri/src/material_manifest.rs)

## Konteks

- PO meminta Studio Materi dapat memuat **video dari YouTube**, **video daring (https)** dengan penanganan saat koneksi hilang, **video lokal** yang ikut bundel, dan **sematan HTML daring** (mis. GeoGebra).
- [ADR-0035](ADR-0035-online-html5-materials.md) butir 3 dan [kontrak bundel §3](../content/MATERIAL_BUNDLE_CONTRACT.md) mewajibkan bundel **self-contained**: tidak ada `http(s)://` di HTML/JS/CSS. Aturan itu ditegakkan `ensure_self_contained()` saat pasang **dan** `materialAuthor` saat pemeriksaan mandiri.
- Tabrakan langsung: blok video YouTube/sematan *tidak mungkin* disalin ke bundel (pemutar dan halaman belong on pemiliknya), sementara video lokal justru harus diizinkan ikut bundel dengan ukuran yang wajar.
- Batas aset yang ada (8 MB per berkas) tidak menampung video; satu rekaman pelajaran pendek mudah melewati 8 MB tetapi tetap di bawah anggaran bundel 50 MB.
- Pemutar tertanam memakai `iframe sandbox="allow-scripts allow-forms"` (ADR-0035 butir 5). YouTube dan sebagian besar sematan menolak frame dengan asal opaque, jadi pemutar mereka tidak jalan pada sandbox itu.

## Keputusan

1. **Pengecualian terbatas dan terdeklarasi**, bukan pelonggaran umum. Bundel boleh memuat alamat https **hanya** untuk:
   - blok `video` dengan `source: "youtube"` (tautan youtube.com/youtu.be https),
   - blok `video` dengan `source: "daring"` (berkas video https),
   - blok `semat` (halaman https).
   Alamat ini **harus** datang dari naskah `ifp-scene` (`<script type="application/json" id="ifp-scene">`) yang tervalidasi skema, bukan dari sembarang tempat di berkas.
2. **Validator menjadi sadar-naskah.** `ensure_self_contained()` memotong segmen `ifp-scene` dari `index.html`, memuat JSON-nya, memvalidasi tiap blok video/sematan (https wajib, host YouTube untuk sumber `youtube`, judul wajib), lalu **menetralkan** URL yang dideklarasikan sebelum pemindaian pola. Segmen naskah di luar daftar itu dan seluruh berkas lain (JS/CSS/HTML tambahan, termasuk teks/gambar/suara yang menaruh alamat) tetap ditolak dengan pesan "rujukan eksternal". Fungsi yang sama dipakai saat pasang, jadi penulis dan pemasang memakai satu aturan.
3. **Tiga sumber video, bukan satu abstraksi "URL".** `youtube` → iframe `youtube-nocookie`; `daring` → `<video src>` + penanda `data-online`; `lokal` → berkas di `assets/`. Sumber lokal tidak menyentuh jaringan sama sekali.
4. **Penanganan offline di runtime, bukan asumsi online.** Renderer memasang listener `online`/`offline` pada halaman materi dan `error` pada `<video data-online>`; saat gagal, `.offline-note` ditampilkan ("Butuh koneksi internet untuk memutar video ini." / "Halaman sematan butuh koneksi internet.") alih-alih pemutar kosong. Tab Susun menampilkan `data-scene-internet-note` dan pemeriksaan mandiri menambah peringatan jumlah blok daring — materi **tetap dapat dipasang**, tidak diblokir (kebijakan "daring bebas + peringatan" yang dipilih PO).
5. **Batas ukuran video 25 MB per berkas**; gambar/suara tetap 8 MB; total bundel tetap 50 MB (ADR-0035 OD-13 tidak berubah). `mp4`/`webm` ditambahkan ke daftar tipe yang sah di tiga lapisan yang harus cocok: Rust `material_manifest`, Worker `materialManifest`, dan `scripts/material-pack.mjs`.
6. **Sandbox pemutar diperluas** menjadi `allow-scripts allow-forms allow-same-origin allow-popups` untuk frame materi terpasang. Materi dilayani protokol `ifp-content://` yang berbeda asal dengan dokumen aplikasi, jadi `allow-same-origin` memberi frame asal *dirinya sendiri* (diperlukan YouTube), bukan akses ke asal aplikasi; `allow-top-navigation` tetap tidak diberikan.
7. **Pratinjau Studio tidak memuat media daring.** Pratinjau srcdoc mewarisi CSP aplikasi (`frame-src 'self' ifp-content:`), sehingga pemutar jarak jauh memang tidak bisa tampil di sana; tab Pratinjau merender **penanda** ("YouTube … — diputar di materi terpasang.") dan playback sebenarnya diverifikasi di penampil materi terpasang.

## Konsekuensi

- Kontrak §3 tidak lagi absolut: dokumen [MATERIAL_BUNDLE_CONTRACT.md](../content/MATERIAL_BUNDLE_CONTRACT.md) harus menyebut pengecualian terdeklarasi ini, dan penandaan "self-contained" berarti "mandiri **kecuali** blok video/sematan yang dinyatakan naskah".
- Materi dengan video daring **tidak 100% offline**: bagian itu menampilkan pemberitahuan. Video lokal adalah satu-satunya jalur yang tetap berputar tanpa koneksi.
- Penyerangan yang tersisa: halaman https yang dideklarasikan penulis bisa berubah isi setelah pasang (konten pihak ketiga di luar kendali). Mitigasi: hanya bundel bertanda tangan penerbit yang dipasang (ADR-0035 butir 4), daftar host diverifikasi manusia saat review, `referrerPolicy="no-referrer"`, dan tanpa `allow-top-navigation`.
- Perluasan sandbox menambah permukaan: frame materi kini dapat menyimpan cookie/localStorage untuk asal `ifp-content`-nya sendiri dan membuka jendela. Diterima karena YouTube/GeoGebra tidak berfungsi tanpa asal nyata; batasnya tetap domain materi, bukan asal aplikasi.
- Batas 25 MB membuat satu video bisa menghabiskan separuh anggaran bundel; pemeriksaan mandiri tetap menampilkan total byte sehingga penulis melihat sisanya.
- Unduhan pratinjau tidak terjadi di Studio, sehingga pengujian E2E hanya dapat membuktikan markup dan pemberitahuan offline, bukan pemutaran nyata.

## Alternatif yang ditolak

- **Seragamkan semua video sebagai aset lokal (unduh saat publish).** Menolak YouTube/sematan interaktif yang justru diminta PO, dan memindahkan isu hak cipta/kecil-berkas ke platform.
- **Menyimpan daftar host boleh di luar naskah (allowlist global).** Lebih longgar dan lebih mudah keliru; allowlist implisit dari naskah membuat setiap materi menyatakan sendiri alamatnya sehingga dapat diaudit per materi.
- **Memblokir pasang bila materi butuh internet.** Bertentangan dengan keputusan PO "daring bebas + peringatan" dan merugikan guru yang menyiapkan materi di kelas dengan koneksi putus-putus.
- **Menambah `allow-orientation-lock`/`allow-pointer-lock` dsb. untuk pemutar.** Tidak diperlukan oleh YouTube/GeoGebra; tiap token sandbox tambahan adalah permukaan tambahan.
