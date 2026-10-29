import { z } from "zod";

// Penegakan kontrak bundel materi v1 §4 di sisi server (publish).
// Aturan ini sengaja diduplikasi dari `src-tauri/src/material_manifest.rs`:
// aplikasi tetap menolak bundel tidak sah saat install, jadi server yang longgar
// hanya akan menghasilkan materi yang tidak bisa dipasang — bukan celah
// keamanan, tapi publish tidak boleh menghasilkan baris katalog rusak.

const SLUG = /^[a-z0-9][a-z0-9-]{2,63}$/;
const SEMVER = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/;
const SHA256 = /^[0-9a-f]{64}$/;
const LOCALE = /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;

const MEDIA_TYPES: Record<string, string> = {
  html: "text/html",
  mjs: "text/javascript",
  js: "text/javascript",
  css: "text/css",
  json: "application/json",
  txt: "text/plain",
  vtt: "text/vtt",
  webp: "image/webp",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  svg: "image/svg+xml",
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  ogg: "audio/ogg",
  wav: "audio/wav",
  woff2: "font/woff2",
  ttf: "font/ttf"
};

const integerOnly = z
  .number()
  .int("hanya bilangan bulat yang boleh masuk manifest");

function extensionOf(path: string): string | undefined {
  const name = path.split("/").pop() ?? "";
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : undefined;
}

const bundlePath = z
  .string()
  .min(1)
  .max(240)
  .refine(
    (value) =>
      !value.startsWith("/") &&
      !value.includes("\\") &&
      !value.split("/").includes("..") &&
      !value.split("/").some((segment) => segment === "."),
    "path harus relatif tanpa .. atau backslash"
  );

const manifestBase = z.strictObject({
  schemaVersion: z.string().regex(/^1\./, "schemaVersion harus mulai dengan 1."),
  materialId: z.string().regex(SLUG),
  version: z.string().regex(SEMVER),
  title: z.string().min(3).max(200),
  summary: z.string().min(1).max(300),
  locale: z.string().regex(LOCALE),
  gradeLevels: z.array(integerOnly.min(1).max(6)).min(1).max(6),
  subjects: z.array(z.string().regex(SLUG)).min(1).max(24),
  topics: z.array(z.string().min(1).max(80)).max(12).optional(),
  curriculumRefs: z
    .array(
      z.strictObject({
        framework: z.string().min(1).max(40),
        id: z.string().min(1).max(80),
        version: z.string().min(1).max(40)
      })
    )
    .max(24)
    .optional(),
  estimatedMinutes: integerOnly.min(1).max(60),
  entry: z.string(),
  cover: bundlePath,
  transcriptPath: bundlePath,
  captionsPath: bundlePath.optional(),
  accessibility: z.strictObject({
    hasAudio: z.boolean(),
    keyboardNavigable: z.boolean(),
    supportsReducedMotion: z.boolean(),
    contrastChecked: z.boolean()
  }),
  completion: z.strictObject({
    mode: z.enum(["none", "signal"]),
    minDwellSeconds: integerOnly.min(0).max(600).optional()
  }),
  minAppVersion: z.string().regex(SEMVER),
  publisher: z.strictObject({ name: z.string().min(1).max(80) }),
  reviewStatus: z.enum(["draft", "reviewed", "approved"]),
  files: z.array(z.unknown()).min(2)
});

export type MaterialManifest = z.infer<typeof manifestBase> & {
  topics: string[];
  curriculumRefs: Array<{ framework: string; id: string; version: string }>;
};

export type ManifestIssue = { path: string; message: string };

function issuesFor(error: z.ZodError): ManifestIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.join(".") || "(root)",
    message: issue.message
  }));
}

/// Memeriksa manifest terhadap kontrak §4. Mengembalikan daftar cacat; kosong
/// berarti sah. `knownFieldsOnly` menegakkan objek strict: field tak dikenal ditolak.
export function checkManifest(value: unknown): ManifestIssue[] {
  const parsed = manifestBase.safeParse(value);
  if (parsed.success) {
    return semanticIssues(parsed.data as unknown as Record<string, unknown>);
  }
  return issuesFor(parsed.error);
}

function semanticIssues(raw: Record<string, unknown>): ManifestIssue[] {
  const issues: ManifestIssue[] = [];
  const push = (path: string, message: string) => issues.push({ path, message });

  if (raw.entry !== "index.html") {
    push("entry", 'entry harus "index.html".');
  }
  if (raw.accessibility && typeof raw.accessibility === "object") {
    const accessibility = raw.accessibility as Record<string, unknown>;
    if (accessibility.keyboardNavigable !== true) {
      push("accessibility.keyboardNavigable", "keyboardNavigable wajib true (§10).");
    }
    if (accessibility.hasAudio === true && raw.captionsPath === undefined) {
      push("captionsPath", "hasAudio true mewajibkan captionsPath (§4).");
    }
  }

  const grades = Array.isArray(raw.gradeLevels) ? (raw.gradeLevels as number[]) : [];
  if (new Set(grades).size !== grades.length) {
    push("gradeLevels", "gradeLevels tidak boleh berisi nilai duplikat.");
  }
  const subjects = Array.isArray(raw.subjects) ? (raw.subjects as string[]) : [];
  if (new Set(subjects).size !== subjects.length) {
    push("subjects", "subjects tidak boleh berisi slug duplikat.");
  }

  const cover = String(raw.cover ?? "");
  const coverExtension = extensionOf(cover);
  if (!coverExtension || !["webp", "png", "jpg", "jpeg"].includes(coverExtension)) {
    push("cover", "cover harus WebP/PNG/JPG (§4).");
  }
  if (!String(raw.transcriptPath ?? "").endsWith(".txt")) {
    push("transcriptPath", "transkrip wajib berkas .txt (§4).");
  }

  const files = Array.isArray(raw.files) ? (raw.files as unknown[]) : [];
  const seen = new Set<string>();
  for (const [index, entry] of files.entries()) {
    const file = entry as Record<string, unknown>;
    const path = typeof file?.path === "string" ? file.path : "";
    if (!path) {
      push(`files[${index}]`, "entri files wajib punya path.");
      continue;
    }
    if (path === "material.json") {
      push(`files[${index}].path`, "material.json tidak boleh masuk files (§4).");
    }
    const key = path.toLowerCase();
    if (seen.has(key)) {
      push(`files[${index}].path`, `path duplikat (bentrok di Windows): ${path}`);
    }
    seen.add(key);

    const extension = extensionOf(path);
    const expected = extension ? MEDIA_TYPES[extension] : undefined;
    if (!expected) {
      push(`files[${index}].path`, `tipe berkas tidak diizinkan: ${path}`);
    } else if (file.mediaType !== expected) {
      push(`files[${index}].mediaType`, `mediaType ${String(file.mediaType)} tidak cocok dengan ${expected}.`);
    }
    if (typeof file.bytes !== "number" || !Number.isInteger(file.bytes) || file.bytes <= 0) {
      push(`files[${index}].bytes`, "bytes harus bilangan bulat > 0.");
    }
    if (typeof file.sha256 !== "string" || !SHA256.test(file.sha256)) {
      push(`files[${index}].sha256`, "sha256 harus 64 heksadesimal kecil.");
    }
  }

  for (const key of Object.keys(raw)) {
    if (key === "topics" || key === "curriculumRefs" || key === "captionsPath") {
      continue;
    }
    if (!(key in manifestBase.shape)) {
      push(key, `field tak dikenal ditolak oleh kontrak §4: ${key}`);
    }
  }

  return issues;
}
