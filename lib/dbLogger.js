// lib/dbLogger.js
import { connectDB } from "./db.js";
import { ErrorLog } from "../models/ErrorLog.js";
import { logger } from "../utils/logger.js";

/**
 * Logs error to database with comprehensive context
 * @param {Error} error - The error object
 * @param {Object} req - Express request object (optional)
 * @param {Object} context - Additional context information
 */
export const logErrorToDatabase = async (error, req = null, context = {}) => {
  try {
    await connectDB();

    // Extract information from request if available
    let requestInfo = {};
    if (req) {
      requestInfo = {
        route: req.originalUrl,
        requestMethod: req.method,
        requestBody: req.body,
        requestParams: req.params,
        requestQuery: req.query,
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get("User-Agent"),
        user: req.user?._id, // Assuming user is attached to request
      };
    }

    const errorLog = new ErrorLog({
      errorType: error.name || "UnknownError",
      errorMessage: error.message,
      stackTrace: error.stack,
      statusCode: error.statusCode || context.statusCode || 500,
      ...requestInfo,
      ...context,
      // Remove any undefined values
      ...Object.fromEntries(
        Object.entries({
          ...requestInfo,
          ...context,
        }).filter(([_, v]) => v !== undefined && v !== null)
      ),
    });

    await errorLog.save();
    logger.info("Error logged to database successfully", {
      errorId: errorLog._id,
      errorType: errorLog.errorType,
    });

    return errorLog._id;
  } catch (logError) {
    // Fallback to console logging if database logging fails
    logger.error("Failed to log error to database:", logError);
    logger.error("Original error that failed to log:", error);
    logger.error("Log context:", context);

    // Re-throw to ensure the original error isn't silently swallowed
    throw logError;
  }
};

/**
 * Middleware to automatically log errors to database
 */
export const errorLoggerMiddleware = (err, req, res, next) => {
  // Log the error to database
  logErrorToDatabase(err, req, {
    context: "Express error middleware",
  }).catch(console.error); // Prevent unhandled rejections

  // Pass to next error handler
  next(err);
};
