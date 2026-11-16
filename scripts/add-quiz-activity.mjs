#!/usr/bin/env node
/**
 * Menambahkan AKTIVITAS KUIS BARU ke paket yang belum punya kuis.
 *
 * Berbeda dari `add-practice-items.mjs` (yang menyisipkan soal ke aktivitas yang
 * sudah ada), skrip ini membuat berkas `activities/activity-00N.json` bertipe
 * multiple-choice, lalu menambahkan `kuis-penguatan` ke `activityIds` dan
 * `assessmentRefs` pada lesson paket tersebut.
 *
 * Pemakaian:
 *   node scripts/add-quiz-activity.mjs scripts/data/quiz-kelas1-2026-10-27.json [berkas lain…] [--apply]
 *
 * Default kering (tidak menulis). `--apply` menulis atomik per paket.
 * Idempoten: paket yang sudah punya activityId `kuis-penguatan` dilewati.
 */
import { existsSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

const PACKAGES_DIR = path.resolve("content/packages");
const QUIZ_ACTIVITY_ID = "kuis-penguatan";
const MIN_QUESTIONS = 3;
const MAX_QUESTIONS = 10;

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const dataFiles = args.filter((arg) => !arg.startsWith("--"));

if (dataFiles.length === 0) {
  console.error("Pemakaian: node scripts/add-quiz-activity.mjs <berkas-data.json> [--apply]");
  process.exit(2);
}

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const writeJsonAtomic = (file, value) => {
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  renameSync(tmp, file);
};

function buildActivity(packageId, entry, altText) {
  const questions = entry.questions ?? [];
  if (questions.length < MIN_QUESTIONS || questions.length > MAX_QUESTIONS) {
    throw new Error(
      `${packageId}: jumlah soal ${questions.length} di luar rentang ${MIN_QUESTIONS}-${MAX_QUESTIONS}`
    );
  }

  const seenPrompts = new Set();
  const built = questions.map((question, index) => {
    const prompt = String(question.prompt ?? "").trim();
    const answer = String(question.answer ?? "").trim();
    const distractors = (question.distractors ?? []).map((text) => String(text).trim()).filter(Boolean);

    if (!prompt || !answer) {
      throw new Error(`${packageId}: soal ke-${index + 1} tanpa prompt atau jawaban`);
    }
    if (seenPrompts.has(prompt.toLowerCase())) {
      throw new Error(`${packageId}: prompt berulang -> ${prompt}`);
    }
    seenPrompts.add(prompt.toLowerCase());

    const optionTexts = [answer, ...distractors];
    if (optionTexts.length < 3) {
      throw new Error(`${packageId}: soal "${prompt}" hanya punya ${optionTexts.length} opsi`);
    }
    if (optionTexts.length > 4) {
      throw new Error(`${packageId}: soal "${prompt}" punya ${optionTexts.length} opsi (maks 4)`);
    }
    const unique = new Set(optionTexts.map((text) => text.toLowerCase()));
    if (unique.size !== optionTexts.length) {
      throw new Error(`${packageId}: opsi berulang pada "${prompt}"`);
    }

    const number = index + 1;
    const options = optionTexts.map((text, optionIndex) => ({
      optionId: `opsi-kuis-${number}-${optionIndex + 1}`,
      text
    }));

    return {
      questionId: `soal-kuis-${number}`,
      prompt,
      responseType: "single-choice",
      options,
      correctResponse: options[0].optionId
    };
  });

  return {
    activityId: QUIZ_ACTIVITY_ID,
    type: "multiple-choice",
    schemaVersion: "1.0.0",
    title: "Kuis Penguatan",
    instructions: "Pilih jawaban yang paling tepat.",
    assets: [],
    interactionConfig: { layout: "single-question" },
    assessmentConfig: { questions: built, passingScore: 75 },
    completionPolicy: { type: "score-threshold", threshold: 75 },
    feedbackPolicy: { mode: "after-attempt", allowRetry: true, showCorrectAnswer: false },
    runtimeCapabilities: ["touch", "keyboard"],
    accessibilityMetadata: { altText }
  };
}

function nextActivityFile(activitiesDir) {
  const numbers = readdirSync(activitiesDir)
    .map((file) => /^activity-(\d+)\.json$/.exec(file))
    .filter(Boolean)
    .map((match) => Number.parseInt(match[1], 10));
  const next = (numbers.length > 0 ? Math.max(...numbers) : 0) + 1;
  return `activity-${String(next).padStart(3, "0")}.json`;
}

const report = { packages: 0, added: 0, skipped: 0, questions: 0, actions: [], errors: [] };

for (const dataFile of dataFiles) {
  const data = readJson(dataFile);
  for (const [packageId, entry] of Object.entries(data.packages ?? {})) {
    report.packages += 1;
    const packageDir = path.join(PACKAGES_DIR, packageId);
    const activitiesDir = path.join(packageDir, "activities");
    const lessonsDir = path.join(packageDir, "lessons");

    try {
      if (!existsSync(activitiesDir) || !existsSync(lessonsDir)) {
        throw new Error(`${packageId}: folder activities/lessons tidak ditemukan`);
      }

      const activityFiles = readdirSync(activitiesDir).filter((file) => file.endsWith(".json"));
      const existing = activityFiles.map((file) =>
        readJson(path.join(activitiesDir, file))
      );
      if (existing.some((activity) => activity.activityId === QUIZ_ACTIVITY_ID)) {
        report.skipped += 1;
        continue;
      }

      const lessonFiles = readdirSync(lessonsDir).filter((file) => file.endsWith(".json"));
      if (lessonFiles.length !== 1) {
        throw new Error(`${packageId}: jumlah lesson ${lessonFiles.length}, skrip ini mengharapkan 1`);
      }
      const lessonPath = path.join(lessonsDir, lessonFiles[0]);
      const lesson = readJson(lessonPath);
      const altText =
        lesson.accessibilityMetadata?.altText ??
        lesson.summary ??
        "Kuis penguatan materi.";

      const activity = buildActivity(packageId, entry, altText);
      const targetFile = nextActivityFile(activitiesDir);

      // Cegah bentrok id: paket sasaran tidak boleh punya id kuis yang lain.
      if (lesson.activityIds.includes(QUIZ_ACTIVITY_ID)) {
        throw new Error(`${packageId}: lesson sudah merujuk ${QUIZ_ACTIVITY_ID} tanpa berkasnya`);
      }

      const nextActivityIds = [...lesson.activityIds, QUIZ_ACTIVITY_ID];
      const nextAssessmentRefs = lesson.assessmentRefs.includes(QUIZ_ACTIVITY_ID)
        ? lesson.assessmentRefs
        : [...lesson.assessmentRefs, QUIZ_ACTIVITY_ID];

      report.questions += activity.assessmentConfig.questions.length;
      report.actions.push({
        packageId,
        file: targetFile,
        questions: activity.assessmentConfig.questions.length
      });
      report.added += 1;

      if (apply) {
        writeJsonAtomic(path.join(activitiesDir, targetFile), activity);
        writeJsonAtomic(lessonPath, {
          ...lesson,
          activityIds: nextActivityIds,
          assessmentRefs: nextAssessmentRefs
        });
      }
    } catch (error) {
      report.errors.push(error instanceof Error ? error.message : String(error));
    }
  }
}

if (!apply) {
  console.log(`DRY-RUN (tanpa --apply): ${report.added} paket akan ditambah kuis.`);
  for (const action of report.actions) {
    console.log(`  + ${action.packageId} -> ${action.file} (${action.questions} soal)`);
  }
} else {
  console.log(`APPLY: ${report.added} paket ditambah kuis, ${report.skipped} dilewati.`);
}

console.log(
  JSON.stringify(
    {
      mode: apply ? "apply" : "dry-run",
      packages: report.packages,
      added: report.added,
      skipped: report.skipped,
      questions: report.questions,
      errors: report.errors
    },
    null,
    2
  )
);

if (report.errors.length > 0) {
  process.exit(1);
}
