import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();
    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (e: any) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
}