import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/config/database';
import { ApiResponse } from '@/types';
import { AuthRequest } from '@/middleware/auth';
import emailService from '@/services/emailService';

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Submit contact form
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - subject
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contact form submitted successfully
 *       400:
 *         description: Validation error
 */
export const submitContactForm = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Save to database
    const contactId = uuidv4();
    const { error } = await supabase
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

    // Send email notification
    try {
      await emailService.sendContactFormEmail({
        name,
        email,
        phone,
        subject,
        message
      });
    } catch (emailError) {
      console.error('Failed to send contact form email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully. We will get back to you soon.',
      data: { contactId }
    } as ApiResponse);

  } catch (error) {
    console.error('Submit contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
};

/**
 * @swagger
 * /api/contact/submissions:
 *   get:
 *     summary: Get contact form submissions (admin only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, in_progress, resolved]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Contact submissions retrieved successfully
 *       403:
 *         description: Admin access required
 */
export const getContactSubmissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user!.role;

    if (userRole !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Only admins can view contact submissions'
      } as ApiResponse);
      return;
    }

    const { status, page = 1, limit = 20 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
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
    } as ApiResponse);

  } catch (error) {
    console.error('Get contact submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
};

/**
 * @swagger
 * /api/contact/submissions/{submissionId}/status:
 *   put:
 *     summary: Update contact submission status (admin only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [new, in_progress, resolved]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Submission not found
 */
export const updateSubmissionStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { submissionId } = req.params;
    const { status } = req.body;
    const userRole = req.user!.role;

    if (userRole !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Only admins can update submission status'
      } as ApiResponse);
      return;
    }

    const { error } = await supabase
      .from('contact_submissions')
      .update({ status })
      .eq('id', submissionId);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Submission status updated successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Update submission status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
};