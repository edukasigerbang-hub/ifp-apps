import { z } from "zod";
import {
  SUPPORTED_MANIFEST_VERSION,
  SUPPORTED_SCHEMA_VERSION,
  curriculumRefSchema,
  gradeLevelSchema,
  idSchema,
  localeSchema,
  safeRelativePathSchema,
  semverSchema,
  sha256Schema,
  assetMediaTypeSchema
} from "./primitives";

export const packageAssetSchema = z.strictObject({
  path: safeRelativePathSchema,
  mediaType: assetMediaTypeSchema,
  sizeBytes: z.number().int().positive().max(2_147_483_648),
  sha256: sha256Schema
});

export const packageDependencySchema = z.strictObject({
  packageId: idSchema,
  versionRange: z.string().min(1).max(64)
});

export const releaseStates = ["draft", "validated", "approved", "published", "withdrawn"] as const;

export const contentPackageManifestSchema = z
  .strictObject({
    manifestVersion: z.literal(SUPPORTED_MANIFEST_VERSION),
    packageId: idSchema,
    packageVersion: semverSchema,
    schemaVersion: z.literal(SUPPORTED_SCHEMA_VERSION),
    title: z.string().min(3).max(200),
    locale: localeSchema,
    gradeLevels: z.array(gradeLevelSchema).min(1).max(6),
    subjects: z.array(idSchema).min(1).max(24),
    curriculumRefs: z.array(curriculumRefSchema).max(24),
    assets: z.array(packageAssetSchema).max(5000),
    dependencies: z.array(packageDependencySchema).max(64),
    signature: z.string().max(8192).nullable(),
    releaseState: z.enum(releaseStates).optional()
  })
  .superRefine((manifest, ctx) => {
    const seenPaths = new Set<string>();
    manifest.assets.forEach((asset, index) => {
      if (seenPaths.has(asset.path)) {
        ctx.addIssue({
          code: "custom",
          message: `aset duplikat: ${asset.path}`,
          path: ["assets", index, "path"],
          input: asset.path
        });
      }
      seenPaths.add(asset.path);
    });

    const seenSubjects = new Set<string>();
    manifest.subjects.forEach((subject, index) => {
      if (seenSubjects.has(subject)) {
        ctx.addIssue({
          code: "custom",
          message: `mata pelajaran duplikat: ${subject}`,
          path: ["subjects", index],
          input: subject
        });
      }
      seenSubjects.add(subject);
    });

    const seenGrades = new Set<number>();
    manifest.gradeLevels.forEach((grade, index) => {
      if (seenGrades.has(grade)) {
        ctx.addIssue({
          code: "custom",
          message: `kelas duplikat: ${grade}`,
          path: ["gradeLevels", index],
          input: grade
        });
      }
      seenGrades.add(grade);
    });
  });

export type ContentPackageManifest = z.infer<typeof contentPackageManifestSchema>;
export type PackageAsset = z.infer<typeof packageAssetSchema>;
export type PackageDependency = z.infer<typeof packageDependencySchema>;
