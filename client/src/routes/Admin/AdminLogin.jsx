import { useState, useEffect } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../services/api'
import { toast } from 'sonner'
import Button from '../../components/UI/Button'
import Card from '../../components/UI/Card'
import Modal from '../../components/UI/Modal'
import logger from '../../utils/logger'

const AdminLogin = () => {
  const [searchParams] = useSearchParams()
  const resetToken = searchParams.get('token')
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [resetPasswordData, setResetPasswordData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false)
  const [isResetPasswordLoading, setIsResetPasswordLoading] = useState(false)
  
  const { login, isAuthenticated } = useAuth()

  // Check if we have a reset token in URL
  useEffect(() => {
    if (resetToken) {
      setShowResetPassword(true)
    }
  }, [resetToken])

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await login(formData.email, formData.password, true) // true for admin login
      
      if (result.success) {
        // Redirect will happen automatically due to isAuthenticated check
      } else {
        setError(result.error)
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    logger.functionEntry('handleForgotPassword', { email: forgotPasswordEmail })
    setIsForgotPasswordLoading(true)
    setError('')

    try {
      logger.apiRequest('POST', '/admin/forgot-password', { email: forgotPasswordEmail })
      const response = await api.post('/admin/forgot-password', { email: forgotPasswordEmail })
      logger.apiResponse('POST', '/admin/forgot-password', response.status, response.data, Date.now())
      
      toast.success(response.data.message || 'Password reset link sent!')
      
      // In development, show the token
      if (response.data.data?.resetToken) {
        toast.info(`Reset Token (Dev Only): ${response.data.data.resetToken}`, { duration: 10000 })
      }
      
      setShowForgotPasswordModal(false)
      setForgotPasswordEmail('')
      logger.functionExit('handleForgotPassword', { success: true })
    } catch (error) {
      logger.error('Failed to send password reset', error, {
        email: forgotPasswordEmail,
        errorResponse: error.response?.data
      })
      setError(error.response?.data?.message || 'Failed to send password reset email')
      logger.functionExit('handleForgotPassword', { success: false, error: error.message })
    } finally {
      setIsForgotPasswordLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    logger.functionEntry('handleResetPassword', { hasToken: !!resetToken })
    
    if (resetPasswordData.password !== resetPasswordData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (resetPasswordData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setIsResetPasswordLoading(true)
    setError('')

    try {
      logger.apiRequest('POST', '/admin/reset-password', { token: resetToken, password: resetPasswordData.password })
      const response = await api.post('/admin/reset-password', {
        token: resetToken,
        password: resetPasswordData.password,
      })
      logger.apiResponse('POST', '/admin/reset-password', response.status, response.data, Date.now())
      
      toast.success('Password reset successfully! Please login with your new password.')
      setShowResetPassword(false)
      setResetPasswordData({ password: '', confirmPassword: '' })
      // Clear token from URL
      window.history.replaceState({}, '', '/admin/login')
      logger.functionExit('handleResetPassword', { success: true })
    } catch (error) {
      logger.error('Failed to reset password', error, {
        hasToken: !!resetToken,
        errorResponse: error.response?.data
      })
      setError(error.response?.data?.message || 'Failed to reset password')
      logger.functionExit('handleResetPassword', { success: false, error: error.message })
    } finally {
      setIsResetPasswordLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-neutral-900 mb-2">
              Admin Login
            </h1>
            <p className="text-neutral-600">
              Sign in to access the admin dashboard
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
            >
              <p className="text-red-600 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
                  placeholder="admin@techspert.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-12 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(true)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={isLoading}
            >
              Sign In
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-neutral-50 rounded-xl">
            <h3 className="text-sm font-medium text-neutral-700 mb-2">Demo Credentials:</h3>
            <div className="text-xs text-neutral-600 space-y-1">
              <p><strong>Super Admin:</strong></p>
              <p>Email: admin@techspert.com</p>
              <p>Password: admin123456</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={showForgotPasswordModal}
        onClose={() => {
          setShowForgotPasswordModal(false)
          setForgotPasswordEmail('')
          setError('')
        }}
        title="Forgot Password"
        size="md"
      >
        <form onSubmit={handleForgotPassword} className="space-y-6">
          <div>
            <label htmlFor="forgotEmail" className="block text-sm font-medium text-neutral-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              <input
                type="email"
                id="forgotEmail"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
                placeholder="admin@techspert.com"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForgotPasswordModal(false)
                setForgotPasswordEmail('')
                setError('')
              }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isForgotPasswordLoading}>
              Send Reset Link
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      {showResetPassword && (
        <Modal
          isOpen={showResetPassword}
          onClose={() => {
            setShowResetPassword(false)
            window.history.replaceState({}, '', '/admin/login')
          }}
          title="Reset Password"
          size="md"
        >
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="password"
                  id="newPassword"
                  value={resetPasswordData.password}
                  onChange={(e) => setResetPasswordData({ ...resetPasswordData, password: e.target.value })}
                  required
                  minLength={8}
                  className="w-full pl-12 pr-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
                  placeholder="Enter new password (min 8 characters)"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="password"
                  id="confirmPassword"
                  value={resetPasswordData.confirmPassword}
                  onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })}
                  required
                  minLength={8}
                  className="w-full pl-12 pr-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowResetPassword(false)
                  window.history.replaceState({}, '', '/admin/login')
                }}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isResetPasswordLoading}>
                Reset Password
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default AdminLogin