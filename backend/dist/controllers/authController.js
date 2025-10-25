"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.getProfile = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const database_1 = require("../config/database");
const emailService_1 = __importDefault(require("../services/emailService"));
const register = async (req, res) => {
    try {
        const { email, password, full_name, phone, role, specialization, experience_years, qualification, license_number, city, hospital_name, bio } = req.body;
        const { data: existingUser } = await database_1.supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const userId = (0, uuid_1.v4)();
        const { error: userError } = await database_1.supabase
            .from('users')
            .insert([{
                id: userId,
                email,
                password_hash: hashedPassword,
                full_name,
                phone,
                role,
                is_verified: false,
                membership_type: 'free',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }]);
        if (userError) {
            throw userError;
        }
        if (role === 'doctor') {
            const { error: doctorError } = await database_1.supabase
                .from('doctors')
                .insert([{
                    id: (0, uuid_1.v4)(),
                    user_id: userId,
                    specialization,
                    experience_years: parseInt(experience_years),
                    qualification,
                    license_number,
                    city,
                    hospital_name,
                    bio,
                    consultation_fee: 50,
                    is_verified: false,
                    is_online: false,
                    rating: 0,
                    total_consultations: 0,
                    is_video_available: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }]);
            if (doctorError) {
                await database_1.supabase.from('users').delete().eq('id', userId);
                throw doctorError;
            }
        }
        const token = jsonwebtoken_1.default.sign({ userId, email, role }, process.env.JWT_SECRET || 'default-secret');
        await emailService_1.default.sendWelcomeEmail(email, full_name, role);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                token,
                user: {
                    id: userId,
                    email,
                    full_name,
                    phone,
                    role,
                    is_verified: false,
                    membership_type: 'free'
                }
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { data: user, error } = await database_1.supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        if (error || !user) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
            return;
        }
        let isValidPassword = false;
        try {
            isValidPassword = await bcryptjs_1.default.compare(password, user.password_hash);
        }
        catch {
        }
        if (!isValidPassword) {
            isValidPassword = user.password_hash === password;
        }
        if (!isValidPassword) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'default-secret');
        await database_1.supabase
            .from('login_logs')
            .insert([{
                id: (0, uuid_1.v4)(),
                user_id: user.id,
                login_timestamp: new Date().toISOString(),
                ip_address: req.ip || 'unknown',
                user_agent: req.get('User-Agent') || 'unknown',
                role: user.role
            }]);
        const { password_hash, ...userWithoutPassword } = user;
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: userWithoutPassword
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { data: user, error } = await database_1.supabase
            .from('users')
            .select('id, email, full_name, phone, role, is_verified, membership_type, created_at, updated_at')
            .eq('id', userId)
            .single();
        if (error || !user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        let doctorProfile = null;
        if (user.role === 'doctor') {
            const { data: doctor } = await database_1.supabase
                .from('doctors')
                .select('*')
                .eq('user_id', userId)
                .single();
            doctorProfile = doctor;
        }
        res.json({
            success: true,
            message: 'Profile retrieved successfully',
            data: {
                user,
                doctorProfile
            }
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getProfile = getProfile;
const logout = async (req, res) => {
    res.json({
        success: true,
        message: 'Logout successful'
    });
};
exports.logout = logout;
//# sourceMappingURL=authController.js.map