import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, Search, Filter, Eye, Edit, Trash2, Mail, Phone, 
  Calendar, Award, BookOpen, DollarSign, Star, Clock,
  CheckCircle, XCircle, AlertCircle, UserCheck, UserX,
  Download, RefreshCw, Plus, Settings, Shield
} from 'lucide-react'
import { api } from '../../services/api'
import { toast } from 'sonner'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'

const AdminUserManagement = () => {
  const [users, setUsers] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showUserModal, setShowUserModal] = useState(false)
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [editingEnrollment, setEditingEnrollment] = useState(null)
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    isActive: true,
    profile: {
      bio: '',
      avatar: '',
      phone: '',
      location: '',
      website: '',
      socialLinks: {
        linkedin: '',
        github: '',
        twitter: ''
      }
    }
  })
  const [enrollmentFormData, setEnrollmentFormData] = useState({
    user: '',
    course: '',
    progress: 0,
    completed: false,
    completedAt: '',
    certificateUrl: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [usersRes, enrollmentsRes, coursesRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/enrollments'),
        api.get('/courses')
      ])

      setUsers(usersRes.data.data || [])
      setEnrollments(enrollmentsRes.data.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch user data')
    } finally {
      setLoading(false)
    }
  }

  const handleUserSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingUser) {
        await api.put(`/admin/users/${editingUser._id}`, userFormData)
        toast.success('User updated successfully')
      } else {
        await api.post('/admin/users', userFormData)
        toast.success('User created successfully')
      }
      setShowUserModal(false)
      setEditingUser(null)
      resetUserForm()
      fetchData()
    } catch (error) {
      console.error('Error saving user:', error)
      toast.error('Failed to save user')
    }
  }

  const handleEnrollmentSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingEnrollment) {
        await api.put(`/enrollments/${editingEnrollment._id}`, enrollmentFormData)
        toast.success('Enrollment updated successfully')
      } else {
        await api.post('/enrollments', enrollmentFormData)
        toast.success('Enrollment created successfully')
      }
      setShowEnrollmentModal(false)
      setEditingEnrollment(null)
      resetEnrollmentForm()
      fetchData()
    } catch (error) {
      console.error('Error saving enrollment:', error)
      toast.error('Failed to save enrollment')
    }
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setUserFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'student',
      isActive: user.isActive !== false,
      profile: user.profile || {
        bio: '',
        avatar: '',
        phone: '',
        location: '',
        website: '',
        socialLinks: { linkedin: '', github: '', twitter: '' }
      }
    })
    setShowUserModal(true)
  }

  const handleEditEnrollment = (enrollment) => {
    setEditingEnrollment(enrollment)
    setEnrollmentFormData({
      user: enrollment.user?._id || '',
      course: enrollment.course?._id || '',
      progress: enrollment.progress || 0,
      completed: enrollment.completed || false,
      completedAt: enrollment.completedAt || '',
      certificateUrl: enrollment.certificateUrl || ''
    })
    setShowEnrollmentModal(true)
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${userId}`)
        toast.success('User deleted successfully')
        fetchData()
      } catch (error) {
        console.error('Error deleting user:', error)
        toast.error('Failed to delete user')
      }
    }
  }

  const handleDeleteEnrollment = async (enrollmentId) => {
    if (window.confirm('Are you sure you want to delete this enrollment?')) {
      try {
        await api.delete(`/enrollments/${enrollmentId}`)
        toast.success('Enrollment deleted successfully')
        fetchData()
      } catch (error) {
        console.error('Error deleting enrollment:', error)
        toast.error('Failed to delete enrollment')
      }
    }
  }

  const toggleUserStatus = async (userId, isActive) => {
    try {
      await api.put(`/admin/users/${userId}`, { isActive: !isActive })
      toast.success(`User ${!isActive ? 'activated' : 'deactivated'} successfully`)
      fetchData()
    } catch (error) {
      console.error('Error updating user status:', error)
      toast.error('Failed to update user status')
    }
  }

  const resetUserForm = () => {
    setUserFormData({
      name: '',
      email: '',
      role: 'student',
      isActive: true,
      profile: {
        bio: '',
        avatar: '',
        phone: '',
        location: '',
        website: '',
        socialLinks: { linkedin: '', github: '', twitter: '' }
      }
    })
  }

  const resetEnrollmentForm = () => {
    setEnrollmentFormData({
      user: '',
      course: '',
      progress: 0,
      completed: false,
      completedAt: '',
      certificateUrl: ''
    })
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.isActive) ||
                         (filterStatus === 'inactive' && !user.isActive)
    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'instructor': return 'bg-blue-100 text-blue-800'
      case 'student': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (isActive) => {
    return isActive ? 
      <CheckCircle size={16} className="text-green-500" /> : 
      <XCircle size={16} className="text-red-500" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container-custom">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-neutral-200 rounded-lg"></div>
              ))}
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
                User Management
              </h1>
              <p className="text-neutral-600">
                Manage users, enrollments, and access permissions
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => setShowEnrollmentModal(true)}>
                <Plus size={16} className="mr-2" />
                Add Enrollment
              </Button>
              <Button onClick={() => setShowUserModal(true)}>
                <Plus size={16} className="mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Filters */}
        <Card className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </Card>

        {/* Users List */}
        <div className="space-y-4">
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      {user.profile?.avatar ? (
                        <img
                          src={user.profile.avatar}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-semibold">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-1">
                        {user.name}
                      </h3>
                      <p className="text-sm text-neutral-600 mb-2">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(user.isActive)}
                          <span className="text-xs text-neutral-500">
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit size={14} className="mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleUserStatus(user._id, user.isActive)}
                    >
                      {user.isActive ? (
                        <>
                          <UserX size={14} className="mr-1" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <UserCheck size={14} className="mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No users found
            </h3>
            <p className="text-neutral-600 mb-4">
              {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first user'
              }
            </p>
            {!searchTerm && filterRole === 'all' && filterStatus === 'all' && (
              <Button onClick={() => setShowUserModal(true)}>
                <Plus size={16} className="mr-2" />
                Add User
              </Button>
            )}
          </div>
        )}
      </div>

      {/* User Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false)
          setEditingUser(null)
          resetUserForm()
        }}
        title={editingUser ? 'Edit User' : 'Add New User'}
        size="lg"
      >
        <form onSubmit={handleUserSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                required
                value={userFormData.name}
                onChange={(e) => setUserFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="User name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={userFormData.email}
                onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="user@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Role *
              </label>
              <select
                required
                value={userFormData.role}
                onChange={(e) => setUserFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={userFormData.isActive}
                onChange={(e) => setUserFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-neutral-700">
                Active User
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Bio
            </label>
            <textarea
              rows={3}
              value={userFormData.profile.bio}
              onChange={(e) => setUserFormData(prev => ({ 
                ...prev, 
                profile: { ...prev.profile, bio: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="User biography"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={userFormData.profile.phone}
                onChange={(e) => setUserFormData(prev => ({ 
                  ...prev, 
                  profile: { ...prev.profile, phone: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={userFormData.profile.location}
                onChange={(e) => setUserFormData(prev => ({ 
                  ...prev, 
                  profile: { ...prev.profile, location: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="City, Country"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Avatar URL
            </label>
            <input
              type="url"
              value={userFormData.profile.avatar}
              onChange={(e) => setUserFormData(prev => ({ 
                ...prev, 
                profile: { ...prev.profile, avatar: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div className="flex gap-4 pt-6 border-t border-neutral-200">
            <Button type="submit" className="flex-1">
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowUserModal(false)
                setEditingUser(null)
                resetUserForm()
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Enrollment Modal */}
      <Modal
        isOpen={showEnrollmentModal}
        onClose={() => {
          setShowEnrollmentModal(false)
          setEditingEnrollment(null)
          resetEnrollmentForm()
        }}
        title={editingEnrollment ? 'Edit Enrollment' : 'Add New Enrollment'}
        size="lg"
      >
        <form onSubmit={handleEnrollmentSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                User *
              </label>
              <select
                required
                value={enrollmentFormData.user}
                onChange={(e) => setEnrollmentFormData(prev => ({ ...prev, user: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select User</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Course *
              </label>
              <select
                required
                value={enrollmentFormData.course}
                onChange={(e) => setEnrollmentFormData(prev => ({ ...prev, course: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select Course</option>
                {/* This would be populated with actual courses */}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Progress (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={enrollmentFormData.progress}
              onChange={(e) => setEnrollmentFormData(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="completed"
              checked={enrollmentFormData.completed}
              onChange={(e) => setEnrollmentFormData(prev => ({ ...prev, completed: e.target.checked }))}
              className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="completed" className="ml-2 text-sm text-neutral-700">
              Course Completed
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Certificate URL
            </label>
            <input
              type="url"
              value={enrollmentFormData.certificateUrl}
              onChange={(e) => setEnrollmentFormData(prev => ({ ...prev, certificateUrl: e.target.value }))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="https://example.com/certificate.pdf"
            />
          </div>

          <div className="flex gap-4 pt-6 border-t border-neutral-200">
            <Button type="submit" className="flex-1">
              {editingEnrollment ? 'Update Enrollment' : 'Create Enrollment'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowEnrollmentModal(false)
                setEditingEnrollment(null)
                resetEnrollmentForm()
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AdminUserManagement
