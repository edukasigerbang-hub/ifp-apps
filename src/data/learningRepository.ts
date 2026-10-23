import { invoke } from "@tauri-apps/api/core";
import { getActiveProfile } from "./profileRepository";

export interface SessionRecord {
  sessionId: string;
  startedAt: string;
}

export interface StartSessionInput {
  sessionId: string;
  profileId: string;
  packageId: string;
  packageVersion: string;
  lessonId: string;
  manifestHash?: string | null;
}

export interface AnswerRecord {
  responseId: string;
  questionId: string;
  optionId: string | null;
  isCorrect: boolean;
}

export interface SaveAttemptInput {
  attemptId: string;
  progressId: string;
  outboxId: string;
  eventId: string;
  sessionId: string;
  activityId: string;
  score: number;
  occurredAt: string;
  answers: AnswerRecord[];
}

export interface AttemptRecord {
  attemptId: string;
  attemptNo: number;
  score: number;
  outboxEventId: string;
}

export interface RecentAttempt {
  lessonId: string;
  activityId: string;
  score: number;
  completedAt: string | null;
}

export interface LearningSummary {
  sessions: number;
  attempts: number;
  averageScore: number | null;
  recent: RecentAttempt[];
}

export class LearningStorageError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "LearningStorageError";
    this.code = code;
  }
}

let previewProfileId: string | null = null;

export function canPersistLocally(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

async function call<T>(command: string, args: Record<string, unknown>): Promise<T> {
  try {
    return await invoke<T>(command, args);
  } catch (error) {
    const typed = error as { code?: string; message?: string };
    throw new LearningStorageError(
      typed?.code ?? "STORAGE_ERROR",
      typed?.message ?? "Penyimpanan lokal gagal."
    );
  }
}

export async function ensureLocalProfile(): Promise<string> {
  if (!canPersistLocally()) {
    if (!previewProfileId) {
      previewProfileId = crypto.randomUUID();
    }
    return previewProfileId;
  }
  const profile = await getActiveProfile();
  return profile.id;
}

export async function startLearningSession(input: StartSessionInput): Promise<SessionRecord> {
  return call<SessionRecord>("learning_start_session", { input });
}

const sessionPromises = new Map<string, Promise<SessionRecord>>();

export function getOrStartSession(input: StartSessionInput): Promise<SessionRecord> {
  const key = [input.profileId, input.packageId, input.packageVersion, input.lessonId].join("|");
  const existing = sessionPromises.get(key);
  if (existing) {
    return existing;
  }

  const promise = startLearningSession(input).catch((error: unknown) => {
    sessionPromises.delete(key);
    throw error;
  });
  sessionPromises.set(key, promise);
  return promise;
}

export async function saveAttempt(input: SaveAttemptInput): Promise<AttemptRecord> {
  return call<AttemptRecord>("learning_save_attempt", { input });
}

export async function getLearningSummary(profileId: string): Promise<LearningSummary> {
  return call<LearningSummary>("learning_get_summary", { profileId });
}
