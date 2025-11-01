import express from 'express'
import {
  createPaymentIntent,
  confirmPayment,
  getStudentPayments,
  getPayment,
  processRefund,
  getPaymentStats,
  getRevenueByPeriod,
  handleStripeWebhook
} from '../controllers/paymentController.js'
import { authenticateToken, authenticateAdmin, requireRole } from '../middleware/auth.js'

const router = express.Router()

// @route   POST /api/payments/create-intent
// @desc    Create payment intent
// @access  Private
router.post('/create-intent', authenticateToken, createPaymentIntent)

// @route   POST /api/payments/confirm
// @desc    Confirm payment
// @access  Private
router.post('/confirm', authenticateToken, confirmPayment)

// @route   GET /api/payments
// @desc    Get student payments
// @access  Private
router.get('/', authenticateToken, getStudentPayments)

// @route   GET /api/payments/stats
// @desc    Get payment statistics
// @access  Admin
router.get('/stats', authenticateAdmin, getPaymentStats)

// @route   GET /api/payments/revenue
// @desc    Get revenue by period
// @access  Admin
router.get('/revenue', authenticateAdmin, getRevenueByPeriod)

// @route   GET /api/payments/:id
// @desc    Get single payment
// @access  Private
router.get('/:id', authenticateToken, getPayment)

// @route   POST /api/payments/:id/refund
// @desc    Process refund
// @access  Admin
router.post('/:id/refund', authenticateAdmin, processRefund)

// @route   POST /api/payments/webhook
// @desc    Handle Stripe webhook
// @access  Public (but should verify Stripe signature)
router.post('/webhook', handleStripeWebhook)

export default router
