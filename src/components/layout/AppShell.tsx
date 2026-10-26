import type { ReactNode } from "react";
import type { AppMode, ScreenId } from "../../navigation";
import { MobileNavigation } from "./MobileNavigation";
import { SidebarNavigation } from "./SidebarNavigation";
import { StudentNavigation } from "./StudentNavigation";
import { TopBar } from "./TopBar";

interface AppShellProps {
  activeScreen: ScreenId;
  mode: AppMode;
  modeNotice: string | null;
  onNavigate: (screen: ScreenId) => void;
  onModeChange: (mode: AppMode) => void;
  children: ReactNode;
}

export function AppShell({
  activeScreen,
  mode,
  modeNotice,
  onNavigate,
  onModeChange,
  children
}: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-paper">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-surface focus:px-4 focus:py-3 focus:text-sm focus:font-medium"
      >
        Lewati ke konten utama
      </a>
      {mode === "admin" && (
        <SidebarNavigation activeScreen={activeScreen} onNavigate={onNavigate} />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          activeScreen={activeScreen}
          mode={mode}
          modeNotice={modeNotice}
          onNavigate={onNavigate}
          onModeChange={onModeChange}
        />
        {mode === "belajar" && (
          <StudentNavigation activeScreen={activeScreen} onNavigate={onNavigate} />
        )}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto px-4 pb-28 pt-6 md:px-8 md:pb-10"
        >
          {children}
        </main>
      </div>
      <MobileNavigation activeScreen={activeScreen} mode={mode} onNavigate={onNavigate} />
    </div>
  );
}
