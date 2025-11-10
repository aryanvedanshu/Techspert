import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, Play, Star, Users, Award, Code, Database, Brain, ExternalLink, Target, TrendingUp, 
  BookOpen, GraduationCap, Briefcase, DollarSign, Clock, CheckCircle, Heart, Globe, Zap, Shield, 
  Smartphone, Laptop, Cloud, Lock, Sparkles, Trophy, BookMarked, Rocket, Lightbulb, HelpCircle,
  ChevronRight, CheckCircle2, Phone, Mail, MessageCircle, Quote, Sparkle, ArrowDown, MapPin
} from 'lucide-react'
import { api } from '../services/api'
import CourseCard from '../components/CourseCard'
import Button from '../components/UI/Button'
import Card from '../components/UI/Card'
import FreeDemoModal from '../components/FreeDemoModal'
import logger from '../utils/logger'

const Home = () => {
  logger.componentMount('Home')
  logger.functionEntry('Home component initialization')
  
  const [courses, setCourses] = useState([])
  const [alumni, setAlumni] = useState([])
  const [projects, setProjects] = useState([])
  const [siteSettings, setSiteSettings] = useState(null)
  const [features, setFeatures] = useState([])
  const [statistics, setStatistics] = useState([])
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDemoModal, setShowDemoModal] = useState(false)

  logger.debug('Home component initial state', { loading })

  useEffect(() => {
    logger.functionEntry('useEffect - fetchData')
    logger.debug('useEffect triggered - fetching data from MongoDB')
    const fetchData = async () => {
      const startTime = Date.now()
      try {
        logger.info('Starting parallel API calls to fetch all homepage data', {
          endpoints: [
            '/courses?featured=true&limit=6',
            '/alumni?featured=true&limit=6',
            '/projects?featured=true&limit=6',
            '/settings',
            '/features?category=homepage&featured=true',
            '/statistics?category=homepage&featured=true',
            '/faqs?featured=true&limit=6'
          ]
        })
        // Fetch all data in parallel for better performance
        const [coursesResponse, alumniResponse, projectsResponse, settingsResponse, featuresResponse, statisticsResponse, faqsResponse] = await Promise.all([
          api.get('/courses?featured=true&limit=6'),
          api.get('/alumni?featured=true&limit=6'),
          api.get('/projects?featured=true&limit=6'),
          api.get('/settings'),
          api.get('/features?category=homepage&featured=true'),
          api.get('/statistics?category=homepage&featured=true'),
          api.get('/faqs?featured=true&limit=6')
        ])
        
        const duration = Date.now() - startTime
        logger.info('All API calls completed successfully', {
          duration: `${duration}ms`,
          dataCounts: {
            courses: coursesResponse.data.data?.length || 0,
            alumni: alumniResponse.data.data?.length || 0,
            projects: projectsResponse.data.data?.length || 0,
            features: featuresResponse.data.data?.length || 0,
            statistics: statisticsResponse.data.data?.length || 0,
            faqs: faqsResponse.data.data?.length || 0,
            hasSettings: !!settingsResponse.data.data
          }
        })
        
        logger.stateChange('Home', 'courses', courses, coursesResponse.data.data || [])
        logger.stateChange('Home', 'alumni', alumni, alumniResponse.data.data || [])
        logger.stateChange('Home', 'projects', projects, projectsResponse.data.data || [])
        logger.stateChange('Home', 'features', features, featuresResponse.data.data || [])
        logger.stateChange('Home', 'statistics', statistics, statisticsResponse.data.data || [])
        logger.stateChange('Home', 'faqs', faqs, faqsResponse.data.data || [])
        logger.stateChange('Home', 'siteSettings', siteSettings, settingsResponse.data.data)
        
        setCourses(coursesResponse.data.data || [])
        setAlumni(alumniResponse.data.data || [])
        setProjects(projectsResponse.data.data || [])
        setSiteSettings(settingsResponse.data.data)
        setFeatures(featuresResponse.data.data || [])
        setStatistics(statisticsResponse.data.data || [])
        setFaqs(faqsResponse.data.data || [])
      } catch (error) {
        const duration = Date.now() - startTime
        logger.error('Error fetching homepage data from MongoDB', error, {
          duration: `${duration}ms`,
          errorMessage: error.message,
          errorResponse: error.response?.data
        })
        // Set empty arrays on error to prevent crashes
        setCourses([])
        setAlumni([])
        setProjects([])
        setFeatures([])
        setStatistics([])
        setFaqs([])
        // Set default settings if fetch fails
        logger.warn('Using fallback settings - database fetch failed', {
          reason: 'API call failed, using default settings'
        })
        setSiteSettings({
          homePage: {
            hero: {
              title: 'Master the Future of Technology',
              subtitle: 'Learn cutting-edge skills from industry experts and build your dream career in tech',
              ctaText: 'Start Learning Today',
            },
            features: {
              title: 'Why Choose Techspert?',
              subtitle: 'We provide comprehensive learning experiences designed for real-world success',
            },
            stats: {
              title: 'Our Impact',
              subtitle: 'Join thousands of successful graduates who have transformed their careers',
            },
          },
        })
      } finally {
        logger.debug('Setting loading to false', { wasLoading: loading })
        logger.stateChange('Home', 'loading', loading, false)
        setLoading(false)
        logger.functionExit('useEffect - fetchData')
      }
    }

    fetchData()
    
    return () => {
      logger.componentUnmount('Home')
    }
  }, [])

  logger.debug('Home component rendering', { loading, coursesCount: courses.length })

  // Dynamic icon mapping from database
  const getIconComponent = (iconName) => {
    const iconMap = {
      Users, Award, Star, Code, Target, TrendingUp, BookOpen, GraduationCap,
      Briefcase, DollarSign, Clock, CheckCircle, Heart, Globe, Zap, Shield,
      Database, Brain, Smartphone, Laptop, Cloud, Lock, Rocket, Trophy, Sparkles
    }
    return iconMap[iconName] || Users
  }

  // Loading skeleton component
  const StatSkeleton = () => (
    <div className="animate-pulse">
      <div className="w-16 h-16 bg-gradient-to-r from-neutral-200 to-neutral-300 rounded-2xl mx-auto mb-4"></div>
      <div className="h-8 bg-neutral-200 rounded-lg mb-2 w-1/2 mx-auto"></div>
      <div className="h-4 bg-neutral-200 rounded w-2/3 mx-auto"></div>
    </div>
  )

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section - Enhanced with background image */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Background Image */}
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
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
                  </pattern>
                </defs>
                <rect width="1920" height="1080" fill="url(#grad1)"/>
                <rect width="1920" height="1080" fill="url(#grid)"/>
                <circle cx="300" cy="200" r="100" fill="rgba(255,255,255,0.1)"/>
                <circle cx="1600" cy="800" r="150" fill="rgba(255,255,255,0.05)"/>
                <circle cx="800" cy="100" r="80" fill="rgba(255,255,255,0.08)"/>
                <circle cx="1200" cy="900" r="120" fill="rgba(255,255,255,0.06)"/>
              </svg>
            `)}')`
          }}
        />
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary-200/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container-custom py-12 sm:py-16 md:py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center lg:text-left relative z-10"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6"
              >
                <Sparkle className="w-4 h-4" />
                <span>New Batch Starting Soon</span>
              </motion.div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-white mb-6 leading-tight">
                {loading ? (
                  <>
                    <div className="h-16 bg-white/20 rounded animate-pulse mb-2"></div>
                    <div className="h-16 bg-gradient-to-r from-primary-300 to-secondary-300 rounded animate-pulse mb-2"></div>
                    <div className="h-16 bg-white/20 rounded animate-pulse"></div>
                  </>
                ) : (
                  <>
                    {siteSettings?.homePage?.hero?.title || 'Master Modern Technology'}
                    <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent block">Skills Today</span>
                  </>
                )}
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {siteSettings?.homePage?.hero?.subtitle || 'Join thousands of students learning cutting-edge technologies with our comprehensive courses, hands-on projects, and industry-recognized certificates.'}
              </p>

              {/* CTA Buttons - Better mobile stacking */}
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

              {/* Social Proof */}
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

            {/* Right Hero Image/Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative"
            >
              <div className="relative z-10">
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
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full opacity-30 animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section - Improved Grid */}
      <section className="py-12 sm:py-16 bg-white relative">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-neutral-900 mb-4">
              {siteSettings?.homePage?.stats?.title || 'Our Impact'}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto px-4">
              {siteSettings?.homePage?.stats?.subtitle || 'Join thousands of successful graduates who have transformed their careers'}
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {loading ? (
              <>
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
              </>
            ) : (
              statistics.map((stat, index) => {
                const Icon = getIconComponent(stat.icon)
                return (
                  <motion.div
                    key={stat._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="text-center p-4 rounded-2xl hover:bg-neutral-50 transition-colors"
                  >
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg`}>
                      <Icon size={20} className="sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 mb-1 sm:mb-2">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-neutral-600 leading-tight">{stat.label}</div>
                    {stat.description && (
                      <div className="text-xs text-neutral-500 mt-1 hidden sm:block">{stat.description}</div>
                    )}
                  </motion.div>
                )
              })
            )}
          </div>
        </div>
      </section>

      {/* Featured Courses - Enhanced Grid */}
      <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-b from-neutral-50 to-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-neutral-900 mb-4">
              Featured Courses
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto px-4">
              Choose from our most popular courses designed by industry experts
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-neutral-200 rounded-2xl mb-4"></div>
                  <div className="h-6 bg-neutral-200 rounded mb-3"></div>
                  <div className="h-4 bg-neutral-200 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {courses.map((course, index) => (
                <CourseCard key={course._id} course={course} index={index} />
              ))}
            </div>
          )}

          {courses.length > 0 && (
            <div className="text-center mt-10 sm:mt-12">
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

      {/* Features Section - 3 Column Grid */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-neutral-900 mb-4">
              {siteSettings?.homePage?.features?.title || 'Why Choose Techspert?'}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto px-4">
              {siteSettings?.homePage?.features?.subtitle || 'We provide comprehensive learning experiences that prepare you for real-world challenges'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {loading ? (
              <>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-neutral-200 rounded-2xl mb-4"></div>
                    <div className="h-6 bg-neutral-200 rounded mb-3"></div>
                    <div className="h-4 bg-neutral-200 rounded mb-2 w-3/4"></div>
                  </div>
                ))}
              </>
            ) : (
              features.map((feature, index) => {
                const Icon = getIconComponent(feature.icon)
                return (
                  <motion.div
                    key={feature._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card hover className="text-center h-full p-6">
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                        <Icon size={24} className="text-white" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-heading font-semibold text-neutral-900 mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                        {feature.description}
                      </p>
                      {feature.link && (
                        <div className="mt-4">
                          <a
                            href={feature.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm"
                          >
                            Learn More
                            <ExternalLink size={14} className="ml-1" />
                          </a>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                )
              })
            )}
          </div>
        </div>
      </section>

      {/* Student Projects Showcase */}
      <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-b from-neutral-50 to-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-neutral-900 mb-4">
              Student Projects
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto px-4">
              See the amazing projects built by our students using the skills they learned
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-neutral-200 rounded-2xl mb-4"></div>
                  <div className="h-6 bg-neutral-200 rounded mb-3"></div>
                  <div className="h-4 bg-neutral-200 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : projects.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {projects.map((project, index) => (
                  <motion.div
                    key={project._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card hover className="h-full overflow-hidden">
                      <div className="aspect-video bg-neutral-200 rounded-t-2xl overflow-hidden">
                        {project.imageUrl ? (
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
                      <div className="p-6">
                        <h3 className="text-lg font-heading font-semibold text-neutral-900 mb-2 line-clamp-2">
                          {project.title}
                        </h3>
                        <p className="text-sm text-neutral-600 mb-4 line-clamp-3">
                          {project.shortDescription || project.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.technologies?.slice(0, 3).map((tech, techIndex) => (
                            <span 
                              key={techIndex}
                              className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.technologies?.length > 3 && (
                            <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs font-medium rounded-full">
                              +{project.technologies.length - 3} more
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-neutral-500">
                            by {project.studentName}
                          </div>
                          <div className="flex gap-2">
                            {project.githubUrl && (
                              <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                title="View on GitHub"
                              >
                                <ExternalLink size={16} />
                              </a>
                            )}
                            {project.liveUrl && (
                              <a
                                href={project.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                title="View Live Demo"
                              >
                                <ExternalLink size={16} />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
              <div className="text-center mt-12">
                <Link to="/projects">
                  <Button variant="outline" size="lg" className="group">
                    <span>View All Projects</span>
                    <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Code size={48} className="mx-auto text-neutral-300 mb-4" />
              <p className="text-neutral-600 text-lg font-medium mb-2">No projects yet</p>
              <p className="text-neutral-500">Check back soon for amazing student projects!</p>
            </div>
          )}
        </div>
      </section>

      {/* Alumni Success Stories */}
      <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-b from-white to-neutral-50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-neutral-900 mb-4">
              Success Stories
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto px-4">
              See how our alumni have transformed their careers with our courses
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="w-20 h-20 bg-neutral-200 rounded-full mx-auto mb-4"></div>
                  <div className="h-6 bg-neutral-200 rounded mb-2"></div>
                  <div className="h-4 bg-neutral-200 rounded mb-3"></div>
                  <div className="h-4 bg-neutral-200 rounded mb-2 w-3/4 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {Array.isArray(alumni) && alumni.map((alumnus, index) => (
                <motion.div
                  key={alumnus._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card hover className="text-center h-full p-6">
                    <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white shadow-lg">
                      <img
                        src={alumnus.imageUrl}
                        alt={alumnus.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-lg sm:text-xl font-heading font-semibold text-neutral-900 mb-2">
                      {alumnus.name}
                    </h3>
                    <p className="text-sm sm:text-base text-primary-600 font-medium mb-2">
                      {alumnus.title} at {alumnus.company}
                    </p>
                    <p className="text-xs sm:text-sm text-neutral-500 mb-4">
                      {alumnus.course} Graduate
                    </p>
                    <Quote className="w-8 h-8 text-primary-200 mx-auto mb-3" />
                    <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4 line-clamp-3 italic">
                      "{alumnus.testimonial}"
                    </p>
                    {alumnus.socialLinks?.linkedin && (
                      <a
                        href={alumnus.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-neutral-400 hover:text-primary-600 transition-colors"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {Array.isArray(alumni) && alumni.length > 0 && (
            <div className="text-center mt-10 sm:mt-12">
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

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center text-white max-w-3xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg sm:text-xl mb-8 text-white/90">
              Join thousands of students already learning with us and transform your career today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/courses">
                <Button size="lg" variant="secondary" className="bg-white text-primary-600 hover:bg-neutral-50">
                  Explore Courses
                  <ArrowRight size={20} className="ml-2" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10">
                  Get in Touch
                  <MessageCircle size={20} className="ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Demo Modal */}
      <FreeDemoModal 
        isOpen={showDemoModal} 
        onClose={() => setShowDemoModal(false)} 
      />
    </div>
  )
}

export default Home
