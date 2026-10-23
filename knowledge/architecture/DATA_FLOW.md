# Alur Data Utama

> **DERIVED** dari [HLD §9](../../HLD.md) dan [LLD §6–§7](../../LLD.md).

## 1. Belajar offline

```text
Pilih kelas/mapel/unit
  → Content Runtime memuat versi aktif + cek ketersediaan aset
  → Learning Engine menjalankan aktivitas
  → Hasil ditulis ke SQLite (learning_sessions, activity_attempts, assessment_responses)
  → Event sync opsional ditulis ke sync_outbox DALAM TRANSAKSI YANG SAMA
  → Feedback ke pengguna tanpa menunggu server
```

**Invariant:** kegagalan jaringan tidak boleh menghalangi penyelesaian sesi.

## 2. Impor / pembaruan konten

```text
Pilih paket lokal atau temukan versi online
  → Validasi: ukuran, path, manifest, schema, checksum, signature (bila wajib), dependensi
  → Ekstrak ke STAGING (tolak file di luar root paket)
  → Validasi menyeluruh pada hasil ekstraksi
  → Aktivasi versi baru secara ATOMIK
  → Gagal? versi aktif lama tetap dipakai + alasan dicatat
```

Status UI yang harus dibedakan: `validating`, `ready`, `installing`, `active`, `failed`, `rollback`.

## 3. Sinkronisasi

```text
Sync Engine pilih event eligible
  → Kirim batch via HTTPS: eventId, deviceId, schemaVersion, createdAt, payload
  → Server: authorization → validation → deduplication → simpan event → ack
  → Client tandai acknowledged SETELAH ack tersimpan
  → Gagal jaringan → retry exponential backoff + jitter; belajar tetap jalan
```

**Konflik:** respons evaluasi & historis append-only; ringkasan progres dihitung ulang deterministik; **dilarang** last-write-wins untuk menghapus/mengganti jawaban historis.

## 4. Aktivasi lisensi offline

```text
App membuat activation request: productId, installationId, requestId/nonce, publicKey (opsional)
  → Operator/issuer cek serial + binding di registry otoritatif
  → Issuer menghasilkan signed license file
  → Pengguna impor file via mekanisme OS
  → Native License Manager verifikasi signature, productId, device binding, masa berlaku, entitlement
  → Status lisensi diperbarui HANYA bila semua pemeriksaan lulus
```

## 5. Penulisan hasil (transaksi)

Satu transaksi DB wajib mencakup: penulisan hasil belajar **dan** event outbox. `event_id` unik; event tidak dihapus sampai acknowledgement server tersimpan.

## 6. Batas data

- Media besar disimpan sebagai file/object storage, **bukan** blob besar di SQLite/PostgreSQL.
- Respons historis tidak boleh dimutasi; koreksi = event baru.
