import express from 'express'
import {
  getSettings,
  updateSettings,
  updateTheme,
  updateContact,
  updateSocialMedia,
  updateHomePage,
  updateSEO,
  updateFeatures,
  toggleMaintenance,
  resetSettings,
} from '../controllers/settingsController.js'
import { authenticateToken, requirePermission } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.get('/', getSettings)

// Protected routes (Admin only)
router.use(authenticateToken)

// General settings
router.put('/', requirePermission('admin', 'update'), updateSettings)

// Specific settings sections
router.put('/theme', requirePermission('admin', 'update'), updateTheme)
router.put('/contact', requirePermission('admin', 'update'), updateContact)
router.put('/social', requirePermission('admin', 'update'), updateSocialMedia)
router.put('/homepage', requirePermission('admin', 'update'), updateHomePage)
router.put('/seo', requirePermission('admin', 'update'), updateSEO)
router.put('/features', requirePermission('admin', 'update'), updateFeatures)
router.put('/maintenance', requirePermission('admin', 'update'), toggleMaintenance)

// Super admin only
router.post('/reset', requirePermission('admin', 'delete'), resetSettings)

export default router