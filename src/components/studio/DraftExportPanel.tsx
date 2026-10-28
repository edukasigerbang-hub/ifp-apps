import { useState } from "react";
import {
  checkStudioDraft,
  deleteStudioDraft,
  exportStudioDraft,
  messageOf,
  pickStudioExportFolder,
  studioDraftId,
  type StudioExportResult
} from "../../data/materialStudioRepository";
import {
  controlClass,
  draftKeyOf,
  formatKilobytes,
  noticeClass,
  primaryButtonClass,
  secondaryButtonClass,
  type StudioPanelProps
} from "./ui";

interface DraftExportPanelProps extends StudioPanelProps {
  onDeleted(): void;
}

export function DraftExportPanel({
  content,
  busy,
  onBusy,
  onMessage,
  onError,
  onDeleted
}: DraftExportPanelProps) {
  const [result, setResult] = useState<StudioExportResult | null>(null);
  const [confirm, setConfirm] = useState("");
  const key = draftKeyOf(content);
  const folderName = `${key.materialId}-${key.version}`;

  async function handleExport() {
    onError(null);
    onMessage(null);
    setResult(null);
    onBusy("Memeriksa draft…");
    try {
      const report = await checkStudioDraft(key);
      if (!report.ok) {
        onError(`Draft belum lolos pemeriksaan: ${report.errors.join(" ")}`);
        return;
      }
      const targetDir = await pickStudioExportFolder();
      if (!targetDir) return;
      const next = await exportStudioDraft(key, targetDir);
      setResult(next);
      onMessage(`Ekspor selesai: ${next.bundleZip}`);
    } catch (caught) {
      onError(messageOf(caught, "Ekspor draft gagal."));
    } finally {
      onBusy(null);
    }
  }

  async function handleDelete() {
    onError(null);
    onMessage(null);
    onBusy("Menghapus draft…");
    try {
      await deleteStudioDraft(key, confirm.trim());
      onDeleted();
    } catch (caught) {
      onError(messageOf(caught, "Draft gagal dihapus."));
    } finally {
      onBusy(null);
    }
  }

  return (
    <div className="mt-4 space-y-5">
      <section>
        <h3 className="text-sm font-semibold">Ekspor draft</h3>
        <p className="mt-1 text-sm text-muted">
          Ekspor menyalin draft menjadi folder sumber dan bundel ZIP tanpa tanda tangan di dalam
          folder yang Anda pilih. Nama berkas memakai{" "}
          <span className="font-medium">{folderName}</span>.
        </p>
        <button
          type="button"
          data-studio-export
          onClick={() => void handleExport()}
          disabled={busy !== null}
          className={`${primaryButtonClass} mt-3`}
        >
          {busy ? "Memproses…" : "Periksa lalu ekspor…"}
        </button>

        {result && (
          <div className={`${noticeClass} mt-3 space-y-1`}>
            <p>
              Folder sumber: <span className="font-medium">{result.sourceDirectory}</span>
            </p>
            <p>
              Bundel ZIP: <span className="font-medium">{result.bundleZip}</span>
            </p>
            <p>{formatKilobytes(result.totalBytes)} tanpa tanda tangan.</p>
          </div>
        )}
      </section>

      <section>
        <h3 className="text-sm font-semibold">Tanda tangani di luar aplikasi</h3>
        <p className="mt-1 text-sm text-muted">
          Kunci privat sengaja tidak pernah masuk aplikasi. Jalankan perintah ini pada folder
          proyek, lalu pasang hasilnya lewat layar Konten &amp; Pembaruan.
        </p>
        <pre className="mt-2 overflow-x-auto rounded-control border border-ink/10 bg-paper px-4 py-3 text-xs leading-6">
          <code>{`node scripts/material-pack.mjs pack \\\n  --source "<folder ekspor>/materials-source/${folderName}" \\\n  --out "<folder ekspor>/${folderName}-signed.zip" \\\n  --private .tmp-catalog/keys/dev-content-1-private.pem \\\n  --key-id dev-content-1`}</code>
        </pre>
        <p className="mt-2 text-xs text-muted">
          Perintah membuat <span className="font-medium">{folderName}-signed.zip</span> beserta{" "}
          <span className="font-medium">{folderName}-signed.sig</span> di folder yang sama.
        </p>
      </section>

      <section className="rounded-control border border-danger/30 p-4">
        <h3 className="text-sm font-semibold text-danger-strong">Hapus draft</h3>
        <p className="mt-1 text-sm text-muted">
          Menghapus draft juga menghapus folder materinya. Ketik{" "}
          <span className="font-medium">{studioDraftId(key)}</span> untuk konfirmasi.
        </p>
        <label className="mt-2 block text-sm">
          Konfirmasi penghapusan
          <input
            data-studio-delete-confirm
            type="text"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            disabled={busy !== null}
            className={controlClass}
          />
        </label>
        <button
          type="button"
          data-studio-delete
          onClick={() => void handleDelete()}
          disabled={busy !== null || confirm.trim() !== studioDraftId(key)}
          className={`${secondaryButtonClass} mt-3 border-danger/40 text-danger-strong hover:bg-danger/5`}
        >
          Hapus draft
        </button>
        <p className="mt-2 text-xs text-muted">
          Draft yang sudah diekspor tetap dapat dihapus; folder hasil ekspor tidak tersentuh.
        </p>
      </section>
    </div>
  );
}
