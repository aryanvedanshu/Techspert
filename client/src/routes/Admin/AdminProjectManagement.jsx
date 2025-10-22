import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, Edit, Trash2, Eye, Search, Filter, Calendar, Users, 
  Code, Star, Clock, Image, Link, CheckCircle, AlertCircle, 
  Save, X, Upload, ExternalLink, Award, User
} from 'lucide-react'
import { api } from '../../services/api'
import { toast } from 'sonner'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'

const AdminProjectManagement = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    technologies: [],
    category: '',
    difficulty: 'beginner',
    duration: '',
    studentName: '',
    studentEmail: '',
    studentImage: '',
    projectUrl: '',
    githubUrl: '',
    demoUrl: '',
    images: [],
    videoUrl: '',
    features: [],
    challenges: [],
    learnings: [],
    isApproved: false,
    isFeatured: false,
    position: 0,
    completionDate: '',
    rating: 0
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await api.get('/projects')
      setProjects(response.data.data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast.error('Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingProject) {
        await api.put(`/projects/${editingProject._id}`, formData)
        toast.success('Project updated successfully')
      } else {
        await api.post('/projects', formData)
        toast.success('Project created successfully')
      }
      setShowModal(false)
      setEditingProject(null)
      resetForm()
      fetchProjects()
    } catch (error) {
      console.error('Error saving project:', error)
      toast.error('Failed to save project')
    }
  }

  const handleEdit = (project) => {
    setEditingProject(project)
    setFormData({
      title: project.title || '',
      description: project.description || '',
      shortDescription: project.shortDescription || '',
      technologies: project.technologies || [],
      category: project.category || '',
      difficulty: project.difficulty || 'beginner',
      duration: project.duration || '',
      studentName: project.studentName || '',
      studentEmail: project.studentEmail || '',
      studentImage: project.studentImage || '',
      projectUrl: project.projectUrl || '',
      githubUrl: project.githubUrl || '',
      demoUrl: project.demoUrl || '',
      images: project.images || [],
      videoUrl: project.videoUrl || '',
      features: project.features || [],
      challenges: project.challenges || [],
      learnings: project.learnings || [],
      isApproved: project.isApproved || false,
      isFeatured: project.isFeatured || false,
      position: project.position || 0,
      completionDate: project.completionDate || '',
      rating: project.rating || 0
    })
    setShowModal(true)
  }

  const handleDelete = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.delete(`/projects/${projectId}`)
        toast.success('Project deleted successfully')
        fetchProjects()
      } catch (error) {
        console.error('Error deleting project:', error)
        toast.error('Failed to delete project')
      }
    }
  }

  const handleApprove = async (projectId) => {
    try {
      await api.put(`/projects/${projectId}`, { isApproved: true })
      toast.success('Project approved successfully')
      fetchProjects()
    } catch (error) {
      console.error('Error approving project:', error)
      toast.error('Failed to approve project')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      shortDescription: '',
      technologies: [],
      category: '',
      difficulty: 'beginner',
      duration: '',
      studentName: '',
      studentEmail: '',
      studentImage: '',
      projectUrl: '',
      githubUrl: '',
      demoUrl: '',
      images: [],
      videoUrl: '',
      features: [],
      challenges: [],
      learnings: [],
      isApproved: false,
      isFeatured: false,
      position: 0,
      completionDate: '',
      rating: 0
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

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'approved' && project.isApproved) ||
                         (filterStatus === 'pending' && !project.isApproved)
    const matchesCategory = filterCategory === 'all' || project.category === filterCategory
    return matchesSearch && matchesStatus && matchesCategory
  })

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
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
                Project Management
              </h1>
              <p className="text-neutral-600">
                Manage student projects and showcase their work
              </p>
            </div>
            <Button onClick={() => setShowModal(true)}>
              <Plus size={16} className="mr-2" />
              Add Project
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
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="web-development">Web Development</option>
              <option value="mobile-app">Mobile App</option>
              <option value="data-science">Data Science</option>
              <option value="ai-ml">AI/ML</option>
              <option value="game-development">Game Development</option>
              <option value="other">Other</option>
            </select>
          </div>
        </Card>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="h-full">
                <div className="aspect-video bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl mb-4 overflow-hidden">
                  {project.images && project.images.length > 0 ? (
                    <img
                      src={project.images[0]}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Code size={48} className="text-white/80" />
                    </div>
                  )}
                </div>

                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900 mb-1 line-clamp-2">
                      {project.title}
                    </h3>
                    <p className="text-sm text-neutral-600 line-clamp-2">
                      {project.shortDescription || project.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    {project.isApproved ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <AlertCircle size={16} className="text-yellow-500" />
                    )}
                    {project.isFeatured && (
                      <Star size={16} className="text-yellow-500 fill-current" />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(project.difficulty)}`}>
                    {project.difficulty}
                  </span>
                  <div className="flex items-center gap-1 text-sm text-neutral-500">
                    <Clock size={14} />
                    <span>{project.duration}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-neutral-500">
                    <User size={14} />
                    <span>{project.studentName}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {project.technologies && project.technologies.slice(0, 3).map((tech, index) => (
                    <span key={index} className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded">
                      {tech}
                    </span>
                  ))}
                  {project.technologies && project.technologies.length > 3 && (
                    <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded">
                      +{project.technologies.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(project)}
                  >
                    <Edit size={14} className="mr-1" />
                    Edit
                  </Button>
                  {!project.isApproved && (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleApprove(project._id)}
                    >
                      <CheckCircle size={14} className="mr-1" />
                      Approve
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(project._id)}
                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <Code size={48} className="text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No projects found
            </h3>
            <p className="text-neutral-600 mb-4">
              {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first project'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && filterCategory === 'all' && (
              <Button onClick={() => setShowModal(true)}>
                <Plus size={16} className="mr-2" />
                Add Project
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Project Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingProject(null)
          resetForm()
        }}
        title={editingProject ? 'Edit Project' : 'Add New Project'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter project title"
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
                  placeholder="Brief description for project cards"
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
                  placeholder="Detailed project description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    <option value="web-development">Web Development</option>
                    <option value="mobile-app">Mobile App</option>
                    <option value="data-science">Data Science</option>
                    <option value="ai-ml">AI/ML</option>
                    <option value="game-development">Game Development</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Difficulty *
                  </label>
                  <select
                    required
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 2 weeks, 1 month"
                />
              </div>
            </div>

            {/* Student Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900">Student Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Student Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.studentName}
                  onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Student name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Student Email
                </label>
                <input
                  type="email"
                  value={formData.studentEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, studentEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="student@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Student Image URL
                </label>
                <input
                  type="url"
                  value={formData.studentImage}
                  onChange={(e) => setFormData(prev => ({ ...prev, studentImage: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Completion Date
                </label>
                <input
                  type="date"
                  value={formData.completionDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, completionDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Rating (0-5)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Project Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900">Project Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Project URL
                </label>
                <input
                  type="url"
                  value={formData.projectUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://github.com/username/repo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Demo URL
                </label>
                <input
                  type="url"
                  value={formData.demoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, demoUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://demo.example.com"
                />
              </div>
            </div>
          </div>

          {/* Technologies */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900">Technologies Used</h3>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Technologies (comma-separated)
              </label>
              <input
                type="text"
                value={formData.technologies.join(', ')}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  technologies: e.target.value.split(',').map(tech => tech.trim()).filter(tech => tech)
                }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="React, Node.js, MongoDB, Express"
              />
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900">Key Features</h3>
            {formData.features.map((item, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateArrayItem('features', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Feature description"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeArrayItem('features', index)}
                >
                  <X size={16} />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => addArrayItem('features')}
            >
              <Plus size={16} className="mr-2" />
              Add Feature
            </Button>
          </div>

          {/* Challenges */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900">Challenges Faced</h3>
            {formData.challenges.map((item, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateArrayItem('challenges', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Challenge description"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeArrayItem('challenges', index)}
                >
                  <X size={16} />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => addArrayItem('challenges')}
            >
              <Plus size={16} className="mr-2" />
              Add Challenge
            </Button>
          </div>

          {/* Learnings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900">Key Learnings</h3>
            {formData.learnings.map((item, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateArrayItem('learnings', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Learning outcome"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeArrayItem('learnings', index)}
                >
                  <X size={16} />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => addArrayItem('learnings')}
            >
              <Plus size={16} className="mr-2" />
              Add Learning
            </Button>
          </div>

          {/* Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900">Media</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Video URL
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Images (comma-separated URLs)
                </label>
                <input
                  type="text"
                  value={formData.images.join(', ')}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    images: e.target.value.split(',').map(img => img.trim()).filter(img => img)
                  }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900">Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isApproved"
                  checked={formData.isApproved}
                  onChange={(e) => setFormData(prev => ({ ...prev, isApproved: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="isApproved" className="ml-2 text-sm text-neutral-700">
                  Approve Project
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
                  Featured Project
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t border-neutral-200">
            <Button type="submit" className="flex-1">
              <Save size={16} className="mr-2" />
              {editingProject ? 'Update Project' : 'Add Project'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowModal(false)
                setEditingProject(null)
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

export default AdminProjectManagement
