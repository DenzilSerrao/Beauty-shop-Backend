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
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

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
  console.log('Connecting to DB...');
  await connectDB();
  console.log('Connected to DB');

  // Validate required fields
  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }

  // Find the user by email
  console.log('Query running...');
  const user = await User.findByEmail(email);  // This resolves the promise
  console.log('user:', user);

  // Validate user existence
  if (!user) {
    throw new AuthenticationError('Invalid credentials');
  }

  // Compare password
  // const isMatch = await User.comparePassword(password);
  // if (!isMatch) {
  //   throw new AuthenticationError('Invalid credentials');
  // }

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

  // Make sure no other response is sent after this (no further res.json() or res.send())
});

