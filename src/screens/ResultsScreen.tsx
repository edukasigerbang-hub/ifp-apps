import { useEffect, useState } from "react";
import { PageHeader } from "../components/ui/PageHeader";
import {
  canPersistLocally,
  ensureLocalProfile,
  getLearningSummary,
  type LearningSummary
} from "../data/learningRepository";
import { exportResultsCsv, pickResultsDestination } from "../data/resultsRepository";
import { getActiveProfile } from "../data/profileRepository";

type ResultsState =
  | { status: "loading" }
  | { status: "ready"; summary: LearningSummary }
  | { status: "preview" }
  | { status: "error"; message: string };

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

export function ResultsScreen() {
  const [state, setState] = useState<ResultsState>({ status: "loading" });
  const [exportBusy, setExportBusy] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const desktop = canPersistLocally();

  useEffect(() => {
    if (!canPersistLocally()) {
      setState({ status: "preview" });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const profileId = await ensureLocalProfile();
        const profile = await getActiveProfile();
        const summary = await getLearningSummary(profileId);
        if (!cancelled) {
          setProfileName(profile.displayName);
          setState({ status: "ready", summary });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "Data lokal tidak dapat dibaca."
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleExport() {
    setExportError(null);
    setExportMessage(null);
    try {
      const destination = await pickResultsDestination(
        `hasil-belajar-${new Date().toISOString().slice(0, 10)}.csv`
      );
      if (!destination) return;
      setExportBusy(true);
      const summary = await exportResultsCsv(destination);
      setExportMessage(`Laporan diekspor: ${summary.path} (${summary.rows} baris)`);
    } catch (caught) {
      setExportError(caught instanceof Error ? caught.message : "Ekspor laporan gagal.");
    } finally {
      setExportBusy(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Hasil Belajar"
        description="Ringkasan hasil yang tersimpan di perangkat ini. Belum ada sinkronisasi cloud."
      />

      {profileName && (
        <p className="mt-2 text-sm text-muted">
          Profil aktif: <span className="font-medium text-ink">{profileName}</span>
        </p>
      )}

      {desktop && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void handleExport()}
            disabled={exportBusy}
            className="min-h-11 rounded-control border border-ink/15 px-5 text-sm font-medium hover:bg-paper disabled:opacity-40"
          >
            Ekspor laporan CSV…
          </button>
          <p aria-live="polite" className="text-sm text-muted">
            {exportMessage ?? ""}
          </p>
        </div>
      )}
      {desktop && (
        <p className="mt-2 text-xs text-muted">
          Berkas CSV memuat nama profil dan hasil belajar (data pribadi). File yang sudah diekspor
          tidak ikut terhapus saat profil dihapus.
        </p>
      )}
      {exportError && (
        <p className="mt-3 rounded-control border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {exportError}
        </p>
      )}

      {state.status === "loading" && <p className="mt-6 text-sm text-muted">Memuat hasil belajar…</p>}

      {state.status === "preview" && (
        <div className="mt-6 rounded-card border border-warning/40 bg-warning/10 p-6 text-sm">
          Pratinjau browser tidak memiliki database lokal. Jalankan aplikasi desktop (Tauri) untuk melihat hasil
          tersimpan.
        </div>
      )}

      {state.status === "error" && (
        <div className="mt-6 rounded-card border border-danger/30 bg-danger/5 p-6 text-sm text-danger">
          {state.message}
        </div>
      )}

      {state.status === "ready" && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <StatCard label="Sesi belajar" value={String(state.summary.sessions)} />
            <StatCard label="Percobaan aktivitas" value={String(state.summary.attempts)} />
            <StatCard
              label="Rata-rata skor"
              value={state.summary.averageScore === null ? "—" : String(Math.round(state.summary.averageScore))}
            />
          </div>

          <section className="mt-6 rounded-card border border-ink/10 bg-surface p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">Aktivitas terbaru</h2>
            {state.summary.recent.length === 0 ? (
              <p className="mt-3 text-sm text-muted">
                Belum ada hasil tersimpan. Selesaikan kuis di layar Player untuk membuat hasil pertama.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-ink/10">
                {state.summary.recent.map((attempt, index) => (
                  <li
                    key={`${attempt.activityId}-${attempt.completedAt ?? index}`}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{attempt.activityId}</p>
                      <p className="text-xs text-muted">
                        {attempt.lessonId} · {formatDate(attempt.completedAt)}
                      </p>
                    </div>
                    <span className="rounded-full bg-teal/10 px-3 py-1 text-sm font-semibold text-[#0b6f69]">
                      Skor {Math.round(attempt.score)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-ink/10 bg-surface p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
