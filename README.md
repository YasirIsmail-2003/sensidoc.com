# SensiDoc – Full Project Guide

This document explains the complete structure of the project (frontend + backend), all major files, APIs, endpoints, and database setup so you can understand and operate the system end-to-end.

## Monorepo Layout

- `src/` – React front-end app (Vite + TypeScript)
- `backend/` – Node/Express API (TypeScript)
- `supabase/` – SQL migrations. Use only `final_complete_migration.sql` (single source of truth)
- `public/` – public assets
- `dist/` – built frontend output

- 
data base 
- Open Supabase SQL editor
- Run `supabase/final_complete_migration.sql`

3) Run
- Backend: `cd backend && npm run dev`
- Frontend: `npm run dev` (root)

## Frontend (React/Vite/TS)

Routing (canonical workstation paths):
- `/workstation/login` – Admin login
- `/workstation/dashboard` – Admin dashboard (protected)
- `/doctor/login`, `/doctor/dashboard` – Doctor flows
- `/dashboard` – Patient dashboard (protected)
- Public: `/`, `/ai-diagnosis`, `/drugs`, `/doctors`, `/blog`, `/contact`, `/legal/*`

Key files:
- `src/App.tsx` – App router. Redirects `/admin/*` → `/workstation/*`.
- `src/components/AuthProvider.tsx` – App auth context; persists JWT user payload.
- `src/components/ProtectedRoute.tsx` – Route guard; optional `requiredRole`.
- `src/components/layout/Header.tsx` – Navigation; uses workstation paths for admin.
- `src/hooks/useAuth.ts` – Sign in/up/out; profile state; calls backend `/auth/*`.
- `src/lib/supabase.ts` – Supabase client for browser (used for some reads like specializations).
- `src/pages/admin/AdminDashboard.tsx` – Admin UI (stats, users, doctors, appointments, quotas, live activity via `/admin/login-logs`). Membership update + doctor verify.
- `src/pages/AIDiagnosis.tsx` – Text + image analysis. Tries `/ai/detect-fracture`, falls back to `/ai/diagnose`. Premium = unlimited, Free = 3/month.
- `src/pages/Drugs.tsx` – Drug info by name/image. Tries `/ai/detect-tablet`, falls back to `/ai/drug-analyze`. Normalizes response to avoid blank page.
- `src/pages/Contact.tsx` – Contact form → `/contact` (public). WhatsApp prefilled + Call Now.

Feature limits (frontend):
- Premium: unlimited. Free: 3/month per tool; UI counters and disabled buttons reflect limits.

## Backend (Express/TS)

Entry: `backend/src/index.ts`
- Helmet, CORS, Compression, JSON body, Morgan logs.
- Routes mounted under `/api/${API_VERSION}`.

Global config:
- `backend/src/config/database.ts` – Supabase service client (server-side). Helpful error messages when missing.
- `backend/src/middleware/*` – JWT auth (`authenticateToken`), role guards, rate limiters, validation.
- `backend/src/services/aiService.ts` – Gemini/OpenAI-style service wrapper (diagnosis, fracture detect, tablet/drug OCR + summarization).

### API Overview (Base: `${VITE_API_BASE_URL || http://localhost:5000}/api/v1`)

Auth `/auth`
- POST `/register`
- POST `/login`
- GET `/profile`
- POST `/logout`

Admin `/admin` (JWT + role=admin)
- GET `/stats`
- GET `/login-logs`
- GET `/users`
- PUT `/users/:userId/membership`
- PUT `/users/:userId/block`
- GET `/doctors`
- PUT `/doctors/:doctorId/verify`
- GET `/appointments`
- GET `/quotas`, PUT `/quotas/:role`
- GET `/plans`, POST `/plans`, DELETE `/plans/:planId`
- GET `/payments/pending`, PUT `/payments/:paymentId/approve`

Doctors `/doctors`
- GET `/` (public)
- GET `/specializations`
- GET `/:doctorId`
- PUT `/profile` (auth + doctor)
- GET `/dashboard/stats` (auth + doctor)

Appointments `/appointments` (auth)
- POST `/`
- GET `/my-appointments`
- GET `/:appointmentId`
- PUT `/:appointmentId/status` (doctor)

Blogs `/blogs`
- GET `/`, GET `/categories`, GET `/:blogId`, GET `/:blogId/summary`
- POST/PUT/DELETE – Admin only

Contact `/contact`
- POST `/` – Public submit
- Admin: GET `/submissions`, PUT `/submissions/:submissionId/status`

AI `/ai` (auth + patient/doctor)
- POST `/diagnose` – Saves record; enforces free limit 3/month
- POST `/drug-analyze` – Name or image; enforces free limit 3/month
- POST `/detect-fracture`
- POST `/detect-tablet`
- GET `/history`
- GET `/usage-stats`

Notes
- Razorpay optional. Controller guards initialization if keys are missing.
- All admin endpoints need `Authorization: Bearer <jwt>` and role=admin.

## Database (Supabase/Postgres)

Run only `supabase/final_complete_migration.sql`. It creates core tables:
- `users`, `doctors`, `appointments`
- `diagnosis`, `drug_analysis`
- `blogs`, `contact_submissions`, `login_logs`
- `payments`, `subscription_plans`, `subscriptions`, `quotas`
- Storage buckets: `diagnosis-images`, `doctor-images`

## Workstation Paths (Admin)

- Use `/workstation/login` and `/workstation/dashboard` everywhere.
- Legacy `/admin/*` paths are redirected in `src/App.tsx`.

## Premium vs Free

- Free: up to 3 AI uses/month (backend enforced, frontend visible).
- Premium: unlimited; set in Admin Dashboard → Users.

## Contact Widgets

- WhatsApp: `+91 9967024134` prefilled greeting.
- Call Now: `tel:+919967024134`.

## Troubleshooting

- 401/403 admin calls → missing/invalid JWT or not an admin.
- Empty dashboard → backend not running or env misconfigured; check `/health`.
- AI image failures → verify AI keys in `aiService` and network access.

## Deploy

- Frontend: `npm run build` → serve `dist/`.
- Backend: `cd backend && npm run build && node dist/index.js` with `.env`.
- Ensure `FRONTEND_URL` matches your deployed origin in backend `.env`.
