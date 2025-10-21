import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send, Clock, MessageCircle, HelpCircle, Linkedin, Twitter } from 'lucide-react'
import { api } from '../services/api'
import Card from '../components/UI/Card'
import Button from '../components/UI/Button'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [contactInfo, setContactInfo] = useState([])
  const [faqs, setFaqs] = useState([])
  const [pageContent, setPageContent] = useState(null)
  const [loading, setLoading] = useState(true)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactInfoResponse, faqsResponse, pageContentResponse] = await Promise.all([
          api.get('/contact-info'),
          api.get('/faqs?featured=true'),
          api.get('/page-content/contact')
        ])
        
        setContactInfo(contactInfoResponse.data.data || [])
        setFaqs(faqsResponse.data.data || [])
        setPageContent(pageContentResponse.data.data)
      } catch (error) {
        console.error('Error fetching data:', error)
        setContactInfo([])
        setFaqs([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    setTimeout(() => {
      alert('Thank you for your message! We\'ll get back to you soon.')
      setFormData({ name: '', email: '', subject: '', message: '' })
      setIsSubmitting(false)
    }, 1000)
  }

  // Dynamic icon mapping
  const getIconComponent = (iconName) => {
    const iconMap = {
      Mail, Phone, MapPin, Clock, MessageCircle, HelpCircle, Linkedin, Twitter
    }
    return iconMap[iconName] || Mail
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-neutral-50 to-primary-50 py-24">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-neutral-900 mb-6">
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-xl text-neutral-600 leading-relaxed">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactInfo.map((info, index) => {
              const Icon = getIconComponent(info.icon)
              return (
                <motion.div
                  key={info._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Icon size={24} className="text-white" />
                    </div>
                    <h3 className="text-xl font-heading font-semibold text-neutral-900 mb-2">
                      {info.title}
                    </h3>
                    <p className="text-primary-600 font-medium mb-2">
                      {info.value}
                    </p>
                    {info.description && (
                      <p className="text-neutral-600 text-sm">
                        {info.description}
                      </p>
                    )}
                    {info.link && (
                      <div className="mt-4">
                        <a
                          href={info.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                          {info.type === 'email' ? 'Send Email' : 
                           info.type === 'phone' ? 'Call Now' : 
                           info.type === 'address' ? 'Get Directions' : 'Visit'}
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

      {/* Contact Form & FAQ */}
      <section className="py-16 bg-neutral-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <h2 className="text-2xl font-heading font-semibold text-neutral-900 mb-6">
                  Send us a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="input-field"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="input-field"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-neutral-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="What's this about?"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="input-field resize-none"
                      placeholder="Tell us more..."
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    loading={isSubmitting}
                  >
                    <Send size={20} className="mr-2" />
                    Send Message
                  </Button>
                </form>
              </Card>
            </motion.div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <h2 className="text-2xl font-heading font-semibold text-neutral-900 mb-6">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-6">
                  {faqs.map((faq, index) => (
                    <div key={faq._id} className="border-b border-neutral-200 pb-6 last:border-b-0">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-neutral-600 leading-relaxed">
                        {faq.answer}
                      </p>
                      {faq.tags && faq.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {faq.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-lg"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Office Hours */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock size={24} className="text-white" />
              </div>
              <h2 className="text-3xl font-heading font-bold text-neutral-900 mb-4">
                Office Hours
              </h2>
              <p className="text-lg text-neutral-600 mb-6">
                We're here to help you Monday through Friday
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <h3 className="font-semibold text-neutral-900 mb-2">Support Hours</h3>
                  <p className="text-neutral-600">9:00 AM - 6:00 PM PST</p>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-neutral-900 mb-2">Response Time</h3>
                  <p className="text-neutral-600">Within 24 hours</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Contact