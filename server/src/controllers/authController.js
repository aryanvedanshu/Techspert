import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User from '../models/User.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import logger from '../utils/logger.js'

// Generate JWT tokens
const generateTokens = (userId) => {
  logger.functionEntry('generateTokens', { userId })
  
  try {
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
    
    logger.debug('Tokens generated successfully', {
      userId,
      accessTokenExpires: process.env.JWT_EXPIRE || '15m',
      refreshTokenExpires: '7d'
    })
    logger.functionExit('generateTokens', { success: true, userId })
    
    return { accessToken, refreshToken }
  } catch (error) {
    logger.error('Failed to generate tokens', error, {
      userId,
      operation: 'generateTokens'
    })
    logger.functionExit('generateTokens', { success: false, error: error.message })
    throw error
  }
}

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('register', { 
    email: req.body.email,
    role: req.body.role || 'student',
    hasPassword: !!req.body.password
  })
  
  try {
    const { name, email, password, role = 'student' } = req.body

    logger.debug('Registering new user', {
      name,
      email,
      role,
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
      logger.functionExit('register', { 
        success: false,
        alreadyExists: true,
        duration: `${duration}ms`
      })
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      })
    }

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex')
    const emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

    logger.debug('Creating user with email verification', {
      email,
      role,
      hasVerificationToken: !!emailVerificationToken
    })

    // Create user
    logger.dbOperation('create', 'User', { email, role })
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
    logger.dbOperation('save', 'User', { id: user._id, operation: 'addRefreshToken' })
    user.refreshTokens.push({ token: refreshToken })
    await user.save()

    // Remove sensitive data
    const userResponse = user.toObject()
    delete userResponse.password
    delete userResponse.emailVerificationToken
    delete userResponse.emailVerificationExpires
    delete userResponse.refreshTokens

    const duration = Date.now() - startTime
    logger.success('User registered successfully', { 
      userId: user._id,
      email: user.email,
      role: user.role,
      duration: `${duration}ms`
    })
    logger.functionExit('register', { 
      success: true,
      userId: user._id,
      duration: `${duration}ms`
    })

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
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to register user', error, {
      email: req.body.email,
      operation: 'register',
      model: 'User',
      duration: `${duration}ms`
    })
    logger.functionExit('register', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('login', { 
    email: req.body.email,
    hasPassword: !!req.body.password
  })
  
  try {
    const { email, password } = req.body

    logger.debug('Attempting user login', {
      email,
      hasPassword: !!password
    })

    // Find user and include password
    logger.dbOperation('findOne', 'User', { email })
    const user = await User.findOne({ email }).select('+password')
    
    if (!user) {
      const duration = Date.now() - startTime
      logger.warn('Login failed - user not found', { 
        email,
        duration: `${duration}ms`
      })
      logger.functionExit('login', { 
        success: false,
        userNotFound: true,
        duration: `${duration}ms`
      })
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    // Check if account is locked
    if (user.isLocked) {
      const duration = Date.now() - startTime
      logger.warn('Login failed - account locked', { 
        userId: user._id,
        email,
        isLocked: user.isLocked,
        duration: `${duration}ms`
      })
      logger.functionExit('login', { 
        success: false,
        accountLocked: true,
        duration: `${duration}ms`
      })
      return res.status(401).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts',
      })
    }

    // Check if account is active
    if (!user.isActive) {
      const duration = Date.now() - startTime
      logger.warn('Login failed - account deactivated', { 
        userId: user._id,
        email,
        isActive: user.isActive,
        duration: `${duration}ms`
      })
      logger.functionExit('login', { 
        success: false,
        accountDeactivated: true,
        duration: `${duration}ms`
      })
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated',
      })
    }

    // Check password
    logger.debug('Validating password')
    const isPasswordValid = await user.comparePassword(password)
    
    if (!isPasswordValid) {
      // Increment login attempts
      logger.dbOperation('save', 'User', { id: user._id, operation: 'incrementLoginAttempts' })
      await user.incLoginAttempts()
      
      const duration = Date.now() - startTime
      logger.warn('Login failed - invalid password', { 
        userId: user._id,
        email,
        loginAttempts: user.loginAttempts,
        duration: `${duration}ms`
      })
      logger.functionExit('login', { 
        success: false,
        invalidPassword: true,
        duration: `${duration}ms`
      })
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    // Reset login attempts and update last login
    logger.dbOperation('save', 'User', { id: user._id, operation: 'resetLoginAttempts' })
    await user.resetLoginAttempts()

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id)

    // Save refresh token
    logger.dbOperation('save', 'User', { id: user._id, operation: 'addRefreshToken' })
    user.refreshTokens.push({ token: refreshToken })
    await user.save()

    // Remove sensitive data
    const userResponse = user.toObject()
    delete userResponse.password
    delete userResponse.refreshTokens

    const duration = Date.now() - startTime
    logger.success('User login successful', { 
      userId: user._id,
      email: user.email,
      role: user.role,
      duration: `${duration}ms`
    })
    logger.functionExit('login', { 
      success: true,
      userId: user._id,
      duration: `${duration}ms`
    })

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
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to login user', error, {
      email: req.body.email,
      operation: 'login',
      model: 'User',
      duration: `${duration}ms`
    })
    logger.functionExit('login', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshToken = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('refreshToken', { 
    hasRefreshToken: !!req.body.refreshToken
  })
  
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      const duration = Date.now() - startTime
      logger.warn('Refresh token missing', { duration: `${duration}ms` })
      logger.functionExit('refreshToken', { 
        success: false,
        missingToken: true,
        duration: `${duration}ms`
      })
      return res.status(401).json({
        success: false,
        message: 'Refresh token required',
      })
    }

    logger.debug('Verifying refresh token')

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    )

    logger.dbOperation('findById', 'User', decoded.id)
    // Find user and check if refresh token exists
    const user = await User.findById(decoded.id)
    
    if (!user || !user.isActive) {
      const duration = Date.now() - startTime
      logger.warn('Invalid refresh token - user not found or inactive', { 
        userId: decoded.id,
        userFound: !!user,
        isActive: user?.isActive,
        duration: `${duration}ms`
      })
      logger.functionExit('refreshToken', { 
        success: false,
        invalidToken: true,
        duration: `${duration}ms`
      })
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      })
    }

    // Check if refresh token exists in user's tokens
    const tokenExists = user.refreshTokens.some(tokenObj => tokenObj.token === refreshToken)
    
    if (!tokenExists) {
      const duration = Date.now() - startTime
      logger.warn('Refresh token not found in user tokens', { 
        userId: user._id,
        duration: `${duration}ms`
      })
      logger.functionExit('refreshToken', { 
        success: false,
        tokenNotFound: true,
        duration: `${duration}ms`
      })
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      })
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id)

    // Remove old refresh token and add new one
    logger.dbOperation('save', 'User', { id: user._id, operation: 'refreshTokens' })
    user.refreshTokens = user.refreshTokens.filter(tokenObj => tokenObj.token !== refreshToken)
    user.refreshTokens.push({ token: newRefreshToken })
    await user.save()

    const duration = Date.now() - startTime
    logger.success('Tokens refreshed successfully', { 
      userId: user._id,
      duration: `${duration}ms`
    })
    logger.functionExit('refreshToken', { 
      success: true,
      userId: user._id,
      duration: `${duration}ms`
    })

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
    const duration = Date.now() - startTime
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      logger.warn('Invalid or expired refresh token', { 
        errorName: error.name,
        duration: `${duration}ms`
      })
      logger.functionExit('refreshToken', { 
        success: false,
        tokenError: error.name,
        duration: `${duration}ms`
      })
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      })
    }
    logger.error('Failed to refresh token', error, {
      operation: 'refreshToken',
      model: 'User',
      duration: `${duration}ms`
    })
    logger.functionExit('refreshToken', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('logout', { 
    userId: req.user._id,
    hasRefreshToken: !!req.body.refreshToken
  })
  
  try {
    const { refreshToken } = req.body
    const userId = req.user._id

    if (refreshToken) {
      logger.debug('Removing specific refresh token', { userId })
      logger.dbOperation('findByIdAndUpdate', 'User', { id: userId, operation: 'removeRefreshToken' })
      // Remove specific refresh token
      await User.findByIdAndUpdate(userId, {
        $pull: { refreshTokens: { token: refreshToken } }
      })
    } else {
      logger.debug('Removing all refresh tokens (logout from all devices)', { userId })
      logger.dbOperation('findByIdAndUpdate', 'User', { id: userId, operation: 'clearAllRefreshTokens' })
      // Remove all refresh tokens (logout from all devices)
      await User.findByIdAndUpdate(userId, {
        $set: { refreshTokens: [] }
      })
    }

    const duration = Date.now() - startTime
    logger.success('User logged out successfully', { 
      userId,
      logoutAllDevices: !refreshToken,
      duration: `${duration}ms`
    })
    logger.functionExit('logout', { 
      success: true,
      userId,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      message: 'Logout successful',
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to logout user', error, {
      userId: req.user._id,
      operation: 'logout',
      model: 'User',
      duration: `${duration}ms`
    })
    logger.functionExit('logout', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('getMe', { userId: req.user._id })
  
  try {
    logger.dbOperation('findById', 'User', { id: req.user._id, operation: 'populate' })
    const user = await User.findById(req.user._id)
      .populate('enrolledCourses.course', 'title thumbnailUrl')
      .populate('certificates.course', 'title')

    const duration = Date.now() - startTime
    logger.success('User profile fetched successfully', { 
      userId: user._id,
      email: user.email,
      enrolledCourses: user.enrolledCourses?.length || 0,
      certificates: user.certificates?.length || 0,
      duration: `${duration}ms`
    })
    logger.functionExit('getMe', { 
      success: true,
      userId: user._id,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      data: user,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to fetch user profile', error, {
      userId: req.user._id,
      operation: 'getMe',
      model: 'User',
      duration: `${duration}ms`
    })
    logger.functionExit('getMe', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('updateProfile', { 
    userId: req.user._id,
    updateFields: Object.keys(req.body)
  })
  
  try {
    const { name, bio, location, website, socialLinks } = req.body
    const userId = req.user._id

    logger.debug('Updating user profile', {
      userId,
      fieldsToUpdate: { name: !!name, bio: !!bio, location: !!location, website: !!website, socialLinks: !!socialLinks }
    })

    logger.dbOperation('findByIdAndUpdate', 'User', { id: userId, updateFields: Object.keys(req.body) })
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

    const duration = Date.now() - startTime
    logger.success('User profile updated successfully', { 
      userId: user._id,
      updatedFields: Object.keys(req.body),
      duration: `${duration}ms`
    })
    logger.functionExit('updateProfile', { 
      success: true,
      userId: user._id,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to update user profile', error, {
      userId: req.user._id,
      body: req.body,
      operation: 'updateProfile',
      model: 'User',
      duration: `${duration}ms`
    })
    logger.functionExit('updateProfile', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('changePassword', { 
    userId: req.user._id,
    hasCurrentPassword: !!req.body.currentPassword,
    hasNewPassword: !!req.body.newPassword
  })
  
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.user._id

    logger.debug('Changing user password', { userId })

    // Find user with password
    logger.dbOperation('findById', 'User', { id: userId, operation: 'selectPassword' })
    const user = await User.findById(userId).select('+password')
    
    // Check current password
    logger.debug('Validating current password')
    const isCurrentPasswordValid = await user.comparePassword(currentPassword)
    
    if (!isCurrentPasswordValid) {
      const duration = Date.now() - startTime
      logger.warn('Password change failed - incorrect current password', { 
        userId,
        duration: `${duration}ms`
      })
      logger.functionExit('changePassword', { 
        success: false,
        incorrectPassword: true,
        duration: `${duration}ms`
      })
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      })
    }

    // Update password
    logger.debug('Updating password and clearing refresh tokens')
    user.password = newPassword
    logger.dbOperation('save', 'User', { id: userId, operation: 'updatePassword' })
    await user.save()

    // Remove all refresh tokens to force re-login
    user.refreshTokens = []
    logger.dbOperation('save', 'User', { id: userId, operation: 'clearRefreshTokens' })
    await user.save()

    const duration = Date.now() - startTime
    logger.success('Password changed successfully', { 
      userId,
      duration: `${duration}ms`
    })
    logger.functionExit('changePassword', { 
      success: true,
      userId,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      message: 'Password changed successfully. Please login again.',
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to change password', error, {
      userId: req.user._id,
      operation: 'changePassword',
      model: 'User',
      duration: `${duration}ms`
    })
    logger.functionExit('changePassword', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('forgotPassword', { 
    email: req.body.email
  })
  
  try {
    const { email } = req.body

    logger.debug('Processing forgot password request', { email })

    logger.dbOperation('findOne', 'User', { email })
    const user = await User.findOne({ email })
    
    if (!user) {
      const duration = Date.now() - startTime
      logger.warn('Forgot password - user not found', { 
        email,
        duration: `${duration}ms`
      })
      logger.functionExit('forgotPassword', { 
        success: false,
        userNotFound: true,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpires = Date.now() + 10 * 60 * 1000 // 10 minutes

    logger.debug('Generating password reset token', {
      userId: user._id,
      tokenExpires: new Date(resetExpires).toISOString()
    })

    user.passwordResetToken = resetToken
    user.passwordResetExpires = resetExpires
    logger.dbOperation('save', 'User', { id: user._id, operation: 'setPasswordResetToken' })
    await user.save()

    // In a real application, you would send an email here
    // For now, we'll just return the token (remove this in production)
    const duration = Date.now() - startTime
    logger.success('Password reset token generated', { 
      userId: user._id,
      email,
      duration: `${duration}ms`
    })
    logger.functionExit('forgotPassword', { 
      success: true,
      userId: user._id,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      message: 'Password reset token generated',
      data: {
        resetToken, // Remove this in production
      },
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to process forgot password', error, {
      email: req.body.email,
      operation: 'forgotPassword',
      model: 'User',
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

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('resetPassword', { 
    hasToken: !!req.body.token,
    hasPassword: !!req.body.password
  })
  
  try {
    const { token, password } = req.body

    logger.debug('Processing password reset', {
      hasToken: !!token,
      hasPassword: !!password
    })

    // Find user with valid reset token
    logger.dbOperation('findOne', 'User', { passwordResetToken: token })
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    })

    if (!user) {
      const duration = Date.now() - startTime
      logger.warn('Password reset failed - invalid or expired token', { 
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

    logger.debug('Resetting password and clearing tokens', {
      userId: user._id
    })

    // Update password and clear reset token
    user.password = password
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    user.refreshTokens = [] // Remove all refresh tokens
    logger.dbOperation('save', 'User', { id: user._id, operation: 'resetPassword' })
    await user.save()

    const duration = Date.now() - startTime
    logger.success('Password reset successfully', { 
      userId: user._id,
      duration: `${duration}ms`
    })
    logger.functionExit('resetPassword', { 
      success: true,
      userId: user._id,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      message: 'Password reset successfully',
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to reset password', error, {
      hasToken: !!req.body.token,
      operation: 'resetPassword',
      model: 'User',
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

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('verifyEmail', { 
    hasToken: !!req.body.token
  })
  
  try {
    const { token } = req.body

    logger.debug('Processing email verification', {
      hasToken: !!token
    })

    // Find user with valid verification token
    logger.dbOperation('findOne', 'User', { emailVerificationToken: token })
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    })

    if (!user) {
      const duration = Date.now() - startTime
      logger.warn('Email verification failed - invalid or expired token', { 
        hasToken: !!token,
        duration: `${duration}ms`
      })
      logger.functionExit('verifyEmail', { 
        success: false,
        invalidToken: true,
        duration: `${duration}ms`
      })
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
      })
    }

    logger.debug('Marking email as verified', {
      userId: user._id,
      email: user.email
    })

    // Mark email as verified
    user.isEmailVerified = true
    user.emailVerificationToken = undefined
    user.emailVerificationExpires = undefined
    logger.dbOperation('save', 'User', { id: user._id, operation: 'verifyEmail' })
    await user.save()

    const duration = Date.now() - startTime
    logger.success('Email verified successfully', { 
      userId: user._id,
      email: user.email,
      duration: `${duration}ms`
    })
    logger.functionExit('verifyEmail', { 
      success: true,
      userId: user._id,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      message: 'Email verified successfully',
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to verify email', error, {
      hasToken: !!req.body.token,
      operation: 'verifyEmail',
      model: 'User',
      duration: `${duration}ms`
    })
    logger.functionExit('verifyEmail', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Resend email verification
// @route   POST /api/auth/resend-verification
// @access  Private
export const resendVerification = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('resendVerification', { 
    userId: req.user._id
  })
  
  try {
    const userId = req.user._id

    logger.dbOperation('findById', 'User', userId)
    const user = await User.findById(userId)
    
    if (user.isEmailVerified) {
      const duration = Date.now() - startTime
      logger.warn('Resend verification failed - email already verified', { 
        userId,
        email: user.email,
        duration: `${duration}ms`
      })
      logger.functionExit('resendVerification', { 
        success: false,
        alreadyVerified: true,
        duration: `${duration}ms`
      })
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
      })
    }

    logger.debug('Generating new verification token', {
      userId,
      email: user.email
    })

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex')
    const emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

    user.emailVerificationToken = emailVerificationToken
    user.emailVerificationExpires = emailVerificationExpires
    logger.dbOperation('save', 'User', { id: userId, operation: 'resendVerificationToken' })
    await user.save()

    // In a real application, you would send an email here
    const duration = Date.now() - startTime
    logger.success('Verification email token regenerated', { 
      userId,
      email: user.email,
      duration: `${duration}ms`
    })
    logger.functionExit('resendVerification', { 
      success: true,
      userId,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      message: 'Verification email sent',
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to resend verification email', error, {
      userId: req.user._id,
      operation: 'resendVerification',
      model: 'User',
      duration: `${duration}ms`
    })
    logger.functionExit('resendVerification', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})
