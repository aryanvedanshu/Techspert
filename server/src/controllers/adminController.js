import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import Admin from '../models/Admin.js'
import Course from '../models/Course.js'
import Project from '../models/Project.js'
import Alumni from '../models/Alumni.js'
import Enrollment from '../models/Enrollment.js'
import Payment from '../models/Payment.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import authLogger from '../utils/authLogger.js'
import logger from '../utils/logger.js'

// @desc    Login admin
// @route   POST /api/admin/login
// @access  Public
export const loginAdmin = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  const { email, password } = req.body
  
  authLogger.loginAttempt(email, true)
  authLogger.info('adminController', 'loginAdmin', `Admin login attempt started`, {
    email,
    hasPassword: !!password,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })

  // Validate input
  if (!email || !password) {
    authLogger.loginFailure(email, 'Missing email or password')
    authLogger.error('adminController', 'loginAdmin', `Validation failed - missing credentials`, {
      email,
      hasEmail: !!email,
      hasPassword: !!password
    })
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password',
    })
  }

  // Find admin and include password
  authLogger.debug('adminController', 'loginAdmin', `Searching for admin in database`)
  // Normalize email to lowercase for consistent lookup
  const normalizedEmail = email.toLowerCase().trim()
  const admin = await Admin.findOne({ email: normalizedEmail }).select('+password')
  
  authLogger.debug('adminController', 'loginAdmin', `Admin database lookup completed`, {
    email,
    adminFound: !!admin,
    adminId: admin?._id
  })

  if (!admin) {
    authLogger.loginFailure(email, 'Admin not found')
    authLogger.error('adminController', 'loginAdmin', `Admin not found for email`, {
      email
    })
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    })
  }

  // Check if account is locked
  authLogger.debug('adminController', 'loginAdmin', `Checking account status`, {
    adminId: admin._id,
    isLocked: admin.isLocked,
    isActive: admin.isActive
  })
  
  if (admin.isLocked) {
    authLogger.loginFailure(email, 'Account is locked')
    authLogger.error('adminController', 'loginAdmin', `Account is locked`, {
      email,
      adminId: admin._id,
      isLocked: admin.isLocked
    })
    return res.status(401).json({
      success: false,
      message: 'Account is temporarily locked due to multiple failed login attempts',
    })
  }

  // Check if account is active
  if (!admin.isActive) {
    authLogger.loginFailure(email, 'Account is deactivated')
    authLogger.error('adminController', 'loginAdmin', `Account is deactivated`, {
      email,
      adminId: admin._id,
      isActive: admin.isActive
    })
    return res.status(401).json({
      success: false,
      message: 'Account is deactivated',
    })
  }

  // Check password
  authLogger.debug('adminController', 'loginAdmin', `Validating password`)
  const isPasswordValid = await admin.comparePassword(password)
  
  authLogger.debug('adminController', 'loginAdmin', `Password validation completed`, {
    adminId: admin._id,
    passwordValid: isPasswordValid
  })

  if (!isPasswordValid) {
    authLogger.loginFailure(email, 'Invalid password')
    authLogger.error('adminController', 'loginAdmin', `Invalid password`, {
      email,
      adminId: admin._id
    })
    
    // Increment login attempts
    await admin.incLoginAttempts()
    authLogger.debug('adminController', 'loginAdmin', `Login attempts incremented`)
    
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    })
  }

  // Reset login attempts on successful login
  authLogger.debug('adminController', 'loginAdmin', `Resetting login attempts for successful login`)
  await admin.resetLoginAttempts()

  // Generate JWT token
  authLogger.debug('adminController', 'loginAdmin', `Generating JWT token`)
  const token = jwt.sign(
    { id: admin._id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  )

  // Generate refresh token
  authLogger.debug('adminController', 'loginAdmin', `Generating refresh token`)
  const refreshToken = jwt.sign(
    { id: admin._id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '30d' }
  )

  // Add refresh token to admin
  authLogger.debug('adminController', 'loginAdmin', `Adding refresh token to admin`)
  admin.refreshTokens.push({ token: refreshToken })
  await admin.save()

  // Remove password from response
  authLogger.debug('adminController', 'loginAdmin', `Preparing admin data for response`)
  const adminData = admin.toObject()
  delete adminData.password
  delete adminData.refreshTokens

  const responseTime = Date.now() - startTime
  const tokens = { accessToken: token, refreshToken: refreshToken }
  
  authLogger.loginSuccess(email, admin._id, admin.role, tokens)
  authLogger.info('adminController', 'loginAdmin', `Login successful`, {
    email,
    adminId: admin._id,
    role: admin.role,
    responseTime: `${responseTime}ms`
  })
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: adminData,
      tokens: tokens,
    },
  })
})

// @desc    Logout admin
// @route   POST /api/admin/logout
// @access  Private
export const logoutAdmin = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body

  if (refreshToken) {
    // Remove refresh token from admin
    await Admin.findByIdAndUpdate(req.admin._id, {
      $pull: { refreshTokens: { token: refreshToken } },
    })
  }

  res.json({
    success: true,
    message: 'Logout successful',
  })
})

// @desc    Refresh token
// @route   POST /api/admin/refresh
// @access  Public
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token required',
    })
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    )

    const admin = await Admin.findById(decoded.id)

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      })
    }

    // Check if refresh token exists in admin's tokens
    const tokenExists = admin.refreshTokens.some(
      token => token.token === refreshToken
    )

    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      })
    }

    // Generate new access token
    const newToken = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    )

    res.json({
      success: true,
      token: newToken,
    })
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    })
  }
})

// @desc    Get current admin profile
// @route   GET /api/admin/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: req.admin,
  })
})

// @desc    Update admin profile
// @route   PUT /api/admin/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const allowedUpdates = ['name', 'profile', 'preferences']
  const updates = {}

  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key]
    }
  })

  const admin = await Admin.findByIdAndUpdate(
    req.admin._id,
    updates,
    { new: true, runValidators: true }
  )

  res.json({
    success: true,
    data: admin,
  })
})

// @desc    Change password
// @route   PUT /api/admin/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Current password and new password are required',
    })
  }

  // Get admin with password
  const admin = await Admin.findById(req.admin._id).select('+password')

  // Verify current password
  const isCurrentPasswordValid = await admin.comparePassword(currentPassword)

  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect',
    })
  }

  // Update password
  admin.password = newPassword
  await admin.save()

  res.json({
    success: true,
    message: 'Password changed successfully',
  })
})

// @desc    Get all admins
// @route   GET /api/admin/admins
// @access  Private/Super Admin
export const getAdmins = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('getAdmins', {
    adminId: req.admin?._id,
    adminEmail: req.admin?.email,
    adminRole: req.admin?.role
  })

  try {
    logger.debug('Fetching all active admins', {
      adminId: req.admin?._id
    })

    logger.dbOperation('find', 'Admin', {
      filter: { isActive: true },
      select: '-password -refreshTokens'
    })
    const admins = await Admin.find({ isActive: true })
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 })

    const duration = Date.now() - startTime
    logger.success('Admins fetched successfully', {
      adminId: req.admin?._id,
      count: admins.length,
      duration: `${duration}ms`
    })
    logger.functionExit('getAdmins', {
      success: true,
      count: admins.length,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      count: admins.length,
      data: admins,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to fetch admins', error, {
      adminId: req.admin?._id,
      operation: 'getAdmins',
      model: 'Admin',
      duration: `${duration}ms`
    })
    logger.functionExit('getAdmins', {
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Create new admin
// @route   POST /api/admin/admins
// @access  Private/Super Admin
export const createAdmin = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('createAdmin', {
    adminId: req.admin?._id,
    adminEmail: req.admin?.email,
    bodyKeys: Object.keys(req.body),
    hasEmail: !!req.body.email,
    hasName: !!req.body.name
  })

  try {
    logger.debug('Super admin creating new admin', {
      adminId: req.admin?._id,
      newAdminEmail: req.body.email,
      newAdminRole: req.body.role
    })

    // Validate required fields
    const requiredFields = ['name', 'email', 'password']
    const missingFields = requiredFields.filter(field => !req.body[field])

    if (missingFields.length > 0) {
      const error = new Error(`Missing required fields: ${missingFields.join(', ')}`)
      error.name = 'ValidationError'
      logger.error('Validation failed: missing required fields', error, {
        body: req.body,
        operation: 'createAdmin',
        model: 'Admin',
        missingFields,
        requiredFields
      })
      throw error
    }

    logger.dbOperation('create', 'Admin', {
      email: req.body.email,
      name: req.body.name,
      role: req.body.role
    })
    const admin = await Admin.create(req.body)

    // Remove password from response
    const adminData = admin.toObject()
    delete adminData.password
    delete adminData.refreshTokens

    const duration = Date.now() - startTime
    logger.success('Admin created successfully', {
      adminId: req.admin?._id,
      newAdminId: admin._id,
      newAdminEmail: admin.email,
      duration: `${duration}ms`
    })
    logger.functionExit('createAdmin', {
      success: true,
      adminId: req.admin?._id,
      newAdminId: admin._id,
      duration: `${duration}ms`
    })

    res.status(201).json({
      success: true,
      data: adminData,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Admin creation failed', error, {
      adminId: req.admin?._id,
      body: req.body,
      operation: 'createAdmin',
      model: 'Admin',
      duration: `${duration}ms`
    })
    logger.functionExit('createAdmin', {
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Update admin
// @route   PUT /api/admin/admins/:id
// @access  Private/Super Admin
export const updateAdmin = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('updateAdmin', {
    adminId: req.admin?._id,
    adminEmail: req.admin?.email,
    targetAdminId: req.params.id,
    bodyKeys: Object.keys(req.body)
  })

  try {
    logger.debug('Super admin updating admin', {
      adminId: req.admin?._id,
      targetAdminId: req.params.id,
      updateFields: Object.keys(req.body)
    })

    logger.dbOperation('findByIdAndUpdate', 'Admin', {
      adminId: req.params.id,
      updateFields: Object.keys(req.body)
    })
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password -refreshTokens')

    if (!admin) {
      const error = new Error('Admin not found')
      error.statusCode = 404
      logger.error('Admin not found for update', error, {
        adminId: req.admin?._id,
        targetAdminId: req.params.id,
        operation: 'updateAdmin',
        model: 'Admin'
      })
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      })
    }

    const duration = Date.now() - startTime
    logger.success('Admin updated successfully', {
      adminId: req.admin?._id,
      targetAdminId: admin._id,
      targetAdminEmail: admin.email,
      duration: `${duration}ms`
    })
    logger.functionExit('updateAdmin', {
      success: true,
      adminId: req.admin?._id,
      targetAdminId: admin._id,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      data: admin,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Admin update failed', error, {
      adminId: req.admin?._id,
      targetAdminId: req.params.id,
      body: req.body,
      operation: 'updateAdmin',
      model: 'Admin',
      duration: `${duration}ms`
    })
    logger.functionExit('updateAdmin', {
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Delete admin
// @route   DELETE /api/admin/admins/:id
// @access  Private/Super Admin
export const deleteAdmin = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('deleteAdmin', {
    adminId: req.admin?._id,
    adminEmail: req.admin?.email,
    targetAdminId: req.params.id
  })

  try {
    logger.debug('Super admin deactivating admin', {
      adminId: req.admin?._id,
      targetAdminId: req.params.id
    })

    logger.dbOperation('findByIdAndUpdate', 'Admin', {
      adminId: req.params.id,
      update: { isActive: false }
    })
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    )

    if (!admin) {
      const error = new Error('Admin not found')
      error.statusCode = 404
      logger.error('Admin not found for deletion', error, {
        adminId: req.admin?._id,
        targetAdminId: req.params.id,
        operation: 'deleteAdmin',
        model: 'Admin'
      })
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      })
    }

    const duration = Date.now() - startTime
    logger.success('Admin deactivated successfully', {
      adminId: req.admin?._id,
      targetAdminId: admin._id,
      targetAdminEmail: admin.email,
      duration: `${duration}ms`
    })
    logger.functionExit('deleteAdmin', {
      success: true,
      adminId: req.admin?._id,
      targetAdminId: admin._id,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      message: 'Admin deactivated successfully',
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Admin deletion failed', error, {
      adminId: req.admin?._id,
      targetAdminId: req.params.id,
      operation: 'deleteAdmin',
      model: 'Admin',
      duration: `${duration}ms`
    })
    logger.functionExit('deleteAdmin', {
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private
export const getDashboardStats = asyncHandler(async (req, res) => {
  // Aggregate real data from database
  const [
    totalCourses,
    totalProjects,
    totalAlumni,
    totalEnrollments,
    pendingProjects,
    revenueResult,
    ratingResult
  ] = await Promise.all([
    Course.countDocuments({ isPublished: true }),
    Project.countDocuments(),
    Alumni.countDocuments(),
    Enrollment.countDocuments(),
    Project.countDocuments({ isApproved: false }),
    Payment.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ]),
    Course.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating.average' } } }
    ])
  ])

  // Get unique student count
  const uniqueStudents = await Enrollment.distinct('student').then(students => students.length)
  
  // Get active enrollments
  const activeEnrollments = await Enrollment.countDocuments({ status: 'active' })

  const totalRevenue = revenueResult[0]?.totalRevenue || 0
  const averageRating = ratingResult[0]?.avgRating || 0

  const stats = {
    totalCourses,
    totalProjects,
    totalAlumni,
    totalStudents: uniqueStudents || totalEnrollments,
    totalRevenue,
    averageRating: Math.round(averageRating * 10) / 10,
    pendingProjects,
    activeUsers: activeEnrollments,
    recentActivity: [], // TODO: Implement real recent activity
  }

  res.json({
    success: true,
    data: stats,
  })
})

// @desc    Get all courses for admin (no filters)
// @route   GET /api/admin/courses
// @access  Private/Admin
export const getAllCoursesForAdmin = asyncHandler(async (req, res) => {
  const logger = (await import('../utils/logger.js')).default
  const startTime = Date.now()
  
  logger.functionEntry('getAllCoursesForAdmin', {
    query: req.query,
    adminId: req.admin?._id,
    adminEmail: req.admin?.email
  })

  try {
    const {
      page = 1,
      limit = 50,
      search,
      sort = 'createdAt',
      order = 'desc',
    } = req.query

    logger.debug('Processing query parameters', {
      page,
      limit,
      search,
      sort,
      order
    })

    // Build query - NO isPublished filter
    let query = {}

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ]
      logger.debug('Search query built', { searchTerm: search, queryPattern: query.$or })
    }

    const sortOrder = order === 'desc' ? -1 : 1
    const sortObj = { [sort]: sortOrder }

    logger.dbOperation('find', 'Course', query)
    const courses = await Course.find(query)
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean()

    logger.dbOperation('countDocuments', 'Course', query)
    const total = await Course.countDocuments(query)

    const duration = Date.now() - startTime
    logger.info('Courses fetched successfully', {
      count: courses.length,
      total,
      page,
      limit,
      duration: `${duration}ms`
    })

    logger.functionExit('getAllCoursesForAdmin', {
      count: courses.length,
      total,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      count: courses.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: courses,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to fetch courses for admin', error, {
      query: req.query,
      adminId: req.admin?._id,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Get single course for admin (no filters)
// @route   GET /api/admin/courses/:id
// @access  Private/Admin
export const getCourseForAdmin = asyncHandler(async (req, res) => {
  const logger = (await import('../utils/logger.js')).default
  const startTime = Date.now()
  
  logger.functionEntry('getCourseForAdmin', {
    courseId: req.params.id,
    adminId: req.admin?._id,
    adminEmail: req.admin?.email
  })

  try {
    const { id } = req.params
    
    logger.debug('Fetching course by ID', { courseId: id })
    logger.dbOperation('findById', 'Course', { _id: id })
    
    const course = await Course.findById(id)
    
    if (!course) {
      logger.warn('Course not found', {
        courseId: id,
        adminId: req.admin?._id
      })
      
      const duration = Date.now() - startTime
      logger.functionExit('getCourseForAdmin', {
        success: false,
        reason: 'Course not found',
        duration: `${duration}ms`
      })
      
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      })
    }
    
    const duration = Date.now() - startTime
    logger.info('Course fetched successfully', {
      courseId: id,
      courseTitle: course.title,
      duration: `${duration}ms`
    })
    
    logger.functionExit('getCourseForAdmin', {
      success: true,
      courseId: id,
      duration: `${duration}ms`
    })
    
    res.json({
      success: true,
      data: course,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to fetch course for admin', error, {
      courseId: req.params.id,
      adminId: req.admin?._id,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Get all projects for admin (no filters)
// @route   GET /api/admin/projects
// @access  Private/Admin
export const getAllProjectsForAdmin = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 50,
    search,
    sort = 'createdAt',
    order = 'desc',
  } = req.query

  // Build query - NO isApproved filter
  let query = {}

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { studentName: { $regex: search, $options: 'i' } },
      { technologies: { $in: [new RegExp(search, 'i')] } },
    ]
  }

  const sortOrder = order === 'desc' ? -1 : 1
  const sortObj = { [sort]: sortOrder }

  const projects = await Project.find(query)
    .sort(sortObj)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean()

  const total = await Project.countDocuments(query)

  res.json({
    success: true,
    count: projects.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: projects,
  })
})

// @desc    Get single project for admin (no filters)
// @route   GET /api/admin/projects/:id
// @access  Private/Admin
export const getProjectForAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params
  
  const project = await Project.findById(id)
  
  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    })
  }
  
  res.json({
    success: true,
    data: project,
  })
})

// @desc    Get enrollment statistics
// @route   GET /api/admin/enrollments/stats
// @access  Private
export const getEnrollmentStats = asyncHandler(async (req, res) => {
  const Enrollment = (await import('../models/Enrollment.js')).default
  
  const totalEnrollments = await Enrollment.countDocuments()
  const activeEnrollments = await Enrollment.countDocuments({ status: 'active' })
  const completedEnrollments = await Enrollment.countDocuments({ status: 'completed' })
  
  // Get enrollment trends (last 6 months)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  
  const monthlyEnrollments = await Enrollment.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ])

  res.json({
    success: true,
    data: {
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      monthlyTrends: monthlyEnrollments
    }
  })
})

// @desc    Get all enrollments for admin
// @route   GET /api/admin/enrollments
// @access  Private/Admin
export const getAllEnrollmentsForAdmin = asyncHandler(async (req, res) => {
  const Enrollment = (await import('../models/Enrollment.js')).default
  
  const enrollments = await Enrollment.find()
    .populate('student', 'name email')
    .populate('course', 'title slug')
    .sort({ createdAt: -1 })
    .lean()
  
  res.json({
    success: true,
    count: enrollments.length,
    data: enrollments,
  })
})

// @desc    Get payment statistics
// @route   GET /api/admin/payments/stats
// @access  Private
export const getPaymentStats = asyncHandler(async (req, res) => {
  const Payment = (await import('../models/Payment.js')).default
  
  const totalPayments = await Payment.countDocuments()
  const successfulPayments = await Payment.countDocuments({ status: 'succeeded' })
  const pendingPayments = await Payment.countDocuments({ status: 'pending' })
  const failedPayments = await Payment.countDocuments({ status: 'failed' })
  
  // Calculate total revenue
  const revenueResult = await Payment.aggregate([
    { $match: { status: 'succeeded' } },
    { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
  ])
  
  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0
  
  // Get revenue trends (last 6 months)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  
  const monthlyRevenue = await Payment.aggregate([
    {
      $match: {
        status: 'succeeded',
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ])

  res.json({
    success: true,
    data: {
      totalPayments,
      successfulPayments,
      pendingPayments,
      failedPayments,
      totalRevenue,
      monthlyRevenue
    }
  })
})

// ============================================================================
// ADMIN-SPECIFIC CRUD ENDPOINTS FOR COURSES, PROJECTS, AND ALUMNI
// These endpoints ensure admin permissions and provide unfiltered access
// ============================================================================

// @desc    Create course for admin (admin-specific endpoint)
// @route   POST /api/admin/courses
// @access  Private/Admin
export const createCourseForAdmin = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('createCourseForAdmin', {
    adminId: req.admin?._id,
    adminEmail: req.admin?.email,
    bodyKeys: Object.keys(req.body),
    hasTitle: !!req.body.title
  })

  try {
    logger.debug('Admin creating course', {
      adminId: req.admin?._id,
      title: req.body.title
    })

    // Validate required fields
    const requiredFields = ['title', 'slug', 'description', 'shortDescription', 'price', 'duration', 'level', 'thumbnailUrl']
    const missingFields = requiredFields.filter(field => !req.body[field])
    
    if (missingFields.length > 0) {
      const error = new Error(`Missing required fields: ${missingFields.join(', ')}`)
      error.name = 'ValidationError'
      logger.error('Validation failed: missing required fields', error, {
        body: req.body,
        operation: 'createCourseForAdmin',
        model: 'Course',
        missingFields,
        requiredFields
      })
      throw error
    }

    // Validate instructor structure
    if (req.body.instructor && typeof req.body.instructor === 'object' && !req.body.instructor.name) {
      const error = new Error('Instructor object must have a name property')
      error.name = 'ValidationError'
      logger.error('Validation failed: invalid instructor structure', error, {
        instructor: req.body.instructor,
        operation: 'createCourseForAdmin',
        model: 'Course'
      })
      throw error
    }

    logger.dbOperation('create', 'Course', { 
      title: req.body.title,
      slug: req.body.slug,
      hasInstructor: !!req.body.instructor
    })
    const course = await Course.create(req.body)
    
    const duration = Date.now() - startTime
    logger.success('Admin course created successfully', {
      adminId: req.admin?._id,
      courseId: course._id,
      title: course.title,
      duration: `${duration}ms`
    })
    logger.functionExit('createCourseForAdmin', {
      success: true,
      adminId: req.admin?._id,
      courseId: course._id,
      duration: `${duration}ms`
    })

    res.status(201).json({
      success: true,
      data: course,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Admin course creation failed', error, {
      adminId: req.admin?._id,
      body: req.body,
      operation: 'createCourseForAdmin',
      model: 'Course',
      duration: `${duration}ms`
    })
    logger.functionExit('createCourseForAdmin', {
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Update course for admin (admin-specific endpoint)
// @route   PUT /api/admin/courses/:id
// @access  Private/Admin
export const updateCourseForAdmin = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('updateCourseForAdmin', {
    adminId: req.admin?._id,
    adminEmail: req.admin?.email,
    courseId: req.params.id,
    bodyKeys: Object.keys(req.body)
  })

  try {
    logger.debug('Admin updating course', {
      adminId: req.admin?._id,
      courseId: req.params.id,
      fieldsToUpdate: Object.keys(req.body)
    })

    logger.dbOperation('findByIdAndUpdate', 'Course', { id: req.params.id, updateFields: Object.keys(req.body) })
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )

    if (!course) {
      const duration = Date.now() - startTime
      logger.warn('Course not found for update', {
        adminId: req.admin?._id,
        courseId: req.params.id,
        duration: `${duration}ms`
      })
      logger.functionExit('updateCourseForAdmin', {
        success: false,
        found: false,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      })
    }

    const duration = Date.now() - startTime
    logger.success('Admin course updated successfully', {
      adminId: req.admin?._id,
      courseId: course._id,
      title: course.title,
      updatedFields: Object.keys(req.body),
      duration: `${duration}ms`
    })
    logger.functionExit('updateCourseForAdmin', {
      success: true,
      adminId: req.admin?._id,
      courseId: course._id,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      data: course,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Admin course update failed', error, {
      adminId: req.admin?._id,
      courseId: req.params.id,
      body: req.body,
      operation: 'updateCourseForAdmin',
      model: 'Course',
      duration: `${duration}ms`
    })
    logger.functionExit('updateCourseForAdmin', {
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Delete course for admin (admin-specific endpoint)
// @route   DELETE /api/admin/courses/:id
// @access  Private/Admin
export const deleteCourseForAdmin = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('deleteCourseForAdmin', {
    adminId: req.admin?._id,
    adminEmail: req.admin?.email,
    courseId: req.params.id
  })

  try {
    logger.debug('Admin deleting course', {
      adminId: req.admin?._id,
      courseId: req.params.id
    })

    logger.dbOperation('findByIdAndDelete', 'Course', req.params.id)
    const course = await Course.findByIdAndDelete(req.params.id)

    if (!course) {
      const duration = Date.now() - startTime
      logger.warn('Course not found for deletion', {
        adminId: req.admin?._id,
        courseId: req.params.id,
        duration: `${duration}ms`
      })
      logger.functionExit('deleteCourseForAdmin', {
        success: false,
        found: false,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      })
    }

    const duration = Date.now() - startTime
    logger.success('Admin course deleted successfully', {
      adminId: req.admin?._id,
      courseId: req.params.id,
      title: course.title,
      duration: `${duration}ms`
    })
    logger.functionExit('deleteCourseForAdmin', {
      success: true,
      adminId: req.admin?._id,
      courseId: req.params.id,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      message: 'Course deleted successfully',
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Admin course deletion failed', error, {
      adminId: req.admin?._id,
      courseId: req.params.id,
      operation: 'deleteCourseForAdmin',
      model: 'Course',
      duration: `${duration}ms`
    })
    logger.functionExit('deleteCourseForAdmin', {
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Create project for admin (admin-specific endpoint)
// @route   POST /api/admin/projects
// @access  Private/Admin
export const createProjectForAdmin = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('createProjectForAdmin', {
    adminId: req.admin?._id,
    adminEmail: req.admin?.email,
    bodyKeys: Object.keys(req.body),
    hasTitle: !!req.body.title
  })

  try {
    logger.debug('Admin creating project', {
      adminId: req.admin?._id,
      title: req.body.title,
      studentName: req.body.studentName
    })

    logger.dbOperation('create', 'Project', { title: req.body.title, studentName: req.body.studentName })
    const project = await Project.create(req.body)
    
    const duration = Date.now() - startTime
    logger.success('Admin project created successfully', {
      adminId: req.admin?._id,
      projectId: project._id,
      title: project.title,
      duration: `${duration}ms`
    })
    logger.functionExit('createProjectForAdmin', {
      success: true,
      adminId: req.admin?._id,
      projectId: project._id,
      duration: `${duration}ms`
    })

    res.status(201).json({
      success: true,
      data: project,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Admin project creation failed', error, {
      adminId: req.admin?._id,
      body: req.body,
      operation: 'createProjectForAdmin',
      model: 'Project',
      duration: `${duration}ms`
    })
    logger.functionExit('createProjectForAdmin', {
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Update project for admin (admin-specific endpoint)
// @route   PUT /api/admin/projects/:id
// @access  Private/Admin
export const updateProjectForAdmin = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('updateProjectForAdmin', {
    adminId: req.admin?._id,
    adminEmail: req.admin?.email,
    projectId: req.params.id,
    bodyKeys: Object.keys(req.body)
  })

  try {
    logger.debug('Admin updating project', {
      adminId: req.admin?._id,
      projectId: req.params.id,
      fieldsToUpdate: Object.keys(req.body)
    })

    logger.dbOperation('findByIdAndUpdate', 'Project', { id: req.params.id, updateFields: Object.keys(req.body) })
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )

    if (!project) {
      const duration = Date.now() - startTime
      logger.warn('Project not found for update', {
        adminId: req.admin?._id,
        projectId: req.params.id,
        duration: `${duration}ms`
      })
      logger.functionExit('updateProjectForAdmin', {
        success: false,
        found: false,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      })
    }

    const duration = Date.now() - startTime
    logger.success('Admin project updated successfully', {
      adminId: req.admin?._id,
      projectId: project._id,
      title: project.title,
      updatedFields: Object.keys(req.body),
      duration: `${duration}ms`
    })
    logger.functionExit('updateProjectForAdmin', {
      success: true,
      adminId: req.admin?._id,
      projectId: project._id,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      data: project,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Admin project update failed', error, {
      adminId: req.admin?._id,
      projectId: req.params.id,
      body: req.body,
      operation: 'updateProjectForAdmin',
      model: 'Project',
      duration: `${duration}ms`
    })
    logger.functionExit('updateProjectForAdmin', {
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Delete project for admin (admin-specific endpoint)
// @route   DELETE /api/admin/projects/:id
// @access  Private/Admin
export const deleteProjectForAdmin = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('deleteProjectForAdmin', {
    adminId: req.admin?._id,
    adminEmail: req.admin?.email,
    projectId: req.params.id
  })

  try {
    logger.debug('Admin deleting project', {
      adminId: req.admin?._id,
      projectId: req.params.id
    })

    logger.dbOperation('findByIdAndDelete', 'Project', req.params.id)
    const project = await Project.findByIdAndDelete(req.params.id)

    if (!project) {
      const duration = Date.now() - startTime
      logger.warn('Project not found for deletion', {
        adminId: req.admin?._id,
        projectId: req.params.id,
        duration: `${duration}ms`
      })
      logger.functionExit('deleteProjectForAdmin', {
        success: false,
        found: false,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      })
    }

    const duration = Date.now() - startTime
    logger.success('Admin project deleted successfully', {
      adminId: req.admin?._id,
      projectId: req.params.id,
      title: project.title,
      duration: `${duration}ms`
    })
    logger.functionExit('deleteProjectForAdmin', {
      success: true,
      adminId: req.admin?._id,
      projectId: req.params.id,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      message: 'Project deleted successfully',
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Admin project deletion failed', error, {
      adminId: req.admin?._id,
      projectId: req.params.id,
      operation: 'deleteProjectForAdmin',
      model: 'Project',
      duration: `${duration}ms`
    })
    logger.functionExit('deleteProjectForAdmin', {
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Get all alumni for admin (no isApproved filter)
// @route   GET /api/admin/alumni
// @access  Private/Admin
export const getAllAlumniForAdmin = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('getAllAlumniForAdmin', {
    query: req.query,
    adminId: req.admin?._id,
    adminEmail: req.admin?.email
  })

  try {
    const {
      page = 1,
      limit = 50,
      search,
      sort = 'createdAt',
      order = 'desc',
    } = req.query

    logger.debug('Processing query parameters', {
      page,
      limit,
      search,
      sort,
      order
    })

    // Build query - NO isApproved filter (admin sees all)
    let query = {}

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
      ]
      logger.debug('Search query built', { searchTerm: search, queryPattern: query.$or })
    }

    const sortOrder = order === 'desc' ? -1 : 1
    const sortObj = { [sort]: sortOrder }

    logger.dbOperation('find', 'Alumni', query)
    const alumni = await Alumni.find(query)
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean()

    logger.dbOperation('countDocuments', 'Alumni', query)
    const total = await Alumni.countDocuments(query)

    const duration = Date.now() - startTime
    logger.success('Alumni fetched successfully for admin', {
      count: alumni.length,
      total,
      page,
      limit,
      duration: `${duration}ms`
    })
    logger.functionExit('getAllAlumniForAdmin', {
      count: alumni.length,
      total,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      count: alumni.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: alumni,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to fetch alumni for admin', error, {
      query: req.query,
      adminId: req.admin?._id,
      duration: `${duration}ms`
    })
    logger.functionExit('getAllAlumniForAdmin', {
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Get single alumni for admin (no isApproved filter)
// @route   GET /api/admin/alumni/:id
// @access  Private/Admin
export const getAlumniForAdmin = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('getAlumniForAdmin', {
    alumniId: req.params.id,
    adminId: req.admin?._id,
    adminEmail: req.admin?.email
  })

  try {
    const { id } = req.params
    
    logger.debug('Fetching alumni by ID for admin', { alumniId: id })
    logger.dbOperation('findById', 'Alumni', { _id: id })
    
    const alumni = await Alumni.findById(id)
    
    if (!alumni) {
      logger.warn('Alumni not found', {
        alumniId: id,
        adminId: req.admin?._id
      })
      
      const duration = Date.now() - startTime
      logger.functionExit('getAlumniForAdmin', {
        success: false,
        reason: 'Alumni not found',
        duration: `${duration}ms`
      })
      
      return res.status(404).json({
        success: false,
        message: 'Alumni not found',
      })
    }
    
    const duration = Date.now() - startTime
    logger.success('Alumni fetched successfully for admin', {
      alumniId: id,
      name: alumni.name,
      isApproved: alumni.isApproved,
      duration: `${duration}ms`
    })
    logger.functionExit('getAlumniForAdmin', {
      success: true,
      alumniId: id,
      duration: `${duration}ms`
    })
    
    res.json({
      success: true,
      data: alumni,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to fetch alumni for admin', error, {
      alumniId: req.params.id,
      adminId: req.admin?._id,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Create alumni for admin (admin-specific endpoint)
// @route   POST /api/admin/alumni
// @access  Private/Admin
export const createAlumniForAdmin = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('createAlumniForAdmin', {
    adminId: req.admin?._id,
    adminEmail: req.admin?.email,
    bodyKeys: Object.keys(req.body),
    hasName: !!req.body.name
  })

  try {
    logger.debug('Admin creating alumni', {
      adminId: req.admin?._id,
      name: req.body.name,
      email: req.body.email
    })

    logger.dbOperation('create', 'Alumni', { name: req.body.name, email: req.body.email })
    const alumni = await Alumni.create(req.body)
    
    const duration = Date.now() - startTime
    logger.success('Admin alumni created successfully', {
      adminId: req.admin?._id,
      alumniId: alumni._id,
      name: alumni.name,
      duration: `${duration}ms`
    })
    logger.functionExit('createAlumniForAdmin', {
      success: true,
      adminId: req.admin?._id,
      alumniId: alumni._id,
      duration: `${duration}ms`
    })

    res.status(201).json({
      success: true,
      data: alumni,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Admin alumni creation failed', error, {
      adminId: req.admin?._id,
      body: req.body,
      operation: 'createAlumniForAdmin',
      model: 'Alumni',
      duration: `${duration}ms`
    })
    logger.functionExit('createAlumniForAdmin', {
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Update alumni for admin (admin-specific endpoint)
// @route   PUT /api/admin/alumni/:id
// @access  Private/Admin
export const updateAlumniForAdmin = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('updateAlumniForAdmin', {
    adminId: req.admin?._id,
    adminEmail: req.admin?.email,
    alumniId: req.params.id,
    bodyKeys: Object.keys(req.body)
  })

  try {
    logger.debug('Admin updating alumni', {
      adminId: req.admin?._id,
      alumniId: req.params.id,
      fieldsToUpdate: Object.keys(req.body)
    })

    logger.dbOperation('findByIdAndUpdate', 'Alumni', { id: req.params.id, updateFields: Object.keys(req.body) })
    const alumni = await Alumni.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )

    if (!alumni) {
      const duration = Date.now() - startTime
      logger.warn('Alumni not found for update', {
        adminId: req.admin?._id,
        alumniId: req.params.id,
        duration: `${duration}ms`
      })
      logger.functionExit('updateAlumniForAdmin', {
        success: false,
        found: false,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'Alumni profile not found',
      })
    }

    const duration = Date.now() - startTime
    logger.success('Admin alumni updated successfully', {
      adminId: req.admin?._id,
      alumniId: alumni._id,
      name: alumni.name,
      updatedFields: Object.keys(req.body),
      duration: `${duration}ms`
    })
    logger.functionExit('updateAlumniForAdmin', {
      success: true,
      adminId: req.admin?._id,
      alumniId: alumni._id,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      data: alumni,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Admin alumni update failed', error, {
      adminId: req.admin?._id,
      alumniId: req.params.id,
      body: req.body,
      operation: 'updateAlumniForAdmin',
      model: 'Alumni',
      duration: `${duration}ms`
    })
    logger.functionExit('updateAlumniForAdmin', {
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Delete alumni for admin (admin-specific endpoint)
// @route   DELETE /api/admin/alumni/:id
// @access  Private/Admin
export const deleteAlumniForAdmin = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('deleteAlumniForAdmin', {
    adminId: req.admin?._id,
    adminEmail: req.admin?.email,
    alumniId: req.params.id
  })

  try {
    logger.debug('Admin deleting alumni', {
      adminId: req.admin?._id,
      alumniId: req.params.id
    })

    logger.dbOperation('findByIdAndDelete', 'Alumni', req.params.id)
    const alumni = await Alumni.findByIdAndDelete(req.params.id)

    if (!alumni) {
      const duration = Date.now() - startTime
      logger.warn('Alumni not found for deletion', {
        adminId: req.admin?._id,
        alumniId: req.params.id,
        duration: `${duration}ms`
      })
      logger.functionExit('deleteAlumniForAdmin', {
        success: false,
        found: false,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'Alumni profile not found',
      })
    }

    const duration = Date.now() - startTime
    logger.success('Admin alumni deleted successfully', {
      adminId: req.admin?._id,
      alumniId: req.params.id,
      name: alumni.name,
      duration: `${duration}ms`
    })
    logger.functionExit('deleteAlumniForAdmin', {
      success: true,
      adminId: req.admin?._id,
      alumniId: req.params.id,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      message: 'Alumni profile deleted successfully',
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Admin alumni deletion failed', error, {
      adminId: req.admin?._id,
      alumniId: req.params.id,
      operation: 'deleteAlumniForAdmin',
      model: 'Alumni',
      duration: `${duration}ms`
    })
    logger.functionExit('deleteAlumniForAdmin', {
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Forgot password (Admin)
// @route   POST /api/admin/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('forgotPassword', { 
    email: req.body.email
  })
  
  try {
    const { email } = req.body

    logger.debug('Processing admin forgot password request', { email })

    logger.dbOperation('findOne', 'Admin', { email })
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() })
    
    if (!admin) {
      const duration = Date.now() - startTime
      logger.warn('Forgot password - admin not found', { 
        email,
        duration: `${duration}ms`
      })
      logger.functionExit('forgotPassword', { 
        success: false,
        adminNotFound: true,
        duration: `${duration}ms`
      })
      // Don't reveal if admin exists or not for security
      return res.json({
        success: true,
        message: 'If an admin account exists with this email, a password reset link has been sent.',
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpires = Date.now() + 10 * 60 * 1000 // 10 minutes

    logger.debug('Generating password reset token for admin', {
      adminId: admin._id,
      tokenExpires: new Date(resetExpires).toISOString()
    })

    admin.passwordResetToken = resetToken
    admin.passwordResetExpires = resetExpires
    logger.dbOperation('save', 'Admin', { id: admin._id, operation: 'setPasswordResetToken' })
    await admin.save()

    // In a real application, you would send an email here
    // For development, we'll return the token (remove this in production)
    const duration = Date.now() - startTime
    logger.success('Password reset token generated for admin', { 
      adminId: admin._id,
      email,
      duration: `${duration}ms`
    })
    logger.functionExit('forgotPassword', { 
      success: true,
      adminId: admin._id,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      message: 'If an admin account exists with this email, a password reset link has been sent.',
      // Remove this in production - only for development
      data: process.env.NODE_ENV === 'development' ? {
        resetToken,
      } : undefined,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to process admin forgot password', error, {
      email: req.body.email,
      operation: 'forgotPassword',
      model: 'Admin',
      duration: `${duration}ms`
    })
    logger.functionExit('forgotPassword', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Reset password (Admin)
// @route   POST /api/admin/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('resetPassword', { 
    hasToken: !!req.body.token,
    hasPassword: !!req.body.password
  })
  
  try {
    const { token, password } = req.body

    logger.debug('Processing admin password reset', {
      hasToken: !!token,
      hasPassword: !!password
    })

    // Find admin with valid reset token
    logger.dbOperation('findOne', 'Admin', { passwordResetToken: token })
    const admin = await Admin.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    })

    if (!admin) {
      const duration = Date.now() - startTime
      logger.warn('Admin password reset failed - invalid or expired token', { 
        hasToken: !!token,
        duration: `${duration}ms`
      })
      logger.functionExit('resetPassword', { 
        success: false,
        invalidToken: true,
        duration: `${duration}ms`
      })
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      })
    }

    logger.debug('Resetting admin password and clearing tokens', {
      adminId: admin._id
    })

    // Update password and clear reset token
    admin.password = password
    admin.passwordResetToken = undefined
    admin.passwordResetExpires = undefined
    admin.refreshTokens = [] // Remove all refresh tokens for security
    logger.dbOperation('save', 'Admin', { id: admin._id, operation: 'resetPassword' })
    await admin.save()

    const duration = Date.now() - startTime
    logger.success('Admin password reset successfully', { 
      adminId: admin._id,
      duration: `${duration}ms`
    })
    logger.functionExit('resetPassword', { 
      success: true,
      adminId: admin._id,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      message: 'Password reset successfully. Please login with your new password.',
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to reset admin password', error, {
      hasToken: !!req.body.token,
      operation: 'resetPassword',
      model: 'Admin',
      duration: `${duration}ms`
    })
    logger.functionExit('resetPassword', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})