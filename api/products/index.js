import { connectDB } from '../../lib/db.js';
import { Product } from '../../models/product.js';
import { auth } from '../../middleware/auth.js';
import { corsMiddleware } from '../../middleware/corsMiddleware.js';

export default async function handler(req, res) {
  // Apply CORS middleware
  if (corsMiddleware(req, res)) {
    return; // Exit if the CORS middleware has handled the request
  }

  try {
    await connectDB();

    switch (req.method) {
      case 'GET':
        const products = await Product.find();
        console.log('products:', products);
        return res.status(200).json({ data: { products } });

      case 'POST':
        // Verify admin auth
        const authResult = await auth(req, res);
        if (authResult?.error) {
          return res.status(401).json({ error: authResult.error });
        }

        const product = await Product.create(req.body);
        return res.status(201).json(product);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Products error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
