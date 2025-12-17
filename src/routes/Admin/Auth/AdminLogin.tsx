/**
 * AdminLogin.tsx
 * 
 * Admin login page with email/password authentication.
 * 
 * @module routes/Admin/Auth/AdminLogin
 */

import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'
import { useAdminAuthContext } from '../../../contexts/AdminAuthContext'
import { Button } from '../../../components'

// ============================================================================
// COMPONENT
// ============================================================================

export default function AdminLogin() {
    const navigate = useNavigate()
    const location = useLocation()
    const { login, isAuthenticated, loading: authLoading } = useAdminAuthContext()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin'
            navigate(from, { replace: true })
        }
    }, [isAuthenticated, navigate, location])

    // Handle submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!email || !password) {
            setError('Please enter both email and password')
            return
        }

        setLoading(true)
        const result = await login(email, password)

        if (!result.success) {
            setError(result.error || 'Login failed')
        }
        setLoading(false)
    }

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 p-4">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary-600">Techspert</h1>
                    <p className="text-neutral-500 mt-2">Admin Panel</p>
                </div>

                {/* Login card */}
                <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-8">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold text-neutral-900">Welcome back</h2>
                        <p className="text-neutral-500 mt-1">Sign in to your admin account</p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700">
                            <AlertCircle size={20} className="shrink-0 mt-0.5" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                                Email address
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@techspert.com"
                                autoComplete="email"
                                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    className="w-full px-4 py-3 pr-12 border border-neutral-200 rounded-lg focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember me / Forgot */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="text-sm text-neutral-600">Remember me</span>
                            </label>
                            <button
                                type="button"
                                className="text-sm text-primary-600 hover:text-primary-700"
                                onClick={() => {/* TODO: Implement forgot password */ }}
                            >
                                Forgot password?
                            </button>
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            fullWidth
                            loading={loading}
                            icon={<LogIn size={18} />}
                            className="py-3"
                        >
                            Sign in
                        </Button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-neutral-500 mt-6">
                    Need help?{' '}
                    <a href="mailto:support@techspert.com" className="text-primary-600 hover:text-primary-700">
                        Contact support
                    </a>
                </p>
            </div>
        </div>
    )
}
