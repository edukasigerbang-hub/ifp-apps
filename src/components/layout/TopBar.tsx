import { findNavItem, type ScreenId } from "../../navigation";
import { OfflineIndicator } from "../ui/OfflineIndicator";

interface TopBarProps {
  activeScreen: ScreenId;
}

export function TopBar({ activeScreen }: TopBarProps) {
  const item = findNavItem(activeScreen);

  return (
    <header className="flex min-h-16 items-center justify-between gap-4 border-b border-ink/10 bg-surface px-4 md:px-8">
      <div className="min-w-0">
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <ol className="flex items-center gap-2">
            {activeScreen !== "home" && (
              <>
                <li>Beranda</li>
                <li aria-hidden="true">/</li>
              </>
            )}
            <li aria-current="page" className="truncate font-medium text-ink">
              {item.label}
            </li>
          </ol>
        </nav>
      </div>
      <OfflineIndicator />
    </header>
  );
}
