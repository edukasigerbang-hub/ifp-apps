import { useMemo, useState } from "react";
import type { GradedOutcome } from "../../content/graded";
import { readMatchingPairs, scoreMatching } from "../../content/interactions";
import type { Activity } from "../../content/schema/activity";

interface MatchingActivityProps {
  activity: Activity;
  onGraded?: (outcome: GradedOutcome) => void;
}

export function MatchingActivity({ activity, onGraded }: MatchingActivityProps) {
  const pairs = useMemo(() => readMatchingPairs(activity), [activity]);
  const threshold =
    activity.completionPolicy.type === "score-threshold"
      ? activity.completionPolicy.threshold ?? 70
      : 70;
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

  if (pairs.length === 0) {
    return <p className="text-sm text-muted">Aktivitas ini belum memiliki pasangan.</p>;
  }

  const answered = pairs.filter((pair) => selections[pair.pairId] !== undefined).length;
  const allAnswered = answered === pairs.length;

  function choose(pairId: string, value: string) {
    setSelections((current) => ({ ...current, [pairId]: value }));
  }

  function submit() {
    const outcome = scoreMatching(pairs, selections);
    const passed = outcome.score >= threshold;
    setResult({ score: outcome.score, passed });
    onGraded?.({ score: outcome.score, answers: outcome.answers });
  }

  function retry() {
    setSelections({});
    setResult(null);
  }

  return (
    <div>
      <p className="text-sm text-muted">{activity.instructions}</p>
      <p className="mt-1 text-sm text-muted">
        Terjawab {answered} dari {pairs.length}.
      </p>

      <ul className="mt-5 space-y-3">
        {pairs.map((pair) => {
          const selected = selections[pair.pairId];
          const correct = result ? selected === pair.pairId : null;
          return (
            <li
              key={pair.pairId}
              className={`flex flex-wrap items-center gap-3 rounded-card border bg-surface p-4 ${
                correct === null
                  ? "border-ink/10"
                  : correct
                    ? "border-teal/30 bg-teal/5"
                    : "border-danger/30 bg-danger/5"
              }`}
            >
              <span className="min-w-24 flex-1 text-base font-medium">{pair.left}</span>
              <label className="text-sm">
                <span className="sr-only">Pasangkan {pair.left}</span>
                <select
                  value={selected ?? ""}
                  aria-label={`Pasangkan ${pair.left}`}
                  disabled={result !== null}
                  onChange={(event) => choose(pair.pairId, event.target.value)}
                  className="min-h-11 min-w-56 rounded-control border border-ink/15 px-3 text-sm disabled:opacity-80"
                >
                  <option value="">Pilih pasangan…</option>
                  {pairs.map((option) => (
                    <option key={option.pairId} value={option.pairId}>
                      {option.right}
                    </option>
                  ))}
                </select>
              </label>
              {correct !== null && (
                <span
                  className={`text-sm font-medium ${correct ? "text-teal" : "text-danger"}`}
                >
                  {correct ? "Benar" : "Salah"}
                </span>
              )}
            </li>
          );
        })}
      </ul>

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
            Periksa pasangan
          </button>
        ) : (
          <button
            type="button"
            onClick={retry}
            className="min-h-11 rounded-control bg-primary px-5 text-sm font-semibold text-white hover:opacity-90"
          >
            Ulangi
          </button>
        )}
      </div>
    </div>
  );
}
