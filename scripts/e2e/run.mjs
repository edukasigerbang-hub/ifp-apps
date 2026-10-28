import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { launchApp, stopApp } from "./app.mjs";
import { connect } from "./cdp.mjs";

const scenarioName = process.argv[2] ?? "smoke";
const scenarioUrl = pathToFileURL(
  path.resolve(import.meta.dirname, "scenarios", `${scenarioName}.mjs`)
).href;

let scenario;
try {
  scenario = await import(scenarioUrl);
} catch (error) {
  console.error(`Skenario "${scenarioName}" tidak dapat dimuat: ${error.message}`);
  process.exit(2);
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const artifactDir = path.resolve(import.meta.dirname, "../../.tmp-e2e", stamp);
await mkdir(artifactDir, { recursive: true });

const passed = [];
const log = (message) => {
  passed.push(message);
  console.log(`  ok  ${message}`);
};

// Diagnostik kegagalan: pesan konsol dan exception halaman sering menjelaskan
// kegagalan yang tampak sebagai "timeout" di skenario.
const pageConsole = [];
const recordConsole = (entry) => {
  pageConsole.push(entry);
  if (pageConsole.length > 200) {
    pageConsole.shift();
  }
};

console.log(`E2E "${scenarioName}" — ${artifactDir}`);

let handle;
let page;
let setup;
let failed = false;
let failureMessage = null;
try {
  setup = await scenario.setup?.({ artifactDir });
  handle = await launchApp({
    artifactDir,
    extraEnv: { ...(scenario.env ?? {}), ...(setup?.env ?? {}) }
  });
  page = await connect(handle.target.webSocketDebuggerUrl);
  page.on("Runtime.consoleAPICalled", (params) => {
    if (!["error", "warning", "assert"].includes(params.type)) {
      return;
    }
    const text = (params.args ?? [])
      .map((arg) => arg.value ?? arg.description ?? arg.unserializableValue ?? "")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (text) {
      recordConsole(`[console.${params.type}] ${text.slice(0, 800)}`);
    }
  });
  page.on("Runtime.exceptionThrown", (params) => {
    const details = params.exceptionDetails;
    const detail = details?.exception?.description ?? details?.text ?? "exception";
    recordConsole(`[exception] ${String(detail).replace(/\s+/g, " ").slice(0, 800)}`);
  });
  // Vite mengubah modul sesuai permintaan; setelah proses dev server baru,
  // muatan pertama bisa lambat sehingga `readyState` butuh waktu lebih lama.
  await page.waitFor("document.readyState === 'complete'", {
    label: "dokumen siap",
    timeoutMs: 60_000
  });
  await page.waitFor(`document.body.textContent.includes("Jelajah Materi")`, {
    label: "shell aplikasi",
    timeoutMs: 30_000
  });
  await scenario.run({ page, artifactDir, log, setup });
} catch (error) {
  failed = true;
  failureMessage = error.message;
  console.error(`\nE2E GAGAL: ${error.message}`);
  if (page) {
    try {
      await page.screenshot(path.join(artifactDir, "failure.png"));
      console.error(`Screenshot: ${path.join(artifactDir, "failure.png")}`);
    } catch {
      // halaman mungkin sudah tertutup
    }
  }
  if (handle?.logs?.length) {
    console.error("\n--- log aplikasi (ekor) ---");
    console.error(handle.logs.join("").slice(-6000));
  }
  if (pageConsole.length > 0) {
    console.error("\n--- konsol halaman (ekor) ---");
    console.error(pageConsole.slice(-40).join("\n"));
  }
} finally {
  if (page) {
    page.close();
  }
  await stopApp(handle);
  if (scenario.teardown) {
    try {
      await scenario.teardown(setup);
    } catch (error) {
      failed = true;
      console.error(`Teardown gagal: ${error.message}`);
    }
  }
  await writeFile(
    path.join(artifactDir, "result.json"),
    JSON.stringify(
      {
        scenario: scenarioName,
        passed,
        failed,
        error: failureMessage,
        console: pageConsole,
        finishedAt: new Date().toISOString()
      },
      null,
      2
    ),
    "utf8"
  );
}

if (failed) {
  process.exit(1);
}
console.log(`\nE2E "${scenarioName}" PASS — ${passed.length} pemeriksaan.`);
