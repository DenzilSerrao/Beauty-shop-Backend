import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    salePrice: { type: Number, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
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

// Static method to find orders by user
orderSchema.statics.findByUser = function (userId) {
  return this.find({ userId });
};

export const Order = mongoose.model('Order', orderSchema);