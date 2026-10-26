import type { CatalogLessonEntry } from "../../content/catalog";
import { LessonThumbnail } from "../content/LessonThumbnail";

interface LearningIllustrationProps {
  entry?: CatalogLessonEntry;
}

export function LearningIllustration({ entry }: LearningIllustrationProps) {
  return (
    <div
      aria-hidden="true"
      data-learning-illustration
      className="relative mx-auto w-full max-w-sm"
    >
      <span className="absolute -left-4 top-3 h-20 w-20 rounded-full bg-warning/15" />
      <span className="absolute -right-3 bottom-5 h-24 w-24 rounded-full bg-teal/10" />
      <span className="absolute -top-2 right-12 h-9 w-9 rounded-full bg-primary/10" />

      <div className="relative mt-2 overflow-hidden rounded-card border border-surface bg-surface shadow-[0_20px_45px_-28px_rgba(23,59,105,0.5)] ring-1 ring-ink/5">
        {entry ? (
          <LessonThumbnail entry={entry} className="aspect-[16/10] w-full" />
        ) : (
          <span className="block aspect-[16/10] w-full bg-teal/10" />
        )}
      </div>

      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="absolute -left-1 bottom-2 h-7 w-7 text-warning"
      >
        <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
      </svg>
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="absolute -right-2 top-4 h-6 w-6 text-teal"
      >
        <path d="M12 2.5l2.6 6.1 6.6.6-5 4.3 1.5 6.5-5.7-3.4-5.7 3.4 1.5-6.5-5-4.3 6.6-.6z" />
      </svg>
    </div>
  );
}
