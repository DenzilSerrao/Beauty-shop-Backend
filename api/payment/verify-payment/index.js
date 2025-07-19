import { corsMiddleware } from '../../../middleware/corsMiddleware.js';
import { connectDB } from '../../../lib/db.js';
import { Order } from '../../../models/order.js';
import { Payment } from '../../../models/payment.js';
import { User } from '../../../models/user.js';
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

  if (req.method === 'POST') {
    try {
      console.log('Handling Razorpay webhook');

      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      const signature = req.headers['x-razorpay-signature'];
      const body = JSON.stringify(req.body);
      console.log('Webhook signature:', signature);
      console.log('Webhook payload:', body);
      // Validate webhook signature
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return res.status(400).json({ error: 'Invalid webhook signature' });
      }

      console.log('Webhook signature verified');

      // Extract event data from webhook payload
      const event = req.body.event;
      const payload = req.body.payload;

      if (event === 'payment.captured') {
        console.log('Processing payment.captured event');

        const razorpayOrderId = payload.payment.entity.order_id;
        const razorpayPaymentId = payload.payment.entity.id;
        const amount = payload.payment.entity.amount / 100; // Convert from paise to INR
        const { orderId } = payload.payment.entity.notes;

        // Check if payment already processed
        const existingPayment = await Payment.findOne({ razorpayPaymentId });
        if (existingPayment) {
          console.log('Payment already processed');
          return res.status(200).json({ success: true });
        }

        // Find order by Razorpay Order ID
        const order = await Order.findOne({ _id: orderId });
        if (!order || !order.userId) {
          console.error('Order or user not found');
          return res.status(404).json({ error: 'Order or user details not found' });
        }

        // Update order status to 'processing'
        order.status = 'processing';
        await order.save();

        // Store payment details
        await Payment.create({
          orderId: order._id,
          razorpayOrderId,
          razorpayPaymentId,
          amount,
          status: 'completed'
        });

        // Format order items for email
        const orderItems = order.items
          .map(item => `<li>${item.name} - ${item.quantity} x ₹${item.price.toFixed(2)}</li>`)
          .join('');

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
        await sendEmail(order.userId.email, 'Order Confirmation', '', customerEmailBody);

        // Send email to owner
        // const ownerEmailBody = `
        //   <h2>New Order Received</h2>
        //   <p><strong>Customer:</strong> ${order.userId.name} (${order.userId.email})</p>
        //   <p><strong>Order ID:</strong> ${order._id}</p>
        //   <p><strong>Amount:</strong> ₹${amount.toFixed(2)}</p>
        //   <p><strong>Items Ordered:</strong></p>
        //   <ul>${orderItems}</ul>
        // `;
        // await sendEmail(process.env.OWNER_EMAIL, 'New Order Received', '', ownerEmailBody);
        console.log('Payment processed and emails sent successfully and returned a status of 200');
        return res.status(200).json({ status: 'ok' });
      }

      console.log('Unhandled event type:', event);
      return res.status(200).json({ status: 'ok' });

    } catch (error) {
      console.error('Error processing Razorpay webhook:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}