import { describe, expect, it } from "vitest";
import { isAnswerCorrect, scoreQuiz } from "../quiz";
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

describe("jawaban singkat", () => {
  const textQuestions: QuizQuestion[] = [
    {
      questionId: "soal-teks",
      prompt: "Tuliskan setengah",
      responseType: "text",
      correctResponse: "setengah"
    }
  ];

  it("mengabaikan spasi dan huruf besar", () => {
    expect(
      scoreQuiz(textQuestions, { "soal-teks": "  SETENGAH  " }, 75).score
    ).toBe(100);
  });

  it("menolak jawaban kosong atau salah", () => {
    expect(scoreQuiz(textQuestions, { "soal-teks": "   " }, 75).score).toBe(0);
    expect(scoreQuiz(textQuestions, { "soal-teks": "sepertiga" }, 75).score).toBe(0);
  });

  it("isAnswerCorrect menangani jawaban kosong", () => {
    const question = textQuestions[0];
    expect(isAnswerCorrect(question, undefined)).toBe(false);
    expect(isAnswerCorrect(question, "")).toBe(false);
    expect(isAnswerCorrect(question, "Setengah")).toBe(true);
  });
});

describe("benar-salah", () => {
  it("menerima 'false' sebagai jawaban benar untuk pernyataan salah", () => {
    const question: QuizQuestion = {
      questionId: "soal-bs",
      prompt: "1/2 lebih kecil dari 1/4",
      responseType: "boolean",
      correctResponse: "false"
    };
    expect(scoreQuiz([question], { "soal-bs": "false" }, 75).passed).toBe(true);
    expect(scoreQuiz([question], { "soal-bs": "true" }, 75).passed).toBe(false);
  });
});

describe("pilihan ganda multi-jawaban", () => {
  const question: QuizQuestion = {
    questionId: "soal-multi",
    prompt: "Pilih pecahan yang senilai",
    responseType: "multiple-choice",
    options: [
      { optionId: "opsi-a", text: "2/4" },
      { optionId: "opsi-b", text: "1/3" },
      { optionId: "opsi-c", text: "4/8" }
    ],
    correctResponse: ["opsi-a", "opsi-c"]
  };

  it("menerima semua jawaban benar tanpa memedulikan urutan", () => {
    expect(scoreQuiz([question], { "soal-multi": ["opsi-c", "opsi-a"] }, 75).score).toBe(100);
  });

  it("menolak jawaban kurang atau berlebih", () => {
    expect(scoreQuiz([question], { "soal-multi": ["opsi-a"] }, 75).score).toBe(0);
    expect(
      scoreQuiz([question], { "soal-multi": ["opsi-a", "opsi-b", "opsi-c"] }, 75).score
    ).toBe(0);
  });

  it("isAnswerCorrect menolak jawaban tunggal untuk soal multi", () => {
    expect(isAnswerCorrect(question, "opsi-a")).toBe(false);
    expect(isAnswerCorrect(question, ["opsi-a", "opsi-c"])).toBe(true);
  });
});
