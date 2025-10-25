import { Router } from 'express';
import { 
  getDoctors, 
  getDoctorById, 
  getSpecializations, 
  updateDoctorProfile, 
  getDoctorDashboardStats 
} from '@/controllers/doctorController';
import { authenticateToken, requireDoctor } from '@/middleware/auth';

const router = Router();

// Public routes
router.get('/', getDoctors);
router.get('/specializations', getSpecializations);
router.get('/:doctorId', getDoctorById);

// Protected routes
router.put('/profile', authenticateToken, requireDoctor, updateDoctorProfile);
router.get('/dashboard/stats', authenticateToken, requireDoctor, getDoctorDashboardStats);

export default router;