import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getDiagnosis: (req: AuthRequest, res: Response) => Promise<void>;
export declare const detectFracture: (req: AuthRequest, res: Response) => Promise<void>;
export declare const detectTablet: (req: AuthRequest, res: Response) => Promise<void>;
export declare const analyzeDrug: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAIHistory: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUsageStats: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=aiController.d.ts.map