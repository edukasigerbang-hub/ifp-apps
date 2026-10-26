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

function ModeIcon({ mode }: { mode: AppMode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      {mode === "belajar" ? (
        <>
          <path d="M3 9.5 12 4l9 5.5-9 5.5-9-5.5Z" />
          <path d="M7 12.4V16c0 1.5 2.2 2.7 5 2.7s5-1.2 5-2.7v-3.6" />
          <path d="M21 10v4" />
        </>
      ) : (
        <>
          <path d="M4 7h4M12 7h8M4 12h8M16 12h4M4 17h2M10 17h10" />
          <circle cx="10" cy="7" r="2" />
          <circle cx="14" cy="12" r="2" />
          <circle cx="8" cy="17" r="2" />
        </>
      )}
    </svg>
  );
}

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
                aria-label={appModeLabels[value]}
                title={`Mode ${appModeLabels[value].toLowerCase()}`}
                onClick={() => onModeChange(value)}
                className={`flex min-h-11 min-w-11 items-center justify-center rounded-control transition-colors ${
                  isActive ? "bg-primary text-white" : "text-muted hover:bg-surface hover:text-ink"
                }`}
              >
                <ModeIcon mode={value} />
              </button>
            );
          })}
        </div>
        <OfflineIndicator />
      </div>
    </header>
  );
}
