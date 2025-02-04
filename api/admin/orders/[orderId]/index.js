import { AdmingetOrder, AdmindeleteOrder, updateOrderStatus } from '../../../../controllers/adminController.js'; // Ensure the path is correct
import { corsMiddleware } from '../../../../middleware/corsMiddleware.js';
import isAdminAuth from '../../../../middleware/isAdminAuth.js';
import { connectDB } from '../../../../lib/db.js';
import { deleteOrder } from '../../../../controllers/orders.js';

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
  const authResult = await isAdminAuth(req, res);
  if (authResult?.error) {
    console.error('User authentication failed:', authResult.error);
    return res.status(401).json({ error: authResult.error });
  }
  console.log('User authentication successful');

  const { orderId } = req.query; // Access the orderId from req.query

  try {
    switch (req.method) {
      case 'GET':
        console.log('Handling GET request for order:', orderId);
        const order = await AdmingetOrder(req, res);
        console.log('Order fetched successfully:', order);
        break;

      case 'DELETE':
        console.log('Handling DELETE request for order:', orderId);
        await deleteOrder(req, res);
        console.log('Order deleted successfully');
        break;

      case 'PATCH':
        console.log('Handling PATCH request for order:', orderId);
        await updateOrderStatus(req, res);
        console.log('Order status updated successfully');
        break;

      default:
        console.log('Method not allowed:', req.method);
        res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Admin order error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}