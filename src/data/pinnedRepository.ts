import { invoke } from "@tauri-apps/api/core";

export interface PinnedLesson {
  packageId: string;
  lessonId: string;
  pinnedAt: string;
}

export interface SetPinnedInput {
  profileId: string;
  packageId: string;
  lessonId: string;
  pinned: boolean;
}

export interface PinnedMaterial {
  materialId: string;
  pinnedAt: string;
}

export interface SetPinnedMaterialInput {
  profileId: string;
  materialId: string;
  pinned: boolean;
}

export function pinnedKey(item: { packageId: string; lessonId: string }): string {
  return `${item.packageId}:${item.lessonId}`;
}

export async function listPinnedLessons(profileId: string): Promise<PinnedLesson[]> {
  return invoke<PinnedLesson[]>("pinned_list", { profileId });
}

export async function setPinnedLesson(input: SetPinnedInput): Promise<boolean> {
  return invoke<boolean>("pinned_set", { input });
}

export async function listPinnedMaterials(profileId: string): Promise<PinnedMaterial[]> {
  return invoke<PinnedMaterial[]>("pinned_material_list", { profileId });
}

export async function setPinnedMaterial(input: SetPinnedMaterialInput): Promise<boolean> {
  return invoke<boolean>("pinned_material_set", { input });
}

export function pinnedErrorMessage(caught: unknown): string {
  const typed = caught as { message?: string };
  if (typed?.message) {
    return typed.message;
  }
  return caught instanceof Error ? caught.message : "Materi tidak dapat disematkan.";
}
