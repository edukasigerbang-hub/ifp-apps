#!/usr/bin/env node
/**
 * Menyiarkan posisi kunci jawaban pada soal pilihan ganda.
 *
 * Akar masalah: 528 dari 694 soal (76%) menaruh opsi benar pada posisi pertama,
 * dan 91 paket menempatkannya di posisi yang sama untuk semua soalnya — petunjuk
 * mekanis yang membuat kuis dapat dijawab tanpa memahami isi.
 *
 * Transformasi: opsi disusun ulang (bukan isinya) sehingga kunci mendarat di
 * (offsetPaket + ordinalSoal) % jumlahOpsi. optionId ikut bergerak bersama teksnya,
 * jadi kunci jawaban (correctResponse) tidak berubah dan penilaian tetap sama.
 * Deterministik dan idempoten.
 *
 * Pemakaian: node scripts/spread-answer-positions.mjs [--apply]
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const apply = process.argv.includes("--apply");
const packagesRoot = path.resolve("content/packages");

const dirs = readdirSync(packagesRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^kelas[1-6]-/.test(entry.name))
  .map((entry) => entry.name)
  .sort();

function hashId(value) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function distribute(options, correctIds, target) {
  if (options.length < 3) return options;
  const first = correctIds[0];
  const currentIndex = options.findIndex((option) => option.optionId === first);
  if (currentIndex < 0 || currentIndex === target) return options;
  const rest = options.filter((option) => option.optionId !== first);
  return [...rest.slice(0, target), options[currentIndex], ...rest.slice(target)];
}

let packagesTouched = 0;
let questionsTouched = 0;
let skippedMulti = 0;
const before = {};
const after = {};

for (const dirName of dirs) {
  const dir = path.join(packagesRoot, dirName);
  const activityFiles = readdirSync(path.join(dir, "activities"))
    .filter((file) => file.endsWith(".json"))
    .sort();
  let ordinal = 0;
  let offset = hashId(dirName);
  let packageChanged = false;

  activityFiles.forEach((file) => {
    const fileLabel = `${dirName}/${file}`;
    const activity = JSON.parse(readFileSync(path.join(dir, "activities", file), "utf8"));
    if (activity.type !== "multiple-choice") return;
    let changed = false;

    for (const question of activity.assessmentConfig?.questions ?? []) {
      const options = question.options ?? [];
      if (options.length < 3) {
        ordinal += 1;
        continue;
      }
      const correctIds = Array.isArray(question.correctResponse)
        ? question.correctResponse
        : [question.correctResponse];
      if (Array.isArray(question.correctResponse)) {
        skippedMulti += 1;
      }
      const currentIndex = options.findIndex((option) => option.optionId === correctIds[0]);
      const key = String(currentIndex);
      before[key] = (before[key] ?? 0) + 1;

      const target = (offset + ordinal) % options.length;
      const next = distribute(options, correctIds, target);
      const afterIndex = next.findIndex((option) => option.optionId === correctIds[0]);
      after[String(afterIndex)] = (after[String(afterIndex)] ?? 0) + 1;

      if (next !== options) {
        question.options = next;
        changed = true;
        questionsTouched += 1;
      }
      ordinal += 1;
    }

    if (changed) {
      packageChanged = true;
      if (apply) {
        writeFileSync(
          path.join(dir, "activities", file),
          `${JSON.stringify(activity, null, 2)}\n`
        );
      }
    }
  });

  if (packageChanged) packagesTouched += 1;
}

console.log(
  JSON.stringify(
    {
      mode: apply ? "APPLY" : "DRY-RUN",
      packages: dirs.length,
      packagesTouched,
      questionsTouched,
      skippedMultiAnswer: skippedMulti,
      keyIndexBefore: before,
      keyIndexAfter: after
    },
    null,
    2
  )
);
