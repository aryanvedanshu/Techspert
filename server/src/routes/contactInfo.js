import express from 'express'
import {
  getContactInfo,
  getContactInfoItem,
  createContactInfo,
  updateContactInfo,
  deleteContactInfo,
  getContactInfoStats,
  reorderContactInfo,
} from '../controllers/contactInfoController.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.route('/').get(getContactInfo)
router.route('/stats').get(getContactInfoStats)
router.route('/reorder').put(protect, authorize('admin'), reorderContactInfo)
router.route('/:id').get(getContactInfoItem)

// Protected routes (Admin only)
router.route('/').post(protect, authorize('admin'), createContactInfo)
router.route('/:id').put(protect, authorize('admin'), updateContactInfo)
router.route('/:id').delete(protect, authorize('admin'), deleteContactInfo)

export default router
