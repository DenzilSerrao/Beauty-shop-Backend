// utils/asyncHandler.js
import { logger } from './logger.js';

export const asyncHandler = (fn) => async (req, res, next) => {
  try {
    return await fn(req, res, next);
  } catch (error) {
    // Only log if the error hasn't been logged already
    if (!error.isLogged) {
      await logger.error(error, req);
      error.isLogged = true;
    }
    
    // For Lambda environments (no Express next)
    if (res && typeof res.status === 'function') {
      const statusCode = error.statusCode || 500;
      const message = statusCode === 500 ? 'Internal server error' : error.message;
      
      return res.status(statusCode).json({
        status: 'error',
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
    }
    
    // For Express environments
    if (typeof next === 'function') {
      return next(error);
    }
    
    // Fallback for other environments
    throw error;
  }
};