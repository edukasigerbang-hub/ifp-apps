import { useEffect, useState } from "react";
import type { CatalogLessonEntry } from "../content/catalog";
import { catalogFacets } from "../content/catalog";
import { loadCatalog } from "../content/loadCatalog";
import { canPersistLocally, getLearningSummary, type LearningSummary } from "../data/learningRepository";
import { getActiveProfile, type Profile } from "../data/profileRepository";
import type { ScreenId } from "../navigation";
import { setPlaybackSelection } from "../state/playbackSelection";

interface HomeScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

function subjectLabel(subject: string): string {
  return subject.charAt(0).toUpperCase() + subject.slice(1);
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
  const facets = catalogFacets(entries);
  const subjectCounts = new Map<string, number>();
  for (const entry of entries) {
    for (const subject of entry.subjects) {
      subjectCounts.set(subject, (subjectCounts.get(subject) ?? 0) + 1);
    }
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
    <div className="max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
        {profile ? `Halo, ${profile.displayName}` : "Halo"}
      </h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted md:text-base">
        Lanjutkan belajar dari perangkat ini, atau jelajahi materi yang tersedia.
      </p>

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
        <section className="mt-6 rounded-card border border-teal/30 bg-teal/5 p-5 md:p-6">
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
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {facets.subjects.map((subject) => (
              <li
                key={subject}
                className="flex items-center justify-between gap-3 rounded-card border border-ink/10 bg-surface px-5 py-4"
              >
                <div>
                  <p className="text-sm font-semibold">{subjectLabel(subject)}</p>
                  <p className="text-xs text-muted">
                    {subjectCounts.get(subject) ?? 0} materi
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate("curriculum")}
                  className="min-h-11 rounded-control border border-ink/15 px-4 text-sm font-medium hover:bg-paper"
                >
                  Lihat
                </button>
              </li>
            ))}
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
