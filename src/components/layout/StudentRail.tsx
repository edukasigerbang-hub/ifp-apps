import { studentNavigationItems, type ScreenId } from "../../navigation";

interface StudentRailProps {
  activeScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
}

function RailIcon({ screen }: { screen: ScreenId }) {
  const shared = {
    "aria-hidden": true,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-6 w-6"
  };

  if (screen === "home") {
    return (
      <svg {...shared}>
        <path d="M4 10.6 12 4l8 6.6V20a1 1 0 0 1-1 1h-4.8v-6.2H9.8V21H5a1 1 0 0 1-1-1v-9.4Z" />
      </svg>
    );
  }
  if (screen === "curriculum") {
    return (
      <svg {...shared}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      </svg>
    );
  }
  if (screen === "activities") {
    return (
      <svg {...shared}>
        <circle cx="12" cy="12" r="9" />
        <path d="m10 8.4 6 3.6-6 3.6V8.4Z" />
      </svg>
    );
  }
  return (
    <svg {...shared}>
      <path d="M4 20V11M10 20V4M16 20v-6M22 20H2" />
    </svg>
  );
}

export function StudentRail({ activeScreen, onNavigate }: StudentRailProps) {
  return (
    <nav
      aria-label="Navigasi belajar"
      className="hidden w-20 shrink-0 flex-col items-center border-r border-ink/10 bg-surface py-4 md:flex"
    >
      <ul className="flex w-full flex-col items-center gap-2">
        {studentNavigationItems.map((item) => {
          const isActive = item.id === activeScreen;
          return (
            <li key={item.id} className="w-full px-2">
              <button
                type="button"
                aria-current={isActive ? "page" : undefined}
                title={item.label}
                onClick={() => onNavigate(item.id)}
                className={`flex min-h-14 w-full flex-col items-center justify-center rounded-control transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-muted hover:bg-paper hover:text-ink"
                }`}
              >
                <RailIcon screen={item.id} />
                <span className="sr-only">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
