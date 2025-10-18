import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'
import { toast } from 'sonner'

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
      const accessToken = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')
      const userData = localStorage.getItem('user')
      
      if (accessToken && userData) {
        try {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
          setIsAuthenticated(true)
          setIsAdmin(parsedUser.role === 'admin' || parsedUser.role === 'super-admin')
        } catch (error) {
          console.error('Error parsing user data:', error)
          clearAuthData()
        }
      } else if (refreshToken) {
        // Try to refresh the token
        try {
          const response = await api.post('/auth/refresh', { refreshToken })
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data.tokens
          
          localStorage.setItem('accessToken', newAccessToken)
          localStorage.setItem('refreshToken', newRefreshToken)
          
          // Get user data
          const userResponse = await api.get('/auth/me')
          const userData = userResponse.data.data
          
          setUser(userData)
          setIsAuthenticated(true)
          setIsAdmin(userData.role === 'admin' || userData.role === 'super-admin')
          localStorage.setItem('user', JSON.stringify(userData))
        } catch (error) {
          console.error('Token refresh failed:', error)
          clearAuthData()
        }
      }
      setLoading(false)
    }

    initializeAuth()
  }, [])

  const clearAuthData = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
    setIsAuthenticated(false)
    setIsAdmin(false)
  }

  const login = async (email, password, isAdminLogin = false) => {
    try {
      const endpoint = isAdminLogin ? '/admin/login' : '/auth/login'
      const response = await api.post(endpoint, { email, password })
      const { user: userData, tokens } = response.data.data
      
      localStorage.setItem('accessToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)
      localStorage.setItem('user', JSON.stringify(userData))
      
      setUser(userData)
      setIsAuthenticated(true)
      setIsAdmin(userData.role === 'admin' || userData.role === 'super-admin')
      
      toast.success('Login successful!')
      return { success: true, user: userData }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      const { user: newUser, tokens } = response.data.data
      
      localStorage.setItem('accessToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)
      localStorage.setItem('user', JSON.stringify(newUser))
      
      setUser(newUser)
      setIsAuthenticated(true)
      setIsAdmin(newUser.role === 'admin' || newUser.role === 'super-admin')
      
      toast.success('Registration successful!')
      return { success: true, user: newUser }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearAuthData()
      toast.success('Logged out successfully')
    }
  }

  const updateUser = (userData) => {
    setUser(userData)
    setIsAdmin(userData.role === 'admin' || userData.role === 'super-admin')
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await api.post('/auth/refresh', { refreshToken })
      const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens
      
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', newRefreshToken)
      
      return { success: true, accessToken }
    } catch (error) {
      clearAuthData()
      throw error
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    updateUser,
    refreshToken,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}