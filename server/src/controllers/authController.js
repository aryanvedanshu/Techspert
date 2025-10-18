import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User from '../models/User.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  )
  
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
  
  return { accessToken, refreshToken }
}

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'student' } = req.body

  // Check if user already exists
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email',
    })
  }

  // Generate email verification token
  const emailVerificationToken = crypto.randomBytes(32).toString('hex')
  const emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
    emailVerificationToken,
    emailVerificationExpires,
  })

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id)

  // Save refresh token
  user.refreshTokens.push({ token: refreshToken })
  await user.save()

  // Remove sensitive data
  const userResponse = user.toObject()
  delete userResponse.password
  delete userResponse.emailVerificationToken
  delete userResponse.emailVerificationExpires
  delete userResponse.refreshTokens

  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please verify your email.',
    data: {
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken,
      },
    },
  })
})

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // Find user and include password
  const user = await User.findOne({ email }).select('+password')
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    })
  }

  // Check if account is locked
  if (user.isLocked) {
    return res.status(401).json({
      success: false,
      message: 'Account is temporarily locked due to multiple failed login attempts',
    })
  }

  // Check if account is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Account is deactivated',
    })
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password)
  
  if (!isPasswordValid) {
    // Increment login attempts
    await user.incLoginAttempts()
    
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    })
  }

  // Reset login attempts and update last login
  await user.resetLoginAttempts()

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id)

  // Save refresh token
  user.refreshTokens.push({ token: refreshToken })
  await user.save()

  // Remove sensitive data
  const userResponse = user.toObject()
  delete userResponse.password
  delete userResponse.refreshTokens

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken,
      },
    },
  })
})

// @desc    Refresh access token
// @route   POST /api/auth/refresh
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
    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    )

    // Find user and check if refresh token exists
    const user = await User.findById(decoded.id)
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      })
    }

    // Check if refresh token exists in user's tokens
    const tokenExists = user.refreshTokens.some(tokenObj => tokenObj.token === refreshToken)
    
    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      })
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id)

    // Remove old refresh token and add new one
    user.refreshTokens = user.refreshTokens.filter(tokenObj => tokenObj.token !== refreshToken)
    user.refreshTokens.push({ token: newRefreshToken })
    await user.save()

    res.json({
      success: true,
      data: {
        tokens: {
          accessToken,
          refreshToken: newRefreshToken,
        },
      },
    })
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      })
    }
    throw error
  }
})

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body
  const userId = req.user._id

  if (refreshToken) {
    // Remove specific refresh token
    await User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: { token: refreshToken } }
    })
  } else {
    // Remove all refresh tokens (logout from all devices)
    await User.findByIdAndUpdate(userId, {
      $set: { refreshTokens: [] }
    })
  }

  res.json({
    success: true,
    message: 'Logout successful',
  })
})

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('enrolledCourses.course', 'title thumbnailUrl')
    .populate('certificates.course', 'title')

  res.json({
    success: true,
    data: user,
  })
})

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, location, website, socialLinks } = req.body
  const userId = req.user._id

  const user = await User.findByIdAndUpdate(
    userId,
    {
      name,
      bio,
      location,
      website,
      socialLinks,
    },
    {
      new: true,
      runValidators: true,
    }
  )

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: user,
  })
})

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const userId = req.user._id

  // Find user with password
  const user = await User.findById(userId).select('+password')
  
  // Check current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword)
  
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect',
    })
  }

  // Update password
  user.password = newPassword
  await user.save()

  // Remove all refresh tokens to force re-login
  user.refreshTokens = []
  await user.save()

  res.json({
    success: true,
    message: 'Password changed successfully. Please login again.',
  })
})

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body

  const user = await User.findOne({ email })
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    })
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex')
  const resetExpires = Date.now() + 10 * 60 * 1000 // 10 minutes

  user.passwordResetToken = resetToken
  user.passwordResetExpires = resetExpires
  await user.save()

  // In a real application, you would send an email here
  // For now, we'll just return the token (remove this in production)
  res.json({
    success: true,
    message: 'Password reset token generated',
    data: {
      resetToken, // Remove this in production
    },
  })
})

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body

  // Find user with valid reset token
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  })

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token',
    })
  }

  // Update password and clear reset token
  user.password = password
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  user.refreshTokens = [] // Remove all refresh tokens
  await user.save()

  res.json({
    success: true,
    message: 'Password reset successfully',
  })
})

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body

  // Find user with valid verification token
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() },
  })

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired verification token',
    })
  }

  // Mark email as verified
  user.isEmailVerified = true
  user.emailVerificationToken = undefined
  user.emailVerificationExpires = undefined
  await user.save()

  res.json({
    success: true,
    message: 'Email verified successfully',
  })
})

// @desc    Resend email verification
// @route   POST /api/auth/resend-verification
// @access  Private
export const resendVerification = asyncHandler(async (req, res) => {
  const userId = req.user._id

  const user = await User.findById(userId)
  
  if (user.isEmailVerified) {
    return res.status(400).json({
      success: false,
      message: 'Email is already verified',
    })
  }

  // Generate new verification token
  const emailVerificationToken = crypto.randomBytes(32).toString('hex')
  const emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

  user.emailVerificationToken = emailVerificationToken
  user.emailVerificationExpires = emailVerificationExpires
  await user.save()

  // In a real application, you would send an email here
  res.json({
    success: true,
    message: 'Verification email sent',
  })
})
