import { useEffect, useState } from "react";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge, type StatusTone } from "../components/ui/StatusBadge";
import { canPersistLocally } from "../data/learningRepository";
import {
  importPackage,
  listPackages,
  pickContentPackageFolder,
  rollbackPackage,
  type PackageRecord
} from "../data/contentRepository";

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

function statusTone(status: string): StatusTone {
  if (status === "active") return "positive";
  if (status === "disabled" || status === "removed") return "warning";
  return "neutral";
}

export function ContentScreen() {
  const [packages, setPackages] = useState<PackageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const desktop = canPersistLocally();

  async function refresh() {
    const records = await listPackages();
    setPackages(records);
  }

  useEffect(() => {
    if (!desktop) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const records = await listPackages();
        if (!cancelled) setPackages(records);
      } catch (caught) {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "Daftar paket tidak dapat dibaca.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [desktop]);

  async function handleImport() {
    setError(null);
    setMessage(null);
    try {
      const folder = await pickContentPackageFolder();
      if (!folder) return;
      setBusy("Mengimpor dan memvalidasi paket...");
      const result = await importPackage(folder);
      setMessage(
        `Paket ${result.packageId} v${result.version} aktif (${result.files} file, ${Math.round(
          result.bytes / 1024
        )} KB).${result.previousVersion ? ` Versi sebelumnya: ${result.previousVersion}.` : ""}`
      );
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Impor paket gagal.");
    } finally {
      setBusy(null);
    }
  }

  async function handleRollback(packageId: string) {
    setError(null);
    setMessage(null);
    setBusy(`Rollback ${packageId}...`);
    try {
      const result = await rollbackPackage(packageId);
      setMessage(`Rollback berhasil. Versi aktif sekarang ${result.activeVersion}.`);
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Rollback gagal.");
    } finally {
      setBusy(null);
    }
  }

  const hasPrevious = (record: PackageRecord) =>
    record.activatedAt !== null &&
    packages.some(
      (candidate) =>
        candidate.packageId === record.packageId &&
        candidate.status === "disabled" &&
        candidate.source === "imported" &&
        candidate.activatedAt !== null &&
        candidate.activatedAt < record.activatedAt!
    );

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Konten & Pembaruan"
        description="Impor paket konten, validasi, aktivasi atomik, dan rollback."
      />

      {!desktop && (
        <p className="mt-6 rounded-card border border-warning/40 bg-warning/10 p-5 text-sm">
          Pratinjau browser tidak dapat mengimpor paket. Jalankan aplikasi desktop (Tauri).
        </p>
      )}

      <section className="mt-6 rounded-card border border-ink/10 bg-surface p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">Paket terpasang</h2>
          {desktop && (
            <button
              type="button"
              onClick={() => void handleImport()}
              disabled={busy !== null}
              className="min-h-11 rounded-control bg-primary px-5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ?? "Impor paket…"}
            </button>
          )}
        </div>

        <p aria-live="polite" className="mt-3 text-sm text-muted">
          {message ?? ""}
        </p>
        {error && (
          <p className="mt-3 rounded-control border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}

        {loading ? (
          <p className="mt-4 text-sm text-muted">Memuat daftar paket…</p>
        ) : packages.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            Belum ada paket terpasang. Paket bawaan build belum tercatat sampai dipakai dalam sesi belajar.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-ink/10">
            {packages.map((record) => (
              <li
                key={`${record.packageId}-${record.version}`}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {record.packageId} <span className="text-muted">v{record.version}</span>
                  </p>
                  <p className="text-xs text-muted">
                    {record.source} · {formatDate(record.installedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge tone={statusTone(record.status)} label={record.status} />
                  {desktop && record.status === "active" && hasPrevious(record) && (
                    <button
                      type="button"
                      onClick={() => void handleRollback(record.packageId)}
                      disabled={busy !== null}
                      className="min-h-9 rounded-control border border-ink/15 px-3 text-xs font-medium hover:bg-paper disabled:opacity-40"
                    >
                      Rollback
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-4 text-xs text-muted">
          Validasi native mencakup manifest, path, batas ukuran, dan SHA-256 aset. Player masih memuat paket bawaan
          build; paket impor belum otomatis dirender sampai Content Runtime terhubung.
        </p>
      </section>
    </div>
  );
}
