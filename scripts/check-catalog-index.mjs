import { readFileSync } from "node:fs";
import path from "node:path";
import { buildCatalogEntries, catalogKey } from "./lib/contentCatalog.mjs";

const indexPath = path.resolve(process.argv[2] ?? "public/content-catalog.json");

let actual;
try {
  const parsed = JSON.parse(readFileSync(indexPath, "utf8"));
  if (!Array.isArray(parsed.entries)) {
    throw new Error("properti entries bukan array");
  }
  actual = parsed.entries;
} catch (error) {
  console.error(`FAIL: indeks katalog tidak dapat dibaca (${indexPath}): ${error.message}`);
  process.exit(2);
}

const expected = buildCatalogEntries("content/packages");
const fields = [
  "packageId",
  "version",
  "packageTitle",
  "lessonId",
  "lessonTitle",
  "summary",
  "gradeLevels",
  "subjects",
  "objectives",
  "activityCount",
  "coverAsset",
  "source"
];

const problems = [];

function collectDuplicates(entries, label) {
  const seen = new Set();
  for (const entry of entries) {
    const key = catalogKey(entry);
    if (seen.has(key)) {
      problems.push(`${label}: entri duplikat ${key}`);
    }
    seen.add(key);
  }
}

collectDuplicates(expected, "paket");
collectDuplicates(actual, "indeks");

const expectedMap = new Map(expected.map((entry) => [catalogKey(entry), entry]));
const actualMap = new Map(actual.map((entry) => [catalogKey(entry), entry]));

for (const key of expectedMap.keys()) {
  if (!actualMap.has(key)) {
    problems.push(`hilang di indeks: ${key}`);
  }
}
for (const key of actualMap.keys()) {
  if (!expectedMap.has(key)) {
    problems.push(`basi di indeks (paket tidak ada): ${key}`);
  }
}

for (const [key, expectedEntry] of expectedMap) {
  const actualEntry = actualMap.get(key);
  if (!actualEntry) continue;
  for (const field of fields) {
    if (JSON.stringify(expectedEntry[field]) !== JSON.stringify(actualEntry[field])) {
      problems.push(
        `${key}.${field}: paket=${JSON.stringify(expectedEntry[field])} indeks=${JSON.stringify(actualEntry[field])}`
      );
    }
  }
}

if (problems.length > 0) {
  console.error(`FAIL: indeks katalog tidak sinkron (${problems.length} masalah).`);
  for (const problem of problems.slice(0, 25)) {
    console.error(`  - ${problem}`);
  }
  if (problems.length > 25) {
    console.error(`  ... dan ${problems.length - 25} masalah lainnya`);
  }
  console.error("Jalankan: npm run content:catalog");
  process.exit(1);
}

console.log(
  `catalog-index OK: ${actual.length} entri, ${new Set(expected.map((e) => e.packageId)).size} paket`
);
