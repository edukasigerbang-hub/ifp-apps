import {
  DIGEST_PATTERN,
  packageKey,
  readAttestations,
  scanRepoPackages
} from "./lib/reviewAttestation";

interface Options {
  attestations: string[];
  attestationsDir: string;
  packagesDir: string;
}

function parseArgs(argv: string[]): Options {
  const options: Options = {
    attestations: [],
    attestationsDir: "knowledge/content/review-attestations",
    packagesDir: "content/packages"
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
    } else {
      throw new Error(`Argumen tidak dikenal: ${argument}`);
    }
  }

  return options;
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
  const byKey = new Map(packages.map((entry) => [packageKey(entry.packageId, entry.packageVersion), entry]));

  for (const row of approved) {
    const key = packageKey(row.packageId, row.packageVersion);
    if (!DIGEST_PATTERN.test(row.contentSha256)) {
      failures.push(
        `${key}: putusan approved tanpa sidik jari isi yang sah di ${row.sourceFile} — putusan tidak terikat ke materi`
      );
      continue;
    }
    const target = byKey.get(key);
    if (!target) {
      failures.push(`${key}: putusan approved untuk paket yang tidak ada di ${options.packagesDir}`);
      continue;
    }
    if (!target.digest) {
      failures.push(`${key}: isi paket tidak dapat divalidasi sehingga sidik jarinya tidak dapat dihitung`);
      continue;
    }
    if (target.digest !== row.contentSha256) {
      failures.push(
        `${key}: isi berubah setelah disetujui (putusan ${row.contentSha256.slice(0, 12)}…, ` +
          `sekarang ${target.digest.slice(0, 12)}…) — ${row.reviewer} harus menilai ulang`
      );
    }
  }

  const boundKeys = new Set(
    approved
      .filter((row) => DIGEST_PATTERN.test(row.contentSha256))
      .filter((row) => byKey.get(packageKey(row.packageId, row.packageVersion))?.digest === row.contentSha256)
      .map((row) => packageKey(row.packageId, row.packageVersion))
  );

  let outsideDraft = 0;
  for (const target of packages) {
    const nonDraftLessons = target.reviewStatuses.filter((status) => status !== "draft");
    if (nonDraftLessons.length === 0 && target.releaseState === "draft") {
      continue;
    }
    outsideDraft += 1;
    const key = packageKey(target.packageId, target.packageVersion);
    if (!boundKeys.has(key)) {
      const detail = [
        nonDraftLessons.length > 0 ? `reviewStatus ${[...new Set(nonDraftLessons)].join(", ")}` : null,
        target.releaseState !== "draft" ? `releaseState ${target.releaseState}` : null
      ]
        .filter(Boolean)
        .join(" · ");
      failures.push(
        `${key}: ${detail} tetapi tidak ada putusan guru yang terikat ke isi saat ini (${target.directory})`
      );
    }
  }

  console.log(
    `Review binding — ${attestations.files.length} berkas attestation, ${attestations.rows.length} baris ` +
      `(${approved.length} approved), ${packages.length} paket repo (${outsideDraft} di luar draft).`
  );

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`FAIL ${failure}`);
    }
    console.error(`${failures.length} masalah ikatan review.`);
    process.exitCode = 1;
    return;
  }

  if (approved.length === 0 && outsideDraft === 0) {
    console.log("PASS — belum ada putusan guru dan semua paket masih draft; tidak ada yang perlu diverifikasi.");
    return;
  }
  console.log("PASS — setiap putusan guru terikat ke isi paket yang sekarang, dan tidak ada paket di luar draft tanpa bukti.");
}

main().catch((error: unknown) => {
  console.error(`Checker ikatan review gagal: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 2;
});
