import { useEffect, useRef, useState } from "react";
import { isAnswerCorrect, scoreQuiz, type QuizAnswerValue } from "../../content/quiz";
import type { Activity } from "../../content/schema/activity";

interface QuizActivityProps {
  activity: Activity;
  onGraded?: (outcome: QuizGradedOutcome) => void;
}

export interface QuizGradedAnswer {
  questionId: string;
  optionId: string | null;
  responseText: string | null;
  isCorrect: boolean;
}

export interface QuizGradedOutcome {
  score: number;
  answers: QuizGradedAnswer[];
}

interface QuizResult {
  score: number;
  passed: boolean;
  correct: number;
  total: number;
}

export function QuizActivity({ activity, onGraded }: QuizActivityProps) {
  const questions = activity.assessmentConfig?.questions ?? [];
  const passingScore = activity.assessmentConfig?.passingScore ?? 70;
  const [answers, setAnswers] = useState<Record<string, QuizAnswerValue>>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [result, setResult] = useState<QuizResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);
  const focusQuestionRef = useRef(false);

  useEffect(() => {
    if (result) {
      resultRef.current?.scrollIntoView({ block: "nearest" });
      resultRef.current?.focus();
      return;
    }
    if (!focusQuestionRef.current) return;
    focusQuestionRef.current = false;
    questionRef.current?.scrollIntoView({ block: "nearest" });
    questionRef.current?.focus();
  }, [questionIndex, result]);

  if (questions.length === 0) {
    return <p className="text-sm text-muted">Kuis ini belum memiliki soal.</p>;
  }

  const currentIndex = Math.min(questionIndex, questions.length - 1);
  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  const isAnswered = (entry: (typeof questions)[number]): boolean => {
    const answer = answers[entry.questionId];
    if (entry.responseType === "multiple-choice") {
      return Array.isArray(answer) && answer.length > 0;
    }
    if (entry.responseType === "text") {
      return typeof answer === "string" && answer.trim().length > 0;
    }
    return answer !== undefined;
  };
  const canAdvance = isAnswered(question);

  function choose(questionId: string, value: string) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  function toggle(questionId: string, optionId: string) {
    setAnswers((current) => {
      const existing = current[questionId];
      const list = Array.isArray(existing) ? existing : [];
      return {
        ...current,
        [questionId]: list.includes(optionId)
          ? list.filter((value) => value !== optionId)
          : [...list, optionId],
      };
    });
  }

  function goTo(nextIndex: number) {
    focusQuestionRef.current = true;
    setQuestionIndex(nextIndex);
  }

  function submit() {
    const outcome = scoreQuiz(questions, answers, passingScore);
    setResult({
      score: outcome.score,
      passed: outcome.passed,
      correct: outcome.correct,
      total: outcome.total,
    });

    if (onGraded) {
      const graded: QuizGradedAnswer[] = [];
      for (const entry of questions) {
        const answer = answers[entry.questionId];
        if (entry.responseType === "multiple-choice") {
          const selected = Array.isArray(answer) ? answer : [];
          const correctSet = Array.isArray(entry.correctResponse) ? entry.correctResponse : [];
          for (const optionId of selected) {
            graded.push({
              questionId: entry.questionId,
              optionId,
              responseText: null,
              isCorrect: correctSet.includes(optionId),
            });
          }
        } else if (entry.responseType === "text") {
          graded.push({
            questionId: entry.questionId,
            optionId: null,
            responseText: typeof answer === "string" ? answer.trim() : null,
            isCorrect: isAnswerCorrect(entry, answer),
          });
        } else {
          graded.push({
            questionId: entry.questionId,
            optionId: typeof answer === "string" ? answer : null,
            responseText: null,
            isCorrect: isAnswerCorrect(entry, answer),
          });
        }
      }
      onGraded({ score: outcome.score, answers: graded });
    }
  }

  function retry() {
    setAnswers({});
    setResult(null);
    focusQuestionRef.current = true;
    setQuestionIndex(0);
  }

  return (
    <div className="mx-auto max-w-3xl">
      {result === null ? (
        <>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p data-quiz-progress className="text-sm font-semibold">
              Soal {currentIndex + 1} dari {questions.length}
            </p>
            <p className="text-xs text-muted">Skor minimal lulus {passingScore} dari 100</p>
          </div>
          <div
            role="progressbar"
            aria-label="Kemajuan kuis"
            aria-valuemin={1}
            aria-valuemax={questions.length}
            aria-valuenow={currentIndex + 1}
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10"
          >
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          <div
            ref={questionRef}
            tabIndex={-1}
            className="mt-4 rounded-card border border-ink/10 bg-surface p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <fieldset>
              <legend className="sr-only">
                Soal {currentIndex + 1} dari {questions.length}
              </legend>
              <p className="text-base font-medium leading-relaxed">{question.prompt}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {question.responseType === "text" ? (
                  <label className="block text-sm sm:col-span-2">
                    Jawaban
                    <input
                      type="text"
                      value={
                        typeof answers[question.questionId] === "string"
                          ? (answers[question.questionId] as string)
                          : ""
                      }
                      aria-label={question.prompt}
                      onChange={(event) => choose(question.questionId, event.target.value)}
                      className="mt-1 block min-h-11 w-full max-w-xl rounded-control border border-ink/15 px-3 text-sm"
                    />
                  </label>
                ) : question.responseType === "multiple-choice" ? (
                  (question.options ?? []).map((option) => {
                    const answer = answers[question.questionId];
                    const checked = Array.isArray(answer) && answer.includes(option.optionId);
                    return (
                      <label
                        key={option.optionId}
                        className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-control border px-4 py-2 text-sm ${
                          checked
                            ? "border-primary bg-primary/5 font-medium"
                            : "border-ink/10 hover:bg-paper"
                        }`}
                      >
                        <input
                          type="checkbox"
                          name={question.questionId}
                          value={option.optionId}
                          checked={checked}
                          onChange={() => toggle(question.questionId, option.optionId)}
                          className="h-4 w-4 accent-[var(--color-primary)]"
                        />
                        {option.text}
                      </label>
                    );
                  })
                ) : (
                  (question.responseType === "boolean"
                    ? [
                        { optionId: "true", text: "Benar" },
                        { optionId: "false", text: "Salah" },
                      ]
                    : (question.options ?? [])
                  ).map((option) => {
                    const checked = answers[question.questionId] === option.optionId;
                    return (
                      <label
                        key={option.optionId}
                        className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-control border px-4 py-2 text-sm ${
                          checked
                            ? "border-primary bg-primary/5 font-medium"
                            : "border-ink/10 hover:bg-paper"
                        }`}
                      >
                        <input
                          type="radio"
                          name={question.questionId}
                          value={option.optionId}
                          checked={checked}
                          onChange={() => choose(question.questionId, option.optionId)}
                          className="h-4 w-4 accent-[var(--color-primary)]"
                        />
                        {option.text}
                      </label>
                    );
                  })
                )}
              </div>
            </fieldset>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => goTo(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="min-h-11 rounded-control border border-ink/15 bg-surface px-4 text-sm font-medium text-ink hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sebelumnya
            </button>
            <div className="flex flex-wrap items-center gap-3">
              {!canAdvance && (
                <p className="text-xs text-muted">Pilih atau tulis jawaban untuk melanjutkan.</p>
              )}
              <button
                type="button"
                onClick={() => (isLast ? submit() : goTo(currentIndex + 1))}
                disabled={!canAdvance}
                className="min-h-11 rounded-control bg-primary px-5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isLast ? "Lihat hasil" : "Lanjut"}
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div aria-live="polite">
            <div
              ref={resultRef}
              tabIndex={-1}
              className={`rounded-card border p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                result.passed ? "border-teal/30 bg-teal/5" : "border-warning/40 bg-warning/10"
              }`}
            >
              <p className="text-lg font-semibold">
                Skor {result.score} dari 100 — {result.passed ? "Lulus" : "Belum lulus"}
              </p>
              <p className="mt-1 text-sm text-muted">
                Benar {result.correct} dari {result.total} soal. Skor minimal lulus {passingScore} dari
                100.
              </p>
              <p className="mt-1 text-sm text-muted">
                {result.passed
                  ? "Kerja bagus! Jawabanmu sudah tepat."
                  : "Belum apa-apa. Ayo baca lagi penjelasannya, lalu coba sekali lagi."}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={retry}
              className="min-h-11 rounded-control bg-primary px-5 text-sm font-semibold text-white hover:opacity-90"
            >
              Ulangi kuis
            </button>
          </div>
        </>
      )}
    </div>
  );
}
