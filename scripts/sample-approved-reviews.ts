import { createHash } from "node:crypto";
import { readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  DIGEST_PATTERN,
  packageKey,
  readAttestations,
  scanRepoPackages,
  type AttestationRow,
  type RepoPackage
} from "./lib/reviewAttestation";

interface Options {
  attestations: string[];
  attestationsDir: string;
  packagesDir: string;
  count: number;
  seed: string;
  out: string | null;
}

const RUBRIC_ITEMS: Array<[string, string]> = [
  ["R1", "Tujuan pembelajaran terukur dan sesuai kelas"],
  ["R2", "Isi faktual benar (tidak ada miskonsepsi)"],
  ["R3", "Bahasa sesuai usia (panjang kalimat, kosakata)"],
  ["R4", "Beban kognitif wajar (jumlah langkah/soal)"],
  ["R5", "Asesmen mengukur tujuan (validitas)"],
  ["R6", "Feedback suportif, tidak mempermalukan"],
  ["R7", "Aksesibilitas: alt text, caption/transkrip, bukan warna saja"],
  ["R8", "Tidak ada data pribadi siswa / konten sensitif"],
  ["R9", "Hak/lisensi aset jelas"],
  ["R10", "curriculumRefs terisi dan dapat ditelusuri"],
  ["R11", "Validator konten lulus + hash aset cocok"],
  ["R12", "Tidak ada klaim kurikulum tanpa referensi resmi"]
];

function parseArgs(argv: string[]): Options {
  const options: Options = {
    attestations: [],
    attestationsDir: "knowledge/content/review-attestations",
    packagesDir: "content/packages",
    count: 5,
    seed: new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date()),
    out: null
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const value = argv[index + 1];
    if (argument === "--attestation") {
      if (!value) throw new Error("--attestation memerlukan path berkas CSV.");
      options.attestations.push(value);
      index += 1;
    } else if (argument === "--attestations-dir") {
      if (!value) throw new Error("--attestations-dir memerlukan path folder.");
      options.attestationsDir = value;
      index += 1;
    } else if (argument === "--packages") {
      if (!value) throw new Error("--packages memerlukan path folder paket.");
      options.packagesDir = value;
      index += 1;
    } else if (argument === "--n") {
      const parsed = Number(value);
      if (!Number.isInteger(parsed) || parsed < 1) {
        throw new Error("--n memerlukan bilangan bulat >= 1.");
      }
      options.count = parsed;
      index += 1;
    } else if (argument === "--seed") {
      if (!value) throw new Error("--seed memerlukan nilai benih.");
      options.seed = value;
      index += 1;
    } else if (argument === "--out") {
      if (!value) throw new Error("--out memerlukan path berkas laporan.");
      options.out = value;
      index += 1;
    } else {
      throw new Error(`Argumen tidak dikenal: ${argument}`);
    }
  }

  return options;
}

function rank(seed: string, key: string): string {
  return createHash("sha256").update(`${seed}|${key}`, "utf8").digest("hex");
}

async function listFiles(directory: string): Promise<string[]> {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => entry.name)
      .sort((left, right) => (left < right ? -1 : 1));
  } catch {
    return [];
  }
}

function summarizeRows(rows: AttestationRow[]): string {
  const reviewers = [...new Set(rows.map((row) => row.reviewer || "(tanpa nama)"))].sort();
  const dates = rows.map((row) => row.createdAt).filter(Boolean).sort();
  const parts = [`${rows.length} putusan`];
  parts.push(`reviewer: ${reviewers.join(", ")}`);
  if (dates.length > 0) {
    parts.push(`tanggal: ${dates[0].slice(0, 10)}`);
  }
  return parts.join(" · ");
}

async function describe(
  target: RepoPackage,
  rows: AttestationRow[]
): Promise<{ markdown: string; problems: string[] }> {
  const key = packageKey(target.packageId, target.packageVersion);
  const problems: string[] = [];
  const lines: string[] = [];

  const recorded = [...new Set(rows.map((row) => row.contentSha256))];
  if (target.digest === null) {
    problems.push(`${key}: isi paket tidak dapat divalidasi — sampel tidak dapat diperiksa`);
  }
  for (const digest of recorded) {
    if (!DIGEST_PATTERN.test(digest)) {
      problems.push(`${key}: putusan approved tanpa sidik jari isi yang sah`);
      continue;
    }
    if (target.digest && digest !== target.digest) {
      problems.push(
        `${key}: isi berubah setelah disetujui (putusan ${digest.slice(0, 12)}…, ` +
          `sekarang ${target.digest.slice(0, 12)}…) — approval batal, perlu review ulang`
      );
    }
  }

  const matches = target.digest !== null && problems.length === 0;
  lines.push(`### ${key}`);
  lines.push("");
  lines.push(`- Review: ${summarizeRows(rows)}`);
  for (const row of rows) {
    const notes = row.notes ? `"${row.notes}"` : "(tanpa catatan)";
    lines.push(`  - ${row.reviewer || "(tanpa nama)"} · ${row.createdAt || "(tanpa tanggal)"} · ${notes}`);
  }
  lines.push(
    `- Sidik jari: ${target.digest ? `${target.digest.slice(0, 16)}…` : "tidak dapat dihitung"} ` +
      `· ${matches ? "COCOK dengan isi sekarang" : "TIDAK cocok / belum terverifikasi"}`
  );
  lines.push(
    `- Volume: ${target.lessonCount} lesson · ${target.activityCount} aktivitas · ${target.itemCount} item`
  );
  lines.push(`- Folder: ${target.directory}`);
  if (target.problems.length > 0) {
    lines.push(`- Masalah paket: ${target.problems.join("; ")}`);
  }

  const lessonFiles = await listFiles(join(target.directory, "lessons"));
  const activityFiles = await listFiles(join(target.directory, "activities"));
  if (lessonFiles.length > 0) {
    lines.push(`- Berkas lesson: ${lessonFiles.map((name) => `lessons/${name}`).join(", ")}`);
  }
  if (activityFiles.length > 0) {
    lines.push(`- Berkas aktivitas: ${activityFiles.map((name) => `activities/${name}`).join(", ")}`);
  }

  lines.push("");
  lines.push("Checklist rubrik (isi manual oleh reviewer manusia):");
  for (const [id, label] of RUBRIC_ITEMS) {
    lines.push(`- [ ] ${id} — ${label}`);
  }
  lines.push("- [ ] Keputusan: APPROVED / REVISI");
  lines.push("");

  return { markdown: lines.join("\n"), problems };
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const attestations = await readAttestations({
    files: options.attestations,
    directory: options.attestationsDir
  });
  const packages = await scanRepoPackages(options.packagesDir);

  const failures: string[] = [...attestations.errors];
  const approved = attestations.rows.filter((row) => row.decision === "approved");
  if (approved.length === 0) {
    console.log(
      `Tidak ada putusan approved pada ${attestations.files.length} berkas attestation — ` +
        "tidak ada sampel yang dapat diambil."
    );
    return;
  }

  const byKey = new Map<string, AttestationRow[]>();
  for (const row of approved) {
    const key = packageKey(row.packageId, row.packageVersion);
    const bucket = byKey.get(key) ?? [];
    bucket.push(row);
    byKey.set(key, bucket);
  }
  const packagesByKey = new Map(
    packages.map((entry) => [packageKey(entry.packageId, entry.packageVersion), entry])
  );

  const ranked = [...byKey.keys()]
    .map((key) => ({ key, hash: rank(options.seed, key) }))
    .sort((left, right) =>
      left.hash === right.hash ? (left.key < right.key ? -1 : 1) : left.hash < right.hash ? -1 : 1
    );
  const sampled = ranked.slice(0, Math.min(options.count, ranked.length));

  const header = [
    "# Sampel Audit Review Guru",
    "",
    `- Benih: \`${options.seed}\``,
    `- Populasi approved: ${ranked.length} paket dari ${approved.length} putusan`,
    `- Sampel: ${sampled.length} paket (diminta ${options.count})`,
    `- Sumber: ${attestations.files.join(", ") || "(tidak ada berkas)"}`,
    "",
    "Sampling deterministik: urutkan `sha256(\"<benih>|<packageId>@<version>\")` lalu ambil n teratas.",
    "Menjalankan ulang dengan benih yang sama memberi sampel yang sama; ganti benih untuk putaran berikutnya.",
    ""
  ].join("\n");

  const sections: string[] = [];
  for (const entry of sampled) {
    const rows = byKey.get(entry.key) ?? [];
    const target = packagesByKey.get(entry.key);
    if (!target) {
      failures.push(`${entry.key}: putusan approved untuk paket yang tidak ada di ${options.packagesDir}`);
      sections.push(`### ${entry.key}\n\n- PAKET TIDAK DITEMUKAN di ${options.packagesDir}\n`);
      continue;
    }
    const described = await describe(target, rows);
    failures.push(...described.problems);
    sections.push(described.markdown);
  }

  const report = `${header}\n${sections.join("\n")}`;
  process.stdout.write(`${report}\n`);

  if (options.out) {
    await writeFile(options.out, `${report}\n`, "utf8");
    console.log(`Laporan sampel ditulis ke ${options.out}`);
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`FAIL ${failure}`);
    }
    console.error(`${failures.length} masalah pada sampel audit — approval yang menyimpang harus dicabut.`);
    process.exitCode = 1;
    return;
  }

  console.log(
    `OK — ${sampled.length} sampel diperiksa, semua sidik jari cocok dengan isi sekarang; ` +
      "checklist R1–R12 tetap perlu diisi reviewer manusia."
  );
}

main().catch((error: unknown) => {
  console.error(`Sampler review gagal: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 2;
});
