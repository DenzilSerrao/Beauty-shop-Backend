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

export const verifyToken = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  try {
    if (!token) {
      const error = new AuthenticationError('No token provided');
      await logger.error(error, req);
      throw error;
    }

    // Ensure database connection
    await connectDB();
    logger.info('Verifying token');

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.userId).exec();
    if (!user) {
      const error = new AuthenticationError('User not found');
      await logger.error(error, req);
      throw error;
    }

    logger.info('Token verified successfully', { userId: user.id });

    // Send response
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
    await logger.error(error, req);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new AuthenticationError('Invalid token');
    }
    throw error;
  }
});