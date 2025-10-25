"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubmissionStatus = exports.getContactSubmissions = exports.submitContactForm = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../config/database");
const emailService_1 = __importDefault(require("../services/emailService"));
const submitContactForm = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        const contactId = (0, uuid_1.v4)();
        const { error } = await database_1.supabase
            .from('contact_submissions')
            .insert([{
                id: contactId,
                name,
                email,
                phone,
                subject,
                message,
                status: 'new',
                created_at: new Date().toISOString()
            }]);
        if (error) {
            throw error;
        }
        try {
            await emailService_1.default.sendContactFormEmail({
                name,
                email,
                phone,
                subject,
                message
            });
        }
        catch (emailError) {
            console.error('Failed to send contact form email:', emailError);
        }
        res.status(201).json({
            success: true,
            message: 'Contact form submitted successfully. We will get back to you soon.',
            data: { contactId }
        });
    }
    catch (error) {
        console.error('Submit contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.submitContactForm = submitContactForm;
const getContactSubmissions = async (req, res) => {
    try {
        const userRole = req.user.role;
        if (userRole !== 'admin') {
            res.status(403).json({
                success: false,
                message: 'Only admins can view contact submissions'
            });
            return;
        }
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        let query = database_1.supabase
            .from('contact_submissions')
            .select('*')
            .order('created_at', { ascending: false })
            .range(offset, offset + Number(limit) - 1);
        if (status) {
            query = query.eq('status', status);
        }
        const { data: submissions, error, count } = await query;
        if (error) {
            throw error;
        }
        const totalPages = Math.ceil((count || 0) / Number(limit));
        res.json({
            success: true,
            message: 'Contact submissions retrieved successfully',
            data: submissions,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: count || 0,
                totalPages
            }
        });
    }
    catch (error) {
        console.error('Get contact submissions error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getContactSubmissions = getContactSubmissions;
const updateSubmissionStatus = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { status } = req.body;
        const userRole = req.user.role;
        if (userRole !== 'admin') {
            res.status(403).json({
                success: false,
                message: 'Only admins can update submission status'
            });
            return;
        }
        const { error } = await database_1.supabase
            .from('contact_submissions')
            .update({ status })
            .eq('id', submissionId);
        if (error) {
            throw error;
        }
        res.json({
            success: true,
            message: 'Submission status updated successfully'
        });
    }
    catch (error) {
        console.error('Update submission status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.updateSubmissionStatus = updateSubmissionStatus;
//# sourceMappingURL=contactController.js.map