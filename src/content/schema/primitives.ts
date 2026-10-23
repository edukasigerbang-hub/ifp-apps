import { z } from "zod";

export const SUPPORTED_SCHEMA_VERSION = "1.0.0" as const;
export const SUPPORTED_MANIFEST_VERSION = 1 as const;

export const idSchema = z
  .string()
  .min(3)
  .max(64)
  .regex(/^[a-z0-9][a-z0-9-]*$/, "harus slug huruf kecil, angka, atau tanda hubung");

export const semverSchema = z
  .string()
  .max(64)
  .regex(
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/,
    "harus SemVer valid (contoh 1.0.0)"
  );

export const sha256Schema = z
  .string()
  .regex(/^[a-f0-9]{64}$/, "harus SHA-256 heksadesimal huruf kecil (64 karakter)");

export const localeSchema = z
  .string()
  .regex(/^[a-z]{2,3}(?:-[A-Z]{2})?$/, "harus locale BCP-47 sederhana (contoh id-ID)");

export const gradeLevelSchema = z.number().int().min(1).max(6);

export const assetMediaTypes = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "video/mp4",
  "video/webm",
  "application/json",
  "text/plain"
] as const;

export const assetMediaTypeSchema = z.enum(assetMediaTypes);

export const runtimeCapabilities = ["touch", "keyboard", "audio", "video", "webgl"] as const;
export const runtimeCapabilitySchema = z.enum(runtimeCapabilities);

function pathProblem(value: string): string | null {
  if (value.length === 0 || value.length > 512) {
    return "panjang path harus 1..512";
  }
  if (value.includes("\\")) {
    return "path wajib memakai pemisah '/'";
  }
  if (value.includes("\0")) {
    return "path tidak boleh memuat NUL";
  }
  if (value.startsWith("/") || /^[A-Za-z]:/.test(value) || value.includes("://")) {
    return "path harus relatif terhadap root paket";
  }
  const segments = value.split("/");
  if (segments.some((segment) => segment === "" || segment === "." || segment === "..")) {
    return "path tidak boleh memuat segmen kosong, '.' atau '..'";
  }
  return null;
}

export const safeRelativePathSchema = z.string().superRefine((value, ctx) => {
  const problem = pathProblem(value);
  if (problem) {
    ctx.addIssue({ code: "custom", message: problem, input: value });
  }
});

export const curriculumRefSchema = z.strictObject({
  framework: z.string().min(1).max(64),
  id: z.string().min(1).max(128),
  version: z.string().min(1).max(32)
});

export const accessibilityMetadataSchema = z.strictObject({
  altText: z.string().min(1).max(500).optional(),
  transcriptPath: safeRelativePathSchema.optional(),
  captionsPath: safeRelativePathSchema.optional(),
  reducedMotionSupported: z.boolean().optional()
});

export type CurriculumRef = z.infer<typeof curriculumRefSchema>;
export type AccessibilityMetadata = z.infer<typeof accessibilityMetadataSchema>;
