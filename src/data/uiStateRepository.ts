import { invoke } from "@tauri-apps/api/core";

export const HOME_TAB_KEY = "home-tab";
export const QUIZ_RESUME_KEY = "quiz-resume";

export function readUiState(profileId: string, key: string): Promise<string | null> {
  return invoke<string | null>("ui_state_get", { profileId, key });
}

export function writeUiState(profileId: string, key: string, value: string): Promise<void> {
  return invoke<void>("ui_state_set", { input: { profileId, key, value } });
}

export function clearUiState(profileId: string, key: string): Promise<void> {
  return invoke<void>("ui_state_clear", { input: { profileId, key } });
}
