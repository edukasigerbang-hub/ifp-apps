#!/usr/bin/env node
/**
 * Menerapkan perbaikan bertarget pada item latihan yang sudah terpasang.
 *
 * Dipakai untuk membetulkan soal/pasangan yang faktanya tidak didukung materi
 * paket (atau kalimatnya melampaui teks). Skrip TIDAK menambah/menghapus item:
 * hanya mengganti teks pada id yang sudah ada, sehingga jumlah item, optionId,
 * dan posisi kunci yang sudah disebar tetap.
 *
 * Pemakaian:
 *   node scripts/apply-item-patches.mjs scripts/data/item-patches-2026-10-27.json [--apply]
 *
 * Format berkas patch:
 * {
 *   "packages": {
 *     "<packageId>": {
 *       "quiz": [
 *         {
 *           "questionId": "soal-...",
 *           "prompt": "…opsional…",
 *           "options": { "<optionId>": "teks baru" },
 *           "correctResponse": "…opsional…"
 *         }
 *       ],
 *       "matching": [
 *         { "pairId": "pasangan-...", "left": "…", "right": "…" }
 *       ]
 *     }
 *   }
 * }
 *
 * Default kering (tidak menulis). `--apply` menulis atomik.
 */
import { existsSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

const PACKAGES_DIR = path.resolve("content/packages");
const MAX_TEXT = 2000;
const MAX_OPTION = 500;
const MAX_PAIR = 200;

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const patchFile = args.find((arg) => !arg.startsWith("--"));

if (!patchFile) {
  console.error("Pemakaian: node scripts/apply-item-patches.mjs <berkas-patch.json> [--apply]");
  process.exit(2);
}

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const writeJsonAtomic = (file, value) => {
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  renameSync(tmp, file);
};

const report = { packages: 0, quizPatched: 0, matchingPatched: 0, changedFiles: 0, errors: [] };
const patches = readJson(patchFile);

for (const [packageId, patch] of Object.entries(patches.packages ?? {})) {
  report.packages += 1;
  const activitiesDir = path.join(PACKAGES_DIR, packageId, "activities");
  try {
    if (!existsSync(activitiesDir)) {
      throw new Error(`${packageId}: folder activities tidak ditemukan`);
    }
    const files = readdirSync(activitiesDir).filter((file) => file.endsWith(".json"));

    for (const file of files) {
      const filePath = path.join(activitiesDir, file);
      const activity = readJson(filePath);
      let changed = false;

      if (activity.type === "multiple-choice" && Array.isArray(patch.quiz) && patch.quiz.length > 0) {
        const questions = activity.assessmentConfig?.questions ?? [];
        for (const change of patch.quiz) {
          const question = questions.find((entry) => entry.questionId === change.questionId);
          if (!question) {
            throw new Error(`${packageId}: questionId tidak ditemukan -> ${change.questionId}`);
          }
          if (typeof change.prompt === "string") {
            const prompt = change.prompt.trim();
            if (!prompt || prompt.length > MAX_TEXT) {
              throw new Error(`${packageId}: prompt tidak valid pada ${change.questionId}`);
            }
            if (question.prompt !== prompt) {
              question.prompt = prompt;
              changed = true;
            }
          }
          for (const [optionId, text] of Object.entries(change.options ?? {})) {
            const option = (question.options ?? []).find((entry) => entry.optionId === optionId);
            if (!option) {
              throw new Error(`${packageId}: optionId ${optionId} tidak ada di ${change.questionId}`);
            }
            const nextText = String(text).trim();
            if (!nextText || nextText.length > MAX_OPTION) {
              throw new Error(`${packageId}: teks opsi tidak valid (${optionId})`);
            }
            if (option.text !== nextText) {
              option.text = nextText;
              changed = true;
            }
          }
          const texts = (question.options ?? []).map((option) => option.text.toLowerCase());
          if (new Set(texts).size !== texts.length) {
            throw new Error(`${packageId}: opsi menjadi duplikat pada ${change.questionId}`);
          }
          if (typeof change.correctResponse === "string") {
            if (!(question.options ?? []).some((option) => option.optionId === change.correctResponse)) {
              throw new Error(
                `${packageId}: correctResponse ${change.correctResponse} tidak ada di ${change.questionId}`
              );
            }
            if (question.correctResponse !== change.correctResponse) {
              question.correctResponse = change.correctResponse;
              changed = true;
            }
          }
          report.quizPatched += 1;
        }
      }

      if (activity.type === "matching" && Array.isArray(patch.matching) && patch.matching.length > 0) {
        const pairs = activity.interactionConfig?.pairs ?? [];
        for (const change of patch.matching) {
          const pair = pairs.find((entry) => entry.pairId === change.pairId);
          if (!pair) {
            throw new Error(`${packageId}: pairId tidak ditemukan -> ${change.pairId}`);
          }
          if (typeof change.left === "string") {
            const left = change.left.trim();
            if (!left || left.length > MAX_PAIR) {
              throw new Error(`${packageId}: left tidak valid (${change.pairId})`);
            }
            if (pair.left !== left) {
              pair.left = left;
              changed = true;
            }
          }
          if (typeof change.right === "string") {
            const right = change.right.trim();
            if (!right || right.length > MAX_PAIR) {
              throw new Error(`${packageId}: right tidak valid (${change.pairId})`);
            }
            if (pair.right !== right) {
              pair.right = right;
              changed = true;
            }
          }
          const lefts = pairs.map((entry) => String(entry.left).toLowerCase());
          if (new Set(lefts).size !== lefts.length) {
            throw new Error(`${packageId}: left menjadi duplikat (${change.pairId})`);
          }
          report.matchingPatched += 1;
        }
      }

      if (changed) {
        report.changedFiles += 1;
        if (apply) {
          writeJsonAtomic(filePath, activity);
        }
      }
    }
  } catch (error) {
    report.errors.push(error instanceof Error ? error.message : String(error));
  }
}

console.log(
  JSON.stringify(
    {
      mode: apply ? "apply" : "dry-run",
      packages: report.packages,
      quizPatched: report.quizPatched,
      matchingPatched: report.matchingPatched,
      changedFiles: report.changedFiles,
      errors: report.errors
    },
    null,
    2
  )
);

if (report.errors.length > 0) {
  process.exit(1);
}
