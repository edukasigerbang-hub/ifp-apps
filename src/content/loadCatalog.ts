import { getPackage, listActivePackages } from "../data/contentRepository";
import { canPersistLocally } from "../data/learningRepository";
import { buildCatalog, type CatalogLessonEntry, type CatalogPackageInput } from "./catalog";
import { loadContentPackages } from "./loadPackages";
import { validateContentPackage } from "./validatePackage";

export interface CatalogLoadResult {
  entries: CatalogLessonEntry[];
  errors: string[];
}

export async function loadCatalog(): Promise<CatalogLoadResult> {
  const errors: string[] = [];
  const collected: CatalogPackageInput[] = [];

  const bundled = loadContentPackages();
  for (const pkg of bundled.packages) {
    collected.push({ data: pkg.data, source: "bundled" });
  }
  for (const error of bundled.errors) {
    errors.push(
      `${error.packageDir}: ${error.issues.map((issue) => issue.message).join("; ")}`
    );
  }

  if (canPersistLocally()) {
    try {
      const summaries = await listActivePackages();
      for (const summary of summaries) {
        try {
          const record = await getPackage(summary.packageId, summary.version);
          const result = validateContentPackage({
            manifest: record.manifest,
            lessons: record.lessons,
            activities: record.activities
          });
          if (result.ok && result.data) {
            collected.push({ data: result.data, source: "managed" });
          } else {
            errors.push(
              `${summary.packageId}: ${result.issues.map((issue) => issue.message).join("; ")}`
            );
          }
        } catch (error) {
          errors.push(
            `${summary.packageId}: ${error instanceof Error ? error.message : "tidak dapat dibaca"}`
          );
        }
      }
    } catch (error) {
      errors.push(
        `Paket impor tidak dapat dibaca: ${
          error instanceof Error ? error.message : "kesalahan tidak diketahui"
        }`
      );
    }
  }

  return { entries: buildCatalog(collected), errors };
}
