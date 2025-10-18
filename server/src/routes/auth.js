import express from 'express'
import {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
} from '../controllers/authController.js'
import { authenticateToken } from '../middleware/auth.js'
import { loginRateLimit } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.post('/register', register)
router.post('/login', loginRateLimit, login)
router.post('/refresh', refreshToken)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.post('/verify-email', verifyEmail)

// Protected routes
router.use(authenticateToken) // All routes below require authentication

router.post('/logout', logout)
router.get('/me', getMe)
router.put('/profile', updateProfile)
router.put('/change-password', changePassword)
router.post('/resend-verification', resendVerification)

export default router
