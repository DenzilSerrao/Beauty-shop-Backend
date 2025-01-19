import jwt from 'jsonwebtoken';
import { AuthenticationError } from '../utils/errors.js';

export const auth = async (req, res) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');

  if (!token) {
    throw new AuthenticationError('No authentication token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to the request object
    return { success: true }; // Return success when authentication is valid
  } catch (error) {
    throw new AuthenticationError('Invalid authentication token');
  }
};
