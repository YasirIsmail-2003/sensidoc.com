import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.details[0].message
      });
      return;
    }
    
    next();
  };
};

// Validation schemas
export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  full_name: Joi.string().min(2).required(),
  phone: Joi.string().optional(),
  role: Joi.string().valid('patient', 'doctor').required(),
  // Doctor specific fields
  specialization: Joi.when('role', {
    is: 'doctor',
    then: Joi.string().required(),
    otherwise: Joi.optional()
  }),
  experience_years: Joi.when('role', {
    is: 'doctor',
    then: Joi.number().min(0).required(),
    otherwise: Joi.optional()
  }),
  qualification: Joi.when('role', {
    is: 'doctor',
    then: Joi.string().required(),
    otherwise: Joi.optional()
  }),
  license_number: Joi.when('role', {
    is: 'doctor',
    then: Joi.string().required(),
    otherwise: Joi.optional()
  }),
  city: Joi.when('role', {
    is: 'doctor',
    then: Joi.string().required(),
    otherwise: Joi.optional()
  }),
  hospital_name: Joi.string().optional(),
  bio: Joi.string().optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const appointmentSchema = Joi.object({
  doctor_id: Joi.string().uuid().required(),
  appointment_date: Joi.date().min('now').required(),
  appointment_time: Joi.string().required(),
  consultation_type: Joi.string().valid('chat', 'video', 'visit').required(),
  symptoms: Joi.string().optional(),
  notes: Joi.string().optional()
});

export const diagnosisSchema = Joi.object({
  input_text: Joi.string().required(),
  input_image: Joi.string().optional()
});

export const drugAnalysisSchema = Joi.object({
  drug_name: Joi.string().optional(),
  drug_image: Joi.string().optional()
}).or('drug_name', 'drug_image');

export const contactSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional(),
  subject: Joi.string().min(5).required(),
  message: Joi.string().min(10).required()
});

export const blogSchema = Joi.object({
  title: Joi.string().min(5).required(),
  content: Joi.string().min(50).required(),
  excerpt: Joi.string().min(20).required(),
  category: Joi.string().required(),
  tags: Joi.array().items(Joi.string()).optional(),
  featured_image: Joi.string().optional(),
  is_published: Joi.boolean().optional()
});