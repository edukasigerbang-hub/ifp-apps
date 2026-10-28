import type { StudioDraftContent } from "../../data/materialStudioRepository";

export interface StudioPanelProps {
  content: StudioDraftContent;
  busy: string | null;
  onBusy(value: string | null): void;
  onMessage(value: string | null): void;
  onError(value: string | null): void;
  onApplied(next: StudioDraftContent): void;
}

export const controlClass =
  "mt-1 block min-h-11 w-full rounded-control border border-ink/15 px-3 py-2 text-sm disabled:bg-paper";

export const primaryButtonClass =
  "min-h-11 rounded-control bg-primary px-5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40";

export const secondaryButtonClass =
  "min-h-11 rounded-control border border-ink/15 px-4 text-sm font-medium hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40";

export const noticeClass = "rounded-control border border-ink/10 bg-paper px-4 py-3 text-sm";

export const errorClass =
  "rounded-control border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger-strong";

export function draftKeyOf(content: StudioDraftContent) {
  return {
    materialId: content.draft.materialId,
    version: content.draft.version
  };
}

export function formatKilobytes(bytes: number): string {
  return `${Math.round(bytes / 1024)} KB`;
}
