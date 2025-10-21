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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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