import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import User from '@/models/User';

const SAMPLE_PRODUCTS = [
  {
    name: 'Wireless Noise-Canceling Headphones',
    description: 'Immersive sound with 30-hour battery life and ultra-comfortable ear cushions.',
    price: 2999,
    category: 'Electronics',
    stock: 15,
    emoji: '🎧',
  },
  {
    name: 'RGB Mechanical Gaming Keyboard',
    description: 'Customizable RGB backlighting with clicky mechanical blue switches.',
    price: 3499,
    category: 'Electronics',
    stock: 8,
    emoji: '⌨️',
  },
  {
    name: 'Ergonomic Wireless Mouse',
    description: 'High precision 4000 DPI sensor with silent click buttons and ergonomic grip.',
    price: 999,
    category: 'Electronics',
    stock: 25,
    emoji: '🖱️',
  },
  {
    name: 'Smart Fitness Tracker Watch',
    description: 'Track your heart rate, sleep quality, daily steps, and workout sessions.',
    price: 4299,
    category: 'Electronics',
    stock: 12,
    emoji: '⌚',
  },
  {
    name: '27-inch 4K UHD Monitor',
    description: 'Crisp IPS display with 99% sRGB color gamut and USB-C connectivity.',
    price: 18500,
    category: 'Electronics',
    stock: 5,
    emoji: '🖥️',
  },
  {
    name: 'Waterproof Laptop Backpack',
    description: 'Durable water-resistant polyester with padded 15.6 inch laptop compartment.',
    price: 1499,
    category: 'Accessories',
    stock: 20,
    emoji: '🎒',
  },
  {
    name: 'Adjustable Aluminum Laptop Stand',
    description: 'Foldable ergonomic riser to elevate your screen and improve posture.',
    price: 899,
    category: 'Accessories',
    stock: 30,
    emoji: '💻',
  },
  {
    name: 'Fast Qi Wireless Charging Pad',
    description: '15W rapid charging compatible with iPhone, Samsung, and AirPods.',
    price: 799,
    category: 'Accessories',
    stock: 18,
    emoji: '🔋',
  },
  {
    name: 'Premium Cotton Crewneck T-Shirt',
    description: '100% breathable organic cotton with durable stitching and soft feel.',
    price: 599,
    category: 'Apparel',
    stock: 35,
    emoji: '👕',
  },
  {
    name: 'Lightweight Running Shoes',
    description: 'Cushioned foam midsole for all-day comfort during sports and walking.',
    price: 2199,
    category: 'Apparel',
    stock: 10,
    emoji: '👟',
  },
];

export async function POST() {
  try {
    await connectDB();

    // Check if products exist; if not or if forced, add sample products
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
      message: 'Demo data seeded successfully!',
      productsCount: await Product.countDocuments(),
      demoAccounts: {
        admin: { email: 'admin@store.com', password: 'admin123', role: 'admin' },
        user: { email: 'user@store.com', password: 'user123', role: 'user' },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Seeding failed' }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
