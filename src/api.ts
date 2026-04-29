export function getApiOrigin(): string {
  const configured = import.meta.env.VITE_API_URL as string | undefined;
  if (configured && /^https?:\/\//i.test(configured.trim())) return configured.trim();
  return "";
}

const TOKEN_KEY = "acity_auth_token";

export function loadToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function saveToken(token: string | null): void {
  if (!token) sessionStorage.removeItem(TOKEN_KEY);
  else sessionStorage.setItem(TOKEN_KEY, token);
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { auth?: boolean }
): Promise<T> {
  const origin = getApiOrigin();
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", headers.get("Content-Type") ?? "application/json");
  const token = loadToken();
  if (token && init?.auth !== false) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(`${origin}${path}`, {
    ...init,
    headers,
    body: init?.body,
    cache: init?.cache ?? "no-store",
  });
  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = {};
    }
    const extracted = (body as { error?: unknown })?.error;
    const msg =
      typeof extracted === "string"
        ? extracted
        : extracted
          ? JSON.stringify(extracted)
          : res.statusText;
    throw Object.assign(new Error(String(msg)), { status: res.status, body });
  }
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }
  const text = await res.text();
  return (text ? (JSON.parse(text) as T) : (undefined as T));
}
