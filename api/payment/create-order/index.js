// api/payment/create-order.js

import { s_createOrder } from '../../../controllers/orders.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const order = await s_createOrder(req, res);
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
