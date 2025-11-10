/**
 * Helper script to add comprehensive logging to all controller functions
 * This provides a template for adding logging to remaining files
 */

import logger from './logger.js'

/**
 * Wraps a controller function with comprehensive logging
 * Usage: export const functionName = withLogging(asyncHandler(async (req, res) => { ... }))
 */
export const withLogging = (fn, functionName) => {
  return async (req, res, next) => {
    const startTime = Date.now()
    logger.functionEntry(functionName || fn.name, {
      method: req.method,
      path: req.path,
      hasBody: !!req.body,
      hasParams: Object.keys(req.params || {}).length > 0,
      hasQuery: Object.keys(req.query || {}).length > 0
    })
    
    try {
      const result = await fn(req, res, next)
      const duration = Date.now() - startTime
      logger.functionExit(functionName || fn.name, {
        success: true,
        duration: `${duration}ms`
      })
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error(`Error in ${functionName || fn.name}`, error, {
        method: req.method,
        path: req.path,
        duration: `${duration}ms`
      })
      logger.functionExit(functionName || fn.name, {
        success: false,
        error: error.message,
        duration: `${duration}ms`
      })
      throw error
    }
  }
}

