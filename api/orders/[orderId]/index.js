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
    const orderId = req.query.orderId;
    logger.info('Processing request', { 
      orderId, 
      method: req.method,
      timestamp: new Date().toISOString()
    });

    switch (req.method) {
      case 'GET':
        await getOrder(orderId, req, res);
        break;

      case 'DELETE':
        await deleteOrder(orderId, req, res);
        break;

      default:
        res.status(405).json({ 
          status: 'error',
          message: 'Method Not Allowed' 
        });
    }
  } catch (error) {
    // Let asyncHandler handle the error response
    if (!res.headersSent) {
      const statusCode = error.statusCode || 500;
      const message = statusCode === 500 ? 'Internal server error' : error.message;
      
      res.status(statusCode).json({
        status: 'error',
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
    }
  }
}