// utils/error.js
// REMOVE these imports to break circular dependency
// import { logger } from "./logger.js";
// import { logErrorToDatabase } from "../lib/dbLogger.js";

// Use simple console logging instead
const logger = {
  error: (message, error, req = null) => {
    console.error("ERROR:", message);
    if (error) console.error("Error details:", error.message, error.stack);
    if (req) console.error("Request details:", req.method, req.url);
  },
  info: (message, data) => console.log("INFO:", message, data),
};

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

// Enhanced error handler middleware
export const errorHandler = async (err, req, res, next) => {
  // Log to console first
  logger.error("Error occurred:", err, req);

  // Try to log to database using dynamic import to avoid circular dependency
  try {
    // Use dynamic import to break circular dependency
    const { logErrorToDatabase } = await import("../lib/dbLogger.js");
    await logErrorToDatabase(err, req, {
      context: "Express error handler",
    });
  } catch (dbError) {
    // If database logging fails, fall back to console logging
    logger.error("Failed to log error to database:", dbError);
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : "Internal server error";

  res.status(statusCode).json({
    status: err.status || "error",
    message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};

// Optional: Separate function for manual error logging if needed
export const logError = async (error, context = {}) => {
  try {
    const { logErrorToDatabase } = await import("../lib/dbLogger.js");
    return await logErrorToDatabase(error, null, context);
  } catch (dbError) {
    logger.error("Failed to log error:", dbError);
    return null;
  }
};
