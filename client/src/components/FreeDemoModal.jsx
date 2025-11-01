import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, Users, ExternalLink, CheckCircle, Mail, Phone, User } from 'lucide-react'
import { toast } from 'sonner'
import Button from './UI/Button'
import Card from './UI/Card'

const FreeDemoModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    courseInterest: '',
    experience: 'beginner'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Here you would typically send the data to your backend
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Demo registration successful! Check your email for the Google Meet link.')
      onClose()
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        courseInterest: '',
        experience: 'beginner'
      })
    } catch (error) {
      toast.error('Failed to register for demo. Please try again.')
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

  const demoDetails = {
    title: 'Free Live Demo Session',
    date: 'Every Saturday',
    time: '2:00 PM - 3:00 PM IST',
    duration: '1 Hour',
    maxParticipants: 20,
    googleMeetLink: 'https://meet.google.com/abc-defg-hij', // This would come from admin panel
    topics: [
      'Introduction to Modern Web Development',
      'Live Coding Session',
      'Q&A with Industry Experts',
      'Career Guidance'
    ]
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
            onClick={onClose}
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
                    {demoDetails.title}
                  </h2>
                  <p className="text-neutral-600 mt-1">
                    Join our free live session and experience our teaching style
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Demo Information */}
                  <div className="space-y-6">
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
                            <p className="font-medium text-neutral-900">{demoDetails.date}</p>
                            <p className="text-sm text-neutral-600">Weekly sessions</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Clock size={20} className="text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900">{demoDetails.time}</p>
                            <p className="text-sm text-neutral-600">Duration: {demoDetails.duration}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users size={20} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900">Max {demoDetails.maxParticipants} participants</p>
                            <p className="text-sm text-neutral-600">Interactive session</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-neutral-900 mb-3">What You'll Learn:</h4>
                      <ul className="space-y-2">
                        {demoDetails.topics.map((topic, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                            <span className="text-sm text-neutral-600">{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <ExternalLink size={20} className="text-primary-600" />
                        <span className="font-medium text-neutral-900">Google Meet Link</span>
                      </div>
                      <p className="text-sm text-neutral-600 mb-2">
                        You'll receive the meeting link via email after registration
                      </p>
                      <a
                        href={demoDetails.googleMeetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        {demoDetails.googleMeetLink}
                      </a>
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
                            className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                            className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                            className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Enter your phone number"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Course Interest
                        </label>
                        <select
                          name="courseInterest"
                          value={formData.courseInterest}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="">Select a course</option>
                          <option value="mern-stack">MERN Stack Development</option>
                          <option value="ai-ml">AI & Machine Learning</option>
                          <option value="data-science">Data Science with Python</option>
                          <option value="cloud-computing">Cloud Computing with AWS</option>
                          <option value="mobile-development">Mobile App Development</option>
                          <option value="not-sure">Not sure yet</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Experience Level
                        </label>
                        <select
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                        By registering, you agree to receive emails about our courses and demo sessions.
                      </p>
                    </form>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default FreeDemoModal

