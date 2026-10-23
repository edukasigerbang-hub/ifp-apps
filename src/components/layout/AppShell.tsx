import type { ReactNode } from "react";
import type { ScreenId } from "../../navigation";
import { MobileNavigation } from "./MobileNavigation";
import { SidebarNavigation } from "./SidebarNavigation";
import { TopBar } from "./TopBar";

interface AppShellProps {
  activeScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  children: ReactNode;
}

export function AppShell({ activeScreen, onNavigate, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-paper">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-surface focus:px-4 focus:py-3 focus:text-sm focus:font-medium"
      >
        Lewati ke konten utama
      </a>
      <SidebarNavigation activeScreen={activeScreen} onNavigate={onNavigate} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar activeScreen={activeScreen} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto px-4 pb-28 pt-6 md:px-8 md:pb-10"
        >
          {children}
        </main>
      </div>
      <MobileNavigation activeScreen={activeScreen} onNavigate={onNavigate} />
    </div>
  );
}
