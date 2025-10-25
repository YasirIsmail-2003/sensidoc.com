import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/config/database';
import { ApiResponse, User } from '@/types';
import { AuthRequest } from '@/middleware/auth';
import emailService from '@/services/emailService';

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - full_name
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               full_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [patient, doctor]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      email, 
      password, 
      full_name, 
      phone, 
      role,
      specialization,
      experience_years,
      qualification,
      license_number,
      city,
      hospital_name,
      bio
    } = req.body;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      } as ApiResponse);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    // Create user
    const { error: userError } = await supabase
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

    // If role is doctor, create doctor profile
    if (role === 'doctor') {
      const { error: doctorError } = await supabase
        .from('doctors')
        .insert([{
          id: uuidv4(),
          user_id: userId,
          specialization,
          experience_years: parseInt(experience_years),
          qualification,
          license_number,
          city,
          hospital_name,
          bio,
          consultation_fee: 50, // Default fee
          is_verified: false,
          is_online: false,
          rating: 0,
          total_consultations: 0,
          is_video_available: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (doctorError) {
        // Rollback user creation
        await supabase.from('users').delete().eq('id', userId);
        throw doctorError;
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId, email, role },
      process.env.JWT_SECRET || 'default-secret'
    );

    // Send welcome email
    await emailService.sendWelcomeEmail(email, full_name, role);

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
    } as ApiResponse);

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      } as ApiResponse);
      return;
    }

    // Check password
    // Primary: bcrypt comparison (hashed passwords)
    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(password, user.password_hash);
    } catch {
      // ignore and try fallback
    }

    // Fallback: direct equality for environments where legacy plaintext passwords
    // were stored in the `password_hash` column by the client app.
    if (!isValidPassword) {
      isValidPassword = user.password_hash === password;
    }

    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      } as ApiResponse);
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default-secret'
    );

    // Log the login
    await supabase
      .from('login_logs')
      .insert([{
        id: uuidv4(),
        user_id: user.id,
        login_timestamp: new Date().toISOString(),
        ip_address: req.ip || 'unknown',
        user_agent: req.get('User-Agent') || 'unknown',
        role: user.role
      }]);

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: userWithoutPassword
      }
    } as ApiResponse);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
};

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, phone, role, is_verified, membership_type, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      } as ApiResponse);
      return;
    }

    // If user is a doctor, get doctor profile too
    let doctorProfile = null;
    if (user.role === 'doctor') {
      const { data: doctor } = await supabase
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
    } as ApiResponse);

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
};

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  // In a JWT-based system, logout is typically handled client-side
  // by removing the token from storage
  res.json({
    success: true,
    message: 'Logout successful'
  } as ApiResponse);
};