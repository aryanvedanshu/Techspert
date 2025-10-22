import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Users, Star, Play, ArrowLeft, Download, Share2, BookOpen, Award, ExternalLink, Check } from 'lucide-react'
import { api } from '../services/api'
import { toast } from 'sonner'
import Button from '../components/UI/Button'
import Card from '../components/UI/Card'

const CourseDetail = () => {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        // Fetch course details
        const courseResponse = await api.get(`/courses/${id}`)
        setCourse(courseResponse.data.data || null)
      } catch (error) {
        console.error('Error fetching course:', error)
        setError('Course not found')
        setCourse(null)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchCourseData()
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-16">
        <div className="container-custom">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-neutral-200 rounded-2xl"></div>
                <div className="h-32 bg-neutral-200 rounded-2xl"></div>
                <div className="h-48 bg-neutral-200 rounded-2xl"></div>
              </div>
              <div className="space-y-6">
                <div className="h-96 bg-neutral-200 rounded-2xl"></div>
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
    originalPrice,
    rating = { average: 4.8, count: 1250 },
    studentsCount = 1250,
    tags = [],
    syllabus = [],
    instructor = {},
    requirements = [],
    whatYouWillLearn = [],
    previewUrl
  } = course || {}

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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Course link copied to clipboard!')
    }
  }

  const handleDownload = () => {
    toast.info('Course materials will be available after enrollment')
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <Link to="/courses" className="flex items-center text-neutral-600 hover:text-primary-600">
              <ArrowLeft size={20} className="mr-2" />
              Back to Courses
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleShare}>
                <Share2 size={16} className="mr-2" />
                Share
              </Button>
              <Button variant="outline" onClick={handleDownload}>
                <Download size={16} className="mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="aspect-video bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl overflow-hidden mb-6">
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play size={64} className="text-white" />
                  </div>
                )}
              </div>

              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-heading font-bold text-neutral-900 mb-2">
                    {title}
                  </h1>
                  <p className="text-lg text-neutral-600 mb-4">
                    {description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-neutral-500">
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      <span>{studentsCount} students</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-500 fill-current" />
                      <span>{rating.average} ({rating.count} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                <span className={`px-3 py-1 text-sm rounded-full ${getLevelColor(level)}`}>
                  {level}
                </span>
              </div>
            </motion.div>

            {/* What You'll Learn */}
            {whatYouWillLearn && whatYouWillLearn.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="p-6">
                  <h3 className="text-xl font-heading font-semibold text-neutral-900 mb-4">
                    What You'll Learn
                  </h3>
                  <ul className="space-y-3">
                    {whatYouWillLearn.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            )}

            {/* Course Content */}
            {syllabus && syllabus.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="p-6">
                  <h3 className="text-xl font-heading font-semibold text-neutral-900 mb-4">
                    Course Content
                  </h3>
                  <div className="space-y-4">
                    {syllabus.map((section, index) => (
                      <div key={index} className="border border-neutral-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-neutral-900">
                            {section.title}
                          </h4>
                          <span className="text-sm text-neutral-500">
                            {section.duration}
                          </span>
                        </div>
                        <p className="text-neutral-600 text-sm mb-2">
                          {section.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-neutral-500">
                          <span>{section.lessons} lessons</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Requirements */}
            {requirements && requirements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="p-6">
                  <h3 className="text-xl font-heading font-semibold text-neutral-900 mb-4">
                    Requirements
                  </h3>
                  <ul className="space-y-2">
                    {requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-neutral-700">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            )}

            {/* Instructor */}
            {instructor && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="p-6">
                  <h3 className="text-xl font-heading font-semibold text-neutral-900 mb-4">
                    Instructor
                  </h3>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full overflow-hidden">
                      {instructor.imageUrl ? (
                        <img
                          src={instructor.imageUrl}
                          alt={instructor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {instructor.name?.charAt(0) || 'T'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-neutral-900 mb-1">
                        {instructor.name || 'Techspert Team'}
                      </h4>
                      <p className="text-neutral-600 text-sm mb-3">
                        {instructor.bio || 'Experienced instructor with years of industry experience'}
                      </p>
                      {instructor.socialLinks && (
                        <div className="flex gap-2">
                          {instructor.socialLinks.linkedin && (
                            <a
                              href={instructor.socialLinks.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-700"
                            >
                              <ExternalLink size={16} />
                            </a>
                          )}
                          {instructor.socialLinks.github && (
                            <a
                              href={instructor.socialLinks.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-700"
                            >
                              <ExternalLink size={16} />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="p-6 sticky top-6">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-3xl font-bold text-neutral-900">
                      ${price}
                    </span>
                    {originalPrice && originalPrice > price && (
                      <span className="text-lg text-neutral-500 line-through">
                        ${originalPrice}
                      </span>
                    )}
                  </div>
                  {originalPrice && originalPrice > price && (
                    <span className="text-sm text-green-600 font-medium">
                      {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
                    </span>
                  )}
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-sm text-neutral-600">
                    <Award size={16} className="text-primary-500" />
                    <span>Certificate of Completion</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-600">
                    <BookOpen size={16} className="text-primary-500" />
                    <span>Lifetime Access</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-600">
                    <Users size={16} className="text-primary-500" />
                    <span>Community Support</span>
                  </div>
                </div>

                <Button className="w-full mb-4" size="lg">
                  <BookOpen size={20} className="mr-2" />
                  Enroll Now
                </Button>

                <p className="text-xs text-neutral-500 text-center">
                  One-time payment • Lifetime access • Certificate included
                </p>
              </Card>
            </motion.div>

            {/* Course Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-6">
                <h3 className="font-semibold text-neutral-900 mb-4">
                  Course Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Students</span>
                    <span className="font-medium">{studentsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-500 fill-current" />
                      <span className="font-medium">{rating.average}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Duration</span>
                    <span className="font-medium">{duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Level</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getLevelColor(level)}`}>
                      {level}
                    </span>
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