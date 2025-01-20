import jwt from 'jsonwebtoken';
import { connectDB } from '../lib/db.js';
import { User } from '../models/user.js';

export default async function isAdminAuth(req, res) {
  try {
    // Ensure database connection is established
    await connectDB();

    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return { error: 'No token provided' };
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return { error: 'User not found' };
      }

      if (user.role !== 'admin') {
        return { error: 'Unauthorized: Admin access required' };
      }

      req.user = user;
      return { success: true };
    } catch (error) {
      return { error: 'Invalid token' };
    }
  } catch (error) {
    console.error('Admin auth error:', error);
    return { error: 'Internal server error' };
  }
}