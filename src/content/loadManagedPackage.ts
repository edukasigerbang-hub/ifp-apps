import {
  getPackage,
  listActivePackages,
  readAsset,
  type ActivePackageRecord,
  type ActivePackageSummary
} from "../data/contentRepository";
import type { LoadedContentPackage } from "./loadPackages";
import { validateContentPackage } from "./validatePackage";

export interface ManagedContentPackage extends LoadedContentPackage {
  source: "managed";
  objectUrls: string[];
}

export async function listManagedPackages(): Promise<ActivePackageSummary[]> {
  return listActivePackages();
}

export async function loadManagedPackage(
  packageId?: string,
  version?: string
): Promise<ManagedContentPackage | null> {
  let active: ActivePackageRecord | null;

  if (packageId && version) {
    active = await getPackage(packageId, version);
  } else {
    const summaries = await listActivePackages();
    if (summaries.length === 0) {
      return null;
    }
    active = await getPackage(summaries[0].packageId, summaries[0].version);
  }

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
