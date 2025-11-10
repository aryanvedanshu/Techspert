import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Users, BookOpen, Code, Award, TrendingUp, Eye, Plus, Settings, 
  Palette, Mail, Globe, Shield, BarChart3, Clock, DollarSign, 
  Star, Activity, AlertCircle, CheckCircle, XCircle, RefreshCw,
  UserCheck, HelpCircle, Phone, Target, Brain, Database
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../services/api'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'
import logger from '../../utils/logger'

const AdminDashboard = () => {
  const { isAuthenticated, user } = useAuth()
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalProjects: 0,
    totalAlumni: 0,
    totalStudents: 0,
    totalRevenue: 0,
    averageRating: 0,
    pendingProjects: 0,
    activeUsers: 0,
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [recentActivity, setRecentActivity] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createType, setCreateType] = useState('')

  // Real-time data fetching
  const fetchStats = async () => {
    logger.functionEntry('fetchStats')
    const startTime = Date.now()
    
    try {
      logger.debug('Starting to fetch dashboard stats', {
        endpoints: ['/admin/dashboard', '/admin/courses', '/admin/projects', '/alumni']
      })
      
      logger.apiRequest('GET', '/admin/dashboard')
      logger.apiRequest('GET', '/admin/courses')
      logger.apiRequest('GET', '/admin/projects')
      logger.apiRequest('GET', '/alumni')
      
      const [dashboardRes, coursesRes, projectsRes, alumniRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/courses'),
        api.get('/admin/projects'),
        api.get('/alumni'),
      ])
      
      logger.apiResponse('GET', '/admin/dashboard', dashboardRes.status, dashboardRes.data, Date.now() - startTime)
      logger.apiResponse('GET', '/admin/courses', coursesRes.status, { count: coursesRes.data.data?.length || 0 }, Date.now() - startTime)
      logger.apiResponse('GET', '/admin/projects', projectsRes.status, { count: projectsRes.data.data?.length || 0 }, Date.now() - startTime)
      logger.apiResponse('GET', '/alumni', alumniRes.status, { count: alumniRes.data.data?.length || 0 }, Date.now() - startTime)
      
      // Use dashboard stats from backend (real data)
      const dashboardStats = dashboardRes.data.data || {}
      const courses = coursesRes.data.data || []
      const projects = projectsRes.data.data || []
      const alumni = alumniRes.data.data || []
      
      // Calculate analytics from real data
      const totalRevenue = dashboardStats.totalRevenue || 0
      const averageRating = dashboardStats.averageRating || 0
      const pendingProjects = projects.filter(p => !p.isApproved).length
      
      setStats({
        totalCourses: dashboardStats.totalCourses || courses.length,
        totalProjects: dashboardStats.totalProjects || projects.length,
        totalAlumni: dashboardStats.totalAlumni || alumni.length,
        totalStudents: dashboardStats.totalStudents || 0,
        totalRevenue,
        averageRating: Math.round(averageRating * 10) / 10,
        pendingProjects: dashboardStats.pendingProjects || pendingProjects,
        activeUsers: dashboardStats.activeUsers || 0,
      })

      // Use real recent activity from dashboard or generate from data
      if (dashboardStats.recentActivity && dashboardStats.recentActivity.length > 0) {
        setRecentActivity(dashboardStats.recentActivity)
      } else {
        // Generate recent activity from actual data
        const activities = []
        
        // Recent courses
        const recentCourses = courses
          .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
          .slice(0, 2)
        recentCourses.forEach(course => {
          activities.push({
            id: `course-${course._id}`,
            type: 'course',
            action: course.isPublished ? 'published' : 'created',
            title: course.title,
            time: formatTimeAgo(course.updatedAt || course.createdAt),
            status: course.isPublished ? 'success' : 'pending'
          })
        })
        
        // Recent projects
        const recentProjects = projects
          .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
          .slice(0, 2)
        recentProjects.forEach(project => {
          activities.push({
            id: `project-${project._id}`,
            type: 'project',
            action: project.isApproved ? 'approved' : 'submitted',
            title: project.title,
            time: formatTimeAgo(project.updatedAt || project.createdAt),
            status: project.isApproved ? 'success' : 'pending'
          })
        })
        
        setRecentActivity(activities.slice(0, 4))
      }
      
      const duration = Date.now() - startTime
      logger.info('Dashboard stats fetched successfully', {
        totalCourses: stats.totalCourses,
        totalProjects: stats.totalProjects,
        totalAlumni: stats.totalAlumni,
        duration: `${duration}ms`
      })
      
      logger.functionExit('fetchStats', { duration: `${duration}ms` })
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('Failed to fetch dashboard stats', error, {
        duration: `${duration}ms`,
        errorMessage: error.message,
        errorResponse: error.response?.data,
        errorStatus: error.response?.status
      })
      
      logger.functionExit('fetchStats', { 
        success: false,
        error: error.message,
        duration: `${duration}ms`
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const formatTimeAgo = (date) => {
    if (!date) return 'Recently'
    const now = new Date()
    const past = new Date(date)
    const diffInSeconds = Math.floor((now - past) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    return `${Math.floor(diffInSeconds / 86400)} days ago`
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats()
      
      // Set up real-time updates every 30 seconds
      const interval = setInterval(() => {
        setRefreshing(true)
        fetchStats()
      }, 30000)
      
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchStats()
  }

  const handleCreate = (type) => {
    setCreateType(type)
    setShowCreateModal(true)
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  const dashboardCards = [
    {
      title: 'Total Courses',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600',
      link: '/admin/courses',
      description: 'Published courses',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Student Projects',
      value: stats.totalProjects,
      icon: Code,
      color: 'from-green-500 to-green-600',
      link: '/admin/projects',
      description: `${stats.pendingProjects} pending approval`,
      trend: '+8%',
      trendUp: true,
    },
    {
      title: 'Alumni Network',
      value: stats.totalAlumni,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      link: '/admin/alumni',
      description: 'Success stories',
      trend: '+5%',
      trendUp: true,
    },
    {
      title: 'Total Students',
      value: stats.totalStudents.toLocaleString(),
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      link: '#',
      description: 'Active learners',
      trend: '+15%',
      trendUp: true,
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
      link: '#',
      description: 'Course sales',
      trend: '+22%',
      trendUp: true,
    },
    {
      title: 'Average Rating',
      value: stats.averageRating,
      icon: Star,
      color: 'from-yellow-500 to-yellow-600',
      link: '#',
      description: 'Course quality',
      trend: '+0.3',
      trendUp: true,
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: Activity,
      color: 'from-indigo-500 to-indigo-600',
      link: '#',
      description: 'Online now',
      trend: '+3',
      trendUp: true,
    },
    {
      title: 'Pending Reviews',
      value: stats.pendingProjects,
      icon: Clock,
      color: 'from-red-500 to-red-600',
      link: '/admin/projects',
      description: 'Awaiting approval',
      trend: '-2',
      trendUp: false,
    },
  ]

  const quickActions = [
    {
      title: 'Add New Course',
      description: 'Create a new course with content and materials',
      icon: Plus,
      action: () => handleCreate('course'),
      color: 'bg-blue-500',
    },
    {
      title: 'Add New Project',
      description: 'Add a featured student project',
      icon: Code,
      action: () => handleCreate('project'),
      color: 'bg-green-500',
    },
    {
      title: 'Add Alumni Profile',
      description: 'Create a new alumni success story',
      icon: Users,
      action: () => handleCreate('alumni'),
      color: 'bg-purple-500',
    },
    {
      title: 'View Analytics',
      description: 'Check course performance and student engagement',
      icon: BarChart3,
      action: () => window.location.href = '/admin/analytics',
      color: 'bg-indigo-500',
    },
    {
      title: 'Site Settings',
      description: 'Configure site settings and preferences',
      icon: Settings,
      action: () => window.location.href = '/admin/settings',
      color: 'bg-gray-500',
    },
    {
      title: 'Refresh Data',
      description: 'Update all dashboard data',
      icon: RefreshCw,
      action: handleRefresh,
      color: 'bg-orange-500',
    },
  ]

  const contentManagementCards = [
    {
      title: 'User Management',
      description: 'Manage users, enrollments, and permissions',
      icon: UserCheck,
      link: '/admin/users',
      color: 'bg-blue-500',
    },
    {
      title: 'Analytics',
      description: 'View comprehensive platform analytics',
      icon: BarChart3,
      link: '/admin/analytics',
      color: 'bg-indigo-500',
    },
    {
      title: 'Team Management',
      description: 'Manage team members and instructors',
      icon: Users,
      link: '/admin/team',
      color: 'bg-green-500',
    },
    {
      title: 'Features',
      description: 'Manage website features and highlights',
      icon: Target,
      link: '/admin/features',
      color: 'bg-purple-500',
    },
    {
      title: 'Statistics',
      description: 'Manage website statistics and metrics',
      icon: TrendingUp,
      link: '/admin/statistics',
      color: 'bg-orange-500',
    },
    {
      title: 'FAQs',
      description: 'Manage frequently asked questions',
      icon: HelpCircle,
      link: '/admin/faqs',
      color: 'bg-yellow-500',
    },
    {
      title: 'Contact Info',
      description: 'Manage contact information and social links',
      icon: Phone,
      link: '/admin/contact-info',
      color: 'bg-pink-500',
    },
    {
      title: 'Content Management',
      description: 'Manage all website content and settings',
      icon: Database,
      link: '/admin/content',
      color: 'bg-teal-500',
    },
    {
      title: 'Site Settings',
      description: 'Configure site settings and preferences',
      icon: Settings,
      link: '/admin/settings',
      color: 'bg-gray-500',
    },
    {
      title: 'Admin Management',
      description: 'Manage admin accounts and permissions',
      icon: Shield,
      link: '/admin/admins',
      color: 'bg-red-500',
    },
  ]

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-heading font-bold text-neutral-900">
                Admin Dashboard
              </h1>
              <p className="text-neutral-600">
                Welcome back, {user?.name || 'Admin'} • Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Link to="/" className="text-primary-600 hover:text-primary-700">
                <Eye size={20} />
              </Link>
              <Button variant="outline" size="sm">
                <Settings size={16} className="mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardCards.map((card, index) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link to={card.link}>
                  <Card hover className="h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${card.color} rounded-xl flex items-center justify-center`}>
                        <Icon size={24} className="text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-neutral-900">
                          {loading ? '...' : card.value}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${card.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                            {card.trend}
                          </span>
                          <TrendingUp size={14} className={card.trendUp ? 'text-green-600' : 'text-red-600 rotate-180'} />
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">{card.description}</p>
                      <p className="text-xs text-neutral-500">{card.title}</p>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <h2 className="text-xl font-heading font-semibold text-neutral-900 mb-6">
                  Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon
                    return (
                      <button
                        key={action.title}
                        onClick={action.action}
                        className="block p-4 border border-neutral-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group text-left w-full"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
                            <Icon size={20} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors duration-200">
                              {action.title}
                            </h3>
                            <p className="text-sm text-neutral-600">
                              {action.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Content Management */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card>
                <h2 className="text-xl font-heading font-semibold text-neutral-900 mb-6">
                  Content Management
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contentManagementCards.map((card, index) => {
                    const Icon = card.icon
                    return (
                      <Link
                        key={card.title}
                        to={card.link}
                        className="block p-4 border border-neutral-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
                            <Icon size={20} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors duration-200">
                              {card.title}
                            </h3>
                            <p className="text-sm text-neutral-600">
                              {card.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <h2 className="text-xl font-heading font-semibold text-neutral-900 mb-6">
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => {
                    const getStatusIcon = (status) => {
                      switch (status) {
                        case 'success':
                          return <CheckCircle size={16} className="text-green-500" />
                        case 'pending':
                          return <Clock size={16} className="text-yellow-500" />
                        case 'error':
                          return <XCircle size={16} className="text-red-500" />
                        default:
                          return <Activity size={16} className="text-blue-500" />
                      }
                    }
                    
                    const getStatusColor = (status) => {
                      switch (status) {
                        case 'success':
                          return 'bg-green-500'
                        case 'pending':
                          return 'bg-yellow-500'
                        case 'error':
                          return 'bg-red-500'
                        default:
                          return 'bg-blue-500'
                      }
                    }

                    return (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className={`w-2 h-2 ${getStatusColor(activity.status)} rounded-full mt-2`}></div>
                        <div className="flex-1">
                          <p className="text-sm text-neutral-900">{activity.title}</p>
                          <p className="text-xs text-neutral-500">{activity.time}</p>
                        </div>
                        {getStatusIcon(activity.status)}
                      </div>
                    )
                  })}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={`Create New ${createType.charAt(0).toUpperCase() + createType.slice(1)}`}
      >
        <div className="p-6">
          {createType === 'course' && (
            <div className="space-y-4">
              <p className="text-neutral-600">Create a new course with comprehensive content and materials.</p>
              <div className="flex gap-4">
                <Button onClick={() => window.location.href = '/admin/courses'}>
                  Go to Course Management
                </Button>
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          {createType === 'project' && (
            <div className="space-y-4">
              <p className="text-neutral-600">Add a new student project to showcase their work.</p>
              <div className="flex gap-4">
                <Button onClick={() => window.location.href = '/admin/projects'}>
                  Go to Project Management
                </Button>
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          {createType === 'alumni' && (
            <div className="space-y-4">
              <p className="text-neutral-600">Create a new alumni success story profile.</p>
              <div className="flex gap-4">
                <Button onClick={() => window.location.href = '/admin/alumni'}>
                  Go to Alumni Management
                </Button>
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          {createType === 'analytics' && (
            <div className="space-y-4">
              <p className="text-neutral-600">View detailed analytics and performance metrics.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-neutral-200 rounded-lg">
                  <h4 className="font-semibold text-neutral-900 mb-2">Course Performance</h4>
                  <p className="text-sm text-neutral-600">View enrollment rates, completion rates, and student feedback.</p>
                </div>
                <div className="p-4 border border-neutral-200 rounded-lg">
                  <h4 className="font-semibold text-neutral-900 mb-2">User Engagement</h4>
                  <p className="text-sm text-neutral-600">Track user activity, session duration, and feature usage.</p>
                </div>
                <div className="p-4 border border-neutral-200 rounded-lg">
                  <h4 className="font-semibold text-neutral-900 mb-2">Revenue Analytics</h4>
                  <p className="text-sm text-neutral-600">Monitor sales, revenue trends, and conversion rates.</p>
                </div>
                <div className="p-4 border border-neutral-200 rounded-lg">
                  <h4 className="font-semibold text-neutral-900 mb-2">Content Insights</h4>
                  <p className="text-sm text-neutral-600">Analyze which content performs best and optimize accordingly.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default AdminDashboard