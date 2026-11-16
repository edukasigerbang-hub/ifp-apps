import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createCanvas, normalizeContent, toPng } from "./lib/illustrationKit.mjs";
import { PLAN as GRADE1 } from "./lib/activityPlans/kelas1.mjs";
import { PLAN as GRADE2 } from "./lib/activityPlans/kelas2.mjs";
import { PLAN as GRADE3 } from "./lib/activityPlans/kelas3.mjs";
import { PLAN as GRADE4 } from "./lib/activityPlans/kelas4.mjs";
import { PLAN as GRADE5 } from "./lib/activityPlans/kelas5.mjs";
import { PLAN as GRADE6 } from "./lib/activityPlans/kelas6.mjs";

export const PLAN = [...GRADE1, ...GRADE2, ...GRADE3, ...GRADE4, ...GRADE5, ...GRADE6];

const STEPS_PER_ACTIVITY = 5;
const APPLY = process.argv.includes("--apply");
const FILTER = process.argv.find((arg) => arg.startsWith("--filter="))?.slice("--filter=".length);
const PREVIEW_ROOT = ".tmp-aktivitas";

function assetFile(entry, index) {
  return `${entry.base}-${index + 1}.png`;
}

function checkPlan() {
  const seenDirs = new Set();
  const problems = [];
  for (const entry of PLAN) {
    if (seenDirs.has(entry.packageDir)) problems.push(`paket ganda: ${entry.packageDir}`);
    seenDirs.add(entry.packageDir);
    if (!entry.base) problems.push(`${entry.packageDir}: base kosong`);
    if (!entry.summaryAlt || entry.summaryAlt.length < 20) {
      problems.push(`${entry.packageDir}: summaryAlt terlalu pendek`);
    }
    if (entry.steps.length !== STEPS_PER_ACTIVITY) {
      problems.push(`${entry.packageDir}: ${entry.steps.length} langkah, harus ${STEPS_PER_ACTIVITY}`);
    }
    const alts = new Set(entry.steps.map((step) => step.alt));
    if (alts.size !== entry.steps.length) problems.push(`${entry.packageDir}: alt duplikat`);
    entry.steps.forEach((step, index) => {
      if (!step.alt || step.alt.length < 20) {
        problems.push(`${entry.packageDir} langkah ${index + 1}: alt terlalu pendek`);
      }
      if (typeof step.draw !== "function") {
        problems.push(`${entry.packageDir} langkah ${index + 1}: draw bukan fungsi`);
      }
    });
  }
  if (problems.length > 0) {
    console.error(problems.join("\n"));
    throw new Error(`${problems.length} masalah rencana ilustrasi`);
  }
}

function renderStep(entry, index) {
  const canvas = createCanvas();
  entry.steps[index].draw(canvas);
  return toPng(normalizeContent(canvas));
}

function main() {
  checkPlan();
  const entries = PLAN.filter((entry) => !FILTER || entry.packageDir.includes(FILTER) || entry.base.includes(FILTER));
  let totalBytes = 0;
  let totalFiles = 0;

  for (const entry of entries) {
    const targetDir = APPLY
      ? path.join("content", "packages", entry.packageDir, "assets")
      : path.join(PREVIEW_ROOT, entry.packageDir);
    mkdirSync(targetDir, { recursive: true });
    let packageBytes = 0;
    for (let index = 0; index < entry.steps.length; index += 1) {
      const png = renderStep(entry, index);
      packageBytes += png.length;
      writeFileSync(path.join(targetDir, assetFile(entry, index)), png);
      totalFiles += 1;
    }
    totalBytes += packageBytes;
    console.log(
      `${APPLY ? "wrote" : "preview"} ${entry.packageDir}/${entry.base}-1..${entry.steps.length}.png · ${(
        packageBytes / 1024
      ).toFixed(1)} KB`
    );
  }

  console.log(
    `\n${entries.length} paket · ${totalFiles} PNG · ${(totalBytes / 1024).toFixed(0)} KB total · ${
      APPLY ? "ditulis ke paket" : `pratinjau di ${PREVIEW_ROOT}/`
    }`
  );

  if (APPLY) {
    console.log("lanjut: npm run content:assets:wire -- --apply");
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
