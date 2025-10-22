import express from 'express'
import {
  getAnalyticsOverview,
  getCourseAnalytics,
  getUserAnalytics,
  getRevenueAnalytics,
  getProjectAnalytics,
  getRecentActivity
} from '../controllers/analyticsController.js'
import { authenticateAdmin, requireRole } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication and admin role
router.use(authenticateAdmin)
router.use(requireRole('admin'))

// Analytics routes
router.get('/overview', getAnalyticsOverview)
router.get('/courses', getCourseAnalytics)
router.get('/users', getUserAnalytics)
router.get('/revenue', getRevenueAnalytics)
router.get('/projects', getProjectAnalytics)
router.get('/activity', getRecentActivity)

export default router
