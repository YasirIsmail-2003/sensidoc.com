# SensiDoc Setup Guide

## Issues Fixed

1. ✅ **Fixed `showAddDoctor is not defined` error** - Added missing state variables and imports
2. ✅ **Fixed admin dashboard showing empty data** - Updated to use backend API instead of direct Supabase calls
3. ✅ **Fixed doctor verification functionality** - Updated to use backend API endpoints
4. ✅ **Fixed user membership management** - Updated to use backend API endpoints

## Setup Instructions

### 1. Environment Configuration

#### Frontend Environment (.env)
Copy `env.example` to `.env` in the root directory:

```bash
cp env.example .env
```

Edit `.env` with your actual values:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration
VITE_API_BASE_URL=http://localhost:5000

# Razorpay Configuration (for payments)
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

# Contact Configuration
VITE_CONTACT_EMAIL=contact@sensidoc.com

# Development Configuration
NODE_ENV=development
```

#### Backend Environment (.env)
Copy `backend/env.example` to `backend/.env`:

```bash
cp backend/env.example backend/.env
```

Edit `backend/.env` with your actual values:
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key

# Server Configuration
PORT=5000
NODE_ENV=development
API_VERSION=v1

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Razorpay Configuration (for payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 2. Database Setup

1. **Create a Supabase project** at https://supabase.com
2. **Run the migration** by copying the contents of `supabase/final_complete_migration.sql` to your Supabase SQL Editor
3. **Get your Supabase credentials**:
   - Project URL
   - Anon key
   - Service role key (for backend)

### 3. Start the Application

#### Start Backend (Terminal 1)
```bash
cd backend
npm install
npm start
```

#### Start Frontend (Terminal 2)
```bash
npm install
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs

### 5. Admin Login

Use the default admin credentials:
- **Email**: office@sensidoc.com
- **Password**: Nishant@1707

Or access via:
- **Admin Login**: http://localhost:5173/admin/login
- **Workstation Login**: http://localhost:5173/workstation/login

## Features Implemented

### Admin Dashboard
- ✅ **Overview**: Real-time statistics (users, doctors, appointments, revenue)
- ✅ **User Management**: View all users, update membership types
- ✅ **Doctor Management**: View all doctors, verify/unverify doctors
- ✅ **Appointment Management**: View all appointments with status tracking
- ✅ **Analytics**: User growth, appointment statistics, revenue tracking
- ✅ **Live Activity**: Recent login activity
- ✅ **Doctor Verification**: Verify/unverify doctors with email notifications
- ✅ **User Membership**: Update user membership types (free/premium)

### Doctor Features
- ✅ **Doctor Registration**: Complete doctor signup with profile information
- ✅ **Profile Management**: Update doctor information
- ✅ **Verification System**: Admin can verify doctors
- ✅ **Appointment Management**: View and manage appointments

### User Features
- ✅ **User Registration**: Patient and doctor registration
- ✅ **Authentication**: Secure login system
- ✅ **Profile Management**: Update user profiles
- ✅ **Appointment Booking**: Book appointments with doctors

## API Endpoints

### Admin Endpoints
- `GET /api/v1/admin/stats` - Dashboard statistics
- `GET /api/v1/admin/users` - Get all users
- `GET /api/v1/admin/doctors` - Get all doctors
- `GET /api/v1/admin/appointments` - Get all appointments
- `PUT /api/v1/admin/doctors/:id/verify` - Verify/unverify doctor
- `PUT /api/v1/admin/users/:id/membership` - Update user membership
- `GET /api/v1/admin/quotas` - Get quota settings

### Authentication Endpoints
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/profile` - Get user profile

## Troubleshooting

### Common Issues

1. **Empty Dashboard Data**
   - Ensure backend is running on port 5000
   - Check that Supabase credentials are correct
   - Verify database migration has been run

2. **Authentication Issues**
   - Check JWT token in localStorage
   - Verify backend authentication middleware
   - Ensure user has correct role permissions

3. **CORS Issues**
   - Ensure FRONTEND_URL is set correctly in backend .env
   - Check that frontend is running on port 5173

4. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check network connectivity
   - Ensure database tables exist

### Debug Steps

1. **Check Browser Console** for JavaScript errors
2. **Check Network Tab** for failed API requests
3. **Check Backend Logs** for server errors
4. **Verify Environment Variables** are loaded correctly

## Next Steps

1. **Set up your Supabase project** with the provided migration
2. **Configure environment variables** with your actual credentials
3. **Start both frontend and backend servers**
4. **Test admin login** and verify dashboard functionality
5. **Add real data** by registering users and doctors

The admin dashboard will now display real data from your database instead of empty sections!
