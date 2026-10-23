# Kontrak Paket Konten v1

**Status:** IMPLEMENTED (Fase D) · **Sejak:** 2026-10-23 · **schemaVersion:** `1.0.0`

## Sumber eksekusi

Zod adalah **sumber tunggal**; JSON Schema dihasilkan dari Zod (bukan ditulis ganda):

| Artefak | Path |
|---|---|
| Primitive (ID, SemVer, SHA-256, path aman) | [`src/content/schema/primitives.ts`](../../src/content/schema/primitives.ts) |
| Manifest paket | [`src/content/schema/manifest.ts`](../../src/content/schema/manifest.ts) |
| Lesson | [`src/content/schema/lesson.ts`](../../src/content/schema/lesson.ts) |
| Activity + asesmen | [`src/content/schema/activity.ts`](../../src/content/schema/activity.ts) |
| Agregat paket | [`src/content/validatePackage.ts`](../../src/content/validatePackage.ts) |
| Registry tipe aktivitas | [`src/content/activityRegistry.ts`](../../src/content/activityRegistry.ts) |
| Verifikasi hash aset | [`src/content/verifyAssets.ts`](../../src/content/verifyAssets.ts) |
| JSON Schema hasil generate | [`content/schema/`](../../content/schema/) |

## Perintah

```bash
npm run content:validate -- content/fixtures/valid-package   # validasi + hash aset
npm run fixtures:check                                       # golden test 4 fixture
npm run content:schema                                       # regenerasi JSON Schema
npm test                                                     # 11 unit test + golden fixture
```

Contoh input/output lengkap: [FIXTURES.md](FIXTURES.md).

## Aturan yang ditegakkan

**Manifest**
- `manifestVersion = 1`, `schemaVersion = 1.0.0` (lain → `CONTENT_SCHEMA_UNSUPPORTED`).
- `packageId` slug 3–64; `packageVersion` SemVer; `locale` BCP-47 sederhana.
- `gradeLevels` 1–6, unik; `subjects` slug unik (daftar mapel **tidak** di-hardcode).
- Aset: path relatif aman, media type allowlist, ukuran > 0, SHA-256 64 heksadesimal; path unik.
- Dependensi: `packageId` + `versionRange`; tanpa self-dependency/duplikat.
- `signature` nullable (kebijakan signature belum final); `releaseState` opsional.

**Lesson**
- `packageId` harus sama dengan manifest.
- `activityIds` unik dan harus ada; `assessmentRefs` harus menunjuk aktivitas ber-`assessmentConfig`.
- `assetRefs` harus ada di manifest; `reviewStatus` draft/reviewed/approved.

**Activity**
- Tipe hanya dari registry: `multiple-choice`, `true-false`, `matching`, `ordering`, `short-answer`, `exploration`.
- Tipe dinilai wajib punya `assessmentConfig` valid (opsi & correctResponse konsisten).
- `interactionConfig` berupa map bebas, **tetapi** dipindai: field `script/module/entry/eval/exec/command/shell/code/javascript` dan nilai `javascript:` / `data:text/html` ditolak.
- Objek memakai strict schema: field tak dikenal = error (mencegah penyelundupan).

**Aset**
- Path traversal (`..`, absolut, drive letter, backslash) ditolak.
- Hash/ukuran diverifikasi terhadap file nyata; ketidakcocokan → `CONTENT_ASSET_HASH_MISMATCH`.

## Kode error (selaras LLD)

`CONTENT_PACKAGE_INVALID` · `CONTENT_SCHEMA_UNSUPPORTED` · `CONTENT_ASSET_HASH_MISMATCH` · `CONTENT_DEPENDENCY_MISSING`

## Batasan yang diketahui

- `interactionConfig` masih generik; kontrak per tipe aktivitas baru akan dibekukan saat Fase G.
- JSON Schema hasil generate **tidak** memuat aturan `superRefine` (duplikat, correctResponse, threshold). Validasi runtime wajib memakai validator Zod, bukan JSON Schema saja.
- Signature paket belum diverifikasi (menunggu kebijakan OD-5/keamanan).
- Belum ada kompresi/arsip paket; validasi dilakukan pada direktori.
- `releaseState` belum mengikat workflow Studio.

## Keputusan terkait

[ADR-0003](../decisions/ADR-0003-content-package-contract.md)
