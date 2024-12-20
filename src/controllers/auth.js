import { User } from '../models/user.js';
import jwt from 'jsonwebtoken';
import { ValidationError, AuthenticationError } from '../utils/errors.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ValidationError('Name, email and password are required');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ValidationError('Email already registered');
  }

  const user = await User.create({ name, email, password });
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

  res.status(201).json({
    status: 'success',
    data: {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token
    }
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw new AuthenticationError('Invalid credentials');
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

  res.json({
    status: 'success',
    data: {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token
    }
  });
});