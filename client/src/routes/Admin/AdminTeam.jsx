import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Eye, ArrowLeft, Linkedin, Github, Mail, ExternalLink } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../services/api'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'

const AdminTeam = () => {
  const { isAuthenticated } = useAuth()
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    imageUrl: '',
    email: '',
    socialLinks: {
      linkedin: '',
      github: '',
      twitter: '',
      website: '',
    },
    department: '',
    experience: '',
    specialties: [],
    isActive: true,
    isFeatured: false,
  })

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await api.get('/team')
        setTeam(response.data.data || [])
      } catch (error) {
        console.error('Error fetching team:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchTeam()
    }
  }, [isAuthenticated])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingMember) {
        await api.put(`/team/${editingMember._id}`, formData)
        setTeam(team.map(member => 
          member._id === editingMember._id ? { ...member, ...formData } : member
        ))
      } else {
        const response = await api.post('/team', formData)
        setTeam([...team, response.data.data])
      }
      setShowModal(false)
      setEditingMember(null)
      resetForm()
    } catch (error) {
      console.error('Error saving team member:', error)
      alert('Error saving team member')
    }
  }

  const handleEdit = (member) => {
    setEditingMember(member)
    setFormData({
      name: member.name,
      role: member.role,
      bio: member.bio,
      imageUrl: member.imageUrl || '',
      email: member.email || '',
      socialLinks: {
        linkedin: member.socialLinks?.linkedin || '',
        github: member.socialLinks?.github || '',
        twitter: member.socialLinks?.twitter || '',
        website: member.socialLinks?.website || '',
      },
      department: member.department || '',
      experience: member.experience || '',
      specialties: member.specialties || [],
      isActive: member.isActive,
      isFeatured: member.isFeatured,
    })
    setShowModal(true)
  }

  const handleDelete = async (memberId) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        await api.delete(`/team/${memberId}`)
        setTeam(team.filter(member => member._id !== memberId))
      } catch (error) {
        console.error('Error deleting team member:', error)
        alert('Failed to delete team member')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      bio: '',
      imageUrl: '',
      email: '',
      socialLinks: {
        linkedin: '',
        github: '',
        twitter: '',
        website: '',
      },
      department: '',
      experience: '',
      specialties: [],
      isActive: true,
      isFeatured: false,
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
                  Manage Team
                </h1>
                <p className="text-neutral-600">
                  Manage your team members and their profiles
                </p>
              </div>
            </div>
            <Button onClick={() => setShowModal(true)}>
              <Plus size={16} className="mr-2" />
              Add Team Member
            </Button>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="w-24 h-24 bg-neutral-200 rounded-full mx-auto mb-4"></div>
                <div className="h-6 bg-neutral-200 rounded mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded w-3/4 mx-auto"></div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={member._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col text-center">
                  {/* Profile Image */}
                  <div className="mb-6">
                    <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                      {member.imageUrl ? (
                        <img
                          src={member.imageUrl}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-2xl font-bold">
                          {member.name.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Team Member Info */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-xl font-heading font-semibold text-neutral-900 mb-2">
                      {member.name}
                    </h3>
                    <div className="text-primary-600 font-medium mb-2">
                      {member.role}
                    </div>
                    {member.department && (
                      <div className="text-neutral-600 text-sm mb-2">
                        {member.department}
                      </div>
                    )}
                    {member.experience && (
                      <div className="text-neutral-500 text-sm mb-4">
                        {member.experience} years experience
                      </div>
                    )}

                    {/* Bio */}
                    {member.bio && (
                      <p className="text-neutral-600 text-sm mb-4 flex-1">
                        {member.bio.length > 120 
                          ? `${member.bio.substring(0, 120)}...` 
                          : member.bio}
                      </p>
                    )}

                    {/* Specialties */}
                    {member.specialties && member.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4 justify-center">
                        {member.specialties.slice(0, 3).map((specialty, specIndex) => (
                          <span
                            key={specIndex}
                            className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-lg"
                          >
                            {specialty}
                          </span>
                        ))}
                        {member.specialties.length > 3 && (
                          <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-lg">
                            +{member.specialties.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Social Links */}
                    <div className="flex justify-center gap-3 mb-4">
                      {member.socialLinks?.linkedin && (
                        <a
                          href={member.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-neutral-100 hover:bg-primary-100 rounded-xl flex items-center justify-center transition-colors duration-200 group"
                        >
                          <Linkedin size={18} className="text-neutral-600 group-hover:text-primary-600" />
                        </a>
                      )}
                      {member.socialLinks?.github && (
                        <a
                          href={member.socialLinks.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-neutral-100 hover:bg-primary-100 rounded-xl flex items-center justify-center transition-colors duration-200 group"
                        >
                          <Github size={18} className="text-neutral-600 group-hover:text-primary-600" />
                        </a>
                      )}
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="w-10 h-10 bg-neutral-100 hover:bg-primary-100 rounded-xl flex items-center justify-center transition-colors duration-200 group"
                        >
                          <Mail size={18} className="text-neutral-600 group-hover:text-primary-600" />
                        </a>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(`/about`, '_blank')}
                      >
                        <Eye size={16} className="mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(member)}
                      >
                        <Edit size={16} className="mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(member._id)}
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

        {!loading && team.length === 0 && (
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
              No team members yet
            </h3>
            <p className="text-neutral-600 mb-6">
              Add team members to showcase your expert instructors
            </p>
            <Button onClick={() => setShowModal(true)}>
              <Plus size={16} className="mr-2" />
              Add Your First Team Member
            </Button>
          </motion.div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingMember(null)
          resetForm()
        }}
        title={editingMember ? 'Edit Team Member' : 'Add Team Member'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Role *
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                required
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Bio *
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Experience (years)
              </label>
              <input
                type="number"
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                min="0"
                max="50"
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Social Links
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="url"
                placeholder="LinkedIn URL"
                value={formData.socialLinks.linkedin}
                onChange={(e) => handleInputChange('socialLinks.linkedin', e.target.value)}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
              />
              <input
                type="url"
                placeholder="GitHub URL"
                value={formData.socialLinks.github}
                onChange={(e) => handleInputChange('socialLinks.github', e.target.value)}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
              />
              <input
                type="url"
                placeholder="Twitter URL"
                value={formData.socialLinks.twitter}
                onChange={(e) => handleInputChange('socialLinks.twitter', e.target.value)}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
              />
              <input
                type="url"
                placeholder="Website URL"
                value={formData.socialLinks.website}
                onChange={(e) => handleInputChange('socialLinks.website', e.target.value)}
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
                checked={formData.isFeatured}
                onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-neutral-700">Featured</span>
            </label>
          </div>

          <div className="flex gap-4">
            <Button type="submit" className="flex-1">
              {editingMember ? 'Update Team Member' : 'Add Team Member'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowModal(false)
                setEditingMember(null)
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

export default AdminTeam
