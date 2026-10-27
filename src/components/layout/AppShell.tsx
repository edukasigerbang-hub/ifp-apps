import type { ReactNode } from "react";
import type { AppMode, ScreenId } from "../../navigation";
import { MobileNavigation } from "./MobileNavigation";
import { SidebarNavigation } from "./SidebarNavigation";
import { StudentRail } from "./StudentRail";
import { TopBar } from "./TopBar";

interface AppShellProps {
  activeScreen: ScreenId;
  fullscreen: boolean;
  mode: AppMode;
  modeNotice: string | null;
  onNavigate: (screen: ScreenId) => void;
  onModeChange: (mode: AppMode) => void;
  children: ReactNode;
}

export function AppShell({
  activeScreen,
  fullscreen,
  mode,
  modeNotice,
  onNavigate,
  onModeChange,
  children,
}: AppShellProps) {
  // Elemen chrome dibungkus (bukan bersyarat) agar <main> dan isinya tidak
  // di-remount saat layar penuh aktif — jawaban kuis yang belum diperiksa
  // bertahan ketika mode dihidupkan.
  const chromeStyle = fullscreen ? { display: "none" } : undefined;

  return (
    <div className={`flex min-h-screen bg-paper ${fullscreen ? "h-screen overflow-hidden" : ""}`}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-surface focus:px-4 focus:py-3 focus:text-sm focus:font-medium"
      >
        Lewati ke konten utama
      </a>
      <div className="contents" style={chromeStyle}>
        {mode === "admin" ? (
          <SidebarNavigation activeScreen={activeScreen} onNavigate={onNavigate} />
        ) : (
          <StudentRail activeScreen={activeScreen} onNavigate={onNavigate} />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="contents" style={chromeStyle}>
          <TopBar
            activeScreen={activeScreen}
            mode={mode}
            modeNotice={modeNotice}
            onNavigate={onNavigate}
            onModeChange={onModeChange}
          />
        </div>
        <main
          id="main-content"
          className={
            fullscreen
              ? "flex-1 overflow-y-auto px-3 py-3 md:px-5 md:py-4"
              : "flex-1 overflow-y-auto px-4 pb-28 pt-6 md:px-8 md:pb-10"
          }
        >
          {children}
        </main>
      </div>
      <div className="contents" style={chromeStyle}>
        <MobileNavigation activeScreen={activeScreen} mode={mode} onNavigate={onNavigate} />
      </div>
    </div>
  );
}
