import { useState } from "react";
import { AppShell } from "./components/layout/AppShell";
import { findNavItem, isScreenId, type ScreenId } from "./navigation";
import { LessonPlayer } from "./screens/LessonPlayer";
import { ResultsScreen } from "./screens/ResultsScreen";
import { ScreenPlaceholder } from "./screens/ScreenPlaceholder";

function initialScreen(): ScreenId {
  const hash = window.location.hash.replace(/^#\/?/, "");
  return isScreenId(hash) ? hash : "home";
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>(initialScreen);
  const activeItem = findNavItem(activeScreen);

  function navigate(screen: ScreenId) {
    setActiveScreen(screen);
    window.history.replaceState(null, "", `#${screen}`);
  }

  return (
    <AppShell activeScreen={activeScreen} onNavigate={navigate}>
      {activeScreen === "player" ? (
        <LessonPlayer />
      ) : activeScreen === "results" ? (
        <ResultsScreen />
      ) : (
        <ScreenPlaceholder item={activeItem} />
      )}
    </AppShell>
  );
}
