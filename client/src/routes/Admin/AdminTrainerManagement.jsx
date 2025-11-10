import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, ArrowLeft, Linkedin, Github, Mail, Star, Users, BookOpen } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../services/api'
import { toast } from 'sonner'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'
import logger from '../../utils/logger'

const AdminTrainerManagement = () => {
  const { isAuthenticated } = useAuth()
  const [trainers, setTrainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTrainer, setEditingTrainer] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    imageUrl: '',
    phone: '',
    specialization: [],
    experience: 0,
    socialLinks: {
      linkedin: '',
      github: '',
      twitter: '',
      website: '',
    },
    isActive: true,
  })

  useEffect(() => {
    logger.componentMount('AdminTrainerManagement')
    if (isAuthenticated) {
      fetchTrainers()
    }
    return () => {
      logger.componentUnmount('AdminTrainerManagement')
    }
  }, [isAuthenticated])

  const fetchTrainers = async () => {
    logger.functionEntry('fetchTrainers')
    const startTime = Date.now()
    try {
      logger.apiRequest('GET', '/trainers')
      const response = await api.get('/trainers')
      logger.apiResponse('GET', '/trainers', response.status, { count: response.data.data?.length || 0 }, Date.now() - startTime)
      setTrainers(response.data.data || [])
      logger.info('Trainers fetched successfully', { count: trainers.length })
    } catch (error) {
      logger.error('Failed to fetch trainers', error)
      toast.error('Failed to fetch trainers')
    } finally {
      setLoading(false)
      logger.functionExit('fetchTrainers', { duration: `${Date.now() - startTime}ms` })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    logger.functionEntry('handleSubmit', { editingTrainer: !!editingTrainer })
    const startTime = Date.now()
    try {
      if (editingTrainer) {
        logger.apiRequest('PUT', `/trainers/${editingTrainer._id}`, formData)
        await api.put(`/trainers/${editingTrainer._id}`, formData)
        logger.apiResponse('PUT', `/trainers/${editingTrainer._id}`, 200, {}, Date.now() - startTime)
        toast.success('Trainer updated successfully')
      } else {
        logger.apiRequest('POST', '/trainers', formData)
        const response = await api.post('/trainers', formData)
        logger.apiResponse('POST', '/trainers', 200, {}, Date.now() - startTime)
        toast.success('Trainer created successfully')
      }
      setShowModal(false)
      setEditingTrainer(null)
      resetForm()
      fetchTrainers()
      logger.functionExit('handleSubmit', { success: true, duration: `${Date.now() - startTime}ms` })
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('Error saving trainer', error, { duration: `${duration}ms` })
      toast.error(error.response?.data?.message || 'Failed to save trainer')
      logger.functionExit('handleSubmit', { success: false, error: error.message, duration: `${duration}ms` })
    }
  }

  const handleEdit = (trainer) => {
    logger.functionEntry('handleEdit', { trainerId: trainer._id })
    setEditingTrainer(trainer)
    setFormData({
      name: trainer.name || '',
      email: trainer.email || '',
      bio: trainer.bio || '',
      imageUrl: trainer.imageUrl || '',
      phone: trainer.phone || '',
      specialization: trainer.specialization || [],
      experience: trainer.experience || 0,
      socialLinks: {
        linkedin: trainer.socialLinks?.linkedin || '',
        github: trainer.socialLinks?.github || '',
        twitter: trainer.socialLinks?.twitter || '',
        website: trainer.socialLinks?.website || '',
      },
      isActive: trainer.isActive !== undefined ? trainer.isActive : true,
    })
    setShowModal(true)
    logger.functionExit('handleEdit')
  }

  const handleDelete = async (trainerId) => {
    logger.functionEntry('handleDelete', { trainerId })
    if (!window.confirm('Are you sure you want to delete this trainer?')) {
      logger.debug('Delete cancelled by user')
      return
    }
    const startTime = Date.now()
    try {
      logger.apiRequest('DELETE', `/trainers/${trainerId}`)
      await api.delete(`/trainers/${trainerId}`)
      logger.apiResponse('DELETE', `/trainers/${trainerId}`, 200, {}, Date.now() - startTime)
      toast.success('Trainer deleted successfully')
      fetchTrainers()
      logger.functionExit('handleDelete', { success: true, duration: `${Date.now() - startTime}ms` })
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('Error deleting trainer', error, { duration: `${duration}ms` })
      toast.error('Failed to delete trainer')
      logger.functionExit('handleDelete', { success: false, error: error.message, duration: `${duration}ms` })
    }
  }

  const resetForm = () => {
    setEditingTrainer(null)
    setFormData({
      name: '',
      email: '',
      bio: '',
      imageUrl: '',
      phone: '',
      specialization: [],
      experience: 0,
      socialLinks: {
        linkedin: '',
        github: '',
        twitter: '',
        website: '',
      },
      isActive: true,
    })
  }

  const handleInputChange = (field, value) => {
    if (field.startsWith('socialLinks.')) {
      const socialField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialField]: value,
        },
      }))
    } else if (field === 'specialization') {
      // Handle comma-separated specialization string
      const specializations = value.split(',').map(s => s.trim()).filter(Boolean)
      setFormData(prev => ({
        ...prev,
        [field]: specializations,
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-200">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin" className="text-neutral-600 hover:text-neutral-900">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-heading font-bold text-neutral-900">
                  Manage Trainers
                </h1>
                <p className="text-neutral-600">
                  Manage trainers who can be assigned to courses
                </p>
              </div>
            </div>
            <Button onClick={() => { setShowModal(true); resetForm() }}>
              <Plus size={16} className="mr-2" />
              Add Trainer
            </Button>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainers.map((trainer, index) => (
              <motion.div
                key={trainer._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col text-center">
                  <div className="mb-6">
                    <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                      {trainer.imageUrl ? (
                        <img src={trainer.imageUrl} alt={trainer.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-2xl font-bold">{trainer.name.charAt(0)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <h3 className="text-xl font-heading font-semibold text-neutral-900 mb-2">{trainer.name}</h3>
                    <div className="text-primary-600 font-medium mb-2">{trainer.email}</div>
                    {trainer.experience > 0 && (
                      <div className="text-neutral-500 text-sm mb-4">{trainer.experience} years experience</div>
                    )}

                    {trainer.bio && (
                      <p className="text-neutral-600 text-sm mb-4 flex-1">
                        {trainer.bio.length > 120 ? `${trainer.bio.substring(0, 120)}...` : trainer.bio}
                      </p>
                    )}

                    {trainer.specialization && trainer.specialization.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4 justify-center">
                        {trainer.specialization.slice(0, 3).map((spec, specIndex) => (
                          <span key={specIndex} className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-lg">
                            {spec}
                          </span>
                        ))}
                        {trainer.specialization.length > 3 && (
                          <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-lg">
                            +{trainer.specialization.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex justify-center gap-4 mb-4 text-sm text-neutral-600">
                      {trainer.rating?.average > 0 && (
                        <div className="flex items-center gap-1">
                          <Star size={16} className="text-yellow-400 fill-yellow-400" />
                          <span>{trainer.rating.average.toFixed(1)}</span>
                        </div>
                      )}
                      {trainer.totalStudents > 0 && (
                        <div className="flex items-center gap-1">
                          <Users size={16} />
                          <span>{trainer.totalStudents}</span>
                        </div>
                      )}
                      {trainer.totalCourses > 0 && (
                        <div className="flex items-center gap-1">
                          <BookOpen size={16} />
                          <span>{trainer.totalCourses}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => handleEdit(trainer)}>
                        <Edit size={16} />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(trainer._id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm() }}
        title={editingTrainer ? 'Edit Trainer' : 'Add New Trainer'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full p-2 border border-neutral-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full p-2 border border-neutral-300 rounded-md"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="w-full p-2 border border-neutral-300 rounded-md"
              rows="3"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Image URL</label>
              <input
                type="text"
                value={formData.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                className="w-full p-2 border border-neutral-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full p-2 border border-neutral-300 rounded-md"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Specialization (comma-separated)</label>
            <input
              type="text"
              value={formData.specialization.join(', ')}
              onChange={(e) => handleInputChange('specialization', e.target.value)}
              className="w-full p-2 border border-neutral-300 rounded-md"
              placeholder="React, Node.js, MongoDB"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Experience (years)</label>
            <input
              type="number"
              value={formData.experience}
              onChange={(e) => handleInputChange('experience', parseInt(e.target.value) || 0)}
              className="w-full p-2 border border-neutral-300 rounded-md"
              min="0"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">LinkedIn</label>
              <input
                type="text"
                value={formData.socialLinks.linkedin}
                onChange={(e) => handleInputChange('socialLinks.linkedin', e.target.value)}
                className="w-full p-2 border border-neutral-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">GitHub</label>
              <input
                type="text"
                value={formData.socialLinks.github}
                onChange={(e) => handleInputChange('socialLinks.github', e.target.value)}
                className="w-full p-2 border border-neutral-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Twitter</label>
              <input
                type="text"
                value={formData.socialLinks.twitter}
                onChange={(e) => handleInputChange('socialLinks.twitter', e.target.value)}
                className="w-full p-2 border border-neutral-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Website</label>
              <input
                type="text"
                value={formData.socialLinks.website}
                onChange={(e) => handleInputChange('socialLinks.website', e.target.value)}
                className="w-full p-2 border border-neutral-300 rounded-md"
              />
            </div>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="mr-2"
            />
            <label className="text-sm font-medium text-neutral-700">Active</label>
          </div>
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={() => { setShowModal(false); resetForm() }}>
              Cancel
            </Button>
            <Button type="submit">
              {editingTrainer ? 'Update Trainer' : 'Create Trainer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AdminTrainerManagement

