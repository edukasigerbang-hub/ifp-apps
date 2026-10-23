# Code Index — Ringkasan

**Status:** DEGRADED · **Mode:** LIGHTWEIGHT_GREP · **Commit:** `503c2fc` (baseline)
**Cakupan:** `src/` (22), `src-tauri/` (28, tanpa `target/`), `scripts/` (2), `content/` (9)

## Struktur yang sudah ada

```text
src/
  main.tsx, App.tsx, navigation.ts
  config/product.ts
  components/layout/{AppShell,SidebarNavigation,TopBar,MobileNavigation}.tsx
  components/ui/{PageHeader,StatusBadge,OfflineIndicator}.tsx
  screens/ScreenPlaceholder.tsx
  screens/LessonPlayer.tsx
  screens/ResultsScreen.tsx
  data/learningRepository.ts
  data/syncEngine.ts
  data/contentRepository.ts
  data/licenseRepository.ts
  data/__tests__/syncEngine.test.ts
  content/loadManagedPackage.ts
  screens/SettingsScreen.tsx
  screens/ContentScreen.tsx
  screens/LicenseScreen.tsx
  components/content/{ExplorationActivity,QuizActivity}.tsx
  content/
    activityRegistry.ts, validatePackage.ts, verifyAssets.ts, quiz.ts
    loadPackages.ts
    schema/{primitives,manifest,lesson,activity}.ts
    __tests__/{validatePackage,quiz}.test.ts
  index.css, vite-env.d.ts
src-tauri/   Cargo.toml, build.rs, tauri.conf.json, capabilities/
             src/{main,lib,db,error,learning,license,sync,validation,content}.rs
             src/migrations/{0001_init.sql,0002_sync.sql,0003_content_activation.sql,0004_license.sql}
             icons/
scripts/     validate-content.ts, export-content-schema.ts, check-fixtures.ts,
             mock-sync-server.mjs, license-issuer.mjs
server/      src/{app,index,store}.ts + src/app.test.ts  (backend referensi)
content/     schema/*.json (generated), fixtures/*, packages/matematika-kelas3-pecahan/ (draft)
```

## Keterbatasan

- Belum ada parser simbol/dependency; pencarian memakai grep target.
- Belum ada tabel `symbols`/`calls`/`relations`.
- Index bukan sumber kebenaran: verifikasi selalu ke source aktual.

## Rencana

1. Fase E (repository + schema SQLite) → index SQLite.
2. Setiap perubahan LARGE → targeted reindex.
