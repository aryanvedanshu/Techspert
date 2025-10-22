import Session from '../models/Session.js'
import Course from '../models/Course.js'
import User from '../models/User.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// @desc    Get upcoming sessions
// @route   GET /api/sessions/upcoming
// @access  Public
export const getUpcomingSessions = asyncHandler(async (req, res) => {
  console.log('[TS-LOG][SESSION] Fetching upcoming sessions')
  
  const { course, instructor, limit = 10 } = req.query

  let query = {
    status: 'scheduled',
    scheduledAt: { $gte: new Date() }
  }

  if (course) {
    query.course = course
  }

  if (instructor) {
    query.instructor = instructor
  }

  const sessions = await Session.find(query)
    .populate('course', 'title thumbnailUrl duration level')
    .populate('instructor', 'name avatar')
    .sort({ scheduledAt: 1 })
    .limit(parseInt(limit))

  console.log('[TS-LOG][SESSION] Found', sessions.length, 'upcoming sessions')

  res.json({
    success: true,
    count: sessions.length,
    data: sessions
  })
})

// @desc    Get session by ID
// @route   GET /api/sessions/:id
// @access  Private
export const getSession = asyncHandler(async (req, res) => {
  console.log('[TS-LOG][SESSION] Fetching session:', req.params.id)
  
  const session = await Session.findById(req.params.id)
    .populate('course', 'title thumbnailUrl duration level instructor')
    .populate('instructor', 'name avatar bio')

  if (!session) {
    console.log('[TS-LOG][SESSION] Session not found')
    return res.status(404).json({
      success: false,
      message: 'Session not found'
    })
  }

  console.log('[TS-LOG][SESSION] Session found')

  res.json({
    success: true,
    data: session
  })
})

// @desc    Create new session
// @route   POST /api/sessions
// @access  Private/Instructor
export const createSession = asyncHandler(async (req, res) => {
  console.log('[TS-LOG][SESSION] Creating new session')
  
  if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
    console.log('[TS-LOG][SESSION] Access denied - instructor/admin only')
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    })
  }

  const sessionData = {
    ...req.body,
    instructor: req.user._id
  }

  const session = await Session.create(sessionData)

  // Populate the created session
  const populatedSession = await Session.findById(session._id)
    .populate('course', 'title thumbnailUrl')
    .populate('instructor', 'name avatar')

  console.log('[TS-LOG][SESSION] Session created:', session._id)

  res.status(201).json({
    success: true,
    message: 'Session created successfully',
    data: populatedSession
  })
})

// @desc    Update session
// @route   PUT /api/sessions/:id
// @access  Private/Instructor
export const updateSession = asyncHandler(async (req, res) => {
  console.log('[TS-LOG][SESSION] Updating session:', req.params.id)
  
  const session = await Session.findById(req.params.id)

  if (!session) {
    console.log('[TS-LOG][SESSION] Session not found')
    return res.status(404).json({
      success: false,
      message: 'Session not found'
    })
  }

  // Check if user has permission to update this session
  if (session.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    console.log('[TS-LOG][SESSION] Access denied for session update')
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    })
  }

  const updatedSession = await Session.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('course', 'title thumbnailUrl')
   .populate('instructor', 'name avatar')

  console.log('[TS-LOG][SESSION] Session updated')

  res.json({
    success: true,
    message: 'Session updated successfully',
    data: updatedSession
  })
})

// @desc    Delete session
// @route   DELETE /api/sessions/:id
// @access  Private/Instructor
export const deleteSession = asyncHandler(async (req, res) => {
  console.log('[TS-LOG][SESSION] Deleting session:', req.params.id)
  
  const session = await Session.findById(req.params.id)

  if (!session) {
    console.log('[TS-LOG][SESSION] Session not found')
    return res.status(404).json({
      success: false,
      message: 'Session not found'
    })
  }

  // Check if user has permission to delete this session
  if (session.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    console.log('[TS-LOG][SESSION] Access denied for session deletion')
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    })
  }

  await Session.findByIdAndDelete(req.params.id)

  console.log('[TS-LOG][SESSION] Session deleted')

  res.json({
    success: true,
    message: 'Session deleted successfully'
  })
})

// @desc    Join session
// @route   POST /api/sessions/:id/join
// @access  Private
export const joinSession = asyncHandler(async (req, res) => {
  console.log('[TS-LOG][SESSION] Joining session:', req.params.id)
  
  const session = await Session.findById(req.params.id)

  if (!session) {
    console.log('[TS-LOG][SESSION] Session not found')
    return res.status(404).json({
      success: false,
      message: 'Session not found'
    })
  }

  // Check if session is live or scheduled
  if (session.status !== 'live' && session.status !== 'scheduled') {
    console.log('[TS-LOG][SESSION] Session not available for joining')
    return res.status(400).json({
      success: false,
      message: 'Session is not available for joining'
    })
  }

  // Add attendee to session
  await session.addAttendee(req.user._id)

  console.log('[TS-LOG][SESSION] User joined session')

  res.json({
    success: true,
    message: 'Successfully joined session',
    data: {
      joinUrl: session.meetingDetails.joinUrl || session.meetingDetails.meetLink,
      meetingId: session.meetingDetails.meetingId,
      password: session.meetingDetails.password
    }
  })
})

// @desc    Leave session
// @route   POST /api/sessions/:id/leave
// @access  Private
export const leaveSession = asyncHandler(async (req, res) => {
  console.log('[TS-LOG][SESSION] Leaving session:', req.params.id)
  
  const session = await Session.findById(req.params.id)

  if (!session) {
    console.log('[TS-LOG][SESSION] Session not found')
    return res.status(404).json({
      success: false,
      message: 'Session not found'
    })
  }

  // Remove attendee from session
  await session.removeAttendee(req.user._id)

  console.log('[TS-LOG][SESSION] User left session')

  res.json({
    success: true,
    message: 'Successfully left session'
  })
})

// @desc    Get session statistics
// @route   GET /api/sessions/stats
// @access  Private/Admin
export const getSessionStats = asyncHandler(async (req, res) => {
  console.log('[TS-LOG][SESSION] Fetching session statistics')
  
  if (req.user.role !== 'admin') {
    console.log('[TS-LOG][SESSION] Access denied - admin only')
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    })
  }

  const stats = await Session.aggregate([
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        upcomingSessions: {
          $sum: { 
            $cond: [
              { $and: [
                { $eq: ['$status', 'scheduled'] },
                { $gte: ['$scheduledAt', new Date()] }
              ]}, 
              1, 
              0
            ]
          }
        },
        liveSessions: {
          $sum: { $cond: [{ $eq: ['$status', 'live'] }, 1, 0] }
        },
        completedSessions: {
          $sum: { $cond: [{ $eq: ['$status', 'ended'] }, 1, 0] }
        },
        totalAttendance: { $sum: '$attendance.totalAttended' },
        averageAttendance: { $avg: '$attendance.totalAttended' }
      }
    }
  ])

  console.log('[TS-LOG][SESSION] Statistics retrieved')

  res.json({
    success: true,
    data: stats[0] || {
      totalSessions: 0,
      upcomingSessions: 0,
      liveSessions: 0,
      completedSessions: 0,
      totalAttendance: 0,
      averageAttendance: 0
    }
  })
})
