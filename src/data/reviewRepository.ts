import { invoke } from "@tauri-apps/api/core";

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
