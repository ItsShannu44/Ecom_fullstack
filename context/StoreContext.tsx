'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IProduct, CartItem, IUser } from '@/types';

interface StoreCtx {
  cart: CartItem[];
  addToCart: (p: IProduct) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  user: IUser | null;
  setUser: (u: IUser | null) => void;
}

const Ctx = createContext<StoreCtx | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<IUser | null>(null);

  // Load cart from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Fetch current user on mount
  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then(setUser);
  }, []);

  const addToCart = (p: IProduct) => {
    setCart((prev) => {
      const ex = prev.find((i) => i._id === p._id);
      if (ex) return prev.map((i) => (i._id === p._id ? { ...i, quantity: i.quantity + 1 } : i));
      return [...prev, { ...p, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((i) => i._id !== id));
  const updateQty = (id: string, qty: number) => {
    if (qty < 1) return;
    setCart((prev) => prev.map((i) => (i._id === id ? { ...i, quantity: qty } : i)));
  };
  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <Ctx.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, totalItems, totalPrice, user, setUser }}>
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useStore must be inside StoreProvider');
  return c;
}