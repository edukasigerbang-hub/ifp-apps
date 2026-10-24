import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface DeviceTokenPayload {
  deviceId: string;
  issuedAt: number;
  expiresAt: number;
}

export interface IssuedDeviceToken {
  deviceId: string;
  token: string;
  expiresAt: string;
}

function secretMatches(provided: string, expected: string): boolean {
  const providedHash = createHash("sha256").update(provided).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(providedHash, expectedHash);
}

export function enrollmentCodeMatches(provided: string, expected: string): boolean {
  return secretMatches(provided, expected);
}

export function newDeviceId(): string {
  return randomUUID();
}

export function isDeviceId(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export function signDeviceToken(options: {
  deviceId: string;
  secret: string;
  ttlSeconds?: number;
  now?: Date;
}): IssuedDeviceToken {
  const now = options.now ?? new Date();
  const issuedAt = Math.floor(now.getTime() / 1000);
  const expiresAt = issuedAt + (options.ttlSeconds ?? 24 * 60 * 60);
  const payload: DeviceTokenPayload = { deviceId: options.deviceId, issuedAt, expiresAt };
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = createHmac("sha256", options.secret).update(encoded).digest("base64url");
  return {
    deviceId: options.deviceId,
    token: `${encoded}.${signature}`,
    expiresAt: new Date(expiresAt * 1000).toISOString()
  };
}

export function verifyDeviceToken(
  token: string,
  secret: string,
  now = new Date()
): DeviceTokenPayload | null {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = createHmac("sha256", secret).update(encoded).digest();
  let provided: Buffer;
  try {
    provided = Buffer.from(signature, "base64url");
  } catch {
    return null;
  }
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null;
  }

  let payload: DeviceTokenPayload;
  try {
    payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as DeviceTokenPayload;
  } catch {
    return null;
  }
  if (!payload || typeof payload.deviceId !== "string" || !isDeviceId(payload.deviceId)) {
    return null;
  }
  if (typeof payload.expiresAt !== "number" || payload.expiresAt * 1000 <= now.getTime()) {
    return null;
  }
  return payload;
}
