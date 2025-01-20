import { getOrders, s_createOrder } from '../../controllers/orders.js';
import { corsMiddleware } from '../../middleware/corsMiddleware.js';

export default async function handler(req, res) {
  // Apply CORS middleware
  if (corsMiddleware(req, res)) {
    return; // Exit if the CORS middleware has handled the request
  }

  if (req.method === 'GET') {
    try {
      const orders = await getOrders(req, res);
      console.log('orders:', orders)
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const order = await s_createOrder(req, res);
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
