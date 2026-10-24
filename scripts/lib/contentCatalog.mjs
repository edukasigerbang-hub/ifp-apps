import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

export function sortCatalogEntries(entries) {
  return entries.sort((left, right) => {
    const grade = Math.min(...left.gradeLevels) - Math.min(...right.gradeLevels);
    if (grade !== 0) return grade;
    return left.lessonTitle.localeCompare(right.lessonTitle, "id");
  });
}

export function buildCatalogEntries(packagesRoot) {
  const root = path.resolve(packagesRoot);
  const entries = [];

  for (const dirName of readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()) {
    const dir = path.join(root, dirName);
    const manifest = JSON.parse(readFileSync(path.join(dir, "manifest.json"), "utf8"));
    const lessonFiles = readdirSync(path.join(dir, "lessons")).filter((file) =>
      file.endsWith(".json")
    );
    const activityFiles = readdirSync(path.join(dir, "activities")).filter((file) =>
      file.endsWith(".json")
    );
    const activityIds = new Set(
      activityFiles.map(
        (file) => JSON.parse(readFileSync(path.join(dir, "activities", file), "utf8")).activityId
      )
    );

    for (const lessonFile of lessonFiles) {
      const lesson = JSON.parse(readFileSync(path.join(dir, "lessons", lessonFile), "utf8"));
      entries.push({
        packageId: manifest.packageId,
        version: manifest.packageVersion,
        packageTitle: manifest.title,
        lessonId: lesson.lessonId,
        lessonTitle: lesson.title,
        summary: lesson.summary,
        gradeLevels: manifest.gradeLevels,
        subjects: manifest.subjects,
        objectives: lesson.learningObjectives,
        activityCount: lesson.activityIds.filter((id) => activityIds.has(id)).length,
        source: "bundled"
      });
    }
  }

  return sortCatalogEntries(entries);
}

export function catalogKey(entry) {
  return `${entry.packageId}::${entry.lessonId}`;
}
