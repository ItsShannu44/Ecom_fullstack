import mongoose, { Schema, model, models } from 'mongoose';

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, default: 'General' },
    stock: { type: Number, required: true, default: 0, min: 0 },
    emoji: { type: String, default: '📦' },
  },
  { timestamps: true }
);

export default models.Product || model('Product', ProductSchema);