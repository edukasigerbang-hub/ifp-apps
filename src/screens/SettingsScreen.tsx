import { useEffect, useState } from "react";
import { PageHeader } from "../components/ui/PageHeader";
import { canPersistLocally } from "../data/learningRepository";
import { getSyncStatus, isSyncConfigured, runSyncOnce, type SyncStatus } from "../data/syncEngine";

type PageState =
  | { status: "loading" }
  | { status: "ready"; sync: SyncStatus }
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

export function SettingsScreen() {
  const [state, setState] = useState<PageState>({ status: "loading" });
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const configured = isSyncConfigured();

  async function refresh() {
    try {
      const sync = await getSyncStatus();
      setState({ status: "ready", sync });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Status sinkronisasi tidak dapat dibaca."
      });
    }
  }

  useEffect(() => {
    if (!canPersistLocally()) {
      setState({ status: "preview" });
      return;
    }
    void refresh();
  }, []);

  async function syncNow() {
    setRunning(true);
    setMessage(null);
    try {
      const result = await runSyncOnce();
      setMessage(result.message);
      await refresh();
    } finally {
      setRunning(false);
    }
  }

  const waiting =
    state.status === "ready" ? state.sync.pending + state.sync.failed : 0;

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Pengaturan"
        description="Preferensi perangkat dan status sinkronisasi hasil belajar."
      />

      <section className="mt-6 rounded-card border border-ink/10 bg-surface p-5 md:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">Sinkronisasi hasil belajar</h2>

        {state.status === "loading" && <p className="mt-3 text-sm text-muted">Memuat status…</p>}

        {state.status === "preview" && (
          <p className="mt-3 rounded-control border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
            Sinkronisasi hanya tersedia di aplikasi desktop (Tauri). Pratinjau browser tidak memiliki database lokal.
          </p>
        )}

        {state.status === "error" && (
          <p className="mt-3 rounded-control border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
            {state.message}
          </p>
        )}

        {state.status === "ready" && (
          <>
            <dl className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-control bg-paper px-4 py-3">
                <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Menunggu</dt>
                <dd className="mt-1 text-2xl font-semibold">{state.sync.pending}</dd>
              </div>
              <div className="rounded-control bg-paper px-4 py-3">
                <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Gagal / retry</dt>
                <dd className="mt-1 text-2xl font-semibold">{state.sync.failed}</dd>
              </div>
              <div className="rounded-control bg-paper px-4 py-3">
                <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Tersinkron</dt>
                <dd className="mt-1 text-2xl font-semibold">{state.sync.acknowledged}</dd>
              </div>
            </dl>

            <p className="mt-3 text-sm text-muted">
              Percobaan berikutnya: {formatDate(state.sync.nextAttemptAt)}
            </p>

            {!configured && (
              <p className="mt-3 rounded-control border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
                Backend sinkronisasi belum dikonfigurasi. Set <code>VITE_SYNC_BASE_URL</code> dan{" "}
                <code>VITE_SYNC_TOKEN</code> saat menjalankan aplikasi.
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void syncNow()}
                disabled={running || !configured || waiting === 0}
                className="min-h-11 rounded-control bg-primary px-5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {running ? "Menyinkronkan…" : "Sinkronkan sekarang"}
              </button>
              <p aria-live="polite" className="text-sm text-muted">
                {message ?? ""}
              </p>
            </div>
          </>
        )}
      </section>

      <section className="mt-6 rounded-card border border-ink/10 bg-surface p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">Preferensi lain</h2>
        <p className="mt-3 text-sm text-muted">
          Preferensi tampilan, audio, animasi, dan ekspor diagnostik belum diimplementasikan.
        </p>
      </section>
    </div>
  );
}
