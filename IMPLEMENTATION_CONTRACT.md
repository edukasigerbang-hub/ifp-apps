# Implementation Contract for Coding Agents

## 1. Mandat

Implementasikan Gerbang Edukasi -- IFP Apps sesuai PRD/HLD/LLD dan ADR.
Kontrak ini tidak mengizinkan perubahan produksi atau keputusan produk
secara sepihak.

## 2. Sebelum coding

1.  Periksa repository, branch, package manager, lockfile, runtime, dan
    test commands yang benar-benar ada.
2.  Baca dokumen spesifikasi dan cari konflik dengan codebase.
3.  Laporkan asumsi, missing decisions, dan platform limitations.
4.  Buat rencana perubahan kecil; jangan rewrite repository tanpa alasan
    dan persetujuan.
5.  Untuk perubahan yang sulit dibalik, buat ADR dan minta persetujuan
    terlebih dahulu.

## 3. Batas otorisasi

Tanpa persetujuan eksplisit, agent tidak boleh: - Mengubah Windows
identifier atau Android applicationId setelah identitas rilis
diputuskan. - Mengubah product ID, license semantics, signed payload
format, atau key material. - Menghapus/mengubah data produksi,
menjalankan migrasi destruktif, atau mempublikasikan paket. -
Menonaktifkan test, lint, security checks, atau validasi konten hanya
agar build lulus. - Menambahkan arbitrary code execution dari paket
konten. - Memasukkan secret/private signing key ke source code, client
bundle, fixture publik, atau log. - Mengklaim dukungan platform tanpa
build/test evidence.

## 4. Alur implementasi

Untuk setiap task: 1. Nyatakan tujuan dan acceptance criteria. 2.
Identifikasi modul dan kontrak terdampak. 3. Implementasikan perubahan
terkecil yang memenuhi kebutuhan. 4. Tambahkan/update unit dan
integration tests. 5. Jalankan formatter, lint, typecheck, tests, dan
build yang tersedia. 6. Jika platform/device tidak tersedia, tandai test
sebagai NOT RUN, bukan PASS. 7. Periksa diff untuk secret, data pribadi,
generated files yang tidak diminta, dan perubahan tak terkait. 8.
Laporkan file yang diubah, hasil command, test status, risiko, dan
langkah berikutnya.

## 5. Format laporan wajib

-   Summary
-   Files changed
-   Decisions/assumptions
-   Commands run and results
-   Tests: PASS / FAIL / NOT RUN
-   Security/data implications
-   Known limitations
-   Suggested next task

## 6. Quality gates

-   Tidak ada compile/type errors yang diketahui.
-   Unit tests terkait lulus.
-   Schema dan migrations memiliki tests.
-   Tidak ada perubahan tak sengaja pada lockfile atau platform IDs.
-   Acceptance criteria dapat diverifikasi.
-   Dokumentasi diperbarui saat kontrak berubah.
-   Tidak ada task yang dianggap selesai jika tes wajib tidak dijalankan
    atau hasilnya tidak diketahui.

## 7. Agent workflow

Urutan kerja yang direkomendasikan: A. Repo reconnaissance + ADR
confirmation. B. Device technical spike. C. Product configuration + app
shell. D. Content schema and validator. E. Local repository and learning
session contracts. F. Content importer/atomic activation. G. Learning
runtime and basic activities. H. License core + test vectors. I. Sync
outbox + API contract. J. Studio/admin workflows. K. Content
production/QA pipeline. L. Device hardening and release.

Jangan mengimplementasikan semua fase dalam satu prompt besar. Gunakan
task kecil yang masing-masing memiliki acceptance criteria dan review.
