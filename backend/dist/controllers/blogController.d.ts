import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getBlogs: (req: Request, res: Response) => Promise<void>;
export declare const getBlogById: (req: Request, res: Response) => Promise<void>;
export declare const getBlogSummary: (req: Request, res: Response) => Promise<void>;
export declare const createBlog: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateBlog: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteBlog: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getCategories: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=blogController.d.ts.map