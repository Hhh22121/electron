import { useEffect, useState } from 'react';
import { api, ApiError, setUnauthorizedHandler, tokenStore, User } from './api';
import Login from './Login';
import TodoList from './TodoList';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(() => !!tokenStore.get());

  const logout = () => {
    tokenStore.clear();
    setUser(null);
  };

  useEffect(() => {
    setUnauthorizedHandler(logout);
    if (!tokenStore.get()) return;
    api
      .me()
      .then(setUser)
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) logout();
      })
      .finally(() => setChecking(false));
  }, []);

  if (checking) return <main className="app">Đang tải…</main>;
  if (!user) return <Login onLogin={setUser} />;
  return <TodoList key={user.id} user={user} onLogout={logout} />;
}
