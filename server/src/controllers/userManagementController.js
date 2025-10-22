import { asyncHandler } from '../middleware/errorHandler.js'
import User from '../models/User.js'
import Enrollment from '../models/Enrollment.js'
import bcrypt from 'bcryptjs'

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  console.log("[DEBUG: userManagementController.js:getAllUsers:8] Fetching all users")

  try {
    const { page = 1, limit = 20, role, isActive } = req.query
    const query = {}

    if (role && role !== 'all') {
      query.role = role
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true'
    }

    const users = await User.find(query)
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await User.countDocuments(query)

    console.log("[DEBUG: userManagementController.js:getAllUsers:success] Users fetched:", users.length, "of", total)

    res.json({
      success: true,
      count: users.length,
      total,
      data: users
    })
  } catch (error) {
    console.error("[DEBUG: userManagementController.js:getAllUsers:error] Error fetching users:", error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    })
  }
})

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
  console.log("[DEBUG: userManagementController.js:getUserById:8] Fetching user by ID:", req.params.id)

  try {
    const user = await User.findById(req.params.id)
      .select('-password -refreshTokens')
      .populate('enrolledCourses.course', 'title price')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    console.log("[DEBUG: userManagementController.js:getUserById:success] User fetched:", user.email)

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error("[DEBUG: userManagementController.js:getUserById:error] Error fetching user:", error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    })
  }
})

// @desc    Create new user
// @route   POST /api/admin/users
// @access  Private/Admin
export const createUser = asyncHandler(async (req, res) => {
  console.log("[DEBUG: userManagementController.js:createUser:8] Creating new user")

  try {
    const { name, email, password, role = 'student', isActive = true, profile = {} } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      })
    }

    // Hash password if provided
    let hashedPassword
    if (password) {
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

    const user = await User.create(userData)

    // Remove password from response
    const userResponse = user.toObject()
    delete userResponse.password
    delete userResponse.refreshTokens

    console.log("[DEBUG: userManagementController.js:createUser:success] User created:", user.email)

    res.status(201).json({
      success: true,
      data: userResponse
    })
  } catch (error) {
    console.error("[DEBUG: userManagementController.js:createUser:error] Error creating user:", error)
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    })
  }
})

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
  console.log("[DEBUG: userManagementController.js:updateUser:8] Updating user:", req.params.id)

  try {
    const { password, ...updateData } = req.body

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12)
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -refreshTokens')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    console.log("[DEBUG: userManagementController.js:updateUser:success] User updated:", user.email)

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error("[DEBUG: userManagementController.js:updateUser:error] Error updating user:", error)
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    })
  }
})

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  console.log("[DEBUG: userManagementController.js:deleteUser:8] Deleting user:", req.params.id)

  try {
    const user = await User.findByIdAndDelete(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    console.log("[DEBUG: userManagementController.js:deleteUser:success] User deleted:", user.email)

    res.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error("[DEBUG: userManagementController.js:deleteUser:error] Error deleting user:", error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    })
  }
})

// @desc    Toggle user status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private/Admin
export const toggleUserStatus = asyncHandler(async (req, res) => {
  console.log("[DEBUG: userManagementController.js:toggleUserStatus:8] Toggling user status:", req.params.id)

  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    user.isActive = !user.isActive
    await user.save()

    console.log("[DEBUG: userManagementController.js:toggleUserStatus:success] User status toggled:", user.email, "to", user.isActive)

    res.json({
      success: true,
      data: {
        id: user._id,
        isActive: user.isActive
      }
    })
  } catch (error) {
    console.error("[DEBUG: userManagementController.js:toggleUserStatus:error] Error toggling user status:", error)
    res.status(500).json({
      success: false,
      message: 'Failed to toggle user status'
    })
  }
})

// @desc    Get user enrollments
// @route   GET /api/admin/users/:id/enrollments
// @access  Private/Admin
export const getUserEnrollments = asyncHandler(async (req, res) => {
  console.log("[DEBUG: userManagementController.js:getUserEnrollments:8] Fetching user enrollments:", req.params.id)

  try {
    const enrollments = await Enrollment.find({ user: req.params.id })
      .populate('course', 'title price thumbnailUrl')
      .sort({ enrolledAt: -1 })

    console.log("[DEBUG: userManagementController.js:getUserEnrollments:success] User enrollments fetched:", enrollments.length)

    res.json({
      success: true,
      count: enrollments.length,
      data: enrollments
    })
  } catch (error) {
    console.error("[DEBUG: userManagementController.js:getUserEnrollments:error] Error fetching user enrollments:", error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user enrollments'
    })
  }
})

// @desc    Get user statistics
// @route   GET /api/admin/users/stats
// @access  Private/Admin
export const getUserStats = asyncHandler(async (req, res) => {
  console.log("[DEBUG: userManagementController.js:getUserStats:8] Fetching user statistics")

  try {
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

    console.log("[DEBUG: userManagementController.js:getUserStats:success] User statistics fetched")

    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error("[DEBUG: userManagementController.js:getUserStats:error] Error fetching user statistics:", error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics'
    })
  }
})
