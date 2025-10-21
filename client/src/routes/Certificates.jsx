import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, Eye, Award, CheckCircle } from 'lucide-react'
import { api } from '../services/api'
import Card from '../components/UI/Card'
import Button from '../components/UI/Button'

const Certificates = () => {
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("[DEBUG: Certificates.jsx:useEffect:12] Fetching certificates data")
    const fetchCertificates = async () => {
      try {
        const response = await api.get('/certificates')
        console.log("[DEBUG: Certificates.jsx:fetchCertificates:success:15] Certificates data fetched successfully")
        // The server returns { success: true, data: certificates[] }
        const certificatesData = response.data.data || []
        setCertificates(certificatesData)
      } catch (error) {
        console.error("[DEBUG: Certificates.jsx:fetchCertificates:error:19] Error fetching certificates:", error)
        // Set empty array on error to prevent crashes
        setCertificates([])
      } finally {
        setLoading(false)
      }
    }

    fetchCertificates()
  }, [])

  const handleDownload = (certificate) => {
    console.log("[DEBUG: Certificates.jsx:handleDownload:33] Downloading certificate:", certificate)
    // In a real app, this would generate and download the PDF
    // For demo purposes, we'll just show an alert
    alert('Certificate download feature will be implemented with PDF generation')
  }

  const handlePreview = (certificate) => {
    console.log("[DEBUG: Certificates.jsx:handlePreview:40] Previewing certificate:", certificate)
    // In a real app, this would open a modal with the certificate preview
    alert('Certificate preview feature will be implemented')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-neutral-200 rounded-2xl mb-6"></div>
                <div className="h-6 bg-neutral-200 rounded mb-4"></div>
                <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <section className="bg-white py-16">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-neutral-900 mb-4">
              Certificates
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Download your course completion certificates and showcase your achievements
            </p>
          </motion.div>
        </div>
      </section>

      {/* Certificates Grid */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.isArray(certificates) && certificates.map((certificate, index) => {
              const {
                _id,
                courseName,
                studentName,
                completionDate,
                certificateId,
                templateUrl
              } = certificate

              return (
                <motion.div
                  key={_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card hover className="h-full flex flex-col group">
                    {/* Certificate Preview */}
                    <div className="relative mb-6 overflow-hidden rounded-2xl">
                      <div className="aspect-[4/3] bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                        {templateUrl ? (
                          <img
                            src={templateUrl}
                            alt={`${courseName} Certificate`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <img
                            src="/images/certificate.png"
                            alt={`${courseName} Certificate`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        )}
                      </div>
                      <div className="absolute top-4 right-4">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle size={16} className="text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-xl font-heading font-semibold text-neutral-900 mb-3 group-hover:text-primary-600 transition-colors duration-200">
                        {courseName} Certificate
                      </h3>
                      
                      <div className="space-y-2 mb-6 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Student:</span>
                          <span className="font-medium text-neutral-900">{studentName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Completed:</span>
                          <span className="font-medium text-neutral-900">
                            {new Date(completionDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Certificate ID:</span>
                          <span className="font-medium text-neutral-900 font-mono text-xs">
                            {certificateId}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handlePreview(certificate)}
                        >
                          <Eye size={16} className="mr-2" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleDownload(certificate)}
                        >
                          <Download size={16} className="mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {certificates.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award size={32} className="text-neutral-400" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-neutral-900 mb-4">
                No certificates yet
              </h3>
              <p className="text-neutral-600 mb-6">
                Complete a course to earn your first certificate
              </p>
              <Button>
                Browse Courses
              </Button>
            </motion.div>
          )}

          {/* Demo Certificate */}
          {certificates.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center py-8"
            >
              <h3 className="text-xl font-heading font-semibold text-neutral-900 mb-4">
                Sample Certificate
              </h3>
              <div className="max-w-md mx-auto">
                <img
                  src="/images/certificate.png"
                  alt="Sample Certificate"
                  className="w-full h-auto rounded-2xl shadow-lg"
                />
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Certificates