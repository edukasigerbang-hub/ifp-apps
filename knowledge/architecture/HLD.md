# HLD — Ringkasan Kerja

> **DERIVED** dari [`../../HLD.md`](../../HLD.md) v1.1 (sha256 `06c85df1…`).
> Bila berbeda → dokumen root menang. Jangan mengedit ringkasan ini sebagai pengganti HLD.

## Sasaran arsitektur

1. Pembelajaran inti berjalan tanpa internet.
2. Windows & Android berbagi model konten dan kontrak domain yang sama.
3. Konten dapat diperbarui tanpa membangun ulang player.
4. Paket rusak/tidak kompatibel tidak merusak konten aktif.
5. Hasil belajar tidak hilang saat jaringan putus atau app ditutup mendadak.
6. Lisensi divalidasi di native layer dengan tanda tangan digital.
7. Modul dapat dikerjakan terpisah via kontrak eksplisit.
8. Keamanan, privasi, aksesibilitas, validasi pedagogis masuk alur rilis.

## Komponen & batas

| Komponen | Batas penting |
|---|---|
| IFP Player | Menampilkan status paket/lisensi, **bukan** sumber otoritatif |
| Learning Engine | Tidak mengeksekusi kode arbitrer dari paket |
| Content Runtime/Manager | Validasi → staging → aktivasi atomik → rollback |
| Local Data Layer | Hasil + outbox dalam satu transaksi; data pribadi diminimalkan |
| Sync Engine | Append-only untuk respons historis; tidak menghapus event sebelum ack |
| Native License Manager | Verifikasi signature/product/binding/waktu/entitlement |
| Content Studio | Workflow draft → review → approved → build → publish |
| Admin Portal | RBAC + audit |

## Deployment

- Client: installer Windows 11, paket Android 14+, bundled content, managed content di app-data.
- Web/backend: Studio + Portal dapat satu aplikasi web modular; API & domain service satu deployment awal.
- Environment terpisah: development / staging / production.

## Observability & recovery

Log terstruktur dengan redaction, correlation ID untuk import/sync/license, diagnostics export tanpa secret, backup-restore lokal teruji, update konten atomik + rollback, migrasi dengan checksum, error UI aman tanpa stack trace.

## Risiko utama

| Risiko | Mitigasi |
|---|---|
| Kelengkapan konten kelas 1–6 memakan waktu | Matriks kelengkapan, produksi paralel, reviewer + gerbang rilis |
| Perbedaan WebView/codec antarperangkat | Uji perangkat fisik, daftar format didukung |
| Paket rusak merusak konten aktif | Staging, checksum, atomic activation, rollback |
| Duplikasi hasil sync | Event ID unik, idempotency, ack |
| Serial dipakai dua perangkat | Aktivasi atomik + unique binding |
| Lisensi offline digandakan | Registry otoritatif + rekonsiliasi issuer |
| Hilangnya data saat reinstall | Kebijakan backup/restore + dokumentasi |
| Privasi siswa | Data minimization, akses terbatas, retensi |
| Beban sistem berlebih | Modular monolith + layanan terkelola |

## Definition of Done arsitektur

Batas sistem disetujui · spike membuktikan Tauri/SQLite/file-import/media di dua platform · identifier produk & strategi distribusi dikonfirmasi · kontrak paket & lisensi ditinjau · matriks konten disetujui · keputusan terbuka yang menyentuh keamanan/data ditutup atau dicatat sebagai blocker.
