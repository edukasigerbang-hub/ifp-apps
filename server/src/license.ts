import { createHash, randomUUID, sign, verify, type KeyObject } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(",")}}`;
  }
  if (typeof value === "number" && !Number.isInteger(value)) {
    throw new Error("canonical JSON only supports integers");
  }
  return JSON.stringify(value);
}

export interface LicensePayload {
  schemaVersion: string;
  licenseId: string;
  productId: string;
  licenseType: string;
  machineId: string;
  deviceKeyThumbprint: string | null;
  issuedAt: string;
  notBefore: string;
  expiresAt: string | null;
  offlineGraceDays: number;
  entitlements: string[];
  keyId: string;
}

export interface LicenseFile {
  payload: LicensePayload;
  signature: string;
}

export interface LicenseConfig {
  productId: string;
  keyId: string;
  privateKey: KeyObject;
  publicKey: KeyObject;
  subscriptionDays: number;
  graceDays: number;
  entitlements: string[];
}

export interface LicenseRecord {
  licenseId: string;
  serialHash: string;
  productId: string;
  licenseType: string;
  machineId: string | null;
  status: string;
  issuedAt: string;
  expiresAt: string | null;
  activatedAt: string | null;
  updatedAt: string;
}

export type BindOutcome =
  | { kind: "ok"; record: LicenseRecord }
  | { kind: "missing" }
  | { kind: "revoked" }
  | { kind: "conflict" };

function rowToRecord(row: Record<string, unknown>): LicenseRecord {
  return {
    licenseId: String(row.license_id),
    serialHash: String(row.serial_hash),
    productId: String(row.product_id),
    licenseType: String(row.license_type),
    machineId: row.machine_id === null ? null : String(row.machine_id),
    status: String(row.status),
    issuedAt: String(row.issued_at),
    expiresAt: row.expires_at === null ? null : String(row.expires_at),
    activatedAt: row.activated_at === null ? null : String(row.activated_at),
    updatedAt: String(row.updated_at)
  };
}

export class LicenseStore {
  private readonly db: DatabaseSync;

  constructor(path: string) {
    if (path !== ":memory:") {
      mkdirSync(dirname(path), { recursive: true });
    }
    this.db = new DatabaseSync(path);
    if (path !== ":memory:") {
      this.db.exec("PRAGMA journal_mode = WAL;");
    }
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS licenses (
        license_id TEXT PRIMARY KEY,
        serial_hash TEXT NOT NULL UNIQUE,
        product_id TEXT NOT NULL,
        license_type TEXT NOT NULL,
        machine_id TEXT,
        status TEXT NOT NULL,
        issued_at TEXT NOT NULL,
        expires_at TEXT,
        activated_at TEXT,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS license_audit (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        license_id TEXT,
        action TEXT NOT NULL,
        machine_id TEXT,
        created_at TEXT NOT NULL
      );
    `);
  }

  seed(serial: string, licenseType: string, productId: string, now: string): LicenseRecord {
    const serialHash = createHash("sha256").update(serial).digest("hex");
    const existing = this.findBySerialHash(serialHash);
    if (existing) {
      return existing;
    }
    this.db
      .prepare(
        `INSERT INTO licenses
           (license_id, serial_hash, product_id, license_type, machine_id, status, issued_at, expires_at, activated_at, updated_at)
         VALUES (?, ?, ?, ?, NULL, 'active', ?, NULL, NULL, ?)`
      )
      .run(randomUUID(), serialHash, productId, licenseType, now, now);
    return this.findBySerialHash(serialHash)!;
  }

  findBySerialHash(serialHash: string): LicenseRecord | null {
    const row = this.db.prepare("SELECT * FROM licenses WHERE serial_hash = ?").get(serialHash) as
      | Record<string, unknown>
      | undefined;
    return row ? rowToRecord(row) : null;
  }

  findById(licenseId: string): LicenseRecord | null {
    const row = this.db.prepare("SELECT * FROM licenses WHERE license_id = ?").get(licenseId) as
      | Record<string, unknown>
      | undefined;
    return row ? rowToRecord(row) : null;
  }

  bind(serialHash: string, machineId: string, now: string): BindOutcome {
    const record = this.findBySerialHash(serialHash);
    if (!record) return { kind: "missing" };
    if (record.status === "revoked") return { kind: "revoked" };
    if (record.machineId && record.machineId !== machineId) return { kind: "conflict" };

    this.db
      .prepare(
        "UPDATE licenses SET machine_id = ?, activated_at = COALESCE(activated_at, ?), updated_at = ? WHERE license_id = ?"
      )
      .run(machineId, now, now, record.licenseId);
    this.audit(record.licenseId, "activated", machineId, now);
    return { kind: "ok", record: this.findById(record.licenseId)! };
  }

  setExpiry(licenseId: string, expiresAt: string, now: string): LicenseRecord | null {
    this.db
      .prepare("UPDATE licenses SET expires_at = ?, updated_at = ? WHERE license_id = ?")
      .run(expiresAt, now, licenseId);
    return this.findById(licenseId);
  }

  transfer(licenseId: string, machineId: string, now: string): LicenseRecord | null {
    this.db
      .prepare("UPDATE licenses SET machine_id = ?, updated_at = ? WHERE license_id = ?")
      .run(machineId, now, licenseId);
    this.audit(licenseId, "transferred", machineId, now);
    return this.findById(licenseId);
  }

  deactivate(licenseId: string, now: string): LicenseRecord | null {
    this.db
      .prepare("UPDATE licenses SET machine_id = NULL, activated_at = NULL, updated_at = ? WHERE license_id = ?")
      .run(now, licenseId);
    this.audit(licenseId, "deactivated", null, now);
    return this.findById(licenseId);
  }

  revoke(licenseId: string, now: string): void {
    this.db
      .prepare("UPDATE licenses SET status = 'revoked', updated_at = ? WHERE license_id = ?")
      .run(now, licenseId);
    this.audit(licenseId, "revoked", null, now);
  }

  private audit(licenseId: string, action: string, machineId: string | null, now: string): void {
    this.db
      .prepare("INSERT INTO license_audit (license_id, action, machine_id, created_at) VALUES (?, ?, ?, ?)")
      .run(licenseId, action, machineId, now);
  }

  close(): void {
    this.db.close();
  }
}

export type LicenseResult =
  | { ok: true; license: LicenseFile }
  | { ok: false; status: number; code: string; message: string };

export class LicenseService {
  constructor(
    private readonly store: LicenseStore,
    private readonly config: LicenseConfig
  ) {}

  activate(serial: string, machineId: string, now: Date): LicenseResult {
    const serialHash = createHash("sha256").update(serial).digest("hex");
    const outcome = this.store.bind(serialHash, machineId, now.toISOString());

    if (outcome.kind === "missing") {
      return { ok: false, status: 404, code: "LICENSE_SERIAL_INVALID", message: "Serial tidak dikenal." };
    }
    if (outcome.kind === "revoked") {
      return { ok: false, status: 403, code: "LICENSE_REVOKED", message: "Lisensi dicabut." };
    }
    if (outcome.kind === "conflict") {
      return {
        ok: false,
        status: 409,
        code: "LICENSE_ACTIVATION_CONFLICT",
        message: "Serial sudah terikat ke perangkat lain."
      };
    }

    return this.issue(outcome.record, machineId, now);
  }

  refresh(licenseId: string, machineId: string, now: Date): LicenseResult {
    const record = this.store.findById(licenseId);
    if (!record) {
      return { ok: false, status: 404, code: "LICENSE_NOT_FOUND", message: "Lisensi tidak ditemukan." };
    }
    if (record.status === "revoked") {
      return { ok: false, status: 403, code: "LICENSE_REVOKED", message: "Lisensi dicabut." };
    }
    if (record.machineId !== machineId) {
      return { ok: false, status: 409, code: "LICENSE_DEVICE_MISMATCH", message: "Lisensi tidak terikat ke perangkat ini." };
    }

    let current = record;
    if (record.licenseType === "subscription") {
      const expiresAt = new Date(now.getTime() + this.config.subscriptionDays * 86_400_000).toISOString();
      current = this.store.setExpiry(record.licenseId, expiresAt, now.toISOString()) ?? record;
    }

    return this.issue(current, machineId, now);
  }

  verify(license: LicenseFile, now: Date): boolean {
    const canonical = canonicalJson(license.payload);
    const signature = Buffer.from(license.signature, "base64");
    if (!verify(null, Buffer.from(canonical), this.config.publicKey, signature)) {
      return false;
    }
    const record = this.store.findById(license.payload.licenseId);
    if (!record || record.status === "revoked" || record.machineId !== license.payload.machineId) {
      return false;
    }
    if (license.payload.expiresAt && new Date(license.payload.expiresAt).getTime() < now.getTime()) {
      return false;
    }
    return true;
  }

  transfer(licenseId: string, machineId: string, now: Date): LicenseRecord | null {
    return this.store.transfer(licenseId, machineId, now.toISOString());
  }

  deactivate(licenseId: string, now: Date): LicenseRecord | null {
    return this.store.deactivate(licenseId, now.toISOString());
  }

  private issue(record: LicenseRecord, machineId: string, now: Date): LicenseResult {
    const expiresAt =
      record.licenseType === "perpetual"
        ? null
        : record.expiresAt ??
          new Date(now.getTime() + this.config.subscriptionDays * 86_400_000).toISOString();

    if (record.licenseType === "subscription" && record.expiresAt === null) {
      this.store.setExpiry(record.licenseId, expiresAt!, now.toISOString());
    }

    const payload: LicensePayload = {
      schemaVersion: "1.0.0",
      licenseId: record.licenseId,
      productId: this.config.productId,
      licenseType: record.licenseType,
      machineId,
      deviceKeyThumbprint: null,
      issuedAt: now.toISOString(),
      notBefore: new Date(now.getTime() - 60_000).toISOString(),
      expiresAt,
      offlineGraceDays: this.config.graceDays,
      entitlements: this.config.entitlements,
      keyId: this.config.keyId
    };

    const signature = sign(
      null,
      Buffer.from(canonicalJson(payload), "utf8"),
      this.config.privateKey
    ).toString("base64");

    return { ok: true, license: { payload, signature } };
  }
}
