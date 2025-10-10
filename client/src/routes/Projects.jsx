import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Github, Eye, Code, Database, Brain } from 'lucide-react'
import { api } from '../services/api'
import Card from '../components/UI/Card'
import Button from '../components/UI/Button'

const Projects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/projects')
        setProjects(response.data)
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const getTechIcon = (tech) => {
    const techIcons = {
      'React': Code,
      'Node.js': Code,
      'MongoDB': Database,
      'AI': Brain,
      'Machine Learning': Brain,
    }
    return techIcons[tech] || Code
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-neutral-200 rounded-2xl mb-6"></div>
                <div className="h-6 bg-neutral-200 rounded mb-4"></div>
                <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
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
              Student Projects
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Explore amazing projects built by our students using the skills they learned in our courses
            </p>
          </motion.div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => {
              const {
                _id,
                title,
                description,
                imageUrl,
                githubUrl,
                liveUrl,
                technologies = [],
                studentName,
                course
              } = project

              return (
                <motion.div
                  key={_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card hover className="h-full flex flex-col group">
                    {/* Project Image */}
                    <div className="relative mb-6 overflow-hidden rounded-2xl">
                      <div className="aspect-video bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex items-center justify-center">
                            <Code size={48} className="text-white/80" />
                          </div>
                        )}
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-white/90 text-neutral-700 text-xs rounded-lg font-medium">
                          {course}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-xl font-heading font-semibold text-neutral-900 mb-3 group-hover:text-primary-600 transition-colors duration-200">
                        {title}
                      </h3>
                      <p className="text-neutral-600 text-sm leading-relaxed mb-4 flex-1">
                        {description?.length > 120 ? `${description.substring(0, 120)}...` : description}
                      </p>

                      {/* Technologies */}
                      {technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {technologies.slice(0, 3).map((tech, techIndex) => {
                            const TechIcon = getTechIcon(tech)
                            return (
                              <span
                                key={techIndex}
                                className="flex items-center gap-1 px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-lg"
                              >
                                <TechIcon size={12} />
                                {tech}
                              </span>
                            )
                          })}
                          {technologies.length > 3 && (
                            <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-lg">
                              +{technologies.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Student Info */}
                      <div className="text-sm text-neutral-500 mb-4">
                        By <span className="font-medium text-neutral-700">{studentName}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {githubUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => window.open(githubUrl, '_blank')}
                          >
                            <Github size={16} className="mr-2" />
                            Code
                          </Button>
                        )}
                        {liveUrl && (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => window.open(liveUrl, '_blank')}
                          >
                            <ExternalLink size={16} className="mr-2" />
                            Live Demo
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {projects.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Code size={32} className="text-neutral-400" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-neutral-900 mb-4">
                No projects yet
              </h3>
              <p className="text-neutral-600 mb-6">
                Check back soon to see amazing projects from our students
              </p>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Projects