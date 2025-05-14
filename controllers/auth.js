import { connectDB } from '../lib/db.js';
import { User } from '../models/user.js';
import jwt from 'jsonwebtoken';
import { ValidationError, AuthenticationError } from '../utils/errors.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Ensure database connection
    await connectDB();
    logger.info('Attempting user registration', { email });

    // Validate required fields
    if (!name || !email || !password) {
      const error = new ValidationError('Name, email, and password are required');
      await logger.error(error, req);
      throw error;
    }

    // Check for existing user
    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      const error = new ValidationError('Email already registered');
      await logger.error(error, req);
      throw error;
    }

    // Create new user
    const user = await User.create({ name, email, password });
    logger.info('User registered successfully', { userId: user.id, email });

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '10h' });

    // Send response
    res.status(201).json({
      status: 'success',
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token,
      },
    });

  } catch (error) {
    await logger.error(error, req);
    throw error;
  }
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    // Ensure DB connection
    await connectDB();
    logger.info('Attempting user login', { email });

    // Validate required fields
    if (!email || !password) {
      const error = new ValidationError('Email and password are required');
      await logger.error(error, req);
      throw error;
    }

    // Find user
    const user = await User.findOne({ email }).exec();
    if (!user) {
      const error = new AuthenticationError('Invalid credentials');
      await logger.error(error, req);
      throw error;
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new AuthenticationError('Invalid credentials');
      await logger.error(error, req);
      throw error;
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    logger.info('User logged in successfully', { userId: user.id, email });

    // Send response
    res.json({
      status: 'success',
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token,
      },
    });

  } catch (error) {
    await logger.error(error, req);
    throw error;
  }
});

// controllers/auth.js
export const verifyToken = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  try {
    if (!token) {
      const error = new AuthenticationError('No token provided');
      error.statusCode = 401; // Explicitly set status code
      await logger.error(error, req); // Make sure req is passed
      throw error;
    }

    await connectDB();
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).exec();

    if (!user) {
      const error = new AuthenticationError('User not found');
      error.statusCode = 404;
      error.context = { decodedUserId: decoded.userId }; // Add context for debugging
      await logger.error(error, req);
      throw error;
    }

    logger.info('Token verified successfully', { 
      userId: user.id,
      route: req.originalUrl 
    });

    res.json({
      status: 'success',
      data: { 
        valid: true, 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role 
        } 
      },
    });

  } catch (error) {
    // Add specific handling for JWT errors
    if (error.name === 'JsonWebTokenError') {
      error = new AuthenticationError('Invalid token');
      error.statusCode = 401;
    } else if (error.name === 'TokenExpiredError') {
      error = new AuthenticationError('Token expired');
      error.statusCode = 401;
    }
    
    // Ensure error has proper context before logging
    if (!error.statusCode) error.statusCode = 500;
    error.context = error.context || { token: token ? 'present' : 'missing' };
    
    await logger.error(error, req);
    throw error;
  }
});