import { describe, expect, it } from "vitest";
import { scoreQuiz } from "../quiz";
import type { Activity } from "../schema/activity";

type QuizQuestion = NonNullable<Activity["assessmentConfig"]>["questions"][number];

const questions: QuizQuestion[] = [
  {
    questionId: "soal-a",
    prompt: "Soal A",
    responseType: "single-choice",
    options: [
      { optionId: "opsi-b", text: "B" },
      { optionId: "opsi-a", text: "A" }
    ],
    correctResponse: "opsi-b"
  },
  {
    questionId: "soal-b",
    prompt: "Soal B",
    responseType: "boolean",
    correctResponse: "true"
  }
];

describe("scoreQuiz", () => {
  it("memberi 100 dan lulus untuk semua jawaban benar", () => {
    const outcome = scoreQuiz(questions, { "soal-a": "opsi-b", "soal-b": "true" }, 75);

    expect(outcome).toEqual({ correct: 2, total: 2, score: 100, passed: true });
  });

  it("tidak lulus ketika skor di bawah ambang", () => {
    const outcome = scoreQuiz(questions, { "soal-a": "opsi-a", "soal-b": "false" }, 75);

    expect(outcome).toEqual({ correct: 0, total: 2, score: 0, passed: false });
  });

  it("lulus tepat pada ambang batas", () => {
    const outcome = scoreQuiz(questions, { "soal-a": "opsi-b", "soal-b": "false" }, 50);

    expect(outcome.score).toBe(50);
    expect(outcome.passed).toBe(true);
  });

  it("tidak lulus untuk kuis tanpa soal", () => {
    const outcome = scoreQuiz([], {}, 75);

    expect(outcome).toEqual({ correct: 0, total: 0, score: 0, passed: false });
  });
});
