export interface Todo {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
}

interface AuthResult {
  token: string;
  user: User;
}

// Baked in at build time; the same build runs in the browser and inside Electron.
const baseUrl: string = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3100/api';
const TOKEN_KEY = 'todo.token';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

let onUnauthorized: () => void = () => {};
/** Called when the API rejects the stored token (expired or revoked). */
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

export const tokenStore = {
  get: () => safe(() => localStorage.getItem(TOKEN_KEY)),
  set: (token: string) => safe(() => localStorage.setItem(TOKEN_KEY, token)),
  clear: () => safe(() => localStorage.removeItem(TOKEN_KEY)),
};

function safe<T>(fn: () => T): T | null {
  try {
    return fn();
  } catch {
    return null;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = tokenStore.get();
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized();
    const body = await res.json().catch(() => null);
    const message = Array.isArray(body?.message) ? body.message.join(', ') : (body?.message ?? res.statusText);
    throw new ApiError(res.status, message);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

const post = (body: unknown): RequestInit => ({ method: 'POST', body: JSON.stringify(body) });

export const api = {
  register: (email: string, password: string) => request<AuthResult>('/auth/register', post({ email, password })),
  login: (email: string, password: string) => request<AuthResult>('/auth/login', post({ email, password })),
  me: () => request<User>('/auth/me'),

  list: () => request<Todo[]>('/todos'),
  create: (title: string) => request<Todo>('/todos', post({ title })),
  update: (id: string, patch: Partial<Pick<Todo, 'title' | 'done'>>) =>
    request<Todo>(`/todos/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  remove: (id: string) => request<void>(`/todos/${id}`, { method: 'DELETE' }),
};
