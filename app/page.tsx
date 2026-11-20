'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IProduct } from '@/types';
import { useStore } from '@/context/StoreContext';

export default function Home() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [dbNotice, setDbNotice] = useState<string | null>(null);
  const [seedNotice, setSeedNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { addToCart } = useStore();

  const loadProducts = () => {
    setLoading(true);
    fetch(`/api/products?search=${encodeURIComponent(search)}`)
      .then((r) => {
        const dbStatus = r.headers.get('X-DB-Status');
        const dbErr = r.headers.get('X-DB-Error');
        if (dbStatus === 'fallback') {
          setDbNotice(
            decodeURIComponent(dbErr || 'Database offline. Displaying local demo catalog.')
          );
        } else {
          setDbNotice(null);
        }
        return r.json();
      })
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadProducts();
  }, [search]);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedNotice(null);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSeedNotice({ type: 'success', text: data.message || 'Seeded successfully!' });
        await loadProducts();
      } else {
        setSeedNotice({
          type: 'error',
          text: data.error + (data.hint ? ` — ${data.hint}` : ''),
        });
      }
    } catch {
      setSeedNotice({ type: 'error', text: 'Network request failed. Check server logs.' });
    } finally {
      setSeeding(false);
    }
  };

  // Derive categories
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    return true;
  });

  return (
    <main className="container">
      {/* Vercel Database Connection Notice if applicable */}
      {dbNotice && (
        <div className="alert alert-warning" style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          <strong>ℹ️ Notice for Vercel Deployment:</strong> {dbNotice}
          <div style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: '#78350f' }}>
            To enable full persistence on Vercel, go to <strong>Vercel Dashboard &gt; Settings &gt; Environment Variables</strong> and add <code>MONGODB_URI</code> (MongoDB Atlas connection string).
          </div>
        </div>
      )}

      {seedNotice && (
        <div className={`alert ${seedNotice.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {seedNotice.text}
        </div>
      )}

      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <h1>Modern Full-Stack E-Commerce</h1>
          <p>
            Browse high-quality electronics and accessories with secure authentication, real-time
            inventory management, and instant payment checkout.
          </p>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <div className="shop-controls">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search products by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search" onClick={() => setSearch('')}>
              ✕
            </button>
          )}
        </div>

        {categories.length > 1 && (
          <div className="category-chips">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="empty-state">
          <p>Loading products catalog...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-icon">📦</div>
          <h3>No products found</h3>
          <p className="text-muted">
            {products.length === 0
              ? 'Your store catalog is currently empty. Click below to populate demo products.'
              : 'No items match your current filter or search criteria.'}
          </p>
          {products.length === 0 && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSeed}
              disabled={seeding}
              style={{ marginTop: '1rem' }}
            >
              {seeding ? 'Populating Products...' : '🌱 Seed Demo Products'}
            </button>
          )}
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((p) => {
            const isOutOfStock = p.stock === 0;
            const isLowStock = p.stock > 0 && p.stock < 5;

            return (
              <div className="product-card" key={p._id}>
                <div className="product-card-top">
                  <span className="category-pill">{p.category}</span>
                  {isOutOfStock ? (
                    <span className="badge badge-danger">Out of stock</span>
                  ) : isLowStock ? (
                    <span className="badge badge-warning">Only {p.stock} left</span>
                  ) : (
                    <span className="badge badge-success">In stock ({p.stock})</span>
                  )}
                </div>

                <div className="product-image">
                  <span>{p.emoji || '📦'}</span>
                </div>

                <div className="product-info">
                  <h3 className="product-title">
                    <Link href={`/product/${p._id}`}>{p.name}</Link>
                  </h3>
                  <p className="product-desc">{p.description}</p>
                </div>

                <div className="product-card-footer">
                  <div className="product-price">₹{p.price.toLocaleString()}</div>
                  <button
                    className={`btn ${isOutOfStock ? 'btn-disabled' : 'btn-primary'}`}
                    disabled={isOutOfStock}
                    onClick={() => addToCart(p)}
                  >
                    {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
