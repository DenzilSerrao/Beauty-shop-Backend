import { Product } from '../models/product.js';
import isAdminAuth from '../middleware/isAdminAuth.js';

export const createProduct = async (req, res) => {
  try {
    // Verify admin auth
    const authResult = await isAdminAuth(req, res);
    if (authResult?.error) {
      return res.status(401).json({ error: authResult.error });
    }

    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    // Verify admin auth
    const authResult = await isAdminAuth(req, res);
    if (authResult?.error) {
      return res.status(401).json({ error: authResult.error });
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ data: { products } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};