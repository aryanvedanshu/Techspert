import Enrollment from '../models/Enrollment.js'
import Course from '../models/Course.js'
import User from '../models/User.js'
import Payment from '../models/Payment.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// @desc    Enroll student in course
// @route   POST /api/enrollments
// @access  Private
export const enrollInCourse = asyncHandler(async (req, res) => {
  console.log('[TS-LOG][ENROLLMENT] Starting course enrollment process')
  
  const { courseId, paymentData } = req.body
  const studentId = req.user._id

  // Check if student is already enrolled
  const existingEnrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId
  })

  if (existingEnrollment) {
    console.log('[TS-LOG][ENROLLMENT] Student already enrolled in course')
    return res.status(400).json({
      success: false,
      message: 'You are already enrolled in this course'
    })
  }

  // Get course details
  const course = await Course.findById(courseId)
  if (!course) {
    console.log('[TS-LOG][ENROLLMENT] Course not found:', courseId)
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    })
  }

  if (!course.isPublished) {
    console.log('[TS-LOG][ENROLLMENT] Course not published')
    return res.status(400).json({
      success: false,
      message: 'Course is not available for enrollment'
    })
  }

  console.log('[TS-LOG][ENROLLMENT] Creating enrollment for course:', course.title)

  // Create enrollment
  const enrollment = await Enrollment.create({
    student: studentId,
    course: courseId,
    payment: {
      amount: course.price,
      currency: 'USD',
      paymentMethod: paymentData?.paymentMethod || 'card',
      transactionId: paymentData?.transactionId,
      paidAt: new Date(),
    },
    requirements: {
      totalAssignments: course.syllabus?.length || 0,
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

  // Create payment record
  const payment = await Payment.create({
    paymentId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    student: studentId,
    course: courseId,
    enrollment: enrollment._id,
    amount: course.price,
    currency: 'USD',
    paymentMethod: paymentData?.paymentMethod || 'card',
    status: 'succeeded',
    processedAt: new Date(),
    description: `Payment for course: ${course.title}`,
    stripe: {
      paymentIntentId: paymentData?.paymentIntentId,
      chargeId: paymentData?.chargeId,
      customerId: paymentData?.customerId,
    },
    instructorPayout: {
      instructor: course.instructor?._id,
      amount: course.price * 0.7, // 70% to instructor
      percentage: 70,
      status: 'pending'
    }
  })

  console.log('[TS-LOG][ENROLLMENT] Enrollment created successfully:', enrollment._id)

  // Populate enrollment data for response
  const populatedEnrollment = await Enrollment.findById(enrollment._id)
    .populate('course', 'title thumbnailUrl duration level instructor')
    .populate('student', 'name email avatar')

  res.status(201).json({
    success: true,
    message: 'Successfully enrolled in course',
    data: {
      enrollment: populatedEnrollment,
      payment: payment
    }
  })
})

// @desc    Get student enrollments
// @route   GET /api/enrollments
// @access  Private
export const getStudentEnrollments = asyncHandler(async (req, res) => {
  console.log('[TS-LOG][ENROLLMENT] Fetching student enrollments')
  
  const studentId = req.user._id
  const { status, page = 1, limit = 10 } = req.query

  let query = { student: studentId }
  if (status) {
    query.status = status
  }

  const enrollments = await Enrollment.find(query)
    .populate('course', 'title thumbnailUrl duration level instructor rating studentsCount')
    .sort({ enrolledAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)

  const total = await Enrollment.countDocuments(query)

  console.log('[TS-LOG][ENROLLMENT] Found', enrollments.length, 'enrollments for student')

  res.json({
    success: true,
    count: enrollments.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: enrollments
  })
})

// @desc    Get single enrollment
// @route   GET /api/enrollments/:id
// @access  Private
export const getEnrollment = asyncHandler(async (req, res) => {
  console.log('[TS-LOG][ENROLLMENT] Fetching enrollment:', req.params.id)
  
  const enrollment = await Enrollment.findById(req.params.id)
    .populate('course', 'title description thumbnailUrl duration level instructor syllabus whatYouWillLearn requirements')
    .populate('student', 'name email avatar')
    .populate('certificate.certificateId')

  if (!enrollment) {
    console.log('[TS-LOG][ENROLLMENT] Enrollment not found')
    return res.status(404).json({
      success: false,
      message: 'Enrollment not found'
    })
  }

  // Check if user has access to this enrollment
  if (enrollment.student._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    console.log('[TS-LOG][ENROLLMENT] Access denied for enrollment')
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    })
  }

  console.log('[TS-LOG][ENROLLMENT] Enrollment found and access granted')

  res.json({
    success: true,
    data: enrollment
  })
})

// @desc    Update enrollment progress
// @route   PUT /api/enrollments/:id/progress
// @access  Private
export const updateProgress = asyncHandler(async (req, res) => {
  console.log('[TS-LOG][ENROLLMENT] Updating enrollment progress')
  
  const { progress } = req.body
  const enrollmentId = req.params.id

  const enrollment = await Enrollment.findById(enrollmentId)
  if (!enrollment) {
    console.log('[TS-LOG][ENROLLMENT] Enrollment not found')
    return res.status(404).json({
      success: false,
      message: 'Enrollment not found'
    })
  }

  // Check if user has access to this enrollment
  if (enrollment.student.toString() !== req.user._id.toString()) {
    console.log('[TS-LOG][ENROLLMENT] Access denied for progress update')
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    })
  }

  // Update progress
  await enrollment.updateProgress(progress)

  // Update user's enrollment progress
  await User.updateOne(
    { 
      _id: req.user._id,
      'enrolledCourses.course': enrollment.course
    },
    {
      $set: {
        'enrolledCourses.$.progress': progress,
        'enrolledCourses.$.completed': progress >= 100,
        'enrolledCourses.$.completedAt': progress >= 100 ? new Date() : null
      }
    }
  )

  console.log('[TS-LOG][ENROLLMENT] Progress updated to', progress, '%')

  res.json({
    success: true,
    message: 'Progress updated successfully',
    data: {
      progress: enrollment.progress,
      completed: enrollment.completed
    }
  })
})

// @desc    Mark session attendance
// @route   POST /api/enrollments/:id/attendance
// @access  Private
export const markAttendance = asyncHandler(async (req, res) => {
  console.log('[TS-LOG][ENROLLMENT] Marking session attendance')
  
  const { sessionId, duration } = req.body
  const enrollmentId = req.params.id

  const enrollment = await Enrollment.findById(enrollmentId)
  if (!enrollment) {
    console.log('[TS-LOG][ENROLLMENT] Enrollment not found')
    return res.status(404).json({
      success: false,
      message: 'Enrollment not found'
    })
  }

  // Check if user has access to this enrollment
  if (enrollment.student.toString() !== req.user._id.toString()) {
    console.log('[TS-LOG][ENROLLMENT] Access denied for attendance marking')
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    })
  }

  // Mark attendance
  await enrollment.markSessionAttendance(sessionId, duration)

  console.log('[TS-LOG][ENROLLMENT] Attendance marked for session:', sessionId)

  res.json({
    success: true,
    message: 'Attendance marked successfully'
  })
})

// @desc    Complete assignment
// @route   POST /api/enrollments/:id/assignment
// @access  Private
export const completeAssignment = asyncHandler(async (req, res) => {
  console.log('[TS-LOG][ENROLLMENT] Completing assignment')
  
  const enrollmentId = req.params.id

  const enrollment = await Enrollment.findById(enrollmentId)
  if (!enrollment) {
    console.log('[TS-LOG][ENROLLMENT] Enrollment not found')
    return res.status(404).json({
      success: false,
      message: 'Enrollment not found'
    })
  }

  // Check if user has access to this enrollment
  if (enrollment.student.toString() !== req.user._id.toString()) {
    console.log('[TS-LOG][ENROLLMENT] Access denied for assignment completion')
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    })
  }

  // Complete assignment
  await enrollment.completeAssignment()

  console.log('[TS-LOG][ENROLLMENT] Assignment completed')

  res.json({
    success: true,
    message: 'Assignment completed successfully',
    data: {
      assignmentsCompleted: enrollment.requirements.assignmentsCompleted,
      totalAssignments: enrollment.requirements.totalAssignments
    }
  })
})

// @desc    Get course enrollments (for instructors/admins)
// @route   GET /api/courses/:courseId/enrollments
// @access  Private/Admin
export const getCourseEnrollments = asyncHandler(async (req, res) => {
  console.log('[TS-LOG][ENROLLMENT] Fetching course enrollments')
  
  const { courseId } = req.params
  const { status, page = 1, limit = 20 } = req.query

  // Check if user has permission to view course enrollments
  if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
    console.log('[TS-LOG][ENROLLMENT] Access denied - insufficient permissions')
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    })
  }

  let query = { course: courseId }
  if (status) {
    query.status = status
  }

  const enrollments = await Enrollment.find(query)
    .populate('student', 'name email avatar')
    .sort({ enrolledAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)

  const total = await Enrollment.countDocuments(query)

  console.log('[TS-LOG][ENROLLMENT] Found', enrollments.length, 'enrollments for course')

  res.json({
    success: true,
    count: enrollments.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: enrollments
  })
})

// @desc    Get enrollment statistics
// @route   GET /api/enrollments/stats
// @access  Private/Admin
export const getEnrollmentStats = asyncHandler(async (req, res) => {
  console.log('[TS-LOG][ENROLLMENT] Fetching enrollment statistics')
  
  if (req.user.role !== 'admin') {
    console.log('[TS-LOG][ENROLLMENT] Access denied - admin only')
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    })
  }

  const stats = await Enrollment.getStats()

  console.log('[TS-LOG][ENROLLMENT] Statistics retrieved')

  res.json({
    success: true,
    data: stats[0] || {
      totalEnrollments: 0,
      activeEnrollments: 0,
      completedEnrollments: 0,
      averageProgress: 0,
      totalRevenue: 0
    }
  })
})
