'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useStore();
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid credentials');
        setLoading(false);
        return;
      }
      setUser(data);
      router.push('/');
      router.refresh();
    } catch {
      setError('Something went wrong. Please check your connection.');
      setLoading(false);
    }
  };

  const fillDemo = (role: 'admin' | 'user') => {
    if (role === 'admin') {
      setEmail('admin@store.com');
      setPassword('admin123');
    } else {
      setEmail('user@store.com');
      setPassword('user123');
    }
  };

  return (
    <main className="container narrow">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p className="subtitle">Sign in to your account</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit} className="stack">
          <div className="form-group">
            <label>Email Address</label>
            <input
              className="input"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              className="input"
              placeholder="Your password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="demo-credentials-box">
          <p className="demo-title">🎓 Quick Demo Accounts (Seed First):</p>
          <div className="demo-btn-group">
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => fillDemo('admin')}
            >
              Fill Admin Demo (admin@store.com)
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => fillDemo('user')}
            >
              Fill User Demo (user@store.com)
            </button>
          </div>
        </div>

        <p className="hint">
          Don&apos;t have an account? <Link href="/register" className="text-link">Register here</Link>
        </p>
      </div>
    </main>
  );
}
