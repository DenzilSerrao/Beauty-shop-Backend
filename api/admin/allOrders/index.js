import { getAllOrders } from '../../../controllers/adminController.js'; // Ensure the path is correct
import { corsMiddleware } from '../../../middleware/corsMiddleware.js';
import { isAdminAuth } from '../../../middleware/isAdminAuth.js';

export default async function handler(req, res) {
  // Apply CORS middleware
  if (corsMiddleware(req, res)) {
    return; // Exit if the CORS middleware has handled the request
  }

  // Verify admin auth
  const authResult = await isAdminAuth(req, res);
  if (authResult?.error) {
    return res.status(401).json({ error: authResult.error });
  }

  if (req.method === 'GET') {
    try {
      await getAllOrders(req, res);
    } catch (error) {
      console.error('Get all orders error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}