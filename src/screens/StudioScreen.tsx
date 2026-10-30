import { useCallback, useEffect, useRef, useState } from "react";
import { MaterialViewer } from "../components/material/MaterialViewer";
import { DraftAssetPanel } from "../components/studio/DraftAssetPanel";
import { DraftCheckPanel } from "../components/studio/DraftCheckPanel";
import { DraftCodePanel } from "../components/studio/DraftCodePanel";
import { DraftExportPanel } from "../components/studio/DraftExportPanel";
import { DraftMetaPanel } from "../components/studio/DraftMetaPanel";
import { DraftScenePanel } from "../components/studio/DraftScenePanel";
import { PageHeader } from "../components/ui/PageHeader";
import { subjectKeys, subjectLabel } from "../content/subjectLabel";
import { canPersistLocally } from "../data/learningRepository";
import type { MaterialView } from "../data/materialRepository";
import {
  createStudioDraft,
  draftReviewStatus,
  listStudioDrafts,
  listStudioTemplates,
  markStudioDraftReady,
  messageOf,
  previewStudioDraft,
  readStudioDraft,
  studioDraftId,
  type StudioDraft,
  type StudioDraftContent,
  type StudioDraftReport,
  type StudioTemplate
} from "../data/materialStudioRepository";
import {
  controlClass,
  errorClass,
  noticeClass,
  primaryButtonClass,
  secondaryButtonClass
} from "../components/studio/ui";

const tabs = [
  { id: "scene", label: "Susun" },
  { id: "metadata", label: "Metadata" },
  { id: "code", label: "Kode" },
  { id: "assets", label: "Aset & Cover" },
  { id: "check", label: "Periksa" },
  { id: "export", label: "Ekspor" }
] as const;

type TabId = (typeof tabs)[number]["id"];

const emptyForm = {
  materialId: "",
  version: "1.0.0",
  title: "",
  templateId: "eksplorasi",
  subject: "ipas",
  grade: "3",
  estimatedMinutes: "5",
  summary: ""
};

function scrollToTop() {
  window.scrollTo({ top: 0 });
  document.getElementById("main-content")?.scrollTo({ top: 0 });
}

const READY_LABELS: Record<string, string> = {
  reviewed: "Siap pakai",
  approved: "Disetujui"
};

/** Lencana status review draft; sumber kanoniknya `material.json`. */
function ReviewBadge({ status }: { status: string }) {
  const ready = status !== "draft";
  return (
    <span
      data-studio-review-badge={status}
      className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold ${
        ready ? "border-teal/30 bg-teal/10 text-teal-strong" : "border-ink/15 bg-surface text-muted"
      }`}
    >
      {ready ? (READY_LABELS[status] ?? "Siap pakai") : "Draft"}
    </span>
  );
}

export function StudioScreen() {
  const desktop = canPersistLocally();
  const [templates, setTemplates] = useState<StudioTemplate[]>([]);
  const [drafts, setDrafts] = useState<StudioDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<StudioDraftContent | null>(null);
  const [report, setReport] = useState<StudioDraftReport | null>(null);
  const [tab, setTab] = useState<TabId>("metadata");
  const [codeDirty, setCodeDirty] = useState(false);
  const [preview, setPreview] = useState<MaterialView | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const createTriggerRef = useRef<HTMLButtonElement | null>(null);
  const createDialogRef = useRef<HTMLDivElement | null>(null);
  const materialIdRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!desktop) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [templateList, draftList] = await Promise.all([
          listStudioTemplates(),
          listStudioDrafts()
        ]);
        if (cancelled) return;
        setTemplates(templateList);
        setDrafts(draftList);
        if (templateList[0]) {
          setForm((current) => ({ ...current, templateId: templateList[0].id }));
        }
      } catch (caught) {
        if (!cancelled) setError(messageOf(caught, "Daftar draft tidak dapat dibaca."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [desktop]);

  async function refreshDrafts() {
    setDrafts(await listStudioDrafts());
  }

  function openCreate() {
    setError(null);
    setMessage(null);
    setCreating(true);
  }

  function closeCreate() {
    if (busy !== null) return;
    setCreating(false);
    createTriggerRef.current?.focus();
  }

  useEffect(() => {
    if (creating) materialIdRef.current?.focus();
  }, [creating]);

  // Dialog "Buat materi": Escape menutup, dan Tab berputar di dalam dialog
  // supaya fokus tidak bocor ke halaman di belakang.
  useEffect(() => {
    if (!creating) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (busy !== null) return;
        setCreating(false);
        createTriggerRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const root = createDialogRef.current;
      if (!root) return;
      const focusable = Array.from(
        root.querySelectorAll<HTMLElement>(
          "button, input, select, textarea, [href], [tabindex]:not([tabindex='-1'])"
        )
      ).filter((element) => !element.hasAttribute("disabled"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [creating, busy]);

  async function handleCreate() {
    setError(null);
    setMessage(null);
    setBusy("Membuat draft…");
    try {
      const created = await createStudioDraft({
        materialId: form.materialId.trim(),
        version: form.version.trim(),
        title: form.title.trim(),
        templateId: form.templateId,
        subject: form.subject,
        grade: Number(form.grade),
        estimatedMinutes: Number(form.estimatedMinutes),
        summary: form.summary.trim() || null
      });
      setCreating(false);
      setContent(created);
      setReport(null);
      setTab("metadata");
      setCodeDirty(false);
      setForm(emptyForm);
      await refreshDrafts();
      setMessage(`Draft ${studioDraftId(created.draft)} dibuat dari kerangka.`);
      scrollToTop();
    } catch (caught) {
      setError(messageOf(caught, "Draft gagal dibuat."));
    } finally {
      setBusy(null);
    }
  }

  async function handleOpen(draft: StudioDraft) {
    setError(null);
    setMessage(null);
    setBusy(`Membuka ${draft.materialId}…`);
    try {
      setContent(await readStudioDraft({ materialId: draft.materialId, version: draft.version }));
      setReport(null);
      setTab("metadata");
      setCodeDirty(false);
      scrollToTop();
    } catch (caught) {
      setError(messageOf(caught, "Draft tidak dapat dibuka."));
    } finally {
      setBusy(null);
    }
  }

  const handleApplied = useCallback((next: StudioDraftContent) => {
    setContent(next);
    setReport(null);
    setCodeDirty(false);
  }, []);

  function changeTab(next: TabId) {
    setTab(next);
    setMessage(null);
    setError(null);
  }

  // Editor punya halamannya sendiri: daftar dan form draft disembunyikan
  // supaya penyuntingan tidak berdesakan dengan daftar di layar yang sama.
  function backToList() {
    setContent(null);
    setReport(null);
    setPreview(null);
    setCodeDirty(false);
    setError(null);
  }

  async function handlePreview() {
    if (!content) return;
    setError(null);
    setMessage(null);
    setBusy("Membuka pratinjau…");
    try {
      setPreview(
        await previewStudioDraft({
          materialId: content.draft.materialId,
          version: content.draft.version
        })
      );
    } catch (caught) {
      setError(messageOf(caught, "Pratinjau draft gagal dibuka."));
    } finally {
      setBusy(null);
    }
  }

  async function handleMarkReady() {
    if (!content) return;
    setError(null);
    setMessage(null);
    setBusy("Memeriksa kesiapan materi…");
    try {
      const next = await markStudioDraftReady({
        materialId: content.draft.materialId,
        version: content.draft.version
      });
      setContent(next);
      await refreshDrafts();
      const status = draftReviewStatus(next);
      setMessage(
        status === "reviewed"
          ? `Materi "${next.draft.title}" ditandai siap pakai (status review: reviewed). Menyusul: Ekspor, tanda tangan penerbit di luar aplikasi, lalu pasang atau terbitkan di katalog.`
          : `Status review materi ini tetap "${status}" — hanya draft yang naik menjadi siap pakai.`
      );
    } catch (caught) {
      setError(messageOf(caught, "Materi belum siap dipakai."));
    } finally {
      setBusy(null);
    }
  }

  async function handleDeleted() {
    const id = content ? studioDraftId(content.draft) : "";
    setContent(null);
    setReport(null);
    setPreview(null);
    await refreshDrafts();
    setMessage(`Draft ${id} dihapus beserta folder materinya.`);
  }

  const panelProps = {
    busy,
    onBusy: setBusy,
    onMessage: setMessage,
    onError: setError,
    onApplied: handleApplied
  };

  return (
    <div className="space-y-6">
      {content ? (
        <section
          data-studio-editor-card
          key={studioDraftId(content.draft)}
          className="space-y-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <button
                type="button"
                data-studio-back
                onClick={backToList}
                disabled={busy !== null}
                className={`${secondaryButtonClass} shrink-0 px-3`}
              >
                <span aria-hidden="true">←</span> Daftar draft
              </button>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                  Studio Materi
                </p>
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <h1 className="truncate text-xl font-semibold">{content.draft.title}</h1>
                  <ReviewBadge status={draftReviewStatus(content)} />
                </div>
                <p className="mt-1 truncate text-xs text-muted">
                  {studioDraftId(content.draft)} · {content.files.length} berkas ·{" "}
                  {Math.round(content.totalBytes / 1024)} KB
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {draftReviewStatus(content) === "draft" && (
                <button
                  type="button"
                  data-studio-mark-ready
                  onClick={() => void handleMarkReady()}
                  disabled={busy !== null || codeDirty}
                  className={secondaryButtonClass}
                >
                  {busy === "Memeriksa kesiapan materi…" ? "Memeriksa…" : "Tandai siap pakai"}
                </button>
              )}
              <button
                type="button"
                data-studio-preview
                onClick={() => void handlePreview()}
                disabled={busy !== null || codeDirty}
                className={primaryButtonClass}
              >
                {busy === "Membuka pratinjau…" ? "Membuka…" : "Pratinjau materi"}
              </button>
            </div>
          </div>

          <div
            data-studio-toolbar
            className="sticky top-0 z-20 -mx-1 flex flex-wrap items-center gap-2 border-b border-ink/10 bg-paper/95 px-1 py-2 backdrop-blur"
          >
            <div role="tablist" aria-label="Bagian Studio Materi" className="flex flex-wrap gap-2">
              {tabs.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  role="tab"
                  id={`studio-tab-${entry.id}`}
                  data-studio-tab={entry.id}
                  aria-selected={tab === entry.id}
                  aria-controls={`studio-panel-${entry.id}`}
                  onClick={() => changeTab(entry.id)}
                  className={`min-h-11 rounded-control px-4 text-sm font-medium ${
                    tab === entry.id
                      ? "bg-primary/10 text-primary"
                      : "border border-ink/15 bg-surface hover:bg-paper"
                  }`}
                >
                  {entry.label}
                </button>
              ))}
            </div>
            {codeDirty && (
              <span className="ml-auto text-xs text-ink">
                Berkas belum disimpan — simpan sebelum pratinjau.
              </span>
            )}
          </div>

          <div aria-live="polite" className="min-h-5 text-sm text-muted">
            {message ?? ""}
          </div>
          {error && (
            <p className={errorClass} role="alert">
              {error}
            </p>
          )}

          <div className="rounded-card border border-ink/10 bg-surface p-4 md:p-5">
            {tabs.map((entry) => (
              <div
                key={entry.id}
                id={`studio-panel-${entry.id}`}
                role="tabpanel"
                aria-labelledby={`studio-tab-${entry.id}`}
                hidden={tab !== entry.id}
              >
                {entry.id === "scene" && <DraftScenePanel content={content} {...panelProps} />}
                {entry.id === "metadata" && <DraftMetaPanel content={content} {...panelProps} />}
                {entry.id === "code" && (
                  <DraftCodePanel content={content} {...panelProps} onDirtyChange={setCodeDirty} />
                )}
                {entry.id === "assets" && <DraftAssetPanel content={content} {...panelProps} />}
                {entry.id === "check" && (
                  <DraftCheckPanel
                    content={content}
                    {...panelProps}
                    report={report}
                    onReport={setReport}
                  />
                )}
                {entry.id === "export" && (
                  <DraftExportPanel content={content} {...panelProps} onDeleted={handleDeleted} />
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-muted">
            Draft disimpan di folder materi perangkat sehingga pratinjau memakai penampil yang sama
            dengan materi terpasang. Draft tidak muncul sebagai materi terpasang dan tidak dapat
            ditimpa oleh impor bundel dengan id serta versi yang sama.
          </p>
        </section>
      ) : (
        <>
          <PageHeader
            title="Studio Materi"
            description="Membuat materi HTML5 lokal yang kompatibel dengan kontrak bundel aplikasi: kerangka siap pakai, editor berkas, pemeriksaan mandiri, pratinjau, lalu ekspor untuk ditandatangani di luar aplikasi."
          />

          {!desktop ? (
            <p className={errorClass}>
              Studio Materi hanya tersedia di aplikasi desktop karena draft ditulis ke folder materi
              perangkat.
            </p>
          ) : (
            <>
              {message && (
                <p data-studio-status className={noticeClass} role="status">
                  {message}
                </p>
              )}
              {error && !creating && (
                <p className={errorClass} role="alert">
                  {error}
                </p>
              )}

              <section className="rounded-card border border-ink/10 bg-surface p-5 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">
                    Draft materi
                  </h2>
                  <button
                    type="button"
                    data-studio-create-open
                    ref={createTriggerRef}
                    onClick={openCreate}
                    disabled={busy !== null}
                    className={`${primaryButtonClass} px-4`}
                  >
                    <span aria-hidden="true">+</span> Buat materi
                  </button>
                </div>
                {loading && <p className="mt-3 text-sm text-muted">Memuat draft…</p>}
                {!loading && drafts.length === 0 && (
                  <p className="mt-3 text-sm text-muted">
                    Belum ada draft di perangkat ini. Tekan “Buat materi” untuk memulai dari kerangka.
                  </p>
                )}
                {drafts.length > 0 && (
                  <ul className="mt-3 divide-y divide-ink/10">
                    {drafts.map((draft) => (
                      <li
                        key={studioDraftId(draft)}
                        className="flex flex-wrap items-center justify-between gap-3 py-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          {draft.cover ? (
                            <img
                              data-studio-draft-cover={draft.materialId}
                              src={draft.cover}
                              alt=""
                              className="h-14 w-20 shrink-0 rounded-control border border-ink/10 object-cover"
                            />
                          ) : (
                            <div
                              aria-hidden="true"
                              className="flex h-14 w-20 shrink-0 items-center justify-center rounded-control bg-teal/10 text-sm font-semibold text-teal-strong"
                            >
                              {subjectLabel(draft.templateId).slice(0, 2)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-medium">{draft.title}</p>
                              <ReviewBadge status={draft.reviewStatus} />
                            </div>
                            <p className="text-xs text-muted">
                              {studioDraftId(draft)} · kerangka {draft.templateId} ·{" "}
                              {new Date(draft.updatedAt).toLocaleString("id-ID", {
                                dateStyle: "medium",
                                timeStyle: "short"
                              })}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          data-studio-open={draft.materialId}
                          onClick={() => void handleOpen(draft)}
                          disabled={busy !== null}
                          className={`${secondaryButtonClass} px-4 text-sm`}
                        >
                          Buka editor
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <p className="mt-4 text-xs text-muted">
                Draft disimpan di folder materi perangkat sehingga pratinjau memakai penampil yang
                sama dengan materi terpasang. Draft tidak muncul sebagai materi terpasang dan tidak
                dapat ditimpa oleh impor bundel dengan id serta versi yang sama. Lencana{" "}
                <span className="font-medium text-ink">Siap pakai</span> muncul setelah{" "}
                <span className="font-medium text-ink">Tandai siap pakai</span> di kepala editor
                lulus memeriksa kontrak materi; menerbitkan materi daring tetap lewat Ekspor lalu
                tanda tangan penerbit di luar aplikasi.
              </p>
            </>
          )}
        </>
      )}

      {creating && (
        <div
          data-studio-create-dialog
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 p-4 md:items-center"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeCreate();
          }}
        >
          <div
            ref={createDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="studio-create-heading"
            className="w-full max-w-3xl rounded-card border border-ink/10 bg-surface p-5 shadow-xl md:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="studio-create-heading" className="text-lg font-semibold">
                  Buat materi
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Kerangka menulis folder draft baru beserta manifest dan berkas awal.
                </p>
              </div>
              <button
                type="button"
                data-studio-create-close
                onClick={closeCreate}
                disabled={busy !== null}
                aria-label="Tutup form buat materi"
                className={`${secondaryButtonClass} min-h-11 w-11 shrink-0 px-0 text-lg`}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="block text-sm">
                materialId (slug, mis. daur-uji-coba)
                <input
                  data-studio-new-id
                  ref={materialIdRef}
                  type="text"
                  value={form.materialId}
                  onChange={(event) =>
                    setForm({ ...form, materialId: event.target.value.toLowerCase() })
                  }
                  disabled={busy !== null}
                  className={controlClass}
                />
              </label>
              <label className="block text-sm">
                Versi (SemVer)
                <input
                  type="text"
                  value={form.version}
                  onChange={(event) => setForm({ ...form, version: event.target.value })}
                  disabled={busy !== null}
                  className={controlClass}
                />
              </label>
              <label className="block text-sm">
                Judul
                <input
                  data-studio-new-title
                  type="text"
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  disabled={busy !== null}
                  className={controlClass}
                />
              </label>
              <label className="block text-sm">
                Kerangka
                <select
                  data-studio-template
                  value={form.templateId}
                  onChange={(event) => setForm({ ...form, templateId: event.target.value })}
                  disabled={busy !== null}
                  className={controlClass}
                >
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                Mata pelajaran
                <select
                  value={form.subject}
                  onChange={(event) => setForm({ ...form, subject: event.target.value })}
                  disabled={busy !== null}
                  className={controlClass}
                >
                  {subjectKeys.map((key) => (
                    <option key={key} value={key}>
                      {subjectLabel(key)}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block text-sm">
                  Kelas
                  <select
                    value={form.grade}
                    onChange={(event) => setForm({ ...form, grade: event.target.value })}
                    disabled={busy !== null}
                    className={controlClass}
                  >
                    {[1, 2, 3, 4, 5, 6].map((grade) => (
                      <option key={grade} value={grade}>
                        Kelas {grade}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  Menit
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={form.estimatedMinutes}
                    onChange={(event) =>
                      setForm({ ...form, estimatedMinutes: event.target.value })
                    }
                    disabled={busy !== null}
                    className={controlClass}
                  />
                </label>
              </div>
            </div>
            <label className="mt-4 block text-sm">
              Ringkasan singkat (opsional)
              <textarea
                rows={2}
                value={form.summary}
                onChange={(event) => setForm({ ...form, summary: event.target.value })}
                disabled={busy !== null}
                className={controlClass}
              />
            </label>

            {error && (
              <p className={`${errorClass} mt-4`} role="alert">
                {error}
              </p>
            )}

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                data-studio-create-cancel
                onClick={closeCreate}
                disabled={busy !== null}
                className={secondaryButtonClass}
              >
                Batal
              </button>
              <button
                type="button"
                data-studio-create
                onClick={() => void handleCreate()}
                disabled={
                  busy !== null ||
                  form.materialId.trim().length < 3 ||
                  form.title.trim().length < 3 ||
                  form.version.trim().length === 0
                }
                className={primaryButtonClass}
              >
                {busy === "Membuat draft…" ? "Membuat…" : "Buat draft dari kerangka"}
              </button>
            </div>
          </div>
        </div>
      )}

      {preview && <MaterialViewer material={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}
