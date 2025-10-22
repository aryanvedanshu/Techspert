import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, Edit, Trash2, Eye, Search, Filter, Calendar, Users, 
  Award, Star, Briefcase, GraduationCap, MapPin, Mail,
  CheckCircle, AlertCircle, Save, X, Upload, ExternalLink,
  Linkedin, Github, Twitter, Globe, Phone, User
} from 'lucide-react'
import { api } from '../../services/api'
import { toast } from 'sonner'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'

const AdminAlumniManagement = () => {
  const [alumni, setAlumni] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCompany, setFilterCompany] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingAlumni, setEditingAlumni] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    graduationYear: '',
    course: '',
    currentPosition: '',
    company: '',
    location: '',
    bio: '',
    achievements: [],
    skills: [],
    socialLinks: {
      linkedin: '',
      github: '',
      twitter: '',
      website: ''
    },
    imageUrl: '',
    testimonial: '',
    isFeatured: false,
    isActive: true,
    position: 0,
    salary: '',
    experience: '',
    education: '',
    certifications: []
  })

  useEffect(() => {
    fetchAlumni()
  }, [])

  const fetchAlumni = async () => {
    try {
      setLoading(true)
      const response = await api.get('/alumni')
      setAlumni(response.data.data || [])
    } catch (error) {
      console.error('Error fetching alumni:', error)
      toast.error('Failed to fetch alumni data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingAlumni) {
        await api.put(`/alumni/${editingAlumni._id}`, formData)
        toast.success('Alumni profile updated successfully')
      } else {
        await api.post('/alumni', formData)
        toast.success('Alumni profile created successfully')
      }
      setShowModal(false)
      setEditingAlumni(null)
      resetForm()
      fetchAlumni()
    } catch (error) {
      console.error('Error saving alumni:', error)
      toast.error('Failed to save alumni profile')
    }
  }

  const handleEdit = (alumniMember) => {
    setEditingAlumni(alumniMember)
    setFormData({
      name: alumniMember.name || '',
      email: alumniMember.email || '',
      phone: alumniMember.phone || '',
      graduationYear: alumniMember.graduationYear || '',
      course: alumniMember.course || '',
      currentPosition: alumniMember.currentPosition || '',
      company: alumniMember.company || '',
      location: alumniMember.location || '',
      bio: alumniMember.bio || '',
      achievements: alumniMember.achievements || [],
      skills: alumniMember.skills || [],
      socialLinks: alumniMember.socialLinks || {
        linkedin: '',
        github: '',
        twitter: '',
        website: ''
      },
      imageUrl: alumniMember.imageUrl || '',
      testimonial: alumniMember.testimonial || '',
      isFeatured: alumniMember.isFeatured || false,
      isActive: alumniMember.isActive !== false,
      position: alumniMember.position || 0,
      salary: alumniMember.salary || '',
      experience: alumniMember.experience || '',
      education: alumniMember.education || '',
      certifications: alumniMember.certifications || []
    })
    setShowModal(true)
  }

  const handleDelete = async (alumniId) => {
    if (window.confirm('Are you sure you want to delete this alumni profile?')) {
      try {
        await api.delete(`/alumni/${alumniId}`)
        toast.success('Alumni profile deleted successfully')
        fetchAlumni()
      } catch (error) {
        console.error('Error deleting alumni:', error)
        toast.error('Failed to delete alumni profile')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      graduationYear: '',
      course: '',
      currentPosition: '',
      company: '',
      location: '',
      bio: '',
      achievements: [],
      skills: [],
      socialLinks: {
        linkedin: '',
        github: '',
        twitter: '',
        website: ''
      },
      imageUrl: '',
      testimonial: '',
      isFeatured: false,
      isActive: true,
      position: 0,
      salary: '',
      experience: '',
      education: '',
      certifications: []
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

  const filteredAlumni = alumni.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.currentPosition.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'featured' && member.isFeatured) ||
                         (filterStatus === 'active' && member.isActive)
    const matchesCompany = filterCompany === 'all' || member.company === filterCompany
    return matchesSearch && matchesStatus && matchesCompany
  })

  const getCompanyColor = (company) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-red-100 text-red-800',
      'bg-indigo-100 text-indigo-800'
    ]
    const hash = company.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    return colors[hash % colors.length]
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
                Alumni Management
              </h1>
              <p className="text-neutral-600">
                Manage alumni profiles and success stories
              </p>
            </div>
            <Button onClick={() => setShowModal(true)}>
              <Plus size={16} className="mr-2" />
              Add Alumni
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
                  placeholder="Search alumni..."
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
              <option value="featured">Featured</option>
              <option value="active">Active</option>
            </select>
            <select
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Companies</option>
              {[...new Set(alumni.map(a => a.company))].filter(Boolean).map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>
        </Card>

        {/* Alumni Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlumni.map((member, index) => (
            <motion.div
              key={member._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="h-full">
                <div className="text-center mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full mx-auto mb-3 overflow-hidden">
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User size={32} className="text-white" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm text-neutral-600 mb-2">
                    {member.currentPosition}
                  </p>
                  <div className="flex items-center justify-center gap-1 mb-3">
                    {member.isFeatured && (
                      <Star size={16} className="text-yellow-500 fill-current" />
                    )}
                    {member.isActive ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <AlertCircle size={16} className="text-red-500" />
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Briefcase size={14} />
                    <span>{member.company}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <MapPin size={14} />
                    <span>{member.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <GraduationCap size={14} />
                    <span>{member.course} ({member.graduationYear})</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {member.skills && member.skills.slice(0, 3).map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded">
                      {skill}
                    </span>
                  ))}
                  {member.skills && member.skills.length > 3 && (
                    <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded">
                      +{member.skills.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(member)}
                  >
                    <Edit size={14} className="mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.open(`/alumni/${member._id}`, '_blank')}
                  >
                    <Eye size={14} className="mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(member._id)}
                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredAlumni.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap size={48} className="text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No alumni found
            </h3>
            <p className="text-neutral-600 mb-4">
              {searchTerm || filterStatus !== 'all' || filterCompany !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first alumni profile'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && filterCompany === 'all' && (
              <Button onClick={() => setShowModal(true)}>
                <Plus size={16} className="mr-2" />
                Add Alumni
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Alumni Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingAlumni(null)
          resetForm()
        }}
        title={editingAlumni ? 'Edit Alumni Profile' : 'Add New Alumni Profile'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="alumni@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Graduation Year *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.graduationYear}
                    onChange={(e) => setFormData(prev => ({ ...prev, graduationYear: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="2023"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Course *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.course}
                    onChange={(e) => setFormData(prev => ({ ...prev, course: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Complete MERN Stack Development"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900">Professional Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Current Position *
                </label>
                <input
                  type="text"
                  required
                  value={formData.currentPosition}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentPosition: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Company *
                </label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Google, Microsoft, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="San Francisco, CA"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Experience
                  </label>
                  <input
                    type="text"
                    value={formData.experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="2 years"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="$80,000 - $120,000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bio and Testimonial */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900">Bio & Testimonial</h3>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Bio
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Brief biography about the alumni"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Testimonial
              </label>
              <textarea
                rows={3}
                value={formData.testimonial}
                onChange={(e) => setFormData(prev => ({ ...prev, testimonial: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="What they say about their experience at Techspert"
              />
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900">Skills</h3>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Skills (comma-separated)
              </label>
              <input
                type="text"
                value={formData.skills.join(', ')}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  skills: e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill)
                }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="React, Node.js, Python, Machine Learning"
              />
            </div>
          </div>

          {/* Achievements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900">Achievements</h3>
            {formData.achievements.map((achievement, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={achievement}
                  onChange={(e) => updateArrayItem('achievements', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Achievement description"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeArrayItem('achievements', index)}
                >
                  <X size={16} />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => addArrayItem('achievements')}
            >
              <Plus size={16} className="mr-2" />
              Add Achievement
            </Button>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900">Social Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={formData.socialLinks.linkedin}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={formData.socialLinks.github}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    socialLinks: { ...prev.socialLinks, github: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://github.com/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Twitter URL
                </label>
                <input
                  type="url"
                  value={formData.socialLinks.twitter}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://twitter.com/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  value={formData.socialLinks.website}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    socialLinks: { ...prev.socialLinks, website: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://personal-website.com"
                />
              </div>
            </div>
          </div>

          {/* Media and Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900">Media & Settings</h3>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Profile Image URL
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://example.com/profile.jpg"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="isFeatured" className="ml-2 text-sm text-neutral-700">
                  Featured Alumni
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-neutral-700">
                  Active Profile
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t border-neutral-200">
            <Button type="submit" className="flex-1">
              <Save size={16} className="mr-2" />
              {editingAlumni ? 'Update Alumni Profile' : 'Create Alumni Profile'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowModal(false)
                setEditingAlumni(null)
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

export default AdminAlumniManagement
