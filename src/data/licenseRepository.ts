import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

export interface LicenseStatus {
  configured: boolean;
  valid: boolean;
  licenseId: string | null;
  licenseType: string | null;
  productId: string | null;
  expiresAt: string | null;
  entitlements: string[];
  machineId: string;
  inGrace: boolean;
  code: string | null;
  message: string | null;
}

export interface ActivationRequest {
  schemaVersion: string;
  productId: string;
  machineId: string;
  requestId: string;
  nonce: string;
  createdAt: string;
}

export async function getLicenseStatus(): Promise<LicenseStatus> {
  return invoke<LicenseStatus>("license_get_status");
}

export async function refreshLicense(): Promise<LicenseStatus> {
  return invoke<LicenseStatus>("license_refresh");
}

export async function importLicenseFile(path: string): Promise<LicenseStatus> {
  return invoke<LicenseStatus>("license_import_file", { input: { path } });
}

export async function exportActivationRequest(): Promise<ActivationRequest> {
  return invoke<ActivationRequest>("license_export_request");
}

export async function getMachineId(): Promise<string> {
  return invoke<string>("license_get_machine_id");
}

export async function pickLicenseFile(): Promise<string | null> {
  const selected = await open({
    directory: false,
    multiple: false,
    title: "Pilih file lisensi",
    filters: [{ name: "Lisensi", extensions: ["json"] }]
  });
  return typeof selected === "string" ? selected : null;
}
