export interface GradedAnswer {
  questionId: string;
  optionId: string | null;
  responseText: string | null;
  isCorrect: boolean;
}

export interface GradedOutcome {
  score: number;
  answers: GradedAnswer[];
}
