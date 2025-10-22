import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import { errorHandler } from './middleware/errorHandler.js'

// Import routes
import authRoutes from './routes/auth.js'
import courseRoutes from './routes/courses.js'
import projectRoutes from './routes/projects.js'
import alumniRoutes from './routes/alumni.js'
import adminRoutes from './routes/admin.js'
import settingsRoutes from './routes/settings.js'
import teamRoutes from './routes/team.js'
import featureRoutes from './routes/features.js'
import statisticRoutes from './routes/statistics.js'
import faqRoutes from './routes/faqs.js'
import pageContentRoutes from './routes/pageContent.js'
import contactInfoRoutes from './routes/contactInfo.js'
import footerRoutes from './routes/footer.js'
import certificateRoutes from './routes/certificates.js'
import enrollmentRoutes from './routes/enrollments.js'
import paymentRoutes from './routes/payments.js'
import sessionRoutes from './routes/sessions.js'
import analyticsRoutes from './routes/analytics.js'
import userManagementRoutes from './routes/userManagement.js'

// Load environment variables
dotenv.config()

console.log("[TS-LOG][STARTUP] Loading environment variables and initializing server")

const app = express()
const PORT = process.env.PORT || 5000

console.log("[TS-LOG][CONFIG] Server configuration - PORT:", PORT, "NODE_ENV:", process.env.NODE_ENV)

// Connect to MongoDB
console.log("[TS-LOG][STARTUP] Connecting to MongoDB database")
connectDB()

// Security middleware
console.log("[TS-LOG][MIDDLEWARE] Setting up security middleware (helmet, rate limiting, CORS)")
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
    },
  },
}))

// Rate limiting - More lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and in development
    return req.path === '/health' || process.env.NODE_ENV === 'development'
  }
})
app.use(limiter)

// CORS configuration - More permissive for development
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    // Allow localhost on any port for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true)
    }
    
    // Allow specific origins
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000'
    ]
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}))

// Compression middleware
app.use(compression())

// Logging middleware
app.use(morgan('combined'))

// Body parsing middleware
console.log("[TS-LOG][MIDDLEWARE] Setting up body parsing middleware")
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check endpoint
app.get('/health', (req, res) => {
  console.log("[DEBUG: index.js:health:83] Health check endpoint accessed")
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  })
})

// API routes
console.log("[TS-LOG][ROUTES] Setting up API routes")
app.use('/api/auth', authRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/alumni', alumniRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/team', teamRoutes)
app.use('/api/features', featureRoutes)
app.use('/api/statistics', statisticRoutes)
app.use('/api/faqs', faqRoutes)
app.use('/api/page-content', pageContentRoutes)
app.use('/api/contact-info', contactInfoRoutes)
app.use('/api/footer', footerRoutes)
app.use('/api/certificates', certificateRoutes)
app.use('/api/enrollments', enrollmentRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/sessions', sessionRoutes)
app.use('/api/admin/analytics', analyticsRoutes)
app.use('/api/admin/users', userManagementRoutes)

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Techspert API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      courses: '/api/courses',
      projects: '/api/projects',
      alumni: '/api/alumni',
      admin: '/api/admin',
      settings: '/api/settings',
      team: '/api/team',
      features: '/api/features',
      statistics: '/api/statistics',
      faqs: '/api/faqs',
      pageContent: '/api/page-content',
      contactInfo: '/api/contact-info',
      footer: '/api/footer',
      certificates: '/api/certificates',
      enrollments: '/api/enrollments',
      payments: '/api/payments',
      sessions: '/api/sessions',
      analytics: '/api/admin/analytics',
      userManagement: '/api/admin/users',
      health: '/health',
    },
  })
})

// 404 handler
app.use('*', (req, res) => {
  console.log("[TS-LOG][ERROR] 404 error - Route not found:", req.originalUrl)
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  })
})

// Error handling middleware (must be last)
console.log("[TS-LOG][MIDDLEWARE] Setting up error handling middleware")
app.use(errorHandler)

// Start server
console.log("[TS-LOG][STARTUP] Starting server on port:", PORT)
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔗 API URL: http://localhost:${PORT}/api`)
  console.log(`❤️  Health check: http://localhost:${PORT}/health`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  process.exit(0)
})

export default app