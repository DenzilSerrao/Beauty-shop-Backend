import jwt from 'jsonwebtoken';
import { connectDB } from '../lib/db.js';
import { User } from '../models/user.js';

export default async function userAuth(req, res) {
  try {
    // Ensure database connection is established
    await connectDB();

    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      console.log('No token provided');
      return { error: 'No token provided' };
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('decoded token:', decoded)
      const user = await User.findById(decoded.userId);

      if (!user) {
        console.log('User not found');
        return { error: 'User not found' };
      }

      req.user = user;
      console.log('User authenticated successfully:', user.id);
      return { success: true };
    } catch (error) {
      console.error('Token verification error:', error);
      return { error: 'Invalid token' };
    }
  } catch (error) {
    console.error('User auth error:', error);
    return { error: 'Internal server error' };
  }
}