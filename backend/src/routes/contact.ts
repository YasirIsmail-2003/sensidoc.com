import { Router } from 'express';
import { 
  submitContactForm, 
  getContactSubmissions, 
  updateSubmissionStatus 
} from '@/controllers/contactController';
import { authenticateToken, requireAdmin, contactLimiter } from '@/middleware';
import { validateRequest, contactSchema } from '@/middleware/validation';

const router = Router();

// Public route
router.post('/', contactLimiter, validateRequest(contactSchema), submitContactForm);

// Admin only routes
router.get('/submissions', authenticateToken, requireAdmin, getContactSubmissions);
router.put('/submissions/:submissionId/status', authenticateToken, requireAdmin, updateSubmissionStatus);

export default router;