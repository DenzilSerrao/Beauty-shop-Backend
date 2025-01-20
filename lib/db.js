import mongoose from 'mongoose';

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    console.log('Already connected to DB');
    return;
  }

  try {
    console.log('Connecting to DB...', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Error connecting to DB', error);
    throw new Error('Failed to connect to database');
  }
};
