import express from 'express'
import {
  loginAdmin,
  logoutAdmin,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getDashboardStats,
  getEnrollmentStats,
  getPaymentStats,
  getAllCoursesForAdmin,
  getCourseForAdmin,
  createCourseForAdmin,
  updateCourseForAdmin,
  deleteCourseForAdmin,
  getAllProjectsForAdmin,
  getProjectForAdmin,
  createProjectForAdmin,
  updateProjectForAdmin,
  deleteProjectForAdmin,
  getAllAlumniForAdmin,
  getAlumniForAdmin,
  createAlumniForAdmin,
  updateAlumniForAdmin,
  deleteAlumniForAdmin,
  getAllEnrollmentsForAdmin,
  forgotPassword,
  resetPassword,
} from '../controllers/adminController.js'
import { authenticateAdmin, requireRole, loginRateLimit } from '../middleware/auth.js'
import logger from '../utils/logger.js'

const router = express.Router()

logger.info('Admin routes initialized', {
  publicRoutes: ['POST /login', 'POST /refresh'],
  protectedRoutes: ['GET /profile', 'PUT /profile', 'PUT /change-password', 'POST /logout', 'GET /dashboard', 'GET /enrollments/stats', 'GET /payments/stats', 'GET /courses', 'GET /courses/:id', 'GET /projects', 'GET /projects/:id', 'GET /enrollments', 'GET /admins', 'POST /admins', 'PUT /admins/:id', 'DELETE /admins/:id']
})

// Public routes
router.post('/login', (req, res, next) => {
  logger.debug('Route hit: POST /admin/login', {
    hasEmail: !!req.body.email,
    hasPassword: !!req.body.password
  })
  next()
}, loginRateLimit, loginAdmin)

router.post('/refresh', (req, res, next) => {
  logger.debug('Route hit: POST /admin/refresh', {
    hasRefreshToken: !!req.body.refreshToken
  })
  next()
}, refreshToken)

router.post('/forgot-password', (req, res, next) => {
  logger.debug('Route hit: POST /admin/forgot-password', {
    hasEmail: !!req.body.email
  })
  next()
}, forgotPassword)

router.post('/reset-password', (req, res, next) => {
  logger.debug('Route hit: POST /admin/reset-password', {
    hasToken: !!req.body.token,
    hasPassword: !!req.body.password
  })
  next()
}, resetPassword)

// Protected routes
router.use((req, res, next) => {
  logger.debug('Protected route middleware: authenticating admin for admin routes', {
    path: req.path,
    method: req.method
  })
  next()
}, authenticateAdmin)

// Profile routes
router.get('/profile', (req, res, next) => {
  logger.debug('Route hit: GET /admin/profile (protected)')
  next()
}, getProfile)

router.put('/profile', (req, res, next) => {
  logger.debug('Route hit: PUT /admin/profile (protected)', {
    hasBody: !!req.body,
    bodyKeys: Object.keys(req.body || {})
  })
  next()
}, updateProfile)

router.put('/change-password', (req, res, next) => {
  logger.debug('Route hit: PUT /admin/change-password (protected)', {
    hasCurrentPassword: !!req.body.currentPassword,
    hasNewPassword: !!req.body.newPassword
  })
  next()
}, changePassword)

router.post('/logout', (req, res, next) => {
  logger.debug('Route hit: POST /admin/logout (protected)')
  next()
}, logoutAdmin)

// Dashboard
router.get('/dashboard', (req, res, next) => {
  logger.debug('Route hit: GET /admin/dashboard (protected)')
  next()
}, getDashboardStats)

router.get('/enrollments/stats', (req, res, next) => {
  logger.debug('Route hit: GET /admin/enrollments/stats (protected)')
  next()
}, getEnrollmentStats)

router.get('/payments/stats', (req, res, next) => {
  logger.debug('Route hit: GET /admin/payments/stats (protected)')
  next()
}, getPaymentStats)

// Course management (Admin only)
router.get('/courses', (req, res, next) => {
  logger.debug('Route hit: GET /admin/courses (protected)', { query: req.query })
  next()
}, getAllCoursesForAdmin)

router.get('/courses/:id', (req, res, next) => {
  logger.debug('Route hit: GET /admin/courses/:id (protected)', { courseId: req.params.id })
  next()
}, getCourseForAdmin)

router.post('/courses', (req, res, next) => {
  logger.debug('Route hit: POST /admin/courses (protected)', {
    hasBody: !!req.body,
    bodyKeys: Object.keys(req.body || {})
  })
  next()
}, createCourseForAdmin)

router.put('/courses/:id', (req, res, next) => {
  logger.debug('Route hit: PUT /admin/courses/:id (protected)', {
    courseId: req.params.id,
    hasBody: !!req.body,
    bodyKeys: Object.keys(req.body || {})
  })
  next()
}, updateCourseForAdmin)

router.delete('/courses/:id', (req, res, next) => {
  logger.debug('Route hit: DELETE /admin/courses/:id (protected)', {
    courseId: req.params.id
  })
  next()
}, deleteCourseForAdmin)

// Project management (Admin only)
router.get('/projects', (req, res, next) => {
  logger.debug('Route hit: GET /admin/projects (protected)', { query: req.query })
  next()
}, getAllProjectsForAdmin)

router.get('/projects/:id', (req, res, next) => {
  logger.debug('Route hit: GET /admin/projects/:id (protected)', { projectId: req.params.id })
  next()
}, getProjectForAdmin)

router.post('/projects', (req, res, next) => {
  logger.debug('Route hit: POST /admin/projects (protected)', {
    hasBody: !!req.body,
    bodyKeys: Object.keys(req.body || {})
  })
  next()
}, createProjectForAdmin)

router.put('/projects/:id', (req, res, next) => {
  logger.debug('Route hit: PUT /admin/projects/:id (protected)', {
    projectId: req.params.id,
    hasBody: !!req.body,
    bodyKeys: Object.keys(req.body || {})
  })
  next()
}, updateProjectForAdmin)

router.delete('/projects/:id', (req, res, next) => {
  logger.debug('Route hit: DELETE /admin/projects/:id (protected)', {
    projectId: req.params.id
  })
  next()
}, deleteProjectForAdmin)

// Enrollment management (Admin only)
router.get('/enrollments', (req, res, next) => {
  logger.debug('Route hit: GET /admin/enrollments (protected)', { query: req.query })
  next()
}, getAllEnrollmentsForAdmin)

// Alumni management (Admin only)
router.get('/alumni', (req, res, next) => {
  logger.debug('Route hit: GET /admin/alumni (protected)', { query: req.query })
  next()
}, getAllAlumniForAdmin)

router.get('/alumni/:id', (req, res, next) => {
  logger.debug('Route hit: GET /admin/alumni/:id (protected)', { alumniId: req.params.id })
  next()
}, getAlumniForAdmin)

router.post('/alumni', (req, res, next) => {
  logger.debug('Route hit: POST /admin/alumni (protected)', {
    hasBody: !!req.body,
    bodyKeys: Object.keys(req.body || {})
  })
  next()
}, createAlumniForAdmin)

router.put('/alumni/:id', (req, res, next) => {
  logger.debug('Route hit: PUT /admin/alumni/:id (protected)', {
    alumniId: req.params.id,
    hasBody: !!req.body,
    bodyKeys: Object.keys(req.body || {})
  })
  next()
}, updateAlumniForAdmin)

router.delete('/alumni/:id', (req, res, next) => {
  logger.debug('Route hit: DELETE /admin/alumni/:id (protected)', {
    alumniId: req.params.id
  })
  next()
}, deleteAlumniForAdmin)

// Admin management (Super Admin only)
router.get('/admins', (req, res, next) => {
  logger.debug('Route hit: GET /admin/admins (protected, super-admin only)')
  next()
}, requireRole('super-admin'), getAdmins)

router.post('/admins', (req, res, next) => {
  logger.debug('Route hit: POST /admin/admins (protected, super-admin only)', {
    hasBody: !!req.body,
    bodyKeys: Object.keys(req.body || {})
  })
  next()
}, requireRole('super-admin'), createAdmin)

router.put('/admins/:id', (req, res, next) => {
  logger.debug('Route hit: PUT /admin/admins/:id (protected, super-admin only)', {
    adminId: req.params.id,
    hasBody: !!req.body,
    bodyKeys: Object.keys(req.body || {})
  })
  next()
}, requireRole('super-admin'), updateAdmin)

router.delete('/admins/:id', (req, res, next) => {
  logger.debug('Route hit: DELETE /admin/admins/:id (protected, super-admin only)', {
    adminId: req.params.id
  })
  next()
}, requireRole('super-admin'), deleteAdmin)

export default router