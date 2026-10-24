# Register Test Gap

**Status:** 2026-10-24 · Diperbarui setelah profil, preferensi, dan journey diuji.

## Tertutup (dengan bukti)

| Gap sebelumnya | Bukti |
|---|---|
| Profil hanya hardcoded “Siswa Lokal” | `profile.rs` 3 test + E2E buat “Budi”, 2 profil, active tersimpan |
| Preferensi belum ada | `preferences.rs` 3 test + E2E `reduce-motion`/`font-large` pada root |
| Sesi tidak terikat profil terpilih | E2E: sesi + attempt tercatat pada profile Budi; Hasil Belajar menampilkan “Profil aktif: Budi” |
| Impor/aktivasi/rollback konten | 8 test Rust + E2E v1→v2→rollback |
| Runtime paket impor & katalog | E2E managed/bundled, ganti paket, blob asset |
| Sync client + backend | 5+9 test + E2E ack; delivery server tersimpan |
| Sinkronisasi otomatis | E2E tanpa klik: outbox acknowledged + server 1 event setelah simpan |
| Lisensi offline + online | 11+9 test + E2E impor file dan aktivasi serial |
| Backup/inspect/restore | 3 test + E2E export/inspect |
| Diagnostics | 2 test + E2E redaksi |
| CSV hasil | 3 test |
| Build Windows RC | `tauri build` PASS + hash artefak |
| CI otomatis | `.github/workflows/ci.yml` (web + Rust) berjalan di remote: run `40040384407` (2026-10-24) PASS; `npm run ci` lokal juga PASS |
| Harness E2E dapat diulang | `npm run e2e` — 7 pemeriksaan smoke PASS (bridge Tauri, navigasi, profil default, screenshot) |
| Daftar profil kosong saat first run | Ditemukan harness E2E; `SettingsScreen` kini memuat profil aktif sebelum daftar |
| Rename & hapus profil | 6 test Rust (unik, trim, profil terakhir, konfirmasi data, hapus transaksional) + E2E `npm run e2e:profile` |
| Hapus profil berdata (UI) | Rust PASS; cabang `PROFILE_HAS_DATA` → panel kedua belum diotomasi (butuh sesi belajar nyata) |
| Audit aksesibilitas otomatis | `npm run a11y` 8 layar: 0 error/0 warning; kontras muted 4.47→4.76, heading Player, tab semantics |
| Reflow & teks 200% | 8 layar pada 640/320 px tanpa overflow; root font-size 200% tanpa overflow |
| Target sentuh | Semua target ≥44 px; select preferensi diperbaiki dari 36 px |
| State dinamis konfirmasi hapus | Panel konfirmasi diaudit: 0 error/0 warning |
| Navigasi keyboard dasar | Tab pertama = tautan lewati; 10 langkah Tab bernama, semua punya indikator fokus |
| Alur belajar end-to-end | `npm run e2e:journey` 11 pemeriksaan: impor paket → Player managed-first → eksplorasi 4 langkah → kuis 100 → 1 sesi/1 percobaan → outbox 1 event → Hasil Belajar |
| Rollback konten | `npm run e2e:rollback` 9 pemeriksaan: v0.1.0 → v0.2.0 → rollback → v0.1.0; status paket active/disabled |
| Lisensi end-to-end | `npm run e2e:license` 8 pemeriksaan: key per run, impor valid, expired & signature rusak ditolak, lisensi lama tetap aktif |
| Aktivasi online | `npm run e2e:license-online` 7 pemeriksaan: server referensi nyata, aktivasi + audit server, serial tak dikenal ditolak |
| Beranda & katalog | `npm run e2e:home` 8 pemeriksaan: sapaan, kartu mapel, cari/filter, buka lesson, kuis, kartu lanjutkan; 6 unit test katalog |

## Terbuka

| Gap | Alasan | Rencana |
|---|---|---|
| Restore lewat dialog UI | Dialog native tidak dapat diotomasi CDP | Uji manual; command sudah diuji Rust |
| Import lisensi/konten lewat dialog | Sama seperti di atas | Uji manual; command diuji |
| Transfer/deaktivasi lisensi UI | Belum ada UI | Tambah setelah kebijakan OD-5 |
| DV-01…DV-20 | Tidak ada perangkat Android 14/Windows 11/4K | Device acceptance plan |
| Screen reader & keyboard penuh | Audit otomatis PASS (termasuk reflow, teks 200%, target sentuh); NVDA/TalkBack, hasil kuis, dialog native belum | Audit manual + device |
| Updater & update preservation | Belum dikonfigurasi | Fase L |
| Cakupan skenario E2E | Smoke, profil, alur belajar, rollback, lisensi offline/online, a11y; impor via dialog native belum | Uji manual dialog |
| Review konten manusia | Butuh guru/Curriculum Lead | OD-1/review |

## Perintah uji

```bash
npm test          # 49 test frontend/server + golden 4/4
cargo test        # 44 test (learning/sync/content/license/backup/diagnostics/results/profile/preferences)
npm run build     # typecheck + build
npm run server:typecheck
npm run ci        # rangkaian web + server
npm run e2e       # harness CDP (Windows desktop, aplikasi dev harus berhenti)
npm run e2e:profile  # siklus hidup profil
npm run e2e:journey  # impor paket → eksplorasi → kuis → hasil → outbox
npm run e2e:rollback # impor v1 → v2 → rollback
npm run e2e:license # lisensi: valid, expired, signature rusak
npm run e2e:license-online # aktivasi via server referensi
npm run e2e:home  # Beranda + katalog + lanjutkan belajar
npm run a11y      # audit aksesibilitas 8 layar + keyboard
```

> Klaim PASS hanya dari output aktual. E2E manual via CDP tidak menggantikan device acceptance.
