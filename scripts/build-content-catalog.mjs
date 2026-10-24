import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve("content/packages");
const target = path.resolve("public/content-catalog.json");
mkdirSync(path.dirname(target), { recursive: true });

const entries = [];
for (const dirName of readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort()) {
  const dir = path.join(root, dirName);
  const manifest = JSON.parse(readFileSync(path.join(dir, "manifest.json"), "utf8"));
  const lessonFiles = readdirSync(path.join(dir, "lessons")).filter((file) => file.endsWith(".json"));
  const activityFiles = readdirSync(path.join(dir, "activities")).filter((file) => file.endsWith(".json"));
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

entries.sort((left, right) => {
  const grade = Math.min(...left.gradeLevels) - Math.min(...right.gradeLevels);
  if (grade !== 0) return grade;
  return left.lessonTitle.localeCompare(right.lessonTitle, "id");
});

writeFileSync(
  target,
  `${JSON.stringify({ entries })}\n`
);
console.log(`catalog: ${entries.length} lesson dari ${readdirSync(root).length} paket`);
