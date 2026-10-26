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
