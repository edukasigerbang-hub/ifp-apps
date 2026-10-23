# System Context

> **DERIVED** dari [HLD §4–§5](../../HLD.md). Sumber otoritatif tetap HLD.

## Aktor

| Aktor | Interaksi utama |
|---|---|
| Guru / Fasilitator | Menjalankan pembelajaran dipandu pada IFP |
| Siswa | Belajar mandiri, mengerjakan aktivitas & evaluasi |
| Admin Sekolah | Mengelola perangkat/konten lokal |
| Editor / Reviewer Konten | Menyusun & menyetujui paket via Content Studio |
| Admin Lisensi | Mengelola serial, aktivasi, transfer via Admin Portal |

## Batas sistem

### Perangkat IFP (offline-capable)

| Komponen | Tanggung jawab | Teknologi |
|---|---|---|
| Player UI | Navigasi, mode guru/siswa, touch-first UI | React + TypeScript |
| Learning Engine | Menjalankan aktivitas terdaftar, lifecycle sesi, skor | TS |
| Content Runtime | Memilih versi konten aktif, menyajikan aset | TS |
| Content Manager | Impor/unduh/validasi/staging/aktivasi atomik/rollback | TS + native |
| Local Data Layer | Profil, sesi, attempt, respons, progres, outbox | SQLite |
| Sync Engine | Batch event, retry/backoff, ack, idempotency | TS |
| Native License Manager | Installation ID, verifikasi signature, entitlement | Rust |
| Platform Adapter | File picker, managed folder, OS APIs | Tauri 2 |

### Cloud (opsional)

Backend API + Content Registry/Distribution, License Service, Sync Service, PostgreSQL, Object Storage. Tahap awal: **modular monolith** dengan batas domain; microservices hanya bila kebutuhan membenarkan.

## Trust boundary

```text
[Paket konten / file impor]  --TIDAK TEPERCAYA-->  Content Manager
[UI badge lisensi]           --BUKAN OTORITATIF-->  Native License Manager
[Respons server sync]        --DIVALIDASI------->  Sync Engine
[Klien]                      --TIDAK PERNAH----->  private signing key
```

- Pembelajaran lokal **tidak** bergantung pada keberhasilan koneksi ke Backend API.
- Fungsi online hanya untuk: unduhan paket, sinkronisasi, aktivasi online, administrasi terpusat.

## Invariant arsitektur

1. UI tidak mengakses SQLite/API/filesystem/lisensi secara langsung — selalu via service/repository/native command.
2. Learning Engine tidak mengeksekusi kode arbitrer dari paket.
3. Konten bawaan bersifat recoverable; paket inti tidak dihapus permanen lewat operasi normal.
4. `public/` setelah bundling bukan tempat penyimpanan yang diasumsikan bisa ditulis pengguna; lokasi kelolaan = app-data.
