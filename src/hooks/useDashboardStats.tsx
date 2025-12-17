/**
 * useDashboardStats.tsx
 * 
 * Hook for fetching dashboard statistics.
 * Aggregates data from multiple collections.
 * 
 * @module hooks/useDashboardStats
 */

import { useState, useEffect, useCallback } from 'react'
import {
    coursesService,
    studentsService,
    enrollmentsService,
    transactionsService,
    projectsService,
    reviewsService,
} from '../services/firestoreTyped.service'
import { auditService } from '../services/audit.service'
import { AuditLog } from '../types'

// ============================================================================
// TYPES
// ============================================================================

export interface DashboardStats {
    totalCourses: number
    publishedCourses: number
    totalStudents: number
    activeStudents: number
    totalEnrollments: number
    monthlyEnrollments: number
    totalRevenue: number
    monthlyRevenue: number
    pendingProjects: number
    pendingReviews: number
}

export interface RevenueDataPoint {
    month: string
    revenue: number
    enrollments: number
}

export interface UseDashboardStatsReturn {
    stats: DashboardStats | null
    revenueData: RevenueDataPoint[]
    recentActivity: AuditLog[]
    loading: boolean
    error: string | null
    refresh: () => Promise<void>
}

// ============================================================================
// HOOK
// ============================================================================

export function useDashboardStats(): UseDashboardStatsReturn {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([])
    const [recentActivity, setRecentActivity] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchStats = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            // Fetch all counts in parallel
            const [
                coursesCount,
                publishedCoursesCount,
                studentsCount,
                activeStudentsCount,
                enrollmentsCount,
                pendingProjectsCount,
                pendingReviewsCount,
                activityLogs,
            ] = await Promise.all([
                coursesService.count(),
                coursesService.count([{ field: 'isPublished', operator: '==', value: true }]),
                studentsService.count(),
                studentsService.count([{ field: 'isActive', operator: '==', value: true }]),
                enrollmentsService.count(),
                projectsService.count([{ field: 'status', operator: '==', value: 'pending' }]),
                reviewsService.count([{ field: 'isApproved', operator: '==', value: false }]),
                auditService.getRecentLogs(10),
            ])

            // Get this month's data
            const now = new Date()
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

            // For simplicity, using client-side filtering for monthly stats
            // In production, use Firestore queries with timestamp comparisons
            const { data: allEnrollments } = await enrollmentsService.getAll({
                pagination: { limit: 1000 },
            })
            const { data: allTransactions } = await transactionsService.getAll({
                pagination: { limit: 1000 },
            })

            // Calculate monthly enrollments
            const monthlyEnrollments = allEnrollments.filter((e) => {
                const enrollDate = e.enrolledAt?.toDate?.() || new Date(0)
                return enrollDate >= startOfMonth
            }).length

            // Calculate revenue totals
            const totalRevenue = allTransactions
                .filter((t) => t.status === 'completed')
                .reduce((sum, t) => sum + t.amount, 0)

            const monthlyRevenue = allTransactions
                .filter((t) => {
                    const txDate = t.createdAt?.toDate?.() || new Date(0)
                    return t.status === 'completed' && txDate >= startOfMonth
                })
                .reduce((sum, t) => sum + t.amount, 0)

            // Build revenue chart data (last 6 months)
            const chartData: RevenueDataPoint[] = []
            for (let i = 5; i >= 0; i--) {
                const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
                const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
                const monthName = monthStart.toLocaleString('default', { month: 'short' })

                const monthRevenue = allTransactions
                    .filter((t) => {
                        const txDate = t.createdAt?.toDate?.() || new Date(0)
                        return t.status === 'completed' && txDate >= monthStart && txDate <= monthEnd
                    })
                    .reduce((sum, t) => sum + t.amount, 0)

                const monthEnrollments = allEnrollments.filter((e) => {
                    const enrollDate = e.enrolledAt?.toDate?.() || new Date(0)
                    return enrollDate >= monthStart && enrollDate <= monthEnd
                }).length

                chartData.push({
                    month: monthName,
                    revenue: monthRevenue,
                    enrollments: monthEnrollments,
                })
            }

            setStats({
                totalCourses: coursesCount,
                publishedCourses: publishedCoursesCount,
                totalStudents: studentsCount,
                activeStudents: activeStudentsCount,
                totalEnrollments: enrollmentsCount,
                monthlyEnrollments,
                totalRevenue,
                monthlyRevenue,
                pendingProjects: pendingProjectsCount,
                pendingReviews: pendingReviewsCount,
            })

            setRevenueData(chartData)
            setRecentActivity(activityLogs)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch stats')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    return {
        stats,
        revenueData,
        recentActivity,
        loading,
        error,
        refresh: fetchStats,
    }
}

export default useDashboardStats
