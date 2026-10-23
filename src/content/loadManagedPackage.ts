import { getActivePackage, readAsset } from "../data/contentRepository";
import type { LoadedContentPackage } from "./loadPackages";
import { validateContentPackage } from "./validatePackage";

export interface ManagedContentPackage extends LoadedContentPackage {
  source: "managed";
  objectUrls: string[];
}

export async function loadManagedPackage(): Promise<ManagedContentPackage | null> {
  const active = await getActivePackage();
  if (!active) {
    return null;
  }

  const validation = validateContentPackage({
    manifest: active.manifest,
    lessons: active.lessons,
    activities: active.activities
  });

  if (!validation.ok || !validation.data) {
    const detail = validation.issues
      .slice(0, 3)
      .map((issue) => `${issue.code}: ${issue.message}`)
      .join("; ");
    throw new Error(`Paket impor aktif tidak lolos validasi skema. ${detail}`);
  }

  const assets: Record<string, string> = {};
  const objectUrls: string[] = [];

  for (const asset of active.assets) {
    const bytes = await readAsset(active.packageId, active.version, asset.path);
    const blob = new Blob([new Uint8Array(bytes)], { type: asset.mediaType });
    const url = URL.createObjectURL(blob);
    assets[asset.path] = url;
    objectUrls.push(url);
  }

  return {
    data: validation.data,
    assets,
    source: "managed",
    objectUrls
  };
}
