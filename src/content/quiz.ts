import type { Activity } from "./schema/activity";

type QuizQuestion = NonNullable<Activity["assessmentConfig"]>["questions"][number];

export type QuizAnswerValue = string | string[];

export interface QuizOutcome {
  correct: number;
  total: number;
  score: number;
  passed: boolean;
}

function sameSet(left: string[], right: string[]): boolean {
  const a = [...new Set(left)].sort();
  const b = [...new Set(right)].sort();
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

export function isAnswerCorrect(
  question: QuizQuestion,
  answer: QuizAnswerValue | undefined
): boolean {
  if (answer === undefined) return false;
  const correct = question.correctResponse;

  if (question.responseType === "multiple-choice") {
    return Array.isArray(correct) && Array.isArray(answer) && sameSet(answer, correct);
  }

  if (typeof correct !== "string" || typeof answer !== "string") return false;
  if (question.responseType === "text") {
    return answer.trim().toLowerCase() === correct.trim().toLowerCase();
  }
  return answer === correct;
}

export function scoreQuiz(
  questions: QuizQuestion[],
  answers: Readonly<Record<string, QuizAnswerValue>>,
  passingScore: number
): QuizOutcome {
  const correct = questions.filter((question) =>
    isAnswerCorrect(question, answers[question.questionId])
  ).length;
  const total = questions.length;
  const score = total === 0 ? 0 : Math.round((correct / total) * 100);

  return { correct, total, score, passed: total > 0 && score >= passingScore };
}
