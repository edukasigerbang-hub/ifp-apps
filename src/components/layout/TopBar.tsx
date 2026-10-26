import { appModeLabels, findNavItem, type AppMode, type ScreenId } from "../../navigation";
import { OfflineIndicator } from "../ui/OfflineIndicator";

interface TopBarProps {
  activeScreen: ScreenId;
  mode: AppMode;
  modeNotice: string | null;
  onNavigate: (screen: ScreenId) => void;
  onModeChange: (mode: AppMode) => void;
}

const modeOrder: AppMode[] = ["belajar", "admin"];

export function TopBar({
  activeScreen,
  mode,
  modeNotice,
  onNavigate,
  onModeChange
}: TopBarProps) {
  const item = findNavItem(activeScreen);

  return (
    <header className="flex min-h-16 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-ink/10 bg-surface px-4 py-2 md:px-8">
      <div className="min-w-0">
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <ol className="flex items-center gap-2">
            {activeScreen !== "home" && (
              <>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate("home")}
                    className="rounded px-1 py-0.5 hover:text-ink hover:underline"
                  >
                    Beranda
                  </button>
                </li>
                <li aria-hidden="true">/</li>
              </>
            )}
            <li aria-current="page" className="truncate font-medium text-ink">
              {item.label}
            </li>
          </ol>
        </nav>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {modeNotice && (
          <p aria-live="polite" className="text-xs text-danger-strong">
            {modeNotice}
          </p>
        )}
        <div
          role="group"
          aria-label="Mode aplikasi"
          className="flex items-center rounded-control border border-ink/15 bg-paper p-0.5"
        >
          {modeOrder.map((value) => {
            const isActive = mode === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={isActive}
                onClick={() => onModeChange(value)}
                className={`min-h-11 rounded-control px-4 text-sm font-semibold transition-colors ${
                  isActive ? "bg-primary text-white" : "text-muted hover:bg-surface hover:text-ink"
                }`}
              >
                {appModeLabels[value]}
              </button>
            );
          })}
        </div>
        <OfflineIndicator />
      </div>
    </header>
  );
}
