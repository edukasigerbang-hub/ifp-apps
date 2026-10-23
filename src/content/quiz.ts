import type { Activity } from "./schema/activity";

type QuizQuestion = NonNullable<Activity["assessmentConfig"]>["questions"][number];

export interface QuizOutcome {
  correct: number;
  total: number;
  score: number;
  passed: boolean;
}

export function scoreQuiz(
  questions: QuizQuestion[],
  answers: Readonly<Record<string, string>>,
  passingScore: number
): QuizOutcome {
  const correct = questions.filter(
    (question) =>
      typeof question.correctResponse === "string" && answers[question.questionId] === question.correctResponse
  ).length;
  const total = questions.length;
  const score = total === 0 ? 0 : Math.round((correct / total) * 100);

  return { correct, total, score, passed: total > 0 && score >= passingScore };
}
