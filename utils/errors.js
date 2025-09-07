// utils/error.js
import { logger } from "./logger.js";
import { logErrorToDatabase } from "../lib/dbLogger.js";

// Custom error classes (keep your existing ones)
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication failed") {
    super(message, 401);
    this.name = "AuthenticationError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

// Enhanced error handler middleware with database logging
export const errorHandler = async (err, req, res, next) => {
  // Log to database first
  try {
    await logErrorToDatabase(err, req, {
      context: "Express error handler",
    });
  } catch (dbError) {
    // If database logging fails, fall back to regular logger
    logger.error("Failed to log error to database in error handler:", dbError);
    logger.error("Original error:", err);
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : "Internal server error";

  // Log to console as well
  logger.error(err, req);

  res.status(statusCode).json({
    status: err.status || "error",
    message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      errorId: err._id, // If you want to return the error ID for debugging
    }),
  });
};
