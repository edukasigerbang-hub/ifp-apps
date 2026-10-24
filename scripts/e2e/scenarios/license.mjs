import { generateKeyPairSync, randomUUID, sign } from "node:crypto";
import path from "node:path";

const KEY_ID = "e2e-license-1";
const PRODUCT_ID = "ifp-learning";

const { privateKey, publicKey } = generateKeyPairSync("ed25519");
const publicDer = publicKey.export({ type: "spki", format: "der" });
const publicKeyBase64 = Buffer.from(
  publicDer.subarray(publicDer.length - 32)
).toString("base64");

export const env = {
  IFP_LICENSE_KEYS: JSON.stringify([{ keyId: KEY_ID, publicKey: publicKeyBase64 }])
};

function canonical(value) {
  if (Array.isArray(value)) {
    return `[${value.map(canonical).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const keys = Object.keys(value).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function issueLicense(machineId, { licenseId, expiresInDays = 30, notBeforeDays = 1 } = {}) {
  const now = Date.now();
  const payload = {
    schemaVersion: "1.0.0",
    licenseId: licenseId ?? randomUUID(),
    productId: PRODUCT_ID,
    licenseType: "subscription",
    machineId,
    deviceKeyThumbprint: null,
    issuedAt: new Date(now).toISOString(),
    notBefore: new Date(now - notBeforeDays * 86_400_000).toISOString(),
    expiresAt:
      expiresInDays === null ? null : new Date(now + expiresInDays * 86_400_000).toISOString(),
    offlineGraceDays: 7,
    entitlements: ["core"],
    keyId: KEY_ID
  };
  const signature = sign(null, Buffer.from(canonical(payload), "utf8"), privateKey).toString(
    "base64"
  );
  return { payload, signature };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
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

async function invoke(page, command, args = {}) {
  return page.evaluate(`
    window.__TAURI_INTERNALS__
      .invoke(${JSON.stringify(command)}, ${JSON.stringify(args)})
      .then((value) => ({ ok: true, value }))
      .catch((error) => ({ ok: false, error }))
  `);
}

async function importLicense(page, file) {
  return invoke(page, "license_import_json", {
    input: { json: JSON.stringify(file) }
  });
}

async function openLicenseScreen(page) {
  await clickButton(page, "Lisensi Perangkat");
  await page.waitFor(`document.body.textContent.includes("Status lisensi")`, {
    label: "layar Lisensi"
  });
}

async function badgeTexts(page) {
  return page.evaluate(`
    [...document.querySelectorAll("span")]
      .map((element) => element.textContent.trim())
      .filter((text) => ["Berlaku", "Tidak valid", "Belum dikonfigurasi", "Berlaku (grace period)"].includes(text))
  `);
}

export async function run({ page, artifactDir, log }) {
  await page.waitFor(
    `typeof window.__TAURI_INTERNALS__?.invoke === "function"`,
    { label: "bridge Tauri" }
  );

  const machineIdResult = await invoke(page, "license_get_machine_id");
  assert(machineIdResult.ok, `machine ID gagal: ${JSON.stringify(machineIdResult.error)}`);
  const machineId = machineIdResult.value;
  assert(typeof machineId === "string" && machineId.length > 0, "machine ID kosong.");
  log(`Machine ID: ${machineId.slice(0, 8)}…`);

  const before = await invoke(page, "license_get_status");
  assert(before.ok, "Status awal tidak dapat dibaca.");
  assert(before.value.configured === true, "Public key e2e tidak termuat (configured=false).");
  assert(before.value.valid === false, "Lisensi seharusnya belum valid.");

  await openLicenseScreen(page);
  await page.waitFor(
    `[...document.querySelectorAll("span")].some((s) => s.textContent.trim() === "Tidak valid")`,
    { label: "badge Tidak valid" }
  );
  log("Status awal: public key termuat, lisensi tidak valid.");

  const good = issueLicense(machineId);
  const imported = await importLicense(page, good);
  assert(imported.ok, `Impor lisensi gagal: ${JSON.stringify(imported.error)}`);
  assert(imported.value.valid === true, "Status setelah impor tidak valid.");
  assert(
    imported.value.licenseId === good.payload.licenseId,
    "licenseId pada status tidak cocok."
  );
  assert(
    imported.value.entitlements.includes("core"),
    `Entitlements: ${JSON.stringify(imported.value.entitlements)}`
  );
  log("Lisensi valid diimpor dan diverifikasi native (entitlements: core).");

  await clickButton(page, "Beranda");
  await openLicenseScreen(page);
  await page.waitFor(
    `[...document.querySelectorAll("span")].some((s) => s.textContent.trim() === "Berlaku")`,
    { label: "badge Berlaku" }
  );
  await page.waitFor(`document.body.textContent.includes(${JSON.stringify(good.payload.licenseId)})`, {
    label: "licenseId di UI"
  });
  log("UI Lisensi menampilkan “Berlaku” dan licenseId.");

  const expired = issueLicense(machineId, { expiresInDays: -10, notBeforeDays: 20 });
  const expiredResult = await importLicense(page, expired);
  assert(!expiredResult.ok, "Lisensi kedaluwarsa seharusnya ditolak.");
  assert(
    expiredResult.error?.code === "LICENSE_EXPIRED",
    `Kode error kedaluwarsa: ${JSON.stringify(expiredResult.error)}`
  );
  log("Lisensi kedaluwarsa ditolak (LICENSE_EXPIRED).");

  const tamperedBytes = Buffer.from(good.signature, "base64");
  tamperedBytes[0] ^= 0xff;
  const tampered = {
    payload: good.payload,
    signature: tamperedBytes.toString("base64")
  };
  const tamperedResult = await importLicense(page, tampered);
  assert(!tamperedResult.ok, "Lisensi dengan signature rusak seharusnya ditolak.");
  assert(
    tamperedResult.error?.code === "LICENSE_SIGNATURE_INVALID",
    `Kode error signature: ${JSON.stringify(tamperedResult.error)}`
  );
  log("Signature rusak ditolak (LICENSE_SIGNATURE_INVALID).");

  const after = await invoke(page, "license_get_status");
  assert(after.ok, "Status akhir tidak dapat dibaca.");
  assert(after.value.valid === true, "Lisensi valid sebelumnya hilang setelah impor ditolak.");
  assert(
    after.value.licenseId === good.payload.licenseId,
    "Lisensi aktif berubah setelah impor ditolak."
  );

  const entitlements = await invoke(page, "license_get_entitlements");
  assert(entitlements.ok, "Entitlements gagal dibaca.");
  assert(
    Array.isArray(entitlements.value) && entitlements.value.includes("core"),
    `Entitlements akhir: ${JSON.stringify(entitlements.value)}`
  );

  const badges = await badgeTexts(page);
  assert(badges.includes("Berlaku"), `Badge akhir: ${JSON.stringify(badges)}`);
  log("Lisensi valid tetap aktif setelah dua impor ditolak.");

  await page.screenshot(path.join(artifactDir, "license.png"));
  log("Screenshot lisensi tersimpan.");
}
