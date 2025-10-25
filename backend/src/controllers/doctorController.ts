import { Request, Response } from 'express';
import { supabase } from '@/config/database';
import { ApiResponse } from '@/types';
import { AuthRequest } from '@/middleware/auth';

/**
 * @swagger
 * /api/doctors:
 *   get:
 *     summary: Get list of doctors
 *     tags: [Doctors]
 *     parameters:
 *       - in: query
 *         name: specialization
 *         schema:
 *           type: string
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: is_online
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: is_verified
 *         schema:
 *           type: boolean
 *           default: true
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
 *         description: Doctors retrieved successfully
 */
export const getDoctors = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      specialization, 
      city, 
      is_online, 
      is_verified = true, 
      page = 1, 
      limit = 10 
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from('doctors')
      .select(`
        *,
        users!doctors_user_id_fkey(id, full_name, email, phone)
      `)
      .eq('is_verified', is_verified)
      .order('rating', { ascending: false })
      .order('total_consultations', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (specialization) {
      query = query.ilike('specialization', `%${specialization}%`);
    }

    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    if (is_online !== undefined) {
      query = query.eq('is_online', is_online === 'true');
    }

    const { data: doctors, error, count } = await query;

    if (error) {
      throw error;
    }

    const totalPages = Math.ceil((count || 0) / Number(limit));

    res.json({
      success: true,
      message: 'Doctors retrieved successfully',
      data: doctors,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages
      }
    } as ApiResponse);

  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
};

/**
 * @swagger
 * /api/doctors/{doctorId}:
 *   get:
 *     summary: Get doctor details
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Doctor details retrieved successfully
 *       404:
 *         description: Doctor not found
 */
export const getDoctorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId } = req.params;

    const { data: doctor, error } = await supabase
      .from('doctors')
      .select(`
        *,
        users!doctors_user_id_fkey(id, full_name, email, phone)
      `)
      .eq('id', doctorId)
      .eq('is_verified', true)
      .single();

    if (error || !doctor) {
      res.status(404).json({
        success: false,
        message: 'Doctor not found'
      } as ApiResponse);
      return;
    }

    // Get doctor's recent reviews/ratings (if you have a reviews table)
    // For now, we'll just return the doctor data

    res.json({
      success: true,
      message: 'Doctor details retrieved successfully',
      data: doctor
    } as ApiResponse);

  } catch (error) {
    console.error('Get doctor by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
};

/**
 * @swagger
 * /api/doctors/specializations:
 *   get:
 *     summary: Get list of available specializations
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: Specializations retrieved successfully
 */
export const getSpecializations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data: specializations, error } = await supabase
      .from('doctors')
      .select('specialization')
      .eq('is_verified', true);

    if (error) {
      throw error;
    }

    // Get unique specializations with counts
    const specializationCounts = specializations?.reduce((acc: any, doctor: any) => {
      const spec = doctor.specialization;
      acc[spec] = (acc[spec] || 0) + 1;
      return acc;
    }, {});

    const uniqueSpecializations = Object.entries(specializationCounts || {})
      .map(([name, count]: [string, any]) => ({ name, count }))
      .sort((a: any, b: any) => (b.count as number) - (a.count as number));

    res.json({
      success: true,
      message: 'Specializations retrieved successfully',
      data: uniqueSpecializations
    } as ApiResponse);

  } catch (error) {
    console.error('Get specializations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
};

/**
 * @swagger
 * /api/doctors/profile:
 *   put:
 *     summary: Update doctor profile (doctors only)
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               specialization:
 *                 type: string
 *               experience_years:
 *                 type: integer
 *               qualification:
 *                 type: string
 *               consultation_fee:
 *                 type: number
 *               city:
 *                 type: string
 *               hospital_name:
 *                 type: string
 *               bio:
 *                 type: string
 *               is_online:
 *                 type: boolean
 *               is_video_available:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       403:
 *         description: Only doctors can update doctor profiles
 */
export const updateDoctorProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    if (userRole !== 'doctor') {
      res.status(403).json({
        success: false,
        message: 'Only doctors can update doctor profiles'
      } as ApiResponse);
      return;
    }

    const {
      specialization,
      experience_years,
      qualification,
      consultation_fee,
      city,
      hospital_name,
      bio,
      is_online,
      is_video_available,
      profile_image
    } = req.body;

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (specialization) updateData.specialization = specialization;
    if (experience_years !== undefined) updateData.experience_years = experience_years;
    if (qualification) updateData.qualification = qualification;
    if (consultation_fee !== undefined) updateData.consultation_fee = consultation_fee;
    if (city) updateData.city = city;
    if (hospital_name !== undefined) updateData.hospital_name = hospital_name;
    if (bio !== undefined) updateData.bio = bio;
    if (is_online !== undefined) updateData.is_online = is_online;
    if (is_video_available !== undefined) updateData.is_video_available = is_video_available;
    if (profile_image !== undefined) updateData.profile_image = profile_image;

    const { error } = await supabase
      .from('doctors')
      .update(updateData)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Doctor profile updated successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
};

/**
 * @swagger
 * /api/doctors/dashboard/stats:
 *   get:
 *     summary: Get doctor dashboard statistics
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *       403:
 *         description: Only doctors can access this endpoint
 */
export const getDoctorDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    if (userRole !== 'doctor') {
      res.status(403).json({
        success: false,
        message: 'Only doctors can access this endpoint'
      } as ApiResponse);
      return;
    }

    // Get doctor ID
    const { data: doctorProfile } = await supabase
      .from('doctors')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!doctorProfile) {
      res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      } as ApiResponse);
      return;
    }

    const doctorId = doctorProfile.id;

    // Get statistics
    const [
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      todayAppointments
    ] = await Promise.all([
      supabase
        .from('appointments')
        .select('id', { count: 'exact' })
        .eq('doctor_id', doctorId),
      supabase
        .from('appointments')
        .select('id', { count: 'exact' })
        .eq('doctor_id', doctorId)
        .eq('status', 'pending'),
      supabase
        .from('appointments')
        .select('id', { count: 'exact' })
        .eq('doctor_id', doctorId)
        .eq('status', 'completed'),
      supabase
        .from('appointments')
        .select('id', { count: 'exact' })
        .eq('doctor_id', doctorId)
        .eq('appointment_date', new Date().toISOString().split('T')[0])
    ]);

    res.json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: {
        totalAppointments: totalAppointments.count || 0,
        pendingAppointments: pendingAppointments.count || 0,
        completedAppointments: completedAppointments.count || 0,
        todayAppointments: todayAppointments.count || 0
      }
    } as ApiResponse);

  } catch (error) {
    console.error('Get doctor dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
};