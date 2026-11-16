import { getPackage, listActivePackages } from "../data/contentRepository";
import { canPersistLocally } from "../data/learningRepository";
import { buildCatalog, type CatalogLessonEntry, type CatalogPackageInput } from "./catalog";
import { validateContentPackage } from "./validatePackage";

export interface CatalogLoadResult {
  entries: CatalogLessonEntry[];
  errors: string[];
}

let bundledPromise: Promise<CatalogLessonEntry[]> | null = null;

function loadBundledEntries(): Promise<CatalogLessonEntry[]> {
  if (!bundledPromise) {
    bundledPromise = fetch("/content-catalog.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Indeks katalog tidak dapat dimuat (${response.status}).`);
        }
        return response.json() as Promise<{ entries: CatalogLessonEntry[] }>;
      })
      .then((data) => data.entries)
      .catch((error) => {
        bundledPromise = null;
        throw error;
      });
  }
  return bundledPromise;
}

function sortEntries(entries: CatalogLessonEntry[]): CatalogLessonEntry[] {
  return entries.sort((left, right) => {
    const grade = Math.min(...left.gradeLevels) - Math.min(...right.gradeLevels);
    if (grade !== 0) return grade;
    return left.lessonTitle.localeCompare(right.lessonTitle, "id");
  });
}

export async function loadCatalog(): Promise<CatalogLoadResult> {
  const errors: string[] = [];
  const collected: CatalogPackageInput[] = [];

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

  const merged = new Map<string, CatalogLessonEntry>();
  for (const entry of await loadBundledEntries()) {
    merged.set(`${entry.packageId}::${entry.lessonId}`, entry);
  }
  for (const entry of buildCatalog(collected)) {
    merged.set(`${entry.packageId}::${entry.lessonId}`, entry);
  }

  return { entries: sortEntries([...merged.values()]), errors };
}
