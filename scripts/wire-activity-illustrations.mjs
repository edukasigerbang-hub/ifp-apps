import { createHash } from "node:crypto";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
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

function stepAssetPath(entry, index) {
  return `assets/${entry.base}-${index + 1}.png`;
}

function legacyAssetPath(entry) {
  return `assets/${entry.base}.png`;
}

let changed = 0;
let unchanged = 0;
const failures = [];

for (const entry of PLAN) {
  const packageDir = path.join(PACKAGES_ROOT, entry.packageDir);
  const assetPaths = entry.steps.map((_, index) => stepAssetPath(entry, index));
  const missing = assetPaths.filter((assetPath) => !existsSync(path.join(packageDir, assetPath)));
  if (missing.length > 0) {
    failures.push({ entry, reason: `aset belum ada: ${missing.join(", ")}` });
    continue;
  }

  const manifestFile = path.join(packageDir, "manifest.json");
  const manifest = readJson(manifestFile);
  const legacyPath = legacyAssetPath(entry);
  let manifestChanged = false;

  const withoutLegacy = manifest.assets.filter((asset) => asset.path !== legacyPath);
  if (withoutLegacy.length !== manifest.assets.length) {
    manifest.assets = withoutLegacy;
    manifestChanged = true;
  }

  entry.steps.forEach((_, index) => {
    const assetPath = assetPaths[index];
    const bytes = readFileSync(path.join(packageDir, assetPath));
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    const existing = manifest.assets.find((asset) => asset.path === assetPath);
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
  });

  const activityFile = path.join(packageDir, "activities", ACTIVITY_FILE);
  const activity = readJson(activityFile);
  const steps = activity.interactionConfig?.steps;
  if (activity.type !== "exploration" || !Array.isArray(steps) || steps.length !== entry.steps.length) {
    failures.push({ entry, reason: `${ACTIVITY_FILE} bukan aktivitas eksplorasi berlangkah ${entry.steps.length}` });
    continue;
  }

  let activityChanged = false;
  if (
    !Array.isArray(activity.assets) ||
    activity.assets.length !== assetPaths.length ||
    activity.assets.some((assetPath, index) => assetPath !== assetPaths[index])
  ) {
    activity.assets = [...assetPaths];
    activityChanged = true;
  }
  steps.forEach((step, index) => {
    const previousAlt = step.altText;
    const nextAlt = entry.steps[index].alt;
    if (step.reveal === previousAlt && previousAlt !== nextAlt) {
      step.reveal = nextAlt;
      activityChanged = true;
    }
    if (step.assetPath !== assetPaths[index] || step.altText !== nextAlt) {
      step.assetPath = assetPaths[index];
      step.altText = nextAlt;
      activityChanged = true;
    }
  });
  if (!activity.accessibilityMetadata) activity.accessibilityMetadata = {};
  if (activity.accessibilityMetadata.altText !== entry.summaryAlt) {
    activity.accessibilityMetadata.altText = entry.summaryAlt;
    activityChanged = true;
  }

  const legacyFile = path.join(packageDir, legacyPath);
  const legacyExists = existsSync(legacyFile);

  if (!manifestChanged && !activityChanged && !legacyExists) {
    unchanged += 1;
    continue;
  }
  changed += 1;
  if (APPLY) {
    if (manifestChanged) writeJson(manifestFile, manifest);
    if (activityChanged) writeJson(activityFile, activity);
    if (legacyExists) unlinkSync(legacyFile);
    console.log(
      `wired ${entry.packageDir} · 5 aset · manifest=${manifestChanged ? "ubah" : "tetap"} · langkah=${
        activityChanged ? "ubah" : "tetap"
      }${legacyExists ? ` · hapus ${legacyPath}` : ""}`
    );
  } else {
    console.log(
      `akan ${entry.packageDir} · 5 aset · manifest=${manifestChanged ? "ubah" : "tetap"} · langkah=${
        activityChanged ? "ubah" : "tetap"
      }${legacyExists ? ` · hapus ${legacyPath}` : ""}`
    );
  }
}

for (const failure of failures) {
  console.error(`GAGAL ${failure.entry.packageDir} · ${failure.reason}`);
}
if (failures.length > 0) process.exitCode = 1;

console.log(
  `\n${changed} paket ${APPLY ? "terhubung" : "perlu dihubungkan"} · ${unchanged} sudah sinkron${
    failures.length ? ` · ${failures.length} gagal` : ""
  }`
);
if (!APPLY) console.log("jalankan dengan --apply untuk menulis perubahan.");
