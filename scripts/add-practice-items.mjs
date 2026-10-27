#!/usr/bin/env node
/**
 * T-092 — Memasukkan soal kuis, pasangan mencocokkan, dan langkah mengurutkan
 * hasil penulisan per kelas.
 *
 * Aturan yang dijaga:
 *  - Item baru berasal dari berkas data yang ditulis tangan per paket, bukan template.
 *  - posisi kunci soal baru ditentukan (hash(packageId) + ordinal) % jumlahOpsi, sama seperti
 *    scripts/spread-answer-positions.mjs, sehingga tambahan soal tidak memunculkan bias posisi.
 *  - Idempoten: soal/pasangan dengan prompt atau sisi kiri yang sudah ada dilewati.
 *  - Kering-diam secara default; --apply menulis atomik.
 *
 * Pemakaian: node scripts/add-practice-items.mjs scripts/data/practice-items-kelas1-2026-10-27.json [--apply]
 */
import { readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const dataPath = args.find((a) => !a.startsWith("--"));
const apply = args.includes("--apply");
if (!dataPath) {
  console.error("Berkas data wajib diberikan.");
  process.exit(1);
}

const packagesRoot = path.resolve("content/packages");
const data = JSON.parse(readFileSync(path.resolve(dataPath), "utf8"));

function hashId(value) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function slug(text, fallback) {
  const s = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32)
    .replace(/-+$/g, "");
  return s.length >= 3 ? s : fallback;
}

function writeAtomic(file, text) {
  if (!apply) return;
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, text);
  renameSync(tmp, file);
}

function activityFiles(dir) {
  return readdirSync(path.join(dir, "activities"))
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => ({ file: f, json: JSON.parse(readFileSync(path.join(dir, "activities", f), "utf8")) }));
}

const report = {
  mode: apply ? "APPLY" : "DRY-RUN",
  data: dataPath,
  packages: 0,
  quizAdded: 0,
  pairAdded: 0,
  orderingAdded: 0,
  skippedDuplicateQuiz: 0,
  skippedDuplicatePair: 0,
  errors: []
};

for (const [packageId, items] of Object.entries(data.packages ?? {})) {
  const dir = path.join(packagesRoot, packageId);
  let files;
  try {
    files = activityFiles(dir);
  } catch (error) {
    report.errors.push(`${packageId}: paket tidak ditemukan (${error.code ?? error.message})`);
    continue;
  }
  report.packages += 1;
  const offset = hashId(packageId);
  let touched = false;

  // --- soal kuis ---
  const quizEntries = files.filter(({ json }) => json.type === "multiple-choice" || json.type === "short-answer");
  if ((items.quiz ?? []).length > 0) {
    if (quizEntries.length === 0) {
      report.errors.push(`${packageId}: tidak ada aktivitas dinilai untuk ${items.quiz.length} soal`);
      continue;
    }
    const target = quizEntries[0];
    const activity = target.json;
    const questions = activity.assessmentConfig?.questions;
    if (!Array.isArray(questions)) {
      report.errors.push(`${packageId}: assessmentConfig.questions tidak ada di ${target.file}`);
      continue;
    }
    const existingPrompts = new Set(questions.map((q) => q.prompt.trim()));
    const existingIds = new Set(questions.map((q) => q.questionId));
    const changedQuestions = [];

    (items.quiz ?? []).forEach((item, index) => {
      const prompt = String(item.prompt).trim();
      if (existingPrompts.has(prompt)) {
        report.skippedDuplicateQuiz += 1;
        return;
      }
      if (!item.answer || typeof item.answer !== "string") {
        report.errors.push(`${packageId}: soal ke-${index + 1} tanpa jawaban`);
        return;
      }
      const distractors = (item.distractors ?? []).map((d) => String(d).trim()).filter(Boolean);
      if (prompt.length > 2000 || item.answer.length > 500 || distractors.some((d) => d.length > 500)) {
        report.errors.push(`${packageId}: soal ke-${index + 1} melebihi batas panjang teks`);
        return;
      }
      const texts = [item.answer.trim(), ...distractors];
      if (texts.length < 3) {
        report.errors.push(`${packageId}: soal ke-${index + 1} punya <3 opsi (bias posisi tidak dapat dihindari)`);
        return;
      }
      if (new Set(texts.map((t) => t.toLowerCase())).size !== texts.length) {
        report.errors.push(`${packageId}: soal ke-${index + 1} memuat opsi berulang`);
        return;
      }

      const questionId = item.id ?? `soal-${slug(prompt, `tambah-${questions.length + index + 1}`)}`;
      if (existingIds.has(questionId)) {
        report.errors.push(`${packageId}: questionId duplikat ${questionId}`);
        return;
      }
      const base = `opsi-${slug(questionId, "tambah")}`;
      const usedOptionIds = new Set();
      const optionIdFor = (text, ordinal) => {
        let id = `${base}-${ordinal}`;
        let guard = ordinal;
        while (usedOptionIds.has(id)) id = `${base}-${(guard += 1)}`;
        usedOptionIds.add(id);
        return id;
      };
      const options = texts.map((text, ordinal) => ({ optionId: optionIdFor(text, ordinal), text }));
      const correctIndex = 0;
      const targetIndex = (offset + questions.length + changedQuestions.length) % options.length;
      const correctOptionId = options[correctIndex].optionId;
      const rest = options.filter((o) => o.optionId !== correctOptionId);
      const ordered = [...rest.slice(0, targetIndex), options[correctIndex], ...rest.slice(targetIndex)];

      questions.push({
        questionId,
        prompt,
        responseType: activity.type === "short-answer" ? "text" : "single-choice",
        ...(activity.type === "short-answer"
          ? { correctResponse: item.answer.trim() }
          : { options: ordered, correctResponse: correctOptionId })
      });
      changedQuestions.push(questionId);
      existingPrompts.add(prompt);
      existingIds.add(questionId);
      report.quizAdded += 1;
    });

    if (changedQuestions.length > 0) {
      touched = true;
      writeAtomic(path.join(dir, "activities", target.file), `${JSON.stringify(activity, null, 2)}\n`);
    }
  }

  // --- langkah mengurutkan ---
  if ((items.ordering ?? []).length > 0) {
    const target = files.find(({ json }) => json.type === "ordering");
    if (!target) {
      report.errors.push(`${packageId}: tidak ada aktivitas ordering untuk ${items.ordering.length} langkah`);
      continue;
    }
    const activity = target.json;
    const items3 = activity.interactionConfig?.items;
    const order = activity.interactionConfig?.correctOrder;
    if (!Array.isArray(items3) || !Array.isArray(order)) {
      report.errors.push(`${packageId}: interactionConfig.items/correctOrder tidak ada di ${target.file}`);
      continue;
    }
    const existingTexts = new Set(items3.map((i) => String(i.text).trim().toLowerCase()));
    const existingItemIds = new Set(items3.map((i) => i.itemId));
    let added = 0;

    (items.ordering ?? []).forEach((item, index) => {
      const text = String(item.text).trim();
      if (items3.length + added + 1 > 12) {
        report.errors.push(`${packageId}: melewati plafon 12 langkah di ${target.file}`);
        return;
      }
      if (text.length < 1 || text.length > 200) {
        report.errors.push(`${packageId}: langkah ke-${index + 1} di luar batas 1-200 karakter`);
        return;
      }
      if (existingTexts.has(text.toLowerCase())) {
        report.skippedDuplicatePair += 1;
        return;
      }
      const anchor = String(item.afterItemId ?? "").trim();
      const anchorIndex = anchor === "" ? -1 : order.indexOf(anchor);
      if (anchor !== "" && anchorIndex < 0) {
        report.errors.push(`${packageId}: langkah ke-${index + 1} rujukan afterItemId tidak ada (${anchor})`);
        return;
      }
      const itemId = item.id ?? `langkah-${slug(text, `tambah-${items3.length + index + 1}`)}`;
      if (existingItemIds.has(itemId)) {
        report.errors.push(`${packageId}: itemId duplikat ${itemId}`);
        return;
      }
      const itemIndex = anchor === "" ? -1 : items3.findIndex((i) => i.itemId === anchor);
      items3.splice(itemIndex + 1, 0, { itemId, text });
      order.splice(anchorIndex + 1, 0, itemId);
      existingTexts.add(text.toLowerCase());
      existingItemIds.add(itemId);
      added += 1;
      report.orderingAdded += 1;
    });

    if (added > 0) {
      touched = true;
      writeAtomic(path.join(dir, "activities", target.file), `${JSON.stringify(activity, null, 2)}\n`);
    }
  }

  // --- pasangan mencocokkan ---
  if ((items.matching ?? []).length > 0) {
    const target = files.find(({ json }) => json.type === "matching");
    if (!target) {
      report.errors.push(`${packageId}: tidak ada aktivitas matching untuk ${items.matching.length} pasangan`);
      continue;
    }
    const activity = target.json;
    const pairs = activity.interactionConfig?.pairs;
    if (!Array.isArray(pairs)) {
      report.errors.push(`${packageId}: interactionConfig.pairs tidak ada di ${target.file}`);
      continue;
    }
    const existingLeft = new Set(pairs.map((p) => String(p.left).trim()));
    const existingIds = new Set(pairs.map((p) => p.pairId));
    let added = 0;

    (items.matching ?? []).forEach((item, index) => {
      const left = String(item.left).trim();
      const right = String(item.right).trim();
      if (existingLeft.has(left)) {
        report.skippedDuplicatePair += 1;
        return;
      }
      if (left.length < 1 || left.length > 200 || right.length < 1 || right.length > 200) {
        report.errors.push(`${packageId}: pasangan ke-${index + 1} di luar batas 1-200 karakter`);
        return;
      }
      if (pairs.length + added + 1 > 12) {
        report.errors.push(`${packageId}: melewati plafon 12 pasangan di ${target.file}`);
        return;
      }
      const pairId = item.id ?? `pasangan-${slug(left, `tambah-${pairs.length + index + 1}`)}`;
      if (existingIds.has(pairId)) {
        report.errors.push(`${packageId}: pairId duplikat ${pairId}`);
        return;
      }
      pairs.push({ pairId, left, right });
      existingLeft.add(left);
      existingIds.add(pairId);
      added += 1;
      report.pairAdded += 1;
    });

    if (added > 0) {
      touched = true;
      if (/^\s*Pasangkan/.test(activity.instructions ?? "")) {
        activity.instructions = "Pasangkan setiap petunjuk dengan jawaban yang tepat.";
      }
      writeAtomic(path.join(dir, "activities", target.file), `${JSON.stringify(activity, null, 2)}\n`);
    }
  }
}

console.log(JSON.stringify(report, null, 2));
