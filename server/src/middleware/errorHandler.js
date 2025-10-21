// Global error handling middleware

export const errorHandler = (err, req, res, next) => {
  console.log("[DEBUG: errorHandler.js:errorHandler:3] Global error handler triggered")
  let error = { ...err }
  error.message = err.message

  // Log error
  console.error("[DEBUG: errorHandler.js:error:8] Error details:", {
    name: err.name,
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  })

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    console.log("[DEBUG: errorHandler.js:castError:19] CastError - Resource not found")
    const message = 'Resource not found'
    error = { message, statusCode: 404 }
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    console.log("[DEBUG: errorHandler.js:duplicateKey:25] Duplicate key error")
    const field = Object.keys(err.keyValue)[0]
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
    error = { message, statusCode: 400 }
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    console.log("[DEBUG: errorHandler.js:validationError:31] Validation error")
    const message = Object.values(err.errors).map(val => val.message).join(', ')
    error = { message, statusCode: 400 }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    console.log("[DEBUG: errorHandler.js:jwtError:37] JWT error - Invalid token")
    const message = 'Invalid token'
    error = { message, statusCode: 401 }
  }

  if (err.name === 'TokenExpiredError') {
    console.log("[DEBUG: errorHandler.js:jwtExpired:42] JWT error - Token expired")
    const message = 'Token expired'
    error = { message, statusCode: 401 }
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large'
    error = { message, statusCode: 400 }
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field'
    error = { message, statusCode: 400 }
  }

  // Default error
  const statusCode = error.statusCode || 500
  const message = error.message || 'Server Error'

  console.log("[DEBUG: errorHandler.js:response:62] Sending error response:", { statusCode, message })
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

// 404 handler
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(404)
  next(error)
}

// Async error handler wrapper
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}