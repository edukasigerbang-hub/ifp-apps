import { useMemo, useState } from "react";
import type { GradedOutcome } from "../../content/graded";
import { readOrdering, scoreOrdering } from "../../content/interactions";
import type { Activity } from "../../content/schema/activity";

interface OrderingActivityProps {
  activity: Activity;
  onGraded?: (outcome: GradedOutcome) => void;
}

export function OrderingActivity({ activity, onGraded }: OrderingActivityProps) {
  const { items, correctOrder } = useMemo(() => readOrdering(activity), [activity]);
  const threshold =
    activity.completionPolicy.type === "score-threshold"
      ? activity.completionPolicy.threshold ?? 70
      : 70;
  const [order, setOrder] = useState<string[]>(() => items.map((item) => item.itemId));
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

  if (items.length === 0) {
    return <p className="text-sm text-muted">Aktivitas ini belum memiliki item.</p>;
  }

  const byId = new Map(items.map((item) => [item.itemId, item.text]));
  const expectedIndex = new Map(correctOrder.map((itemId, index) => [itemId, index]));

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    setOrder((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function submit() {
    const outcome = scoreOrdering(items, order, correctOrder);
    const passed = outcome.score >= threshold;
    setResult({ score: outcome.score, passed });
    onGraded?.({ score: outcome.score, answers: outcome.answers });
  }

  function retry() {
    setOrder(items.map((item) => item.itemId));
    setResult(null);
  }

  return (
    <div>
      <p className="text-sm text-muted">{activity.instructions}</p>

      <ol className="mt-5 space-y-2">
        {order.map((itemId, index) => {
          const correct = result ? expectedIndex.get(itemId) === index : null;
          return (
            <li
              key={itemId}
              className={`flex flex-wrap items-center gap-3 rounded-card border bg-surface p-3 ${
                correct === null
                  ? "border-ink/10"
                  : correct
                    ? "border-teal/30 bg-teal/5"
                    : "border-danger/30 bg-danger/5"
              }`}
            >
              <span className="w-6 text-sm font-semibold text-muted">{index + 1}.</span>
              <span className="flex-1 text-base font-medium">{byId.get(itemId) ?? itemId}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0 || result !== null}
                  aria-label={`Naikkan ${byId.get(itemId) ?? itemId}`}
                  className="min-h-11 min-w-11 rounded-control border border-ink/15 px-3 text-sm hover:bg-paper disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === order.length - 1 || result !== null}
                  aria-label={`Turunkan ${byId.get(itemId) ?? itemId}`}
                  className="min-h-11 min-w-11 rounded-control border border-ink/15 px-3 text-sm hover:bg-paper disabled:opacity-30"
                >
                  ↓
                </button>
              </div>
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
      </ol>

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
            className="min-h-11 rounded-control bg-primary px-5 text-sm font-semibold text-white hover:opacity-90"
          >
            Periksa urutan
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
