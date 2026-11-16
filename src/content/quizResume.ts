import type { QuizAnswerValue } from "./quiz";

export interface QuizResumeIdentity {
  packageId: string;
  lessonId: string;
  activityId: string;
}

export interface QuizResume extends QuizResumeIdentity {
  questionIndex: number;
  answers: Record<string, QuizAnswerValue>;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function sanitizeAnswers(
  raw: unknown,
  questionIds: string[]
): Record<string, QuizAnswerValue> {
  const answers: Record<string, QuizAnswerValue> = {};
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return answers;
  }
  for (const [questionId, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!questionIds.includes(questionId)) continue;
    if (typeof value === "string") {
      answers[questionId] = value;
      continue;
    }
    if (Array.isArray(value)) {
      const options = value.filter((entry): entry is string => typeof entry === "string");
      if (options.length > 0) answers[questionId] = options;
    }
  }
  return answers;
}

export function serializeQuizResume(resume: QuizResume): string {
  return JSON.stringify({
    packageId: resume.packageId,
    lessonId: resume.lessonId,
    activityId: resume.activityId,
    questionIndex: resume.questionIndex,
    answers: resume.answers
  });
}

/**
 * Mengembalikan null untuk data rusak atau milik kuis lain, supaya posisi
 * lama tidak pernah dipulihkan ke soal yang berbeda.
 */
export function parseQuizResume(raw: string | null, questionIds: string[]): QuizResume | null {
  if (!raw || questionIds.length === 0) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const record = parsed as Record<string, unknown>;
  if (
    !isNonEmptyString(record.packageId) ||
    !isNonEmptyString(record.lessonId) ||
    !isNonEmptyString(record.activityId)
  ) {
    return null;
  }
  const index = record.questionIndex;
  if (typeof index !== "number" || !Number.isInteger(index) || index < 0) {
    return null;
  }
  return {
    packageId: record.packageId,
    lessonId: record.lessonId,
    activityId: record.activityId,
    questionIndex: Math.min(index, questionIds.length - 1),
    answers: sanitizeAnswers(record.answers, questionIds)
  };
}

export function sameQuizResumeIdentity(
  resume: QuizResume,
  identity: QuizResumeIdentity
): boolean {
  return (
    resume.packageId === identity.packageId &&
    resume.lessonId === identity.lessonId &&
    resume.activityId === identity.activityId
  );
}
