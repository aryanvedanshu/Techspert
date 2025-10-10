import { motion } from 'framer-motion'
import { Download, Eye, Award, CheckCircle } from 'lucide-react'
import Card from './UI/Card'
import Button from './UI/Button'

const CertificatePreview = ({ certificate, index = 0 }) => {
  const {
    _id,
    courseName,
    studentName,
    completionDate,
    certificateId,
    templateUrl
  } = certificate

  const handleDownload = () => {
    // In a real app, this would generate and download the PDF
    console.log('Downloading certificate:', certificate)
    alert('Certificate download feature will be implemented with PDF generation')
  }

  const handlePreview = () => {
    // In a real app, this would open a modal with the certificate preview
    console.log('Previewing certificate:', certificate)
    alert('Certificate preview feature will be implemented')
  }

  return (
    <motion.div
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
              <div className="text-center text-white">
                <Award size={48} className="mx-auto mb-4" />
                <div className="text-lg font-semibold">Certificate</div>
                <div className="text-sm opacity-80">{courseName}</div>
              </div>
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
              onClick={handlePreview}
            >
              <Eye size={16} className="mr-2" />
              Preview
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={handleDownload}
            >
              <Download size={16} className="mr-2" />
              Download
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default CertificatePreview
