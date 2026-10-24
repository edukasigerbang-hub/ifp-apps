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

export interface TransferRequest {
  schemaVersion: string;
  productId: string;
  machineId: string;
  licenseId: string;
  requestId: string;
  reason: string | null;
  createdAt: string;
}

export async function exportTransferRequest(reason: string | null): Promise<TransferRequest> {
  return invoke<TransferRequest>("license_export_transfer_request", {
    input: { reason }
  });
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

export function licenseServerUrl(): string {
  return (import.meta.env.VITE_LICENSE_SERVER_URL ?? "").trim();
}

export function isLicenseServerConfigured(): boolean {
  return licenseServerUrl().length > 0;
}

export async function activateOnline(serial: string): Promise<LicenseStatus> {
  const baseUrl = licenseServerUrl();
  if (!baseUrl) {
    throw new Error("Server lisensi belum dikonfigurasi (VITE_LICENSE_SERVER_URL).");
  }

  const request = await exportActivationRequest();
  const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/v1/activations`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      ...request,
      createdAt: new Date().toISOString(),
      serial
    })
  });

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const error = body as { error?: { code?: string; message?: string } } | null;
    throw new Error(
      `${error?.error?.code ?? "LICENSE_ACTIVATION_FAILED"}: ${error?.error?.message ?? `HTTP ${response.status}`}`
    );
  }

  return invoke<LicenseStatus>("license_import_json", { input: { json: JSON.stringify(body) } });
}
