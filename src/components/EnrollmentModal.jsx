/**
 * Enrollment Modal - Payment Initiation UI
 * Displays course details, pricing, and initiates Razorpay checkout
 * NOTE: Razorpay SDK integration placeholder - actual integration pending
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X, CreditCard, Shield, Clock, CheckCircle,
    BookOpen, Users, Award, AlertCircle, Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { coursesService } from '../services/firebaseService'
import { getTrackingContext, getStoredTrackingToken } from '../services/trackingService'
import { linkClicksService } from '../services/leadTrackingService'
import Button from './UI/Button'

const EnrollmentModal = ({ isOpen, onClose, courseId, courseName }) => {
    const [course, setCourse] = useState(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    })
    const [formErrors, setFormErrors] = useState({})

    useEffect(() => {
        if (isOpen && courseId) {
            fetchCourseDetails()
        }
    }, [isOpen, courseId])

    const fetchCourseDetails = async () => {
        setLoading(true)
        try {
            const result = await coursesService.getById(courseId)
            if (result.success && result.data) {
                setCourse(result.data)
            }
        } catch (error) {
            console.error('Error fetching course:', error)
            toast.error('Failed to load course details')
        } finally {
            setLoading(false)
        }
    }

    const validateForm = () => {
        const errors = {}
        if (!formData.name.trim()) errors.name = 'Name is required'
        if (!formData.email.trim()) errors.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email'
        if (!formData.phone.trim()) errors.phone = 'Phone is required'
        else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) errors.phone = 'Invalid phone (10 digits)'

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }))
        }
    }

    const handlePayment = async () => {
        if (!validateForm()) return

        setProcessing(true)

        try {
            // Track payment link click
            const context = getTrackingContext()
            await linkClicksService.trackClick({
                courseId,
                courseName: course?.title || courseName,
                linkType: 'payment',
                ...context
            })

            // TODO: Razorpay Integration
            // This is where Razorpay checkout will be initialized
            // For now, we'll show a placeholder message

            toast.info('Razorpay integration pending. Payment flow will be activated soon.')

            /*
            // Razorpay Integration Code (to be uncommented when ready):
            const options = {
              key: import.meta.env.VITE_RAZORPAY_KEY_ID,
              amount: course.price * 100, // Amount in paise
              currency: 'INR',
              name: 'Techspert',
              description: `Enrollment: ${course.title}`,
              image: '/logo.png',
              prefill: {
                name: formData.name,
                email: formData.email,
                contact: formData.phone
              },
              theme: {
                color: '#6366f1'
              },
              handler: async function(response) {
                // Payment successful
                // response.razorpay_payment_id
                // response.razorpay_order_id  
                // response.razorpay_signature
                handlePaymentSuccess(response)
              }
            }
            
            const rzp = new window.Razorpay(options)
            rzp.open()
            */

        } catch (error) {
            console.error('Payment error:', error)
            toast.error('Failed to initiate payment. Please try again.')
        } finally {
            setProcessing(false)
        }
    }

    const handlePaymentSuccess = async (response) => {
        // This will be called after successful Razorpay payment
        // Save to crm_payments collection
        // Navigate to success page
        console.log('Payment success:', response)
    }

    const handleClose = () => {
        if (!processing) {
            setFormData({ name: '', email: '', phone: '' })
            setFormErrors({})
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-neutral-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-primary-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-heading font-semibold text-neutral-900">
                                        Enroll Now
                                    </h2>
                                    <p className="text-sm text-neutral-500">Secure payment via Razorpay</p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                disabled={processing}
                                className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors disabled:opacity-50"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="p-12 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                        </div>
                    ) : course ? (
                        <div className="p-6">
                            {/* Course Summary */}
                            <div className="bg-neutral-50 rounded-xl p-4 mb-6">
                                <h3 className="font-semibold text-neutral-900 mb-2">
                                    {course.title}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-neutral-600">
                                    {course.duration && (
                                        <div className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {course.duration}
                                        </div>
                                    )}
                                    {course.lessons && (
                                        <div className="flex items-center gap-1">
                                            <BookOpen size={14} />
                                            {course.lessons} Lessons
                                        </div>
                                    )}
                                </div>
                                <div className="mt-3 pt-3 border-t border-neutral-200">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-primary-600">
                                            ₹{course.price?.toLocaleString() || 0}
                                        </span>
                                        {course.originalPrice && course.originalPrice > course.price && (
                                            <span className="text-sm text-neutral-400 line-through">
                                                ₹{course.originalPrice.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Form */}
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter your full name"
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${formErrors.name ? 'border-red-500' : 'border-neutral-200'
                                            }`}
                                    />
                                    {formErrors.name && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="your@email.com"
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${formErrors.email ? 'border-red-500' : 'border-neutral-200'
                                            }`}
                                    />
                                    {formErrors.email && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="10-digit mobile number"
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${formErrors.phone ? 'border-red-500' : 'border-neutral-200'
                                            }`}
                                    />
                                    {formErrors.phone && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                                    )}
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="flex items-center justify-center gap-6 mb-6 text-sm text-neutral-500">
                                <div className="flex items-center gap-1">
                                    <Shield size={16} className="text-green-500" />
                                    Secure
                                </div>
                                <div className="flex items-center gap-1">
                                    <Award size={16} className="text-blue-500" />
                                    Certified
                                </div>
                                <div className="flex items-center gap-1">
                                    <CheckCircle size={16} className="text-purple-500" />
                                    7-Day Refund
                                </div>
                            </div>

                            {/* Razorpay Not Ready Notice */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-yellow-800">
                                            Payment Coming Soon
                                        </p>
                                        <p className="text-sm text-yellow-700 mt-1">
                                            Razorpay integration is being configured. Contact us for enrollment.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Pay Button */}
                            <Button
                                onClick={handlePayment}
                                disabled={processing}
                                className="w-full"
                                size="lg"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin mr-2" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard size={18} className="mr-2" />
                                        Pay ₹{course.price?.toLocaleString() || 0}
                                    </>
                                )}
                            </Button>

                            <p className="text-xs text-neutral-400 text-center mt-4">
                                By enrolling, you agree to our <a href="/terms" className="underline">Terms</a> and <a href="/refund-policy" className="underline">Refund Policy</a>
                            </p>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-neutral-500">
                            Course not found
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

export default EnrollmentModal
