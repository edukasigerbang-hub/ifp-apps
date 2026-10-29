import { useEffect, useMemo, useState } from "react";
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
  createAudioBlock,
  createId,
  createImageBlock,
  createScene,
  createStep,
  createTextBlock,
  nextStepTitle,
  parseScene,
  sceneIssues,
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
  type TextTone
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
const MAX_THUMBS = 24;

function extensionOf(name: string): string {
  return name.slice(name.lastIndexOf(".") + 1).toLowerCase();
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
  const [ack, setAck] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [thumbError, setThumbError] = useState<string | null>(null);

  useEffect(() => {
    setHistory({ past: [], present: stored, future: [] });
    setActiveStep(0);
    setPreview(null);
    setAck(false);
  }, [stored]);

  const scene = history.present;

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
  const thumbKey = `${content.draft.materialId}@${content.draft.version}:${imageAssets.join("|")}`;

  useEffect(() => {
    const key = draftKeyOf(content);
    let cancelled = false;
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
    })();
    return () => {
      cancelled = true;
    };
    // Kunci string menyegarkan galeri saat aset draft berubah.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thumbKey]);

  const issues = scene ? sceneIssues(scene, assets) : [];
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
    setPreview(null);
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
    setPreview(null);
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
    setPreview(null);
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

  function addBlock(kind: "teks" | "gambar" | "suara") {
    updateStep(activeStep, (step) => {
      if (step.blocks.length >= MAX_BLOCKS_PER_STEP) return step;
      const block =
        kind === "teks"
          ? createTextBlock()
          : kind === "gambar"
            ? createImageBlock(imageAssets[0] ?? "")
            : createAudioBlock(audioAssets[0] ?? "");
      return { ...step, blocks: [...step.blocks, block] };
    });
  }

  async function handleAssetUpload(
    kind: "gambar" | "suara",
    file: File,
    stepIndex: number,
    blockId: string
  ) {
    setUploading(true);
    onError(null);
    onBusy(kind === "gambar" ? "Mengunggah gambar…" : "Mengunggah audio…");
    try {
      const data = await readStudioCoverFile(file);
      const path = assetPathFor(file.name, kind === "gambar" ? "gambar.png" : "audio.mp3");
      const next = await addStudioAsset(draftKeyOf(content), path, data);
      onApplied(next);
      updateBlock(stepIndex, blockId, (block) =>
        block.kind === kind ? { ...block, path } : block
      );
      if (kind === "gambar") {
        setThumbs((current) => ({ ...current, [path]: data }));
      }
      onMessage(`${kind === "gambar" ? "Gambar" : "Audio"} ${path} ditambahkan ke draft.`);
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
    setPreview(renderPreviewDocument(scene, thumbs));
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
          <div className="flex flex-wrap items-center gap-2">
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
            <span className="text-xs text-muted">
              {history.past.length} langkah riwayat
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
            <label className="block text-sm">
              Judul halaman
              <input
                type="text"
                maxLength={120}
                value={scene.title}
                onFocus={beginEdit}
                onChange={(event) =>
                  setHistory((state) =>
                    state.present
                      ? { ...state, present: { ...state.present, title: event.target.value } }
                      : state
                  )
                }
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
          </div>
          <label className="block text-sm">
            Kalimat pembuka (opsional)
            <input
              type="text"
              maxLength={200}
              value={scene.subtitle}
              onFocus={beginEdit}
              onChange={(event) =>
                setHistory((state) =>
                  state.present
                    ? { ...state, present: { ...state.present, subtitle: event.target.value } }
                    : state
                )
              }
              className={controlClass}
            />
          </label>

          <div className="rounded-control border border-ink/10 bg-paper p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">
                Langkah ({scene.steps.length}/{MAX_STEPS})
              </h3>
              <div className="flex flex-wrap gap-2">
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
                <button
                  type="button"
                  onClick={() => duplicateStep(activeStep)}
                  disabled={pending || !step || scene.steps.length >= MAX_STEPS}
                  className={`${secondaryButtonClass} px-3 text-sm`}
                >
                  Duplikat
                </button>
                <button
                  type="button"
                  onClick={() => moveStep(activeStep, -1)}
                  disabled={pending || activeStep === 0}
                  className={`${secondaryButtonClass} px-3 text-sm`}
                  aria-label="Naikkan langkah"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveStep(activeStep, 1)}
                  disabled={pending || activeStep >= scene.steps.length - 1}
                  className={`${secondaryButtonClass} px-3 text-sm`}
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
                  className={`${secondaryButtonClass} px-3 text-sm`}
                >
                  Hapus langkah
                </button>
              </div>
            </div>
            <ol className="mt-3 flex flex-wrap gap-2">
              {scene.steps.map((item, index) => (
                <li key={item.id}>
                  <button
                    type="button"
                    data-scene-step={index}
                    aria-current={index === activeStep ? "step" : undefined}
                    onClick={() => setActiveStep(index)}
                    className={`min-h-11 rounded-control border px-3 text-sm ${
                      index === activeStep
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-ink/15"
                    }`}
                  >
                    {index + 1}. {item.title || "Tanpa judul"}
                  </button>
                </li>
              ))}
            </ol>
          </div>

          {step && (
            <div className="rounded-control border border-ink/10 p-3">
              <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr]">
                <label className="block text-sm">
                  Judul langkah
                  <input
                    type="text"
                    maxLength={120}

                    data-scene-step-title
                    value={step.title}
                    onFocus={beginEdit}
                    onChange={(event) =>
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
                      )
                    }
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

              <ul className="mt-3 space-y-3">
                {step.blocks.map((block, position) => (
                  <li key={block.id} className="rounded-control border border-ink/10 bg-paper p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                        {position + 1}.{" "}
                        {block.kind === "teks" ? "Teks" : block.kind === "gambar" ? "Gambar" : "Suara"}
                      </p>
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
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  data-scene-add-block="teks"
                  onClick={() => addBlock("teks")}
                  disabled={pending || step.blocks.length >= MAX_BLOCKS_PER_STEP}
                  className={`${secondaryButtonClass} text-sm`}
                >
                  + Teks
                </button>
                <button
                  type="button"
                  data-scene-add-block="gambar"
                  onClick={() => addBlock("gambar")}
                  disabled={pending || step.blocks.length >= MAX_BLOCKS_PER_STEP}
                  className={`${secondaryButtonClass} text-sm`}
                >
                  + Gambar
                </button>
                <button
                  type="button"
                  data-scene-add-block="suara"
                  onClick={() => addBlock("suara")}
                  disabled={pending || step.blocks.length >= MAX_BLOCKS_PER_STEP}
                  className={`${secondaryButtonClass} text-sm`}
                >
                  + Suara
                </button>
              </div>
            </div>
          )}

          <p className="text-xs text-muted">
            Efek suara langkah dibuat langsung oleh perangkat (WebAudio). Blok Suara memakai berkas
            audio di draft; saat naskah memuat suara, Terapkan juga menulis {CAPTIONS_PATH} dan
            menyalakan <code>hasAudio</code> di manifest.
          </p>

          {issues.length > 0 && (
            <ul className={errorClass} role="alert">
              {issues.slice(0, 8).map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
              {issues.length > 8 && <li>…dan {issues.length - 8} masalah lain.</li>}
            </ul>
          )}

          <label className="flex items-start gap-2 text-sm">
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

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              data-scene-apply
              onClick={() => void handleApply()}
              disabled={!canApply}
              className={primaryButtonClass}
            >
              {uploading || busy === "Menerapkan susunan…" ? "Menerapkan…" : "Terapkan ke materi"}
            </button>
            <button
              type="button"
              data-scene-preview
              onClick={handlePreview}
              disabled={pending}
              className={secondaryButtonClass}
            >
              Pratinjau susunan
            </button>
          </div>

          {preview && (
            <div className="rounded-control border border-ink/10 p-2">
              <iframe
                title="Pratinjau susunan"
                sandbox="allow-scripts"
                srcDoc={preview}
                className="h-[520px] w-full rounded-control border border-ink/10 bg-white"
              />
              <p className="mt-2 text-xs text-muted">
                Pratinjau memakai gambar asli draft. Berkas audio hanya tampil sebagai pemutar
                kosong karena dipanggil lewat protokol materi.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
