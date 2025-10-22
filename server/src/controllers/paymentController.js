import Payment from '../models/Payment.js'
import Enrollment from '../models/Enrollment.js'
import Course from '../models/Course.js'
import User from '../models/User.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// @desc    Create payment intent
// @route   POST /api/payments/create-intent
// @access  Private
export const createPaymentIntent = asyncHandler(async (req, res) => {
  console.log('[TS-LOG][PAYMENT] Creating payment intent')
  
  const { courseId, paymentMethod } = req.body
  const studentId = req.user._id

  // Get course details
  const course = await Course.findById(courseId)
  if (!course) {
    console.log('[TS-LOG][PAYMENT] Course not found:', courseId)
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    })
  }

  if (!course.isPublished) {
    console.log('[TS-LOG][PAYMENT] Course not published')
    return res.status(400).json({
      success: false,
      message: 'Course is not available for purchase'
    })
  }

  // Check if already enrolled
  const existingEnrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId
  })

  if (existingEnrollment) {
    console.log('[TS-LOG][PAYMENT] Student already enrolled')
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

  console.log('[TS-LOG][PAYMENT] Payment intent created for course:', course.title)

  // In a real implementation, you would create a Stripe PaymentIntent here
  // For now, we'll return mock data
  res.json({
    success: true,
    data: {
      clientSecret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      paymentIntentId: `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: course.price,
      currency: 'USD',
      course: {
        id: course._id,
        title: course.title,
        thumbnailUrl: course.thumbnailUrl
      }
    }
  })
})

// @desc    Confirm payment
// @route   POST /api/payments/confirm
// @access  Private
export const confirmPayment = asyncHandler(async (req, res) => {
  console.log('[TS-LOG][PAYMENT] Confirming payment')
  
  const { paymentIntentId, courseId } = req.body
  const studentId = req.user._id

  // Get course details
  const course = await Course.findById(courseId)
  if (!course) {
    console.log('[TS-LOG][PAYMENT] Course not found')
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    })
  }

  // In a real implementation, you would verify the payment with Stripe here
  // For now, we'll simulate a successful payment

  // Create enrollment
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
  await Course.findByIdAndUpdate(courseId, {
    $inc: { studentsCount: 1 }
  })

  console.log('[TS-LOG][PAYMENT] Payment confirmed and enrollment created')

  // Populate enrollment data for response
  const populatedEnrollment = await Enrollment.findById(enrollment._id)
    .populate('course', 'title thumbnailUrl duration level instructor')
    .populate('student', 'name email avatar')

  res.json({
    success: true,
    message: 'Payment confirmed and enrollment successful',
    data: {
      enrollment: populatedEnrollment,
      payment: payment
    }
  })
})

// @desc    Get student payments
// @route   GET /api/payments
// @access  Private
export const getStudentPayments = asyncHandler(async (req, res) => {
  console.log('[TS-LOG][PAYMENT] Fetching student payments')
  
  const studentId = req.user._id
  const { status, page = 1, limit = 10 } = req.query

  let query = { student: studentId }
  if (status) {
    query.status = status
  }

  const payments = await Payment.find(query)
    .populate('course', 'title thumbnailUrl')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)

  const total = await Payment.countDocuments(query)

  console.log('[TS-LOG][PAYMENT] Found', payments.length, 'payments for student')

  res.json({
    success: true,
    count: payments.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: payments
  })
})

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
export const getPayment = asyncHandler(async (req, res) => {
  console.log('[TS-LOG][PAYMENT] Fetching payment:', req.params.id)
  
  const payment = await Payment.findById(req.params.id)
    .populate('course', 'title thumbnailUrl duration level')
    .populate('student', 'name email')
    .populate('enrollment')

  if (!payment) {
    console.log('[TS-LOG][PAYMENT] Payment not found')
    return res.status(404).json({
      success: false,
      message: 'Payment not found'
    })
  }

  // Check if user has access to this payment
  if (payment.student._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    console.log('[TS-LOG][PAYMENT] Access denied for payment')
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    })
  }

  console.log('[TS-LOG][PAYMENT] Payment found and access granted')

  res.json({
    success: true,
    data: payment
  })
})

// @desc    Process refund
// @route   POST /api/payments/:id/refund
// @access  Private/Admin
export const processRefund = asyncHandler(async (req, res) => {
  console.log('[TS-LOG][PAYMENT] Processing refund')
  
  const { amount, reason } = req.body
  const paymentId = req.params.id

  if (req.user.role !== 'admin') {
    console.log('[TS-LOG][PAYMENT] Access denied - admin only')
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    })
  }

  const payment = await Payment.findById(paymentId)
  if (!payment) {
    console.log('[TS-LOG][PAYMENT] Payment not found')
    return res.status(404).json({
      success: false,
      message: 'Payment not found'
    })
  }

  if (payment.status !== 'succeeded') {
    console.log('[TS-LOG][PAYMENT] Cannot refund non-successful payment')
    return res.status(400).json({
      success: false,
      message: 'Cannot refund payment that was not successful'
    })
  }

  const refundAmount = amount || payment.amount
  if (refundAmount > payment.amount - payment.totalRefunded) {
    console.log('[TS-LOG][PAYMENT] Refund amount exceeds available amount')
    return res.status(400).json({
      success: false,
      message: 'Refund amount exceeds available amount'
    })
  }

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
    await Enrollment.findByIdAndUpdate(payment.enrollment, {
      status: 'refunded',
      'payment.refunded': true,
      'payment.refundedAt': new Date(),
      'payment.refundAmount': payment.totalRefunded
    })
  }

  console.log('[TS-LOG][PAYMENT] Refund processed successfully')

  res.json({
    success: true,
    message: 'Refund processed successfully',
    data: {
      refund: refundData,
      totalRefunded: payment.totalRefunded,
      netAmount: payment.netAmount
    }
  })
})

// @desc    Get payment statistics
// @route   GET /api/payments/stats
// @access  Private/Admin
export const getPaymentStats = asyncHandler(async (req, res) => {
  console.log('[TS-LOG][PAYMENT] Fetching payment statistics')
  
  if (req.user.role !== 'admin') {
    console.log('[TS-LOG][PAYMENT] Access denied - admin only')
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    })
  }

  const stats = await Payment.getStats()

  console.log('[TS-LOG][PAYMENT] Statistics retrieved')

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
})

// @desc    Get revenue by period
// @route   GET /api/payments/revenue
// @access  Private/Admin
export const getRevenueByPeriod = asyncHandler(async (req, res) => {
  console.log('[TS-LOG][PAYMENT] Fetching revenue by period')
  
  if (req.user.role !== 'admin') {
    console.log('[TS-LOG][PAYMENT] Access denied - admin only')
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    })
  }

  const { startDate, endDate } = req.query
  
  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'Start date and end date are required'
    })
  }

  const revenue = await Payment.getRevenueByPeriod(
    new Date(startDate),
    new Date(endDate)
  )

  console.log('[TS-LOG][PAYMENT] Revenue data retrieved')

  res.json({
    success: true,
    data: revenue
  })
})

// @desc    Handle Stripe webhook
// @route   POST /api/payments/webhook
// @access  Public (but should verify Stripe signature)
export const handleStripeWebhook = asyncHandler(async (req, res) => {
  console.log('[TS-LOG][PAYMENT] Received Stripe webhook')
  
  const sig = req.headers['stripe-signature']
  const payload = req.body

  // In a real implementation, you would verify the webhook signature here
  // const event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET)

  // For now, we'll just log the webhook
  console.log('[TS-LOG][PAYMENT] Webhook payload:', JSON.stringify(payload, null, 2))

  // Handle different event types
  switch (payload.type) {
    case 'payment_intent.succeeded':
      console.log('[TS-LOG][PAYMENT] Payment succeeded webhook')
      // Handle successful payment
      break
    case 'payment_intent.payment_failed':
      console.log('[TS-LOG][PAYMENT] Payment failed webhook')
      // Handle failed payment
      break
    case 'charge.dispute.created':
      console.log('[TS-LOG][PAYMENT] Dispute created webhook')
      // Handle dispute
      break
    default:
      console.log('[TS-LOG][PAYMENT] Unhandled webhook type:', payload.type)
  }

  res.json({ received: true })
})
