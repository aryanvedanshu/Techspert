import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Users, BookOpen, Code, Award, TrendingUp, Eye, Plus, Settings, 
  Palette, Mail, Globe, Shield, BarChart3, Clock, DollarSign, 
  Star, Activity, AlertCircle, CheckCircle, XCircle, RefreshCw,
  UserCheck, HelpCircle, Phone, Target, Brain, Database
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../services/api'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'

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
    try {
      const [coursesRes, projectsRes, alumniRes, settingsRes] = await Promise.all([
        api.get('/courses'),
        api.get('/projects'),
        api.get('/alumni'),
        api.get('/settings'),
      ])
      
      const courses = coursesRes.data.courses || []
      const projects = projectsRes.data.projects || []
      const alumni = alumniRes.data.alumni || []
      
      // Calculate analytics
      const totalRevenue = courses.reduce((sum, course) => sum + (course.price || 0), 0)
      const averageRating = courses.length > 0 
        ? courses.reduce((sum, course) => sum + (course.rating?.average || 0), 0) / courses.length 
        : 0
      const pendingProjects = projects.filter(p => !p.isApproved).length
      
      setStats({
        totalCourses: courses.length,
        totalProjects: projects.length,
        totalAlumni: alumni.length,
        totalStudents: 1250, // Mock data - would come from user analytics
        totalRevenue,
        averageRating: Math.round(averageRating * 10) / 10,
        pendingProjects,
        activeUsers: 45, // Mock data - would come from user analytics
      })

      // Generate recent activity
      setRecentActivity([
        {
          id: 1,
          type: 'course',
          action: 'published',
          title: 'New AI Course Published',
          time: '2 hours ago',
          status: 'success'
        },
        {
          id: 2,
          type: 'project',
          action: 'submitted',
          title: 'Student Project Submitted',
          time: '4 hours ago',
          status: 'pending'
        },
        {
          id: 3,
          type: 'alumni',
          action: 'updated',
          title: 'Alumni Profile Updated',
          time: '1 day ago',
          status: 'success'
        },
        {
          id: 4,
          type: 'user',
          action: 'enrolled',
          title: 'New Student Enrolled',
          time: '2 days ago',
          status: 'success'
        }
      ])
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
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
      action: () => handleCreate('analytics'),
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
      title: 'Team Management',
      description: 'Manage team members and instructors',
      icon: UserCheck,
      link: '/admin/team',
      color: 'bg-blue-500',
    },
    {
      title: 'Features',
      description: 'Manage website features and highlights',
      icon: Target,
      link: '/admin/features',
      color: 'bg-green-500',
    },
    {
      title: 'Statistics',
      description: 'Manage website statistics and metrics',
      icon: BarChart3,
      link: '/admin/statistics',
      color: 'bg-purple-500',
    },
    {
      title: 'FAQs',
      description: 'Manage frequently asked questions',
      icon: HelpCircle,
      link: '/admin/faqs',
      color: 'bg-orange-500',
    },
    {
      title: 'Contact Info',
      description: 'Manage contact information and social links',
      icon: Phone,
      link: '/admin/contact-info',
      color: 'bg-indigo-500',
    },
    {
      title: 'Site Settings',
      description: 'Configure site settings and preferences',
      icon: Settings,
      link: '/admin/settings',
      color: 'bg-gray-500',
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