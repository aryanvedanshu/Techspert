import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Users, Star, Play, Check, ArrowLeft, Download, Share2 } from 'lucide-react'
import { api } from '../services/api'
import Button from '../components/UI/Button'
import Card from '../components/UI/Card'

const CourseDetail = () => {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await api.get(`/courses/${id}`)
        setCourse(response.data)
      } catch (error) {
        console.error('Error fetching course:', error)
        setError('Course not found')
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-16">
        <div className="container-custom">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="aspect-video bg-neutral-200 rounded-2xl mb-6"></div>
                <div className="h-8 bg-neutral-200 rounded mb-4"></div>
                <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
              </div>
              <div>
                <div className="h-64 bg-neutral-200 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-neutral-50 py-16">
        <div className="container-custom text-center">
          <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Play size={32} className="text-neutral-400" />
          </div>
          <h2 className="text-2xl font-heading font-semibold text-neutral-900 mb-4">
            Course Not Found
          </h2>
          <p className="text-neutral-600 mb-6">
            The course you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/courses">
            <Button>
              <ArrowLeft size={16} className="mr-2" />
              Back to Courses
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const {
    title,
    description,
    thumbnailUrl,
    duration,
    level,
    price,
    rating = 4.8,
    studentsCount = 1250,
    tags = [],
    syllabus = [],
    instructor = 'Techspert Team',
    requirements = [],
    whatYouWillLearn = []
  } = course

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-neutral-100 text-neutral-800'
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <section className="bg-white py-8">
        <div className="container-custom">
          <Link to="/courses" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
            <ArrowLeft size={20} className="mr-2" />
            Back to Courses
          </Link>
        </div>
      </section>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Course Header */}
              <Card className="mb-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(level)}`}>
                        {level}
                      </span>
                      <div className="flex items-center gap-1 text-sm text-neutral-600">
                        <Star size={16} className="text-yellow-400 fill-current" />
                        <span>{rating}</span>
                        <span>({studentsCount.toLocaleString()} students)</span>
                      </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900 mb-4">
                      {title}
                    </h1>
                    <p className="text-lg text-neutral-600 leading-relaxed">
                      {description}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Share2 size={16} />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download size={16} />
                    </Button>
                  </div>
                </div>

                {/* Course Thumbnail */}
                <div className="aspect-video bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl mb-6 overflow-hidden">
                  {thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play size={64} className="text-white/80" />
                    </div>
                  )}
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-neutral-100 text-neutral-600 text-sm rounded-lg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Card>

              {/* What You'll Learn */}
              {whatYouWillLearn.length > 0 && (
                <Card className="mb-8">
                  <h2 className="text-2xl font-heading font-semibold text-neutral-900 mb-6">
                    What You'll Learn
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {whatYouWillLearn.map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Course Content */}
              <Card className="mb-8">
                <h2 className="text-2xl font-heading font-semibold text-neutral-900 mb-6">
                  Course Content
                </h2>
                <div className="space-y-4">
                  {syllabus.map((section, index) => (
                    <div key={index} className="border border-neutral-200 rounded-xl p-4">
                      <h3 className="font-semibold text-neutral-900 mb-2">
                        Section {index + 1}: {section.title}
                      </h3>
                      <p className="text-neutral-600 text-sm mb-3">
                        {section.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-neutral-500">
                        <div className="flex items-center gap-1">
                          <Clock size={16} />
                          <span>{section.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Play size={16} />
                          <span>{section.lessons} lessons</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Requirements */}
              {requirements.length > 0 && (
                <Card>
                  <h2 className="text-2xl font-heading font-semibold text-neutral-900 mb-6">
                    Requirements
                  </h2>
                  <ul className="space-y-3">
                    {requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-neutral-700">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="sticky top-8"
            >
              <Card className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    ${price}
                  </div>
                  <div className="text-sm text-neutral-500 line-through">
                    ${Math.round(price * 1.5)}
                  </div>
                </div>

                <Button className="w-full mb-4" size="lg">
                  Enroll Now
                </Button>

                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Duration</span>
                    <span className="font-medium">{duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Level</span>
                    <span className="font-medium">{level}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Students</span>
                    <span className="font-medium">{studentsCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-400 fill-current" />
                      <span className="font-medium">{rating}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-neutral-200 pt-6 mt-6">
                  <h3 className="font-semibold text-neutral-900 mb-3">Instructor</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {instructor.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-neutral-900">{instructor}</div>
                      <div className="text-sm text-neutral-600">Techspert Expert</div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseDetail