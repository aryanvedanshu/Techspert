import express from 'express'
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  approveProject,
  likeProject,
  getProjectStats,
  reorderProjects,
} from '../controllers/projectController.js'
import { authenticateToken, requirePermission } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.get('/', getProjects)
router.get('/stats', getProjectStats)
router.get('/:id', getProject)
router.post('/:id/like', likeProject)

// Protected routes (Admin only)
router.use(authenticateToken)

router.post('/', requirePermission('projects', 'create'), createProject)
router.put('/:id', requirePermission('projects', 'update'), updateProject)
router.delete('/:id', requirePermission('projects', 'delete'), deleteProject)
router.patch('/:id/approve', requirePermission('projects', 'update'), approveProject)
router.put('/reorder', requirePermission('projects', 'update'), reorderProjects)

export default router