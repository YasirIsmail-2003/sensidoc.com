"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppointmentDetails = exports.updateAppointmentStatus = exports.getMyAppointments = exports.bookAppointment = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../config/database");
const emailService_1 = __importDefault(require("../services/emailService"));
const bookAppointment = async (req, res) => {
    try {
        const patientId = req.user.id;
        const { doctor_id, appointment_date, appointment_time, consultation_type, symptoms, notes } = req.body;
        const { data: doctor, error: doctorError } = await database_1.supabase
            .from('doctors')
            .select('*, users!inner(full_name, email)')
            .eq('id', doctor_id)
            .eq('is_verified', true)
            .single();
        if (doctorError || !doctor) {
            res.status(400).json({
                success: false,
                message: 'Doctor not found or not available'
            });
            return;
        }
        const { data: existingAppointment } = await database_1.supabase
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
            });
            return;
        }
        const appointmentId = (0, uuid_1.v4)();
        const { error: appointmentError } = await database_1.supabase
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
        const { data: patient } = await database_1.supabase
            .from('users')
            .select('full_name, email')
            .eq('id', patientId)
            .single();
        if (patient) {
            await emailService_1.default.sendAppointmentConfirmation({
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
        });
    }
    catch (error) {
        console.error('Book appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.bookAppointment = bookAppointment;
const getMyAppointments = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { status, page = 1, limit = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        let query = database_1.supabase
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
        if (userRole === 'patient') {
            query = query.eq('patient_id', userId);
        }
        else if (userRole === 'doctor') {
            const { data: doctorProfile } = await database_1.supabase
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
        });
    }
    catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getMyAppointments = getMyAppointments;
const updateAppointmentStatus = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { status, notes, prescription } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;
        const { data: appointment, error: appointmentError } = await database_1.supabase
            .from('appointments')
            .select('*, doctor:doctors!appointments_doctor_id_fkey(user_id)')
            .eq('id', appointmentId)
            .single();
        if (appointmentError || !appointment) {
            res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
            return;
        }
        if (userRole === 'doctor' && appointment.doctor.user_id !== userId) {
            res.status(403).json({
                success: false,
                message: 'Not authorized to update this appointment'
            });
            return;
        }
        const updateData = {
            status,
            updated_at: new Date().toISOString()
        };
        if (notes)
            updateData.notes = notes;
        if (prescription)
            updateData.prescription = prescription;
        const { error: updateError } = await database_1.supabase
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
        });
    }
    catch (error) {
        console.error('Update appointment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.updateAppointmentStatus = updateAppointmentStatus;
const getAppointmentDetails = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;
        const { data: appointment, error } = await database_1.supabase
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
            });
            return;
        }
        let isAuthorized = false;
        if (userRole === 'patient' && appointment.patient_id === userId) {
            isAuthorized = true;
        }
        else if (userRole === 'doctor' && appointment.doctor.users.id === userId) {
            isAuthorized = true;
        }
        else if (userRole === 'admin') {
            isAuthorized = true;
        }
        if (!isAuthorized) {
            res.status(403).json({
                success: false,
                message: 'Not authorized to view this appointment'
            });
            return;
        }
        res.json({
            success: true,
            message: 'Appointment details retrieved successfully',
            data: appointment
        });
    }
    catch (error) {
        console.error('Get appointment details error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getAppointmentDetails = getAppointmentDetails;
//# sourceMappingURL=appointmentController.js.map