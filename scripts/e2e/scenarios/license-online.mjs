import { execFileSync, spawn } from "node:child_process";
import { generateKeyPairSync } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const PORT = 8788;
const SERIAL = "E2E-SERIAL-1";
const UNKNOWN_SERIAL = "E2E-UNKNOWN-9";
const KEY_ID = "e2e-online-1";
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

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

async function waitForPort(port, timeoutMs = 30_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await isPortBusy(port)) return;
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`Port ${port} tidak siap dalam ${timeoutMs / 1000} detik.`);
}

export async function setup({ artifactDir }) {
  if (await isPortBusy(PORT)) {
    throw new Error(`Port ${PORT} sudah dipakai; hentikan proses lain sebelum E2E lisensi online.`);
  }

  const privatePath = path.join(artifactDir, "license-private.pem");
  const dbPath = path.join(artifactDir, "license-server.db");
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  await writeFile(privatePath, privateKey.export({ type: "pkcs8", format: "pem" }), "utf8");
  const publicDer = publicKey.export({ type: "spki", format: "der" });
  const publicKeyBase64 = Buffer.from(publicDer.subarray(publicDer.length - 32)).toString(
    "base64"
  );

  const logs = [];
  const record = (chunk) => {
    logs.push(chunk.toString());
    if (logs.length > 300) logs.splice(0, logs.length - 300);
  };
  const child = spawn("cmd.exe", ["/c", "npm", "run", "server:dev"], {
    cwd: REPO_ROOT,
    env: {
      ...process.env,
      PORT: String(PORT),
      SYNC_TOKEN: "e2e-sync-token",
      SYNC_DB_PATH: dbPath,
      LICENSE_SIGNING_KEY_PATH: privatePath,
      LICENSE_KEY_ID: KEY_ID,
      LICENSE_SEED_SERIALS: SERIAL,
      LICENSE_ADMIN_TOKEN: "e2e-admin",
      LICENSE_SUBSCRIPTION_DAYS: "30",
      CORS_ORIGIN: "http://localhost:1420"
    },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true
  });
  child.stdout.on("data", record);
  child.stderr.on("data", record);
  let exitCode = null;
  child.once("exit", (code) => {
    exitCode = code;
  });

  try {
    await waitForPort(PORT);
  } catch (error) {
    throw new Error(`Server lisensi gagal start: ${error.message}\n${logs.join("").slice(-3000)}`);
  }
  if (exitCode !== null) {
    throw new Error(`Server lisensi berhenti (kode ${exitCode}).\n${logs.join("").slice(-3000)}`);
  }

  return {
    child,
    logs,
    privatePath,
    dbPath,
    env: {
      VITE_LICENSE_SERVER_URL: `http://localhost:${PORT}`,
      IFP_LICENSE_KEYS: JSON.stringify([{ keyId: KEY_ID, publicKey: publicKeyBase64 }])
    }
  };
}

export async function teardown(setup) {
  if (!setup) return;
  if (setup.child && setup.child.exitCode === null) {
    try {
      execFileSync("taskkill", ["/PID", String(setup.child.pid), "/T", "/F"], {
        stdio: "ignore",
        windowsHide: true
      });
    } catch {
      // sudah berhenti
    }
  }
  await rm(setup.privatePath, { force: true }).catch(() => undefined);
}

async function clickButton(page, label) {
  const result = await page.evaluate(`
    (() => {
      const buttons = [...document.querySelectorAll("button")]
        .filter((button) => button.textContent.trim() === ${JSON.stringify(label)});
      const target = buttons.find((button) => button.offsetParent !== null) ?? buttons[0];
      if (!target) return "missing";
      if (target.disabled) return "disabled";
      target.click();
      return "clicked";
    })()
  `);
  assert(result === "clicked", `Tombol "${label}" tidak dapat diklik (${result}).`);
}

function fillSerial(value) {
  return `
    (() => {
      const input = document.querySelector('input[placeholder="DEV-SERIAL-1"]');
      if (!input) return false;
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      ).set;
      setter.call(input, ${JSON.stringify(value)});
      input.dispatchEvent(new Event("input", { bubbles: true }));
      return true;
    })()
  `;
}

async function invoke(page, command, args = {}) {
  return page.evaluate(`
    window.__TAURI_INTERNALS__
      .invoke(${JSON.stringify(command)}, ${JSON.stringify(args)})
      .then((value) => ({ ok: true, value }))
      .catch((error) => ({ ok: false, error }))
  `);
}

export async function run({ page, artifactDir, setup, log }) {
  await page.waitFor(
    `typeof window.__TAURI_INTERNALS__?.invoke === "function"`,
    { label: "bridge Tauri" }
  );

  const clicked = await page.evaluate(`
    (() => {
      const target = [...document.querySelectorAll("button")]
        .find((button) => button.textContent.trim() === "Lisensi Perangkat");
      if (!target) return false;
      target.click();
      return true;
    })()
  `);
  assert(clicked, "Navigasi Lisensi tidak ditemukan.");
  await page.waitFor(`document.body.textContent.includes("Aktivasi online")`, {
    label: "bagian aktivasi online"
  });
  await page.waitFor(`document.querySelector('input[placeholder="DEV-SERIAL-1"]') !== null`, {
    label: "input serial"
  });
  log("Form aktivasi online tersedia (server dikonfigurasi).");

  const machineResult = await invoke(page, "license_get_machine_id");
  assert(machineResult.ok, "Machine ID gagal dibaca.");
  const machineId = machineResult.value;

  assert(await page.evaluate(fillSerial(SERIAL)), "Input serial tidak ditemukan.");
  await clickButton(page, "Aktivasi online");
  await page.waitFor(`document.body.textContent.includes("Aktivasi online berhasil")`, {
    label: "pesan aktivasi berhasil",
    timeoutMs: 30_000
  });
  await page.waitFor(
    `[...document.querySelectorAll("span")].some((s) => s.textContent.trim() === "Berlaku")`,
    { label: "badge Berlaku" }
  );
  log("Aktivasi online berhasil; UI menampilkan “Berlaku”.");

  const status = await invoke(page, "license_get_status");
  assert(status.ok, "Status lisensi gagal dibaca.");
  assert(status.value.valid === true, "Lisensi hasil aktivasi tidak valid.");
  assert(typeof status.value.licenseId === "string", "licenseId kosong.");
  assert(status.value.entitlements.includes("core"), "Entitlements tidak memuat core.");
  assert(
    status.value.machineId === machineId,
    "Machine ID pada lisensi tidak cocok dengan perangkat."
  );
  log(`Lisensi aktif ${status.value.licenseId} terikat ke machine ${machineId.slice(0, 8)}…`);

  const db = new DatabaseSync(setup.dbPath);
  try {
    const rows = db
      .prepare("SELECT license_id, status, machine_id FROM licenses")
      .all();
    assert(rows.length === 1, `Server memiliki ${rows.length} lisensi, harus 1.`);
    assert(rows[0].status === "active", `Status server: ${rows[0].status}.`);
    assert(rows[0].machine_id === machineId, "Binding machine di server tidak cocok.");
    const audit = db
      .prepare("SELECT COUNT(*) AS total FROM license_audit WHERE action = 'activated'")
      .get();
    assert(audit.total >= 1, "Audit aktivasi tidak tercatat di server.");
    log("Server mencatat lisensi active + audit `activated`.");
  } finally {
    db.close();
  }

  assert(await page.evaluate(fillSerial(UNKNOWN_SERIAL)), "Input serial tidak ditemukan.");
  await clickButton(page, "Aktivasi online");
  await page.waitFor(`document.body.textContent.includes("LICENSE_SERIAL_INVALID")`, {
    label: "error serial tidak dikenal",
    timeoutMs: 30_000
  });
  log("Serial tidak dikenal ditolak (LICENSE_SERIAL_INVALID).");

  const after = await invoke(page, "license_get_status");
  assert(after.ok, "Status akhir gagal dibaca.");
  assert(after.value.valid === true, "Lisensi valid hilang setelah aktivasi gagal.");
  assert(
    after.value.licenseId === status.value.licenseId,
    "Lisensi aktif berubah setelah aktivasi gagal."
  );
  log("Lisensi valid tetap aktif setelah aktivasi gagal.");

  await page.screenshot(path.join(artifactDir, "license-online.png"));
  log("Screenshot aktivasi online tersimpan.");
}
