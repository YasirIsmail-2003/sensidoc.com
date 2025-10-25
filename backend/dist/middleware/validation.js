"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogSchema = exports.contactSchema = exports.drugAnalysisSchema = exports.diagnosisSchema = exports.appointmentSchema = exports.loginSchema = exports.registerSchema = exports.validateRequest = void 0;
const joi_1 = __importDefault(require("joi"));
const validateRequest = (schema) => {
    return (req, res, next) => {
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
exports.validateRequest = validateRequest;
exports.registerSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
    full_name: joi_1.default.string().min(2).required(),
    phone: joi_1.default.string().optional(),
    role: joi_1.default.string().valid('patient', 'doctor').required(),
    specialization: joi_1.default.when('role', {
        is: 'doctor',
        then: joi_1.default.string().required(),
        otherwise: joi_1.default.optional()
    }),
    experience_years: joi_1.default.when('role', {
        is: 'doctor',
        then: joi_1.default.number().min(0).required(),
        otherwise: joi_1.default.optional()
    }),
    qualification: joi_1.default.when('role', {
        is: 'doctor',
        then: joi_1.default.string().required(),
        otherwise: joi_1.default.optional()
    }),
    license_number: joi_1.default.when('role', {
        is: 'doctor',
        then: joi_1.default.string().required(),
        otherwise: joi_1.default.optional()
    }),
    city: joi_1.default.when('role', {
        is: 'doctor',
        then: joi_1.default.string().required(),
        otherwise: joi_1.default.optional()
    }),
    hospital_name: joi_1.default.string().optional(),
    bio: joi_1.default.string().optional()
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required()
});
exports.appointmentSchema = joi_1.default.object({
    doctor_id: joi_1.default.string().uuid().required(),
    appointment_date: joi_1.default.date().min('now').required(),
    appointment_time: joi_1.default.string().required(),
    consultation_type: joi_1.default.string().valid('chat', 'video', 'visit').required(),
    symptoms: joi_1.default.string().optional(),
    notes: joi_1.default.string().optional()
});
exports.diagnosisSchema = joi_1.default.object({
    input_text: joi_1.default.string().required(),
    input_image: joi_1.default.string().optional()
});
exports.drugAnalysisSchema = joi_1.default.object({
    drug_name: joi_1.default.string().optional(),
    drug_image: joi_1.default.string().optional()
}).or('drug_name', 'drug_image');
exports.contactSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).required(),
    email: joi_1.default.string().email().required(),
    phone: joi_1.default.string().optional(),
    subject: joi_1.default.string().min(5).required(),
    message: joi_1.default.string().min(10).required()
});
exports.blogSchema = joi_1.default.object({
    title: joi_1.default.string().min(5).required(),
    content: joi_1.default.string().min(50).required(),
    excerpt: joi_1.default.string().min(20).required(),
    category: joi_1.default.string().required(),
    tags: joi_1.default.array().items(joi_1.default.string()).optional(),
    featured_image: joi_1.default.string().optional(),
    is_published: joi_1.default.boolean().optional()
});
//# sourceMappingURL=validation.js.map