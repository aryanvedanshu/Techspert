import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Mail, MessageSquare, Send, Search, Filter, RefreshCw, 
  CheckCircle, Clock, XCircle, User, Phone, Calendar,
  ArrowLeft, Eye, Trash2, Edit, AlertCircle, Users
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../services/api'
import { toast } from 'sonner'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'
import logger from '../../utils/logger'

const AdminMessagingCenter = () => {
  const { isAuthenticated } = useAuth()
  const [signups, setSignups] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showBroadcastModal, setShowBroadcastModal] = useState(false)
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [selectedSignups, setSelectedSignups] = useState([])
  const [sending, setSending] = useState(false)
  const [broadcastType, setBroadcastType] = useState('email') // 'email' or 'whatsapp'

  useEffect(() => {
    logger.componentMount('AdminMessagingCenter')
    if (isAuthenticated) {
      fetchSignups()
    }
    return () => {
      logger.componentUnmount('AdminMessagingCenter')
    }
  }, [isAuthenticated])

  const fetchSignups = async () => {
    logger.functionEntry('fetchSignups')
    const startTime = Date.now()
    try {
      setLoading(true)
      logger.apiRequest('GET', '/admin/demo-signups')
      const response = await api.get('/admin/demo-signups')
      logger.apiResponse('GET', '/admin/demo-signups', response.status, { count: response.data.data?.length || 0 }, Date.now() - startTime)
      
      const fetchedSignups = response.data.data || []
      logger.info('Demo signups fetched successfully', { 
        count: fetchedSignups.length,
        duration: `${Date.now() - startTime}ms`
      })
      
      logger.stateChange('AdminMessagingCenter', 'signups', null, fetchedSignups)
      setSignups(fetchedSignups)
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('Failed to fetch demo signups', error, {
        duration: `${duration}ms`,
        errorMessage: error.message,
        errorResponse: error.response?.data
      })
      toast.error('Failed to fetch demo signups')
    } finally {
      setLoading(false)
      logger.functionExit('fetchSignups', { duration: `${Date.now() - startTime}ms` })
    }
  }

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim()) {
      toast.error('Please enter a message')
      return
    }

    const targets = selectedSignups.length > 0 ? selectedSignups : signups.filter(s => filterStatus === 'all' || s.status === filterStatus)
    
    if (targets.length === 0) {
      toast.error('No signups selected for broadcast')
      return
    }

    logger.functionEntry('handleBroadcast', { 
      type: broadcastType,
      messageLength: broadcastMessage.length,
      targetCount: targets.length
    })
    const startTime = Date.now()
    setSending(true)

    try {
      logger.apiRequest('POST', '/admin/demo-signups/broadcast', {
        type: broadcastType,
        message: broadcastMessage,
        signupIds: targets.map(s => s._id)
      })
      
      const response = await api.post('/admin/demo-signups/broadcast', {
        type: broadcastType,
        message: broadcastMessage,
        signupIds: targets.map(s => s._id)
      })
      
      logger.apiResponse('POST', '/admin/demo-signups/broadcast', response.status, { 
        sent: response.data.data?.sent || 0 
      }, Date.now() - startTime)
      
      logger.success('Broadcast sent successfully', {
        type: broadcastType,
        sent: response.data.data?.sent || 0,
        duration: `${Date.now() - startTime}ms`
      })
      logger.functionExit('handleBroadcast', { success: true, duration: `${Date.now() - startTime}ms` })
      
      toast.success(`Message sent to ${response.data.data?.sent || 0} recipients via ${broadcastType}`)
      setShowBroadcastModal(false)
      setBroadcastMessage('')
      setSelectedSignups([])
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('Failed to send broadcast', error, {
        type: broadcastType,
        duration: `${duration}ms`,
        errorMessage: error.message,
        errorResponse: error.response?.data
      })
      logger.functionExit('handleBroadcast', { success: false, error: error.message, duration: `${duration}ms` })
      toast.error(error.response?.data?.message || 'Failed to send broadcast')
    } finally {
      setSending(false)
    }
  }

  const handleUpdateStatus = async (signupId, newStatus) => {
    logger.functionEntry('handleUpdateStatus', { signupId, newStatus })
    const startTime = Date.now()
    try {
      logger.apiRequest('PUT', `/admin/demo-signups/${signupId}`, { status: newStatus })
      await api.put(`/admin/demo-signups/${signupId}`, { status: newStatus })
      logger.apiResponse('PUT', `/admin/demo-signups/${signupId}`, 200, {}, Date.now() - startTime)
      
      logger.success('Signup status updated', { signupId, newStatus, duration: `${Date.now() - startTime}ms` })
      logger.functionExit('handleUpdateStatus', { success: true, duration: `${Date.now() - startTime}ms` })
      
      toast.success('Status updated successfully')
      fetchSignups()
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('Failed to update status', error, {
        signupId,
        newStatus,
        duration: `${duration}ms`
      })
      logger.functionExit('handleUpdateStatus', { success: false, error: error.message, duration: `${duration}ms` })
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async (signupId) => {
    if (!window.confirm('Are you sure you want to delete this signup?')) return
    
    logger.functionEntry('handleDelete', { signupId })
    const startTime = Date.now()
    try {
      logger.apiRequest('DELETE', `/admin/demo-signups/${signupId}`)
      await api.delete(`/admin/demo-signups/${signupId}`)
      logger.apiResponse('DELETE', `/admin/demo-signups/${signupId}`, 200, {}, Date.now() - startTime)
      
      logger.success('Signup deleted', { signupId, duration: `${Date.now() - startTime}ms` })
      logger.functionExit('handleDelete', { success: true, duration: `${Date.now() - startTime}ms` })
      
      toast.success('Signup deleted successfully')
      fetchSignups()
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('Failed to delete signup', error, {
        signupId,
        duration: `${duration}ms`
      })
      logger.functionExit('handleDelete', { success: false, error: error.message, duration: `${duration}ms` })
      toast.error('Failed to delete signup')
    }
  }

  const toggleSignupSelection = (signup) => {
    if (selectedSignups.find(s => s._id === signup._id)) {
      setSelectedSignups(selectedSignups.filter(s => s._id !== signup._id))
    } else {
      setSelectedSignups([...selectedSignups, signup])
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'contacted':
        return <CheckCircle size={16} className="text-green-500" />
      case 'attended':
        return <CheckCircle size={16} className="text-blue-500" />
      case 'cancelled':
        return <XCircle size={16} className="text-red-500" />
      default:
        return <Clock size={16} className="text-yellow-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'contacted':
        return 'bg-green-100 text-green-800'
      case 'attended':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const filteredSignups = signups.filter(signup => {
    const matchesSearch = !searchTerm || 
      signup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      signup.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (signup.courseInterest && signup.courseInterest.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = filterStatus === 'all' || signup.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  const stats = {
    total: signups.length,
    pending: signups.filter(s => s.status === 'pending').length,
    contacted: signups.filter(s => s.status === 'contacted').length,
    attended: signups.filter(s => s.status === 'attended').length,
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin" className="text-neutral-600 hover:text-neutral-900">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-heading font-bold text-neutral-900">
                  Messaging Center
                </h1>
                <p className="text-neutral-600">
                  Manage demo class sign-ups and send broadcast messages
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchSignups}
                disabled={loading}
              >
                <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                onClick={() => setShowBroadcastModal(true)}
                disabled={signups.length === 0}
              >
                <Send size={16} className="mr-2" />
                Send Broadcast
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Signups</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users size={24} className="text-blue-600" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock size={24} className="text-yellow-600" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Contacted</p>
                <p className="text-2xl font-bold text-green-600">{stats.contacted}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle size={24} className="text-green-600" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Attended</p>
                <p className="text-2xl font-bold text-blue-600">{stats.attended}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CheckCircle size={24} className="text-blue-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or course interest..."
                  className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="attended">Attended</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Signups List */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedSignups.length === filteredSignups.length && filteredSignups.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSignups(filteredSignups)
                        } else {
                          setSelectedSignups([])
                        }
                      }}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Phone</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Course Interest</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Experience</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-neutral-500">
                      Loading signups...
                    </td>
                  </tr>
                ) : filteredSignups.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-neutral-500">
                      No signups found
                    </td>
                  </tr>
                ) : (
                  filteredSignups.map((signup) => (
                    <tr key={signup._id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={!!selectedSignups.find(s => s._id === signup._id)}
                          onChange={() => toggleSignupSelection(signup)}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-neutral-400" />
                          <span className="font-medium text-neutral-900">{signup.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Mail size={16} className="text-neutral-400" />
                          <span className="text-neutral-700">{signup.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {signup.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone size={16} className="text-neutral-400" />
                            <span className="text-neutral-700">{signup.phone}</span>
                          </div>
                        ) : (
                          <span className="text-neutral-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-neutral-700">{signup.courseInterest || '-'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded text-xs capitalize">
                          {signup.experience || 'beginner'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(signup.status)}
                          <select
                            value={signup.status}
                            onChange={(e) => handleUpdateStatus(signup._id, e.target.value)}
                            className={`text-xs px-2 py-1 rounded border-0 ${getStatusColor(signup.status)} focus:ring-2 focus:ring-primary-500`}
                          >
                            <option value="pending">Pending</option>
                            <option value="contacted">Contacted</option>
                            <option value="attended">Attended</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <Calendar size={14} />
                          {new Date(signup.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(signup._id)}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Broadcast Modal */}
      <Modal
        isOpen={showBroadcastModal}
        onClose={() => {
          setShowBroadcastModal(false)
          setBroadcastMessage('')
          setSelectedSignups([])
        }}
        title="Send Broadcast Message"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Message Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="broadcastType"
                  value="email"
                  checked={broadcastType === 'email'}
                  onChange={(e) => setBroadcastType(e.target.value)}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <Mail size={20} className="ml-2 text-neutral-600" />
                <span className="ml-2 text-sm text-neutral-700">Email</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="broadcastType"
                  value="whatsapp"
                  checked={broadcastType === 'whatsapp'}
                  onChange={(e) => setBroadcastType(e.target.value)}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <MessageSquare size={20} className="ml-2 text-neutral-600" />
                <span className="ml-2 text-sm text-neutral-700">WhatsApp</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Message
            </label>
            <textarea
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Enter your message here..."
              rows={6}
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-neutral-500 mt-1">
              {selectedSignups.length > 0 
                ? `Will send to ${selectedSignups.length} selected signup(s)`
                : `Will send to all ${filteredSignups.length} signup(s) matching current filters`
              }
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowBroadcastModal(false)
                setBroadcastMessage('')
                setSelectedSignups([])
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBroadcast}
              disabled={sending || !broadcastMessage.trim()}
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} className="mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdminMessagingCenter

