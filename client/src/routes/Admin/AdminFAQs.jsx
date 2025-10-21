import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Eye, ArrowLeft, HelpCircle, Star, MessageSquare } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../services/api'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'

const AdminFAQs = () => {
  const { isAuthenticated } = useAuth()
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingFaq, setEditingFaq] = useState(null)
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general',
    isActive: true,
    isFeatured: false,
    tags: [],
  })

  const categoryOptions = [
    { value: 'general', label: 'General' },
    { value: 'courses', label: 'Courses' },
    { value: 'billing', label: 'Billing' },
    { value: 'technical', label: 'Technical' },
    { value: 'support', label: 'Support' },
  ]

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await api.get('/faqs')
        setFaqs(response.data.data || [])
      } catch (error) {
        console.error('Error fetching FAQs:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchFAQs()
    }
  }, [isAuthenticated])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingFaq) {
        await api.put(`/faqs/${editingFaq._id}`, formData)
        setFaqs(faqs.map(faq => 
          faq._id === editingFaq._id ? { ...faq, ...formData } : faq
        ))
      } else {
        const response = await api.post('/faqs', formData)
        setFaqs([...faqs, response.data.data])
      }
      setShowModal(false)
      setEditingFaq(null)
      resetForm()
    } catch (error) {
      console.error('Error saving FAQ:', error)
      alert('Error saving FAQ')
    }
  }

  const handleEdit = (faq) => {
    setEditingFaq(faq)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      isActive: faq.isActive,
      isFeatured: faq.isFeatured,
      tags: faq.tags || [],
    })
    setShowModal(true)
  }

  const handleDelete = async (faqId) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        await api.delete(`/faqs/${faqId}`)
        setFaqs(faqs.filter(faq => faq._id !== faqId))
      } catch (error) {
        console.error('Error deleting FAQ:', error)
        alert('Failed to delete FAQ')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: 'general',
      isActive: true,
      isFeatured: false,
      tags: [],
    })
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleTagsChange = (value) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag)
    setFormData(prev => ({
      ...prev,
      tags,
    }))
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
                  Manage FAQs
                </h1>
                <p className="text-neutral-600">
                  Manage frequently asked questions
                </p>
              </div>
            </div>
            <Button onClick={() => setShowModal(true)}>
              <Plus size={16} className="mr-2" />
              Add FAQ
            </Button>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-6 bg-neutral-200 rounded mb-3"></div>
                <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* FAQ Icon and Question */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <HelpCircle size={20} className="text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-heading font-semibold text-neutral-900 mb-2">
                            {faq.question}
                          </h3>
                          <p className="text-neutral-600 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>

                      {/* Tags and Category */}
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
                          {categoryOptions.find(cat => cat.value === faq.category)?.label || faq.category}
                        </span>
                        {faq.tags && faq.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {faq.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-lg"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Status Badges */}
                      <div className="flex gap-2">
                        {faq.isFeatured && (
                          <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            <Star size={12} className="mr-1" />
                            Featured
                          </span>
                        )}
                        {faq.isActive ? (
                          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/contact`, '_blank')}
                      >
                        <Eye size={16} className="mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(faq)}
                      >
                        <Edit size={16} className="mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(faq._id)}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && faqs.length === 0 && (
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
              No FAQs yet
            </h3>
            <p className="text-neutral-600 mb-6">
              Add frequently asked questions to help your users
            </p>
            <Button onClick={() => setShowModal(true)}>
              <Plus size={16} className="mr-2" />
              Add Your First FAQ
            </Button>
          </motion.div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingFaq(null)
          resetForm()
        }}
        title={editingFaq ? 'Edit FAQ' : 'Add FAQ'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Question *
            </label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) => handleInputChange('question', e.target.value)}
              required
              placeholder="e.g., How long are the courses?"
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Answer *
            </label>
            <textarea
              value={formData.answer}
              onChange={(e) => handleInputChange('answer', e.target.value)}
              required
              rows={4}
              placeholder="Provide a detailed answer..."
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
            />
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

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={formData.tags.join(', ')}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="e.g., duration, time, schedule (comma separated)"
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
            />
            <p className="text-sm text-neutral-500 mt-1">
              Separate tags with commas
            </p>
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
              {editingFaq ? 'Update FAQ' : 'Add FAQ'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowModal(false)
                setEditingFaq(null)
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

export default AdminFAQs
