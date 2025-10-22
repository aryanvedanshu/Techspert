import express from 'express'
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStats,
  reorderCourses,
} from '../controllers/courseController.js'
import { authenticateAdmin, requirePermission } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.get('/', getCourses)
router.get('/stats', getCourseStats)
router.get('/:id', getCourse)

// Protected routes (Admin only)
router.use(authenticateAdmin)

router.post('/', requirePermission('courses', 'create'), createCourse)
router.put('/:id', requirePermission('courses', 'update'), updateCourse)
router.delete('/:id', requirePermission('courses', 'delete'), deleteCourse)
router.put('/reorder', requirePermission('courses', 'update'), reorderCourses)

export default router