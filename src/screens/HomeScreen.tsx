import { useEffect, useMemo, useState } from "react";
import { CoverArt } from "../components/content/CoverArt";
import { LessonThumbnail } from "../components/content/LessonThumbnail";
import { LearningIllustration } from "../components/home/LearningIllustration";
import { ProfileAvatar } from "../components/profile/ProfileAvatar";
import type { CatalogLessonEntry } from "../content/catalog";
import { catalogFacets } from "../content/catalog";
import { subjectCoverUrl } from "../content/coverArt";
import { loadCatalog } from "../content/loadCatalog";
import { subjectLabel } from "../content/subjectLabel";
import { canPersistLocally, getLearningSummary, type LearningSummary } from "../data/learningRepository";
import { getActiveProfile, type Profile } from "../data/profileRepository";
import type { ScreenId } from "../navigation";
import { setPlaybackSelection } from "../state/playbackSelection";

interface HomeScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

function formatScore(score: number | null): string {
  return score === null ? "—" : String(Math.round(score));
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [summary, setSummary] = useState<LearningSummary | null>(null);
  const [entries, setEntries] = useState<CatalogLessonEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const catalog = await loadCatalog();
        const active = await getActiveProfile();
        let learning: LearningSummary | null = null;
        if (canPersistLocally()) {
          learning = await getLearningSummary(active.id);
        }
        if (!cancelled) {
          setEntries(catalog.entries);
          setProfile(active);
          setSummary(learning);
          if (catalog.errors.length > 0) {
            setError(catalog.errors[0]);
          }
        }
      } catch (caught) {
        if (!cancelled) {
          setError(
            caught instanceof Error ? caught.message : "Beranda tidak dapat dimuat."
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const recent = summary?.recent[0];
  const resumeEntry = recent
    ? entries.find((entry) => entry.lessonId === recent.lessonId)
    : undefined;
  const heroEntry = useMemo(
    () =>
      entries.find(
        (entry) =>
          entry.coverAsset &&
          entry.subjects.includes("matematika") &&
          entry.gradeLevels.includes(3)
      ) ?? entries.find((entry) => entry.coverAsset),
    [entries]
  );
  const facets = catalogFacets(entries);
  const heroCoverUrl = heroEntry ? subjectCoverUrl(heroEntry.subjects[0] ?? "") : null;
  const subjectCounts = new Map<string, number>();
  const subjectCovers = new Map<string, CatalogLessonEntry>();
  for (const entry of entries) {
    for (const subject of entry.subjects) {
      subjectCounts.set(subject, (subjectCounts.get(subject) ?? 0) + 1);
      if (entry.coverAsset && !subjectCovers.has(subject)) {
        subjectCovers.set(subject, entry);
      }
    }
  }
  for (const subject of facets.subjects) {
    if (subjectCovers.has(subject)) continue;
    const fallback = entries.find((entry) => entry.subjects.includes(subject));
    if (fallback) subjectCovers.set(subject, fallback);
  }

  function resume() {
    if (!resumeEntry) return;
    setPlaybackSelection({
      packageId: resumeEntry.packageId,
      version: resumeEntry.version,
      lessonId: resumeEntry.lessonId
    });
    onNavigate("player");
  }

  return (
    <div className="w-full">
      <section className="overflow-hidden rounded-card border border-teal/20 bg-gradient-to-br from-teal/10 via-surface to-primary/5">
        <div className="flex flex-col gap-6 p-5 md:flex-row md:items-center md:justify-between md:p-7">
          <div className="flex min-w-0 items-start gap-4">
            <ProfileAvatar
              profile={profile}
              className="h-16 w-16 shrink-0 rounded-full text-lg ring-2 ring-surface md:h-20 md:w-20 md:text-xl"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-strong">
                Ruang belajar
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
                {profile ? `Halo, ${profile.displayName}` : "Halo"}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted md:text-base">
                Lanjutkan belajar dari perangkat ini, atau jelajahi materi yang tersedia.
              </p>
            </div>
          </div>
          <div className="w-full max-w-sm self-center md:w-80 md:shrink-0">
            <LearningIllustration entry={heroEntry} coverUrl={heroCoverUrl} />
          </div>
        </div>
      </section>

      {error && (
        <p className="mt-4 rounded-control border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
          {error}
        </p>
      )}

      <section className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">
          Ringkasan belajar
        </h2>
        {!canPersistLocally() ? (
          <p className="mt-3 rounded-card border border-warning/40 bg-warning/10 p-5 text-sm">
            Pratinjau browser tidak menyimpan hasil belajar. Jalankan aplikasi desktop
            untuk melihat ringkasan.
          </p>
        ) : summary ? (
          <dl className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-card border border-ink/10 bg-surface px-5 py-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                Sesi
              </dt>
              <dd className="mt-1 text-2xl font-semibold">{summary.sessions}</dd>
            </div>
            <div className="rounded-card border border-ink/10 bg-surface px-5 py-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                Percobaan
              </dt>
              <dd className="mt-1 text-2xl font-semibold">{summary.attempts}</dd>
            </div>
            <div className="rounded-card border border-ink/10 bg-surface px-5 py-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                Rata-rata
              </dt>
              <dd className="mt-1 text-2xl font-semibold">
                {formatScore(summary.averageScore)}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="mt-3 text-sm text-muted">Memuat ringkasan…</p>
        )}
      </section>

      {resumeEntry && (
        <section className="mt-6 overflow-hidden rounded-card border border-teal/30 bg-teal/5">
          <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:p-6">
            <LessonThumbnail
              entry={resumeEntry}
              className="aspect-[16/9] w-full rounded-control md:w-56 md:shrink-0"
            />
            <div className="min-w-0">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">
                Lanjutkan belajar
              </h2>
              <p className="mt-2 text-lg font-semibold">{resumeEntry.lessonTitle}</p>
              <p className="mt-1 text-sm text-muted">
                {resumeEntry.packageTitle} · Kelas {resumeEntry.gradeLevels.join(", ")}
              </p>
              <button
                type="button"
                onClick={resume}
                className="mt-4 min-h-11 rounded-control bg-primary px-5 text-sm font-semibold text-white hover:opacity-90"
              >
                Lanjutkan
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="mt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">
            Materi tersedia
          </h2>
          <button
            type="button"
            onClick={() => onNavigate("curriculum")}
            className="min-h-11 rounded-control border border-ink/15 px-4 text-sm font-medium hover:bg-paper"
          >
            Jelajah semua materi
          </button>
        </div>

        {entries.length === 0 ? (
          <p className="mt-3 rounded-card border border-ink/10 bg-surface p-5 text-sm text-muted">
            Belum ada paket konten. Tambahkan paket ke <code>content/packages/</code> atau
            impor lewat Konten &amp; Pembaruan.
          </p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {facets.subjects.map((subject) => {
              const coverUrl = subjectCoverUrl(subject);
              const cover = subjectCovers.get(subject);
              return (
                <li
                  key={subject}
                  data-subject-card
                  className="flex items-center gap-3 rounded-card border border-ink/10 bg-surface p-4"
                >
                  {coverUrl ? (
                    <CoverArt url={coverUrl} className="h-14 w-24 shrink-0 rounded-control" />
                  ) : cover ? (
                    <LessonThumbnail entry={cover} className="h-14 w-24 shrink-0 rounded-control" />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="h-14 w-24 shrink-0 rounded-control bg-teal/10"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{subjectLabel(subject)}</p>
                    <p className="text-xs text-muted">
                      {subjectCounts.get(subject) ?? 0} materi
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate("curriculum")}
                    className="min-h-11 shrink-0 rounded-control border border-ink/15 px-4 text-sm font-medium hover:bg-paper"
                  >
                    Lihat
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {summary && summary.attempts > 0 && (
        <section className="mt-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">
              Aktivitas terbaru
            </h2>
            <button
              type="button"
              onClick={() => onNavigate("results")}
              className="min-h-11 rounded-control border border-ink/15 px-4 text-sm font-medium hover:bg-paper"
            >
              Lihat semua hasil
            </button>
          </div>
          <ul className="mt-3 space-y-2">
            {summary.recent.slice(0, 3).map((attempt, index) => (
              <li
                key={`${attempt.lessonId}-${attempt.activityId}-${index}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-control border border-ink/10 bg-surface px-4 py-3 text-sm"
              >
                <span className="text-muted">
                  {entries.find((entry) => entry.lessonId === attempt.lessonId)?.lessonTitle ??
                    attempt.lessonId}
                </span>
                <span className="font-semibold">Skor {Math.round(attempt.score)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
