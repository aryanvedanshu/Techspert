/**
 * AdminAuthContext.tsx
 * 
 * React Context for admin authentication.
 * Wraps the useAdminAuth hook to provide authentication state throughout the admin panel.
 * 
 * Usage:
 *   // Wrap your admin routes
 *   <AdminAuthProvider>
 *     <AdminRoutes />
 *   </AdminAuthProvider>
 * 
 *   // Use in components
 *   const { user, hasPermission, logout } = useAdminAuthContext()
 * 
 * @module contexts/AdminAuthContext
 */

import React, { createContext, useContext, ReactNode } from 'react'
import { useAdminAuth, UseAdminAuthReturn } from '../hooks/useAdminAuth'

// ============================================================================
// CONTEXT
// ============================================================================

const AdminAuthContext = createContext<UseAdminAuthReturn | null>(null)

// ============================================================================
// PROVIDER
// ============================================================================

interface AdminAuthProviderProps {
    children: ReactNode
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
    const auth = useAdminAuth()

    return (
        <AdminAuthContext.Provider value={auth}>
            {children}
        </AdminAuthContext.Provider>
    )
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to access admin auth context
 * @throws Error if used outside AdminAuthProvider
 */
export function useAdminAuthContext(): UseAdminAuthReturn {
    const context = useContext(AdminAuthContext)

    if (!context) {
        throw new Error('useAdminAuthContext must be used within AdminAuthProvider')
    }

    return context
}

// ============================================================================
// GUARD COMPONENT
// ============================================================================

interface AdminGuardProps {
    children: ReactNode
    permission?: string
    permissions?: string[]
    requireAll?: boolean // If true, requires all permissions; if false, requires any
    fallback?: ReactNode
    loadingFallback?: ReactNode
}

/**
 * Component that guards children based on authentication and permissions
 */
export function AdminGuard({
    children,
    permission,
    permissions,
    requireAll = true,
    fallback = null,
    loadingFallback = <div className="flex items-center justify-center p-8">Loading...</div>,
}: AdminGuardProps) {
    const { isAuthenticated, loading, hasPermission, hasAnyPermission, hasAllPermissions } = useAdminAuthContext()

    if (loading) {
        return <>{loadingFallback}</>
    }

    if (!isAuthenticated) {
        return <>{fallback}</>
    }

    // Check single permission
    if (permission && !hasPermission(permission)) {
        return <>{fallback}</>
    }

    // Check multiple permissions
    if (permissions && permissions.length > 0) {
        const hasAccess = requireAll
            ? hasAllPermissions(permissions)
            : hasAnyPermission(permissions)

        if (!hasAccess) {
            return <>{fallback}</>
        }
    }

    return <>{children}</>
}

// ============================================================================
// PERMISSION DISPLAY COMPONENT
// ============================================================================

interface ShowForRoleProps {
    children: ReactNode
    roles: Array<'super-admin' | 'admin' | 'editor' | 'viewer'>
}

/**
 * Component that only shows children for specific roles
 */
export function ShowForRole({ children, roles }: ShowForRoleProps) {
    const { user } = useAdminAuthContext()

    if (!user || !roles.includes(user.role)) {
        return null
    }

    return <>{children}</>
}

// ============================================================================
// EXPORTS
// ============================================================================

export { AdminAuthContext }
