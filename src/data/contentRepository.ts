import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { canPersistLocally } from "./learningRepository";

export interface PackageRecord {
  packageId: string;
  version: string;
  status: string;
  source: string;
  installedAt: string;
  activatedAt: string | null;
}

export interface ImportResult {
  packageId: string;
  version: string;
  previousVersion: string | null;
  files: number;
  bytes: number;
}

export interface RollbackResult {
  packageId: string;
  activeVersion: string;
}

export interface ActiveAsset {
  path: string;
  mediaType: string;
  sizeBytes: number;
}

export interface ActivePackageRecord {
  packageId: string;
  version: string;
  manifest: unknown;
  lessons: unknown[];
  activities: unknown[];
  assets: ActiveAsset[];
}

export interface ActivePackageSummary {
  packageId: string;
  version: string;
  title: string;
  gradeLevels: number[];
  subjects: string[];
  lessonCount: number;
}

export async function pickContentPackageFolder(): Promise<string | null> {
  if (!canPersistLocally()) {
    return null;
  }
  const selected = await open({
    directory: true,
    multiple: false,
    title: "Pilih folder paket konten"
  });
  return typeof selected === "string" ? selected : null;
}

export async function importPackage(sourcePath: string): Promise<ImportResult> {
  return invoke<ImportResult>("content_import_package", { input: { sourcePath } });
}

export async function listPackages(): Promise<PackageRecord[]> {
  return invoke<PackageRecord[]>("content_list_packages");
}

export async function rollbackPackage(packageId: string): Promise<RollbackResult> {
  return invoke<RollbackResult>("content_rollback_package", { packageId });
}

export async function getActivePackage(): Promise<ActivePackageRecord | null> {
  return invoke<ActivePackageRecord | null>("content_get_active");
}

export async function listActivePackages(): Promise<ActivePackageSummary[]> {
  return invoke<ActivePackageSummary[]>("content_list_active");
}

export async function getPackage(packageId: string, version: string): Promise<ActivePackageRecord> {
  return invoke<ActivePackageRecord>("content_get_package", { packageId, version });
}

export async function readAsset(packageId: string, version: string, path: string): Promise<number[]> {
  return invoke<number[]>("content_read_asset", { input: { packageId, version, path } });
}
