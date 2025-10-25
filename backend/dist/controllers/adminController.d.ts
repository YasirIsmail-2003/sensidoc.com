import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getDashboardStats: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUsers: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getDoctors: (req: AuthRequest, res: Response) => Promise<void>;
export declare const verifyDoctor: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAppointments: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getLoginLogs: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateUserMembership: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=adminController.d.ts.map