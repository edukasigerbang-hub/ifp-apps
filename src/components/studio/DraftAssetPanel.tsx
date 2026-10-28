import { useMemo, useState } from "react";
import type { CatalogLessonEntry } from "../../content/catalog";
import { filterCatalog } from "../../content/catalog";
import { bundledCoverUrl } from "../../content/lessonCovers";
import { subjectKeys, subjectLabel } from "../../content/subjectLabel";
import { LessonThumbnail } from "../content/LessonThumbnail";
import { readAsset } from "../../data/contentRepository";
import {
  addStudioAsset,
  bytesToBase64,
  deleteStudioFile,
  messageOf,
  readStudioCoverFile,
  setStudioManifest
} from "../../data/materialStudioRepository";
import { loadCatalog, type CatalogLoadResult } from "../../content/loadCatalog";
import {
  controlClass,
  draftKeyOf,
  formatKilobytes,
  noticeClass,
  secondaryButtonClass,
  type StudioPanelProps
} from "./ui";

const COVER_EXTENSIONS = new Set(["webp", "png", "jpg", "jpeg"]);
const RESULT_LIMIT = 48;

function extensionOf(name: string): string {
  return name.slice(name.lastIndexOf(".") + 1).toLowerCase();
}

function isCoverFile(path: string): boolean {
  return COVER_EXTENSIONS.has(extensionOf(path));
}

function coverPathFor(name: string): string {
  const extension = COVER_EXTENSIONS.has(extensionOf(name)) ? extensionOf(name) : "png";
  return `assets/cover.${extension}`;
}

async function catalogCoverBytes(entry: CatalogLessonEntry): Promise<string> {
  if (!entry.coverAsset) {
    throw new Error("Materi katalog ini tidak punya gambar cover.");
  }
  if (entry.source === "managed") {
    const bytes = await readAsset(entry.packageId, entry.version, entry.coverAsset);
    return bytesToBase64(new Uint8Array(bytes));
  }
  const url = bundledCoverUrl(entry.packageId, entry.coverAsset);
  if (!url) {
    throw new Error("Gambar cover tidak tersedia di paket bawaan.");
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Gambar cover tidak dapat dimuat dari katalog.");
  }
  return bytesToBase64(new Uint8Array(await response.arrayBuffer()));
}

type DraftAssetPanelProps = StudioPanelProps;

export function DraftAssetPanel({
  content,
  busy,
  onBusy,
  onMessage,
  onError,
  onApplied
}: DraftAssetPanelProps) {
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalog, setCatalog] = useState<CatalogLoadResult | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [workingPath, setWorkingPath] = useState<string | null>(null);

  const assets = content.files.filter(
    (file) => file.path !== "material.json" && !file.editable
  );
  const coverPath = String(content.manifest.cover ?? "");

  const matches = useMemo(() => {
    if (!catalog) return [];
    return filterCatalog(catalog.entries, {
      query,
      grade: null,
      subject: subject ? subject : null
    }).filter((entry) => Boolean(entry.coverAsset));
  }, [catalog, query, subject]);

  async function installCover(name: string, data: string): Promise<string> {
    const key = draftKeyOf(content);
    const target = coverPathFor(name);
    let next = await addStudioAsset(key, target, data);
    if (isCoverFile(coverPath) && coverPath !== target) {
      if (next.files.some((file) => file.path === coverPath)) {
        next = await deleteStudioFile(key, coverPath);
      }
    }
    next = await setStudioManifest(key, { ...next.manifest, cover: target });
    onApplied(next);
    return target;
  }

  async function handleUpload(file: File) {
    onError(null);
    onMessage(null);
    onBusy("Mengunggah cover…");
    try {
      const data = await readStudioCoverFile(file);
      const target = await installCover(file.name, data);
      onMessage(`Cover dipasang sebagai ${target}.`);
    } catch (caught) {
      onError(messageOf(caught, "Cover gagal dipasang."));
    } finally {
      onBusy(null);
    }
  }

  async function handleOpenCatalog() {
    onError(null);
    setCatalogError(null);
    setCatalogOpen(true);
    if (catalog) return;
    onBusy("Memuat katalog materi…");
    try {
      setCatalog(await loadCatalog());
    } catch (caught) {
      setCatalogError(messageOf(caught, "Katalog materi tidak dapat dimuat."));
    } finally {
      onBusy(null);
    }
  }

  async function handleUseCatalogCover(entry: CatalogLessonEntry) {
    onError(null);
    onMessage(null);
    setWorkingPath(`${entry.packageId}::${entry.lessonId}`);
    try {
      const data = await catalogCoverBytes(entry);
      const target = await installCover(entry.coverAsset ?? "cover.webp", data);
      onMessage(`Cover “${entry.lessonTitle}” dipasang sebagai ${target}.`);
    } catch (caught) {
      onError(messageOf(caught, "Cover katalog gagal dipakai."));
    } finally {
      setWorkingPath(null);
    }
  }

  async function handleDeleteAsset(path: string) {
    onError(null);
    onMessage(null);
    onBusy("Menghapus aset…");
    try {
      onApplied(await deleteStudioFile(draftKeyOf(content), path));
      onMessage(`${path} dihapus.`);
    } catch (caught) {
      onError(messageOf(caught, "Aset gagal dihapus."));
    } finally {
      onBusy(null);
    }
  }

  return (
    <div className="mt-4 space-y-5">
      <section>
        <h3 className="text-sm font-semibold">Cover materi</h3>
        <div className="mt-2 flex flex-wrap items-start gap-4">
          {content.draft.cover ? (
            <img
              data-studio-cover
              src={content.draft.cover}
              alt={`Pratinjau cover ${content.draft.title}`}
              className="h-24 w-36 rounded-control border border-ink/10 object-cover"
            />
          ) : (
            <p className="text-sm text-muted">Belum ada cover yang terbaca.</p>
          )}
          <div className="text-sm">
            <p className="text-muted">Path aktif</p>
            <p className="font-medium">{coverPath || "belum diatur"}</p>
            <p className="mt-1 text-xs text-muted">
              WebP, PNG, atau JPG. Simpan di bawah 2 MB agar thumbnail tampil di aplikasi.
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="text-sm">
            Gambar cover dari perangkat
            <input
              data-studio-cover-input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                if (file) void handleUpload(file);
                event.target.value = "";
              }}
              disabled={busy !== null}
              className={controlClass}
            />
          </label>
          <button
            type="button"
            data-studio-cover-catalog
            aria-expanded={catalogOpen}
            onClick={() => void handleOpenCatalog()}
            disabled={busy !== null}
            className={secondaryButtonClass}
          >
            Ambil dari katalog materi
          </button>
        </div>
      </section>

      {catalogOpen && (
        <section data-studio-cover-picker className="rounded-control border border-ink/10 bg-paper p-4">
          <h3 className="text-sm font-semibold">Pilih cover dari katalog</h3>
          {catalogError && <p className="mt-2 text-sm text-danger-strong">{catalogError}</p>}
          {catalog && catalog.errors.length > 0 && (
            <p className="mt-2 text-xs text-muted">
              Sebagian paket tidak terbaca: {catalog.errors.length} galat.
            </p>
          )}
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="block text-sm">
              Cari judul materi
              <input
                data-studio-cover-query
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className={controlClass}
              />
            </label>
            <label className="block text-sm">
              Mata pelajaran
              <select
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className={controlClass}
              >
                <option value="">Semua mapel</option>
                {subjectKeys.map((key) => (
                  <option key={key} value={key}>
                    {subjectLabel(key)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="mt-2 text-xs text-muted">
            {catalog
              ? `Menampilkan ${Math.min(matches.length, RESULT_LIMIT)} dari ${matches.length} materi bercover.`
              : "Katalog sedang dimuat…"}
          </p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {matches.slice(0, RESULT_LIMIT).map((entry) => {
              const id = `${entry.packageId}::${entry.lessonId}`;
              return (
                <li
                  key={id}
                  className="rounded-control border border-ink/10 bg-surface p-2 text-xs"
                >
                  <LessonThumbnail entry={entry} className="h-20 w-full rounded-control" />
                  <p className="mt-2 line-clamp-2 font-medium">{entry.lessonTitle}</p>
                  <p className="mt-1 text-muted">
                    {subjectLabel(entry.subjects[0] ?? "")} · kelas {entry.gradeLevels.join(", ")}
                  </p>
                  <button
                    type="button"
                    data-studio-cover-use={id}
                    onClick={() => void handleUseCatalogCover(entry)}
                    disabled={busy !== null || workingPath !== null}
                    className="mt-2 min-h-11 w-full rounded-control border border-ink/15 px-2 text-xs font-medium hover:bg-paper disabled:opacity-40"
                  >
                    {workingPath === id ? "Memasang…" : "Pakai cover ini"}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section>
        <h3 className="text-sm font-semibold">Berkas dalam bundel</h3>
        <ul className="mt-2 divide-y divide-ink/10">
          {assets.map((file) => (
            <li key={file.path} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span className="min-w-0 truncate">
                {file.path}
                <span className="ml-2 text-xs text-muted">
                  {file.mediaType ?? "-"} · {formatKilobytes(file.bytes)}
                </span>
              </span>
              <button
                type="button"
                data-studio-asset-delete={file.path}
                aria-label={`Hapus aset ${file.path}`}
                onClick={() => void handleDeleteAsset(file.path)}
                disabled={busy !== null || file.path === coverPath}
                className={`${secondaryButtonClass} shrink-0 px-3 text-xs`}
              >
                Hapus
              </button>
            </li>
          ))}
        </ul>
        <p className={`${noticeClass} mt-3`}>
          Total bundel saat ini {formatKilobytes(content.totalBytes)} dari batas 50 MB. Aset
          gambar, audio, dan font diunggah ke sini; berkas HTML, JS, dan CSS dibuat di tab Kode.
        </p>
      </section>
    </div>
  );
}
