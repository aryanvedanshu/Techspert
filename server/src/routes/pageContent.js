import express from 'express'
import {
  getPageContent,
  updatePageContent,
  getAllPageContents,
  createPageContent,
  deletePageContent,
  getPageContentHistory,
} from '../controllers/pageContentController.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.route('/:page').get(getPageContent)

// Protected routes (Admin only)
router.route('/').get(protect, authorize('admin'), getAllPageContents)
router.route('/').post(protect, authorize('admin'), createPageContent)
router.route('/:page').put(protect, authorize('admin'), updatePageContent)
router.route('/:page').delete(protect, authorize('admin'), deletePageContent)
router.route('/:page/history').get(protect, authorize('admin'), getPageContentHistory)

export default router
