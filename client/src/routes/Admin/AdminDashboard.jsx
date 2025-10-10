import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, BookOpen, Code, Award, TrendingUp, Eye, Plus, Settings } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../services/api'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'

const AdminDashboard = () => {
  const { isAuthenticated, user } = useAuth()
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalProjects: 0,
    totalAlumni: 0,
    totalStudents: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [coursesRes, projectsRes, alumniRes] = await Promise.all([
          api.get('/courses'),
          api.get('/projects'),
          api.get('/alumni'),
        ])
        
        setStats({
          totalCourses: coursesRes.data.length,
          totalProjects: projectsRes.data.length,
          totalAlumni: alumniRes.data.length,
          totalStudents: 1250, // Mock data
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchStats()
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  const dashboardCards = [
    {
      title: 'Courses',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600',
      link: '/admin/courses',
      description: 'Manage course content',
    },
    {
      title: 'Projects',
      value: stats.totalProjects,
      icon: Code,
      color: 'from-green-500 to-green-600',
      link: '/admin/projects',
      description: 'Student projects',
    },
    {
      title: 'Alumni',
      value: stats.totalAlumni,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      link: '/admin/alumni',
      description: 'Graduate profiles',
    },
    {
      title: 'Students',
      value: stats.totalStudents,
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      link: '#',
      description: 'Total enrolled',
    },
  ]

  const quickActions = [
    {
      title: 'Add New Course',
      description: 'Create a new course with content and materials',
      icon: Plus,
      link: '/admin/courses',
      color: 'bg-blue-500',
    },
    {
      title: 'View Analytics',
      description: 'Check course performance and student engagement',
      icon: Eye,
      link: '#',
      color: 'bg-green-500',
    },
    {
      title: 'Manage Settings',
      description: 'Configure site settings and preferences',
      icon: Settings,
      link: '#',
      color: 'bg-purple-500',
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
                Welcome back, {user?.name || 'Admin'}
              </p>
            </div>
            <div className="flex items-center gap-4">
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
                        <div className="text-sm text-neutral-500">{card.title}</div>
                      </div>
                    </div>
                    <p className="text-sm text-neutral-600">{card.description}</p>
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
                <div className="space-y-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon
                    return (
                      <Link
                        key={action.title}
                        to={action.link}
                        className="block p-4 border border-neutral-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group"
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
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-neutral-900">New course published</p>
                      <p className="text-xs text-neutral-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-neutral-900">Project submission reviewed</p>
                      <p className="text-xs text-neutral-500">4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-neutral-900">Alumni profile updated</p>
                      <p className="text-xs text-neutral-500">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-neutral-900">New student enrolled</p>
                      <p className="text-xs text-neutral-500">2 days ago</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard