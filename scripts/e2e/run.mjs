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
let failed = false;
try {
  handle = await launchApp({ artifactDir });
  page = await connect(handle.target.webSocketDebuggerUrl);
  await page.waitFor("document.readyState === 'complete'", { label: "dokumen siap" });
  await scenario.run({ page, artifactDir, log });
} catch (error) {
  failed = true;
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
  await writeFile(
    path.join(artifactDir, "result.json"),
    JSON.stringify(
      {
        scenario: scenarioName,
        passed,
        failed,
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
