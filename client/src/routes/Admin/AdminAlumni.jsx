import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Eye, ArrowLeft, Linkedin, Github, Mail } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../services/api'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'

const AdminAlumni = () => {
  const { isAuthenticated } = useAuth()
  const [alumni, setAlumni] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const response = await api.get('/alumni')
        setAlumni(response.data.data || [])
      } catch (error) {
        console.error('Error fetching alumni:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchAlumni()
    }
  }, [isAuthenticated])

  const handleDelete = async (alumnusId) => {
    if (window.confirm('Are you sure you want to delete this alumni profile?')) {
      try {
        await api.delete(`/alumni/${alumnusId}`)
        setAlumni(alumni.filter(alumnus => alumnus._id !== alumnusId))
      } catch (error) {
        console.error('Error deleting alumni:', error)
        alert('Failed to delete alumni profile')
      }
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
                  Manage Alumni
                </h1>
                <p className="text-neutral-600">
                  Showcase successful graduates and their achievements
                </p>
              </div>
            </div>
            <Button>
              <Plus size={16} className="mr-2" />
              Add Alumni
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
            {alumni.map((alumnus, index) => (
              <motion.div
                key={alumnus._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col text-center">
                  {/* Profile Image */}
                  <div className="mb-6">
                    <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                      {alumnus.imageUrl ? (
                        <img
                          src={alumnus.imageUrl}
                          alt={alumnus.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-2xl font-bold">
                          {alumnus.name.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Alumni Info */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-xl font-heading font-semibold text-neutral-900 mb-2">
                      {alumnus.name}
                    </h3>
                    <div className="text-primary-600 font-medium mb-2">
                      {alumnus.title}
                    </div>
                    <div className="text-neutral-600 text-sm mb-2">
                      {alumnus.company}
                    </div>
                    <div className="text-neutral-500 text-sm mb-4">
                      {alumnus.location}
                    </div>

                    {/* Course Badge */}
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
                        {alumnus.course}
                      </span>
                    </div>

                    {/* Testimonial */}
                    {alumnus.testimonial && (
                      <blockquote className="text-neutral-600 text-sm italic mb-6 flex-1">
                        "{alumnus.testimonial.length > 120 
                          ? `${alumnus.testimonial.substring(0, 120)}...` 
                          : alumnus.testimonial}"
                      </blockquote>
                    )}

                    {/* Social Links */}
                    <div className="flex justify-center gap-3 mb-4">
                      {alumnus.linkedinUrl && (
                        <a
                          href={alumnus.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-neutral-100 hover:bg-primary-100 rounded-xl flex items-center justify-center transition-colors duration-200 group"
                        >
                          <Linkedin size={18} className="text-neutral-600 group-hover:text-primary-600" />
                        </a>
                      )}
                      {alumnus.githubUrl && (
                        <a
                          href={alumnus.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-neutral-100 hover:bg-primary-100 rounded-xl flex items-center justify-center transition-colors duration-200 group"
                        >
                          <Github size={18} className="text-neutral-600 group-hover:text-primary-600" />
                        </a>
                      )}
                      {alumnus.email && (
                        <a
                          href={`mailto:${alumnus.email}`}
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
                        onClick={() => window.open(`/alumni`, '_blank')}
                      >
                        <Eye size={16} className="mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Edit size={16} className="mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(alumnus._id)}
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

        {!loading && alumni.length === 0 && (
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
              No alumni yet
            </h3>
            <p className="text-neutral-600 mb-6">
              Add alumni profiles to showcase successful graduates
            </p>
            <Button>
              <Plus size={16} className="mr-2" />
              Add Your First Alumni
            </Button>
        </motion.div>
        )}
      </div>
    </div>
  )
}

export default AdminAlumni