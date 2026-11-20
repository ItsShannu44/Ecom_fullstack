'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IProduct, IOrder } from '@/types';
import { useStore } from '@/context/StoreContext';

export default function AdminPage() {
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

  // Products state
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Orders state
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Modal / Form state for Add/Edit Product
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Electronics',
    price: 999,
    stock: 10,
    emoji: '📦',
    description: '',
  });

  // Action status message
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch {
      // Ignore
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch {
      // Ignore
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchProducts();
      fetchOrders();
    }
  }, [user]);

  // Handle open modal for Create vs Edit
  const openCreateModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: 'Electronics',
      price: 999,
      stock: 10,
      emoji: '📦',
      description: '',
    });
    setShowProductModal(true);
  };

  const openEditModal = (p: IProduct) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.stock,
      emoji: p.emoji || '📦',
      description: p.description || '',
    });
    setShowProductModal(true);
  };

  // Submit Product Form (Create or Update)
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        // Update product
        const res = await fetch(`/api/products/${editingProduct._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productForm),
        });
        if (!res.ok) throw new Error('Update failed');
        showMsg(`Product "${productForm.name}" updated successfully!`);
      } else {
        // Create new product
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productForm),
        });
        if (!res.ok) throw new Error('Create failed');
        showMsg(`Product "${productForm.name}" added to inventory!`);
      }
      setShowProductModal(false);
      fetchProducts();
    } catch (err: any) {
      showMsg(err.message || 'Operation failed', 'error');
    }
  };

  // Quick Stock Adjustment (+/- 5)
  const adjustStock = async (p: IProduct, delta: number) => {
    const newStock = Math.max(0, p.stock + delta);
    try {
      const res = await fetch(`/api/products/${p._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((item) => (item._id === p._id ? { ...item, stock: newStock } : item))
        );
        showMsg(`Stock for "${p.name}" updated to ${newStock}`);
      }
    } catch {
      showMsg('Failed to update stock', 'error');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" from the store?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
        showMsg(`Deleted "${name}"`);
      }
    } catch {
      showMsg('Failed to delete product', 'error');
    }
  };

  // Update Order Status
  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
        showMsg(`Order status updated to ${newStatus.toUpperCase()}`);
      }
    } catch {
      showMsg('Failed to update order status', 'error');
    }
  };

  // Seed Catalog
  const handleSeed = async () => {
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showMsg(data.message || 'Database seeded successfully!');
        fetchProducts();
      }
    } catch {
      showMsg('Seeding failed', 'error');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <main className="container narrow">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <h2>Access Denied</h2>
          <p className="text-muted">You need an administrator account to access the Admin Dashboard.</p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link href="/login" className="btn btn-primary">
              Login as Admin
            </Link>
            <Link href="/" className="btn btn-outline">
              Back to Shop
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Calculate high-level stats
  const totalSales = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);
  const lowStockCount = products.filter((p) => p.stock < 5).length;

  return (
    <main className="container">
      {/* Top Banner & Header */}
      <div className="admin-header">
        <div>
          <h1>Admin Control Panel</h1>
          <p className="subtitle">Manage products, monitor inventory, and process orders</p>
        </div>
        <div className="admin-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={handleSeed}>
            🌱 Seed Demo Products
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={openCreateModal}>
            + Add New Product
          </button>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message.text}
        </div>
      )}

      {/* Metrics Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Revenue</span>
          <span className="stat-value text-primary">₹{totalSales.toLocaleString()}</span>
          <span className="stat-desc">From completed &amp; active orders</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Orders</span>
          <span className="stat-value">{orders.length}</span>
          <span className="stat-desc">Customer purchases recorded</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Catalog Products</span>
          <span className="stat-value">{products.length}</span>
          <span className="stat-desc">Items available in store</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Low Stock Alerts</span>
          <span className={`stat-value ${lowStockCount > 0 ? 'text-danger' : 'text-success'}`}>
            {lowStockCount}
          </span>
          <span className="stat-desc">Products with &lt; 5 units left</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          📦 Product &amp; Inventory Management ({products.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📋 Order Processing ({orders.length})
        </button>
      </div>

      {/* Tab 1: Product & Inventory Management */}
      {activeTab === 'products' && (
        <div className="admin-panel-card">
          <div className="panel-toolbar">
            <h3>Inventory Table</h3>
            <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
              + Add Product
            </button>
          </div>

          {loadingProducts ? (
            <p className="empty-state">Loading products...</p>
          ) : products.length === 0 ? (
            <div className="empty-state-card">
              <p>No products found in the catalog.</p>
              <button className="btn btn-primary btn-sm" onClick={handleSeed} style={{ marginTop: '0.5rem' }}>
                Seed Demo Products Now
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Icon</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Inventory / Stock</th>
                    <th>Stock Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const isOutOfStock = p.stock === 0;
                    const isLowStock = p.stock > 0 && p.stock < 5;

                    return (
                      <tr key={p._id}>
                        <td className="table-emoji">{p.emoji || '📦'}</td>
                        <td>
                          <strong>{p.name}</strong>
                          <p className="text-muted table-desc">{p.description}</p>
                        </td>
                        <td>
                          <span className="category-pill">{p.category}</span>
                        </td>
                        <td>
                          <strong>₹{p.price.toLocaleString()}</strong>
                        </td>
                        <td>
                          <div className="stock-control-cell">
                            <button
                              type="button"
                              className="stock-btn"
                              title="Decrease stock by 1"
                              onClick={() => adjustStock(p, -1)}
                              disabled={p.stock <= 0}
                            >
                              -
                            </button>
                            <span className="stock-count">{p.stock}</span>
                            <button
                              type="button"
                              className="stock-btn"
                              title="Increase stock by 1"
                              onClick={() => adjustStock(p, 1)}
                            >
                              +
                            </button>
                            <button
                              type="button"
                              className="stock-btn-plus5"
                              title="Restock +10 units"
                              onClick={() => adjustStock(p, 10)}
                            >
                              +10
                            </button>
                          </div>
                        </td>
                        <td>
                          {isOutOfStock ? (
                            <span className="badge badge-danger">Out of Stock</span>
                          ) : isLowStock ? (
                            <span className="badge badge-warning">Low Stock ({p.stock})</span>
                          ) : (
                            <span className="badge badge-success">In Stock</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline"
                              onClick={() => openEditModal(p)}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger-outline"
                              onClick={() => handleDeleteProduct(p._id, p.name)}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Order Processing */}
      {activeTab === 'orders' && (
        <div className="admin-panel-card">
          <div className="panel-toolbar">
            <h3>Customer Orders Processing</h3>
            <span className="text-muted">Total: {orders.length} orders</span>
          </div>

          {loadingOrders ? (
            <p className="empty-state">Loading orders...</p>
          ) : orders.length === 0 ? (
            <div className="empty-state-card">
              <p>No customer orders placed yet.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Address</th>
                    <th>Current Status</th>
                    <th>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => {
                    const customerName =
                      typeof o.userId === 'object' && o.userId !== null
                        ? o.userId.name
                        : 'Customer';
                    const customerEmail =
                      typeof o.userId === 'object' && o.userId !== null
                        ? o.userId.email
                        : '—';

                    return (
                      <tr key={o._id}>
                        <td>
                          <strong>#{o._id.slice(-8).toUpperCase()}</strong>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {new Date(o.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <strong>{customerName}</strong>
                          <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                            {customerEmail}
                          </div>
                        </td>
                        <td>
                          <div className="order-items-snippet">
                            {o.items.map((it, idx) => (
                              <div key={idx}>
                                {it.name} <span className="text-muted">× {it.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td>
                          <strong className="text-primary">₹{o.total.toLocaleString()}</strong>
                        </td>
                        <td style={{ maxWidth: '180px', fontSize: '0.82rem' }}>
                          {o.shippingAddress}
                        </td>
                        <td>
                          <span className={`status-badge status-${o.status}`}>
                            {o.status.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <select
                            className="input status-select"
                            value={o.status}
                            onChange={(e) => handleOrderStatusChange(o._id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowProductModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleProductSubmit} className="modal-body stack">
              <div className="form-group">
                <label>Product Name</label>
                <input
                  className="input"
                  required
                  placeholder="e.g. Mechanical Gaming Keyboard"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="input"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Home & Living">Home &amp; Living</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Emoji Icon</label>
                  <input
                    className="input"
                    placeholder="e.g. 🎧, 💻, 👕"
                    value={productForm.emoji}
                    onChange={(e) => setProductForm({ ...productForm, emoji: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label>Inventory / Stock Quantity</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="input textarea"
                  rows={3}
                  placeholder="Brief description of the product..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowProductModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
