import { studentNavigationItems, type ScreenId } from "../../navigation";

interface StudentNavigationProps {
  activeScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
}

export function StudentNavigation({ activeScreen, onNavigate }: StudentNavigationProps) {
  return (
    <nav
      aria-label="Navigasi belajar"
      className="hidden border-b border-ink/10 bg-surface px-4 md:block md:px-8"
    >
      <ul className="flex gap-1 overflow-x-auto py-2">
        {studentNavigationItems.map((item) => {
          const isActive = item.id === activeScreen;
          return (
            <li key={item.id} className="shrink-0">
              <button
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => onNavigate(item.id)}
                className={`min-h-11 whitespace-nowrap rounded-control px-4 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-muted hover:bg-paper hover:text-ink"
                }`}
              >
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
