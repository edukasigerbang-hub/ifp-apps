import { invoke } from "@tauri-apps/api/core";

export interface Profile {
  id: string;
  displayName: string;
  profileType: string;
  hasAvatar: boolean;
  createdAt: string;
  updatedAt: string;
}

const avatarCache = new Map<string, string | null>();

export async function listProfiles(): Promise<Profile[]> {
  return invoke<Profile[]>("profile_list");
}

export async function createProfile(
  displayName: string,
  profileType: "student" | "teacher"
): Promise<Profile> {
  return invoke<Profile>("profile_create", { input: { displayName, profileType } });
}

export async function getActiveProfile(): Promise<Profile> {
  return invoke<Profile>("profile_get_active");
}

export async function setActiveProfile(profileId: string): Promise<Profile> {
  return invoke<Profile>("profile_set_active", { profileId });
}

export interface ProfileDeletionResult {
  deletedId: string;
  activeProfile: Profile;
}

export async function renameProfile(profileId: string, displayName: string): Promise<Profile> {
  return invoke<Profile>("profile_rename", { profileId, displayName });
}

export async function deleteProfile(
  profileId: string,
  deleteData = false
): Promise<ProfileDeletionResult> {
  const result = await invoke<ProfileDeletionResult>("profile_delete", {
    profileId,
    deleteData
  });
  avatarCache.delete(profileId);
  return result;
}

export async function readProfileAvatar(profileId: string): Promise<string | null> {
  if (avatarCache.has(profileId)) {
    return avatarCache.get(profileId) ?? null;
  }
  const dataUrl = await invoke<string | null>("profile_avatar_get", { profileId });
  avatarCache.set(profileId, dataUrl ?? null);
  return dataUrl ?? null;
}

export async function readAvatarSource(sourcePath: string): Promise<string> {
  return invoke<string>("profile_avatar_preview", { sourcePath });
}

export async function saveProfileAvatar(
  profileId: string,
  dataUrl: string
): Promise<Profile> {
  const profile = await invoke<Profile>("profile_avatar_set_data", { profileId, dataUrl });
  avatarCache.delete(profileId);
  return profile;
}

export async function clearProfileAvatar(profileId: string): Promise<Profile> {
  const profile = await invoke<Profile>("profile_avatar_clear", { profileId });
  avatarCache.delete(profileId);
  return profile;
}
