// api/products/index.js

import { getProducts, createProduct } from '../../src/controllers/products.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const products = await getProducts(req, res);
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const product = await createProduct(req, res);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
