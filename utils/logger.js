// utils/logger.js
import { ErrorLog } from '../models/error.js';

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
      userAgent: typeof req?.get === 'function' ? req.get('user-agent') : undefined,
      ...(err.context && { context: err.context })
    };

    console.error('Error:', errorLog);

    try {
      const loggedError = await ErrorLog.create(errorLog);
      console.log('Error logged to database with ID:', loggedError._id);
      return loggedError;
    } catch (dbErr) {
      console.error('Failed to log error to database:', dbErr.message);
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
    return infoLog;
  }
};