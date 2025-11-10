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
import logger from '../utils/logger.js'

const router = express.Router()

logger.info('Course routes initialized', {
  publicRoutes: ['GET /', 'GET /stats', 'GET /:id'],
  protectedRoutes: ['POST /', 'PUT /:id', 'DELETE /:id', 'PUT /reorder']
})

// Public routes
router.get('/', (req, res, next) => {
  logger.debug('Route hit: GET /courses', { query: req.query })
  next()
}, getCourses)

router.get('/stats', (req, res, next) => {
  logger.debug('Route hit: GET /courses/stats')
  next()
}, getCourseStats)

router.get('/:id', (req, res, next) => {
  logger.debug('Route hit: GET /courses/:id', { courseId: req.params.id })
  next()
}, getCourse)

// Protected routes (Admin only)
router.use((req, res, next) => {
  logger.debug('Protected route middleware: authenticating admin for courses routes', {
    path: req.path,
    method: req.method
  })
  next()
}, authenticateAdmin)

router.post('/', (req, res, next) => {
  logger.debug('Route hit: POST /courses (protected)', {
    hasBody: !!req.body,
    bodyKeys: Object.keys(req.body || {})
  })
  next()
}, requirePermission('courses', 'create'), createCourse)

router.put('/:id', (req, res, next) => {
  logger.debug('Route hit: PUT /courses/:id (protected)', {
    courseId: req.params.id,
    hasBody: !!req.body,
    bodyKeys: Object.keys(req.body || {})
  })
  next()
}, requirePermission('courses', 'update'), updateCourse)

router.delete('/:id', (req, res, next) => {
  logger.debug('Route hit: DELETE /courses/:id (protected)', {
    courseId: req.params.id
  })
  next()
}, requirePermission('courses', 'delete'), deleteCourse)

router.put('/reorder', (req, res, next) => {
  logger.debug('Route hit: PUT /courses/reorder (protected)', {
    hasBody: !!req.body,
    courseIdsCount: req.body?.courseIds?.length || 0
  })
  next()
}, requirePermission('courses', 'update'), reorderCourses)

export default router