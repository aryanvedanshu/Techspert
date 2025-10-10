import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Linkedin, Github, Mail, MapPin, Briefcase, GraduationCap } from 'lucide-react'
import { api } from '../services/api'
import Card from '../components/UI/Card'

const Alumni = () => {
  const [alumni, setAlumni] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const response = await api.get('/alumni')
        setAlumni(response.data)
      } catch (error) {
        console.error('Error fetching alumni:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlumni()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="w-24 h-24 bg-neutral-200 rounded-full mx-auto mb-6"></div>
                <div className="h-6 bg-neutral-200 rounded mb-4"></div>
                <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded w-3/4 mx-auto"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <section className="bg-white py-16">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-neutral-900 mb-4">
              Our Alumni
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Meet the talented professionals who have transformed their careers with our courses
            </p>
          </motion.div>
        </div>
      </section>

      {/* Alumni Grid */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {alumni.map((alumnus, index) => {
              const {
                _id,
                name,
                title,
                company,
                location,
                course,
                testimonial,
                imageUrl,
                linkedinUrl,
                githubUrl,
                email
              } = alumnus

              return (
                <motion.div
                  key={_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card hover className="text-center h-full flex flex-col">
                    {/* Profile Image */}
                    <div className="mb-6">
                      <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-white text-2xl font-bold">
                            {name.charAt(0)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-xl font-heading font-semibold text-neutral-900 mb-2">
                        {name}
                      </h3>
                      <div className="flex items-center justify-center gap-1 text-primary-600 mb-2">
                        <Briefcase size={16} />
                        <span className="text-sm font-medium">{title}</span>
                      </div>
                      <div className="flex items-center justify-center gap-1 text-neutral-600 mb-2">
                        <span className="text-sm">{company}</span>
                      </div>
                      <div className="flex items-center justify-center gap-1 text-neutral-500 mb-4">
                        <MapPin size={14} />
                        <span className="text-sm">{location}</span>
                      </div>

                      {/* Course Badge */}
                      <div className="mb-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
                          <GraduationCap size={14} />
                          {course}
                        </span>
                      </div>

                      {/* Testimonial */}
                      {testimonial && (
                        <blockquote className="text-neutral-600 text-sm italic mb-6 flex-1">
                          "{testimonial}"
                        </blockquote>
                      )}

                      {/* Social Links */}
                      <div className="flex justify-center gap-3">
                        {linkedinUrl && (
                          <a
                            href={linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-neutral-100 hover:bg-primary-100 rounded-xl flex items-center justify-center transition-colors duration-200 group"
                          >
                            <Linkedin size={18} className="text-neutral-600 group-hover:text-primary-600" />
                          </a>
                        )}
                        {githubUrl && (
                          <a
                            href={githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-neutral-100 hover:bg-primary-100 rounded-xl flex items-center justify-center transition-colors duration-200 group"
                          >
                            <Github size={18} className="text-neutral-600 group-hover:text-primary-600" />
                          </a>
                        )}
                        {email && (
                          <a
                            href={`mailto:${email}`}
                            className="w-10 h-10 bg-neutral-100 hover:bg-primary-100 rounded-xl flex items-center justify-center transition-colors duration-200 group"
                          >
                            <Mail size={18} className="text-neutral-600 group-hover:text-primary-600" />
                          </a>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {alumni.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <GraduationCap size={32} className="text-neutral-400" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-neutral-900 mb-4">
                No alumni yet
              </h3>
              <p className="text-neutral-600 mb-6">
                Check back soon to see our amazing alumni success stories
              </p>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Alumni