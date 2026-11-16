import { useState } from "react";
import type { Activity } from "../../content/schema/activity";
import { sharedStepAsset } from "./explorationIllustration";

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
    hint: typeof step.hint === "string" ? step.hint : undefined,
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
  const sharedAssetPath = sharedStepAsset(steps);
  const sharedAssetUrl = sharedAssetPath ? assets[sharedAssetPath] : undefined;
  const stepAssetUrl = sharedAssetPath ? undefined : step.assetPath ? assets[step.assetPath] : undefined;
  const isLast = index === steps.length - 1;
  const hintId = `exploration-hint-${activity.activityId}`;
  const revealId = `exploration-reveal-${activity.activityId}`;

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
      <div aria-live="polite" className="mx-auto max-w-5xl rounded-card border border-teal/30 bg-teal/5 p-6">
        <h3 className="text-lg font-semibold">Aktivitas selesai</h3>
        <p className="mt-2 text-sm text-muted">
          Kamu sudah menyelesaikan {steps.length} langkah. Lanjut berlatih untuk menguji pemahamanmu.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={restart}
            className="min-h-11 rounded-control border border-ink/15 bg-surface px-5 text-sm font-medium hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            Ulangi eksplorasi
          </button>
          {onFinish && (
            <button
              type="button"
              onClick={onFinish}
              className="min-h-11 rounded-control bg-primary px-6 text-sm font-semibold text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
            >
              Lanjut berlatih
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
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

      {sharedAssetUrl && (
        <img
          data-exploration-illustration="shared"
          src={sharedAssetUrl}
          alt={steps[0].altText ?? activity.accessibilityMetadata?.altText ?? "Ilustrasi aktivitas"}
          className="mx-auto mt-5 block max-h-[60vh] w-auto max-w-full rounded-card border border-ink/10 bg-surface"
        />
      )}

      {stepAssetUrl && (
        <img
          data-exploration-illustration="step"
          src={stepAssetUrl}
          alt={step.altText ?? activity.accessibilityMetadata?.altText ?? "Ilustrasi aktivitas"}
          className="mx-auto mt-5 block max-h-[60vh] w-auto max-w-full rounded-card border border-ink/10 bg-surface"
        />
      )}

      <p className="mt-5 text-lg font-medium leading-relaxed">{step.prompt}</p>

      {(step.hint || step.reveal) && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {step.hint && (
            <button
              type="button"
              onClick={() => setShowHint((value) => !value)}
              aria-expanded={showHint}
              aria-controls={hintId}
              className={`min-h-11 rounded-control border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                showHint
                  ? "border-primary/40 bg-primary/5 text-ink"
                  : "border-ink/15 bg-surface hover:bg-paper"
              }`}
            >
              {showHint ? "Sembunyikan petunjuk" : "Lihat petunjuk"}
            </button>
          )}
          {step.reveal && (
            <button
              type="button"
              onClick={() => setShowReveal((value) => !value)}
              aria-expanded={showReveal}
              aria-controls={revealId}
              className={`min-h-11 rounded-control border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                showReveal
                  ? "border-primary/40 bg-primary/5 text-ink"
                  : "border-ink/15 bg-surface hover:bg-paper"
              }`}
            >
              {showReveal ? "Sembunyikan penjelasan" : "Tampilkan penjelasan"}
            </button>
          )}
        </div>
      )}

      {showHint && step.hint && (
        <p id={hintId} className="mt-3 rounded-control bg-paper px-4 py-3 text-sm text-muted">
          {step.hint}
        </p>
      )}

      {showReveal && step.reveal && (
        <p
          id={revealId}
          className="mt-3 rounded-control border border-teal/30 bg-teal/5 px-4 py-3 text-sm leading-relaxed"
        >
          {step.reveal}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-5">
        <button
          type="button"
          onClick={() => goToStep(index - 1)}
          disabled={index === 0}
          className="min-h-11 rounded-control border border-ink/15 bg-surface px-5 text-sm font-medium hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface"
        >
          Sebelumnya
        </button>
        <button
          type="button"
          onClick={() => (isLast ? setFinished(true) : goToStep(index + 1))}
          className="min-h-11 rounded-control bg-primary px-6 text-sm font-semibold text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
        >
          {isLast ? "Selesai" : "Lanjut"}
        </button>
      </div>
    </div>
  );
}
