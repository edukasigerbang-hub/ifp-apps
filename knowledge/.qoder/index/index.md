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
  components/content/{ExplorationActivity,QuizActivity}.tsx
  content/
    activityRegistry.ts, validatePackage.ts, verifyAssets.ts, quiz.ts
    loadPackages.ts
    schema/{primitives,manifest,lesson,activity}.ts
    __tests__/{validatePackage,quiz}.test.ts
  index.css, vite-env.d.ts
src-tauri/   Cargo.toml, build.rs, tauri.conf.json, capabilities/
             src/{main,lib,db,error,learning}.rs
             src/migrations/0001_init.sql
             icons/
scripts/     validate-content.ts, export-content-schema.ts
content/     schema/*.json (generated), fixtures/*, packages/matematika-kelas3-pecahan/ (draft)
```

## Keterbatasan

- Belum ada parser simbol/dependency; pencarian memakai grep target.
- Belum ada tabel `symbols`/`calls`/`relations`.
- Index bukan sumber kebenaran: verifikasi selalu ke source aktual.

## Rencana

1. Fase E (repository + schema SQLite) → index SQLite.
2. Setiap perubahan LARGE → targeted reindex.
