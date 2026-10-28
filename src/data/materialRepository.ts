import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { canPersistLocally } from "./learningRepository";

export interface MaterialAccessibility {
  hasAudio: boolean;
  keyboardNavigable: boolean;
  supportsReducedMotion: boolean;
  contrastChecked: boolean;
}

export interface MaterialView {
  schemaVersion: string;
  materialId: string;
  version: string;
  title: string;
  summary: string;
  locale: string;
  gradeLevels: number[];
  subjects: string[];
  estimatedMinutes: number;
  entryPath: string;
  transcriptPath: string;
  transcript: string;
  completionMode: string;
  completionMinDwellSeconds: number;
  accessibility: MaterialAccessibility;
  reviewStatus: string;
  minAppVersion: string;
}

export interface InstalledMaterial {
  materialId: string;
  version: string;
  title: string;
  summary: string;
  gradeLevels: number[];
  subjects: string[];
  estimatedMinutes: number;
  reviewStatus: string;
  sizeBytes: number;
  installedAt: string;
}

export interface MaterialInstallResult {
  materialId: string;
  version: string;
  previousVersion: string | null;
  title: string;
  files: number;
  bytes: number;
}

export async function openSampleMaterial(): Promise<MaterialView> {
  return invoke<MaterialView>("material_open_sample");
}

export async function pickMaterialBundle(): Promise<string | null> {
  if (!canPersistLocally()) {
    return null;
  }
  const selected = await open({
    multiple: false,
    title: "Pilih bundel materi (.zip)",
    filters: [{ name: "Bundel materi", extensions: ["zip"] }]
  });
  return typeof selected === "string" ? selected : null;
}

export async function installMaterialBundle(bundlePath: string): Promise<MaterialInstallResult> {
  return invoke<MaterialInstallResult>("material_install_bundle", { input: { bundlePath } });
}

export async function listInstalledMaterials(): Promise<InstalledMaterial[]> {
  return invoke<InstalledMaterial[]>("material_list_installed");
}

export async function openInstalledMaterial(materialId: string): Promise<MaterialView> {
  return invoke<MaterialView>("material_open_installed", { materialId });
}

export function materialEntryUrl(material: MaterialView): string {
  // `convertFileSrc` meng-encode seluruh path menjadi satu segmen ("a%2Fb"),
  // sehingga URL relatif di dalam materi (assets/app.js) tidak akan menemukan
  // berkasnya. Encode per segmen supaya struktur folder tetap utuh.
  const base = convertFileSrc("", "ifp-content");
  const path = material.entryPath.split("/").map(encodeURIComponent).join("/");
  return base + path;
}
