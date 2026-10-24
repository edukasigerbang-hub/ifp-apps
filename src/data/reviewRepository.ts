import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";

export type ReviewDecision = "approved" | "rejected";

export interface ContentReview {
  id: string;
  packageId: string;
  packageVersion: string;
  reviewerName: string;
  decision: ReviewDecision;
  notes: string | null;
  createdAt: string;
}

export async function listReviews(
  packageId?: string,
  packageVersion?: string
): Promise<ContentReview[]> {
  return invoke<ContentReview[]>("review_list", {
    packageId: packageId ?? null,
    packageVersion: packageVersion ?? null
  });
}

export interface RecordReviewInput {
  packageId: string;
  packageVersion: string;
  decision: ReviewDecision;
  notes: string | null;
}

export async function recordReview(input: RecordReviewInput): Promise<ContentReview> {
  return invoke<ContentReview>("review_record", { input });
}

export interface ReviewExportSummary {
  path: string;
  rows: number;
  bytes: number;
}

export async function exportReviewsCsv(destination: string): Promise<ReviewExportSummary> {
  return invoke<ReviewExportSummary>("review_export_csv", { destination });
}

export async function pickReviewExportDestination(
  suggestedName: string
): Promise<string | null> {
  const path = await save({
    defaultPath: suggestedName,
    filters: [{ name: "CSV", extensions: ["csv"] }]
  });
  return path ?? null;
}
