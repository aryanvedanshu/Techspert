import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, Search, Edit, Trash2, Mail, UserCheck, UserX,
  CheckCircle, XCircle, AlertCircle, Plus, RefreshCw, Lock
} from 'lucide-react'
import { api } from '../../services/api'
import { toast } from 'sonner'
import { useAuth } from '../../contexts/AuthContext'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'
import logger from '../../utils/logger'

const AdminAdminManagement = () => {
  const { user: currentUser } = useAuth()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState(null)
  const [adminFormData, setAdminFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    isActive: true,
    permissions: {
      courses: { create: true, read: true, update: true, delete: true },
      projects: { create: true, read: true, update: true, delete: true },
      alumni: { create: true, read: true, update: true, delete: true },
      users: { create: true, read: true, update: true, delete: true },
      admins: { create: false, read: true, update: false, delete: false },
      settings: { create: true, read: true, update: true, delete: false },
    }
  })

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    logger.functionEntry('fetchAdmins')
    const startTime = Date.now()
    
    try {
      logger.debug('Starting to fetch admins', {
        endpoint: '/admin/admins'
      })
      setLoading(true)
      
      logger.apiRequest('GET', '/admin/admins')
      const response = await api.get('/admin/admins')

      const admins = response.data.data || []
      
      logger.apiResponse('GET', '/admin/admins', response.status, { count: admins.length }, Date.now() - startTime)
      logger.info('Admins fetched successfully', { 
        count: admins.length,
        duration: `${Date.now() - startTime}ms`
      })

      logger.stateChange('AdminAdminManagement', 'admins', null, admins)
      setAdmins(admins)
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('Failed to fetch admins', error, {
        duration: `${duration}ms`,
        errorMessage: error.message,
        errorResponse: error.response?.data,
        errorStatus: error.response?.status
      })
      toast.error('Failed to fetch admins')
    } finally {
      setLoading(false)
      logger.functionExit('fetchAdmins', { duration: `${Date.now() - startTime}ms` })
    }
  }

  const handleAdminSubmit = async (e) => {
    e.preventDefault()
    logger.functionEntry('handleAdminSubmit', {
      isEditing: !!editingAdmin,
      adminId: editingAdmin?._id
    })
    const startTime = Date.now()
    
    try {
      const submitData = { ...adminFormData }
      
      // Don't send password if it's empty (for updates)
      if (editingAdmin && !submitData.password) {
        delete submitData.password
      }
      
      if (editingAdmin) {
        logger.apiRequest('PUT', `/admin/admins/${editingAdmin._id}`, submitData)
        await api.put(`/admin/admins/${editingAdmin._id}`, submitData)
        logger.apiResponse('PUT', `/admin/admins/${editingAdmin._id}`, 200, { message: 'Admin updated successfully' }, Date.now() - startTime)
        toast.success('Admin updated successfully')
      } else {
        // Password required for new admins
        if (!submitData.password || submitData.password.length < 8) {
          toast.error('Password must be at least 8 characters long')
          logger.warn('Admin creation failed: password too short', {
            passwordLength: submitData.password?.length || 0
          })
          return
        }
        logger.apiRequest('POST', '/admin/admins', submitData)
        await api.post('/admin/admins', submitData)
        logger.apiResponse('POST', '/admin/admins', 201, { message: 'Admin created successfully' }, Date.now() - startTime)
        toast.success('Admin created successfully')
      }
      
      setShowAdminModal(false)
      setEditingAdmin(null)
      resetAdminForm()
      fetchAdmins()
      
      logger.functionExit('handleAdminSubmit', { 
        success: true,
        duration: `${Date.now() - startTime}ms` 
      })
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('Failed to save admin', error, {
        duration: `${duration}ms`,
        errorMessage: error.message,
        errorResponse: error.response?.data,
        errorStatus: error.response?.status,
        isEditing: !!editingAdmin
      })
      toast.error(error.response?.data?.message || 'Failed to save admin')
      
      logger.functionExit('handleAdminSubmit', { 
        success: false,
        error: error.message,
        duration: `${duration}ms` 
      })
    }
  }

  const handleEditAdmin = (admin) => {
    logger.functionEntry('handleEditAdmin', { adminId: admin._id })
    
    setEditingAdmin(admin)
    setAdminFormData({
      name: admin.name || '',
      email: admin.email || '',
      password: '', // Don't pre-fill password
      role: admin.role || 'admin',
      isActive: admin.isActive !== undefined ? admin.isActive : true,
      permissions: admin.permissions || {
        courses: { create: true, read: true, update: true, delete: true },
        projects: { create: true, read: true, update: true, delete: true },
        alumni: { create: true, read: true, update: true, delete: true },
        users: { create: true, read: true, update: true, delete: true },
        admins: { create: false, read: true, update: false, delete: false },
        settings: { create: true, read: true, update: true, delete: false },
      }
    })
    setShowAdminModal(true)
    
    logger.functionExit('handleEditAdmin')
  }

  const handleDeleteAdmin = async (adminId) => {
    logger.functionEntry('handleDeleteAdmin', { adminId })
    const startTime = Date.now()
    
    // Prevent deleting yourself
    if (adminId === currentUser?._id) {
      toast.error('You cannot delete your own account')
      logger.warn('Attempted to delete own account', { adminId })
      return
    }
    
    if (!window.confirm('Are you sure you want to deactivate this admin?')) {
      logger.debug('Admin deletion cancelled by user')
      return
    }
    
    try {
      logger.apiRequest('DELETE', `/admin/admins/${adminId}`)
      await api.delete(`/admin/admins/${adminId}`)
      logger.apiResponse('DELETE', `/admin/admins/${adminId}`, 200, { message: 'Admin deactivated successfully' }, Date.now() - startTime)
      toast.success('Admin deactivated successfully')
      fetchAdmins()
      
      logger.functionExit('handleDeleteAdmin', { 
        success: true,
        duration: `${Date.now() - startTime}ms` 
      })
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('Failed to delete admin', error, {
        duration: `${duration}ms`,
        errorMessage: error.message,
        errorResponse: error.response?.data,
        errorStatus: error.response?.status
      })
      toast.error(error.response?.data?.message || 'Failed to deactivate admin')
      
      logger.functionExit('handleDeleteAdmin', { 
        success: false,
        error: error.message,
        duration: `${duration}ms` 
      })
    }
  }

  const toggleAdminStatus = async (adminId, currentStatus) => {
    logger.functionEntry('toggleAdminStatus', { adminId, currentStatus })
    const startTime = Date.now()
    
    // Prevent deactivating yourself
    if (adminId === currentUser?._id) {
      toast.error('You cannot deactivate your own account')
      logger.warn('Attempted to deactivate own account', { adminId })
      return
    }
    
    try {
      const newStatus = !currentStatus
      logger.apiRequest('PUT', `/admin/admins/${adminId}`, { isActive: newStatus })
      await api.put(`/admin/admins/${adminId}`, { isActive: newStatus })
      logger.apiResponse('PUT', `/admin/admins/${adminId}`, 200, { message: `Admin ${newStatus ? 'activated' : 'deactivated'} successfully` }, Date.now() - startTime)
      toast.success(`Admin ${newStatus ? 'activated' : 'deactivated'} successfully`)
      fetchAdmins()
      
      logger.functionExit('toggleAdminStatus', { 
        success: true,
        newStatus,
        duration: `${Date.now() - startTime}ms` 
      })
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('Failed to toggle admin status', error, {
        duration: `${duration}ms`,
        errorMessage: error.message,
        errorResponse: error.response?.data,
        errorStatus: error.response?.status
      })
      toast.error(error.response?.data?.message || 'Failed to update admin status')
      
      logger.functionExit('toggleAdminStatus', { 
        success: false,
        error: error.message,
        duration: `${duration}ms` 
      })
    }
  }

  const resetAdminForm = () => {
    setAdminFormData({
      name: '',
      email: '',
      password: '',
      role: 'admin',
      isActive: true,
      permissions: {
        courses: { create: true, read: true, update: true, delete: true },
        projects: { create: true, read: true, update: true, delete: true },
        alumni: { create: true, read: true, update: true, delete: true },
        users: { create: true, read: true, update: true, delete: true },
        admins: { create: false, read: true, update: false, delete: false },
        settings: { create: true, read: true, update: true, delete: false },
      }
    })
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'super-admin':
        return 'bg-red-100 text-red-800'
      case 'admin':
        return 'bg-blue-100 text-blue-800'
      case 'moderator':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (isActive) => {
    return isActive ? (
      <CheckCircle size={14} className="text-green-500" />
    ) : (
      <XCircle size={14} className="text-red-500" />
    )
  }

  // Filter admins
  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = 
      admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || admin.role === filterRole
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && admin.isActive) ||
      (filterStatus === 'inactive' && !admin.isActive)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  // Check if current user is super-admin
  const isSuperAdmin = currentUser?.role === 'super-admin'

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card className="max-w-md">
          <div className="text-center">
            <Shield size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Access Denied
            </h2>
            <p className="text-neutral-600">
              Only super-admins can manage other admins.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="container-custom py-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-neutral-200 rounded-lg animate-pulse"></div>
            ))}
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
                Admin Management
              </h1>
              <p className="text-neutral-600">
                Manage admin accounts, roles, and permissions
              </p>
            </div>
            <Button onClick={() => {
              setShowAdminModal(true)
              setEditingAdmin(null)
              resetAdminForm()
            }}>
              <Plus size={16} className="mr-2" />
              Add Admin
            </Button>
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
                  placeholder="Search admins..."
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
              <option value="super-admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
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

        {/* Admins List */}
        <div className="space-y-4">
          {filteredAdmins.map((admin, index) => (
            <motion.div
              key={admin._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                      <Shield size={24} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-neutral-900">
                          {admin.name}
                        </h3>
                        {admin._id === currentUser?._id && (
                          <span className="text-xs text-neutral-500">(You)</span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-600 mb-2">
                        {admin.email}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(admin.role)}`}>
                          {admin.role}
                        </span>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(admin.isActive)}
                          <span className="text-xs text-neutral-500">
                            {admin.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditAdmin(admin)}
                    >
                      <Edit size={14} className="mr-1" />
                      Edit
                    </Button>
                    {admin._id !== currentUser?._id && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAdminStatus(admin._id, admin.isActive)}
                        >
                          {admin.isActive ? (
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
                          onClick={() => handleDeleteAdmin(admin._id)}
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredAdmins.length === 0 && (
          <div className="text-center py-12">
            <Shield size={48} className="text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No admins found
            </h3>
            <p className="text-neutral-600 mb-4">
              {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first admin'
              }
            </p>
            {!searchTerm && filterRole === 'all' && filterStatus === 'all' && (
              <Button onClick={() => {
                setShowAdminModal(true)
                setEditingAdmin(null)
                resetAdminForm()
              }}>
                <Plus size={16} className="mr-2" />
                Add Admin
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Admin Modal */}
      <Modal
        isOpen={showAdminModal}
        onClose={() => {
          setShowAdminModal(false)
          setEditingAdmin(null)
          resetAdminForm()
        }}
        title={editingAdmin ? 'Edit Admin' : 'Add New Admin'}
        size="lg"
      >
        <form onSubmit={handleAdminSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                required
                value={adminFormData.name}
                onChange={(e) => setAdminFormData({ ...adminFormData, name: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={adminFormData.email}
                onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Password {editingAdmin ? '(leave blank to keep current)' : '*'}
              </label>
              <input
                type="password"
                required={!editingAdmin}
                value={adminFormData.password}
                onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                minLength={8}
              />
              {editingAdmin && (
                <p className="text-xs text-neutral-500 mt-1">
                  Leave blank to keep the current password
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Role *
              </label>
              <select
                required
                value={adminFormData.role}
                onChange={(e) => setAdminFormData({ ...adminFormData, role: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="super-admin">Super Admin</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={adminFormData.isActive}
              onChange={(e) => setAdminFormData({ ...adminFormData, isActive: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-neutral-700">
              Active Account
            </label>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-neutral-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAdminModal(false)
                setEditingAdmin(null)
                resetAdminForm()
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingAdmin ? 'Update Admin' : 'Create Admin'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AdminAdminManagement

