import { invoke } from "@tauri-apps/api/core";

export interface Profile {
  id: string;
  displayName: string;
  profileType: string;
  createdAt: string;
  updatedAt: string;
}

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
  return invoke<ProfileDeletionResult>("profile_delete", { profileId, deleteData });
}
