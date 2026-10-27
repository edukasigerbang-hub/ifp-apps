import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ensureWritable, parseReviewArgs } from "./lib/reviewOutput.mjs";

const packagesRoot = path.resolve("content/packages");
const { date, outDir, force } = parseReviewArgs(process.argv.slice(2));
const outMd = path.join(outDir, `QUALITY_GAP_${date}.md`);
const outJson = path.join(outDir, `quality-gap-${date}.json`);

const subjectLabels = {
  matematika: "Matematika",
  "bahasa-indonesia": "Bahasa Indonesia",
  ipas: "IPAS",
  "pendidikan-pancasila": "Pendidikan Pancasila",
  "seni-rupa": "Seni Rupa",
  pjok: "PJOK",
  pai: "PAI"
};

const stopwords = new Set([
  "yang", "dan", "atau", "dengan", "untuk", "pada", "dari", "dalam", "adalah",
  "akan", "dapat", "tidak", "serta", "juga", "agar", "saat", "setelah", "sebelum",
  "melalui", "secara", "siswa", "peserta", "didik", "kelas", "materi", "ini", "itu",
  "satu", "dua", "tiga", "empat", "lima", "kepada", "sebagai", "oleh", "harus",
  "bisa", "mengenal", "menjelaskan", "menyebutkan", "memberi", "menunjukkan",
  "mempraktikkan", "menjaga", "membedakan", "menerapkan", "membiasakan"
]);

const gradeMaxWords = new Map([
  [1, 12],
  [2, 12],
  [3, 16],
  [4, 16],
  [5, 20],
  [6, 20]
]);

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function significantWords(text) {
  return new Set(
    String(text)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length >= 4 && !stopwords.has(word))
  );
}

function normalizePackage(manifest, lesson, activities) {
  const normalizedActivities = activities.map((activity) => {
    if (activity.type === "exploration") {
      return {
        type: activity.type,
        steps: (activity.interactionConfig?.steps ?? []).map((step) => ({
          prompt: step.prompt,
          reveal: step.reveal,
          hint: step.hint ?? null
        }))
      };
    }
    if (activity.type === "matching") {
      return {
        type: activity.type,
        pairs: (activity.interactionConfig?.pairs ?? []).map((pair) => [pair.left, pair.right])
      };
    }
    if (activity.type === "ordering") {
      const items = activity.interactionConfig?.items ?? [];
      const order = activity.interactionConfig?.correctOrder ?? [];
      const indexOf = new Map(items.map((item, index) => [item.itemId, index]));
      return {
        type: activity.type,
        items: items.map((item) => item.text),
        order: order.map((id) => indexOf.get(id) ?? -1)
      };
    }
    if (activity.type === "multiple-choice" || activity.type === "true-false" || activity.type === "short-answer") {
      return {
        type: activity.type,
        questions: (activity.assessmentConfig?.questions ?? []).map((question) => {
          const options = question.options ?? [];
          const correctIndex = options.findIndex(
            (option) => option.optionId === question.correctResponse
          );
          return {
            prompt: question.prompt,
            responseType: question.responseType,
            options: options.map((option) => option.text),
            correctIndex
          };
        })
      };
    }
    return { type: activity.type, config: activity.interactionConfig ?? null };
  });

  return {
    lesson: {
      title: lesson.title,
      summary: lesson.summary,
      objectives: lesson.learningObjectives
    },
    activities: normalizedActivities.sort((a, b) => a.type.localeCompare(b.type))
  };
}

const records = [];
for (const dirName of readdirSync(packagesRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort()) {
  const dir = path.join(packagesRoot, dirName);
  const manifest = readJson(path.join(dir, "manifest.json"));
  const lessonFile = readdirSync(path.join(dir, "lessons")).find((file) => file.endsWith(".json"));
  const lesson = readJson(path.join(dir, "lessons", lessonFile));
  const activityFiles = readdirSync(path.join(dir, "activities")).filter((file) => file.endsWith(".json"));
  const activities = activityFiles.map((file) => readJson(path.join(dir, "activities", file)));

  const normalized = normalizePackage(manifest, lesson, activities);
  const fingerprint = createHash("sha256").update(JSON.stringify(normalized)).digest("hex");
  const activityFingerprint = createHash("sha256")
    .update(JSON.stringify(normalized.activities))
    .digest("hex");
  const grade = Math.min(...manifest.gradeLevels);
  const subject = manifest.subjects[0];

  const steps = activities.find((activity) => activity.type === "exploration")?.interactionConfig?.steps ?? [];
  const assessmentActivities = activities.filter((activity) => activity.type !== "exploration");
  const assessmentItems = activities.reduce((total, activity) => {
    if (activity.type === "matching") return total + (activity.interactionConfig?.pairs?.length ?? 0);
    if (activity.type === "ordering") return total + (activity.interactionConfig?.items?.length ?? 0);
    if (["multiple-choice", "true-false", "short-answer"].includes(activity.type)) {
      return total + (activity.assessmentConfig?.questions?.length ?? 0);
    }
    return total;
  }, 0);

  const texts = [
    lesson.summary ?? "",
    ...steps.flatMap((step) => [step.prompt, step.reveal, step.hint].filter(Boolean)),
    ...activities.flatMap((activity) => {
      const config = activity.interactionConfig ?? {};
      return [
        ...(config.pairs ?? []).flatMap((pair) => [pair.left, pair.right]),
        ...(config.items ?? []).map((item) => item.text),
        ...(activity.assessmentConfig?.questions ?? []).flatMap((question) => [
          question.prompt,
          ...(question.options ?? []).map((option) => option.text)
        ])
      ];
    })
  ];
  const sentences = texts
    .join(" ")
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
  const wordsPerSentence =
    sentences.length === 0
      ? 0
      : sentences.reduce((total, sentence) => total + sentence.split(/\s+/).length, 0) /
        sentences.length;

  const activityText = texts.join(" ").toLowerCase();
  const objectives = lesson.learningObjectives ?? [];
  const coveredObjectives = objectives.filter((objective) => {
    const words = significantWords(objective);
    return [...words].some((word) => activityText.includes(word));
  }).length;

  const optionSets = activities.flatMap((activity) =>
    (activity.assessmentConfig?.questions ?? []).map((question) =>
      (question.options ?? []).map((option) => option.text.trim())
    )
  );
  const hasRepeat = (values) => new Set(values).size !== values.length;
  const optionDuplicates = optionSets.some((texts) => hasRepeat(texts));
  const optionCaseOnly =
    !optionDuplicates && optionSets.some((texts) => hasRepeat(texts.map((text) => text.toLowerCase())));

  records.push({
    packageId: manifest.packageId,
    grade,
    subject,
    subjectLabel: subjectLabels[subject] ?? subject,
    lessonTitle: lesson.title,
    steps: steps.length,
    activities: activities.length,
    assessmentActivities: assessmentActivities.length,
    assessmentItems,
    objectives: objectives.length,
    coveredObjectives,
    wordsPerSentence,
    languageLimit: gradeMaxWords.get(grade) ?? 20,
    curriculumRefs: (manifest.curriculumRefs ?? []).length,
    altOk:
      Boolean(lesson.accessibilityMetadata?.altText?.trim()) &&
      activities.every((activity) =>
        (activity.assets?.length ?? 0) === 0
          ? true
          : Boolean(activity.accessibilityMetadata?.altText?.trim())
      ),
    assets: manifest.assets?.length ?? 0,
    assetHashes: (manifest.assets ?? []).map((asset) => asset.sha256),
    reviewStatus: lesson.reviewStatus,
    fingerprint,
    activityFingerprint,
    optionDuplicates,
    optionCaseOnly
  });
}

const total = records.length;
const pass = (predicate) => records.filter(predicate).length;
const duplicateGroups = new Map();
for (const record of records) {
  const list = duplicateGroups.get(record.fingerprint) ?? [];
  list.push(record);
  duplicateGroups.set(record.fingerprint, list);
}
const duplicates = [...duplicateGroups.values()].filter((group) => group.length > 1);
const duplicatePackages = duplicates.reduce((sum, group) => sum + group.length, 0);

const activityGroups = new Map();
for (const record of records) {
  const list = activityGroups.get(record.activityFingerprint) ?? [];
  list.push(record);
  activityGroups.set(record.activityFingerprint, list);
}
const activityDuplicates = [...activityGroups.values()].filter((group) => group.length > 1);
const activityDuplicatePackages = activityDuplicates.reduce((sum, group) => sum + group.length, 0);
const maxGroupSize = (record) =>
  Math.max(
    duplicateGroups.get(record.fingerprint)?.length ?? 1,
    activityGroups.get(record.activityFingerprint)?.length ?? 1
  );

const assetGroups = new Map();
for (const record of records) {
  for (const hash of record.assetHashes) {
    const list = assetGroups.get(hash) ?? [];
    list.push(record.packageId);
    assetGroups.set(hash, list);
  }
}
const reusedAssets = [...assetGroups.entries()].filter(([, ids]) => ids.length > 1);

const uniqueAssetCount = assetGroups.size;
const optionDuplicatePackages = records.filter((record) => record.optionDuplicates).map((record) => record.packageId);
const optionCaseOnlyPackages = records.filter((record) => record.optionCaseOnly).map((record) => record.packageId);
const partialCoveragePackages = records
  .filter((record) => record.coveredObjectives > 0 && record.coveredObjectives < record.objectives)
  .map((record) => record.packageId);

const criteria = [
  {
    id: "G1",
    label: "Langkah eksplorasi ≥ 5",
    met: pass((r) => r.steps >= 5)
  },
  {
    id: "G2",
    label: "Aktivitas ≥ 3",
    met: pass((r) => r.activities >= 3)
  },
  {
    id: "G3",
    label: "Item asesmen ≥ 8",
    met: pass((r) => r.assessmentItems >= 8)
  },
  {
    id: "G4",
    label: "Tujuan ≥ 3 dan semua tercakup aktivitas",
    met: pass((r) => r.objectives >= 3 && r.coveredObjectives === r.objectives)
  },
  {
    id: "G5",
    label: "Bahasa dalam batas kata/kalimat kelas",
    met: pass((r) => r.wordsPerSentence <= r.languageLimit)
  },
  {
    id: "G6",
    label: "Tanpa duplikasi persis antar paket",
    met: pass((r) => (duplicateGroups.get(r.fingerprint)?.length ?? 1) === 1)
  },
  {
    id: "G7",
    label: "Aset tidak dipakai ulang lintas kelas",
    met: pass((r) => r.assetHashes.every((hash) => (assetGroups.get(hash)?.length ?? 1) === 1))
  },
  {
    id: "G8",
    label: "`curriculumRefs` terisi",
    met: pass((r) => r.curriculumRefs > 0)
  },
  {
    id: "G9",
    label: "Alt text lengkap",
    met: pass((r) => r.altOk)
  },
  {
    id: "G10",
    label: "Sudah direview manusia",
    met: pass((r) => r.reviewStatus !== "draft")
  },
  {
    id: "G11",
    label: "Tidak ada opsi jawaban duplikat (teks persis)",
    met: pass((r) => !r.optionDuplicates)
  },
  {
    id: "G12",
    label: "Aktivitas tidak identik dengan paket lain",
    met: pass((r) => (activityGroups.get(r.activityFingerprint)?.length ?? 1) === 1)
  }
];

const byGrade = new Map();
for (const record of records) {
  const bucket = byGrade.get(record.grade) ?? {
    grade: record.grade,
    count: 0,
    steps: 0,
    activities: 0,
    items: 0,
    words: 0
  };
  bucket.count += 1;
  bucket.steps += record.steps;
  bucket.activities += record.activities;
  bucket.items += record.assessmentItems;
  bucket.words += record.wordsPerSentence;
  byGrade.set(record.grade, bucket);
}

const bySubject = new Map();
for (const record of records) {
  const bucket = bySubject.get(record.subjectLabel) ?? { count: 0, duplicates: 0 };
  bucket.count += 1;
  if (maxGroupSize(record) > 1) bucket.duplicates += 1;
  bySubject.set(record.subjectLabel, bucket);
}

const allCriteria = [
  (r) => r.steps >= 5,
  (r) => r.activities >= 3,
  (r) => r.assessmentItems >= 8,
  (r) => r.objectives >= 3 && r.coveredObjectives === r.objectives,
  (r) => r.wordsPerSentence <= r.languageLimit,
  (r) => (duplicateGroups.get(r.fingerprint)?.length ?? 1) === 1,
  (r) => r.assetHashes.every((hash) => (assetGroups.get(hash)?.length ?? 1) === 1),
  (r) => r.curriculumRefs > 0,
  (r) => r.altOk,
  (r) => r.reviewStatus !== "draft",
  (r) => !r.optionDuplicates,
  (r) => (activityGroups.get(r.activityFingerprint)?.length ?? 1) === 1
];
const fullyCompliant = records.filter((record) =>
  allCriteria.every((criterion) => criterion(record))
).length;

const coverage = {
  total,
  fullCoverage: pass((r) => r.objectives > 0 && r.coveredObjectives === r.objectives),
  zeroCoverage: pass((r) => r.coveredObjectives === 0),
  partialCoverage: pass((r) => r.coveredObjectives > 0 && r.coveredObjectives < r.objectives)
};

const lines = [];
lines.push(`# Analisis Gap Kualitas Konten — ${date}`);
lines.push("");
lines.push(`**Status:** \`ANALISIS\` — bukan approval. Angka dihasilkan dari pembacaan ${total} paket aktual per ${date}.`);
lines.push("**Standar acuan:** kedalaman, asesmen, keselarasan, bahasa, diferensiasi, aksesibilitas.");
lines.push("");
lines.push("## Ringkasan");
lines.push("");
lines.push(`- Total paket: **${total}**`);
lines.push(`- Paket yang memenuhi seluruh G1–G12: **${fullyCompliant}/${total}**`);
lines.push(`- Paket dalam grup duplikasi persis: **${duplicatePackages}** (${duplicates.length} grup)`);
lines.push(`- Paket dengan aktivitas identik lintas paket: **${activityDuplicatePackages}** (${activityDuplicates.length} grup)`);
lines.push(`- Aset dipakai ulang lintas paket: **${reusedAssets.length}** hash`);
lines.push(`- Tujuan tercakup penuh: **${coverage.fullCoverage}/${total}** · sebagian: **${coverage.partialCoverage}** · nol: **${coverage.zeroCoverage}**`);
lines.push(`- Aset unik: **${uniqueAssetCount}** hash untuk ${total} paket`);
lines.push("");
lines.push("## Temuan khusus");
lines.push("");
const depthCompliant = pass((r) => r.steps >= 5 && r.activities >= 3 && r.assessmentItems >= 8);
lines.push(`- Paket yang memenuhi G1–G3 (≥5 langkah eksplorasi, ≥3 aktivitas, ≥8 item asesmen): **${depthCompliant}/${total}**.`);
lines.push(`- Opsi jawaban duplikat: ${optionDuplicatePackages.length === 0 ? "tidak ada" : optionDuplicatePackages.map((id) => `\`${id}\``).join(", ")}.`);
lines.push(`- Opsi yang hanya berbeda kapitalisasi (bukan duplikat — pastikan perbedaan itu memang yang diuji): ${optionCaseOnlyPackages.length === 0 ? "tidak ada" : optionCaseOnlyPackages.map((id) => `\`${id}\``).join(", ")}.`);
lines.push(`- Tujuan tercakup sebagian: **${partialCoveragePackages.length} paket**${partialCoveragePackages.length > 0 ? ` — contoh: ${partialCoveragePackages.slice(0, 6).map((id) => `\`${id}\``).join(", ")}` : ""}.`);
lines.push(`- Duplikasi penuh: **${duplicates.length} grup** (${duplicatePackages} paket); aktivitas identik: **${activityDuplicates.length} grup** (${activityDuplicatePackages} paket).`);
lines.push("");
lines.push("## Gap terhadap standar");
lines.push("");
lines.push("| ID | Kriteria | Lulus | Gagal | % Lulus |");
lines.push("|---|---|---:|---:|---:|");
for (const criterion of criteria) {
  lines.push(
    `| ${criterion.id} | ${criterion.label} | ${criterion.met} | ${total - criterion.met} | ${Math.round((criterion.met / total) * 100)}% |`
  );
}
lines.push("");
lines.push("## Rata-rata per kelas");
lines.push("");
lines.push("| Kelas | Paket | Langkah | Aktivitas | Item asesmen | Kata/kalimat |");
lines.push("|---|---:|---:|---:|---:|---:|");
for (const bucket of [...byGrade.values()].sort((a, b) => a.grade - b.grade)) {
  lines.push(
    `| ${bucket.grade} | ${bucket.count} | ${(bucket.steps / bucket.count).toFixed(1)} | ${(bucket.activities / bucket.count).toFixed(1)} | ${(bucket.items / bucket.count).toFixed(1)} | ${(bucket.words / bucket.count).toFixed(1)} |`
  );
}
lines.push("");
lines.push("## Duplikasi per mapel");
lines.push("");
lines.push("| Mapel | Paket | Paket duplikat (penuh/aktivitas) |");
lines.push("|---|---:|---:|");
for (const [subject, bucket] of [...bySubject.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  lines.push(`| ${subject} | ${bucket.count} | ${bucket.duplicates} |`);
}
lines.push("");
lines.push("## Grup duplikasi persis (prioritas diferensiasi)");
lines.push("");
if (duplicates.length === 0) {
  lines.push("- Tidak ada duplikasi persis.");
} else {
  for (const group of duplicates.slice(0, 30)) {
    lines.push(
      `- ${group.map((record) => `\`${record.packageId}\` (Kelas ${record.grade})`).join(" = ")}`
    );
  }
  if (duplicates.length > 30) {
    lines.push(`- ... dan ${duplicates.length - 30} grup lainnya (lihat JSON).`);
  }
}
lines.push("");
lines.push("## Grup aktivitas identik (prioritas diferensiasi)");
lines.push("");
if (activityDuplicates.length === 0) {
  lines.push("- Tidak ada aktivitas identik.");
} else {
  for (const group of activityDuplicates.slice(0, 30)) {
    lines.push(
      `- ${group.map((record) => `\`${record.packageId}\` (Kelas ${record.grade})`).join(" = ")}`
    );
  }
  if (activityDuplicates.length > 30) {
    lines.push(`- ... dan ${activityDuplicates.length - 30} grup lainnya (lihat JSON).`);
  }
}
lines.push("");
lines.push("## Paket dengan prioritas tertinggi");
lines.push("");
const priority = records
  .map((record) => {
    const groupSize = maxGroupSize(record);
    const gaps = [
      record.steps < 5,
      record.activities < 3,
      record.assessmentItems < 8,
      record.objectives < 3 || record.coveredObjectives < record.objectives,
      record.wordsPerSentence > record.languageLimit,
      groupSize > 1,
      record.curriculumRefs === 0,
      record.reviewStatus === "draft"
    ].filter(Boolean).length;
    return { record, gaps, groupSize };
  })
  .sort((a, b) => b.gaps - a.gaps || b.groupSize - a.groupSize || a.record.packageId.localeCompare(b.record.packageId));
lines.push("| packageId | Kelas | Mapel | Langkah | Aktivitas | Item | Gap | Duplikat |");
lines.push("|---|---:|---|---:|---:|---:|---:|---:|");
for (const item of priority.slice(0, 40)) {
  lines.push(
    `| \`${item.record.packageId}\` | ${item.record.grade} | ${item.record.subjectLabel} | ${item.record.steps} | ${item.record.activities} | ${item.record.assessmentItems} | ${item.gaps} | ${item.groupSize > 1 ? item.groupSize : "-"} |`
  );
}
lines.push("");
lines.push("## Rekomendasi urutan perbaikan");
lines.push("");
lines.push("1. **Diferensiasi** — pecah grup duplikasi persis; bedakan teks, contoh, dan asesmen per kelas.");
lines.push("2. **Kedalaman** — naikkan eksplorasi menjadi 5+ langkah dan tambah aktivitas ketiga (remediasi/pengayaan).");
lines.push("3. **Asesmen** — minimal 8 item per paket, pengecoh masuk akal, umpan balik per jawaban.");
lines.push("4. **Keselarasan** — pastikan setiap tujuan punya bukti di aktivitas/asesmen.");
lines.push("5. **Bahasa & aset** — sesuaikan panjang kalimat per kelas; kurangi pemakaian ulang aset yang identik.");
lines.push("6. **Review manusia** — R1–R12 setelah perbaikan; `curriculumRefs` menunggu D6.");
lines.push("");

ensureWritable([outMd, outJson], { force });
writeFileSync(outMd, lines.join("\n"));
writeFileSync(
  outJson,
  `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    criteria,
    coverage,
    records,
    duplicateGroups: duplicates.map((group) => group.map((r) => r.packageId)),
    activityGroups: activityDuplicates.map((group) => group.map((r) => r.packageId))
  }, null, 2)}\n`
);

console.log(`report: ${outMd}`);
console.log(
  `gap: ${total} paket; duplikat penuh ${duplicatePackages}; aktivitas identik ${activityDuplicatePackages}; coverage penuh ${coverage.fullCoverage}; G1 ${criteria[0].met}, G3 ${criteria[2].met}, G12 ${criteria[11].met}`
);
