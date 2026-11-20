import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { signToken, setAuthCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }
    await connectDB();
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }
    const hashed = await bcrypt.hash(password, 10);
    // First user becomes admin for convenience
    const count = await User.countDocuments();
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: count === 0 ? 'admin' : 'user',
    });
    const token = signToken({ id: user._id.toString(), role: user.role });
    await setAuthCookie(token);
    return NextResponse.json({ id: user._id, name: user.name, role: user.role });
  } catch (e) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}