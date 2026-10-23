import { useState } from "react";
import { scoreQuiz } from "../../content/quiz";
import type { Activity } from "../../content/schema/activity";

interface QuizActivityProps {
  activity: Activity;
}

interface QuizResult {
  score: number;
  passed: boolean;
}

export function QuizActivity({ activity }: QuizActivityProps) {
  const questions = activity.assessmentConfig?.questions ?? [];
  const passingScore = activity.assessmentConfig?.passingScore ?? 70;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);

  if (questions.length === 0) {
    return <p className="text-sm text-muted">Kuis ini belum memiliki soal.</p>;
  }

  const answeredCount = questions.filter((question) => answers[question.questionId] !== undefined).length;
  const allAnswered = answeredCount === questions.length;

  function choose(questionId: string, optionId: string) {
    setAnswers((current) => ({ ...current, [questionId]: optionId }));
  }

  function submit() {
    const outcome = scoreQuiz(questions, answers, passingScore);
    setResult({ score: outcome.score, passed: outcome.passed });
  }

  function retry() {
    setAnswers({});
    setResult(null);
  }

  return (
    <div>
      <p className="text-sm text-muted">
        Jawab semua soal, lalu periksa jawaban. Nilai lulus: {passingScore}. Terjawab {answeredCount} dari {questions.length}.
      </p>

      <div className="mt-5 space-y-5">
        {questions.map((question, index) => (
          <fieldset key={question.questionId} className="rounded-card border border-ink/10 bg-surface p-5">
            <legend className="px-1 text-sm font-semibold text-muted">Soal {index + 1}</legend>
            <p className="mt-1 text-base font-medium leading-relaxed">{question.prompt}</p>
            <div className="mt-4 space-y-2">
              {(question.options ?? []).map((option) => {
                const checked = answers[question.questionId] === option.optionId;
                return (
                  <label
                    key={option.optionId}
                    className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-control border px-4 py-2 text-sm ${
                      checked ? "border-primary bg-primary/5 font-medium" : "border-ink/10 hover:bg-paper"
                    } ${result ? "cursor-default opacity-80" : ""}`}
                  >
                    <input
                      type="radio"
                      name={question.questionId}
                      value={option.optionId}
                      checked={checked}
                      disabled={result !== null}
                      onChange={() => choose(question.questionId, option.optionId)}
                      className="h-4 w-4 accent-[var(--color-primary)]"
                    />
                    {option.text}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <div aria-live="polite" className="mt-6">
        {result && (
          <div
            className={`rounded-card border p-5 ${
              result.passed ? "border-teal/30 bg-teal/5" : "border-warning/40 bg-warning/10"
            }`}
          >
            <p className="text-lg font-semibold">
              Skor {result.score} dari 100 — {result.passed ? "Lulus" : "Belum lulus"}
            </p>
            <p className="mt-1 text-sm text-muted">
              {result.passed
                ? "Bagus! Kamu sudah memahami pecahan sederhana."
                : "Belum apa-apa. Ayo baca lagi penjelasannya, lalu coba sekali lagi."}
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {result === null ? (
          <button
            type="button"
            onClick={submit}
            disabled={!allAnswered}
            className="min-h-11 rounded-control bg-primary px-5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Periksa jawaban
          </button>
        ) : (
          <button
            type="button"
            onClick={retry}
            className="min-h-11 rounded-control bg-primary px-5 text-sm font-semibold text-white hover:opacity-90"
          >
            Ulangi kuis
          </button>
        )}
      </div>
    </div>
  );
}
