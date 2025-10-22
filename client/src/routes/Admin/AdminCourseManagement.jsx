import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, Edit, Trash2, Eye, Search, Filter, Calendar, Users, 
  DollarSign, Star, Clock, BookOpen, Video, Settings, Save,
  X, Upload, Image, Link, CheckCircle, AlertCircle, Play
} from 'lucide-react'
import { api } from '../../services/api'
import { toast } from 'sonner'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'

const AdminCourseManagement = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    price: '',
    originalPrice: '',
    duration: '',
    level: 'beginner',
    tags: [],
    thumbnailUrl: '',
    previewUrl: '',
    instructor: {
      name: '',
      bio: '',
      imageUrl: '',
      socialLinks: {
        linkedin: '',
        github: '',
        twitter: ''
      }
    },
    whatYouWillLearn: [],
    requirements: [],
    syllabus: [],
    isPublished: false,
    isFeatured: false,
    position: 0
  })

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await api.get('/courses')
      setCourses(response.data.data || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
      toast.error('Failed to fetch courses')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingCourse) {
        await api.put(`/courses/${editingCourse._id}`, formData)
        toast.success('Course updated successfully')
      } else {
        await api.post('/courses', formData)
        toast.success('Course created successfully')
      }
      setShowModal(false)
      setEditingCourse(null)
      resetForm()
      fetchCourses()
    } catch (error) {
      console.error('Error saving course:', error)
      toast.error('Failed to save course')
    }
  }

  const handleEdit = (course) => {
    setEditingCourse(course)
    setFormData({
      title: course.title || '',
      description: course.description || '',
      shortDescription: course.shortDescription || '',
      price: course.price || '',
      originalPrice: course.originalPrice || '',
      duration: course.duration || '',
      level: course.level || 'beginner',
      tags: course.tags || [],
      thumbnailUrl: course.thumbnailUrl || '',
      previewUrl: course.previewUrl || '',
      instructor: course.instructor || {
        name: '',
        bio: '',
        imageUrl: '',
        socialLinks: { linkedin: '', github: '', twitter: '' }
      },
      whatYouWillLearn: course.whatYouWillLearn || [],
      requirements: course.requirements || [],
      syllabus: course.syllabus || [],
      isPublished: course.isPublished || false,
      isFeatured: course.isFeatured || false,
      position: course.position || 0
    })
    setShowModal(true)
  }

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await api.delete(`/courses/${courseId}`)
        toast.success('Course deleted successfully')
        fetchCourses()
      } catch (error) {
        console.error('Error deleting course:', error)
        toast.error('Failed to delete course')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      shortDescription: '',
      price: '',
      originalPrice: '',
      duration: '',
      level: 'beginner',
      tags: [],
      thumbnailUrl: '',
      previewUrl: '',
      instructor: {
        name: '',
        bio: '',
        imageUrl: '',
        socialLinks: { linkedin: '', github: '', twitter: '' }
      },
      whatYouWillLearn: [],
      requirements: [],
      syllabus: [],
      isPublished: false,
      isFeatured: false,
      position: 0
    })
  }

  const addArrayItem = (field, value = '') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], value]
    }))
  }

  const updateArrayItem = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = filterLevel === 'all' || course.level === filterLevel
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'published' && course.isPublished) ||
                         (filterStatus === 'draft' && !course.isPublished)
    return matchesSearch && matchesLevel && matchesStatus
  })

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container-custom">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-neutral-200 rounded-2xl"></div>
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
                Course Management
              </h1>
              <p className="text-neutral-600">
                Manage all courses, content, and live sessions
              </p>
            </div>
            <Button onClick={() => setShowModal(true)}>
              <Plus size={16} className="mr-2" />
              Add Course
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
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </Card>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="h-full">
                <div className="aspect-video bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl mb-4 overflow-hidden">
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen size={48} className="text-white/80" />
                    </div>
                  )}
                </div>

                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900 mb-1 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-neutral-600 line-clamp-2">
                      {course.shortDescription || course.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    {course.isPublished ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <AlertCircle size={16} className="text-yellow-500" />
                    )}
                    {course.isFeatured && (
                      <Star size={16} className="text-yellow-500 fill-current" />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                    {course.level}
                  </span>
                  <div className="flex items-center gap-1 text-sm text-neutral-500">
                    <Clock size={14} />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-neutral-500">
                    <Users size={14} />
                    <span>{course.studentsCount || 0}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-green-600" />
                    <span className="font-semibold text-green-600">${course.price}</span>
                    {course.originalPrice && course.originalPrice > course.price && (
                      <span className="text-sm text-neutral-500 line-through">
                        ${course.originalPrice}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-400 fill-current" />
                    <span className="text-sm text-neutral-600">
                      {course.rating?.average || 0}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(course)}
                  >
                    <Edit size={14} className="mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.open(`/courses/${course._id}`, '_blank')}
                  >
                    <Eye size={14} className="mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(course._id)}
                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen size={48} className="text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No courses found
            </h3>
            <p className="text-neutral-600 mb-4">
              {searchTerm || filterLevel !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first course'
              }
            </p>
            {!searchTerm && filterLevel === 'all' && filterStatus === 'all' && (
              <Button onClick={() => setShowModal(true)}>
                <Plus size={16} className="mr-2" />
                Create Course
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Course Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingCourse(null)
          resetForm()
        }}
        title={editingCourse ? 'Edit Course' : 'Create New Course'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter course title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Short Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.shortDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Brief description for course cards"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Full Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Detailed course description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Original Price
                  </label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Duration *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 8 weeks"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Level *
                  </label>
                  <select
                    required
                    value={formData.level}
                    onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Media & Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900">Media & Settings</h3>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Thumbnail URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Preview Video URL
                </label>
                <input
                  type="url"
                  value={formData.previewUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, previewUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                  }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="React, JavaScript, Web Development"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="isPublished" className="ml-2 text-sm text-neutral-700">
                    Publish Course
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="isFeatured" className="ml-2 text-sm text-neutral-700">
                    Featured Course
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Instructor Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900">Instructor Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Instructor Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.instructor.name}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    instructor: { ...prev.instructor, name: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Instructor name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Instructor Image URL
                </label>
                <input
                  type="url"
                  value={formData.instructor.imageUrl}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    instructor: { ...prev.instructor, imageUrl: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Instructor Bio
              </label>
              <textarea
                rows={3}
                value={formData.instructor.bio}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  instructor: { ...prev.instructor, bio: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Instructor biography"
              />
            </div>
          </div>

          {/* What You'll Learn */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900">What You'll Learn</h3>
            {formData.whatYouWillLearn.map((item, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateArrayItem('whatYouWillLearn', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Learning outcome"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeArrayItem('whatYouWillLearn', index)}
                >
                  <X size={16} />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => addArrayItem('whatYouWillLearn')}
            >
              <Plus size={16} className="mr-2" />
              Add Learning Outcome
            </Button>
          </div>

          {/* Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900">Requirements</h3>
            {formData.requirements.map((item, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateArrayItem('requirements', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Course requirement"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeArrayItem('requirements', index)}
                >
                  <X size={16} />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => addArrayItem('requirements')}
            >
              <Plus size={16} className="mr-2" />
              Add Requirement
            </Button>
          </div>

          {/* Syllabus */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900">Course Syllabus</h3>
            {formData.syllabus.map((item, index) => (
              <div key={index} className="border border-neutral-200 rounded-lg p-4 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateArrayItem('syllabus', index, { ...item, title: e.target.value })}
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Section title"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('syllabus', index)}
                  >
                    <X size={16} />
                  </Button>
                </div>
                <textarea
                  value={item.description}
                  onChange={(e) => updateArrayItem('syllabus', index, { ...item, description: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Section description"
                  rows={2}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={item.duration}
                    onChange={(e) => updateArrayItem('syllabus', index, { ...item, duration: e.target.value })}
                    className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Duration (e.g., 2 hours)"
                  />
                  <input
                    type="number"
                    value={item.lessons}
                    onChange={(e) => updateArrayItem('syllabus', index, { ...item, lessons: parseInt(e.target.value) || 0 })}
                    className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Number of lessons"
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => addArrayItem('syllabus', { title: '', description: '', duration: '', lessons: 0, order: formData.syllabus.length })}
            >
              <Plus size={16} className="mr-2" />
              Add Section
            </Button>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t border-neutral-200">
            <Button type="submit" className="flex-1">
              <Save size={16} className="mr-2" />
              {editingCourse ? 'Update Course' : 'Create Course'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowModal(false)
                setEditingCourse(null)
                resetForm()
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

export default AdminCourseManagement
