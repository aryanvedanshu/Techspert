import { createContext, useContext, useState, useEffect } from 'react'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../config/firebase'
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
  const [userData, setUserData] = useState(null) // Additional user data from Firestore
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [lastActivity, setLastActivity] = useState(Date.now())

  // Session timeout: 30 minutes (in milliseconds)
  const SESSION_TIMEOUT = 30 * 60 * 1000

  // Track user activity
  useEffect(() => {
    const updateActivity = () => {
      setLastActivity(Date.now())
    }

    // Listen to user activity events
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
      window.addEventListener(event, updateActivity)
    })

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity)
      })
    }
  }, [])

  // Check for session timeout
  useEffect(() => {
    if (!isAuthenticated) return

    const checkTimeout = setInterval(() => {
      const now = Date.now()
      const timeSinceLastActivity = now - lastActivity

      if (timeSinceLastActivity >= SESSION_TIMEOUT) {
        frontendAuthLogger.info('AuthContext', 'sessionTimeout', 'Session expired due to inactivity')
        toast.info('Your session has expired. Please log in again.')
        logout()
      }
    }, 60000) // Check every minute

    return () => clearInterval(checkTimeout)
  }, [isAuthenticated, lastActivity])

  useEffect(() => {
    frontendAuthLogger.info('AuthContext', 'initializeAuth', `Setting up Firebase Auth state listener`)

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      frontendAuthLogger.info('AuthContext', 'onAuthStateChanged', `Auth state changed`, {
        hasUser: !!firebaseUser,
        userId: firebaseUser?.uid
      })

      if (firebaseUser) {
        try {
          // Get additional user data from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid)
          const userDocSnap = await getDoc(userDocRef)

          let additionalData = null
          if (userDocSnap.exists()) {
            additionalData = { id: userDocSnap.id, ...userDocSnap.data() }
          } else {
            // If user document doesn't exist, check if it's an admin
            const adminDocRef = doc(db, 'admins', firebaseUser.uid)
            const adminDocSnap = await getDoc(adminDocRef)

            if (adminDocSnap.exists()) {
              additionalData = { id: adminDocSnap.id, ...adminDocSnap.data() }
            }
          }

          const userData = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            ...additionalData
          }

          const isAdminUser = additionalData?.role === 'admin' ||
            additionalData?.role === 'super-admin' ||
            additionalData?.isAdmin === true

          frontendAuthLogger.authStateChange('AuthContext', 'authenticated', {
            user: userData,
            isAdmin: isAdminUser
          })

          setUser(firebaseUser)
          setUserData(userData)
          setIsAuthenticated(true)
          setIsAdmin(isAdminUser)
          setLastActivity(Date.now()) // Reset activity timer on auth state change
        } catch (error) {
          frontendAuthLogger.error('AuthContext', 'onAuthStateChanged', `Error fetching user data`, {
            error: error.message,
            userId: firebaseUser.uid
          })

          // Still set basic user info even if Firestore fetch fails
          setUser(firebaseUser)
          setIsAuthenticated(true)
          setIsAdmin(false)
        }
      } else {
        frontendAuthLogger.info('AuthContext', 'onAuthStateChanged', `User signed out`)
        setUser(null)
        setUserData(null)
        setIsAuthenticated(false)
        setIsAdmin(false)
      }

      setLoading(false)
    })

    return () => {
      frontendAuthLogger.info('AuthContext', 'cleanup', `Unsubscribing from auth state listener`)
      unsubscribe()
    }
  }, [])

  const login = async (email, password, isAdminLogin = false) => {
    try {
      frontendAuthLogger.loginAttempt(email, isAdminLogin)
      frontendAuthLogger.info('AuthContext', 'login', `Starting Firebase login`, {
        email,
        isAdminLogin
      })

      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Get user data from Firestore
      let userDocRef = doc(db, 'users', firebaseUser.uid)
      let userDocSnap = await getDoc(userDocRef)

      let additionalData = null
      if (userDocSnap.exists()) {
        additionalData = { id: userDocSnap.id, ...userDocSnap.data() }
      } else if (isAdminLogin) {
        // Check admin collection
        const adminDocRef = doc(db, 'admins', firebaseUser.uid)
        const adminDocSnap = await getDoc(adminDocRef)

        if (adminDocSnap.exists()) {
          additionalData = { id: adminDocSnap.id, ...adminDocSnap.data() }
        } else {
          throw new Error('Admin account not found')
        }
      }

      const userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        emailVerified: firebaseUser.emailVerified,
        ...additionalData
      }

      // Check if user is admin
      const isAdminUser = additionalData?.role === 'admin' ||
        additionalData?.role === 'super-admin' ||
        additionalData?.isAdmin === true

      // If admin login was requested but user is not admin, throw error
      if (isAdminLogin && !isAdminUser) {
        await signOut(auth)
        throw new Error('Access denied. Admin account required.')
      }

      frontendAuthLogger.loginSuccess(email, userData, {})
      frontendAuthLogger.authStateChange('AuthContext', 'authenticated', {
        user: userData,
        isAdmin: isAdminUser
      })

      setUser(firebaseUser)
      setUserData(userData)
      setIsAuthenticated(true)
      setIsAdmin(isAdminUser)

      toast.success('Login successful!')
      return { success: true, user: userData }
    } catch (error) {
      const message = error.message || 'Login failed'

      frontendAuthLogger.loginFailure(email, message, error)
      frontendAuthLogger.error('AuthContext', 'login', `Login failed`, {
        email,
        error: error.message,
        code: error.code
      })

      // User-friendly error messages
      let errorMessage = message
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email'
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address'
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled'
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later'
      }

      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const register = async (email, password, additionalData = {}) => {
    try {
      frontendAuthLogger.info('AuthContext', 'register', `Starting Firebase registration`, { email })

      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Create user document in Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid)
      await setDoc(userDocRef, {
        email: firebaseUser.email,
        displayName: additionalData.name || additionalData.displayName || '',
        role: 'student',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...additionalData
      })

      // Update Firebase Auth profile if name provided
      if (additionalData.name || additionalData.displayName) {
        await updateProfile(firebaseUser, {
          displayName: additionalData.name || additionalData.displayName
        })
      }

      const userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        role: 'student',
        ...additionalData
      }

      frontendAuthLogger.info('AuthContext', 'register', `Registration successful`, { userId: firebaseUser.uid })

      toast.success('Registration successful!')
      return { success: true, user: userData }
    } catch (error) {
      const message = error.message || 'Registration failed'

      frontendAuthLogger.error('AuthContext', 'register', `Registration failed`, {
        email,
        error: error.message,
        code: error.code
      })

      let errorMessage = message
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters'
      }

      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    try {
      frontendAuthLogger.info('AuthContext', 'logout', `Logging out user`)
      await signOut(auth)

      setUser(null)
      setUserData(null)
      setIsAuthenticated(false)
      setIsAdmin(false)

      toast.success('Logged out successfully!')
    } catch (error) {
      frontendAuthLogger.error('AuthContext', 'logout', `Logout error`, {
        error: error.message
      })
      toast.error('Error logging out')
    }
  }

  const resetPassword = async (email) => {
    try {
      frontendAuthLogger.info('AuthContext', 'resetPassword', `Sending password reset email`, { email })
      await sendPasswordResetEmail(auth, email)
      toast.success('Password reset email sent!')
      return { success: true }
    } catch (error) {
      const message = error.message || 'Failed to send password reset email'
      frontendAuthLogger.error('AuthContext', 'resetPassword', `Password reset error`, {
        email,
        error: error.message
      })
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const value = {
    user,
    userData,
    isAuthenticated,
    isAdmin,
    loading,
    login,
    register,
    logout,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
