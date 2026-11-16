#!/usr/bin/env node
/**
 * PRA-REVIEW AGENT — mengumpulkan bukti untuk reviewer manusia.
 * Skrip ini TIDAK memberi PASS/FAIL, tidak menaikkan reviewStatus, dan tidak
 * menggantikan penilaian R1–R6, R8–R9, R12 oleh reviewer manusia.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { detectExplorationCopies } from "./lib/mirrorPairs.mjs";
import { ensureWritable, parseReviewArgs } from "./lib/reviewOutput.mjs";

const packagesRoot = path.resolve("content/packages");
const { date, outDir, force } = parseReviewArgs(process.argv.slice(2));
const outMd = path.join(outDir, `PEDAGOGICAL_PREREVIEW_${date}.md`);
const outSample = path.join(outDir, `PEDAGOGICAL_SAMPLE_${date}.md`);
const outJson = path.join(outDir, `prereview-evidence-${date}.json`);
const outCsv = path.join(outDir, `prereview-flags-${date}.csv`);

const subjectLabels = {
  matematika: "Matematika",
  "bahasa-indonesia": "Bahasa Indonesia",
  ipas: "IPAS",
  "pendidikan-pancasila": "Pendidikan Pancasila",
  "seni-rupa": "Seni Rupa",
  pjok: "PJOK",
  pai: "PAI"
};

const subjectOrder = [
  "bahasa-indonesia",
  "matematika",
  "ipas",
  "pendidikan-pancasila",
  "pai",
  "pjok",
  "seni-rupa"
];

const gradeSentenceLimit = new Map([
  [1, 12],
  [2, 12],
  [3, 16],
  [4, 16],
  [5, 20],
  [6, 20]
]);

const gradeMinuteBudget = new Map([
  [1, 15],
  [2, 15],
  [3, 20],
  [4, 20],
  [5, 25],
  [6, 25]
]);

const stopwords = new Set([
  "yang", "dan", "atau", "dengan", "untuk", "pada", "dari", "dalam", "adalah",
  "akan", "dapat", "tidak", "serta", "juga", "agar", "saat", "setelah", "sebelum",
  "melalui", "secara", "siswa", "peserta", "didik", "kelas", "materi", "ini", "itu",
  "satu", "dua", "tiga", "empat", "lima", "kepada", "sebagai", "oleh", "harus",
  "bisa", "mengenal", "menjelaskan", "menyebutkan", "memberi", "menunjukkan",
  "mempraktikkan", "menjaga", "membedakan", "menerapkan", "membiasakan",
  "tentang", "secara", "sederhana", "sehari", "hari", "dengan", "secara"
]);

const personalDataPatterns = [
  { id: "email", pattern: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/ },
  { id: "url", pattern: /https?:\/\// },
  { id: "telepon", pattern: /\b0\d{8,12}\b/ },
  { id: "nik", pattern: /\b\d{16}\b/ }
];

const sensitivePatterns = [
  { id: "alamat-rumah", pattern: /\balamat\s+(rumah|tinggal)\b/i },
  { id: "nomor-kontak", pattern: /\b(nomor|no\.?)\s*(telepon|hp|handphone|whatsapp|wa)\b/i },
  { id: "tanggal-lahir", pattern: /\btanggal\s+lahir\b/i },
  { id: "nisn", pattern: /\bnisn\b/i },
  { id: "foto-siswa", pattern: /\bfoto\s+(siswa|murid|anak)\b/i },
  { id: "media-sosial", pattern: /\b(instagram|facebook|tiktok|twitter)\b/i }
];

const harshWords = /\b(bodoh|goblok|tolol|idiot|payah|gagal total)\b/i;
const negativeTone = /\b(salah|keliru|gagal|buruk|jelek|tidak bisa|malas)\b/gi;

const curriculumClaimPatterns = [
  { id: "kurikulum-merdeka", pattern: /kurikulum\s+merdeka/i },
  { id: "sesuai-kurikulum", pattern: /sesuai\s+kurikulum/i },
  { id: "kurikulum-2013", pattern: /kurikulum\s+2013|\bK-?13\b/i },
  { id: "capaian-pembelajaran", pattern: /capai(an)?\s+pembelajaran/i }
];

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function normalizeText(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ");
}

function significantWords(text) {
  return new Set(
    normalizeText(text)
      .split(/\s+/)
      .filter((word) => word.length >= 4 && !stopwords.has(word))
  );
}

function countWords(text) {
  const trimmed = String(text ?? "").trim();
  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
}

function splitSentences(text) {
  return String(text ?? "")
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
}

function collectTextParts(activity) {
  const parts = [activity.title ?? "", activity.instructions ?? ""];
  const config = activity.interactionConfig ?? {};
  for (const step of config.steps ?? []) parts.push(step.prompt ?? "", step.reveal ?? "", step.hint ?? "");
  for (const pair of config.pairs ?? []) parts.push(pair.left ?? "", pair.right ?? "");
  for (const item of config.items ?? []) parts.push(item.text ?? "");
  for (const question of activity.assessmentConfig?.questions ?? []) {
    parts.push(question.prompt ?? "");
    for (const option of question.options ?? []) parts.push(option.text ?? "");
  }
  return parts.filter((part) => String(part).trim().length > 0);
}

function activityText(activity) {
  return collectTextParts(activity).join(" ");
}

function collectAssessmentItems(activities) {
  const items = [];
  for (const activity of activities) {
    const questions = activity.assessmentConfig?.questions ?? [];
    for (const question of questions) {
      items.push({
        activityId: activity.activityId,
        kind: activity.type,
        id: question.questionId,
        prompt: question.prompt ?? "",
        options: (question.options ?? []).map((option) => option.text ?? ""),
        correctResponse: question.correctResponse ?? null
      });
    }
    if (activity.type === "matching") {
      for (const pair of activity.interactionConfig?.pairs ?? []) {
        items.push({
          activityId: activity.activityId,
          kind: "matching",
          id: `${activity.activityId}:${pair.left}`,
          prompt: `${pair.left} ↔ ${pair.right}`,
          options: [],
          correctResponse: null
        });
      }
    }
    if (activity.type === "ordering") {
      const itemsList = activity.interactionConfig?.items ?? [];
      itemsList.forEach((item, index) => {
        items.push({
          activityId: activity.activityId,
          kind: "ordering",
          id: `${activity.activityId}:${item.itemId}`,
          prompt: item.text ?? "",
          options: [],
          correctResponse: null,
          correctPosition: index + 1
        });
      });
    }
  }
  return items;
}

function bestObjectiveMatch(text, objectives) {
  const words = significantWords(text);
  let best = { index: -1, overlap: 0 };
  objectives.forEach((objective, index) => {
    const objectiveWords = objective.words;
    let overlap = 0;
    for (const word of words) if (objectiveWords.has(word)) overlap += 1;
    if (overlap > best.overlap) best = { index, overlap };
  });
  return best;
}

function detectPositionBias(activities) {
  const positions = [];
  let longestCorrect = 0;
  let optionQuestions = 0;
  for (const activity of activities) {
    if (!["multiple-choice", "true-false"].includes(activity.type)) continue;
    for (const question of activity.assessmentConfig?.questions ?? []) {
      const options = question.options ?? [];
      if (options.length < 2) continue;
      const index = options.findIndex((option) => option.optionId === question.correctResponse);
      if (index >= 0) positions.push(index);
      optionQuestions += 1;
      const lengths = options.map((option) => String(option.text ?? "").trim().length);
      const maxLength = Math.max(...lengths);
      const correctIndex = options.findIndex((option) => option.optionId === question.correctResponse);
      if (correctIndex >= 0 && lengths[correctIndex] === maxLength && lengths.filter((len) => len === maxLength).length === 1) {
        longestCorrect += 1;
      }
    }
  }
  if (positions.length === 0) {
    return { questions: 0, modalShare: null, modalIndex: null, longestCorrectRatio: null };
  }
  const counts = new Map();
  for (const position of positions) counts.set(position, (counts.get(position) ?? 0) + 1);
  const [modalIndex, modalCount] = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0];
  return {
    questions: optionQuestions,
    modalShare: Number((modalCount / positions.length).toFixed(2)),
    modalIndex,
    longestCorrectRatio: Number((longestCorrect / optionQuestions).toFixed(2))
  };
}

function scanFile(file, patterns) {
  const text = readFileSync(file, "utf8");
  const hits = [];
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const { id, pattern } of patterns) {
      if (pattern.test(line)) hits.push({ id, line: index + 1, text: line.trim().slice(0, 200) });
    }
  });
  return hits;
}

function walkFiles(root, extensions) {
  const files = [];
  const stat = statSync(root);
  if (!stat.isDirectory()) return [root];
  for (const child of readdirSync(root)) {
    if (child === "node_modules" || child === "dist" || child === ".git") continue;
    const entry = path.join(root, child);
    const entryStat = statSync(entry);
    if (entryStat.isDirectory()) files.push(...walkFiles(entry, extensions));
    else if (extensions.some((extension) => entry.endsWith(extension))) files.push(entry);
  }
  return files;
}

const dirs = readdirSync(packagesRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^kelas[1-6]-/.test(entry.name))
  .map((entry) => entry.name)
  .sort();

const records = [];

for (const dirName of dirs) {
  const dir = path.join(packagesRoot, dirName);
  const manifest = readJson(path.join(dir, "manifest.json"));
  const lessonFile = readdirSync(path.join(dir, "lessons")).find((file) => file.endsWith(".json"));
  if (!lessonFile) throw new Error(`lesson tidak ditemukan: ${dirName}`);
  const lesson = readJson(path.join(dir, "lessons", lessonFile));
  const activities = readdirSync(path.join(dir, "activities"))
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => readJson(path.join(dir, "activities", file)));

  const grade = Math.min(...manifest.gradeLevels);
  const subject = manifest.subjects[0];
  const sentenceLimit = gradeSentenceLimit.get(grade) ?? 20;
  const minuteBudget = gradeMinuteBudget.get(grade) ?? 20;

  const objectives = (lesson.learningObjectives ?? []).map((text) => ({
    text,
    words: significantWords(text)
  }));

  const activityTexts = activities.map((activity) => ({
    activityId: activity.activityId,
    type: activity.type,
    text: activityText(activity)
  }));

  const objectiveEvidence = objectives.map((objective) => {
    const matchedWords = [];
    const matchedActivities = [];
    for (const word of objective.words) {
      const inAny = activityTexts.some((entry) => normalizeText(entry.text).includes(word));
      if (inAny) matchedWords.push(word);
    }
    for (const entry of activityTexts) {
      const text = normalizeText(entry.text);
      let overlap = 0;
      for (const word of objective.words) if (text.includes(word)) overlap += 1;
      if (overlap >= 2) matchedActivities.push({ activityId: entry.activityId, overlap });
    }
    const coverage = objective.words.size === 0 ? null : matchedWords.length / objective.words.size;
    return {
      text: objective.text,
      wordCount: objective.words.size,
      matchedWords,
      coverage: coverage === null ? null : Number(coverage.toFixed(2)),
      activitiesWithAtLeastTwoMatches: matchedActivities
    };
  });

  const lowCoverageObjectives = objectiveEvidence.filter(
    (entry) => entry.coverage !== null && entry.coverage < 0.5
  );
  const objectivesManual = objectiveEvidence.filter((entry) => entry.coverage === null);
  const objectivesWithoutFocus = objectiveEvidence.filter(
    (entry) => entry.coverage !== null && entry.activitiesWithAtLeastTwoMatches.length === 0
  );

  const textParts = [
    lesson.title ?? "",
    lesson.summary ?? "",
    ...(lesson.learningObjectives ?? []),
    ...activities.flatMap(collectTextParts)
  ].filter((part) => String(part).trim().length > 0);
  const allText = textParts.join(" ");

  const sentences = textParts.flatMap(splitSentences);
  const sentenceStats = sentences.map((sentence) => ({
    text: sentence,
    words: countWords(sentence)
  }));
  const longSentences = sentenceStats
    .filter((entry) => entry.words > sentenceLimit)
    .sort((a, b) => b.words - a.words);
  const avgSentenceWords =
    sentenceStats.length === 0
      ? 0
      : sentenceStats.reduce((sum, entry) => sum + entry.words, 0) / sentenceStats.length;
  const totalWords = countWords(allText);
  const longWords = [...new Set(
    normalizeText(allText)
      .split(/\s+/)
      .filter((word) => word.length >= 13)
  )].sort();

  const steps = activities
    .filter((activity) => activity.type === "exploration")
    .reduce((sum, activity) => sum + (activity.interactionConfig?.steps?.length ?? 0), 0);
  const assessmentItems = collectAssessmentItems(activities);
  const pairs = activities.reduce((sum, activity) => sum + (activity.interactionConfig?.pairs?.length ?? 0), 0);
  const orderingItems = activities
    .filter((activity) => activity.type === "ordering")
    .reduce((sum, activity) => sum + (activity.interactionConfig?.items?.length ?? 0), 0);
  const questionCount = activities.reduce(
    (sum, activity) => sum + (activity.assessmentConfig?.questions?.length ?? 0),
    0
  );
  const revealCount = activities
    .filter((activity) => activity.type === "exploration")
    .flatMap((activity) => activity.interactionConfig?.steps ?? [])
    .filter((step) => String(step.reveal ?? "").trim().length > 0).length;
  const readingMinutes = totalWords / 100;
  const estimatedMinutes = Number(
    (
      readingMinutes +
      steps * 0.75 +
      questionCount * 0.5 +
      pairs * 0.5 +
      orderingItems * 0.5 +
      activities.length * 0.5
    ).toFixed(1)
  );

  const objectiveMatches = assessmentItems.map((item) => bestObjectiveMatch(item.prompt, objectives));
  const unmappedItems = assessmentItems.filter((_, index) => objectiveMatches[index].overlap === 0);
  const perObjectiveItems = objectives.map((_, index) =>
    objectiveMatches.filter((match) => match.index === index && match.overlap > 0).length
  );
  const objectivesWithoutItems = objectives
    .map((objective, index) => ({ text: objective.text, items: perObjectiveItems[index] }))
    .filter((entry) => entry.items === 0);
  const positionBias = detectPositionBias(activities);
  const unmappedRatio =
    assessmentItems.length === 0 ? 0 : Number((unmappedItems.length / assessmentItems.length).toFixed(2));
  const objectiveUncoveredShare =
    objectives.length === 0 ? 0 : Number((objectivesWithoutItems.length / objectives.length).toFixed(2));

  const explorationStepList = activities
    .filter((activity) => activity.type === "exploration")
    .flatMap((activity) => activity.interactionConfig?.steps ?? []);
  const matchingPairList = activities
    .filter((activity) => activity.type === "matching")
    .flatMap((activity) => activity.interactionConfig?.pairs ?? []);
  const mirroredPairs = matchingPairList.filter((pair) =>
    explorationStepList.some(
      (step) =>
        String(step.prompt ?? "").trim() === String(pair.left ?? "").trim() &&
        String(step.reveal ?? "").trim() === String(pair.right ?? "").trim()
    )
  );
  const matchingMirrorShare =
    matchingPairList.length === 0
      ? null
      : Number((mirroredPairs.length / matchingPairList.length).toFixed(2));
  const explorationCopies = detectExplorationCopies(activities);

  const feedbackPolicies = activities.map((activity) => ({
    activityId: activity.activityId,
    type: activity.type,
    mode: activity.feedbackPolicy?.mode ?? null,
    allowRetry: activity.feedbackPolicy?.allowRetry ?? null,
    showCorrectAnswer: activity.feedbackPolicy?.showCorrectAnswer ?? null
  }));
  const feedbackPolicyComplete = feedbackPolicies.every(
    (policy) => policy.mode !== null && policy.allowRetry !== null && policy.showCorrectAnswer !== null
  );
  const explorationSteps = activities
    .filter((activity) => activity.type === "exploration")
    .flatMap((activity) => activity.interactionConfig?.steps ?? []);
  const hintCoverage =
    explorationSteps.length === 0
      ? null
      : Number(
          (
            explorationSteps.filter((step) => String(step.hint ?? "").trim().length > 0).length /
            explorationSteps.length
          ).toFixed(2)
        );
  const toneHits = [];
  for (const sentence of sentences) {
    const matches = sentence.match(negativeTone);
    if (matches) toneHits.push({ text: sentence.slice(0, 160), words: [...new Set(matches.map((word) => word.toLowerCase()))] });
  }

  const personalData = personalDataPatterns
    .filter(({ pattern }) => pattern.test(allText))
    .map(({ id }) => id);
  const sensitiveHits = sensitivePatterns
    .filter(({ pattern }) => pattern.test(allText))
    .map(({ id }) => id);
  const harshHit = harshWords.test(allText);

  const assetPaths = (manifest.assets ?? []).map((asset) => asset.path);
  const missingAssetFiles = assetPaths.filter((assetPath) => !statSync(path.join(dir, assetPath), { throwIfNoEntry: false }));
  const externalUrls = /https?:\/\//.test(
    JSON.stringify([manifest, lesson, ...activities])
  );
  const assetIssues = [
    ...missingAssetFiles.map((assetPath) => `file hilang: ${assetPath}`),
    ...(externalUrls ? ["URL eksternal di JSON paket"] : [])
  ];

  const flags = [];
  if (lowCoverageObjectives.length > 0)
    flags.push(`R1 ${lowCoverageObjectives.length} tujuan cakupan kata kunci < 0.5`);
  if (objectivesManual.length > 0)
    flags.push(`R1 ${objectivesManual.length} tujuan tanpa kata bermakna (cek manual)`);
  if (longSentences.length > 0) flags.push(`R3 ${longSentences.length} kalimat > ${sentenceLimit} kata`);
  if (estimatedMinutes > minuteBudget) flags.push(`R4 estimasi ${estimatedMinutes} menit > anggaran ${minuteBudget}`);
  if (estimatedMinutes < 5) flags.push(`R4 estimasi ${estimatedMinutes} menit < 5`);
  if (matchingPairList.length > 0 && mirroredPairs.length === matchingPairList.length)
    flags.push(`R5 ${mirroredPairs.length}/${matchingPairList.length} pasangan matching identik dengan langkah eksplorasi`);
  if (positionBias.questions >= 3 && positionBias.modalShare === 1) flags.push("R5 semua kunci pada posisi yang sama");
  if (positionBias.questions >= 3 && positionBias.longestCorrectRatio === 1) flags.push("R5 kunci selalu opsi terpanjang");
  if (!feedbackPolicyComplete) flags.push("R6 feedbackPolicy tidak lengkap");
  if (hintCoverage !== null && hintCoverage < 1) flags.push(`R6 hint hanya ${hintCoverage * 100}% langkah`);
  if (personalData.length > 0) flags.push(`R8 pola data pribadi: ${personalData.join(", ")}`);
  if (sensitiveHits.length > 0) flags.push(`R8 pola sensitif: ${sensitiveHits.join(", ")}`);
  if (assetIssues.length > 0) flags.push(`R9 ${assetIssues.join("; ")}`);
  if (harshHit) flags.push("R6 kata kasar terdeteksi");

  records.push({
    packageId: manifest.packageId,
    dir: dirName,
    grade,
    subject,
    subjectLabel: subjectLabels[subject] ?? subject,
    lessonTitle: lesson.title,
    reviewStatus: lesson.reviewStatus,
    objectives: objectiveEvidence,
    lowCoverageObjectives,
    objectivesManual,
    objectivesWithoutFocus,
    language: {
      sentenceLimit,
      totalWords,
      sentenceCount: sentenceStats.length,
      avgWordsPerSentence: Number(avgSentenceWords.toFixed(1)),
      maxWordsPerSentence: sentenceStats.reduce((max, entry) => Math.max(max, entry.words), 0),
      longSentences,
      longWords
    },
    load: {
      steps,
      activities: activities.length,
      activityTypes: activities.map((activity) => activity.type).sort(),
      assessmentItems: assessmentItems.length,
      estimatedMinutes,
      minuteBudget
    },
    assessment: {
      items: assessmentItems.length,
      unmappedItems,
      unmappedRatio,
      perObjectiveItems,
      objectivesWithoutItems,
      objectiveUncoveredShare,
      matchingPairs: matchingPairList.length,
      mirroredPairs: mirroredPairs.length,
      matchingMirrorShare,
      explorationCopies: explorationCopies.length,
      explorationCopyDetails: explorationCopies,
      positionBias,
      detail: assessmentItems.map((item, index) => ({
        ...item,
        objectiveIndex: objectiveMatches[index].index,
        overlap: objectiveMatches[index].overlap
      }))
    },
    feedback: {
      policies: feedbackPolicies,
      policyComplete: feedbackPolicyComplete,
      hintCoverage,
      toneHits
    },
    r8: { personalData, sensitiveHits },
    r2: {
      reveals: revealCount,
      questions: questionCount,
      pairs,
      orderingItems,
      claims: revealCount + questionCount + pairs + orderingItems
    },
    r9: { assets: assetPaths.length, missingAssetFiles, externalUrls },
    flags
  });
}

const total = records.length;
const flagCount = (prefix) => records.filter((record) => record.flags.some((flag) => flag.startsWith(prefix))).length;

const curriculumSurfaces = [
  "src",
  "index.html",
  "README.md",
  "knowledge/content/CATALOG.md",
  "package.json"
]
  .filter((entry) => statSync(entry, { throwIfNoEntry: false }))
  .flatMap((entry) => walkFiles(entry, [".ts", ".tsx", ".js", ".jsx", ".md", ".html", ".json"]));

const curriculumClaims = [];
for (const file of curriculumSurfaces) {
  const hits = scanFile(file, curriculumClaimPatterns);
  if (hits.length > 0) curriculumClaims.push({ file: file.replace(/\\/g, "/"), hits });
}

const paiLabelFiles = [];
for (const file of curriculumSurfaces) {
  const text = readFileSync(file, "utf8");
  if (/\bPAI\b/.test(text) && !/Pendidikan Agama Islam/.test(text)) {
    paiLabelFiles.push(file.replace(/\\/g, "/"));
  }
}

const sampleCells = new Map();
for (const record of records) {
  const key = `${record.grade}:${record.subject}`;
  sampleCells.set(key, [...(sampleCells.get(key) ?? []), record]);
}
const sample = [...sampleCells.entries()]
  .map(([key, list]) => {
    const sorted = [...list].sort((a, b) => a.packageId.localeCompare(b.packageId));
    const picked = sorted[Math.floor(sorted.length / 2)];
    return { key, record: picked };
  })
  .sort((a, b) => {
    const [gradeA, subjectA] = a.key.split(":");
    const [gradeB, subjectB] = b.key.split(":");
    return (
      Number(gradeA) - Number(gradeB) ||
      subjectOrder.indexOf(subjectA) - subjectOrder.indexOf(subjectB)
    );
  });

const byGrade = new Map();
const bySubject = new Map();
for (const record of records) {
  byGrade.set(record.grade, [...(byGrade.get(record.grade) ?? []), record]);
  bySubject.set(record.subject, [...(bySubject.get(record.subject) ?? []), record]);
}

const priority = [...records]
  .map((record) => ({ record, score: record.flags.length }))
  .filter((entry) => entry.score > 0)
  .sort((a, b) => b.score - a.score || a.record.packageId.localeCompare(b.record.packageId));

const md = [];
md.push("# Pra-Review Pedagogis Agent — " + date);
md.push("");
md.push("**Status:** `PRA-REVIEW AGENT — BUKAN APPROVAL`. Laporan ini mengumpulkan bukti untuk reviewer manusia; **tidak ada PASS/FAIL**, **tidak ada** perubahan `reviewStatus`, dan **bukan** pengganti penilaian R1–R6, R8–R9, R12.");
md.push(`**Cakupan:** ${total} paket draft (\`content/packages/\`).`);
md.push("**Rubrik:** [REVIEW_RUBRIC.md](REVIEW_RUBRIC.md) · **Lembar kerja:** [REVIEW_WORKSHEET_2026-10-25.md](../release/REVIEW_WORKSHEET_2026-10-25.md)");
md.push(`**Berkas pendamping:** [sampel baca stratifikasi](PEDAGOGICAL_SAMPLE_${date}.md) · [bukti per paket (JSON)](prereview-evidence-${date}.json) · [flag per paket (CSV)](prereview-flags-${date}.csv)`);
md.push("");
md.push("## Batas peran");
md.push("");
md.push("| Kriteria | Yang dilakukan agent | Yang wajib diputuskan manusia |");
md.push("|---|---|---|");
md.push("| R1 | Menghitung cakupan kata kunci tujuan → aktivitas | Apakah tujuan terukur dan sesuai kelas |");
md.push("| R2 | Menyiapkan daftar jawaban/klaim faktual untuk dibaca | Kebenaran konsep per mapel |");
md.push("| R3 | Mengukur panjang kalimat/kata + estimasi waktu baca | Kesesuaian bahasa dengan usia |");
md.push("| R4 | Menghitung langkah/aktivitas/item + estimasi durasi | Kewajaran beban kognitif (butuh uji coba) |");
md.push("| R5 | Memetakan soal → tujuan, bias posisi kunci, item tak terpetakan | Validitas asesmen terhadap tujuan |");
md.push("| R6 | Memeriksa `feedbackPolicy`, cakupan hint, pindai nada negatif | Apakah umpan balik suportif dan tidak mempermalukan |");
md.push("| R8 | Pindai regex data pribadi/konten sensitif pada teks | Apakah ada data pribadi/konteks sensitif yang lolos |");
md.push("| R9 | Memeriksa keberadaan file aset, URL eksternal, jumlah aset | Kejelasan hak/lisensi tiap aset |");
md.push("| R12 | Memindai klaim kurikulum di permukaan pengguna | Apakah klaim pemasaran boleh dipakai |");
md.push("");
md.push(`## Ringkasan temuan (${total} paket)`);
md.push("");
md.push("| Kriteria | Paket dengan flag | Temuan utama |");
md.push("|---|---:|---|");
md.push(`| R1 | ${flagCount("R1")} | ${records.reduce((sum, record) => sum + record.lowCoverageObjectives.length, 0)} tujuan cakupan kata kunci < 0.5; ${records.reduce((sum, record) => sum + record.objectivesManual.length, 0)} tujuan tanpa kata bermakna (cek manual) |`);
md.push(`| R3 | ${flagCount("R3")} | ${records.reduce((sum, record) => sum + record.language.longSentences.length, 0)} kalimat melebihi batas kata/kelas |`);
md.push(`| R4 | ${flagCount("R4")} | ${records.filter((record) => record.load.estimatedMinutes > record.load.minuteBudget).length} paket di atas anggaran menit; ${records.filter((record) => record.load.estimatedMinutes < 5).length} di bawah 5 menit |`);
md.push(`| R5 | ${flagCount("R5")} | ${records.filter((record) => record.assessment.matchingPairs > 0 && record.assessment.mirroredPairs === record.assessment.matchingPairs).length} paket matching identik penuh dengan eksplorasi; ${records.filter((record) => record.assessment.positionBias.questions >= 3 && record.assessment.positionBias.modalShare === 1).length} paket semua kunci di posisi sama; ${records.reduce((sum, record) => sum + record.assessment.unmappedItems.length, 0)} item tak terpetakan (kata kunci) |`);
md.push(`| R6 | ${flagCount("R6")} | Policy lengkap ${records.filter((record) => record.feedback.policyComplete).length}/${total}; hint lengkap ${records.filter((record) => record.feedback.hintCoverage === 1).length}/${total}; nada negatif ${records.filter((record) => record.feedback.toneHits.length > 0).length} paket |`);
md.push(`| R8 | ${flagCount("R8")} | Pola data pribadi ${records.filter((record) => record.r8.personalData.length > 0).length} paket; pola sensitif ${records.filter((record) => record.r8.sensitiveHits.length > 0).length} paket |`);
md.push(`| R9 | ${flagCount("R9")} | File aset hilang ${records.reduce((sum, record) => sum + record.r9.missingAssetFiles.length, 0)}; paket dengan URL eksternal ${records.filter((record) => record.r9.externalUrls).length} |`);
md.push(`| R12 | ${curriculumClaims.length + paiLabelFiles.length} file | Klaim “kurikulum” di permukaan pengguna: ${curriculumClaims.length} file; label PAI eksplisit absen di ${paiLabelFiles.length} file |`);
md.push("");
md.push("## R1 — Tujuan ↔ aktivitas");
md.push("");
md.push("Metode: kata bermakna (≥4 huruf, stopword dibuang) dari setiap tujuan dicari di seluruh teks aktivitas; cakupan = kata ditemukan / kata bermakna. Ambang sinyal: cakupan < 0.5 atau tujuan tanpa kata bermakna (cek manual). Ini **bukan** penilaian keterukuran tujuan.");
md.push("");
if (flagCount("R1") === 0) {
  md.push("- Tidak ada sinyal otomatis.");
} else {
  for (const record of records.filter((entry) => entry.flags.some((flag) => flag.startsWith("R1"))).slice(0, 40)) {
    md.push(`- \`${record.packageId}\` (Kelas ${record.grade}):`);
    for (const objective of record.objectives) {
      if (objective.coverage === null) {
        md.push(`  - tanpa kata bermakna — cek manual: “${objective.text}”`);
      } else if (objective.coverage < 0.5) {
        md.push(
          `  - cakupan ${objective.coverage} · aktivitas fokus ${objective.activitiesWithAtLeastTwoMatches.length} — “${objective.text}”`
        );
      }
    }
  }
  if (flagCount("R1") > 40) md.push(`- … +${flagCount("R1") - 40} paket lain (lihat CSV/JSON).`);
}
md.push("");
md.push("## R2 — Bahan baca akurasi faktual");
md.push("");
md.push(`Agent tidak menilai kebenaran konsep. Bahan baca lengkap ada di [sampel baca](PEDAGOGICAL_SAMPLE_${date}.md); setiap jawaban eksplorasi, kunci soal, pasangan matching, dan urutan ordering ditampilkan apa adanya untuk ahli mapel.`);
md.push("");
md.push(`- Total klaim di seluruh ${total} paket: **${records.reduce((sum, record) => sum + record.r2.claims, 0)}** (${records.reduce((sum, record) => sum + record.r2.reveals, 0)} jawaban eksplorasi · ${records.reduce((sum, record) => sum + record.r2.questions, 0)} soal · ${records.reduce((sum, record) => sum + record.r2.pairs, 0)} pasangan · ${records.reduce((sum, record) => sum + record.r2.orderingItems, 0)} item urutan); sampel baca memuat sebagian untuk pembacaan ahli.`);
const depthOk = records.filter((record) => record.load.activities >= 3 && record.assessment.items >= 8).length;
md.push(`- Paket dengan minimal 3 aktivitas dan 8 item asesmen: **${depthOk}/${total}**.`);
md.push("");
md.push("## R3 — Bahasa sesuai usia");
md.push("");
md.push("Metode: batas kata per kalimat 12 (Kelas 1–2), 16 (Kelas 3–4), 20 (Kelas 5–6); estimasi baca 100 kata/menit.");
md.push("");
if (flagCount("R3") === 0) {
  md.push("- Tidak ada kalimat melebihi batas.");
} else {
  for (const record of records.filter((entry) => entry.language.longSentences.length > 0).sort((a, b) => b.language.maxWordsPerSentence - a.language.maxWordsPerSentence).slice(0, 30)) {
    const longest = record.language.longSentences[0];
    md.push(`- \`${record.packageId}\` (Kelas ${record.grade}, batas ${record.language.sentenceLimit}): ${record.language.longSentences.length} kalimat; terpanjang ${longest.words} kata — “${longest.text.slice(0, 180)}”`);
  }
  if (flagCount("R3") > 30) md.push(`- … +${flagCount("R3") - 30} paket lain (lihat CSV).`);
}
md.push("");
md.push("## R4 — Beban kognitif (estimasi)");
md.push("");
md.push("Metode estimasi: baca 100 kata/menit + 0,75 menit/langkah + 0,5 menit/soal + 0,5 menit/pasangan + 0,5 menit/item ordering + 0,5 menit/aktivitas. Anggaran: 15 menit (Kelas 1–2), 20 (3–4), 25 (5–6). Estimasi ini **belum** diuji coba ke siswa.");
md.push("");
const overBudget = records.filter((record) => record.load.estimatedMinutes > record.load.minuteBudget);
const underLoad = records.filter((record) => record.load.estimatedMinutes < 5);
md.push(`- Di atas anggaran: **${overBudget.length}** paket${overBudget.length > 0 ? ` — contoh: ${overBudget.sort((a, b) => b.load.estimatedMinutes - a.load.estimatedMinutes).slice(0, 10).map((record) => `\`${record.packageId}\` (${record.load.estimatedMinutes} mnt)`).join(", ")}` : ""}.`);
md.push(`- Di bawah 5 menit: **${underLoad.length}** paket${underLoad.length > 0 ? ` — contoh: ${underLoad.slice(0, 10).map((record) => `\`${record.packageId}\` (${record.load.estimatedMinutes} mnt)`).join(", ")}` : ""}.`);
md.push(`- Rentang estimasi seluruh paket: ${Math.min(...records.map((record) => record.load.estimatedMinutes))}–${Math.max(...records.map((record) => record.load.estimatedMinutes))} menit.`);
md.push("");
md.push("## R5 — Asesmen ↔ tujuan");
md.push("");
md.push("Metode: (a) setiap item dipetakan ke tujuan dengan kata bermakna; (b) pasangan matching dibandingkan **persis** dengan langkah eksplorasi (prompt + reveal); (c) bias kunci bila ≥3 soal pilihan; (d) salinan semantik: sisi kanan sama dengan reveal dan sisi kiri ≥0,70 mirip prompt (min-overlap) — metrik informasi, **bukan** flag. Pencocokan kata dapat menghasilkan positif palsu karena sinonim; duplikasi persis dan bias kunci bersifat deterministik. Flag R5 hanya memakai sinyal deterministik (duplikasi penuh atau bias 100%).");
md.push("");
const unmappedTotal = records.reduce((sum, record) => sum + record.assessment.unmappedItems.length, 0);
md.push(`- Item tak terpetakan (kata kunci): **${unmappedTotal}** dari ${records.reduce((sum, record) => sum + record.assessment.items, 0)} — bahan periksa, bukan vonis.`);
md.push(`- Tujuan tanpa item asesmen (kata kunci): **${records.reduce((sum, record) => sum + record.assessment.objectivesWithoutItems.length, 0)}** tujuan pada ${records.filter((record) => record.assessment.objectivesWithoutItems.length > 0).length} paket.`);
const fullMirror = records.filter((record) => record.assessment.matchingPairs > 0 && record.assessment.mirroredPairs === record.assessment.matchingPairs);
const partialMirror = records.filter((record) => record.assessment.mirroredPairs > 0 && record.assessment.mirroredPairs < record.assessment.matchingPairs);
md.push(`- **Matching identik penuh dengan eksplorasi: ${fullMirror.length} paket**; duplikasi sebagian: ${partialMirror.length} paket. Ini berarti aktivitas matching mengulang jawaban eksplorasi, bukan asesmen mandiri.`);
const copyTotal = records.reduce((sum, record) => sum + record.assessment.explorationCopies, 0);
const copyPackages = records.filter((record) => record.assessment.explorationCopies > 0).length;
md.push(`- **Salinan semantik (detektor longgar, min-overlap ≥ 0,70): ${copyTotal} pasangan di ${copyPackages} paket.** Metrik informasi, bukan flag R5 — lihat F-06 di [laporan review 10 paket](REVIEW_REPORT_2026-10-27_GURU_PRIORITAS_10.md) dan [daftar pasangan untuk seleksi guru](F06_MIRROR_PAIRS_2026-10-28.csv).`);
const positionFlags = records.filter((record) => record.assessment.positionBias.questions >= 3 && (record.assessment.positionBias.modalShare === 1 || record.assessment.positionBias.longestCorrectRatio === 1));
md.push(`- Bias posisi/panjang kunci: **${positionFlags.length}** paket (${records.filter((record) => record.assessment.positionBias.questions >= 3 && record.assessment.positionBias.modalShare === 1).length} semua kunci di posisi sama; ${records.filter((record) => record.assessment.positionBias.questions >= 3 && record.assessment.positionBias.longestCorrectRatio === 1).length} kunci selalu opsi terpanjang).`);
md.push("");
for (const record of fullMirror.slice(0, 20)) {
  md.push(`- \`${record.packageId}\`: ${record.assessment.mirroredPairs}/${record.assessment.matchingPairs} pasangan = langkah eksplorasi.`);
}
if (fullMirror.length > 20) md.push(`- … +${fullMirror.length - 20} paket lain (lihat CSV).`);
md.push("");
md.push("");
for (const record of positionFlags.filter((entry) => entry.assessment.positionBias.modalShare === 1).slice(0, 10)) {
  md.push(`- \`${record.packageId}\`: ${record.assessment.positionBias.questions} soal pilihan, semua kunci di posisi ${(record.assessment.positionBias.modalIndex ?? 0) + 1}.`);
}
md.push("");
md.push("## R6 — Umpan balik suportif");
md.push("");
md.push("Metode: kelengkapan `feedbackPolicy` per aktivitas, cakupan `hint` pada langkah eksplorasi, dan pindai kata bernada negatif pada teks. Skema saat ini **belum** menyimpan umpan balik per jawaban; penilaian nada akhir tetap milik reviewer.");
md.push("");
md.push(`- ` + "`feedbackPolicy` lengkap: **" + records.filter((record) => record.feedback.policyComplete).length + `/${total}** paket.`);
md.push(`- Hint di semua langkah eksplorasi: **${records.filter((record) => record.feedback.hintCoverage === 1).length}/${total}** paket.`);
md.push(`- Kata kasar: **${records.filter((record) => record.flags.some((flag) => flag.includes("kata kasar"))).length}** paket.`);
md.push(`- Nada negatif (perlu dibaca dalam konteks): **${records.filter((record) => record.feedback.toneHits.length > 0).length}** paket.`);
for (const record of records.filter((entry) => entry.feedback.toneHits.length > 0).slice(0, 15)) {
  md.push(`  - \`${record.packageId}\`: ${record.feedback.toneHits.slice(0, 2).map((hit) => `“${hit.text}”`).join("; ")}`);
}
md.push("");
md.push("## R8 — Data pribadi & konten sensitif");
md.push("");
md.push("Metode: regex email/URL/telepon/NIK + frasa sensitif (alamat rumah, nomor kontak, tanggal lahir, NISN, foto siswa, media sosial) pada seluruh teks paket. Aset visual tidak di-OCR.");
md.push("");
const piiRecords = records.filter((record) => record.r8.personalData.length > 0 || record.r8.sensitiveHits.length > 0);
if (piiRecords.length === 0) {
  md.push("- Tidak ada pola terdeteksi pada teks paket.");
} else {
  for (const record of piiRecords.slice(0, 30)) {
    md.push(`- \`${record.packageId}\`: ${[...record.r8.personalData, ...record.r8.sensitiveHits].join(", ")}`);
  }
  if (piiRecords.length > 30) md.push(`- … +${piiRecords.length - 30} paket lain (lihat CSV).`);
}
md.push("");
md.push("## R9 — Hak & lisensi aset");
md.push("");
md.push("Metode: keberadaan file aset di disk, URL eksternal di JSON paket, jumlah aset per paket. Provenance: seluruh aset dibuat internal via Google Flow; tidak ada lisensi pihak ketiga. Rincian format/hash aktual ada di [ASSET_INVENTORY_2026-10-25.md](ASSET_INVENTORY_2026-10-25.md) (addendum 2026-10-26: 320 WebP, 320 hash unik). CSV inventaris adalah snapshot pra-migrasi.");
md.push("");
md.push(`- File aset hilang: **${records.reduce((sum, record) => sum + record.r9.missingAssetFiles.length, 0)}**.`);
md.push(`- Paket dengan URL eksternal di JSON: **${records.filter((record) => record.r9.externalUrls).length}**.`);
md.push(`- Total aset paket: **${records.reduce((sum, record) => sum + record.r9.assets, 0)}** (${total} paket).`);
md.push("");
md.push("## R12 — Klaim kurikulum & label PAI");
md.push("");
md.push("Metode: pindai `src/`, `index.html`, `README.md`, `knowledge/content/CATALOG.md`, `package.json` untuk “Kurikulum Merdeka”, “sesuai kurikulum”, “Kurikulum 2013/K-13”, “capaian pembelajaran”. Label PAI diperiksa terhadap keberadaan frasa “Pendidikan Agama Islam”.");
md.push("");
if (curriculumClaims.length === 0) {
  md.push("- Tidak ada klaim kurikulum di permukaan yang dipindai.");
} else {
  for (const entry of curriculumClaims) {
    md.push(`- \`${entry.file}\`: ${entry.hits.map((hit) => `baris ${hit.line} (${hit.id}) “${hit.text}”`).join("; ")}`);
  }
}
if (paiLabelFiles.length === 0) {
  md.push("- Semua file yang menyebut “PAI” juga memuat label “Pendidikan Agama Islam”.");
} else {
  md.push(`- **Label PAI eksplisit belum ada** di: ${paiLabelFiles.map((file) => `\`${file}\``).join(", ")}. Sesuai D8, materi pemasaran/katalog harus memakai label eksplisit “Pendidikan Agama Islam”.`);
}
md.push("");
md.push("## Prioritas baca untuk reviewer manusia");
md.push("");
md.push("Skor = jumlah kategori flag otomatis (bukan penilaian pedagogis).");
md.push("");
md.push("| # | packageId | Kelas | Mapel | Skor | Flag |");
md.push("|---:|---|---:|---|---:|---|");
priority.slice(0, 30).forEach((entry, index) => {
  md.push(
    `| ${index + 1} | \`${entry.record.packageId}\` | ${entry.record.grade} | ${entry.record.subjectLabel} | ${entry.score} | ${entry.record.flags.join("; ")} |`
  );
});
md.push("");
md.push("## Sampel baca stratifikasi");
md.push("");
md.push(`Satu paket per sel kelas × mapel (${sample.length} paket) didump lengkap di [PEDAGOGICAL_SAMPLE_${date}.md](PEDAGOGICAL_SAMPLE_${date}.md) — tujuan, langkah, kunci, pasangan, urutan, dan kebijakan umpan balik.`);
md.push("");
md.push("## Yang tidak dilakukan agent");
md.push("");
md.push("- Tidak menulis PASS/FAIL pada R1–R6, R8–R9, R12.");
const draftCount = records.filter((record) => record.reviewStatus === "draft").length;
md.push(`- Tidak mengubah \`reviewStatus\` (tetap \`draft\` ${draftCount}/${total}).`);
md.push("- Tidak mengisi nama/tanda tangan reviewer.");
md.push("- Tidak mengklaim materi “sudah direview”.");
md.push("");
md.push("## Langkah reviewer");
md.push("");
md.push("1. Baca laporan ini + sampel; tandai temuan yang relevan.");
md.push("2. Untuk tiap paket, isi `reviewer`, R1–R6/R8–R9/R12, dan `notes` pada [lembar kerja](../release/REVIEW_WORKSHEET_2026-10-25.md).");
md.push("3. Jika ada FAIL, buat tugas perbaikan; jangan ubah `reviewStatus` sebelum reviewer manusia menandatangani.");
md.push("4. `reviewStatus: approved` hanya setelah seluruh R1–R12 LULUS dan formulir ditandatangani.");
md.push("");

const sampleMd = [];
sampleMd.push("# Sampel Baca Pedagogis — " + date);
sampleMd.push("");
sampleMd.push("**Status:** `PRA-REVIEW AGENT — BUKAN APPROVAL`. Satu paket per sel kelas × mapel, dipilih deterministik (median urutan `packageId`). Seluruh teks ditampilkan apa adanya untuk dibaca reviewer manusia.");
sampleMd.push("");
sampleMd.push(`Gunakan bersama [PEDAGOGICAL_PREREVIEW_${date}.md](PEDAGOGICAL_PREREVIEW_${date}.md). Catatan flag di akhir tiap paket berasal dari heuristik otomatis, bukan penilaian pedagogis.`);
sampleMd.push("");
for (const { record } of sample) {
  sampleMd.push(`## Kelas ${record.grade} · ${record.subjectLabel} — \`${record.packageId}\``);
  sampleMd.push("");
  sampleMd.push(`**Judul:** ${record.lessonTitle}`);
  sampleMd.push("");
  const dir = path.join(packagesRoot, record.dir);
  const lesson = readJson(path.join(dir, "lessons", readdirSync(path.join(dir, "lessons")).find((file) => file.endsWith(".json"))));
  const activities = readdirSync(path.join(dir, "activities"))
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => readJson(path.join(dir, "activities", file)));
  sampleMd.push("**Tujuan pembelajaran:**");
  for (const objective of lesson.learningObjectives ?? []) sampleMd.push(`- ${objective}`);
  sampleMd.push("");
  sampleMd.push(`**Ringkasan:** ${lesson.summary ?? "-"}`);
  sampleMd.push("");
  sampleMd.push(`**Alt text:** ${lesson.accessibilityMetadata?.altText ?? "-"}`);
  sampleMd.push("");
  for (const activity of activities) {
    sampleMd.push(`### ${activity.title} (${activity.type})`);
    sampleMd.push("");
    if (activity.instructions) sampleMd.push(`Instruksi: ${activity.instructions}`);
    sampleMd.push("");
    const config = activity.interactionConfig ?? {};
    if (activity.type === "exploration") {
      (config.steps ?? []).forEach((step, index) => {
        sampleMd.push(`${index + 1}. **${step.prompt}**`);
        if (step.reveal) sampleMd.push(`   - Jawaban: ${step.reveal}`);
        if (step.hint) sampleMd.push(`   - Hint: ${step.hint}`);
        if (step.altText) sampleMd.push(`   - Alt: ${step.altText}`);
      });
      sampleMd.push("");
    }
    if (activity.type === "matching") {
      sampleMd.push("| Kiri | Kanan |");
      sampleMd.push("|---|---|");
      for (const pair of config.pairs ?? []) sampleMd.push(`| ${pair.left} | ${pair.right} |`);
      sampleMd.push("");
    }
    if (activity.type === "ordering") {
      const items = config.items ?? [];
      const indexOf = new Map(items.map((item, index) => [item.itemId, index]));
      sampleMd.push("Item (urutan benar):");
      (config.correctOrder ?? []).forEach((id, index) => {
        sampleMd.push(`${index + 1}. ${items[indexOf.get(id)]?.text ?? id}`);
      });
      sampleMd.push("");
    }
    const questions = activity.assessmentConfig?.questions ?? [];
    if (questions.length > 0) {
      sampleMd.push("Asesmen:");
      for (const question of questions) {
        const options = (question.options ?? [])
          .map((option) => `${option.optionId === question.correctResponse ? "**" : ""}${option.optionId}: ${option.text}${option.optionId === question.correctResponse ? "**" : ""}`)
          .join(" · ");
        sampleMd.push(`- ${question.prompt}${options ? ` — ${options}` : ""}`);
      }
      sampleMd.push("");
    }
    if (activity.feedbackPolicy) {
      sampleMd.push(
        `Umpan balik: mode ${activity.feedbackPolicy.mode ?? "-"}; boleh ulang ${String(activity.feedbackPolicy.allowRetry ?? "-")}; tampilkan kunci ${String(activity.feedbackPolicy.showCorrectAnswer ?? "-")}`
      );
      sampleMd.push("");
    }
  }
  sampleMd.push(`**Flag otomatis:** ${record.flags.length === 0 ? "tidak ada" : record.flags.join("; ")}.`);
  sampleMd.push("");
  sampleMd.push("---");
  sampleMd.push("");
}

const csvHeader = [
  "packageId",
  "grade",
  "subject",
  "objectives",
  "objectivesLowCoverage",
  "objectivesWithoutFocus",
  "longSentences",
  "maxSentenceWords",
  "avgSentenceWords",
  "estimatedMinutes",
  "budgetMinutes",
  "assessmentItems",
  "unmappedItems",
  "objectivesWithoutItems",
  "matchingPairs",
  "mirroredPairs",
  "matchingMirrorShare",
  "explorationCopies",
  "explorationCopyShare",
  "positionModalShare",
  "longestCorrectRatio",
  "hintCoverage",
  "feedbackPolicyComplete",
  "piiHits",
  "sensitiveHits",
  "assetIssues",
  "flags"
];
const csvEscape = (value) => `"${String(value).replaceAll('"', '""')}"`;
const csvRows = records.map((record) =>
  [
    record.packageId,
    record.grade,
    record.subject,
    record.objectives.length,
    record.lowCoverageObjectives.length,
    record.objectivesWithoutFocus.length,
    record.language.longSentences.length,
    record.language.maxWordsPerSentence,
    record.language.avgWordsPerSentence,
    record.load.estimatedMinutes,
    record.load.minuteBudget,
    record.assessment.items,
    record.assessment.unmappedItems.length,
    record.assessment.objectivesWithoutItems.length,
    record.assessment.matchingPairs,
    record.assessment.mirroredPairs,
    record.assessment.matchingMirrorShare ?? "",
    record.assessment.explorationCopies,
    record.assessment.matchingPairs === 0
      ? ""
      : Number((record.assessment.explorationCopies / record.assessment.matchingPairs).toFixed(2)),
    record.assessment.positionBias.modalShare ?? "",
    record.assessment.positionBias.longestCorrectRatio ?? "",
    record.feedback.hintCoverage ?? "",
    record.feedback.policyComplete,
    record.r8.personalData.join("|"),
    record.r8.sensitiveHits.join("|"),
    record.r9.missingAssetFiles.length + (record.r9.externalUrls ? 1 : 0),
    record.flags.join("|")
  ]
    .map(csvEscape)
    .join(",")
);

ensureWritable([outMd, outSample, outJson, outCsv], { force });
writeFileSync(outMd, `${md.join("\n")}\n`);
writeFileSync(outSample, `${sampleMd.join("\n")}\n`);
writeFileSync(
  outCsv,
  `\uFEFF${[csvHeader.map(csvEscape).join(","), ...csvRows].join("\r\n")}\r\n`
);
writeFileSync(
  outJson,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      disclaimer:
        "PRA-REVIEW AGENT — evidence only. Tidak ada PASS/FAIL, tidak mengubah reviewStatus, bukan approval manusia.",
      summary: {
        total,
        r1: flagCount("R1"),
        r3: flagCount("R3"),
        r4: flagCount("R4"),
        r5: flagCount("R5"),
        r6: flagCount("R6"),
        r8: flagCount("R8"),
        r9: flagCount("R9"),
        r12Files: curriculumClaims.length,
        paiLabelMissingFiles: paiLabelFiles,
        explorationCopies: { pairs: copyTotal, packages: copyPackages }
      },
      curriculumClaims,
      records
    },
    null,
    2
  )}\n`
);

console.log(
  JSON.stringify(
    {
      total,
      r1: flagCount("R1"),
      r3: flagCount("R3"),
      r4: flagCount("R4"),
      r5: flagCount("R5"),
      r6: flagCount("R6"),
      r8: flagCount("R8"),
      r9: flagCount("R9"),
      r12Files: curriculumClaims.length,
      explorationCopies: { pairs: copyTotal, packages: copyPackages },
      sample: sample.length,
      report: outMd
    },
    null,
    2
  )
);
