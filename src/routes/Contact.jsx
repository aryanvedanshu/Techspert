import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send, Clock, MessageCircle, HelpCircle, Linkedin, Twitter, Facebook, Instagram } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '../services/api'
import { firebaseService } from '../services/firebaseService'
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
  const [contactInfo, setContactInfo] = useState(null)
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

        // Handle nested response structure for contact-info
        // Firebase structure: document with nested 'main' object
        let contactData = contactInfoResponse.data?.data?.data || contactInfoResponse.data?.data || null

        // If contactData is an array, get the first document
        if (Array.isArray(contactData) && contactData.length > 0) {
          contactData = contactData[0]
        }

        // Extract the 'main' object if it exists, otherwise use the data directly
        const mainData = contactData?.main || contactData

        console.log('[Contact] Contact data received:', { contactData, mainData })
        setContactInfo(mainData || null)

        // Handle nested response structure for faqs
        const faqsData = faqsResponse.data?.data?.data || faqsResponse.data?.data || []
        setFaqs(Array.isArray(faqsData) ? faqsData : [])

        // Handle nested response structure for page-content
        const pageData = pageContentResponse.data?.data?.data || pageContentResponse.data?.data || null
        setPageContent(pageData)
      } catch (error) {
        console.error('Error fetching data:', error)
        setContactInfo(null)
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

    try {
      // Save enquiry to Firestore
      const enquiryData = {
        ...formData,
        status: 'new',
        createdAt: new Date().toISOString(),
        source: 'contact_form'
      }

      const result = await firebaseService.createDocument('enquiries', enquiryData)

      if (result.success) {
        toast.success('Thank you for your message! We\'ll get back to you soon.')
        setFormData({ name: '', email: '', subject: '', message: '' })
      } else {
        throw new Error('Failed to submit enquiry')
      }
    } catch (error) {
      console.error('Error submitting enquiry:', error)
      toast.error('Failed to submit your message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }


  // Dynamic icon mapping
  const getIconComponent = (iconName) => {
    const iconMap = {
      Mail, Phone, MapPin, Clock, MessageCircle, HelpCircle, Linkedin, Twitter
    }
    return iconMap[iconName] || Mail
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-heading font-semibold text-neutral-900 mb-2">
            Loading Contact Information
          </h2>
          <p className="text-neutral-600">
            Please wait while we fetch the latest information...
          </p>
        </div>
      </div>
    )
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
          {contactInfo ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Address */}
                {contactInfo.address && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0 }}
                  >
                    <Card className="text-center h-full">
                      <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <MapPin size={24} className="text-white" />
                      </div>
                      <h3 className="text-xl font-heading font-semibold text-neutral-900 mb-3">
                        Address
                      </h3>
                      <p className="text-neutral-600 leading-relaxed">
                        {contactInfo.address}
                      </p>
                    </Card>
                  </motion.div>
                )}

                {/* Phone */}
                {contactInfo.phone && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Card className="text-center h-full">
                      <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Phone size={24} className="text-white" />
                      </div>
                      <h3 className="text-xl font-heading font-semibold text-neutral-900 mb-3">
                        Phone
                      </h3>
                      <a
                        href={`tel:${contactInfo.phone.replace(/[^0-9+]/g, '')}`}
                        className="text-primary-600 hover:text-primary-700 font-medium text-lg block"
                      >
                        {contactInfo.phone}
                      </a>
                    </Card>
                  </motion.div>
                )}

                {/* Email */}
                {contactInfo.email && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Card className="text-center h-full">
                      <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Mail size={24} className="text-white" />
                      </div>
                      <h3 className="text-xl font-heading font-semibold text-neutral-900 mb-3">
                        Email
                      </h3>
                      <a
                        href={`mailto:${contactInfo.email}`}
                        className="text-primary-600 hover:text-primary-700 font-medium text-lg block break-all"
                      >
                        {contactInfo.email}
                      </a>
                      {contactInfo.socialLinks?.supportEmail && contactInfo.socialLinks.supportEmail !== contactInfo.email && (
                        <a
                          href={`mailto:${contactInfo.socialLinks.supportEmail}`}
                          className="text-neutral-600 hover:text-primary-600 text-sm block mt-2 break-all"
                        >
                          {contactInfo.socialLinks.supportEmail}
                        </a>
                      )}
                    </Card>
                  </motion.div>
                )}

                {/* Office Hours */}
                {contactInfo.officeHours && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <Card className="text-center h-full">
                      <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Clock size={24} className="text-white" />
                      </div>
                      <h3 className="text-xl font-heading font-semibold text-neutral-900 mb-3">
                        Office Hours
                      </h3>
                      <p className="text-neutral-600 leading-relaxed">
                        {contactInfo.officeHours}
                      </p>
                    </Card>
                  </motion.div>
                )}
              </div>

              {/* Social Links */}
              {contactInfo.socialLinks && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="mt-12 text-center"
                >
                  <h3 className="text-2xl font-heading font-semibold text-neutral-900 mb-6">
                    Connect With Us
                  </h3>
                  <div className="flex justify-center items-center gap-4 flex-wrap">
                    {contactInfo.socialLinks.facebook && (
                      <a
                        href={contactInfo.socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-neutral-800 hover:bg-primary-600 rounded-xl flex items-center justify-center transition-all duration-200 group"
                        aria-label="Facebook"
                      >
                        <Facebook size={20} className="text-neutral-400 group-hover:text-white transition-colors" />
                      </a>
                    )}
                    {contactInfo.socialLinks.twitter && (
                      <a
                        href={contactInfo.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-neutral-800 hover:bg-primary-600 rounded-xl flex items-center justify-center transition-all duration-200 group"
                        aria-label="Twitter"
                      >
                        <Twitter size={20} className="text-neutral-400 group-hover:text-white transition-colors" />
                      </a>
                    )}
                    {contactInfo.socialLinks.linkedin && (
                      <a
                        href={contactInfo.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-neutral-800 hover:bg-primary-600 rounded-xl flex items-center justify-center transition-all duration-200 group"
                        aria-label="LinkedIn"
                      >
                        <Linkedin size={20} className="text-neutral-400 group-hover:text-white transition-colors" />
                      </a>
                    )}
                    {contactInfo.socialLinks.instagram && (
                      <a
                        href={contactInfo.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-neutral-800 hover:bg-primary-600 rounded-xl flex items-center justify-center transition-all duration-200 group"
                        aria-label="Instagram"
                      >
                        <Instagram size={20} className="text-neutral-400 group-hover:text-white transition-colors" />
                      </a>
                    )}
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-neutral-600 text-lg">
                Contact information is being updated. Please use the form below to reach us.
              </p>
            </div>
          )}
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
                    <div key={faq.id || faq._id || `faq-${index}`} className="border-b border-neutral-200 pb-6 last:border-b-0">
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

    </div>
  )
}

export default Contact