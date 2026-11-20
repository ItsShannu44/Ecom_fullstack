'use client';

import { Suspense, use, useEffect, useState } from 'react';
import Link from 'next/link';
import { IProduct } from '@/types';
import { useStore } from '@/context/StoreContext';

function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [addedNotice, setAddedNotice] = useState(false);
  const { addToCart } = useStore();

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleAdd = () => {
    if (!product) return;
    addToCart(product);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  if (loading) {
    return (
      <main className="container">
        <div className="empty-state">
          <p>Loading product details...</p>
        </div>
      </main>
    );
  }

  if (!product || (product as any).error) {
    return (
      <main className="container narrow">
        <div className="empty-state-card">
          <div className="empty-icon">⚠️</div>
          <h2>Product Not Found</h2>
          <p className="text-muted">The product you are looking for does not exist or has been removed.</p>
          <Link href="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            ← Back to Store
          </Link>
        </div>
      </main>
    );
  }

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock < 5;

  return (
    <main className="container">
      <div className="breadcrumb">
        <Link href="/" className="text-link">Shop</Link>
        <span>/</span>
        <span className="text-muted">{product.category}</span>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <div className="detail-layout">
        <div className="detail-media">
          <div className="detail-emoji-box">
            <span>{product.emoji || '📦'}</span>
          </div>
        </div>

        <div className="detail-content">
          <div className="detail-badges">
            <span className="category-pill">{product.category}</span>
            {isOutOfStock ? (
              <span className="badge badge-danger">Out of Stock</span>
            ) : isLowStock ? (
              <span className="badge badge-warning">Low Stock: Only {product.stock} units left!</span>
            ) : (
              <span className="badge badge-success">In Stock ({product.stock} available)</span>
            )}
          </div>

          <h1 className="detail-title">{product.name}</h1>
          <p className="detail-price">₹{product.price.toLocaleString()}</p>

          <p className="detail-description">{product.description || 'No description provided.'}</p>

          <div className="detail-features">
            <div className="feature-item">
              <span>🚚</span>
              <div>
                <strong>Free Delivery</strong>
                <p>On orders above ₹1,000</p>
              </div>
            </div>
            <div className="feature-item">
              <span>🛡️</span>
              <div>
                <strong>Verified Quality</strong>
                <p>100% genuine product</p>
              </div>
            </div>
            <div className="feature-item">
              <span>⚡</span>
              <div>
                <strong>Fast Dispatch</strong>
                <p>Within 24 business hours</p>
              </div>
            </div>
          </div>

          {addedNotice && (
            <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
              ✅ Added to your cart! <Link href="/cart" className="text-link" style={{ fontWeight: 600 }}>View Cart</Link>
            </div>
          )}

          <div className="detail-actions">
            <button
              className={`btn btn-lg ${isOutOfStock ? 'btn-disabled' : 'btn-primary'}`}
              disabled={isOutOfStock}
              onClick={handleAdd}
            >
              {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
            </button>
            <Link href="/cart" className="btn btn-lg btn-outline">
              Go to Cart
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <main className="container">
          <div className="empty-state">
            <p>Loading...</p>
          </div>
        </main>
      }
    >
      <ProductDetails params={params} />
    </Suspense>
  );
}
