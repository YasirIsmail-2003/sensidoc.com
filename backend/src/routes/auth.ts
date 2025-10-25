import { Router } from 'express';
import { register, login, getProfile, logout } from '@/controllers/authController';
import { authenticateToken, authLimiter } from '@/middleware';
import { validateRequest, registerSchema, loginSchema } from '@/middleware/validation';

const router = Router();

// Public routes
router.post('/register', authLimiter, validateRequest(registerSchema), register);
router.post('/login', authLimiter, validateRequest(loginSchema), login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.post('/logout', authenticateToken, logout);

export default router;