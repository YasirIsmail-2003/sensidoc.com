-- =====================================================
-- SENSIDOC COMPLETE DATABASE SCHEMA
-- Final Migration for Supabase
-- =====================================================
-- This file contains the complete database schema for SensiDoc
-- Upload this single file to Supabase SQL Editor to set up everything

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) CHECK (role IN ('patient', 'doctor', 'admin')) NOT NULL DEFAULT 'patient',
  is_verified BOOLEAN DEFAULT FALSE,
  membership_type VARCHAR(20) CHECK (membership_type IN ('free', 'premium')) DEFAULT 'free',
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  specialization VARCHAR(255) NOT NULL,
  experience_years INTEGER NOT NULL,
  qualification VARCHAR(255) NOT NULL,
  license_number VARCHAR(255) UNIQUE NOT NULL,
  consultation_fee DECIMAL(10,2) DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_online BOOLEAN DEFAULT FALSE,
  city VARCHAR(255) NOT NULL,
  hospital_name VARCHAR(255),
  bio TEXT,
  profile_image VARCHAR(500),
  rating DECIMAL(3,2) DEFAULT 0,
  total_consultations INTEGER DEFAULT 0,
  is_video_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  consultation_type VARCHAR(20) CHECK (consultation_type IN ('chat', 'video', 'visit')) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rejected')) DEFAULT 'pending',
  symptoms TEXT,
  notes TEXT,
  prescription TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AI & HEALTH RECORDS
-- =====================================================

-- Diagnosis table
CREATE TABLE IF NOT EXISTS diagnosis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  input_text TEXT NOT NULL,
  input_image VARCHAR(500),
  ai_response TEXT NOT NULL,
  condition VARCHAR(255) NOT NULL,
  confidence_level INTEGER DEFAULT 0,
  recommendations TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drug analysis table
CREATE TABLE IF NOT EXISTS drug_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  drug_name VARCHAR(255),
  drug_image VARCHAR(500),
  analysis_result TEXT NOT NULL,
  uses TEXT[],
  side_effects TEXT[],
  dosage TEXT,
  warnings TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health records table
CREATE TABLE IF NOT EXISTS health_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  file_url VARCHAR(500),
  record_type VARCHAR(50) CHECK (record_type IN ('prescription', 'test_result', 'diagnosis', 'other')) DEFAULT 'other',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SUBSCRIPTION & PAYMENT SYSTEM
-- =====================================================

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  duration_days INTEGER DEFAULT 30,
  quota_monthly INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  provider VARCHAR(50),
  provider_payment_id VARCHAR(255),
  status VARCHAR(50),
  approved BOOLEAN DEFAULT FALSE,
  subscription_plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50),
  provider_subscription_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'inactive',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  quota_monthly INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotas table for role/default quotas
CREATE TABLE IF NOT EXISTS quotas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role VARCHAR(50) NOT NULL,
  monthly_quota INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- COMMUNICATION & CONTENT
-- =====================================================

-- Messages table for chat between patient and doctor
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  receiver_id UUID REFERENCES users(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  tags TEXT[],
  featured_image VARCHAR(500),
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) CHECK (status IN ('new', 'in_progress', 'resolved')) DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ADMIN & ANALYTICS
-- =====================================================

-- Login logs table
CREATE TABLE IF NOT EXISTS login_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  login_timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  role VARCHAR(20)
);

-- =====================================================
-- CONSTRAINTS
-- =====================================================

-- Unique constraint for appointments (one doctor per time slot)
ALTER TABLE appointments ADD CONSTRAINT unique_doctor_time UNIQUE (doctor_id, appointment_date, appointment_time);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_blocked ON users(is_blocked);

-- Doctor indexes
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON doctors(specialization);
CREATE INDEX IF NOT EXISTS idx_doctors_city ON doctors(city);
CREATE INDEX IF NOT EXISTS idx_doctors_is_verified ON doctors(is_verified);
CREATE INDEX IF NOT EXISTS idx_doctors_is_online ON doctors(is_online);

-- Appointment indexes
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Health record indexes
CREATE INDEX IF NOT EXISTS idx_diagnosis_patient_id ON diagnosis(patient_id);
CREATE INDEX IF NOT EXISTS idx_drug_analysis_user_id ON drug_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_health_records_patient_id ON health_records(patient_id);

-- Payment and subscription indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_plan_id ON payments(subscription_plan_id);
CREATE INDEX IF NOT EXISTS idx_payments_approved ON payments(approved);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Content indexes
CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category);
CREATE INDEX IF NOT EXISTS idx_blogs_is_published ON blogs(is_published);
CREATE INDEX IF NOT EXISTS idx_blogs_author_id ON blogs(author_id);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_timestamp ON login_logs(login_timestamp);
CREATE INDEX IF NOT EXISTS idx_login_logs_role ON login_logs(role);

-- =====================================================
-- DEFAULT DATA
-- =====================================================

-- Default quotas for roles
INSERT INTO quotas (role, monthly_quota) VALUES 
  ('doctor', 15),
  ('admin', 0),
  ('patient', 3);

-- Default subscription plans
INSERT INTO subscription_plans (id, name, amount, currency, duration_days, quota_monthly) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Doctor Monthly Plan', 15.00, 'INR', 30, 15),
  ('550e8400-e29b-41d4-a716-446655440002', 'Patient Monthly Plan', 199.00, 'INR', 30, 3),
  ('550e8400-e29b-41d4-a716-446655440003', 'Patient Yearly Plan', 1999.00, 'INR', 365, 3);

-- Default admin user (password: admin123)
INSERT INTO users (id, email, password_hash, full_name, role, is_verified, membership_type) VALUES 
  ('550e8400-e29b-41d4-a716-446655440010', 'admin@sensidoc.com', '$2a$12$LQv3c1yqBwlVHpPjrGrPUeOkKs9wDh2QMnDFBFXvCeVHf6.K5zKGy', 'SensiDoc Admin', 'admin', true, 'premium');

-- Sample doctor users
INSERT INTO users (id, email, password_hash, full_name, phone, role, is_verified, membership_type) VALUES 
  ('550e8400-e29b-41d4-a716-446655440011', 'dr.smith@sensidoc.com', '$2a$12$LQv3c1yqBwlVHpPjrGrPUeOkKs9wDh2QMnDFBFXvCeVHf6.K5zKGy', 'Dr. John Smith', '+1234567891', 'doctor', true, 'premium'),
  ('550e8400-e29b-41d4-a716-446655440012', 'dr.johnson@sensidoc.com', '$2a$12$LQv3c1yqBwlVHpPjrGrPUeOkKs9wDh2QMnDFBFXvCeVHf6.K5zKGy', 'Dr. Sarah Johnson', '+1234567892', 'doctor', true, 'premium');

-- Sample patient users
INSERT INTO users (id, email, password_hash, full_name, phone, role, is_verified, membership_type) VALUES 
  ('550e8400-e29b-41d4-a716-446655440013', 'patient@sensidoc.com', '$2a$12$LQv3c1yqBwlVHpPjrGrPUeOkKs9wDh2QMnDFBFXvCeVHf6.K5zKGy', 'John Doe', '+1234567894', 'patient', true, 'free'),
  ('550e8400-e29b-41d4-a716-446655440014', 'jane@sensidoc.com', '$2a$12$LQv3c1yqBwlVHpPjrGrPUeOkKs9wDh2QMnDFBFXvCeVHf6.K5zKGy', 'Jane Smith', '+1234567895', 'patient', true, 'premium');

-- Sample doctor profiles
INSERT INTO doctors (id, user_id, specialization, experience_years, qualification, license_number, consultation_fee, is_verified, is_online, city, hospital_name, bio, rating, total_consultations, is_video_available) VALUES 
  ('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440011', 'Cardiology', 10, 'MBBS, MD Cardiology', 'LIC001', 800.00, true, true, 'Mumbai', 'Apollo Hospital', 'Experienced cardiologist with 10+ years of practice', 4.8, 150, true),
  ('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440012', 'Dermatology', 8, 'MBBS, MD Dermatology', 'LIC002', 600.00, true, false, 'Delhi', 'Max Hospital', 'Specialist in skin disorders and cosmetic treatments', 4.6, 120, true);

-- Sample appointments
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, consultation_type, status, symptoms, notes, prescription) VALUES 
  ('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440020', '2024-01-25', '10:00', 'video', 'pending', 'Chest pain and shortness of breath', null, null),
  ('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440021', '2024-01-20', '14:30', 'chat', 'completed', 'Skin rash on arms', 'Patient has allergic dermatitis', 'Apply topical cream twice daily'),
  ('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440020', '2024-01-22', '11:00', 'visit', 'confirmed', 'Regular checkup', null, null);

-- Sample blog posts
INSERT INTO blogs (id, title, content, excerpt, author_id, category, tags, is_published) VALUES 
  ('550e8400-e29b-41d4-a716-446655440040', 'Understanding Heart Health', 'Heart health is crucial for overall wellbeing. In this comprehensive guide, we explore the fundamentals of cardiovascular health, common heart conditions, prevention strategies, and treatment options...', 'Learn about maintaining a healthy heart with proper diet and exercise', '550e8400-e29b-41d4-a716-446655440010', 'Cardiology', ARRAY['heart', 'health', 'prevention'], true),
  ('550e8400-e29b-41d4-a716-446655440041', 'Skin Care Tips for Healthy Skin', 'Proper skin care routine can prevent many skin problems. This article covers essential skin care practices, common skin conditions, and when to see a dermatologist...', 'Essential tips for maintaining healthy and glowing skin', '550e8400-e29b-41d4-a716-446655440010', 'Dermatology', ARRAY['skincare', 'beauty', 'health'], true);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- This completes the SensiDoc database setup
-- All tables, indexes, constraints, and sample data are now in place
-- The application should work immediately with this schema
