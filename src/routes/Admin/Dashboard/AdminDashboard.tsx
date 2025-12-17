/**
 * AdminDashboard.tsx
 * 
 * Main admin dashboard page with stats, charts, and activity feed.
 * 
 * @module routes/Admin/Dashboard/AdminDashboard
 */

import React from 'react'
import { Link } from 'react-router-dom'
import {
    BookOpen,
    Users,
    CreditCard,
    TrendingUp,
    Clock,
    Briefcase,
    MessageSquare,
    ArrowRight,
    RefreshCw,
} from 'lucide-react'
import { StatCard, Card, CardHeader, Button, StatusBadge } from '../../../components'
import { useDashboardStats } from '../../../hooks/useDashboardStats'
import { useAdminAuthContext } from '../../../contexts/AdminAuthContext'

// ============================================================================
// COMPONENT
// ============================================================================

export default function AdminDashboard() {
    const { user } = useAdminAuthContext()
    const { stats, revenueData, recentActivity, loading, refresh } = useDashboardStats()

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount)
    }

    // Format relative time
    const formatRelativeTime = (date: Date | undefined) => {
        if (!date) return 'Just now'

        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        return `${diffDays}d ago`
    }

    // Get action color
    const getActionColor = (action: string) => {
        switch (action) {
            case 'create':
                return 'bg-green-100 text-green-600'
            case 'update':
                return 'bg-blue-100 text-blue-600'
            case 'delete':
                return 'bg-red-100 text-red-600'
            case 'publish':
                return 'bg-purple-100 text-purple-600'
            default:
                return 'bg-neutral-100 text-neutral-600'
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">
                        Welcome back, {user?.displayName?.split(' ')[0] || 'Admin'}!
                    </h1>
                    <p className="text-neutral-500 mt-1">
                        Here's what's happening with your platform today.
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={refresh}
                    loading={loading}
                    icon={<RefreshCw size={18} />}
                >
                    Refresh
                </Button>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Courses"
                    value={stats?.totalCourses || 0}
                    icon={<BookOpen size={24} />}
                    color="primary"
                    change={stats?.publishedCourses ? Math.round((stats.publishedCourses / stats.totalCourses) * 100) : 0}
                    changeLabel="published"
                    loading={loading}
                />
                <StatCard
                    title="Total Students"
                    value={stats?.totalStudents || 0}
                    icon={<Users size={24} />}
                    color="success"
                    change={stats?.activeStudents ? Math.round((stats.activeStudents / stats.totalStudents) * 100) : 0}
                    changeLabel="active"
                    loading={loading}
                />
                <StatCard
                    title="Monthly Revenue"
                    value={formatCurrency(stats?.monthlyRevenue || 0)}
                    icon={<CreditCard size={24} />}
                    color="info"
                    change={stats?.totalRevenue ? Math.round((stats.monthlyRevenue || 0) / (stats.totalRevenue / 12) * 100 - 100) : 0}
                    changeLabel="vs avg"
                    loading={loading}
                />
                <StatCard
                    title="Monthly Enrollments"
                    value={stats?.monthlyEnrollments || 0}
                    icon={<TrendingUp size={24} />}
                    color="warning"
                    loading={loading}
                />
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue chart (placeholder) */}
                <Card className="lg:col-span-2">
                    <CardHeader
                        title="Revenue Overview"
                        subtitle="Last 6 months"
                        action={
                            <Link
                                to="/admin/business/transactions"
                                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                            >
                                View all <ArrowRight size={14} />
                            </Link>
                        }
                    />
                    <div className="h-64 flex items-end gap-4 mt-4">
                        {revenueData.map((data, index) => {
                            const maxRevenue = Math.max(...revenueData.map((d) => d.revenue), 1)
                            const height = (data.revenue / maxRevenue) * 100

                            return (
                                <div key={data.month} className="flex-1 flex flex-col items-center">
                                    <div
                                        className="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg transition-all hover:from-primary-600 hover:to-primary-500"
                                        style={{ height: `${Math.max(height, 5)}%` }}
                                    />
                                    <span className="text-xs text-neutral-500 mt-2">{data.month}</span>
                                </div>
                            )
                        })}
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-neutral-100">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-primary-500" />
                            <span className="text-sm text-neutral-600">Revenue</span>
                        </div>
                    </div>
                </Card>

                {/* Quick actions */}
                <Card>
                    <CardHeader title="Quick Actions" />
                    <div className="space-y-3 mt-4">
                        <Link
                            to="/admin/courses/new"
                            className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-all"
                        >
                            <div className="p-2 rounded-lg bg-primary-100 text-primary-600">
                                <BookOpen size={20} />
                            </div>
                            <div>
                                <p className="font-medium text-neutral-900">Add New Course</p>
                                <p className="text-sm text-neutral-500">Create a new course</p>
                            </div>
                        </Link>

                        {stats?.pendingProjects && stats.pendingProjects > 0 ? (
                            <Link
                                to="/admin/projects?status=pending"
                                className="flex items-center gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-all"
                            >
                                <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                                    <Briefcase size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-neutral-900">Pending Projects</p>
                                    <p className="text-sm text-amber-600">{stats.pendingProjects} awaiting review</p>
                                </div>
                            </Link>
                        ) : null}

                        {stats?.pendingReviews && stats.pendingReviews > 0 ? (
                            <Link
                                to="/admin/content/reviews?approved=false"
                                className="flex items-center gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-all"
                            >
                                <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                                    <MessageSquare size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-neutral-900">Pending Reviews</p>
                                    <p className="text-sm text-amber-600">{stats.pendingReviews} to moderate</p>
                                </div>
                            </Link>
                        ) : null}
                    </div>
                </Card>
            </div>

            {/* Activity feed */}
            <Card>
                <CardHeader
                    title="Recent Activity"
                    action={
                        <Link
                            to="/admin/audit-logs"
                            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                        >
                            View all <ArrowRight size={14} />
                        </Link>
                    }
                />
                <div className="mt-4 space-y-4">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-start gap-4 animate-pulse">
                                    <div className="w-10 h-10 rounded-full bg-neutral-200" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-neutral-200 rounded w-3/4" />
                                        <div className="h-3 bg-neutral-200 rounded w-1/4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : recentActivity.length === 0 ? (
                        <p className="text-neutral-500 text-center py-8">No recent activity</p>
                    ) : (
                        recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-4">
                                <div className={`p-2 rounded-full ${getActionColor(activity.action)}`}>
                                    <Clock size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-neutral-900">
                                        <span className="font-medium">{activity.adminEmail || 'Admin'}</span>
                                        {' '}
                                        <span className="text-neutral-600">
                                            {activity.action}d a {activity.collection.replace(/_/g, ' ')}
                                        </span>
                                    </p>
                                    <p className="text-xs text-neutral-500 mt-0.5">
                                        {formatRelativeTime(activity.createdAt?.toDate?.())}
                                    </p>
                                </div>
                                <StatusBadge status={activity.action} size="sm" />
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    )
}
