import mongoose, { Schema, model, models } from 'mongoose';

const OrderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  price: Number,
  quantity: Number,
});

const OrderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [OrderItemSchema],
    subtotal: Number,
    tax: Number,
    delivery: Number,
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentId: String,
    shippingAddress: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.Order || model('Order', OrderSchema);