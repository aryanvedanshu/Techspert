import DemoSignup from '../models/DemoSignup.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import logger from '../utils/logger.js'

// @desc    Create demo signup
// @route   POST /api/demo-signups
// @access  Public
export const createDemoSignup = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('createDemoSignup', {
    bodyKeys: Object.keys(req.body),
    hasName: !!req.body.name,
    hasEmail: !!req.body.email
  })

  try {
    // Validate required fields
    if (!req.body.name || !req.body.email) {
      const error = new Error('Name and email are required')
      error.name = 'ValidationError'
      logger.error('Validation failed: missing required fields', error, {
        body: req.body,
        operation: 'createDemoSignup',
        model: 'DemoSignup',
        missingFields: {
          name: !req.body.name,
          email: !req.body.email
        }
      })
      throw error
    }

    logger.dbOperation('create', 'DemoSignup', {
      name: req.body.name,
      email: req.body.email
    })
    const demoSignup = await DemoSignup.create(req.body)

    const duration = Date.now() - startTime
    logger.success('Demo signup created successfully', {
      signupId: demoSignup._id,
      name: demoSignup.name,
      email: demoSignup.email,
      duration: `${duration}ms`
    })
    logger.functionExit('createDemoSignup', {
      success: true,
      signupId: demoSignup._id,
      duration: `${duration}ms`
    })

    res.status(201).json({
      success: true,
      data: demoSignup,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to create demo signup', error, {
      body: req.body,
      operation: 'createDemoSignup',
      model: 'DemoSignup',
      errorName: error.name,
      errorMessage: error.message,
      duration: `${duration}ms`
    })
    logger.functionExit('createDemoSignup', {
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Get all demo signups (Admin only)
// @route   GET /api/admin/demo-signups
// @access  Private/Admin
export const getAllDemoSignups = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('getAllDemoSignups', {
    query: req.query,
    adminId: req.admin?._id
  })

  try {
    const { page = 1, limit = 50, status, search } = req.query
    let query = {}

    if (status && status !== 'all') {
      query.status = status
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { courseInterest: { $regex: search, $options: 'i' } },
      ]
    }

    logger.dbOperation('find', 'DemoSignup', query)
    const signups = await DemoSignup.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await DemoSignup.countDocuments(query)

    const duration = Date.now() - startTime
    logger.success('Demo signups fetched successfully', {
      count: signups.length,
      total,
      page: parseInt(page),
      duration: `${duration}ms`
    })
    logger.functionExit('getAllDemoSignups', {
      success: true,
      count: signups.length,
      total,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      count: signups.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: signups,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to fetch demo signups', error, {
      query: req.query,
      operation: 'getAllDemoSignups',
      model: 'DemoSignup',
      duration: `${duration}ms`
    })
    logger.functionExit('getAllDemoSignups', {
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Update demo signup status
// @route   PUT /api/admin/demo-signups/:id
// @access  Private/Admin
export const updateDemoSignup = asyncHandler(async (req, res) => {
  logger.functionEntry('updateDemoSignup', { signupId: req.params.id })

  logger.dbOperation('findByIdAndUpdate', 'DemoSignup', req.params.id)
  const signup = await DemoSignup.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  )

  if (!signup) {
    logger.warn('Demo signup not found for update', { signupId: req.params.id })
    return res.status(404).json({
      success: false,
      message: 'Demo signup not found',
    })
  }

  logger.info('Demo signup updated successfully', { signupId: signup._id })
  logger.functionExit('updateDemoSignup', { success: true, signupId: signup._id })

  res.json({
    success: true,
    data: signup,
  })
})

// @desc    Delete demo signup
// @route   DELETE /api/admin/demo-signups/:id
// @access  Private/Admin
export const deleteDemoSignup = asyncHandler(async (req, res) => {
  logger.functionEntry('deleteDemoSignup', { signupId: req.params.id })

  logger.dbOperation('findByIdAndDelete', 'DemoSignup', req.params.id)
  const signup = await DemoSignup.findByIdAndDelete(req.params.id)

  if (!signup) {
    logger.warn('Demo signup not found for deletion', { signupId: req.params.id })
    return res.status(404).json({
      success: false,
      message: 'Demo signup not found',
    })
  }

  logger.info('Demo signup deleted successfully', { signupId: req.params.id })
  logger.functionExit('deleteDemoSignup', { success: true, signupId: req.params.id })

  res.json({
    success: true,
    message: 'Demo signup deleted successfully',
  })
})

// @desc    Send broadcast message to demo signups
// @route   POST /api/admin/demo-signups/broadcast
// @access  Private/Admin
export const sendBroadcast = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('sendBroadcast', {
    type: req.body.type,
    messageLength: req.body.message?.length,
    signupCount: req.body.signupIds?.length
  })

  try {
    const { type, message, signupIds } = req.body

    if (!message || !type) {
      const error = new Error('Message and type are required')
      error.name = 'ValidationError'
      logger.error('Validation failed: missing required fields', error, {
        hasMessage: !!message,
        hasType: !!type
      })
      throw error
    }

    // Get signups to send to
    let signups = []
    if (signupIds && signupIds.length > 0) {
      logger.dbOperation('find', 'DemoSignup', { _id: { $in: signupIds } })
      signups = await DemoSignup.find({ _id: { $in: signupIds } })
    } else {
      logger.dbOperation('find', 'DemoSignup', { status: { $ne: 'cancelled' } })
      signups = await DemoSignup.find({ status: { $ne: 'cancelled' } })
    }

    if (signups.length === 0) {
      logger.warn('No signups found for broadcast')
      return res.status(400).json({
        success: false,
        message: 'No signups found to send message to',
      })
    }

    logger.info('Preparing to send broadcast', {
      type,
      signupCount: signups.length,
      messageLength: message.length
    })

    // TODO: Implement actual email/WhatsApp sending
    // For now, we'll simulate the sending
    const sent = signups.length
    const failed = 0

    // Update contacted status for pending signups
    const pendingSignups = signups.filter(s => s.status === 'pending')
    if (pendingSignups.length > 0) {
      await DemoSignup.updateMany(
        { _id: { $in: pendingSignups.map(s => s._id) } },
        { 
          $set: { 
            status: 'contacted',
            contactedAt: new Date()
          } 
        }
      )
      logger.info('Updated signup statuses to contacted', { count: pendingSignups.length })
    }

    const duration = Date.now() - startTime
    logger.success('Broadcast sent successfully', {
      type,
      sent,
      failed,
      duration: `${duration}ms`
    })
    logger.functionExit('sendBroadcast', {
      success: true,
      sent,
      failed,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      message: `Broadcast sent successfully`,
      data: {
        sent,
        failed,
        total: signups.length
      }
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to send broadcast', error, {
      type: req.body.type,
      duration: `${duration}ms`,
      errorMessage: error.message
    })
    logger.functionExit('sendBroadcast', {
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})
