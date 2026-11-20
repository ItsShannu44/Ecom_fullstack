import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const query = search ? { name: { $regex: search, $options: 'i' } } : {};
  const products = await Product.find(query).sort({ createdAt: -1 });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await connectDB();
  const body = await req.json();
  const product = await Product.create(body);
  return NextResponse.json(product, { status: 201 });
}