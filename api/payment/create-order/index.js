import { corsMiddleware } from '../../../middleware/corsMiddleware.js';
import userAuth from '../../../middleware/userAuth.js';
import { connectDB } from '../../../lib/db.js';
import { s_createOrder } from '../../../controllers/orders.js';
import { razorpay } from '../../../config/razorpay.js';

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
      console.log('Handling POST request for creating order');
      const { userId, items, total, shippingAddress, customerEmail, customerPhone } = req.body;

      // Validate input data
      if (!items || !total || !shippingAddress || !customerPhone) {
        return res.status(400).json({ error: 'Invalid request data' });
      }

      // Create order
      const orderResponse = await s_createOrder({
        userId,
        items,
        total,
        shippingAddress,
        customerEmail,
        customerPhone
      });

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
        notes: {
          orderId: order._id.toString(),  // Store your database orderId
          total: order.total.toString(),  // Store total amount
          userId: userId,                 // (Optional) Store userId for reference
        }
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
      console.error('Error in creating order:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    console.log('Method not allowed:', req.method);
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}