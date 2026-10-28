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

export interface CatalogItem {
  materialId: string;
  version: string;
  title: string;
  summary: string;
  gradeLevels: number[];
  subjects: string[];
  topics: string[];
  estimatedMinutes: number;
  reviewStatus: string;
  sizeBytes: number;
  publishedAt: string;
  updatedAt: string;
  installedVersion: string | null;
}

export interface CatalogPage {
  schemaVersion: string;
  generatedAt: string;
  items: CatalogItem[];
  nextCursor: string | null;
  /** true bila daftar berasal dari cache lokal karena katalog tidak terjangkau. */
  stale: boolean;
  cachedAt: string | null;
}

export interface MaterialCatalogConfig {
  baseUrl: string | null;
  source: string;
}

export interface CatalogQuery {
  grade?: number | null;
  subject?: string | null;
  cursor?: string | null;
  limit?: number | null;
}

// Rust `CatalogQuery` adalah Option di semua field; kirim eksplisit supaya
// `null` (tanpa filter) tidak bergantung pada perilaku serde untuk field hilang.
function catalogQueryInput(query: CatalogQuery) {
  return {
    grade: query.grade ?? null,
    subject: query.subject ?? null,
    cursor: query.cursor ?? null,
    limit: query.limit ?? null
  };
}

export async function getCatalogConfig(): Promise<MaterialCatalogConfig> {
  return invoke<MaterialCatalogConfig>("material_catalog_config_get");
}

export async function setCatalogConfig(baseUrl: string): Promise<MaterialCatalogConfig> {
  return invoke<MaterialCatalogConfig>("material_catalog_config_set", { input: { baseUrl } });
}

export async function listMaterialCatalog(query: CatalogQuery = {}): Promise<CatalogPage> {
  return invoke<CatalogPage>("material_catalog_list", { input: catalogQueryInput(query) });
}

export async function installMaterialFromCatalog(
  materialId: string,
  version: string,
  query: CatalogQuery = {}
): Promise<MaterialInstallResult> {
  return invoke<MaterialInstallResult>("material_catalog_install", {
    input: { materialId, version, query: catalogQueryInput(query) }
  });
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

/** Cover bundel terpasang sebagai data URL; null bila tidak ada. */
export async function getInstalledCover(materialId: string): Promise<string | null> {
  return invoke<string | null>("material_installed_cover", { materialId });
}

/** Cover item katalog (URL pre-signed diunduh Rust) sebagai data URL. */
export async function getCatalogCover(input: {
  materialId: string;
  version: string;
  query?: CatalogQuery;
}): Promise<string | null> {
  return invoke<string | null>("material_catalog_cover", {
    input: {
      materialId: input.materialId,
      version: input.version,
      query: catalogQueryInput(input.query ?? {})
    }
  });
}

export function materialEntryUrl(material: MaterialView): string {
  // `convertFileSrc` meng-encode seluruh path menjadi satu segmen ("a%2Fb"),
  // sehingga URL relatif di dalam materi (assets/app.js) tidak akan menemukan
  // berkasnya. Encode per segmen supaya struktur folder tetap utuh.
  const base = convertFileSrc("", "ifp-content");
  const path = material.entryPath.split("/").map(encodeURIComponent).join("/");
  return base + path;
}
