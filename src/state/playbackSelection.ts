export interface PlaybackSelection {
  packageId: string;
  version?: string;
  lessonId?: string;
}

let current: PlaybackSelection | null = null;

export function setPlaybackSelection(selection: PlaybackSelection): void {
  current = selection;
}

// Pembacaan harus idempoten: effect React berjalan dua kali di StrictMode,
// dan pembacaan sekali-pakai membuat jalur kedua jatuh ke paket pertama.
export function getPlaybackSelection(): PlaybackSelection | null {
  return current;
}

// Muat ulang di Player harus membuka materi yang sama, jadi seleksi juga
// dicerminkan ke hash: #player/<packageId>[/<lessonId>].
export function buildPlayerHash(selection: PlaybackSelection): string {
  const segments = ["player", encodeURIComponent(selection.packageId)];
  if (selection.lessonId) {
    segments.push(encodeURIComponent(selection.lessonId));
  }
  return `#${segments.join("/")}`;
}

export function parsePlayerHash(hash: string): PlaybackSelection | null {
  const raw = String(hash ?? "").replace(/^#\/?/, "");
  const [screen, packageId, lessonId, ...rest] = raw.split("/");
  if (screen !== "player" || rest.length > 0 || !packageId) {
    return null;
  }
  const decoded = safeDecode(packageId);
  if (!decoded) {
    return null;
  }
  const decodedLesson = lessonId ? safeDecode(lessonId) : undefined;
  return decodedLesson
    ? { packageId: decoded, lessonId: decodedLesson }
    : { packageId: decoded };
}

function safeDecode(value: string): string | null {
  try {
    return decodeURIComponent(value) || null;
  } catch {
    return null;
  }
}
