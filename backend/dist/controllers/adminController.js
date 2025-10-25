"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserMembership = exports.getLoginLogs = exports.getAppointments = exports.verifyDoctor = exports.getDoctors = exports.getUsers = exports.getDashboardStats = void 0;
const database_1 = require("../config/database");
const getDashboardStats = async (req, res) => {
    try {
        const [totalUsers, totalDoctors, totalPatients, verifiedDoctors, unverifiedUsers, totalAppointments, pendingAppointments, completedAppointments, cancelledAppointments, totalDiagnoses, totalDrugAnalyses, premiumUsers, recentLogins] = await Promise.all([
            database_1.supabase.from('users').select('id', { count: 'exact' }),
            database_1.supabase.from('users').select('id', { count: 'exact' }).eq('role', 'doctor'),
            database_1.supabase.from('users').select('id', { count: 'exact' }).eq('role', 'patient'),
            database_1.supabase.from('doctors').select('id', { count: 'exact' }).eq('is_verified', true),
            database_1.supabase.from('users').select('id', { count: 'exact' }).eq('is_verified', false),
            database_1.supabase.from('appointments').select('id', { count: 'exact' }),
            database_1.supabase.from('appointments').select('id', { count: 'exact' }).eq('status', 'pending'),
            database_1.supabase.from('appointments').select('id', { count: 'exact' }).eq('status', 'completed'),
            database_1.supabase.from('appointments').select('id', { count: 'exact' }).in('status', ['cancelled', 'rejected']),
            database_1.supabase.from('diagnosis').select('id', { count: 'exact' }),
            database_1.supabase.from('drug_analysis').select('id', { count: 'exact' }),
            database_1.supabase.from('users').select('id', { count: 'exact' }).eq('membership_type', 'premium'),
            database_1.supabase
                .from('login_logs')
                .select('id', { count: 'exact' })
                .gte('login_timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        ]);
        const currentMonth = new Date().toISOString().slice(0, 7);
        const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7);
        const [currentMonthUsers, lastMonthUsers] = await Promise.all([
            database_1.supabase
                .from('users')
                .select('id', { count: 'exact' })
                .gte('created_at', `${currentMonth}-01`)
                .lt('created_at', `${currentMonth}-32`),
            database_1.supabase
                .from('users')
                .select('id', { count: 'exact' })
                .gte('created_at', `${lastMonth}-01`)
                .lt('created_at', `${lastMonth}-32`)
        ]);
        const userGrowth = ((currentMonthUsers.count || 0) - (lastMonthUsers.count || 0)) / Math.max(lastMonthUsers.count || 1, 1) * 100;
        res.json({
            success: true,
            message: 'Dashboard statistics retrieved successfully',
            data: {
                users: {
                    total: totalUsers.count || 0,
                    doctors: totalDoctors.count || 0,
                    patients: totalPatients.count || 0,
                    unverified: unverifiedUsers.count || 0,
                    premium: premiumUsers.count || 0,
                    growth: Math.round(userGrowth * 100) / 100
                },
                doctors: {
                    total: totalDoctors.count || 0,
                    verified: verifiedDoctors.count || 0,
                    unverified: (totalDoctors.count || 0) - (verifiedDoctors.count || 0)
                },
                appointments: {
                    total: totalAppointments.count || 0,
                    pending: pendingAppointments.count || 0,
                    completed: completedAppointments.count || 0,
                    cancelled: cancelledAppointments.count || 0
                },
                aiServices: {
                    totalDiagnoses: totalDiagnoses.count || 0,
                    totalDrugAnalyses: totalDrugAnalyses.count || 0
                },
                activity: {
                    recentLogins: recentLogins.count || 0
                }
            }
        });
    }
    catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getDashboardStats = getDashboardStats;
const getUsers = async (req, res) => {
    try {
        const { role, is_verified, membership_type, search, page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        let query = database_1.supabase
            .from('users')
            .select('id, email, full_name, phone, role, is_verified, membership_type, created_at, updated_at')
            .order('created_at', { ascending: false })
            .range(offset, offset + Number(limit) - 1);
        if (role) {
            query = query.eq('role', role);
        }
        if (is_verified !== undefined) {
            query = query.eq('is_verified', is_verified === 'true');
        }
        if (membership_type) {
            query = query.eq('membership_type', membership_type);
        }
        if (search) {
            query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
        }
        const { data: users, error, count } = await query;
        if (error) {
            throw error;
        }
        const totalPages = Math.ceil((count || 0) / Number(limit));
        res.json({
            success: true,
            message: 'Users retrieved successfully',
            data: users,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: count || 0,
                totalPages
            }
        });
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getUsers = getUsers;
const getDoctors = async (req, res) => {
    try {
        const { is_verified, specialization, city, page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        let query = database_1.supabase
            .from('doctors')
            .select(`
        *,
        users!doctors_user_id_fkey(id, full_name, email, phone, is_verified, created_at)
      `)
            .order('created_at', { ascending: false })
            .range(offset, offset + Number(limit) - 1);
        if (is_verified !== undefined) {
            query = query.eq('is_verified', is_verified === 'true');
        }
        if (specialization) {
            query = query.ilike('specialization', `%${specialization}%`);
        }
        if (city) {
            query = query.ilike('city', `%${city}%`);
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
const verifyDoctor = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { is_verified } = req.body;
        const { error } = await database_1.supabase
            .from('doctors')
            .update({
            is_verified,
            updated_at: new Date().toISOString()
        })
            .eq('id', doctorId);
        if (error) {
            throw error;
        }
        res.json({
            success: true,
            message: `Doctor ${is_verified ? 'verified' : 'unverified'} successfully`
        });
    }
    catch (error) {
        console.error('Verify doctor error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.verifyDoctor = verifyDoctor;
const getAppointments = async (req, res) => {
    try {
        const { status, consultation_type, page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        let query = database_1.supabase
            .from('appointments')
            .select(`
        *,
        patient:users!appointments_patient_id_fkey(id, full_name, email),
        doctor:doctors!appointments_doctor_id_fkey(
          id,
          specialization,
          users!doctors_user_id_fkey(full_name, email)
        )
      `)
            .order('created_at', { ascending: false })
            .range(offset, offset + Number(limit) - 1);
        if (status) {
            query = query.eq('status', status);
        }
        if (consultation_type) {
            query = query.eq('consultation_type', consultation_type);
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
exports.getAppointments = getAppointments;
const getLoginLogs = async (req, res) => {
    try {
        const { role, days = 30, page = 1, limit = 50 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const startDate = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000).toISOString();
        let query = database_1.supabase
            .from('login_logs')
            .select(`
        *,
        users!login_logs_user_id_fkey(full_name, email)
      `)
            .gte('login_timestamp', startDate)
            .order('login_timestamp', { ascending: false })
            .range(offset, offset + Number(limit) - 1);
        if (role) {
            query = query.eq('role', role);
        }
        const { data: logs, error, count } = await query;
        if (error) {
            throw error;
        }
        const totalPages = Math.ceil((count || 0) / Number(limit));
        res.json({
            success: true,
            message: 'Login logs retrieved successfully',
            data: logs,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: count || 0,
                totalPages
            }
        });
    }
    catch (error) {
        console.error('Get login logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getLoginLogs = getLoginLogs;
const updateUserMembership = async (req, res) => {
    try {
        const { userId } = req.params;
        const { membership_type } = req.body;
        const { error } = await database_1.supabase
            .from('users')
            .update({
            membership_type,
            updated_at: new Date().toISOString()
        })
            .eq('id', userId);
        if (error) {
            throw error;
        }
        res.json({
            success: true,
            message: 'User membership updated successfully'
        });
    }
    catch (error) {
        console.error('Update user membership error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.updateUserMembership = updateUserMembership;
//# sourceMappingURL=adminController.js.map