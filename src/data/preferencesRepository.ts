import { invoke } from "@tauri-apps/api/core";

export interface Preferences {
  reducedMotion: boolean;
  fontScale: "normal" | "large";
}

export async function getPreferences(): Promise<Preferences> {
  return invoke<Preferences>("preferences_get");
}

export async function setPreferences(input: Preferences): Promise<Preferences> {
  return invoke<Preferences>("preferences_set", { input });
}

export function applyPreferences(preferences: Preferences): void {
  const root = document.documentElement;
  root.classList.toggle("reduce-motion", preferences.reducedMotion);
  root.classList.toggle("font-large", preferences.fontScale === "large");
}
