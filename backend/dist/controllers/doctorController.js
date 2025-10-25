"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDoctorDashboardStats = exports.updateDoctorProfile = exports.getSpecializations = exports.getDoctorById = exports.getDoctors = void 0;
const database_1 = require("../config/database");
const getDoctors = async (req, res) => {
    try {
        const { specialization, city, is_online, is_verified = true, page = 1, limit = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        let query = database_1.supabase
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
        });
    }
    catch (error) {
        console.error('Get doctors error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getDoctors = getDoctors;
const getDoctorById = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { data: doctor, error } = await database_1.supabase
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
            });
            return;
        }
        res.json({
            success: true,
            message: 'Doctor details retrieved successfully',
            data: doctor
        });
    }
    catch (error) {
        console.error('Get doctor by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getDoctorById = getDoctorById;
const getSpecializations = async (req, res) => {
    try {
        const { data: specializations, error } = await database_1.supabase
            .from('doctors')
            .select('specialization')
            .eq('is_verified', true);
        if (error) {
            throw error;
        }
        const specializationCounts = specializations?.reduce((acc, doctor) => {
            const spec = doctor.specialization;
            acc[spec] = (acc[spec] || 0) + 1;
            return acc;
        }, {});
        const uniqueSpecializations = Object.entries(specializationCounts || {})
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
        res.json({
            success: true,
            message: 'Specializations retrieved successfully',
            data: uniqueSpecializations
        });
    }
    catch (error) {
        console.error('Get specializations error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getSpecializations = getSpecializations;
const updateDoctorProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        if (userRole !== 'doctor') {
            res.status(403).json({
                success: false,
                message: 'Only doctors can update doctor profiles'
            });
            return;
        }
        const { specialization, experience_years, qualification, consultation_fee, city, hospital_name, bio, is_online, is_video_available, profile_image } = req.body;
        const updateData = {
            updated_at: new Date().toISOString()
        };
        if (specialization)
            updateData.specialization = specialization;
        if (experience_years !== undefined)
            updateData.experience_years = experience_years;
        if (qualification)
            updateData.qualification = qualification;
        if (consultation_fee !== undefined)
            updateData.consultation_fee = consultation_fee;
        if (city)
            updateData.city = city;
        if (hospital_name !== undefined)
            updateData.hospital_name = hospital_name;
        if (bio !== undefined)
            updateData.bio = bio;
        if (is_online !== undefined)
            updateData.is_online = is_online;
        if (is_video_available !== undefined)
            updateData.is_video_available = is_video_available;
        if (profile_image !== undefined)
            updateData.profile_image = profile_image;
        const { error } = await database_1.supabase
            .from('doctors')
            .update(updateData)
            .eq('user_id', userId);
        if (error) {
            throw error;
        }
        res.json({
            success: true,
            message: 'Doctor profile updated successfully'
        });
    }
    catch (error) {
        console.error('Update doctor profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.updateDoctorProfile = updateDoctorProfile;
const getDoctorDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        if (userRole !== 'doctor') {
            res.status(403).json({
                success: false,
                message: 'Only doctors can access this endpoint'
            });
            return;
        }
        const { data: doctorProfile } = await database_1.supabase
            .from('doctors')
            .select('id')
            .eq('user_id', userId)
            .single();
        if (!doctorProfile) {
            res.status(404).json({
                success: false,
                message: 'Doctor profile not found'
            });
            return;
        }
        const doctorId = doctorProfile.id;
        const [totalAppointments, pendingAppointments, completedAppointments, todayAppointments] = await Promise.all([
            database_1.supabase
                .from('appointments')
                .select('id', { count: 'exact' })
                .eq('doctor_id', doctorId),
            database_1.supabase
                .from('appointments')
                .select('id', { count: 'exact' })
                .eq('doctor_id', doctorId)
                .eq('status', 'pending'),
            database_1.supabase
                .from('appointments')
                .select('id', { count: 'exact' })
                .eq('doctor_id', doctorId)
                .eq('status', 'completed'),
            database_1.supabase
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
        });
    }
    catch (error) {
        console.error('Get doctor dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getDoctorDashboardStats = getDoctorDashboardStats;
//# sourceMappingURL=doctorController.js.map