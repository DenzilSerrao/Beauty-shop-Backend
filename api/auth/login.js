import cors from 'cors';
import { connectDB } from '../../lib/db.js';
import { User } from '../../src/models/user.js';
import jwt from 'jsonwebtoken.js';

const corsOptions = {
  origin: 'https://beauty-shop-frontend-l8yf.vercel.app',  // Your frontend URL
  methods: ['POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

export default async function handler(req, res) {
  // Apply CORS for this route
  cors(corsOptions)(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      await connectDB();
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

      res.status(200).json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}
