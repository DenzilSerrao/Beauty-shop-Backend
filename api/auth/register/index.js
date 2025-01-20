import { register } from '../../../controllers/auth.js'; // Ensure the path is correct
import { corsMiddleware } from '../../../middleware/corsMiddleware.js';

export default async function handler(req, res) {
  // Apply CORS middleware
  if (corsMiddleware(req, res)) {
    return; // Exit if the CORS middleware has handled the request
  }

  if (req.method === 'POST') {
    try {
      await register(req, res);
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}