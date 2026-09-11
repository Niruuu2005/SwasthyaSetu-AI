const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '')
  || 'http://localhost:8000';

const TOKEN_KEY = 'swasthya_access_token';

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

type ApiOptions = RequestInit & { auth?: boolean };

export async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((opts.headers as Record<string, string>) || {}),
  };
  if (opts.auth !== false) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${BASE}/api/v1${path}`, { ...opts, headers });
  } catch {
    throw new ApiError('Network error — check connection or queue offline', 0, 'NETWORK_ERROR');
  }

  if (res.status === 401) {
    setToken(null);
    throw new ApiError('Session expired — please sign in again', 401, 'UNAUTHORIZED');
  }

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      body?.error?.message || res.statusText || 'Request failed',
      res.status,
      body?.error?.code || 'HTTP_ERROR',
    );
  }
  return body as T;
}

export function apiBase(): string {
  return BASE;
}

export const DISTRICT_ID =
  (import.meta.env.VITE_DISTRICT_ID as string | undefined) || 'demo-district';
