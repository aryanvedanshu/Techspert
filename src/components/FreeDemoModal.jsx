import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, Users, ExternalLink, CheckCircle, Mail, Phone, User, Video } from 'lucide-react'
import { toast } from 'sonner'
import { doc, onSnapshot, collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import { linkClicksService, formSubmissionsService } from '../services/leadTrackingService'
import { getTrackingContext, storeTrackingToken, getStoredTrackingToken } from '../services/trackingService'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import Button from './UI/Button'
import Card from './UI/Card'
import logger from '../utils/logger'


const FreeDemoModal = ({ isOpen, onClose }) => {
  const { dynamicLinks } = useSiteSettings()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    courseInterest: '',
    experience: 'beginner'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [courses, setCourses] = useState([])
  const [demoLink, setDemoLink] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [emailStatus, setEmailStatus] = useState('')

  // Fetch courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesRef = collection(db, 'courses')
        const snapshot = await getDocs(coursesRef)
        const courseList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setCourses(courseList)
        if (courseList.length > 0) {
          setSelectedCourse(courseList[0].id)
        }
      } catch (error) {
        logger.error('Failed to fetch courses', error)
      }
    }
    if (isOpen) {
      fetchCourses()
      setRegistrationSuccess(false)
      setEmailStatus('')
    }
  }, [isOpen])

  // Listen for demo link changes when course is selected
  useEffect(() => {
    if (!selectedCourse) return

    logger.info('FreeDemoModal: Listening for demo link', { courseId: selectedCourse })
    const demoLinkRef = doc(db, 'demo_links', selectedCourse)

    const unsubscribe = onSnapshot(
      demoLinkRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data()
          setDemoLink(data.demoMeetLink || '')
          logger.info('FreeDemoModal: Demo link updated', { link: data.demoMeetLink })
        } else {
          setDemoLink('')
          logger.warn('FreeDemoModal: No demo link found for course', { courseId: selectedCourse })
        }
      },
      (error) => {
        logger.error('FreeDemoModal: Error listening to demo link', error)
      }
    )

    return () => unsubscribe()
  }, [selectedCourse])

  const handleCourseChange = (e) => {
    const courseId = e.target.value
    setSelectedCourse(courseId)
    setFormData(prev => ({ ...prev, courseInterest: courseId }))
  }

  // Get the effective demo link - course-specific or global fallback
  const effectiveDemoLink = demoLink || dynamicLinks?.demoClassLink || ''

  const handleJoinDemo = async () => {
    if (!effectiveDemoLink) {
      toast.error('Demo link not available. Please register below to be notified.')
      return
    }
    // Track the click with device info
    try {
      const context = getTrackingContext()
      const result = await linkClicksService.trackClick({
        courseId: selectedCourse,
        courseName: selectedCourseData.title || 'Unknown Course',
        linkType: 'demo',
        ...context
      })
      if (result.trackingToken) {
        storeTrackingToken(result.trackingToken)
      }
    } catch (error) {
      logger.warn('Click tracking failed', error)
    }
    // Open the link
    window.open(effectiveDemoLink, '_blank')
  }

  const selectedCourseData = courses.find(c => c.id === selectedCourse) || {}

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    logger.functionEntry('handleSubmit', { hasName: !!formData.name, hasEmail: !!formData.email })

    try {
      const submitData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        courseInterest: selectedCourse,
        courseName: selectedCourseData.title || 'Unknown Course',
        demoLink: effectiveDemoLink,
        experience: formData.experience,
      }

      // 1. Save to demoSignups collection
      const demoSignupsRef = collection(db, 'demoSignups')
      const signupDoc = await addDoc(demoSignupsRef, {
        ...submitData,
        source: 'demo_modal',
        status: 'pending',
        emailSent: false,
        createdAt: serverTimestamp(),
      })

      logger.info('Demo signup saved', { id: signupDoc.id })

      // 2. Track in form_submissions collection with tracking token
      const trackingToken = getStoredTrackingToken()
      await formSubmissionsService.create({
        trackingToken,
        name: submitData.name,
        email: submitData.email,
        phone: submitData.phone,
        courseId: selectedCourse,
        courseName: submitData.courseName,
        formType: 'demo_form',
        source: 'demo_modal',
        rawFormData: {
          experience: submitData.experience,
          signupId: signupDoc.id
        }
      })

      // Email is automatically sent by Firebase Cloud Function when document is created
      setRegistrationSuccess(true)
      toast.success('Registration successful! Check your email for demo details.')

    } catch (error) {
      logger.error('Failed to register for demo', error)
      toast.error('Failed to register. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleClose = () => {
    setRegistrationSuccess(false)
    setEmailStatus('')
    setFormData({
      name: '',
      email: '',
      phone: '',
      courseInterest: '',
      experience: 'beginner'
    })
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <Card className="bg-white">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-neutral-900">
                    Free Live Demo Session
                  </h2>
                  <p className="text-neutral-600 mt-1">
                    Join our free live session and experience our teaching style
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                {registrationSuccess ? (
                  // Success State - Simple confirmation
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-6 py-8"
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle size={40} className="text-green-600" />
                    </div>

                    <div>
                      <h3 className="text-2xl font-heading font-bold text-neutral-900 mb-2">
                        Registration Successful! 🎉
                      </h3>
                      <p className="text-neutral-600 max-w-md mx-auto">
                        Thank you for registering!
                        {emailStatus === 'sent' && (
                          <span className="text-green-600 font-medium"> A confirmation email with demo details has been sent to your inbox.</span>
                        )}
                        {emailStatus === 'sending' && (
                          <span className="text-blue-600"> Sending confirmation email...</span>
                        )}
                        {emailStatus === 'failed' && (
                          <span className="text-orange-600"> We'll send you the demo details shortly.</span>
                        )}
                      </p>
                    </div>

                    {/* Demo Details */}
                    <div className="bg-primary-50 rounded-xl p-6 max-w-md mx-auto text-left">
                      <h4 className="font-semibold text-neutral-900 mb-4">📋 Demo Session Details</h4>
                      <div className="space-y-2 text-sm text-neutral-700">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-primary-600" />
                          <span>Every Saturday</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-primary-600" />
                          <span>2:00 PM - 3:00 PM IST</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-primary-600" />
                          <span>Max 20 participants</span>
                        </div>
                        {effectiveDemoLink && (
                          <div className="flex items-center gap-2 pt-2 border-t border-primary-100">
                            <Video size={16} className="text-primary-600" />
                            <a
                              href={effectiveDemoLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"
                            >
                              Join Demo Link <ExternalLink size={14} />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={handleClose}
                      className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Close
                    </button>
                  </motion.div>
                ) : (
                  // Registration Form
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Demo Information */}
                    <div className="space-y-6">
                      {/* Course Selector */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Select Course
                        </label>
                        <select
                          value={selectedCourse}
                          onChange={handleCourseChange}
                          className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                          {courses.map(course => (
                            <option key={course.id} value={course.id}>
                              {course.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <h3 className="text-lg font-heading font-semibold text-neutral-900 mb-4">
                          Session Details
                        </h3>

                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                              <Calendar size={20} className="text-primary-600" />
                            </div>
                            <div>
                              <p className="font-medium text-neutral-900">Every Saturday</p>
                              <p className="text-sm text-neutral-600">Weekly sessions</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <Clock size={20} className="text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-neutral-900">2:00 PM - 3:00 PM IST</p>
                              <p className="text-sm text-neutral-600">Duration: 1 Hour</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Users size={20} className="text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-neutral-900">Max 20 participants</p>
                              <p className="text-sm text-neutral-600">Interactive session</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Join Demo Button */}
                      <div className="bg-primary-50 rounded-lg p-4">

                        <div className="flex items-center gap-3 mb-3">
                          <Video size={20} className="text-primary-600" />
                          <span className="font-medium text-neutral-900">Join Demo Session</span>
                        </div>
                        {effectiveDemoLink ? (
                          <>
                            <p className="text-sm text-neutral-600 mb-3">
                              Demo for: <strong>{selectedCourseData.title || 'Selected Course'}</strong>
                            </p>
                            <Button onClick={handleJoinDemo} className="w-full">
                              <ExternalLink size={16} className="mr-2" />
                              Join Google Meet
                            </Button>
                          </>
                        ) : (
                          <p className="text-sm text-neutral-500">
                            Demo link not available. Register below to be notified.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Registration Form */}
                    <div>
                      <h3 className="text-lg font-heading font-semibold text-neutral-900 mb-4">
                        Register for Free Demo
                      </h3>

                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Full Name *
                          </label>
                          <div className="relative">
                            <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                            <input
                              type="text"
                              name="name"
                              required
                              value={formData.name}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                              placeholder="Enter your full name"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Email Address *
                          </label>
                          <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                            <input
                              type="email"
                              name="email"
                              required
                              value={formData.email}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                              placeholder="Enter your email address"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Phone Number
                          </label>
                          <div className="relative">
                            <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                              placeholder="Enter your phone number"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Experience Level
                          </label>
                          <select
                            name="experience"
                            value={formData.experience}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                        </div>

                        <div className="pt-4">
                          <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Registering...
                              </>
                            ) : (
                              'Register for Free Demo'
                            )}
                          </Button>
                        </div>

                        <p className="text-xs text-neutral-500 text-center">
                          By registering, you agree to receive emails about our courses.
                        </p>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default FreeDemoModal
