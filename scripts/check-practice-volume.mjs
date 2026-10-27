#!/usr/bin/env node
/**
 * T-092 — Pintau volume latihan: setiap aktivitas dinilai harus memuat jumlah item
 * dalam rentang yang ditetapkan per tingkatan kelas.
 *
 * Pemakaian: node scripts/check-practice-volume.mjs            # laporan semua kelas
 *            node scripts/check-practice-volume.mjs kelas3     # laporan satu kelas
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const TARGETS = {
  kelas1: { questions: 5, pairs: 5, items: 5 },
  kelas2: { questions: 5, pairs: 5, items: 5 },
  kelas3: { questions: 6, pairs: 6, items: 5 },
  kelas4: { questions: 6, pairs: 6, items: 5 },
  kelas5: { questions: 6, pairs: 6, items: 5 },
  kelas6: { questions: 6, pairs: 6, items: 5 }
};
const CEILING = 10;

const only = process.argv[2];
const root = path.resolve("content/packages");
const violations = [];
const summary = [];

for (const grade of Object.keys(TARGETS)) {
  if (only && only !== grade) continue;
  const target = TARGETS[grade];
  const counts = { quiz: 0, matching: 0, ordering: 0 };
  for (const dir of readdirSync(root).filter((d) => d.startsWith(`${grade}-`)).sort()) {
    const actsDir = path.join(root, dir, "activities");
    for (const file of readdirSync(actsDir).filter((f) => f.endsWith(".json")).sort()) {
      const activity = JSON.parse(readFileSync(path.join(actsDir, file), "utf8"));
      const label = `${dir}/${file}`;
      if (activity.type === "multiple-choice") {
        const n = activity.assessmentConfig?.questions?.length ?? 0;
        counts.quiz += 1;
        if (n < target.questions) violations.push(`${label}: kuis ${n} soal (min ${target.questions})`);
        else if (n > CEILING) violations.push(`${label}: kuis ${n} soal (maks ${CEILING})`);
      } else if (activity.type === "matching") {
        const n = (activity.interactionConfig?.pairs ?? []).length;
        counts.matching += 1;
        if (n < target.pairs) violations.push(`${label}: mencocokkan ${n} pasangan (min ${target.pairs})`);
        else if (n > CEILING) violations.push(`${label}: mencocokkan ${n} pasangan (maks ${CEILING})`);
      } else if (activity.type === "ordering") {
        const n = (activity.interactionConfig?.items ?? []).length;
        counts.ordering += 1;
        if (n < target.items) violations.push(`${label}: mengurutkan ${n} langkah (min ${target.items})`);
        else if (n > CEILING) violations.push(`${label}: mengurutkan ${n} langkah (maks ${CEILING})`);
      }
    }
  }
  summary.push(`${grade}: kuis ${counts.quiz}, mencocokkan ${counts.matching}, mengurutkan ${counts.ordering}`);
}

console.log(summary.join("\n"));
if (violations.length > 0) {
  console.log(`\nDI BAWAT TARGET (${violations.length}):`);
  for (const violation of violations) console.log(`  - ${violation}`);
  process.exit(1);
}
console.log("\nSemua aktivitas dinilai berada dalam rentang target.");
