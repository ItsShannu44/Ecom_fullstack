'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useStore();
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }
      setUser(data);
      router.push('/');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main className="container narrow">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p className="subtitle">Join our store to browse, shop, and track orders</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit} className="stack">
          <div className="form-group">
            <label>Full Name</label>
            <input
              className="input"
              placeholder="e.g. John Doe"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
              placeholder="At least 6 characters"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              className="input"
              placeholder="Re-enter password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="hint">
          Already have an account? <Link href="/login" className="text-link">Login here</Link>
        </p>
        <p className="hint text-muted" style={{ fontSize: '0.82rem', marginTop: '0.5rem' }}>
          💡 Note: The very first user registered automatically gets <strong>Admin</strong> privileges.
        </p>
      </div>
    </main>
  );
}
