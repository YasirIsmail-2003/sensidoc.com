import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/config/database';
import { ApiResponse } from '@/types';
import { AuthRequest } from '@/middleware/auth';
import emailService from '@/services/emailService';

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Book a new appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctor_id
 *               - appointment_date
 *               - appointment_time
 *               - consultation_type
 *             properties:
 *               doctor_id:
 *                 type: string
 *                 format: uuid
 *               appointment_date:
 *                 type: string
 *                 format: date
 *               appointment_time:
 *                 type: string
 *               consultation_type:
 *                 type: string
 *                 enum: [chat, video, visit]
 *               symptoms:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment booked successfully
 *       400:
 *         description: Invalid request data
 */
export const bookAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patientId = req.user!.id;
    const {
      doctor_id,
      appointment_date,
      appointment_time,
      consultation_type,
      symptoms,
      notes
    } = req.body;

    // Verify doctor exists and is available
    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .select('*, users!inner(full_name, email)')
      .eq('id', doctor_id)
      .eq('is_verified', true)
      .single();

    if (doctorError || !doctor) {
      res.status(400).json({
        success: false,
        message: 'Doctor not found or not available'
      } as ApiResponse);
      return;
    }

    // Check for conflicting appointments
    const { data: existingAppointment } = await supabase
      .from('appointments')
      .select('id')
      .eq('doctor_id', doctor_id)
      .eq('appointment_date', appointment_date)
      .eq('appointment_time', appointment_time)
      .in('status', ['pending', 'confirmed'])
      .single();

    if (existingAppointment) {
      res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      } as ApiResponse);
      return;
    }

    // Enforce patient quota based on subscriptions or default role quotas
    // Fetch user's active subscription
    const { data: activeSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', patientId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let patientQuota = activeSub?.quota_monthly || 0;
    if (!patientQuota) {
      // fallback to role quota for 'patient' role
      const { data: roleQuota } = await supabase.from('quotas').select('monthly_quota').eq('role', 'patient').single();
      patientQuota = roleQuota?.monthly_quota || 0;
    }

    if (patientQuota > 0) {
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { count } = await supabase
        .from('appointments')
        .select('id', { count: 'exact' })
        .eq('patient_id', patientId)
        .gte('created_at', startOfMonth)

      const used = count || 0
      if (used >= patientQuota) {
        res.status(403).json({ success: false, message: 'Monthly appointment quota exceeded' } as ApiResponse)
        return
      }
    }

    // Create appointment
    const appointmentId = uuidv4();
    const { error: appointmentError } = await supabase
      .from('appointments')
      .insert([{
        id: appointmentId,
        patient_id: patientId,
        doctor_id,
        appointment_date,
        appointment_time,
        consultation_type,
        symptoms,
        notes,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (appointmentError) {
      throw appointmentError;
    }

    // Get patient details for email
    const { data: patient } = await supabase
      .from('users')
      .select('full_name, email')
      .eq('id', patientId)
      .single();

    // Send confirmation email
    if (patient) {
      await emailService.sendAppointmentConfirmation({
        patientEmail: patient.email,
        patientName: patient.full_name,
        doctorName: doctor.users.full_name,
        appointmentDate: appointment_date,
        appointmentTime: appointment_time,
        consultationType: consultation_type
      });
    }

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: {
        appointmentId,
        status: 'pending'
      }
    } as ApiResponse);

  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
};

/**
 * @swagger
 * /api/appointments/my-appointments:
 *   get:
 *     summary: Get user's appointments
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, completed, cancelled, rejected]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 */
export const getMyAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { status, page = 1, limit = 10 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from('appointments')
      .select(`
        *,
        patient:users!appointments_patient_id_fkey(id, full_name, email, phone),
        doctor:doctors!appointments_doctor_id_fkey(
          id,
          specialization,
          consultation_fee,
          users!doctors_user_id_fkey(full_name, email)
        )
      `)
      .order('appointment_date', { ascending: false })
      .order('appointment_time', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    // Filter based on user role
    if (userRole === 'patient') {
      query = query.eq('patient_id', userId);
    } else if (userRole === 'doctor') {
      // Get doctor ID first
      const { data: doctorProfile } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (doctorProfile) {
        query = query.eq('doctor_id', doctorProfile.id);
      }
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: appointments, error, count } = await query;

    if (error) {
      throw error;
    }

    const totalPages = Math.ceil((count || 0) / Number(limit));

    res.json({
      success: true,
      message: 'Appointments retrieved successfully',
      data: appointments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages
      }
    } as ApiResponse);

  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
};

/**
 * @swagger
 * /api/appointments/{appointmentId}/status:
 *   put:
 *     summary: Update appointment status (doctors only)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
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
 *                 enum: [confirmed, rejected, completed, cancelled]
 *               notes:
 *                 type: string
 *               prescription:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment status updated successfully
 *       403:
 *         description: Not authorized to update this appointment
 */
export const updateAppointmentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { appointmentId } = req.params;
    const { status, notes, prescription } = req.body;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Get appointment details
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('*, doctor:doctors!appointments_doctor_id_fkey(user_id)')
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      res.status(404).json({
        success: false,
        message: 'Appointment not found'
      } as ApiResponse);
      return;
    }

    // Check authorization
    if (userRole === 'doctor' && appointment.doctor.user_id !== userId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      } as ApiResponse);
      return;
    }

    // Update appointment
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (notes) updateData.notes = notes;
    if (prescription) updateData.prescription = prescription;

    const { error: updateError } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', appointmentId);

    if (updateError) {
      throw updateError;
    }

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      data: { status }
    } as ApiResponse);

  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
};

/**
 * @swagger
 * /api/appointments/{appointmentId}:
 *   get:
 *     summary: Get appointment details
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Appointment details retrieved successfully
 *       404:
 *         description: Appointment not found
 */
export const getAppointmentDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:users!appointments_patient_id_fkey(id, full_name, email, phone),
        doctor:doctors!appointments_doctor_id_fkey(
          id,
          specialization,
          consultation_fee,
          users!doctors_user_id_fkey(full_name, email)
        )
      `)
      .eq('id', appointmentId)
      .single();

    if (error || !appointment) {
      res.status(404).json({
        success: false,
        message: 'Appointment not found'
      } as ApiResponse);
      return;
    }

    // Check authorization
    let isAuthorized = false;
    if (userRole === 'patient' && appointment.patient_id === userId) {
      isAuthorized = true;
    } else if (userRole === 'doctor' && appointment.doctor.users.id === userId) {
      isAuthorized = true;
    } else if (userRole === 'admin') {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment'
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      message: 'Appointment details retrieved successfully',
      data: appointment
    } as ApiResponse);

  } catch (error) {
    console.error('Get appointment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
};