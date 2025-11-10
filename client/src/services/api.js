import axios from 'axios'
import { toast } from 'sonner'
import frontendAuthLogger from '../utils/authLogger'
import logger from '../utils/logger'

// Create axios instance with base configuration
logger.functionEntry('api.js initialization')
logger.info('Initializing axios instance', { baseURL: 'http://localhost:5000/api' })
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 15000, // Increased timeout for better reliability
  headers: {
    'Content-Type': 'application/json',
  },
})

logger.info('API instance created', { baseURL: api.defaults.baseURL, timeout: 15000 })

// Retry configuration
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Helper function to check if error should be retried
const shouldRetry = (error) => {
  if (!error.response) return true // Network errors
  const status = error.response.status
  return status >= 500 || status === 429 // Server errors or rate limiting
}

// Request interceptor to add auth token and cache-busting
api.interceptors.request.use(
  (config) => {
    logger.functionEntry('request interceptor', { method: config.method, url: config.url })
    const startTime = Date.now()
    config.metadata = { startTime }
    
    // Add cache-busting query parameter to prevent browser caching
    // This ensures all data comes directly from MongoDB, not from cache
    // Remove existing _t parameter if present to avoid duplicates
    const urlWithoutCacheBust = config.url.replace(/[?&]_t=\d+/g, '')
    const separator = urlWithoutCacheBust.includes('?') ? '&' : '?'
    const timestamp = `_t=${Date.now()}`
    config.url = `${urlWithoutCacheBust}${separator}${timestamp}`
    
    logger.debug('Cache-busting parameter added', { 
      originalUrl: urlWithoutCacheBust,
      cacheBustParam: timestamp,
      finalUrl: config.url
    })
    
    // Add no-cache headers to prevent any caching
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    config.headers['Pragma'] = 'no-cache'
    config.headers['Expires'] = '0'
    
    logger.apiRequest(
      config.method?.toUpperCase(), 
      config.url, 
      config.data
    )
    
    frontendAuthLogger.apiRequest(
      config.method?.toUpperCase(), 
      config.url, 
      config.headers, 
      config.data
    )
    
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      logger.debug('Adding access token to request', { hasToken: true, url: config.url })
      frontendAuthLogger.debug('api', 'request', `Adding access token to request`)
      config.headers.Authorization = `Bearer ${accessToken}`
    } else {
      logger.debug('No access token found', { hasToken: false, url: config.url })
      frontendAuthLogger.debug('api', 'request', `No access token found`)
    }
    
    logger.functionExit('request interceptor', { method: config.method, url: config.url })
    return config
  },
  (error) => {
    logger.error('Request interceptor error', error, { 
      message: error.message,
      stack: error.stack 
    })
    frontendAuthLogger.error('api', 'request', `Request interceptor error`, { error: error.message })
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => {
    logger.functionEntry('response interceptor success', { 
      method: response.config.method, 
      url: response.config.url,
      status: response.status 
    })
    
    const responseTime = Date.now() - (response.config.metadata?.startTime || Date.now())
    
    logger.apiResponse(
      response.config.method?.toUpperCase(),
      response.config.url,
      response.status,
      response.data,
      responseTime
    )
    
    frontendAuthLogger.apiResponse(
      response.config.method?.toUpperCase(),
      response.config.url,
      response.status,
      responseTime
    )
    
    logger.functionExit('response interceptor success', { 
      method: response.config.method, 
      url: response.config.url,
      duration: responseTime 
    })
    
    return response
  },
  async (error) => {
    logger.functionEntry('response interceptor error', { 
      status: error.response?.status,
      url: error.config?.url,
      message: error.message 
    })
    
    logger.error('API error in response interceptor', error, {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      responseData: error.response?.data
    })
    
    const originalRequest = error.config

    // Retry logic for network errors and rate limiting
    if (shouldRetry(error) && originalRequest && !originalRequest._retryCount) {
      originalRequest._retryCount = 0
      logger.debug('Initializing retry count', { url: originalRequest.url })
    }

    if (shouldRetry(error) && originalRequest && originalRequest._retryCount < MAX_RETRIES) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1
      logger.warn(`Retrying request (attempt ${originalRequest._retryCount}/${MAX_RETRIES})`, {
        url: originalRequest.url,
        attempt: originalRequest._retryCount,
        maxRetries: MAX_RETRIES,
        reason: shouldRetry(error) ? 'Network error or rate limit' : 'Unknown'
      })
      
      await delay(RETRY_DELAY * originalRequest._retryCount) // Exponential backoff
      logger.debug('Retry delay completed', { 
        delay: RETRY_DELAY * originalRequest._retryCount,
        url: originalRequest.url 
      })
      return api(originalRequest)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      logger.functionEntry('handle 401 error - token refresh', { url: originalRequest.url })
      
      // Don't try to refresh token for login/refresh endpoints
      const isAuthEndpoint = originalRequest.url?.includes('/login') || 
                             originalRequest.url?.includes('/refresh') ||
                             originalRequest.url?.includes('/admin/login') ||
                             originalRequest.url?.includes('/admin/refresh')
      
      if (isAuthEndpoint) {
        logger.debug('401 on auth endpoint - not attempting refresh', { 
          url: originalRequest.url,
          isAuthEndpoint: true 
        })
        logger.functionExit('handle 401 error - token refresh', { skipped: true })
        return Promise.reject(error)
      }
      
      logger.info('401 error - attempting token refresh', { url: originalRequest.url })
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          // Determine if this is an admin token by checking the user data
          const userData = localStorage.getItem('user')
          const isAdmin = userData ? JSON.parse(userData).role === 'admin' || JSON.parse(userData).role === 'super-admin' : false
          const refreshEndpoint = isAdmin ? '/api/admin/refresh' : '/api/auth/refresh'
          
          logger.debug('Attempting to refresh token', { 
            isAdmin, 
            refreshEndpoint,
            hasRefreshToken: !!refreshToken,
            hasUserData: !!userData
          })
          
          const response = await axios.post(
            `http://localhost:5000${refreshEndpoint}`,
            { refreshToken }
          )

          // Handle different response structures for admin vs user refresh
          let accessToken, newRefreshToken
          if (isAdmin) {
            // Admin refresh returns: { success: true, token: newToken }
            accessToken = response.data.token
            newRefreshToken = refreshToken // Admin refresh doesn't return new refresh token
            logger.debug('Admin token refresh response processed', { 
              hasAccessToken: !!accessToken,
              hasRefreshToken: !!newRefreshToken
            })
          } else {
            // User refresh returns: { success: true, data: { tokens: { accessToken, refreshToken } } }
            const tokens = response.data.data?.tokens || response.data.data
            accessToken = tokens.accessToken
            newRefreshToken = tokens.refreshToken
            logger.debug('User token refresh response processed', { 
              hasAccessToken: !!accessToken,
              hasRefreshToken: !!newRefreshToken
            })
          }
          
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', newRefreshToken)
          logger.info('Token refresh successful', { 
            isAdmin,
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!newRefreshToken
          })

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          logger.debug('Retrying original request with new token', { 
            url: originalRequest.url,
            hasNewToken: true 
          })
          logger.functionExit('handle 401 error - token refresh', { success: true })
          return api(originalRequest)
        } else {
          logger.warn('No refresh token available', { url: originalRequest.url })
          throw new Error('No refresh token available')
        }
      } catch (refreshError) {
        logger.error('Token refresh failed', refreshError, {
          url: originalRequest.url,
          errorMessage: refreshError.message,
          errorStack: refreshError.stack
        })
        
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        
        const isAdminPath = window.location.pathname.startsWith('/admin')
        logger.info('Redirecting after token refresh failure', { 
          isAdminPath,
          redirectTo: isAdminPath ? '/admin/login' : '/'
        })
        
        if (isAdminPath) {
          window.location.href = '/admin/login'
        } else {
          window.location.href = '/'
        }
        
        logger.functionExit('handle 401 error - token refresh', { success: false, error: refreshError.message })
        return Promise.reject(refreshError)
      }
    }

    // Handle other errors
    if (error.response?.status >= 500) {
      logger.error('Server error', error, {
        status: error.response?.status,
        url: error.config?.url,
        responseData: error.response?.data
      })
      toast.error('Server error. Please try again later.')
    } else if (error.response?.status === 404) {
      logger.error('Resource not found', error, {
        status: 404,
        url: error.config?.url,
        method: error.config?.method
      })
      toast.error('Resource not found.')
    } else if (error.response?.status === 403) {
      logger.error('Access denied', error, {
        status: 403,
        url: error.config?.url,
        method: error.config?.method
      })
      toast.error('Access denied.')
    } else {
      logger.warn('Unhandled API error', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message
      })
    }

    logger.functionExit('response interceptor error', { 
      status: error.response?.status,
      url: error.config?.url 
    })
    return Promise.reject(error)
  }
)

export { api }
export default api