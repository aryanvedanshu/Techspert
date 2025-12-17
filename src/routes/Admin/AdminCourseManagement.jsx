import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Plus, Edit, Trash2, Eye, Search, Filter, Calendar, Users,
  BookOpen, Star, Clock, Image, Link, CheckCircle, AlertCircle,
  Save, X, Upload, ExternalLink, Award, DollarSign, Code, Brain
} from 'lucide-react'
import { api } from '../../services/api'
import { toast } from 'sonner'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'
import FileUpload from '../../components/UI/FileUpload'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import logger from '../../utils/logger'

const AdminCourseManagement = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [trainers, setTrainers] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    shortDescription: '',
    thumbnailUrl: '',
    price: 0,
    originalPrice: 0,
    salePrice: 0,
    saleStartDate: '',
    saleStartTime: '',
    saleEndDate: '',
    saleEndTime: '',
    isVisible: true,
    duration: '',
    level: 'beginner',
    instructor: '',
    language: 'English',
    rating: 0,
    totalRatings: 0,
    studentsEnrolled: 0,
    isPublished: false,
    isFeatured: false,
    content: '',
    syllabus: [],
    modules: [],
    tags: [],
    position: 0
  })

  useEffect(() => {
    logger.componentMount('AdminCourseManagement')
    logger.functionEntry('useEffect - fetchCourses and trainers on mount')
    fetchCourses()
    fetchTrainers()
    return () => {
      logger.componentUnmount('AdminCourseManagement')
    }
  }, [])

  const fetchTrainers = async () => {
    logger.functionEntry('fetchTrainers')
    const startTime = Date.now()
    try {
      setLoading(true)
      logger.apiRequest('GET', '/trainers?isActive=true')
      const response = await api.get('/trainers?isActive=true')
      const fetchedTrainers = response.data.data || response.data || []

      logger.apiResponse('GET', '/trainers', response.status, { count: fetchedTrainers.length }, Date.now() - startTime)

      logger.stateChange('AdminCourseManagement', 'trainers', trainers, fetchedTrainers)
      setTrainers(fetchedTrainers)

      logger.success('Trainers fetched successfully', {
        count: fetchedTrainers.length,
        trainerNames: fetchedTrainers.map(t => t.name),
        duration: `${Date.now() - startTime}ms`
      })

      if (fetchedTrainers.length === 0) {
        logger.warn('No active trainers found', {
          message: 'Please seed trainers or ensure trainers are marked as active'
        })
        toast.warning('No active trainers found. Please add trainers first.')
      }
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('Failed to fetch trainers', error, {
        endpoint: '/trainers?isActive=true',
        duration: `${duration}ms`,
        errorMessage: error.message,
        errorResponse: error.response?.data
      })
      toast.error('Failed to fetch trainers')
      logger.functionExit('fetchTrainers', { success: false, error: error.message, duration: `${duration}ms` })
    } finally {
      setLoading(false)
      logger.functionExit('fetchTrainers', { success: true, duration: `${Date.now() - startTime}ms` })
    }
  }

  const fetchCourses = async () => {
    logger.functionEntry('fetchCourses')
    const startTime = Date.now()

    try {
      logger.debug('Starting to fetch courses', { endpoint: '/admin/courses' })
      setLoading(true)

      logger.apiRequest('GET', '/admin/courses')
      const response = await api.get('/admin/courses')

      const courses = response.data.data || []
      logger.apiResponse('GET', '/admin/courses', response.status, { count: courses.length }, Date.now() - startTime)

      logger.info('Courses fetched successfully', {
        count: courses.length,
        total: response.data.total,
        duration: `${Date.now() - startTime}ms`
      })

      logger.stateChange('AdminCourseManagement', 'courses', null, courses)
      setCourses(courses)
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('Failed to fetch courses', error, {
        endpoint: '/admin/courses',
        duration: `${duration}ms`,
        errorMessage: error.message,
        errorResponse: error.response?.data
      })
      toast.error('Failed to fetch courses')
    } finally {
      setLoading(false)
      logger.functionExit('fetchCourses', { duration: `${Date.now() - startTime}ms` })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const courseId = editingCourse?.id || editingCourse?._id
    logger.functionEntry('handleSubmit', { editingCourse: courseId, formData })
    const startTime = Date.now()

    // Transform formData to match backend schema
    // Convert rating (number) and totalRatings (number) to rating object
    // Convert instructor string to instructor object
    // Ensure required arrays are present
    const submitData = {
      ...formData,
      rating: {
        average: formData.rating || 0,
        count: formData.totalRatings || 0
      },
      studentsCount: formData.studentsEnrolled || 0,
      // Convert instructor string to object with name (for backward compatibility)
      instructor: typeof formData.instructor === 'string'
        ? { name: formData.instructor || 'Instructor' }
        : (formData.instructor || { name: 'Instructor' }),
      // Include trainer reference if selected
      ...(formData.trainer && { trainer: formData.trainer }),
      // Include sale scheduling fields if provided
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : 0,
      // Combine date and time into datetime strings for Firestore
      ...(formData.saleStartDate && {
        saleStartDate: formData.saleStartDate,
        saleStartTime: formData.saleStartTime || '00:00'
      }),
      ...(formData.saleEndDate && {
        saleEndDate: formData.saleEndDate,
        saleEndTime: formData.saleEndTime || '23:59'
      }),
      // Set originalPrice to current price if not set (for sale comparison)
      originalPrice: formData.originalPrice || formData.price || 0,
      isVisible: formData.isVisible !== undefined ? formData.isVisible : true,
      // Ensure required arrays exist with at least one item (each item is required)
      whatYouWillLearn: (formData.whatYouWillLearn && formData.whatYouWillLearn.length > 0)
        ? formData.whatYouWillLearn
        : (formData.modules?.map(m => m.title).filter(Boolean).length > 0
          ? formData.modules.map(m => m.title).filter(Boolean)
          : ['Learn valuable skills']),
      requirements: (formData.requirements && formData.requirements.length > 0)
        ? formData.requirements
        : ['Basic computer knowledge']
    }

    // Remove fields that don't exist in the schema
    delete submitData.totalRatings
    delete submitData.studentsEnrolled
    delete submitData.content // This field doesn't exist in the schema

    try {
      logger.debug('Submitting course data', {
        courseId: courseId,
        isUpdate: !!editingCourse,
        ratingFormat: submitData.rating
      })

      if (editingCourse) {
        logger.apiRequest('PUT', `/admin/courses/${courseId}`, submitData)
        await api.put(`/admin/courses/${courseId}`, submitData)
        logger.apiResponse('PUT', `/admin/courses/${courseId}`, 200, { message: 'Course updated successfully' }, Date.now() - startTime)
        toast.success('Course updated successfully')
      } else {
        logger.apiRequest('POST', '/admin/courses', submitData)
        await api.post('/admin/courses', submitData)
        logger.apiResponse('POST', '/admin/courses', 200, { message: 'Course created successfully' }, Date.now() - startTime)
        toast.success('Course created successfully')
      }
      setShowModal(false)
      setEditingCourse(null)
      resetForm()
      fetchCourses()
      logger.functionExit('handleSubmit', { success: true, duration: `${Date.now() - startTime}ms` })
    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error.response?.data?.message || error.message
      const errorDetails = error.response?.data?.errors || error.response?.data

      logger.error('Error saving course', error, {
        formData,
        submitData: submitData,
        editingCourse: editingCourse?._id,
        duration: `${duration}ms`,
        errorMessage,
        errorResponse: error.response?.data,
        errorDetails
      })
      // Error already logged above with logger.error

      // Show detailed error message
      if (errorDetails && typeof errorDetails === 'object') {
        const validationErrors = Object.values(errorDetails).flat().join(', ')
        toast.error(validationErrors || errorMessage || 'Failed to save course')
      } else {
        toast.error(errorMessage || 'Failed to save course')
      }
      logger.functionExit('handleSubmit', { success: false, error: error.message, duration: `${duration}ms` })
    }
  }

  const handleEdit = async (course) => {
    const courseId = course.id || course._id
    logger.functionEntry('handleEdit', { courseId, courseTitle: course.title })
    const startTime = Date.now()

    try {
      // If course data seems incomplete, fetch from admin endpoint
      if (!course.description || !course.syllabus) {
        logger.debug('Course data incomplete, fetching full course data', {
          courseId,
          hasDescription: !!course.description,
          hasSyllabus: !!course.syllabus
        })

        logger.apiRequest('GET', `/admin/courses/${courseId}`)
        const response = await api.get(`/admin/courses/${courseId}`)
        logger.apiResponse('GET', `/admin/courses/${courseId}`, response.status, { hasData: !!response.data.data })

        course = response.data.data
        logger.info('Full course data fetched', { courseId: course.id || course._id })
      }

      logger.debug('Setting up edit form', { courseId: course.id || course._id })
      setEditingCourse(course)
      setFormData({
        title: course.title || '',
        slug: course.slug || '',
        description: course.description || '',
        shortDescription: course.shortDescription || '',
        thumbnailUrl: course.thumbnailUrl || '',
        price: course.price || 0,
        originalPrice: course.originalPrice || course.price || 0,
        duration: course.duration || '',
        level: course.level || 'beginner',
        instructor: typeof course.instructor === 'object' ? course.instructor.name || '' : (course.instructor || ''),
        trainer: course.trainer?._id || course.trainer || '', // Trainer ID
        language: course.language || 'English',
        rating: course.rating?.average || 0,
        totalRatings: course.rating?.count || course.totalRatings || 0,
        studentsEnrolled: course.studentsEnrolled || course.studentsCount || 0,
        isPublished: course.isPublished || false,
        isFeatured: course.isFeatured || false,
        content: course.content || '',
        syllabus: course.syllabus || [],
        modules: course.modules || [],
        tags: course.tags || [],
        position: course.position || 0,
        // Sale scheduling fields
        salePrice: course.salePrice || 0,
        saleStartDate: course.saleStartDate || '',
        saleStartTime: course.saleStartTime || '',
        saleEndDate: course.saleEndDate || '',
        saleEndTime: course.saleEndTime || '',
        isVisible: course.isVisible !== undefined ? course.isVisible : true
      })
      logger.stateChange('AdminCourseManagement', 'showModal', false, true)
      setShowModal(true)

      logger.functionExit('handleEdit', {
        success: true,
        courseId: course.id || course._id,
        duration: `${Date.now() - startTime}ms`
      })
    } catch (error) {
      const duration = Date.now() - startTime
      const errorCourseId = course?.id || course?._id || 'unknown'
      logger.error('Failed to edit course', error, {
        courseId: errorCourseId,
        duration: `${duration}ms`,
        errorMessage: error.message,
        errorResponse: error.response?.data
      })
      toast.error('Failed to fetch course data')

      logger.functionExit('handleEdit', {
        success: false,
        error: error.message,
        duration: `${duration}ms`
      })
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return

    logger.functionEntry('handleDelete', { courseId: id })
    const startTime = Date.now()
    try {
      logger.apiRequest('DELETE', `/admin/courses/${id}`)
      await api.delete(`/admin/courses/${id}`)
      logger.apiResponse('DELETE', `/admin/courses/${id}`, 200, { message: 'Course deleted' }, Date.now() - startTime)
      toast.success('Course deleted successfully')
      fetchCourses()
      logger.functionExit('handleDelete', { success: true, duration: `${Date.now() - startTime}ms` })
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('Failed to delete course', error, {
        courseId: id,
        duration: `${duration}ms`,
        errorMessage: error.message,
        errorResponse: error.response?.data
      })
      toast.error('Failed to delete course')
      logger.functionExit('handleDelete', { success: false, error: error.message, duration: `${duration}ms` })
    }
  }

  const resetForm = () => {
    setEditingCourse(null)
    setFormData({
      title: '',
      slug: '',
      description: '',
      shortDescription: '',
      thumbnailUrl: '',
      price: 0,
      originalPrice: 0,
      salePrice: 0,
      saleStartDate: '',
      saleStartTime: '',
      saleEndDate: '',
      saleEndTime: '',
      isVisible: true,
      duration: '',
      level: 'beginner',
      instructor: '',
      language: 'English',
      rating: 0,
      totalRatings: 0,
      studentsEnrolled: 0,
      isPublished: false,
      isFeatured: false,
      content: '',
      syllabus: [],
      modules: [],
      tags: [],
      position: 0
    })
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'published' && course.isPublished) ||
      (filterStatus === 'draft' && !course.isPublished)
    return matchesSearch && matchesStatus
  })

  const getLevelColor = (level) => {
    const colors = {
      beginner: 'text-green-600 bg-green-100',
      intermediate: 'text-yellow-600 bg-yellow-100',
      advanced: 'text-red-600 bg-red-100'
    }
    return colors[level] || colors.beginner
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container-custom py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-neutral-900 mb-2">Course Management</h1>
          <p className="text-neutral-600">Manage all courses and their details</p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="mt-4 sm:mt-0"
        >
          <Plus size={18} className="mr-2" />
          Add New Course
        </Button>
      </div>

      <Card className="mb-6 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </Card>

      {filteredCourses.length === 0 ? (
        <Card className="text-center py-12">
          <BookOpen size={48} className="mx-auto text-neutral-300 mb-4" />
          <p className="text-neutral-600 text-lg font-medium mb-2">No courses found</p>
          <p className="text-neutral-500">Create your first course to get started</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const courseId = course.id || course._id
            return (
              <motion.div
                key={courseId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                <Card hover className="h-full">
                  {course.isFeatured && (
                    <div className="absolute top-4 right-4 bg-primary-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                      <Star size={12} fill="currentColor" />
                      Featured
                    </div>
                  )}

                  <div className="aspect-video bg-neutral-200 rounded-lg mb-4 overflow-hidden">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image size={32} className="text-neutral-400" />
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-heading font-semibold text-neutral-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>

                  <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
                    {course.shortDescription || course.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(course.level)}`}>
                      {course.level}
                    </span>
                    {course.instructor && (
                      <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded text-xs font-medium">
                        {typeof course.instructor === 'object' ? course.instructor.name : course.instructor}
                      </span>
                    )}
                    {course.duration && (
                      <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded text-xs font-medium flex items-center gap-1">
                        <Clock size={12} />
                        {course.duration}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-200">
                    <div className="flex items-center gap-4 text-sm text-neutral-600">
                      <span className="flex items-center gap-1">
                        <Users size={16} />
                        {course.studentsEnrolled || course.studentsCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-400 fill-yellow-400" />
                        {course.rating?.average?.toFixed(1) || '0.0'} ({course.rating?.count || 0})
                      </span>
                    </div>
                    <div className="text-lg font-bold text-primary-600">
                      ₹{course.price || 0}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(course)}
                      className="flex-1"
                    >
                      <Edit size={16} className="mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(courseId)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          resetForm()
        }}
        title={editingCourse ? 'Edit Course' : 'Create New Course'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Course Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Slug *
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Short Description *
            </label>
            <textarea
              required
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Full Description *
            </label>
            <div className="h-64 mb-12">
              <ReactQuill
                theme="snow"
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                className="h-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : (parseFloat(e.target.value) || 0)
                  setFormData({ ...formData, price: value })
                }}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Duration
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 8 weeks"
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Level *
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Trainer *
              </label>
              <select
                value={formData.trainer}
                onChange={(e) => {
                  logger.stateChange('AdminCourseManagement', 'formData.trainer', formData.trainer, e.target.value)
                  logger.debug('Trainer selected', {
                    selectedTrainerId: e.target.value,
                    availableTrainers: trainers.length
                  })
                  setFormData({ ...formData, trainer: e.target.value })
                }}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                disabled={trainers.length === 0}
              >
                <option value="">
                  {trainers.length === 0 ? 'No trainers available - Please add trainers first' : 'Select Trainer'}
                </option>
                {trainers.map(trainer => (
                  <option key={trainer._id} value={trainer._id}>
                    {trainer.name} {trainer.email ? `(${trainer.email})` : ''}
                  </option>
                ))}
              </select>
              {trainers.length === 0 && (
                <p className="text-sm text-amber-600 mt-1">
                  No active trainers found. Please go to Trainer Management to add trainers.
                </p>
              )}
            </div>
            <div>
              <FileUpload
                label="Course Thumbnail"
                storagePath="courses/thumbnails"
                value={formData.thumbnailUrl}
                onChange={(url) => setFormData({ ...formData, thumbnailUrl: url })}
                onRemove={() => setFormData({ ...formData, thumbnailUrl: '' })}
                maxSizeMB={5}
              />
            </div>
          </div>

          {/* Sale Information */}
          <div className="space-y-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Sale Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Sale Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.salePrice || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? '' : (parseFloat(e.target.value) || 0)
                    setFormData({ ...formData, salePrice: value })
                  }}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Sale Start Date
                </label>
                <input
                  type="date"
                  value={formData.saleStartDate}
                  onChange={(e) => setFormData({ ...formData, saleStartDate: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Sale Start Time
                </label>
                <input
                  type="time"
                  value={formData.saleStartTime}
                  onChange={(e) => setFormData({ ...formData, saleStartTime: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Sale End Date
                </label>
                <input
                  type="date"
                  value={formData.saleEndDate}
                  onChange={(e) => setFormData({ ...formData, saleEndDate: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Sale End Time
                </label>
                <input
                  type="time"
                  value={formData.saleEndTime}
                  onChange={(e) => setFormData({ ...formData, saleEndTime: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-neutral-700">Published</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-neutral-700">Featured</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isVisible}
                onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-neutral-700">Visible</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowModal(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              <Save size={18} className="mr-2" />
              {editingCourse ? 'Update Course' : 'Create Course'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AdminCourseManagement
