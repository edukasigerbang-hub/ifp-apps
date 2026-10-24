import { execFileSync, spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import net from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { fetchTargets } from "./cdp.mjs";

export const DEV_PORT = 1420;
export const CDP_PORT = Number(process.env.IFP_E2E_CDP_PORT ?? 9224);
const REPO_ROOT = path.resolve(import.meta.dirname, "../..");

function isPortBusy(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host: "127.0.0.1" });
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
  });
}

function portOwner(port) {
  try {
    const output = execFileSync("netstat", ["-ano"], { encoding: "utf8", windowsHide: true });
    for (const line of output.split(/\r?\n/)) {
      if (!line.includes(`:${port} `) || !line.includes("LISTENING")) {
        continue;
      }
      const parts = line.trim().split(/\s+/);
      const pid = Number(parts.at(-1));
      if (Number.isInteger(pid) && pid > 0) {
        return pid;
      }
    }
  } catch {
    return null;
  }
  return null;
}

async function waitForTarget(timeoutMs) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const targets = await fetchTargets(CDP_PORT);
      const page = targets.find(
        (target) => target.type === "page" && target.url.includes(`localhost:${DEV_PORT}`)
      );
      if (page?.webSocketDebuggerUrl) {
        return page;
      }
    } catch {
      // WebView2 belum siap.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(
    `WebView2 tidak membuka port debug ${CDP_PORT} dalam ${Math.round(timeoutMs / 1000)} detik.`
  );
}

function runningAppPids() {
  try {
    const output = execFileSync(
      "tasklist",
      ["/FI", "IMAGENAME eq ifp-apps.exe", "/FO", "CSV", "/NH"],
      { encoding: "utf8", windowsHide: true }
    );
    return output
      .split(/\r?\n/)
      .map((line) => line.match(/^"ifp-apps\.exe","(\d+)"/))
      .filter((match) => match !== null)
      .map((match) => Number(match[1]));
  } catch {
    return [];
  }
}

export async function launchApp({ artifactDir, extraEnv } = {}) {
  if (process.platform !== "win32") {
    throw new Error("Harness E2E saat ini hanya mendukung Windows (WebView2 + Tauri).");
  }
  const running = runningAppPids();
  if (running.length > 0) {
    throw new Error(
      `Aplikasi ifp-apps masih berjalan (PID ${running.join(", ")}). ` +
        "Tutup aplikasi dev terlebih dahulu agar WebView2 tidak bentrok."
    );
  }
  if (await isPortBusy(DEV_PORT)) {
    throw new Error(
      `Port ${DEV_PORT} sudah dipakai. Hentikan \`npm run tauri dev\` sebelum menjalankan E2E.`
    );
  }

  const dataDir = await mkdtemp(path.join(tmpdir(), "ifp-e2e-"));
  const env = { ...process.env };
  delete env.VITE_SYNC_BASE_URL;
  delete env.VITE_SYNC_TOKEN;
  delete env.VITE_LICENSE_SERVER_URL;
  env.IFP_DATA_DIR = dataDir;
  Object.assign(env, extraEnv ?? {});
  env.WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS = [
    env.WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS,
    `--remote-debugging-port=${CDP_PORT}`
  ]
    .filter(Boolean)
    .join(" ");

  const logs = [];
  const record = (chunk) => {
    const text = chunk.toString();
    logs.push(text);
    if (logs.length > 400) {
      logs.splice(0, logs.length - 400);
    }
  };

  const child = spawn("cmd.exe", ["/c", "npm", "run", "tauri", "dev"], {
    cwd: REPO_ROOT,
    env,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true
  });
  child.stdout.on("data", record);
  child.stderr.on("data", record);

  let exitCode = null;
  child.once("exit", (code) => {
    exitCode = code;
  });

  const startedAt = Date.now();
  while (Date.now() - startedAt < 300_000) {
    if (exitCode !== null) {
      throw new Error(
        `\`tauri dev\` berhenti dengan kode ${exitCode}.\n${logs.join("").slice(-4000)}`
      );
    }
    try {
      const target = await waitForTarget(1000);
      return { child, dataDir, target, logs, artifactDir };
    } catch {
      // lanjut menunggu sampai batas total
    }
  }

  await stopApp({ child, dataDir });
  throw new Error(`Aplikasi tidak siap dalam 300 detik.\n${logs.join("").slice(-4000)}`);
}

export async function stopApp(handle) {
  if (!handle) {
    return;
  }
  if (handle.child && handle.child.exitCode === null) {
    try {
      execFileSync("taskkill", ["/PID", String(handle.child.pid), "/T", "/F"], {
        stdio: "ignore",
        windowsHide: true
      });
    } catch {
      // Proses sudah berhenti.
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 1500));

  for (const port of [DEV_PORT, CDP_PORT]) {
    if (await isPortBusy(port)) {
      const pid = portOwner(port);
      if (pid) {
        try {
          execFileSync("taskkill", ["/PID", String(pid), "/F"], {
            stdio: "ignore",
            windowsHide: true
          });
        } catch {
          // Biarkan; akan dilaporkan sebagai sisa proses.
        }
      }
    }
  }

  if (handle.dataDir) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        await rm(handle.dataDir, { recursive: true, force: true });
        break;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }
}
