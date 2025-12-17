import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, Play, Star, Users, Award, Code, Sparkle, CheckCircle2, Globe,
  Quote, ExternalLink, GraduationCap, Briefcase
} from 'lucide-react'
import { api } from '../services/api'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import CourseCard from '../components/CourseCard'
import Button from '../components/UI/Button'
import Card from '../components/UI/Card'
import Carousel from '../components/UI/Carousel'
import FreeDemoModal from '../components/FreeDemoModal'
import logger from '../utils/logger'

const Home = () => {
  logger.componentMount('Home')

  // Use realtime site settings from Firestore
  const { settings: siteSettingsRT, homepage, loading: settingsLoading } = useSiteSettings()

  const [courses, setCourses] = useState([])
  const [alumni, setAlumni] = useState([])
  const [projects, setProjects] = useState([])
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
        // Settings now come from useSiteSettings() context
      } catch (error) {
        logger.error('Error fetching homepage data', error)
        setCourses([])
        setAlumni([])
        setProjects([])
        // Settings fallback comes from useSiteSettings() context
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
      {/* Hero Section - Clean Omnitrix Theme */}
      <section className="relative min-h-[60vh] sm:min-h-[70vh] md:min-h-[85vh] flex items-center overflow-hidden bg-neutral-900">
        {/* Subtle Grid Pattern Background */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />

        {/* Green Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary-600" />

        <div className="container-custom py-12 sm:py-16 md:py-24 lg:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center lg:text-left lg:max-w-none lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600/20 border border-primary-500/30 text-primary-400 rounded-full text-sm font-medium mb-6"
              >
                <Sparkle className="w-4 h-4" />
                <span>New Batch Starting Soon</span>
              </motion.div>

              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-white mb-6 leading-tight">
                {homepage?.hero?.title || 'Master the Future of'}
                <span className="text-primary-400 block">Technology</span>
              </h1>

              {/* Description */}
              <p className="text-lg sm:text-xl text-neutral-300 mb-8 max-w-2xl">
                {homepage?.hero?.subtitle || 'Learn cutting-edge skills from industry experts. Join thousands of students building the future with hands-on projects and real-world experience.'}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
                <Link to="/courses" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto group bg-primary-600 hover:bg-primary-500 text-white border-0">
                    <span>Explore Courses</span>
                    <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto group border-neutral-600 text-white hover:bg-white/10 hover:border-primary-500"
                  onClick={() => setShowDemoModal(true)}
                >
                  <Play size={20} className="mr-2 group-hover:scale-110 transition-transform text-primary-400" />
                  Watch Demo
                </Button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary-400" />
                  <span className="text-white font-medium">10,000+</span>
                  <span className="text-neutral-400">Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span className="text-white font-medium">4.9/5</span>
                  <span className="text-neutral-400">Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary-400" />
                  <span className="text-white font-medium">50+</span>
                  <span className="text-neutral-400">Countries</span>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Clean Tech Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="hidden lg:block relative"
            >
              <div className="relative">
                {/* Main Card */}
                <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-8 shadow-2xl">
                  {/* Terminal Header */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-primary-500" />
                    <span className="ml-4 text-neutral-400 text-sm font-mono">techspert.dev</span>
                  </div>

                  {/* Code Content */}
                  <div className="font-mono text-sm space-y-2">
                    <p className="text-neutral-400">// Start your journey</p>
                    <p><span className="text-purple-400">const</span> <span className="text-primary-400">skills</span> = [</p>
                    <p className="pl-4"><span className="text-yellow-400">"React"</span>,</p>
                    <p className="pl-4"><span className="text-yellow-400">"Node.js"</span>,</p>
                    <p className="pl-4"><span className="text-yellow-400">"Python"</span>,</p>
                    <p className="pl-4"><span className="text-yellow-400">"Data Science"</span></p>
                    <p>];</p>
                    <p className="mt-4"><span className="text-purple-400">function</span> <span className="text-primary-400">buildFuture</span>() {"{"}</p>
                    <p className="pl-4"><span className="text-blue-400">return</span> <span className="text-yellow-400">"success"</span>;</p>
                    <p>{"}"}</p>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -top-4 -right-4 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg">
                  <span className="flex items-center gap-2">
                    <Code size={16} />
                    Learn & Build
                  </span>
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
