import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Eye, ArrowLeft, Star, Code, Database, Brain } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../services/api'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'

const AdminFeatures = () => {
  const { isAuthenticated } = useAuth()
  const [features, setFeatures] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingFeature, setEditingFeature] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: 'Code',
    color: 'from-primary-500 to-secondary-500',
    category: 'general',
    isActive: true,
    isFeatured: false,
    link: '',
  })

  const iconOptions = [
    'Brain', 'Database', 'Code', 'Award', 'Users', 'Target', 'CheckCircle', 'Star',
    'Shield', 'Zap', 'Globe', 'Smartphone', 'Laptop', 'Cloud', 'Lock', 'Heart'
  ]

  const colorOptions = [
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-yellow-500 to-orange-500',
    'from-indigo-500 to-purple-500',
    'from-red-500 to-pink-500',
    'from-teal-500 to-blue-500',
    'from-orange-500 to-red-500',
  ]

  const categoryOptions = [
    { value: 'homepage', label: 'Homepage' },
    { value: 'about', label: 'About' },
    { value: 'courses', label: 'Courses' },
    { value: 'general', label: 'General' },
  ]

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await api.get('/features')
        setFeatures(response.data.data || [])
      } catch (error) {
        console.error('Error fetching features:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchFeatures()
    }
  }, [isAuthenticated])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingFeature) {
        await api.put(`/features/${editingFeature._id}`, formData)
        setFeatures(features.map(feature => 
          feature._id === editingFeature._id ? { ...feature, ...formData } : feature
        ))
      } else {
        const response = await api.post('/features', formData)
        setFeatures([...features, response.data.data])
      }
      setShowModal(false)
      setEditingFeature(null)
      resetForm()
    } catch (error) {
      console.error('Error saving feature:', error)
      alert('Error saving feature')
    }
  }

  const handleEdit = (feature) => {
    setEditingFeature(feature)
    setFormData({
      title: feature.title,
      description: feature.description,
      icon: feature.icon,
      color: feature.color,
      category: feature.category,
      isActive: feature.isActive,
      isFeatured: feature.isFeatured,
      link: feature.link || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (featureId) => {
    if (window.confirm('Are you sure you want to delete this feature?')) {
      try {
        await api.delete(`/features/${featureId}`)
        setFeatures(features.filter(feature => feature._id !== featureId))
      } catch (error) {
        console.error('Error deleting feature:', error)
        alert('Failed to delete feature')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      icon: 'Code',
      color: 'from-primary-500 to-secondary-500',
      category: 'general',
      isActive: true,
      isFeatured: false,
      link: '',
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
      Brain, Database, Code, Award, Users, Target, CheckCircle, Star,
      Shield, Zap, Globe, Smartphone, Laptop, Cloud, Lock, Heart
    }
    return iconMap[iconName] || Code
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
                  Manage Features
                </h1>
                <p className="text-neutral-600">
                  Manage website features and highlights
                </p>
              </div>
            </div>
            <Button onClick={() => setShowModal(true)}>
              <Plus size={16} className="mr-2" />
              Add Feature
            </Button>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="w-16 h-16 bg-neutral-200 rounded-2xl mx-auto mb-4"></div>
                <div className="h-6 bg-neutral-200 rounded mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded w-3/4 mx-auto"></div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const IconComponent = getIconComponent(feature.icon)
              return (
                <motion.div
                  key={feature._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="h-full flex flex-col text-center">
                    {/* Feature Icon */}
                    <div className="mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto`}>
                        <IconComponent size={24} className="text-white" />
                      </div>
                    </div>

                    {/* Feature Info */}
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-xl font-heading font-semibold text-neutral-900 mb-4">
                        {feature.title}
                      </h3>
                      <p className="text-neutral-600 leading-relaxed mb-4 flex-1">
                        {feature.description}
                      </p>

                      {/* Category Badge */}
                      <div className="mb-4">
                        <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
                          {categoryOptions.find(cat => cat.value === feature.category)?.label || feature.category}
                        </span>
                      </div>

                      {/* Status Badges */}
                      <div className="flex justify-center gap-2 mb-4">
                        {feature.isFeatured && (
                          <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            <Star size={12} className="mr-1" />
                            Featured
                          </span>
                        )}
                        {feature.isActive ? (
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
                          onClick={() => handleEdit(feature)}
                        >
                          <Edit size={16} className="mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(feature._id)}
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

        {!loading && features.length === 0 && (
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
              No features yet
            </h3>
            <p className="text-neutral-600 mb-6">
              Add features to highlight your platform's strengths
            </p>
            <Button onClick={() => setShowModal(true)}>
              <Plus size={16} className="mr-2" />
              Add Your First Feature
            </Button>
          </motion.div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingFeature(null)
          resetForm()
        }}
        title={editingFeature ? 'Edit Feature' : 'Add Feature'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
              rows={3}
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

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Link (optional)
            </label>
            <input
              type="url"
              value={formData.link}
              onChange={(e) => handleInputChange('link', e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
            />
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
              {editingFeature ? 'Update Feature' : 'Add Feature'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowModal(false)
                setEditingFeature(null)
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

export default AdminFeatures
