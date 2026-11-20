import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import { getCurrentUser } from '@/lib/auth';
import { SAMPLE_PRODUCTS } from '@/lib/sampleProducts';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search')?.toLowerCase() || '';

  try {
    await connectDB();

    // Auto-seed if database is completely empty
    const count = await Product.countDocuments();
    if (count === 0 && !search) {
      await Product.insertMany(SAMPLE_PRODUCTS);
    }

    const query = search ? { name: { $regex: search, $options: 'i' } } : {};
    const products = await Product.find(query).sort({ createdAt: -1 });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Products API DB Error:', error.message);

    // Resilient fallback: Return sample products in memory so store displays products even if DB is pending setup
    const filtered = search
      ? SAMPLE_PRODUCTS.filter(
          (p) =>
            p.name.toLowerCase().includes(search) ||
            p.category.toLowerCase().includes(search)
        )
      : SAMPLE_PRODUCTS;

    return NextResponse.json(filtered, {
      headers: {
        'X-DB-Status': 'fallback',
        'X-DB-Error': encodeURIComponent(error.message || 'Database not connected'),
      },
    });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await connectDB();
    const body = await req.json();
    const product = await Product.create(body);
    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create product' }, { status: 500 });
  }
}
