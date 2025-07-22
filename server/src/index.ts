import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB } from './config/database.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import studentsRoutes from './routes/students.js';
import staffRoutes from './routes/staff.js';
import documentsRoutes from './routes/documents.js';
import reportsRoutes from './routes/reports.js';
import dashboardRoutes from './routes/dashboard.js';
import usersRoutes from './routes/users.js';
import courseAllocationRoutes from './routes/courseAllocation.js';
import hostelAllocationRoutes from './routes/hostelAllocation.js';
import studentResultsRoutes from './routes/studentResults.js';
import admissionsRoutes from './routes/admissions.js';
import externalIntegrationRoutes from './routes/externalIntegration.js';
import hostelCheckinRoutes from './routes/hostelCheckin.js';
import studentReportsRoutes from './routes/studentReports.js';
import uploadResultsRoutes from './routes/uploadResults.js';
import admissionStatusRoutes from './routes/admissionStatus.js';
import studentMobilizationRoutes from './routes/studentMobilization.js';
import studentProfileRoutes from './routes/studentProfile.js';
import feePaymentRoutes from './routes/feePayment.js';
import semesterResultRoutes from './routes/semesterResult.js';
import courseRegistrationRoutes from './routes/courseRegistration.js';
import wrongCourseRoutes from './routes/wrongCourse.js';
import finalClearanceRoutes from './routes/employment.js';
import statementOfResultRoutes from './routes/statementOfResult.js';
import requestTranscriptsRoutes from './routes/requestTranscripts.js';
import courseReconciliationRoutes from './routes/courseReconciliation.js';
import addStaffRoutes from './routes/addStaff.js';
import nominalRollRoutes from './routes/nominalRoll.js';
import promotionsRoutes from './routes/promotions.js';
import leaveGrantsRoutes from './routes/leaveGrants.js';
import employmentRoutes from './routes/employment.js';
import hostelsRoutes from './routes/hostels.js';
import coursesRoutes from './routes/courses.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  logger.info('Created uploads directory');
}

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://res.cloudinary.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "https://res.cloudinary.com"],
      mediaSrc: ["'self'", "https://res.cloudinary.com"],
      connectSrc: ["'self'", "https://api.cloudinary.com"],
    },
  },
}));

// Compression middleware
app.use(compression());

// Sanitize requests
app.use(mongoSanitize());

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    /\.webcontainer-api\.io$/,
    /\.local-credentialless\.webcontainer-api\.io$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Trust proxy for Heroku / Vercel IPs
app.set('trust proxy', 1);

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/course-allocations', courseAllocationRoutes);
app.use('/api/hostel-allocations', hostelAllocationRoutes);
app.use('/api/student-results', studentResultsRoutes);
app.use('/api/admissions', admissionsRoutes);
app.use('/api/external', externalIntegrationRoutes);
app.use('/api/hostel-checkin', hostelCheckinRoutes);
app.use('/api/student-reports', studentReportsRoutes);
app.use('/api/upload-results', uploadResultsRoutes);
app.use('/api/admission-status', admissionStatusRoutes);
app.use('/api/student-mobilization', studentMobilizationRoutes);
app.use('/api/student-profile', studentProfileRoutes);
app.use('/api/fee-payment', feePaymentRoutes);
app.use('/api/semester-result', semesterResultRoutes);
app.use('/api/course-registration', courseRegistrationRoutes);
app.use('/api/wrong-course', wrongCourseRoutes);
app.use('/api/final-clearance', finalClearanceRoutes);
app.use('/api/statement-of-result', statementOfResultRoutes);
app.use('/api/request-transcripts', requestTranscriptsRoutes);
app.use('/api/course-reconciliation', courseReconciliationRoutes);
app.use('/api/add-staff', addStaffRoutes);
app.use('/api/nominal-roll', nominalRollRoutes);
app.use('/api/promotions', promotionsRoutes);
app.use('/api/leave-grants', leaveGrantsRoutes);
app.use('/api/employment', employmentRoutes);
app.use('/api/hostels', hostelsRoutes);
app.use('/api/courses', coursesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    port: PORT,
    env: process.env.NODE_ENV,
    service: 'University Records Management System (URMS)',
    database: process.env.MONGODB_URI ? 'Connected' : 'Not configured',
    cloudinary: process.env.CLOUDINARY_CLOUD_NAME ? 'Configured' : 'Not configured',
    version: '2.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'University Records Management System (URMS) API v2.0',
    version: '2.0.0',
    features: [
      'Document Management with Cloudinary',
      'OCR Text Extraction',
      'Advanced Search & Indexing',
      'Automated Backups',
      'Role-based Access Control',
      'Audit Trails',
      'Analytics & Reporting'
    ],
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      students: '/api/students',
      staff: '/api/staff',
      documents: '/api/documents',
      reports: '/api/reports',
      dashboard: '/api/dashboard',
      users: '/api/users',
      search: '/api/search',
      backup: '/api/backup'
    }
  });
});

// Error handler
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    availableEndpoints: [
      '/api/health',
      '/api/auth',
      '/api/students',
      '/api/staff',
      '/api/documents',
      '/api/reports',
      '/api/dashboard',
      '/api/users',
      '/api/search',
      '/api/backup'
    ]
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');

  try {
    const documentProcessor = DocumentProcessingService.getInstance();
    await documentProcessor.cleanup();
    logger.info('Document processing service cleaned up');
  } catch (error) {
    logger.error('Error cleaning up services:', error);
  }

  process.exit(0);
});

// Start server
app.listen(PORT, '0.0.0.0', async () => {
  logger.success(`University Records Management System (URMS) v2.0 running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`Health check: http://localhost:${PORT}/api/health`);
  logger.info(`MongoDB: ${process.env.MONGODB_URI ? 'Configured' : 'Not configured'}`);
});

export default app;
