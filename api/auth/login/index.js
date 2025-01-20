import { login } from '../../../controllers/auth.js'; // Ensure the path is correct
import { corsMiddleware } from '../../../middleware/corsMiddleware.js';
import { connectDB } from '../../../lib/db.js';

export default async function handler(req, res) {
  // Apply CORS middleware
  if (corsMiddleware(req, res)) {
    return; // Exit if CORS handled the request
  }

  try {
    // Ensure the database connection is established
    await connectDB();

    if (req.method === 'POST') {
      // Call the login controller
      await login(req, res);
    } else {
      // Handle unsupported methods
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Login handler error:', error);
    return res.status(500).json({ error: error.message });
  }
}