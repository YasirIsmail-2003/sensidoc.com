import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';

// Import routes
import authRoutes from '@/routes/auth';
import appointmentRoutes from '@/routes/appointments';
import aiRoutes from '@/routes/ai';
import doctorRoutes from '@/routes/doctors';
import adminRoutes from '@/routes/admin';
import blogRoutes from '@/routes/blogs';
import contactRoutes from '@/routes/contact';
import billingRoutes from '@/routes/billing';

// Import middleware and utilities
import { generalLimiter } from '@/middleware/rateLimiter';
import { errorHandler, notFoundHandler } from '@/utils/errorHandler';
import { specs } from '@/config/swagger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const API_VERSION = process.env.API_VERSION || 'v1';

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// General middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
app.use(generalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'SensiDoc API is running',
    timestamp: new Date().toISOString(),
    version: API_VERSION,
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'SensiDoc API Documentation'
}));

// API Routes
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/appointments`, appointmentRoutes);
app.use(`/api/${API_VERSION}/ai`, aiRoutes);
app.use(`/api/${API_VERSION}/doctors`, doctorRoutes);
// Mount workstation (canonical) and keep admin alias for backward compatibility
app.use(`/api/${API_VERSION}/workstation`, adminRoutes);
app.use(`/api/${API_VERSION}/admin`, adminRoutes);
app.use(`/api/${API_VERSION}/blogs`, blogRoutes);
app.use(`/api/${API_VERSION}/contact`, contactRoutes);
app.use(`/api/${API_VERSION}/billing`, billingRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to SensiDoc Healthcare API',
    version: API_VERSION,
    documentation: '/api-docs',
    endpoints: {
      auth: `/api/${API_VERSION}/auth`,
      appointments: `/api/${API_VERSION}/appointments`,
      ai: `/api/${API_VERSION}/ai`,
      doctors: `/api/${API_VERSION}/doctors`,
      admin: `/api/${API_VERSION}/admin`,
      blogs: `/api/${API_VERSION}/blogs`,
      contact: `/api/${API_VERSION}/contact`
    }
  });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`
🏥 SensiDoc Healthcare API Server Started
🚀 Environment: ${process.env.NODE_ENV || 'development'}
🌐 Server running on port ${PORT}
📚 API Documentation: http://localhost:${PORT}/api-docs
🔗 API Base URL: http://localhost:${PORT}/api/${API_VERSION}
⚡ Health Check: http://localhost:${PORT}/health
  `);
});

export default app;