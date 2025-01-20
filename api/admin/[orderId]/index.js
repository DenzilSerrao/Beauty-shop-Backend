import { AdmingetOrder, AdmindeleteOrder, updateOrderStatus } from '../../../controllers/adminController.js'; // Ensure the path is correct
import { corsMiddleware } from '../../../middleware/corsMiddleware.js';
import isAdminAuth from '../../../middleware/isAdminAuth.js';

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

  try {
    switch (req.method) {
      case 'GET':
        await AdmingetOrder(req, res);
        break;

      case 'DELETE':
        await AdmindeleteOrder(req, res);
        break;

      case 'PATCH':
        await updateOrderStatus(req, res);
        break;

      default:
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Admin order error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}