# Kontrak Bundel Materi HTML5 v1 (draf)

**Status:** DRAF — OD-10…OD-14 dikunci 2026-10-28; penampil prototipe (T-114), pemasang ZIP bertanda tangan (T-115), sematan materi di Beranda (T-116), dan **klien katalog + unduhan** (T-117) sudah ada di aplikasi. Klien diuji terhadap **server referensi lokal** (`scripts/mock-catalog-server.mjs`), bukan Worker produksi — §6 belum punya implementasi platform · **Tanggal:** 2026-10-28 · **schemaVersion:** `1.0.0`
**Terkait:** [ADR-0035](../decisions/ADR-0035-online-html5-materials.md) · [Kontrak paket konten v1](SCHEMA.md) · [Kontrak sinkronisasi v1](../api/SYNC_CONTRACT.md)

Dokumen ini menetapkan apa yang **harus dihasilkan platform** (editor + server Gerbang Edukasi) dan apa yang **harus diterima aplikasi desktop**. Tidak mengatur UI editor.

## 1. Ruang lingkup & non-tujuan

**Dicakup:** bentuk bundel, metadata wajib, tanda tangan & hash, endpoint katalog, urutan verifikasi unduhan, penyimpanan/aktivasi lokal, jembatan pesan, syarat aksesibilitas, alur publish.

**Tidak dicakup:** cara editor menyimpan draf, desain visual editor, format internal animasi, isi kurikulum, dan kebijakan review pedagogis (lihat [REVIEW_RUBRIC.md](REVIEW_RUBRIC.md)).

Paket konten v1 **tidak berubah** oleh dokumen ini. Larangan `script/entry/eval/exec` di `interactionConfig` tetap berlaku untuk paket; materi HTML5 adalah jalur terpisah dengan model kepercayaan sendiri ([ADR-0035](../decisions/ADR-0035-online-html5-materials.md)).

## 2. Istilah

| Istilah | Arti |
|---|---|
| **Materi** | Satu unit pembelajaran interaktif HTML5: satu bundel, satu versi. |
| **Bundel** | Arsip ZIP yang diunduh aplikasi. |
| **Katalog** | Daftar materi terbit yang ditarik aplikasi. |
| **Kunci konten** | Pasangan kunci Ed25519 yang menandatangani manifest materi — **bukan** kunci lisensi. |

## 3. Struktur bundel

```text
material.json          # manifest, root, UTF-8, ≤ 256 KB
index.html             # entry, root
assets/…               # gambar, audio, font, skrip, gaya
transcript.txt         # transkrip teks (path wajib ada di manifest)
captions.vtt           # opsional, wajib bila accessibility.hasAudio = true
```

Aturan yang ditegakkan saat publish **dan** saat unduh:

- Path relatif, case-sensitive, tanpa `..`, tanpa path absolut, tanpa symlink. Nama duplikat tanpa peduli huruf besar/kecil ditolak (bentrok di Windows).
- Tipe berkas diizinkan: `html`, `js`, `mjs`, `css`, `json`, `webp`, `png`, `jpg`, `jpeg`, `gif`, `svg`, `mp3`, `m4a`, `ogg`, `wav`, `mp4`, `webm`, `woff2`, `ttf`, `vtt`, `txt`. Tipe lain ditolak.
- Ukuran total ≤ **50 MB**. Satu berkas gambar/suara ≤ **8 MB**; satu berkas video (`mp4`/`webm`) ≤ **25 MB**.
- **Self-contained, kecuali media daring yang dinyatakan naskah** ([ADR-0036](../decisions/ADR-0036-declared-online-media.md)): tidak ada `http://`, `https://`, atau `//` absolut di HTML/JS/CSS untuk sumber daya; tidak ada `fetch`/XHR/WebSocket ke origin luar; tidak ada `window.open`, navigasi top-level, atau form ke luar. **Satu-satunya pengecualian** adalah alamat https yang dideklarasikan blok naskah `ifp-scene` di `index.html` — blok `video` dengan `source` `youtube`/`daring` dan blok `semat`. Validator memotong segmen naskah, memuat JSON-nya, memvalidasi bentuk alamat (https wajib; host YouTube untuk `youtube`; judul wajib), lalu menetralkan alamat itu sebelum pemindaian pola. Alamat di luar daftar tersebut, termasuk di dalam blok teks/gambar/suara, berkas JS/CSS, atau HTML lain, tetap ditolak.
- Karena pengecualian ini, materi **tidak dijamin** dapat dipakai penuh tanpa koneksi: blok video YouTube/daring dan sematan menampilkan pemberitahuan saat jaringan tidak tersedia. Video dengan `source: "lokal"` (berkas ikut bundel) tetap berputar offline.
- Pemeriksaan bersifat pola + tinjauan manusia; ini bukan sandbox. Host daring yang dinyatakan penulis masuk bahan review manusia.
- Font dan gambar ikut bundel. Tidak ada CDN.

## 4. `material.json`

Objek strict: field tak dikenal = ditolak.

| Field | Tipe | Wajib | Aturan |
|---|---|---|---|
| `schemaVersion` | string | ya | `"1.0.0"` |
| `materialId` | string | ya | slug `^[a-z0-9][a-z0-9-]{2,63}$`, unik per platform |
| `version` | string | ya | SemVer (`1.0.0`, `1.1.0`, …) |
| `title` | string | ya | 3–200 karakter |
| `summary` | string | ya | 1–300 karakter, untuk kartu Jelajah Materi |
| `locale` | string | ya | BCP-47 sederhana, mis. `id-ID` |
| `gradeLevels` | number[] | ya | 1–6 elemen, tiap nilai 1–6, unik |
| `subjects` | string[] | ya | 1–24 slug unik, registry sama dengan paket |
| `topics` | string[] | tidak | 0–12 label topik, tiap ≤ 80 karakter |
| `curriculumRefs` | object[] | tidak | 0–24 `{framework, id, version}`, bentuk sama dengan paket v1 |
| `estimatedMinutes` | number | ya | bilangan bulat 1–60 |
| `entry` | string | ya | literal `"index.html"` |
| `cover` | string | ya | path aset WebP/PNG/JPG, min 640×360 |
| `transcriptPath` | string | ya | path `transcript.txt` |
| `captionsPath` | string | kondisional | wajib bila `accessibility.hasAudio` |
| `accessibility` | object | ya | `{ hasAudio, keyboardNavigable, supportsReducedMotion, contrastChecked }` — `keyboardNavigable` **harus** `true` |
| `completion` | object | ya | `{ mode: "none" \| "signal", minDwellSeconds?: 0–600 }` |
| `minAppVersion` | string | ya | SemVer aplikasi minimum |
| `publisher` | object | ya | `{ name }`, 1–80 karakter; tanpa PII perorangan |
| `reviewStatus` | string | ya | `draft` \| `reviewed` \| `approved` (enum sama dengan paket) |
| `files` | object[] | ya | ≥ 2 entri `{path, mediaType, bytes > 0, sha256}`; **kecuali** `material.json` |

Contoh:

```json
{
  "schemaVersion": "1.0.0",
  "materialId": "ipas-kelas3-siklus-air",
  "version": "1.0.0",
  "title": "Siklus Air dalam Animasi",
  "summary": "Mengikuti perjalanan setetes air dari laut ke awan dan kembali ke sungai.",
  "locale": "id-ID",
  "gradeLevels": [3],
  "subjects": ["ipas"],
  "topics": ["Siklus air"],
  "estimatedMinutes": 8,
  "entry": "index.html",
  "cover": "assets/cover.webp",
  "transcriptPath": "transcript.txt",
  "accessibility": {
    "hasAudio": true,
    "keyboardNavigable": true,
    "supportsReducedMotion": true,
    "contrastChecked": true
  },
  "completion": { "mode": "signal", "minDwellSeconds": 30 },
  "minAppVersion": "0.2.0",
  "publisher": { "name": "Gerbang Edukasi" },
  "reviewStatus": "reviewed",
  "files": [
    { "path": "index.html", "mediaType": "text/html", "bytes": 8123, "sha256": "<64 heksadesimal>" },
    { "path": "assets/cover.webp", "mediaType": "image/webp", "bytes": 41230, "sha256": "<64 heksadesimal>" },
    { "path": "transcript.txt", "mediaType": "text/plain", "bytes": 1740, "sha256": "<64 heksadesimal>" }
  ]
}
```

## 5. Tanda tangan & hash

1. `material.json` dikanonikalisasi dengan **RFC 8785 (JCS)** menjadi byte UTF-8.
2. Server menandatangani byte tersebut dengan Ed25519, lalu menaruh `signature = { keyId, algorithm: "ed25519", value: base64url }` **di luar** bundel (pada item katalog, §6). `material.json` sendiri tidak memuat field tanda tangan.
3. Server menghitung `bundleSha256` = SHA-256 atas byte ZIP utuh.
4. Aplikasi memverifikasi keduanya (§7). `keyId` yang tidak dikenal → tolak (tidak ada fallback "percaya saja").
5. Rotasi kunci: aplikasi membawa daftar kunci publik yang dikenal; kunci baru ditambahkan lewat rilis aplikasi **sebelum** platform mulai menandatangani dengan kunci itu.

## 6. Endpoint katalog

```http
GET /v1/materials?grade=3&subject=ipas&cursor=<opaque>&limit=50
```

- `limit` 1–100 (default 50); `grade` 1–6; `subject` slug; parameter tak dikenal → `400 INVALID_QUERY`.
- Urutan: `publishedAt` menurun, stabil terhadap `materialId`.
- Hanya `reviewStatus` `reviewed` dan `approved` yang dikembalikan (OD-10). `draft` tidak pernah tayang di katalog publik; pratinjau draf hanya lewat endpoint admin yang belum dirancang.

Respons `200`:

```json
{
  "schemaVersion": "1.0.0",
  "generatedAt": "2026-10-28T06:00:00.000Z",
  "items": [
    {
      "materialId": "ipas-kelas3-siklus-air",
      "version": "1.0.0",
      "publishedAt": "2026-10-28T05:00:00.000Z",
      "updatedAt": "2026-10-28T05:00:00.000Z",
      "sizeBytes": 1834921,
      "bundleSha256": "<64 heksadesimal>",
      "downloadUrl": "https://<storage>/<path>?token=<pre-signed>",
      "coverUrl": "https://<storage>/<cover>?token=<pre-signed>",
      "signature": { "keyId": "content-2026-1", "algorithm": "ed25519", "value": "<base64url>" },
      "material": { "...": "isi material.json kanonik, lengkap" }
    }
  ],
  "nextCursor": null
}
```

- `material` disalin utuh ke katalog supaya aplikasi bisa menampilkan kartu **dan** memverifikasi tanda tangan sebelum mengunduh.
- `downloadUrl` adalah **URL pre-signed Supabase Storage berumur 10 menit** yang dibuat Worker per permintaan; jangan disimpan (OD-12).
- `coverUrl` **opsional** — URL pre-signed untuk berkas `material.cover` di dalam bundel, dengan aturan umur dan larangan penyimpanan yang sama seperti `downloadUrl`. Dipakai hanya untuk **thumbnail** kartu katalog: cover **tidak** diverifikasi tanda tangan (sama seperti `title`/`summary`), tidak masuk cache SQLite, dan kegagalannya tidak menggagalkan daftar. Server lama tanpa `coverUrl` tetap sah; aplikasi memakai placeholder. Implementasi penyaji: `scripts/mock-catalog-server.mjs` (`/covers/<nama>?token=`, 2026-10-28).
- Header: `ETag` (hash isi), `Cache-Control: public, max-age=300`. `If-None-Match` yang cocok → `304` tanpa body.
- Galat memakai bentuk yang sama dengan Worker yang ada: `{ "error": { "code", "message" } }`.
- Katalog bersifat baca-publik (tidak memuat PII) dengan rate limit per IP **60/menit**. Bila nanti katalog perlu dibatasi ke perangkat terdaftar, tambahkan bearer token perangkat seperti `/v1/sync/events` — belum diputuskan.

## 7. Urutan unduhan & verifikasi (mengikat aplikasi)

> **Catatan implementasi 2026-10-28 (T-117):** klien menambahkan **gerbang awal** sebelum langkah 1 — tanda tangan pada item katalog (§6 `signature` + `material`) diverifikasi lebih dulu, lalu `materialId`/`version` dicocokkan dengan permintaan. Tujuannya agar katalog palsu tidak menghabiskan kuota unduhan. Seluruh langkah 1–7 di bawah **tetap dijalankan** atas byte ZIP yang diunduh, termasuk verifikasi tanda tangan manifest di dalam ZIP.

1. `GET` `downloadUrl`; tolak bila status ≠ 200 atau `Content-Length` ≠ `sizeBytes`.
2. Hitung SHA-256 atas byte ZIP; harus sama dengan `bundleSha256` dari katalog.
3. Baca `material.json` dari ZIP; kanonikalisasi JCS; verifikasi tanda tangan dengan `keyId`.
4. Cocokkan `materialId` dan `version` dengan item katalog.
5. Untuk setiap entri `files`: berkas ada, `bytes` dan `sha256` cocok. Tidak boleh ada berkas **tambahan** selain `material.json` dan yang terdaftar.
6. Periksa path (§3) dan tipe berkas; tolak ZIP dengan symlink, entri direktori aneh, atau path duplikat case-insensitive.
7. Semua lulus → pindahkan dari staging ke folder versi lalu aktifkan. Gagal di langkah mana pun → hapus staging, pertahankan versi aktif sebelumnya, laporkan kode galat.

Kode galat aplikasi:

| Kode | Arti |
|---|---|
| `MATERIAL_FETCH_FAILED` | Jaringan/galat HTTP/ukuran tidak cocok |
| `MATERIAL_HASH_MISMATCH` | SHA-256 ZIP atau berkas di dalamnya tidak cocok |
| `MATERIAL_SIGNATURE_INVALID` | Tanda tangan gagal atau `keyId` tak dikenal |
| `MATERIAL_SCHEMA_UNSUPPORTED` | `schemaVersion` mayor ≠ 1, atau field wajib hilang |
| `MATERIAL_NOT_SELF_CONTAINED` | Ada URL absolut/jaringan/form eksternal |
| `MATERIAL_TOO_LARGE` | Melebihi batas ukuran bundel |
| `MATERIAL_INCOMPATIBLE_APP` | `minAppVersion` lebih baru dari aplikasi |

## 8. Penyimpanan lokal & aktivasi

- Berkas: `<app_data>/materials/<materialId>/<version>/…`; staging di `<app_data>/materials/.staging/<uuid>/`.
- Satu versi aktif per `materialId`. Versi lama disimpan sampai batas cache; rollback = aktifkan versi yang sudah ada di disk (tanpa unduh).
- State di SQLite: `material_install(material_id, version, sha256, size_bytes, state ∈ {staged, active, superseded}, installed_at, last_opened_at)` dengan PK gabungan; `material_progress(profile_id, material_id, progress, completed_at, updated_at)`.
- Pembersihan: LRU berdasarkan `last_opened_at` ketika total melewati anggaran **2 GB**; materi yang sedang dibuka atau disematkan tidak dihapus (OD-13).

## 9. Jembatan `postMessage`

Amplop: `{ "ifp": 1, "type": "<jenis>", … }`.

| Arah | `type` | Body | Aturan |
|---|---|---|---|
| anak → induk | `ready` | — | dikirim setelah animasi siap menerima `config` |
| anak → induk | `progress` | `{ value: 0..1 }` | maksimum 1 pesan/detik; nilai di luar rentang diabaikan |
| anak → induk | `complete` | — | hanya bila `completion.mode = "signal"`; dihitung sekali per sesi |
| anak → induk | `request-exit` | — | induk menampilkan dialog keluar |
| induk → anak | `config` | `{ theme: "light"\|"dark", reducedMotion: boolean, locale: string }` | dikirim sekali setelah `ready` |

- Induk **wajib** memeriksa `event.source === iframe.contentWindow`; pesan dari jendela lain diabaikan.
- Pesan yang bentuknya tidak valid atau `type` tak dikenal diabaikan tanpa efek.
- `complete` diabaikan bila `minDwellSeconds` belum terpenuhi.
- `complete` hanya menulis `material_progress`; **tidak** membuat attempt atau entri Hasil Belajar (OD-14).
- Dilarang mengirim PII (nama profil, ID perangkat, token) ke iframe.

## 10. Persyaratan aksesibilitas (mengikat publish)

1. `transcriptPath` wajib dan memuat seluruh isi naratif; teks yang digambar di kanvas harus tercermin di transkrip.
2. Teks penting (judul, instruksi, label kontrol, pertanyaan) harus berupa DOM/ARIA, bukan raster. Teks dekoratif boleh raster.
3. Bila `hasAudio`: `captionsPath` (`.vtt`) wajib; tidak ada audio autoplay lebih dari 3 detik; ada kontrol jeda.
4. Semua aksi utama dapat dijangkau keyboard; `keyboardNavigable` harus `true`. Bila animasi berbasis kanvas, kontrol DOM disediakan di luar kanvas.
5. Hormati `prefers-reduced-motion` bila `supportsReducedMotion` = true.
6. Shell (bukan iframe) menyediakan: tombol **Keluar**, tombol **Transkrip**, indikator muat, dan pesan galat. `Esc` keluar dari iframe lalu keluar dari penampil.
7. Kontras diperiksa manual saat review (`contrastChecked`), tidak otomatis.

## 11. Alur publish (sisi platform)

1. Editor menghasilkan bundel + `material.json`; simpan sebagai draf.
2. Validator publish memeriksa: skema, self-contained, path/tipe, ukuran, transkrip, `captionsPath` bila ada audio, dan `files` lengkap.
3. Reviewer menetapkan `reviewStatus`; hanya `reviewed`/`approved` yang masuk katalog publik, `draft` tinggal di admin (OD-10).
4. Server menandatangani `material.json` kanonik, menghitung `bundleSha256`, menyimpan bundel **immutable** per versi.
5. Baris katalog ditulis/diperbarui; `updatedAt` berubah bila metadata berubah.
6. **Versi yang sama tidak boleh terbit ulang dengan hash berbeda** — naikkan `version`.
7. Unpublish: hapus dari katalog. Bundel yang sudah diunduh tetap valid dan terverifikasi (tidak bisa dicabut); penarikan paksa butuh mekanisme terpisah yang belum diputuskan.

## 12. Kompatibilitas

- Aplikasi menerima `schemaVersion` `1.x`; mayor lain ditolak (`MATERIAL_SCHEMA_UNSUPPORTED`).
- `minAppVersion` lebih baru dari versi aplikasi → kartu tetap tampil dengan pesan "Butuh aplikasi versi X"; unduhan tidak dimulai.

## 13. Keputusan terbuka

Tidak ada lagi yang memblokir kontrak ini: OD-10…OD-14 dikonfirmasi PO pada 2026-10-28 dan dicatat di [ADR-0035](../decisions/ADR-0035-online-html5-materials.md#keputusan-yang-dikonfirmasi-2026-10-28).

Yang **sudah** ada di aplikasi (per 2026-10-29):

- Penampil prototipe dengan bundel contoh lokal (T-114): iframe tersandbox, protokol `ifp-content`, Esc/transkrip, E2E `material-viewer`.
- Pemasang bundel dari **ZIP lokal + sidecar `.sig`** (T-115): manifest ketat §4, tanda tangan Ed25519 dengan `keyId` persis, hash per berkas, pemindaian self-contained, staging lalu rename atomik, tabel `material_install`, daftar + buka materi di layar Konten, E2E `material-import` 12/12.
- Sematan materi terpasang ke Beranda (T-116): tabel `pinned_materials`, batas 24 sematan dipakai bersama paket, kartu `Materi HTML5` di tab "Materi disematkan" dengan `Buka`/`Lepas`, E2E `material-pin` 12/12.
- Alat dev `scripts/material-pack.mjs` (`keygen`, `pack`) yang menghasilkan ZIP STORED + `.sig` untuk membuat bundel uji.
- Jalur server → perangkat **di sisi aplikasi** (T-117): `GET /v1/materials` lewat `material_catalog.rs` (ETag + cache SQLite `material_catalog_cache`, alamat dari `app_meta`/`IFP_CATALOG_URL`), tanda tangan item diverifikasi sebelum unduh, `bundleSha256` diperiksa sebelum byte masuk pemasang, UI "Jelajah materi daring" di layar Konten. Servernya masih **referensi lokal** (`scripts/mock-catalog-server.mjs`) — Worker produksi belum.
- Cover bundel sebagai thumbnail (T-120/T-121): `coverUrl` opsional di item katalog, `material_installed_cover`/`material_catalog_cover` mengembalikan data URL (magic bytes, ≤ 2 MB), dipakai di baris katalog, daftar materi terpasang, dan kartu sematan Beranda.
- **Studio Materi** (T-122) — langkah 1 §11 kini punya antarmuka: kerangka (`eksplorasi`, `kuis`) → editor berkas → pemeriksaan mandiri §4/§10 → pratinjau lewat penampil → ekspor folder sumber + ZIP **tanpa `.sig`**. Penandatanganan (langkah 4 §11) tetap di luar aplikasi lewat `scripts/material-pack.mjs` supaya kunci privat tidak pernah masuk app; hasil ekspor terbukti dapat ditandatangani dan dipasang (E2E `material-studio`).
- **Tab “Susun”** (T-124, diperluas T-125 2026-10-29) — editor blok tanpa dependensi: langkah berisi blok teks (paragraf/catatan/kutipan/daftar poin dengan tebal, miring, warna, ukuran, perataan), gambar dari galeri aset draft atau unggahan (dengan tata letak penuh/kiri/kanan), dan **blok audio** dari berkas draft (mp3/m4a/ogg/wav) dengan label + teks alternatif. Efek visual per langkah (`kilau`, `konfeti`, `getar`, `hujan-huruf`) dan efek suara antarmuka per langkah (`bel`, `klik`, `whoosh`, `tepuk`) disintesis WebAudio sehingga tidak menambah berkas. Naskahnya disimpan di dalam `index.html` sebagai `<script type="application/json" id="ifp-scene">` (CSP materi `connect-src 'none'` memblokir `fetch`, jadi berkas JSON terpisah tidak bisa dibaca saat runtime). “Terapkan” menulis ulang `index.html`, `assets/style.css`, `assets/app.js`, menulis `assets/captions.vtt` bila ada blok audio, dan ikut menyetel `accessibility.hasAudio` + `captionsPath` sesuai §4; tombol itu wajib dicentang lebih dulu. Undo/redo per sesi sunting, sisip/duplikat blok, dan pratinjau susunan memakai gambar asli (data URL dari `material_draft_asset_read`). Cue captions memakai asumsi 10 detik per klip dan menyatakannya di dalam berkas. Contoh bundel yang dihasilkan alur ini: [`src-tauri/sample-material-mengenal-huruf`](../../src-tauri/sample-material-mengenal-huruf) (“Mengenal Huruf Vokal”, 3 langkah, 7 berkas, `reviewStatus: draft`) — karena berstatus draft ia tidak tampil di katalog; salinannya hidup sebagai draft Studio `contoh-huruf-vokal` di perangkat dan diuji E2E `material-scene-sample`.

- **Sisi platform Worker** (T-123, 2026-10-29 — kode ada, belum terpasang di produksi): `workers/api/src/materials.ts` + `materialManifest.ts` menyediakan `GET /v1/materials` (filter §6, ETag, `generatedAt` stabil, URL unduhan/cover pre-signed ±10 menit), `POST /v1/materials/publish` (validator §4 → pemeriksaan ZIP → simpan Storage → tulis baris → tanda tangan Ed25519 atas manifest hasil baca ulang) dan `POST /v1/materials/unpublish`. Tabel `public.materials` ada di `supabase/migrations/0004_material_catalog.sql` (belum dijalankan); bucket `material-bundles` dan secret `CONTENT_SIGNING_KEY` belum dibuat. Uji: 18 test `workers/api/src/materials.test.ts` + pemeriksaan alur penerbit→Worker→katalog dengan Supabase ditiru (`.tmp-publish/check.ts`).

Yang **belum ada** (pekerjaan, bukan keputusan terbuka): penerapan migrasi 0004 + bucket Storage + secret + deploy Worker di produksi, publikasi `IFP_CONTENT_KEYS` produksi yang dibakar ke build aplikasi (tanpa itu perangkat tidak dapat memverifikasi tanda tangan Worker), penyimpanan `bundleSha256` di `material_install`, `material_progress` (sinyal `complete` belum dipersistensikan), dan pengusiran LRU. Alur §11 langkah 2–3 (penetapan `reviewStatus` oleh reviewer) juga belum otomatis: pemeriksaan Studio bersifat mandiri dan `reviewStatus` draft hanya bisa diubah pengarang lewat tab Metadata, bukan tanda tangan reviewer — Worker menolak menyajikan `draft` ke publik (OD-10) tetapi tidak memvalidasi siapa yang menaikkannya.
