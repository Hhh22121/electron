import { FormEvent, useEffect, useState } from 'react';
import { api, Todo } from './api';

type Filter = 'all' | 'active' | 'done';

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [error, setError] = useState('');

  const run = async (fn: () => Promise<void>) => {
    try {
      setError('');
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  useEffect(() => {
    run(async () => setTodos(await api.list()));
  }, []);

  const add = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    run(async () => {
      const todo = await api.create(title);
      setTodos((ts) => [...ts, todo]);
      setTitle('');
    });
  };

  const toggle = (todo: Todo) =>
    run(async () => {
      const updated = await api.update(todo.id, { done: !todo.done });
      setTodos((ts) => ts.map((t) => (t.id === updated.id ? updated : t)));
    });

  const remove = (id: string) =>
    run(async () => {
      await api.remove(id);
      setTodos((ts) => ts.filter((t) => t.id !== id));
    });

  const visible = todos.filter((t) => (filter === 'all' ? true : filter === 'done' ? t.done : !t.done));
  const remaining = todos.filter((t) => !t.done).length;

  return (
    <main className="app">
      <h1>Todo</h1>

      <form onSubmit={add} className="add">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Việc cần làm..." autoFocus />
        <button type="submit">Thêm</button>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="filters">
        {(['all', 'active', 'done'] as Filter[]).map((f) => (
          <button key={f} className={f === filter ? 'active' : ''} onClick={() => setFilter(f)}>
            {{ all: 'Tất cả', active: 'Chưa xong', done: 'Đã xong' }[f]}
          </button>
        ))}
        <span className="count">{remaining} việc còn lại</span>
      </div>

      <ul className="list">
        {visible.map((t) => (
          <li key={t.id} className={t.done ? 'done' : ''}>
            <label>
              <input type="checkbox" checked={t.done} onChange={() => toggle(t)} />
              <span>{t.title}</span>
            </label>
            <button className="delete" onClick={() => remove(t.id)} aria-label="Xoá">
              ✕
            </button>
          </li>
        ))}
        {visible.length === 0 && <li className="empty">Không có việc nào</li>}
      </ul>
    </main>
  );
}
