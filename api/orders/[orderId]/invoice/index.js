import { generateOrderInvoice } from '../../../../controllers/orders.js'; // Ensure the path is correct
import { corsMiddleware } from '../../../../middleware/corsMiddleware.js';
import userAuth from '../../../../middleware/userAuth.js';
import { connectDB } from '../../../../lib/db.js';

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

  if (req.method === 'GET') {
    try {
      console.log('Handling GET request for order invoice');
      return generateOrderInvoice(req, res);
    } catch (error) {
      console.error('Get order invoice error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    console.log('Method not allowed:', req.method);
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}