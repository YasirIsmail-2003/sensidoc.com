import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const bookAppointment: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getMyAppointments: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateAppointmentStatus: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAppointmentDetails: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=appointmentController.d.ts.map