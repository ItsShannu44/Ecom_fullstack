import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import User from '@/models/User';
import { SAMPLE_PRODUCTS } from '@/lib/sampleProducts';

export async function POST() {
  try {
    await connectDB();

    // Reset or add products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany(SAMPLE_PRODUCTS);
    }

    // Seed Admin user
    const adminEmail = 'admin@store.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const hashedAdminPassword = await bcrypt.hash('admin123', 10);
      admin = await User.create({
        name: 'Demo Admin',
        email: adminEmail,
        password: hashedAdminPassword,
        role: 'admin',
      });
    }

    // Seed Regular user
    const userEmail = 'user@store.com';
    let customer = await User.findOne({ email: userEmail });
    if (!customer) {
      const hashedUserPassword = await bcrypt.hash('user123', 10);
      customer = await User.create({
        name: 'Student Customer',
        email: userEmail,
        password: hashedUserPassword,
        role: 'user',
      });
    }

    return NextResponse.json({
      ok: true,
      message: 'Demo catalog & accounts seeded successfully in MongoDB!',
      productsCount: await Product.countDocuments(),
      demoAccounts: {
        admin: { email: 'admin@store.com', password: 'admin123', role: 'admin' },
        user: { email: 'user@store.com', password: 'user123', role: 'user' },
      },
    });
  } catch (error: any) {
    console.error('Seed API error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Seeding failed',
        hint:
          'If deployed on Vercel, ensure MONGODB_URI is configured in Vercel Project Settings > Environment Variables, and MongoDB Atlas IP Access List allows 0.0.0.0/0.',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
