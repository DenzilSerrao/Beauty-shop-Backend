// api/admin/[orderId].js

import { AdmingetOrder, AdmindeleteOrder } from '../../../controllers/adminController.js';

export default async function handler(req, res) {
  const { orderId } = req.query;

  if (req.method === 'GET') {
    try {
      const order = await AdmingetOrder(orderId, req, res);
      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      await AdmindeleteOrder(orderId, req, res);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
