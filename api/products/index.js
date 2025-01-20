import { getProducts, createProduct, updateProduct } from '../../controllers/products.js'; // Ensure the path is correct
import { corsMiddleware } from '../../middleware/corsMiddleware.js';
import { connectDB } from '../../lib/db.js';

export default async function handler(req, res) {
  // Apply CORS middleware
  if (corsMiddleware(req, res)) {
    return; // Exit if the CORS middleware has handled the request
  }

  try {
    // Ensure the database connection is established
    await connectDB();
    switch (req.method) {
      case 'GET':
        await getProducts(req, res);
        break;

      case 'POST':
        await createProduct(req, res);
        break;

      case 'PUT':
        await updateProduct(req, res);
        break;

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Products error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}