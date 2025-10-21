import jwt from 'jsonwebtoken'
import Admin from '../models/Admin.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// @desc    Login admin
// @route   POST /api/admin/login
// @access  Public
export const loginAdmin = asyncHandler(async (req, res) => {
  console.log("[DEBUG: adminController.js:loginAdmin:8] Admin login attempt started")
  const { email, password } = req.body
  console.log("[DEBUG: adminController.js:loginAdmin:10] Login attempt for email:", email)

  // Validate input
  if (!email || !password) {
    console.log("[DEBUG: adminController.js:loginAdmin:validation:12] Missing email or password")
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password',
    })
  }

  // Find admin and include password
  console.log("[DEBUG: adminController.js:loginAdmin:db:20] Searching for admin in database")
  const admin = await Admin.findOne({ email }).select('+password')
  console.log("[DEBUG: adminController.js:loginAdmin:db:21] Admin found:", admin ? "Yes" : "No")

  if (!admin) {
    console.log("[DEBUG: adminController.js:loginAdmin:error:22] Admin not found for email:", email)
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    })
  }

  // Check if account is locked
  console.log("[DEBUG: adminController.js:loginAdmin:check:36] Checking if account is locked:", admin.isLocked)
  if (admin.isLocked) {
    console.log("[DEBUG: adminController.js:loginAdmin:error:36] Account is locked for email:", email)
    return res.status(401).json({
      success: false,
      message: 'Account is temporarily locked due to multiple failed login attempts',
    })
  }

  // Check if account is active
  console.log("[DEBUG: adminController.js:loginAdmin:check:44] Checking if account is active:", admin.isActive)
  if (!admin.isActive) {
    console.log("[DEBUG: adminController.js:loginAdmin:error:44] Account is deactivated for email:", email)
    return res.status(401).json({
      success: false,
      message: 'Account is deactivated',
    })
  }

  // Check password
  console.log("[DEBUG: adminController.js:loginAdmin:password:52] Validating password")
  const isPasswordValid = await admin.comparePassword(password)
  console.log("[DEBUG: adminController.js:loginAdmin:password:53] Password validation result:", isPasswordValid)

  if (!isPasswordValid) {
    console.log("[DEBUG: adminController.js:loginAdmin:error:54] Invalid password for email:", email)
    // Increment login attempts
    await admin.incLoginAttempts()
    console.log("[DEBUG: adminController.js:loginAdmin:attempts:56] Login attempts incremented")
    
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    })
  }

  // Reset login attempts on successful login
  console.log("[DEBUG: adminController.js:loginAdmin:success:73] Resetting login attempts for successful login")
  await admin.resetLoginAttempts()

  // Generate JWT token
  console.log("[DEBUG: adminController.js:loginAdmin:token:76] Generating JWT token")
  const token = jwt.sign(
    { id: admin._id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  )

  // Generate refresh token
  console.log("[DEBUG: adminController.js:loginAdmin:token:83] Generating refresh token")
  const refreshToken = jwt.sign(
    { id: admin._id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '30d' }
  )

  // Add refresh token to admin
  console.log("[DEBUG: adminController.js:loginAdmin:token:90] Adding refresh token to admin")
  admin.refreshTokens.push({ token: refreshToken })
  await admin.save()

  // Remove password from response
  console.log("[DEBUG: adminController.js:loginAdmin:response:94] Preparing admin data for response")
  const adminData = admin.toObject()
  delete adminData.password
  delete adminData.refreshTokens

  console.log("[DEBUG: adminController.js:loginAdmin:success:98] Login successful for email:", email)
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: adminData,
      tokens: {
        accessToken: token,
        refreshToken: refreshToken,
      },
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
  const admins = await Admin.find({ isActive: true })
    .select('-password -refreshTokens')
    .sort({ createdAt: -1 })

  res.json({
    success: true,
    count: admins.length,
    data: admins,
  })
})

// @desc    Create new admin
// @route   POST /api/admin/admins
// @access  Private/Super Admin
export const createAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.create(req.body)

  // Remove password from response
  const adminData = admin.toObject()
  delete adminData.password
  delete adminData.refreshTokens

  res.status(201).json({
    success: true,
    data: adminData,
  })
})

// @desc    Update admin
// @route   PUT /api/admin/admins/:id
// @access  Private/Super Admin
export const updateAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).select('-password -refreshTokens')

  if (!admin) {
    return res.status(404).json({
      success: false,
      message: 'Admin not found',
    })
  }

  res.json({
    success: true,
    data: admin,
  })
})

// @desc    Delete admin
// @route   DELETE /api/admin/admins/:id
// @access  Private/Super Admin
export const deleteAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  )

  if (!admin) {
    return res.status(404).json({
      success: false,
      message: 'Admin not found',
    })
  }

  res.json({
    success: true,
    message: 'Admin deactivated successfully',
  })
})

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private
export const getDashboardStats = asyncHandler(async (req, res) => {
  // This would typically aggregate data from all models
  // For now, we'll return mock data
  const stats = {
    totalCourses: 0,
    totalProjects: 0,
    totalAlumni: 0,
    totalStudents: 0,
    recentActivity: [],
  }

  res.json({
    success: true,
    data: stats,
  })
})