#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const packagesDir = path.join(process.cwd(), "content", "packages");
const apply = process.argv.includes("--apply");
const onlyArg = process.argv.find((arg) => arg.startsWith("--only="));
const only = onlyArg ? onlyArg.slice("--only=".length) : null;

function faseForGrade(grade) {
  if (!Number.isInteger(grade) || grade < 1 || grade > 6) {
    throw new Error(`gradeLevels tidak valid: ${grade}`);
  }
  if (grade <= 2) return "fase-a";
  if (grade <= 4) return "fase-b";
  return "fase-c";
}

function refFor(fase) {
  return { framework: "kurikulum-merdeka", id: fase, version: "2024" };
}

function sameRef(a, b) {
  return a?.framework === b.framework && a?.id === b.id && a?.version === b.version;
}

const packageIds = readdirSync(packagesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

let written = 0;
let unchanged = 0;
const conflicts = [];

for (const packageId of packageIds) {
  if (only && !packageId.includes(only)) continue;
  const manifestPath = path.join(packagesDir, packageId, "manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const desired = [refFor(faseForGrade(manifest.gradeLevels?.[0]))];
  const current = manifest.curriculumRefs ?? [];

  if (current.length === 1 && sameRef(current[0], desired[0])) {
    unchanged += 1;
    continue;
  }
  if (current.length > 0) {
    conflicts.push(`${packageId}: ${JSON.stringify(current)}`);
    continue;
  }

  manifest.curriculumRefs = desired;
  if (apply) {
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  }
  written += 1;
  console.log(`${apply ? "isi" : "dry-run"} ${packageId} -> ${desired[0].id}`);
}

console.log(
  JSON.stringify(
    {
      mode: apply ? "applied" : "dry-run",
      packages: packageIds.length,
      written,
      unchanged,
      conflicts: conflicts.length,
      conflictDetails: conflicts
    },
    null,
    2
  )
);
if (conflicts.length > 0) process.exitCode = 1;
