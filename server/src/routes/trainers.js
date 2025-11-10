import express from 'express'
import {
  getTrainers,
  getTrainer,
  createTrainer,
  updateTrainer,
  deleteTrainer,
} from '../controllers/trainerController.js'
import { authenticateAdmin, requirePermission } from '../middleware/auth.js'
import logger from '../utils/logger.js'

const router = express.Router()

logger.info('Trainer routes initialized', {
  publicRoutes: ['GET /', 'GET /:id'],
  protectedRoutes: ['POST /', 'PUT /:id', 'DELETE /:id']
})

// Public routes
router.get('/', (req, res, next) => {
  logger.debug('Route hit: GET /trainers', { query: req.query })
  next()
}, getTrainers)

router.get('/:id', (req, res, next) => {
  logger.debug('Route hit: GET /trainers/:id', { trainerId: req.params.id })
  next()
}, getTrainer)

// Protected routes (Admin only)
router.post('/', (req, res, next) => {
  logger.debug('Route hit: POST /trainers (protected)', {
    hasBody: !!req.body,
    bodyKeys: Object.keys(req.body || {})
  })
  next()
}, authenticateAdmin, requirePermission('trainers', 'create'), createTrainer)

router.put('/:id', (req, res, next) => {
  logger.debug('Route hit: PUT /trainers/:id (protected)', {
    trainerId: req.params.id,
    hasBody: !!req.body,
    bodyKeys: Object.keys(req.body || {})
  })
  next()
}, authenticateAdmin, requirePermission('trainers', 'update'), updateTrainer)

router.delete('/:id', (req, res, next) => {
  logger.debug('Route hit: DELETE /trainers/:id (protected)', {
    trainerId: req.params.id
  })
  next()
}, authenticateAdmin, requirePermission('trainers', 'delete'), deleteTrainer)

export default router

