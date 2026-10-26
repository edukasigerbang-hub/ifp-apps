import { useEffect, useMemo, useState } from "react";
import { LessonThumbnail } from "../components/content/LessonThumbnail";
import {
  catalogFacets,
  emptyCatalogFilters,
  filterCatalog,
  type CatalogLessonEntry
} from "../content/catalog";
import { loadCatalog } from "../content/loadCatalog";
import { subjectLabel } from "../content/subjectLabel";
import type { ScreenId } from "../navigation";
import { setPlaybackSelection } from "../state/playbackSelection";

interface CurriculumScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export function CurriculumScreen({ onNavigate }: CurriculumScreenProps) {
  const [entries, setEntries] = useState<CatalogLessonEntry[]>([]);
  const [query, setQuery] = useState("");
  const [grade, setGrade] = useState<number | null>(null);
  const [subject, setSubject] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
    <div className="max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Jelajah Materi</h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted md:text-base">
        Temukan materi berdasarkan kelas dan mata pelajaran, lalu buka di Player.
      </p>

      {error && (
        <p className="mt-4 rounded-control border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
          {error}
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
          <label className="text-sm">
            Mata pelajaran
            <select
              value={subject ?? ""}
              aria-label="Filter mata pelajaran"
              onChange={(event) =>
                setSubject(event.target.value === "" ? null : event.target.value)
              }
              className="mt-1 block min-h-11 rounded-control border border-ink/15 px-3 text-sm"
            >
              <option value="">Semua mapel</option>
              {facets.subjects.map((value) => (
                <option key={value} value={value}>
                  {subjectLabel(value)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4">
          <p id="filter-kelas-label" className="text-sm font-medium">
            Kelas
          </p>
          <div
            role="group"
            aria-labelledby="filter-kelas-label"
            className="mt-2 grid grid-cols-4 gap-2 md:grid-cols-7"
          >
            <button
              type="button"
              aria-pressed={grade === null}
              onClick={() => setGrade(null)}
              className={`flex min-h-11 items-center justify-center rounded-control border px-2 text-sm font-medium transition-colors ${
                grade === null
                  ? "border-primary bg-primary text-white"
                  : "border-ink/15 bg-surface text-muted hover:border-primary/40 hover:text-ink"
              }`}
            >
              Semua kelas
            </button>
            {facets.grades.map((value) => {
              const isActive = grade === value;
              const cover = gradeCovers.get(value);
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setGrade(value)}
                  className={`overflow-hidden rounded-control border text-center transition-colors ${
                    isActive
                      ? "border-primary ring-2 ring-primary"
                      : "border-ink/15 hover:border-primary/40"
                  }`}
                >
                  {cover ? (
                    <LessonThumbnail entry={cover} className="aspect-[4/3] w-full" />
                  ) : (
                    <span aria-hidden="true" className="block aspect-[4/3] w-full bg-teal/10" />
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
        </div>
        <p aria-live="polite" className="mt-3 text-sm text-muted">
          {loading ? "Memuat materi…" : `${visible.length} materi ditemukan.`}
        </p>
      </section>

      {!loading && visible.length === 0 ? (
        <p className="mt-6 rounded-card border border-ink/10 bg-surface p-6 text-sm text-muted">
          Tidak ada materi yang cocok. Ubah kata kunci atau filter.
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {visible.map((entry) => (
            <li
              key={`${entry.packageId}@${entry.version}:${entry.lessonId}`}
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
                <button
                  type="button"
                  onClick={() => openLesson(entry)}
                  className="mt-4 min-h-11 self-start rounded-control bg-primary px-5 text-sm font-semibold text-white hover:opacity-90"
                >
                  Buka materi
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
