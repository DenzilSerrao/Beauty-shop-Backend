import { razorpay } from '../config/razorpay.js';
import { Payment } from '../models/payment.js';
import { Order } from '../models/order.js';
import crypto from 'crypto';
import { s_createOrder } from './orders.js';
import { logger } from '../utils/logger.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const createOrder = asyncHandler(async (req, res) => {
  try {
    // Extract data from request body
    const { userId, items, total, shippingAddress, customerEmail, customerPhone } = req.body;

    // Validate input data
    if (!items || !total || !shippingAddress || !customerPhone) {
      const error = new Error('Invalid request data');
      await logger.error(error, req);
      return res.status(400).json({ error: error.message });
    }

    // Create order in the database
    const orderData = { userId, items, total, shippingAddress, customerEmail, customerPhone };
    const orderResponse = await s_createOrder(orderData);
    
    if (orderResponse.status !== 'success') {
      const error = new Error('Order creation failed');
      error.orderData = orderData; // Attach context
      await logger.error(error, req);
      return res.status(500).json({ error: error.message });
    }

    const order = orderResponse.data.order;

    // Prepare Razorpay order creation options
    const options = {
      amount: Math.round(order.total * 100),
      currency: 'INR',
      receipt: order._id.toString(),
      payment_capture: 1,
    };

    // Create Razorpay order
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create(options);
    } catch (razorpayError) {
      razorpayError.orderId = order._id; // Attach context
      await logger.error(razorpayError, req);
      return res.status(500).json({ error: 'Payment gateway error' });
    }

    // Prepare the complete JSON object for Razorpay checkout
    const payOptions = {
      key: process.env.RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: 'Ana Beauty',
      description: 'Test Transaction',
      order_id: razorpayOrder.id,
      prefill: {
        email: customerEmail,
        contact: customerPhone
      },
      theme: {
        color: '#F37254'
      },
      orderId: order._id,
      total: order.total
    };

    // Log successful order creation
    logger.info('Razorpay order created successfully', {
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: order.total
    });

    return res.status(200).json(payOptions);
  } catch (error) {
    await logger.error(error, req);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export const verifyPayment = asyncHandler(async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderId,
      amount 
    } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId || !amount) {
      const error = new Error('Missing required payment verification fields');
      await logger.error(error, req);
      return res.status(400).json({ error: error.message });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      try {
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

        logger.info('Payment verified successfully', {
          orderId,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          amount
        });

        return res.json({ success: true });
      } catch (dbError) {
        dbError.paymentData = {
          razorpay_order_id,
          razorpay_payment_id,
          orderId,
          amount
        };
        await logger.error(dbError, req);
        return res.status(500).json({ error: 'Failed to update payment records' });
      }
    } else {
      const error = new Error('Invalid signature');
      error.paymentData = {
        razorpay_order_id,
        razorpay_payment_id,
        orderId,
        amount,
        receivedSignature: razorpay_signature,
        expectedSignature
      };
      await logger.error(error, req);
      return res.status(400).json({ error: 'Invalid signature' });
    }
  } catch (error) {
    await logger.error(error, req);
    return res.status(500).json({ error: 'Internal server error' });
  }
});