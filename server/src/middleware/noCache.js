/**
 * No-Cache Middleware
 * Prevents browsers and proxies from caching API responses
 * Ensures all data comes directly from MongoDB database
 */
import logger from '../utils/logger.js'

export const noCache = (req, res, next) => {
  logger.functionEntry('noCache middleware', {
    url: req.originalUrl,
    method: req.method
  })

  // Set headers to prevent caching
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, private, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Content-Type-Options': 'nosniff',
    'X-Request-ID': req.id || Date.now().toString()
  })

  logger.debug('No-cache headers set', {
    url: req.originalUrl,
    headers: {
      'Cache-Control': res.get('Cache-Control'),
      'Pragma': res.get('Pragma'),
      'Expires': res.get('Expires')
    }
  })

  logger.functionExit('noCache middleware')
  next()
}

export default noCache

