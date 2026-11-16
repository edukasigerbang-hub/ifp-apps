import { useEffect, useRef, useState } from "react";
import { CoverArt } from "../components/content/CoverArt";
import { ExplorationActivity } from "../components/content/ExplorationActivity";
import { MatchingActivity } from "../components/content/MatchingActivity";
import { OrderingActivity } from "../components/content/OrderingActivity";
import { QuizActivity, type QuizGradedOutcome } from "../components/content/QuizActivity";
import { StatusBadge, type StatusTone } from "../components/ui/StatusBadge";
import { gradeCoverUrl, subjectCoverUrl } from "../content/coverArt";
import { loadContentPackages, type LoadedContentPackage } from "../content/loadPackages";
import { subjectLabel } from "../content/subjectLabel";
import type { ScreenId } from "../navigation";
import { getPlaybackSelection, buildPlayerHash, setPlaybackSelection } from "../state/playbackSelection";
import { listManagedPackages, loadManagedPackage } from "../content/loadManagedPackage";
import { notifyOutboxChanged } from "../hooks/useSyncScheduler";
import type { Activity } from "../content/schema/activity";
import type { ActivePackageSummary } from "../data/contentRepository";
import {
  listPinnedLessons,
  pinnedErrorMessage,
  pinnedKey,
  setPinnedLesson,
} from "../data/pinnedRepository";
import {
  canPersistLocally,
  ensureLocalProfile,
  getOrStartSession,
  saveAttempt,
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
  error: "border-danger/30 bg-danger/5 text-danger-strong",
  preview: "border-warning/40 bg-warning/10 text-ink",
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

export function LessonPlayer({
  onNavigate,
  fullscreen = false,
  onFullscreenChange,
}: {
  onNavigate?: (screen: ScreenId) => void;
  fullscreen?: boolean;
  onFullscreenChange?: (value: boolean) => void;
}) {
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
      const requested = getPlaybackSelection();
      try {
        if (canPersistLocally()) {
          const summaries = await listManagedPackages();
          const pick = requested
            ? summaries.find(
                (summary) =>
                  summary.packageId === requested.packageId &&
                  (!requested.version || summary.version === requested.version),
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
                  selected: {
                    packageId: pick.packageId,
                    version: pick.version,
                  },
                  lessonId: requested?.lessonId ?? null,
                });
              }
              return;
            }
          }
        }

        const { packages, errors } = await loadContentPackages();
        if (errors.length > 0) {
          const detail = errors
            .flatMap((error) => error.issues.map((issue) => `${issue.code}: ${issue.message}`))
            .join("; ");
          if (!cancelled) {
            setState({
              status: "error",
              message: `Paket bawaan gagal divalidasi. ${detail}`,
            });
          }
          return;
        }

        if (packages.length === 0) {
          if (!cancelled) setState({ status: "empty" });
          return;
        }

        const chosen =
          (requested
            ? packages.find((pkg) => pkg.data.manifest.packageId === requested.packageId)
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
                ? (requested.lessonId ?? null)
                : null,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "Konten gagal dimuat.",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
      releaseObjectUrls();
    };
  }, []);

  // Hash harus menunjuk materi yang benar-benar tampil: deep link ke paket tak
  // dikenal jatuh ke paket pertama, permintaan tanpa lesson menampilkan lesson
  // pertama, dan pergantian paket di dalam Player tidak boleh meninggalkan URL lama.
  useEffect(() => {
    if (state.status !== "ready") {
      return;
    }
    const packageId = state.contentPackage.data.manifest.packageId;
    const lessonId =
      state.lessonId ?? state.contentPackage.data.lessons[0]?.lessonId ?? undefined;
    const current = getPlaybackSelection();
    if (current?.packageId === packageId && (current.lessonId ?? undefined) === lessonId) {
      return;
    }
    setPlaybackSelection({ packageId, lessonId });
    window.history.replaceState(null, "", buildPlayerHash({ packageId, lessonId }));
  }, [state]);

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
        lessonId: null,
      });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Paket gagal dimuat.",
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
    <div className={`mx-auto w-full ${fullscreen ? "max-w-none" : "max-w-[1400px]"}`}>
      {state.source === "managed" && state.summaries.length > 1 && (
        <section aria-label="Pilih paket konten" hidden={fullscreen} className="mb-6">
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
                    active ? "bg-navy text-white" : "border border-ink/15 bg-surface hover:bg-paper"
                  }`}
                >
                  <span className="block text-sm font-medium">{summary.title}</span>
                  <span className={`mt-0.5 block text-xs ${active ? "text-white/70" : "text-muted"}`}>
                    Kelas {summary.gradeLevels.join(", ")} · {summary.subjects.map(subjectLabel).join(", ")} ·
                    v{summary.version}
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
        fullscreen={fullscreen}
        onFullscreenChange={onFullscreenChange}
        onNavigate={onNavigate}
      />
    </div>
  );
}

function LessonView({
  contentPackage,
  source,
  lessonId,
  fullscreen,
  onFullscreenChange,
  onNavigate,
}: {
  contentPackage: LoadedContentPackage;
  source: "managed" | "bundled";
  lessonId: string | null;
  fullscreen: boolean;
  onFullscreenChange?: (value: boolean) => void;
  onNavigate?: (screen: ScreenId) => void;
}) {
  const lesson =
    (lessonId ? contentPackage.data.lessons.find((entry) => entry.lessonId === lessonId) : undefined) ??
    contentPackage.data.lessons[0];
  const activities = lesson.activityIds
    .map((activityId) =>
      contentPackage.data.activities.find((activity) => activity.activityId === activityId),
    )
    .filter((activity): activity is Activity => activity !== undefined);

  const [activeActivityId, setActiveActivityId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [visited, setVisited] = useState<string[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [storage, setStorage] = useState<StorageState>({
    status: "starting",
    message: "Menyiapkan penyimpanan lokal...",
  });
  const [pinned, setPinned] = useState(false);
  const [pinBusy, setPinBusy] = useState(false);
  const [pinNotice, setPinNotice] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const sessionReadyRef = useRef<Promise<string> | null>(null);
  const lessonPinKey = pinnedKey({
    packageId: contentPackage.data.manifest.packageId,
    lessonId: lesson.lessonId,
  });

  useEffect(() => {
    if (!canPersistLocally()) {
      setStorage({
        status: "preview",
        message:
          "Pratinjau browser: hasil belajar tidak disimpan. Jalankan aplikasi desktop untuk menyimpan hasil.",
      });
      return;
    }

    let cancelled = false;
    const ready = (async () => {
      try {
        const profileId = await ensureLocalProfile();
        const session = await getOrStartSession({
          sessionId: crypto.randomUUID(),
          profileId,
          packageId: contentPackage.data.manifest.packageId,
          packageVersion: contentPackage.data.manifest.packageVersion,
          lessonId: lesson.lessonId,
        });
        if (!cancelled) {
          setProfileId(profileId);
          setSessionId(session.sessionId);
          setStorage({
            status: "ready",
            message: "Penyimpanan lokal siap. Hasil belum disinkronkan ke server.",
          });
        }
        return session.sessionId;
      } catch (error) {
        if (!cancelled) {
          setStorage({
            status: "error",
            message: error instanceof Error ? error.message : "Penyimpanan lokal tidak tersedia.",
          });
        }
        throw error;
      }
    })();
    sessionReadyRef.current = ready;
    void ready.catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [contentPackage, lesson.lessonId]);

  // Status sematan dibaca terpisah dari penyimpanan hasil: kegagalan baca hanya
  // menyembunyikan tombol, tidak boleh menghalangi belajar.
  useEffect(() => {
    if (!profileId) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const items = await listPinnedLessons(profileId);
        if (!cancelled) {
          setPinned(items.some((item) => pinnedKey(item) === lessonPinKey));
        }
      } catch (caught) {
        if (!cancelled) {
          setPinError(pinnedErrorMessage(caught));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profileId, lessonPinKey]);

  async function togglePin() {
    if (!profileId || pinBusy) {
      return;
    }
    const next = !pinned;
    setPinBusy(true);
    setPinError(null);
    try {
      await setPinnedLesson({
        profileId,
        packageId: contentPackage.data.manifest.packageId,
        lessonId: lesson.lessonId,
        pinned: next,
      });
      setPinned(next);
      setPinNotice(
        next
          ? `${lesson.title} disematkan ke Beranda.`
          : `${lesson.title} dilepas dari Beranda.`,
      );
    } catch (caught) {
      setPinError(pinnedErrorMessage(caught));
    } finally {
      setPinBusy(false);
    }
  }

  const activeActivity =
    activities.find((activity) => activity.activityId === activeActivityId) ?? activities[0];

  useEffect(() => {
    const current = activeActivity?.activityId;
    if (!current) {
      return;
    }
    setVisited((previous) => (previous.includes(current) ? previous : [...previous, current]));
  }, [activeActivity?.activityId]);

  useEffect(() => {
    if (!fullscreen) {
      return;
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onFullscreenChange?.(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [fullscreen, onFullscreenChange]);

  const gradedCount = activities.filter((activity) => scores[activity.activityId] !== undefined).length;
  const gradedScores = Object.values(scores);
  const averageScore =
    gradedScores.length === 0
      ? null
      : Math.round(gradedScores.reduce((sum, score) => sum + score, 0) / gradedScores.length);
  const progressPercent = activities.length === 0 ? 0 : Math.round((gradedCount / activities.length) * 100);

  const manifestCoverPath = contentPackage.data.manifest.assets.find((asset) =>
    asset.mediaType.startsWith("image/"),
  )?.path;
  const lessonCoverPath = lesson.assetRefs.find((path) => contentPackage.assets[path]);
  const coverUrl =
    (manifestCoverPath ? contentPackage.assets[manifestCoverPath] : null) ??
    (lessonCoverPath ? contentPackage.assets[lessonCoverPath] : null) ??
    subjectCoverUrl(contentPackage.data.manifest.subjects[0] ?? "") ??
    gradeCoverUrl(contentPackage.data.manifest.gradeLevels[0] ?? 0);

  const assessmentActivityId = lesson.assessmentRefs.find((activityId) =>
    activities.some((activity) => activity.activityId === activityId),
  );

  const reviewTone: StatusTone =
    lesson.reviewStatus === "approved"
      ? "positive"
      : lesson.reviewStatus === "reviewed"
        ? "neutral"
        : "warning";
  const reviewLabel =
    lesson.reviewStatus === "approved"
      ? "Disetujui reviewer"
      : lesson.reviewStatus === "reviewed"
        ? "Sudah direview"
        : "DRAFT — belum direview";

  // Status penyimpanan hanya ditampilkan bila ada kabar yang perlu dibaca guru.
  const storageVisible =
    storage.status === "preview" || storage.status === "error" || storage.status === "saved";

  if (!activeActivity) {
    return (
      <div className="max-w-4xl rounded-card border border-ink/10 bg-surface p-8">
        <h2 className="text-lg font-semibold">Lesson tidak memiliki aktivitas</h2>
        <p className="mt-2 text-sm text-muted">Periksa referensi activityIds pada lesson.</p>
      </div>
    );
  }

  async function handleGraded(activityId: string, outcome: QuizGradedOutcome) {
    setScores((previous) => ({ ...previous, [activityId]: outcome.score }));
    setLastScore(outcome.score);

    if (!canPersistLocally()) {
      return;
    }

    setStorage({ status: "saving", message: "Menyimpan hasil belajar..." });
    try {
      // Kuis bisa selesai sebelum tulis DB pertama selesai; tunggu sesi yang sedang
      // disiapkan alih-alih membuang hasil dengan "sesi belum siap".
      const activeSessionId = sessionId ?? (await sessionReadyRef.current);
      if (!activeSessionId) {
        throw new Error("Sesi belajar belum siap; hasil belum disimpan.");
      }
      const attempt = await saveAttempt({
        attemptId: crypto.randomUUID(),
        progressId: crypto.randomUUID(),
        outboxId: crypto.randomUUID(),
        eventId: crypto.randomUUID(),
        sessionId: activeSessionId,
        activityId,
        score: outcome.score,
        occurredAt: new Date().toISOString(),
        answers: outcome.answers.map((answer) => ({
          responseId: crypto.randomUUID(),
          questionId: answer.questionId,
          optionId: answer.optionId,
          responseText: answer.responseText,
          isCorrect: answer.isCorrect,
        })),
      });
      setStorage({
        status: "saved",
        message: `Tersimpan lokal — percobaan ke-${attempt.attemptNo}. Belum disinkronkan ke server.`,
      });
      notifyOutboxChanged();
    } catch (error) {
      setStorage({
        status: "error",
        message: error instanceof Error ? error.message : "Hasil belajar gagal disimpan.",
      });
    }
  }

  return (
    <div>
      <div
        data-player-focus-bar
        hidden={!fullscreen}
        className="mb-3 flex items-center justify-between gap-4 rounded-card border border-ink/10 bg-surface px-4 py-2.5"
      >
        <h1 className="min-w-0 truncate text-base font-semibold md:text-lg">{lesson.title}</h1>
        <p className="shrink-0 text-xs text-muted">
          Kelas {contentPackage.data.manifest.gradeLevels.join(", ")} ·{" "}
          {contentPackage.data.manifest.subjects.map(subjectLabel).join(", ")}
        </p>
      </div>

      <header
        data-player-hero
        hidden={fullscreen}
        className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-card border border-ink/10 bg-surface px-3 py-2 md:flex-nowrap md:px-4"
      >
        <div data-player-cover className="hidden h-12 w-20 shrink-0 sm:block">
          <CoverArt url={coverUrl} className="h-full w-full rounded-control" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="truncate text-lg font-semibold tracking-tight md:text-xl">{lesson.title}</h1>
            <StatusBadge tone={reviewTone} label={reviewLabel} />
            <StatusBadge
              tone="neutral"
              label={
                source === "managed"
                  ? `Paket impor v${contentPackage.data.manifest.packageVersion}`
                  : "Paket bawaan build"
              }
            />
            <span className="text-xs text-muted">
              Kelas {contentPackage.data.manifest.gradeLevels.join(", ")} ·{" "}
              {contentPackage.data.manifest.subjects.map(subjectLabel).join(", ")} · v
              {contentPackage.data.manifest.packageVersion}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs leading-relaxed text-muted md:text-sm">{lesson.summary}</p>
        </div>

        {canPersistLocally() && (
          <button
            type="button"
            data-pin-toggle
            onClick={() => void togglePin()}
            aria-pressed={pinned}
            aria-label={pinned ? `Lepas sematan ${lesson.title}` : `Sematkan ${lesson.title}`}
            disabled={!profileId || pinBusy}
            className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-control border px-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 ${
              pinned
                ? "border-teal/50 bg-teal/10 text-ink"
                : "border-ink/15 bg-surface text-muted hover:border-primary/40 hover:text-ink"
            }`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill={pinned ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.6"
              className="h-4 w-4"
            >
              <path d="M7 4h10v16l-5-3.4L7 20z" strokeLinejoin="round" />
            </svg>
            {pinned ? "Disematkan" : "Sematkan"}
          </button>
        )}
      </header>

      <p
        data-player-pin-status
        aria-live="polite"
        hidden={!pinError && !pinNotice}
        className={`mt-1.5 text-xs ${pinError ? "text-danger-strong" : "text-muted"}`}
      >
        {pinError ?? pinNotice}
      </p>

      <div
        data-player-layout
        className={
          fullscreen
            ? "mt-3 grid gap-3"
            : "mt-4 grid gap-x-6 gap-y-4 xl:grid-cols-[minmax(0,1fr)_17.5rem] xl:items-start 2xl:grid-cols-[minmax(0,1fr)_20rem]"
        }
      >
        <div
          data-player-aside
          hidden={fullscreen}
          className="order-last space-y-3 xl:order-none xl:sticky xl:top-6 xl:col-start-2 xl:row-span-2 xl:row-start-1"
        >
          <section className="rounded-card border border-ink/10 bg-surface p-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Tujuan pembelajaran
            </h2>
            <ul className="mt-2.5 space-y-1.5">
              {lesson.learningObjectives.map((objective) => (
                <li key={objective} className="flex items-start gap-2.5 text-sm">
                  <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                  {objective}
                </li>
              ))}
            </ul>
          </section>

          <section
            data-player-progress
            aria-labelledby="player-progress-heading"
            className="rounded-card border border-ink/10 bg-surface p-4"
          >
            <h2
              id="player-progress-heading"
              className="text-xs font-semibold uppercase tracking-[0.12em] text-muted"
            >
              Aktivitas &amp; kemajuan
            </h2>
            <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted">
              <span>
                {gradedCount} dari {activities.length} dinilai
              </span>
              <span className="font-semibold text-ink">{progressPercent}%</span>
            </div>
            <div
              role="progressbar"
              aria-label="Aktivitas dinilai"
              aria-valuemin={0}
              aria-valuemax={activities.length}
              aria-valuenow={gradedCount}
              aria-valuetext={`${gradedCount} dari ${activities.length} aktivitas`}
              className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink/10"
            >
              <span
                aria-hidden="true"
                className="block h-full rounded-full bg-teal transition-[width] duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <ul className="mt-3 space-y-1.5">
              {activities.map((activity) => {
                const score = scores[activity.activityId];
                const opened = visited.includes(activity.activityId);
                return (
                  <li key={activity.activityId} className="flex items-start justify-between gap-3 text-sm">
                    <span className="min-w-0">{activity.title}</span>
                    <span
                      className={`shrink-0 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                        score !== undefined ? "text-teal-strong" : opened ? "text-ink" : "text-muted"
                      }`}
                    >
                      {score !== undefined ? `Skor ${score}` : opened ? "Dibuka" : "Belum"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section
            data-session-summary
            aria-labelledby="session-summary-heading"
            className="rounded-card border border-ink/10 bg-surface p-4"
          >
            <h2
              id="session-summary-heading"
              className="text-xs font-semibold uppercase tracking-[0.12em] text-muted"
            >
              Ringkasan sesi
            </h2>
            <dl className="mt-2.5 space-y-1 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Aktivitas dinilai</dt>
                <dd className="shrink-0 font-semibold">
                  {gradedCount} dari {activities.length}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Skor terakhir</dt>
                <dd className="shrink-0 font-semibold">{lastScore === null ? "—" : lastScore}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Rata-rata</dt>
                <dd className="shrink-0 font-semibold">{averageScore === null ? "—" : averageScore}</dd>
              </div>
            </dl>
            <p className="mt-2 text-[11px] leading-relaxed text-muted">
              Diukur dari sesi ini; riwayat lengkap ada di Hasil Belajar.
            </p>
            <button
              type="button"
              onClick={() => onNavigate?.("results")}
              className="mt-2.5 min-h-11 w-full rounded-control bg-navy px-4 text-sm font-medium text-white hover:bg-navy/90"
            >
              Buka Hasil Belajar
            </button>
          </section>
        </div>

        <div className="min-w-0 xl:col-start-1 xl:row-start-1">
          <div className="flex min-w-0 items-center gap-2">
            <div
              role="tablist"
              aria-label="Aktivitas pembelajaran"
              className="flex min-w-0 flex-1 flex-wrap gap-1.5"
            >
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
                      (entry) => entry.activityId === activity.activityId,
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
                  className={`inline-flex min-h-11 items-center rounded-control px-3 text-sm font-medium ${
                    isActive
                      ? "bg-navy text-white"
                      : "border border-ink/15 bg-surface text-ink hover:bg-paper"
                  }`}
                >
                  {activity.title}
                  {scores[activity.activityId] !== undefined && (
                    <span
                      aria-hidden="true"
                      className={`ml-2 h-1.5 w-1.5 shrink-0 rounded-full ${
                        isActive ? "bg-teal-strong" : "bg-teal"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

            <button
              type="button"
              aria-pressed={fullscreen}
              onClick={() => onFullscreenChange?.(!fullscreen)}
              className={`min-h-11 shrink-0 rounded-control px-4 text-sm font-medium ${
                fullscreen
                  ? "bg-navy text-white hover:bg-navy/90"
                  : "border border-ink/15 bg-surface text-ink hover:bg-paper"
              }`}
            >
              {fullscreen ? "Keluar layar penuh" : "Layar penuh"}
            </button>
          </div>

          <p
            data-player-storage
            aria-live="polite"
            hidden={!storageVisible}
            title={storage.message}
            className={`mt-1.5 truncate rounded-control border px-2.5 py-1 text-xs ${storageClasses[storage.status]}`}
          >
            {storage.message}
          </p>
        </div>

        <section
          id="activity-panel"
          role="tabpanel"
          aria-labelledby={`activity-tab-${activeActivity.activityId}`}
          tabIndex={0}
          className="min-w-0 rounded-card border border-ink/10 bg-surface p-4 md:p-5 xl:col-start-1 xl:row-start-2"
        >
          {activeActivity.type === "exploration" ? (
            <ExplorationActivity
              key={activeActivity.activityId}
              activity={activeActivity}
              assets={contentPackage.assets}
              expanded={fullscreen}
              onFinish={assessmentActivityId ? () => setActiveActivityId(assessmentActivityId) : undefined}
            />
          ) : activeActivity.type === "multiple-choice" ||
            activeActivity.type === "true-false" ||
            activeActivity.type === "short-answer" ? (
            <QuizActivity
              key={activeActivity.activityId}
              activity={activeActivity}
              resumeTarget={
                profileId
                  ? {
                      profileId,
                      packageId: contentPackage.data.manifest.packageId,
                      lessonId: lesson.lessonId,
                      activityId: activeActivity.activityId
                    }
                  : undefined
              }
              onGraded={(outcome) => void handleGraded(activeActivity.activityId, outcome)}
            />
          ) : activeActivity.type === "matching" ? (
            <MatchingActivity
              key={activeActivity.activityId}
              activity={activeActivity}
              onGraded={(outcome) => void handleGraded(activeActivity.activityId, outcome)}
            />
          ) : activeActivity.type === "ordering" ? (
            <OrderingActivity
              key={activeActivity.activityId}
              activity={activeActivity}
              onGraded={(outcome) => void handleGraded(activeActivity.activityId, outcome)}
            />
          ) : (
            <p className="text-sm text-muted">
              Tipe aktivitas <code>{activeActivity.type}</code> belum didukung di pratinjau ini.
            </p>
          )}
        </section>
      </div>

    </div>
  );
}
