import jwt from 'jsonwebtoken';
import { AuthenticationError } from '../utils/errors.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const auth = asyncHandler(async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    throw new AuthenticationError('No authentication token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    throw new AuthenticationError('Invalid authentication token');
  }
});