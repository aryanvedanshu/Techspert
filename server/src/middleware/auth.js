import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Admin from '../models/Admin.js'
import authLogger from '../utils/authLogger.js'

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

    console.error('Auth middleware error:', error)
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

    console.error('Auth middleware error:', error)
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
    })
  }
}

// Check if admin has specific permission
export const requirePermission = (resource, action) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    if (!req.admin.hasPermission(resource, action)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      })
    }

    next()
  }
}

// Check if admin has specific role
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient role privileges',
      })
    }

    next()
  }
}

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const admin = await Admin.findById(decoded.id).select('-password')
      
      if (admin && admin.isActive && !admin.isLocked) {
        req.admin = admin
      }
    }

    next()
  } catch (error) {
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
  // This would typically be implemented with a Redis store
  // For now, we'll use a simple in-memory store (not recommended for production)
  const attempts = req.app.locals.loginAttempts || {}
  const ip = req.ip || req.connection.remoteAddress
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxAttempts = 5

  // Clean old attempts
  Object.keys(attempts).forEach(key => {
    if (attempts[key].timestamp < now - windowMs) {
      delete attempts[key]
    }
  })

  // Check current attempts
  if (attempts[ip] && attempts[ip].count >= maxAttempts) {
    return res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again later.',
      retryAfter: Math.ceil((attempts[ip].timestamp + windowMs - now) / 1000),
    })
  }

  // Increment attempts
  if (!attempts[ip]) {
    attempts[ip] = { count: 1, timestamp: now }
  } else {
    attempts[ip].count++
  }

  req.app.locals.loginAttempts = attempts
  next()
}