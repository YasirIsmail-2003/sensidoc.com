import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const submitContactForm: (req: Request, res: Response) => Promise<void>;
export declare const getContactSubmissions: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateSubmissionStatus: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=contactController.d.ts.map