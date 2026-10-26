import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const packagesRoot = path.resolve("content/packages");
const apply = process.argv.includes("--apply");
const onlyArg = process.argv.find((arg) => arg.startsWith("--only="));
const only = onlyArg ? new Set(onlyArg.slice("--only=".length).split(",").filter(Boolean)) : null;

const stopwords = new Set([
  "yang", "dan", "atau", "dengan", "untuk", "pada", "dari", "dalam", "adalah",
  "akan", "dapat", "tidak", "serta", "juga", "agar", "saat", "setelah", "sebelum",
  "melalui", "secara", "siswa", "peserta", "didik", "kelas", "materi", "ini", "itu",
  "satu", "dua", "tiga", "empat", "lima", "kepada", "sebagai", "oleh", "harus",
  "bisa", "mengenal", "menjelaskan", "menyebutkan", "memberi", "menunjukkan",
  "mempraktikkan", "menjaga", "membedakan", "menerapkan", "membiasakan"
]);

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function norm(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function significantWords(text) {
  return [...new Set(
    norm(text)
      .split(" ")
      .filter((word) => word.length >= 4 && !stopwords.has(word))
  )];
}

function objectiveScore(candidate, objectives) {
  const words = new Set(objectives.flatMap((objective) => significantWords(objective)));
  const text = `${candidate.prompt} ${candidate.answer}`.toLowerCase();
  let score = 0;
  for (const word of words) {
    if (text.includes(word)) score += 1;
  }
  return score;
}

function optionText(question, optionId) {
  return (question.options ?? []).find((option) => option.optionId === optionId)?.text ?? "";
}

function answerForQuestion(question) {
  if (!question || question.correctResponse === undefined) return "";
  if (question.responseType === "text") return String(question.correctResponse);
  if (question.responseType === "boolean") {
    return question.correctResponse === "true" ? "Benar" : "Salah";
  }
  if (Array.isArray(question.correctResponse)) {
    return question.correctResponse.map((id) => optionText(question, id)).filter(Boolean).join(", ");
  }
  return optionText(question, question.correctResponse);
}

function collectCandidates(lesson, activities) {
  const candidates = [];
  for (const activity of activities) {
    if (activity.type === "matching") {
      for (const pair of activity.interactionConfig?.pairs ?? []) {
        candidates.push({
          prompt: pair.left,
          answer: pair.right,
          source: "pair",
          hint: "Ingat kembali istilah yang sudah dipelajari."
        });
      }
    }
    if (activity.type === "ordering") {
      const items = activity.interactionConfig?.items ?? [];
      const order = activity.interactionConfig?.correctOrder ?? [];
      const byId = new Map(items.map((item) => [item.itemId, item.text]));
      const ordered = order.map((id) => byId.get(id)).filter(Boolean);
      if (ordered.length >= 2) {
        candidates.push({
          prompt: `Bagaimana urutan yang benar untuk ${lesson.title}?`,
          answer: ordered.join(" → "),
          source: "ordering",
          hint: "Ingat urutan langkah dari awal sampai akhir."
        });
      }
    }
    if (["multiple-choice", "true-false", "short-answer"].includes(activity.type)) {
      for (const question of activity.assessmentConfig?.questions ?? []) {
        candidates.push({
          prompt: question.prompt,
          answer: answerForQuestion(question),
          source: "question",
          hint: "Baca kembali langkah eksplorasi."
        });
      }
    }
  }
  if (lesson.summary) {
    candidates.push({
      prompt: `Apa hal penting yang kamu pelajari tentang ${lesson.title}?`,
      answer: lesson.summary,
      source: "summary",
      hint: "Baca kembali ringkasan pelajaran."
    });
  }
  const altText = lesson.accessibilityMetadata?.altText;
  if (altText) {
    candidates.push({
      prompt: "Apa yang kamu amati pada gambar?",
      answer: altText,
      source: "alt",
      hint: "Perhatikan gambar dengan saksama."
    });
  }
  return candidates;
}

function pickNewSteps(lesson, activities, count) {
  const existingPrompts = new Set(
    activities
      .find((activity) => activity.type === "exploration")
      ?.interactionConfig?.steps?.map((step) => norm(step.prompt)) ?? []
  );
  const candidates = collectCandidates(lesson, activities)
    .filter((candidate) => candidate.prompt.length >= 3 && candidate.prompt.length <= 200)
    .filter((candidate) => candidate.answer.length >= 1 && candidate.answer.length <= 180)
    .filter((candidate) => !existingPrompts.has(norm(candidate.prompt)))
    .filter((candidate) =>
      candidate.source !== "pair" || /[?.]$/.test(candidate.prompt.trim())
    )
    .map((candidate) => ({
      ...candidate,
      score: objectiveScore(candidate, lesson.learningObjectives ?? [])
    }))
    .sort((a, b) => b.score - a.score || a.source.localeCompare(b.source));

  const picked = [];
  for (const candidate of candidates) {
    if (picked.length >= count) break;
    if (picked.some((item) => norm(item.prompt) === norm(candidate.prompt))) continue;
    if (picked.some((item) => norm(item.answer) === norm(candidate.answer))) continue;
    picked.push(candidate);
  }

  if (picked.length < count) {
    const fallbacks = [
      {
        prompt: `Apa yang ingin kamu coba lagi pada materi ${lesson.title}?`,
        answer: "Mengulang langkah eksplorasi bersama teman.",
        source: "reflection",
        hint: "Pikirkan satu langkah yang masih sulit."
      },
      {
        prompt: `Sebutkan satu contoh ${lesson.title.toLowerCase()} di rumahmu.`,
        answer: lesson.summary || "Contoh sesuai materi.",
        source: "reflection",
        hint: "Hubungkan materi dengan kegiatan sehari-hari."
      }
    ];
    for (const fallback of fallbacks) {
      if (picked.length >= count) break;
      if (picked.some((item) => norm(item.prompt) === norm(fallback.prompt))) continue;
      picked.push(fallback);
    }
  }
  return picked;
}

function uniqueActivityId(base, existingIds) {
  if (!existingIds.has(base)) return base;
  for (let index = 2; index < 100; index += 1) {
    const candidate = `${base}-${index}`;
    if (!existingIds.has(candidate)) return candidate;
  }
  throw new Error(`tidak dapat membuat activityId unik untuk ${base}`);
}

function buildStep(candidate, assetPath, altText) {
  const step = {
    prompt: candidate.prompt,
    reveal: candidate.answer,
    hint: candidate.hint
  };
  if (assetPath) step.assetPath = assetPath;
  if (altText) step.altText = altText;
  return step;
}

function buildMatchingActivity({ lesson, activities, assetPath, altText }) {
  const steps = activities.find((activity) => activity.type === "exploration")?.interactionConfig?.steps ?? [];
  const pool = [
    ...steps.map((step) => ({ prompt: step.prompt, answer: step.reveal })),
    ...collectCandidates(lesson, activities)
  ];
  const seenLeft = new Set();
  const seenRight = new Set();
  const pairs = [];
  for (const candidate of pool) {
    if (pairs.length >= 5) break;
    const left = String(candidate.prompt ?? "").trim();
    const right = String(candidate.answer ?? "").trim();
    if (!left || !right || left.length > 190 || right.length > 190) continue;
    if (seenLeft.has(norm(left)) || seenRight.has(norm(right))) continue;
    seenLeft.add(norm(left));
    seenRight.add(norm(right));
    pairs.push({ left, right });
  }
  if (pairs.length < 2) return null;

  return {
    activityId: "",
    type: "matching",
    schemaVersion: "1.0.0",
    title: "Latihan Mencocokkan",
    instructions: "Pasangkan setiap pertanyaan dengan jawaban yang tepat.",
    assets: [],
    interactionConfig: {
      pairs: pairs.map((pair, index) => ({
        pairId: `pasangan-penguatan-${index + 1}`,
        left: pair.left,
        right: pair.right
      }))
    },
    completionPolicy: { type: "view" },
    feedbackPolicy: { mode: "immediate", allowRetry: true, showCorrectAnswer: true },
    runtimeCapabilities: ["touch", "keyboard"],
    ...(altText ? { accessibilityMetadata: { altText } } : {})
  };
}

function buildMultipleChoiceFromPairs({ activity, lesson, assetPath, altText }) {
  const pairs = (activity.interactionConfig?.pairs ?? []).filter(
    (pair) => pair.left && pair.right
  );
  const uniqueRights = [...new Set(pairs.map((pair) => pair.right))];
  const target = Math.min(4, Math.max(2, 8 - pairs.length));
  const questions = [];

  for (const pair of pairs) {
    if (questions.length >= target) break;
    if (!uniqueRights.includes(pair.right)) continue;
    if (questions.some((question) => norm(question.prompt) === norm(
      pair.left.endsWith("?") ? pair.left : `Apa pasangan dari "${pair.left}"?`
    ))) continue;

    const distractors = uniqueRights.filter((right) => right !== pair.right).slice(0, 2);
    if (distractors.length < 1) continue;
    const optionTexts = [pair.right, ...distractors];
    const correctIndex = questions.length % optionTexts.length;
    const ordered = [...optionTexts];
    const [correct] = ordered.splice(0, 1);
    ordered.splice(correctIndex, 0, correct);

    const prompt = pair.left.endsWith("?")
      ? pair.left
      : `Apa pasangan dari "${pair.left}"?`;
    questions.push({
      questionId: `soal-penguatan-${questions.length + 1}`,
      prompt,
      responseType: "single-choice",
      options: ordered.map((text, index) => ({
        optionId: `opsi-penguatan-${questions.length + 1}-${index + 1}`,
        text
      })),
      correctResponse: `opsi-penguatan-${questions.length + 1}-${correctIndex + 1}`
    });
  }

  if (questions.length < 2) return null;

  return {
    activityId: "",
    type: "multiple-choice",
    schemaVersion: "1.0.0",
    title: "Kuis Penguatan",
    instructions: "Pilih jawaban yang paling tepat.",
    assets: [],
    interactionConfig: { layout: "single-question" },
    assessmentConfig: { questions, passingScore: 75 },
    completionPolicy: { type: "score-threshold", threshold: 75 },
    feedbackPolicy: { mode: "after-attempt", allowRetry: true, showCorrectAnswer: false },
    runtimeCapabilities: ["touch", "keyboard"],
    ...(altText ? { accessibilityMetadata: { altText } } : {})
  };
}

function countItems(activities) {
  return activities.reduce((total, activity) => {
    if (activity.type === "matching") return total + (activity.interactionConfig?.pairs?.length ?? 0);
    if (activity.type === "ordering") return total + (activity.interactionConfig?.items?.length ?? 0);
    if (["multiple-choice", "true-false", "short-answer"].includes(activity.type)) {
      return total + (activity.assessmentConfig?.questions?.length ?? 0);
    }
    return total;
  }, 0);
}

function enrichPackage(dirName) {
  const dir = path.join(packagesRoot, dirName);
  const manifestPath = path.join(dir, "manifest.json");
  const manifest = readJson(manifestPath);
  const lessonFile = readdirSync(path.join(dir, "lessons")).find((file) => file.endsWith(".json"));
  if (!lessonFile) throw new Error("lesson tidak ditemukan");
  const lessonPath = path.join(dir, "lessons", lessonFile);
  const lesson = readJson(lessonPath);
  const activityFiles = readdirSync(path.join(dir, "activities"))
    .filter((file) => file.endsWith(".json"))
    .sort();
  const activities = activityFiles.map((file) => readJson(path.join(dir, "activities", file)));
  const explorationIndex = activities.findIndex((activity) => activity.type === "exploration");

  const steps = activities.find((activity) => activity.type === "exploration")
    ?.interactionConfig?.steps ?? [];
  if (steps.length >= 5 && activities.length >= 3 && countItems(activities) >= 8) {
    return { status: "skipped", reason: "sudah memenuhi standar" };
  }

  const exploration = activities.find((activity) => activity.type === "exploration");
  if (!exploration) return { status: "failed", reason: "tidak ada aktivitas eksplorasi" };

  const assetPath = manifest.assets?.[0]?.path;
  const altText = lesson.accessibilityMetadata?.altText;
  const newSteps = pickNewSteps(lesson, activities, Math.max(0, 5 - steps.length));
  if (steps.length + newSteps.length < 5) {
    return { status: "failed", reason: `langkah tidak cukup (${steps.length + newSteps.length})` };
  }
  exploration.interactionConfig = exploration.interactionConfig ?? {};
  exploration.interactionConfig.steps = [
    ...steps,
    ...newSteps.map((candidate) => buildStep(candidate, assetPath, altText))
  ];

  const existingIds = new Set(activities.map((activity) => activity.activityId));
  let newActivity;
  const assessmentType = activities.find((activity) =>
    ["multiple-choice", "true-false", "short-answer", "matching", "ordering"].includes(activity.type)
  )?.type;

  if (assessmentType === "matching") {
    newActivity = buildMultipleChoiceFromPairs({
      activity: activities.find((activity) => activity.type === "matching"),
      lesson,
      assetPath,
      altText
    });
    if (newActivity) newActivity.activityId = uniqueActivityId("kuis-penguatan", existingIds);
  } else {
    newActivity = buildMatchingActivity({ lesson, activities, assetPath, altText });
    if (newActivity) newActivity.activityId = uniqueActivityId("matching-penguatan", existingIds);
  }
  if (!newActivity) return { status: "failed", reason: "aktivitas penguatan tidak dapat dibuat" };

  const newFile = path.join(dir, "activities", `activity-${String(activityFiles.length + 1).padStart(3, "0")}.json`);
  lesson.activityIds = [...(lesson.activityIds ?? []), newActivity.activityId];
  if (newActivity.type === "multiple-choice") {
    lesson.assessmentRefs = [...(lesson.assessmentRefs ?? []), newActivity.activityId];
  }
  lesson.contentVersion = "0.2.0";
  manifest.packageVersion = "0.2.0";

  if (apply) {
    writeJson(path.join(dir, "activities", activityFiles[explorationIndex]), exploration);
    writeJson(newFile, newActivity);
    writeJson(lessonPath, lesson);
    writeJson(manifestPath, manifest);
  }

  return {
    status: "enriched",
    steps: steps.length + newSteps.length,
    activities: activities.length + 1,
    items: countItems([...activities, newActivity]),
    newActivity: newActivity.type
  };
}

const results = [];
for (const dirName of readdirSync(packagesRoot).filter((name) => statSync(path.join(packagesRoot, name)).isDirectory()).sort()) {
  if (only && !only.has(dirName)) continue;
  try {
    const result = enrichPackage(dirName);
    results.push({ packageId: dirName, ...result });
  } catch (error) {
    results.push({ packageId: dirName, status: "failed", reason: error.message });
  }
}

const summary = {
  total: results.length,
  enriched: results.filter((result) => result.status === "enriched").length,
  skipped: results.filter((result) => result.status === "skipped").length,
  failed: results.filter((result) => result.status === "failed").length
};
console.log(JSON.stringify(summary));
for (const result of results.filter((item) => item.status === "failed")) {
  console.log(`FAILED ${result.packageId}: ${result.reason}`);
}
console.log(apply ? "mode: APPLY" : "mode: DRY RUN (tambahkan --apply untuk menulis)");
