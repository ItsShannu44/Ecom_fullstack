export interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  emoji: string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface CartItem extends IProduct {
  quantity: number;
}

export interface IOrder {
  _id: string;
  items: { productId: string; name: string; price: number; quantity: number }[];
  subtotal: number;
  tax: number;
  delivery: number;
  total: number;
  status: string;
  shippingAddress: string;
  createdAt: string;
  userId?: { name: string; email: string } | string;
}