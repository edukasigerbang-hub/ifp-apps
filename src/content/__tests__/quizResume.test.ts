import { describe, expect, it } from "vitest";
import {
  parseQuizResume,
  sameQuizResumeIdentity,
  serializeQuizResume,
  type QuizResume
} from "../quizResume";

const questionIds = ["soal-1", "soal-2", "soal-3"];

const resume: QuizResume = {
  packageId: "kelas3-matematika-b04-pecahan",
  lessonId: "pecahan",
  activityId: "kuis",
  questionIndex: 1,
  answers: { "soal-1": "Setengah", "soal-2": ["opsi-1-4", "opsi-2-8"] }
};

describe("quizResume", () => {
  it("bolak-balik serialize dan parse mempertahankan isi", () => {
    expect(parseQuizResume(serializeQuizResume(resume), questionIds)).toEqual(resume);
  });

  it("menolak data rusak atau identitas yang tidak lengkap", () => {
    expect(parseQuizResume(null, questionIds)).toBeNull();
    expect(parseQuizResume("bukan json", questionIds)).toBeNull();
    expect(parseQuizResume("[]", questionIds)).toBeNull();
    expect(
      parseQuizResume('{"packageId":"p","lessonId":"l","activityId":"a"}', questionIds)
    ).toBeNull();
    expect(
      parseQuizResume(
        '{"packageId":"p","lessonId":"l","activityId":"a","questionIndex":-1}',
        questionIds
      )
    ).toBeNull();
    expect(
      parseQuizResume(
        '{"packageId":"p","lessonId":"l","activityId":"a","questionIndex":1.5}',
        questionIds
      )
    ).toBeNull();
    expect(parseQuizResume(serializeQuizResume(resume), [])).toBeNull();
  });

  it("menjepit indeks ke soal terakhir dan membuang jawaban tak dikenal", () => {
    const raw = JSON.stringify({
      packageId: "p",
      lessonId: "l",
      activityId: "a",
      questionIndex: 99,
      answers: { "soal-1": "jawab", "soal-lain": "abaikan", "soal-2": [] }
    });
    const parsed = parseQuizResume(raw, questionIds);
    expect(parsed?.questionIndex).toBe(2);
    expect(parsed?.answers).toEqual({ "soal-1": "jawab" });
  });

  it("membandingkan identitas kuis", () => {
    expect(sameQuizResumeIdentity(resume, resume)).toBe(true);
    expect(
      sameQuizResumeIdentity(resume, { ...resume, activityId: "kuis-lain" })
    ).toBe(false);
  });
});
