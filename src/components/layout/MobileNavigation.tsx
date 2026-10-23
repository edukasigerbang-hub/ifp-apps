import { navigationItems, type ScreenId } from "../../navigation";

interface MobileNavigationProps {
  activeScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
}

export function MobileNavigation({ activeScreen, onNavigate }: MobileNavigationProps) {
  return (
    <nav
      aria-label="Navigasi utama (seluler)"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-surface md:hidden"
    >
      <ul className="flex gap-1 overflow-x-auto px-2 py-2">
        {navigationItems.map((item) => {
          const isActive = item.id === activeScreen;
          return (
            <li key={item.id} className="shrink-0">
              <button
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => onNavigate(item.id)}
                className={`min-h-12 whitespace-nowrap rounded-control px-4 text-sm font-medium ${
                  isActive ? "bg-primary text-white" : "text-muted hover:bg-paper"
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
