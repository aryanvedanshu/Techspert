import { useState, useEffect } from 'react'
import { Navigate, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Users, BookOpen, Code, Award, TrendingUp, Eye, Plus, Settings,
    Palette, Mail, Globe, Shield, BarChart3, Clock, DollarSign,
    Star, Activity, AlertCircle, CheckCircle, XCircle, RefreshCw,
    UserCheck, HelpCircle, Phone, Target, Brain, Database, GraduationCap,
    MessageSquare, LogOut
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../services/api'
import { toast } from 'sonner'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'
import logger from '../../utils/logger'

const AdminDashboard = () => {
    const { isAuthenticated, user, logout } = useAuth()
    const navigate = useNavigate()
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

    const fetchStats = async () => {
        try {
            const [dashboardRes, coursesRes, projectsRes, alumniRes] = await Promise.all([
                api.get('/admin/dashboard'),
                api.get('/admin/courses'),
                api.get('/admin/projects'),
                api.get('/alumni'),
            ])

            const dashboardStats = dashboardRes.data.data || {}
            const courses = coursesRes.data.data || []
            const projects = projectsRes.data.data || []
            const alumni = alumniRes.data.data || []

            setStats({
                totalCourses: dashboardStats.totalCourses || courses.length,
                totalProjects: dashboardStats.totalProjects || projects.length,
                totalAlumni: dashboardStats.totalAlumni || alumni.length,
                totalStudents: dashboardStats.totalStudents || 0,
                totalRevenue: dashboardStats.totalRevenue || 0,
                averageRating: Math.round((dashboardStats.averageRating || 0) * 10) / 10,
                pendingProjects: dashboardStats.pendingProjects || 0,
                activeUsers: dashboardStats.activeUsers || 0,
            })
        } catch (error) {
            logger.error('Failed to fetch dashboard stats', error)
            toast.error('Failed to load dashboard data')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        if (isAuthenticated) {
            fetchStats()
        }
    }, [isAuthenticated])

    const handleRefresh = () => {
        setRefreshing(true)
        fetchStats()
    }

    const handleLogout = async () => {
        await logout()
        navigate('/admin/login')
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />
    }

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
                                Welcome back, {user?.displayName || user?.name || 'Admin'} • Last updated: {new Date().toLocaleTimeString()}
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
                            <Link to="/admin/settings">
                                <Button variant="outline" size="sm">
                                    <Settings size={16} className="mr-2" />
                                    Settings
                                </Button>
                            </Link>
                            <Button variant="outline" size="sm" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:border-red-600">
                                <LogOut size={16} className="mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-custom py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <BookOpen className="text-blue-600" size={24} />
                                <div className="text-right">
                                    <div className="text-2xl font-bold">{loading ? '...' : stats.totalCourses}</div>
                                    <div className="text-sm text-neutral-600">Total Courses</div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Code className="text-green-600" size={24} />
                                <div className="text-right">
                                    <div className="text-2xl font-bold">{loading ? '...' : stats.totalProjects}</div>
                                    <div className="text-sm text-neutral-600">Student Projects</div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Users className="text-purple-600" size={24} />
                                <div className="text-right">
                                    <div className="text-2xl font-bold">{loading ? '...' : stats.totalAlumni}</div>
                                    <div className="text-sm text-neutral-600">Alumni Network</div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Star className="text-yellow-600" size={24} />
                                <div className="text-right">
                                    <div className="text-2xl font-bold">{loading ? '...' : stats.averageRating}</div>
                                    <div className="text-sm text-neutral-600">Average Rating</div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Link to="/admin/courses">
                        <Card hover>
                            <div className="p-6">
                                <BookOpen className="text-blue-600 mb-4" size={32} />
                                <h3 className="font-semibold text-lg mb-2">Manage Courses</h3>
                                <p className="text-neutral-600 text-sm">Create and edit courses</p>
                            </div>
                        </Card>
                    </Link>

                    <Link to="/admin/projects">
                        <Card hover>
                            <div className="p-6">
                                <Code className="text-green-600 mb-4" size={32} />
                                <h3 className="font-semibold text-lg mb-2">Manage Projects</h3>
                                <p className="text-neutral-600 text-sm">Review student projects</p>
                            </div>
                        </Card>
                    </Link>

                    <Link to="/admin/alumni">
                        <Card hover>
                            <div className="p-6">
                                <Users className="text-purple-600 mb-4" size={32} />
                                <h3 className="font-semibold text-lg mb-2">Manage Alumni</h3>
                                <p className="text-neutral-600 text-sm">Update alumni profiles</p>
                            </div>
                        </Card>
                    </Link>

                    <Link to="/admin/demo-class">
                        <Card hover>
                            <div className="p-6">
                                <GraduationCap className="text-orange-600 mb-4" size={32} />
                                <h3 className="font-semibold text-lg mb-2">Demo Classes</h3>
                                <p className="text-neutral-600 text-sm">Manage demo link & registrations</p>
                            </div>
                        </Card>
                    </Link>

                    <Link to="/admin/enquiries">
                        <Card hover>
                            <div className="p-6">
                                <MessageSquare className="text-cyan-600 mb-4" size={32} />
                                <h3 className="font-semibold text-lg mb-2">Enquiries</h3>
                                <p className="text-neutral-600 text-sm">View contact submissions</p>
                            </div>
                        </Card>
                    </Link>

                    <Link to="/admin/trainers">
                        <Card hover>
                            <div className="p-6">
                                <UserCheck className="text-indigo-600 mb-4" size={32} />
                                <h3 className="font-semibold text-lg mb-2">Trainers</h3>
                                <p className="text-neutral-600 text-sm">Manage trainer profiles</p>
                            </div>
                        </Card>
                    </Link>

                    <Link to="/admin/leads">
                        <Card hover>
                            <div className="p-6">
                                <Target className="text-rose-600 mb-4" size={32} />
                                <h3 className="font-semibold text-lg mb-2">Lead Pipeline</h3>
                                <p className="text-neutral-600 text-sm">Track leads & generate passwords</p>
                            </div>
                        </Card>
                    </Link>

                    <Link to="/admin/link-management">
                        <Card hover>
                            <div className="p-6">
                                <Globe className="text-teal-600 mb-4" size={32} />
                                <h3 className="font-semibold text-lg mb-2">Link Management</h3>
                                <p className="text-neutral-600 text-sm">Manage demo & payment links</p>
                            </div>
                        </Card>
                    </Link>

                    <Link to="/admin/leads-dashboard">
                        <Card hover>
                            <div className="p-6">
                                <BarChart3 className="text-emerald-600 mb-4" size={32} />
                                <h3 className="font-semibold text-lg mb-2">Leads Dashboard</h3>
                                <p className="text-neutral-600 text-sm">View clicks, forms & payments</p>
                            </div>
                        </Card>
                    </Link>

                    <Link to="/admin/razorpay-readiness">
                        <Card hover>
                            <div className="p-6">
                                <DollarSign className="text-amber-600 mb-4" size={32} />
                                <h3 className="font-semibold text-lg mb-2">Payment Readiness</h3>
                                <p className="text-neutral-600 text-sm">Razorpay compliance check</p>
                            </div>
                        </Card>
                    </Link>
                </div>


            </div>
        </div>
    )
}

export default AdminDashboard
