import { useState } from "react";
import {
  messageOf,
  setStudioManifest,
  type StudioManifest
} from "../../data/materialStudioRepository";
import {
  controlClass,
  draftKeyOf,
  primaryButtonClass,
  type StudioPanelProps
} from "./ui";

interface ManifestForm {
  title: string;
  summary: string;
  locale: string;
  grades: number[];
  subjects: string;
  topics: string;
  estimatedMinutes: string;
  transcriptPath: string;
  captionsPath: string;
  hasAudio: boolean;
  supportsReducedMotion: boolean;
  contrastChecked: boolean;
  completionMode: string;
  minDwellSeconds: string;
  publisher: string;
  reviewStatus: string;
}

function asStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function asNumbers(value: unknown): number[] {
  return Array.isArray(value)
    ? value.filter((item): item is number => typeof item === "number")
    : [];
}

function sectionOf(manifest: StudioManifest, key: string): Record<string, unknown> {
  const value = manifest[key];
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function formOf(manifest: StudioManifest): ManifestForm {
  const accessibility = sectionOf(manifest, "accessibility");
  const completion = sectionOf(manifest, "completion");
  const publisher = sectionOf(manifest, "publisher");
  return {
    title: String(manifest.title ?? ""),
    summary: String(manifest.summary ?? ""),
    locale: String(manifest.locale ?? "id-ID"),
    grades: asNumbers(manifest.gradeLevels),
    subjects: asStrings(manifest.subjects).join(", "),
    topics: asStrings(manifest.topics).join(", "),
    estimatedMinutes: String(manifest.estimatedMinutes ?? 5),
    transcriptPath: String(manifest.transcriptPath ?? "transcript.txt"),
    captionsPath: String(manifest.captionsPath ?? ""),
    hasAudio: Boolean(accessibility.hasAudio),
    supportsReducedMotion: Boolean(accessibility.supportsReducedMotion),
    contrastChecked: Boolean(accessibility.contrastChecked),
    completionMode: String(completion.mode ?? "signal"),
    minDwellSeconds: completion.minDwellSeconds == null ? "" : String(completion.minDwellSeconds),
    publisher: String(publisher.name ?? "Gerbang Edukasi"),
    reviewStatus: String(manifest.reviewStatus ?? "draft")
  };
}

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function DraftMetaPanel({
  content,
  busy,
  onBusy,
  onMessage,
  onError,
  onApplied
}: StudioPanelProps) {
  const [form, setForm] = useState(() => formOf(content.manifest));

  function patch(next: Partial<ManifestForm>) {
    setForm((current) => ({ ...current, ...next }));
  }

  function toggleGrade(grade: number) {
    setForm((current) => ({
      ...current,
      grades: current.grades.includes(grade)
        ? current.grades.filter((value) => value !== grade)
        : [...current.grades, grade].sort((left, right) => left - right)
    }));
  }

  async function handleSave() {
    onError(null);
    onMessage(null);
    const dwell = form.minDwellSeconds.trim() ? Number(form.minDwellSeconds) : null;
    const next: StudioManifest = {
      ...content.manifest,
      title: form.title.trim(),
      summary: form.summary.trim(),
      locale: form.locale.trim(),
      gradeLevels: form.grades,
      subjects: splitList(form.subjects).map((item) => item.toLowerCase()),
      topics: splitList(form.topics).slice(0, 12),
      estimatedMinutes: Number(form.estimatedMinutes) || 1,
      transcriptPath: form.transcriptPath.trim(),
      captionsPath: form.captionsPath.trim() || null,
      accessibility: {
        hasAudio: form.hasAudio,
        keyboardNavigable: true,
        supportsReducedMotion: form.supportsReducedMotion,
        contrastChecked: form.contrastChecked
      },
      completion: { mode: form.completionMode, minDwellSeconds: dwell },
      publisher: { name: form.publisher.trim() },
      reviewStatus: form.reviewStatus
    };
    onBusy("Menyimpan metadata…");
    try {
      onApplied(await setStudioManifest(draftKeyOf(content), next));
      onMessage("Metadata tersimpan; hash berkas sudah disegarkan.");
    } catch (caught) {
      onError(messageOf(caught, "Metadata gagal disimpan."));
    } finally {
      onBusy(null);
    }
  }

  return (
    <div className="mt-4 space-y-4">
      <label className="block text-sm">
        Judul materi
        <input
          data-studio-title
          type="text"
          value={form.title}
          onChange={(event) => patch({ title: event.target.value })}
          disabled={busy !== null}
          className={controlClass}
        />
      </label>
      <label className="block text-sm">
        Ringkasan (maksimal 300 karakter)
        <textarea
          data-studio-summary
          rows={2}
          value={form.summary}
          onChange={(event) => patch({ summary: event.target.value })}
          disabled={busy !== null}
          className={controlClass}
        />
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="block text-sm">
          Locale
          <input
            type="text"
            value={form.locale}
            onChange={(event) => patch({ locale: event.target.value })}
            disabled={busy !== null}
            className={controlClass}
          />
        </label>
        <label className="block text-sm">
          Estimasi menit (1–60)
          <input
            data-studio-minutes
            type="number"
            min={1}
            max={60}
            value={form.estimatedMinutes}
            onChange={(event) => patch({ estimatedMinutes: event.target.value })}
            disabled={busy !== null}
            className={controlClass}
          />
        </label>
        <label className="block text-sm">
          Penerbit
          <input
            type="text"
            value={form.publisher}
            onChange={(event) => patch({ publisher: event.target.value })}
            disabled={busy !== null}
            className={controlClass}
          />
        </label>
      </div>

      <fieldset className="rounded-control border border-ink/10 p-4">
        <legend className="px-1 text-sm font-medium">Kelas</legend>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {[1, 2, 3, 4, 5, 6].map((grade) => (
            <label key={grade} className="flex min-h-11 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.grades.includes(grade)}
                onChange={() => toggleGrade(grade)}
                disabled={busy !== null}
                className="h-4 w-4"
              />
              Kelas {grade}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          Mata pelajaran (slug, pisahkan dengan koma)
          <input
            data-studio-subjects
            type="text"
            value={form.subjects}
            onChange={(event) => patch({ subjects: event.target.value })}
            disabled={busy !== null}
            className={controlClass}
          />
        </label>
        <label className="block text-sm">
          Topik (maksimal 12 label)
          <input
            type="text"
            value={form.topics}
            onChange={(event) => patch({ topics: event.target.value })}
            disabled={busy !== null}
            className={controlClass}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          Berkas transkrip (.txt)
          <input
            type="text"
            value={form.transcriptPath}
            onChange={(event) => patch({ transcriptPath: event.target.value })}
            disabled={busy !== null}
            className={controlClass}
          />
        </label>
        <label className="block text-sm">
          Berkas takarir (.vtt, hanya bila ada audio)
          <input
            type="text"
            value={form.captionsPath}
            onChange={(event) => patch({ captionsPath: event.target.value })}
            disabled={busy !== null}
            className={controlClass}
          />
        </label>
      </div>

      <fieldset className="rounded-control border border-ink/10 p-4">
        <legend className="px-1 text-sm font-medium">Aksesibilitas &amp; penyelesaian</legend>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.hasAudio}
              onChange={(event) => patch({ hasAudio: event.target.checked })}
              disabled={busy !== null}
              className="h-4 w-4"
            />
            Punya audio
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.supportsReducedMotion}
              onChange={(event) => patch({ supportsReducedMotion: event.target.checked })}
              disabled={busy !== null}
              className="h-4 w-4"
            />
            Mendukung hemat gerak
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.contrastChecked}
              onChange={(event) => patch({ contrastChecked: event.target.checked })}
              disabled={busy !== null}
              className="h-4 w-4"
            />
            Kontras sudah diperiksa
          </label>
        </div>
        <p className="mt-2 text-xs text-muted">
          Materi wajib dapat dinavigasi lewat keyboard, karena itu pemeriksaan keyboard selalu aktif.
        </p>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            Mode penyelesaian
            <select
              value={form.completionMode}
              onChange={(event) => patch({ completionMode: event.target.value })}
              disabled={busy !== null}
              className={controlClass}
            >
              <option value="signal">Sinyal dari materi</option>
              <option value="none">Tanpa penanda selesai</option>
            </select>
          </label>
          <label className="block text-sm">
            Durasi minimum sebelum selesai (detik, opsional)
            <input
              type="number"
              min={0}
              max={600}
              value={form.minDwellSeconds}
              onChange={(event) => patch({ minDwellSeconds: event.target.value })}
              disabled={busy !== null}
              className={controlClass}
            />
          </label>
        </div>
      </fieldset>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          Status review
          <select
            data-studio-review-status
            value={form.reviewStatus}
            onChange={(event) => patch({ reviewStatus: event.target.value })}
            disabled={busy !== null}
            className={controlClass}
          >
            <option value="draft">draft</option>
            <option value="reviewed">reviewed</option>
            <option value="approved">approved</option>
          </select>
        </label>
        <p className="text-sm text-muted">
          Cover aktif: <span className="font-medium text-ink">{String(content.manifest.cover)}</span>.
          Ganti gambar lewat tab Aset &amp; Cover. Tandai &ldquo;approved&rdquo; hanya setelah
          materi dibaca manusia.
        </p>
      </div>

      <button
        type="button"
        data-studio-save-meta
        onClick={() => void handleSave()}
        disabled={busy !== null}
        className={primaryButtonClass}
      >
        {busy ? "Menyimpan…" : "Simpan metadata"}
      </button>
    </div>
  );
}
