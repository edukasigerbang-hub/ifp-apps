import { useEffect, useState } from "react";
import { AppShell } from "./components/layout/AppShell";
import { canPersistLocally } from "./data/learningRepository";
import { applyPreferences, getPreferences } from "./data/preferencesRepository";
import { useSyncScheduler } from "./hooks/useSyncScheduler";
import { findNavItem, isScreenId, type ScreenId } from "./navigation";
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
  const activeItem = findNavItem(activeScreen);
  useSyncScheduler();

  useEffect(() => {
    if (!canPersistLocally()) {
      return;
    }
    let cancelled = false;
    getPreferences()
      .then((preferences) => {
        if (!cancelled) {
          applyPreferences(preferences);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  function navigate(screen: ScreenId) {
    setActiveScreen(screen);
    window.history.replaceState(null, "", `#${screen}`);
  }

  return (
    <AppShell activeScreen={activeScreen} onNavigate={navigate}>
      {activeScreen === "home" ? (
        <HomeScreen onNavigate={navigate} />
      ) : activeScreen === "curriculum" ? (
        <CurriculumScreen onNavigate={navigate} />
      ) : activeScreen === "player" ? (
        <LessonPlayer />
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
