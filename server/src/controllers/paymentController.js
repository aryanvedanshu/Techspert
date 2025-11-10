import Payment from '../models/Payment.js'
import Enrollment from '../models/Enrollment.js'
import Course from '../models/Course.js'
import User from '../models/User.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import logger from '../utils/logger.js'

// @desc    Create payment intent
// @route   POST /api/payments/create-intent
// @access  Private
export const createPaymentIntent = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('createPaymentIntent', { 
    courseId: req.body.courseId,
    studentId: req.user._id,
    paymentMethod: req.body.paymentMethod
  })
  
  try {
    const { courseId, paymentMethod } = req.body
    const studentId = req.user._id

    logger.debug('Creating payment intent', {
      courseId,
      studentId,
      paymentMethod: paymentMethod || 'card'
    })

    // Get course details
    logger.dbOperation('findById', 'Course', courseId)
    const course = await Course.findById(courseId)
    
    if (!course) {
      const duration = Date.now() - startTime
      logger.warn('Course not found for payment intent', { 
        courseId,
        studentId,
        duration: `${duration}ms`
      })
      logger.functionExit('createPaymentIntent', { 
        success: false,
        courseNotFound: true,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      })
    }

    if (!course.isPublished) {
      const duration = Date.now() - startTime
      logger.warn('Course not published - cannot create payment intent', { 
        courseId,
        courseTitle: course.title,
        isPublished: course.isPublished,
        duration: `${duration}ms`
      })
      logger.functionExit('createPaymentIntent', { 
        success: false,
        courseNotPublished: true,
        duration: `${duration}ms`
      })
      return res.status(400).json({
        success: false,
        message: 'Course is not available for purchase'
      })
    }

    // Check if already enrolled
    logger.dbOperation('findOne', 'Enrollment', { student: studentId, course: courseId })
    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId
    })

    if (existingEnrollment) {
      const duration = Date.now() - startTime
      logger.warn('Student already enrolled - cannot create payment intent', { 
        courseId,
        studentId,
        enrollmentId: existingEnrollment._id,
        duration: `${duration}ms`
      })
      logger.functionExit('createPaymentIntent', { 
        success: false,
        alreadyEnrolled: true,
        duration: `${duration}ms`
      })
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      })
    }

    // Create payment intent data
    const paymentIntentData = {
      amount: Math.round(course.price * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        courseId: courseId,
        studentId: studentId,
        courseTitle: course.title
      },
      description: `Payment for course: ${course.title}`,
      payment_method_types: [paymentMethod || 'card'],
      automatic_payment_methods: {
        enabled: true,
      }
    }

    logger.debug('Payment intent data created', {
      courseId,
      courseTitle: course.title,
      amount: course.price,
      currency: 'USD'
    })

    // In a real implementation, you would create a Stripe PaymentIntent here
    // For now, we'll return mock data
    const paymentIntentId = `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const clientSecret = `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`
    
    const duration = Date.now() - startTime
    logger.success('Payment intent created successfully', { 
      courseId,
      courseTitle: course.title,
      amount: course.price,
      paymentIntentId,
      duration: `${duration}ms`
    })
    logger.functionExit('createPaymentIntent', { 
      success: true,
      paymentIntentId,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      data: {
        clientSecret,
        paymentIntentId,
        amount: course.price,
        currency: 'USD',
        course: {
          id: course._id,
          title: course.title,
          thumbnailUrl: course.thumbnailUrl
        }
      }
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to create payment intent', error, {
      courseId: req.body.courseId,
      studentId: req.user._id,
      operation: 'createPaymentIntent',
      model: 'Payment',
      duration: `${duration}ms`
    })
    logger.functionExit('createPaymentIntent', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Confirm payment
// @route   POST /api/payments/confirm
// @access  Private
export const confirmPayment = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('confirmPayment', { 
    paymentIntentId: req.body.paymentIntentId,
    courseId: req.body.courseId,
    studentId: req.user._id
  })
  
  try {
    const { paymentIntentId, courseId } = req.body
    const studentId = req.user._id

    logger.debug('Confirming payment', {
      paymentIntentId,
      courseId,
      studentId
    })

    // Get course details
    logger.dbOperation('findById', 'Course', courseId)
    const course = await Course.findById(courseId)
    
    if (!course) {
      const duration = Date.now() - startTime
      logger.warn('Course not found for payment confirmation', { 
        courseId,
        studentId,
        duration: `${duration}ms`
      })
      logger.functionExit('confirmPayment', { 
        success: false,
        courseNotFound: true,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      })
    }

    logger.debug('Creating enrollment and payment record', {
      courseId,
      courseTitle: course.title,
      amount: course.price
    })

    // In a real implementation, you would verify the payment with Stripe here
    // For now, we'll simulate a successful payment

    // Create enrollment
    logger.dbOperation('create', 'Enrollment', { student: studentId, course: courseId })
    const enrollment = await Enrollment.create({
    student: studentId,
    course: courseId,
    payment: {
      amount: course.price,
      currency: 'USD',
      paymentMethod: 'card',
      transactionId: paymentIntentId,
      paidAt: new Date(),
    },
    requirements: {
      totalAssignments: course.syllabus?.length || 0,
    }
  })

    // Create payment record
    logger.dbOperation('create', 'Payment', { student: studentId, course: courseId, amount: course.price })
    const payment = await Payment.create({
      paymentId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      student: studentId,
      course: courseId,
      enrollment: enrollment._id,
      amount: course.price,
      currency: 'USD',
      paymentMethod: 'card',
      status: 'succeeded',
      processedAt: new Date(),
      description: `Payment for course: ${course.title}`,
      stripe: {
        paymentIntentId: paymentIntentId,
        chargeId: `ch_mock_${Date.now()}`,
        customerId: `cus_mock_${studentId}`,
      },
      instructorPayout: {
        instructor: course.instructor?._id,
        amount: course.price * 0.7, // 70% to instructor
        percentage: 70,
        status: 'pending'
      }
    })

    // Update user's enrolled courses
    logger.dbOperation('findByIdAndUpdate', 'User', { id: studentId, operation: 'addEnrolledCourse' })
    await User.findByIdAndUpdate(studentId, {
      $push: {
        enrolledCourses: {
          course: courseId,
          enrolledAt: new Date(),
          progress: 0,
          completed: false
        }
      }
    })

    // Update course student count
    logger.dbOperation('findByIdAndUpdate', 'Course', { id: courseId, operation: 'incrementStudentsCount' })
    await Course.findByIdAndUpdate(courseId, {
      $inc: { studentsCount: 1 }
    })

    // Populate enrollment data for response
    logger.dbOperation('findById', 'Enrollment', { id: enrollment._id, operation: 'populate' })
    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate('course', 'title thumbnailUrl duration level instructor')
      .populate('student', 'name email avatar')

    const duration = Date.now() - startTime
    logger.success('Payment confirmed and enrollment created successfully', { 
      paymentId: payment._id,
      enrollmentId: enrollment._id,
      courseId,
      courseTitle: course.title,
      studentId,
      amount: course.price,
      duration: `${duration}ms`
    })
    logger.functionExit('confirmPayment', { 
      success: true,
      paymentId: payment._id,
      enrollmentId: enrollment._id,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      message: 'Payment confirmed and enrollment successful',
      data: {
        enrollment: populatedEnrollment,
        payment: payment
      }
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to confirm payment', error, {
      paymentIntentId: req.body.paymentIntentId,
      courseId: req.body.courseId,
      studentId: req.user._id,
      operation: 'confirmPayment',
      model: 'Payment',
      duration: `${duration}ms`
    })
    logger.functionExit('confirmPayment', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Get student payments
// @route   GET /api/payments
// @access  Private
export const getStudentPayments = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  const studentId = req.user._id
  logger.functionEntry('getStudentPayments', { 
    studentId,
    status: req.query.status,
    page: req.query.page,
    limit: req.query.limit
  })
  
  try {
    const { status, page = 1, limit = 10 } = req.query

    let query = { student: studentId }
    if (status) {
      query.status = status
    }

    logger.dbOperation('find', 'Payment', query)
    const payments = await Payment.find(query)
      .populate('course', 'title thumbnailUrl')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    logger.dbOperation('countDocuments', 'Payment', query)
    const total = await Payment.countDocuments(query)

    const duration = Date.now() - startTime
    logger.success('Student payments fetched successfully', { 
      studentId,
      count: payments.length,
      total,
      page: parseInt(page),
      duration: `${duration}ms`
    })
    logger.functionExit('getStudentPayments', { 
      success: true,
      count: payments.length,
      total,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      count: payments.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: payments
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to fetch student payments', error, {
      studentId: req.user._id,
      operation: 'getStudentPayments',
      model: 'Payment',
      duration: `${duration}ms`
    })
    logger.functionExit('getStudentPayments', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
export const getPayment = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  const { id } = req.params
  logger.functionEntry('getPayment', { 
    paymentId: id,
    userId: req.user._id,
    userRole: req.user.role
  })
  
  try {
    logger.dbOperation('findById', 'Payment', id)
    const payment = await Payment.findById(id)
      .populate('course', 'title thumbnailUrl duration level')
      .populate('student', 'name email')
      .populate('enrollment')

    if (!payment) {
      const duration = Date.now() - startTime
      logger.warn('Payment not found', { 
        paymentId: id,
        duration: `${duration}ms`
      })
      logger.functionExit('getPayment', { 
        success: false,
        found: false,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      })
    }

    // Check if user has access to this payment
    if (payment.student._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      const duration = Date.now() - startTime
      logger.warn('Access denied for payment', { 
        paymentId: id,
        userId: req.user._id,
        studentId: payment.student._id,
        userRole: req.user.role,
        duration: `${duration}ms`
      })
      logger.functionExit('getPayment', { 
        success: false,
        accessDenied: true,
        duration: `${duration}ms`
      })
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    const duration = Date.now() - startTime
    logger.success('Payment fetched successfully', { 
      paymentId: payment._id,
      courseId: payment.course?._id,
      studentId: payment.student._id,
      amount: payment.amount,
      status: payment.status,
      duration: `${duration}ms`
    })
    logger.functionExit('getPayment', { 
      success: true,
      paymentId: payment._id,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      data: payment
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to fetch payment', error, {
      paymentId: req.params.id,
      operation: 'getPayment',
      model: 'Payment',
      duration: `${duration}ms`
    })
    logger.functionExit('getPayment', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Process refund
// @route   POST /api/payments/:id/refund
// @access  Private/Admin
export const processRefund = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  const { id } = req.params
  const { amount, reason } = req.body
  logger.functionEntry('processRefund', { 
    paymentId: id,
    refundAmount: amount,
    userId: req.user._id,
    userRole: req.user.role
  })
  
  try {
    if (req.user.role !== 'admin') {
      const duration = Date.now() - startTime
      logger.warn('Access denied - admin only for refund processing', { 
        paymentId: id,
        userId: req.user._id,
        userRole: req.user.role,
        duration: `${duration}ms`
      })
      logger.functionExit('processRefund', { 
        success: false,
        accessDenied: true,
        duration: `${duration}ms`
      })
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    logger.dbOperation('findById', 'Payment', id)
    const payment = await Payment.findById(id)
    
    if (!payment) {
      const duration = Date.now() - startTime
      logger.warn('Payment not found for refund', { 
        paymentId: id,
        duration: `${duration}ms`
      })
      logger.functionExit('processRefund', { 
        success: false,
        found: false,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      })
    }

    if (payment.status !== 'succeeded') {
      const duration = Date.now() - startTime
      logger.warn('Cannot refund non-successful payment', { 
        paymentId: id,
        paymentStatus: payment.status,
        duration: `${duration}ms`
      })
      logger.functionExit('processRefund', { 
        success: false,
        invalidStatus: true,
        duration: `${duration}ms`
      })
      return res.status(400).json({
        success: false,
        message: 'Cannot refund payment that was not successful'
      })
    }

    const refundAmount = amount || payment.amount
    if (refundAmount > payment.amount - payment.totalRefunded) {
      const duration = Date.now() - startTime
      logger.warn('Refund amount exceeds available amount', { 
        paymentId: id,
        refundAmount,
        availableAmount: payment.amount - payment.totalRefunded,
        duration: `${duration}ms`
      })
      logger.functionExit('processRefund', { 
        success: false,
        amountExceeded: true,
        duration: `${duration}ms`
      })
      return res.status(400).json({
        success: false,
        message: 'Refund amount exceeds available amount'
      })
    }

    logger.debug('Processing refund', {
      paymentId: id,
      refundAmount,
      reason: reason || 'Requested by customer',
      currentTotalRefunded: payment.totalRefunded
    })

    // In a real implementation, you would process the refund with Stripe here
    // For now, we'll simulate a successful refund

    const refundData = {
      refundId: `re_mock_${Date.now()}`,
      amount: refundAmount,
      reason: reason || 'Requested by customer',
      status: 'succeeded',
      processedAt: new Date()
    }

    // Add refund to payment
    await payment.addRefund(refundData)

    // Update enrollment status if full refund
    if (payment.totalRefunded >= payment.amount) {
      logger.dbOperation('findByIdAndUpdate', 'Enrollment', { id: payment.enrollment, operation: 'markRefunded' })
      await Enrollment.findByIdAndUpdate(payment.enrollment, {
        status: 'refunded',
        'payment.refunded': true,
        'payment.refundedAt': new Date(),
        'payment.refundAmount': payment.totalRefunded
      })
    }

    const duration = Date.now() - startTime
    logger.success('Refund processed successfully', { 
      paymentId: payment._id,
      refundId: refundData.refundId,
      refundAmount,
      totalRefunded: payment.totalRefunded,
      netAmount: payment.netAmount,
      duration: `${duration}ms`
    })
    logger.functionExit('processRefund', { 
      success: true,
      paymentId: payment._id,
      refundId: refundData.refundId,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refund: refundData,
        totalRefunded: payment.totalRefunded,
        netAmount: payment.netAmount
      }
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to process refund', error, {
      paymentId: req.params.id,
      refundAmount: req.body.amount,
      operation: 'processRefund',
      model: 'Payment',
      duration: `${duration}ms`
    })
    logger.functionExit('processRefund', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Get payment statistics
// @route   GET /api/payments/stats
// @access  Private/Admin
export const getPaymentStats = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('getPaymentStats', { 
    userId: req.user._id,
    userRole: req.user.role
  })
  
  try {
    if (req.user.role !== 'admin') {
      const duration = Date.now() - startTime
      logger.warn('Access denied - admin only for payment statistics', { 
        userId: req.user._id,
        userRole: req.user.role,
        duration: `${duration}ms`
      })
      logger.functionExit('getPaymentStats', { 
        success: false,
        accessDenied: true,
        duration: `${duration}ms`
      })
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    logger.debug('Fetching payment statistics')
    logger.dbOperation('aggregate', 'Payment', 'statistics')
    const stats = await Payment.getStats()

    const duration = Date.now() - startTime
    logger.success('Payment statistics fetched successfully', { 
      totalPayments: stats[0]?.totalPayments || 0,
      totalAmount: stats[0]?.totalAmount || 0,
      successfulPayments: stats[0]?.successfulPayments || 0,
      duration: `${duration}ms`
    })
    logger.functionExit('getPaymentStats', { 
      success: true,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      data: stats[0] || {
        totalPayments: 0,
        totalAmount: 0,
        successfulPayments: 0,
        successfulAmount: 0,
        failedPayments: 0,
        refundedAmount: 0,
        averagePayment: 0
      }
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to fetch payment statistics', error, {
      operation: 'getPaymentStats',
      model: 'Payment',
      duration: `${duration}ms`
    })
    logger.functionExit('getPaymentStats', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Get revenue by period
// @route   GET /api/payments/revenue
// @access  Private/Admin
export const getRevenueByPeriod = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('getRevenueByPeriod', { 
    userId: req.user._id,
    userRole: req.user.role,
    startDate: req.query.startDate,
    endDate: req.query.endDate
  })
  
  try {
    if (req.user.role !== 'admin') {
      const duration = Date.now() - startTime
      logger.warn('Access denied - admin only for revenue data', { 
        userId: req.user._id,
        userRole: req.user.role,
        duration: `${duration}ms`
      })
      logger.functionExit('getRevenueByPeriod', { 
        success: false,
        accessDenied: true,
        duration: `${duration}ms`
      })
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    const { startDate, endDate } = req.query
    
    if (!startDate || !endDate) {
      const error = new Error('Start date and end date are required')
      error.name = 'ValidationError'
      const duration = Date.now() - startTime
      logger.error('Validation failed: missing date parameters', error, {
        hasStartDate: !!startDate,
        hasEndDate: !!endDate,
        duration: `${duration}ms`
      })
      logger.functionExit('getRevenueByPeriod', { 
        success: false,
        error: error.message,
        duration: `${duration}ms`
      })
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      })
    }

    logger.debug('Fetching revenue by period', {
      startDate,
      endDate
    })

    logger.dbOperation('aggregate', 'Payment', { operation: 'getRevenueByPeriod', startDate, endDate })
    const revenue = await Payment.getRevenueByPeriod(
      new Date(startDate),
      new Date(endDate)
    )

    const duration = Date.now() - startTime
    logger.success('Revenue data retrieved successfully', { 
      startDate,
      endDate,
      revenueDataPoints: revenue.length,
      duration: `${duration}ms`
    })
    logger.functionExit('getRevenueByPeriod', { 
      success: true,
      revenueDataPoints: revenue.length,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      data: revenue
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to fetch revenue by period', error, {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      operation: 'getRevenueByPeriod',
      model: 'Payment',
      duration: `${duration}ms`
    })
    logger.functionExit('getRevenueByPeriod', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Handle Stripe webhook
// @route   POST /api/payments/webhook
// @access  Public (but should verify Stripe signature)
export const handleStripeWebhook = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('handleStripeWebhook', { 
    hasSignature: !!req.headers['stripe-signature'],
    hasPayload: !!req.body,
    webhookType: req.body?.type
  })
  
  try {
    const sig = req.headers['stripe-signature']
    const payload = req.body

    logger.debug('Received Stripe webhook', {
      hasSignature: !!sig,
      webhookType: payload?.type,
      webhookId: payload?.id
    })

    // In a real implementation, you would verify the webhook signature here
    // const event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET)

    // For now, we'll just log the webhook
    logger.debug('Webhook payload received', {
      webhookType: payload?.type,
      webhookId: payload?.id,
      hasData: !!payload?.data
    })

    // Handle different event types
    switch (payload.type) {
      case 'payment_intent.succeeded':
        logger.info('Payment succeeded webhook received', {
          webhookId: payload.id,
          paymentIntentId: payload.data?.object?.id
        })
        // Handle successful payment
        break
      case 'payment_intent.payment_failed':
        logger.warn('Payment failed webhook received', {
          webhookId: payload.id,
          paymentIntentId: payload.data?.object?.id
        })
        // Handle failed payment
        break
      case 'charge.dispute.created':
        logger.warn('Dispute created webhook received', {
          webhookId: payload.id,
          chargeId: payload.data?.object?.id
        })
        // Handle dispute
        break
      default:
        logger.debug('Unhandled webhook type received', {
          webhookType: payload.type,
          webhookId: payload.id
        })
    }

    const duration = Date.now() - startTime
    logger.success('Stripe webhook processed successfully', { 
      webhookType: payload.type,
      webhookId: payload.id,
      duration: `${duration}ms`
    })
    logger.functionExit('handleStripeWebhook', { 
      success: true,
      webhookType: payload.type,
      duration: `${duration}ms`
    })

    res.json({ received: true })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to handle Stripe webhook', error, {
      webhookType: req.body?.type,
      operation: 'handleStripeWebhook',
      model: 'Payment',
      duration: `${duration}ms`
    })
    logger.functionExit('handleStripeWebhook', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})
