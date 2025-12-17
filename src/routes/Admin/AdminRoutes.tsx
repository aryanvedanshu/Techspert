/**
 * AdminRoutes.tsx
 * 
 * Route configuration for the admin panel.
 * Includes protected routes with authentication guards.
 * 
 * @module routes/Admin/AdminRoutes
 */

import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { AdminAuthProvider, useAdminAuthContext, AdminGuard } from '../../contexts/AdminAuthContext'
import AdminLayout from '../../layouts/AdminLayout'

// ============================================================================
// LAZY IMPORTS
// ============================================================================

// Auth
const AdminLogin = lazy(() => import('./Auth/AdminLogin'))

// Dashboard
const AdminDashboard = lazy(() => import('./Dashboard/AdminDashboard'))

// Courses
const CoursesList = lazy(() => import('./Courses/CoursesList'))
const CreateCourse = lazy(() => import('./Courses/CreateCourse'))
const EditCourse = lazy(() => import('./Courses/EditCourse'))
const ViewCourse = lazy(() => import('./Courses/ViewCourse'))

// ============================================================================
// LOADING FALLBACK
// ============================================================================

function LoadingFallback() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 size={32} className="animate-spin text-primary-600" />
        </div>
    )
}

// ============================================================================
// PROTECTED ROUTE
// ============================================================================

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, loading } = useAdminAuthContext()
    const location = useLocation()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <Loader2 size={32} className="animate-spin text-primary-600" />
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />
    }

    return <>{children}</>
}

// ============================================================================
// ADMIN ROUTES COMPONENT
// ============================================================================

function AdminRoutesContent() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <Routes>
                {/* Login (public) */}
                <Route path="login" element={<AdminLogin />} />

                {/* Protected routes */}
                <Route
                    element={
                        <ProtectedRoute>
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    {/* Dashboard */}
                    <Route index element={<AdminDashboard />} />

                    {/* Courses */}
                    <Route path="courses">
                        <Route index element={<CoursesList />} />
                        <Route path="new" element={<CreateCourse />} />
                        <Route path=":id" element={<ViewCourse />} />
                        <Route path=":id/edit" element={<EditCourse />} />
                    </Route>

                    {/* Placeholder routes for other modules */}
                    <Route path="projects" element={<PlaceholderPage title="Projects" />} />
                    <Route path="alumni" element={<PlaceholderPage title="Alumni" />} />
                    <Route path="users/*" element={<PlaceholderPage title="Users" />} />
                    <Route path="content/*" element={<PlaceholderPage title="Content" />} />
                    <Route path="business/*" element={<PlaceholderPage title="Business" />} />
                    <Route path="appearance/*" element={<PlaceholderPage title="Appearance" />} />
                    <Route path="settings" element={<PlaceholderPage title="Settings" />} />
                    <Route path="admins" element={<PlaceholderPage title="Admin Users" />} />
                    <Route path="audit-logs" element={<PlaceholderPage title="Audit Logs" />} />

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/admin\" replace />} />
                </Route>
            </Routes>
        </Suspense>
    )
}

// ============================================================================
// PLACEHOLDER PAGE
// ============================================================================

function PlaceholderPage({ title }: { title: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="text-6xl mb-4">🚧</div>
            <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
            <p className="text-neutral-500 mt-2">This module is coming soon.</p>
            <p className="text-sm text-neutral-400 mt-1">
                Use the Courses module as a reference implementation.
            </p>
        </div>
    )
}

// ============================================================================
// EXPORT WITH PROVIDER
// ============================================================================

export default function AdminRoutes() {
    return (
        <AdminAuthProvider>
            <AdminRoutesContent />
        </AdminAuthProvider>
    )
}
