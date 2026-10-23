import { useEffect, useState } from "react";
import { ExplorationActivity } from "../components/content/ExplorationActivity";
import { QuizActivity, type QuizGradedOutcome } from "../components/content/QuizActivity";
import { StatusBadge, type StatusTone } from "../components/ui/StatusBadge";
import { loadContentPackages, type LoadedContentPackage } from "../content/loadPackages";
import { loadManagedPackage } from "../content/loadManagedPackage";
import type { Activity } from "../content/schema/activity";
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
  | { status: "ready"; contentPackage: LoadedContentPackage; source: "managed" | "bundled" }
  | { status: "error"; message: string }
  | { status: "empty" };

export function LessonPlayer() {
  const [state, setState] = useState<ContentLoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    let objectUrls: string[] = [];

    (async () => {
      try {
        if (canPersistLocally()) {
          const managed = await loadManagedPackage();
          if (managed) {
            objectUrls = managed.objectUrls;
            if (!cancelled) {
              setState({ status: "ready", contentPackage: managed, source: "managed" });
            }
            return;
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

        if (!cancelled) {
          setState({ status: "ready", contentPackage: packages[0], source: "bundled" });
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
      for (const url of objectUrls) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

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

  return <LessonView contentPackage={state.contentPackage} source={state.source} />;
}

function LessonView({
  contentPackage,
  source
}: {
  contentPackage: LoadedContentPackage;
  source: "managed" | "bundled";
}) {
  const lesson = contentPackage.data.lessons[0];
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

      <h2 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">{lesson.title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted md:text-base">{lesson.summary}</p>

      <p
        aria-live="polite"
        className={`mt-4 rounded-control border px-4 py-3 text-sm ${storageClasses[storage.status]}`}
      >
        {storage.message}
      </p>

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
