import { useEffect, useMemo, useRef, useState } from "react";
import { CoverArt } from "../components/content/CoverArt";
import { LessonThumbnail } from "../components/content/LessonThumbnail";
import {
  catalogFacets,
  emptyCatalogFilters,
  filterCatalog,
  type CatalogLessonEntry
} from "../content/catalog";
import { gradeCoverUrl, subjectCoverUrl } from "../content/coverArt";
import { loadCatalog } from "../content/loadCatalog";
import { subjectLabel } from "../content/subjectLabel";
import { canPersistLocally } from "../data/learningRepository";
import {
  listPinnedLessons,
  pinnedErrorMessage,
  pinnedKey,
  setPinnedLesson
} from "../data/pinnedRepository";
import { getActiveProfile } from "../data/profileRepository";
import type { ScreenId } from "../navigation";
import { clearCatalogFilter, getCatalogFilter } from "../state/catalogFilter";
import { setPlaybackSelection } from "../state/playbackSelection";

interface CurriculumScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

// Menyebut filter yang aktif supaya hasil kosong tidak terbaca sebagai
// "materi tidak ada" (mis. mengetik "ipas" saat chip mapel masih Matematika).
function emptyStateMessage(
  query: string,
  grade: number | null,
  subject: string | null
): string {
  const keyword = query.trim();
  const filters: string[] = [];
  if (subject !== null) filters.push(`mapel ${subjectLabel(subject)}`);
  if (grade !== null) filters.push(`kelas ${grade}`);
  const filterText = filters.join(" dan ");
  if (keyword) {
    return filterText
      ? `Tidak ada materi untuk kata kunci “${keyword}” dengan filter ${filterText}.`
      : `Tidak ada materi untuk kata kunci “${keyword}”.`;
  }
  return filterText
    ? `Tidak ada materi untuk ${filterText}.`
    : "Tidak ada materi untuk filter ini.";
}

export function CurriculumScreen({ onNavigate }: CurriculumScreenProps) {
  const [entries, setEntries] = useState<CatalogLessonEntry[]>([]);
  const [query, setQuery] = useState("");
  const [grade, setGrade] = useState<number | null>(null);
  const [subject, setSubject] = useState<string | null>(null);
  const [classesOpen, setClassesOpen] = useState(true);
  const [subjectsOpen, setSubjectsOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [pinned, setPinned] = useState<Set<string>>(() => new Set());
  const [pinBusy, setPinBusy] = useState<string | null>(null);
  const [pinNotice, setPinNotice] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const appliedRequestRef = useRef(false);

  // Permintaan filter dari Beranda diterapkan sekali per kunjungan; penjaga ref
  // membuat penerapan ini tahan terhadap effect ganda StrictMode.
  useEffect(() => {
    if (appliedRequestRef.current) {
      return;
    }
    appliedRequestRef.current = true;
    const requested = getCatalogFilter();
    clearCatalogFilter();
    if (!requested) {
      return;
    }
    if (requested.subject) {
      setSubject(requested.subject);
      // Mapel sudah dipilih di Beranda; lipat grid mapel agar langkah berikutnya
      // (pilih kelas) langsung terlihat tanpa menggulir.
      setSubjectsOpen(false);
    }
    if (typeof requested.grade === "number") {
      setGrade(requested.grade);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const catalog = await loadCatalog();
        if (!cancelled) {
          setEntries(catalog.entries);
          if (catalog.errors.length > 0) {
            setError(catalog.errors[0]);
          }
        }
      } catch (caught) {
        if (!cancelled) {
          setError(
            caught instanceof Error ? caught.message : "Materi tidak dapat dimuat."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Status sematan dimuat sekali per kunjungan; katalog dan sematan dipisah
  // supaya kegagalan salah satunya tidak mengosongkan yang lain.
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
          setProfileId(active.id);
          setPinned(new Set(items.map((item) => pinnedKey(item))));
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
  }, []);

  async function togglePin(entry: CatalogLessonEntry) {
    if (!profileId) {
      return;
    }
    const key = pinnedKey(entry);
    const next = !pinned.has(key);
    setPinBusy(key);
    setPinError(null);
    try {
      await setPinnedLesson({
        profileId,
        packageId: entry.packageId,
        lessonId: entry.lessonId,
        pinned: next
      });
      setPinned((current) => {
        const copy = new Set(current);
        if (next) {
          copy.add(key);
        } else {
          copy.delete(key);
        }
        return copy;
      });
      setPinNotice(
        next
          ? `${entry.lessonTitle} disematkan ke Beranda.`
          : `${entry.lessonTitle} dilepas dari Beranda.`
      );
    } catch (caught) {
      setPinError(pinnedErrorMessage(caught));
    } finally {
      setPinBusy(null);
    }
  }

  const facets = useMemo(() => catalogFacets(entries), [entries]);
  const gradeCovers = useMemo(() => {
    const covers = new Map<number, CatalogLessonEntry>();
    for (const entry of entries) {
      if (!entry.coverAsset) continue;
      for (const level of entry.gradeLevels) {
        if (!covers.has(level)) covers.set(level, entry);
      }
    }
    return covers;
  }, [entries]);
  const subjectCovers = useMemo(() => {
    const covers = new Map<string, CatalogLessonEntry>();
    for (const entry of entries) {
      if (!entry.coverAsset) continue;
      for (const value of entry.subjects) {
        if (!covers.has(value)) covers.set(value, entry);
      }
    }
    return covers;
  }, [entries]);
  const visible = useMemo(
    () =>
      filterCatalog(entries, {
        ...emptyCatalogFilters,
        query,
        grade,
        subject
      }),
    [entries, query, grade, subject]
  );

  function openLesson(entry: CatalogLessonEntry) {
    setPlaybackSelection({
      packageId: entry.packageId,
      version: entry.version,
      lessonId: entry.lessonId
    });
    onNavigate("player");
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Jelajah Materi</h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted md:text-base">
        Temukan materi berdasarkan kelas dan mata pelajaran, lalu buka di Player.
      </p>

      {error && (
        <p className="mt-4 rounded-control border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
          {error}
        </p>
      )}

      {pinError && (
        <p className="mt-4 rounded-control border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
          {pinError}
        </p>
      )}

      <section aria-label="Filter materi" className="mt-6 rounded-card border border-ink/10 bg-surface p-5">
        <div className="flex flex-wrap items-end gap-4">
          <label className="min-w-56 flex-1 text-sm">
            Cari materi
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Cari materi"
              placeholder="Judul, topik, atau mata pelajaran"
              className="mt-1 block min-h-11 w-full rounded-control border border-ink/15 px-3 text-sm"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-col gap-3 md:flex-row">
          <button
            type="button"
            aria-expanded={classesOpen}
            aria-controls="filter-kelas-grid"
            onClick={() => setClassesOpen((open) => !open)}
            className="flex min-h-11 w-full items-center justify-between gap-3 rounded-control border border-ink/15 bg-surface px-3 text-left text-sm hover:border-primary/40 md:flex-1"
          >
            <span className="flex flex-wrap items-center gap-2">
              <span id="filter-kelas-label" className="sr-only">
                Kelas
              </span>
              <span
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  grade === null ? "bg-teal/10 text-ink" : "bg-primary text-white"
                }`}
              >
                {grade === null ? "Semua kelas" : `Kelas ${grade}`}
              </span>
            </span>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className={`h-4 w-4 shrink-0 text-muted transition-transform ${
                classesOpen ? "rotate-180" : ""
              }`}
            >
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-expanded={subjectsOpen}
            aria-controls="filter-mapel-grid"
            onClick={() => setSubjectsOpen((open) => !open)}
            className="flex min-h-11 w-full items-center justify-between gap-3 rounded-control border border-ink/15 bg-surface px-3 text-left text-sm hover:border-primary/40 md:flex-1"
          >
            <span className="flex flex-wrap items-center gap-2">
              <span id="filter-mapel-label" className="sr-only">
                Mata pelajaran
              </span>
              <span
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  subject === null ? "bg-teal/10 text-ink" : "bg-primary text-white"
                }`}
              >
                {subject === null ? "Semua mapel" : subjectLabel(subject)}
              </span>
            </span>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className={`h-4 w-4 shrink-0 text-muted transition-transform ${
                subjectsOpen ? "rotate-180" : ""
              }`}
            >
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        {classesOpen && (
          <div
            id="filter-kelas-grid"
            role="group"
            aria-labelledby="filter-kelas-label"
            className="mt-2 grid grid-cols-4 gap-2 md:grid-cols-7"
          >
            <button
              type="button"
              aria-pressed={grade === null}
              onClick={() => {
                setGrade(null);
                setClassesOpen(false);
              }}
              className={`flex min-h-11 items-center justify-center rounded-control border px-2 text-sm font-medium transition-colors ${
                grade === null
                  ? "border-primary bg-primary text-white"
                  : "border-ink/15 bg-surface text-muted hover:border-primary/40 hover:text-ink"
              }`}
            >
              <span className="flex flex-col items-center gap-1.5">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="h-6 w-6"
                >
                  <rect x="4" y="4" width="7" height="7" rx="1.5" />
                  <rect x="13" y="4" width="7" height="7" rx="1.5" />
                  <rect x="4" y="13" width="7" height="7" rx="1.5" />
                  <rect x="13" y="13" width="7" height="7" rx="1.5" />
                </svg>
                Semua kelas
              </span>
            </button>
            {facets.grades.map((value) => {
              const isActive = grade === value;
              const coverUrl = gradeCoverUrl(value);
              const cover = gradeCovers.get(value);
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => {
                    setGrade(value);
                    setClassesOpen(false);
                  }}
                  className={`overflow-hidden rounded-control border text-center transition-colors ${
                    isActive
                      ? "border-primary ring-2 ring-primary"
                      : "border-ink/15 hover:border-primary/40"
                  }`}
                >
                  {coverUrl ? (
                    <CoverArt url={coverUrl} className="aspect-[16/9] w-full" />
                  ) : cover ? (
                    <LessonThumbnail entry={cover} className="aspect-[16/9] w-full" />
                  ) : (
                    <span aria-hidden="true" className="block aspect-[16/9] w-full bg-teal/10" />
                  )}
                  <span
                    className={`block px-2 py-1.5 text-xs font-semibold ${
                      isActive ? "bg-primary text-white" : "bg-surface text-ink"
                    }`}
                  >
                    Kelas {value}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        {subjectsOpen && (
          <div
            id="filter-mapel-grid"
            role="group"
            aria-labelledby="filter-mapel-label"
            className="mt-2 grid grid-cols-4 gap-2 md:grid-cols-8"
          >
            <button
              type="button"
              aria-pressed={subject === null}
              onClick={() => {
                setSubject(null);
                setSubjectsOpen(false);
              }}
              className={`flex min-h-11 items-center justify-center rounded-control border px-2 text-sm font-medium transition-colors ${
                subject === null
                  ? "border-primary bg-primary text-white"
                  : "border-ink/15 bg-surface text-muted hover:border-primary/40 hover:text-ink"
              }`}
            >
              <span className="flex flex-col items-center gap-1.5">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="h-6 w-6"
                >
                  <path d="M5 5h14v14H5z" strokeLinejoin="round" />
                  <path d="M9 5v14M15 5v14" strokeLinejoin="round" />
                </svg>
                Semua mapel
              </span>
            </button>
            {facets.subjects.map((value) => {
              const isActive = subject === value;
              const coverUrl = subjectCoverUrl(value);
              const cover = subjectCovers.get(value);
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => {
                    setSubject(value);
                    setSubjectsOpen(false);
                  }}
                  className={`overflow-hidden rounded-control border text-center transition-colors ${
                    isActive
                      ? "border-primary ring-2 ring-primary"
                      : "border-ink/15 hover:border-primary/40"
                  }`}
                >
                  {coverUrl ? (
                    <CoverArt url={coverUrl} className="aspect-[16/9] w-full" />
                  ) : cover ? (
                    <LessonThumbnail entry={cover} className="aspect-[16/9] w-full" />
                  ) : (
                    <span aria-hidden="true" className="block aspect-[16/9] w-full bg-teal/10" />
                  )}
                  <span
                    className={`block px-2 py-1.5 text-xs font-semibold ${
                      isActive ? "bg-primary text-white" : "bg-surface text-ink"
                    }`}
                  >
                    {subjectLabel(value)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        <p aria-live="polite" className="mt-3 text-sm text-muted">
          {loading ? "Memuat materi…" : `${visible.length} materi ditemukan.`}
        </p>
      </section>

      <p aria-live="polite" className="sr-only">
        {pinNotice}
      </p>

      {!loading && visible.length === 0 ? (
        <div
          data-catalog-empty
          className="mt-6 rounded-card border border-ink/10 bg-surface p-6"
        >
          <p className="text-sm text-muted">
            {emptyStateMessage(query, grade, subject)}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {subject !== null && (
              <button
                type="button"
                onClick={() => setSubject(null)}
                className="min-h-11 rounded-control bg-primary px-4 text-sm font-semibold text-white hover:opacity-90"
              >
                Cari di semua mapel
              </button>
            )}
            {grade !== null && (
              <button
                type="button"
                onClick={() => setGrade(null)}
                className="min-h-11 rounded-control border border-ink/15 px-4 text-sm font-medium hover:bg-paper"
              >
                Cari di semua kelas
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setGrade(null);
                setSubject(null);
              }}
              className="min-h-11 rounded-control border border-ink/15 px-4 text-sm font-medium hover:bg-paper"
            >
              Hapus semua filter
            </button>
          </div>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {visible.map((entry) => (
            <li
              key={`${entry.packageId}@${entry.version}:${entry.lessonId}`}
              data-catalog-subjects={entry.subjects.join(",")}
              data-catalog-grades={entry.gradeLevels.join(",")}
              className="flex flex-col overflow-hidden rounded-card border border-ink/10 bg-surface"
            >
              <LessonThumbnail entry={entry} className="aspect-[16/9] w-full border-b border-ink/10" />
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                    Kelas {entry.gradeLevels.join(", ")} ·{" "}
                    {entry.subjects.map(subjectLabel).join(", ")}
                  </p>
                  <h2 className="mt-2 text-lg font-semibold">{entry.lessonTitle}</h2>
                  <p className="mt-1 text-sm text-muted">{entry.summary}</p>
                  <p className="mt-3 text-xs text-muted">
                    {entry.activityCount} aktivitas ·{" "}
                    {entry.source === "managed" ? "Paket impor" : "Paket bawaan build"}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openLesson(entry)}
                    className="min-h-11 rounded-control bg-primary px-5 text-sm font-semibold text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
                  >
                    Buka materi
                  </button>
                  {profileId && (
                    <button
                      type="button"
                      data-pin-toggle
                      onClick={() => togglePin(entry)}
                      aria-pressed={pinned.has(pinnedKey(entry))}
                      aria-label={
                        pinned.has(pinnedKey(entry))
                          ? `Lepas sematan ${entry.lessonTitle}`
                          : `Sematkan ${entry.lessonTitle}`
                      }
                      disabled={pinBusy === pinnedKey(entry)}
                      className={`inline-flex min-h-11 items-center gap-2 rounded-control border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 ${
                        pinned.has(pinnedKey(entry))
                          ? "border-teal/50 bg-teal/10 text-ink"
                          : "border-ink/15 bg-surface text-muted hover:border-primary/40 hover:text-ink"
                      }`}
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill={pinned.has(pinnedKey(entry)) ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="1.6"
                        className="h-4 w-4"
                      >
                        <path d="M7 4h10v16l-5-3.4L7 20z" strokeLinejoin="round" />
                      </svg>
                      {pinned.has(pinnedKey(entry)) ? "Disematkan" : "Sematkan"}
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
