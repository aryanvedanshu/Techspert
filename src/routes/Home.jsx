import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, Play, Star, Users, Award, Code, Sparkle, CheckCircle2, Globe,
  Quote, ExternalLink, GraduationCap, Briefcase
} from 'lucide-react'
import { api } from '../services/api'
import CourseCard from '../components/CourseCard'
import Button from '../components/UI/Button'
import Card from '../components/UI/Card'
import Carousel from '../components/UI/Carousel'
import FreeDemoModal from '../components/FreeDemoModal'
import logger from '../utils/logger'

const Home = () => {
  logger.componentMount('Home')

  const [courses, setCourses] = useState([])
  const [alumni, setAlumni] = useState([])
  const [projects, setProjects] = useState([])
  const [siteSettings, setSiteSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDemoModal, setShowDemoModal] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const startTime = Date.now()
      try {
        logger.info('Starting parallel API calls to fetch homepage data')
        const [coursesResponse, alumniResponse, projectsResponse, settingsResponse] = await Promise.all([
          api.get('/courses?limit=10'),
          api.get('/alumni?limit=10'),
          api.get('/projects?limit=10'),
          api.get('/settings')
        ])

        const duration = Date.now() - startTime

        // Extract data correctly - API returns { data: { success: true, data: [...] } }
        // So response.data.data is the actual array
        const coursesData = coursesResponse.data?.data || []
        const alumniData = alumniResponse.data?.data || []
        const projectsData = projectsResponse.data?.data || []
        const settingsData = settingsResponse.data?.data || null

        logger.info('All API calls completed successfully', {
          duration: `${duration}ms`,
          coursesCount: Array.isArray(coursesData) ? coursesData.length : 0,
          alumniCount: Array.isArray(alumniData) ? alumniData.length : 0,
          projectsCount: Array.isArray(projectsData) ? projectsData.length : 0
        })

        setCourses(Array.isArray(coursesData) ? coursesData : [])
        setAlumni(Array.isArray(alumniData) ? alumniData : [])
        setProjects(Array.isArray(projectsData) ? projectsData : [])
        setSiteSettings(settingsData)
      } catch (error) {
        logger.error('Error fetching homepage data', error)
        setCourses([])
        setAlumni([])
        setProjects([])
        setSiteSettings({
          homePage: {
            hero: {
              title: 'Master the Future of Technology',
              subtitle: 'Learn cutting-edge skills from industry experts and build your dream career in tech',
              ctaText: 'Start Learning Today',
            }
          }
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getIconComponent = (iconName) => {
    const iconMap = {
      Star, Users, Award, Code, GraduationCap, Briefcase, Quote
    }
    return iconMap[iconName] || Code
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-heading font-semibold text-neutral-900">Loading...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] sm:min-h-[70vh] md:min-h-[80vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('data:image/svg+xml;base64,${btoa(`
              <svg width="1920" height="1080" viewBox="0 0 1920 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#0ea5e9;stop-opacity:1" />
                    <stop offset="50%" style="stop-color:#14b8a6;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
                  </linearGradient>
                </defs>
                <rect width="1920" height="1080" fill="url(#grad1)"/>
              </svg>
            `)}')`
          }}
        />
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="container-custom py-12 sm:py-16 md:py-24 lg:py-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6"
              >
                <Sparkle className="w-4 h-4" />
                <span>New Batch Starting Soon</span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-white mb-6 leading-tight">
                {siteSettings?.homePage?.hero?.title || 'Master Modern Technology'}
                <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent block">Skills Today</span>
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {siteSettings?.homePage?.hero?.subtitle || 'Join thousands of students learning cutting-edge technologies with our comprehensive courses, hands-on projects, and industry-recognized certificates.'}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/courses" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto group">
                    <span>Explore Courses</span>
                    <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="w-full sm:w-auto group" onClick={() => setShowDemoModal(true)}>
                  <Play size={20} className="mr-2 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mt-8 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary-300" />
                  <span>10,000+ Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-300" />
                  <span>4.9/5 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-secondary-300" />
                  <span>50+ Countries</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 rounded-3xl p-8 sm:p-12 flex items-center justify-center shadow-2xl">
                <div className="text-white text-center">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="w-24 h-24 sm:w-32 sm:h-32 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm"
                  >
                    <Code size={48} className="sm:w-16 sm:h-16" />
                  </motion.div>
                  <h3 className="text-2xl sm:text-3xl font-heading font-bold mb-2">Techspert</h3>
                  <p className="text-white/90 text-sm sm:text-base">Your Gateway to Tech Excellence</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Courses Carousel Section */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-neutral-900 mb-4">
              Featured Courses
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto px-4">
              Choose from our most popular courses designed by industry experts
            </p>
          </motion.div>

          {courses.length > 0 ? (
            <Carousel
              items={courses}
              renderItem={(course, index) => (
                <CourseCard course={course} index={index} />
              )}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-neutral-600">No courses available at the moment.</p>
            </div>
          )}

          {courses.length > 0 && (
            <div className="text-center mt-8 sm:mt-10">
              <Link to="/courses">
                <Button variant="outline" size="lg" className="group">
                  <span>View All Courses</span>
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Projects Carousel Section */}
      <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-b from-neutral-50 to-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-neutral-900 mb-4">
              Student Projects
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto px-4">
              See what our students have built with their new skills
            </p>
          </motion.div>

          {projects.length > 0 ? (
            <Carousel
              items={projects}
              renderItem={(project, index) => (
                <Card hover className="h-full overflow-hidden">
                  <div className="aspect-video bg-neutral-200 rounded-t-2xl overflow-hidden">
                    {project.images && project.images.length > 0 ? (
                      <img
                        src={project.images[0]}
                        alt={project.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : project.imageUrl ? (
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100">
                        <Code size={48} className="text-primary-600" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-heading font-semibold text-neutral-900 mb-2 line-clamp-2">
                      {project.title}
                    </h3>
                    <p className="text-sm sm:text-base text-neutral-600 mb-4 line-clamp-3">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies?.slice(0, 3).map((tech, i) => (
                        <span key={i} className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-neutral-500">
                        {project.studentName}
                      </span>
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              )}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-neutral-600">No projects available at the moment.</p>
            </div>
          )}

          {projects.length > 0 && (
            <div className="text-center mt-8 sm:mt-10">
              <Link to="/projects">
                <Button variant="outline" size="lg" className="group">
                  <span>View All Projects</span>
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Success Stories (Alumni) Carousel Section */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-neutral-900 mb-4">
              Success Stories
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto px-4">
              Hear from our graduates who transformed their careers
            </p>
          </motion.div>

          {alumni.length > 0 ? (
            <Carousel
              items={alumni}
              renderItem={(alumnus, index) => (
                <Card hover className="text-center h-full p-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white shadow-lg">
                    <img
                      src={alumnus.imageUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200'}
                      alt={alumnus.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg sm:text-xl font-heading font-semibold text-neutral-900 mb-2">
                    {alumnus.name}
                  </h3>
                  <p className="text-sm sm:text-base text-primary-600 font-medium mb-2">
                    {alumnus.currentPosition || alumnus.title} {alumnus.company && `at ${alumnus.company}`}
                  </p>
                  <p className="text-xs sm:text-sm text-neutral-500 mb-4">
                    {alumnus.course} Graduate
                  </p>
                  <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-primary-200 mx-auto mb-3" />
                  <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4 line-clamp-4 italic">
                    "{alumnus.testimonial}"
                  </p>
                  {alumnus.linkedinUrl && (
                    <a
                      href={alumnus.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      <ExternalLink size={16} className="mr-2" />
                      Connect on LinkedIn
                    </a>
                  )}
                </Card>
              )}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-neutral-600">No success stories available at the moment.</p>
            </div>
          )}

          {alumni.length > 0 && (
            <div className="text-center mt-8 sm:mt-10">
              <Link to="/alumni">
                <Button variant="outline" size="lg" className="group">
                  <span>View All Success Stories</span>
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <FreeDemoModal isOpen={showDemoModal} onClose={() => setShowDemoModal(false)} />
    </div>
  )
}

export default Home
