// filepath: /c:/Users/win10/Desktop/mern/project-bolt-sb1-8tfedy (18)/project/server/src/routes/payment.js
import express from 'express';
import { auth } from '../middleware/auth.js';
import { razorpay } from '../config/razorpay.js';
import { Payment } from '../models/payment.js';
import { Order } from '../models/order.js';
import crypto from 'crypto';
import { asyncHandler } from '../utils/asyncHandler.js';
import { s_createOrder } from '../controllers/orders.js';

const router = express.Router();

router.post(
  '/create-order',
  auth,
  asyncHandler(async (req, res) => {
    try {
      // Extract data from request body
      const { userId, items, total, shippingAddress, customerEmail, customerPhone } = req.body;

      // Validate input data
      if (!items || !total || !shippingAddress || !customerPhone) {
        return res.status(400).json({ error: 'Invalid request data' });
      }

      // Create order in the database
      const orderData = { userId, items, total, shippingAddress, customerEmail, customerPhone };
      const orderResponse = await s_createOrder(orderData);
      if (orderResponse.status !== 'success') {
        return res.status(500).json({ error: 'Order creation failed' });
      }
      const order = orderResponse.data.order;

      // Prepare Razorpay order creation options
      const options = {
        amount: Math.round(order.total * 100), // Convert to paise
        currency: 'INR',
        receipt: order._id.toString(), // Use orderId as the receipt ID
        payment_capture: 1, // Auto-capture payment
      };

      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create(options);

      // Prepare the complete JSON object for Razorpay checkout
      const payOptions = {
        key: process.env.RAZORPAY_KEY_ID, // Pull from .env
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Ana Beauty',
        description: 'Test Transaction',
        order_id: razorpayOrder.id, // This is the order_id created in the backend
        // callback_url: '/orders', // Your success URL
        prefill: {
          email: customerEmail,
          contact: customerPhone
        },
        theme: {
          color: '#F37254'
        },
        orderId: order._id, // Include the order ID from the database
        total: order.total // Include the total amount
      };
      // Send the payOptions to the client
      return res.status(200).json(payOptions);
    } catch (error) {
      console.error('Error in /create-order:', error.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  })
);

router.post('/verify-payment', auth, asyncHandler(async (req, res) => {
  const { 
    razorpay_order_id, 
    razorpay_payment_id, 
    razorpay_signature,
    orderId,
    amount 
  } = req.body;

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    // Update order status
    await Order.findByIdAndUpdate(orderId, { status: 'processing' });

    // Create payment record
    await Payment.create({
      orderId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      amount,
      status: 'completed'
    });

    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Invalid signature' });
  }
}));

export default router;