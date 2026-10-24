import type { Activity } from "./schema/activity";

type QuizQuestion = NonNullable<Activity["assessmentConfig"]>["questions"][number];

export interface QuizOutcome {
  correct: number;
  total: number;
  score: number;
  passed: boolean;
}

export function isAnswerCorrect(
  question: QuizQuestion,
  answer: string | undefined
): boolean {
  if (answer === undefined) return false;
  const correct = question.correctResponse;
  if (typeof correct !== "string") return false;
  if (question.responseType === "text") {
    return answer.trim().toLowerCase() === correct.trim().toLowerCase();
  }
  return answer === correct;
}

export function scoreQuiz(
  questions: QuizQuestion[],
  answers: Readonly<Record<string, string>>,
  passingScore: number
): QuizOutcome {
  const correct = questions.filter((question) =>
    isAnswerCorrect(question, answers[question.questionId])
  ).length;
  const total = questions.length;
  const score = total === 0 ? 0 : Math.round((correct / total) * 100);

  return { correct, total, score, passed: total > 0 && score >= passingScore };
}
