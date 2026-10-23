import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";

export interface BackupCounts {
  profiles: number;
  sessions: number;
  attempts: number;
  responses: number;
  progress: number;
  outbox: number;
  licenses: number;
}

export interface BackupSummary {
  path: string;
  bytes: number;
  sha256: string;
  createdAt: string;
  migrations: number[];
  counts: BackupCounts;
}

export async function exportBackup(destination: string): Promise<BackupSummary> {
  return invoke<BackupSummary>("backup_export", { destination });
}

export async function inspectBackup(path: string): Promise<BackupSummary> {
  return invoke<BackupSummary>("backup_inspect", { path });
}

export async function restoreBackup(path: string): Promise<BackupSummary> {
  return invoke<BackupSummary>("backup_restore", { path });
}

export async function pickBackupDestination(defaultName: string): Promise<string | null> {
  const selected = await save({
    defaultPath: defaultName,
    filters: [{ name: "Database backup", extensions: ["db"] }]
  });
  return typeof selected === "string" ? selected : null;
}

export async function pickBackupSource(): Promise<string | null> {
  const selected = await open({
    directory: false,
    multiple: false,
    title: "Pilih file backup",
    filters: [{ name: "Database backup", extensions: ["db"] }]
  });
  return typeof selected === "string" ? selected : null;
}
