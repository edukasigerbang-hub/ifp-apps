import { useMemo, useState } from "react";
import { ExplorationActivity } from "../components/content/ExplorationActivity";
import { QuizActivity } from "../components/content/QuizActivity";
import { StatusBadge, type StatusTone } from "../components/ui/StatusBadge";
import { loadContentPackages } from "../content/loadPackages";
import type { Activity } from "../content/schema/activity";

export function LessonPlayer() {
  const { packages, errors } = useMemo(() => loadContentPackages(), []);
  const [activeActivityId, setActiveActivityId] = useState<string | null>(null);

  if (errors.length > 0) {
    return (
      <div className="max-w-4xl rounded-card border border-danger/30 bg-danger/5 p-6">
        <h2 className="text-lg font-semibold">Paket konten tidak dapat dimuat</h2>
        <p className="mt-2 text-sm text-muted">
          Validator menolak paket berikut. Perbaiki konten lalu jalankan <code>npm run content:validate</code>.
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          {errors.flatMap((error) =>
            error.issues.map((issue) => (
              <li key={`${error.packageDir}-${issue.path}-${issue.message}`}>
                <span className="font-mono text-xs">{issue.code}</span> — {issue.message}
                {issue.path && <span className="text-muted"> ({issue.path})</span>}
              </li>
            ))
          )}
        </ul>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="max-w-4xl rounded-card border border-ink/10 bg-surface p-8">
        <h2 className="text-lg font-semibold">Belum ada paket konten</h2>
        <p className="mt-2 text-sm text-muted">
          Tambahkan paket ke <code>content/packages/</code>, lalu muat ulang aplikasi.
        </p>
      </div>
    );
  }

  const contentPackage = packages[0];
  const lesson = contentPackage.data.lessons[0];
  const activities = lesson.activityIds
    .map((activityId) => contentPackage.data.activities.find((activity) => activity.activityId === activityId))
    .filter((activity): activity is Activity => activity !== undefined);

  const activeActivity = activities.find((activity) => activity.activityId === activeActivityId) ?? activities[0];
  const assessmentActivityId = lesson.assessmentRefs.find((activityId) =>
    activities.some((activity) => activity.activityId === activityId)
  );

  const reviewTone: StatusTone =
    lesson.reviewStatus === "approved" ? "positive" : lesson.reviewStatus === "reviewed" ? "neutral" : "warning";
  const reviewLabel =
    lesson.reviewStatus === "approved"
      ? "Disetujui reviewer"
      : lesson.reviewStatus === "reviewed"
        ? "Sudah direview"
        : "DRAFT — belum direview";

  if (!activeActivity) {
    return (
      <div className="max-w-4xl rounded-card border border-ink/10 bg-surface p-8">
        <h2 className="text-lg font-semibold">Lesson tidak memiliki aktivitas</h2>
        <p className="mt-2 text-sm text-muted">Periksa referensi activityIds pada lesson.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge tone={reviewTone} label={reviewLabel} />
        <span className="text-sm text-muted">
          Kelas {contentPackage.data.manifest.gradeLevels.join(", ")} ·{" "}
          {contentPackage.data.manifest.subjects.join(", ")} · v{contentPackage.data.manifest.packageVersion}
        </span>
      </div>

      <h2 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">{lesson.title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted md:text-base">{lesson.summary}</p>

      <section className="mt-6 rounded-card border border-ink/10 bg-surface p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">Tujuan pembelajaran</h3>
        <ul className="mt-3 space-y-2">
          {lesson.learningObjectives.map((objective) => (
            <li key={objective} className="flex items-start gap-3 text-sm">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
              {objective}
            </li>
          ))}
        </ul>
      </section>

      <div role="tablist" aria-label="Aktivitas pembelajaran" className="mt-6 flex flex-wrap gap-2">
        {activities.map((activity) => {
          const isActive = activity.activityId === activeActivity.activityId;
          return (
            <button
              key={activity.activityId}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveActivityId(activity.activityId)}
              className={`min-h-11 rounded-control px-4 text-sm font-medium ${
                isActive ? "bg-navy text-white" : "border border-ink/15 bg-surface text-ink hover:bg-paper"
              }`}
            >
              {activity.title}
            </button>
          );
        })}
      </div>

      <section className="mt-4 rounded-card border border-ink/10 bg-surface p-5 md:p-6">
        {activeActivity.type === "exploration" ? (
          <ExplorationActivity
            activity={activeActivity}
            assets={contentPackage.assets}
            onFinish={assessmentActivityId ? () => setActiveActivityId(assessmentActivityId) : undefined}
          />
        ) : activeActivity.type === "multiple-choice" ? (
          <QuizActivity activity={activeActivity} />
        ) : (
          <p className="text-sm text-muted">
            Tipe aktivitas <code>{activeActivity.type}</code> belum didukung di pratinjau ini.
          </p>
        )}
      </section>

      <p className="mt-4 text-xs text-muted">
        Pratinjau konten lokal. Hasil belajar belum disimpan ke database dan belum disinkronkan.
      </p>
    </div>
  );
}
