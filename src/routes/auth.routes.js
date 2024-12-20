import express from 'express';
import { register, login, verifyToken } from '../controllers/auth.controller.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify', auth, verifyToken);

export default router;