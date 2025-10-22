import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'
import { toast } from 'sonner'
import frontendAuthLogger from '../utils/authLogger'

const AuthContext = createContext()

export { AuthContext }

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const initializeAuth = async () => {
      frontendAuthLogger.info('AuthContext', 'initializeAuth', `Initializing authentication`)
      
      const accessToken = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')
      const userData = localStorage.getItem('user')
      
      frontendAuthLogger.debug('AuthContext', 'initializeAuth', `Checking stored authentication data`, {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        hasUserData: !!userData
      })
      
      if (accessToken && userData) {
        try {
          const user = JSON.parse(userData)
          
          frontendAuthLogger.debug('AuthContext', 'initializeAuth', `Parsed user data`, {
            userId: user.id,
            email: user.email,
            role: user.role
          })
          
          // For admin users, verify token is still valid
          if (user.role === 'admin' || user.role === 'super-admin') {
            try {
              frontendAuthLogger.info('AuthContext', 'initializeAuth', `Verifying admin token`)
              const response = await api.get('/admin/profile')
              
              frontendAuthLogger.info('AuthContext', 'initializeAuth', `Admin token verified successfully`)
              frontendAuthLogger.authStateChange('AuthContext', 'authenticated', { user, isAdmin: true })
              
              setUser(user)
              setIsAuthenticated(true)
              setIsAdmin(true)
            } catch (error) {
              frontendAuthLogger.error('AuthContext', 'initializeAuth', `Admin token verification failed`, {
                error: error.message,
                status: error.response?.status
              })
              
              // Clear invalid tokens
              frontendAuthLogger.localStorageOperation('removeItem', 'accessToken')
              frontendAuthLogger.localStorageOperation('removeItem', 'refreshToken')
              frontendAuthLogger.localStorageOperation('removeItem', 'user')
              
              localStorage.removeItem('accessToken')
              localStorage.removeItem('refreshToken')
              localStorage.removeItem('user')
            }
          } else {
            // For regular users, just set the data
            frontendAuthLogger.authStateChange('AuthContext', 'authenticated', { user, isAdmin: false })
            setUser(user)
            setIsAuthenticated(true)
            setIsAdmin(false)
          }
        } catch (error) {
          frontendAuthLogger.error('AuthContext', 'initializeAuth', `Error parsing user data`, {
            error: error.message
          })
          
          // Clear invalid data
          frontendAuthLogger.localStorageOperation('removeItem', 'accessToken')
          frontendAuthLogger.localStorageOperation('removeItem', 'refreshToken')
          frontendAuthLogger.localStorageOperation('removeItem', 'user')
          
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
        }
      } else {
        frontendAuthLogger.info('AuthContext', 'initializeAuth', `No stored authentication data found`)
      }
      
      setLoading(false)
    }

    initializeAuth()
  }, [])

  const login = async (email, password, isAdminLogin = false) => {
    try {
      frontendAuthLogger.loginAttempt(email, isAdminLogin)
      frontendAuthLogger.info('AuthContext', 'login', `Starting login process`, { 
        email, 
        isAdminLogin,
        endpoint: isAdminLogin ? '/admin/login' : '/auth/login'
      })
      
      const endpoint = isAdminLogin ? '/admin/login' : '/auth/login'
      const response = await api.post(endpoint, { email, password })
      
      frontendAuthLogger.info('AuthContext', 'login', `Login response received`, {
        success: response.data.success,
        hasUser: !!response.data.data?.user,
        hasTokens: !!response.data.data?.tokens
      })
      
      const { user: userData, tokens } = response.data.data
      
      // Store tokens and user data
      frontendAuthLogger.localStorageOperation('setItem', 'accessToken', tokens.accessToken)
      frontendAuthLogger.localStorageOperation('setItem', 'refreshToken', tokens.refreshToken)
      frontendAuthLogger.localStorageOperation('setItem', 'user', JSON.stringify(userData))
      
      localStorage.setItem('accessToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)
      localStorage.setItem('user', JSON.stringify(userData))
      
      const isAdmin = userData.role === 'admin' || userData.role === 'super-admin'
      
      frontendAuthLogger.loginSuccess(email, userData, tokens)
      frontendAuthLogger.authStateChange('AuthContext', 'authenticated', { user: userData, isAdmin })
      
      setUser(userData)
      setIsAuthenticated(true)
      setIsAdmin(isAdmin)
      
      toast.success('Login successful!')
      return { success: true, user: userData }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      
      frontendAuthLogger.loginFailure(email, message, error)
      frontendAuthLogger.error('AuthContext', 'login', `Login failed`, {
        email,
        error: error.message,
        status: error.response?.status,
        response: error.response?.data
      })
      
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    
    setUser(null)
    setIsAuthenticated(false)
    setIsAdmin(false)
    
    toast.success('Logged out successfully!')
  }

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}