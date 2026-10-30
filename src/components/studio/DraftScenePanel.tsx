import { useEffect, useMemo, useRef, useState } from "react";
import {
  addStudioAsset,
  messageOf,
  readStudioAsset,
  readStudioCoverFile,
  setStudioManifest,
  writeStudioFile
} from "../../data/materialStudioRepository";
import {
  ALIGN_LABELS,
  CAPTIONS_PATH,
  EFFECT_LABELS,
  LAYOUT_LABELS,
  MAX_BLOCKS_PER_STEP,
  MAX_LOCAL_VIDEO_BYTES,
  MAX_STEPS,
  SCENE_EFFECTS,
  SCENE_SOUNDS,
  SCENE_THEMES,
  SIZE_LABELS,
  SOUND_LABELS,
  TEXT_ALIGNS,
  TEXT_SIZES,
  TEXT_STYLES,
  TEXT_STYLE_LABELS,
  TEXT_TONES,
  THEME_LABELS,
  TONE_LABELS,
  IMAGE_LAYOUTS,
  VIDEO_SOURCES,
  VIDEO_SOURCE_LABELS,
  createAudioBlock,
  createEmbedBlock,
  createId,
  createImageBlock,
  createScene,
  createStep,
  createTextBlock,
  createVideoBlock,
  nextStepTitle,
  parseScene,
  sceneIssues,
  sceneNeedsInternet,
  youtubeId,
  type ImageLayout,
  type Scene,
  type SceneBlock,
  type SceneEffect,
  type SceneSound,
  type SceneStep,
  type SceneTheme,
  type TextAlign,
  type TextSize,
  type TextStyle,
  type TextTone,
  type VideoSource
} from "./sceneModel";
import {
  SCENE_FILES,
  extractSceneDocument,
  renderPreviewDocument,
  renderSceneFiles
} from "./sceneRender";
import {
  controlClass,
  draftKeyOf,
  errorClass,
  noticeClass,
  primaryButtonClass,
  secondaryButtonClass,
  type StudioPanelProps
} from "./ui";

const IMAGE_EXTENSIONS = new Set(["webp", "png", "jpg", "jpeg"]);
const AUDIO_EXTENSIONS = new Set(["mp3", "m4a", "ogg", "wav"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "webm"]);
const MAX_THUMBS = 24;
const ADD_BLOCK_KINDS = [
  { kind: "teks", label: "+ Teks" },
  { kind: "gambar", label: "+ Gambar" },
  { kind: "suara", label: "+ Suara" },
  { kind: "video", label: "+ Video" },
  { kind: "semat", label: "+ Semat" }
] as const;

function extensionOf(name: string): string {
  return name.slice(name.lastIndexOf(".") + 1).toLowerCase();
}

function titleFromFile(name: string): string {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim()
    .slice(0, 120);
}

function urlHost(value: string): string {
  try {
    return new URL(value).host;
  } catch {
    return value;
  }
}

function assetPathFor(name: string, fallback: string): string {
  const base = name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  const extension = extensionOf(name);
  return `assets/${base || fallback}.${extension || fallback}`;
}

interface History {
  past: Scene[];
  present: Scene | null;
  future: Scene[];
}

function sameScene(left: Scene | null, right: Scene | null): boolean {
  return left !== null && right !== null && JSON.stringify(left) === JSON.stringify(right);
}

export function DraftScenePanel({
  content,
  busy,
  onBusy,
  onMessage,
  onError,
  onApplied
}: StudioPanelProps) {
  const entry = content.files.find((file) => file.path === SCENE_FILES.entry);
  const entryHtml = entry?.content ?? "";
  const stored = useMemo(() => parseScene(extractSceneDocument(entryHtml)), [entryHtml]);

  const [history, setHistory] = useState<History>({ past: [], present: stored, future: [] });
  const [activeStep, setActiveStep] = useState(0);
  // Sidebar langkah: ringkasan blok tiap langkah dapat dibuka/tutup sendiri.
  const [outlineOpen, setOutlineOpen] = useState<Set<string>>(new Set());
  const [collapsedBlocks, setCollapsedBlocks] = useState<Set<string>>(new Set());
  const [ack, setAck] = useState(false);
  // `step` menyimpan langkah yang sedang ditampilkan pratinjau supaya isinya
  // selalu sesuai pilihan di sidebar.
  const [preview, setPreview] = useState<{ html: string; step: number } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [thumbsReady, setThumbsReady] = useState(false);
  const [thumbError, setThumbError] = useState<string | null>(null);
  // Pratinjau tengah dibiarkan tampil (ditandai usang) selama menyunting:
  // memuat ulang iframe tiap ketikan membuat pratinjau berkedip.
  const [previewStale, setPreviewStale] = useState(false);
  // Panel tengah punya dua tab; penyunting blok adalah tampilan awal supaya
  // pratinjau tidak memakan ruang kerja saat menulis.
  const [bodyTab, setBodyTab] = useState<"editor" | "preview">("editor");

  // Terapkan menulis ulang index.html sehingga naskah tersimpan ikut berubah;
  // pilihan langkah hanya direset saat pindah draft, bukan sesudah Terapkan.
  const draftId = `${content.draft.materialId}@${content.draft.version}`;
  const draftRef = useRef(draftId);

  useEffect(() => {
    setHistory({ past: [], present: stored, future: [] });
    setActiveStep((current) => (draftRef.current === draftId ? current : 0));
    draftRef.current = draftId;
    setOutlineOpen(new Set());
    setCollapsedBlocks(new Set());
    setPreview(null);
    setPreviewStale(false);
    setAck(false);
  }, [stored, draftId]);

  const scene = history.present;

  // Langkah terpilih bisa hilang setelah urungkan atau hapus langkah.
  useEffect(() => {
    if (!scene) return;
    setActiveStep((current) => Math.min(current, scene.steps.length - 1));
  }, [scene]);

  function toggleOutline(id: string) {
    setOutlineOpen((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleBlock(id: string) {
    setCollapsedBlocks((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function blockSummary(block: SceneBlock): string {
    if (block.kind === "teks") {
      const text = block.text.trim().replace(/\s+/g, " ").slice(0, 40);
      return text.length > 0 ? text : "(teks kosong)";
    }
    if (block.kind === "gambar") {
      return block.path.split("/").pop() || "(belum dipilih)";
    }
    if (block.kind === "suara") {
      return block.label || "(tanpa label)";
    }
    if (block.kind === "video") {
      if (block.source === "lokal") return block.path.split("/").pop() || "(belum dipilih)";
      return block.title || (block.url ? urlHost(block.url) : "(belum diisi)");
    }
    return block.title || (block.url ? urlHost(block.url) : "(belum diisi)");
  }

  function blockKindLabel(block: SceneBlock): string {
    if (block.kind === "teks") return "Teks";
    if (block.kind === "gambar") return "Gambar";
    if (block.kind === "suara") return "Suara";
    return block.kind === "video" ? "Video" : "Sematan";
  }

  const assets = useMemo(
    () => content.files.filter((file) => !file.editable).map((file) => file.path),
    [content.files]
  );
  const imageAssets = useMemo(
    () => assets.filter((path) => IMAGE_EXTENSIONS.has(extensionOf(path))),
    [assets]
  );
  const audioAssets = useMemo(
    () => assets.filter((path) => AUDIO_EXTENSIONS.has(extensionOf(path))),
    [assets]
  );
  const videoAssets = useMemo(
    () => assets.filter((path) => VIDEO_EXTENSIONS.has(extensionOf(path))),
    [assets]
  );
  const thumbKey = `${content.draft.materialId}@${content.draft.version}:${imageAssets.join("|")}`;

  useEffect(() => {
    const key = draftKeyOf(content);
    let cancelled = false;
    setThumbsReady(false);
    (async () => {
      const loaded: Array<[string, string]> = [];
      let failed = 0;
      for (const path of imageAssets.slice(0, MAX_THUMBS)) {
        try {
          const asset = await readStudioAsset(key, path);
          loaded.push([path, asset.dataUrl]);
        } catch {
          failed += 1;
        }
      }
      if (cancelled) return;
      setThumbs((current) => ({ ...current, ...Object.fromEntries(loaded) }));
      setThumbError(failed > 0 ? `${failed} gambar tidak dapat dibaca untuk galeri.` : null);
      setThumbsReady(true);
    })();
    return () => {
      cancelled = true;
    };
    // Kunci string menyegarkan galeri saat aset draft berubah.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thumbKey]);

  // Pratinjau muncul sendiri setelah gambar draft termuat, dan ikut pindah saat
  // langkah lain dipilih. Setelah menyunting, isinya dibiarkan usang sampai
  // pengguna menekan Muat ulang agar iframe tidak berkedip tiap ketikan.
  useEffect(() => {
    if (!scene || !thumbsReady) return;
    if (preview === null) {
      setPreview({ html: renderPreviewDocument(scene, thumbs, activeStep), step: activeStep });
      return;
    }
    if (!previewStale && preview.step !== activeStep) {
      setPreview({ html: renderPreviewDocument(scene, thumbs, activeStep), step: activeStep });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, thumbs, thumbsReady, preview, previewStale, activeStep]);

  const issues = scene ? sceneIssues(scene, assets) : [];
  const needsInternet = scene !== null && sceneNeedsInternet(scene);
  const hasStoredScene = stored !== null;
  const pending = busy !== null || uploading;
  const canApply = scene !== null && issues.length === 0 && !pending && ack;
  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  /** Dipanggil saat kontrol mulai disunting: satu langkah undo per sesi ketik. */
  function beginEdit() {
    setHistory((state) => {
      if (!state.present) return state;
      const last = state.past[state.past.length - 1];
      if (last && sameScene(last, state.present)) {
        return state;
      }
      return {
        past: [...state.past, state.present].slice(-60),
        present: state.present,
        future: []
      };
    });
  }

  function commit(mutate: (current: Scene) => Scene) {
    setHistory((state) => {
      if (!state.present) return state;
      const next = mutate(state.present);
      if (next === state.present) return state;
      return { past: [...state.past, state.present].slice(-60), present: next, future: [] };
    });
    setPreviewStale(true);
  }

  function undo() {
    setHistory((state) => {
      if (state.past.length === 0 || !state.present) return state;
      const previous = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future]
      };
    });
    setPreviewStale(true);
  }

  function redo() {
    setHistory((state) => {
      if (state.future.length === 0 || !state.present) return state;
      const next = state.future[0];
      return {
        past: [...state.past, state.present],
        present: next,
        future: state.future.slice(1)
      };
    });
    setPreviewStale(true);
  }

  function updateStep(index: number, change: (step: SceneStep) => SceneStep) {
    commit((current) => ({
      ...current,
      steps: current.steps.map((step, position) => (position === index ? change(step) : step))
    }));
  }

  function updateBlock(stepIndex: number, blockId: string, change: (block: SceneBlock) => SceneBlock) {
    updateStep(stepIndex, (step) => ({
      ...step,
      blocks: step.blocks.map((block) => (block.id === blockId ? change(block) : block))
    }));
  }

  function insertBlock(stepIndex: number, after: number, block: SceneBlock) {
    updateStep(stepIndex, (step) => {
      if (step.blocks.length >= MAX_BLOCKS_PER_STEP) return step;
      const blocks = [...step.blocks];
      blocks.splice(after + 1, 0, block);
      return { ...step, blocks };
    });
  }

  function duplicateBlock(stepIndex: number, blockId: string) {
    updateStep(stepIndex, (step) => {
      const index = step.blocks.findIndex((block) => block.id === blockId);
      if (index < 0 || step.blocks.length >= MAX_BLOCKS_PER_STEP) return step;
      const copy = { ...step.blocks[index], id: createId(step.blocks[index].kind) };
      const blocks = [...step.blocks];
      blocks.splice(index + 1, 0, copy);
      return { ...step, blocks };
    });
  }

  function moveStep(index: number, delta: number) {
    if (!scene) return;
    const target = index + delta;
    if (target < 0 || target >= scene.steps.length) return;
    commit((current) => {
      const steps = [...current.steps];
      const [moved] = steps.splice(index, 1);
      steps.splice(target, 0, moved);
      return { ...current, steps };
    });
    setActiveStep(target);
  }

  function duplicateStep(index: number) {
    if (!scene || scene.steps.length >= MAX_STEPS) return;
    const source = scene.steps[index];
    commit((current) => {
      const steps = [...current.steps];
      steps.splice(index + 1, 0, {
        ...source,
        id: createId("langkah"),
        title: `${source.title} (salinan)`,
        blocks: source.blocks.map((block) => ({ ...block, id: createId(block.kind) }))
      });
      return { ...current, steps };
    });
    setActiveStep(index + 1);
  }

  function newVideoBlock(): SceneBlock {
    const local = videoAssets[0];
    return createVideoBlock(local ? "lokal" : "youtube", local ?? "");
  }

  function addBlock(kind: "teks" | "gambar" | "suara" | "video" | "semat") {
    updateStep(activeStep, (step) => {
      if (step.blocks.length >= MAX_BLOCKS_PER_STEP) return step;
      const block =
        kind === "teks"
          ? createTextBlock()
          : kind === "gambar"
            ? createImageBlock(imageAssets[0] ?? "")
            : kind === "suara"
              ? createAudioBlock(audioAssets[0] ?? "")
              : kind === "video"
                ? newVideoBlock()
                : createEmbedBlock();
      return { ...step, blocks: [...step.blocks, block] };
    });
  }

  async function handleAssetUpload(
    kind: "gambar" | "suara" | "video",
    file: File,
    stepIndex: number,
    blockId: string
  ) {
    if (kind === "video" && file.size > MAX_LOCAL_VIDEO_BYTES) {
      onError(
        `Video ${file.name} ${(file.size / 1024 / 1024).toFixed(1)} MB melebihi batas 25 MB per video.`
      );
      return;
    }
    const busyLabel =
      kind === "gambar" ? "Mengunggah gambar…" : kind === "suara" ? "Mengunggah audio…" : "Mengunggah video…";
    const fallback = kind === "gambar" ? "gambar.png" : kind === "suara" ? "audio.mp3" : "video.mp4";
    setUploading(true);
    onError(null);
    onBusy(busyLabel);
    try {
      const data = await readStudioCoverFile(file);
      const path = assetPathFor(file.name, fallback);
      const next = await addStudioAsset(draftKeyOf(content), path, data);
      onApplied(next);
      updateBlock(stepIndex, blockId, (block) => {
        if (block.kind !== kind) return block;
        if (block.kind === "video") {
          return { ...block, source: "lokal", path, title: block.title.trim() || titleFromFile(file.name) };
        }
        return { ...block, path };
      });
      if (kind === "gambar") {
        setThumbs((current) => ({ ...current, [path]: data }));
      }
      const noun = kind === "gambar" ? "Gambar" : kind === "suara" ? "Audio" : "Video";
      onMessage(`${noun} ${path} ditambahkan ke draft.`);
    } catch (caught) {
      onError(messageOf(caught, "Aset gagal ditambahkan."));
    } finally {
      setUploading(false);
      onBusy(null);
    }
  }

  async function handleApply() {
    if (!scene) return;
    setUploading(true);
    onError(null);
    onBusy("Menerapkan susunan…");
    try {
      const files = renderSceneFiles(scene);
      const key = draftKeyOf(content);
      let next = await writeStudioFile(key, SCENE_FILES.entry, files.entry);
      next = await writeStudioFile(key, SCENE_FILES.style, files.style);
      next = await writeStudioFile(key, SCENE_FILES.runtime, files.runtime);
      if (files.captions) {
        next = await writeStudioFile(key, CAPTIONS_PATH, files.captions);
      }
      // Kontrak §4: hasAudio memaksa captionsPath; keduanya diturunkan dari naskah.
      const currentManifest = next.manifest as Record<string, unknown>;
      const accessibility = (currentManifest.accessibility ?? {}) as Record<string, unknown>;
      next = await setStudioManifest(key, {
        ...currentManifest,
        accessibility: { ...accessibility, hasAudio: files.captions !== null },
        captionsPath: files.captions ? CAPTIONS_PATH : null
      });
      onApplied(next);
      onMessage(
        `Susunan diterapkan: ${files.summary}${files.captions ? ` · ${CAPTIONS_PATH} dibuat` : ""}.`
      );
      setAck(false);
    } catch (caught) {
      onError(messageOf(caught, "Susunan gagal diterapkan."));
    } finally {
      setUploading(false);
      onBusy(null);
    }
  }

  function handlePreview() {
    if (!scene) return;
    setPreview({ html: renderPreviewDocument(scene, thumbs, activeStep), step: activeStep });
    setPreviewStale(false);
    setBodyTab("preview");
  }

  const step = scene?.steps[activeStep] ?? null;

  return (
    <div data-scene-panel className="mt-4 space-y-4">
      {!scene && (
        <div className={noticeClass}>
          <p className="font-medium">Bundel ini belum punya naskah visual.</p>
          <p className="mt-1 text-muted">
            Tab Susun menyusun halaman dari blok teks, gambar, audio, efek, dan efek suara. Setelah
            naskah dibuat, menekan Terapkan akan <strong>menimpa</strong> index.html, assets/style.css,
            dan assets/app.js dengan hasil susunan.
          </p>
          <button
            type="button"
            data-scene-start
            onClick={() => {
              const draft = createScene(content.draft.title);
              setHistory({ past: [], present: draft, future: [] });
              setActiveStep(0);
            }}
            disabled={pending}
            className={`${primaryButtonClass} mt-3`}
          >
            Buat naskah dari judul draft
          </button>
        </div>
      )}

      {scene && (
        <>
          <div
            data-scene-toolbar
            className="flex flex-wrap items-center gap-2 rounded-control border border-ink/10 bg-paper px-2 py-2"
          >
            <button
              type="button"
              data-scene-undo
              onClick={undo}
              disabled={!canUndo || pending}
              className={`${secondaryButtonClass} px-3 text-sm`}
            >
              ↶ Urungkan
            </button>
            <button
              type="button"
              data-scene-redo
              onClick={redo}
              disabled={!canRedo || pending}
              className={`${secondaryButtonClass} px-3 text-sm`}
            >
              ↷ Ulangi
            </button>
            <span className="text-xs text-muted">{history.past.length} langkah riwayat</span>
            <span className="ml-auto flex flex-wrap items-center gap-2">
              <button
                type="button"
                data-scene-preview
                onClick={handlePreview}
                disabled={pending}
                className={`${secondaryButtonClass} px-3 text-sm`}
              >
                Pratinjau
              </button>
              <button
                type="button"
                data-scene-apply
                onClick={() => void handleApply()}
                disabled={!canApply}
                className={`${primaryButtonClass} px-4`}
              >
                {uploading || busy === "Menerapkan susunan…" ? "Menerapkan…" : "Terapkan ke materi"}
              </button>
            </span>
          </div>

          {issues.length > 0 && (
            <ul className={errorClass} role="alert">
              {issues.slice(0, 8).map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
              {issues.length > 8 && <li>…dan {issues.length - 8} masalah lain.</li>}
            </ul>
          )}

          {needsInternet && (
            <p
              data-scene-internet-note
              className="rounded-control border border-warning/40 bg-warning/10 px-3 py-2 text-sm"
            >
              Naskah ini memuat video atau sematan daring. Materi tetap dapat dipasang, tetapi tanpa
              koneksi internet blok tersebut menampilkan pemberitahuan, bukan isinya.
            </p>
          )}

          <label className="flex items-start gap-2 rounded-control border border-ink/10 bg-paper px-3 py-2 text-sm">
            <input
              type="checkbox"
              data-scene-ack
              checked={ack}
              onChange={(event) => setAck(event.target.checked)}
              className="mt-1 h-5 w-5"
            />
            <span>
              {hasStoredScene
                ? "Saya mengerti susunan ini menulis ulang index.html, assets/style.css, dan assets/app.js."
                : "Saya mengerti index.html bawaan kerangka akan ditimpa oleh susunan ini."}
            </span>
          </label>

          <div className="grid gap-3 lg:grid-cols-[minmax(12rem,15rem)_minmax(0,1fr)] xl:grid-cols-[minmax(12rem,15rem)_minmax(0,1fr)_minmax(15rem,19rem)]">
            <aside
              data-scene-steps
              className="rounded-control border border-ink/10 bg-paper p-3 lg:sticky lg:top-4 lg:self-start"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">
                  Langkah ({scene.steps.length}/{MAX_STEPS})
                </h3>
                <button
                  type="button"
                  data-scene-add-step
                  onClick={() => {
                    if (!scene || scene.steps.length >= MAX_STEPS) return;
                    commit((current) => ({
                      ...current,
                      steps: [
                        ...current.steps,
                        { ...createStep(current.steps.length), title: nextStepTitle(current.steps) }
                      ]
                    }));
                    setActiveStep(scene.steps.length);
                  }}
                  disabled={pending || scene.steps.length >= MAX_STEPS}
                  className={`${secondaryButtonClass} px-3 text-sm`}
                >
                  + Langkah
                </button>
              </div>
              <p className="mt-1 text-xs text-muted">Pilih langkah untuk menyunting di panel tengah.</p>
              <ol className="mt-2 space-y-1">
                {scene.steps.map((item, index) => {
                  const selected = index === activeStep;
                  const outline = outlineOpen.has(item.id);
                  return (
                    <li
                      key={item.id}
                      data-scene-step-item={index}
                      className={
                        selected
                          ? "rounded-control border border-primary/40 bg-primary/5"
                          : "rounded-control border border-ink/10"
                      }
                    >
                      <div className="flex items-stretch">
                        <button
                          type="button"
                          data-scene-step-toggle={index}
                          data-scene-step-outline={outline ? "true" : "false"}
                          aria-expanded={outline}
                          aria-controls={`scene-step-outline-${index}`}
                          aria-label={`${outline ? "Tutup" : "Buka"} ringkasan langkah ${index + 1}`}
                          onClick={() => toggleOutline(item.id)}
                          className="min-h-11 w-8 shrink-0 text-sm text-muted"
                        >
                          <span aria-hidden="true">{outline ? "▾" : "▸"}</span>
                        </button>
                        <button
                          type="button"
                          data-scene-step={index}
                          data-scene-step-active={selected ? "true" : "false"}
                          aria-current={selected ? "step" : undefined}
                          onClick={() => setActiveStep(index)}
                          className="flex min-h-11 flex-1 flex-col justify-center py-1 pr-2 text-left text-sm"
                        >
                          <span className={selected ? "font-semibold" : "font-medium"}>
                            {index + 1}. {item.title || "Tanpa judul"}
                          </span>
                          <span className="text-xs text-muted">
                            {item.blocks.length} blok · {EFFECT_LABELS[item.effect]}
                          </span>
                        </button>
                      </div>
                      {outline && (
                        <ul
                          id={`scene-step-outline-${index}`}
                          data-scene-step-outline-list={index}
                          className="space-y-0.5 border-t border-ink/10 px-3 py-2 text-xs text-muted"
                        >
                          {item.blocks.length === 0 ? (
                            <li>Belum ada blok.</li>
                          ) : (
                            item.blocks.map((block, position) => (
                              <li key={block.id} className="truncate">
                                {position + 1}. {blockKindLabel(block)} · {blockSummary(block)}
                              </li>
                            ))
                          )}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ol>
            </aside>

            <section
              id="scene-step-body"
              data-scene-step-body
              data-step={activeStep}
              className="space-y-3 rounded-control border border-ink/10 p-3"
            >
              {step ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold">
                      Langkah {activeStep + 1} dari {scene.steps.length}
                    </h3>
                    <span className="text-xs text-muted">
                      {step.blocks.length}/{MAX_BLOCKS_PER_STEP} blok
                    </span>
                  </div>

                  <div
                    data-scene-body-tabs
                    role="tablist"
                    aria-label="Editor dan pratinjau langkah"
                    className="flex flex-wrap gap-2 border-b border-ink/10 pb-2"
                  >
                    {(
                      [
                        { id: "editor", label: "Editor" },
                        { id: "preview", label: "Pratinjau" }
                      ] as const
                    ).map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        role="tab"
                        id={`scene-body-tab-${entry.id}`}
                        data-scene-body-tab={entry.id}
                        aria-selected={bodyTab === entry.id}
                        aria-controls={`scene-body-panel-${entry.id}`}
                        onClick={() => setBodyTab(entry.id)}
                        className={`min-h-11 rounded-control px-4 text-sm font-medium ${
                          bodyTab === entry.id
                            ? "bg-primary/10 text-primary"
                            : "border border-ink/15 bg-surface hover:bg-paper"
                        }`}
                      >
                        {entry.label}
                      </button>
                    ))}
                  </div>

                  <div
                    id="scene-body-panel-editor"
                    role="tabpanel"
                    aria-labelledby="scene-body-tab-editor"
                    data-scene-editor-panel
                    hidden={bodyTab !== "editor"}
                  >
                  <ul className="mt-3 space-y-3">
                {step.blocks.map((block, position) => (
                  <li key={block.id} className="rounded-control border border-ink/10 bg-paper p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        data-scene-block-toggle={block.id}
                        aria-expanded={!collapsedBlocks.has(block.id)}
                        aria-controls={`scene-block-body-${block.id}`}
                        onClick={() => toggleBlock(block.id)}
                        className="flex min-h-11 items-center gap-2 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted"
                      >
                        <span aria-hidden="true">{collapsedBlocks.has(block.id) ? "▸" : "▾"}</span>
                        {position + 1}. {blockKindLabel(block)} · {blockSummary(block)}
                      </button>
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            updateStep(activeStep, (current) => {
                              const blocks = [...current.blocks];
                              if (position > 0) {
                                [blocks[position - 1], blocks[position]] = [
                                  blocks[position],
                                  blocks[position - 1]
                                ];
                              }
                              return { ...current, blocks };
                            })
                          }
                          disabled={pending || position === 0}
                          className={`${secondaryButtonClass} px-2 text-xs`}
                          aria-label="Naikkan blok"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateStep(activeStep, (current) => {
                              const blocks = [...current.blocks];
                              if (position < blocks.length - 1) {
                                [blocks[position + 1], blocks[position]] = [
                                  blocks[position],
                                  blocks[position + 1]
                                ];
                              }
                              return { ...current, blocks };
                            })
                          }
                          disabled={pending || position === step.blocks.length - 1}
                          className={`${secondaryButtonClass} px-2 text-xs`}
                          aria-label="Turunkan blok"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          data-scene-duplicate-block
                          onClick={() => duplicateBlock(activeStep, block.id)}
                          disabled={pending || step.blocks.length >= MAX_BLOCKS_PER_STEP}
                          className={`${secondaryButtonClass} px-2 text-xs`}
                        >
                          Duplikat
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateStep(activeStep, (current) => ({
                              ...current,
                              blocks: current.blocks.filter((item) => item.id !== block.id)
                            }))
                          }
                          disabled={pending}
                          className={`${secondaryButtonClass} px-2 text-xs`}
                        >
                          Hapus
                        </button>
                      </div>
                    </div>

                    {!collapsedBlocks.has(block.id) && (
                    <div id={`scene-block-body-${block.id}`} data-scene-block-body={block.id}>

                    {block.kind === "teks" && (
                      <div className="mt-2 space-y-2">
                        <div className="grid gap-2 md:grid-cols-[1fr_2fr]">
                          <label className="block text-sm">
                            Gaya
                            <select
                              value={block.style}
                              onChange={(event) =>
                                updateBlock(activeStep, block.id, (current) =>
                                  current.kind === "teks"
                                    ? { ...current, style: event.target.value as TextStyle }
                                    : current
                                )
                              }
                              className={controlClass}
                            >
                              {TEXT_STYLES.map((style) => (
                                <option key={style} value={style}>
                                  {TEXT_STYLE_LABELS[style]}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="block text-sm">
                            Teks {block.style === "poin" ? "(satu poin per baris)" : ""}
                            <textarea
                              data-scene-text
                              rows={block.style === "poin" ? 4 : 3}
                              maxLength={1200}
                              value={block.text}
                              onFocus={beginEdit}
                              onChange={(event) =>
                                updateBlock(activeStep, block.id, (current) =>
                                  current.kind === "teks"
                                    ? { ...current, text: event.target.value }
                                    : current
                                )
                              }
                              className={controlClass}
                            />
                          </label>
                        </div>
                        <div className="flex flex-wrap items-end gap-2">
                          <button
                            type="button"
                            data-scene-bold
                            aria-pressed={block.bold}
                            onClick={() =>
                              updateBlock(activeStep, block.id, (current) =>
                                current.kind === "teks" ? { ...current, bold: !current.bold } : current
                              )
                            }
                            className={`${secondaryButtonClass} min-h-11 w-11 px-0 font-bold`}
                            aria-label="Tebalkan teks"
                          >
                            B
                          </button>
                          <button
                            type="button"
                            aria-pressed={block.italic}
                            onClick={() =>
                              updateBlock(activeStep, block.id, (current) =>
                                current.kind === "teks"
                                  ? { ...current, italic: !current.italic }
                                  : current
                              )
                            }
                            className={`${secondaryButtonClass} min-h-11 w-11 px-0 italic`}
                            aria-label="Miringkan teks"
                          >
                            I
                          </button>
                          <label className="text-sm">
                            Warna
                            <select
                              value={block.tone}
                              onChange={(event) =>
                                updateBlock(activeStep, block.id, (current) =>
                                  current.kind === "teks"
                                    ? { ...current, tone: event.target.value as TextTone }
                                    : current
                                )
                              }
                              className={controlClass}
                            >
                              {TEXT_TONES.map((tone) => (
                                <option key={tone} value={tone}>
                                  {TONE_LABELS[tone]}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="text-sm">
                            Ukuran
                            <select
                              value={block.size}
                              onChange={(event) =>
                                updateBlock(activeStep, block.id, (current) =>
                                  current.kind === "teks"
                                    ? { ...current, size: event.target.value as TextSize }
                                    : current
                                )
                              }
                              className={controlClass}
                            >
                              {TEXT_SIZES.map((size) => (
                                <option key={size} value={size}>
                                  {SIZE_LABELS[size]}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="text-sm">
                            Perataan
                            <select
                              value={block.align}
                              onChange={(event) =>
                                updateBlock(activeStep, block.id, (current) =>
                                  current.kind === "teks"
                                    ? { ...current, align: event.target.value as TextAlign }
                                    : current
                                )
                              }
                              className={controlClass}
                            >
                              {TEXT_ALIGNS.map((align) => (
                                <option key={align} value={align}>
                                  {ALIGN_LABELS[align]}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                      </div>
                    )}

                    {block.kind === "gambar" && (
                      <div className="mt-2 space-y-2">
                        <div className="grid gap-2 md:grid-cols-[1fr_1fr]">
                          <label className="block text-sm">
                            Gambar
                            <select
                              data-scene-image
                              value={block.path}
                              onChange={(event) =>
                                updateBlock(activeStep, block.id, (current) =>
                                  current.kind === "gambar"
                                    ? { ...current, path: event.target.value }
                                    : current
                                )
                              }
                              className={controlClass}
                            >
                              <option value="">Pilih aset…</option>
                              {imageAssets.map((path) => (
                                <option key={path} value={path}>
                                  {path}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="block text-sm">
                            Tata letak
                            <select
                              data-scene-layout
                              value={block.layout}
                              onChange={(event) =>
                                updateBlock(activeStep, block.id, (current) =>
                                  current.kind === "gambar"
                                    ? { ...current, layout: event.target.value as ImageLayout }
                                    : current
                                )
                              }
                              className={controlClass}
                            >
                              {IMAGE_LAYOUTS.map((layout) => (
                                <option key={layout} value={layout}>
                                  {LAYOUT_LABELS[layout]}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                        {imageAssets.length > 0 && (
                          <div>
                            <p className="text-xs text-muted">Galeri aset draft</p>
                            <ul className="mt-1 flex flex-wrap gap-2">
                              {imageAssets.slice(0, MAX_THUMBS).map((path, index) => (
                                <li key={path}>
                                  <button
                                    type="button"
                                    data-scene-thumb={index}
                                    aria-pressed={block.path === path}
                                    aria-label={`Pilih ${path}`}
                                    onClick={() =>
                                      updateBlock(activeStep, block.id, (current) =>
                                        current.kind === "gambar"
                                          ? { ...current, path }
                                          : current
                                      )
                                    }
                                    className={`block h-16 w-24 overflow-hidden rounded-control border-2 ${
                                      block.path === path ? "border-primary" : "border-ink/15"
                                    }`}
                                  >
                                    {thumbs[path] ? (
                                      <img src={thumbs[path]} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                      <span className="flex h-full items-center justify-center px-1 text-[10px] text-muted">
                                        {path.split("/").pop()}
                                      </span>
                                    )}
                                  </button>
                                </li>
                              ))}
                            </ul>
                            {thumbError && <p className="mt-1 text-xs text-danger-strong">{thumbError}</p>}
                          </div>
                        )}
                        <div className="grid gap-2 md:grid-cols-2">
                          <label className="block text-sm">
                            Teks alternatif (wajib)
                            <input
                              type="text"
                              data-scene-alt
                              value={block.alt}
                              onFocus={beginEdit}
                              onChange={(event) =>
                                updateBlock(activeStep, block.id, (current) =>
                                  current.kind === "gambar"
                                    ? { ...current, alt: event.target.value }
                                    : current
                                )
                              }
                              className={controlClass}
                            />
                          </label>
                          <label className="block text-sm">
                            Keterangan (opsional)
                            <input
                              type="text"
                              value={block.caption}
                              onFocus={beginEdit}
                              onChange={(event) =>
                                updateBlock(activeStep, block.id, (current) =>
                                  current.kind === "gambar"
                                    ? { ...current, caption: event.target.value }
                                    : current
                                )
                              }
                              className={controlClass}
                            />
                          </label>
                        </div>
                        <label className="block text-sm">
                          Unggah gambar baru
                          <input
                            type="file"
                            accept="image/webp,image/png,image/jpeg"
                            data-scene-image-file
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (file) void handleAssetUpload("gambar", file, activeStep, block.id);
                              event.target.value = "";
                            }}
                            disabled={pending}
                            className="mt-1 block w-full text-xs"
                          />
                        </label>
                      </div>
                    )}

                    {block.kind === "suara" && (
                      <div className="mt-2 space-y-2">
                        <div className="grid gap-2 md:grid-cols-2">
                          <label className="block text-sm">
                            Berkas suara
                            <select
                              data-scene-audio
                              value={block.path}
                              onChange={(event) =>
                                updateBlock(activeStep, block.id, (current) =>
                                  current.kind === "suara"
                                    ? { ...current, path: event.target.value }
                                    : current
                                )
                              }
                              className={controlClass}
                            >
                              <option value="">Pilih audio…</option>
                              {audioAssets.map((path) => (
                                <option key={path} value={path}>
                                  {path}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="block text-sm">
                            Label suara
                            <input
                              type="text"
                              data-scene-audio-label
                              maxLength={120}
                              value={block.label}
                              onFocus={beginEdit}
                              onChange={(event) =>
                                updateBlock(activeStep, block.id, (current) =>
                                  current.kind === "suara"
                                    ? { ...current, label: event.target.value }
                                    : current
                                )
                              }
                              className={controlClass}
                            />
                          </label>
                        </div>
                        <label className="block text-sm">
                          Teks alternatif (untuk captions)
                          <input
                            type="text"
                            maxLength={300}
                            value={block.caption}
                            onFocus={beginEdit}
                            onChange={(event) =>
                              updateBlock(activeStep, block.id, (current) =>
                                current.kind === "suara"
                                  ? { ...current, caption: event.target.value }
                                  : current
                              )
                            }
                            className={controlClass}
                          />
                        </label>
                        <label className="block text-sm">
                          Unggah audio (mp3, m4a, ogg, wav)
                          <input
                            type="file"
                            accept="audio/mpeg,audio/mp4,audio/ogg,audio/wav"
                            data-scene-audio-file
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (file) void handleAssetUpload("suara", file, activeStep, block.id);
                              event.target.value = "";
                            }}
                            disabled={pending}
                            className="mt-1 block w-full text-xs"
                          />
                        </label>
                      </div>
                    )}

                    {block.kind === "video" && (
                      <div className="mt-2 space-y-2">
                        <div className="grid gap-2 md:grid-cols-2">
                          <label className="block text-sm">
                            Sumber video
                            <select
                              data-scene-video-source
                              value={block.source}
                              onChange={(event) =>
                                updateBlock(activeStep, block.id, (current) =>
                                  current.kind === "video"
                                    ? { ...current, source: event.target.value as VideoSource }
                                    : current
                                )
                              }
                              className={controlClass}
                            >
                              {VIDEO_SOURCES.map((source) => (
                                <option key={source} value={source}>
                                  {VIDEO_SOURCE_LABELS[source]}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="block text-sm">
                            Judul video (wajib)
                            <input
                              type="text"
                              data-scene-video-title
                              maxLength={120}
                              value={block.title}
                              onFocus={beginEdit}
                              onChange={(event) =>
                                updateBlock(activeStep, block.id, (current) =>
                                  current.kind === "video"
                                    ? { ...current, title: event.target.value }
                                    : current
                                )
                              }
                              className={controlClass}
                            />
                          </label>
                        </div>

                        {block.source === "youtube" && (
                          <label className="block text-sm">
                            Tautan YouTube
                            <input
                              type="url"
                              data-scene-video-url
                              maxLength={500}
                              placeholder="https://www.youtube.com/watch?v=…"
                              value={block.url}
                              onFocus={beginEdit}
                              onChange={(event) =>
                                updateBlock(activeStep, block.id, (current) =>
                                  current.kind === "video"
                                    ? { ...current, url: event.target.value }
                                    : current
                                )
                              }
                              className={controlClass}
                            />
                            {block.url.trim() !== "" && youtubeId(block.url) === null && (
                              <span className="mt-1 block text-xs text-danger-strong">
                                Tautan belum dikenali sebagai video YouTube.
                              </span>
                            )}
                            <span className="mt-1 block text-xs text-muted">
                              Diputar lewat pemutar youtube-nocookie; butuh koneksi internet.
                            </span>
                          </label>
                        )}

                        {block.source === "daring" && (
                          <label className="block text-sm">
                            Alamat berkas video (https)
                            <input
                              type="url"
                              data-scene-video-url
                              maxLength={500}
                              placeholder="https://contoh.sch.id/video/pembuka.mp4"
                              value={block.url}
                              onFocus={beginEdit}
                              onChange={(event) =>
                                updateBlock(activeStep, block.id, (current) =>
                                  current.kind === "video"
                                    ? { ...current, url: event.target.value }
                                    : current
                                )
                              }
                              className={controlClass}
                            />
                            <span className="mt-1 block text-xs text-muted">
                              Video diputar langsung dari alamat itu. Saat tidak ada koneksi, materi
                              menampilkan pemberitahuan alih-alih pemutar kosong.
                            </span>
                          </label>
                        )}

                        {block.source === "lokal" && (
                          <div className="grid gap-2 md:grid-cols-2">
                            <label className="block text-sm">
                              Berkas video di draft
                              <select
                                data-scene-video
                                value={block.path}
                                onChange={(event) =>
                                  updateBlock(activeStep, block.id, (current) =>
                                    current.kind === "video"
                                      ? { ...current, path: event.target.value }
                                      : current
                                  )
                                }
                                className={controlClass}
                              >
                                <option value="">Pilih video…</option>
                                {videoAssets.map((path) => (
                                  <option key={path} value={path}>
                                    {path}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="block text-sm">
                              Unggah video (mp4, webm; maks 25 MB)
                              <input
                                type="file"
                                accept="video/mp4,video/webm"
                                data-scene-video-file
                                onChange={(event) => {
                                  const file = event.target.files?.[0];
                                  if (file) void handleAssetUpload("video", file, activeStep, block.id);
                                  event.target.value = "";
                                }}
                                disabled={pending}
                                className="mt-1 block w-full text-xs"
                              />
                            </label>
                          </div>
                        )}

                        <label className="block text-sm">
                          Keterangan (opsional)
                          <input
                            type="text"
                            maxLength={300}
                            value={block.caption}
                            onFocus={beginEdit}
                            onChange={(event) =>
                              updateBlock(activeStep, block.id, (current) =>
                                current.kind === "video"
                                  ? { ...current, caption: event.target.value }
                                  : current
                              )
                            }
                            className={controlClass}
                          />
                        </label>
                      </div>
                    )}

                    {block.kind === "semat" && (
                      <div className="mt-2 space-y-2">
                        <div className="grid gap-2 md:grid-cols-2">
                          <label className="block text-sm">
                            Judul sematan (wajib)
                            <input
                              type="text"
                              data-scene-embed-title
                              maxLength={120}
                              value={block.title}
                              onFocus={beginEdit}
                              onChange={(event) =>
                                updateBlock(activeStep, block.id, (current) =>
                                  current.kind === "semat"
                                    ? { ...current, title: event.target.value }
                                    : current
                                )
                              }
                              className={controlClass}
                            />
                          </label>
                          <label className="block text-sm">
                            Keterangan (opsional)
                            <input
                              type="text"
                              maxLength={300}
                              value={block.caption}
                              onFocus={beginEdit}
                              onChange={(event) =>
                                updateBlock(activeStep, block.id, (current) =>
                                  current.kind === "semat"
                                    ? { ...current, caption: event.target.value }
                                    : current
                                )
                              }
                              className={controlClass}
                            />
                          </label>
                        </div>
                        <label className="block text-sm">
                          Alamat halaman HTML (https)
                          <input
                            type="url"
                            data-scene-embed-url
                            maxLength={500}
                            placeholder="https://www.geogebra.org/m/…"
                            value={block.url}
                            onFocus={beginEdit}
                            onChange={(event) =>
                              updateBlock(activeStep, block.id, (current) =>
                                current.kind === "semat"
                                  ? { ...current, url: event.target.value }
                                  : current
                              )
                            }
                            className={controlClass}
                          />
                          <span className="mt-1 block text-xs text-muted">
                            Halaman dimuat di iframe bersandbox (skrip boleh, tanpa akses ke aplikasi);
                            butuh koneksi internet.
                          </span>
                        </label>
                      </div>
                    )}

                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="self-center text-xs text-muted">Sisip di bawah:</span>
                      <button
                        type="button"
                        data-scene-insert-after="teks"
                        onClick={() => insertBlock(activeStep, position, createTextBlock())}
                        disabled={pending || step.blocks.length >= MAX_BLOCKS_PER_STEP}
                        className={`${secondaryButtonClass} px-2 text-xs`}
                      >
                        Teks
                      </button>
                      <button
                        type="button"
                        data-scene-insert-after="gambar"
                        onClick={() =>
                          insertBlock(activeStep, position, createImageBlock(imageAssets[0] ?? ""))
                        }
                        disabled={pending || step.blocks.length >= MAX_BLOCKS_PER_STEP}
                        className={`${secondaryButtonClass} px-2 text-xs`}
                      >
                        Gambar
                      </button>
                      <button
                        type="button"
                        data-scene-insert-after="suara"
                        onClick={() => insertBlock(activeStep, position, createAudioBlock(audioAssets[0] ?? ""))}
                        disabled={pending || step.blocks.length >= MAX_BLOCKS_PER_STEP}
                        className={`${secondaryButtonClass} px-2 text-xs`}
                      >
                        Suara
                      </button>
                      <button
                        type="button"
                        data-scene-insert-after="video"
                        onClick={() => insertBlock(activeStep, position, newVideoBlock())}
                        disabled={pending || step.blocks.length >= MAX_BLOCKS_PER_STEP}
                        className={`${secondaryButtonClass} px-2 text-xs`}
                      >
                        Video
                      </button>
                      <button
                        type="button"
                        data-scene-insert-after="semat"
                        onClick={() => insertBlock(activeStep, position, createEmbedBlock())}
                        disabled={pending || step.blocks.length >= MAX_BLOCKS_PER_STEP}
                        className={`${secondaryButtonClass} px-2 text-xs`}
                      >
                        Semat
                      </button>
                    </div>
                    </div>
                    )}
                  </li>
                ))}
              </ul>
                  </div>

                  <div
                    id="scene-body-panel-preview"
                    role="tabpanel"
                    aria-labelledby="scene-body-tab-preview"
                    data-scene-preview-panel
                    hidden={bodyTab !== "preview"}
                  >
                    <div
                      data-scene-preview-card
                      className="mt-3 rounded-control border border-ink/10 bg-paper p-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                          Pratinjau naskah
                        </h4>
                        <button
                          type="button"
                          data-scene-preview-refresh
                          onClick={() => handlePreview()}
                          disabled={pending}
                          className={`${secondaryButtonClass} px-2 text-xs`}
                        >
                          Muat ulang
                        </button>
                      </div>
                      {preview ? (
                        <>
                          <iframe
                            title="Pratinjau susunan"
                            sandbox="allow-scripts"
                            srcDoc={preview.html}
                            className="mt-2 h-[420px] w-full rounded-control border border-ink/10 bg-white"
                          />
                          <p className="mt-2 text-xs text-muted">
                            {previewStale
                              ? `Naskah berubah setelah pratinjau langkah ${preview.step + 1} dibuat — tekan Muat ulang.`
                              : `Pratinjau langkah ${preview.step + 1}; gambar memakai aset asli draft. Audio, video, dan sematan tampil sebagai penanda di sini — video daring, YouTube, dan sematan baru diputar di materi terpasang.`}
                          </p>
                        </>
                      ) : (
                        <p className="mt-2 text-xs text-muted">
                          Pratinjau muncul otomatis setelah aset draft dimuat, atau tekan Muat ulang.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted">Pilih atau tambahkan langkah untuk mulai menyusun.</p>
              )}
            </section>

            <aside
              data-scene-props
              className="rounded-control border border-ink/10 bg-paper p-3 lg:col-span-2 xl:col-span-1 xl:sticky xl:top-4 xl:max-h-[calc(100vh-8rem)] xl:self-start xl:overflow-y-auto"
            >
              <h3 className="text-sm font-semibold">Parameter</h3>

              <section className="mt-3">
                <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                  Tambah blok
                </h4>
                <div data-scene-add-block-bar className="mt-2 grid grid-cols-2 gap-1.5">
                  {ADD_BLOCK_KINDS.map((kind) => (
                    <button
                      key={kind.kind}
                      type="button"
                      data-scene-add-block={kind.kind}
                      onClick={() => addBlock(kind.kind)}
                      disabled={pending || !step || step.blocks.length >= MAX_BLOCKS_PER_STEP}
                      className={`${secondaryButtonClass} px-2 text-xs`}
                    >
                      {kind.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted">
                  {step
                    ? `Blok baru masuk di akhir langkah ${activeStep + 1}; batas ${MAX_BLOCKS_PER_STEP} blok per langkah.`
                    : "Tambahkan langkah lebih dulu untuk menyisipkan blok."}
                </p>
              </section>

              <section className="mt-3 border-t border-ink/10 pt-3">
                <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                  Langkah
                </h4>
                {step ? (
                  <>
                    <p className="mt-1 text-xs text-muted">
                      Langkah {activeStep + 1} dari {scene.steps.length}
                    </p>
                    <div className="mt-2 space-y-2">
                      <label className="block text-sm">
                        Judul langkah
                        <input
                          type="text"
                          maxLength={120}
                          data-scene-step-title
                          value={step.title}
                          onFocus={beginEdit}
                          onChange={(event) => {
                            setPreviewStale(true);
                            setHistory((state) =>
                              state.present
                                ? {
                                    ...state,
                                    present: {
                                      ...state.present,
                                      steps: state.present.steps.map((item, position) =>
                                        position === activeStep
                                          ? { ...item, title: event.target.value }
                                          : item
                                      )
                                    }
                                  }
                                : state
                            );
                          }}
                          className={controlClass}
                        />
                      </label>
                      <label className="block text-sm">
                        Efek visual (vfx)
                        <select
                          data-scene-effect
                          value={step.effect}
                          onChange={(event) =>
                            updateStep(activeStep, (current) => ({
                              ...current,
                              effect: event.target.value as SceneEffect
                            }))
                          }
                          className={controlClass}
                        >
                          {SCENE_EFFECTS.map((effect) => (
                            <option key={effect} value={effect}>
                              {EFFECT_LABELS[effect]}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block text-sm">
                        Efek suara (sndfx)
                        <select
                          data-scene-sound
                          value={step.sound}
                          onChange={(event) =>
                            updateStep(activeStep, (current) => ({
                              ...current,
                              sound: event.target.value as SceneSound
                            }))
                          }
                          className={controlClass}
                        >
                          {SCENE_SOUNDS.map((sound) => (
                            <option key={sound} value={sound}>
                              {SOUND_LABELS[sound]}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => duplicateStep(activeStep)}
                        disabled={pending || scene.steps.length >= MAX_STEPS}
                        className={`${secondaryButtonClass} px-2 text-xs`}
                      >
                        Duplikat
                      </button>
                      <button
                        type="button"
                        onClick={() => moveStep(activeStep, -1)}
                        disabled={pending || activeStep === 0}
                        className={`${secondaryButtonClass} px-2 text-xs`}
                        aria-label="Naikkan langkah"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveStep(activeStep, 1)}
                        disabled={pending || activeStep >= scene.steps.length - 1}
                        className={`${secondaryButtonClass} px-2 text-xs`}
                        aria-label="Turunkan langkah"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!scene || scene.steps.length <= 1) return;
                          commit((current) => ({
                            ...current,
                            steps: current.steps.filter((_, position) => position !== activeStep)
                          }));
                          setActiveStep(Math.max(0, activeStep - 1));
                        }}
                        disabled={pending || scene.steps.length <= 1}
                        className={`${secondaryButtonClass} px-2 text-xs`}
                      >
                        Hapus langkah
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-muted">
                    Tambahkan langkah untuk menyunting parameternya.
                  </p>
                )}
              </section>

              <section className="mt-3 border-t border-ink/10 pt-3">
                <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                  Halaman
                </h4>
                <div className="mt-2 space-y-2">
                  <label className="block text-sm">
                    Judul halaman
                    <input
                      type="text"
                      maxLength={120}
                      value={scene.title}
                      onFocus={beginEdit}
                      onChange={(event) => {
                        setPreviewStale(true);
                        setHistory((state) =>
                          state.present
                            ? { ...state, present: { ...state.present, title: event.target.value } }
                            : state
                        );
                      }}
                      className={controlClass}
                    />
                  </label>
                  <label className="block text-sm">
                    Tema warna
                    <select
                      value={scene.theme}
                      onChange={(event) =>
                        commit((current) => ({ ...current, theme: event.target.value as SceneTheme }))
                      }
                      className={controlClass}
                    >
                      {SCENE_THEMES.map((theme) => (
                        <option key={theme} value={theme}>
                          {THEME_LABELS[theme]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm">
                    Kalimat pembuka (opsional)
                    <input
                      type="text"
                      maxLength={200}
                      value={scene.subtitle}
                      onFocus={beginEdit}
                      onChange={(event) => {
                        setPreviewStale(true);
                        setHistory((state) =>
                          state.present
                            ? { ...state, present: { ...state.present, subtitle: event.target.value } }
                            : state
                        );
                      }}
                      className={controlClass}
                    />
                  </label>
                </div>
              </section>
            </aside>
          </div>

          <p className="text-xs text-muted">
            Efek suara langkah dibuat langsung oleh perangkat (WebAudio). Blok Suara memakai berkas
            audio di draft; saat naskah memuat suara, Terapkan juga menulis {CAPTIONS_PATH} dan
            menyalakan <code>hasAudio</code> di manifest.
          </p>
        </>
      )}
    </div>
  );
}
