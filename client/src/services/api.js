import axios from 'axios'
import { toast } from 'sonner'
import frontendAuthLogger from '../utils/authLogger'

// Create axios instance with base configuration
console.log("[DEBUG: api.js:init:5] Initializing axios instance")
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 15000, // Increased timeout for better reliability
  headers: {
    'Content-Type': 'application/json',
  },
})

console.log("[DEBUG: api.js:config:6] API base URL:", api.defaults.baseURL)

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

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const startTime = Date.now()
    config.metadata = { startTime }
    
    frontendAuthLogger.apiRequest(
      config.method?.toUpperCase(), 
      config.url, 
      config.headers, 
      config.data
    )
    
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      frontendAuthLogger.debug('api', 'request', `Adding access token to request`)
      config.headers.Authorization = `Bearer ${accessToken}`
    } else {
      frontendAuthLogger.debug('api', 'request', `No access token found`)
    }
    return config
  },
  (error) => {
    frontendAuthLogger.error('api', 'request', `Request interceptor error`, { error: error.message })
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => {
    const responseTime = Date.now() - (response.config.metadata?.startTime || Date.now())
    
    frontendAuthLogger.apiResponse(
      response.config.method?.toUpperCase(),
      response.config.url,
      response.status,
      responseTime
    )
    
    return response
  },
  async (error) => {
    console.log("[DEBUG: api.js:response:error:39] API error:", error.response?.status, error.config?.url, error.message)
    const originalRequest = error.config

    // Retry logic for network errors and rate limiting
    if (shouldRetry(error) && originalRequest && !originalRequest._retryCount) {
      originalRequest._retryCount = 0
    }

    if (shouldRetry(error) && originalRequest && originalRequest._retryCount < MAX_RETRIES) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1
      console.log(`[DEBUG: api.js:response:retry:${originalRequest._retryCount}] Retrying request (attempt ${originalRequest._retryCount}/${MAX_RETRIES})`)
      
      await delay(RETRY_DELAY * originalRequest._retryCount) // Exponential backoff
      return api(originalRequest)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("[DEBUG: api.js:response:401:41] 401 error - attempting token refresh")
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          console.log("[DEBUG: api.js:response:refresh:44] Attempting to refresh token")
          const response = await axios.post(
            'http://localhost:5000/api/auth/refresh',
            { refreshToken }
          )

          const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', newRefreshToken)
          console.log("[DEBUG: api.js:response:refresh:success:50] Token refresh successful")

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          console.log("[DEBUG: api.js:response:retry:53] Retrying original request")
          return api(originalRequest)
        }
      } catch (refreshError) {
        console.error("[DEBUG: api.js:response:refresh:error:55] Token refresh failed:", refreshError)
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        
        if (window.location.pathname.startsWith('/admin')) {
          console.log("[DEBUG: api.js:response:redirect:61] Redirecting to admin login")
          window.location.href = '/admin/login'
        } else {
          console.log("[DEBUG: api.js:response:redirect:63] Redirecting to home")
          window.location.href = '/'
        }
        return Promise.reject(refreshError)
      }
    }

    // Handle other errors
    if (error.response?.status >= 500) {
      console.error("[DEBUG: api.js:response:error:500:87] Server error:", error.response?.status)
      toast.error('Server error. Please try again later.')
    } else if (error.response?.status === 404) {
      console.error("[DEBUG: api.js:response:error:404:89] Resource not found:", error.config?.url)
      toast.error('Resource not found.')
    } else if (error.response?.status === 403) {
      console.error("[DEBUG: api.js:response:error:403:91] Access denied:", error.config?.url)
      toast.error('Access denied.')
    }

    return Promise.reject(error)
  }
)

export { api }
export default api