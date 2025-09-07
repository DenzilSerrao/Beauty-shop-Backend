import { connectDB } from "../lib/db.js";
import { User } from "../models/user.js";
import jwt from "jsonwebtoken";
import { ValidationError, AuthenticationError } from "../utils/errors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logger } from "../utils/logger.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Ensure database connection
  await connectDB();
  logger.info("Attempting user registration", { email });

  // Validate required fields
  if (!name || !email || !password) {
    const error = new ValidationError("Name, email, and password are required");
    error.context = { email };
    throw error;
  }

  // Check for existing user
  const existingUser = await User.findOne({ email }).exec();
  if (existingUser) {
    const error = new ValidationError("Email already registered");
    error.context = { email };
    throw error;
  }

  // Create new user
  const user = await User.create({ name, email, password });
  logger.info("User registered successfully", { userId: user.id, email });

  // Generate JWT token
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: "10h",
  });

  // Send response
  res.status(201).json({
    status: "success",
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    },
  });
});

// controllers/auth.js
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    const error = new ValidationError("Email and password are required");
    error.statusCode = 400;
    throw error;
  }

  // Ensure DB connection
  await connectDB();
  logger.info("Attempting user login", { email });

  // Find user
  const user = await User.findOne({ email }).exec();
  if (!user) {
    const error = new AuthenticationError("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new AuthenticationError("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  // Generate JWT token
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  logger.info("User logged in successfully", {
    userId: user.id,
    email: user.email,
  });

  // Return success response
  return res.status(200).json({
    status: "success",
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    },
  });
});

export const verifyToken = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    const error = new AuthenticationError("No token provided");
    error.statusCode = 401;
    throw error;
  }

  await connectDB();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).exec();

    if (!user) {
      const error = new AuthenticationError("User not found");
      error.statusCode = 404;
      error.context = { decodedUserId: decoded.userId };
      throw error;
    }

    logger.info("Token verified successfully", {
      userId: user.id,
      route: req.originalUrl,
    });

    res.json({
      status: "success",
      data: {
        valid: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      // const error = new AuthenticationError('Invalid token');
      console.error("Invalid token:", err);
      err.statusCode = 401;
      throw err;
    } else if (err.name === "TokenExpiredError") {
      // const error = new AuthenticationError('Token expired');
      console.error("Token expired:", err);
      err.statusCode = 401;
      throw err;
    }

    res.status(500).json({ status: "fail", message: "Failed to fetch" });
    throw err;
  }
});
