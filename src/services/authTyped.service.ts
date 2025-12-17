/**
 * authTyped.service.ts
 * 
 * Enhanced authentication service with role-based access control.
 * 
 * Features:
 * - Firebase Auth integration
 * - Role-based permissions (super-admin, admin, editor, viewer)
 * - Permission checking utilities
 * - Session management
 * - Admin user management
 * 
 * @module services/authTyped
 */

import {
    signInWithEmailAndPassword,
    signOut,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile,
    User,
    onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../config/firebase'
import { Admin, AdminRole, COLLECTIONS } from '../types'
import logger from '../utils/logger'

// ============================================================================
// TYPES
// ============================================================================

export interface AuthUser {
    uid: string
    email: string | null
    displayName: string | null
    photoURL: string | null
    emailVerified: boolean
}

export interface AdminUser extends AuthUser {
    role: AdminRole
    permissions: string[]
    isActive: boolean
}

export interface LoginResult {
    success: boolean
    user?: AdminUser
    error?: string
}

export interface PermissionConfig {
    [key: string]: AdminRole[]
}

// ============================================================================
// PERMISSION DEFINITIONS
// ============================================================================

/**
 * Permission configuration mapping actions to allowed roles
 */
export const PERMISSIONS: PermissionConfig = {
    // Dashboard
    'dashboard.view': ['super-admin', 'admin', 'editor', 'viewer'],

    // Courses
    'courses.view': ['super-admin', 'admin', 'editor', 'viewer'],
    'courses.create': ['super-admin', 'admin', 'editor'],
    'courses.edit': ['super-admin', 'admin', 'editor'],
    'courses.delete': ['super-admin', 'admin'],
    'courses.publish': ['super-admin', 'admin'],

    // Projects
    'projects.view': ['super-admin', 'admin', 'editor', 'viewer'],
    'projects.approve': ['super-admin', 'admin'],
    'projects.reject': ['super-admin', 'admin'],
    'projects.delete': ['super-admin', 'admin'],

    // Alumni
    'alumni.view': ['super-admin', 'admin', 'editor', 'viewer'],
    'alumni.create': ['super-admin', 'admin', 'editor'],
    'alumni.edit': ['super-admin', 'admin', 'editor'],
    'alumni.delete': ['super-admin', 'admin'],
    'alumni.approve': ['super-admin', 'admin'],

    // Trainers
    'trainers.view': ['super-admin', 'admin', 'editor', 'viewer'],
    'trainers.create': ['super-admin', 'admin'],
    'trainers.edit': ['super-admin', 'admin'],
    'trainers.delete': ['super-admin', 'admin'],

    // Team
    'team.view': ['super-admin', 'admin', 'editor', 'viewer'],
    'team.create': ['super-admin', 'admin'],
    'team.edit': ['super-admin', 'admin'],
    'team.delete': ['super-admin', 'admin'],

    // Settings (restricted to super-admin)
    'settings.view': ['super-admin', 'admin'],
    'settings.edit': ['super-admin'],

    // Theme
    'theme.view': ['super-admin', 'admin'],
    'theme.edit': ['super-admin'],

    // Homepage
    'homepage.view': ['super-admin', 'admin', 'editor'],
    'homepage.edit': ['super-admin', 'admin'],

    // Users/Students
    'users.view': ['super-admin', 'admin'],
    'users.edit': ['super-admin', 'admin'],
    'users.delete': ['super-admin'],

    // Admins (super-admin only)
    'admins.view': ['super-admin'],
    'admins.create': ['super-admin'],
    'admins.edit': ['super-admin'],
    'admins.delete': ['super-admin'],

    // Transactions
    'transactions.view': ['super-admin', 'admin'],
    'transactions.refund': ['super-admin'],

    // Audit Logs
    'audit.view': ['super-admin', 'admin'],

    // Coupons
    'coupons.view': ['super-admin', 'admin'],
    'coupons.create': ['super-admin', 'admin'],
    'coupons.edit': ['super-admin', 'admin'],
    'coupons.delete': ['super-admin'],
}

// ============================================================================
// AUTH SERVICE
// ============================================================================

class AuthTypedService {
    /**
     * Sign in with email and password for admin access
     */
    async signIn(email: string, password: string): Promise<LoginResult> {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const user = userCredential.user

            // Check if user is an admin
            const adminData = await this.getAdminData(user.uid)

            if (!adminData) {
                // Check users collection for admin role
                const userDoc = await getDoc(doc(db, COLLECTIONS.STUDENTS, user.uid))
                if (userDoc.exists()) {
                    const userData = userDoc.data()
                    if (userData.role === 'admin' || userData.role === 'super-admin') {
                        // User has admin role in users collection
                        const adminUser: AdminUser = {
                            uid: user.uid,
                            email: user.email,
                            displayName: user.displayName || userData.displayName,
                            photoURL: user.photoURL,
                            emailVerified: user.emailVerified,
                            role: userData.role as AdminRole,
                            permissions: [],
                            isActive: userData.isActive !== false,
                        }

                        // Update last login
                        await this.updateLastLogin(user.uid)

                        return { success: true, user: adminUser }
                    }
                }

                await signOut(auth)
                return { success: false, error: 'Access denied. Admin privileges required.' }
            }

            if (!adminData.isActive) {
                await signOut(auth)
                return { success: false, error: 'Account is deactivated. Contact super admin.' }
            }

            const adminUser: AdminUser = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || adminData.displayName,
                photoURL: user.photoURL,
                emailVerified: user.emailVerified,
                role: adminData.role,
                permissions: adminData.permissions || [],
                isActive: adminData.isActive,
            }

            // Update last login
            await this.updateLastLogin(user.uid)

            logger.info('Admin login successful', { uid: user.uid, role: adminData.role })

            return { success: true, user: adminUser }
        } catch (error: unknown) {
            const errorMessage = this.getAuthErrorMessage(error)
            logger.error('Admin login failed', error)
            return { success: false, error: errorMessage }
        }
    }

    /**
     * Sign out current user
     */
    async signOut(): Promise<void> {
        try {
            await signOut(auth)
            logger.info('Admin signed out')
        } catch (error) {
            logger.error('Sign out error', error)
            throw error
        }
    }

    /**
     * Get admin data from Firestore
     */
    async getAdminData(uid: string): Promise<Admin | null> {
        try {
            const adminDoc = await getDoc(doc(db, COLLECTIONS.ADMINS, uid))
            if (!adminDoc.exists()) return null
            return { id: adminDoc.id, ...adminDoc.data() } as Admin
        } catch (error) {
            logger.error('Error getting admin data', error)
            return null
        }
    }

    /**
     * Create a new admin user
     */
    async createAdmin(
        email: string,
        password: string,
        displayName: string,
        role: AdminRole
    ): Promise<LoginResult> {
        try {
            // Create Firebase Auth user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            const user = userCredential.user

            // Update profile
            await updateProfile(user, { displayName })

            // Create admin document
            const adminData: Omit<Admin, 'id'> = {
                email,
                displayName,
                role,
                permissions: [],
                isActive: true,
                createdAt: serverTimestamp() as any,
            }

            await setDoc(doc(db, COLLECTIONS.ADMINS, user.uid), adminData)

            logger.info('Admin created', { uid: user.uid, role })

            return {
                success: true,
                user: {
                    uid: user.uid,
                    email: user.email,
                    displayName,
                    photoURL: null,
                    emailVerified: false,
                    role,
                    permissions: [],
                    isActive: true,
                },
            }
        } catch (error: unknown) {
            const errorMessage = this.getAuthErrorMessage(error)
            logger.error('Create admin failed', error)
            return { success: false, error: errorMessage }
        }
    }

    /**
     * Send password reset email
     */
    async sendPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
        try {
            await sendPasswordResetEmail(auth, email)
            logger.info('Password reset email sent', { email })
            return { success: true }
        } catch (error: unknown) {
            const errorMessage = this.getAuthErrorMessage(error)
            logger.error('Password reset failed', error)
            return { success: false, error: errorMessage }
        }
    }

    /**
     * Update last login timestamp
     */
    private async updateLastLogin(uid: string): Promise<void> {
        try {
            const adminRef = doc(db, COLLECTIONS.ADMINS, uid)
            await updateDoc(adminRef, { lastLogin: serverTimestamp() })
        } catch (error) {
            // Non-critical, just log
            logger.warn('Failed to update last login', error)
        }
    }

    /**
     * Check if user has a specific permission
     */
    hasPermission(user: AdminUser | null, permission: string): boolean {
        if (!user) return false

        // Super admin has all permissions
        if (user.role === 'super-admin') return true

        // Check if permission exists
        const allowedRoles = PERMISSIONS[permission]
        if (!allowedRoles) return false

        // Check if user's role is in allowed roles
        return allowedRoles.includes(user.role)
    }

    /**
     * Check multiple permissions (all must pass)
     */
    hasAllPermissions(user: AdminUser | null, permissions: string[]): boolean {
        return permissions.every((p) => this.hasPermission(user, p))
    }

    /**
     * Check multiple permissions (any must pass)
     */
    hasAnyPermission(user: AdminUser | null, permissions: string[]): boolean {
        return permissions.some((p) => this.hasPermission(user, p))
    }

    /**
     * Get current user from Firebase Auth
     */
    getCurrentUser(): User | null {
        return auth.currentUser
    }

    /**
     * Subscribe to auth state changes
     */
    onAuthStateChange(callback: (user: User | null) => void): () => void {
        return onAuthStateChanged(auth, callback)
    }

    /**
     * Convert Firebase auth errors to user-friendly messages
     */
    private getAuthErrorMessage(error: unknown): string {
        const code = (error as { code?: string }).code || ''

        switch (code) {
            case 'auth/user-not-found':
                return 'No account found with this email.'
            case 'auth/wrong-password':
                return 'Incorrect password.'
            case 'auth/invalid-email':
                return 'Invalid email address.'
            case 'auth/user-disabled':
                return 'This account has been disabled.'
            case 'auth/too-many-requests':
                return 'Too many failed attempts. Please try again later.'
            case 'auth/email-already-in-use':
                return 'An account with this email already exists.'
            case 'auth/weak-password':
                return 'Password is too weak. Use at least 6 characters.'
            case 'auth/invalid-credential':
                return 'Invalid email or password.'
            default:
                return 'An error occurred. Please try again.'
        }
    }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const authTypedService = new AuthTypedService()

export default authTypedService
