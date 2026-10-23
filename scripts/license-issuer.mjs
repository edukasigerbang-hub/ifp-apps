import { generateKeyPairSync, sign } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function canonical(value) {
  if (Array.isArray(value)) {
    return `[${value.map(canonical).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const keys = Object.keys(value).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
  }
  if (typeof value === "number" && !Number.isInteger(value)) {
    throw new Error("Lisensi hanya mendukung angka integer");
  }
  return JSON.stringify(value);
}

function arg(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const mode = process.argv[2];

if (mode === "generate") {
  const dir = arg("dir", ".");
  const keyId = arg("key-id", "dev-1");
  mkdirSync(dir, { recursive: true });

  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  const privatePem = privateKey.export({ type: "pkcs8", format: "pem" });
  const publicDer = publicKey.export({ type: "spki", format: "der" });
  const publicRaw = Buffer.from(publicDer.subarray(publicDer.length - 32)).toString("base64");

  writeFileSync(join(dir, "private.pem"), privatePem);
  writeFileSync(join(dir, "public.b64"), `${publicRaw}\n`);
  const keys = [{ keyId, publicKey: publicRaw }];
  writeFileSync(join(dir, "keys.json"), `${JSON.stringify(keys)}\n`);

  console.log(JSON.stringify({ keyId, publicKey: publicRaw, keys }, null, 2));
  process.exit(0);
}

if (mode === "issue") {
  const privatePath = arg("private");
  const machineId = arg("machine");
  const out = arg("out");
  const keyId = arg("key-id", "dev-1");
  const productId = arg("product", "ifp-learning");
  const licenseType = arg("type", "subscription");
  const days = Number(arg("days", "30"));

  if (!privatePath || !machineId || !out) {
    throw new Error("issue memerlukan --private, --machine, dan --out");
  }

  const now = new Date();
  const notBefore = new Date(now.getTime() - 60_000);
  const expiresAt =
    licenseType === "perpetual" ? null : new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const payload = {
    schemaVersion: "1.0.0",
    licenseId: crypto.randomUUID(),
    productId,
    licenseType,
    machineId,
    deviceKeyThumbprint: null,
    issuedAt: now.toISOString(),
    notBefore: notBefore.toISOString(),
    expiresAt: expiresAt ? expiresAt.toISOString() : null,
    offlineGraceDays: 7,
    entitlements: ["core"],
    keyId
  };

  const privateKey = readFileSync(privatePath, "utf8");
  const signature = sign(null, Buffer.from(canonical(payload), "utf8"), privateKey);
  const license = { payload, signature: signature.toString("base64") };
  writeFileSync(out, `${JSON.stringify(license, null, 2)}\n`);
  console.log(JSON.stringify({ out, licenseId: payload.licenseId, expiresAt: payload.expiresAt }, null, 2));
  process.exit(0);
}

console.log("Usage:");
console.log("  node scripts/license-issuer.mjs generate --dir <dir> [--key-id dev-1]");
console.log("  node scripts/license-issuer.mjs issue --private <pem> --machine <id> --out <file> [--type subscription|perpetual] [--days 30]");
process.exit(1);
