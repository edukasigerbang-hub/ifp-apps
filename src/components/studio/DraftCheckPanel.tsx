import { checkStudioDraft, messageOf, type StudioDraftReport } from "../../data/materialStudioRepository";
import { StatusBadge } from "../ui/StatusBadge";
import { draftKeyOf, primaryButtonClass, type StudioPanelProps } from "./ui";

interface DraftCheckPanelProps extends StudioPanelProps {
  report: StudioDraftReport | null;
  onReport(report: StudioDraftReport): void;
}

export function DraftCheckPanel({
  content,
  busy,
  onBusy,
  onError,
  report,
  onReport
}: DraftCheckPanelProps) {
  async function handleCheck() {
    onError(null);
    onBusy("Memeriksa draft…");
    try {
      onReport(await checkStudioDraft(draftKeyOf(content)));
    } catch (caught) {
      onError(messageOf(caught, "Pemeriksaan draft gagal."));
    } finally {
      onBusy(null);
    }
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          data-studio-check
          onClick={() => void handleCheck()}
          disabled={busy !== null}
          className={primaryButtonClass}
        >
          {busy ? "Memeriksa…" : "Periksa draft"}
        </button>
        {report && (
          <StatusBadge
            tone={report.ok ? "positive" : "warning"}
            label={report.ok ? "Lolos pemeriksaan" : "Belum lolos"}
          />
        )}
        {report && (
          <p className="text-sm text-muted">
            {report.fileCount} berkas · {Math.round(report.totalBytes / 1024)} KB
          </p>
        )}
      </div>

      {!report && (
        <p className="text-sm text-muted">
          Pemeriksaan menguji kontrak bundel v1: manifest, hash tiap berkas terhadap isi folder,
          berkas wajib, dan rujukan eksternal. Hanya alamat video YouTube, video daring, dan sematan
          yang dinyatakan di tab Susun yang diizinkan; alamat lain membuat bundel ditolak.
        </p>
      )}

      {report && report.errors.length > 0 && (
        <div className="rounded-control border border-danger/30 bg-danger/5 px-4 py-3">
          <h3 className="text-sm font-semibold text-danger-strong">
            Galat yang harus diperbaiki
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-danger-strong">
            {report.errors.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {report && report.warnings.length > 0 && (
        <div className="rounded-control border border-warning/40 bg-warning/5 px-4 py-3">
          <h3 className="text-sm font-semibold text-ink">Perlu perhatian manusia</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink/90">
            {report.warnings.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {report && report.ok && report.warnings.length === 0 && (
        <p className="text-sm text-muted">
          Draft siap diekspor. Buka tab Ekspor untuk menyalin folder sumber dan bundel ZIP.
        </p>
      )}
    </div>
  );
}
