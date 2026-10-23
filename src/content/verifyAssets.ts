import type { ContentPackageManifest } from "./schema/manifest";
import type { ContentIssue } from "./validatePackage";

async function sha256Hex(data: Uint8Array): Promise<string> {
  const copy = new Uint8Array(data.byteLength);
  copy.set(data);
  const digest = await crypto.subtle.digest("SHA-256", copy.buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyAssetHashes(
  manifest: ContentPackageManifest,
  files: ReadonlyMap<string, Uint8Array>
): Promise<ContentIssue[]> {
  const issues: ContentIssue[] = [];

  for (const [index, asset] of manifest.assets.entries()) {
    const data = files.get(asset.path);
    if (!data) {
      issues.push({
        code: "CONTENT_DEPENDENCY_MISSING",
        message: `file aset tidak ditemukan: ${asset.path}`,
        path: `manifest.assets.${index}.path`
      });
      continue;
    }

    if (data.byteLength !== asset.sizeBytes) {
      issues.push({
        code: "CONTENT_ASSET_HASH_MISMATCH",
        message: `ukuran aset tidak cocok untuk ${asset.path}: ${data.byteLength} != ${asset.sizeBytes}`,
        path: `manifest.assets.${index}.sizeBytes`
      });
      continue;
    }

    const actualHash = await sha256Hex(data);
    if (actualHash !== asset.sha256) {
      issues.push({
        code: "CONTENT_ASSET_HASH_MISMATCH",
        message: `SHA-256 tidak cocok untuk ${asset.path}`,
        path: `manifest.assets.${index}.sha256`
      });
    }
  }

  return issues;
}
