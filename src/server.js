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
import adminRoutes from './routes/adminRoutes.js';

// Load environment variables before any other imports
dotenv.config();

const app = express();

// const allowedOrigins = [
//   'https://beauty-shop-frontend-l8yf-63oi15cwi-denzil-serraos-projects.vercel.app',
//   'http://localhost:5000' // Add this for local development
// ];
// Middleware
app.use(
  cors(
  //   {
  //   origin: (origin, callback) => {
  //     if (!origin || allowedOrigins.includes(origin)) {
  //       callback(null, true);
  //     } else {
  //       callback(new Error('Not allowed by CORS'));
  //     }
  //   },
  //   credentials: true, // Allow credentials (cookies, authorization headers)
  // }
)
);
app.use(express.json());

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL); // Replace with your frontend's origin
//   res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
//   res.header('Access-Control-Allow-Credentials', 'true');
//   next();
// })

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
app.use('/api/admin', adminRoutes);
// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});