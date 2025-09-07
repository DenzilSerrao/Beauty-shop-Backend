import { connectDB } from "./db.js";
import { ErrorLog } from "../models/error.js";

// Use console logging instead to break circular dependency
const logger = {
  info: (message, data) => console.log("INFO:", message, data),
  error: (message, error) => console.error("ERROR:", message, error),
};

export const logErrorToDatabase = async (error, req = null, context = {}) => {
  try {
    await connectDB();

    // Extract information from request if available
    let requestInfo = {};
    if (req) {
      requestInfo = {
        route: req.originalUrl,
        requestMethod: req.method,
        // Only log minimal request body for security
        requestBody: req.body ? { ...req.body } : null,
        requestParams: req.params,
        requestQuery: req.query,
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get("User-Agent"),
        user: req.user?._id,
      };

      // Remove sensitive data from request body
      if (requestInfo.requestBody) {
        const sensitiveFields = ["password", "token", "creditCard", "cvv"];
        sensitiveFields.forEach((field) => {
          if (requestInfo.requestBody[field]) {
            requestInfo.requestBody[field] = "***REDACTED***";
          }
        });
      }
    }

    const errorLog = new ErrorLog({
      errorType: error.name || "UnknownError",
      errorMessage: error.message,
      stackTrace: error.stack,
      statusCode: error.statusCode || context.statusCode || 500,
      ...requestInfo,
      ...context,
    });

    await errorLog.save();

    logger.info("Error logged to database successfully", {
      errorId: errorLog._id,
      errorType: errorLog.errorType,
    });

    return errorLog._id;
  } catch (logError) {
    logger.error("Failed to log error to database:", logError);
    logger.error("Original error that failed to log:", error.message);
    return null; // Don't re-throw
  }
};
