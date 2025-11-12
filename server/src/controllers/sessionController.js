import Session from '../models/Session.js'
import Course from '../models/Course.js'
import User from '../models/User.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import logger from '../utils/logger.js'

// @desc    Get upcoming sessions
// @route   GET /api/sessions/upcoming
// @access  Public
export const getUpcomingSessions = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('getUpcomingSessions', {
    course: req.query.course,
    instructor: req.query.instructor,
    limit: req.query.limit
  })
  
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

  logger.dbOperation('find', 'Session', query)
  const sessions = await Session.find(query)
    .populate('course', 'title thumbnailUrl duration level')
    .populate('instructor', 'name avatar')
    .sort({ scheduledAt: 1 })
    .limit(parseInt(limit))

  const duration = Date.now() - startTime
  logger.success('Upcoming sessions fetched successfully', {
    count: sessions.length,
    duration: `${duration}ms`
  })
  logger.functionExit('getUpcomingSessions', {
    success: true,
    count: sessions.length,
    duration: `${duration}ms`
  })

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
  const startTime = Date.now()
  logger.functionEntry('getSession', {
    sessionId: req.params.id,
    userId: req.user?._id
  })
  
  logger.dbOperation('findById', 'Session', req.params.id)
  const session = await Session.findById(req.params.id)
    .populate('course', 'title thumbnailUrl duration level instructor')
    .populate('instructor', 'name avatar bio')

  if (!session) {
    const duration = Date.now() - startTime
    logger.warn('Session not found', {
      sessionId: req.params.id,
      duration: `${duration}ms`
    })
    logger.functionExit('getSession', {
      success: false,
      notFound: true,
      duration: `${duration}ms`
    })
    return res.status(404).json({
      success: false,
      message: 'Session not found'
    })
  }

  const duration = Date.now() - startTime
  logger.success('Session fetched successfully', {
    sessionId: session._id,
    duration: `${duration}ms`
  })
  logger.functionExit('getSession', {
    success: true,
    sessionId: session._id,
    duration: `${duration}ms`
  })

  res.json({
    success: true,
    data: session
  })
})

// @desc    Create new session
// @route   POST /api/sessions
// @access  Private/Instructor
export const createSession = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('createSession', {
    userId: req.user?._id,
    userRole: req.user?.role,
    courseId: req.body.course
  })
  
  if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
    const duration = Date.now() - startTime
    logger.warn('Access denied - instructor/admin only', {
      userId: req.user._id,
      userRole: req.user.role,
      duration: `${duration}ms`
    })
    logger.functionExit('createSession', {
      success: false,
      accessDenied: true,
      duration: `${duration}ms`
    })
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    })
  }

  const sessionData = {
    ...req.body,
    instructor: req.user._id
  }

  logger.dbOperation('create', 'Session', { courseId: sessionData.course, instructorId: sessionData.instructor })
  const session = await Session.create(sessionData)

  // Populate the created session
  const populatedSession = await Session.findById(session._id)
    .populate('course', 'title thumbnailUrl')
    .populate('instructor', 'name avatar')

  const duration = Date.now() - startTime
  logger.success('Session created successfully', {
    sessionId: session._id,
    courseId: session.course,
    instructorId: session.instructor,
    duration: `${duration}ms`
  })
  logger.functionExit('createSession', {
    success: true,
    sessionId: session._id,
    duration: `${duration}ms`
  })

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
  const startTime = Date.now()
  logger.functionEntry('updateSession', {
    sessionId: req.params.id,
    userId: req.user?._id,
    userRole: req.user?.role
  })
  
  logger.dbOperation('findById', 'Session', req.params.id)
  const session = await Session.findById(req.params.id)

  if (!session) {
    const duration = Date.now() - startTime
    logger.warn('Session not found for update', {
      sessionId: req.params.id,
      duration: `${duration}ms`
    })
    logger.functionExit('updateSession', {
      success: false,
      notFound: true,
      duration: `${duration}ms`
    })
    return res.status(404).json({
      success: false,
      message: 'Session not found'
    })
  }

  // Check if user has permission to update this session
  if (session.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    const duration = Date.now() - startTime
    logger.warn('Access denied for session update', {
      sessionId: req.params.id,
      userId: req.user._id,
      instructorId: session.instructor,
      duration: `${duration}ms`
    })
    logger.functionExit('updateSession', {
      success: false,
      accessDenied: true,
      duration: `${duration}ms`
    })
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    })
  }

  logger.dbOperation('findByIdAndUpdate', 'Session', { id: req.params.id, updateFields: Object.keys(req.body) })
  const updatedSession = await Session.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('course', 'title thumbnailUrl')
   .populate('instructor', 'name avatar')

  const duration = Date.now() - startTime
  logger.success('Session updated successfully', {
    sessionId: updatedSession._id,
    duration: `${duration}ms`
  })
  logger.functionExit('updateSession', {
    success: true,
    sessionId: updatedSession._id,
    duration: `${duration}ms`
  })

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
  const startTime = Date.now()
  logger.functionEntry('deleteSession', {
    sessionId: req.params.id,
    userId: req.user?._id,
    userRole: req.user?.role
  })
  
  logger.dbOperation('findById', 'Session', req.params.id)
  const session = await Session.findById(req.params.id)

  if (!session) {
    const duration = Date.now() - startTime
    logger.warn('Session not found for deletion', {
      sessionId: req.params.id,
      duration: `${duration}ms`
    })
    logger.functionExit('deleteSession', {
      success: false,
      notFound: true,
      duration: `${duration}ms`
    })
    return res.status(404).json({
      success: false,
      message: 'Session not found'
    })
  }

  // Check if user has permission to delete this session
  if (session.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    const duration = Date.now() - startTime
    logger.warn('Access denied for session deletion', {
      sessionId: req.params.id,
      userId: req.user._id,
      instructorId: session.instructor,
      duration: `${duration}ms`
    })
    logger.functionExit('deleteSession', {
      success: false,
      accessDenied: true,
      duration: `${duration}ms`
    })
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    })
  }

  logger.dbOperation('findByIdAndDelete', 'Session', req.params.id)
  await Session.findByIdAndDelete(req.params.id)

  const duration = Date.now() - startTime
  logger.success('Session deleted successfully', {
    sessionId: req.params.id,
    duration: `${duration}ms`
  })
  logger.functionExit('deleteSession', {
    success: true,
    sessionId: req.params.id,
    duration: `${duration}ms`
  })

  res.json({
    success: true,
    message: 'Session deleted successfully'
  })
})

// @desc    Join session
// @route   POST /api/sessions/:id/join
// @access  Private
export const joinSession = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('joinSession', {
    sessionId: req.params.id,
    userId: req.user?._id
  })
  
  logger.dbOperation('findById', 'Session', req.params.id)
  const session = await Session.findById(req.params.id)

  if (!session) {
    const duration = Date.now() - startTime
    logger.warn('Session not found for join', {
      sessionId: req.params.id,
      duration: `${duration}ms`
    })
    logger.functionExit('joinSession', {
      success: false,
      notFound: true,
      duration: `${duration}ms`
    })
    return res.status(404).json({
      success: false,
      message: 'Session not found'
    })
  }

  // Check if session is live or scheduled
  if (session.status !== 'live' && session.status !== 'scheduled') {
    const duration = Date.now() - startTime
    logger.warn('Session not available for joining', {
      sessionId: session._id,
      status: session.status,
      duration: `${duration}ms`
    })
    logger.functionExit('joinSession', {
      success: false,
      notAvailable: true,
      duration: `${duration}ms`
    })
    return res.status(400).json({
      success: false,
      message: 'Session is not available for joining'
    })
  }

  // Add attendee to session
  await session.addAttendee(req.user._id)

  const duration = Date.now() - startTime
  logger.success('User joined session successfully', {
    sessionId: session._id,
    userId: req.user._id,
    duration: `${duration}ms`
  })
  logger.functionExit('joinSession', {
    success: true,
    sessionId: session._id,
    userId: req.user._id,
    duration: `${duration}ms`
  })

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
  const startTime = Date.now()
  logger.functionEntry('leaveSession', {
    sessionId: req.params.id,
    userId: req.user?._id
  })
  
  logger.dbOperation('findById', 'Session', req.params.id)
  const session = await Session.findById(req.params.id)

  if (!session) {
    const duration = Date.now() - startTime
    logger.warn('Session not found for leave', {
      sessionId: req.params.id,
      duration: `${duration}ms`
    })
    logger.functionExit('leaveSession', {
      success: false,
      notFound: true,
      duration: `${duration}ms`
    })
    return res.status(404).json({
      success: false,
      message: 'Session not found'
    })
  }

  // Remove attendee from session
  await session.removeAttendee(req.user._id)

  const duration = Date.now() - startTime
  logger.success('User left session successfully', {
    sessionId: session._id,
    userId: req.user._id,
    duration: `${duration}ms`
  })
  logger.functionExit('leaveSession', {
    success: true,
    sessionId: session._id,
    userId: req.user._id,
    duration: `${duration}ms`
  })

  res.json({
    success: true,
    message: 'Successfully left session'
  })
})

// @desc    Get session statistics
// @route   GET /api/sessions/stats
// @access  Private/Admin
export const getSessionStats = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('getSessionStats', {
    userId: req.user?._id,
    userRole: req.user?.role
  })
  
  if (req.user.role !== 'admin') {
    const duration = Date.now() - startTime
    logger.warn('Access denied - admin only', {
      userId: req.user._id,
      userRole: req.user.role,
      duration: `${duration}ms`
    })
    logger.functionExit('getSessionStats', {
      success: false,
      accessDenied: true,
      duration: `${duration}ms`
    })
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    })
  }

  logger.dbOperation('aggregate', 'Session', 'session statistics')
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

  const duration = Date.now() - startTime
  logger.success('Session statistics retrieved successfully', {
    stats: stats[0],
    duration: `${duration}ms`
  })
  logger.functionExit('getSessionStats', {
    success: true,
    duration: `${duration}ms`
  })

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
