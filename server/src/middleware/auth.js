import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Admin from '../models/Admin.js'

// Verify JWT token for users
export const authenticateToken = async (req, res, next) => {
  console.log("[TS-LOG][AUTH] User authentication middleware triggered")
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN
    console.log("[TS-LOG][AUTH] Token present:", !!token)

    if (!token) {
      console.log("[TS-LOG][AUTH] No token provided")
      return res.status(401).json({
        success: false,
        message: 'Access token required',
      })
    }

    console.log("[TS-LOG][AUTH] Verifying JWT token")
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log("[TS-LOG][AUTH] Token decoded for user ID:", decoded.id)
    
    // Find user and check if still active
    console.log("[TS-LOG][AUTH] Looking up user in database")
    const user = await User.findById(decoded.id).select('-password')
    console.log("[TS-LOG][AUTH] User found:", !!user, "Active:", user?.isActive)
    
    if (!user || !user.isActive) {
      console.log("[TS-LOG][AUTH] User not found or inactive")
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      })
    }

    // Check if account is locked
    console.log("[TS-LOG][AUTH] Checking if account is locked:", user.isLocked)
    if (user.isLocked) {
      console.log("[TS-LOG][AUTH] Account is locked")
      return res.status(401).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts',
      })
    }

    console.log("[TS-LOG][AUTH] Authentication successful, setting req.user")
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
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Find admin and check if still active
    const admin = await Admin.findById(decoded.id).select('-password')
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      })
    }

    // Check if account is locked
    if (admin.isLocked) {
      return res.status(401).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts',
      })
    }

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