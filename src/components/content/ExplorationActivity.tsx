import { useEffect, useRef, useState } from "react";
import type { Activity } from "../../content/schema/activity";
import { sharedStepAsset } from "./explorationIllustration";

interface ExplorationStep {
  prompt: string;
  assetPath?: string;
  altText?: string;
  reveal?: string;
  hint?: string;
}

interface ExplorationExplanation {
  title?: string;
  paragraphs: string[];
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

function readExplanation(activity: Activity): ExplorationExplanation | null {
  const raw = activity.interactionConfig.explanation;
  if (!isRecord(raw) || !Array.isArray(raw.paragraphs)) {
    return null;
  }
  const paragraphs = raw.paragraphs
    .filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
    .map((entry) => entry.trim());
  if (paragraphs.length === 0) {
    return null;
  }
  return {
    title:
      typeof raw.title === "string" && raw.title.trim().length > 0 ? raw.title.trim() : undefined,
    paragraphs,
  };
}

interface ExplorationActivityProps {
  activity: Activity;
  assets: Record<string, string>;
  onFinish?: () => void;
  /** Layar penuh memberi ruang ilustrasi lebih tinggi karena chrome aplikasi disembunyikan. */
  expanded?: boolean;
}

function HintIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.6 10.8c.5.4.8 1 .8 1.6v.6h5.6v-.6c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3Z" />
    </svg>
  );
}

function RevealIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M12 6.5C10 4.9 7.6 4.2 4.5 4.2v13.4c3.1 0 5.5.7 7.5 2.3 2-1.6 4.4-2.3 7.5-2.3V4.2c-3.1 0-5.5.7-7.5 2.3Z" />
      <path d="M12 6.5v13.4" />
    </svg>
  );
}

function SummaryIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M6 3.5h8l4 4v13H6z" />
      <path d="M14 3.5v4h4M9 12h6M9 16h6" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`ml-auto h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ExplorationActivity({
  activity,
  assets,
  onFinish,
  expanded = false,
}: ExplorationActivityProps) {
  const steps = readSteps(activity);
  const explanation = readExplanation(activity);
  const [index, setIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [finished, setFinished] = useState(false);
  const [view, setView] = useState<"steps" | "explanation">("steps");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (view === "explanation") {
      headingRef.current?.focus();
    }
  }, [view]);

  if (steps.length === 0) {
    return <p className="text-sm text-muted">Aktivitas ini belum memiliki langkah yang dapat ditampilkan.</p>;
  }

  function openExplanation() {
    setView("explanation");
  }

  function closeExplanation() {
    setView("steps");
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  if (view === "explanation" && explanation) {
    const explanationTitleId = `exploration-explanation-title-${activity.activityId}`;
    return (
      <section
        data-exploration-explanation
        aria-labelledby={explanationTitleId}
        className="flex w-full flex-col"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          Pembahasan lengkap
        </p>
        <h2
          id={explanationTitleId}
          ref={headingRef}
          tabIndex={-1}
          className="mt-1 text-lg font-semibold leading-snug tracking-tight focus:outline-none md:text-xl"
        >
          {explanation.title ?? "Pembahasan lengkap"}
        </h2>
        <div className="mt-3 max-h-[clamp(160px,38vh,460px)] max-w-[70ch] space-y-2.5 overflow-y-auto pr-1">
          {explanation.paragraphs.map((paragraph, paragraphIndex) => (
            <p key={paragraphIndex} className="text-sm leading-relaxed md:text-[15px]">
              {paragraph}
            </p>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-4">
          <button
            type="button"
            onClick={closeExplanation}
            className="min-h-11 rounded-control border border-ink/15 bg-surface px-5 text-sm font-medium hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            Kembali ke langkah
          </button>
          {finished && onFinish && (
            <button
              type="button"
              onClick={onFinish}
              className="min-h-11 rounded-control bg-primary px-6 text-sm font-semibold text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
            >
              Lanjut berlatih
            </button>
          )}
        </div>
      </section>
    );
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
      <div aria-live="polite" className="mx-auto w-full max-w-3xl rounded-card border border-teal/30 bg-teal/5 p-6">
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
          {explanation && (
            <button
              ref={triggerRef}
              type="button"
              data-exploration-explanation-open
              onClick={openExplanation}
              className="min-h-11 rounded-control border border-teal/40 bg-white px-5 text-sm font-medium text-teal-strong hover:bg-teal/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              Baca pembahasan lengkap
            </button>
          )}
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

  const illustrationUrl = sharedAssetUrl ?? stepAssetUrl;
  const illustrationKind = sharedAssetUrl ? "shared" : "step";
  const illustrationAlt =
    (sharedAssetUrl ? steps[0].altText : step.altText) ??
    activity.accessibilityMetadata?.altText ??
    "Ilustrasi aktivitas";
  const supportVisible = Boolean(step.hint || step.reveal);
  const frameHeight = expanded
    ? "h-[clamp(240px,56vh,720px)]"
    : "h-[clamp(200px,38vh,520px)] xl:h-[clamp(220px,44vh,560px)]";

  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          Langkah {index + 1} dari {steps.length}
        </p>
        <div
          role="progressbar"
          aria-label="Progres eksplorasi"
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-valuenow={index + 1}
          aria-valuetext={`Langkah ${index + 1} dari ${steps.length}`}
          className="flex items-center gap-1.5"
        >
          {steps.map((_, stepIndex) => (
            <span
              key={stepIndex}
              aria-hidden="true"
              className={`h-1.5 rounded-full transition-all ${
                stepIndex <= index ? "w-7 bg-teal" : "w-4 bg-ink/15"
              }`}
            />
          ))}
        </div>
      </div>

      <div
        data-exploration-stage
        className={`mt-3 grid min-w-0 gap-4 ${
          illustrationUrl ? "lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start" : ""
        }`}
      >
        {illustrationUrl && (
          <figure
            className={`flex ${frameHeight} max-w-full justify-self-center overflow-hidden rounded-control border border-ink/10 bg-white`}
          >
            <img
              data-exploration-illustration={illustrationKind}
              src={illustrationUrl}
              alt={illustrationAlt}
              className="h-full w-auto max-w-full object-contain"
            />
          </figure>
        )}

        <div className="flex min-w-0 flex-col">
          <h2 className="text-lg font-semibold leading-snug tracking-tight md:text-xl">{step.prompt}</h2>

          {supportVisible && (
            <div className="mt-3 flex flex-col gap-2">
              {step.hint && (
                <button
                  type="button"
                  onClick={() => setShowHint((value) => !value)}
                  aria-expanded={showHint}
                  aria-controls={hintId}
                  className={`flex min-h-11 w-full items-center gap-2 rounded-control border px-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                    showHint
                      ? "border-teal/50 bg-teal/10 text-teal-strong"
                      : "border-ink/15 bg-surface text-ink hover:bg-paper"
                  }`}
                >
                  <HintIcon />
                  Petunjuk
                  <ChevronIcon open={showHint} />
                </button>
              )}
              {step.reveal && (
                <button
                  type="button"
                  onClick={() => setShowReveal((value) => !value)}
                  aria-expanded={showReveal}
                  aria-controls={revealId}
                  className={`flex min-h-11 w-full items-center gap-2 rounded-control border px-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                    showReveal
                      ? "border-teal/50 bg-teal/10 text-teal-strong"
                      : "border-ink/15 bg-surface text-ink hover:bg-paper"
                  }`}
                >
                  <RevealIcon />
                  Pembahasan
                  <ChevronIcon open={showReveal} />
                </button>
              )}
            </div>
          )}

          {explanation && (
            <button
              ref={triggerRef}
              type="button"
              data-exploration-explanation-open
              onClick={openExplanation}
              className="mt-3 flex min-h-11 w-full items-center gap-2 rounded-control border border-dashed border-teal/40 bg-white px-3 text-left text-sm font-medium text-teal-strong hover:bg-teal/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <SummaryIcon />
              Pembahasan lengkap
              <span aria-hidden="true" className="ml-auto text-xs font-normal text-muted">Baca</span>
            </button>
          )}

          {(showHint || showReveal) && (
            <div className="mt-3 max-h-[30vh] space-y-2 overflow-y-auto pr-1">
              {showHint && step.hint && (
                <div id={hintId} className="rounded-control bg-paper px-3.5 py-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Petunjuk</p>
                  <p className="mt-1 text-sm leading-relaxed">{step.hint}</p>
                </div>
              )}
              {showReveal && step.reveal && (
                <div id={revealId} className="rounded-control border border-teal/30 bg-teal/5 px-3.5 py-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-teal-strong">
                    Pembahasan
                  </p>
                  <p className="mt-1 text-sm leading-relaxed">{step.reveal}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-4">
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
