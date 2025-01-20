import { getOrder, deleteOrder } from '../../../controllers/orders.js';
import { corsMiddleware } from '../../../middleware/corsMiddleware.js';
import { userAuth } from '../../../middleware/userAuth.js';
import { connectDB } from '../../../lib/db.js';

export default async function handler(req, res) {
  // Apply CORS middleware
  if (corsMiddleware(req, res)) {
    return; // Exit if the CORS middleware has handled the request
  }

  const { orderId } = req.query;

  try {
    switch (req.method) {
      case 'GET':
        const order = await getOrder(orderId, req, res);
        res.status(200).json(order);
        break;

      case 'DELETE':
        await deleteOrder(orderId, req, res);
        res.status(204).end();
        break;

      default:
        res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ error: error.message });
  }
}