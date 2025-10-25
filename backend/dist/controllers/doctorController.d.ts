import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getDoctors: (req: Request, res: Response) => Promise<void>;
export declare const getDoctorById: (req: Request, res: Response) => Promise<void>;
export declare const getSpecializations: (req: Request, res: Response) => Promise<void>;
export declare const updateDoctorProfile: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getDoctorDashboardStats: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=doctorController.d.ts.map