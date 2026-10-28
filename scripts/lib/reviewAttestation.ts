import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { packageContentDigest } from "../../src/content/packageDigest";
import { validateContentPackage } from "../../src/content/validatePackage";

export const DIGEST_PATTERN = /^[0-9a-f]{64}$/;

export interface AttestationRow {
  sourceFile: string;
  packageId: string;
  packageVersion: string;
  contentSha256: string;
  rubricVersion: string;
  decision: string;
  reviewer: string;
  notes: string;
  createdAt: string;
}

export interface AttestationReadResult {
  files: string[];
  rows: AttestationRow[];
  errors: string[];
}

export interface RepoPackage {
  packageId: string;
  packageVersion: string;
  directory: string;
  digest: string | null;
  reviewStatuses: string[];
  releaseState: string;
  lessonCount: number;
  activityCount: number;
  itemCount: number;
  problems: string[];
}

export function packageKey(packageId: string, packageVersion: string): string {
  return `${packageId}@${packageVersion}`;
}

// Parser CSV kecil: cukup untuk keluaran ekspor aplikasi (BOM, CRLF, kutip ganda).
export function parseCsv(text: string): string[][] {
  const input = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (quoted) {
      if (char === '"') {
        if (input[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"' && field === "") {
      quoted = true;
      continue;
    }
    if (char === ",") {
      row.push(field);
      field = "";
      continue;
    }
    if (char === "\r") {
      continue;
    }
    if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }
    field += char;
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((entry) => entry.some((value) => value.trim() !== ""));
}

export async function readAttestationFile(file: string): Promise<AttestationReadResult> {
  const rows: AttestationRow[] = [];
  const errors: string[] = [];
  let table: string[][];
  try {
    table = parseCsv(await readFile(file, "utf8"));
  } catch (error) {
    errors.push(`${file}: tidak dapat dibaca (${error instanceof Error ? error.message : error})`);
    return { files: [file], rows, errors };
  }

  const [header, ...body] = table;
  if (!header) {
    errors.push(`${file}: berkas kosong`);
    return { files: [file], rows, errors };
  }

  const columns = new Map(header.map((name, index) => [name.trim(), index]));
  for (const required of ["package_id", "package_version", "decision"]) {
    if (!columns.has(required)) {
      errors.push(`${file}: kolom "${required}" tidak ada`);
      return { files: [file], rows, errors };
    }
  }
  if (!columns.has("content_sha256")) {
    errors.push(
      `${file}: kolom "content_sha256" tidak ada — ekspor ini dibuat sebelum keputusan diikat ke isi`
    );
  }

  const cell = (row: string[], name: string): string => {
    const index = columns.get(name);
    return index === undefined ? "" : (row[index] ?? "").trim();
  };

  body.forEach((row, offset) => {
    rows.push({
      sourceFile: file,
      packageId: cell(row, "package_id"),
      packageVersion: cell(row, "package_version"),
      contentSha256: cell(row, "content_sha256").toLowerCase(),
      rubricVersion: cell(row, "rubric_version"),
      decision: cell(row, "decision"),
      reviewer: cell(row, "reviewer"),
      notes: cell(row, "notes"),
      createdAt: cell(row, "created_at")
    });
    if (!cell(row, "package_id")) {
      errors.push(`${file}: baris data ${offset + 2} tanpa package_id`);
    }
  });

  return { files: [file], rows, errors };
}

export async function readAttestations(options: {
  files: string[];
  directory: string;
}): Promise<AttestationReadResult> {
  const files = [...options.files];
  try {
    const entries = await readdir(options.directory, { withFileTypes: true });
    for (const entry of entries
      .filter((item) => item.isFile() && item.name.toLowerCase().endsWith(".csv"))
      .sort((left, right) => (left.name < right.name ? -1 : 1))) {
      files.push(join(options.directory, entry.name));
    }
  } catch {
    // Folder belum ada berarti belum ada putusan guru yang diekspor — bukan kesalahan.
  }

  const result: AttestationReadResult = { files, rows: [], errors: [] };
  for (const file of files) {
    const read = await readAttestationFile(file);
    result.rows.push(...read.rows);
    result.errors.push(...read.errors);
  }
  return result;
}

async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readFile(path, "utf8")) as unknown;
}

async function readJsonDirectory(path: string): Promise<unknown[]> {
  const entries = (await readdir(path)).filter((entry) => entry.endsWith(".json")).sort();
  const values: unknown[] = [];
  for (const entry of entries) {
    values.push(await readJson(join(path, entry)));
  }
  return values;
}

function countItems(activities: unknown[]): number {
  let total = 0;
  for (const activity of activities) {
    if (activity === null || typeof activity !== "object") {
      continue;
    }
    const record = activity as Record<string, unknown>;
    const config = (record.interactionConfig ?? {}) as Record<string, unknown>;
    if (Array.isArray(config.pairs)) {
      total += config.pairs.length;
    }
    if (Array.isArray(config.items)) {
      total += config.items.length;
    }
    const assessment = (record.assessmentConfig ?? {}) as Record<string, unknown>;
    if (Array.isArray(assessment.questions)) {
      total += assessment.questions.length;
    }
  }
  return total;
}

function reviewStatusOf(lesson: unknown): string {
  if (lesson !== null && typeof lesson === "object") {
    const value = (lesson as Record<string, unknown>).reviewStatus;
    if (typeof value === "string" && value !== "") {
      return value;
    }
  }
  return "draft";
}

function releaseStateOf(manifest: unknown): string {
  if (manifest !== null && typeof manifest === "object") {
    const value = (manifest as Record<string, unknown>).releaseState;
    if (typeof value === "string" && value !== "") {
      return value;
    }
  }
  return "draft";
}

export async function scanRepoPackages(root: string): Promise<RepoPackage[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const directories = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => (left < right ? -1 : 1));

  const packages: RepoPackage[] = [];
  for (const name of directories) {
    const directory = join(root, name);
    const problems: string[] = [];
    let manifest: unknown = null;
    let lessons: unknown[] = [];
    let activities: unknown[] = [];

    try {
      manifest = await readJson(join(directory, "manifest.json"));
    } catch (error) {
      problems.push(`manifest tidak terbaca: ${error instanceof Error ? error.message : error}`);
    }
    try {
      lessons = await readJsonDirectory(join(directory, "lessons"));
    } catch (error) {
      problems.push(`lessons tidak terbaca: ${error instanceof Error ? error.message : error}`);
    }
    try {
      activities = await readJsonDirectory(join(directory, "activities"));
    } catch (error) {
      problems.push(`activities tidak terbaca: ${error instanceof Error ? error.message : error}`);
    }

    const manifestRecord = (manifest ?? {}) as Record<string, unknown>;
    const packageId = typeof manifestRecord.packageId === "string" ? manifestRecord.packageId : name;
    const packageVersion =
      typeof manifestRecord.packageVersion === "string" ? manifestRecord.packageVersion : "0.0.0";

    let digest: string | null = null;
    const validated = validateContentPackage({ manifest, lessons, activities });
    if (validated.ok && validated.data) {
      digest = await packageContentDigest(validated.data);
    } else {
      problems.push(`isi paket tidak valid (${validated.issues.length} masalah)`);
    }

    packages.push({
      packageId,
      packageVersion,
      directory,
      digest,
      reviewStatuses: lessons.map(reviewStatusOf),
      releaseState: releaseStateOf(manifest),
      lessonCount: lessons.length,
      activityCount: activities.length,
      itemCount: countItems(activities),
      problems
    });
  }

  return packages;
}
