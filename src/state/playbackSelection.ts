export interface PlaybackSelection {
  packageId: string;
  version?: string;
  lessonId?: string;
}

let pending: PlaybackSelection | null = null;

export function setPlaybackSelection(selection: PlaybackSelection): void {
  pending = selection;
}

export function consumePlaybackSelection(): PlaybackSelection | null {
  const current = pending;
  pending = null;
  return current;
}
