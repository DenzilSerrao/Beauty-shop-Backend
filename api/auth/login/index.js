import { login } from '../../../controllers/auth.js';
import { corsMiddleware } from '../../../middleware/corsMiddleware.js';
import { connectDB } from '../../../lib/db.js';

export default async function handler(req, res) {
  // Apply CORS middleware
  if (corsMiddleware(req, res)) {
    return; // Exit if CORS handled the request
  }
  try {
    await connectDB();

    if (req.method === 'POST') {
      // Call the login controller
      const response = await login(req, res);
      console.log('response:', response);
      // Ensure the controller properly returns data
      if (response?.status && response?.data) {
        return res.status(response.status).json(response.data);
      }

      // Handle unexpected cases
      return res.status(500).json({ error: 'Unexpected error in login handler' });
    } else {
      // Handle unsupported methods
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Login handler error:', error);
    return res.status(500).json({ error: error.message });
  }
}
