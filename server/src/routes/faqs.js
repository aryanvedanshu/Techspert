import express from 'express'
import {
  getFAQs,
  getFAQ,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  markFAQHelpful,
  markFAQNotHelpful,
  getFAQStats,
  reorderFAQs,
} from '../controllers/faqController.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.route('/').get(getFAQs)
router.route('/stats').get(getFAQStats)
router.route('/reorder').put(protect, authorize('admin'), reorderFAQs)
router.route('/:id').get(getFAQ)
router.route('/:id/helpful').post(markFAQHelpful)
router.route('/:id/not-helpful').post(markFAQNotHelpful)

// Protected routes (Admin only)
router.route('/').post(protect, authorize('admin'), createFAQ)
router.route('/:id').put(protect, authorize('admin'), updateFAQ)
router.route('/:id').delete(protect, authorize('admin'), deleteFAQ)

export default router
