import { useCallback, useEffect, useState } from "react";
import { MaterialViewer } from "../components/material/MaterialViewer";
import { DraftAssetPanel } from "../components/studio/DraftAssetPanel";
import { DraftCheckPanel } from "../components/studio/DraftCheckPanel";
import { DraftCodePanel } from "../components/studio/DraftCodePanel";
import { DraftExportPanel } from "../components/studio/DraftExportPanel";
import { DraftMetaPanel } from "../components/studio/DraftMetaPanel";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/StatusBadge";
import { subjectKeys, subjectLabel } from "../content/subjectLabel";
import { canPersistLocally } from "../data/learningRepository";
import type { MaterialView } from "../data/materialRepository";
import {
  createStudioDraft,
  listStudioDrafts,
  listStudioTemplates,
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
  primaryButtonClass,
  secondaryButtonClass
} from "../components/studio/ui";

const tabs = [
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
      setContent(created);
      setReport(null);
      setTab("metadata");
      setCodeDirty(false);
      setForm(emptyForm);
      await refreshDrafts();
      setMessage(`Draft ${studioDraftId(created.draft)} dibuat dari kerangka.`);
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
      <PageHeader
        title="Studio Materi"
        description="Membuat materi HTML5 lokal yang kompatibel dengan kontrak bundel aplikasi: kerangka siap pakai, editor berkas, pemeriksaan mandiri, pratinjau, lalu ekspor untuk ditandatangani di luar aplikasi."
      />

      {!desktop && (
        <p className={errorClass}>
          Studio Materi hanya tersedia di aplikasi desktop karena draft ditulis ke folder materi
          perangkat.
        </p>
      )}

      {desktop && (
        <>
          <section className="rounded-card border border-ink/10 bg-surface p-5 md:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">
              Draft baru
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="block text-sm">
                materialId (slug, mis. daur-uji-coba)
                <input
                  data-studio-new-id
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
                    onChange={(event) => setForm({ ...form, estimatedMinutes: event.target.value })}
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
              className={`${primaryButtonClass} mt-4`}
            >
              {busy === "Membuat draft…" ? "Membuat…" : "Buat draft dari kerangka"}
            </button>
          </section>

          <section className="mt-6 rounded-card border border-ink/10 bg-surface p-5 md:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">
              Draft materi
            </h2>
            {loading && <p className="mt-3 text-sm text-muted">Memuat draft…</p>}
            {!loading && drafts.length === 0 && (
              <p className="mt-3 text-sm text-muted">
                Belum ada draft di perangkat ini. Buat draft dari kerangka di atas.
              </p>
            )}
            {drafts.length > 0 && (
              <ul className="mt-3 divide-y divide-ink/10">
                {drafts.map((draft) => {
                  const selected =
                    content?.draft.materialId === draft.materialId &&
                    content?.draft.version === draft.version;
                  return (
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
                          <p className="truncate text-sm font-medium">{draft.title}</p>
                          <p className="text-xs text-muted">
                            {studioDraftId(draft)} · kerangka {draft.templateId} ·{" "}
                            {new Date(draft.updatedAt).toLocaleString("id-ID", {
                              dateStyle: "medium",
                              timeStyle: "short"
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selected && <StatusBadge tone="neutral" label="Dibuka" />}
                        <button
                          type="button"
                          data-studio-open={draft.materialId}
                          onClick={() => void handleOpen(draft)}
                          disabled={busy !== null || selected}
                          className={`${secondaryButtonClass} px-4 text-sm`}
                        >
                          {selected ? "Sedang dibuka" : "Buka editor"}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {content && (
            <section
              data-studio-editor-card
              className="mt-6 rounded-card border border-ink/10 bg-surface p-5 md:p-6"
              key={studioDraftId(content.draft)}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold">{content.draft.title}</h2>
                  <p className="mt-1 text-xs text-muted">
                    {studioDraftId(content.draft)} · {content.files.length} berkas ·{" "}
                    {Math.round(content.totalBytes / 1024)} KB
                  </p>
                </div>
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
              {codeDirty && (
                <p className="mt-2 text-xs text-ink">
                  Simpan berkas yang sedang disunting sebelum pratinjau.
                </p>
              )}

              <div
                role="tablist"
                aria-label="Bagian Studio Materi"
                className="mt-4 flex flex-wrap gap-2 border-b border-ink/10 pb-2"
              >
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
                        : "border border-ink/15 hover:bg-paper"
                    }`}
                  >
                    {entry.label}
                  </button>
                ))}
              </div>

              <div aria-live="polite" className="mt-3 text-sm text-muted">
                {message ?? ""}
              </div>
              {error && (
                <p className={`${errorClass} mt-3`} role="alert">
                  {error}
                </p>
              )}

              {tabs.map((entry) => (
                <div
                  key={entry.id}
                  id={`studio-panel-${entry.id}`}
                  role="tabpanel"
                  aria-labelledby={`studio-tab-${entry.id}`}
                  hidden={tab !== entry.id}
                >
                  {entry.id === "metadata" && (
                    <DraftMetaPanel content={content} {...panelProps} />
                  )}
                  {entry.id === "code" && (
                    <DraftCodePanel
                      content={content}
                      {...panelProps}
                      onDirtyChange={setCodeDirty}
                    />
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
            </section>
          )}

          <p className="mt-4 text-xs text-muted">
            Draft disimpan di folder materi perangkat sehingga pratinjau memakai penampil yang
            sama dengan materi terpasang. Draft tidak muncul sebagai materi terpasang dan tidak
            dapat ditimpa oleh impor bundel dengan id serta versi yang sama.
          </p>
        </>
      )}

      {preview && <MaterialViewer material={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}
