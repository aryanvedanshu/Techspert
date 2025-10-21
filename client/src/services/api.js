import axios from 'axios'
import { toast } from 'sonner'

// Create axios instance with base configuration
console.log("[DEBUG: api.js:init:5] Initializing axios instance")
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

console.log("[DEBUG: api.js:config:6] API base URL:", api.defaults.baseURL)

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log("[DEBUG: api.js:request:15] API request:", config.method?.toUpperCase(), config.url)
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
      console.log("[DEBUG: api.js:request:auth:18] Added authorization header")
    } else {
      console.log("[DEBUG: api.js:request:auth:20] No access token found")
    }
    return config
  },
  (error) => {
    console.error("[DEBUG: api.js:request:error:22] Request interceptor error:", error)
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => {
    console.log("[DEBUG: api.js:response:success:37] API response:", response.status, response.config.url)
    return response
  },
  async (error) => {
    console.log("[DEBUG: api.js:response:error:39] API error:", error.response?.status, error.config?.url, error.message)
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("[DEBUG: api.js:response:401:41] 401 error - attempting token refresh")
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          console.log("[DEBUG: api.js:response:refresh:44] Attempting to refresh token")
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
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
          console.log("[DEBUG: api.js:response:redirect:63] Redirecting to user login")
          window.location.href = '/login'
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