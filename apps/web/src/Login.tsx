import { FormEvent, useState } from 'react';
import { api, tokenStore, User } from './api';

export default function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { token, user } = await (mode === 'login' ? api.login : api.register)(email, password);
      tokenStore.set(token);
      onLogin(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="app auth">
      <h1>{mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}</h1>
      <form onSubmit={submit} className="auth-form">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required autoFocus />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === 'register' ? 'Mật khẩu (ít nhất 8 ký tự)' : 'Mật khẩu'}
          minLength={mode === 'register' ? 8 : undefined}
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" className="primary" disabled={busy}>
          {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
        </button>
      </form>
      <p className="switch">
        {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
        <button className="link" onClick={() => (setMode(mode === 'login' ? 'register' : 'login'), setError(''))}>
          {mode === 'login' ? 'Đăng ký' : 'Đăng nhập'}
        </button>
      </p>
    </main>
  );
}
