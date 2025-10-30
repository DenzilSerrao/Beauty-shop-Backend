import { logger } from './logger.js';

export const asyncHandler = (fn) => async (...args) => {
  try {
    const result = await fn(...args);
    return result;
  } catch (error) {
    // Extract req and res from args based on function signature
    let req, res;
    if (args.length === 2) {
      [req, res] = args;
    } else if (args.length === 3) {
      [, req, res] = args;
    }

    // Only log if the error hasn't been logged already
    if (!error.isLogged && req) {
      await logger.error(error, req);
      error.isLogged = true;
    }
    
    if (res && !res.headersSent) {
      const statusCode = error.statusCode || 500;
      const message = statusCode === 500 ? 'Internal server error' : error.message;
      
      res.status(statusCode).json({
        status: 'error',
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
    }
    throw error; // Re-throw for the API route handler
  }
};