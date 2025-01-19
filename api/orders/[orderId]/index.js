// api/orders/[orderId].js

import { getOrder, deleteOrder, updateOrderStatus } from '../../src/controllers/orders.js';

export default async function handler(req, res) {
  const { orderId } = req.query;

  if (req.method === 'GET') {
    try {
      const order = await getOrder(orderId, req, res);
      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      await deleteOrder(orderId, req, res);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'PUT') {
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
