// api/auth/register.js

import { register } from '../../../controllers/auth.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const response = await register(req, res);
      res.status(response.status).json(response.data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
