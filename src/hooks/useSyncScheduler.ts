import { useEffect } from "react";
import { canPersistLocally } from "../data/learningRepository";
import { isSyncConfigured, runSyncOnce } from "../data/syncEngine";

const INITIAL_DELAY_MS = 10_000;
const INTERVAL_MS = 5 * 60_000;
const OUTBOX_EVENT = "ifp:outbox-changed";

let running = false;

export function notifyOutboxChanged(): void {
  window.dispatchEvent(new Event(OUTBOX_EVENT));
}

async function tick(): Promise<void> {
  if (running || !navigator.onLine) {
    return;
  }
  running = true;
  try {
    await runSyncOnce();
  } catch {
    // Kegagalan dicatat di outbox; scheduler tidak boleh menghentikan aplikasi.
  } finally {
    running = false;
  }
}

export function useSyncScheduler(): void {
  useEffect(() => {
    if (!canPersistLocally() || !isSyncConfigured()) {
      return;
    }

    const initial = window.setTimeout(() => {
      void tick();
    }, INITIAL_DELAY_MS);
    const interval = window.setInterval(() => {
      void tick();
    }, INTERVAL_MS);
    const handleOnline = () => {
      void tick();
    };
    let outboxTimer: number | null = null;
    const handleOutbox = () => {
      if (outboxTimer !== null) {
        window.clearTimeout(outboxTimer);
      }
      outboxTimer = window.setTimeout(() => {
        void tick();
      }, 2_000);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener(OUTBOX_EVENT, handleOutbox);

    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
      window.clearTimeout(outboxTimer ?? undefined);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener(OUTBOX_EVENT, handleOutbox);
    };
  }, []);
}
