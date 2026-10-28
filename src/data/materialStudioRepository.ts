import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import type { MaterialView } from "./materialRepository";

export interface StudioTemplate {
  id: string;
  label: string;
  description: string;
}

export interface StudioDraft {
  materialId: string;
  version: string;
  title: string;
  templateId: string;
  createdAt: string;
  updatedAt: string;
  cover: string | null;
}

export interface StudioDraftFile {
  path: string;
  mediaType: string | null;
  bytes: number;
  editable: boolean;
  content: string | null;
}

export type StudioManifest = Record<string, unknown>;

export interface StudioDraftContent {
  draft: StudioDraft;
  manifest: StudioManifest;
  files: StudioDraftFile[];
  totalBytes: number;
}

export interface StudioDraftReport {
  ok: boolean;
  errors: string[];
  warnings: string[];
  fileCount: number;
  totalBytes: number;
}

export interface StudioExportResult {
  sourceDirectory: string;
  bundleZip: string;
  totalBytes: number;
}

export interface CreateStudioDraftInput {
  materialId: string;
  version: string;
  title: string;
  templateId: string;
  summary?: string | null;
  grade?: number | null;
  subject?: string | null;
  estimatedMinutes?: number | null;
}

export interface StudioDraftKey {
  materialId: string;
  version: string;
}

// `deny_unknown_fields` di Rust: field opsional dikirim sebagai null, bukan hilang.
function createInput(input: CreateStudioDraftInput) {
  return {
    materialId: input.materialId,
    version: input.version,
    title: input.title,
    templateId: input.templateId,
    summary: input.summary ?? null,
    grade: input.grade ?? null,
    subject: input.subject ?? null,
    estimatedMinutes: input.estimatedMinutes ?? null
  };
}

function draftKeyInput(key: StudioDraftKey) {
  return { materialId: key.materialId, version: key.version };
}

export function studioDraftId(key: StudioDraftKey): string {
  return `${key.materialId}@${key.version}`;
}

export function messageOf(caught: unknown, fallback: string): string {
  const typed = caught as { message?: string };
  return typed?.message ?? fallback;
}

export async function listStudioTemplates(): Promise<StudioTemplate[]> {
  return invoke<StudioTemplate[]>("material_draft_templates");
}

export async function listStudioDrafts(): Promise<StudioDraft[]> {
  return invoke<StudioDraft[]>("material_draft_list");
}

export async function createStudioDraft(
  input: CreateStudioDraftInput
): Promise<StudioDraftContent> {
  return invoke<StudioDraftContent>("material_draft_create", { input: createInput(input) });
}

export async function readStudioDraft(key: StudioDraftKey): Promise<StudioDraftContent> {
  return invoke<StudioDraftContent>("material_draft_read", { input: draftKeyInput(key) });
}

export async function writeStudioFile(
  key: StudioDraftKey,
  path: string,
  content: string
): Promise<StudioDraftContent> {
  return invoke<StudioDraftContent>("material_draft_file_write", {
    input: { ...draftKeyInput(key), path, content }
  });
}

export async function addStudioAsset(
  key: StudioDraftKey,
  path: string,
  data: string
): Promise<StudioDraftContent> {
  return invoke<StudioDraftContent>("material_draft_asset_add", {
    input: { ...draftKeyInput(key), path, data }
  });
}

export async function deleteStudioFile(
  key: StudioDraftKey,
  path: string
): Promise<StudioDraftContent> {
  return invoke<StudioDraftContent>("material_draft_file_delete", {
    input: { ...draftKeyInput(key), path }
  });
}

export async function setStudioManifest(
  key: StudioDraftKey,
  manifest: StudioManifest
): Promise<StudioDraftContent> {
  return invoke<StudioDraftContent>("material_draft_manifest_set", {
    input: { ...draftKeyInput(key), manifest }
  });
}

export async function checkStudioDraft(key: StudioDraftKey): Promise<StudioDraftReport> {
  return invoke<StudioDraftReport>("material_draft_check", { input: draftKeyInput(key) });
}

export async function previewStudioDraft(key: StudioDraftKey): Promise<MaterialView> {
  return invoke<MaterialView>("material_draft_open", { input: draftKeyInput(key) });
}

export async function exportStudioDraft(
  key: StudioDraftKey,
  targetDir: string
): Promise<StudioExportResult> {
  return invoke<StudioExportResult>("material_draft_export", {
    input: draftKeyInput(key),
    targetDir
  });
}

export async function deleteStudioDraft(key: StudioDraftKey, confirm: string): Promise<void> {
  await invoke("material_draft_delete", { input: { ...draftKeyInput(key), confirm } });
}

export async function pickStudioExportFolder(): Promise<string | null> {
  const selected = await open({
    multiple: false,
    directory: true,
    title: "Pilih folder tujuan ekspor"
  });
  return typeof selected === "string" ? selected : null;
}

export async function readStudioCoverFile(file: File): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Berkas cover tidak dapat dibaca."));
    reader.readAsDataURL(file);
  });
}

export function bytesToBase64(bytes: Uint8Array): string {
  // Spread per 32 KB agar batas argumen fungsi tidak terlampaui pada cover besar.
  const step = 0x8000;
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += step) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + step));
  }
  return btoa(binary);
}

export async function readStudioCoverUrl(source: string): Promise<string> {
  const response = await fetch(source);
  if (!response.ok) {
    throw new Error("Gambar cover tidak dapat dimuat dari katalog.");
  }
  return bytesToBase64(new Uint8Array(await response.arrayBuffer()));
}
