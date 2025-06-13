import { connectDB } from '../lib/db.js'; // Import the connectDB function
import { User } from '../models/user.js';
import jwt from 'jsonwebtoken';
import { ValidationError, AuthenticationError } from '../utils/errors.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Ensure that database connection is established before proceeding
  await connectDB();

  // Validate required fields
  if (!name || !email || !password) {
    throw new ValidationError('Name, email, and password are required');
  }

  // Check if the user already exists
  const existingUser = await User.findOne({ email }).exec(); // Using `.exec()` to ensure query execution
  if (existingUser) {
    throw new ValidationError('Email already registered');
  }

  // Create a new user
  const user = await User.create({ name, email, password });

  // Generate JWT token with an expiration time of 1 hour for added security
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '10h' });

  // Send response
  res.status(201).json({
    status: 'success',
    data: {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Ensure DB connection is established before queries
  await connectDB();

  // Validate required fields
  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }

  // Find the user by email
  const user = await User.findOne({ email }).exec(); // Using `.exec()` to ensure query execution

  // Validate user existence
  if (!user) {
    throw new AuthenticationError('Invalid credentials');
  }

  // Compare password
  const isMatch = await user.comparePassword(password); // Assuming comparePassword is a method on the User instance
  if (!isMatch) {
    throw new AuthenticationError('Invalid credentials');
  }

  // Generate JWT token with expiration time of 1 hour
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // Send response with user details and the JWT token
  res.json({
    status: 'success',
    data: {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    },
  });
});

export const verifyToken = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new AuthenticationError('No token provided');
  }

  try {
    // Ensure database connection is established
    await connectDB();

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by the decoded user ID
    const user = await User.findById(decoded.userId).exec();

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Token is valid and user exists
    res.json({
      status: 'success',
      data: { valid: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } },
    });
  } catch (error) {
    console.error('Token verification error:', error);
    throw new AuthenticationError('Invalid token');
  }
});