# Quick Start Guide

## Backend Issue Fixed! 🎉

The backend was failing because of missing Razorpay configuration. I've fixed this by making Razorpay optional for development.

## Quick Setup (2 minutes)

### 1. Create Backend Environment File

Create `backend/.env` with these minimal values:

```env
# Minimal configuration to get started
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
PORT=5000
NODE_ENV=development
API_VERSION=v1
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_key_here
```

### 2. Start Backend

```bash
cd backend
npm run dev
```

The backend will now start with helpful error messages if Supabase is not configured.

### 3. Start Frontend

```bash
npm run dev
```

## What's Fixed

✅ **Razorpay Error**: Made Razorpay configuration optional  
✅ **Database Error**: Added helpful error messages for missing Supabase config  
✅ **Development Mode**: Backend now starts even without full configuration  

## Next Steps

1. **Get Supabase credentials** from https://supabase.com
2. **Update backend/.env** with your actual Supabase values
3. **Run the database migration** from `supabase/final_complete_migration.sql`
4. **Test admin login** at http://localhost:5173/admin/login

## Default Admin Credentials

- **Email**: office@sensidoc.com
- **Password**: Nishant@1707

The backend should now start successfully! 🚀
