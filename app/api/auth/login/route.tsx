import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { signToken, setAuthCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    await connectDB();
    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    const token = signToken({ id: user._id.toString(), role: user.role });
    await setAuthCookie(token);
    return NextResponse.json({ id: user._id, name: user.name, role: user.role });
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}