import Enrollment from '../models/Enrollment.js'
import Course from '../models/Course.js'
import User from '../models/User.js'
import Payment from '../models/Payment.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import logger from '../utils/logger.js'

// @desc    Enroll student in course
// @route   POST /api/enrollments
// @access  Private
export const enrollInCourse = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('enrollInCourse', { 
    courseId: req.body.courseId,
    studentId: req.user._id,
    hasPaymentData: !!req.body.paymentData
  })
  
  try {
    const { courseId, paymentData } = req.body
    const studentId = req.user._id

    logger.debug('Starting course enrollment process', {
      courseId,
      studentId,
      hasPaymentData: !!paymentData
    })

    // Check if student is already enrolled
    logger.dbOperation('findOne', 'Enrollment', { student: studentId, course: courseId })
    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId
    })

    if (existingEnrollment) {
      const duration = Date.now() - startTime
      logger.warn('Student already enrolled in course', { 
        courseId,
        studentId,
        enrollmentId: existingEnrollment._id,
        duration: `${duration}ms`
      })
      logger.functionExit('enrollInCourse', { 
        success: false,
        alreadyEnrolled: true,
        duration: `${duration}ms`
      })
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      })
    }

    // Get course details
    logger.dbOperation('findById', 'Course', courseId)
    const course = await Course.findById(courseId)
    if (!course) {
      const duration = Date.now() - startTime
      logger.warn('Course not found for enrollment', { 
        courseId,
        studentId,
        duration: `${duration}ms`
      })
      logger.functionExit('enrollInCourse', { 
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
      logger.warn('Course not published - cannot enroll', { 
        courseId,
        courseTitle: course.title,
        isPublished: course.isPublished,
        duration: `${duration}ms`
      })
      logger.functionExit('enrollInCourse', { 
        success: false,
        courseNotPublished: true,
        duration: `${duration}ms`
      })
      return res.status(400).json({
        success: false,
        message: 'Course is not available for enrollment'
      })
    }

    logger.debug('Creating enrollment for course', {
      courseId,
      courseTitle: course.title,
      studentId,
      price: course.price
    })

    // Create enrollment
    logger.dbOperation('create', 'Enrollment', { student: studentId, course: courseId })
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

    // Create payment record
    logger.dbOperation('create', 'Payment', { student: studentId, course: courseId, amount: course.price })
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

    // Populate enrollment data for response
    logger.dbOperation('findById', 'Enrollment', { id: enrollment._id, operation: 'populate' })
    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate('course', 'title thumbnailUrl duration level instructor')
      .populate('student', 'name email avatar')

    const duration = Date.now() - startTime
    logger.success('Enrollment created successfully', { 
      enrollmentId: enrollment._id,
      courseId,
      courseTitle: course.title,
      studentId,
      paymentId: payment._id,
      amount: course.price,
      duration: `${duration}ms`
    })
    logger.functionExit('enrollInCourse', { 
      success: true,
      enrollmentId: enrollment._id,
      duration: `${duration}ms`
    })

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: {
        enrollment: populatedEnrollment,
        payment: payment
      }
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to enroll in course', error, {
      courseId: req.body.courseId,
      studentId: req.user._id,
      operation: 'enrollInCourse',
      model: 'Enrollment',
      duration: `${duration}ms`
    })
    logger.functionExit('enrollInCourse', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Get student enrollments
// @route   GET /api/enrollments
// @access  Private
export const getStudentEnrollments = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  const studentId = req.user._id
  logger.functionEntry('getStudentEnrollments', { 
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

    logger.dbOperation('find', 'Enrollment', query)
    const enrollments = await Enrollment.find(query)
      .populate('course', 'title thumbnailUrl duration level instructor rating studentsCount')
      .sort({ enrolledAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    logger.dbOperation('countDocuments', 'Enrollment', query)
    const total = await Enrollment.countDocuments(query)

    const duration = Date.now() - startTime
    logger.success('Student enrollments fetched successfully', { 
      studentId,
      count: enrollments.length,
      total,
      page: parseInt(page),
      duration: `${duration}ms`
    })
    logger.functionExit('getStudentEnrollments', { 
      success: true,
      count: enrollments.length,
      total,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      count: enrollments.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: enrollments
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to fetch student enrollments', error, {
      studentId: req.user._id,
      operation: 'getStudentEnrollments',
      model: 'Enrollment',
      duration: `${duration}ms`
    })
    logger.functionExit('getStudentEnrollments', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Get single enrollment
// @route   GET /api/enrollments/:id
// @access  Private
export const getEnrollment = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  const { id } = req.params
  logger.functionEntry('getEnrollment', { 
    enrollmentId: id,
    userId: req.user._id,
    userRole: req.user.role
  })
  
  try {
    logger.dbOperation('findById', 'Enrollment', id)
    const enrollment = await Enrollment.findById(id)
      .populate('course', 'title description thumbnailUrl duration level instructor syllabus whatYouWillLearn requirements')
      .populate('student', 'name email avatar')
      .populate('certificate.certificateId')

    if (!enrollment) {
      const duration = Date.now() - startTime
      logger.warn('Enrollment not found', { 
        enrollmentId: id,
        duration: `${duration}ms`
      })
      logger.functionExit('getEnrollment', { 
        success: false,
        found: false,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      })
    }

    // Check if user has access to this enrollment
    if (enrollment.student._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      const duration = Date.now() - startTime
      logger.warn('Access denied for enrollment', { 
        enrollmentId: id,
        userId: req.user._id,
        studentId: enrollment.student._id,
        userRole: req.user.role,
        duration: `${duration}ms`
      })
      logger.functionExit('getEnrollment', { 
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
    logger.success('Enrollment fetched successfully', { 
      enrollmentId: enrollment._id,
      courseId: enrollment.course?._id,
      studentId: enrollment.student._id,
      duration: `${duration}ms`
    })
    logger.functionExit('getEnrollment', { 
      success: true,
      enrollmentId: enrollment._id,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      data: enrollment
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to fetch enrollment', error, {
      enrollmentId: req.params.id,
      operation: 'getEnrollment',
      model: 'Enrollment',
      duration: `${duration}ms`
    })
    logger.functionExit('getEnrollment', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Update enrollment progress
// @route   PUT /api/enrollments/:id/progress
// @access  Private
export const updateProgress = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  const { id } = req.params
  const { progress } = req.body
  logger.functionEntry('updateProgress', { 
    enrollmentId: id,
    progress,
    userId: req.user._id
  })
  
  try {
    logger.dbOperation('findById', 'Enrollment', id)
    const enrollment = await Enrollment.findById(id)
    
    if (!enrollment) {
      const duration = Date.now() - startTime
      logger.warn('Enrollment not found for progress update', { 
        enrollmentId: id,
        duration: `${duration}ms`
      })
      logger.functionExit('updateProgress', { 
        success: false,
        found: false,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      })
    }

    // Check if user has access to this enrollment
    if (enrollment.student.toString() !== req.user._id.toString()) {
      const duration = Date.now() - startTime
      logger.warn('Access denied for progress update', { 
        enrollmentId: id,
        userId: req.user._id,
        studentId: enrollment.student,
        duration: `${duration}ms`
      })
      logger.functionExit('updateProgress', { 
        success: false,
        accessDenied: true,
        duration: `${duration}ms`
      })
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    logger.debug('Updating enrollment progress', {
      enrollmentId: id,
      oldProgress: enrollment.progress,
      newProgress: progress
    })

    // Update progress
    await enrollment.updateProgress(progress)

    // Update user's enrollment progress
    logger.dbOperation('updateOne', 'User', { id: req.user._id, operation: 'updateEnrollmentProgress' })
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

    const duration = Date.now() - startTime
    logger.success('Progress updated successfully', { 
      enrollmentId: enrollment._id,
      courseId: enrollment.course,
      progress,
      completed: enrollment.completed,
      duration: `${duration}ms`
    })
    logger.functionExit('updateProgress', { 
      success: true,
      enrollmentId: enrollment._id,
      progress,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: {
        progress: enrollment.progress,
        completed: enrollment.completed
      }
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to update progress', error, {
      enrollmentId: req.params.id,
      progress: req.body.progress,
      operation: 'updateProgress',
      model: 'Enrollment',
      duration: `${duration}ms`
    })
    logger.functionExit('updateProgress', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Mark session attendance
// @route   POST /api/enrollments/:id/attendance
// @access  Private
export const markAttendance = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  const { id } = req.params
  const { sessionId, duration } = req.body
  logger.functionEntry('markAttendance', { 
    enrollmentId: id,
    sessionId,
    duration,
    userId: req.user._id
  })
  
  try {
    logger.dbOperation('findById', 'Enrollment', id)
    const enrollment = await Enrollment.findById(id)
    
    if (!enrollment) {
      const duration = Date.now() - startTime
      logger.warn('Enrollment not found for attendance marking', { 
        enrollmentId: id,
        duration: `${duration}ms`
      })
      logger.functionExit('markAttendance', { 
        success: false,
        found: false,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      })
    }

    // Check if user has access to this enrollment
    if (enrollment.student.toString() !== req.user._id.toString()) {
      const duration = Date.now() - startTime
      logger.warn('Access denied for attendance marking', { 
        enrollmentId: id,
        userId: req.user._id,
        studentId: enrollment.student,
        duration: `${duration}ms`
      })
      logger.functionExit('markAttendance', { 
        success: false,
        accessDenied: true,
        duration: `${duration}ms`
      })
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    logger.debug('Marking session attendance', {
      enrollmentId: id,
      sessionId,
      duration
    })

    // Mark attendance
    await enrollment.markSessionAttendance(sessionId, duration)

    const duration = Date.now() - startTime
    logger.success('Attendance marked successfully', { 
      enrollmentId: enrollment._id,
      sessionId,
      duration: `${duration}ms`
    })
    logger.functionExit('markAttendance', { 
      success: true,
      enrollmentId: enrollment._id,
      sessionId,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      message: 'Attendance marked successfully'
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to mark attendance', error, {
      enrollmentId: req.params.id,
      sessionId: req.body.sessionId,
      operation: 'markAttendance',
      model: 'Enrollment',
      duration: `${duration}ms`
    })
    logger.functionExit('markAttendance', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Complete assignment
// @route   POST /api/enrollments/:id/assignment
// @access  Private
export const completeAssignment = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  const { id } = req.params
  logger.functionEntry('completeAssignment', { 
    enrollmentId: id,
    userId: req.user._id
  })
  
  try {
    logger.dbOperation('findById', 'Enrollment', id)
    const enrollment = await Enrollment.findById(id)
    
    if (!enrollment) {
      const duration = Date.now() - startTime
      logger.warn('Enrollment not found for assignment completion', { 
        enrollmentId: id,
        duration: `${duration}ms`
      })
      logger.functionExit('completeAssignment', { 
        success: false,
        found: false,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      })
    }

    // Check if user has access to this enrollment
    if (enrollment.student.toString() !== req.user._id.toString()) {
      const duration = Date.now() - startTime
      logger.warn('Access denied for assignment completion', { 
        enrollmentId: id,
        userId: req.user._id,
        studentId: enrollment.student,
        duration: `${duration}ms`
      })
      logger.functionExit('completeAssignment', { 
        success: false,
        accessDenied: true,
        duration: `${duration}ms`
      })
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    logger.debug('Completing assignment', {
      enrollmentId: id,
      currentCompleted: enrollment.requirements.assignmentsCompleted,
      totalAssignments: enrollment.requirements.totalAssignments
    })

    // Complete assignment
    await enrollment.completeAssignment()

    const duration = Date.now() - startTime
    logger.success('Assignment completed successfully', { 
      enrollmentId: enrollment._id,
      assignmentsCompleted: enrollment.requirements.assignmentsCompleted,
      totalAssignments: enrollment.requirements.totalAssignments,
      duration: `${duration}ms`
    })
    logger.functionExit('completeAssignment', { 
      success: true,
      enrollmentId: enrollment._id,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      message: 'Assignment completed successfully',
      data: {
        assignmentsCompleted: enrollment.requirements.assignmentsCompleted,
        totalAssignments: enrollment.requirements.totalAssignments
      }
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to complete assignment', error, {
      enrollmentId: req.params.id,
      operation: 'completeAssignment',
      model: 'Enrollment',
      duration: `${duration}ms`
    })
    logger.functionExit('completeAssignment', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Get course enrollments (for instructors/admins)
// @route   GET /api/courses/:courseId/enrollments
// @access  Private/Admin
export const getCourseEnrollments = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  const { courseId } = req.params
  logger.functionEntry('getCourseEnrollments', { 
    courseId,
    userId: req.user._id,
    userRole: req.user.role,
    status: req.query.status,
    page: req.query.page,
    limit: req.query.limit
  })
  
  try {
    const { status, page = 1, limit = 20 } = req.query

    // Check if user has permission to view course enrollments
    if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
      const duration = Date.now() - startTime
      logger.warn('Access denied - insufficient permissions for course enrollments', { 
        courseId,
        userId: req.user._id,
        userRole: req.user.role,
        duration: `${duration}ms`
      })
      logger.functionExit('getCourseEnrollments', { 
        success: false,
        accessDenied: true,
        duration: `${duration}ms`
      })
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    let query = { course: courseId }
    if (status) {
      query.status = status
    }

    logger.dbOperation('find', 'Enrollment', query)
    const enrollments = await Enrollment.find(query)
      .populate('student', 'name email avatar')
      .sort({ enrolledAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    logger.dbOperation('countDocuments', 'Enrollment', query)
    const total = await Enrollment.countDocuments(query)

    const duration = Date.now() - startTime
    logger.success('Course enrollments fetched successfully', { 
      courseId,
      count: enrollments.length,
      total,
      page: parseInt(page),
      duration: `${duration}ms`
    })
    logger.functionExit('getCourseEnrollments', { 
      success: true,
      count: enrollments.length,
      total,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      count: enrollments.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: enrollments
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to fetch course enrollments', error, {
      courseId: req.params.courseId,
      operation: 'getCourseEnrollments',
      model: 'Enrollment',
      duration: `${duration}ms`
    })
    logger.functionExit('getCourseEnrollments', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Get enrollment statistics
// @route   GET /api/enrollments/stats
// @access  Private/Admin
export const getEnrollmentStats = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('getEnrollmentStats', { 
    userId: req.user._id,
    userRole: req.user.role
  })
  
  try {
    if (req.user.role !== 'admin') {
      const duration = Date.now() - startTime
      logger.warn('Access denied - admin only for enrollment statistics', { 
        userId: req.user._id,
        userRole: req.user.role,
        duration: `${duration}ms`
      })
      logger.functionExit('getEnrollmentStats', { 
        success: false,
        accessDenied: true,
        duration: `${duration}ms`
      })
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    logger.debug('Fetching enrollment statistics')
    logger.dbOperation('aggregate', 'Enrollment', 'statistics')
    const stats = await Enrollment.getStats()

    const duration = Date.now() - startTime
    logger.success('Enrollment statistics fetched successfully', { 
      totalEnrollments: stats[0]?.totalEnrollments || 0,
      activeEnrollments: stats[0]?.activeEnrollments || 0,
      completedEnrollments: stats[0]?.completedEnrollments || 0,
      duration: `${duration}ms`
    })
    logger.functionExit('getEnrollmentStats', { 
      success: true,
      duration: `${duration}ms`
    })

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
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to fetch enrollment statistics', error, {
      operation: 'getEnrollmentStats',
      model: 'Enrollment',
      duration: `${duration}ms`
    })
    logger.functionExit('getEnrollmentStats', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})
