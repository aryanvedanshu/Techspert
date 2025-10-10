import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Play, Star, Users, Award, Code, Database, Brain } from 'lucide-react'
import { api } from '../services/api'
import CourseCard from '../components/CourseCard'
import Button from '../components/UI/Button'
import Card from '../components/UI/Card'

const Home = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses')
        setCourses(response.data.slice(0, 3)) // Show only first 3 courses
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const stats = [
    { label: 'Students', value: '10,000+', icon: Users },
    { label: 'Courses', value: '50+', icon: Award },
    { label: 'Success Rate', value: '95%', icon: Star },
    { label: 'Projects', value: '200+', icon: Code },
  ]

  const features = [
    {
      icon: Brain,
      title: 'AI & Machine Learning',
      description: 'Master cutting-edge AI technologies with hands-on projects and real-world applications.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Database,
      title: 'Data Science',
      description: 'Learn data analysis, visualization, and machine learning with industry-standard tools.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Code,
      title: 'MERN Stack',
      description: 'Build full-stack applications with MongoDB, Express, React, and Node.js.',
      color: 'from-green-500 to-emerald-500',
    },
  ]

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
                Master Modern
                <span className="gradient-text block">Technology</span>
                <span className="text-neutral-600">Skills</span>
              </h1>
              <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
                Join thousands of students learning cutting-edge technologies with our comprehensive courses, 
                hands-on projects, and industry-recognized certificates.
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon size={24} className="text-white" />
                  </div>
                  <div className="text-3xl font-bold text-neutral-900 mb-2">{stat.value}</div>
                  <div className="text-neutral-600">{stat.label}</div>
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
              Why Choose Techspert?
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              We provide comprehensive learning experiences that prepare you for real-world challenges
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
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
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home