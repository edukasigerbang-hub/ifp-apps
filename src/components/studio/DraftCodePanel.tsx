import { useEffect, useMemo, useState } from "react";
import {
  deleteStudioFile,
  messageOf,
  readStudioDraft,
  writeStudioFile,
  type StudioDraftFile
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

interface DraftCodePanelProps extends StudioPanelProps {
  onDirtyChange(dirty: boolean): void;
}

// Berkas masuk adalah yang paling sering disunting, jadi ia dipakai sebagai
// pilihan awal — urutan berkas dari disk dimulai dari assets/.
function initialPathOf(files: StudioDraftFile[]): string {
  return files.some((file) => file.path === "index.html")
    ? "index.html"
    : (files[0]?.path ?? "");
}

export function DraftCodePanel({
  content,
  busy,
  onBusy,
  onMessage,
  onError,
  onApplied,
  onDirtyChange
}: DraftCodePanelProps) {
  const files = useMemo(
    () => content.files.filter((file: StudioDraftFile) => file.editable),
    [content.files]
  );
  const [path, setPath] = useState(() => initialPathOf(files));
  const [isNew, setIsNew] = useState(false);
  const [buffer, setBuffer] = useState(
    () => files.find((file) => file.path === initialPathOf(files))?.content ?? ""
  );
  const [newPath, setNewPath] = useState("");
  const [armed, setArmed] = useState<string | null>(null);

  const current = files.find((file) => file.path === path) ?? null;
  const baseline = isNew ? "" : (current?.content ?? "");
  const dirty = buffer !== baseline;

  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  function choose(nextPath: string) {
    const next = files.find((file) => file.path === nextPath) ?? null;
    setPath(nextPath);
    setIsNew(false);
    setBuffer(next?.content ?? "");
    setArmed(null);
  }

  function startNew() {
    setIsNew(true);
    setBuffer("");
    setArmed(null);
  }

  async function handleSave() {
    onError(null);
    onMessage(null);
    const target = isNew ? newPath.trim() : path;
    if (!target) {
      onError("Tentukan nama berkas, mis. assets/animasi.js.");
      return;
    }
    if (!buffer.trim()) {
      onError("Berkas baru tidak boleh kosong — tulis isinya lebih dulu.");
      return;
    }
    onBusy("Menyimpan berkas…");
    try {
      const next = await writeStudioFile(draftKeyOf(content), target, buffer);
      onApplied(next);
      if (isNew) {
        setIsNew(false);
        setNewPath("");
        setBuffer(next.files.find((file) => file.path === target)?.content ?? "");
      }
      onMessage(`${target} tersimpan; hash diperbarui.`);
    } catch (caught) {
      onError(messageOf(caught, "Berkas gagal disimpan."));
    } finally {
      onBusy(null);
    }
  }

  async function handleReload() {
    onError(null);
    onMessage(null);
    onBusy("Memuat ulang dari disk…");
    try {
      const next = await readStudioDraft(draftKeyOf(content));
      onApplied(next);
      const file = next.files.find((item) => item.path === path && item.editable) ?? null;
      setBuffer(file?.content ?? "");
      setIsNew(false);
      onMessage(`${path} dimuat ulang dari disk.`);
    } catch (caught) {
      onError(messageOf(caught, "Draft tidak dapat dimuat ulang."));
    } finally {
      onBusy(null);
    }
  }

  async function handleDelete(target: string) {
    if (armed !== target) {
      setArmed(target);
      return;
    }
    onError(null);
    onMessage(null);
    setArmed(null);
    onBusy("Menghapus berkas…");
    try {
      const next = await deleteStudioFile(draftKeyOf(content), target);
      onApplied(next);
      const remaining = next.files.find(
        (file) => file.editable && file.path !== target
      );
      if (target === path) {
        setPath(remaining?.path ?? "index.html");
        setIsNew(false);
        setBuffer(remaining?.content ?? "");
      }
      onMessage(`${target} dihapus dari draft.`);
    } catch (caught) {
      onError(messageOf(caught, "Berkas gagal dihapus."));
    } finally {
      onBusy(null);
    }
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="grid gap-4 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
        <div>
          <label className="block text-sm">
            Berkas sumber
            <select
              data-studio-file-select
              value={isNew ? "__new__" : path}
              onChange={(event) => {
                if (event.target.value === "__new__") {
                  startNew();
                  return;
                }
                choose(event.target.value);
              }}
              disabled={busy !== null}
              className={controlClass}
            >
              {files.map((file) => (
                <option key={file.path} value={file.path}>
                  {file.path} · {formatKilobytes(file.bytes)}
                </option>
              ))}
              <option value="__new__">— berkas baru —</option>
            </select>
          </label>
          {isNew && (
            <label className="mt-3 block text-sm">
              Nama berkas baru
              <input
                data-studio-new-file
                type="text"
                placeholder="assets/animasi.js"
                value={newPath}
                onChange={(event) => setNewPath(event.target.value)}
                disabled={busy !== null}
                className={controlClass}
              />
            </label>
          )}
          <ul className="mt-3 space-y-2">
            {files.map((file) => (
              <li key={file.path} className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate text-muted">{file.path}</span>
                <button
                  type="button"
                  data-studio-file-delete={file.path}
                  aria-label={
                    armed === file.path ? `Konfirmasi hapus ${file.path}` : `Hapus ${file.path}`
                  }
                  onClick={() => void handleDelete(file.path)}
                  disabled={busy !== null || file.path === "index.html"}
                  className={`${secondaryButtonClass} min-h-11 shrink-0 px-3 text-xs disabled:opacity-40`}
                >
                  {armed === file.path ? "Konfirmasi" : "Hapus"}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <label className="block text-sm">
            {isNew ? "Isi berkas baru" : `Isi ${path}`}
            <textarea
              data-studio-editor
              rows={18}
              spellCheck={false}
              value={buffer}
              onChange={(event) => setBuffer(event.target.value)}
              disabled={busy !== null}
              className="mt-1 block w-full rounded-control border border-ink/15 bg-surface px-3 py-2 font-mono text-xs leading-5"
            />
          </label>
          <p className="mt-2 text-xs text-muted">
            {dirty ? "Perubahan belum disimpan." : "Semua perubahan tersimpan."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              data-studio-save-file
              onClick={() => void handleSave()}
              disabled={busy !== null || !dirty}
              className={primaryButtonClass}
            >
              {busy ? "Menyimpan…" : "Simpan berkas"}
            </button>
            {!isNew && (
              <button
                type="button"
                data-studio-reload-file
                onClick={() => void handleReload()}
                disabled={busy !== null}
                className={secondaryButtonClass}
              >
                Muat ulang dari disk
              </button>
            )}
          </div>
        </div>
      </div>

      <p className={noticeClass}>
        Isi materi hanya boleh merujuk aset di dalam bundel. Rujukan luar seperti{" "}
        <code className="font-mono text-xs">http://</code>,{" "}
        <code className="font-mono text-xs">window.open</code>, dan{" "}
        <code className="font-mono text-xs">fetch(</code> ditolak saat menyimpan serta diperiksa
        ulang sebelum ekspor.
      </p>
    </div>
  );
}
