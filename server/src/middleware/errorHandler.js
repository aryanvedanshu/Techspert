// Global error handling middleware
import logger from '../utils/logger.js'

export const errorHandler = (err, req, res, next) => {
  logger.functionEntry('errorHandler', {
    errorName: err.name,
    errorMessage: err.message,
    url: req.originalUrl,
    method: req.method,
    statusCode: err.statusCode
  })

  let error = { ...err }
  error.message = err.message

  // Log error with full context
  logger.error('Global error handler triggered', err, {
    name: err.name,
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    user: req.user?._id || req.admin?._id,
    ip: req.ip
  })

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    logger.warn('CastError - Resource not found', {
      errorName: err.name,
      errorValue: err.value,
      errorKind: err.kind,
      url: req.originalUrl
    })
    const message = 'Resource not found'
    error = { message, statusCode: 404 }
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    logger.warn('Duplicate key error', {
      errorCode: err.code,
      duplicateField: field,
      duplicateValue: err.keyValue[field],
      url: req.originalUrl
    })
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
    error = { message, statusCode: 400 }
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const validationErrors = Object.values(err.errors).map(val => val.message)
    logger.warn('Validation error', {
      errorName: err.name,
      validationErrors,
      url: req.originalUrl
    })
    const message = validationErrors.join(', ')
    error = { message, statusCode: 400 }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    logger.warn('JWT error - Invalid token', {
      errorName: err.name,
      errorMessage: err.message,
      url: req.originalUrl
    })
    const message = 'Invalid token'
    error = { message, statusCode: 401 }
  }

  if (err.name === 'TokenExpiredError') {
    logger.warn('JWT error - Token expired', {
      errorName: err.name,
      expiredAt: err.expiredAt,
      url: req.originalUrl
    })
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

  logger.info('Sending error response', {
    statusCode,
    message,
    url: req.originalUrl,
    method: req.method,
    hasStack: !!err.stack
  })

  logger.functionExit('errorHandler', {
    statusCode,
    message,
    errorName: err.name
  })

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

// 404 handler
export const notFound = (req, res, next) => {
  logger.warn('Route not found', {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  })
  const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(404)
  next(error)
}

// Async error handler wrapper
export const asyncHandler = (fn) => (req, res, next) => {
  const functionName = fn.name || 'anonymous'
  logger.debug('Async handler wrapper called', {
    function: functionName,
    url: req.originalUrl,
    method: req.method
  })
  
  Promise.resolve(fn(req, res, next)).catch((error) => {
    logger.error('Async handler error', error, {
      function: functionName,
      url: req.originalUrl,
      method: req.method
    })
    next(error)
  })
}