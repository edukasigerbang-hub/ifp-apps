import { useState } from "react";
import { AppShell } from "./components/layout/AppShell";
import { findNavItem, type ScreenId } from "./navigation";
import { ScreenPlaceholder } from "./screens/ScreenPlaceholder";

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>("home");
  const activeItem = findNavItem(activeScreen);

  return (
    <AppShell activeScreen={activeScreen} onNavigate={setActiveScreen}>
      <ScreenPlaceholder item={activeItem} />
    </AppShell>
  );
}
