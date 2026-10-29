import { useEffect, useMemo, useState } from "react";
import {
  addStudioAsset,
  messageOf,
  readStudioCoverFile,
  writeStudioFile
} from "../../data/materialStudioRepository";
import {
  EFFECT_LABELS,
  SCENE_EFFECTS,
  SCENE_SOUNDS,
  SCENE_THEMES,
  SOUND_LABELS,
  TEXT_STYLES,
  TEXT_STYLE_LABELS,
  THEME_LABELS,
  MAX_BLOCKS_PER_STEP,
  createId,
  createImageBlock,
  createScene,
  createStep,
  createTextBlock,
  nextStepTitle,
  parseScene,
  sceneIssues,
  type Scene,
  type SceneBlock,
  type SceneEffect,
  type SceneSound,
  type SceneStep,
  type SceneTheme,
  type TextStyle
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

function extensionOf(name: string): string {
  return name.slice(name.lastIndexOf(".") + 1).toLowerCase();
}

function assetPathFor(name: string): string {
  const base = name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  const extension = extensionOf(name);
  return `assets/${base || "gambar"}.${IMAGE_EXTENSIONS.has(extension) ? extension : "png"}`;
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

  const [scene, setScene] = useState<Scene | null>(stored);
  const [activeStep, setActiveStep] = useState(0);
  const [ack, setAck] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setScene(stored);
    setActiveStep(0);
    setPreview(null);
    setAck(false);
  }, [stored]);

  const assetPaths = useMemo(
    () => content.files.filter((file) => !file.editable).map((file) => file.path),
    [content.files]
  );
  const imageAssets = useMemo(
    () => assetPaths.filter((path) => IMAGE_EXTENSIONS.has(extensionOf(path))),
    [assetPaths]
  );

  const issues = scene ? sceneIssues(scene, assetPaths) : [];
  const hasStoredScene = stored !== null;
  const pending = busy !== null || uploading;
  const canApply = scene !== null && issues.length === 0 && !pending && ack;

  function touch(next: Scene) {
    setScene(next);
    setPreview(null);
  }

  function updateStep(index: number, change: (step: SceneStep) => SceneStep) {
    if (!scene) return;
    touch({
      ...scene,
      steps: scene.steps.map((step, position) => (position === index ? change(step) : step))
    });
  }

  function updateBlock(stepIndex: number, blockId: string, change: (block: SceneBlock) => SceneBlock) {
    updateStep(stepIndex, (step) => ({
      ...step,
      blocks: step.blocks.map((block) => (block.id === blockId ? change(block) : block))
    }));
  }

  function moveStep(index: number, delta: number) {
    if (!scene) return;
    const target = index + delta;
    if (target < 0 || target >= scene.steps.length) return;
    const steps = [...scene.steps];
    const [moved] = steps.splice(index, 1);
    steps.splice(target, 0, moved);
    touch({ ...scene, steps });
    setActiveStep(target);
  }

  function duplicateStep(index: number) {
    if (!scene) return;
    const source = scene.steps[index];
    const copy: SceneStep = {
      ...source,
      id: createId("langkah"),
      title: `${source.title} (salinan)`,
      blocks: source.blocks.map((block) => ({
        ...block,
        id: createId(block.kind)
      }))
    };
    const steps = [...scene.steps];
    steps.splice(index + 1, 0, copy);
    touch({ ...scene, steps });
    setActiveStep(index + 1);
  }

  function addBlock(stepIndex: number, kind: "teks" | "gambar") {
    updateStep(stepIndex, (step) => {
      if (step.blocks.length >= MAX_BLOCKS_PER_STEP) return step;
      const block = kind === "teks" ? createTextBlock() : createImageBlock(imageAssets[0] ?? "");
      return { ...step, blocks: [...step.blocks, block] };
    });
  }

  async function handleImageUpload(stepIndex: number, blockId: string, file: File) {
    if (!scene) return;
    setUploading(true);
    onError(null);
    onBusy("Mengunggah gambar…");
    try {
      const data = await readStudioCoverFile(file);
      const path = assetPathFor(file.name);
      const next = await addStudioAsset(draftKeyOf(content), path, data);
      onApplied(next);
      updateBlock(stepIndex, blockId, (block) =>
        block.kind === "gambar" ? { ...block, path } : block
      );
      onMessage(`Gambar ${path} ditambahkan ke draft.`);
    } catch (caught) {
      onError(messageOf(caught, "Gambar gagal ditambahkan."));
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
      onApplied(next);
      onMessage(`Susunan diterapkan: ${files.summary}.`);
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
    setPreview(renderPreviewDocument(scene));
  }

  const step = scene?.steps[activeStep] ?? null;

  return (
    <div data-scene-panel className="mt-4 space-y-4">
      {!scene && (
        <div className={noticeClass}>
          <p className="font-medium">Bundel ini belum punya naskah visual.</p>
          <p className="mt-1 text-muted">
            Tab Susun menyusun halaman dari blok teks, gambar, efek, dan efek suara. Setelah
            naskah dibuat, menekan Terapkan akan <strong>menimpa</strong> index.html, assets/style.css,
            dan assets/app.js dengan hasil susunan.
          </p>
          <button
            type="button"
            data-scene-start
            onClick={() => {
              const draft = createScene(content.draft.title);
              setScene(draft);
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
          <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
            <label className="block text-sm">
              Judul halaman
              <input
                type="text"
                maxLength={120}
                value={scene.title}
                onChange={(event) => touch({ ...scene, title: event.target.value })}
                className={controlClass}
              />
            </label>
            <label className="block text-sm">
              Tema warna
              <select
                value={scene.theme}
                onChange={(event) =>
                  touch({ ...scene, theme: event.target.value as SceneTheme })
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
              onChange={(event) => touch({ ...scene, subtitle: event.target.value })}
              className={controlClass}
            />
          </label>

          <div className="rounded-control border border-ink/10 bg-paper p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">
                Langkah ({scene.steps.length}/{20})
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  data-scene-add-step
                  onClick={() => {
                    if (scene.steps.length >= 20) return;
                    const steps = [...scene.steps, createStep(scene.steps.length)];
                    steps[steps.length - 1].title = nextStepTitle(scene.steps);
                    touch({ ...scene, steps });
                    setActiveStep(steps.length - 1);
                  }}
                  disabled={pending || scene.steps.length >= 20}
                  className={`${secondaryButtonClass} px-3 text-sm`}
                >
                  + Langkah
                </button>
                <button
                  type="button"
                  onClick={() => duplicateStep(activeStep)}
                  disabled={pending || !step || scene.steps.length >= 20}
                  className={`${secondaryButtonClass} px-3 text-sm`}
                >
                  Duplikat
                </button>
                <button
                  type="button"
                  onClick={() => moveStep(activeStep, -1)}
                  disabled={pending || activeStep === 0}
                  className={`${secondaryButtonClass} px-3 text-sm`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveStep(activeStep, 1)}
                  disabled={pending || activeStep >= scene.steps.length - 1}
                  className={`${secondaryButtonClass} px-3 text-sm`}
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!scene || scene.steps.length <= 1) return;
                    const steps = scene.steps.filter((_, position) => position !== activeStep);
                    touch({ ...scene, steps });
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
                    value={step.title}
                    onChange={(event) =>
                      updateStep(activeStep, (current) => ({ ...current, title: event.target.value }))
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
                        {position + 1}. {block.kind === "teks" ? "Teks" : "Gambar"}
                      </p>
                      <div className="flex gap-2">
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

                    {block.kind === "teks" ? (
                      <div className="mt-2 grid gap-2 md:grid-cols-[1fr_2fr]">
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
                    ) : (
                      <div className="mt-2 grid gap-2 md:grid-cols-2">
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
                          <input
                            type="file"
                            accept="image/webp,image/png,image/jpeg"
                            aria-label="Unggah gambar baru"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (file) void handleImageUpload(activeStep, block.id, file);
                              event.target.value = "";
                            }}
                            disabled={pending}
                            className="mt-2 block w-full text-xs"
                          />
                        </label>
                        <div className="grid gap-2">
                          <label className="block text-sm">
                            Teks alternatif (wajib)
                            <input
                              type="text"
                              data-scene-alt
                              value={block.alt}
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
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  data-scene-add-block="teks"
                  onClick={() => addBlock(activeStep, "teks")}
                  disabled={pending || step.blocks.length >= MAX_BLOCKS_PER_STEP}
                  className={`${secondaryButtonClass} text-sm`}
                >
                  + Teks
                </button>
                <button
                  type="button"
                  data-scene-add-block="gambar"
                  onClick={() => addBlock(activeStep, "gambar")}
                  disabled={pending || step.blocks.length >= MAX_BLOCKS_PER_STEP}
                  className={`${secondaryButtonClass} text-sm`}
                >
                  + Gambar
                </button>
              </div>
            </div>
          )}

          <p className="text-xs text-muted">
            Efek suara dibuat langsung oleh perangkat (WebAudio), jadi tidak ada berkas audio
            atau CDN di bundel. Audio narasi tetap lewat tab Aset dan tab Kode.
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
                Gambar tampil sebagai kotak placeholder di pratinjau ini; gunakan Pratinjau materi
                di atas untuk melihat berkas aslinya.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
