import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Eye, ArrowLeft, Users, Award, Star, Code, Target, TrendingUp } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../services/api'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'

const AdminStatistics = () => {
  const { isAuthenticated } = useAuth()
  const [statistics, setStatistics] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingStatistic, setEditingStatistic] = useState(null)
  const [formData, setFormData] = useState({
    label: '',
    value: '',
    icon: 'Users',
    category: 'general',
    description: '',
    isActive: true,
    isFeatured: false,
    color: 'from-primary-500 to-secondary-500',
  })

  const iconOptions = [
    'Users', 'Award', 'Star', 'Code', 'Target', 'TrendingUp', 'BookOpen', 'GraduationCap',
    'Briefcase', 'DollarSign', 'Clock', 'CheckCircle', 'Heart', 'Globe', 'Zap', 'Shield'
  ]

  const colorOptions = [
    'from-primary-500 to-secondary-500',
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-yellow-500 to-orange-500',
    'from-indigo-500 to-purple-500',
    'from-red-500 to-pink-500',
    'from-teal-500 to-blue-500',
  ]

  const categoryOptions = [
    { value: 'homepage', label: 'Homepage' },
    { value: 'about', label: 'About' },
    { value: 'dashboard', label: 'Dashboard' },
    { value: 'general', label: 'General' },
  ]

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await api.get('/statistics')
        setStatistics(response.data.data || [])
      } catch (error) {
        console.error('Error fetching statistics:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchStatistics()
    }
  }, [isAuthenticated])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingStatistic) {
        await api.put(`/statistics/${editingStatistic._id}`, formData)
        setStatistics(statistics.map(statistic => 
          statistic._id === editingStatistic._id ? { ...statistic, ...formData } : statistic
        ))
      } else {
        const response = await api.post('/statistics', formData)
        setStatistics([...statistics, response.data.data])
      }
      setShowModal(false)
      setEditingStatistic(null)
      resetForm()
    } catch (error) {
      console.error('Error saving statistic:', error)
      alert('Error saving statistic')
    }
  }

  const handleEdit = (statistic) => {
    setEditingStatistic(statistic)
    setFormData({
      label: statistic.label,
      value: statistic.value,
      icon: statistic.icon,
      category: statistic.category,
      description: statistic.description || '',
      isActive: statistic.isActive,
      isFeatured: statistic.isFeatured,
      color: statistic.color,
    })
    setShowModal(true)
  }

  const handleDelete = async (statisticId) => {
    if (window.confirm('Are you sure you want to delete this statistic?')) {
      try {
        await api.delete(`/statistics/${statisticId}`)
        setStatistics(statistics.filter(statistic => statistic._id !== statisticId))
      } catch (error) {
        console.error('Error deleting statistic:', error)
        alert('Failed to delete statistic')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      label: '',
      value: '',
      icon: 'Users',
      category: 'general',
      description: '',
      isActive: true,
      isFeatured: false,
      color: 'from-primary-500 to-secondary-500',
    })
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const getIconComponent = (iconName) => {
    const iconMap = {
      Users, Award, Star, Code, Target, TrendingUp, BookOpen, GraduationCap,
      Briefcase, DollarSign, Clock, CheckCircle, Heart, Globe, Zap, Shield
    }
    return iconMap[iconName] || Users
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
            <div className="flex items-center gap-4">
              <Link to="/admin" className="text-neutral-600 hover:text-neutral-900">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-heading font-bold text-neutral-900">
                  Manage Statistics
                </h1>
                <p className="text-neutral-600">
                  Manage website statistics and metrics
                </p>
              </div>
            </div>
            <Button onClick={() => setShowModal(true)}>
              <Plus size={16} className="mr-2" />
              Add Statistic
            </Button>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="w-16 h-16 bg-neutral-200 rounded-2xl mx-auto mb-4"></div>
                <div className="h-8 bg-neutral-200 rounded mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded w-3/4 mx-auto"></div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statistics.map((statistic, index) => {
              const IconComponent = getIconComponent(statistic.icon)
              return (
                <motion.div
                  key={statistic._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="h-full flex flex-col text-center">
                    {/* Statistic Icon */}
                    <div className="mb-4">
                      <div className={`w-16 h-16 bg-gradient-to-r ${statistic.color} rounded-2xl flex items-center justify-center mx-auto`}>
                        <IconComponent size={24} className="text-white" />
                      </div>
                    </div>

                    {/* Statistic Info */}
                    <div className="flex-1 flex flex-col">
                      <div className="text-3xl font-bold text-neutral-900 mb-2">
                        {statistic.value}
                      </div>
                      <div className="text-neutral-600 mb-2">
                        {statistic.label}
                      </div>
                      {statistic.description && (
                        <div className="text-sm text-neutral-500 mb-4">
                          {statistic.description}
                        </div>
                      )}

                      {/* Category Badge */}
                      <div className="mb-4">
                        <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
                          {categoryOptions.find(cat => cat.value === statistic.category)?.label || statistic.category}
                        </span>
                      </div>

                      {/* Status Badges */}
                      <div className="flex justify-center gap-2 mb-4">
                        {statistic.isFeatured && (
                          <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            <Star size={12} className="mr-1" />
                            Featured
                          </span>
                        )}
                        {statistic.isActive ? (
                          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => window.open(`/`, '_blank')}
                        >
                          <Eye size={16} className="mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEdit(statistic)}
                        >
                          <Edit size={16} className="mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(statistic._id)}
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}

        {!loading && statistics.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus size={32} className="text-neutral-400" />
            </div>
            <h3 className="text-2xl font-heading font-semibold text-neutral-900 mb-4">
              No statistics yet
            </h3>
            <p className="text-neutral-600 mb-6">
              Add statistics to showcase your platform's achievements
            </p>
            <Button onClick={() => setShowModal(true)}>
              <Plus size={16} className="mr-2" />
              Add Your First Statistic
            </Button>
          </motion.div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingStatistic(null)
          resetForm()
        }}
        title={editingStatistic ? 'Edit Statistic' : 'Add Statistic'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Label *
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => handleInputChange('label', e.target.value)}
                required
                placeholder="e.g., Students"
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Value *
              </label>
              <input
                type="text"
                value={formData.value}
                onChange={(e) => handleInputChange('value', e.target.value)}
                required
                placeholder="e.g., 10,000+"
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="e.g., Active learners worldwide"
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Icon *
              </label>
              <select
                value={formData.icon}
                onChange={(e) => handleInputChange('icon', e.target.value)}
                required
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
              >
                {iconOptions.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                required
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
              >
                {categoryOptions.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Color Gradient *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {colorOptions.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleInputChange('color', color)}
                  className={`w-full h-12 rounded-lg bg-gradient-to-r ${color} border-2 ${
                    formData.color === color ? 'border-primary-500' : 'border-transparent'
                  } transition-all duration-200`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-neutral-700">Active</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-neutral-700">Featured</span>
            </label>
          </div>

          <div className="flex gap-4">
            <Button type="submit" className="flex-1">
              {editingStatistic ? 'Update Statistic' : 'Add Statistic'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowModal(false)
                setEditingStatistic(null)
                resetForm()
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AdminStatistics
