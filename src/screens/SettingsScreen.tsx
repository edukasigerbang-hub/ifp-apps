import { useEffect, useState } from "react";
import { PageHeader } from "../components/ui/PageHeader";
import { canPersistLocally } from "../data/learningRepository";
import {
  exportBackup,
  inspectBackup,
  pickBackupDestination,
  pickBackupSource,
  restoreBackup,
  type BackupSummary
} from "../data/backupRepository";
import { exportDiagnostics, pickDiagnosticsDestination } from "../data/diagnosticsRepository";
import {
  createProfile,
  deleteProfile,
  getActiveProfile,
  listProfiles,
  renameProfile,
  setActiveProfile,
  type Profile
} from "../data/profileRepository";
import {
  applyPreferences,
  getPreferences,
  setPreferences,
  type Preferences
} from "../data/preferencesRepository";
import { getSyncStatus, isSyncConfigured, runSyncOnce, type SyncStatus } from "../data/syncEngine";

type PageState =
  | { status: "loading" }
  | { status: "ready"; sync: SyncStatus }
  | { status: "preview" }
  | { status: "error"; message: string };

interface DeleteCandidate {
  profile: Profile;
  requiresData: boolean;
  message: string | null;
}

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

function profileErrorDetails(caught: unknown): { code?: string; message: string } {
  if (caught && typeof caught === "object") {
    const typed = caught as { code?: unknown; message?: unknown };
    return {
      code: typeof typed.code === "string" ? typed.code : undefined,
      message:
        typeof typed.message === "string" ? typed.message : "Profil gagal diproses."
    };
  }
  return { message: "Profil gagal diproses." };
}

export function SettingsScreen() {
  const [state, setState] = useState<PageState>({ status: "loading" });
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const configured = isSyncConfigured();
  const desktop = canPersistLocally();
  const [backupSummary, setBackupSummary] = useState<BackupSummary | null>(null);
  const [backupCandidate, setBackupCandidate] = useState<BackupSummary | null>(null);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const [backupError, setBackupError] = useState<string | null>(null);
  const [backupBusy, setBackupBusy] = useState(false);
  const [diagnosticsBusy, setDiagnosticsBusy] = useState(false);
  const [diagnosticsMessage, setDiagnosticsMessage] = useState<string | null>(null);
  const [diagnosticsError, setDiagnosticsError] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfileState] = useState<Profile | null>(null);
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileType, setNewProfileType] = useState<"student" | "teacher">("student");
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteCandidate, setDeleteCandidate] = useState<DeleteCandidate | null>(null);
  const [preferences, setPreferencesState] = useState<Preferences | null>(null);
  const [preferencesMessage, setPreferencesMessage] = useState<string | null>(null);
  const [preferencesError, setPreferencesError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!desktop) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const active = await getActiveProfile();
        const [profileList, prefs] = await Promise.all([listProfiles(), getPreferences()]);
        if (!cancelled) {
          setProfiles(profileList);
          setActiveProfileState(active);
          setPreferencesState(prefs);
          applyPreferences(prefs);
        }
      } catch (caught) {
        if (!cancelled) {
          setProfileError(caught instanceof Error ? caught.message : "Profil tidak dapat dimuat.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [desktop]);

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

  async function handleBackupExport() {
    setBackupError(null);
    setBackupMessage(null);
    try {
      const destination = await pickBackupDestination(`ifp-backup-${new Date().toISOString().slice(0, 10)}.db`);
      if (!destination) return;
      setBackupBusy(true);
      const summary = await exportBackup(destination);
      setBackupSummary(summary);
      setBackupCandidate(null);
      setBackupMessage(`Backup dibuat: ${summary.path}`);
    } catch (caught) {
      setBackupError(caught instanceof Error ? caught.message : "Backup gagal dibuat.");
    } finally {
      setBackupBusy(false);
    }
  }

  async function handleBackupInspect() {
    setBackupError(null);
    setBackupMessage(null);
    try {
      const path = await pickBackupSource();
      if (!path) return;
      setBackupBusy(true);
      const summary = await inspectBackup(path);
      setBackupCandidate(summary);
      setBackupSummary(null);
      setBackupMessage("Backup valid. Periksa ringkasan sebelum memulihkan.");
    } catch (caught) {
      setBackupError(caught instanceof Error ? caught.message : "Backup tidak valid.");
    } finally {
      setBackupBusy(false);
    }
  }

  async function handleBackupRestore() {
    if (!backupCandidate) return;
    setBackupError(null);
    setBackupMessage(null);
    setBackupBusy(true);
    try {
      await restoreBackup(backupCandidate.path);
      setBackupCandidate(null);
      setBackupMessage("Restore selesai. Tutup lalu jalankan ulang aplikasi.");
      await refresh();
    } catch (caught) {
      setBackupError(caught instanceof Error ? caught.message : "Restore gagal.");
    } finally {
      setBackupBusy(false);
    }
  }

  async function handleDiagnosticsExport() {
    setDiagnosticsError(null);
    setDiagnosticsMessage(null);
    try {
      const destination = await pickDiagnosticsDestination(
        `ifp-diagnostics-${new Date().toISOString().slice(0, 10)}.json`
      );
      if (!destination) return;
      setDiagnosticsBusy(true);
      const summary = await exportDiagnostics(destination);
      setDiagnosticsMessage(`Diagnostik diekspor: ${summary.path} (${summary.bytes} byte)`);
    } catch (caught) {
      setDiagnosticsError(caught instanceof Error ? caught.message : "Ekspor diagnostik gagal.");
    } finally {
      setDiagnosticsBusy(false);
    }
  }

  async function reloadProfiles() {
    const [profileList, active] = await Promise.all([listProfiles(), getActiveProfile()]);
    setProfiles(profileList);
    setActiveProfileState(active);
  }

  async function handleCreateProfile() {
    setProfileError(null);
    setProfileMessage(null);
    setProfileBusy(true);
    try {
      const created = await createProfile(newProfileName, newProfileType);
      await setActiveProfile(created.id);
      await reloadProfiles();
      setNewProfileName("");
      setProfileMessage(`Profil "${created.displayName}" dibuat dan diaktifkan.`);
    } catch (caught) {
      setProfileError(profileErrorDetails(caught).message);
    } finally {
      setProfileBusy(false);
    }
  }

  async function handleSelectProfile(profileId: string) {
    setProfileError(null);
    setProfileMessage(null);
    setProfileBusy(true);
    try {
      const active = await setActiveProfile(profileId);
      setActiveProfileState(active);
      setProfileMessage(`Profil aktif: ${active.displayName}.`);
    } catch (caught) {
      setProfileError(profileErrorDetails(caught).message);
    } finally {
      setProfileBusy(false);
    }
  }

  function startRename(profile: Profile) {
    setProfileError(null);
    setProfileMessage(null);
    setDeleteCandidate(null);
    setRenamingId(profile.id);
    setRenameValue(profile.displayName);
  }

  async function handleRename() {
    if (!renamingId) return;
    setProfileError(null);
    setProfileMessage(null);
    setProfileBusy(true);
    try {
      const renamed = await renameProfile(renamingId, renameValue);
      await reloadProfiles();
      setRenamingId(null);
      setRenameValue("");
      setProfileMessage(`Nama profil diperbarui menjadi "${renamed.displayName}".`);
    } catch (caught) {
      setProfileError(profileErrorDetails(caught).message);
    } finally {
      setProfileBusy(false);
    }
  }

  async function handleDeleteProfile(profile: Profile, deleteData: boolean) {
    setProfileError(null);
    setProfileMessage(null);
    setProfileBusy(true);
    try {
      const result = await deleteProfile(profile.id, deleteData);
      await reloadProfiles();
      setDeleteCandidate(null);
      if (renamingId === profile.id) {
        setRenamingId(null);
      }
      setProfileMessage(
        `Profil "${profile.displayName}" dihapus. Profil aktif: ${result.activeProfile.displayName}.`
      );
    } catch (caught) {
      const details = profileErrorDetails(caught);
      if (details.code === "PROFILE_HAS_DATA") {
        setDeleteCandidate({ profile, requiresData: true, message: details.message });
      } else {
        setDeleteCandidate(null);
        setProfileError(details.message);
      }
    } finally {
      setProfileBusy(false);
    }
  }

  async function handlePreferences(next: Preferences) {
    setPreferencesError(null);
    setPreferencesMessage(null);
    setPreferencesState(next);
    applyPreferences(next);
    try {
      await setPreferences(next);
      setPreferencesMessage("Preferensi disimpan.");
    } catch (caught) {
      setPreferencesError(caught instanceof Error ? caught.message : "Preferensi gagal disimpan.");
    }
  }

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Pengaturan"
        description="Profil, preferensi perangkat, dan status sinkronisasi hasil belajar."
      />

      {desktop && (
        <section className="mt-6 rounded-card border border-ink/10 bg-surface p-5 md:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">Profil</h2>
          <p className="mt-3 text-sm text-muted">
            Profil aktif menentukan sesi dan hasil belajar yang ditampilkan di perangkat ini.
          </p>

          {profiles.length > 0 && (
            <ul className="mt-3 space-y-2">
              {profiles.map((profile) => {
                const active = activeProfile?.id === profile.id;
                const isRenaming = renamingId === profile.id;
                const candidate =
                  deleteCandidate?.profile.id === profile.id ? deleteCandidate : null;
                return (
                  <li
                    key={profile.id}
                    className="rounded-control border border-ink/10 bg-paper/60"
                  >
                    <div className="flex flex-wrap items-center gap-2 p-2">
                      <button
                        type="button"
                        aria-pressed={active}
                        disabled={profileBusy || isRenaming}
                        onClick={() => void handleSelectProfile(profile.id)}
                        className={`min-h-11 flex-1 rounded-control px-3 py-2 text-left disabled:opacity-60 ${
                          active
                            ? "bg-navy text-white"
                            : "border border-ink/15 bg-surface hover:bg-paper"
                        }`}
                      >
                        <span className="block text-sm font-medium">{profile.displayName}</span>
                        <span
                          className={`block text-xs ${active ? "text-white/70" : "text-muted"}`}
                        >
                          {profile.profileType === "teacher" ? "Guru" : "Siswa"}
                        </span>
                      </button>

                      {isRenaming ? (
                        <form
                          className="flex flex-wrap items-center gap-2"
                          onSubmit={(event) => {
                            event.preventDefault();
                            void handleRename();
                          }}
                        >
                          <input
                            type="text"
                            value={renameValue}
                            autoFocus
                            aria-label={`Nama baru untuk ${profile.displayName}`}
                            onChange={(event) => setRenameValue(event.target.value)}
                            className="min-h-11 w-48 rounded-control border border-ink/15 px-3 text-sm"
                          />
                          <button
                            type="submit"
                            disabled={profileBusy || renameValue.trim().length === 0}
                            className="min-h-11 rounded-control bg-primary px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
                          >
                            Simpan
                          </button>
                          <button
                            type="button"
                            onClick={() => setRenamingId(null)}
                            disabled={profileBusy}
                            className="min-h-11 rounded-control border border-ink/15 px-4 text-sm font-medium hover:bg-paper disabled:opacity-40"
                          >
                            Batal
                          </button>
                        </form>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startRename(profile)}
                            disabled={profileBusy}
                            className="min-h-11 rounded-control border border-ink/15 px-4 text-sm font-medium hover:bg-paper disabled:opacity-40"
                          >
                            Ubah nama
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteCandidate({ profile, requiresData: false, message: null })
                            }
                            disabled={profileBusy || profiles.length <= 1}
                            title={
                              profiles.length <= 1
                                ? "Profil terakhir tidak dapat dihapus"
                                : undefined
                            }
                            className="min-h-11 rounded-control border border-danger/40 px-4 text-sm font-medium text-danger hover:bg-danger/5 disabled:opacity-40"
                          >
                            Hapus
                          </button>
                        </div>
                      )}
                    </div>

                    {candidate && (
                      <div className="border-t border-ink/10 p-3">
                        {candidate.requiresData ? (
                          <p className="text-sm text-danger">{candidate.message}</p>
                        ) : (
                          <p className="text-sm">
                            Hapus profil "{profile.displayName}"? Tindakan ini tidak dapat
                            dibatalkan.
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => void handleDeleteProfile(profile, candidate.requiresData)}
                            disabled={profileBusy}
                            className="min-h-11 rounded-control bg-danger px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
                          >
                            {candidate.requiresData ? "Hapus profil dan data" : "Hapus"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteCandidate(null)}
                            disabled={profileBusy}
                            className="min-h-11 rounded-control border border-ink/15 px-4 text-sm font-medium hover:bg-paper disabled:opacity-40"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="text-sm">
              Nama profil
              <input
                type="text"
                value={newProfileName}
                onChange={(event) => setNewProfileName(event.target.value)}
                placeholder="Nama siswa atau guru"
                className="mt-1 block min-h-11 w-64 rounded-control border border-ink/15 px-3 text-sm"
              />
            </label>
            <label className="text-sm">
              Tipe
              <select
                value={newProfileType}
                onChange={(event) => setNewProfileType(event.target.value as "student" | "teacher")}
                className="mt-1 block min-h-11 rounded-control border border-ink/15 px-3 text-sm"
              >
                <option value="student">Siswa</option>
                <option value="teacher">Guru</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => void handleCreateProfile()}
              disabled={profileBusy || newProfileName.trim().length === 0}
              className="min-h-11 rounded-control bg-primary px-5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
            >
              Tambah profil
            </button>
          </div>

          <p aria-live="polite" className="mt-3 text-sm text-muted">
            {profileMessage ?? ""}
          </p>
          {profileError && (
            <p className="mt-3 rounded-control border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
              {profileError}
            </p>
          )}
        </section>
      )}

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
            <p className="mt-1 text-xs text-muted">
              Sinkronisasi otomatis dicoba saat aplikasi dibuka, saat kembali online, dan setiap 5 menit.
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

      {desktop && (
        <section className="mt-6 rounded-card border border-ink/10 bg-surface p-5 md:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">Backup & Restore</h2>
          <p className="mt-3 text-sm text-muted">
            Backup berisi database lokal: profil, sesi, hasil belajar, outbox, dan lisensi. Konten impor tidak
            disertakan karena dapat diimpor ulang.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleBackupExport()}
              disabled={backupBusy}
              className="min-h-11 rounded-control bg-primary px-5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
            >
              Buat backup…
            </button>
            <button
              type="button"
              onClick={() => void handleBackupInspect()}
              disabled={backupBusy}
              className="min-h-11 rounded-control border border-ink/15 px-5 text-sm font-medium hover:bg-paper disabled:opacity-40"
            >
              Pilih file backup…
            </button>
          </div>

          <p aria-live="polite" className="mt-3 text-sm text-muted">
            {backupMessage ?? ""}
          </p>
          {backupError && (
            <p className="mt-3 rounded-control border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
              {backupError}
            </p>
          )}

          {backupSummary && <BackupCountsView summary={backupSummary} title="Backup dibuat" />}

          {backupCandidate && (
            <div className="mt-4 rounded-control border border-warning/40 bg-warning/10 p-4">
              <BackupCountsView summary={backupCandidate} title="Backup akan dipulihkan" />
              <p className="mt-2 text-xs">
                Restore menimpa database saat ini. Tutup dan jalankan ulang aplikasi setelah selesai.
              </p>
              <button
                type="button"
                onClick={() => void handleBackupRestore()}
                disabled={backupBusy}
                className="mt-3 min-h-11 rounded-control bg-danger px-5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
              >
                Pulihkan data
              </button>
            </div>
          )}
        </section>
      )}

      <section className="mt-6 rounded-card border border-ink/10 bg-surface p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">Preferensi & diagnostik</h2>
        {preferences && (
          <div className="mt-4 space-y-3">
            <label className="flex min-h-11 items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={preferences.reducedMotion}
                onChange={(event) =>
                  void handlePreferences({ ...preferences, reducedMotion: event.target.checked })
                }
                className="h-4 w-4"
              />
              Kurangi animasi
            </label>
            <label className="flex min-h-11 items-center gap-3 text-sm">
              Ukuran teks
              <select
                value={preferences.fontScale}
                onChange={(event) =>
                  void handlePreferences({
                    ...preferences,
                    fontScale: event.target.value as "normal" | "large"
                  })
                }
                className="min-h-11 rounded-control border border-ink/15 px-3 text-sm"
              >
                <option value="normal">Normal</option>
                <option value="large">Besar</option>
              </select>
            </label>
            <p aria-live="polite" className="text-sm text-muted">
              {preferencesMessage ?? ""}
            </p>
            {preferencesError && (
              <p className="rounded-control border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
                {preferencesError}
              </p>
            )}
          </div>
        )}
        <p className="mt-3 text-xs text-muted">
          Preferensi suara dan animasi lanjutan belum tersedia.
        </p>
        {desktop && (
          <>
            <button
              type="button"
              onClick={() => void handleDiagnosticsExport()}
              disabled={diagnosticsBusy}
              className="mt-4 min-h-11 rounded-control border border-ink/15 px-5 text-sm font-medium hover:bg-paper disabled:opacity-40"
            >
              Ekspor diagnostik…
            </button>
            <p className="mt-2 text-xs text-muted">
              Diagnostik memuat versi aplikasi, OS, jumlah data, status sinkronisasi/lisensi (ID perangkat
              disamarkan); tanpa secret, nama profil, atau payload lisensi.
            </p>
            <p aria-live="polite" className="mt-2 text-sm text-muted">
              {diagnosticsMessage ?? ""}
            </p>
            {diagnosticsError && (
              <p className="mt-2 rounded-control border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
                {diagnosticsError}
              </p>
            )}
          </>
        )}
      </section>

      <section className="mt-6 rounded-card border border-ink/10 bg-surface p-5 md:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">
          Privasi &amp; data
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          <li>
            Nama profil, hasil belajar, dan review disimpan hanya di perangkat ini (tanpa akun
            terpusat).
          </li>
          <li>
            Backup dan ekspor CSV berisi nama profil/reviewer. File yang sudah diekspor tidak ikut
            terhapus saat profil dihapus.
          </li>
          <li>
            Hapus profil di bagian Profil untuk menghapus sesi dan hasil terkait; profil yang
            memiliki riwayat review tidak dapat dihapus.
          </li>
          <li>Diagnostik diredaksi: tanpa nama profil, payload lisensi, atau secret.</li>
          <li>
            Default retensi: data disimpan sampai dihapus eksplisit; belum ada pemangkasan otomatis.
            Kebijakan resmi masih menunggu persetujuan OD-4 (legal/privasi).
          </li>
        </ul>
      </section>
    </div>
  );
}

function BackupCountsView({ summary, title }: { summary: BackupSummary; title: string }) {
  return (
    <div className="mt-4 rounded-control bg-paper p-4 text-sm">
      <p className="font-medium">{title}</p>
      <p className="mt-1 break-all text-xs text-muted">{summary.path}</p>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <div>
          <dt className="text-muted">Profil</dt>
          <dd className="font-semibold">{summary.counts.profiles}</dd>
        </div>
        <div>
          <dt className="text-muted">Sesi</dt>
          <dd className="font-semibold">{summary.counts.sessions}</dd>
        </div>
        <div>
          <dt className="text-muted">Percobaan</dt>
          <dd className="font-semibold">{summary.counts.attempts}</dd>
        </div>
        <div>
          <dt className="text-muted">Respons</dt>
          <dd className="font-semibold">{summary.counts.responses}</dd>
        </div>
        <div>
          <dt className="text-muted">Progres</dt>
          <dd className="font-semibold">{summary.counts.progress}</dd>
        </div>
        <div>
          <dt className="text-muted">Outbox</dt>
          <dd className="font-semibold">{summary.counts.outbox}</dd>
        </div>
        <div>
          <dt className="text-muted">Lisensi</dt>
          <dd className="font-semibold">{summary.counts.licenses}</dd>
        </div>
      </dl>
    </div>
  );
}
