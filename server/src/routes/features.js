import express from 'express'
import {
  getFeatures,
  getFeature,
  createFeature,
  updateFeature,
  deleteFeature,
  getFeatureStats,
  reorderFeatures,
} from '../controllers/featureController.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.route('/').get(getFeatures)
router.route('/stats').get(getFeatureStats)
router.route('/reorder').put(protect, authorize('admin'), reorderFeatures)
router.route('/:id').get(getFeature)

// Protected routes (Admin only)
router.route('/').post(protect, authorize('admin'), createFeature)
router.route('/:id').put(protect, authorize('admin'), updateFeature)
router.route('/:id').delete(protect, authorize('admin'), deleteFeature)

export default router
