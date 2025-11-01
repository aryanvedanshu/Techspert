import express from 'express'
import {
  getUpcomingSessions,
  getSession,
  createSession,
  updateSession,
  deleteSession,
  joinSession,
  leaveSession,
  getSessionStats
} from '../controllers/sessionController.js'
import { authenticateToken, authenticateAdmin, requireRole } from '../middleware/auth.js'

const router = express.Router()

// @route   GET /api/sessions/upcoming
// @desc    Get upcoming sessions
// @access  Public
router.get('/upcoming', getUpcomingSessions)

// @route   GET /api/sessions/stats
// @desc    Get session statistics
// @access  Admin
router.get('/stats', authenticateAdmin, getSessionStats)

// @route   GET /api/sessions/:id
// @desc    Get single session
// @access  Private
router.get('/:id', authenticateToken, getSession)

// @route   POST /api/sessions
// @desc    Create new session
// @access  Private/Instructor
router.post('/', authenticateToken, requireRole(['instructor', 'admin']), createSession)

// @route   PUT /api/sessions/:id
// @desc    Update session
// @access  Private/Instructor
router.put('/:id', authenticateToken, requireRole(['instructor', 'admin']), updateSession)

// @route   DELETE /api/sessions/:id
// @desc    Delete session
// @access  Private/Instructor
router.delete('/:id', authenticateToken, requireRole(['instructor', 'admin']), deleteSession)

// @route   POST /api/sessions/:id/join
// @desc    Join session
// @access  Private
router.post('/:id/join', authenticateToken, joinSession)

// @route   POST /api/sessions/:id/leave
// @desc    Leave session
// @access  Private
router.post('/:id/leave', authenticateToken, leaveSession)

export default router
