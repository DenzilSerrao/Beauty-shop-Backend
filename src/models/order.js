import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    // productId: { type: Number, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    // image: { type: String, required: true }
  }],
  customerPhone: { type: String, required: true },
  total: { type: Number, required: true },
  shippingAddress: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered'],
    default: 'pending'
  }
}, {
  timestamps: true
});

export const Order = mongoose.model('Order', orderSchema);