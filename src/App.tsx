import { useEffect, useState } from "react";
import { AppShell } from "./components/layout/AppShell";
import { canPersistLocally } from "./data/learningRepository";
import { applyPreferences, getPreferences, setPreferences } from "./data/preferencesRepository";
import { useSyncScheduler } from "./hooks/useSyncScheduler";
import {
  DEFAULT_APP_MODE,
  findNavItem,
  isAppMode,
  isScreenAllowedInMode,
  isScreenId,
  type AppMode,
  type ScreenId,
} from "./navigation";
import { ContentScreen } from "./screens/ContentScreen";
import { CurriculumScreen } from "./screens/CurriculumScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { LessonPlayer } from "./screens/LessonPlayer";
import { LicenseScreen } from "./screens/LicenseScreen";
import { ResultsScreen } from "./screens/ResultsScreen";
import { ScreenPlaceholder } from "./screens/ScreenPlaceholder";
import { SettingsScreen } from "./screens/SettingsScreen";

function initialScreen(): ScreenId {
  const hash = window.location.hash.replace(/^#\/?/, "");
  return isScreenId(hash) ? hash : "home";
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>(initialScreen);
  const [appMode, setAppMode] = useState<AppMode>(DEFAULT_APP_MODE);
  const [modeNotice, setModeNotice] = useState<string | null>(null);
  const [playerFullscreen, setPlayerFullscreen] = useState(false);
  const activeItem = findNavItem(activeScreen);
  useSyncScheduler();

  useEffect(() => {
    if (!canPersistLocally()) {
      return;
    }
    let cancelled = false;
    getPreferences()
      .then((preferences) => {
        if (cancelled) {
          return;
        }
        applyPreferences(preferences);
        const mode = isAppMode(preferences.appMode) ? preferences.appMode : DEFAULT_APP_MODE;
        setAppMode(mode);
        setActiveScreen((current) => (isScreenAllowedInMode(mode, current) ? current : "home"));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  // Dokumen yang menggulir (bukan `main`), jadi tanpa ini layar baru terbuka di
  // posisi gulir layar sebelumnya dan judul/filter di atas tidak terlihat.
  useEffect(() => {
    const scroller = document.scrollingElement ?? document.documentElement;
    scroller.scrollTop = 0;
    document.getElementById("main-content")?.scrollTo({ top: 0 });
  }, [activeScreen]);

  function navigate(screen: ScreenId) {
    const next = isScreenAllowedInMode(appMode, screen) ? screen : "home";
    setActiveScreen(next);
    if (next !== "player") {
      setPlayerFullscreen(false);
    }
    window.history.replaceState(null, "", `#${next}`);
  }

  function applyMode(mode: AppMode) {
    setAppMode(mode);
    setPlayerFullscreen(false);
    setActiveScreen((current) => {
      if (isScreenAllowedInMode(mode, current)) {
        return current;
      }
      window.history.replaceState(null, "", "#home");
      return "home";
    });
  }

  async function changeMode(mode: AppMode) {
    if (mode === appMode) {
      return;
    }
    setModeNotice(null);
    applyMode(mode);
    if (!canPersistLocally()) {
      return;
    }
    try {
      const current = await getPreferences();
      await setPreferences({ ...current, appMode: mode });
    } catch {
      setModeNotice("Mode tidak dapat disimpan di perangkat ini.");
    }
  }

  return (
    <AppShell
      activeScreen={activeScreen}
      fullscreen={playerFullscreen && activeScreen === "player"}
      mode={appMode}
      modeNotice={modeNotice}
      onNavigate={navigate}
      onModeChange={changeMode}
    >
      {activeScreen === "home" ? (
        <HomeScreen onNavigate={navigate} />
      ) : activeScreen === "curriculum" ? (
        <CurriculumScreen onNavigate={navigate} />
      ) : activeScreen === "player" ? (
        <LessonPlayer
          fullscreen={playerFullscreen}
          onFullscreenChange={setPlayerFullscreen}
          onNavigate={navigate}
        />
      ) : activeScreen === "results" ? (
        <ResultsScreen />
      ) : activeScreen === "settings" ? (
        <SettingsScreen />
      ) : activeScreen === "content" ? (
        <ContentScreen />
      ) : activeScreen === "license" ? (
        <LicenseScreen />
      ) : (
        <ScreenPlaceholder item={activeItem} />
      )}
    </AppShell>
  );
}
