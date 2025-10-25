import { Router } from 'express';
import { 
  bookAppointment, 
  getMyAppointments, 
  updateAppointmentStatus, 
  getAppointmentDetails 
} from '@/controllers/appointmentController';
import { authenticateToken, requireDoctorOrPatient, requireDoctor } from '@/middleware/auth';
import { validateRequest, appointmentSchema } from '@/middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Patient and doctor routes
router.post('/', requireDoctorOrPatient, validateRequest(appointmentSchema), bookAppointment);
router.get('/my-appointments', requireDoctorOrPatient, getMyAppointments);
router.get('/:appointmentId', requireDoctorOrPatient, getAppointmentDetails);

// Doctor only routes
router.put('/:appointmentId/status', requireDoctor, updateAppointmentStatus);

export default router;