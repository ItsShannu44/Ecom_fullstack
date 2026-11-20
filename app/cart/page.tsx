'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';

export default function CartPage() {
  const { cart, updateQty, removeFromCart, clearCart, totalPrice, user } = useStore();
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Payment Gateway Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Dummy payment details for simulated card / UPI
  const [cardHolder, setCardHolder] = useState('John Doe');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [selectedPayOption, setSelectedPayOption] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [upiId, setUpiId] = useState('user@okaxis');

  const router = useRouter();

  const tax = Math.round(totalPrice * 0.05);
  const delivery = totalPrice >= 1000 || totalPrice === 0 ? 0 : 49;
  const grandTotal = totalPrice + tax + delivery;

  // Step 1: Place Order
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      router.push('/login');
      return;
    }

    if (!address.trim()) {
      return setError('Please enter your shipping address.');
    }

    if (cart.length === 0) {
      return setError('Your cart is empty.');
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((i) => ({ productId: i._id, quantity: i.quantity })),
          shippingAddress: address,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create order');
        setIsSubmitting(false);
        return;
      }

      // If user chose Online Payment, open the online payment gateway
      if (paymentMethod === 'online') {
        setCurrentOrderId(data._id);
        setShowPaymentModal(true);
        setIsSubmitting(false);
      } else {
        // COD order placed
        clearCart();
        router.push('/orders');
      }
    } catch {
      setError('Network error while processing order.');
      setIsSubmitting(false);
    }
  };

  // Step 2: Process Online Payment
  const processOnlinePayment = async () => {
    if (!currentOrderId) return;
    setPaymentLoading(true);
    setPaymentError('');

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: currentOrderId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPaymentError(data.error || 'Payment declined. Please retry.');
        setPaymentLoading(false);
        return;
      }

      setPaymentSuccess(true);
      clearCart();
      setTimeout(() => {
        setShowPaymentModal(false);
        router.push('/orders');
      }, 1800);
    } catch {
      setPaymentError('Payment gateway timeout. Try again.');
      setPaymentLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main className="container narrow">
        <div className="empty-cart-card">
          <div className="empty-icon">🛍️</div>
          <h2>Your Cart is Empty</h2>
          <p className="text-muted">You haven&apos;t added any items to your shopping cart yet.</p>
          <Link href="/" className="btn btn-primary" style={{ marginTop: '1.25rem' }}>
            Explore Products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="cart-page-header">
        <h1>Shopping Cart &amp; Checkout</h1>
        <p className="subtitle">Review your items and complete your order</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="cart-layout">
        {/* Left Column: Cart Items */}
        <div className="cart-items-section">
          <div className="cart-list">
            {cart.map((item) => (
              <div key={item._id} className="cart-item-row">
                <div className="cart-item-emoji">{item.emoji}</div>
                <div className="cart-item-details">
                  <Link href={`/product/${item._id}`} className="cart-item-name">
                    {item.name}
                  </Link>
                  <p className="cart-item-cat">{item.category}</p>
                  <p className="cart-item-unit-price">₹{item.price.toLocaleString()} each</p>
                </div>

                <div className="cart-item-actions">
                  <div className="qty-picker">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => updateQty(item._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="qty-number">{item.quantity}</span>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => updateQty(item._id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      title={item.quantity >= item.stock ? 'Maximum stock available' : 'Add one'}
                    >
                      +
                    </button>
                  </div>
                  <div className="cart-item-subtotal">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </div>
                  <button
                    type="button"
                    className="cart-remove-btn"
                    onClick={() => removeFromCart(item._id)}
                    title="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-actions-bar">
            <button type="button" className="btn btn-outline btn-sm" onClick={clearCart}>
              Clear Cart
            </button>
            <Link href="/" className="text-link" style={{ fontSize: '0.9rem' }}>
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right Column: Checkout & Summary */}
        <div className="cart-summary-section">
          <div className="summary-card">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Items Subtotal</span>
              <span>₹{totalPrice.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>GST / Tax (5%)</span>
              <span>₹{tax.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>{delivery === 0 ? <strong className="text-success">FREE</strong> : `₹${delivery}`}</span>
            </div>
            {delivery > 0 && (
              <p className="text-muted" style={{ fontSize: '0.78rem', margin: '0.25rem 0' }}>
                💡 Tip: Orders above ₹1,000 get free delivery!
              </p>
            )}
            <hr className="divider" />
            <div className="summary-row total-row">
              <span>Grand Total</span>
              <span className="total-amount">₹{grandTotal.toLocaleString()}</span>
            </div>

            <form onSubmit={handleCheckout} className="checkout-form">
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>
                  Shipping Address <span className="text-danger">*</span>
                </label>
                <textarea
                  className="input textarea"
                  rows={2}
                  placeholder="Enter flat/house no, street, city, pin code..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <div className="payment-method-selector">
                  <label className={`payment-pill ${paymentMethod === 'online' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                    />
                    <span>💳 Online Payment (Gateway)</span>
                  </label>
                  <label className={`payment-pill ${paymentMethod === 'cod' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                    />
                    <span>💵 Cash on Delivery</span>
                  </label>
                </div>
              </div>

              {!user && (
                <div className="alert alert-warning" style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  ⚠️ You must be logged in to place an order.
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Processing...'
                  : !user
                  ? 'Login to Checkout'
                  : paymentMethod === 'online'
                  ? `Proceed to Pay ₹${grandTotal.toLocaleString()}`
                  : 'Place COD Order'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Online Payment Modal */}
      {showPaymentModal && (
        <div className="modal-backdrop">
          <div className="payment-modal-card">
            <div className="modal-header">
              <div className="gateway-brand">
                <span className="gateway-badge">TEST MODE</span>
                <h4>Secure Payment Gateway</h4>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => !paymentLoading && setShowPaymentModal(false)}
                disabled={paymentLoading}
              >
                ✕
              </button>
            </div>

            {paymentSuccess ? (
              <div className="payment-success-view">
                <div className="success-icon">✅</div>
                <h3>Payment Successful!</h3>
                <p className="text-muted">Transaction ID: MOCKPAY_{Date.now()}</p>
                <p className="text-muted">Your order has been confirmed. Redirecting to Orders...</p>
              </div>
            ) : (
              <div className="modal-body">
                <div className="pay-amount-banner">
                  <span>Total Payable:</span>
                  <span className="pay-amount">₹{grandTotal.toLocaleString()}</span>
                </div>

                {paymentError && <div className="alert alert-error">{paymentError}</div>}

                {/* Payment Option Tabs */}
                <div className="pay-method-tabs">
                  <button
                    type="button"
                    className={`pay-tab ${selectedPayOption === 'card' ? 'active' : ''}`}
                    onClick={() => setSelectedPayOption('card')}
                  >
                    Credit / Debit Card
                  </button>
                  <button
                    type="button"
                    className={`pay-tab ${selectedPayOption === 'upi' ? 'active' : ''}`}
                    onClick={() => setSelectedPayOption('upi')}
                  >
                    UPI / QR
                  </button>
                  <button
                    type="button"
                    className={`pay-tab ${selectedPayOption === 'netbanking' ? 'active' : ''}`}
                    onClick={() => setSelectedPayOption('netbanking')}
                  >
                    Net Banking
                  </button>
                </div>

                {selectedPayOption === 'card' && (
                  <div className="card-mock-form stack">
                    <div className="form-group">
                      <label>Card Number</label>
                      <input
                        className="input"
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                      />
                    </div>
                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Expiry</label>
                        <input className="input" type="text" defaultValue="12/28" />
                      </div>
                      <div className="form-group">
                        <label>CVV</label>
                        <input className="input" type="password" defaultValue="123" maxLength={4} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Cardholder Name</label>
                      <input
                        className="input"
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {selectedPayOption === 'upi' && (
                  <div className="upi-mock-form stack">
                    <div className="form-group">
                      <label>UPI ID (Google Pay, PhonePe, Paytm)</label>
                      <input
                        className="input"
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                      />
                    </div>
                    <p className="text-muted" style={{ fontSize: '0.82rem' }}>
                      ⚡ Simulated Instant UPI payment verification.
                    </p>
                  </div>
                )}

                {selectedPayOption === 'netbanking' && (
                  <div className="netbanking-mock stack">
                    <label>Select Bank</label>
                    <select className="input">
                      <option>HDFC Bank</option>
                      <option>State Bank of India</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                    </select>
                  </div>
                )}

                <div className="gateway-secure-tag">
                  🔒 256-Bit SSL Encrypted Mock Gateway Integration
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowPaymentModal(false)}
                    disabled={paymentLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={processOnlinePayment}
                    disabled={paymentLoading}
                  >
                    {paymentLoading ? 'Verifying & Processing...' : `Pay ₹${grandTotal.toLocaleString()} Now`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
