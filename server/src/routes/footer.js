import express from 'express'
import { getFooter, updateFooter } from '../controllers/footerController.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.get('/', getFooter)

// Protected routes (Admin only)
router.put('/', protect, authorize('super-admin', 'admin'), updateFooter)

export default router
