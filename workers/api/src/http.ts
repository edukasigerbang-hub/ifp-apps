export const MAX_BODY_BYTES = 1_048_576;

export function json(status: number, body: unknown, corsOrigin: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": corsOrigin
    }
  });
}

export function failure(status: number, code: string, message: string, corsOrigin: string): Response {
  return json(status, { error: { code, message } }, corsOrigin);
}

export async function readJson(request: Request): Promise<{ ok: true; value: unknown } | { ok: false }> {
  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) {
    return { ok: false };
  }
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false };
  }
}
