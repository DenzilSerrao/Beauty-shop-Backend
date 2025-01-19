import { AuthService } from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const result = await AuthService.registerUser(req.body);
  
  res.status(201).json({
    status: 'success',
    data: result
  });
});

export const login = asyncHandler(async (req, res) => {
  const result = await AuthService.loginUser(req.body);
  
  res.json({
    status: 'success',
    data: result
  });
});

export const verifyToken = asyncHandler(async (req, res) => {
  // Token is already verified by auth middleware
  res.json({
    status: 'success',
    data: { valid: true }
  });
});