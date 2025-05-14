// utils/asyncHandler.js
import { logger } from './logger.js';

export const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    // Only log if the error hasn't been logged already
    if (!error.isLogged) {
      await logger.error(error, req);
      error.isLogged = true; // Mark as logged
    }
    next(error); // Forward to error handling middleware
  }
};