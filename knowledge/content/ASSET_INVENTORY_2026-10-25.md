# Inventaris Aset Konten — 2026-10-25

**Status:** `INVENTARIS` — data dari manifest 320 paket.
**CSV lengkap:** [`asset-inventory-2026-10-25.csv`](asset-inventory-2026-10-25.csv)

## Ringkasan

- Paket: **320**
- File aset: **320**
- Hash unik: **82**
- Hash dipakai lebih dari satu paket: **61**
- Semua aset saat ini: PNG **800×600** (4:3), dibuat deterministik.

## Aset yang dipakai ulang (prioritas diganti)

| Sha256 (8 awal) | Jumlah paket | Contoh paket |
|---|---:|---|
| `1a58835a` | 11 | `kelas1-bahasa-indonesia-b04-menulis-kata`, `kelas1-bahasa-indonesia-b06-menulis-kalimat`, `kelas2-bahasa-indonesia-b02-menulis-kalimat` |
| `1ded837d` | 9 | `kelas1-pjok-b04-kebersihan`, `kelas1-pjok-b08-kesehatan-kebersihan`, `kelas2-pjok-b04-kebugaran-kebersihan` |
| `7ace4f7d` | 9 | `kelas1-bahasa-indonesia-b05-membaca-kalimat`, `kelas1-bahasa-indonesia-b02-membaca-kata`, `kelas1-bahasa-indonesia-b01-huruf-suku-kata` |
| `3faf047e` | 9 | `kelas1-seni-rupa-b05-mewarnai-bentuk`, `kelas1-matematika-b08-pola-bilangan`, `kelas1-seni-rupa-b03-tekstur` |
| `001c405c` | 8 | `kelas1-pjok-b03-keseimbangan`, `kelas1-pjok-b07-kebugaran`, `kelas2-pjok-b02-non-lokomotor` |
| `b6e010ca` | 7 | `kelas1-pendidikan-pancasila-b02-aturan-rumah`, `kelas1-pendidikan-pancasila-b03-hak-kewajiban-rumah`, `kelas2-pendidikan-pancasila-b03-hak-kewajiban-siswa` |
| `937dd2f6` | 7 | `kelas1-pai-b05-huruf-harakat`, `kelas1-pai-b01-huruf-hijaiyah`, `kelas2-pai-b01-huruf-hijaiyah` |
| `7f269925` | 7 | `kelas1-pai-b02-iman-allah`, `kelas1-pai-b06-mengenal-malaikat`, `kelas2-pai-b02-iman-allah` |
| `ae584cb2` | 7 | `kelas1-pendidikan-pancasila-b04-kebersamaan`, `kelas2-pendidikan-pancasila-b05-keberagaman`, `kelas3-pendidikan-pancasila-b05-keberagaman` |
| `214bc949` | 6 | `kelas1-pai-b08-adab`, `kelas2-pai-b08-adab`, `kelas3-pai-b08-adab-kisah-teladan` |
| `cb3323e3` | 6 | `kelas1-pai-b03-akhlak`, `kelas2-pai-b03-akhlak`, `kelas3-pai-b03-akhlak` |
| `11562ca1` | 6 | `kelas1-seni-rupa-b07-apresiasi`, `kelas2-seni-rupa-b07-apresiasi`, `kelas3-seni-rupa-b07-apresiasi-karya` |
| `5eed3951` | 6 | `kelas1-pai-b04-belajar-salat`, `kelas2-pai-b04-salat`, `kelas3-pai-b04-salat` |
| `6e123374` | 6 | `kelas1-bahasa-indonesia-b07-bercerita`, `kelas1-bahasa-indonesia-b03-menyimak-cerita`, `kelas2-bahasa-indonesia-b04-menyimak-cerita` |
| `7a269f7e` | 6 | `kelas1-seni-rupa-b01-garis-warna`, `kelas2-seni-rupa-b01-garis-bentuk-warna`, `kelas3-seni-rupa-b01-unsur-garis` |
| `378bb297` | 6 | `kelas1-pjok-b01-jalan-lari`, `kelas1-pjok-b02-melompat`, `kelas2-pjok-b01-gerak-lokomotor` |
| `db68c4a4` | 6 | `kelas1-pendidikan-pancasila-b07-tolong-menolong`, `kelas2-pendidikan-pancasila-b07-gotong-royong`, `kelas3-pendidikan-pancasila-b07-gotong-royong` |
| `8575605a` | 6 | `kelas1-seni-rupa-b06-kerajinan-bahan-alam`, `kelas2-seni-rupa-b06-kerajinan`, `kelas3-seni-rupa-b06-kerajinan-bahan-alam` |
| `f49cb5e3` | 6 | `kelas1-pai-b07-kisah-nabi`, `kelas2-pai-b07-kisah-nabi`, `kelas3-pai-b07-sejarah-islam` |
| `84a669e8` | 6 | `kelas1-bahasa-indonesia-b08-kosakata-baru`, `kelas2-bahasa-indonesia-b03-kosakata`, `kelas2-bahasa-indonesia-b08-puisi-pantun` |
| ... | ... | 41 hash lainnya (lihat CSV) |

## Catatan

- Aset dipakai ulang bukan otomatis salah, tetapi 61 hash lintas paket menunjukkan diferensiasi visual rendah.
- Aset materi baru sebaiknya 4:3 (1024×768 lalu downscale 800×600) agar cocok dengan Player.
- Cover kelas/mapel sebaiknya 16:9 (1792×1024) untuk tampilan IFP.

## Addendum 2026-10-26 — pasca-migrasi WebP

Ringkasan di atas menggambarkan kondisi **sebelum** migrasi. Kondisi aktual setelah commit `a0667ab`:

| Metrik | Nilai aktual |
|---|---|
| File aset paket | **320 WebP** (`image/webp`), 0 PNG |
| Hash unik | **320** — tidak ada aset dipakai ulang lintas paket |
| Ukuran file | min 65.794 B · median 168.504 B · maks 291.998 B · total 51,0 MB |
| Sumber | 152 gambar Kelas 1–3 via Google Flow (batch 1–38, 1200×896) + 168 gambar Kelas 4–6 (batch 1–12) |
| Validasi | validator repo + hash: **320/320 VALID** |

Catatan diferensiasi visual kini ditangani per paket: setiap paket punya hash aset sendiri. Rujukan bukti QA per batch ada di `MATERI_*_BATCH*.md`; review teknis konten terbaru ada di [REVIEW_REPORT_2026-10-26_ALL_DRAFTS.md](REVIEW_REPORT_2026-10-26_ALL_DRAFTS.md).
