import express from 'express';
import { auth } from '../middleware/auth.js';
import { razorpay } from '../config/razorpay.js';
import { Payment } from '../models/payment.js';
import { Order } from '../models/order.js';
import crypto from 'crypto';
import { asyncHandler } from '../utils/asyncHandler.js';
import { s_createOrder } from '../controllers/orders.js';

const router = express.Router();

// router.post('/create-order', auth, asyncHandler(async (req, res) => {
//   const { amount, orderId } = req.body;
//   console.log('server side create-order:',req.body)

//   const options = {
//     amount: Math.round(amount * 100), // Convert to paise and ensure integer
//     currency: 'INR',
//     receipt: orderId,
//     payment_capture: 1
//   };
//   console.log('option:',options)
//   const order = await razorpay.orders.create(options);
//   console.log('order by create-order',order)
//   res.json({
//     id: order.id,
//     amount: order.amount,
//     currency: order.currency
//   });
// }));

router.post(
  '/create-order',
  auth,
  asyncHandler(async (req, res) => {
    try {
      // Extract data from request body
      const { amount, orderId, currency } = req.body;

      // Validate input data
      if (!amount || !orderId || !currency) {
        return res.status(400).json({ error: 'Invalid request data' });
      }

      // Step 1: Call s_createOrder and pass relevant data
      const orderResponse = await s_createOrder(req.body, req.user.userId);

      console.log('Order Response:', orderResponse);

      // Validate the response from s_createOrder
      if (!orderResponse || orderResponse.status !== 'success') {
        return res.status(400).json({ error: 'Order creation failed in backend' });
      }

      // Extract order data
      const orderData = orderResponse.data;
      console.log('Order Data:', orderData);

      // Step 2: Prepare Razorpay order creation options
      const options = {
        amount: Math.round(amount * 100), // Convert to paise
        currency: currency || 'INR',
        receipt: orderId, // Use orderId as the receipt ID
        payment_capture: 1, // Auto-capture payment
      };

      console.log('Razorpay Order Options:', options);

      // Step 3: Create Razorpay order
      const razorpayOrder = await razorpay.orders.create(options);
      console.log('Razorpay Order Created:', razorpayOrder);

      // Step 4: Send the Razorpay order details to the client
      return res.status(200).json({
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
      });
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