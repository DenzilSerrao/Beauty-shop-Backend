// api/admin/updateOrderStatus.js

import { updateOrderStatus } from '../../src/controllers/adminController.js';

export default async function handler(req, res) {
  const { orderId } = req.query;

  if (req.method === 'PATCH') {
    try {
      const updatedOrder = await updateOrderStatus(orderId, req, res);
      res.status(200).json(updatedOrder);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
