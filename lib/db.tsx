import mongoose from 'mongoose';

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      'MONGODB_URI is not defined. Please add MONGODB_URI in your Vercel Project Settings > Environment Variables.'
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  (global as any).mongoose = cached;
  return cached.conn;
}
