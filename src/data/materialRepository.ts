import { convertFileSrc, invoke } from "@tauri-apps/api/core";

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

export async function openSampleMaterial(): Promise<MaterialView> {
  return invoke<MaterialView>("material_open_sample");
}

export function materialEntryUrl(material: MaterialView): string {
  // `convertFileSrc` meng-encode seluruh path menjadi satu segmen ("a%2Fb"),
  // sehingga URL relatif di dalam materi (assets/app.js) tidak akan menemukan
  // berkasnya. Encode per segmen supaya struktur folder tetap utuh.
  const base = convertFileSrc("", "ifp-content");
  const path = material.entryPath.split("/").map(encodeURIComponent).join("/");
  return base + path;
}
