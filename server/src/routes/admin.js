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
} from '../controllers/adminController.js'
import { authenticateAdmin, requireRole, loginRateLimit } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.post('/login', loginRateLimit, loginAdmin)
router.post('/refresh', refreshToken)

// Protected routes
router.use(authenticateAdmin)

// Profile routes
router.get('/profile', getProfile)
router.put('/profile', updateProfile)
router.put('/change-password', changePassword)
router.post('/logout', logoutAdmin)

// Dashboard
router.get('/dashboard', getDashboardStats)

// Admin management (Super Admin only)
router.get('/admins', requireRole('super-admin'), getAdmins)
router.post('/admins', requireRole('super-admin'), createAdmin)
router.put('/admins/:id', requireRole('super-admin'), updateAdmin)
router.delete('/admins/:id', requireRole('super-admin'), deleteAdmin)

export default router