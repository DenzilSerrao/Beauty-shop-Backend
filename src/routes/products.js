import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { auth } from '../middleware/auth.js';
import { Product } from '../models/product.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const productDir = path.join(process.cwd(), 'public/products');
    if (!fs.existsSync(productDir)) {
      fs.mkdirSync(productDir, { recursive: true });
    }
    cb(null, productDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Public routes
router.get('/', asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true });
  res.json(products);
}));

// Admin routes
router.use(auth);

router.post('/', auth, upload.array('images', 6), asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const imageUrls = req.files.map(file => ({
    url: `/products/${file.filename}`,
    alt: req.body.name
  }));

  const product = await Product.create({
    ...req.body,
    images: imageUrls
  });

  res.status(201).json(product);
}));

router.put('/:id', auth, upload.array('images', 6), asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  // Handle new images
  const newImageUrls = req.files.map(file => ({
    url: `/products/${file.filename}`,
    alt: req.body.name
  }));

  // Combine existing and new images
  const updatedImages = [...(product.images || []), ...newImageUrls];

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      images: updatedImages
    },
    { new: true }
  );

  res.json(updatedProduct);
}));

router.delete('/:id', auth, asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  // Delete associated images
  product.images.forEach(image => {
    const imagePath = path.join(process.cwd(), 'public', image.url);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  });

  await Product.findByIdAndDelete(req.params.id);
  res.status(204).end();
}));

export default router;