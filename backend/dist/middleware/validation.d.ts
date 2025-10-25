import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
export declare const validateRequest: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const registerSchema: Joi.ObjectSchema<any>;
export declare const loginSchema: Joi.ObjectSchema<any>;
export declare const appointmentSchema: Joi.ObjectSchema<any>;
export declare const diagnosisSchema: Joi.ObjectSchema<any>;
export declare const drugAnalysisSchema: Joi.ObjectSchema<any>;
export declare const contactSchema: Joi.ObjectSchema<any>;
export declare const blogSchema: Joi.ObjectSchema<any>;
//# sourceMappingURL=validation.d.ts.map