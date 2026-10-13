export interface Todo {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
}

let baseUrl: Promise<string> | undefined;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  baseUrl ??= window.api.getUrl();
  const res = await fetch(`${await baseUrl}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.status === 204 ? (undefined as T) : res.json();
}

export const api = {
  list: () => request<Todo[]>('/todos'),
  create: (title: string) => request<Todo>('/todos', { method: 'POST', body: JSON.stringify({ title }) }),
  update: (id: string, patch: Partial<Pick<Todo, 'title' | 'done'>>) =>
    request<Todo>(`/todos/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  remove: (id: string) => request<void>(`/todos/${id}`, { method: 'DELETE' }),
};
