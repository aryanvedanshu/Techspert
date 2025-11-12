import express from 'express'
import {
  createDemoSignup,
  getAllDemoSignups,
  updateDemoSignup,
  deleteDemoSignup,
  sendBroadcast,
} from '../controllers/demoSignupController.js'
import { authenticateAdmin } from '../middleware/auth.js'
import logger from '../utils/logger.js'

const router = express.Router()

logger.info('Demo signup routes initialized', {
  publicRoutes: ['POST /'],
  protectedRoutes: ['GET /', 'PUT /:id', 'DELETE /:id']
})

// Public route - anyone can sign up for demo
router.post('/', (req, res, next) => {
  logger.debug('Route hit: POST /demo-signups', {
    hasBody: !!req.body,
    bodyKeys: Object.keys(req.body || {})
  })
  next()
}, createDemoSignup)

// Protected routes (Admin only)
router.get('/', (req, res, next) => {
  logger.debug('Route hit: GET /demo-signups (protected)', { query: req.query })
  next()
}, authenticateAdmin, getAllDemoSignups)

router.put('/:id', (req, res, next) => {
  logger.debug('Route hit: PUT /demo-signups/:id (protected)', {
    signupId: req.params.id,
    hasBody: !!req.body,
    bodyKeys: Object.keys(req.body || {})
  })
  next()
}, authenticateAdmin, updateDemoSignup)

router.delete('/:id', (req, res, next) => {
  logger.debug('Route hit: DELETE /demo-signups/:id (protected)', {
    signupId: req.params.id
  })
  next()
}, authenticateAdmin, deleteDemoSignup)

// Broadcast route
router.post('/broadcast', (req, res, next) => {
  logger.debug('Route hit: POST /demo-signups/broadcast (protected)', {
    hasBody: !!req.body,
    bodyKeys: Object.keys(req.body || {})
  })
  next()
}, authenticateAdmin, sendBroadcast)

export default router

