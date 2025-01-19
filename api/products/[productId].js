// api/products/[productId].js

import { updateProduct } from '../../src/controllers/products.js';

export default async function handler(req, res) {
  const { productId } = req.query;

  if (req.method === 'PUT') {
    try {
      const updatedProduct = await updateProduct(productId, req, res);
      res.status(200).json(updatedProduct);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Implement product deletion logic here
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
