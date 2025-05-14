import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error('MONGO_URI not found in environment variables');
}

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected for error logging'))
  .catch(err => console.error('MongoDB connection error for logging:', err));

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