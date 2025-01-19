// api/auth/verify.js

import { verifyToken } from '../../controllers/auth.controller.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const response = await verifyToken(req, res);
      res.status(response.status).json(response.data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
