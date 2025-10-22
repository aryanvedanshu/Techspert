import express from 'express'
import {
  getAlumni,
  getAlumnus,
  createAlumni,
  updateAlumni,
  deleteAlumni,
  approveAlumni,
  getAlumniStats,
  reorderAlumni,
} from '../controllers/alumniController.js'
import { authenticateAdmin, requirePermission } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.get('/', getAlumni)
router.get('/stats', getAlumniStats)
router.get('/:id', getAlumnus)

// Protected routes (Admin only)
router.use(authenticateAdmin)

router.post('/', requirePermission('alumni', 'create'), createAlumni)
router.put('/:id', requirePermission('alumni', 'update'), updateAlumni)
router.delete('/:id', requirePermission('alumni', 'delete'), deleteAlumni)
router.patch('/:id/approve', requirePermission('alumni', 'update'), approveAlumni)
router.put('/reorder', requirePermission('alumni', 'update'), reorderAlumni)

export default router