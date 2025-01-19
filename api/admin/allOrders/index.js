// api/admin/allOrders.js

import { getAllOrders } from '../../../controllers/adminController.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const orders = await getAllOrders(req, res);
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
