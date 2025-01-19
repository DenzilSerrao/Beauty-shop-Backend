import { connectDB } from '../../lib/db.js';
import { User } from '../../src/models/user.js';
import jwt from 'jsonwebtoken';  // Correcting the import (should not have .js)

export default async function handler(req, res) {

  try {
    await connectDB();
    const { name, email, password } = req.body;

    // Check if the user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create a new user
    const user = await User.create({ name, email, password });

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h' // Optionally, set an expiration for the token
    });

    // Return the user data along with the token
    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
