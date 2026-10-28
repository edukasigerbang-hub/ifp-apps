import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
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
import {
  listPinnedLessons,
  pinnedErrorMessage,
  pinnedKey,
  setPinnedLesson,
  type PinnedLesson
} from "../data/pinnedRepository";
import { getActiveProfile, type Profile } from "../data/profileRepository";
import type { ScreenId } from "../navigation";
import { setCatalogFilter } from "../state/catalogFilter";
import { setPlaybackSelection } from "../state/playbackSelection";

interface HomeScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

const homeSectionIds = ["pinned", "available", "explore"] as const;
type HomeSection = (typeof homeSectionIds)[number];

const homeSectionLabels: Record<HomeSection, string> = {
  pinned: "Materi disematkan",
  available: "Materi tersedia",
  explore: "Jelajahi materi"
};

function formatScore(score: number | null): string {
  return score === null ? "—" : String(Math.round(score));
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [summary, setSummary] = useState<LearningSummary | null>(null);
  const [entries, setEntries] = useState<CatalogLessonEntry[]>([]);
  const [pins, setPins] = useState<PinnedLesson[]>([]);
  const [pinsLoaded, setPinsLoaded] = useState(() => !canPersistLocally());
  const [pinNotice, setPinNotice] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<HomeSection>("pinned");
  const sectionChosenRef = useRef(false);

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

  // Sematan dibaca terpisah dari katalog: kegagalan salah satunya tidak
  // mengosongkan seksi lainnya di Beranda.
  useEffect(() => {
    if (!canPersistLocally()) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const active = await getActiveProfile();
        const items = await listPinnedLessons(active.id);
        if (!cancelled) {
          setPins(items);
        }
      } catch (caught) {
        if (!cancelled) {
          setPinError(pinnedErrorMessage(caught));
        }
      } finally {
        if (!cancelled) {
          setPinsLoaded(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Tanpa sematan, Beranda terbuka di "Materi tersedia"; begitu ada sematan,
  // "Materi disematkan" jadi tab awal. Pilihan manual pengguna tidak ditimpa.
  useEffect(() => {
    if (!pinsLoaded || sectionChosenRef.current) return;
    setActiveSection(pins.length === 0 ? "available" : "pinned");
  }, [pins.length, pinsLoaded]);

  const recent = summary?.recent[0];
  const resumeEntry = recent
    ? entries.find((entry) => entry.lessonId === recent.lessonId)
    : undefined;  const pinnedEntries = useMemo(() => {
    const byKey = new Map(entries.map((entry) => [pinnedKey(entry), entry]));
    return pins.flatMap((pin) => {
      const entry = byKey.get(pinnedKey(pin));
      return entry ? [entry] : [];
    });
  }, [entries, pins]);
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

  function openEntry(entry: CatalogLessonEntry) {
    setPlaybackSelection({
      packageId: entry.packageId,
      version: entry.version,
      lessonId: entry.lessonId
    });
    onNavigate("player");
  }

  function resume() {
    if (!resumeEntry) return;
    openEntry(resumeEntry);
  }

  function openSubject(subject: string) {
    setCatalogFilter({ subject });
    onNavigate("curriculum");
  }

  async function unpin(entry: CatalogLessonEntry) {
    if (!profile) return;
    setPinError(null);
    try {
      await setPinnedLesson({
        profileId: profile.id,
        packageId: entry.packageId,
        lessonId: entry.lessonId,
        pinned: false
      });
      const remaining = pins.filter((pin) => pinnedKey(pin) !== pinnedKey(entry));
      setPins(remaining);
      if (remaining.length === 0) {
        setActiveSection("available");
      }
      setPinNotice(`${entry.lessonTitle} dilepas dari Beranda.`);
    } catch (caught) {
      setPinError(pinnedErrorMessage(caught));
    }
  }

  function selectSection(id: HomeSection, focusTab = false) {
    sectionChosenRef.current = true;
    setActiveSection(id);
    if (focusTab) {
      document.getElementById(`home-tab-${id}`)?.focus();
    }
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = homeSectionIds.indexOf(activeSection);
    let next: HomeSection | undefined;
    if (event.key === "ArrowRight") {
      next = homeSectionIds[(current + 1) % homeSectionIds.length];
    } else if (event.key === "ArrowLeft") {
      next = homeSectionIds[(current - 1 + homeSectionIds.length) % homeSectionIds.length];
    } else if (event.key === "Home") {
      next = homeSectionIds[0];
    } else if (event.key === "End") {
      next = homeSectionIds[homeSectionIds.length - 1];
    }
    if (!next) return;
    event.preventDefault();
    selectSection(next, true);
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

      <section
        data-home-overview
        aria-label="Ringkasan belajar di perangkat ini"
        className="mt-6 grid gap-4 lg:grid-cols-3"
      >
        <div
          data-resume-column
          className="flex flex-col rounded-card border border-teal/30 bg-teal/5 p-4"
        >
          <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            Lanjutkan belajar
          </h2>
          {resumeEntry ? (
            <div data-resume-entry className="mt-2 flex items-center gap-3">
              <LessonThumbnail
                entry={resumeEntry}
                className="h-14 w-14 shrink-0 rounded-control"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{resumeEntry.lessonTitle}</p>
                <p className="mt-0.5 truncate text-xs text-muted">
                  {resumeEntry.packageTitle} · Kelas {resumeEntry.gradeLevels.join(", ")}
                </p>
              </div>
              <button
                type="button"
                onClick={resume}
                className="min-h-11 shrink-0 rounded-control bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
              >
                Lanjutkan
              </button>
            </div>
          ) : (
            <p data-resume-empty className="mt-2 text-sm leading-snug text-muted">
              Belum ada materi yang sedang dipelajari. Pilih materi di bawah.
            </p>
          )}
        </div>

        <div data-summary-column className="flex flex-col rounded-card border border-ink/10 bg-surface p-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            Ringkasan belajar
          </h2>
          {!canPersistLocally() ? (
            <p className="mt-2 text-xs leading-snug text-muted">
              Pratinjau browser tidak menyimpan hasil belajar.
            </p>
          ) : summary ? (
            <dl className="mt-2 flex items-end gap-6">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                  Sesi
                </dt>
                <dd className="mt-1 text-2xl font-semibold leading-none">{summary.sessions}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                  Percobaan
                </dt>
                <dd className="mt-1 text-2xl font-semibold leading-none">{summary.attempts}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                  Rata-rata
                </dt>
                <dd className="mt-1 text-2xl font-semibold leading-none">
                  {formatScore(summary.averageScore)}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-2 text-sm text-muted">Memuat ringkasan…</p>
          )}
        </div>

        <div data-recent-column className="flex flex-col rounded-card border border-ink/10 bg-surface p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Aktivitas terbaru
            </h2>
            {summary && summary.recent.length > 0 && (
              <button
                type="button"
                onClick={() => onNavigate("results")}
                className="min-h-11 shrink-0 rounded-control px-3 text-xs font-medium text-primary hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                Lihat semua hasil
              </button>
            )}
          </div>
          {summary && summary.recent.length > 0 ? (
            <ul className="mt-1 space-y-1 text-xs">
              {summary.recent.slice(0, 3).map((attempt, index) => (
                <li
                  key={`${attempt.lessonId}-${attempt.activityId}-${index}`}
                  className="flex items-center justify-between gap-3 leading-4"
                >
                  <span className="min-w-0 truncate text-muted">
                    {entries.find((entry) => entry.lessonId === attempt.lessonId)?.lessonTitle ??
                      attempt.lessonId}
                  </span>
                  <span className="shrink-0 font-semibold">Skor {Math.round(attempt.score)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-muted">Belum ada aktivitas yang dinilai.</p>
          )}
        </div>
      </section>

      <div
        role="tablist"
        aria-label="Bagian Beranda"
        onKeyDown={onTabKeyDown}
        className="mt-6 flex flex-col gap-1 rounded-card border border-ink/10 bg-surface p-1.5 sm:flex-row"
      >
        {homeSectionIds.map((id) => {
          const selected = activeSection === id;
          const count = id === "pinned" && pinsLoaded ? pinnedEntries.length : null;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`home-tab-${id}`}
              aria-selected={selected}
              aria-controls={`home-panel-${id}`}
              tabIndex={selected ? 0 : -1}
              data-home-tab={id}
              onClick={() => selectSection(id)}
              className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-control px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 ${
                selected ? "bg-primary text-white" : "text-muted hover:bg-paper hover:text-ink"
              }`}
            >
              {homeSectionLabels[id]}
              {count !== null && (
                <span
                  aria-hidden="true"
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    selected ? "bg-white/20 text-white" : "bg-ink/5 text-muted"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <section
        role="tabpanel"
        id="home-panel-pinned"
        aria-labelledby="home-tab-pinned"
        hidden={activeSection !== "pinned"}
        data-pinned-section
        className="mt-4 rounded-card"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <p className="text-sm text-muted">
            Pilihanmu sendiri, tersimpan per profil dan selalu tampil lebih dulu (maksimal 24
            materi).
          </p>
          {pinnedEntries.length > 0 && (
            <button
              type="button"
              onClick={() => onNavigate("curriculum")}
              className="min-h-11 rounded-control border border-ink/15 bg-surface px-4 text-sm font-medium hover:bg-paper"
            >
              Kelola sematan
            </button>
          )}
        </div>

        {pinError && (
          <p className="mt-3 rounded-control border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
            {pinError}
          </p>
        )}

        {!canPersistLocally() ? (
          <p
            data-pinned-empty
            className="mt-3 rounded-card border border-warning/40 bg-warning/10 p-5 text-sm"
          >
            Pratinjau browser tidak menyimpan sematan. Jalankan aplikasi desktop untuk memakai
            fitur ini.
          </p>
        ) : !pinsLoaded ? (
          <p className="mt-3 text-sm text-muted">Memuat sematan…</p>
        ) : pinnedEntries.length === 0 ? (
          <div
            data-pinned-empty
            className="mt-3 rounded-card border border-dashed border-ink/20 bg-surface p-5"
          >
            <p className="text-sm leading-relaxed text-muted">
              Belum ada materi yang disematkan. Buka Jelajah Materi, lalu tekan{" "}
              <strong className="font-semibold text-ink">Sematkan</strong> pada materi yang ingin
              selalu tampil di sini.
            </p>
            <button
              type="button"
              onClick={() => onNavigate("curriculum")}
              className="mt-4 min-h-11 rounded-control bg-primary px-5 text-sm font-semibold text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
            >
              Buka Jelajah Materi
            </button>
          </div>
        ) : (
          <ul className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pinnedEntries.map((entry) => (
              <li
                key={`${entry.packageId}@${entry.version}:${entry.lessonId}`}
                data-pinned-card
                className="flex flex-col overflow-hidden rounded-card border border-teal/30 bg-surface"
              >
                <LessonThumbnail
                  entry={entry}
                  className="aspect-[16/9] w-full border-b border-ink/10"
                />
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                      Kelas {entry.gradeLevels.join(", ")} ·{" "}
                      {entry.subjects.map(subjectLabel).join(", ")}
                    </p>
                    <p data-pinned-title className="mt-1.5 text-base font-semibold">
                      {entry.lessonTitle}
                    </p>
                    <p className="mt-1 text-xs text-muted">{entry.packageTitle}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEntry(entry)}
                      className="min-h-11 rounded-control bg-primary px-5 text-sm font-semibold text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
                    >
                      Buka
                    </button>
                    <button
                      type="button"
                      onClick={() => unpin(entry)}
                      aria-label={`Lepas sematan ${entry.lessonTitle}`}
                      className="min-h-11 rounded-control border border-ink/15 bg-surface px-4 text-sm font-medium text-muted hover:border-primary/40 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    >
                      Lepas
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p aria-live="polite" className="sr-only">
          {pinNotice}
        </p>
      </section>

      <section
        role="tabpanel"
        id="home-panel-available"
        aria-labelledby="home-tab-available"
        hidden={activeSection !== "available"}
        data-available-section
        className="mt-4 rounded-card"
      >
        <p className="text-sm text-muted">
          Pilih mata pelajaran untuk melihat materinya, atau sematkan materi yang sering dipakai.
        </p>

        {entries.length === 0 ? (
          <p className="mt-3 rounded-card border border-ink/10 bg-surface p-5 text-sm text-muted">
            Belum ada paket konten. Tambahkan paket ke <code>content/packages/</code> atau
            impor lewat Konten &amp; Pembaruan.
          </p>
        ) : (
          <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {facets.subjects.map((subject) => {
              const coverUrl = subjectCoverUrl(subject);
              const cover = subjectCovers.get(subject);
              return (
                <li
                  key={subject}
                  data-subject-card
                  className="overflow-hidden rounded-card border border-ink/10 bg-surface"
                >
                  <button
                    type="button"
                    onClick={() => openSubject(subject)}
                    className="group flex h-full w-full flex-col text-left transition-colors hover:bg-paper"
                  >
                    {coverUrl ? (
                      <CoverArt url={coverUrl} className="aspect-[16/9] w-full" />
                    ) : cover ? (
                      <LessonThumbnail entry={cover} className="aspect-[16/9] w-full" />
                    ) : (
                      <span aria-hidden="true" className="block aspect-[16/9] w-full bg-teal/10" />
                    )}
                    <span className="flex flex-1 items-center justify-between gap-3 px-4 py-3">
                      <span className="min-w-0">
                        <span className="block text-base font-semibold">{subjectLabel(subject)}</span>
                        <span className="mt-0.5 block text-xs text-muted">
                          {subjectCounts.get(subject) ?? 0} materi
                        </span>
                      </span>
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
                      >
                        <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section
        role="tabpanel"
        id="home-panel-explore"
        aria-labelledby="home-tab-explore"
        hidden={activeSection !== "explore"}
        data-explore-section
        className="mt-4 overflow-hidden rounded-card border border-primary/20 bg-gradient-to-br from-primary/5 via-surface to-teal/5"
      >
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6">
          <div>
            <p className="text-base font-semibold">Cari materi lain di Jelajah Materi</p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
              Saring berdasarkan kelas dan mata pelajaran, lalu tekan Sematkan pada materi yang
              sering dipakai agar selalu ada di Beranda.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("curriculum")}
            className="min-h-11 self-start rounded-control bg-primary px-5 text-sm font-semibold text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 md:self-auto"
          >
            Buka Jelajah Materi
          </button>
        </div>
      </section>

    </div>
  );
}
