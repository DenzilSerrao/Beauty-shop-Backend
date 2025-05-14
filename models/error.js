// models/errorLog.js
import mongoose from 'mongoose';

const errorLogSchema = new mongoose.Schema({
  errorType: { type: String, required: true }, // e.g., "Database", "API", "Validation"
  errorMessage: { type: String, required: true },
  stackTrace: { type: String }, // Full error stack trace
  statusCode: { type: Number }, // HTTP status code if applicable
  route: { type: String }, // API route where error occurred
  requestMethod: { type: String }, // HTTP method (GET, POST, etc.)
  requestBody: { type: Object }, // Request payload if applicable
  requestParams: { type: Object }, // Request parameters if applicable
  requestQuery: { type: Object }, // Query parameters if applicable
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // If user is authenticated
  ipAddress: { type: String }, // Client IP address
  userAgent: { type: String }, // Client browser/device info
  isResolved: { type: Boolean, default: false },
  resolvedAt: { type: Date },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Who resolved it
  resolutionNotes: { type: String } // Notes about how it was resolved
}, {
  timestamps: true
});

export const ErrorLog = mongoose.model('ErrorLog', errorLogSchema);