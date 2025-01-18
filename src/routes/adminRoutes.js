// filepath: /c:/Users/win10/Desktop/mern/project-bolt-sb1-8tfedy (18)/project/server/src/routes/adminRoutes.js
import express from 'express';
import { auth } from '../middleware/auth.js';
import { getAllOrders, AdmingetOrder, AdmindeleteOrder, updateOrderStatus } from '../controllers/adminController.js';
import { createProduct, updateProduct, getProducts } from '../controllers/products.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Apply authentication middleware
router.use(auth);

// Define admin-specific routes
router.get('/allOrders', getAllOrders); // Ensure this route is defined before the dynamic route
router.get('/orders/:orderId', AdmingetOrder);
router.delete('/orders/:orderId', AdmindeleteOrder);
router.patch('/orders/:orderId/status', updateOrderStatus); // Add this route

// Set up multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/products');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Define product-specific routes
router.post('/products/upload', upload.single('image'), (req, res) => {
  res.status(200).json({ filePath: `/products/${req.file.filename}` });
});
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.get('/products', getProducts);

export default router;