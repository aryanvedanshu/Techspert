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
import { authenticateAdmin, requirePermission } from '../middleware/auth.js'
import logger from '../utils/logger.js'

const router = express.Router()

logger.info('Project routes initialized', {
  publicRoutes: ['GET /', 'GET /stats', 'GET /:id', 'POST /:id/like'],
  protectedRoutes: ['POST /', 'PUT /:id', 'DELETE /:id', 'PATCH /:id/approve', 'PUT /reorder']
})

// Public routes
router.get('/', (req, res, next) => {
  logger.debug('Route hit: GET /projects', { query: req.query })
  next()
}, getProjects)

router.get('/stats', (req, res, next) => {
  logger.debug('Route hit: GET /projects/stats')
  next()
}, getProjectStats)

router.get('/:id', (req, res, next) => {
  logger.debug('Route hit: GET /projects/:id', { projectId: req.params.id })
  next()
}, getProject)

router.post('/:id/like', (req, res, next) => {
  logger.debug('Route hit: POST /projects/:id/like', { projectId: req.params.id })
  next()
}, likeProject)

// Protected routes (Admin only)
router.use((req, res, next) => {
  logger.debug('Protected route middleware: authenticating admin for projects routes', {
    path: req.path,
    method: req.method
  })
  next()
}, authenticateAdmin)

router.post('/', (req, res, next) => {
  logger.debug('Route hit: POST /projects (protected)', {
    hasBody: !!req.body,
    bodyKeys: Object.keys(req.body || {})
  })
  next()
}, requirePermission('projects', 'create'), createProject)

router.put('/:id', (req, res, next) => {
  logger.debug('Route hit: PUT /projects/:id (protected)', {
    projectId: req.params.id,
    hasBody: !!req.body,
    bodyKeys: Object.keys(req.body || {})
  })
  next()
}, requirePermission('projects', 'update'), updateProject)

router.delete('/:id', (req, res, next) => {
  logger.debug('Route hit: DELETE /projects/:id (protected)', {
    projectId: req.params.id
  })
  next()
}, requirePermission('projects', 'delete'), deleteProject)

router.patch('/:id/approve', (req, res, next) => {
  logger.debug('Route hit: PATCH /projects/:id/approve (protected)', {
    projectId: req.params.id
  })
  next()
}, requirePermission('projects', 'update'), approveProject)

router.put('/reorder', (req, res, next) => {
  logger.debug('Route hit: PUT /projects/reorder (protected)', {
    hasBody: !!req.body,
    projectIdsCount: req.body?.projectIds?.length || 0
  })
  next()
}, requirePermission('projects', 'update'), reorderProjects)

export default router