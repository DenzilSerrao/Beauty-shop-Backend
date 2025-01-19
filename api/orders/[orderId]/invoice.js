// api/orders/[orderId]/invoice.js

import { generateOrderInvoice } from '../../src/controllers/orders.js';

export default async function handler(req, res) {
  const { orderId } = req.query;

  if (req.method === 'GET') {
    try {
      const invoice = await generateOrderInvoice(orderId, req, res);
      res.status(200).json(invoice);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
