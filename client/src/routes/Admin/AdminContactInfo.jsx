import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Eye, ArrowLeft, Mail, Phone, MapPin, ExternalLink } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../services/api'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'

const AdminContactInfo = () => {
  const { isAuthenticated } = useAuth()
  const [contactInfo, setContactInfo] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [formData, setFormData] = useState({
    type: 'email',
    title: '',
    value: '',
    description: '',
    icon: 'Mail',
    link: '',
    isActive: true,
    isPrimary: false,
    category: 'general',
  })

  const typeOptions = [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'address', label: 'Address' },
    { value: 'social', label: 'Social Media' },
    { value: 'office_hours', label: 'Office Hours' },
  ]

  const iconOptions = [
    'Mail', 'Phone', 'MapPin', 'Clock', 'Linkedin', 'Twitter', 'Github', 'Globe',
    'MessageCircle', 'Video', 'Calendar', 'User', 'Building', 'Home'
  ]

  const categoryOptions = [
    { value: 'general', label: 'General' },
    { value: 'support', label: 'Support' },
    { value: 'sales', label: 'Sales' },
    { value: 'technical', label: 'Technical' },
  ]

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await api.get('/contact-info')
        setContactInfo(response.data.data || [])
      } catch (error) {
        console.error('Error fetching contact info:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchContactInfo()
    }
  }, [isAuthenticated])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingContact) {
        await api.put(`/contact-info/${editingContact._id}`, formData)
        setContactInfo(contactInfo.map(contact => 
          contact._id === editingContact._id ? { ...contact, ...formData } : contact
        ))
      } else {
        const response = await api.post('/contact-info', formData)
        setContactInfo([...contactInfo, response.data.data])
      }
      setShowModal(false)
      setEditingContact(null)
      resetForm()
    } catch (error) {
      console.error('Error saving contact info:', error)
      alert('Error saving contact info')
    }
  }

  const handleEdit = (contact) => {
    setEditingContact(contact)
    setFormData({
      type: contact.type,
      title: contact.title,
      value: contact.value,
      description: contact.description || '',
      icon: contact.icon,
      link: contact.link || '',
      isActive: contact.isActive,
      isPrimary: contact.isPrimary,
      category: contact.category,
    })
    setShowModal(true)
  }

  const handleDelete = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact info?')) {
      try {
        await api.delete(`/contact-info/${contactId}`)
        setContactInfo(contactInfo.filter(contact => contact._id !== contactId))
      } catch (error) {
        console.error('Error deleting contact info:', error)
        alert('Failed to delete contact info')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      type: 'email',
      title: '',
      value: '',
      description: '',
      icon: 'Mail',
      link: '',
      isActive: true,
      isPrimary: false,
      category: 'general',
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
      Mail, Phone, MapPin, Clock, Linkedin, Twitter, Github, Globe,
      MessageCircle, Video, Calendar, User, Building, Home
    }
    return iconMap[iconName] || Mail
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
                  Manage Contact Info
                </h1>
                <p className="text-neutral-600">
                  Manage contact information and social links
                </p>
              </div>
            </div>
            <Button onClick={() => setShowModal(true)}>
              <Plus size={16} className="mr-2" />
              Add Contact Info
            </Button>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="w-12 h-12 bg-neutral-200 rounded-xl mx-auto mb-4"></div>
                <div className="h-6 bg-neutral-200 rounded mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded w-3/4 mx-auto"></div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contactInfo.map((contact, index) => {
              const IconComponent = getIconComponent(contact.icon)
              return (
                <motion.div
                  key={contact._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="h-full flex flex-col text-center">
                    {/* Contact Icon */}
                    <div className="mb-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto">
                        <IconComponent size={20} className="text-primary-600" />
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-lg font-heading font-semibold text-neutral-900 mb-2">
                        {contact.title}
                      </h3>
                      <div className="text-neutral-600 mb-2">
                        {contact.value}
                      </div>
                      {contact.description && (
                        <div className="text-sm text-neutral-500 mb-4">
                          {contact.description}
                        </div>
                      )}

                      {/* Type and Category Badges */}
                      <div className="flex justify-center gap-2 mb-4">
                        <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
                          {typeOptions.find(type => type.value === contact.type)?.label || contact.type}
                        </span>
                        <span className="inline-block px-3 py-1 bg-neutral-100 text-neutral-600 text-sm rounded-full">
                          {categoryOptions.find(cat => cat.value === contact.category)?.label || contact.category}
                        </span>
                      </div>

                      {/* Status Badges */}
                      <div className="flex justify-center gap-2 mb-4">
                        {contact.isPrimary && (
                          <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            Primary
                          </span>
                        )}
                        {contact.isActive ? (
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
                          onClick={() => window.open(`/contact`, '_blank')}
                        >
                          <Eye size={16} className="mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEdit(contact)}
                        >
                          <Edit size={16} className="mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(contact._id)}
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

        {!loading && contactInfo.length === 0 && (
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
              No contact info yet
            </h3>
            <p className="text-neutral-600 mb-6">
              Add contact information to help users reach you
            </p>
            <Button onClick={() => setShowModal(true)}>
              <Plus size={16} className="mr-2" />
              Add Your First Contact Info
            </Button>
          </motion.div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingContact(null)
          resetForm()
        }}
        title={editingContact ? 'Edit Contact Info' : 'Add Contact Info'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                required
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
              >
                {typeOptions.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
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
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
              placeholder="e.g., Email Us"
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
              placeholder="e.g., contact@techspert.com"
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="e.g., Send us an email anytime"
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
                checked={formData.isPrimary}
                onChange={(e) => handleInputChange('isPrimary', e.target.checked)}
                className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-neutral-700">Primary</span>
            </label>
          </div>

          <div className="flex gap-4">
            <Button type="submit" className="flex-1">
              {editingContact ? 'Update Contact Info' : 'Add Contact Info'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowModal(false)
                setEditingContact(null)
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

export default AdminContactInfo
