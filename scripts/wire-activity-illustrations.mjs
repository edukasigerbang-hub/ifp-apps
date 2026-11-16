import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PLAN } from "./generate-activity-illustrations.mjs";

const APPLY = process.argv.includes("--apply");
const PACKAGES_ROOT = path.join("content", "packages");
const ACTIVITY_FILE = "activity-001.json";

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function describe(entry) {
  return `${entry.packageDir}/${entry.file}`;
}

let changed = 0;
let unchanged = 0;
const failures = [];

for (const entry of PLAN) {
  const packageDir = path.join(PACKAGES_ROOT, entry.packageDir);
  const assetFile = path.join(packageDir, "assets", entry.file);
  const assetPath = `assets/${entry.file}`;

  if (!existsSync(assetFile)) {
    failures.push({ entry, reason: `aset belum ada: ${assetFile}` });
    continue;
  }

  const bytes = readFileSync(assetFile);
  const sha256 = createHash("sha256").update(bytes).digest("hex");

  const manifestFile = path.join(packageDir, "manifest.json");
  const manifest = readJson(manifestFile);
  const existing = manifest.assets.find((asset) => asset.path === assetPath);
  let manifestChanged = false;
  if (existing) {
    if (existing.mediaType !== "image/png" || existing.sizeBytes !== bytes.length || existing.sha256 !== sha256) {
      existing.mediaType = "image/png";
      existing.sizeBytes = bytes.length;
      existing.sha256 = sha256;
      manifestChanged = true;
    }
  } else {
    manifest.assets.push({ path: assetPath, mediaType: "image/png", sizeBytes: bytes.length, sha256 });
    manifestChanged = true;
  }

  const activityFile = path.join(packageDir, "activities", ACTIVITY_FILE);
  const activity = readJson(activityFile);
  if (activity.type !== "exploration" || !Array.isArray(activity.interactionConfig?.steps)) {
    failures.push({ entry, reason: `${ACTIVITY_FILE} bukan aktivitas eksplorasi berlangkah` });
    continue;
  }

  let activityChanged = false;
  if (activity.assets.length !== 1 || activity.assets[0] !== assetPath) {
    activity.assets = [assetPath];
    activityChanged = true;
  }
  for (const step of activity.interactionConfig.steps) {
    const previousAlt = step.altText;
    if (step.reveal === previousAlt && previousAlt !== entry.alt) {
      step.reveal = entry.alt;
      activityChanged = true;
    }
    if (step.assetPath !== assetPath || step.altText !== entry.alt) {
      step.assetPath = assetPath;
      step.altText = entry.alt;
      activityChanged = true;
    }
  }
  if (!activity.accessibilityMetadata) activity.accessibilityMetadata = {};
  if (activity.accessibilityMetadata.altText !== entry.alt) {
    activity.accessibilityMetadata.altText = entry.alt;
    activityChanged = true;
  }

  if (!manifestChanged && !activityChanged) {
    unchanged += 1;
    continue;
  }
  changed += 1;
  if (APPLY) {
    if (manifestChanged) writeJson(manifestFile, manifest);
    if (activityChanged) writeJson(activityFile, activity);
    console.log(`wired ${describe(entry)}`);
  } else {
    console.log(`akan ${describe(entry)} · manifest=${manifestChanged ? "ubah" : "tetap"} · langkah=${activityChanged ? "ubah" : "tetap"}`);
  }
}

for (const failure of failures) {
  console.error(`GAGAL ${describe(failure.entry)} · ${failure.reason}`);
}
if (failures.length > 0) process.exitCode = 1;

console.log(
  `\n${changed} paket ${APPLY ? "terhubung" : "perlu dihubungkan"} · ${unchanged} sudah sinkron${
    failures.length ? ` · ${failures.length} gagal` : ""
  }`
);
if (!APPLY) console.log("jalankan dengan --apply untuk menulis perubahan.");
