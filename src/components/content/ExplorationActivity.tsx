import { useState } from "react";
import type { Activity } from "../../content/schema/activity";

interface ExplorationStep {
  prompt: string;
  assetPath?: string;
  altText?: string;
  reveal?: string;
  hint?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readSteps(activity: Activity): ExplorationStep[] {
  const raw = activity.interactionConfig.steps;
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.filter(isRecord).map((step) => ({
    prompt: typeof step.prompt === "string" ? step.prompt : "Amati gambar berikut.",
    assetPath: typeof step.assetPath === "string" ? step.assetPath : undefined,
    altText: typeof step.altText === "string" ? step.altText : undefined,
    reveal: typeof step.reveal === "string" ? step.reveal : undefined,
    hint: typeof step.hint === "string" ? step.hint : undefined
  }));
}

interface ExplorationActivityProps {
  activity: Activity;
  assets: Record<string, string>;
  onFinish?: () => void;
}

export function ExplorationActivity({ activity, assets, onFinish }: ExplorationActivityProps) {
  const steps = readSteps(activity);
  const [index, setIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [finished, setFinished] = useState(false);

  if (steps.length === 0) {
    return <p className="text-sm text-muted">Aktivitas ini belum memiliki langkah yang dapat ditampilkan.</p>;
  }

  const step = steps[index];
  const assetUrl = step.assetPath ? assets[step.assetPath] : undefined;
  const isLast = index === steps.length - 1;

  function goToStep(nextIndex: number) {
    setIndex(nextIndex);
    setShowHint(false);
    setShowReveal(false);
  }

  function restart() {
    setFinished(false);
    goToStep(0);
  }

  if (finished) {
    return (
      <div aria-live="polite" className="rounded-card border border-teal/30 bg-teal/5 p-6">
        <h3 className="text-lg font-semibold">Aktivitas selesai</h3>
        <p className="mt-2 text-sm text-muted">
          Kamu sudah mengamati keempat gambar. Lanjut ke kuis untuk berlatih.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={restart}
            className="min-h-11 rounded-control border border-ink/15 bg-surface px-5 text-sm font-medium hover:bg-paper"
          >
            Ulangi eksplorasi
          </button>
          {onFinish && (
            <button
              type="button"
              onClick={onFinish}
              className="min-h-11 rounded-control bg-primary px-5 text-sm font-semibold text-white hover:opacity-90"
            >
              Lanjut ke kuis
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 text-sm text-muted">
        <span>
          Langkah {index + 1} dari {steps.length}
        </span>
        <div
          role="progressbar"
          aria-label="Progres eksplorasi"
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-valuenow={index + 1}
          className="h-2 w-40 overflow-hidden rounded-full bg-ink/10"
        >
          <div
            className="h-full rounded-full bg-teal transition-all"
            style={{ width: `${((index + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {assetUrl && (
        <img
          src={assetUrl}
          alt={step.altText ?? activity.accessibilityMetadata?.altText ?? "Ilustrasi aktivitas"}
          className="mt-5 w-full max-w-xl rounded-card border border-ink/10 bg-surface"
        />
      )}

      <p className="mt-5 text-lg font-medium leading-relaxed">{step.prompt}</p>

      {step.hint && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowHint((value) => !value)}
            aria-expanded={showHint}
            className="min-h-11 rounded-control border border-ink/15 px-4 text-sm font-medium hover:bg-paper"
          >
            {showHint ? "Sembunyikan petunjuk" : "Lihat petunjuk"}
          </button>
          {showHint && <p className="mt-3 rounded-control bg-paper px-4 py-3 text-sm text-muted">{step.hint}</p>}
        </div>
      )}

      {step.reveal && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowReveal((value) => !value)}
            aria-expanded={showReveal}
            className="min-h-11 rounded-control bg-primary px-4 text-sm font-semibold text-white hover:opacity-90"
          >
            {showReveal ? "Sembunyikan penjelasan" : "Tampilkan penjelasan"}
          </button>
          {showReveal && (
            <p className="mt-3 rounded-control border border-teal/30 bg-teal/5 px-4 py-3 text-sm leading-relaxed">
              {step.reveal}
            </p>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => goToStep(index - 1)}
          disabled={index === 0}
          className="min-h-11 rounded-control border border-ink/15 px-5 text-sm font-medium hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40"
        >
          Sebelumnya
        </button>
        <button
          type="button"
          onClick={() => (isLast ? setFinished(true) : goToStep(index + 1))}
          className="min-h-11 rounded-control bg-primary px-5 text-sm font-semibold text-white hover:opacity-90"
        >
          {isLast ? "Selesai" : "Lanjut"}
        </button>
      </div>
    </div>
  );
}
