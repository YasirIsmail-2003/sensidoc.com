# SensiDoc Backend API

A comprehensive healthcare platform backend built with Node.js, Express.js, TypeScript, and Supabase.

## 🚀 Features

### Core Features
- **Role-based Authentication** (Patient, Doctor, Admin)
- **JWT-based Security** with middleware protection
- **AI-Powered Diagnosis** using Gemini API
- **Drug Analysis** with image recognition
- **Doctor-Patient Appointments** with real-time updates
- **Admin Dashboard** with comprehensive analytics
- **Blog System** with CRUD operations
- **Contact Form** with email notifications
- **Membership System** (Free/Premium tiers)

### Technical Features
- **TypeScript** for type safety
- **Swagger Documentation** for API endpoints
- **Rate Limiting** for API protection
- **Email Service** for notifications
- **Error Handling** with proper logging
- **Database Migrations** and seeding
- **CORS** and security middleware
- **Input Validation** with Joi

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- Gemini API key (for AI features)
- SMTP credentials (for email)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=5000
   API_VERSION=v1

   # Supabase Configuration
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d

   # AI APIs
   GEMINI_API_KEY=AIzaSyACS0-MDT0Tff6I5dVNr8NhCm_Igr_tfws
   OPENAI_API_KEY=your_openai_api_key_here

   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password

   # Frontend URL
   FRONTEND_URL=http://localhost:5173
   ```

4. **Database Setup**
   
   Run the SQL migrations in your Supabase SQL editor:
   ```bash
   # Copy and run the contents of:
   src/database/migrations/001_initial_schema.sql
   src/database/seeds/001_admin_user.sql
   ```

5. **Build and Start**
   ```bash
   # Development
   npm run dev

   # Production
   npm run build
   npm start
   ```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:5000/api-docs`
- **Health Check**: `http://localhost:5000/health`

## 🔗 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/profile` - Get user profile
- `POST /api/v1/auth/logout` - User logout

### Appointments
- `POST /api/v1/appointments` - Book appointment
- `GET /api/v1/appointments/my-appointments` - Get user appointments
- `PUT /api/v1/appointments/:id/status` - Update appointment status
- `GET /api/v1/appointments/:id` - Get appointment details

### AI Services
- `POST /api/v1/ai/diagnose` - Get AI diagnosis
- `POST /api/v1/ai/drug-analyze` - Analyze drug information
- `GET /api/v1/ai/history` - Get AI service history
- `GET /api/v1/ai/usage-stats` - Get usage statistics

### Doctors
- `GET /api/v1/doctors` - Get doctors list
- `GET /api/v1/doctors/:id` - Get doctor details
- `GET /api/v1/doctors/specializations` - Get specializations
- `PUT /api/v1/doctors/profile` - Update doctor profile
- `GET /api/v1/doctors/dashboard/stats` - Doctor dashboard stats

### Admin
- `GET /api/v1/admin/stats` - Dashboard statistics
- `GET /api/v1/admin/users` - Get all users
- `GET /api/v1/admin/doctors` - Get all doctors
- `PUT /api/v1/admin/doctors/:id/verify` - Verify doctor
- `GET /api/v1/admin/appointments` - Get all appointments
- `GET /api/v1/admin/login-logs` - Get login analytics

### Blog
- `GET /api/v1/blogs` - Get published blogs
- `GET /api/v1/blogs/:id` - Get blog by ID
- `POST /api/v1/blogs` - Create blog (admin)
- `PUT /api/v1/blogs/:id` - Update blog (admin)
- `DELETE /api/v1/blogs/:id` - Delete blog (admin)

### Contact
- `POST /api/v1/contact` - Submit contact form
- `GET /api/v1/contact/submissions` - Get submissions (admin)
- `PUT /api/v1/contact/submissions/:id/status` - Update status (admin)

## 🗄️ Database Schema

### Core Tables
- **users** - User accounts with roles
- **doctors** - Doctor profiles and details
- **appointments** - Appointment bookings
- **diagnosis** - AI diagnosis history
- **drug_analysis** - Drug analysis history
- **health_records** - Patient health records
- **blogs** - Blog posts
- **contact_submissions** - Contact form submissions
- **login_logs** - User login analytics

## 🔐 Authentication & Authorization

### User Roles
- **Patient**: Can book appointments, use AI services, manage health records
- **Doctor**: Can manage appointments, view patient records, update profile
- **Admin**: Full access to all features and management capabilities

### JWT Token Structure
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "patient|doctor|admin",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## 🤖 AI Integration

### Gemini API Integration
- **Text Analysis**: Symptom analysis and diagnosis
- **Image Analysis**: Drug identification from images
- **Usage Limits**: 3 free requests per month for free users

### Usage Tracking
- Monthly usage limits for free users
- Unlimited access for premium users
- Usage statistics and analytics

## 📧 Email Service

### Supported Email Types
- Welcome emails for new users
- Appointment confirmations
- Contact form notifications
- Admin notifications

### SMTP Configuration
Supports any SMTP provider (Gmail, SendGrid, etc.)

## 🚀 Deployment

### cPanel Deployment
1. Build the project: `npm run build`
2. Upload `dist` folder and `package.json`
3. Install dependencies: `npm install --production`
4. Set environment variables in cPanel
5. Start the application: `node dist/index.js`

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
SUPABASE_URL=your_production_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
JWT_SECRET=your_production_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
SMTP_HOST=your_smtp_host
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
FRONTEND_URL=https://yourdomain.com
```

## 🧪 Testing

### Default Test Accounts
After running the seed script:

- **Admin**: admin@sensidoc.com / admin123
- **Doctor**: dr.smith@sensidoc.com / doctor123
- **Patient**: patient@sensidoc.com / patient123

## 📊 Monitoring & Analytics

### Available Metrics
- User registration and login analytics
- Appointment booking statistics
- AI service usage tracking
- Doctor performance metrics
- System health monitoring

## 🔧 Development

### Project Structure
```
backend/
├── src/
│   ├── controllers/     # Route handlers
│   ├── routes/         # Express routes
│   ├── middleware/     # Auth, validation, rate limiting
│   ├── services/       # Business logic (AI, email)
│   ├── config/         # Database, Swagger config
│   ├── types/          # TypeScript interfaces
│   ├── utils/          # Helper functions
│   └── database/       # Migrations and seeds
├── dist/               # Compiled JavaScript
└── package.json
```

### Adding New Features
1. Create controller in `src/controllers/`
2. Add routes in `src/routes/`
3. Add validation schemas in `src/middleware/validation.ts`
4. Update types in `src/types/index.ts`
5. Add Swagger documentation

## 🐛 Troubleshooting

### Common Issues
1. **Database Connection**: Check Supabase credentials
2. **JWT Errors**: Verify JWT_SECRET is set
3. **Email Issues**: Check SMTP configuration
4. **AI API Errors**: Verify Gemini API key
5. **CORS Issues**: Check FRONTEND_URL setting

### Logs
- Development: Console logs with detailed information
- Production: Structured logging with error tracking

## 📄 License

This project is licensed under the MIT License.

## 🤝 Support

For support and questions:
- Email: support@sensidoc.com
- Documentation: `/api-docs` endpoint
- Health Check: `/health` endpoint

---

Built with ❤️ for SensiDoc Healthcare Platform