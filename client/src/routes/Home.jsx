import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Play, Star, Users, Award, Code, Database, Brain, ExternalLink, Target, TrendingUp, BookOpen, GraduationCap, Briefcase, DollarSign, Clock, CheckCircle, Heart, Globe, Zap, Shield, Smartphone, Laptop, Cloud, Lock } from 'lucide-react'
import { api } from '../services/api'
import CourseCard from '../components/CourseCard'
import Button from '../components/UI/Button'
import Card from '../components/UI/Card'

const Home = () => {
  console.log("[DEBUG: Home.jsx:component:10] Home component initializing")
  
  const [courses, setCourses] = useState([])
  const [alumni, setAlumni] = useState([])
  const [siteSettings, setSiteSettings] = useState(null)
  const [features, setFeatures] = useState([])
  const [statistics, setStatistics] = useState([])
  const [loading, setLoading] = useState(true)

  console.log("[DEBUG: Home.jsx:state:16] Initial state - loading:", loading)

  useEffect(() => {
    console.log("[DEBUG: Home.jsx:useEffect:18] useEffect triggered - fetching data")
    const fetchData = async () => {
      try {
        console.log("[DEBUG: Home.jsx:fetchData:20] Starting parallel API calls")
        // Fetch courses, alumni, site settings, features, and statistics in parallel
        const [coursesResponse, alumniResponse, settingsResponse, featuresResponse, statisticsResponse] = await Promise.all([
          api.get('/courses?featured=true&limit=3'),
          api.get('/alumni?featured=true&limit=3'),
          api.get('/settings'),
          api.get('/features?category=homepage&featured=true'),
          api.get('/statistics?category=homepage&featured=true')
        ])
        
        console.log("[DEBUG: Home.jsx:fetchData:success:29] API calls completed successfully")
        console.log("[DEBUG: Home.jsx:fetchData:data:30] Courses count:", coursesResponse.data.data?.length || 0)
        console.log("[DEBUG: Home.jsx:fetchData:data:31] Alumni count:", alumniResponse.data.data?.length || 0)
        console.log("[DEBUG: Home.jsx:fetchData:data:32] Features count:", featuresResponse.data.data?.length || 0)
        console.log("[DEBUG: Home.jsx:fetchData:data:33] Statistics count:", statisticsResponse.data.data?.length || 0)
        
        setCourses(coursesResponse.data.data || [])
        setAlumni(alumniResponse.data.data || [])
        setSiteSettings(settingsResponse.data.data)
        setFeatures(featuresResponse.data.data || [])
        setStatistics(statisticsResponse.data.data || [])
      } catch (error) {
        console.error("[DEBUG: Home.jsx:fetchData:error:36] Error fetching data:", error)
        // Set empty arrays on error to prevent crashes
        console.log("[DEBUG: Home.jsx:fetchData:error:50] Setting empty arrays due to error")
        setCourses([])
        setAlumni([])
        setFeatures([])
        setStatistics([])
        // Set default settings if fetch fails
        console.log("[DEBUG: Home.jsx:fetchData:error:55] Setting default site settings")
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
        console.log("[DEBUG: Home.jsx:fetchData:finally:75] Setting loading to false")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  console.log("[DEBUG: Home.jsx:render:81] Component rendering - loading:", loading, "courses:", courses.length, "features:", features.length, "statistics:", statistics.length)

  // Dynamic stats from database
  const getIconComponent = (iconName) => {
    const iconMap = {
      Users, Award, Star, Code, Target, TrendingUp, BookOpen, GraduationCap,
      Briefcase, DollarSign, Clock, CheckCircle, Heart, Globe, Zap, Shield
    }
    return iconMap[iconName] || Users
  }

  // Dynamic features from database
  const getFeatureIcon = (iconName) => {
    const iconMap = {
      Brain, Database, Code, Award, Users, Target, CheckCircle, Star,
      Shield, Zap, Globe, Smartphone, Laptop, Cloud, Lock, Heart
    }
    return iconMap[iconName] || Code
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-50 to-primary-50">
        <div className="container-custom section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-neutral-900 mb-6 leading-tight">
                {siteSettings?.homePage?.hero?.title || 'Master Modern'}
                <span className="gradient-text block">{siteSettings?.homePage?.hero?.title?.split(' ').slice(1).join(' ') || 'Technology'}</span>
                <span className="text-neutral-600">Skills</span>
              </h1>
              <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
                {siteSettings?.homePage?.hero?.subtitle || 'Join thousands of students learning cutting-edge technologies with our comprehensive courses, hands-on projects, and industry-recognized certificates.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/courses">
                  <Button size="lg" className="w-full sm:w-auto">
                    Explore Courses
                    <ArrowRight size={20} className="ml-2" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Play size={20} className="mr-2" />
                  Watch Demo
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10">
                <div className="aspect-square bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl p-8 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Code size={48} />
                    </div>
                    <h3 className="text-2xl font-heading font-bold mb-2">Techspert</h3>
                    <p className="text-white/80">Your Gateway to Tech Excellence</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full opacity-20 animate-bounce-subtle"></div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-full opacity-20 animate-bounce-subtle" style={{ animationDelay: '1s' }}></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900 mb-4">
              {siteSettings?.homePage?.stats?.title || 'Our Impact'}
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              {siteSettings?.homePage?.stats?.subtitle || 'Join thousands of successful graduates who have transformed their careers'}
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statistics.map((stat, index) => {
              const Icon = getIconComponent(stat.icon)
              return (
                <motion.div
                  key={stat._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <div className="text-3xl font-bold text-neutral-900 mb-2">{stat.value}</div>
                  <div className="text-neutral-600">{stat.label}</div>
                  {stat.description && (
                    <div className="text-sm text-neutral-500 mt-1">{stat.description}</div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="section-padding bg-neutral-50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900 mb-4">
              Featured Courses
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Choose from our most popular courses designed by industry experts
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-video bg-neutral-200 rounded-2xl mb-6"></div>
                  <div className="h-6 bg-neutral-200 rounded mb-4"></div>
                  <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                  <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course, index) => (
                <CourseCard key={course._id} course={course} index={index} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/courses">
              <Button variant="outline" size="lg">
                View All Courses
                <ArrowRight size={20} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900 mb-4">
              {siteSettings?.homePage?.features?.title || 'Why Choose Techspert?'}
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              {siteSettings?.homePage?.features?.subtitle || 'We provide comprehensive learning experiences that prepare you for real-world challenges'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = getFeatureIcon(feature.icon)
              return (
                <motion.div
                  key={feature._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card hover className="text-center h-full">
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <h3 className="text-xl font-heading font-semibold text-neutral-900 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-neutral-600 leading-relaxed">
                      {feature.description}
                    </p>
                    {feature.link && (
                      <div className="mt-4">
                        <a
                          href={feature.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Learn More
                          <ExternalLink size={16} className="ml-1" />
                        </a>
                      </div>
                    )}
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Alumni Success Stories */}
      <section className="section-padding bg-neutral-50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              See how our alumni have transformed their careers with our courses
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="w-20 h-20 bg-neutral-200 rounded-full mx-auto mb-4"></div>
                  <div className="h-6 bg-neutral-200 rounded mb-2"></div>
                  <div className="h-4 bg-neutral-200 rounded mb-4"></div>
                  <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                  <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.isArray(alumni) && alumni.map((alumnus, index) => (
                <motion.div
                  key={alumnus._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card hover className="text-center h-full">
                    <div className="w-20 h-20 rounded-full mx-auto mb-6 overflow-hidden">
                      <img
                        src={alumnus.imageUrl}
                        alt={alumnus.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-heading font-semibold text-neutral-900 mb-2">
                      {alumnus.name}
                    </h3>
                    <p className="text-primary-600 font-medium mb-2">
                      {alumnus.title} at {alumnus.company}
                    </p>
                    <p className="text-sm text-neutral-500 mb-4">
                      {alumnus.course} Graduate
                    </p>
                    <p className="text-neutral-600 text-sm leading-relaxed mb-4 line-clamp-3">
                      "{alumnus.testimonial}"
                    </p>
                    <div className="flex justify-center space-x-3">
                      {alumnus.socialLinks?.linkedin && (
                        <a
                          href={alumnus.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-neutral-400 hover:text-primary-600 transition-colors"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/alumni">
              <Button variant="outline" size="lg">
                View All Success Stories
                <ArrowRight size={20} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home