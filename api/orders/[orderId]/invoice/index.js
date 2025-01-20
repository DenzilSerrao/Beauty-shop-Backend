import { getOrderInvoice } from '../../../../controllers/orders.js'; // Ensure the path is correct
import { corsMiddleware } from '../../../../middleware/corsMiddleware.js';

export default async function handler(req, res) {
  // Apply CORS middleware
  if (corsMiddleware(req, res)) {
    return; // Exit if the CORS middleware has handled the request
  }

  if (req.method === 'GET') {
    try {
      await getOrderInvoice(req, res);
    } catch (error) {
      console.error('Get order invoice error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}