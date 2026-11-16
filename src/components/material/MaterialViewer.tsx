import { useCallback, useEffect, useRef, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { materialEntryUrl, type MaterialView } from "../../data/materialRepository";
import { getActiveProfile } from "../../data/profileRepository";
import { canPersistLocally } from "../../data/learningRepository";
import { MATERIAL_VIEW_MODE_KEY, readUiState, writeUiState } from "../../data/uiStateRepository";

interface MaterialViewerProps {
  material: MaterialView;
  onClose: () => void;
}

type ViewerStatus = "memuat" | "siap" | "selesai" | "galat";

type ViewMode = "kartu" | "lansekap" | "layar-penuh";

const VIEW_MODE_ORDER: ViewMode[] = ["kartu", "lansekap", "layar-penuh"];

const VIEW_MODE_LABEL: Record<ViewMode, string> = {
  kartu: "Kartu",
  lansekap: "Lansekap",
  "layar-penuh": "Layar penuh"
};

const WIDE_VIEWPORT_PX = 1280;
const READY_TIMEOUT_MS = 12_000;

interface BridgeMessage {
  ifp?: unknown;
  type?: unknown;
  value?: unknown;
}

function readProgress(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }
  return Math.min(1, Math.max(0, value));
}

function nextViewMode(mode: ViewMode): ViewMode {
  const index = VIEW_MODE_ORDER.indexOf(mode);
  return VIEW_MODE_ORDER[(index + 1) % VIEW_MODE_ORDER.length];
}

export function MaterialViewer({ material, onClose }: MaterialViewerProps) {
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const profileIdRef = useRef<string | null>(null);
  const openedAtRef = useRef(Date.now());
  const [status, setStatus] = useState<ViewerStatus>("memuat");
  const [progress, setProgress] = useState(0);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [mode, setMode] = useState<ViewMode>(() =>
    typeof window !== "undefined" && window.innerWidth >= WIDE_VIEWPORT_PX ? "lansekap" : "kartu"
  );

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => {
      previous?.focus?.();
    };
  }, []);

  useEffect(() => {
    if (!canPersistLocally()) {
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const profile = await getActiveProfile();
        const stored = await readUiState(profile.id, MATERIAL_VIEW_MODE_KEY);
        if (cancelled) {
          return;
        }
        profileIdRef.current = profile.id;
        if (stored === "kartu" || stored === "lansekap" || stored === "layar-penuh") {
          setMode(stored);
        }
      } catch {
        // Tanpa profil aktif (mis. pratinjau Studio) mode cukup warisan dari viewport.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Layar penuh memakai API jendela Tauri, bukan Fullscreen API DOM:
  // preseden T-093 menolak Fullscreen API karena WebView2 tidak konsisten.
  useEffect(() => {
    if (!canPersistLocally()) {
      return;
    }
    const appWindow = getCurrentWindow();
    const fullscreen = mode === "layar-penuh";
    void appWindow.setFullscreen(fullscreen).catch(() => undefined);
    return () => {
      if (fullscreen) {
        void appWindow.setFullscreen(false).catch(() => undefined);
      }
    };
  }, [mode]);

  const applyMode = useCallback((next: ViewMode) => {
    setMode(next);
    const profileId = profileIdRef.current;
    if (profileId) {
      void writeUiState(profileId, MATERIAL_VIEW_MODE_KEY, next).catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    if (status !== "memuat") {
      return;
    }
    const timer = window.setTimeout(() => setStatus("galat"), READY_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [status]);

  useEffect(() => {
    function handleMessage(event: MessageEvent<BridgeMessage>) {
      const frame = frameRef.current;
      if (!frame || event.source !== frame.contentWindow) {
        return;
      }
      const data = event.data;
      if (!data || typeof data !== "object" || data.ifp !== 1) {
        return;
      }
      switch (data.type) {
        case "ready": {
          setStatus((current) => (current === "galat" ? current : "siap"));
          frame.contentWindow?.postMessage(
            {
              ifp: 1,
              type: "config",
              theme: "light",
              reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
              locale: material.locale
            },
            "*"
          );
          break;
        }
        case "progress": {
          const next = readProgress(data.value);
          if (next !== null) {
            setProgress(next);
          }
          break;
        }
        case "complete": {
          const dwellSeconds = (Date.now() - openedAtRef.current) / 1000;
          if (dwellSeconds >= material.completionMinDwellSeconds) {
            setStatus("selesai");
          }
          break;
        }
        case "request-exit": {
          onClose();
          break;
        }
        default:
          break;
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [material.completionMinDwellSeconds, material.locale, onClose]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }
      event.stopPropagation();
      if (transcriptOpen) {
        setTranscriptOpen(false);
        return;
      }
      if (mode === "layar-penuh") {
        applyMode("lansekap");
        return;
      }
      onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [applyMode, mode, onClose, transcriptOpen]);

  const percentage = Math.round(progress * 100);
  const statusLabel =
    status === "memuat"
      ? "Memuat materi…"
      : status === "galat"
        ? "Materi tidak merespons."
        : status === "selesai"
          ? "Materi ditandai selesai."
          : "Materi siap.";
  const wide = mode !== "kartu";
  const immersive = mode === "layar-penuh";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-ink/60 ${
        immersive ? "" : wide ? "p-2" : "p-3 md:p-6"
      }`}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="material-viewer-title"
        tabIndex={-1}
        data-material-viewer
        data-material-view-mode={mode}
        className={`flex h-full w-full flex-col overflow-hidden bg-surface shadow-xl outline-none ${
          immersive ? "" : "rounded-card border border-ink/10"
        } ${mode === "kartu" ? "max-w-5xl" : "max-w-none"}`}
      >
        <header
          className={`flex flex-wrap items-start justify-between gap-3 border-b border-ink/10 ${
            immersive ? "p-2 md:p-3" : "p-4 md:p-5"
          }`}
        >
          <div className="min-w-0">
            {!immersive && (
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
                Materi HTML5 · prototipe
              </p>
            )}
            <h2
              id="material-viewer-title"
              className={immersive ? "truncate text-base font-semibold" : "mt-1 truncate text-lg font-semibold"}
            >
              {material.title}
            </h2>
            {!immersive && (
              <p className="mt-1 text-xs text-muted">
                Kelas {material.gradeLevels.join(", ")} · {material.subjects.join(", ")} · ±
                {material.estimatedMinutes} menit · v{material.version}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-material-view-mode-toggle
              onClick={() => applyMode(nextViewMode(mode))}
              title="Ganti lebar penampil: kartu, lansekap, lalu layar penuh"
              className="min-h-11 rounded-control border border-ink/15 px-4 text-sm font-medium hover:bg-paper"
            >
              Tampilan: {VIEW_MODE_LABEL[mode]}
            </button>
            <button
              type="button"
              data-material-transcript-toggle
              aria-pressed={transcriptOpen}
              onClick={() => setTranscriptOpen((open) => !open)}
              className="min-h-11 rounded-control border border-ink/15 px-4 text-sm font-medium hover:bg-paper"
            >
              Transkrip
            </button>
            <button
              type="button"
              data-material-close
              onClick={onClose}
              className="min-h-11 rounded-control bg-primary px-4 text-sm font-semibold text-white hover:opacity-90"
            >
              Keluar
            </button>
          </div>
        </header>

        <div
          className={`flex flex-wrap items-center gap-3 border-b border-ink/10 ${
            immersive ? "px-3 py-1" : "px-4 py-2 md:px-5"
          }`}
        >
          <div
            role="progressbar"
            aria-label="Kemajuan materi"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentage}
            data-material-progress={percentage}
            className="h-2 min-w-32 flex-1 overflow-hidden rounded-full bg-ink/10"
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p data-material-status={status} aria-live="polite" className="text-xs text-muted">
            {statusLabel}
          </p>
        </div>

        <div className="relative flex min-h-0 flex-1">
          <div className="relative min-w-0 flex-1">
            {/* `allow-same-origin` dibutuhkan pemutar YouTube dan sematan https:
                tanpa itu frame bersarang mendapat asal opaque dan menolak diputar.
                Materi dilayani protokol ifp-content (beda asal dengan aplikasi),
                jadi frame tetap tidak bisa menyentuh dokumen induk.

                `referrerPolicy="origin"` bukan pilihan gaya: YouTube menolak memutar
                embed tanpa header Referer (Error 153), dan kebijakan referrer diwarisi
                frame cucu — `no-referrer` di sini membungkam `strict-origin-when-cross-origin`
                pada iframe YouTube di dalam materi. Yang dikirim hanya asal materi
                (http://ifp-content.localhost), bukan nama berkas atau parameter.

                `allow` mendelegasikan izin ke chain frame; tanpa ini tombol layar penuh
                dan picture-in-picture pemutar di langkah berikutnya ditolak kebijakan izin. */}
            <iframe
              ref={frameRef}
              data-material-frame
              title={`Materi: ${material.title}`}
              src={materialEntryUrl(material)}
              sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
              referrerPolicy="origin"
              allow="fullscreen; autoplay; encrypted-media; picture-in-picture"
              onLoad={() => {
                // Pesan `ready` awal bisa hilang selama pemuatan iframe lintas-proses;
                // `hello` memicu materi mengumumkan ulang dirinya.
                frameRef.current?.contentWindow?.postMessage({ ifp: 1, type: "hello" }, "*");
              }}
              className="h-full w-full border-0 bg-paper"
            />
            {status === "memuat" && (
              <p className="pointer-events-none absolute inset-0 flex items-center justify-center bg-paper/80 text-sm text-muted">
                Memuat materi…
              </p>
            )}
            {status === "galat" && (
              <p className="absolute inset-0 flex items-center justify-center bg-paper/95 p-6 text-center text-sm text-danger-strong">
                Materi tidak merespons. Tutup penampil lalu coba lagi.
              </p>
            )}
          </div>
          {transcriptOpen && (
            <aside
              data-material-transcript
              aria-label="Transkrip materi"
              className={`overflow-y-auto border-l border-ink/10 bg-surface p-4 shadow-lg md:p-5 ${
                wide ? "w-[26rem] max-w-[45%] shrink-0" : "absolute inset-y-0 right-0 w-full max-w-sm"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold">Transkrip</h3>
                <button
                  type="button"
                  onClick={() => setTranscriptOpen(false)}
                  className="min-h-11 rounded-control border border-ink/15 px-3 text-xs font-medium hover:bg-paper"
                >
                  Tutup transkrip
                </button>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink/90">
                {material.transcript}
              </p>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
