import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";
import kelas1 from "./lib/mathExplanations/kelas1.mjs";
import kelas2 from "./lib/mathExplanations/kelas2.mjs";
import kelas3 from "./lib/mathExplanations/kelas3.mjs";
import kelas4 from "./lib/mathExplanations/kelas4.mjs";
import kelas5 from "./lib/mathExplanations/kelas5.mjs";
import kelas6 from "./lib/mathExplanations/kelas6.mjs";

const APPLY = process.argv.includes("--apply");
const FORCE = process.argv.includes("--force");
const PACKAGES_ROOT = path.join("content", "packages");
const ACTIVITY_FILE = "activity-001.json";

const DATA = { ...kelas1, ...kelas2, ...kelas3, ...kelas4, ...kelas5, ...kelas6 };

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

const failures = [];

if (Object.keys(DATA).length !== 47) {
  failures.push({ packageId: "(data)", reason: `jumlah entri ${Object.keys(DATA).length}, seharusnya 47` });
}

for (const [packageId, entry] of Object.entries(DATA)) {
  if (typeof entry?.title !== "string" || entry.title.trim().length === 0) {
    failures.push({ packageId, reason: "judul pembahasan kosong" });
  }
  const paragraphs = entry?.paragraphs;
  if (!Array.isArray(paragraphs) || paragraphs.length < 3 || paragraphs.length > 8) {
    failures.push({ packageId, reason: "paragraf harus 3–8 butir" });
  } else if (paragraphs.some((paragraph) => typeof paragraph !== "string" || paragraph.trim().length === 0)) {
    failures.push({ packageId, reason: "ada paragraf kosong" });
  }
  if (!packageId.includes("-matematika-") || !existsSync(path.join(PACKAGES_ROOT, packageId))) {
    failures.push({ packageId, reason: "paket matematika tidak ditemukan" });
  }
}
if (failures.length > 0) {
  for (const failure of failures) console.error(`GAGAL ${failure.packageId} · ${failure.reason}`);
  console.error(`\n${failures.length} masalah data · tidak ada berkas ditulis.`);
  process.exit(1);
}

const mathPackages = readdirSync(PACKAGES_ROOT)
  .filter((name) => name.includes("-matematika-"))
  .sort();
const withoutText = [];
let changed = 0;
let unchanged = 0;
let skipped = 0;

for (const packageId of mathPackages) {
  const activityFile = path.join(PACKAGES_ROOT, packageId, "activities", ACTIVITY_FILE);
  const activity = readJson(activityFile);
  if (activity.type !== "exploration" || !Array.isArray(activity.interactionConfig?.steps)) {
    failures.push({ packageId, reason: `${ACTIVITY_FILE} bukan aktivitas eksplorasi berlangkah` });
    continue;
  }

  const entry = DATA[packageId];
  if (!entry) {
    if (!activity.interactionConfig.explanation) withoutText.push(packageId);
    skipped += 1;
    continue;
  }

  const next = { title: entry.title, paragraphs: entry.paragraphs };
  const current = activity.interactionConfig.explanation;
  if (isDeepStrictEqual(current, next)) {
    unchanged += 1;
    continue;
  }
  if (current && !FORCE) {
    failures.push({ packageId, reason: "pembahasan sudah ada tetapi berbeda; pakai --force untuk menimpa" });
    continue;
  }

  changed += 1;
  if (APPLY) {
    activity.interactionConfig.explanation = next;
    writeJson(activityFile, activity);
    console.log(`${current ? "ganti" : "tambah"} ${packageId} · ${entry.paragraphs.length} paragraf`);
  } else {
    console.log(`${current ? "akan ganti" : "akan tambah"} ${packageId} · ${entry.paragraphs.length} paragraf`);
  }
}

for (const packageId of withoutText) {
  console.error(`GAGAL ${packageId} · belum punya teks pembahasan dan tidak ada di data`);
}
if (withoutText.length > 0) failures.push({ packageId: "(coverage)", reason: `${withoutText.length} paket matematika tanpa pembahasan` });

for (const failure of failures) {
  if (failure.packageId === "(coverage)") continue;
  console.error(`GAGAL ${failure.packageId} · ${failure.reason}`);
}
if (failures.length > 0) process.exitCode = 1;

console.log(
  `\n${changed} paket ${APPLY ? "diperbarui" : "perlu diperbarui"} · ${unchanged} sudah sinkron · ${skipped} di luar data` +
    (failures.length ? ` · ${failures.length} gagal` : "")
);
if (!APPLY && changed > 0) console.log("jalankan dengan --apply untuk menulis perubahan.");
