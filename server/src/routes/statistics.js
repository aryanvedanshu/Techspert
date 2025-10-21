import express from 'express'
import {
  getStatistics,
  getStatistic,
  createStatistic,
  updateStatistic,
  deleteStatistic,
  getStatisticStats,
  reorderStatistics,
} from '../controllers/statisticController.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.route('/').get(getStatistics)
router.route('/stats').get(getStatisticStats)
router.route('/reorder').put(protect, authorize('admin'), reorderStatistics)
router.route('/:id').get(getStatistic)

// Protected routes (Admin only)
router.route('/').post(protect, authorize('admin'), createStatistic)
router.route('/:id').put(protect, authorize('admin'), updateStatistic)
router.route('/:id').delete(protect, authorize('admin'), deleteStatistic)

export default router
