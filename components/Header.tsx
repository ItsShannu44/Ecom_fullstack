'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';

export default function Header() {
  const { totalItems, user, setUser, clearCart } = useStore();
  const router = useRouter();

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    clearCart();
    router.push('/');
    router.refresh();
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="logo">
          <span className="logo-icon">🛒</span>
          <span className="logo-text">MiniStore</span>
        </Link>

        <nav className="nav">
          <Link href="/" className="nav-link">
            Shop
          </Link>
          <Link href="/cart" className="nav-link cart-link">
            Cart
            {totalItems > 0 && <span className="cart-counter">{totalItems}</span>}
          </Link>

          {user ? (
            <div className="user-nav-group">
              <Link href="/orders" className="nav-link">
                My Orders
              </Link>
              {user.role === 'admin' && (
                <Link href="/admin" className="admin-badge-link">
                  Admin Panel
                </Link>
              )}
              <div className="user-pill">
                <span className="user-name">👤 {user.name}</span>
                <button type="button" onClick={logout} className="logout-btn" title="Sign out">
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-links">
              <Link href="/login" className="nav-link">
                Login
              </Link>
              <Link href="/register" className="btn btn-sm btn-primary">
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
