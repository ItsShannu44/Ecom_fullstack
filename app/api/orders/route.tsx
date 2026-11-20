import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { requireUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { items, shippingAddress } = await req.json();
    if (!items?.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    if (!shippingAddress?.trim()) return NextResponse.json({ error: 'Address required' }, { status: 400 });

    await connectDB();

    // Validate stock and build authoritative order items
    const orderItems = [];
    let subtotal = 0;
    for (const line of items) {
      const product = await Product.findById(line.productId);
      if (!product) return NextResponse.json({ error: `Product ${line.productId} missing` }, { status: 400 });
      if (product.stock < line.quantity) {
        return NextResponse.json({ error: `Not enough stock for ${product.name}` }, { status: 400 });
      }
      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: line.quantity,
      });
      subtotal += product.price * line.quantity;
    }

    const tax = Math.round(subtotal * 0.05);
    const delivery = subtotal > 0 ? 49 : 0;
    const total = subtotal + tax + delivery;

    const order = await Order.create({
      userId: user._id,
      items: orderItems,
      subtotal,
      tax,
      delivery,
      total,
      shippingAddress,
      status: 'pending',
    });

    return NextResponse.json(order, { status: 201 });
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Login required' }, { status: 401 });
    return NextResponse.json({ error: 'Order failed' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await requireUser();
    await connectDB();
    const orders = await Order.find({ userId: user._id }).sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}