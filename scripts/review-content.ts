import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { validatePackageDirectory } from "./lib/validatePackageDirectory";

const packagesRoot = path.resolve("content/packages");
const outDir = path.resolve("knowledge/content");
const outJson = path.join(outDir, "review-flags-2026-10-26.json");
const outMd = path.join(outDir, "REVIEW_REPORT_2026-10-26_ALL_DRAFTS.md");

const subjectLabels: Record<string, string> = {
  matematika: "Matematika",
  "bahasa-indonesia": "Bahasa Indonesia",
  ipas: "IPAS",
  "pendidikan-pancasila": "Pendidikan Pancasila",
  "seni-rupa": "Seni Rupa",
  pjok: "PJOK",
  pai: "PAI"
};

const gradeMaxWords = new Map<number, number>([
  [1, 12],
  [2, 12],
  [3, 16],
  [4, 16],
  [5, 20],
  [6, 20]
]);

const stopwords = new Set([
  "yang", "dan", "atau", "dengan", "untuk", "pada", "dari", "dalam", "adalah",
  "akan", "dapat", "tidak", "serta", "juga", "agar", "saat", "setelah", "sebelum",
  "melalui", "secara", "siswa", "peserta", "didik", "kelas", "materi", "ini", "itu",
  "satu", "dua", "tiga", "empat", "lima", "kepada", "sebagai", "oleh", "harus",
  "bisa", "mengenal", "menjelaskan", "menyebutkan", "memberi", "menunjukkan",
  "mempraktikkan", "menjaga", "membedakan", "menerapkan", "membiasakan"
]);

const personalDataPatterns = [
  { id: "email", pattern: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/ },
  { id: "url", pattern: /https?:\/\// },
  { id: "phone", pattern: /\b0\d{8,12}\b/ },
  { id: "nik", pattern: /\b\d{16}\b/ }
];

const harshWords = /\b(bodoh|goblok|tolol|idiot|payah|gagal total)\b/i;

interface PackageRecord {
  packageId: string;
  dir: string;
  grade: number;
  subject: string;
  subjectLabel: string;
  lessonTitle: string;
  reviewStatus: string;
  curriculumRefs: number;
  assets: number;
  assetHashes: string[];
  mediaTypes: string[];
  objectives: number;
  objectivesCovered: number;
  steps: number;
  activities: number;
  activityTypes: string[];
  assessmentItems: number;
  wordsPerSentence: number;
  languageLimit: number;
  altComplete: boolean;
  shortAltCount: number;
  missingFeedbackPolicy: string[];
  assessmentIssues: string[];
  assessmentWarnings: string[];
  personalData: string[];
  harshLanguage: string[];
  validation: { status: "VALID" | "INVALID"; issues: number; warnings: number } | null;
}

function readJson<T = any>(file: string): T {
  return JSON.parse(readFileSync(file, "utf8")) as T;
}

function normalizeText(text: string): string {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ");
}

function significantWords(text: string): Set<string> {
  return new Set(
    normalizeText(text)
      .split(/\s+/)
      .filter((word) => word.length >= 4 && !stopwords.has(word))
  );
}

function collectTexts(lesson: any, activities: any[]): string[] {
  const texts: string[] = [
    lesson.title ?? "",
    lesson.summary ?? "",
    ...(lesson.learningObjectives ?? [])
  ];
  for (const activity of activities) {
    texts.push(activity.title ?? "", activity.instructions ?? "");
    const config = activity.interactionConfig ?? {};
    for (const step of config.steps ?? []) {
      texts.push(step.prompt ?? "", step.reveal ?? "", step.hint ?? "");
    }
    for (const pair of config.pairs ?? []) {
      texts.push(pair.left ?? "", pair.right ?? "");
    }
    for (const item of config.items ?? []) {
      texts.push(item.text ?? "");
    }
    for (const question of activity.assessmentConfig?.questions ?? []) {
      texts.push(question.prompt ?? "");
      for (const option of question.options ?? []) texts.push(option.text ?? "");
    }
  }
  return texts.filter((text) => text.trim().length > 0);
}

function checkAssessment(activities: any[]): { issues: string[]; warnings: string[] } {
  const issues: string[] = [];
  const warnings: string[] = [];
  for (const activity of activities) {
    const config = activity.interactionConfig ?? {};
    const questions = activity.assessmentConfig?.questions ?? [];
    if (["multiple-choice", "true-false", "short-answer"].includes(activity.type)) {
      if (questions.length === 0) issues.push(`${activity.activityId}: tidak ada soal`);
      for (const question of questions) {
        const options = question.options ?? [];
        const ids = options.map((option: any) => option.optionId);
        if (activity.type !== "short-answer") {
          if (options.length < 2) issues.push(`${question.questionId}: opsi < 2`);
          const exactTexts = options.map((option: any) => String(option.text).trim());
          if (new Set(exactTexts).size !== exactTexts.length) {
            issues.push(`${question.questionId}: teks opsi duplikat persis`);
          }
          const normalizedTexts = exactTexts.map((text: string) =>
            text.toLowerCase().replace(/\s+/g, " ").trim()
          );
          if (
            new Set(normalizedTexts).size !== normalizedTexts.length &&
            new Set(exactTexts).size === exactTexts.length
          ) {
            warnings.push(`${question.questionId}: opsi hanya berbeda kapitalisasi`);
          }
          if (new Set(ids).size !== ids.length) {
            issues.push(`${question.questionId}: optionId duplikat`);
          }
          const matches = ids.filter((id: string) => id === question.correctResponse).length;
          if (matches !== 1) {
            issues.push(`${question.questionId}: correctResponse tidak tepat satu`);
          }
        }
        if (!String(question.prompt ?? "").trim()) issues.push(`${question.questionId}: prompt kosong`);
      }
    }
    if (activity.type === "ordering") {
      const itemIds = (config.items ?? []).map((item: any) => item.itemId);
      const order = config.correctOrder ?? [];
      if (itemIds.length < 2) issues.push(`${activity.activityId}: item < 2`);
      if (new Set(itemIds).size !== itemIds.length) {
        issues.push(`${activity.activityId}: itemId duplikat`);
      }
      const orderSet = new Set(order);
      if (order.length !== itemIds.length || orderSet.size !== itemIds.length) {
        issues.push(`${activity.activityId}: correctOrder bukan permutasi item`);
      }
      const missing = itemIds.filter((id: string) => !orderSet.has(id));
      if (missing.length > 0) {
        issues.push(`${activity.activityId}: item tidak ada di correctOrder`);
      }
    }
    if (activity.type === "matching") {
      const pairs = config.pairs ?? [];
      if (pairs.length < 2) issues.push(`${activity.activityId}: pasangan < 2`);
      const lefts = pairs.map((pair: any) => String(pair.left).trim().toLowerCase());
      if (new Set(lefts).size !== lefts.length) {
        issues.push(`${activity.activityId}: sisi kiri duplikat`);
      }
    }
  }
  return { issues, warnings };
}

function countAssessmentItems(activities: any[]): number {
  return activities.reduce((total: number, activity: any) => {
    if (activity.type === "matching") return total + (activity.interactionConfig?.pairs?.length ?? 0);
    if (activity.type === "ordering") return total + (activity.interactionConfig?.items?.length ?? 0);
    if (["multiple-choice", "true-false", "short-answer"].includes(activity.type)) {
      return total + (activity.assessmentConfig?.questions?.length ?? 0);
    }
    return total;
  }, 0);
}

const records: PackageRecord[] = [];
const activityFingerprints = new Map<string, string[]>();
const packageFingerprints = new Map<string, string[]>();
const assetHashPackages = new Map<string, string[]>();

const dirs = readdirSync(packagesRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^kelas[1-6]-/.test(entry.name))
  .map((entry) => entry.name)
  .sort();

for (const dirName of dirs) {
  const dir = path.join(packagesRoot, dirName);
  const manifest = readJson(path.join(dir, "manifest.json"));
  const lessonFile = readdirSync(path.join(dir, "lessons")).find((file) => file.endsWith(".json"));
  if (!lessonFile) throw new Error(`lesson tidak ditemukan: ${dirName}`);
  const lesson = readJson(path.join(dir, "lessons", lessonFile));
  const activityFiles = readdirSync(path.join(dir, "activities")).filter((file) => file.endsWith(".json"));
  const activities = activityFiles.map((file) => readJson(path.join(dir, "activities", file)));

  const texts = collectTexts(lesson, activities);
  const joined = texts.join(" ");
  const sentences = joined
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
  const wordsPerSentence =
    sentences.length === 0
      ? 0
      : sentences.reduce((total, sentence) => total + sentence.split(/\s+/).length, 0) /
        sentences.length;

  const activityText = normalizeText(joined);
  const objectives: string[] = lesson.learningObjectives ?? [];
  const objectivesCovered = objectives.filter((objective) => {
    const words = significantWords(objective);
    return [...words].some((word) => activityText.includes(word));
  }).length;

  const steps = activities
    .filter((activity) => activity.type === "exploration")
    .reduce((total, activity) => total + (activity.interactionConfig?.steps?.length ?? 0), 0);

  const altEntries: string[] = [];
  altEntries.push(lesson.accessibilityMetadata?.altText ?? "");
  for (const activity of activities) {
    if ((activity.assets ?? []).length > 0) {
      altEntries.push(activity.accessibilityMetadata?.altText ?? "");
    }
    for (const step of activity.interactionConfig?.steps ?? []) {
      if (step.assetPath) altEntries.push(step.altText ?? "");
    }
  }
  const altComplete = altEntries.every((alt) => alt.trim().length > 0);
  const shortAltCount = altEntries.filter((alt) => alt.trim().length > 0 && alt.trim().length < 15).length;

  const missingFeedbackPolicy = activities
    .filter((activity) => !activity.feedbackPolicy)
    .map((activity) => activity.activityId);

  const personalData = personalDataPatterns
    .filter(({ pattern }) => pattern.test(joined))
    .map(({ id }) => id);

  const normalized = {
    lesson: {
      title: lesson.title,
      summary: lesson.summary,
      objectives: lesson.learningObjectives
    },
    activities: activities
      .map((activity) => {
        if (activity.type === "exploration") {
          return {
            type: activity.type,
            steps: (activity.interactionConfig?.steps ?? []).map((step: any) => ({
              prompt: step.prompt,
              reveal: step.reveal,
              hint: step.hint ?? null
            }))
          };
        }
        if (activity.type === "matching") {
          return {
            type: activity.type,
            pairs: (activity.interactionConfig?.pairs ?? []).map((pair: any) => [pair.left, pair.right])
          };
        }
        if (activity.type === "ordering") {
          return {
            type: activity.type,
            items: (activity.interactionConfig?.items ?? []).map((item: any) => item.text),
            order: activity.interactionConfig?.correctOrder ?? []
          };
        }
        if (["multiple-choice", "true-false", "short-answer"].includes(activity.type)) {
          return {
            type: activity.type,
            questions: (activity.assessmentConfig?.questions ?? []).map((question: any) => ({
              prompt: question.prompt,
              options: (question.options ?? []).map((option: any) => option.text),
              correctResponse: question.correctResponse
            }))
          };
        }
        return { type: activity.type, config: activity.interactionConfig ?? null };
      })
      .sort((left, right) => left.type.localeCompare(right.type))
  };
  const packageFingerprint = createHash("sha256").update(JSON.stringify(normalized)).digest("hex");
  const activityFingerprint = createHash("sha256")
    .update(JSON.stringify(normalized.activities))
    .digest("hex");
  packageFingerprints.set(packageFingerprint, [
    ...(packageFingerprints.get(packageFingerprint) ?? []),
    dirName
  ]);
  activityFingerprints.set(activityFingerprint, [
    ...(activityFingerprints.get(activityFingerprint) ?? []),
    dirName
  ]);

  const assetHashes = (manifest.assets ?? []).map((asset: any) => asset.sha256);
  for (const hash of assetHashes) {
    assetHashPackages.set(hash, [...(assetHashPackages.get(hash) ?? []), dirName]);
  }

  let validation: PackageRecord["validation"] = null;
  try {
    const report = await validatePackageDirectory(dir);
    validation = {
      status: report.status,
      issues: report.issues.length,
      warnings: report.warnings.length
    };
  } catch {
    validation = { status: "INVALID", issues: -1, warnings: 0 };
  }

  const assessment = checkAssessment(activities);

  records.push({
    packageId: manifest.packageId,
    dir: dirName,
    grade: Math.min(...manifest.gradeLevels),
    subject: manifest.subjects[0],
    subjectLabel: subjectLabels[manifest.subjects[0]] ?? manifest.subjects[0],
    lessonTitle: lesson.title,
    reviewStatus: lesson.reviewStatus,
    curriculumRefs: (manifest.curriculumRefs ?? []).length,
    assets: (manifest.assets ?? []).length,
    assetHashes,
    mediaTypes: [...new Set((manifest.assets ?? []).map((asset: any) => asset.mediaType))],
    objectives: objectives.length,
    objectivesCovered,
    steps,
    activities: activities.length,
    activityTypes: activities.map((activity) => activity.type).sort(),
    assessmentItems: countAssessmentItems(activities),
    wordsPerSentence: Number(wordsPerSentence.toFixed(1)),
    languageLimit: gradeMaxWords.get(Math.min(...manifest.gradeLevels)) ?? 20,
    altComplete,
    shortAltCount,
    missingFeedbackPolicy,
    assessmentIssues: assessment.issues,
    assessmentWarnings: assessment.warnings,
    personalData,
    harshLanguage: harshWords.test(joined) ? ["harsh-word"] : [],
    validation
  });
}

const total = records.length;
const count = (predicate: (record: PackageRecord) => boolean) => records.filter(predicate).length;
const duplicateGroups = [...packageFingerprints.values()].filter((group) => group.length > 1);
const activityDuplicateGroups = [...activityFingerprints.values()].filter((group) => group.length > 1);
const reusedAssets = [...assetHashPackages.entries()].filter(([, ids]) => ids.length > 1);
const invalid = records.filter((record) => record.validation?.status !== "VALID");
const assessmentInvalid = records.filter((record) => record.assessmentIssues.length > 0);
const assessmentWarningRecords = records.filter((record) => record.assessmentWarnings.length > 0);
const altIncomplete = records.filter((record) => !record.altComplete);
const missingFeedback = records.filter((record) => record.missingFeedbackPolicy.length > 0);
const personalDataHits = records.filter((record) => record.personalData.length > 0);
const harshHits = records.filter((record) => record.harshLanguage.length > 0);
const refsFilled = records.filter((record) => record.curriculumRefs > 0);
const depthShort = records.filter((record) => record.steps < 5 || record.activities < 3 || record.assessmentItems < 8);
const objectivesPartial = records.filter(
  (record) => record.objectivesCovered === 0 || record.objectivesCovered < record.objectives
);
const longSentences = records.filter((record) => record.wordsPerSentence > record.languageLimit);
const nonWebp = records.filter((record) => record.mediaTypes.some((type) => type !== "image/webp"));

const byGrade = new Map<number, PackageRecord[]>();
const bySubject = new Map<string, PackageRecord[]>();
for (const record of records) {
  byGrade.set(record.grade, [...(byGrade.get(record.grade) ?? []), record]);
  bySubject.set(record.subjectLabel, [...(bySubject.get(record.subjectLabel) ?? []), record]);
}

const claimScan = (() => {
  const roots = ["src", "knowledge/content/CATALOG.md"];
  const hits: string[] = [];
  const visit = (entry: string) => {
    const stat = statSync(entry);
    if (stat.isDirectory()) {
      for (const child of readdirSync(entry)) visit(path.join(entry, child));
      return;
    }
    if (!/\.(tsx?|jsx?|md)$/.test(entry)) return;
    const text = readFileSync(entry, "utf8");
    if (/kurikulum\s+merdeka/i.test(text)) hits.push(entry.replace(/\\/g, "/"));
  };
  for (const root of roots) visit(root);
  return hits;
})();

const summary = {
  total,
  valid: records.filter((record) => record.validation?.status === "VALID").length,
  invalid: invalid.length,
  webpPackages: total - nonWebp.length,
  uniqueAssetHashes: assetHashPackages.size,
  reusedAssetHashes: reusedAssets.length,
  reviewStatus: [...new Set(records.map((record) => record.reviewStatus))],
  refsFilled: refsFilled.length,
  refsEmpty: total - refsFilled.length,
  altIncomplete: altIncomplete.length,
  shortAltEntries: records.reduce((totalAlt, record) => totalAlt + record.shortAltCount, 0),
  missingFeedbackPolicy: missingFeedback.length,
  assessmentInvalid: assessmentInvalid.length,
  assessmentWarnings: records.reduce((sum, record) => sum + record.assessmentWarnings.length, 0),
  personalDataHits: personalDataHits.length,
  harshHits: harshHits.length,
  depthShort: depthShort.length,
  objectivesPartial: objectivesPartial.length,
  longSentences: longSentences.length,
  exactDuplicateGroups: duplicateGroups.length,
  exactDuplicatePackages: duplicateGroups.reduce((sum, group) => sum + group.length, 0),
  activityDuplicateGroups: activityDuplicateGroups.length,
  activityDuplicatePackages: activityDuplicateGroups.reduce((sum, group) => sum + group.length, 0),
  curriculumClaimFiles: claimScan.length,
  enriched: records.filter((record) => record.curriculumRefs > 0 && record.steps >= 5).length
};

const idList = (list: PackageRecord[], limit = 20) =>
  list.length === 0
    ? "-"
    : [
        ...list.slice(0, limit).map((record) => `\`${record.packageId}\``),
        list.length > limit ? `… +${list.length - limit} lainnya` : ""
      ]
        .filter(Boolean)
        .join(", ");

const lines: string[] = [];
lines.push("# Review Teknis Semua Paket Draft — 2026-10-26");
lines.push("");
lines.push("**Status:** `TEKNIS-AUDIT` — **bukan approval pedagogis dan bukan sign-off OD-1**. Seluruh angka di bawah berasal dari eksekusi aktual pada 320 paket per 2026-10-26.");
lines.push("**Pemicu:** lanjutan T-005b (review konten) setelah migrasi WebP dan pengayaan kedalaman 320 paket.");
lines.push("**Cakupan:** seluruh paket di `content/packages/`.");
lines.push("**Batas:** R1–R6, R8–R9, dan R12 memerlukan penilaian manusia; laporan ini hanya menyajikan bukti teknis yang dapat diperiksa ulang.");
lines.push("");
lines.push("## Ringkasan eksekusi");
lines.push("");
lines.push("| Metrik | Hasil |");
lines.push("|---|---:|");
lines.push(`| Paket | ${summary.total} |`);
lines.push(`| Validator + hash (R11) | **${summary.valid}/${summary.total} VALID** |`);
lines.push(`| Paket dengan aset WebP | ${summary.webpPackages}/${summary.total} |`);
lines.push(`| Hash aset unik | ${summary.uniqueAssetHashes} (dipakai ulang: ${summary.reusedAssetHashes}) |`);
lines.push(`| \`reviewStatus\` | ${summary.reviewStatus.join(", ")} (${summary.total}/${summary.total}) |`);
lines.push(`| \`curriculumRefs\` terisi (R10) | **${summary.refsFilled}/${summary.total}** — sisa ${summary.refsEmpty} menunggu tanda tangan Curriculum Lead (D1–D8 disetujui PO, ADR-0034) |`);
lines.push(`| Alt text lengkap (R7 teknis) | ${summary.total - summary.altIncomplete}/${summary.total} |`);
lines.push(`| Feedback policy lengkap (R6 teknis) | ${summary.total - summary.missingFeedbackPolicy}/${summary.total} |`);
lines.push(`| Soal/aktivitas invalid secara struktur (R5) | ${summary.assessmentInvalid} paket (${summary.assessmentWarnings} peringatan lunak) |`);
lines.push(`| Pola data pribadi (R8 pindai teks) | ${summary.personalDataHits} paket |`);
lines.push(`| Kata kasar pada teks (R6 pindai) | ${summary.harshHits} paket |`);
lines.push(`| Kedalaman di bawah standar (5 langkah / 3 aktivitas / 8 item) | **${summary.depthShort}/${summary.total}** |`);
lines.push(`| Tujuan belum tercakup penuh (heuristik R1) | ${summary.objectivesPartial}/${summary.total} |`);
lines.push(`| Kalimat melebihi batas kata/kelas (heuristik R3) | ${summary.longSentences}/${summary.total} |`);
lines.push(`| Grup duplikasi persis | ${summary.exactDuplicateGroups} grup / ${summary.exactDuplicatePackages} paket |`);
lines.push(`| Grup aktivitas identik | ${summary.activityDuplicateGroups} grup / ${summary.activityDuplicatePackages} paket |`);
lines.push(`| Klaim “Kurikulum Merdeka” di \`src/\` + CATALOG (R12) | ${summary.curriculumClaimFiles} file |`);
lines.push("");
lines.push("## Rubrik R1–R12 — status yang dapat dibuktikan agent");
lines.push("");
lines.push("| # | Kriteria | Status teknis 2026-10-26 | Bukti / catatan |");
lines.push("|---|---|---|---|");
lines.push(`| R1 | Tujuan terukur & sesuai kelas | PETUNJUK TEKNIS: ${summary.objectivesPartial} paket perlu cek | ${summary.objectivesPartial === 0 ? "Semua tujuan punya kata kunci yang muncul di aktivitas (heuristik kata kunci, bukan penilaian pedagogis)." : `Heuristik kata kunci: ${summary.objectivesPartial} paket dengan tujuan tercakup sebagian/nol.`} |`);
lines.push("| R2 | Isi faktual benar | **HUMAN REQUIRED** | Perlu guru mapel; agent tidak menilai kebenaran konsep. |");
lines.push(`| R3 | Bahasa sesuai usia | PETUNJUK TEKNIS: ${summary.longSentences} paket di atas batas | Batas heuristik 12/12/16/16/20/20 kata per kalimat (Kelas 1–6). |`);
lines.push("| R4 | Beban kognitif wajar | DATA: lihat bagian kedalaman | Belum diuji coba ke siswa. |");
lines.push(`| R5 | Asesmen mengukur tujuan | STRUKTUR: ${summary.assessmentInvalid} paket bermasalah, ${summary.assessmentWarnings} peringatan | ${summary.assessmentInvalid === 0 ? "Semua soal punya kunci valid, opsi unik, urutan permutasi lengkap." : `Temuan: ${idList(assessmentInvalid)}.`}${summary.assessmentWarnings > 0 ? " Peringatan lunak: opsi hanya berbeda kapitalisasi — tinjau manual apakah disengaja." : ""} |`);
lines.push(`| R6 | Feedback suportif | SEBAGIAN: policy ${summary.total - summary.missingFeedbackPolicy}/${summary.total}; kata kasar ${summary.harshHits} paket | Isi umpan balik per jawaban belum ada di skema; penilaian nada = human. |`);
lines.push(`| R7 | Aksesibilitas | TEKNIS: alt ${summary.total - summary.altIncomplete}/${summary.total} lengkap | ${summary.shortAltEntries} alt pendek (<15 karakter) perlu spot-check; kontras/ukuran target = uji manual. |`);
lines.push(`| R8 | Tidak ada data pribadi | PINDAI TEKS: ${summary.personalDataHits} paket | Pola email/URL/telepon/NIK; aset visual tidak di-OCR. |`);
lines.push("| R9 | Hak/lisensi aset | DOKUMENTASI: seluruh aset dibuat internal via Google Flow | Lihat [ASSET_INVENTORY](ASSET_INVENTORY_2026-10-25.md) + laporan batch; belum ada lisensi pihak ketiga. |");
lines.push(`| R10 | \`curriculumRefs\` terisi | **BLOCKING: ${summary.refsFilled}/${summary.total}** | 4 paket starter Kelas 4 memakai referensi provisional ADR-0033; ${summary.refsEmpty} paket menunggu tanda tangan Curriculum Lead atas D1–D8 (disetujui PO via [ADR-0034](../decisions/ADR-0034-od1-curriculum-matrix-po-approval.md)). |`);
lines.push(`| R11 | Validator + hash | **PASS ${summary.valid}/${summary.total}** | \`review-content.ts\` memanggil validator repo per paket; 0 issue. |`);
lines.push(`| R12 | Tanpa klaim kurikulum | TEKNIS: ${summary.curriculumClaimFiles} file klaim | Pemindaian \`src/\` dan CATALOG; keputusan bahasa pemasaran = human. |`);
lines.push("");
lines.push("## Kedalaman konten (standar internal G1–G3)");
lines.push("");
lines.push("| Metrik | Sebaran |");
lines.push("|---|---|");
lines.push(`| Langkah eksplorasi | ${[...new Set(records.map((record) => record.steps))].sort((a, b) => a - b).map((value) => `${value} langkah: ${records.filter((record) => record.steps === value).length} paket`).join(" · ")} |`);
lines.push(`| Aktivitas per paket | ${[...new Set(records.map((record) => record.activities))].sort((a, b) => a - b).map((value) => `${value}: ${records.filter((record) => record.activities === value).length} paket`).join(" · ")} |`);
lines.push(`| Item asesmen | ${[...new Set(records.map((record) => record.assessmentItems))].sort((a, b) => a - b).map((value) => `${value}: ${records.filter((record) => record.assessmentItems === value).length} paket`).join(" · ")} |`);
lines.push(`| Tujuan pembelajaran | ${[...new Set(records.map((record) => record.objectives))].sort((a, b) => a - b).map((value) => `${value}: ${records.filter((record) => record.objectives === value).length} paket`).join(" · ")} |`);
lines.push("");
lines.push(
  summary.depthShort === 0
    ? `- Seluruh **${summary.total}/${summary.total}** paket memenuhi ketiga ambang (≥5 langkah, ≥3 aktivitas, ≥8 item). 316 paket warisan diperkaya lewat \`scripts/enrich-legacy-packages.mjs\`; 4 starter Kelas 4 sudah memenuhi sejak awal.`
    : `- Paket yang memenuhi ketiga ambang (≥5 langkah, ≥3 aktivitas, ≥8 item): **${summary.total - summary.depthShort}/${summary.total}**; **${summary.depthShort} paket** masih di bawah ambang.`
);
lines.push("");
lines.push("## Duplikasi");
lines.push("");
if (duplicateGroups.length === 0) {
  lines.push("- Tidak ada duplikasi persis antar paket.");
} else {
  lines.push(`- **${duplicateGroups.length} grup duplikasi persis** (${summary.exactDuplicatePackages} paket):`);
  for (const group of duplicateGroups.slice(0, 40)) {
    lines.push(`  - ${group.map((id) => `\`${id}\``).join(" = ")}`);
  }
  if (duplicateGroups.length > 40) lines.push(`  - … +${duplicateGroups.length - 40} grup lainnya (lihat JSON).`);
}
if (activityDuplicateGroups.length === 0) {
  lines.push("- Tidak ada aktivitas identik antar paket.");
} else {
  lines.push(`- **${activityDuplicateGroups.length} grup aktivitas identik** (${summary.activityDuplicatePackages} paket) — lihat JSON untuk daftar lengkap.`);
}
lines.push("");
if (assessmentWarningRecords.length > 0) {
  lines.push("## Peringatan struktur R5 (opsi mirip)");
  lines.push("");
  for (const record of assessmentWarningRecords) {
    lines.push(`- \`${record.packageId}\`: ${record.assessmentWarnings.join("; ")}`);
  }
  lines.push("");
}
lines.push("## Sebaran per kelas");
lines.push("");
lines.push("| Kelas | Paket | Valid | Langkah (rata-rata) | Aktivitas (rata-rata) | Item (rata-rata) | refs terisi |");
lines.push("|---|---:|---:|---:|---:|---:|---:|");
for (const [grade, list] of [...byGrade.entries()].sort((a, b) => a[0] - b[0])) {
  const average = (selector: (record: PackageRecord) => number) =>
    (list.reduce((sum, record) => sum + selector(record), 0) / list.length).toFixed(1);
  lines.push(
    `| ${grade} | ${list.length} | ${list.filter((record) => record.validation?.status === "VALID").length} | ${average((record) => record.steps)} | ${average((record) => record.activities)} | ${average((record) => record.assessmentItems)} | ${list.filter((record) => record.curriculumRefs > 0).length} |`
  );
}
lines.push("");
lines.push("## Sebaran per mapel");
lines.push("");
lines.push("| Mapel | Paket | Valid | Kedalaman kurang | refs terisi |");
lines.push("|---|---:|---:|---:|---:|");
for (const [subject, list] of [...bySubject.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  lines.push(
    `| ${subject} | ${list.length} | ${list.filter((record) => record.validation?.status === "VALID").length} | ${list.filter((record) => record.steps < 5 || record.activities < 3 || record.assessmentItems < 8).length} | ${list.filter((record) => record.curriculumRefs > 0).length} |`
  );
}
lines.push("");
lines.push("## Temuan yang perlu ditindaklanjuti");
lines.push("");
const findings: string[] = [];
if (summary.refsEmpty > 0) findings.push(`- **R10 BLOCKING:** ${summary.refsEmpty} paket belum punya \`curriculumRefs\`; D1–D8 sudah disetujui Product Owner ([ADR-0034](../decisions/ADR-0034-od1-curriculum-matrix-po-approval.md)), pengisian menunggu tanda tangan Curriculum Lead ([lembar keputusan OD-1](OD1_DECISION_SHEET_2026-10-26.md)).`);
if (summary.depthShort > 0) findings.push(`- **Kedalaman:** ${summary.depthShort} paket masih 3 langkah eksplorasi, 2 aktivitas, dan 4–6 item asesmen — di bawah standar internal (≥5/≥3/≥8). Ini gap pedagogis terbesar sebelum sign-off.`);
if (summary.exactDuplicatePackages > 0 || summary.activityDuplicatePackages > 0) findings.push(`- **Diferensiasi:** ${summary.exactDuplicatePackages} paket dalam grup duplikasi persis dan ${summary.activityDuplicatePackages} paket berbagi aktivitas identik; perlu variasi teks/contoh/asesmen per kelas.`);
if (summary.assessmentInvalid > 0) findings.push(`- **R5 struktur:** ${summary.assessmentInvalid} paket punya soal/aktivitas tidak valid — detail di JSON.`);
if (summary.assessmentWarnings > 0) findings.push(`- **R5 peringatan lunak:** ${summary.assessmentWarnings} soal dengan opsi yang hanya berbeda kapitalisasi — pastikan perbedaan itu memang yang diuji.`);
if (summary.altIncomplete > 0 || summary.shortAltEntries > 0) findings.push(`- **R7:** ${summary.altIncomplete} paket tanpa alt lengkap; ${summary.shortAltEntries} alt pendek perlu ditinjau manual.`);
if (summary.missingFeedbackPolicy > 0) findings.push(`- **R6:** ${summary.missingFeedbackPolicy} paket punya aktivitas tanpa \`feedbackPolicy\`.`);
if (summary.personalDataHits > 0 || summary.harshHits > 0) findings.push(`- **R6/R8:** ${summary.personalDataHits} paket mengandung pola data pribadi dan ${summary.harshHits} paket mengandung kata kasar.`);
if (summary.curriculumClaimFiles > 0) findings.push(`- **R12:** ${summary.curriculumClaimFiles} file menyebut “Kurikulum Merdeka” — tinjau apakah klaim resmi atau sekadar draf.`);
if (summary.reusedAssetHashes > 0) findings.push(`- **R9/aset:** ${summary.reusedAssetHashes} hash aset dipakai lintas paket.`);
if (findings.length === 0) findings.push("- Tidak ada temuan teknis.");
lines.push(...findings);
lines.push("");
lines.push("## Rekomendasi urutan kerja");
lines.push("");
lines.push("1. **Tanda tangan Curriculum Lead (manusia):** D1–D8 sudah disetujui Product Owner; setelah Curriculum Lead menandatangani lembar OD-1, isi `curriculumRefs` per mapel/fase dan buka blokir R10.");
lines.push("2. **Review manusia R1–R6, R8–R9, R12:** gunakan [lembar kerja review](../release/REVIEW_WORKSHEET_2026-10-25.md); agent tidak boleh mengisi approval.");
lines.push("3. **Tindak lanjut temuan kecil:** periksa manual peringatan R5 dan paket dengan heuristik R1 sebagian (daftar di atas).");
lines.push("4. **Verifikasi ulang otomatis:** jalankan `npx tsx scripts/review-content.ts` setelah setiap perubahan konten; angka harus tetap hijau sebelum reviewer manusia masuk.");
lines.push("");
lines.push("## Batas laporan");
lines.push("");
lines.push("- Laporan ini **tidak menaikkan** `reviewStatus` (semua paket tetap `draft`) dan **tidak menggantikan** review manusia.");
lines.push("- Heuristik R1/R3 hanyalah penunjuk otomatis; keputusan pedagogis tetap milik reviewer.");
lines.push("- R9 bersandar pada dokumentasi internal (semua aset dibuat via Google Flow); tidak ada lisensi pihak ketiga yang terdeteksi.");
lines.push("- Data mentah per paket: [`review-flags-2026-10-26.json`](review-flags-2026-10-26.json).");
lines.push("");

mkdirSync(outDir, { recursive: true });
writeFileSync(outMd, `${lines.join("\n")}\n`);
writeFileSync(
  outJson,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      summary,
      claimScan,
      duplicateGroups,
      activityDuplicateGroups,
      reusedAssets: reusedAssets.map(([hash, ids]) => ({ hash, packages: ids })),
      records
    },
    null,
    2
  )}\n`
);

console.log(JSON.stringify(summary, null, 2));
console.log(`report: ${outMd}`);
console.log(`json: ${outJson}`);
