import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import { requireAdmin } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { status } = await req.json();
    await connectDB();
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
}