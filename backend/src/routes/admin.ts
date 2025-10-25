import { Router } from 'express';
import { 
  getDashboardStats, 
  getUsers, 
  getDoctors, 
  verifyDoctor, 
  getAppointments, 
  getLoginLogs, 
  updateUserMembership, 
  getQuotas, setQuotaForRole,
  getSubscriptionPlans, upsertSubscriptionPlan, getPendingPayments, approvePayment, setUserBlocked, deleteSubscriptionPlan
} from '@/controllers/adminController';
import { authenticateToken, requireAdmin } from '@/middleware/auth';

const router = Router();

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard and statistics
router.get('/stats', getDashboardStats);
router.get('/login-logs', getLoginLogs);

// User management
router.get('/users', getUsers);
router.put('/users/:userId/membership', updateUserMembership);

// Doctor management
router.get('/doctors', getDoctors);
router.put('/doctors/:doctorId/verify', verifyDoctor);

// Appointment management
router.get('/appointments', getAppointments);

// Quota management
router.get('/quotas', getQuotas);
router.put('/quotas/:role', setQuotaForRole);

// Plans
router.get('/plans', getSubscriptionPlans);
router.post('/plans', upsertSubscriptionPlan);
router.delete('/plans/:planId', deleteSubscriptionPlan);

// Payments/subscriptions
router.get('/payments/pending', getPendingPayments);
router.put('/payments/:paymentId/approve', approvePayment);

// User block/unblock
router.put('/users/:userId/block', setUserBlocked);

export default router;