/**
 * useAdminAuth.tsx
 * 
 * React hook for admin authentication with role-based access control.
 * Provides authentication state, login/logout functions, and permission checking.
 * 
 * Features:
 * - Auto-login detection on mount
 * - Session timeout (30 minutes inactivity)
 * - Permission checking helpers
 * - Loading states
 * 
 * @module hooks/useAdminAuth
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { User } from 'firebase/auth'
import { authTypedService, AdminUser, PERMISSIONS } from '../services/authTyped.service'
import logger from '../utils/logger'

// ============================================================================
// TYPES
// ============================================================================

export interface UseAdminAuthReturn {
    // State
    user: AdminUser | null
    loading: boolean
    isAuthenticated: boolean

    // Auth actions
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
    logout: () => Promise<void>

    // Permission helpers
    hasPermission: (permission: string) => boolean
    hasAnyPermission: (permissions: string[]) => boolean
    hasAllPermissions: (permissions: string[]) => boolean

    // Role helpers
    isSuperAdmin: boolean
    isAdmin: boolean
    isEditor: boolean
    isViewer: boolean
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']

// ============================================================================
// HOOK
// ============================================================================

export function useAdminAuth(): UseAdminAuthReturn {
    const [user, setUser] = useState<AdminUser | null>(null)
    const [loading, setLoading] = useState(true)
    const lastActivityRef = useRef<number>(Date.now())
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Reset activity timer
    const resetActivityTimer = useCallback(() => {
        lastActivityRef.current = Date.now()
    }, [])

    // Check for session timeout
    const checkSessionTimeout = useCallback(async () => {
        if (!user) return

        const timeSinceActivity = Date.now() - lastActivityRef.current
        if (timeSinceActivity >= SESSION_TIMEOUT_MS) {
            logger.info('Session timeout - auto logout')
            await authTypedService.signOut()
            setUser(null)
        }
    }, [user])

    // Handle auth state changes
    useEffect(() => {
        const unsubscribe = authTypedService.onAuthStateChange(async (firebaseUser: User | null) => {
            if (firebaseUser) {
                // Fetch admin data
                const adminData = await authTypedService.getAdminData(firebaseUser.uid)

                if (adminData) {
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName || adminData.displayName,
                        photoURL: firebaseUser.photoURL,
                        emailVerified: firebaseUser.emailVerified,
                        role: adminData.role,
                        permissions: adminData.permissions || [],
                        isActive: adminData.isActive,
                    })
                } else {
                    // Not an admin
                    setUser(null)
                }
            } else {
                setUser(null)
            }
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    // Set up activity tracking for session timeout
    useEffect(() => {
        if (!user) return

        // Add event listeners for activity tracking
        ACTIVITY_EVENTS.forEach((event) => {
            window.addEventListener(event, resetActivityTimer)
        })

        // Set up interval to check session timeout
        timeoutRef.current = setInterval(checkSessionTimeout, 60000) // Check every minute

        return () => {
            ACTIVITY_EVENTS.forEach((event) => {
                window.removeEventListener(event, resetActivityTimer)
            })
            if (timeoutRef.current) {
                clearInterval(timeoutRef.current)
            }
        }
    }, [user, resetActivityTimer, checkSessionTimeout])

    // Login function
    const login = useCallback(async (email: string, password: string) => {
        setLoading(true)
        const result = await authTypedService.signIn(email, password)

        if (result.success && result.user) {
            setUser(result.user)
            resetActivityTimer()
        }

        setLoading(false)
        return result
    }, [resetActivityTimer])

    // Logout function
    const logout = useCallback(async () => {
        setLoading(true)
        await authTypedService.signOut()
        setUser(null)
        setLoading(false)
    }, [])

    // Permission checking
    const hasPermission = useCallback(
        (permission: string) => authTypedService.hasPermission(user, permission),
        [user]
    )

    const hasAnyPermission = useCallback(
        (permissions: string[]) => authTypedService.hasAnyPermission(user, permissions),
        [user]
    )

    const hasAllPermissions = useCallback(
        (permissions: string[]) => authTypedService.hasAllPermissions(user, permissions),
        [user]
    )

    // Role helpers
    const isSuperAdmin = user?.role === 'super-admin'
    const isAdmin = user?.role === 'admin' || isSuperAdmin
    const isEditor = user?.role === 'editor' || isAdmin
    const isViewer = user?.role === 'viewer' || isEditor

    return {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        isSuperAdmin,
        isAdmin,
        isEditor,
        isViewer,
    }
}

// ============================================================================
// EXPORT PERMISSIONS FOR REFERENCE
// ============================================================================

export { PERMISSIONS }
