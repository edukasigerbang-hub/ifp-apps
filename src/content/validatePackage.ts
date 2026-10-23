import { z } from "zod";
import { contentPackageManifestSchema } from "./schema/manifest";
import { activitySchema } from "./schema/activity";
import { lessonSchema } from "./schema/lesson";
import { SUPPORTED_SCHEMA_VERSION } from "./schema/primitives";

export const contentPackageInputSchema = z.strictObject({
  manifest: contentPackageManifestSchema,
  lessons: z.array(lessonSchema).min(1).max(200),
  activities: z.array(activitySchema).min(1).max(1000)
});

export type ContentPackage = z.infer<typeof contentPackageInputSchema>;

export type ContentErrorCode =
  | "CONTENT_PACKAGE_INVALID"
  | "CONTENT_SCHEMA_UNSUPPORTED"
  | "CONTENT_ASSET_HASH_MISMATCH"
  | "CONTENT_DEPENDENCY_MISSING";

export interface ContentIssue {
  code: ContentErrorCode;
  message: string;
  path: string;
}

export interface ContentValidationResult {
  ok: boolean;
  issues: ContentIssue[];
  warnings: string[];
  data?: ContentPackage;
}

const forbiddenKeys = new Set([
  "script",
  "scripts",
  "javascript",
  "module",
  "modules",
  "entry",
  "entrypoint",
  "eval",
  "exec",
  "command",
  "shell",
  "code"
]);

const forbiddenValuePatterns = [/^\s*javascript:/i, /^\s*data:text\/html/i];

const MAX_DEPTH = 32;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function scanUntrusted(value: unknown, path: string, depth: number, issues: ContentIssue[]): void {
  if (depth > MAX_DEPTH) {
    issues.push({
      code: "CONTENT_PACKAGE_INVALID",
      message: "struktur data terlalu dalam",
      path
    });
    return;
  }

  if (typeof value === "string") {
    if (forbiddenValuePatterns.some((pattern) => pattern.test(value))) {
      issues.push({
        code: "CONTENT_PACKAGE_INVALID",
        message: "nilai eksekusi tidak diizinkan di paket konten",
        path
      });
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((entry, index) => scanUntrusted(entry, `${path}[${index}]`, depth + 1, issues));
    return;
  }

  if (isRecord(value)) {
    for (const [key, entry] of Object.entries(value)) {
      const childPath = path === "" ? key : `${path}.${key}`;
      if (forbiddenKeys.has(key.toLowerCase())) {
        issues.push({
          code: "CONTENT_PACKAGE_INVALID",
          message: `field terlarang '${key}' tidak boleh ada di paket konten`,
          path: childPath
        });
      }
      scanUntrusted(entry, childPath, depth + 1, issues);
    }
  }
}

function zodIssuesToContentIssues(error: z.ZodError): ContentIssue[] {
  return error.issues.map((issue) => ({
    code: "CONTENT_PACKAGE_INVALID" as const,
    message: issue.message,
    path: issue.path.join(".")
  }));
}

export function validateContentPackage(input: unknown): ContentValidationResult {
  const issues: ContentIssue[] = [];
  const warnings: string[] = [];

  scanUntrusted(input, "", 0, issues);

  if (isRecord(input) && isRecord(input.manifest)) {
    const schemaVersion = input.manifest.schemaVersion;
    if (schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
      issues.push({
        code: "CONTENT_SCHEMA_UNSUPPORTED",
        message: `schemaVersion '${String(schemaVersion)}' tidak didukung (harus ${SUPPORTED_SCHEMA_VERSION})`,
        path: "manifest.schemaVersion"
      });
      return { ok: false, issues, warnings };
    }
  }

  const parsed = contentPackageInputSchema.safeParse(input);
  if (!parsed.success) {
    issues.push(...zodIssuesToContentIssues(parsed.error));
    return { ok: false, issues, warnings };
  }

  const data = parsed.data;
  const assetPaths = new Set(data.manifest.assets.map((asset) => asset.path));
  const activityById = new Map(data.activities.map((activity) => [activity.activityId, activity]));

  const seenActivityIds = new Set<string>();
  data.activities.forEach((activity, index) => {
    if (seenActivityIds.has(activity.activityId)) {
      issues.push({
        code: "CONTENT_PACKAGE_INVALID",
        message: `activityId duplikat: ${activity.activityId}`,
        path: `activities.${index}.activityId`
      });
    }
    seenActivityIds.add(activity.activityId);

    activity.assets.forEach((assetPath, assetIndex) => {
      if (!assetPaths.has(assetPath)) {
        issues.push({
          code: "CONTENT_DEPENDENCY_MISSING",
          message: `aset aktivitas tidak ada di manifest: ${assetPath}`,
          path: `activities.${index}.assets.${assetIndex}`
        });
      }
    });
  });

  const seenLessonIds = new Set<string>();
  data.lessons.forEach((lesson, index) => {
    if (seenLessonIds.has(lesson.lessonId)) {
      issues.push({
        code: "CONTENT_PACKAGE_INVALID",
        message: `lessonId duplikat: ${lesson.lessonId}`,
        path: `lessons.${index}.lessonId`
      });
    }
    seenLessonIds.add(lesson.lessonId);

    if (lesson.packageId !== data.manifest.packageId) {
      issues.push({
        code: "CONTENT_PACKAGE_INVALID",
        message: `lesson.packageId '${lesson.packageId}' tidak cocok dengan manifest '${data.manifest.packageId}'`,
        path: `lessons.${index}.packageId`
      });
    }

    lesson.activityIds.forEach((activityId, activityIndex) => {
      if (!activityById.has(activityId)) {
        issues.push({
          code: "CONTENT_DEPENDENCY_MISSING",
          message: `activityId tidak ditemukan: ${activityId}`,
          path: `lessons.${index}.activityIds.${activityIndex}`
        });
      }
    });

    lesson.assessmentRefs.forEach((activityId, refIndex) => {
      const activity = activityById.get(activityId);
      if (!activity) {
        issues.push({
          code: "CONTENT_DEPENDENCY_MISSING",
          message: `assessmentRef tidak ditemukan: ${activityId}`,
          path: `lessons.${index}.assessmentRefs.${refIndex}`
        });
      } else if (!activity.assessmentConfig) {
        issues.push({
          code: "CONTENT_PACKAGE_INVALID",
          message: `assessmentRef '${activityId}' tidak memiliki assessmentConfig`,
          path: `lessons.${index}.assessmentRefs.${refIndex}`
        });
      }
    });

    lesson.assetRefs.forEach((assetPath, refIndex) => {
      if (!assetPaths.has(assetPath)) {
        issues.push({
          code: "CONTENT_DEPENDENCY_MISSING",
          message: `assetRef tidak ada di manifest: ${assetPath}`,
          path: `lessons.${index}.assetRefs.${refIndex}`
        });
      }
    });

    if (lesson.reviewStatus === "draft") {
      warnings.push(`lesson '${lesson.lessonId}' masih berstatus draft dan belum boleh dianggap materi produksi`);
    }
  });

  if (data.manifest.curriculumRefs.length === 0) {
    warnings.push("manifest tidak memiliki curriculumRefs; jangan mengklaim kesesuaian kurikulum");
  }

  const seenDependencies = new Set<string>();
  data.manifest.dependencies.forEach((dependency, index) => {
    if (dependency.packageId === data.manifest.packageId) {
      issues.push({
        code: "CONTENT_PACKAGE_INVALID",
        message: "paket tidak boleh bergantung pada dirinya sendiri",
        path: `manifest.dependencies.${index}.packageId`
      });
    }
    if (seenDependencies.has(dependency.packageId)) {
      issues.push({
        code: "CONTENT_PACKAGE_INVALID",
        message: `dependensi duplikat: ${dependency.packageId}`,
        path: `manifest.dependencies.${index}.packageId`
      });
    }
    seenDependencies.add(dependency.packageId);
  });

  return { ok: issues.length === 0, issues, warnings, data };
}
