const encoder = new TextEncoder();

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const withPadding = padded.padEnd(Math.ceil(padded.length / 4) * 4, "=");
  const binary = atob(withPadding);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function timingSafeEqualBytes(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index];
  }
  return difference === 0;
}

async function hmacSha256(secret: string, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(data)));
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export interface DeviceTokenPayload {
  deviceId: string;
  issuedAt: number;
  expiresAt: number;
}

export async function signDeviceToken(options: {
  deviceId: string;
  secret: string;
  ttlSeconds?: number;
  now?: Date;
}): Promise<{ token: string; expiresAt: string }> {
  const now = options.now ?? new Date();
  const issuedAt = Math.floor(now.getTime() / 1000);
  const expiresAt = issuedAt + (options.ttlSeconds ?? 86_400);
  const payload: DeviceTokenPayload = { deviceId: options.deviceId, issuedAt, expiresAt };
  const encoded = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const signature = await hmacSha256(options.secret, encoded);
  return {
    token: `${encoded}.${base64UrlEncode(signature)}`,
    expiresAt: new Date(expiresAt * 1000).toISOString()
  };
}

export async function verifyDeviceToken(
  token: string,
  secret: string,
  now = new Date()
): Promise<DeviceTokenPayload | null> {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = await hmacSha256(secret, encoded);
  let provided: Uint8Array;
  try {
    provided = base64UrlDecode(signature);
  } catch {
    return null;
  }
  if (!timingSafeEqualBytes(provided, expected)) return null;

  let payload: DeviceTokenPayload;
  try {
    payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(encoded))) as DeviceTokenPayload;
  } catch {
    return null;
  }
  if (!payload || typeof payload.deviceId !== "string" || !isUuid(payload.deviceId)) {
    return null;
  }
  if (typeof payload.expiresAt !== "number" || payload.expiresAt * 1000 <= now.getTime()) {
    return null;
  }
  return payload;
}

export async function hashEnrollmentCode(code: string, pepper: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(`${pepper}:${code.trim()}`)
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
