// api/auth/login.js

import { login } from '../../src/controllers/auth.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const response = await login(req, res);
      res.status(response.status).json(response.data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
