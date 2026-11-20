# 🛒 Full-Stack E-Commerce Platform

A complete, clean, and modern full-stack e-commerce web application built with **Next.js (App Router)** and **MongoDB (Mongoose)**. Designed and built to fulfill all college assignment requirements without unnecessary complexity.

---

## 🌟 Key Features

### 1. 🔐 Authentication & Role-Based Access Control
- **User Registration & Login**: Password hashing with `bcryptjs` and session tokens stored in secure HTTP-only cookies with `jsonwebtoken`.
- **Roles**:
  - `admin`: Access to the Admin Control Panel for inventory & order management.
  - `user`: Standard customer access to shop, place orders, and view order history.
- **Convenient College Demo**: The very first registered user is automatically granted `admin` privileges, or you can use the pre-seeded demo accounts.

### 2. 📦 Product & Inventory Management
- **Interactive Storefront**: Product catalog with emoji previews, categories, real-time search, and category filter chips.
- **Stock Tracking & Real-Time Badges**:
  - `In Stock` (Green)
  - `Low Stock (< 5 left)` (Amber)
  - `Out of Stock (0 units)` (Red, disables cart addition)
- **Product Details Page (`/product/[id]`)**: Detailed view with stock indicators, guarantees, and add-to-cart actions.
- **Admin Inventory Controls**:
  - Add new products (name, category, price, stock, emoji, description).
  - Edit existing products.
  - Quick stock adjustment buttons (`-`, `+`, `+10 Restock`).
  - Delete products with confirmation.

### 3. 🛍️ Cart & Order Processing
- **Cart (`/cart`)**: Persistent cart saved in browser storage.
  - Adjust quantities (enforces stock limits).
  - Subtotal, 5% GST/Tax calculation, dynamic delivery fee (Free for orders ≥ ₹1,000, else ₹49).
  - Shipping address collection.
- **Order Tracking (`/orders`)**:
  - Complete history of past customer orders.
  - Live status tracking badges: `PENDING` → `PAID` → `SHIPPED` → `DELIVERED` → `CANCELLED`.
  - Detailed item breakdown and delivery address.

### 4. 💳 Online Payment Gateway Integration
- **Simulated Payment Gateway**:
  - Interactive test modal with support for **Credit/Debit Card**, **UPI (GPay/PhonePe)**, and **Net Banking**.
  - One-click payment verification.
  - Atomically decrements product inventory stock in the database upon successful payment.
  - Generates transaction ID (`MOCKPAY_...`) and transitions order status to `PAID`.
  - Also supports Cash on Delivery (COD) mode.

### 5. 📊 Admin Dashboard (`/admin`)
- **Key Metrics Overview**:
  - Total Revenue generated
  - Total Orders count
  - Catalog Products count
  - Low Stock Alerts count
- **Product & Inventory Tab**: Complete product CRUD & inventory controls.
- **Order Processing Tab**: View all customer orders with customer email, address, and an inline status update dropdown (`pending` / `paid` / `shipped` / `delivered` / `cancelled`).
- **One-Click Demo Seeder Button**: Reset or populate sample catalog directly from the dashboard.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server & Client Components)
- **Language**: TypeScript
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Auth**: `bcryptjs` + `jsonwebtoken` + HTTP-only cookies
- **Styling**: Modern responsive CSS with Tailwind integration

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure you have Node.js (v18+) and MongoDB installed and running locally on port 27017:
```bash
# Default connection string in .env.local:
MONGODB_URI=mongodb://127.0.0.1:27017/ecom
```
*(You can also use a free MongoDB Atlas connection string by replacing `MONGODB_URI` in `.env.local`)*

### 2. Install Dependencies
```bash
npm install
```

### 3. Seed Database (Sample Products & Demo Accounts)
Run the built-in database seeder:
```bash
npm run seed
```
This populates 10 sample products and creates the default demo accounts.

### 4. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 🎓 Demo Accounts

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@store.com` | `admin123` | Full access to Admin Dashboard (`/admin`), inventory & order processing |
| **Customer** | `user@store.com` | `user123` | Browsing, cart checkout, mock payment & order tracking (`/orders`) |

*(On the `/login` page, you can also click the **"Fill Admin Demo"** or **"Fill User Demo"** buttons for 1-click credential auto-fill!)*

---

## 📂 Project Structure

```text
├── app/
│   ├── layout.tsx                # App layout with StoreProvider & Header
│   ├── page.tsx                  # Home storefront (Catalog, Search, Filter)
│   ├── globals.css               # Clean responsive store & admin styles
│   ├── login/page.tsx            # Login page with demo auto-fill
│   ├── register/page.tsx         # Account registration page
│   ├── cart/page.tsx             # Cart, checkout & Payment Gateway modal
│   ├── orders/page.tsx           # Customer orders history & tracking
│   ├── admin/page.tsx            # Admin Dashboard (Inventory & Orders)
│   ├── product/[id]/page.tsx     # Single product details
│   └── api/
│       ├── auth/                 # login, register, logout, me
│       ├── products/             # GET, POST, PUT, DELETE products
│       ├── orders/               # GET & POST customer orders
│       ├── admin/orders/         # GET all orders & PUT update status
│       ├── payments/             # Mock online payment gateway & stock decrement
│       └── seed/                 # Database seeder endpoint
├── components/
│   └── Header.tsx                # Navigation header with badges & auth state
├── context/
│   └── StoreContext.tsx          # Client store state (Cart, User, Totals)
├── lib/
│   ├── auth.tsx                  # JWT verification & role authorization helpers
│   └── db.tsx                    # Cached Mongoose connection helper
├── models/
│   ├── User.tsx                  # User schema (name, email, password, role)
│   ├── Product.tsx               # Product schema (name, category, price, stock, emoji)
│   └── Order.tsx                 # Order schema (items, subtotal, tax, status, address)
├── scripts/
│   └── seed.js                   # Direct database seeding script
└── types.tsx                     # Shared TypeScript interfaces
```
