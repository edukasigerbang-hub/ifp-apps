import { useEffect, useRef, useState } from "react";
import {
  AVATAR_OUTPUT,
  AVATAR_TARGET_BYTES,
  AVATAR_VIEWPORT,
  centeredOffset,
  clampOffset,
  coverScale,
  cropDrawRect,
  type Offset,
  type Size
} from "./avatarCrop";

interface AvatarEditorProps {
  sourceUrl: string;
  profileName: string;
  busy: boolean;
  error: string | null;
  onCancel: () => void;
  onSave: (dataUrl: string) => void | Promise<void>;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ENCODE_ATTEMPTS: Array<{ type: string; quality: number }> = [
  { type: "image/webp", quality: 0.9 },
  { type: "image/webp", quality: 0.8 },
  { type: "image/webp", quality: 0.7 },
  { type: "image/webp", quality: 0.6 },
  { type: "image/webp", quality: 0.5 },
  { type: "image/jpeg", quality: 0.85 },
  { type: "image/jpeg", quality: 0.7 }
];

function base64Bytes(dataUrl: string): number {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  return Math.floor((base64.length * 3) / 4);
}

function encodeAvatar(canvas: HTMLCanvasElement): { dataUrl: string; bytes: number } {
  let last: { dataUrl: string; bytes: number } | null = null;
  for (const attempt of ENCODE_ATTEMPTS) {
    const dataUrl = canvas.toDataURL(attempt.type, attempt.quality);
    if (!dataUrl.startsWith(`data:${attempt.type}`)) continue;
    last = { dataUrl, bytes: base64Bytes(dataUrl) };
    if (last.bytes <= AVATAR_TARGET_BYTES) return last;
  }
  if (last) return last;
  const fallback = canvas.toDataURL("image/png");
  return { dataUrl: fallback, bytes: base64Bytes(fallback) };
}

export function AvatarEditor({
  sourceUrl,
  profileName,
  busy,
  error,
  onCancel,
  onSave
}: AvatarEditorProps) {
  const [imageSize, setImageSize] = useState<Size | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [preview, setPreview] = useState<{ dataUrl: string; bytes: number } | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [viewport, setViewport] = useState(AVATAR_VIEWPORT);
  const imageRef = useRef<HTMLImageElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cancelRef = useRef(onCancel);
  cancelRef.current = onCancel;
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const scale = imageSize ? coverScale(imageSize, viewport) * zoom : 1;
  const clamped = imageSize
    ? clampOffset(offset, imageSize, scale, viewport)
    : { x: 0, y: 0 };

  useEffect(() => {
    titleRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") cancelRef.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const update = () =>
      setViewport(Math.max(160, Math.min(AVATAR_VIEWPORT, window.innerWidth - 96)));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!imageSize) return;
    const nextScale = coverScale(imageSize, viewport);
    setZoom(1);
    setOffset(centeredOffset(imageSize, nextScale, viewport));
  }, [imageSize, viewport]);

  useEffect(() => {
    if (!imageSize) return;
    const image = imageRef.current;
    if (!image) return;
    const timer = window.setTimeout(() => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = AVATAR_OUTPUT;
        canvas.height = AVATAR_OUTPUT;
        const context = canvas.getContext("2d");
        if (!context) {
          setLocalError("Kanvas tidak tersedia di perangkat ini.");
          return;
        }
        const rect = cropDrawRect(clamped, imageSize, scale, viewport, AVATAR_OUTPUT);
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, AVATAR_OUTPUT, AVATAR_OUTPUT);
        context.drawImage(image, rect.dx, rect.dy, rect.dw, rect.dh);
        setPreview(encodeAvatar(canvas));
        setLocalError(null);
      } catch {
        setLocalError("Foto gagal diproses. Coba gambar lain.");
      }
    }, 150);
    return () => window.clearTimeout(timer);
  }, [clamped.x, clamped.y, imageSize, scale, viewport]);

  function handleImageLoad(event: React.SyntheticEvent<HTMLImageElement>) {
    const image = event.currentTarget;
    const size = { width: image.naturalWidth, height: image.naturalHeight };
    if (size.width <= 0 || size.height <= 0) {
      setLocalError("Gambar tidak dapat dibaca.");
      return;
    }
    setImageSize(size);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!imageSize) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: clamped.x,
      originY: clamped.y
    };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !imageSize) return;
    setOffset(
      clampOffset(
        {
          x: drag.originX + (event.clientX - drag.startX),
          y: drag.originY + (event.clientY - drag.startY)
        },
        imageSize,
        scale,
        viewport
      )
    );
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  }

  function handleZoom(value: number) {
    setZoom(value);
    if (!imageSize) return;
    const base = coverScale(imageSize, viewport);
    const previousScale = base * zoom;
    const nextScale = base * value;
    setOffset((current) =>
      clampOffset(
        {
          x: current.x - (imageSize.width * (nextScale - previousScale)) / 2,
          y: current.y - (imageSize.height * (nextScale - previousScale)) / 2
        },
        imageSize,
        nextScale,
        viewport
      )
    );
  }

  function resetPosition() {
    if (!imageSize) return;
    setZoom(1);
    setOffset(centeredOffset(imageSize, coverScale(imageSize, viewport), viewport));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="avatar-editor-title"
        data-avatar-editor
        className="w-full max-w-md rounded-card bg-surface p-5 shadow-xl"
      >
        <h2
          ref={titleRef}
          id="avatar-editor-title"
          tabIndex={-1}
          className="text-lg font-semibold outline-none"
        >
          Atur foto profil
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Geser foto dan atur perbesaran. Hasil akhir dipotong persegi 512 px lalu dikompres
          otomatis.
        </p>

        <div className="mt-4 flex justify-center">
          <div
            className="relative touch-none select-none overflow-hidden rounded-full bg-paper ring-1 ring-ink/10"
            style={{ width: viewport, height: viewport, cursor: imageSize ? "grab" : "default" }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <img
              ref={imageRef}
              src={sourceUrl}
              alt=""
              draggable={false}
              onLoad={handleImageLoad}
              className="absolute left-0 top-0 max-w-none"
              style={
                imageSize
                  ? {
                      width: imageSize.width * scale,
                      height: imageSize.height * scale,
                      transform: `translate(${clamped.x}px, ${clamped.y}px)`
                    }
                  : { opacity: 0 }
              }
            />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="avatar-zoom" className="text-sm font-medium">
            Perbesaran
          </label>
          <input
            id="avatar-zoom"
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.05}
            value={zoom}
            onChange={(event) => handleZoom(Number(event.target.value))}
            className="mt-2 w-full accent-primary"
          />
        </div>

        <p className="mt-2 text-xs text-muted" aria-live="polite">
          {preview
            ? `Perkiraan ukuran: ${Math.max(1, Math.round(preview.bytes / 1024))} KB`
            : "Menyiapkan pratinjau…"}
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={resetPosition}
            className="min-h-11 rounded-control border border-ink/15 px-4 text-sm font-medium hover:bg-paper"
          >
            Pusatkan
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="min-h-11 rounded-control border border-ink/15 px-4 text-sm font-medium hover:bg-paper"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => preview && void onSave(preview.dataUrl)}
              disabled={busy || !preview}
              className="min-h-11 rounded-control bg-primary px-5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "Menyimpan…" : "Simpan foto"}
            </button>
          </div>
        </div>

        {(localError || error) && (
          <p className="mt-3 rounded-control border border-danger/40 bg-danger/10 px-4 py-3 text-sm">
            {localError ?? error}
          </p>
        )}
        <p className="mt-3 text-xs text-muted">Foto untuk profil “{profileName}”.</p>
      </div>
    </div>
  );
}
