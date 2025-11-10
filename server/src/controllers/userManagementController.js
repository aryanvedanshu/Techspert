import { asyncHandler } from '../middleware/errorHandler.js'
import User from '../models/User.js'
import Enrollment from '../models/Enrollment.js'
import bcrypt from 'bcryptjs'
import logger from '../utils/logger.js'

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('getAllUsers', { 
    page: req.query.page,
    limit: req.query.limit,
    role: req.query.role,
    isActive: req.query.isActive
  })
  
  try {
    const { page = 1, limit = 20, role, isActive } = req.query
    const query = {}

    if (role && role !== 'all') {
      query.role = role
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true'
    }

    logger.dbOperation('find', 'User', query)
    const users = await User.find(query)
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    logger.dbOperation('countDocuments', 'User', query)
    const total = await User.countDocuments(query)

    const duration = Date.now() - startTime
    logger.success('Users fetched successfully', { 
      count: users.length,
      total,
      page: parseInt(page),
      duration: `${duration}ms`
    })
    logger.functionExit('getAllUsers', { 
      success: true,
      count: users.length,
      total,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      count: users.length,
      total,
      data: users
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to fetch users', error, {
      query: req.query,
      operation: 'getAllUsers',
      model: 'User',
      duration: `${duration}ms`
    })
    logger.functionExit('getAllUsers', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  const { id } = req.params
  logger.functionEntry('getUserById', { userId: id })
  
  try {
    logger.dbOperation('findById', 'User', id)
    const user = await User.findById(id)
      .select('-password -refreshTokens')
      .populate('enrolledCourses.course', 'title price')

    if (!user) {
      const duration = Date.now() - startTime
      logger.warn('User not found', { 
        userId: id,
        duration: `${duration}ms`
      })
      logger.functionExit('getUserById', { 
        success: false,
        found: false,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const duration = Date.now() - startTime
    logger.success('User fetched successfully', { 
      userId: user._id,
      email: user.email,
      role: user.role,
      duration: `${duration}ms`
    })
    logger.functionExit('getUserById', { 
      success: true,
      userId: user._id,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to fetch user', error, {
      userId: req.params.id,
      operation: 'getUserById',
      model: 'User',
      duration: `${duration}ms`
    })
    logger.functionExit('getUserById', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Create new user
// @route   POST /api/admin/users
// @access  Private/Admin
export const createUser = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('createUser', { 
    email: req.body.email,
    role: req.body.role || 'student',
    hasPassword: !!req.body.password
  })
  
  try {
    const { name, email, password, role = 'student', isActive = true, profile = {} } = req.body

    logger.debug('Creating new user', {
      name,
      email,
      role,
      isActive,
      hasPassword: !!password
    })

    // Check if user already exists
    logger.dbOperation('findOne', 'User', { email })
    const existingUser = await User.findOne({ email })
    
    if (existingUser) {
      const duration = Date.now() - startTime
      logger.warn('User already exists', { 
        email,
        existingUserId: existingUser._id,
        duration: `${duration}ms`
      })
      logger.functionExit('createUser', { 
        success: false,
        alreadyExists: true,
        duration: `${duration}ms`
      })
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      })
    }

    // Hash password if provided
    let hashedPassword
    if (password) {
      logger.debug('Hashing password')
      hashedPassword = await bcrypt.hash(password, 12)
    }

    const userData = {
      name,
      email,
      role,
      isActive,
      profile,
      ...(hashedPassword && { password: hashedPassword })
    }

    logger.dbOperation('create', 'User', { email, role })
    const user = await User.create(userData)

    // Remove password from response
    const userResponse = user.toObject()
    delete userResponse.password
    delete userResponse.refreshTokens

    const duration = Date.now() - startTime
    logger.success('User created successfully', { 
      userId: user._id,
      email: user.email,
      role: user.role,
      duration: `${duration}ms`
    })
    logger.functionExit('createUser', { 
      success: true,
      userId: user._id,
      duration: `${duration}ms`
    })

    res.status(201).json({
      success: true,
      data: userResponse
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to create user', error, {
      email: req.body.email,
      operation: 'createUser',
      model: 'User',
      duration: `${duration}ms`
    })
    logger.functionExit('createUser', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  const { id } = req.params
  logger.functionEntry('updateUser', { 
    userId: id,
    updateFields: Object.keys(req.body),
    hasPassword: !!req.body.password
  })
  
  try {
    const { password, ...updateData } = req.body

    logger.debug('Updating user', {
      userId: id,
      fieldsToUpdate: Object.keys(updateData),
      hasPassword: !!password
    })

    // Hash password if provided
    if (password) {
      logger.debug('Hashing new password')
      updateData.password = await bcrypt.hash(password, 12)
    }

    logger.dbOperation('findByIdAndUpdate', 'User', { id, updateFields: Object.keys(updateData) })
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -refreshTokens')

    if (!user) {
      const duration = Date.now() - startTime
      logger.warn('User not found for update', { 
        userId: id,
        duration: `${duration}ms`
      })
      logger.functionExit('updateUser', { 
        success: false,
        found: false,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const duration = Date.now() - startTime
    logger.success('User updated successfully', { 
      userId: user._id,
      email: user.email,
      updatedFields: Object.keys(updateData),
      duration: `${duration}ms`
    })
    logger.functionExit('updateUser', { 
      success: true,
      userId: user._id,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to update user', error, {
      userId: req.params.id,
      body: req.body,
      operation: 'updateUser',
      model: 'User',
      duration: `${duration}ms`
    })
    logger.functionExit('updateUser', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  const { id } = req.params
  logger.functionEntry('deleteUser', { userId: id })
  
  try {
    logger.dbOperation('findByIdAndDelete', 'User', id)
    const user = await User.findByIdAndDelete(id)

    if (!user) {
      const duration = Date.now() - startTime
      logger.warn('User not found for deletion', { 
        userId: id,
        duration: `${duration}ms`
      })
      logger.functionExit('deleteUser', { 
        success: false,
        found: false,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const duration = Date.now() - startTime
    logger.success('User deleted successfully', { 
      userId: id,
      email: user.email,
      duration: `${duration}ms`
    })
    logger.functionExit('deleteUser', { 
      success: true,
      userId: id,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to delete user', error, {
      userId: req.params.id,
      operation: 'deleteUser',
      model: 'User',
      duration: `${duration}ms`
    })
    logger.functionExit('deleteUser', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Toggle user status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private/Admin
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  const { id } = req.params
  logger.functionEntry('toggleUserStatus', { userId: id })
  
  try {
    logger.dbOperation('findById', 'User', id)
    const user = await User.findById(id)

    if (!user) {
      const duration = Date.now() - startTime
      logger.warn('User not found for status toggle', { 
        userId: id,
        duration: `${duration}ms`
      })
      logger.functionExit('toggleUserStatus', { 
        success: false,
        found: false,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const oldStatus = user.isActive
    user.isActive = !user.isActive
    
    logger.debug('Toggling user status', {
      userId: id,
      oldStatus,
      newStatus: user.isActive
    })

    logger.dbOperation('save', 'User', { id, operation: 'toggleStatus' })
    await user.save()

    const duration = Date.now() - startTime
    logger.success('User status toggled successfully', { 
      userId: user._id,
      email: user.email,
      oldStatus,
      newStatus: user.isActive,
      duration: `${duration}ms`
    })
    logger.functionExit('toggleUserStatus', { 
      success: true,
      userId: user._id,
      newStatus: user.isActive,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      data: {
        id: user._id,
        isActive: user.isActive
      }
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to toggle user status', error, {
      userId: req.params.id,
      operation: 'toggleUserStatus',
      model: 'User',
      duration: `${duration}ms`
    })
    logger.functionExit('toggleUserStatus', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Get user enrollments
// @route   GET /api/admin/users/:id/enrollments
// @access  Private/Admin
export const getUserEnrollments = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  const { id } = req.params
  logger.functionEntry('getUserEnrollments', { userId: id })
  
  try {
    logger.dbOperation('find', 'Enrollment', { user: id })
    const enrollments = await Enrollment.find({ user: id })
      .populate('course', 'title price thumbnailUrl')
      .sort({ enrolledAt: -1 })

    const duration = Date.now() - startTime
    logger.success('User enrollments fetched successfully', { 
      userId: id,
      count: enrollments.length,
      duration: `${duration}ms`
    })
    logger.functionExit('getUserEnrollments', { 
      success: true,
      userId: id,
      count: enrollments.length,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      count: enrollments.length,
      data: enrollments
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to fetch user enrollments', error, {
      userId: req.params.id,
      operation: 'getUserEnrollments',
      model: 'Enrollment',
      duration: `${duration}ms`
    })
    logger.functionExit('getUserEnrollments', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Get user statistics
// @route   GET /api/admin/users/stats
// @access  Private/Admin
export const getUserStats = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('getUserStats')
  
  try {
    logger.debug('Fetching user statistics')
    
    logger.dbOperation('countDocuments', 'User', {})
    const [
      totalUsers,
      activeUsers,
      students,
      instructors,
      admins,
      recentUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'instructor' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
      })
    ])

    const stats = {
      totalUsers,
      activeUsers,
      students,
      instructors,
      admins,
      recentUsers
    }

    const duration = Date.now() - startTime
    logger.success('User statistics fetched successfully', { 
      totalUsers,
      activeUsers,
      students,
      instructors,
      admins,
      recentUsers,
      duration: `${duration}ms`
    })
    logger.functionExit('getUserStats', { 
      success: true,
      totalUsers,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to fetch user statistics', error, {
      operation: 'getUserStats',
      model: 'User',
      duration: `${duration}ms`
    })
    logger.functionExit('getUserStats', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})
