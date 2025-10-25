import { Router } from 'express';
import { getDiagnosis, analyzeDrug, getAIHistory, getUsageStats } from '@/controllers/aiController';
import { authenticateToken, requireDoctorOrPatient, aiLimiter } from '@/middleware';
import { validateRequest, diagnosisSchema, drugAnalysisSchema } from '@/middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);
router.use(requireDoctorOrPatient);

// AI service routes with rate limiting
router.post('/diagnose', aiLimiter, validateRequest(diagnosisSchema), getDiagnosis);
router.post('/drug-analyze', aiLimiter, validateRequest(drugAnalysisSchema), analyzeDrug);

// Additional AI endpoints
router.post('/detect-fracture', aiLimiter, async (req, res, next) => {
  try {
    const { input_image } = req.body
    const result = await (await import('@/services/aiService')).default.detectFracture(input_image)
    res.json({ success: true, data: result })
  } catch (e) { next(e) }
})

router.post('/detect-tablet', aiLimiter, async (req, res, next) => {
  try {
    const { input_image } = req.body
    // Use the generic drug analysis as a fallback for tablet detection
    const result = await (await import('@/services/aiService')).default.analyzeDrug(undefined, input_image)
    res.json({ success: true, data: result })
  } catch (e) { next(e) }
})

// History and stats routes
router.get('/history', getAIHistory);
router.get('/usage-stats', getUsageStats);

export default router;