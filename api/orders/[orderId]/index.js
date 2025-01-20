import { getOrder, deleteOrder } from '../../../controllers/orders.js';
import { corsMiddleware } from '../../../middleware/corsMiddleware.js';
import { connectDB } from '../../../lib/db.js';

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

  const { orderId } = req.query;

  try {
    switch (req.method) {
      case 'GET':
        console.log('Handling GET request for order:', orderId);
        const order = await getOrder(orderId, req, res);
        console.log('Order fetched successfully:', order);
        res.status(200).json(order);
        break;

      case 'DELETE':
        console.log('Handling DELETE request for order:', orderId);
        await deleteOrder(orderId, req, res);
        console.log('Order deleted successfully');
        res.status(204).end();
        break;

      default:
        console.log('Method not allowed:', req.method);
        res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ error: error.message });
  }
}