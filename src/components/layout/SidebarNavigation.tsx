import { productConfig } from "../../config/product";
import { navigationItems, type ScreenId } from "../../navigation";

interface SidebarNavigationProps {
  activeScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
}

const groupLabels = {
  belajar: "Belajar",
  kelola: "Kelola"
} as const;

export function SidebarNavigation({ activeScreen, onNavigate }: SidebarNavigationProps) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-navy px-4 py-6 text-white md:flex">
      <div className="px-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
          {productConfig.app.publisherName}
        </p>
        <p className="mt-2 text-lg font-semibold leading-snug">
          {productConfig.app.displayName}
        </p>
      </div>

      <nav aria-label="Navigasi utama" className="mt-8 flex flex-col gap-6">
        {(["belajar", "kelola"] as const).map((group) => (
          <div key={group}>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
              {groupLabels[group]}
            </p>
            <ul className="mt-2 space-y-1">
              {navigationItems
                .filter((item) => item.group === group)
                .map((item) => {
                  const isActive = item.id === activeScreen;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        aria-current={isActive ? "page" : undefined}
                        onClick={() => onNavigate(item.id)}
                        className={`flex min-h-11 w-full items-center rounded-control px-3 py-2 text-left text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-white/15 text-white"
                            : "text-white/75 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {item.label}
                      </button>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </nav>

      <p className="mt-auto px-2 pt-8 text-xs leading-relaxed text-white/50">
        Versi 0.1.0 · scaffold
      </p>
    </aside>
  );
}
