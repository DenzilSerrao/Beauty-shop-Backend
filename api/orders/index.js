import { connectDB } from '../../lib/db.js';
import { Order } from '../../src/models/order.js';
import { auth } from '../../middleware/auth.js';

export default async function handler(req, res) {

  try {
    const authResult = await auth(req, res);
    if (authResult?.error) {
      return res.status(401).json({ error: authResult.error });
    }

    await connectDB();

    switch (req.method) {
      case 'GET':
        const orders = await Order.findByUser(req.user.userId);
  
        res.json({
          status: 'success',
          data: { orders }
        });

      case 'POST':
        const order = await Order.create({
          ...req.body,
          userId: req.user.userId
        });
        return res.status(201).json(order);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Orders error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
