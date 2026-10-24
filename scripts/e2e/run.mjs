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
  await page.waitFor("document.readyState === 'complete'", { label: "dokumen siap" });
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
