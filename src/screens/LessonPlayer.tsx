import { useEffect, useRef, useState } from "react";
import { ExplorationActivity } from "../components/content/ExplorationActivity";
import { QuizActivity, type QuizGradedOutcome } from "../components/content/QuizActivity";
import { StatusBadge, type StatusTone } from "../components/ui/StatusBadge";
import { loadContentPackages, type LoadedContentPackage } from "../content/loadPackages";
import { consumePlaybackSelection } from "../state/playbackSelection";
import { listManagedPackages, loadManagedPackage } from "../content/loadManagedPackage";
import { notifyOutboxChanged } from "../hooks/useSyncScheduler";
import type { Activity } from "../content/schema/activity";
import type { ActivePackageSummary } from "../data/contentRepository";
import {
  canPersistLocally,
  ensureLocalProfile,
  getOrStartSession,
  saveAttempt
} from "../data/learningRepository";

type StorageStatus = "starting" | "ready" | "saving" | "saved" | "error" | "preview";

interface StorageState {
  status: StorageStatus;
  message: string;
}

const storageClasses: Record<StorageStatus, string> = {
  starting: "border-ink/10 bg-paper text-muted",
  ready: "border-ink/10 bg-paper text-muted",
  saving: "border-ink/10 bg-paper text-muted",
  saved: "border-teal/30 bg-teal/5 text-ink",
  error: "border-danger/30 bg-danger/5 text-danger",
  preview: "border-warning/40 bg-warning/10 text-ink"
};

type ContentLoadState =
  | { status: "loading" }
  | {
      status: "ready";
      contentPackage: LoadedContentPackage;
      source: "managed" | "bundled";
      summaries: ActivePackageSummary[];
      selected: { packageId: string; version: string } | null;
      lessonId: string | null;
    }
  | { status: "error"; message: string }
  | { status: "empty" };

export function LessonPlayer() {
  const [state, setState] = useState<ContentLoadState>({ status: "loading" });
  const [switching, setSwitching] = useState(false);
  const objectUrlsRef = useRef<string[]>([]);

  function releaseObjectUrls() {
    for (const url of objectUrlsRef.current) {
      URL.revokeObjectURL(url);
    }
    objectUrlsRef.current = [];
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const requested = consumePlaybackSelection();
      try {
        if (canPersistLocally()) {
          const summaries = await listManagedPackages();
          const pick = requested
            ? summaries.find(
                (summary) =>
                  summary.packageId === requested.packageId &&
                  (!requested.version || summary.version === requested.version)
              )
            : summaries[0];
          if (pick) {
            const managed = await loadManagedPackage(pick.packageId, pick.version);
            if (managed) {
              objectUrlsRef.current = managed.objectUrls;
              if (!cancelled) {
                setState({
                  status: "ready",
                  contentPackage: managed,
                  source: "managed",
                  summaries,
                  selected: { packageId: pick.packageId, version: pick.version },
                  lessonId: requested?.lessonId ?? null
                });
              }
              return;
            }
          }
        }

        const { packages, errors } = loadContentPackages();
        if (errors.length > 0) {
          const detail = errors
            .flatMap((error) => error.issues.map((issue) => `${issue.code}: ${issue.message}`))
            .join("; ");
          if (!cancelled) {
            setState({ status: "error", message: `Paket bawaan gagal divalidasi. ${detail}` });
          }
          return;
        }

        if (packages.length === 0) {
          if (!cancelled) setState({ status: "empty" });
          return;
        }

        const chosen =
          (requested
            ? packages.find(
                (pkg) => pkg.data.manifest.packageId === requested.packageId
              )
            : undefined) ?? packages[0];

        if (!cancelled) {
          setState({
            status: "ready",
            contentPackage: chosen,
            source: "bundled",
            summaries: [],
            selected: null,
            lessonId:
              requested && chosen.data.manifest.packageId === requested.packageId
                ? requested.lessonId ?? null
                : null
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "Konten gagal dimuat."
          });
        }
      }
    })();

    return () => {
      cancelled = true;
      releaseObjectUrls();
    };
  }, []);

  async function selectPackage(summary: ActivePackageSummary) {
    if (state.status !== "ready" || state.source !== "managed") {
      return;
    }

    setSwitching(true);
    try {
      const managed = await loadManagedPackage(summary.packageId, summary.version);
      if (!managed) {
        return;
      }
      releaseObjectUrls();
      objectUrlsRef.current = managed.objectUrls;
      setState({
        status: "ready",
        contentPackage: managed,
        source: "managed",
        summaries: state.summaries,
        selected: { packageId: summary.packageId, version: summary.version },
        lessonId: null
      });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Paket gagal dimuat."
      });
    } finally {
      setSwitching(false);
    }
  }

  if (state.status === "loading") {
    return (
      <div className="max-w-4xl rounded-card border border-ink/10 bg-surface p-8">
        <p className="text-sm text-muted">Memuat konten…</p>
      </div>
    );
  }

  if (state.status === "empty") {
    return (
      <div className="max-w-4xl rounded-card border border-ink/10 bg-surface p-8">
        <h2 className="text-lg font-semibold">Belum ada paket konten</h2>
        <p className="mt-2 text-sm text-muted">
          Tambahkan paket ke <code>content/packages/</code> atau impor lewat Konten & Pembaruan.
        </p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="max-w-4xl rounded-card border border-danger/30 bg-danger/5 p-6">
        <h2 className="text-lg font-semibold">Konten tidak dapat dimuat</h2>
        <p className="mt-2 text-sm text-muted">{state.message}</p>
        <p className="mt-3 text-sm text-muted">
          Periksa validasi paket atau gunakan rollback di layar Konten & Pembaruan.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {state.source === "managed" && state.summaries.length > 1 && (
        <section aria-label="Pilih paket konten" className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Pilih paket</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {state.summaries.map((summary) => {
              const active = state.selected?.packageId === summary.packageId;
              return (
                <button
                  key={`${summary.packageId}@${summary.version}`}
                  type="button"
                  aria-pressed={active}
                  disabled={switching}
                  onClick={() => void selectPackage(summary)}
                  className={`min-h-11 rounded-control px-4 py-2 text-left disabled:opacity-60 ${
                    active
                      ? "bg-navy text-white"
                      : "border border-ink/15 bg-surface hover:bg-paper"
                  }`}
                >
                  <span className="block text-sm font-medium">{summary.title}</span>
                  <span className={`mt-0.5 block text-xs ${active ? "text-white/70" : "text-muted"}`}>
                    Kelas {summary.gradeLevels.join(", ")} · {summary.subjects.join(", ")} · v
                    {summary.version}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <LessonView
        key={`${state.selected ? `${state.selected.packageId}@${state.selected.version}` : "bundled"}:${state.lessonId ?? "first"}`}
        contentPackage={state.contentPackage}
        source={state.source}
        lessonId={state.lessonId}
      />
    </div>
  );
}

function LessonView({
  contentPackage,
  source,
  lessonId
}: {
  contentPackage: LoadedContentPackage;
  source: "managed" | "bundled";
  lessonId: string | null;
}) {
  const lesson =
    (lessonId
      ? contentPackage.data.lessons.find((entry) => entry.lessonId === lessonId)
      : undefined) ?? contentPackage.data.lessons[0];
  const activities = lesson.activityIds
    .map((activityId) => contentPackage.data.activities.find((activity) => activity.activityId === activityId))
    .filter((activity): activity is Activity => activity !== undefined);

  const [activeActivityId, setActiveActivityId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [storage, setStorage] = useState<StorageState>({
    status: "starting",
    message: "Menyiapkan penyimpanan lokal..."
  });

  useEffect(() => {
    if (!canPersistLocally()) {
      setStorage({
        status: "preview",
        message:
          "Pratinjau browser: hasil belajar tidak disimpan. Jalankan aplikasi desktop untuk menyimpan hasil."
      });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const profileId = await ensureLocalProfile();
        const session = await getOrStartSession({
          sessionId: crypto.randomUUID(),
          profileId,
          packageId: contentPackage.data.manifest.packageId,
          packageVersion: contentPackage.data.manifest.packageVersion,
          lessonId: lesson.lessonId
        });
        if (!cancelled) {
          setSessionId(session.sessionId);
          setStorage({ status: "ready", message: "Penyimpanan lokal siap." });
        }
      } catch (error) {
        if (!cancelled) {
          setStorage({
            status: "error",
            message: error instanceof Error ? error.message : "Penyimpanan lokal tidak tersedia."
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [contentPackage, lesson.lessonId]);

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

  async function handleGraded(activityId: string, outcome: QuizGradedOutcome) {
    if (!canPersistLocally()) {
      return;
    }
    if (!sessionId) {
      setStorage({ status: "error", message: "Sesi belajar belum siap; hasil belum disimpan." });
      return;
    }

    setStorage({ status: "saving", message: "Menyimpan hasil belajar..." });
    try {
      const attempt = await saveAttempt({
        attemptId: crypto.randomUUID(),
        progressId: crypto.randomUUID(),
        outboxId: crypto.randomUUID(),
        eventId: crypto.randomUUID(),
        sessionId,
        activityId,
        score: outcome.score,
        occurredAt: new Date().toISOString(),
        answers: outcome.answers.map((answer) => ({
          responseId: crypto.randomUUID(),
          questionId: answer.questionId,
          optionId: answer.optionId,
          isCorrect: answer.isCorrect
        }))
      });
      setStorage({ status: "saved", message: `Tersimpan lokal — percobaan ke-${attempt.attemptNo}.` });
      notifyOutboxChanged();
    } catch (error) {
      setStorage({
        status: "error",
        message: error instanceof Error ? error.message : "Hasil belajar gagal disimpan."
      });
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge tone={reviewTone} label={reviewLabel} />
        <StatusBadge
          tone="neutral"
          label={
            source === "managed"
              ? `Paket impor v${contentPackage.data.manifest.packageVersion}`
              : "Paket bawaan build"
          }
        />
        <span className="text-sm text-muted">
          Kelas {contentPackage.data.manifest.gradeLevels.join(", ")} ·{" "}
          {contentPackage.data.manifest.subjects.join(", ")} · v{contentPackage.data.manifest.packageVersion}
        </span>
      </div>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">{lesson.title}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted md:text-base">{lesson.summary}</p>

      <p
        aria-live="polite"
        className={`mt-4 rounded-control border px-4 py-3 text-sm ${storageClasses[storage.status]}`}
      >
        {storage.message}
      </p>

      <section className="mt-6 rounded-card border border-ink/10 bg-surface p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">Tujuan pembelajaran</h2>
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
              id={`activity-tab-${activity.activityId}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="activity-panel"
              tabIndex={isActive ? 0 : -1}
              onKeyDown={(event) => {
                if (
                  event.key !== "ArrowRight" &&
                  event.key !== "ArrowLeft" &&
                  event.key !== "Home" &&
                  event.key !== "End"
                ) {
                  return;
                }
                event.preventDefault();
                const currentIndex = activities.findIndex(
                  (entry) => entry.activityId === activity.activityId
                );
                let nextIndex = currentIndex;
                if (event.key === "ArrowRight") {
                  nextIndex = (currentIndex + 1) % activities.length;
                } else if (event.key === "ArrowLeft") {
                  nextIndex = (currentIndex - 1 + activities.length) % activities.length;
                } else if (event.key === "Home") {
                  nextIndex = 0;
                } else if (event.key === "End") {
                  nextIndex = activities.length - 1;
                }
                const next = activities[nextIndex];
                setActiveActivityId(next.activityId);
                requestAnimationFrame(() => {
                  document.getElementById(`activity-tab-${next.activityId}`)?.focus();
                });
              }}
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

      <section
        id="activity-panel"
        role="tabpanel"
        aria-labelledby={`activity-tab-${activeActivity.activityId}`}
        tabIndex={0}
        className="mt-4 rounded-card border border-ink/10 bg-surface p-5 md:p-6"
      >
        {activeActivity.type === "exploration" ? (
          <ExplorationActivity
            activity={activeActivity}
            assets={contentPackage.assets}
            onFinish={assessmentActivityId ? () => setActiveActivityId(assessmentActivityId) : undefined}
          />
        ) : activeActivity.type === "multiple-choice" ? (
          <QuizActivity
            activity={activeActivity}
            onGraded={(outcome) => void handleGraded(activeActivity.activityId, outcome)}
          />
        ) : (
          <p className="text-sm text-muted">
            Tipe aktivitas <code>{activeActivity.type}</code> belum didukung di pratinjau ini.
          </p>
        )}
      </section>

      <p className="mt-4 text-xs text-muted">
        {canPersistLocally()
          ? "Hasil kuis disimpan di perangkat ini dan belum disinkronkan ke server."
          : "Pratinjau browser: hasil tidak disimpan. Data hanya tersedia di aplikasi desktop."}
      </p>
    </div>
  );
}
