import { useEffect, useState } from "react";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge, type StatusTone } from "../components/ui/StatusBadge";
import { canPersistLocally } from "../data/learningRepository";
import {
  activateOnline,
  exportActivationRequest,
  exportTransferRequest,
  getLicenseStatus,
  importLicenseFile,
  isLicenseServerConfigured,
  pickLicenseFile,
  refreshLicense,
  type LicenseStatus
} from "../data/licenseRepository";

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

function statusTone(status: LicenseStatus): StatusTone {
  if (status.valid) {
    return status.inGrace || status.code === "LICENSE_CLOCK_ROLLBACK" ? "warning" : "positive";
  }
  return status.configured ? "warning" : "neutral";
}

export function LicenseScreen() {
  const [status, setStatus] = useState<LicenseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [request, setRequest] = useState<string | null>(null);
  const [requestKind, setRequestKind] = useState<"activation" | "transfer">("activation");
  const [serial, setSerial] = useState("");
  const [transferReason, setTransferReason] = useState("");
  const desktop = canPersistLocally();

  useEffect(() => {
    if (!desktop) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const current = await getLicenseStatus();
        if (!cancelled) setStatus(current);
      } catch (caught) {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "Status lisensi tidak dapat dibaca.");
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
      const path = await pickLicenseFile();
      if (!path) return;
      setBusy("Memverifikasi lisensi...");
      const current = await importLicenseFile(path);
      setStatus(current);
      setMessage(current.valid ? "Lisensi berhasil diimpor dan diverifikasi." : current.message ?? "Lisensi tidak valid.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Impor lisensi gagal.");
    } finally {
      setBusy(null);
    }
  }

  async function handleRefresh() {
    setBusy("Memeriksa lisensi...");
    setError(null);
    try {
      const current = await refreshLicense();
      setStatus(current);
      setMessage(current.valid ? "Lisensi masih berlaku." : current.message ?? "Lisensi tidak valid.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Pemeriksaan lisensi gagal.");
    } finally {
      setBusy(null);
    }
  }

  async function handleExportRequest() {
    setError(null);
    setMessage(null);
    try {
      const data = await exportActivationRequest();
      setRequestKind("activation");
      setRequest(JSON.stringify(data, null, 2));
      setMessage("Permintaan aktivasi dibuat. Kirim JSON ini ke issuer lisensi.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Permintaan aktivasi gagal dibuat.");
    }
  }

  async function handleTransferRequest() {
    setError(null);
    setMessage(null);
    try {
      const data = await exportTransferRequest(transferReason.trim() || null);
      setRequestKind("transfer");
      setRequest(JSON.stringify(data, null, 2));
      setMessage("Permintaan transfer dibuat. Kirim JSON ini ke admin lisensi.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Permintaan transfer gagal dibuat.");
    }
  }

  async function handleOnlineActivation() {
    setError(null);
    setMessage(null);
    setBusy("Mengaktivasi online...");
    try {
      const current = await activateOnline(serial.trim());
      setStatus(current);
      setMessage(
        current.valid ? "Aktivasi online berhasil dan lisensi diverifikasi." : current.message ?? "Lisensi tidak valid."
      );
      if (current.valid) {
        setSerial("");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Aktivasi online gagal.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Lisensi Perangkat"
        description="Status lisensi diverifikasi pada native layer, bukan dari tampilan UI."
      />

      {!desktop && (
        <p className="mt-6 rounded-card border border-warning/40 bg-warning/10 p-5 text-sm">
          Pratinjau browser tidak memiliki akses lisensi native. Jalankan aplikasi desktop (Tauri).
        </p>
      )}

      {desktop && (
        <>
          <section className="mt-6 rounded-card border border-ink/10 bg-surface p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">Status lisensi</h2>
              {status && (
                <StatusBadge
                  tone={statusTone(status)}
                  label={
                    status.valid
                      ? status.inGrace
                        ? "Berlaku (grace period)"
                        : "Berlaku"
                      : status.configured
                        ? "Tidak valid"
                        : "Belum dikonfigurasi"
                  }
                />
              )}
            </div>

            {loading && <p className="mt-3 text-sm text-muted">Memuat status…</p>}

            {status && !loading && (
              <>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Lisensi</dt>
                    <dd className="mt-1">{status.licenseId ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Jenis</dt>
                    <dd className="mt-1">{status.licenseType ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Berlaku sampai</dt>
                    <dd className="mt-1">{formatDate(status.expiresAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Entitlements</dt>
                    <dd className="mt-1">{status.entitlements.length > 0 ? status.entitlements.join(", ") : "—"}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">ID instalasi</dt>
                    <dd className="mt-1 break-all font-mono text-xs">{status.machineId}</dd>
                  </div>
                </dl>

                {status.message && (
                  <p className="mt-3 rounded-control border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
                    {status.code ? `${status.code}: ` : ""}
                    {status.message}
                  </p>
                )}
              </>
            )}

            <p aria-live="polite" className="mt-3 text-sm text-muted">
              {message ?? ""}
            </p>
            {error && (
              <p className="mt-3 rounded-control border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
                {error}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void handleImport()}
                disabled={busy !== null}
                className="min-h-11 rounded-control bg-primary px-5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
              >
                {busy ?? "Impor file lisensi…"}
              </button>
              <button
                type="button"
                onClick={() => void handleRefresh()}
                disabled={busy !== null}
                className="min-h-11 rounded-control border border-ink/15 px-5 text-sm font-medium hover:bg-paper disabled:opacity-40"
              >
                Periksa ulang
              </button>
              <button
                type="button"
                onClick={() => void handleExportRequest()}
                disabled={busy !== null}
                className="min-h-11 rounded-control border border-ink/15 px-5 text-sm font-medium hover:bg-paper disabled:opacity-40"
              >
                Ekspor permintaan aktivasi
              </button>
            </div>
          </section>

          {request && (
            <section className="mt-6 rounded-card border border-ink/10 bg-surface p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">
                {requestKind === "transfer" ? "Permintaan transfer perangkat" : "Permintaan aktivasi offline"}
              </h2>
              <pre className="mt-3 overflow-x-auto rounded-control bg-paper p-4 text-xs">{request}</pre>
              <p className="mt-3 text-xs text-muted">
                {requestKind === "transfer"
                  ? "Kirim JSON ini ke admin lisensi. Perangkat lama akan dinonaktifkan saat transfer diproses."
                  : "Kirim JSON ini ke issuer lisensi. File lisensi bertanda tangan diimpor kembali lewat tombol di atas."}
              </p>
            </section>
          )}

          <section className="mt-6 rounded-card border border-ink/10 bg-surface p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">Transfer perangkat</h2>
            <p className="mt-3 text-sm text-muted">
              Minta admin memindahkan lisensi ke perangkat pengganti. Permintaan ini tidak mengubah
              lisensi sampai diproses server.
            </p>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <label className="text-sm">
                Alasan (opsional)
                <input
                  type="text"
                  value={transferReason}
                  onChange={(event) => setTransferReason(event.target.value)}
                  maxLength={500}
                  className="mt-1 block min-h-11 w-64 rounded-control border border-ink/15 px-3 text-sm"
                />
              </label>
              <button
                type="button"
                onClick={() => void handleTransferRequest()}
                disabled={busy !== null || !status?.valid}
                className="min-h-11 rounded-control border border-ink/15 px-5 text-sm font-medium hover:bg-paper disabled:opacity-40"
              >
                Ekspor permintaan transfer…
              </button>
            </div>
            {!status?.valid && (
              <p className="mt-2 text-xs text-muted">
                Permintaan transfer memerlukan lisensi yang valid.
              </p>
            )}
          </section>

          <section className="mt-6 rounded-card border border-ink/10 bg-surface p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">Aktivasi online</h2>
            {isLicenseServerConfigured() ? (
              <>
                <div className="mt-3 flex flex-wrap items-end gap-3">
                  <label className="text-sm">
                    Serial perangkat
                    <input
                      type="text"
                      value={serial}
                      onChange={(event) => setSerial(event.target.value)}
                      placeholder="DEV-SERIAL-1"
                      className="mt-1 block min-h-11 w-64 rounded-control border border-ink/15 px-3 font-mono text-sm"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => void handleOnlineActivation()}
                    disabled={busy !== null || serial.trim().length === 0}
                    className="min-h-11 rounded-control bg-primary px-5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
                  >
                    Aktivasi online
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted">
                  Serial dikirim ke server referensi; lisensi ditandatangani server dan diverifikasi ulang secara native.
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-muted">
                Server lisensi belum dikonfigurasi (<code>VITE_LICENSE_SERVER_URL</code>). Gunakan aktivasi offline.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
