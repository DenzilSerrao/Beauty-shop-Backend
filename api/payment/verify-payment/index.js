import { corsMiddleware } from '../../../middleware/corsMiddleware.js';
import userAuth from '../../../middleware/userAuth.js';
import { connectDB } from '../../../lib/db.js';
import { razorpay } from '../../../config/razorpay.js';
import { Order } from '../../../models/order.js';
import { Payment } from '../../../models/payment.js';
import crypto from 'crypto';

export default async function handler(req, res) {
  // Apply CORS middleware
  if (corsMiddleware(req, res)) {
    return; // Exit if the CORS middleware has handled the request
  }
  console.log('Applying CORS middleware successfully');

  // Ensure database connection is established before proceeding
  try {
    console.log('Attempting to connect to the database...');
    await connectDB();
    console.log('Database connection established successfully');
  } catch (dbError) {
    console.error('Database connection failed:', dbError);
    return res.status(500).json({ error: 'Failed to connect to the database' });
  }

  // Verify user auth
  const authResult = await userAuth(req, res);
  if (authResult?.error) {
    console.error('User authentication failed:', authResult.error);
    return res.status(401).json({ error: authResult.error });
  }
  console.log('User authentication successful');

  if (req.method === 'POST') {
    try {
      console.log('Handling POST request for verifying payment');
      const { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature,
        orderId,
        amount 
      } = req.body;

      // Validate input data
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId || !amount) {
        return res.status(400).json({ error: 'Invalid request data' });
      }

      // Verify the signature
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
    } catch (error) {
      console.error('Error in verifying payment:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    console.log('Method not allowed:', req.method);
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}