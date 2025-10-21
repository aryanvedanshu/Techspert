import express from 'express'
import {
  getTeam,
  getTeamMember,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  getTeamStats,
  reorderTeam,
} from '../controllers/teamController.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.route('/').get(getTeam)
router.route('/stats').get(getTeamStats)
router.route('/reorder').put(protect, authorize('admin'), reorderTeam)
router.route('/:id').get(getTeamMember)

// Protected routes (Admin only)
router.route('/').post(protect, authorize('admin'), createTeamMember)
router.route('/:id').put(protect, authorize('admin'), updateTeamMember)
router.route('/:id').delete(protect, authorize('admin'), deleteTeamMember)

export default router
