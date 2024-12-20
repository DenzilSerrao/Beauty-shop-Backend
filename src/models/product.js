import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  salePrice: { type: Number, required: true },
  images: [{
    url: { type: String, required: true },
    alt: { type: String }
  }],
  stock: { type: Number, required: true, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export const Product = mongoose.model('Product', productSchema);