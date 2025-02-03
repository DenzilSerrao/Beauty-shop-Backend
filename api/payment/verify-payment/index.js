import { corsMiddleware } from '../../../middleware/corsMiddleware.js';
import userAuth from '../../../middleware/userAuth.js';
import { connectDB } from '../../../lib/db.js';
import { razorpay } from '../../../config/razorpay.js';
import { Order } from '../../../models/order.js';
import { Payment } from '../../../models/payment.js';
import { sendEmail } from '../../../services/email.service.js';
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

        // Fetch the updated order details along with user details
        const order = await Order.findById(orderId).populate('userId');
        console.log('Order details:', order);
        if (!order || !order.userId) {
          return res.status(404).json({ error: 'Order or user details not found' });
        }

        // Create payment record
        await Payment.create({
          orderId,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          amount,
          status: 'completed'
        });

        // Format order items for the email
        const orderItems = order.items.map(item => 
          `<li>${item.name} - ${item.quantity} x ₹${item.price.toFixed(2)}</li>`
        ).join('');

        // Send email to customer
        const customerEmailBody = `
          <h2>Order Confirmation</h2>
          <p>Hi ${order.userId.name},</p>
          <p>Thank you for your purchase! Your order has been confirmed and will be shipped soon.</p>
          <p><strong>Order Details:</strong></p>
          <ul>${orderItems}</ul>
          <p><strong>Total Amount:</strong> ₹${amount.toFixed(2)}</p>
          <p><strong>Estimated Delivery:</strong> 5-7 days</p>
          <p>We appreciate your business!</p>
        `;
        console.log('Sending email to customer:', customerEmailBody);
        await sendEmail(order.userId.email, 'Order Confirmation', '', customerEmailBody);

        // Send email to owner
        const ownerEmailBody = `
          <h2>New Order Received</h2>
          <p><strong>Customer:</strong> ${order.userId.name} (${order.userId.email})</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Amount:</strong> ₹${amount.toFixed(2)}</p>
          <p><strong>Items Ordered:</strong></p>
          <ul>${orderItems}</ul>
        `;
        console.log('Sending email to owner:', ownerEmailBody);
        await sendEmail(process.env.OWNER_EMAIL, 'New Order Received', '', ownerEmailBody);

        res.json({ success: true });
      } else {
        res.status(400).json({ error: 'Invalid signature' });
      }
    } catch (error) {
      console.error('Error in verifying payment:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
