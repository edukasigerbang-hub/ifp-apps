export interface SupabaseEnv {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

export class SupabaseError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "SupabaseError";
  }
}

function headers(env: SupabaseEnv, prefer?: string): HeadersInit {
  return {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    "content-type": "application/json",
    ...(prefer ? { prefer } : {})
  };
}

export async function rest(
  env: SupabaseEnv,
  path: string,
  init: { method?: string; body?: unknown; prefer?: string } = {}
): Promise<unknown> {
  const response = await fetch(`${env.SUPABASE_URL.replace(/\/+$/, "")}/rest/v1${path}`, {
    method: init.method ?? "GET",
    headers: headers(env, init.prefer),
    body: init.body === undefined ? undefined : JSON.stringify(init.body)
  });
  const text = await response.text();
  if (!response.ok) {
    throw new SupabaseError(response.status, text.slice(0, 500));
  }
  return text.length > 0 ? JSON.parse(text) : null;
}

export async function rpc(
  env: SupabaseEnv,
  functionName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  return rest(env, `/rpc/${functionName}`, { method: "POST", body: args });
}
