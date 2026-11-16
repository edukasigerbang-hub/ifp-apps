export interface DigestiblePackage {
  manifest: unknown;
  lessons: unknown[];
  activities: unknown[];
}

// Kunci yang berubah karena proses review/publikasi, bukan karena isi.
// Kalau ikut dihitung, menaikkan reviewStatus akan membatalkan digest review itu sendiri.
const VOLATILE_KEYS = new Set(["reviewStatus", "releaseState", "signature"]);

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }
  if (value !== null && typeof value === "object") {
    const source = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(source).sort()) {
      if (VOLATILE_KEYS.has(key)) {
        continue;
      }
      sorted[key] = canonicalize(source[key]);
    }
    return sorted;
  }
  return value;
}

function sortKeyOf(value: unknown, key: string): string {
  if (value !== null && typeof value === "object") {
    const candidate = (value as Record<string, unknown>)[key];
    if (typeof candidate === "string") {
      return candidate;
    }
  }
  return JSON.stringify(canonicalize(value));
}

function sortedById(values: unknown[], key: string): unknown[] {
  return [...values]
    .map((value) => ({ key: sortKeyOf(value, key), value }))
    .sort((left, right) => (left.key < right.key ? -1 : left.key > right.key ? 1 : 0))
    .map((entry) => entry.value);
}

export function canonicalPackageJson(input: DigestiblePackage): string {
  return JSON.stringify({
    manifest: canonicalize(input.manifest),
    lessons: sortedById(input.lessons, "lessonId").map(canonicalize),
    activities: sortedById(input.activities, "activityId").map(canonicalize)
  });
}

export async function packageContentDigest(input: DigestiblePackage): Promise<string> {
  const bytes = new TextEncoder().encode(canonicalPackageJson(input));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
