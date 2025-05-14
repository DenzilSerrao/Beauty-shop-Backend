import mongoose from 'mongoose';
import { connectDB } from './config/database.js';

// Ensure database connection is established
await connectDB();
export const logger = {
  error: async (err, req = null) => {
    const errorLog = {
      message: err.message,
      stack: err.stack,
      path: req?.path,
      method: req?.method,
      timestamp: new Date().toISOString()
    };
    console.error('Error:', errorLog);
    try {
      await mongoose.connection.collection('errors').insertOne(errorLog);
    } catch (dbErr) {
      console.error('Failed to log error to database:', dbErr);
    }
  },
  info: (message, data = {}) => {
    console.log('Info:', {
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};