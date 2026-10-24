import type { ContentPackage } from "./validatePackage";

export type CatalogSource = "bundled" | "managed";

export interface CatalogPackageInput {
  data: ContentPackage;
  source: CatalogSource;
}

export interface CatalogLessonEntry {
  packageId: string;
  version: string;
  packageTitle: string;
  lessonId: string;
  lessonTitle: string;
  summary: string;
  gradeLevels: number[];
  subjects: string[];
  objectives: string[];
  activityCount: number;
  source: CatalogSource;
}

export interface CatalogFilters {
  query: string;
  grade: number | null;
  subject: string | null;
}

export const emptyCatalogFilters: CatalogFilters = {
  query: "",
  grade: null,
  subject: null
};

export function buildCatalog(packages: CatalogPackageInput[]): CatalogLessonEntry[] {
  const byPackage = new Map<string, CatalogPackageInput>();
  for (const entry of packages) {
    const existing = byPackage.get(entry.data.manifest.packageId);
    if (!existing || (existing.source === "bundled" && entry.source === "managed")) {
      byPackage.set(entry.data.manifest.packageId, entry);
    }
  }

  const entries: CatalogLessonEntry[] = [];
  for (const { data, source } of byPackage.values()) {
    const activityIds = new Set(data.activities.map((activity) => activity.activityId));
    for (const lesson of data.lessons) {
      entries.push({
        packageId: data.manifest.packageId,
        version: data.manifest.packageVersion,
        packageTitle: data.manifest.title,
        lessonId: lesson.lessonId,
        lessonTitle: lesson.title,
        summary: lesson.summary,
        gradeLevels: data.manifest.gradeLevels,
        subjects: data.manifest.subjects,
        objectives: lesson.learningObjectives,
        activityCount: lesson.activityIds.filter((id) => activityIds.has(id)).length,
        source
      });
    }
  }

  return entries.sort((left, right) => {
    const grade = Math.min(...left.gradeLevels) - Math.min(...right.gradeLevels);
    if (grade !== 0) return grade;
    return left.lessonTitle.localeCompare(right.lessonTitle, "id");
  });
}

export function filterCatalog(
  entries: CatalogLessonEntry[],
  filters: CatalogFilters
): CatalogLessonEntry[] {
  const query = filters.query.trim().toLowerCase();
  return entries.filter((entry) => {
    if (filters.grade !== null && !entry.gradeLevels.includes(filters.grade)) {
      return false;
    }
    if (filters.subject !== null && !entry.subjects.includes(filters.subject)) {
      return false;
    }
    if (!query) {
      return true;
    }
    const haystack = [
      entry.lessonTitle,
      entry.packageTitle,
      entry.summary,
      ...entry.subjects,
      ...entry.objectives
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}

export function catalogFacets(entries: CatalogLessonEntry[]): {
  grades: number[];
  subjects: string[];
} {
  const grades = new Set<number>();
  const subjects = new Set<string>();
  for (const entry of entries) {
    for (const grade of entry.gradeLevels) grades.add(grade);
    for (const subject of entry.subjects) subjects.add(subject);
  }
  return {
    grades: [...grades].sort((left, right) => left - right),
    subjects: [...subjects].sort((left, right) => left.localeCompare(right, "id"))
  };
}

export function findLessonEntry(
  entries: CatalogLessonEntry[],
  lessonId: string
): CatalogLessonEntry | undefined {
  return entries.find((entry) => entry.lessonId === lessonId);
}
