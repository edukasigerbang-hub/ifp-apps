import { useCallback, useEffect, useRef } from "react";
import {
  strokeIntersectsPath,
  type PenPoint,
  type PenStroke
} from "./penGeometry";

export type { PenStroke } from "./penGeometry";
export type PenMode = "draw" | "erase";

export const PEN_COLORS = [
  { name: "Hitam", value: "#1f2937" },
  { name: "Teal", value: "#0f766e" },
  { name: "Merah", value: "#dc2626" },
  { name: "Biru", value: "#2563eb" }
] as const;

export const PEN_WIDTHS = [
  { name: "Tipis", value: 3 },
  { name: "Sedang", value: 6 },
  { name: "Tebal", value: 11 }
] as const;

const ERASE_RADIUS = 12;
const ERASER_CURSOR =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='26' height='26'><circle cx='13' cy='13' r='10' fill='rgba(255,255,255,0.4)' stroke='%231f2937' stroke-width='2'/></svg>\") 13 13, cell";

let strokeCounter = 0;

function nextStrokeId(): string {
  strokeCounter += 1;
  return `stroke-${Date.now()}-${strokeCounter}`;
}

function drawStroke(context: CanvasRenderingContext2D, stroke: PenStroke) {
  if (stroke.points.length === 0) {
    return;
  }
  const first = stroke.points[0];
  context.strokeStyle = stroke.color;
  context.fillStyle = stroke.color;
  context.lineWidth = stroke.width;
  context.lineCap = "round";
  context.lineJoin = "round";
  if (stroke.points.length === 1) {
    context.beginPath();
    context.arc(first.x, first.y, stroke.width / 2, 0, Math.PI * 2);
    context.fill();
    return;
  }
  context.beginPath();
  context.moveTo(first.x, first.y);
  for (let index = 1; index < stroke.points.length - 1; index += 1) {
    const current = stroke.points[index];
    const following = stroke.points[index + 1];
    context.quadraticCurveTo(
      current.x,
      current.y,
      (current.x + following.x) / 2,
      (current.y + following.y) / 2
    );
  }
  const last = stroke.points[stroke.points.length - 1];
  context.lineTo(last.x, last.y);
  context.stroke();
}

interface PenCanvasProps {
  active: boolean;
  mode: PenMode;
  color: string;
  width: number;
  strokes: PenStroke[];
  onChange: (next: PenStroke[]) => void;
}

export function PenCanvas({ active, mode, color, width, strokes, onChange }: PenCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef({ width: 1, height: 1, dpr: 1 });
  const strokesRef = useRef(strokes);
  const currentRef = useRef<PenStroke | null>(null);
  const erasedRef = useRef<Set<string> | null>(null);
  const frameRef = useRef(0);

  strokesRef.current = strokes;

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) {
      return;
    }
    const { width: pixelWidth, height: pixelHeight, dpr } = sizeRef.current;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, pixelWidth, pixelHeight);
    const erased = erasedRef.current;
    for (const stroke of strokesRef.current) {
      if (!erased?.has(stroke.id)) {
        drawStroke(context, stroke);
      }
    }
    if (currentRef.current) {
      drawStroke(context, currentRef.current);
    }
  }, []);

  const scheduleRedraw = useCallback(() => {
    if (frameRef.current !== 0) {
      return;
    }
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      redraw();
    });
  }, [redraw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) {
      return;
    }
    function measure() {
      if (!canvas || !host) {
        return;
      }
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const pixelWidth = Math.max(1, Math.round(rect.width));
      const pixelHeight = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(pixelWidth * dpr);
      canvas.height = Math.round(pixelHeight * dpr);
      sizeRef.current = { width: pixelWidth, height: pixelHeight, dpr };
      redraw();
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => {
      observer.disconnect();
      if (frameRef.current !== 0) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      }
    };
  }, [redraw]);

  useEffect(() => {
    redraw();
  }, [strokes, redraw]);

  useEffect(() => {
    if (active) {
      return;
    }
    currentRef.current = null;
    erasedRef.current = null;
    redraw();
  }, [active, redraw]);

  function readPoint(event: React.PointerEvent<HTMLCanvasElement>): PenPoint {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.min(rect.width, Math.max(0, event.clientX - rect.left)),
      y: Math.min(rect.height, Math.max(0, event.clientY - rect.top))
    };
  }

  function collectErased(point: PenPoint) {
    const removed = erasedRef.current ?? new Set<string>();
    erasedRef.current = removed;
    for (const stroke of strokesRef.current) {
      if (removed.has(stroke.id)) {
        continue;
      }
      if (strokeIntersectsPath(stroke, [point], ERASE_RADIUS)) {
        removed.add(stroke.id);
      }
    }
    scheduleRedraw();
  }

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!active || !event.isPrimary || event.button !== 0) {
      return;
    }
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = readPoint(event);
    if (mode === "erase") {
      erasedRef.current = erasedRef.current ?? new Set<string>();
      collectErased(point);
      return;
    }
    currentRef.current = { id: nextStrokeId(), color, width, points: [point] };
    scheduleRedraw();
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!active || !event.isPrimary) {
      return;
    }
    const point = readPoint(event);
    if (mode === "erase") {
      if (erasedRef.current) {
        collectErased(point);
      }
      return;
    }
    const current = currentRef.current;
    if (!current) {
      return;
    }
    const previous = current.points[current.points.length - 1];
    if (Math.hypot(previous.x - point.x, previous.y - point.y) < 1.5) {
      return;
    }
    current.points.push(point);
    scheduleRedraw();
  }

  function finishStroke() {
    const current = currentRef.current;
    currentRef.current = null;
    if (current) {
      onChange([...strokesRef.current, current]);
      return;
    }
    const erased = erasedRef.current;
    erasedRef.current = null;
    if (erased && erased.size > 0) {
      onChange(strokesRef.current.filter((stroke) => !erased.has(stroke.id)));
    }
  }

  function handlePointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!active || !event.isPrimary) {
      return;
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    finishStroke();
  }

  function handlePointerCancel() {
    currentRef.current = null;
    erasedRef.current = null;
    redraw();
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-exploration-pen-canvas
      data-exploration-pen-strokes={strokes.length}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      className={`absolute inset-0 z-10 h-full w-full touch-none select-none ${
        active ? "cursor-crosshair" : "pointer-events-none"
      }`}
      style={active && mode === "erase" ? { cursor: ERASER_CURSOR } : undefined}
    />
  );
}

function PenIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M4 20l4.2-1 9.3-9.3-3.2-3.2L5 15.8 4 20Z" />
      <path d="M13.5 5.5l3.2 3.2M4.8 15.2l4 4" />
    </svg>
  );
}

function EraserIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M8.5 19.5H19" />
      <path d="M4.6 14.4l8.6-8.6a2 2 0 0 1 2.8 0l2.2 2.2a2 2 0 0 1 0 2.8l-6.4 6.4a2 2 0 0 1-2.8 0l-4.4-4.4Z" />
      <path d="M9.4 9.6l5 5" />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M9 7 4.5 11.5 9 16" />
      <path d="M4.5 11.5H14a5.5 5.5 0 0 1 0 11h-2" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M5 7h14M10 4h4M7 7l1 12h8l1-12M10.5 10.5v5M13.5 10.5v5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      className="h-4 w-4"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

interface PenToolbarProps {
  color: string;
  width: number;
  mode: PenMode;
  canUndo: boolean;
  canClear: boolean;
  onColor: (color: string) => void;
  onCycleWidth: () => void;
  onMode: (mode: PenMode) => void;
  onUndo: () => void;
  onClear: () => void;
  onClose: () => void;
}

export function PenToolbar({
  color,
  width,
  mode,
  canUndo,
  canClear,
  onColor,
  onCycleWidth,
  onMode,
  onUndo,
  onClear,
  onClose
}: PenToolbarProps) {
  const widthEntry = PEN_WIDTHS.find((entry) => entry.value === width) ?? PEN_WIDTHS[1];
  const buttonClass =
    "flex h-11 w-11 items-center justify-center rounded-control text-ink hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent";
  return (
    <div
      data-exploration-pen-toolbar
      role="toolbar"
      aria-label="Alat pena"
      className="relative z-20 flex max-w-full flex-wrap items-center gap-0.5 rounded-control border border-ink/10 bg-white p-1 shadow-sm"
    >
      {PEN_COLORS.map((entry) => (
        <button
          key={entry.value}
          type="button"
          data-exploration-pen-color={entry.value}
          aria-label={`Warna ${entry.name}`}
          aria-pressed={mode === "draw" && color === entry.value}
          onClick={() => {
            onColor(entry.value);
            onMode("draw");
          }}
          className={`flex h-11 w-11 items-center justify-center rounded-control hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
            mode === "draw" && color === entry.value ? "bg-paper" : ""
          }`}
        >
          <span
            aria-hidden="true"
            className={`h-5 w-5 rounded-full border border-ink/15 ${
              mode === "draw" && color === entry.value ? "ring-2 ring-ink/40 ring-offset-2 ring-offset-white" : ""
            }`}
            style={{ backgroundColor: entry.value }}
          />
        </button>
      ))}
      <span aria-hidden="true" className="mx-1 h-6 w-px bg-ink/10" />
      <button
        type="button"
        data-exploration-pen-width={width}
        onClick={onCycleWidth}
        aria-label={`Ketebalan ${widthEntry.name}`}
        title={`Ketebalan: ${widthEntry.name}`}
        className={buttonClass}
      >
        <span
          aria-hidden="true"
          className="rounded-full bg-current"
          style={{ width: Math.min(16, 4 + width), height: Math.min(16, 4 + width) }}
        />
      </button>
      <button
        type="button"
        data-exploration-pen-eraser
        aria-pressed={mode === "erase"}
        aria-label="Penghapus"
        title="Penghapus"
        onClick={() => onMode(mode === "erase" ? "draw" : "erase")}
        className={`${buttonClass} ${
          mode === "erase" ? "bg-teal/10 text-teal-strong" : ""
        }`}
      >
        <EraserIcon />
      </button>
      <button
        type="button"
        data-exploration-pen-undo
        onClick={onUndo}
        disabled={!canUndo}
        aria-label="Urungkan coretan terakhir"
        title="Urungkan"
        className={buttonClass}
      >
        <UndoIcon />
      </button>
      <button
        type="button"
        data-exploration-pen-clear
        onClick={onClear}
        disabled={!canClear}
        aria-label="Hapus semua coretan"
        title="Hapus semua"
        className={buttonClass}
      >
        <ClearIcon />
      </button>
      <button
        type="button"
        data-exploration-pen-close
        onClick={onClose}
        aria-label="Selesai mencoret"
        title="Selesai"
        className={buttonClass}
      >
        <CloseIcon />
      </button>
    </div>
  );
}

interface PenToggleProps {
  onToggle: () => void;
}

export function PenToggle({ onToggle }: PenToggleProps) {
  return (
    <button
      type="button"
      data-exploration-pen-toggle
      aria-label="Buka pena untuk mencoret area eksplorasi"
      onClick={onToggle}
      className="relative z-20 flex min-h-11 items-center gap-1.5 rounded-full border border-ink/10 bg-white px-3.5 text-xs font-semibold text-ink shadow-sm transition-colors hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      <PenIcon />
      Pena
    </button>
  );
}
