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

const AdminCourseManagement = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    shortDescription: '',
    thumbnailUrl: '',
    price: 0,
    originalPrice: 0,
    duration: '',
    level: 'beginner',
    category: '',
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
      resetForm()
      fetchCourses()
    } catch (error) {
      console.error('Error saving course:', error)
      toast.error(error.response?.data?.message || 'Failed to save course')
    }
  }

  const handleEdit = (course) => {
    setEditingCourse(course)
    setFormData({
      title: course.title || '',
      slug: course.slug || '',
      description: course.description || '',
      shortDescription: course.shortDescription || '',
      thumbnailUrl: course.thumbnailUrl || '',
      price: course.price || 0,
      originalPrice: course.originalPrice || 0,
      duration: course.duration || '',
      level: course.level || 'beginner',
      category: course.category || '',
      instructor: course.instructor || '',
      language: course.language || 'English',
      rating: course.rating || 0,
      totalRatings: course.totalRatings || 0,
      studentsEnrolled: course.studentsEnrolled || 0,
      isPublished: course.isPublished || false,
      isFeatured: course.isFeatured || false,
      content: course.content || '',
      syllabus: course.syllabus || [],
      modules: course.modules || [],
      tags: course.tags || [],
      position: course.position || 0
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return
    
    try {
      await api.delete(`/courses/${id}`)
      toast.success('Course deleted successfully')
      fetchCourses()
    } catch (error) {
      console.error('Error deleting course:', error)
      toast.error('Failed to delete course')
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
      duration: '',
      level: 'beginner',
      category: '',
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
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory
    
    return matchesSearch && matchesStatus && matchesCategory
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
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="full-stack">Full Stack</option>
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="data-science">Data Science</option>
              <option value="ai-ml">AI/ML</option>
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
          {filteredCourses.map((course) => (
            <motion.div
              key={course._id}
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
                  <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded text-xs font-medium">
                    {course.category}
                  </span>
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
                      {course.studentsEnrolled || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                      {course.rating?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-primary-600">
                    ${course.price || 0}
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
                    onClick={() => handleDelete(course._id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          resetForm()
        }}
        title={editingCourse ? 'Edit Course' : 'Create New Course'}
        size="large"
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
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Price *
              </label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select Category</option>
                <option value="full-stack">Full Stack</option>
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="data-science">Data Science</option>
                <option value="ai-ml">AI/ML</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Thumbnail URL
              </label>
              <input
                type="url"
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
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
