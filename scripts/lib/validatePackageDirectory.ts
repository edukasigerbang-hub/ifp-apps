import { readFile, readdir, realpath } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
import { validateContentPackage, type ContentIssue } from "../../src/content/validatePackage";
import { verifyAssetHashes } from "../../src/content/verifyAssets";

export interface ValidationReport {
  package: string | null;
  status: "VALID" | "INVALID";
  issues: ContentIssue[];
  warnings: string[];
}

async function readJson(filePath: string): Promise<unknown> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as unknown;
}

async function readDirectory(dirPath: string): Promise<unknown[]> {
  let entries: string[];
  try {
    entries = await readdir(dirPath);
  } catch {
    return [];
  }
  const jsonFiles = entries.filter((entry) => entry.endsWith(".json")).sort();
  return Promise.all(jsonFiles.map((entry) => readJson(join(dirPath, entry))));
}

export async function validatePackageDirectory(rootArg: string): Promise<ValidationReport> {
  const root = await realpath(resolve(rootArg));

  const input = {
    manifest: await readJson(join(root, "manifest.json")),
    lessons: await readDirectory(join(root, "lessons")),
    activities: await readDirectory(join(root, "activities"))
  };

  const result = validateContentPackage(input);
  const issues: ContentIssue[] = [...result.issues];

  if (result.data) {
    const files = new Map<string, Uint8Array>();
    for (const asset of result.data.manifest.assets) {
      const absolute = resolve(root, asset.path);
      if (absolute !== root && !absolute.startsWith(root + sep)) {
        issues.push({
          code: "CONTENT_PACKAGE_INVALID",
          message: `aset keluar dari root paket: ${asset.path}`,
          path: `manifest.assets.${asset.path}`
        });
        continue;
      }
      try {
        files.set(asset.path, await readFile(absolute));
      } catch {
        issues.push({
          code: "CONTENT_DEPENDENCY_MISSING",
          message: `file aset tidak ditemukan: ${asset.path}`,
          path: `manifest.assets.${asset.path}`
        });
      }
    }

    issues.push(...(await verifyAssetHashes(result.data.manifest, files)));
  }

  return {
    package: result.data?.manifest.packageId ?? null,
    status: issues.length === 0 ? "VALID" : "INVALID",
    issues,
    warnings: result.warnings
  };
}
