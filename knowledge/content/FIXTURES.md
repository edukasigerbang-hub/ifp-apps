# Fixture Validator Konten — Input & Output Lengkap

**Status:** IMPLEMENTED · **Sejak:** 2026-10-23 · Terkait [SCHEMA.md](SCHEMA.md)

Fixture ini adalah **data uji**, bukan materi pembelajaran. Semua berstatus dummy, memakai aset 1×1 piksel, dan tidak mengklaim kesesuaian kurikulum.

## Cara kerja validator

Validator menerima **satu direktori paket**:

```text
<paket>/
├── manifest.json          # wajib
├── lessons/*.json         # 1..200 lesson
├── activities/*.json      # 1..1000 activity
└── assets/*               # file nyata yang dirujuk manifest
```

```bash
npm run content:validate -- content/fixtures/valid-package
npm run fixtures:check      # bandingkan semua fixture dengan expected
```

## Struktur fixture

```text
content/fixtures/
├── valid-package/
│   ├── manifest.json
│   ├── lessons/lesson-001.json
│   ├── activities/activity-001.json
│   ├── activities/activity-002.json
│   └── assets/pixel.png                  # 70 byte, SHA-256 c414cd0e…
├── invalid-structure/
│   ├── manifest.json                     # path traversal
│   ├── lessons/lesson-001.json           # activityId duplikat
│   └── activities/activity-001.json      # field "script"
├── invalid-references/
│   ├── manifest.json                     # hash salah + self-dependency
│   ├── lessons/lesson-001.json           # refs rusak
│   ├── activities/activity-001.json      # aset tak ada di manifest
│   └── assets/pixel.png
├── unsupported-schema/
│   └── manifest.json                     # schemaVersion 2.0.0
└── expected/
    ├── valid-package.report.json
    ├── invalid-structure.report.json
    ├── invalid-references.report.json
    └── unsupported-schema.report.json
```

## Matriks kasus

| Fixture | Status | Issue | Yang dibuktikan |
|---|---|---|---|
| `valid-package` | VALID | 0 (2 warning) | Referensi lesson↔activity↔asset konsisten, hash aset cocok |
| `invalid-structure` | INVALID | 3 | Path traversal, field eksekusi `script`, activityId duplikat |
| `invalid-references` | INVALID | 7 | Ref aset/aktivitas/asesmen rusak, packageId salah, self-dependency, hash mismatch |
| `unsupported-schema` | INVALID | 1 | Versi schema tidak didukung → berhenti sebelum parsing |

---

## INPUT — `valid-package`

### `manifest.json`

```json
{
  "manifestVersion": 1,
  "packageId": "demo-pecahan-kelas3",
  "packageVersion": "1.0.0",
  "schemaVersion": "1.0.0",
  "title": "Fixture: Unit Contoh (BUKAN materi produksi)",
  "locale": "id-ID",
  "gradeLevels": [3],
  "subjects": ["matematika"],
  "curriculumRefs": [],
  "assets": [
    {
      "path": "assets/pixel.png",
      "mediaType": "image/png",
      "sizeBytes": 70,
      "sha256": "c414cd0e204de974f73753c7e28d7638e7b3691bb8b1a2bab6b25bb7fed7ce77"
    }
  ],
  "dependencies": [],
  "signature": null
}
```

### `lessons/lesson-001.json`

```json
{
  "lessonId": "lesson-contoh",
  "packageId": "demo-pecahan-kelas3",
  "title": "Fixture: Struktur Lesson (DRAFT)",
  "summary": "Hanya untuk menguji validator; bukan materi pembelajaran dan tidak mengklaim kesesuaian kurikulum.",
  "curriculumRefs": [],
  "learningObjectives": ["Menguji bahwa lesson dapat direferensikan oleh aktivitas"],
  "activityIds": ["activity-eksplorasi", "activity-kuis-pecahan"],
  "assessmentRefs": ["activity-kuis-pecahan"],
  "assetRefs": ["assets/pixel.png"],
  "contentVersion": "1.0.0",
  "reviewStatus": "draft"
}
```

### `activities/activity-001.json`

```json
{
  "activityId": "activity-eksplorasi",
  "type": "exploration",
  "schemaVersion": "1.0.0",
  "title": "Fixture: Eksplorasi",
  "instructions": "Aktivitas contoh untuk menguji referensi aset. Bukan materi produksi.",
  "assets": ["assets/pixel.png"],
  "interactionConfig": {
    "steps": [
      { "prompt": "Amati gambar contoh", "hint": "Ganti dengan konten nyata pada produksi" }
    ]
  },
  "completionPolicy": { "type": "view" },
  "feedbackPolicy": { "mode": "immediate", "allowRetry": true, "showCorrectAnswer": true },
  "runtimeCapabilities": ["touch"]
}
```

### `activities/activity-002.json`

```json
{
  "activityId": "activity-kuis-pecahan",
  "type": "multiple-choice",
  "schemaVersion": "1.0.0",
  "title": "Fixture: Kuis Pilihan Ganda",
  "instructions": "Contoh soal fiktif untuk menguji skema asesmen. Bukan bank soal produksi.",
  "assets": [],
  "interactionConfig": { "layout": "single-question" },
  "assessmentConfig": {
    "questions": [
      {
        "questionId": "q-contoh",
        "prompt": "Contoh soal: pilih opsi kedua.",
        "responseType": "single-choice",
        "options": [
          { "optionId": "opt-a", "text": "Opsi A" },
          { "optionId": "opt-b", "text": "Opsi B" }
        ],
        "correctResponse": "opt-b"
      }
    ],
    "passingScore": 70
  },
  "completionPolicy": { "type": "score-threshold", "threshold": 70 },
  "feedbackPolicy": { "mode": "after-attempt", "allowRetry": true, "showCorrectAnswer": false },
  "runtimeCapabilities": ["touch", "keyboard"]
}
```

---

## OUTPUT — 4 kasus (lengkap)

### 1. `valid-package.report.json`

```json
{
  "package": "demo-pecahan-kelas3",
  "status": "VALID",
  "issues": [],
  "warnings": [
    "lesson 'lesson-contoh' masih berstatus draft dan belum boleh dianggap materi produksi",
    "manifest tidak memiliki curriculumRefs; jangan mengklaim kesesuaian kurikulum"
  ]
}
```

### 2. `invalid-structure.report.json`

`package` bernilai `null` karena struktur gagal diparse; validasi lintas-field tidak dijalankan.

```json
{
  "package": null,
  "status": "INVALID",
  "issues": [
    {
      "code": "CONTENT_PACKAGE_INVALID",
      "message": "field terlarang 'script' tidak boleh ada di paket konten",
      "path": "activities[0].interactionConfig.script"
    },
    {
      "code": "CONTENT_PACKAGE_INVALID",
      "message": "path tidak boleh memuat segmen kosong, '.' atau '..'",
      "path": "manifest.assets.0.path"
    },
    {
      "code": "CONTENT_PACKAGE_INVALID",
      "message": "activityId duplikat: activity-ok",
      "path": "lessons.0.activityIds.1"
    }
  ],
  "warnings": []
}
```

### 3. `invalid-references.report.json`

```json
{
  "package": "fixture-invalid-references",
  "status": "INVALID",
  "issues": [
    {
      "code": "CONTENT_DEPENDENCY_MISSING",
      "message": "aset aktivitas tidak ada di manifest: assets/missing-activity.png",
      "path": "activities.0.assets.0"
    },
    {
      "code": "CONTENT_PACKAGE_INVALID",
      "message": "lesson.packageId 'fixture-lain' tidak cocok dengan manifest 'fixture-invalid-references'",
      "path": "lessons.0.packageId"
    },
    {
      "code": "CONTENT_DEPENDENCY_MISSING",
      "message": "activityId tidak ditemukan: activity-missing",
      "path": "lessons.0.activityIds.1"
    },
    {
      "code": "CONTENT_PACKAGE_INVALID",
      "message": "assessmentRef 'activity-no-assessment' tidak memiliki assessmentConfig",
      "path": "lessons.0.assessmentRefs.0"
    },
    {
      "code": "CONTENT_DEPENDENCY_MISSING",
      "message": "assetRef tidak ada di manifest: assets/tidak-ada.png",
      "path": "lessons.0.assetRefs.0"
    },
    {
      "code": "CONTENT_PACKAGE_INVALID",
      "message": "paket tidak boleh bergantung pada dirinya sendiri",
      "path": "manifest.dependencies.0.packageId"
    },
    {
      "code": "CONTENT_ASSET_HASH_MISMATCH",
      "message": "SHA-256 tidak cocok untuk assets/pixel.png",
      "path": "manifest.assets.0.sha256"
    }
  ],
  "warnings": [
    "lesson 'lesson-referensi' masih berstatus draft dan belum boleh dianggap materi produksi",
    "manifest tidak memiliki curriculumRefs; jangan mengklaim kesesuaian kurikulum"
  ]
}
```

### 4. `unsupported-schema.report.json`

```json
{
  "package": null,
  "status": "INVALID",
  "issues": [
    {
      "code": "CONTENT_SCHEMA_UNSUPPORTED",
      "message": "schemaVersion '2.0.0' tidak didukung (harus 1.0.0)",
      "path": "manifest.schemaVersion"
    }
  ],
  "warnings": []
}
```

## Skema laporan

| Field | Tipe | Arti |
|---|---|---|
| `package` | `string \| null` | `manifest.packageId`; `null` jika struktur gagal diparse |
| `status` | `"VALID" \| "INVALID"` | `VALID` hanya jika `issues` kosong |
| `issues[]` | array | `{ code, message, path }`; `path` memakai notasi titik untuk Zod dan kurung untuk pemindaian mentah |
| `warnings[]` | string[] | Tidak menggagalkan validasi (draft, curriculumRefs kosong) |

Kode error: `CONTENT_PACKAGE_INVALID`, `CONTENT_SCHEMA_UNSUPPORTED`, `CONTENT_ASSET_HASH_MISMATCH`, `CONTENT_DEPENDENCY_MISSING`.

## Regenerasi expected (hati-hati)

Expected adalah **golden snapshot**. Regenerasi hanya setelah perubahan validator yang disengaja, dan diff wajib ditinjau manusia:

```bash
for f in valid-package invalid-structure invalid-references unsupported-schema; do
  npx tsx scripts/validate-content.ts "content/fixtures/$f" \
    > "content/fixtures/expected/$f.report.json" || true
done
npm run fixtures:check
```

## Peringatan keamanan

`invalid-structure` sengaja memuat `"script": "alert(1)"` dan path traversal. Fixture ini **hanya** untuk validator; jangan pernah memuatnya di aplikasi, Content Studio, atau build produksi.
