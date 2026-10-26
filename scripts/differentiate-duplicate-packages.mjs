import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const packagesRoot = path.resolve("content/packages");
const apply = process.argv.includes("--apply");

const configs = {
  "kelas2-pai-b08-adab": {
    summary: "Membiasakan adab baik di rumah, sekolah, dan tempat umum.",
    step: {
      prompt: "Bagaimana adab saat bertamu ke rumah orang?",
      reveal: "Mengucapkan salam dan menunggu izin masuk.",
      hint: "Bersikap sopan dan sabar."
    },
    pairs: [
      { left: "Bertamu", right: "Mengucapkan salam dan menunggu izin" },
      { left: "Di tempat umum", right: "Menjaga suara dan kebersihan" }
    ],
    questions: [
      {
        prompt: "Saat berkunjung ke rumah teman, kita ...",
        options: ["Mengucapkan salam", "Langsung masuk", "Berteriak", "Mengambil barang"],
        correctIndex: 0
      }
    ]
  },
  "kelas2-pjok-b08-kesehatan": {
    summary: "Menjaga kesehatan dan kebersihan di rumah, sekolah, dan tempat bermain.",
    step: {
      prompt: "Mengapa mencuci tangan harus memakai sabun?",
      reveal: "Agar kuman hilang dan tubuh tetap sehat.",
      hint: "Gunakan air bersih dan sabun."
    },
    pairs: [
      { left: "Cuci tangan dengan sabun", right: "Menghilangkan kuman" },
      { left: "Menutup mulut saat bersin", right: "Mencegah penyebaran kuman" }
    ],
    questions: [
      {
        prompt: "Saat bersin, kita sebaiknya ...",
        options: ["Menutup mulut dan hidung", "Menghadap teman", "Berteriak", "Membiarkan saja"],
        correctIndex: 0
      }
    ]
  },
  "kelas2-seni-rupa-b07-apresiasi": {
    summary: "Mengamati, menjelaskan, dan menghargai karya seni dengan alasan yang sopan.",
    step: {
      prompt: "Bagaimana cara memberi saran pada karya teman?",
      reveal: "Dengan kata sopan dan alasan yang jelas.",
      hint: "Mulai dari hal yang sudah bagus."
    },
    pairs: [
      { left: "Mengamati", right: "Langkah pertama apresiasi" },
      { left: "Memberi saran", right: "Dengan sopan dan beralasan" }
    ],
    questions: [
      {
        prompt: "Saat memberi saran pada karya teman, kita ...",
        options: ["Bersikap sopan", "Mengejek", "Merusak karya", "Menyembunyikan karya"],
        correctIndex: 0
      }
    ]
  }
};

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function activityFiles(dir) {
  return readdirSync(path.join(dir, "activities"))
    .filter((file) => file.endsWith(".json"))
    .sort();
}

function applyConfig(packageId, config) {
  const dir = path.join(packagesRoot, packageId);
  const lessonFile = readdirSync(path.join(dir, "lessons")).find((file) => file.endsWith(".json"));
  const lessonPath = path.join(dir, "lessons", lessonFile);
  const lesson = readJson(lessonPath);
  lesson.summary = config.summary;

  let stepApplied = false;
  let pairsApplied = 0;
  let questionsApplied = 0;

  for (const file of activityFiles(dir)) {
    const filePath = path.join(dir, "activities", file);
    const activity = readJson(filePath);
    let changed = false;

    if (activity.type === "exploration" && !stepApplied) {
      const altText = lesson.accessibilityMetadata?.altText;
      const assetPath = activity.interactionConfig?.steps?.[0]?.assetPath;
      activity.interactionConfig.steps.push({
        prompt: config.step.prompt,
        reveal: config.step.reveal,
        hint: config.step.hint,
        ...(assetPath ? { assetPath } : {}),
        ...(altText ? { altText } : {})
      });
      stepApplied = true;
      changed = true;
    }

    if (activity.type === "matching" && config.pairs.length > 0) {
      const existing = new Set(activity.interactionConfig.pairs.map((pair) => pair.left.toLowerCase()));
      for (const pair of config.pairs) {
        if (existing.has(pair.left.toLowerCase())) continue;
        activity.interactionConfig.pairs.push({
          pairId: `pasangan-kelas2-${activity.interactionConfig.pairs.length + 1}`,
          left: pair.left,
          right: pair.right
        });
        pairsApplied += 1;
        changed = true;
      }
    }

    if (activity.type === "multiple-choice" && config.questions.length > 0) {
      const existing = new Set(
        activity.assessmentConfig.questions.map((question) => question.prompt.toLowerCase())
      );
      for (const question of config.questions) {
        if (existing.has(question.prompt.toLowerCase())) continue;
        const questionId = `soal-kelas2-${activity.assessmentConfig.questions.length + 1}`;
        const options = question.options.map((text, index) => ({
          optionId: `opsi-kelas2-${activity.assessmentConfig.questions.length + 1}-${index + 1}`,
          text
        }));
        activity.assessmentConfig.questions.push({
          questionId,
          prompt: question.prompt,
          responseType: "single-choice",
          options,
          correctResponse: options[question.correctIndex].optionId
        });
        questionsApplied += 1;
        changed = true;
      }
    }

    if (apply && changed) writeJson(filePath, activity);
  }

  if (apply) writeJson(lessonPath, lesson);
  return { packageId, stepApplied, pairsApplied, questionsApplied };
}

const results = Object.entries(configs).map(([packageId, config]) => applyConfig(packageId, config));
console.log(JSON.stringify({ results }));
console.log(apply ? "mode: APPLY" : "mode: DRY RUN (tambahkan --apply untuk menulis)");
