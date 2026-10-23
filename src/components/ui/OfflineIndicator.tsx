import { useEffect, useState } from "react";
import { StatusBadge } from "./StatusBadge";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <StatusBadge
      tone={isOnline ? "positive" : "warning"}
      label={isOnline ? "Online" : "Offline"}
      title={
        isOnline
          ? "Terhubung ke jaringan"
          : "Tidak ada jaringan. Pembelajaran lokal tetap berjalan."
      }
    />
  );
}
