import { connectDB } from '../lib/db.js';
import { ErrorLog } from './models/errorLog.js';

// Ensure database connection is established
await connectDB();

export const logger = {
  error: async (err, req = null) => {
    const errorLog = {
      errorType: err.name || 'Application',
      errorMessage: err.message,
      stackTrace: err.stack,
      statusCode: err.statusCode || err.status || 500,
      route: req?.originalUrl || req?.path,
      requestMethod: req?.method,
      requestBody: req?.body,
      requestParams: req?.params,
      requestQuery: req?.query,
      user: req?.user?._id,
      ipAddress: req?.ip || req?.socket?.remoteAddress,
      userAgent: req?.get('user-agent')
    };

    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });

    try {
      const loggedError = await ErrorLog.create(errorLog);
      console.log('Error logged to database with ID:', loggedError._id);
      return loggedError;
    } catch (dbErr) {
      console.error('Failed to log error to database:', dbErr.message);
      // Fallback to console if database logging fails
      console.error('Original error that failed to log:', errorLog);
      return null;
    }
  },
  
  info: (message, data = {}) => {
    const infoLog = {
      message,
      ...data,
      timestamp: new Date().toISOString()
    };
    console.log('Info:', infoLog);
    // Optional: You could also create an InfoLog model similar to ErrorLog
    // if you want to persist info logs to database
    return infoLog;
  }
};