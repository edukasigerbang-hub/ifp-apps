import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";

export interface ResultsExportSummary {
  path: string;
  rows: number;
  bytes: number;
}

export async function exportResultsCsv(destination: string): Promise<ResultsExportSummary> {
  return invoke<ResultsExportSummary>("results_export_csv", { destination });
}

export async function pickResultsDestination(defaultName: string): Promise<string | null> {
  const selected = await save({
    defaultPath: defaultName,
    filters: [{ name: "CSV", extensions: ["csv"] }]
  });
  return typeof selected === "string" ? selected : null;
}
