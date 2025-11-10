import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Admin from '../models/Admin.js'
import authLogger from '../utils/authLogger.js'
import logger from '../utils/logger.js'

// Verify JWT token for users
export const authenticateToken = async (req, res, next) => {
  const startTime = Date.now()
  authLogger.info('authenticateToken', 'middleware', `User authentication middleware triggered`, {
    route: req.path,
    method: req.method,
    hasAuthHeader: !!req.headers.authorization
  })
  
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN
    
    authLogger.debug('authenticateToken', 'middleware', `Token extraction`, {
      hasAuthHeader: !!authHeader,
      hasToken: !!token,
      tokenLength: token?.length
    })

    if (!token) {
      authLogger.error('authenticateToken', 'middleware', `No token provided`, {
        route: req.path,
        method: req.method
      })
      return res.status(401).json({
        success: false,
        message: 'Access token required',
      })
    }

    authLogger.debug('authenticateToken', 'middleware', `Verifying JWT token`)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    authLogger.debug('authenticateToken', 'middleware', `Token decoded successfully`, {
      userId: decoded.id,
      tokenType: decoded.type || 'user'
    })
    
    // Find user and check if still active
    authLogger.debug('authenticateToken', 'middleware', `Looking up user in database`)
    const user = await User.findById(decoded.id).select('-password')
    
    authLogger.debug('authenticateToken', 'middleware', `User lookup completed`, {
      userFound: !!user,
      isActive: user?.isActive,
      isLocked: user?.isLocked,
      userId: user?._id
    })
    
    if (!user || !user.isActive) {
      authLogger.error('authenticateToken', 'middleware', `User not found or inactive`, {
        userId: decoded.id,
        userFound: !!user,
        isActive: user?.isActive
      })
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      })
    }

    // Check if account is locked
    if (user.isLocked) {
      authLogger.error('authenticateToken', 'middleware', `Account is locked`, {
        userId: user._id,
        isLocked: user.isLocked
      })
      return res.status(401).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts',
      })
    }

    const responseTime = Date.now() - startTime
    authLogger.info('authenticateToken', 'middleware', `User authentication successful`, {
      userId: user._id,
      email: user.email,
      responseTime: `${responseTime}ms`
    })
    
    req.user = user
    next()
  } catch (error) {
    const duration = Date.now() - startTime
    if (error.name === 'JsonWebTokenError') {
      logger.warn('Invalid JWT token', {
        route: req.path,
        method: req.method,
        errorName: error.name,
        duration: `${duration}ms`
      })
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      })
    }
    
    if (error.name === 'TokenExpiredError') {
      logger.warn('JWT token expired', {
        route: req.path,
        method: req.method,
        errorName: error.name,
        duration: `${duration}ms`
      })
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      })
    }

    logger.error('Auth middleware error', error, {
      route: req.path,
      method: req.method,
      errorName: error.name,
      errorMessage: error.message,
      operation: 'authenticateToken',
      duration: `${duration}ms`
    })
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
    })
  }
}

// Verify JWT token for admins
export const authenticateAdmin = async (req, res, next) => {
  const startTime = Date.now()
  authLogger.info('authenticateAdmin', 'middleware', `Admin authentication middleware triggered`, {
    route: req.path,
    method: req.method,
    hasAuthHeader: !!req.headers.authorization
  })
  
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN
    
    authLogger.debug('authenticateAdmin', 'middleware', `Token extraction`, {
      hasAuthHeader: !!authHeader,
      hasToken: !!token,
      tokenLength: token?.length
    })

    if (!token) {
      authLogger.error('authenticateAdmin', 'middleware', `No token provided`, {
        route: req.path,
        method: req.method
      })
      return res.status(401).json({
        success: false,
        message: 'Access token required',
      })
    }

    authLogger.debug('authenticateAdmin', 'middleware', `Verifying JWT token`)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    authLogger.debug('authenticateAdmin', 'middleware', `Token decoded successfully`, {
      adminId: decoded.id,
      tokenType: decoded.type || 'admin'
    })
    
    // Find admin and check if still active
    authLogger.debug('authenticateAdmin', 'middleware', `Looking up admin in database`)
    const admin = await Admin.findById(decoded.id).select('-password')
    
    authLogger.debug('authenticateAdmin', 'middleware', `Admin lookup completed`, {
      adminFound: !!admin,
      isActive: admin?.isActive,
      isLocked: admin?.isLocked,
      role: admin?.role,
      adminId: admin?._id
    })
    
    if (!admin || !admin.isActive) {
      authLogger.error('authenticateAdmin', 'middleware', `Admin not found or inactive`, {
        adminId: decoded.id,
        adminFound: !!admin,
        isActive: admin?.isActive
      })
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      })
    }

    // Check if account is locked
    if (admin.isLocked) {
      authLogger.error('authenticateAdmin', 'middleware', `Admin account is locked`, {
        adminId: admin._id,
        isLocked: admin.isLocked
      })
      return res.status(401).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts',
      })
    }

    const responseTime = Date.now() - startTime
    authLogger.info('authenticateAdmin', 'middleware', `Admin authentication successful`, {
      adminId: admin._id,
      email: admin.email,
      role: admin.role,
      responseTime: `${responseTime}ms`
    })
    
    req.admin = admin
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      })
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      })
    }

    const duration = Date.now() - startTime
    logger.error('Auth middleware error', error, {
      route: req.path,
      method: req.method,
      errorName: error.name,
      errorMessage: error.message,
      operation: 'authenticateAdmin',
      duration: `${duration}ms`
    })
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
    })
  }
}

// Check if admin has specific permission
export const requirePermission = (resource, action) => {
  return (req, res, next) => {
    const startTime = Date.now()
    logger.functionEntry('requirePermission', { resource, action, route: req.path })
    
    try {
      if (!req.admin) {
        logger.warn('Permission check failed: no admin in request', {
          resource,
          action,
          route: req.path
        })
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        })
      }

      const hasPermission = req.admin.hasPermission(resource, action)
      logger.debug('Permission check result', {
        resource,
        action,
        adminId: req.admin._id,
        hasPermission,
        route: req.path
      })

      if (!hasPermission) {
        const duration = Date.now() - startTime
        logger.warn('Insufficient permissions', {
          resource,
          action,
          adminId: req.admin._id,
          adminRole: req.admin.role,
          route: req.path,
          duration: `${duration}ms`
        })
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        })
      }

      const duration = Date.now() - startTime
      logger.success('Permission check passed', {
        resource,
        action,
        adminId: req.admin._id,
        duration: `${duration}ms`
      })
      logger.functionExit('requirePermission', { success: true, duration: `${duration}ms` })
      next()
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('Permission check error', error, {
        resource,
        action,
        route: req.path,
        duration: `${duration}ms`
      })
      logger.functionExit('requirePermission', { success: false, error: error.message, duration: `${duration}ms` })
      return res.status(500).json({
        success: false,
        message: 'Permission check error',
      })
    }
  }
}

// Check if admin has specific role
export const requireRole = (...roles) => {
  return (req, res, next) => {
    const startTime = Date.now()
    logger.functionEntry('requireRole', { requiredRoles: roles, route: req.path })
    
    try {
      if (!req.admin) {
        logger.warn('Role check failed: no admin in request', {
          requiredRoles: roles,
          route: req.path
        })
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        })
      }

      const hasRole = roles.includes(req.admin.role)
      logger.debug('Role check result', {
        requiredRoles: roles,
        adminRole: req.admin.role,
        hasRole,
        adminId: req.admin._id,
        route: req.path
      })

      if (!hasRole) {
        const duration = Date.now() - startTime
        logger.warn('Insufficient role privileges', {
          requiredRoles: roles,
          adminRole: req.admin.role,
          adminId: req.admin._id,
          route: req.path,
          duration: `${duration}ms`
        })
        return res.status(403).json({
          success: false,
          message: 'Insufficient role privileges',
        })
      }

      const duration = Date.now() - startTime
      logger.success('Role check passed', {
        requiredRoles: roles,
        adminRole: req.admin.role,
        adminId: req.admin._id,
        duration: `${duration}ms`
      })
      logger.functionExit('requireRole', { success: true, duration: `${duration}ms` })
      next()
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('Role check error', error, {
        requiredRoles: roles,
        route: req.path,
        duration: `${duration}ms`
      })
      logger.functionExit('requireRole', { success: false, error: error.message, duration: `${duration}ms` })
      return res.status(500).json({
        success: false,
        message: 'Role check error',
      })
    }
  }
}

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  const startTime = Date.now()
  logger.functionEntry('optionalAuth', { route: req.path, hasAuthHeader: !!req.headers.authorization })
  
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (token) {
      logger.debug('Optional auth: token found, attempting verification', { route: req.path })
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        logger.dbOperation('findById', 'Admin', decoded.id)
        const admin = await Admin.findById(decoded.id).select('-password')
        
        if (admin && admin.isActive && !admin.isLocked) {
          req.admin = admin
          const duration = Date.now() - startTime
          logger.success('Optional auth: admin authenticated', {
            adminId: admin._id,
            role: admin.role,
            duration: `${duration}ms`
          })
        } else {
          logger.debug('Optional auth: admin not found or inactive', {
            adminFound: !!admin,
            isActive: admin?.isActive,
            isLocked: admin?.isLocked
          })
        }
      } catch (tokenError) {
        logger.debug('Optional auth: token verification failed, continuing without auth', {
          errorName: tokenError.name,
          errorMessage: tokenError.message
        })
      }
    } else {
      logger.debug('Optional auth: no token provided, continuing without auth', { route: req.path })
    }

    const duration = Date.now() - startTime
    logger.functionExit('optionalAuth', { success: true, hasAdmin: !!req.admin, duration: `${duration}ms` })
    next()
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Optional auth error', error, {
      route: req.path,
      duration: `${duration}ms`
    })
    logger.functionExit('optionalAuth', { success: false, error: error.message, duration: `${duration}ms` })
    // Continue without authentication for optional auth
    next()
  }
}

// Alias for authenticateAdmin (commonly used as 'protect')
export const protect = authenticateAdmin

// Alias for requireRole (commonly used as 'authorize')
export const authorize = requireRole

// Rate limiting for login attempts
export const loginRateLimit = (req, res, next) => {
  const startTime = Date.now()
  logger.functionEntry('loginRateLimit', { route: req.path, ip: req.ip })
  
  try {
    // This would typically be implemented with a Redis store
    // For now, we'll use a simple in-memory store (not recommended for production)
    const attempts = req.app.locals.loginAttempts || {}
    const ip = req.ip || req.connection.remoteAddress
    const now = Date.now()
    const windowMs = 15 * 60 * 1000 // 15 minutes
    const maxAttempts = 5

    logger.debug('Rate limit check', {
      ip,
      currentAttempts: attempts[ip]?.count || 0,
      maxAttempts,
      windowMs
    })

    // Clean old attempts
    const beforeClean = Object.keys(attempts).length
    Object.keys(attempts).forEach(key => {
      if (attempts[key].timestamp < now - windowMs) {
        delete attempts[key]
      }
    })
    const afterClean = Object.keys(attempts).length
    if (beforeClean !== afterClean) {
      logger.debug('Cleaned old rate limit entries', {
        before: beforeClean,
        after: afterClean,
        removed: beforeClean - afterClean
      })
    }

    // Check current attempts
    if (attempts[ip] && attempts[ip].count >= maxAttempts) {
      const retryAfter = Math.ceil((attempts[ip].timestamp + windowMs - now) / 1000)
      const duration = Date.now() - startTime
      logger.warn('Rate limit exceeded', {
        ip,
        attempts: attempts[ip].count,
        maxAttempts,
        retryAfter,
        duration: `${duration}ms`
      })
      logger.functionExit('loginRateLimit', { success: false, rateLimited: true, duration: `${duration}ms` })
      return res.status(429).json({
        success: false,
        message: 'Too many login attempts. Please try again later.',
        retryAfter,
      })
    }

    // Increment attempts
    if (!attempts[ip]) {
      attempts[ip] = { count: 1, timestamp: now }
      logger.debug('New rate limit entry created', { ip, count: 1 })
    } else {
      attempts[ip].count++
      logger.debug('Rate limit count incremented', { ip, count: attempts[ip].count })
    }

    req.app.locals.loginAttempts = attempts
    
    const duration = Date.now() - startTime
    logger.success('Rate limit check passed', {
      ip,
      attempts: attempts[ip].count,
      maxAttempts,
      duration: `${duration}ms`
    })
    logger.functionExit('loginRateLimit', { success: true, duration: `${duration}ms` })
    next()
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Rate limit check error', error, {
      ip: req.ip,
      route: req.path,
      duration: `${duration}ms`
    })
    logger.functionExit('loginRateLimit', { success: false, error: error.message, duration: `${duration}ms` })
    // Allow request to proceed if rate limiting fails
    next()
  }
}