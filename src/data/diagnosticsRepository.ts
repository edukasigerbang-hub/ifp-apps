import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";

export interface DiagnosticsSummary {
  path: string;
  bytes: number;
  sha256: string;
}

export async function exportDiagnostics(destination: string): Promise<DiagnosticsSummary> {
  return invoke<DiagnosticsSummary>("app_export_diagnostics", { destination });
}

export async function pickDiagnosticsDestination(defaultName: string): Promise<string | null> {
  const selected = await save({
    defaultPath: defaultName,
    filters: [{ name: "Diagnostics", extensions: ["json"] }]
  });
  return typeof selected === "string" ? selected : null;
}
