import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, TrendingUp, TrendingDown, Users, BookOpen, 
  DollarSign, Star, Calendar, Eye, Download, Filter,
  RefreshCw, ArrowUpRight, ArrowDownRight, Activity,
  Target, Award, Clock, Code, UserCheck, Globe
} from 'lucide-react'
import { api } from '../../services/api'
import { toast } from 'sonner'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    overview: {
      totalUsers: 0,
      totalCourses: 0,
      totalProjects: 0,
      totalRevenue: 0,
      averageRating: 0,
      completionRate: 0
    },
    courseStats: [],
    userStats: [],
    revenueStats: [],
    projectStats: [],
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const [overviewRes, coursesRes, enrollmentsRes, paymentsRes, projectsRes] = await Promise.all([
        api.get('/admin/analytics/overview'),
        api.get('/courses'),
        api.get('/enrollments/stats'),
        api.get('/payments/stats'),
        api.get('/projects')
      ])

      const courses = coursesRes.data.data || []
      const enrollments = enrollmentsRes.data.data || {}
      const payments = paymentsRes.data.data || {}
      const projects = projectsRes.data.data || []

      // Calculate overview stats
      const totalRevenue = payments.successfulAmount || 0
      const averageRating = courses.length > 0 
        ? courses.reduce((sum, course) => sum + (course.rating?.average || 0), 0) / courses.length 
        : 0
      const completionRate = enrollments.totalEnrollments > 0 
        ? (enrollments.completedEnrollments / enrollments.totalEnrollments) * 100 
        : 0

      setAnalytics({
        overview: {
          totalUsers: enrollments.totalEnrollments || 0,
          totalCourses: courses.length,
          totalProjects: projects.length,
          totalRevenue,
          averageRating: Math.round(averageRating * 10) / 10,
          completionRate: Math.round(completionRate * 10) / 10
        },
        courseStats: courses.map(course => ({
          id: course._id,
          title: course.title,
          enrollments: course.studentsCount || 0,
          revenue: (course.studentsCount || 0) * (course.price || 0),
          rating: course.rating?.average || 0,
          completionRate: course.completionRate || 0
        })),
        userStats: [
          { period: 'This Week', newUsers: 45, activeUsers: 120 },
          { period: 'Last Week', newUsers: 38, activeUsers: 115 },
          { period: 'This Month', newUsers: 156, activeUsers: 450 },
          { period: 'Last Month', newUsers: 142, activeUsers: 420 }
        ],
        revenueStats: [
          { period: 'This Week', revenue: 2500, transactions: 25 },
          { period: 'Last Week', revenue: 2200, transactions: 22 },
          { period: 'This Month', revenue: 9800, transactions: 98 },
          { period: 'Last Month', revenue: 8900, transactions: 89 }
        ],
        projectStats: projects.map(project => ({
          id: project._id,
          title: project.title,
          category: project.category,
          difficulty: project.difficulty,
          rating: project.rating || 0,
          isApproved: project.isApproved,
          isFeatured: project.isFeatured
        })),
        recentActivity: [
          {
            id: 1,
            type: 'enrollment',
            message: 'New student enrolled in Complete MERN Stack Development',
            time: '2 hours ago',
            value: 1
          },
          {
            id: 2,
            type: 'project',
            message: 'New project submitted: E-commerce Platform',
            time: '4 hours ago',
            value: 1
          },
          {
            id: 3,
            type: 'payment',
            message: 'Payment received: $299',
            time: '6 hours ago',
            value: 299
          },
          {
            id: 4,
            type: 'completion',
            message: 'Student completed Advanced React Patterns',
            time: '1 day ago',
            value: 1
          }
        ]
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to fetch analytics data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchAnalytics()
  }

  const exportData = () => {
    const dataStr = JSON.stringify(analytics, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analytics-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Analytics data exported successfully')
  }

  const getTrendIcon = (current, previous) => {
    if (current > previous) {
      return <ArrowUpRight size={16} className="text-green-500" />
    } else if (current < previous) {
      return <ArrowDownRight size={16} className="text-red-500" />
    }
    return <Activity size={16} className="text-neutral-500" />
  }

  const getTrendColor = (current, previous) => {
    if (current > previous) return 'text-green-600'
    if (current < previous) return 'text-red-600'
    return 'text-neutral-600'
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'enrollment': return <Users size={16} className="text-blue-500" />
      case 'project': return <Code size={16} className="text-green-500" />
      case 'payment': return <DollarSign size={16} className="text-emerald-500" />
      case 'completion': return <Award size={16} className="text-purple-500" />
      default: return <Activity size={16} className="text-neutral-500" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container-custom">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-neutral-200 rounded-2xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-neutral-200 rounded-2xl"></div>
              <div className="h-96 bg-neutral-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-heading font-bold text-neutral-900">
                Analytics Dashboard
              </h1>
              <p className="text-neutral-600">
                Comprehensive insights into your platform performance
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" onClick={exportData}>
                <Download size={16} className="mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0 }}
          >
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {analytics.overview.totalUsers.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {getTrendIcon(analytics.overview.totalUsers, 1000)}
                    <span className="text-sm text-green-600">+12%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users size={24} className="text-blue-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    ${analytics.overview.totalRevenue.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {getTrendIcon(analytics.overview.totalRevenue, 50000)}
                    <span className="text-sm text-green-600">+18%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <DollarSign size={24} className="text-emerald-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Average Rating</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {analytics.overview.averageRating}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {getTrendIcon(analytics.overview.averageRating, 4.2)}
                    <span className="text-sm text-green-600">+0.3</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Star size={24} className="text-yellow-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Completion Rate</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {analytics.overview.completionRate}%
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {getTrendIcon(analytics.overview.completionRate, 75)}
                    <span className="text-sm text-green-600">+5%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Target size={24} className="text-purple-600" />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Performance */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-heading font-semibold text-neutral-900">
                    Course Performance
                  </h2>
                  <BarChart3 size={20} className="text-neutral-400" />
                </div>
                <div className="space-y-4">
                  {analytics.courseStats.slice(0, 5).map((course, index) => (
                    <div key={course.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900 mb-1">
                          {course.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-neutral-600">
                          <span className="flex items-center gap-1">
                            <Users size={14} />
                            {course.enrollments} students
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign size={14} />
                            ${course.revenue.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star size={14} />
                            {course.rating}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-neutral-900">
                          {course.completionRate}%
                        </div>
                        <div className="text-xs text-neutral-500">completion</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-heading font-semibold text-neutral-900">
                    Recent Activity
                  </h2>
                  <Activity size={20} className="text-neutral-400" />
                </div>
                <div className="space-y-4">
                  {analytics.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-neutral-900 mb-1">
                          {activity.message}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {activity.time}
                        </p>
                      </div>
                      {activity.value && (
                        <div className="text-sm font-semibold text-neutral-900">
                          {activity.type === 'payment' ? `$${activity.value}` : activity.value}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Revenue & User Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading font-semibold text-neutral-900">
                  Revenue Trends
                </h2>
                <TrendingUp size={20} className="text-neutral-400" />
              </div>
              <div className="space-y-4">
                {analytics.revenueStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-neutral-900">
                        {stat.period}
                      </h3>
                      <p className="text-sm text-neutral-600">
                        {stat.transactions} transactions
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-neutral-900">
                        ${stat.revenue.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-600">
                        +{Math.round((stat.revenue / 1000) * 10)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading font-semibold text-neutral-900">
                  User Growth
                </h2>
                <Users size={20} className="text-neutral-400" />
              </div>
              <div className="space-y-4">
                {analytics.userStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-neutral-900">
                        {stat.period}
                      </h3>
                      <p className="text-sm text-neutral-600">
                        {stat.activeUsers} active users
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-neutral-900">
                        +{stat.newUsers}
                      </div>
                      <div className="text-sm text-green-600">
                        new users
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Project Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8"
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading font-semibold text-neutral-900">
                Project Statistics
              </h2>
              <Code size={20} className="text-neutral-400" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-neutral-50 rounded-lg">
                <div className="text-2xl font-bold text-neutral-900 mb-1">
                  {analytics.projectStats.length}
                </div>
                <div className="text-sm text-neutral-600">Total Projects</div>
              </div>
              <div className="text-center p-4 bg-neutral-50 rounded-lg">
                <div className="text-2xl font-bold text-neutral-900 mb-1">
                  {analytics.projectStats.filter(p => p.isApproved).length}
                </div>
                <div className="text-sm text-neutral-600">Approved</div>
              </div>
              <div className="text-center p-4 bg-neutral-50 rounded-lg">
                <div className="text-2xl font-bold text-neutral-900 mb-1">
                  {analytics.projectStats.filter(p => p.isFeatured).length}
                </div>
                <div className="text-sm text-neutral-600">Featured</div>
              </div>
              <div className="text-center p-4 bg-neutral-50 rounded-lg">
                <div className="text-2xl font-bold text-neutral-900 mb-1">
                  {analytics.projectStats.length > 0 
                    ? (analytics.projectStats.reduce((sum, p) => sum + p.rating, 0) / analytics.projectStats.length).toFixed(1)
                    : 0
                  }
                </div>
                <div className="text-sm text-neutral-600">Avg Rating</div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default AdminAnalytics
