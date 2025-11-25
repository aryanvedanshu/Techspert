import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Github, Eye, Code, Database, Brain, Calendar, User, Award, Star, Clock, Target, Lightbulb, TrendingUp, Video, Link as LinkIcon } from 'lucide-react'
import { api } from '../services/api'
import Card from '../components/UI/Card'
import Button from '../components/UI/Button'
import Modal from '../components/UI/Modal'

const Projects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/projects')
        // The server returns { success: true, data: projects[] }
        const projectsData = response.data.data || []
        setProjects(projectsData)
      } catch (error) {
        console.error('Error fetching projects:', error)
        // Set empty array on error to prevent crashes
        setProjects([])
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

  const handleViewDetails = (project) => {
    setSelectedProject(project)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProject(null)
  }

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-100 text-green-700',
      intermediate: 'bg-yellow-100 text-yellow-700',
      advanced: 'bg-red-100 text-red-700',
      expert: 'bg-purple-100 text-purple-700'
    }
    return colors[difficulty] || colors.beginner
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
            {Array.isArray(projects) && projects.map((project, index) => {
              const {
                _id,
                id,
                title,
                description,
                imageUrl,
                githubUrl,
                liveUrl,
                technologies = [],
                studentName,
                course
              } = project
              
              const projectId = id || _id || `project-${index}`

              return (
                <motion.div
                  key={projectId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card hover className="h-full flex flex-col group">
                    {/* Project Image */}
                    <div className="relative mb-6 overflow-hidden rounded-2xl">
                      <div className="aspect-video bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                        {(project.images && project.images.length > 0 && project.images[0]) ? (
                          <img
                            src={project.images[0]}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : imageUrl ? (
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleViewDetails(project)}
                        >
                          <Eye size={16} className="mr-2" />
                          View Details
                        </Button>
                        {githubUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(githubUrl, '_blank')
                            }}
                          >
                            <Github size={16} />
                          </Button>
                        )}
                        {liveUrl && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(liveUrl, '_blank')
                            }}
                          >
                            <ExternalLink size={16} />
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

      {/* Project Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedProject?.title || 'Project Details'}
        size="full"
      >
        {selectedProject && (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="space-y-4">
              {/* Project Images Gallery */}
              {selectedProject.images && selectedProject.images.length > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedProject.images.map((img, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden bg-neutral-100 aspect-video">
                        <img
                          src={img}
                          alt={`${selectedProject.title} - Image ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Single Image or Placeholder */}
              {(!selectedProject.images || selectedProject.images.length === 0) && selectedProject.imageUrl && (
                <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-primary-500 to-secondary-500 aspect-video">
                  <img
                    src={selectedProject.imageUrl}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Project Meta Info */}
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-neutral-200">
                {selectedProject.course && (
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Award size={16} className="text-primary-600" />
                    <span className="font-medium">{selectedProject.course}</span>
                  </div>
                )}
                {selectedProject.difficulty && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedProject.difficulty)}`}>
                    {selectedProject.difficulty}
                  </span>
                )}
                {selectedProject.duration && (
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Clock size={16} />
                    <span>{selectedProject.duration}</span>
                  </div>
                )}
                {selectedProject.completionDate && (
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Calendar size={16} />
                    <span>{new Date(selectedProject.completionDate).toLocaleDateString()}</span>
                  </div>
                )}
                {selectedProject.rating > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star size={16} className="text-yellow-500 fill-current" />
                    <span className="font-medium">{selectedProject.rating}/5</span>
                  </div>
                )}
              </div>
            </div>

            {/* Student Info */}
            <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl">
              {selectedProject.studentImage && (
                <img
                  src={selectedProject.studentImage}
                  alt={selectedProject.studentName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <User size={16} className="text-neutral-500" />
                  <span className="font-semibold text-neutral-900">{selectedProject.studentName}</span>
                </div>
                {selectedProject.studentEmail && (
                  <p className="text-sm text-neutral-600">{selectedProject.studentEmail}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                <Code size={20} className="text-primary-600" />
                About This Project
              </h3>
              <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
                {selectedProject.description || selectedProject.shortDescription || 'No description available.'}
              </p>
            </div>

            {/* Technologies */}
            {selectedProject.technologies && selectedProject.technologies.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                  <Database size={20} className="text-primary-600" />
                  Technologies Used
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.technologies.map((tech, idx) => {
                    const TechIcon = getTechIcon(tech)
                    return (
                      <span
                        key={idx}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium"
                      >
                        <TechIcon size={16} />
                        {tech}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Features */}
            {selectedProject.features && selectedProject.features.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                  <Target size={20} className="text-primary-600" />
                  Key Features
                </h3>
                <ul className="space-y-2">
                  {selectedProject.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-neutral-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Challenges */}
            {selectedProject.challenges && selectedProject.challenges.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                  <TrendingUp size={20} className="text-primary-600" />
                  Challenges Faced
                </h3>
                <ul className="space-y-2">
                  {selectedProject.challenges.map((challenge, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-neutral-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                      <span>{challenge}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Learnings */}
            {selectedProject.learnings && selectedProject.learnings.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                  <Lightbulb size={20} className="text-primary-600" />
                  Key Learnings
                </h3>
                <ul className="space-y-2">
                  {selectedProject.learnings.map((learning, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-neutral-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                      <span>{learning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Video */}
            {selectedProject.videoUrl && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                  <Video size={20} className="text-primary-600" />
                  Project Video
                </h3>
                <div className="aspect-video rounded-xl overflow-hidden bg-neutral-100">
                  <iframe
                    src={selectedProject.videoUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={selectedProject.title}
                  />
                </div>
              </div>
            )}

            {/* Links */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-neutral-200">
              {selectedProject.githubUrl && (
                <Button
                  variant="outline"
                  onClick={() => window.open(selectedProject.githubUrl, '_blank')}
                  className="flex items-center gap-2"
                >
                  <Github size={18} />
                  View Code
                </Button>
              )}
              {selectedProject.liveUrl && (
                <Button
                  onClick={() => window.open(selectedProject.liveUrl, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink size={18} />
                  Live Demo
                </Button>
              )}
              {selectedProject.projectUrl && (
                <Button
                  variant="outline"
                  onClick={() => window.open(selectedProject.projectUrl, '_blank')}
                  className="flex items-center gap-2"
                >
                  <LinkIcon size={18} />
                  Project Link
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Projects