import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { requireUser } from '@/lib/auth';

/**
 * MOCK PAYMENT GATEWAY.
 * To go live: replace the `processPayment` body with a Stripe PaymentIntent
 * or Razorpay order + verify signature in a webhook. See lib/payments.ts.
 */
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { orderId } = await req.json();
    await connectDB();

    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (order.userId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (order.status !== 'pending') {
      return NextResponse.json({ error: 'Order already processed' }, { status: 400 });
    }

    // --- Mock payment gateway ---
    const paymentId = 'MOCKPAY_' + Date.now();
    // Simulate failure 10% of the time to exercise error path
    // if (Math.random() < 0.1) return NextResponse.json({ error: 'Payment declined' }, { status: 402 });

    // Reduce stock atomically
    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } }
      );
    }

    order.status = 'paid';
    order.paymentId = paymentId;
    await order.save();

    return NextResponse.json({ ok: true, paymentId, order });
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Login required' }, { status: 401 });
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 });
  }
}