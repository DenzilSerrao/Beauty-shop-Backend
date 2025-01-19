import { connectDB } from '../../lib/db.js';
import { Product } from '../../src/models/product.js';
import { auth } from '../../middleware/auth.js';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', 'https://beauty-shop-frontend-l8yf.vercel.app'); // Your frontend domain
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true'); // If you want to allow cookies or credentials

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // Send a 200 response for OPTIONS requests
  }

  try {
    await connectDB();

    switch (req.method) {
      case 'GET':
        const products = await Product.find({ isActive: true });
        console.log('products:', products);
        return res.status(200).json({ products });

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
