'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IOrder } from '@/types';
import { useStore } from '@/context/StoreContext';

export default function OrdersPage() {
  const { user } = useStore();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [payModalOrderId, setPayModalOrderId] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const handlePayPendingOrder = async (orderId: string) => {
    setPayModalOrderId(orderId);
    setPaying(true);
    setPayError('');

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPayError(data.error || 'Payment failed');
        setPaying(false);
        return;
      }
      // Refresh orders
      await fetchOrders();
      setPayModalOrderId(null);
      setPaying(false);
    } catch {
      setPayError('Failed to process payment');
      setPaying(false);
    }
  };

  if (!user && !loading) {
    return (
      <main className="container narrow">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <h2>Please Log In</h2>
          <p className="text-muted">You need to be logged in to view your order history.</p>
          <Link href="/login" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="page-header">
        <div>
          <h1>My Orders</h1>
          <p className="subtitle">Track and view your past purchases</p>
        </div>
        <Link href="/" className="btn btn-outline btn-sm">
          Continue Shopping
        </Link>
      </div>

      {payError && <div className="alert alert-error">{payError}</div>}

      {loading ? (
        <div className="empty-state">
          <p>Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-icon">📦</div>
          <h3>No Orders Yet</h3>
          <p className="text-muted">You haven&apos;t placed any orders with us so far.</p>
          <Link href="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-stack">
          {orders.map((order) => {
            const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div key={order._id} className="order-card">
                <div className="order-card-header">
                  <div className="order-meta">
                    <span className="order-id">
                      Order <strong>#{order._id.slice(-8).toUpperCase()}</strong>
                    </span>
                    <span className="order-date">{formattedDate}</span>
                  </div>

                  <div className="order-status-wrap">
                    <span className={`status-badge status-${order.status}`}>
                      {order.status.toUpperCase()}
                    </span>
                    {order.status === 'pending' && (
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={() => handlePayPendingOrder(order._id)}
                        disabled={paying && payModalOrderId === order._id}
                        style={{ marginLeft: '0.5rem' }}
                      >
                        {paying && payModalOrderId === order._id ? 'Processing...' : '💳 Pay Now'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="order-card-body">
                  <div className="order-items-table">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="order-item-row">
                        <span className="item-name">{item.name}</span>
                        <span className="item-qty">Qty: {item.quantity}</span>
                        <span className="item-price">₹{item.price.toLocaleString()}</span>
                        <span className="item-total">₹{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="order-footer-details">
                    <div className="order-address-box">
                      <strong>📍 Delivery Address:</strong>
                      <p>{order.shippingAddress}</p>
                    </div>

                    <div className="order-totals-box">
                      <div className="total-line">
                        <span>Subtotal:</span>
                        <span>₹{order.subtotal?.toLocaleString()}</span>
                      </div>
                      <div className="total-line">
                        <span>GST / Tax:</span>
                        <span>₹{order.tax?.toLocaleString()}</span>
                      </div>
                      <div className="total-line">
                        <span>Delivery:</span>
                        <span>{order.delivery === 0 ? 'FREE' : `₹${order.delivery}`}</span>
                      </div>
                      <div className="total-line grand-total-line">
                        <strong>Grand Total:</strong>
                        <strong className="text-primary">₹{order.total.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
