import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import { errorHandler } from './utils/errors.js';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payment.js';
import productRoutes from './routes/products.js';

// Load environment variables before any other imports
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(process.cwd(), 'public')));

// Connect to database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/products', productRoutes);
app.get('/', (req, res) => {
  res.send('Hello World!')
})
// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});