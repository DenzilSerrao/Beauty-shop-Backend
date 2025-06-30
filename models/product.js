import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  salePrice: { type: Number, required: true },
  image1: { type: String, required: true },
  image2: { type: String },
  image3: { type: String },
  image4: { type: String },
  image5: { type: String },
  image6: { type: String },
  stock: { type: Number, required: true, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export const Product = mongoose.model('Product', productSchema);