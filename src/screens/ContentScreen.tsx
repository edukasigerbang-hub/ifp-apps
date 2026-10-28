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
import { getActiveProfile, type Profile } from "../data/profileRepository";
import {
  getCatalogConfig,
  installMaterialBundle,
  installMaterialFromCatalog,
  listInstalledMaterials,
  listMaterialCatalog,
  openInstalledMaterial,
  openSampleMaterial,
  pickMaterialBundle,
  setCatalogConfig as saveCatalogConfig,
  type CatalogItem,
  type CatalogPage,
  type InstalledMaterial,
  type MaterialCatalogConfig,
  type MaterialView
} from "../data/materialRepository";
import { subjectKeys, subjectLabel } from "../content/subjectLabel";
import { MaterialViewer } from "../components/material/MaterialViewer";
import { MaterialCover } from "../components/material/MaterialCover";
import {
  listPinnedMaterials,
  pinnedErrorMessage,
  setPinnedMaterial
} from "../data/pinnedRepository";
import { resolvePackageDigest } from "../data/reviewDigest";
import {
  exportReviewsCsv,
  listReviews,
  pickReviewExportDestination,
  recordReview,
  type ContentReview,
  type ReviewDecision
} from "../data/reviewRepository";

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
  const [reviews, setReviews] = useState<ContentReview[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [reviewPackageIndex, setReviewPackageIndex] = useState("0");
  const [reviewDecision, setReviewDecision] = useState<ReviewDecision>("approved");
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewExportBusy, setReviewExportBusy] = useState(false);
  const [material, setMaterial] = useState<MaterialView | null>(null);
  const [materialBusy, setMaterialBusy] = useState(false);
  const [materialError, setMaterialError] = useState<string | null>(null);
  const [materialMessage, setMaterialMessage] = useState<string | null>(null);
  const [installedMaterials, setInstalledMaterials] = useState<InstalledMaterial[]>([]);
  const [openingMaterialId, setOpeningMaterialId] = useState<string | null>(null);
  const [pinnedMaterialIds, setPinnedMaterialIds] = useState<string[]>([]);
  const [pinBusyId, setPinBusyId] = useState<string | null>(null);
  const [pinMessage, setPinMessage] = useState<string | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [catalogConfig, setCatalogConfig] = useState<MaterialCatalogConfig | null>(null);
  // null = belum disunting; memakai nilai tersimpan. Mencegah hasil muat awal
  // menimpa teks yang sudah diketik pengguna.
  const [catalogUrlDraft, setCatalogUrlDraft] = useState<string | null>(null);
  const [catalogUrlBusy, setCatalogUrlBusy] = useState(false);
  const [catalogGrade, setCatalogGrade] = useState("");
  const [catalogSubject, setCatalogSubject] = useState("");
  const [catalogPage, setCatalogPage] = useState<CatalogPage | null>(null);
  const [catalogBusy, setCatalogBusy] = useState(false);
  const [catalogInstallingId, setCatalogInstallingId] = useState<string | null>(null);
  const [catalogMessage, setCatalogMessage] = useState<string | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
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
        const [records, reviewRecords, profile, materials, catalog] = await Promise.all([
          listPackages(),
          listReviews(),
          getActiveProfile(),
          listInstalledMaterials(),
          getCatalogConfig()
        ]);
        const pins = profile ? await listPinnedMaterials(profile.id) : [];
        if (!cancelled) {
          setPackages(records);
          setReviews(reviewRecords);
          setActiveProfile(profile);
          setInstalledMaterials(materials);
          setCatalogConfig(catalog);
          setPinnedMaterialIds(pins.map((item) => item.materialId));
        }
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

  async function handleRecordReview() {
    setReviewError(null);
    setReviewMessage(null);
    const selected = packages[Number(reviewPackageIndex)];
    if (!selected) {
      setReviewError("Tidak ada paket untuk direview.");
      return;
    }
    setReviewBusy(true);
    try {
      const contentSha256 = await resolvePackageDigest(selected);
      const review = await recordReview({
        packageId: selected.packageId,
        packageVersion: selected.version,
        decision: reviewDecision,
        notes: reviewNotes.trim() ? reviewNotes.trim() : null,
        contentSha256
      });
      setReviews(await listReviews());
      setReviewNotes("");
      setReviewMessage(
        `Review ${review.decision === "approved" ? "setuju" : "tolak"} tercatat untuk ` +
          `${review.packageId} v${review.packageVersion} (isi ${contentSha256.slice(0, 8)}).`
      );
    } catch (caught) {
      const typed = caught as { message?: string };
      setReviewError(typed?.message ?? "Review gagal dicatat.");
    } finally {
      setReviewBusy(false);
    }
  }

  async function handleExportReviews() {
    setReviewError(null);
    setReviewMessage(null);
    try {
      const destination = await pickReviewExportDestination(
        `ifp-review-audit-${new Date().toISOString().slice(0, 10)}.csv`
      );
      if (!destination) return;
      setReviewExportBusy(true);
      const summary = await exportReviewsCsv(destination);
      setReviewMessage(
        `Audit review diekspor: ${summary.rows} baris (${summary.bytes} byte) ke ${summary.path}.`
      );
    } catch (caught) {
      const typed = caught as { message?: string };
      setReviewError(typed?.message ?? "Ekspor audit review gagal.");
    } finally {
      setReviewExportBusy(false);
    }
  }

  async function handleOpenMaterial() {
    setMaterialError(null);
    setMaterialBusy(true);
    try {
      setMaterial(await openSampleMaterial());
    } catch (caught) {
      const typed = caught as { message?: string };
      setMaterialError(typed?.message ?? "Materi contoh tidak dapat dibuka.");
    } finally {
      setMaterialBusy(false);
    }
  }

  async function handleInstallMaterial() {
    setMaterialError(null);
    setMaterialMessage(null);
    try {
      const bundlePath = await pickMaterialBundle();
      if (!bundlePath) return;
      setMaterialBusy(true);
      const result = await installMaterialBundle(bundlePath);
      setMaterialMessage(
        `Materi “${result.title}” v${result.version} terpasang (${result.files} berkas, ${Math.round(
          result.bytes / 1024
        )} KB).${result.previousVersion ? ` Versi sebelumnya: ${result.previousVersion}.` : ""}`
      );
      setInstalledMaterials(await listInstalledMaterials());
    } catch (caught) {
      const typed = caught as { message?: string };
      setMaterialError(typed?.message ?? "Bundel materi gagal dipasang.");
    } finally {
      setMaterialBusy(false);
    }
  }

  async function handleOpenInstalled(materialId: string) {
    setMaterialError(null);
    setOpeningMaterialId(materialId);
    try {
      setMaterial(await openInstalledMaterial(materialId));
    } catch (caught) {
      const typed = caught as { message?: string };
      setMaterialError(typed?.message ?? "Materi terpasang tidak dapat dibuka.");
    } finally {
      setOpeningMaterialId(null);
    }
  }

  async function handleTogglePin(record: InstalledMaterial) {
    if (!activeProfile) {
      setPinError("Pilih profil aktif dulu di Beranda sebelum menyematkan materi.");
      return;
    }
    setPinError(null);
    setPinMessage(null);
    const pinned = pinnedMaterialIds.includes(record.materialId);
    setPinBusyId(record.materialId);
    try {
      await setPinnedMaterial({
        profileId: activeProfile.id,
        materialId: record.materialId,
        pinned: !pinned
      });
      const next = await listPinnedMaterials(activeProfile.id);
      setPinnedMaterialIds(next.map((item) => item.materialId));
      setPinMessage(
        pinned
          ? `“${record.title}” dilepas dari Beranda.`
          : `“${record.title}” disematkan ke Beranda.`
      );
    } catch (caught) {
      setPinError(pinnedErrorMessage(caught));
    } finally {
      setPinBusyId(null);
    }
  }

  const canReview = activeProfile?.profileType === "teacher";

  function catalogFilters() {
    return {
      grade: catalogGrade ? Number(catalogGrade) : null,
      subject: catalogSubject || null
    };
  }

  const catalogUrlValue = catalogUrlDraft ?? catalogConfig?.baseUrl ?? "";

  async function handleSaveCatalogUrl() {
    setCatalogError(null);
    setCatalogMessage(null);
    setCatalogUrlBusy(true);
    try {
      const config = await saveCatalogConfig(catalogUrlValue.trim());
      setCatalogConfig(config);
      setCatalogUrlDraft(null);
      setCatalogMessage(
        config.baseUrl ? `Alamat katalog disimpan: ${config.baseUrl}` : "Alamat katalog dikosongkan."
      );
    } catch (caught) {
      const typed = caught as { message?: string };
      setCatalogError(typed?.message ?? "Alamat katalog tidak dapat disimpan.");
    } finally {
      setCatalogUrlBusy(false);
    }
  }

  async function handleLoadCatalog() {
    setCatalogError(null);
    setCatalogMessage(null);
    setCatalogBusy(true);
    try {
      const page = await listMaterialCatalog({ ...catalogFilters(), limit: 50 });
      setCatalogPage(page);
      setCatalogMessage(
        page.items.length === 0
          ? "Tidak ada materi untuk filter ini."
          : `${page.items.length} materi daring ditemukan.`
      );
    } catch (caught) {
      const typed = caught as { message?: string };
      setCatalogPage(null);
      setCatalogError(typed?.message ?? "Katalog daring tidak dapat dimuat.");
    } finally {
      setCatalogBusy(false);
    }
  }

  async function handleInstallFromCatalog(item: CatalogItem) {
    setCatalogError(null);
    setCatalogMessage(null);
    setCatalogInstallingId(item.materialId);
    try {
      const result = await installMaterialFromCatalog(item.materialId, item.version, {
        ...catalogFilters(),
        limit: 50
      });
      setMaterialMessage(
        `Materi “${result.title}” v${result.version} terpasang dari katalog (${result.files} berkas, ` +
          `${Math.round(result.bytes / 1024)} KB).${
            result.previousVersion ? ` Versi sebelumnya: ${result.previousVersion}.` : ""
          }`
      );
      setInstalledMaterials(await listInstalledMaterials());
      setCatalogPage((current) =>
        current
          ? {
              ...current,
              items: current.items.map((candidate) =>
                candidate.materialId === item.materialId
                  ? { ...candidate, installedVersion: result.version }
                  : candidate
              )
            }
          : current
      );
      setCatalogMessage(`“${result.title}” v${result.version} terpasang.`);
    } catch (caught) {
      const typed = caught as { message?: string };
      setCatalogError(typed?.message ?? "Materi daring gagal dipasang.");
    } finally {
      setCatalogInstallingId(null);
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
    <div className="mx-auto w-full max-w-4xl">
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
          <p className="mt-3 rounded-control border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger-strong">
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
                      className="min-h-11 rounded-control border border-ink/15 px-3 text-xs font-medium hover:bg-paper disabled:opacity-40"
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
          Validasi native mencakup manifest, path, batas ukuran, dan SHA-256 aset. Player memakai paket impor aktif
          (managed-first); rollback mengembalikan versi sebelumnya.
        </p>
      </section>

      <section className="mt-6 rounded-card border border-ink/10 bg-surface p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">
            Materi HTML5 (prototipe)
          </h2>
          {desktop && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                data-material-import
                onClick={() => void handleInstallMaterial()}
                disabled={materialBusy}
                className="min-h-11 rounded-control bg-primary px-5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {materialBusy ? "Memproses…" : "Impor bundel materi…"}
              </button>
              <button
                type="button"
                data-material-open
                onClick={() => void handleOpenMaterial()}
                disabled={materialBusy}
                className="min-h-11 rounded-control border border-ink/15 px-5 text-sm font-medium hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40"
              >
                Buka contoh materi HTML5
              </button>
            </div>
          )}
        </div>
        <p className="mt-3 text-sm text-muted">
          Impor bundel <code>.zip</code> beserta berkas tanda tangan <code>.sig</code> di folder yang sama.
          Aplikasi memverifikasi tanda tangan Ed25519 manifest, hash setiap berkas, dan ukuran bundel sebelum
          mengaktifkan versi baru. Prototipe penampil juga menyediakan satu bundel contoh lokal.
        </p>
        <p className="mt-2 text-sm text-muted">
          Isi materi berjalan di iframe tersandbox tanpa akses ke aplikasi, IPC, maupun jaringan. Penanda
          &ldquo;selesai&rdquo; belum masuk Hasil Belajar (OD-14).
        </p>
        {!desktop && (
          <p className="mt-3 text-sm text-muted">Materi hanya dapat dibuka di aplikasi desktop.</p>
        )}
        <p aria-live="polite" className="mt-3 text-sm text-muted">
          {materialMessage ?? ""}
        </p>
        {materialError && (
          <p className="mt-3 rounded-control border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger-strong">
            {materialError}
          </p>
        )}

        {desktop && (
          <div data-material-installed className="mt-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Materi terpasang
            </h3>
            <p className="mt-2 text-sm text-muted">
              Sematkan maksimal 24 materi per profil. Batas ini dipakai bersama dengan paket yang disematkan.
            </p>
            <p aria-live="polite" className="mt-2 text-sm text-muted">
              {pinMessage ?? ""}
            </p>
            {pinError && (
              <p className="mt-2 rounded-control border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger-strong">
                {pinError}
              </p>
            )}
            {installedMaterials.length === 0 ? (
              <p className="mt-2 text-sm text-muted">
                Belum ada bundel materi terpasang di perangkat ini.
              </p>
            ) : (
              <ul className="mt-2 divide-y divide-ink/10">
                {installedMaterials.map((record) => {
                  const pinned = pinnedMaterialIds.includes(record.materialId);
                  return (
                    <li
                      key={`${record.materialId}@${record.version}`}
                      className="flex flex-wrap items-center justify-between gap-3 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <MaterialCover
                          source={{ kind: "installed", materialId: record.materialId }}
                          fallbackLabel={subjectLabel(record.subjects[0] ?? "")}
                          className="h-16 w-24 shrink-0 rounded-control"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{record.title}</p>
                          <p className="text-xs text-muted">
                            v{record.version} · kelas {record.gradeLevels.join(", ")} ·{" "}
                            {record.estimatedMinutes} menit · {Math.round(record.sizeBytes / 1024)} KB ·{" "}
                            {record.reviewStatus}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          data-material-pin={record.materialId}
                          aria-pressed={pinned}
                          onClick={() => void handleTogglePin(record)}
                          disabled={pinBusyId !== null}
                          className={`min-h-11 rounded-control border px-4 text-sm font-medium disabled:opacity-40 ${
                            pinned
                              ? "border-primary/40 bg-primary/10 text-primary"
                              : "border-ink/15 hover:bg-paper"
                          }`}
                        >
                          {pinBusyId === record.materialId
                            ? "Menyimpan…"
                            : pinned
                              ? "Disematkan"
                              : "Sematkan"}
                        </button>
                        <button
                          type="button"
                          data-material-installed-open={record.materialId}
                          onClick={() => void handleOpenInstalled(record.materialId)}
                          disabled={openingMaterialId !== null}
                          className="min-h-11 rounded-control border border-ink/15 px-4 text-sm font-medium hover:bg-paper disabled:opacity-40"
                        >
                          {openingMaterialId === record.materialId ? "Membuka…" : "Buka materi"}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-card border border-ink/10 bg-surface p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">
            Jelajah materi daring (prototipe)
          </h2>
          {desktop && (
            <button
              type="button"
              data-catalog-refresh
              onClick={() => void handleLoadCatalog()}
              disabled={catalogBusy || !catalogConfig?.baseUrl}
              className="min-h-11 rounded-control bg-primary px-5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {catalogBusy ? "Memuat…" : catalogPage ? "Muat ulang katalog" : "Muat katalog"}
            </button>
          )}
        </div>
        <p className="mt-3 text-sm text-muted">
          Katalog menyajikan materi HTML5 yang sudah ditinjau di platform. Aplikasi memeriksa tanda tangan
          manifest sebelum mengunduh, lalu mencocokkan SHA-256 bundel dan hash setiap berkas. Tautan unduhan
          pre-signed tidak pernah disimpan.
        </p>

        {!desktop ? (
          <p className="mt-3 text-sm text-muted">Jelajah materi daring hanya tersedia di aplikasi desktop.</p>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <label className="min-w-64 flex-1 text-sm">
                Alamat katalog
                <input
                  data-catalog-url
                  type="url"
                  value={catalogUrlValue}
                  onChange={(event) => setCatalogUrlDraft(event.target.value)}
                  disabled={catalogUrlBusy}
                  placeholder="https://katalog.gerbang.contoh"
                  className="mt-1 block min-h-11 w-full rounded-control border border-ink/15 px-3 text-sm"
                />
              </label>
              <button
                type="button"
                data-catalog-save-url
                onClick={() => void handleSaveCatalogUrl()}
                disabled={catalogUrlBusy}
                className="min-h-11 rounded-control border border-ink/15 px-5 text-sm font-medium hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40"
              >
                {catalogUrlBusy ? "Menyimpan…" : "Simpan alamat"}
              </button>
            </div>
            <p data-catalog-config className="mt-2 text-xs text-muted">
              {catalogConfig?.baseUrl
                ? `Aktif: ${catalogConfig.baseUrl} (${
                    catalogConfig.source === "env" ? "variabel lingkungan" : "pengaturan perangkat"
                  })`
                : "Belum dikonfigurasi. Alamat wajib https; http hanya diterima untuk localhost saat pengembangan."}
            </p>

            <div className="mt-4 flex flex-wrap items-end gap-3">
              <label className="text-sm">
                Kelas
                <select
                  data-catalog-grade
                  value={catalogGrade}
                  onChange={(event) => setCatalogGrade(event.target.value)}
                  disabled={catalogBusy}
                  className="mt-1 block min-h-11 rounded-control border border-ink/15 px-3 text-sm"
                >
                  <option value="">Semua kelas</option>
                  {[1, 2, 3, 4, 5, 6].map((grade) => (
                    <option key={grade} value={grade}>
                      Kelas {grade}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Mapel
                <select
                  data-catalog-subject
                  value={catalogSubject}
                  onChange={(event) => setCatalogSubject(event.target.value)}
                  disabled={catalogBusy}
                  className="mt-1 block min-h-11 rounded-control border border-ink/15 px-3 text-sm"
                >
                  <option value="">Semua mapel</option>
                  {subjectKeys.map((subject) => (
                    <option key={subject} value={subject}>
                      {subjectLabel(subject)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <p aria-live="polite" className="mt-3 text-sm text-muted">
              {catalogMessage ?? ""}
            </p>
            {catalogError && (
              <p className="mt-3 rounded-control border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger-strong">
                {catalogError}
              </p>
            )}

            {catalogPage?.stale && (
              <p
                data-catalog-stale
                className="mt-3 rounded-control border border-warning/40 bg-warning/10 px-4 py-3 text-sm"
              >
                Katalog tidak terjangkau. Menampilkan cache lokal
                {catalogPage.cachedAt ? ` dari ${formatDate(catalogPage.cachedAt)}` : ""}.
              </p>
            )}

            {catalogPage !== null &&
              (catalogPage.items.length === 0 ? (
                <p className="mt-3 text-sm text-muted">Tidak ada materi pada filter ini.</p>
              ) : (
                <ul className="mt-3 divide-y divide-ink/10">
                  {catalogPage.items.map((item) => {
                    const installed = item.installedVersion === item.version;
                    return (
                      <li
                        key={`${item.materialId}@${item.version}`}
                        data-catalog-item={item.materialId}
                        className="flex flex-wrap items-center justify-between gap-3 py-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <MaterialCover
                            source={{
                              kind: "catalog",
                              materialId: item.materialId,
                              version: item.version,
                              query: catalogFilters()
                            }}
                            fallbackLabel={subjectLabel(item.subjects[0] ?? "")}
                            className="h-16 w-24 shrink-0 rounded-control"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{item.title}</p>
                            <p className="text-xs text-muted">
                              v{item.version} · kelas {item.gradeLevels.join(", ")} ·{" "}
                              {item.subjects.map(subjectLabel).join(", ")} · {item.estimatedMinutes} menit ·{" "}
                              {Math.round(item.sizeBytes / 1024)} KB · {item.reviewStatus}
                            </p>
                            {item.installedVersion && !installed && (
                              <p className="text-xs text-muted">
                                Versi {item.installedVersion} sudah terpasang di perangkat ini.
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          data-catalog-install={item.materialId}
                          onClick={() => void handleInstallFromCatalog(item)}
                          disabled={catalogInstallingId !== null || installed}
                          className="min-h-11 rounded-control border border-ink/15 px-4 text-sm font-medium hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {installed
                            ? "Terpasang"
                            : catalogInstallingId === item.materialId
                              ? "Memasang…"
                              : item.installedVersion
                                ? `Pasang v${item.version}`
                                : "Pasang"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ))}
          </>
        )}
      </section>

      <section className="mt-6 rounded-card border border-ink/10 bg-surface p-5 md:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">
          Review konten (lokal)
        </h2>
        <p className="mt-3 text-sm text-muted">
          Review dicatat di perangkat ini sebagai audit lokal. Ini tidak mengubah berkas paket, tidak menandai
          publikasi, dan tidak menggantikan review manusia sesuai rubrik. Publikasi server tetap memerlukan OD-7.
          CSV ekspor memuat nama reviewer dan catatan (data pribadi).
        </p>

        {!desktop ? (
          <p className="mt-3 text-sm text-muted">Review hanya tersedia di aplikasi desktop.</p>
        ) : !canReview ? (
          <p className="mt-3 rounded-control border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
            Hanya profil guru yang dapat mencatat review. Profil aktif:{" "}
            {activeProfile?.displayName ?? "—"} (siswa).
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-sm">
                Paket
                <select
                  value={reviewPackageIndex}
                  onChange={(event) => setReviewPackageIndex(event.target.value)}
                  disabled={packages.length === 0 || reviewBusy}
                  className="mt-1 block min-h-11 min-w-56 rounded-control border border-ink/15 px-3 text-sm"
                >
                  {packages.map((record, index) => (
                    <option key={`${record.packageId}@${record.version}`} value={index}>
                      {record.packageId} v{record.version}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Keputusan
                <select
                  value={reviewDecision}
                  onChange={(event) => setReviewDecision(event.target.value as ReviewDecision)}
                  disabled={reviewBusy}
                  className="mt-1 block min-h-11 rounded-control border border-ink/15 px-3 text-sm"
                >
                  <option value="approved">Setujui (lokal)</option>
                  <option value="rejected">Tolak (lokal)</option>
                </select>
              </label>
            </div>
            <label className="block text-sm">
              Catatan
              <textarea
                value={reviewNotes}
                onChange={(event) => setReviewNotes(event.target.value)}
                disabled={reviewBusy}
                maxLength={1000}
                rows={3}
                className="mt-1 block w-full rounded-control border border-ink/15 px-3 py-2 text-sm"
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void handleRecordReview()}
                disabled={reviewBusy || packages.length === 0}
                className="min-h-11 rounded-control bg-primary px-5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
              >
                {reviewBusy ? "Menyimpan…" : "Catat review"}
              </button>
              <button
                type="button"
                onClick={() => void handleExportReviews()}
                disabled={reviewExportBusy || reviews.length === 0}
                className="min-h-11 rounded-control border border-ink/15 px-5 text-sm font-medium hover:bg-paper disabled:opacity-40"
              >
                {reviewExportBusy ? "Mengekspor…" : "Ekspor audit review…"}
              </button>
            </div>
            <p aria-live="polite" className="text-sm text-muted">
              {reviewMessage ?? ""}
            </p>
            {reviewError && (
              <p className="rounded-control border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger-strong">
                {reviewError}
              </p>
            )}
          </div>
        )}

        {reviews.length > 0 && (
          <ul className="mt-4 divide-y divide-ink/10">
            {reviews.slice(0, 10).map((review) => (
              <li key={review.id} className="py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">
                    {review.packageId} v{review.packageVersion}
                  </span>
                  <StatusBadge
                    tone={review.decision === "approved" ? "positive" : "warning"}
                    label={review.decision === "approved" ? "Disetujui (lokal)" : "Ditolak (lokal)"}
                  />
                  <span className="text-xs text-muted">
                    {review.reviewerName} · {formatDate(review.createdAt)}
                  </span>
                </div>
                {review.notes && (
                  <p className="mt-1 text-sm text-muted">{review.notes}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {material && <MaterialViewer material={material} onClose={() => setMaterial(null)} />}
    </div>
  );
}
