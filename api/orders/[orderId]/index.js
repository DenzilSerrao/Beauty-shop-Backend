import { getOrder, deleteOrder } from '../../../controllers/orders.js'; 
import { corsMiddleware } from '../../../middleware/corsMiddleware.js';
import userAuth from '../../../middleware/userAuth.js';
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

  // Verify user auth
  const authResult = await userAuth(req, res);
  if (authResult?.error) {
    console.error('User authentication failed:', authResult.error);
    return res.status(401).json({ error: authResult.error });
  }
  console.log('User authentication successful');

  try {
    switch (req.method) {
      case 'GET':
        console.log('Handling GET request for order:', req.query.orderId);
        order = await getOrder(req, res);
        console.log('Order fetched successfully:', order);
        return; // controller sent response

      case 'DELETE':
        console.log('Handling DELETE request for order:', req.query.orderId);
        order = await deleteOrder(req, res);
        console.log('Order deleted successfully:', order);
        return; // controller sent response

      default:
        console.log('Method not allowed:', req.method);
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Order error:', error);
    return res.status(500).json({ error: error.message });
  }
}