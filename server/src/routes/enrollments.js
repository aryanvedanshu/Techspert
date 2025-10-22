import express from 'express'
import {
  enrollInCourse,
  getStudentEnrollments,
  getEnrollment,
  updateProgress,
  markAttendance,
  completeAssignment,
  getCourseEnrollments,
  getEnrollmentStats
} from '../controllers/enrollmentController.js'
import { authenticateToken, requireRole } from '../middleware/auth.js'

const router = express.Router()

// @route   POST /api/enrollments
// @desc    Enroll student in course
// @access  Private
router.post('/', authenticateToken, enrollInCourse)

// @route   GET /api/enrollments
// @desc    Get student enrollments
// @access  Private
router.get('/', authenticateToken, getStudentEnrollments)

// @route   GET /api/enrollments/stats
// @desc    Get enrollment statistics
// @access  Private/Admin
router.get('/stats', authenticateToken, requireRole(['admin']), getEnrollmentStats)

// @route   GET /api/enrollments/:id
// @desc    Get single enrollment
// @access  Private
router.get('/:id', authenticateToken, getEnrollment)

// @route   PUT /api/enrollments/:id/progress
// @desc    Update enrollment progress
// @access  Private
router.put('/:id/progress', authenticateToken, updateProgress)

// @route   POST /api/enrollments/:id/attendance
// @desc    Mark session attendance
// @access  Private
router.post('/:id/attendance', authenticateToken, markAttendance)

// @route   POST /api/enrollments/:id/assignment
// @desc    Complete assignment
// @access  Private
router.post('/:id/assignment', authenticateToken, completeAssignment)

// @route   GET /api/courses/:courseId/enrollments
// @desc    Get course enrollments (for instructors/admins)
// @access  Private/Admin
router.get('/courses/:courseId/enrollments', authenticateToken, requireRole(['admin', 'instructor']), getCourseEnrollments)

export default router
