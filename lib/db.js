import mongoose from 'mongoose';

let cachedDb = null;

export const connectDB = async () => {
  if (cachedDb) {
    console.log('Using cached database connection');
    return cachedDb;
  }

  try {
    console.log('Connecting to DB...', process.env.MONGODB_URI);
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    cachedDb = db;
    console.log('MongoDB connected');
    return db;
  } catch (error) {
    console.error('Error connecting to DB', error);
    throw new Error('Failed to connect to database');
  }
};