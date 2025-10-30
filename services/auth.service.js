import { User } from '../models/user.js';
import jwt from 'jsonwebtoken';
import { ValidationError, AuthenticationError } from '../utils/errors.js';
import { sendEmail } from './email.service.js';
import { welcomeEmailTemplate } from './email.templates.js';

export class AuthService {
  static async registerUser(userData) {
    const { name, email, password } = userData;

    if (!name || !email || !password) {
      throw new ValidationError('Name, email and password are required');
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new ValidationError('Email already registered');
    }

    const user = await User.create({ name, email, password });
    const token = this.generateToken(user.id);

    // Send welcome email
    try {
      const template = welcomeEmailTemplate(name);
      await sendEmail(email, template.subject, template.text, template.html);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't throw the error as registration should still succeed
    }

    return {
      user: this.sanitizeUser(user),
      token
    };
  }

  static async loginUser(credentials) {
    const { email, password } = credentials;

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const user = await User.findByEmail(email);
    if (!user || !(await user.comparePassword(password))) {
      throw new AuthenticationError('Invalid credentials');
    }

    const token = this.generateToken(user.id);

    return {
      user: this.sanitizeUser(user),
      token
    };
  }

  static generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  static sanitizeUser(user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email
    };
  }
}