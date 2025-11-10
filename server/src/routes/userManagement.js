import express from 'express'
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserEnrollments,
  getUserStats
} from '../controllers/userManagementController.js'
import { authenticateAdmin, requireRole } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication and admin role
router.use(authenticateAdmin)
router.use(requireRole('admin', 'super-admin'))

// User management routes
router.get('/', getAllUsers)
router.get('/stats', getUserStats)
router.get('/:id', getUserById)
router.get('/:id/enrollments', getUserEnrollments)
router.post('/', createUser)
router.put('/:id', updateUser)
router.put('/:id/toggle-status', toggleUserStatus)
router.delete('/:id', deleteUser)

export default router
